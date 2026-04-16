"""
Lightweight image analysis service using Google Cloud Vision when available,
with a local BLIP caption fallback and improved Indian-food corrections.
"""

from typing import List, Tuple, Optional, Dict, Any
from .config import settings

# ---------------------------
# Caption Model (BLIP)
# ---------------------------

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


# ---------------------------
# Image Caption
# ---------------------------

def get_image_caption(image_bytes: bytes) -> Optional[str]:
    pipeline = _load_caption_pipeline()
    if pipeline is None:
        return None

    from PIL import Image
    import io

    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        captions = pipeline(img, max_length=32, top_k=1)
    except Exception:
        return None

    if isinstance(captions, list) and captions:
        c = captions[0]
        return c.get("generated_text") if isinstance(c, dict) else str(c)

    return None


# ---------------------------
# Keyword Extraction
# ---------------------------

def _simple_keyword_extract(text: str) -> List[str]:
    stopwords = {"with", "and", "in", "on", "the", "a", "an", "of", "fresh", "served", "to", "for"}
    import re

    words = re.findall(r"[a-zA-Z]+", text.lower())
    return list(dict.fromkeys([w for w in words if len(w) > 3 and w not in stopwords]))


# ---------------------------
# HARD FIX (IMPORTANT)
# ---------------------------

def _force_indian_food_corrections(text: str) -> str:
    t = text.lower()

    # 🔥 PANEER FIX
    if any(x in t for x in ["paneer", "cottage cheese", "indian cheese", "butter masala"]):
        return "paneer butter masala"

    # 🔥 CURRY BUT NO SEAFOOD
    if "curry" in t and not any(x in t for x in ["prawn", "fish", "shrimp", "chicken"]):
        return "vegetable curry"

    # 🔥 REMOVE WRONG SEAFOOD IF NOT PRESENT
    if any(x in t for x in ["prawn", "shrimp", "fish"]):
        if "paneer" in t or "cheese" in t:
            return "paneer curry"

    return t


# ---------------------------
# IMAGE ANALYSIS
# ---------------------------

def analyze_image_bytes(image_bytes: bytes) -> List[Dict[str, Any]]:
    """
    Returns list of predictions:
    [{name: str, value: float}]
    """

    use_google = bool(settings.GOOGLE_APPLICATION_CREDENTIALS)

    # ---------------- GOOGLE VISION ----------------
    if use_google:
        try:
            from google.cloud import vision
            client = vision.ImageAnnotatorClient()

            image = vision.Image(content=image_bytes)
            response = client.label_detection(image=image, max_results=10)

            labels = []
            for ann in response.label_annotations:
                name = ann.description.lower()
                score = float(getattr(ann, "score", 0.0))

                name = _force_indian_food_corrections(name)

                labels.append({
                    "name": name,
                    "value": round(score, 4)
                })

            return sorted(labels, key=lambda x: x["value"], reverse=True)

        except Exception:
            pass

    # ---------------- LOCAL FALLBACK ----------------
    pipeline = _load_caption_pipeline()

    if pipeline is None:
        return [{"name": "food", "value": 0.5}]

    from PIL import Image
    import io

    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    try:
        captions = pipeline(img, max_length=32, top_k=3)
    except Exception:
        captions = pipeline([img], max_length=32, top_k=3)

    labels = []

    if isinstance(captions, list):
        for c in captions:
            text = c.get("generated_text") if isinstance(c, dict) else str(c)

            if text:
                fixed_text = _force_indian_food_corrections(text)

                labels.append({
                    "name": fixed_text,
                    "value": 0.95
                })

                for i, kw in enumerate(_simple_keyword_extract(text)[:6]):
                    kw = _force_indian_food_corrections(kw)

                    labels.append({
                        "name": kw,
                        "value": round(0.85 - i * 0.05, 2)
                    })

    return labels


# ---------------------------
# RECIPE MATCHING (IMPROVED)
# ---------------------------

def match_recipe(labels: list, db) -> Tuple[Any, float]:

    from .models import Recipe

    all_recipes = db.query(Recipe).all()

    normalized = []

    for item in labels:
        name = str(item.get("name", "")).lower()
        conf = float(item.get("value", 0.0))

        if name:
            normalized.append((name, conf))

    best_recipe = None
    best_score = 0.0

    for recipe in all_recipes:
        title = (recipe.title or "").lower()
        labels_db = [l.lower() for l in (recipe.food_labels or [])]

        score = 0.0

        for lab, conf in normalized:

            # 🔥 STRONG TITLE MATCH
            if lab in title:
                score += 5 * conf

            # label match
            for l in labels_db:
                if lab == l:
                    score += 3 * conf
                elif lab in l or l in lab:
                    score += 1.5 * conf

        if score > best_score:
            best_score = score
            best_recipe = recipe

    if best_score < 2:
        return None, 0.0

    return best_recipe, best_score


# ---------------------------
# TEXT SEARCH
# ---------------------------

def search_concepts_for_text(query: str) -> List[Dict[str, float]]:
    kws = _simple_keyword_extract(query)
    return [{"name": k, "value": 0.5} for k in kws]