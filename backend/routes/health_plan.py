from datetime import datetime, timezone
import re
from urllib.parse import quote

import requests
from fastapi import APIRouter, Depends, HTTPException
from difflib import get_close_matches
from sqlalchemy.orm import Session
from database import get_db
from models import Recipe
from schemas import (
    HealthPlanRequest,
    HealthPlanResponse,
    FoodRecommendation,
    LiveNutrientBenefitsResponse,
    RecipeOut,
)

router = APIRouter(prefix="/health-plan", tags=["Health Plan"])


HEALTH_CONDITIONS = {
    "diabetes": {
        "recommended_foods": [
            ("Oats", "Helps stabilize blood sugar", "Prepare unsweetened overnight oats with chia and nuts"),
            ("Lentils", "Low glycemic, high fiber protein source", "Cook lentil soup or dal for lunch"),
            ("Leafy greens", "Rich in magnesium and antioxidants", "Add spinach to stir-fry or soups"),
            ("Chia seeds", "Fiber rich and supports glucose control", "Mix into yogurt or smoothies"),
        ],
        "avoid_foods": ["Sugary drinks", "Refined flour desserts", "Excess white rice"],
    },
    "hypertension": {
        "recommended_foods": [
            ("Banana", "Potassium helps blood pressure balance", "Add sliced banana to breakfast bowls"),
            ("Beetroot", "Nitrate-rich and supports circulation", "Make beetroot salad or roasted beet side"),
            ("Oats", "Supports heart and blood pressure health", "Use oats for porridge or dosa batter blend"),
            ("Garlic", "May support healthy blood pressure", "Use fresh garlic in curries and stir-fries"),
        ],
        "avoid_foods": ["High-sodium packaged foods", "Pickles in excess", "Processed meats"],
    },
    "cholesterol": {
        "recommended_foods": [
            ("Oats", "Contains beta-glucan that supports LDL reduction", "Start day with oat porridge"),
            ("Walnuts", "Healthy fats support heart health", "Use as snack or salad topping"),
            ("Olive oil", "Heart-friendly fat source", "Use as primary cooking oil for salads"),
            ("Beans", "Fiber-rich and cholesterol friendly", "Add beans to soups and bowls"),
        ],
        "avoid_foods": ["Fried foods", "Trans fats", "Excess butter and cream"],
    },
    "pcos": {
        "recommended_foods": [
            ("Whole grains", "Better insulin response than refined grains", "Use brown rice or quinoa"),
            ("Eggs", "High-quality protein for satiety", "Prepare boiled eggs or omelette"),
            ("Greek yogurt", "Protein and probiotics support gut and hormone balance", "Use as breakfast base"),
            ("Berries", "Lower sugar fruits with antioxidants", "Add mixed berries to yogurt"),
        ],
        "avoid_foods": ["Sugary snacks", "Refined flour foods", "Sugar-sweetened beverages"],
    },
    "thyroid": {
        "recommended_foods": [
            ("Eggs", "Provide selenium and protein", "Use boiled or scrambled eggs"),
            ("Fish", "Iodine and omega-3 support thyroid and inflammation", "Prepare grilled fish meals"),
            ("Pumpkin seeds", "Zinc source helpful for metabolism", "Use in salads or smoothies"),
            ("Lentils", "Protein and iron support energy", "Cook lentil curry or soup"),
        ],
        "avoid_foods": ["Excess ultra-processed foods", "Very high sugar intake"],
    },
    "acidity": {
        "recommended_foods": [
            ("Banana", "Gentle on stomach", "Eat as a snack between meals"),
            ("Oatmeal", "Soothing, high-fiber breakfast", "Prepare plain oatmeal with fruits"),
            ("Cucumber", "Hydrating and cooling", "Use in salads and raita"),
            ("Ginger", "Supports digestion", "Use ginger tea after meals"),
        ],
        "avoid_foods": ["Very spicy foods", "Deep-fried foods", "Carbonated drinks"],
    },
}


