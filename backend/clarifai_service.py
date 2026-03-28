import base64
import requests
from config import settings

CLARIFAI_URL = (
    f"https://api.clarifai.com/v2/users/{settings.CLARIFAI_USER_ID}"
    f"/apps/{settings.CLARIFAI_APP_ID}/models/{settings.CLARIFAI_MODEL_ID}"
    f"/versions/{settings.CLARIFAI_MODEL_VERSION}/outputs"
)

CLARIFAI_TEXT_URL = (
    f"https://api.clarifai.com/v2/users/{settings.CLARIFAI_USER_ID}"
    f"/apps/{settings.CLARIFAI_APP_ID}/models/{settings.CLARIFAI_TEXT_MODEL_ID}"
    f"/versions/{settings.CLARIFAI_TEXT_MODEL_VERSION}/outputs"
    if settings.CLARIFAI_TEXT_MODEL_ID and settings.CLARIFAI_TEXT_MODEL_VERSION
    else None
)


def analyze_image_bytes(image_bytes: bytes) -> list[dict]:
    """
    Send raw image bytes to Clarifai Food Item Recognition model via REST API.
    Returns a list of { "name": str, "value": float } sorted by confidence desc.
    """
    encoded = base64.b64encode(image_bytes).decode("utf-8")

    payload = {
        "inputs": [
            {
                "data": {
                    "image": {"base64": encoded}
                }
            }
        ]
    }

    headers = {
        "Authorization": f"Key {settings.CLARIFAI_PAT}",
        "Content-Type": "application/json",
    }

    response = requests.post(CLARIFAI_URL, json=payload, headers=headers, timeout=30)

    if response.status_code != 200:
        raise RuntimeError(
            f"Clarifai API error {response.status_code}: {response.text}"
        )

    data = response.json()
    status_code = data.get("status", {}).get("code")
    if status_code != 10000:
        raise RuntimeError(
            f"Clarifai returned status {status_code}: {data.get('status', {}).get('description')}"
        )

    concepts = data["outputs"][0]["data"]["concepts"]
    return [{"name": c["name"].lower(), "value": round(c["value"], 4)} for c in concepts]


def match_recipe(labels: list[str], db) -> object | None:
    """
    Fuzzy-match Clarifai labels against recipe food_labels stored in DB.
    Returns the best-matching Recipe ORM object or None.
    """
    from models import Recipe

    all_recipes = db.query(Recipe).all()
    best_recipe = None
    best_score = 0

    for recipe in all_recipes:
        recipe_labels = [l.lower() for l in (recipe.food_labels or [])]
        title_words = recipe.title.lower().split()
        combined = set(recipe_labels + title_words)

        score = sum(1 for label in labels if any(label in r or r in label for r in combined))
        if score > best_score:
            best_score = score
            best_recipe = recipe

    return best_recipe if best_score > 0 else None


def search_concepts_for_text(query: str) -> list[dict]:
    """Call Clarifai text model (concept outputs) for a text query."""
    if not CLARIFAI_TEXT_URL:
        raise RuntimeError("Clarifai text model is not configured")

    headers = {
        "Authorization": f"Key {settings.CLARIFAI_PAT}",
        "Content-Type": "application/json",
    }

    payload = {
        "inputs": [
            {
                "data": {
                    "text": {"raw": query}
                }
            }
        ]
    }

    response = requests.post(CLARIFAI_TEXT_URL, json=payload, headers=headers, timeout=30)

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

