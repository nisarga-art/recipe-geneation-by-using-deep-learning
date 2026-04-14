from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..vision_service import analyze_image_bytes, match_recipe, get_image_caption
from ..llm_service import generate_recipe
from ..rag_service import search as rag_search
from ..rag_service import build_index_from_recipes, save_index
from ..schemas import AnalyzeResult
from ..models import Recipe
import json
from ..config import settings
from config import settings
from backend.dish_classifier import load_model, class_names


router = APIRouter(prefix="/analyze", tags=["Analyze"])

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_FILE_SIZE_MB = 10


@router.post("/", response_model=AnalyzeResult)
async def analyze_food_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    debug: bool = False,
):
    # Validate file type
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{file.content_type}'. Allowed: JPEG, PNG, WEBP, GIF.",
        )

    image_bytes = await file.read()

    # Validate file size
    if len(image_bytes) > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum allowed size is {MAX_FILE_SIZE_MB}MB.",
        )

    # Call Clarifai
    try:
        predictions = analyze_image_bytes(image_bytes)
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))
    # Also generate a visual caption (BLIP) to improve retrieval and prompt grounding
    try:
        caption = get_image_caption(image_bytes)
    except Exception:
        caption = None
    # Top 10 labels with confidence >= 0.10
    top_labels = [p for p in predictions if p["value"] >= 0.10][:10]
    label_names = [p["name"] for p in top_labels]
    confidence_scores = [p["value"] for p in top_labels]

    # Match against our recipe DB using scored matching (uses label confidences)
    matched, match_score = match_recipe(top_labels, db)

    # Enforce minimum match score threshold — treat as no match if below threshold
    try:
        if matched and (match_score is None or match_score < settings.MATCH_SCORE_THRESHOLD):
            matched = None
    except Exception:
        # if settings or match_score unavailable, ignore and continue
        pass

    # Retrieve related recipes from RAG index (if available) using labels + caption
    retrieved = []
    try:
        rag_query = " ".join(label_names)
        if caption:
            rag_query = rag_query + " " + caption
        retrieved = rag_search(rag_query, top_k=5)
    except Exception:
        retrieved = []

    # Build a prompt for Flan-T5 using detected labels and matched recipe context
    prompt_lines = [
        "You are an expert chef. Given detected visual items and optional context, produce a complete recipe.",
        f"Detected items: {', '.join(label_names)}.",
    ]
    if caption:
        prompt_lines.append(f"Image caption: {caption}.")
    if matched:
        # include title and ingredients as context
        prompt_lines.append(f"Matched recipe title: {matched.title}.")
        if matched.ingredients:
            prompt_lines.append(f"Matched ingredients: {matched.ingredients}.")

    prompt_lines.append(
        "Output a recipe as a single valid JSON object only (no explanatory text). The JSON schema must be exactly as follows:\n"
        "{\n  \"title\": string,\n  \"servings\": string|int,\n  \"prep_time\": string,\n  \"cook_time\": string,\n  \"cuisine\": string,\n  \"ingredients\": [ { \"name\": string, \"quantity\": number|string, \"unit\": string }, ... ],\n  \"steps\": [string, ...],\n  \"equipment\": [string, ...],\n  \"tips\": [string, ...],\n  \"nutrition\": { \"calories\": number, \"protein\": number, \"carbs\": number, \"fat\": number }\n}\n"
        "If a field is unknown, use null. Do not output any text before or after the JSON. Ensure valid JSON only."
    )

    prompt = "\n".join(prompt_lines)

    # include the retrieved recipe texts as context docs
    context_docs = []
    for r in retrieved:
        src = r.get("source") or {}
        title = src.get("title") or r.get("title")
        ings = src.get("ingredients")
        snippet = f"Title: {title}. Ingredients: {ings}."
        context_docs.append(snippet)

    try:
        # Request the LLM to output strict JSON (prompt enforces schema above)
        gen_res = generate_recipe(prompt, context_docs=context_docs, enforce_json=True, max_retries=2)
        if isinstance(gen_res, tuple):
            generated, parsed_json = gen_res
        else:
            generated = gen_res
            parsed_json = None
    except Exception as e:
        generated = f"Recipe generation failed: {e}"
        parsed_json = None

    # Attempt to parse generated recipe JSON (strict JSON expected)
    import json
    import re

    # parsed may already be available from LLM enforcement
    parsed = None
    if 'parsed_json' in locals() and parsed_json:
        parsed = parsed_json
    else:
        try:
            parsed = json.loads(generated)
        except Exception:
            # fallback to extracting JSON substring
            try:
                match = re.search(r"\{(?:[^{}]|(?R))*\}", generated)
            except re.error:
                match = None
            if match:
                try:
                    parsed = json.loads(match.group(0))
                except Exception:
                    parsed = None
            else:
                parsed = None

    try:
        # create Recipe row using parsed JSON where available
        title_val = None
        ingredients_val = None
        steps_val = None
        cuisine_val = None
        nutrition_val = None
        if isinstance(parsed, dict):
            title_val = parsed.get("title")
            ingredients_val = parsed.get("ingredients")
            steps_val = parsed.get("steps")
            cuisine_val = parsed.get("cuisine")
            nutrition_val = parsed.get("nutrition")

        new_recipe = Recipe(
            title=(title_val or "AI Generated Recipe")[:200],
            cuisine=cuisine_val,
            diet=None,
            time=(parsed.get("prep_time") if isinstance(parsed, dict) else None),
            calories=(nutrition_val.get("calories") if isinstance(nutrition_val, dict) else None),
            difficulty=None,
            meal=None,
            image=None,
            pantry_match=None,
            cultural=None,
            ingredients=(ingredients_val if ingredients_val is not None else {"generated": None}),
            nutrition=nutrition_val,
            health_benefits=None,
            steps=steps_val,
            similar_dishes=None,
            food_labels=label_names,
        )
        db.add(new_recipe)
        db.commit()
        db.refresh(new_recipe)

        # Rebuild FAISS index from DB recipes (best-effort, may be slow)
        try:
            all_recipes = db.query(Recipe).all()
            # convert to plain dicts expected by RAG builder
            recipe_dicts = []
            for r in all_recipes:
                recipe_dicts.append({
                    "id": r.id,
                    "title": r.title,
                    "ingredients": r.ingredients,
                })
            build_index_from_recipes(recipe_dicts)
            save_index("backend/faiss_index.bin", "backend/faiss_meta.json")
        except Exception:
            pass
    except Exception:

        outputs = model(image_tensor)
