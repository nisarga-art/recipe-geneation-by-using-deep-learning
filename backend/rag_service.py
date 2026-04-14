from __future__ import annotations

# Optional heavy dependencies (safe lazy imports)
try:
    from sentence_transformers import SentenceTransformer
except Exception:
    SentenceTransformer = None

try:
    import numpy as np
except Exception:
    np = None

try:
    import faiss
except Exception:
    faiss = None

import json
from typing import List, Dict, Optional
 
# Lazy import helpers for optional heavy dependencies
def _ensure_sentence_transformer():
    try:
        from sentence_transformers import SentenceTransformer

        return SentenceTransformer
    except Exception as e:
        raise RuntimeError("Missing 'sentence-transformers' package. Install requirements to enable RAG features.") from e


def _ensure_faiss():
    try:
        import faiss

        return faiss
    except Exception as e:
        raise RuntimeError("Missing 'faiss' package. Install requirements to enable RAG features.") from e


def _ensure_numpy():
    try:
        import numpy as np

        return np
    except Exception as e:
        raise RuntimeError("Missing 'numpy' package. Install requirements to enable RAG features.") from e


def _ensure_requests():
    try:
        import requests
        from io import BytesIO

        return requests, BytesIO
    except Exception as e:
        raise RuntimeError("Missing 'requests' package. Install requirements to enable image downloads.") from e


def _ensure_pil():
    try:
        from PIL import Image

        return Image
    except Exception as e:
        raise RuntimeError("Missing 'Pillow' package. Install requirements to enable image processing.") from e
# Text embedding model (sentence-transformers)
_TEXT_MODEL = None
_TEXT_INDEX = None
_TEXT_METADATA: List[Dict] = []

# Image embedding model (CLIP via sentence-transformers)
_IMG_MODEL = None
_IMG_INDEX = None
_IMG_METADATA: List[Dict] = []


def _load_text_model(model_name: str = "all-MiniLM-L6-v2"):
    global _TEXT_MODEL
    if SentenceTransformer is None:
        raise RuntimeError("sentence-transformers is not installed")
    if _TEXT_MODEL is None:
        _TEXT_MODEL = SentenceTransformer(model_name)
    return _TEXT_MODEL


def _load_image_model(model_name: str = "clip-ViT-B-32"):
    global _IMG_MODEL
    if SentenceTransformer is None:
        raise RuntimeError("sentence-transformers is not installed")
    if _IMG_MODEL is None:
        # SentenceTransformer supports CLIP variants for image embeddings
        _IMG_MODEL = SentenceTransformer(model_name)
    return _IMG_MODEL


def _download_image(url: str) -> Optional[Image.Image]:
    try:
        requests, BytesIO = _ensure_requests()
        Image = _ensure_pil()
        resp = requests.get(url, timeout=6)
        resp.raise_for_status()
        return Image.open(BytesIO(resp.content)).convert("RGB")
    except Exception:
        return None


def build_index_from_recipes(recipes: List[Dict], text_model_name: str = "all-MiniLM-L6-v2", img_model_name: str = "clip-ViT-B-32") -> None:
    """Builds FAISS indices for text and images from recipe dicts.

    Each recipe can include `id`, `title`, `ingredients`, and optional `image` (URL).
    This function creates/upates both text and image indices and metadata.
    """
    global _TEXT_INDEX, _TEXT_METADATA, _IMG_INDEX, _IMG_METADATA
    if np is None or faiss is None:
        raise RuntimeError("numpy/faiss are not installed")

    # Build text index
    text_model = _load_text_model(text_model_name)
    docs = []
    tmeta = []
    for r in recipes:
        text = r.get("title", "") + "\n"
        ingredients = r.get("ingredients")
        if isinstance(ingredients, list):
            # ingredients as list of dicts or strings
            text += " ".join([i.get("name") if isinstance(i, dict) else str(i) for i in ingredients])
        elif isinstance(ingredients, dict):
            vals = []
            for v in ingredients.values():
                if isinstance(v, list):
                    vals.extend(map(str, v))
            text += " ".join(vals)
        else:
            text += str(ingredients or "")

        docs.append(text)
        tmeta.append({"id": r.get("id"), "title": r.get("title"), "source": r})

    if docs:
        np = _ensure_numpy()
        faiss = _ensure_faiss()
        t_emb = text_model.encode(docs, convert_to_numpy=True, show_progress_bar=False)
        dim = t_emb.shape[1]
        text_index = faiss.IndexFlatIP(dim)
        faiss.normalize_L2(t_emb)
        text_index.add(t_emb)
        _TEXT_INDEX = text_index
        _TEXT_METADATA = tmeta

    # Build image index if any images present
    img_model = None
    img_embs = []
    imeta = []
    for r in recipes:
        img_url = r.get("image")
        if not img_url:
            continue
        img = _download_image(img_url)
        if img is None:
            continue
        if img_model is None:
            img_model = _load_image_model(img_model_name)
        try:
            emb = img_model.encode(img, convert_to_numpy=True)
            img_embs.append(emb)
            imeta.append({"id": r.get("id"), "title": r.get("title"), "source": r})
        except Exception:
            continue

    if img_embs:
        np = _ensure_numpy()
        faiss = _ensure_faiss()
        img_embs = np.vstack(img_embs)
        dim_i = img_embs.shape[1]
        img_index = faiss.IndexFlatIP(dim_i)
        faiss.normalize_L2(img_embs)
        img_index.add(img_embs)
        _IMG_INDEX = img_index
        _IMG_METADATA = imeta