DIET_GOALS = {
    "weight loss": {
        "diet_filter": ["Vegan", "Vegetarian", "Non-Vegetarian"],
        "tips": [
            "Prefer high-fiber and high-protein meals with fewer liquid calories.",
            "Use plate method: half vegetables, quarter protein, quarter complex carbs.",
        ],
    },
    "muscle gain": {
        "diet_filter": ["Vegetarian", "Vegan", "Non-Vegetarian"],
        "tips": [
            "Target a protein source in every meal.",
            "Pair resistance training with post-workout protein and carbs.",
        ],
    },
    "diabetic friendly": {
        "diet_filter": ["Vegan", "Vegetarian", "Non-Vegetarian"],
        "tips": [
            "Distribute carbs evenly across meals.",
            "Choose whole foods with low glycemic load.",
        ],
    },
    "heart healthy": {
        "diet_filter": ["Vegan", "Vegetarian", "Non-Vegetarian"],
        "tips": [
            "Limit sodium and deep-fried foods.",
            "Use nuts, seeds, legumes, and healthy oils regularly.",
        ],
    },
    "vegan": {"diet_filter": ["Vegan"], "tips": ["Include legumes, nuts, and seeds for complete nutrition."]},
    "vegetarian": {"diet_filter": ["Vegetarian", "Vegan"], "tips": ["Use dairy or legumes for protein balance."]},
    "high protein": {
        "diet_filter": ["Vegan", "Vegetarian", "Non-Vegetarian"],
        "tips": ["Aim for protein-rich choices such as lentils, eggs, tofu, paneer, chicken, or fish."],
    },
}


CONDITION_ALIASES = {
    "diabetes": ["diabetic", "blood sugar", "sugar", "insulin", "diabities", "diabities", "diabetees", "diabieties"],
    "hypertension": ["high bp", "high blood pressure", "bp", "pressure"],
    "cholesterol": ["high cholesterol", "ldl", "triglycerides", "lipid"],
    "pcos": ["pcod", "polycystic"],
    "thyroid": ["hypothyroid", "hyperthyroid", "tsh"],
    "acidity": ["acid reflux", "gerd", "heartburn", "gastric"],
}


NUTRIENT_QUERY_TERMS = {
    "vitamin-c": "Vitamin C",
    "protein": "Protein (nutrient)",
    "carbohydrates": "Carbohydrate",
    "healthy-fats": "Fat",
    "dietary-fiber": "Dietary fiber",
    "vitamin-d": "Vitamin D",
    "iron": "Iron",
    "calcium": "Calcium",
    "omega-3": "Omega-3 fatty acid",
}


LOCAL_BENEFIT_FALLBACKS = {
    "vitamin-c": [
        "Supports immune function and collagen production.",
        "Acts as an antioxidant that helps protect cells.",
        "Improves absorption of non-heme iron from plant foods.",
    ],
    "protein": [
        "Helps build and repair muscle and tissues.",
        "Supports enzymes, hormones, and immune proteins.",
        "Can improve satiety and preserve lean mass during weight loss.",
    ],
    "carbohydrates": [
        "Primary energy source for the brain and muscles.",
        "Complex carbohydrates support steady energy release.",
        "Fiber-rich carbohydrate foods support gut and metabolic health.",
    ],
    "healthy-fats": [
        "Supports absorption of vitamins A, D, E, and K.",
        "Contributes to hormone and cell membrane health.",
        "Unsaturated fats support cardiovascular health.",
    ],
    "dietary-fiber": [
        "Supports healthy digestion and bowel regularity.",
        "Helps improve satiety and blood sugar stability.",
        "Can support healthy cholesterol levels.",
    ],
    "vitamin-d": [
        "Supports calcium absorption and bone health.",
        "Contributes to normal immune function.",
        "Plays a role in muscle and mood regulation.",
    ],
    "iron": [
        "Essential for hemoglobin and oxygen transport.",
        "Supports energy metabolism and cognitive performance.",
        "Important for immune function and physical endurance.",
    ],
    "calcium": [
        "Supports bone and teeth mineralization.",
        "Needed for muscle contraction and nerve signaling.",
        "Contributes to normal blood clotting and heart rhythm.",
    ],
    "omega-3": [
        "Supports cardiovascular and brain health.",
        "Helps regulate inflammatory pathways.",
        "DHA and EPA are important for vision and cognition.",
    ],
}