probs = torch.nn.functional.softmax(outputs, dim=1)
confidence, predicted_class = torch.max(probs, 1)

pred_conf = confidence.item()
pred_label = class_names[predicted_class.item()]
logger.info(f"Classifier predicted {pred_label} with confidence {pred_conf:.2f}")

        # swallow DB errors to keep endpoint responsive
        new_recipe = None

    return AnalyzeResult(
        detected_labels=label_names,
        confidence_scores=confidence_scores,
        matched_recipe=matched,
        generated_recipe=generated,
        generated_recipe_json=parsed,
        debug_info=(
            {
                "caption": caption,
                "rag_query": rag_query if 'rag_query' in locals() else None,
                "retrieved_titles": [r.get('source', {}).get('title') or r.get('title') for r in retrieved],
                "prompt": prompt,
                "raw_generated": generated,
                "parsed_json": parsed,
                "matched_score": (match_score if 'match_score' in locals() else None),
                "matched_id": (matched.id if matched else None),
            }
            if debug
            else None
        ),
        message=(
            f"Detected food items: {', '.join(label_names[:3])}. "
            + (f"Best match: {matched.title}" if matched else "No matching recipe found in database.")
        ),
    )
if pred_conf >= settings.CLASSIFIER_CONFIDENCE_THRESHOLD:
    dish_name = pred_label.replace("_", " ").lower()
else:
    logger.warning("Low confidence, falling back to default detection")
    dish_name = None
if dish_name:
    recipe = recipe_db.get(dish_name)
    if recipe:
        return recipe
    else:
        logger.warning(f"No recipe found for {dish_name}")
        return {"error": "Recipe not found"}
else:
    return fallback_detection(image_tensor)
