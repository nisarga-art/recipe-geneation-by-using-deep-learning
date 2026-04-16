import base64
import requests
from .config import settings

from typing import List

# Optional local, free fallback using Hugging Face image-captioning (BLIP)
_caption_pipeline = None
_caption_model_name = "Salesforce/blip-image-captioning-base"


def _load_caption_pipeline():
    global _caption_pipeline
    if _caption_pipeline is None:
        try:
            from transformers import pipeline

            _caption_pipeline = pipeline("image-to-text", model=_caption_model_name)
        except Exception:
            _caption_pipeline = None
    return _caption_pipeline


def get_image_caption(image_bytes: bytes) -> str | None:
    """Return a short caption for the image using the BLIP pipeline, or None if unavailable."""
    pipeline = _load_caption_pipeline()
    if pipeline is None:
        return None

    from PIL import Image
    import io

    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception:
        return None

    try:
        captions = pipeline(img, max_length=32, top_k=1)
    except Exception:
        try:
            captions = pipeline([img], max_length=32, top_k=1)
        except Exception:
            return None

    if isinstance(captions, list) and captions:
        c = captions[0]
        if isinstance(c, dict) and "generated_text" in c:
            return c["generated_text"]
        if isinstance(c, str):
            return c

    if isinstance(captions, dict) and "generated_text" in captions:
        return captions["generated_text"]

    return None


def _simple_keyword_extract(text: str) -> List[str]:
    # Very small heuristic-based extractor to produce candidate ingredient words
    stopwords = {
        "with",
        "and",
        "in",
        "on",
        "the",
        "a",
        "an",
        "of",
        "fresh",
        "served",
        "to",
        "for",
    }
    import re

    words = re.findall(r"[a-zA-Z]+", text.lower())
    candidates = [w for w in words if len(w) > 3 and w not in stopwords]
    # return unique preserving order
    seen = set()
    out = []
    for w in candidates:
        if w not in seen:
            seen.add(w)
            out.append(w)
    return out


def analyze_image_bytes(image_bytes: bytes) -> list[dict]:
    """
    If Clarifai API key is configured, call Clarifai as before.
    Otherwise use a free local fallback: image captioning (BLIP) + simple keyword extraction.
    Returns list of {"name": str, "value": float} sorted by confidence.
    """
    if settings.CLARIFAI_PAT:
        # existing Clarifai implementation
        CLARIFAI_URL = (
            f"https://api.clarifai.com/v2/users/{settings.CLARIFAI_USER_ID}"
            f"/apps/{settings.CLARIFAI_APP_ID}/models/{settings.CLARIFAI_MODEL_ID}"
            f"/versions/{settings.CLARIFAI_MODEL_VERSION}/outputs"
        )

        encoded = base64.b64encode(image_bytes).decode("utf-8")

        payload = {"inputs": [{"data": {"image": {"base64": encoded}}}]}

        headers = {
            "Authorization": f"Key {settings.CLARIFAI_PAT}",
            "Content-Type": "application/json",
        }

        # faster fail on network issues; reduce timeout to avoid long blocking
        response = requests.post(CLARIFAI_URL, json=payload, headers=headers, timeout=8)

        if response.status_code != 200:
            raise RuntimeError(f"Clarifai API error {response.status_code}: {response.text}")

        data = response.json()
        status_code = data.get("status", {}).get("code")
        if status_code != 10000:
            raise RuntimeError(
                f"Clarifai returned status {status_code}: {data.get('status', {}).get('description')}"
            )

        concepts = data["outputs"][0]["data"]["concepts"]
        return [{"name": c["name"].lower(), "value": round(c["value"], 4)} for c in concepts]

    # Fallback: local caption + simple extraction
    pipeline = _load_caption_pipeline()
    labels = []
    if pipeline is None:
        # If HF pipeline couldn't be loaded, return a minimal fallback
        return [{"name": "food", "value": 0.5}]

    from PIL import Image
    import io

    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    try:
        captions = pipeline(img, max_length=32, top_k=3)
    except Exception:
        # pipeline may accept the image as list or PIL; try alternative call
        captions = pipeline([img], max_length=32, top_k=3)

    # pipeline returns list of dicts or strings depending on transformers version
    caption_texts = []
    if isinstance(captions, list):
        for c in captions:
            if isinstance(c, dict) and "generated_text" in c:
                caption_texts.append(c["generated_text"])
            elif isinstance(c, dict) and "score" in c and "summary_text" in c:
                caption_texts.append(c.get("summary_text", ""))
            elif isinstance(c, str):
                caption_texts.append(c)
    elif isinstance(captions, dict) and "generated_text" in captions:
        caption_texts.append(captions["generated_text"])

    # take first caption as highest-confidence
    if caption_texts:
        main = caption_texts[0]
        labels.append({"name": main.lower(), "value": 0.95})
        # add extracted keyword candidates
        for i, kw in enumerate(_simple_keyword_extract(main)[:8]):
            labels.append({"name": kw, "value": round(0.85 - i * 0.05, 2)})

    return labels


def match_recipe(labels: list[str], db) -> object | None:
    """
    Fuzzy-match detected labels against recipe food_labels stored in DB.
    Returns the best-matching Recipe ORM object or None.
    """
    from .models import Recipe

    all_recipes = db.query(Recipe).all()
    best_recipe = None
    best_score = 0

    # normalize labels
    normalized = [l.lower() for l in labels]

    for recipe in all_recipes:
        recipe_labels = [l.lower() for l in (recipe.food_labels or [])]
        title_words = recipe.title.lower().split()
        combined = set(recipe_labels + title_words)

        score = sum(1 for label in normalized if any(label in r or r in label for r in combined))
        if score > best_score:
            best_score = score
            best_recipe = recipe

    return best_recipe if best_score > 0 else None


def search_concepts_for_text(query: str) -> list[dict]:
    """Local fallback: return keywords extracted from the text when Clarifai text model is not configured."""
    if settings.CLARIFAI_PAT and settings.CLARIFAI_TEXT_MODEL_ID:
        CLARIFAI_TEXT_URL = (
            f"https://api.clarifai.com/v2/users/{settings.CLARIFAI_USER_ID}"
            f"/apps/{settings.CLARIFAI_APP_ID}/models/{settings.CLARIFAI_TEXT_MODEL_ID}"
            f"/versions/{settings.CLARIFAI_TEXT_MODEL_VERSION}/outputs"
        )

        headers = {
            "Authorization": f"Key {settings.CLARIFAI_PAT}",
            "Content-Type": "application/json",
        }

        payload = {"inputs": [{"data": {"text": {"raw": query}}}]}

        # faster fail on network issues; reduce timeout to avoid long blocking
        response = requests.post(CLARIFAI_TEXT_URL, json=payload, headers=headers, timeout=8)

        if response.status_code != 200:
            raise RuntimeError(f"Clarifai API error {response.status_code}: {response.text}")

        data = response.json()
        status_code = data.get("status", {}).get("code")
        if status_code != 10000:
            raise RuntimeError(
                f"Clarifai returned status {status_code}: {data.get('status', {}).get('description')}"
            )

        concepts = data["outputs"][0]["data"].get("concepts", [])
        return [{"name": c.get("name", ""), "value": round(c.get("value", 0), 4)} for c in concepts]

    # fallback: simple keyword extract from text
    kws = _simple_keyword_extract(query)
    return [{"name": k, "value": 0.5} for k in kws]

