from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
import requests
from database import get_db
from models import Recipe
from schemas import RecipeOut

router = APIRouter(prefix="/recipes", tags=["Recipes"])
VIRTUAL_RECIPES_CACHE: dict[int, RecipeOut] = {}


CUISINE_AREA_MAP = {
    "indian": ["Indian"],
    "north indian": ["Indian"],
    "south indian": ["Indian"],
    "asian": ["Chinese", "Japanese", "Thai", "Vietnamese", "Malaysian"],
    "chinese": ["Chinese"],
    "japanese": ["Japanese"],
    "korean": ["Japanese", "Chinese"],
    "thai": ["Thai"],
    "mediterranean": ["Greek", "Turkish", "Moroccan", "Spanish"],
    "greek": ["Greek"],
    "italian": ["Italian"],
    "french": ["French"],
    "western": ["American", "British", "Canadian"],
    "american": ["American"],
    "mexican": ["Mexican"],
    "middle eastern": ["Turkish", "Moroccan", "Egyptian"],
}


CUISINE_IMAGE_MAP = {
    "indian": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Rameshwaram_Cafe_Dosa.jpg/330px-Rameshwaram_Cafe_Dosa.jpg",
    "north indian": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Punjabi_style_Dal_Makhani.jpg/330px-Punjabi_style_Dal_Makhani.jpg",
    "south indian": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Idli_Sambar.JPG/330px-Idli_Sambar.JPG",
    "asian": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Shoyu_ramen%2C_at_Kasukabe_Station_%282014.05.05%29_1.jpg/330px-Shoyu_ramen%2C_at_Kasukabe_Station_%282014.05.05%29_1.jpg",
    "chinese": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Kung-pao-shanghai.jpg/330px-Kung-pao-shanghai.jpg",
    "japanese": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Sushi_platter.jpg/330px-Sushi_platter.jpg",
    "korean": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Dolsot-bibimbap.jpg/330px-Dolsot-bibimbap.jpg",
    "thai": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Tom_yam_kung_maenam.jpg/330px-Tom_yam_kung_maenam.jpg",
    "mediterranean": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/01_Paella_Valenciana_original.jpg/330px-01_Paella_Valenciana_original.jpg",
    "greek": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Pita_giros.JPG/330px-Pita_giros.JPG",
    "italian": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Pizza_Margherita_stu_spivack.jpg/330px-Pizza_Margherita_stu_spivack.jpg",
    "french": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Ratatouille_home_cooked.jpg/330px-Ratatouille_home_cooked.jpg",
    "western": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/RedDot_Burger.jpg/330px-RedDot_Burger.jpg",
    "american": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/RedDot_Burger.jpg/330px-RedDot_Burger.jpg",
    "mexican": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Burrito.JPG/330px-Burrito.JPG",
    "middle eastern": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/%D0%A8%D0%B0%D1%83%D1%80%D0%BC%D0%B0_6.jpg/330px-%D0%A8%D0%B0%D1%83%D1%80%D0%BC%D0%B0_6.jpg",
}


def _external_recipe(
    meal_name: str,
    meal_thumb: str | None,
    cuisine_name: str,
    recipe_id: int,
    meal_type: str | None = None,
    steps: Optional[list[str]] = None,
    ingredients: Optional[dict] = None,
    nutrition: Optional[dict] = None,
) -> RecipeOut:
    return RecipeOut(
        id=recipe_id,
        title=meal_name,
        cuisine=cuisine_name,
        diet="Unknown",
        time="30 minutes",
        calories=380,
        difficulty="Unknown",
        meal=meal_type or "Main Course",
        image=meal_thumb,
        pantry_match=None,
        cultural="External curated recipe",
        ingredients=ingredients or {"available": ["Main ingredient", "Seasoning", "Cooking oil"], "missing": []},
        nutrition=nutrition or {"protein": 12, "carbs": 36, "fat": 14, "fiber": 5},
        health_benefits=["Balanced meal", "Cuisine variety"],
        steps=steps or [
            "Prepare all ingredients and heat the pan.",
            "Cook according to the recipe style until done.",
            "Adjust seasoning and serve hot.",
        ],
        similar_dishes=[f"{cuisine_name} special"],
        food_labels=None,
    )


