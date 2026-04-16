from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from ..vision_service import analyze_image_bytes, match_recipe, get_image_caption
from ..llm_service import generate_recipe
from ..rag_service import search as rag_search
from ..rag_service import build_index_from_recipes, save_index
from ..schemas import AnalyzeResult
from ..models import Recipe
from ..config import settings

import json
import re

from backend.dish_classifier import predict

router = APIRouter(prefix="/analyze", tags=["Analyze"])

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_FILE_SIZE_MB = 10


@router.post("/", response_model=AnalyzeResult)
async def analyze_food_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    debug: bool = False,
):

    # ---------------------------
    # Validate file type
    # ---------------------------
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{file.content_type}'. Allowed: JPEG, PNG, WEBP, GIF.",
        )

    image_bytes = await file.read()

    # ---------------------------
    # Validate file size
    # ---------------------------
    if len(image_bytes) > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum allowed size is {MAX_FILE_SIZE_MB}MB.",
        )

    # ---------------------------
    # CLASSIFIER (PRIMARY FIX)
    # ---------------------------
    classifier_label = None
    classifier_conf = 0.0

    try:
        classifier_preds = predict(image_bytes, topk=3)
        print("🔥 Classifier:", classifier_preds)

        if classifier_preds:
            best = classifier_preds[0]
            classifier_label = best.get("name")
            classifier_conf = float(best.get("value", 0.0))

    except Exception as e:
        print("Classifier error:", e)

    # ---------------------------
    # Vision Model Prediction (fallback)
    # ---------------------------
    try:
        predictions = analyze_image_bytes(image_bytes)
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    # ---------------------------
    # 🔥 FORCE CLASSIFIER OUTPUT
    # ---------------------------
    if classifier_label and classifier_conf > 0.6:
        predictions = [{
            "name": classifier_label.replace("_", " "),
            "value": classifier_conf,
            "source": "classifier"
        }]

    # ---------------------------
    # Caption (BLIP fallback)
    # ---------------------------
    try:
        caption = get_image_caption(image_bytes)
    except Exception:
        caption = None

    # ---------------------------
    # Filter top labels
    # ---------------------------
    top_labels = [p for p in predictions if p["value"] >= 0.10][:10]
    label_names = [p["name"] for p in top_labels]
    confidence_scores = [p["value"] for p in top_labels]

    # ---------------------------
    # Classifier-first matching
    # ---------------------------
    matched = None
    match_score = None
    classifier_candidate = None

    for p in top_labels:
        if p.get("source") == "classifier" and float(p.get("value", 0.0)) >= float(settings.CLASSIFIER_CONFIDENCE_THRESHOLD):
            classifier_candidate = p
            break

    if classifier_candidate is not None:

        cand = str(classifier_candidate.get("name", "")).replace("_", " ").strip().lower()
        cand = cand.replace("  ", " ")

        try:
            matched = db.query(Recipe).filter(func.lower(Recipe.title).contains(cand)).first()
        except Exception:
            matched = None

        if matched is not None:
            return AnalyzeResult(
                detected_labels=label_names,
                confidence_scores=confidence_scores,
                matched_recipe=matched,
                generated_recipe=None,
                generated_recipe_json=None,
                debug_info={
                    "classifier_label": classifier_label,
                    "classifier_conf": classifier_conf,
                    "caption": caption
                } if debug else None,
                message=f"✅ Classified as: {matched.title}",
            )

    # ---------------------------
    # Fallback matching
    # ---------------------------
    try:
        matched, match_score = match_recipe(top_labels, db)
    except Exception:
        matched, match_score = None, 0.0

    # ---------------------------
    # Safe threshold
    # ---------------------------
    try:
        threshold = float(settings.MATCH_SCORE_THRESHOLD)
    except Exception:
        threshold = 0.0

    if matched and match_score is not None:
        try:
            if float(match_score) < threshold:
                matched = None
        except Exception:
            matched = None

    # ---------------------------
    # 🚫 STOP RANDOM WRONG RECIPES
    # ---------------------------
    if not matched and classifier_conf < 0.6:
        return AnalyzeResult(
            detected_labels=label_names,
            confidence_scores=confidence_scores,
            matched_recipe=None,
            generated_recipe=None,
            generated_recipe_json=None,
            debug_info={
                "classifier_label": classifier_label,
                "classifier_conf": classifier_conf,
                "reason": "low confidence",
                "caption": caption
            } if debug else None,
            message="❌ Could not confidently detect dish. Try clearer image."
        )

    # ---------------------------
    # RAG retrieval
    # ---------------------------
    retrieved = []
    rag_query = " ".join(label_names)

    try:
        if caption:
            rag_query += " " + caption
        retrieved = rag_search(rag_query, top_k=5)
    except Exception:
        retrieved = []

    # ---------------------------
    # Prompt
    # ---------------------------
    prompt_lines = [
        "You are an expert chef. Generate a recipe JSON.",
        f"Detected items: {', '.join(label_names)}",
    ]

    if caption:
        prompt_lines.append(f"Image caption: {caption}")

    if matched:
        prompt_lines.append(f"Matched recipe title: {matched.title}")

    prompt_lines.append(
        "Return ONLY valid JSON with keys: title, servings, prep_time, cook_time, cuisine, ingredients, steps, equipment, tips, nutrition"
    )

    prompt = "\n".join(prompt_lines)

    # ---------------------------
    # Context docs
    # ---------------------------
    context_docs = []
    for r in retrieved:
        if isinstance(r, dict):
            title = r.get("title") or r.get("source", {}).get("title")
            ings = r.get("ingredients")
            context_docs.append(f"Title: {title}. Ingredients: {ings}.")

    # ---------------------------
    # LLM generation
    # ---------------------------
    try:
        gen_res = generate_recipe(prompt, context_docs=context_docs, enforce_json=True, max_retries=2)
        if isinstance(gen_res, tuple):
            generated, parsed_json = gen_res
        else:
            generated = gen_res
            parsed_json = None
    except Exception as e:
        generated = f"Recipe generation failed: {e}"
        parsed_json = None

    # ---------------------------
    # JSON parsing
    # ---------------------------
    parsed = None

    if parsed_json:
        parsed = parsed_json
    else:
        try:
            parsed = json.loads(generated)
        except Exception:
            try:
                match = re.search(r"\{[\s\S]*\}", generated)
                if match:
                    parsed = json.loads(match.group())
            except Exception:
                parsed = None

    if not isinstance(parsed, dict):
        parsed = {}

    # ---------------------------
    # Save to DB
    # ---------------------------
    new_recipe = None
    try:
        new_recipe = Recipe(
            title=(parsed.get("title") or "AI Generated Recipe")[:200],
            cuisine=parsed.get("cuisine"),
            diet=None,
            time=parsed.get("prep_time"),
            calories=(parsed.get("nutrition", {}) or {}).get("calories"),
            difficulty=None,
            meal=None,
            image=None,
            pantry_match=None,
            cultural=None,
            ingredients=parsed.get("ingredients") or {"generated": None},
            nutrition=parsed.get("nutrition"),
            health_benefits=None,
            steps=parsed.get("steps"),
            similar_dishes=None,
            food_labels=label_names,
        )

        db.add(new_recipe)
        db.commit()
        db.refresh(new_recipe)

        try:
            all_recipes = db.query(Recipe).all()
            recipe_dicts = [
                {"id": r.id, "title": r.title, "ingredients": r.ingredients}
                for r in all_recipes
            ]
            build_index_from_recipes(recipe_dicts)
            save_index("backend/faiss_index.bin", "backend/faiss_meta.json")
        except Exception:
            pass

    except Exception:
        new_recipe = None

    # ---------------------------
    # RESPONSE
    # ---------------------------
    return AnalyzeResult(
        detected_labels=label_names,
        confidence_scores=confidence_scores,
        matched_recipe=matched,
        generated_recipe=generated,
        generated_recipe_json=parsed,
        debug_info={
            "classifier_label": classifier_label,
            "classifier_conf": classifier_conf,
            "caption": caption
        } if debug else None,
        message=f"Detected food items: {', '.join(label_names[:3]) if label_names else 'Unknown'}"
    )