def save_index(index_path: str, meta_path: str, img_index_path: Optional[str] = None, img_meta_path: Optional[str] = None) -> None:
    global _TEXT_INDEX, _TEXT_METADATA, _IMG_INDEX, _IMG_METADATA
    if faiss is None:
        raise RuntimeError("faiss is not installed")
    if _TEXT_INDEX is None:
        raise RuntimeError("Text index not built")
    faiss = _ensure_faiss()
    faiss.write_index(_TEXT_INDEX, index_path)
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(_TEXT_METADATA, f, ensure_ascii=False)

    if _IMG_INDEX is not None and img_index_path and img_meta_path:
        faiss = _ensure_faiss()
        faiss.write_index(_IMG_INDEX, img_index_path)
        with open(img_meta_path, "w", encoding="utf-8") as f:
            json.dump(_IMG_METADATA, f, ensure_ascii=False)


def load_index(index_path: str, meta_path: str, img_index_path: Optional[str] = None, img_meta_path: Optional[str] = None, text_model_name: str = "all-MiniLM-L6-v2", img_model_name: str = "clip-ViT-B-32") -> None:
    global _TEXT_INDEX, _TEXT_METADATA, _IMG_INDEX, _IMG_METADATA
    if faiss is None:
        raise RuntimeError("faiss is not installed")
    _load_text_model(text_model_name)
    faiss = _ensure_faiss()
    _TEXT_INDEX = faiss.read_index(index_path)
    with open(meta_path, "r", encoding="utf-8") as f:
        _TEXT_METADATA = json.load(f)

    if img_index_path and img_meta_path:
        _load_image_model(img_model_name)
        faiss = _ensure_faiss()
        _IMG_INDEX = faiss.read_index(img_index_path)
        with open(img_meta_path, "r", encoding="utf-8") as f:
            _IMG_METADATA = json.load(f)


def search(query: str, top_k: int = 5, image_bytes: Optional[bytes] = None, image_weight: float = 0.5) -> List[Dict]:
    """Return top_k metadata dicts most similar to the query string and optional image.

    If `image_bytes` is provided, the function searches the image index and merges scores with text index using `image_weight`.
    """
    global _TEXT_INDEX, _TEXT_METADATA, _IMG_INDEX, _IMG_METADATA
    if np is None or faiss is None:
        raise RuntimeError("numpy/faiss are not installed")
    if _TEXT_INDEX is None:
        raise RuntimeError("Text index not initialized. Call build_index_from_recipes or load_index first.")

    text_model = _load_text_model()
    q_emb = text_model.encode([query], convert_to_numpy=True)
    faiss = _ensure_faiss()
    np = _ensure_numpy()
    faiss.normalize_L2(q_emb)
    D_t, I_t = _TEXT_INDEX.search(q_emb, top_k)

    # collect text results
    text_results = {}
    for dist, idx in zip(D_t[0], I_t[0]):
        if idx < 0 or idx >= len(_TEXT_METADATA):
            continue
        meta = _TEXT_METADATA[idx].copy()
        text_results[meta["id"]] = {"meta": meta, "text_score": float(dist)}

    # if image given and image index present, search image index and merge
    if image_bytes and _IMG_INDEX is not None:
        img_model = _load_image_model()
        try:
            requests, BytesIO = _ensure_requests()
            Image = _ensure_pil()
            img = Image.open(BytesIO(image_bytes)).convert("RGB")
            img_emb = img_model.encode(img, convert_to_numpy=True)
        except Exception:
            img_emb = None

        if img_emb is not None:
            img_emb = np.asarray(img_emb).reshape(1, -1)
            faiss.normalize_L2(img_emb)
            D_i, I_i = _IMG_INDEX.search(img_emb, top_k)
            for dist, idx in zip(D_i[0], I_i[0]):
                if idx < 0 or idx >= len(_IMG_METADATA):
                    continue
                meta = _IMG_METADATA[idx].copy()
                entry = text_results.get(meta["id"])
                if entry:
                    entry["img_score"] = float(dist)
                else:
                    text_results[meta["id"]] = {"meta": meta, "img_score": float(dist)}

    # merge and compute final score
    merged = []
    for rid, values in text_results.items():
        meta = values["meta"]
        tscore = values.get("text_score", 0.0)
        iscore = values.get("img_score", 0.0)
        final = (1.0 - image_weight) * tscore + image_weight * iscore
        meta_copy = meta.copy()
        meta_copy["score"] = float(final)
        merged.append(meta_copy)

    # sort by score desc
    merged.sort(key=lambda x: x.get("score", 0.0), reverse=True)
    return merged[:top_k]