BENEFIT_KEYWORDS = {
    "health",
    "immune",
    "bone",
    "heart",
    "brain",
    "metabolism",
    "inflammation",
    "blood",
    "digest",
    "muscle",
    "energy",
    "disease",
    "function",
    "support",
}


def _normalize_text(value: str | None) -> str:
    return (value or "").strip().lower()


def _parse_minutes(time_value: str | None) -> int:
    if not time_value:
        return 0
    digits = "".join(ch for ch in time_value if ch.isdigit())
    return int(digits) if digits else 0


def _recipe_text(recipe: Recipe) -> str:
    pieces: list[str] = [recipe.title or "", recipe.cuisine or "", recipe.diet or "", recipe.meal or ""]

    for field_name in ["health_benefits", "food_labels"]:
        values = getattr(recipe, field_name, None)
        if isinstance(values, list):
            pieces.extend([str(v) for v in values])

    ingredients = recipe.ingredients or {}
    if isinstance(ingredients, dict):
        for key in ["available", "missing"]:
            items = ingredients.get(key, [])
            if isinstance(items, list):
                pieces.extend([str(v) for v in items])

    return " ".join(pieces).lower()


def _match_condition(issue: str) -> str | None:
    if not issue:
        return None

    normalized = issue.strip().lower()

    # Exact or containment match first.
    for condition_key in HEALTH_CONDITIONS:
        if condition_key in normalized or normalized in condition_key:
            return condition_key

    # Alias based matching for layman terms and common misspellings.
    for condition_key, aliases in CONDITION_ALIASES.items():
        if any(alias in normalized for alias in aliases):
            return condition_key

    # Fuzzy fallback over full phrase and individual tokens.
    candidates = list(HEALTH_CONDITIONS.keys())
    close_full = get_close_matches(normalized, candidates, n=1, cutoff=0.72)
    if close_full:
        return close_full[0]

    for token in normalized.replace("-", " ").split():
        close_token = get_close_matches(token, candidates, n=1, cutoff=0.75)
        if close_token:
            return close_token[0]

    return None


def _extract_benefit_sentences(extract_text: str) -> list[str]:
    if not extract_text:
        return []

    cleaned = re.sub(r"\s+", " ", extract_text).strip()
    if not cleaned:
        return []

    sentences = [piece.strip() for piece in re.split(r"(?<=[.!?])\s+", cleaned) if piece.strip()]

    selected: list[str] = []
    for sentence in sentences:
        lowered = sentence.lower()
        if len(sentence) < 35:
            continue
        if any(keyword in lowered for keyword in BENEFIT_KEYWORDS):
            selected.append(sentence)
        if len(selected) >= 6:
            break

    if not selected:
        selected = [sentence for sentence in sentences if len(sentence) >= 35][:6]

    return selected


def _live_benefits_fallback(slug: str) -> LiveNutrientBenefitsResponse:
    nutrient_label = NUTRIENT_QUERY_TERMS.get(slug, slug.replace("-", " ").title())
    return LiveNutrientBenefitsResponse(
        nutrient_slug=slug,
        nutrient_name=nutrient_label,
        benefits=LOCAL_BENEFIT_FALLBACKS.get(slug, ["Balanced nutrition supports long-term health."]),
        source="local-fallback",
        source_url=None,
        fetched_at_utc=datetime.now(timezone.utc).isoformat(),
        is_live=False,
    )


