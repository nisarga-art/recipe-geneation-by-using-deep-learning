from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List, Any


# ── Auth ───────────────────────────────────────────────────
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v

    @field_validator("username")
    @classmethod
    def username_length(cls, v: str) -> str:
        if len(v.strip()) < 2:
            raise ValueError("Username must be at least 2 characters")
        return v.strip()


class UserOut(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ── Recipe ─────────────────────────────────────────────────
class RecipeOut(BaseModel):
    id: int
    title: str
    cuisine: Optional[str]
    diet: Optional[str]
    time: Optional[str]
    calories: Optional[int]
    difficulty: Optional[str]
    meal: Optional[str]
    image: Optional[str]
    pantry_match: Optional[int]
    cultural: Optional[str]
    ingredients: Optional[Any]
    nutrition: Optional[Any]
    health_benefits: Optional[Any]
    steps: Optional[Any]
    similar_dishes: Optional[Any]
    food_labels: Optional[Any]

    class Config:
        from_attributes = True


class RecipeCreate(BaseModel):
    title: str
    cuisine: Optional[str] = None
    diet: Optional[str] = None
    time: Optional[str] = None
    calories: Optional[int] = None
    difficulty: Optional[str] = None
    meal: Optional[str] = None
    image: Optional[str] = None
    pantry_match: Optional[int] = None
    cultural: Optional[str] = None
    ingredients: Optional[Any] = None
    nutrition: Optional[Any] = None
    health_benefits: Optional[Any] = None
    steps: Optional[Any] = None
    similar_dishes: Optional[Any] = None
    food_labels: Optional[Any] = None


class RecipeUpdate(BaseModel):
    title: Optional[str] = None
    cuisine: Optional[str] = None
    diet: Optional[str] = None
    time: Optional[str] = None
    calories: Optional[int] = None
    difficulty: Optional[str] = None
    meal: Optional[str] = None
    image: Optional[str] = None
    pantry_match: Optional[int] = None
    cultural: Optional[str] = None
    ingredients: Optional[Any] = None
    nutrition: Optional[Any] = None
    health_benefits: Optional[Any] = None
    steps: Optional[Any] = None
    similar_dishes: Optional[Any] = None
    food_labels: Optional[Any] = None


class RecipeListResponse(BaseModel):
    items: List[RecipeOut]
    total: int
    page: int
    page_size: int
    total_pages: int
    sort_by: str
    sort_order: str


# ── Analyze ────────────────────────────────────────────────
class AnalyzeResult(BaseModel):
    detected_labels: List[str]
    confidence_scores: List[float]
    matched_recipe: Optional[RecipeOut]
    generated_recipe: Optional[str]
    generated_recipe_json: Optional[Any]
    debug_info: Optional[Any]
    message: str


# ── Health Planner ────────────────────────────────────────
class HealthPlanRequest(BaseModel):
    health_issues: List[str] = []
    diet_goal: Optional[str] = None
    meal_type: Optional[str] = None
    preferences: Optional[str] = None
    avoid_ingredients: List[str] = []
    max_prep_time: Optional[int] = None


class FoodRecommendation(BaseModel):
    name: str
    reason: str
    usage: str


class HealthPlanResponse(BaseModel):
    summary: str
    recommended_foods: List[FoodRecommendation]
    avoid_foods: List[str]
    recipes: List[RecipeOut]
    lifestyle_tips: List[str]
    disclaimer: str


class LiveNutrientBenefitsResponse(BaseModel):
    nutrient_slug: str
    nutrient_name: str
    benefits: List[str]
    source: str
    source_url: Optional[str] = None
    fetched_at_utc: str
    is_live: bool