def _split_instructions(instructions: str | None) -> list[str]:
    if not instructions:
        return ["Prepare ingredients.", "Cook and serve."]
    parts = [line.strip(" -") for line in instructions.replace("\r", "\n").split("\n") if line.strip()]
    if len(parts) >= 2:
        return parts[:12]
    sentence_parts = [p.strip() for p in instructions.split(".") if p.strip()]
    return sentence_parts[:12] if sentence_parts else [instructions]


def _mealdb_to_recipe_out(meal_obj: dict, cuisine_name: str, recipe_id: int, meal_type: Optional[str] = None) -> RecipeOut:
    available = []
    for i in range(1, 21):
        ingredient = (meal_obj.get(f"strIngredient{i}") or "").strip()
        measure = (meal_obj.get(f"strMeasure{i}") or "").strip()
        if ingredient:
            available.append(f"{measure} {ingredient}".strip())

    steps = _split_instructions(meal_obj.get("strInstructions"))
    category = (meal_obj.get("strCategory") or meal_type or "Main Course").strip()

    return _external_recipe(
        meal_name=meal_obj.get("strMeal", "Unknown"),
        meal_thumb=meal_obj.get("strMealThumb"),
        cuisine_name=cuisine_name,
        recipe_id=recipe_id,
        meal_type=category,
        steps=steps,
        ingredients={"available": available[:12], "missing": []},
        nutrition={"protein": 14, "carbs": 40, "fat": 15, "fiber": 6},
    )


def _top_up_cuisine_results(cuisine: str, needed: int, existing_titles: set[str], meal: Optional[str] = None) -> list[RecipeOut]:
    if needed <= 0:
        return []

    cuisine_key = cuisine.strip().lower()
    areas = CUISINE_AREA_MAP.get(cuisine_key, [cuisine.title()])

    topped_up: list[RecipeOut] = []
    for area in areas:
        if len(topped_up) >= needed:
            break

        try:
            url = f"https://www.themealdb.com/api/json/v1/1/filter.php?a={area}"
            response = requests.get(url, timeout=6)
            response.raise_for_status()
            meals = response.json().get("meals", []) or []
        except Exception:
            meals = []

        for meal_item in meals:
            if len(topped_up) >= needed:
                break

            title = (meal_item.get("strMeal") or "").strip()
            if not title:
                continue

            id_meal = meal_item.get("idMeal")
            if not id_meal:
                continue

            try:
                recipe_id = -int(id_meal)
            except ValueError:
                continue

            title_key = title.lower()
            if title_key in existing_titles:
                continue

            detail_recipe: Optional[RecipeOut] = None
            try:
                detail_resp = requests.get(f"https://www.themealdb.com/api/json/v1/1/lookup.php?i={id_meal}", timeout=6)
                detail_resp.raise_for_status()
                detail_meals = detail_resp.json().get("meals", []) or []
                if detail_meals:
                    detail_recipe = _mealdb_to_recipe_out(detail_meals[0], cuisine, recipe_id, meal)
            except Exception:
                detail_recipe = None

            if detail_recipe is None:
                detail_recipe = _external_recipe(
                    meal_name=title,
                    meal_thumb=meal_item.get("strMealThumb"),
                    cuisine_name=cuisine,
                    recipe_id=recipe_id,
                    meal_type=meal,
                )

            topped_up.append(detail_recipe)
            VIRTUAL_RECIPES_CACHE[recipe_id] = detail_recipe
            existing_titles.add(title_key)

    # Hard guarantee: always return at least 10 cards with images for a cuisine filter.
    while len(topped_up) < needed:
        idx = len(topped_up) + 1
        title = f"{cuisine.title()} Special {idx}"
        title_key = title.lower()
        if title_key in existing_titles:
            idx += 1
            title = f"{cuisine.title()} Recipe {idx}"
            title_key = title.lower()

        recipe_id = -800000 - idx - abs(hash(cuisine_key)) % 10000
        synthetic = _external_recipe(
            meal_name=title,
            meal_thumb=CUISINE_IMAGE_MAP.get(cuisine_key),
            cuisine_name=cuisine,
            recipe_id=recipe_id,
            meal_type=meal,
            steps=[
                f"Prepare base ingredients for {title}.",
                "Cook with regional spices and aromatics.",
                "Simmer until flavors are balanced.",
                "Plate and garnish before serving.",
            ],
            ingredients={"available": ["Main produce", "Protein", "Spice blend", "Oil"], "missing": []},
            nutrition={"protein": 16, "carbs": 42, "fat": 13, "fiber": 6},
        )
        topped_up.append(synthetic)
        VIRTUAL_RECIPES_CACHE[recipe_id] = synthetic
        existing_titles.add(title_key)

    return topped_up