@router.post("/recommendations", response_model=HealthPlanResponse)
def recommend_for_health_plan(payload: HealthPlanRequest, db: Session = Depends(get_db)):
    issues = [issue.strip().lower() for issue in payload.health_issues if issue.strip()]
    diet_goal = _normalize_text(payload.diet_goal)
    meal_type = _normalize_text(payload.meal_type)

    matched_conditions = []
    for issue in issues:
        condition = _match_condition(issue)
        if condition and condition not in matched_conditions:
            matched_conditions.append(condition)

    # Build food recommendations and avoid list from matched health conditions.
    recommended_map: dict[str, FoodRecommendation] = {}
    avoid_foods: set[str] = set()
    for condition in matched_conditions:
        for name, reason, usage in HEALTH_CONDITIONS[condition]["recommended_foods"]:
            if name.lower() not in recommended_map:
                recommended_map[name.lower()] = FoodRecommendation(name=name, reason=reason, usage=usage)
        avoid_foods.update(HEALTH_CONDITIONS[condition]["avoid_foods"])

    query = db.query(Recipe)

    if meal_type:
        query = query.filter(Recipe.meal.ilike(f"%{meal_type}%"))

    if diet_goal in DIET_GOALS:
        allowed_diets = DIET_GOALS[diet_goal]["diet_filter"]
        if allowed_diets:
            query = query.filter(Recipe.diet.in_(allowed_diets))

    all_candidates = query.all()

    avoid_tokens = {item.strip().lower() for item in payload.avoid_ingredients if item.strip()}
    preference_tokens = [token.strip().lower() for token in (payload.preferences or "").split(",") if token.strip()]

    if avoid_tokens:
        filtered_candidates = []
        for recipe in all_candidates:
            blob = _recipe_text(recipe)
            if not any(token in blob for token in avoid_tokens):
                filtered_candidates.append(recipe)
        all_candidates = filtered_candidates

    if payload.max_prep_time:
        all_candidates = [
            recipe
            for recipe in all_candidates
            if _parse_minutes(recipe.time) == 0 or _parse_minutes(recipe.time) <= payload.max_prep_time
        ]

    scored: list[tuple[int, Recipe]] = []
    for recipe in all_candidates:
        recipe_blob = _recipe_text(recipe)
        score = 0

        for food in recommended_map.values():
            if food.name.lower() in recipe_blob:
                score += 2

        for condition in matched_conditions:
            if condition in recipe_blob:
                score += 1

        for token in preference_tokens:
            if token in recipe_blob:
                score += 1

        nutrition = recipe.nutrition or {}
        if isinstance(nutrition, dict):
            protein = int(nutrition.get("protein", 0) or 0)
            carbs = int(nutrition.get("carbs", 0) or 0)
            fat = int(nutrition.get("fat", 0) or 0)

            if diet_goal in {"muscle gain", "high protein"} and protein >= 18:
                score += 2
            if diet_goal in {"diabetic friendly", "weight loss"} and carbs <= 45:
                score += 2
            if diet_goal == "heart healthy" and fat <= 15:
                score += 2

        calories = recipe.calories or 0
        if diet_goal == "weight loss" and 0 < calories <= 420:
            score += 2

        scored.append((score, recipe))

    scored.sort(key=lambda item: (-item[0], item[1].calories or 9999))
    best_recipes = [recipe for score, recipe in scored if score > 0][:5]

    if not best_recipes:
        best_recipes = all_candidates[:5]

    quick_recipe_fallbacks: list[RecipeOut] = []
    if not best_recipes:
        food_names = [food.name for food in recommended_map.values()]
        meal_label = payload.meal_type or "Meal"
        diet_label = payload.diet_goal.title() if payload.diet_goal else "Balanced"

        templates = [
            {
                "title": "Balanced Power Bowl",
                "steps": [
                    "Cook a whole grain base (quinoa, brown rice, or millets).",
                    "Saute or steam mixed vegetables and one lean protein source.",
                    "Top with seeds, herbs, and a light dressing.",
                ],
            },
            {
                "title": "Quick Healing Soup",
                "steps": [
                    "Simmer garlic, ginger, and mixed vegetables in low-sodium broth.",
                    "Add lentils or beans and cook until tender.",
                    "Finish with lemon juice and fresh herbs before serving.",
                ],
            },
            {
                "title": "Smart Breakfast Mix",
                "steps": [
                    "Combine oats or yogurt with seeds and fresh fruits.",
                    "Add a protein booster like nuts, paneer cubes, or boiled eggs.",
                    "Keep added sugar minimal and serve immediately.",
                ],
            },
        ]

        for idx, template in enumerate(templates, start=1):
            selected_foods = food_names[idx - 1: idx + 2] if food_names else ["vegetables", "whole grains"]
            quick_recipe_fallbacks.append(
                RecipeOut(
                    id=-idx,
                    title=template["title"],
                    cuisine="Personalized",
                    diet=diet_label,
                    time="20 minutes",
                    calories=320,
                    difficulty="Easy",
                    meal=meal_label,
                    image="https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&q=80",
                    pantry_match=80,
                    cultural="Custom plan based on your health input",
                    ingredients={"available": selected_foods, "missing": []},
                    nutrition={"protein": 18, "carbs": 35, "fat": 11, "fiber": 8},
                    health_benefits=[food.reason for food in list(recommended_map.values())[:3]],
                    steps=template["steps"],
                    similar_dishes=["Buddha Bowl", "Lentil Soup", "Overnight Oats"],
                    food_labels=selected_foods,
                )
            )

    lifestyle_tips = []
    if diet_goal in DIET_GOALS:
        lifestyle_tips.extend(DIET_GOALS[diet_goal]["tips"])

    if matched_conditions:
        lifestyle_tips.append("Stay hydrated and keep meal timings consistent for better outcomes.")
        lifestyle_tips.append("Track symptoms and discuss persistent concerns with a qualified clinician.")

    if not recommended_map:
        recommended_map["balanced plate"] = FoodRecommendation(
            name="Balanced plate",
            reason="Good default for most health goals",
            usage="Build meals with vegetables, protein, and whole grains",
        )

    if avoid_tokens:
        avoid_foods.update({f"Any dish containing {token}" for token in sorted(avoid_tokens)})

    summary_bits = []
    if issues:
        summary_bits.append(f"Health concerns noted: {', '.join(payload.health_issues)}.")
    if matched_conditions:
        summary_bits.append(f"Detected condition profile: {', '.join(matched_conditions)}.")
    if payload.diet_goal:
        summary_bits.append(f"Diet goal: {payload.diet_goal}.")
    if payload.meal_type:
        summary_bits.append(f"Meal focus: {payload.meal_type}.")

    if not summary_bits:
        summary_bits.append("General balanced recommendations generated.")

    return HealthPlanResponse(
        summary=" ".join(summary_bits),
        recommended_foods=list(recommended_map.values()),
        avoid_foods=sorted(avoid_foods),
        recipes=best_recipes if best_recipes else quick_recipe_fallbacks,
        lifestyle_tips=lifestyle_tips,
        disclaimer="This plan is informational and not a medical diagnosis. For chronic conditions, consult your doctor or dietitian.",
    )


