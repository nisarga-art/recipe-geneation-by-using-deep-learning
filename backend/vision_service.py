"""Lightweight image analysis service using Google Cloud Vision when available,
with a local BLIP caption fallback and simple rule-based label mapping.

Usage: import `analyze_image_bytes`, `get_image_caption`, `match_recipe`, `search_concepts_for_text`
This mirrors the API of the existing `clarifai_service.py` so switching is straightforward.
"""
from typing import List
from .config import settings

# Local caption fallback (BLIP)
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
    seen = set()
    out = []
    for w in candidates:
        if w not in seen:
            seen.add(w)
            out.append(w)
    return out


import json
from pathlib import Path
from time import time

# synonyms loaded from JSON for production-friendly, editable mapping
_SYNONYMS: dict = {}
_SYNONYMS_PATH: Path | None = None
_SYNONYMS_MTIME: float = 0.0


def _load_synonyms(force: bool = False) -> dict:
    global _SYNONYMS, _SYNONYMS_PATH, _SYNONYMS_MTIME
    path_str = settings.SYNONYMS_FILE or "backend/synonyms.json"
    _SYNONYMS_PATH = Path(path_str)
    if not _SYNONYMS_PATH.exists():
        # no file available — keep existing map or empty
        return _SYNONYMS

    try:
        mtime = _SYNONYMS_PATH.stat().st_mtime
        if force or mtime != _SYNONYMS_MTIME:
            data = json.loads(_SYNONYMS_PATH.read_text(encoding="utf-8"))
            # normalize keys/values to lowercase strings
            normalized = {str(k).lower(): str(v).lower() for k, v in data.items()}
            _SYNONYMS = normalized
            _SYNONYMS_MTIME = mtime
    except Exception:
        # on error, leave existing synonyms
        pass
    return _SYNONYMS


# initialize once
_load_synonyms()

# Dish map (canonical dish name -> list of variants) loaded from JSON
_DISH_MAP: dict = {}
_DISH_MAP_PATH: Path | None = None
_DISH_MAP_MTIME: float = 0.0


def _load_dish_map(force: bool = False) -> dict:
    global _DISH_MAP, _DISH_MAP_PATH, _DISH_MAP_MTIME
    path_str = getattr(settings, "DISH_MAP_FILE", None) or "backend/dish_map.json"
    _DISH_MAP_PATH = Path(path_str)
    if not _DISH_MAP_PATH.exists():
        return _DISH_MAP
    try:
        mtime = _DISH_MAP_PATH.stat().st_mtime
        if force or mtime != _DISH_MAP_MTIME:
            data = json.loads(_DISH_MAP_PATH.read_text(encoding="utf-8"))
            # normalize to lowercase mapping of variant -> canonical
            flat = {}
            for canon, variants in data.items():
                canon_l = str(canon).lower()
                if isinstance(variants, list):
                    for v in variants:
                        flat[str(v).lower()] = canon_l
                else:
                    flat[str(variants).lower()] = canon_l
            _DISH_MAP = flat
            _DISH_MAP_MTIME = mtime
    except Exception:
        pass
    return _DISH_MAP


_load_dish_map()


def _apply_rule_map(name: str) -> str:
    n = name.lower().strip()
    # reload synonyms if file was updated
    _load_synonyms()
    _load_dish_map()

    # direct lookup
    if n in _SYNONYMS:
        return _SYNONYMS[n]

    # partial match: try longest-first to avoid short-key collisions
    keys = sorted(_SYNONYMS.keys(), key=lambda x: -len(x))
    for k in keys:
        if k in n:
            return _SYNONYMS[k]

    # fallback: return original normalized name
    return n