@router.get("/{recipe_id}", response_model=RecipeOut)
def get_recipe_by_id(recipe_id: int, db: Session = Depends(get_db)):
    if recipe_id >= 0:
        recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
        if recipe:
            return recipe
        raise HTTPException(status_code=404, detail="Recipe not found")

    cached = VIRTUAL_RECIPES_CACHE.get(recipe_id)
    if cached:
        return cached

    meal_id = abs(recipe_id)
    try:
        response = requests.get(f"https://www.themealdb.com/api/json/v1/1/lookup.php?i={meal_id}", timeout=6)
        response.raise_for_status()
        meals = response.json().get("meals", []) or []
        if meals:
            recipe = _mealdb_to_recipe_out(meals[0], meals[0].get("strArea", "External"), recipe_id)
            VIRTUAL_RECIPES_CACHE[recipe_id] = recipe
            return recipe
    except Exception:
        pass

    raise HTTPException(status_code=404, detail="Recipe details not available")


@router.get("/", response_model=list[RecipeOut])
def get_all_recipes(
    cuisine: Optional[str] = Query(None),
    diet: Optional[str] = Query(None),
    meal: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(Recipe)

    if cuisine:
        query = query.filter(Recipe.cuisine.ilike(f"%{cuisine}%"))
    if diet:
        query = query.filter(Recipe.diet.ilike(f"%{diet}%"))
    if meal:
        query = query.filter(Recipe.meal.ilike(f"%{meal}%"))
    if difficulty:
        query = query.filter(Recipe.difficulty.ilike(f"%{difficulty}%"))
    if search:
        search = search.strip().lower()
        query = query.filter(Recipe.title.ilike(f"%{search}%"))

    local_results = query.all()

    if search:
        # Always also fetch from TheMealDB when searching
        external_recipes = []
        try:
            url = f"https://www.themealdb.com/api/json/v1/1/search.php?s={search}"
            response = requests.get(url, timeout=5)
            data = response.json()
            meals = data.get("meals", [])
            local_titles = {r.title.lower() for r in local_results}
            for meal in meals or []:
                # Avoid duplicates already in local DB
                if meal.get("strMeal", "").lower() not in local_titles:
                    id_meal = meal.get("idMeal")
                    if id_meal and str(id_meal).isdigit():
                        recipe_id = -int(id_meal)
                    else:
                        recipe_id = -910000 - len(external_recipes)
                    recipe = _mealdb_to_recipe_out(meal, meal.get("strArea", "Unknown"), recipe_id, meal.get("strCategory"))
                    external_recipes.append(recipe)
                    VIRTUAL_RECIPES_CACHE[recipe_id] = recipe
        except Exception as e:
            print(f"TheMealDB fetch error: {e}")

        # Combine local + external results
        return list(local_results) + external_recipes

    if cuisine:
        min_per_cuisine = 10
        combined_results = list(local_results)
        if len(combined_results) < min_per_cuisine:
            existing_titles = {r.title.lower() for r in combined_results}
            needed = min_per_cuisine - len(combined_results)
            combined_results.extend(_top_up_cuisine_results(cuisine, needed, existing_titles, meal))
        return combined_results

    # If not searching or cuisine filtering, return local DB results.
    return local_results