@router.get("/nutrients/{slug}/live-benefits", response_model=LiveNutrientBenefitsResponse)
def nutrient_live_benefits(slug: str):
    query_term = NUTRIENT_QUERY_TERMS.get(slug)
    if not query_term:
        raise HTTPException(status_code=404, detail="Unsupported nutrient slug")

    encoded = quote(query_term.replace(" ", "_"), safe="")
    endpoint = f"https://en.wikipedia.org/api/rest_v1/page/summary/{encoded}"
    headers = {
        "Accept": "application/json",
        "User-Agent": "RecipeDiscover/1.0 (nutrition live endpoint)",
    }

    try:
        response = requests.get(endpoint, headers=headers, timeout=8)
        response.raise_for_status()
        payload = response.json()
    except requests.RequestException:
        return _live_benefits_fallback(slug)

    benefits = _extract_benefit_sentences(payload.get("extract", ""))
    if not benefits:
        return _live_benefits_fallback(slug)

    source_url = None
    content_urls = payload.get("content_urls") or {}
    desktop_payload = content_urls.get("desktop") if isinstance(content_urls, dict) else None
    if isinstance(desktop_payload, dict):
        source_url = desktop_payload.get("page")

    return LiveNutrientBenefitsResponse(
        nutrient_slug=slug,
        nutrient_name=payload.get("title") or query_term,
        benefits=benefits,
        source="wikipedia",
        source_url=source_url,
        fetched_at_utc=datetime.now(timezone.utc).isoformat(),
        is_live=True,
    )
