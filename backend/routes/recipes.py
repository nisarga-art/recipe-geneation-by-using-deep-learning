from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
from models import Recipe
from schemas import RecipeOut

router = APIRouter(prefix="/recipes", tags=["Recipes"])


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
            print(f"Fetching from TheMealDB: {url}")
            response = requests.get(url, timeout=5)
            print(f"TheMealDB status: {response.status_code}")
            data = response.json()
            meals = data.get("meals", [])
            print(f"TheMealDB meals count: {len(meals) if meals else 0}")
            local_titles = {r.title.lower() for r in local_results}
            for meal in meals or []:
                # Avoid duplicates already in local DB
                if meal.get("strMeal", "").lower() not in local_titles:
                    external_recipes.append(RecipeOut(
                        id=None,
                        title=meal.get("strMeal", "Unknown"),
                        cuisine=meal.get("strArea", "Unknown"),
                        diet="Unknown",
                        time="Unknown",
                        calories=None,
                        difficulty="Unknown",
                        meal=meal.get("strCategory", "Unknown"),
                        image=meal.get("strMealThumb", None),
                        pantry_match=None,
                        cultural=meal.get("strTags", None),
                        ingredients=None,
                        nutrition=None,
                        health_benefits=None,
                        steps=[meal.get("strInstructions", "")],
                        similar_dishes=None,
                        food_labels=None,
                    ))
        except Exception as e:
            print(f"TheMealDB fetch error: {e}")

        # Combine local + external results
        return list(local_results) + external_recipes

    # If not searching, return all local results
    return local_results