def analyze_image_bytes(image_bytes: bytes) -> list[dict]:
    """Use Google Vision label detection when credentials provided, otherwise fall back to
    the local caption + keyword extractor. Returns list of {name, value} sorted by confidence.
    """
    use_google = bool(settings.GOOGLE_APPLICATION_CREDENTIALS)

    if use_google:
        try:
            from google.cloud import vision
            client = vision.ImageAnnotatorClient()
            image = vision.Image(content=image_bytes)
            response = client.label_detection(image=image, max_results=15)
            labels = []
            for ann in response.label_annotations:
                name = ann.description.lower()
                score = float(getattr(ann, "score", 0.0))
                labels.append({"name": _apply_rule_map(name), "value": round(score, 4)})
            # sort by confidence desc
            labels.sort(key=lambda x: x["value"], reverse=True)
            return labels
        except Exception as e:
            # Fall through to local fallback on any error
            pass

    # Local fallback: caption + simple extraction
    # First try an on-disk classifier if available (faster, deterministic dish labels)
    try:
        from . import dish_classifier
    except Exception:
        dish_classifier = None

    if dish_classifier is not None:
        try:
            preds = dish_classifier.predict(image_bytes, topk=3)
            if preds:
                labels = []
                for p in preds:
                    labels.append({
                        "name": _apply_rule_map(str(p.get("name", "")).lower()),
                        "value": float(p.get("value", 0.0)),
                        "source": "classifier",
                    })
                # return classifier-first results (these are high-precision dish names)
                return labels
        except Exception:
            # ignore classifier errors and fall back to captioning
            pass

    pipeline = _load_caption_pipeline()
    labels = []
    if pipeline is None:
        return [{"name": "food", "value": 0.5}]

    from PIL import Image
    import io

    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    try:
        captions = pipeline(img, max_length=32, top_k=3)
    except Exception:
        captions = pipeline([img], max_length=32, top_k=3)

    caption_texts = []
    if isinstance(captions, list):
        for c in captions:
            if isinstance(c, dict) and "generated_text" in c:
                caption_texts.append(c["generated_text"])
            elif isinstance(c, str):
                caption_texts.append(c)
    elif isinstance(captions, dict) and "generated_text" in captions:
        caption_texts.append(captions["generated_text"])

    if caption_texts:
        main = caption_texts[0]
        labels.append({"name": _apply_rule_map(main.lower()), "value": 0.95})
        for i, kw in enumerate(_simple_keyword_extract(main)[:8]):
            labels.append({"name": _apply_rule_map(kw), "value": round(0.85 - i * 0.05, 2)})

    return labels


def match_recipe(labels: list[str] | list[dict], db, *, weights: dict | None = None) -> tuple[object | None, float]:
    """Match detected labels to the best Recipe in DB using scoring.

    `labels` may be a list of strings (names) or a list of dicts with `name` and `value` (confidence).
    Returns a tuple `(best_recipe_or_None, score_float)`.
    """
    from .models import Recipe

    # load DB recipes once
    all_recipes = db.query(Recipe).all()

    # refresh mapping files
    _load_synonyms()
    dish_map = _load_dish_map()

    # Normalize input labels into list of (label, confidence)
    normalized_inputs: list[tuple[str, float]] = []
    for item in labels:
        if isinstance(item, dict):
            name = str(item.get("name", "")).strip()
            conf = float(item.get("value", 0.0))
        else:
            name = str(item).strip()
            conf = 0.5
        if not name:
            continue
        mapped = _apply_rule_map(name)
        # prefer dish map canonical name if available
        if mapped in dish_map:
            mapped = dish_map[mapped]
        normalized_inputs.append((mapped.lower(), conf))

    best_recipe = None
    best_score = 0.0

    # Scoring weights (tunable) - can be overridden by `weights` param
    defaults = {"exact": 3.0, "partial": 1.0, "title": 2.0}
    w = defaults if weights is None else {**defaults, **weights}
    WEIGHT_EXACT = float(w.get("exact", defaults["exact"]))
    WEIGHT_PARTIAL = float(w.get("partial", defaults["partial"]))
    WEIGHT_TITLE = float(w.get("title", defaults["title"]))

    for recipe in all_recipes:
        recipe_labels = [l.lower() for l in (recipe.food_labels or [])]
        title = (recipe.title or "").lower()
        combined = set(recipe_labels + title.split())

        score = 0.0
        for (lab, conf) in normalized_inputs:
            if lab in combined:
                score += WEIGHT_EXACT * max(conf, 0.5)
            else:
                # partial substring match against combined items
                matched = False
                for r in combined:
                    if lab in r or r in lab:
                        score += WEIGHT_PARTIAL * max(conf, 0.3)
                        matched = True
                        break
                if not matched:
                    # check if lab appears in recipe title directly
                    if lab in title:
                        score += WEIGHT_TITLE * max(conf, 0.4)

        # boost if any canonical dish appears exactly in title
        for variant, canon in dish_map.items():
            if canon in title:
                # if any input label equals this canonical name, boost
                for (lab, conf) in normalized_inputs:
                    if lab == canon:
                        score += WEIGHT_EXACT * 1.5

        if score > best_score:
            best_score = score
            best_recipe = recipe

    return (best_recipe if best_score > 0 else None, float(best_score))


def search_concepts_for_text(query: str) -> list[dict]:
    """Return keywords extracted from text as fallback for text-concept search."""
    kws = _simple_keyword_extract(query)
    return [{"name": k, "value": 0.5} for k in kws]
