from typing import Optional, List, Any

from pydantic import BaseModel, EmailStr, field_validator, Field, ConfigDict


# ── Auth ───────────────────────────────────────────────────
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

    @field_validator("password")
    def password_strength(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v

    @field_validator("username")
    def username_length(cls, v: str) -> str:
        v2 = v.strip()
        if len(v2) < 2:
            raise ValueError("Username must be at least 2 characters")
        return v2

    model_config = ConfigDict(from_attributes=True)


class UserOut(BaseModel):
    id: int
    username: str
    email: str

    model_config = ConfigDict(from_attributes=True)


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

    model_config = ConfigDict(from_attributes=True)


# ── Analyze ────────────────────────────────────────────────
class AnalyzeResult(BaseModel):
    detected_labels: List[str] = Field(default_factory=list)
    confidence_scores: List[float] = Field(default_factory=list)
    matched_recipe: Optional[RecipeOut] = None
    generated_recipe: Optional[str] = None
    generated_recipe_json: Optional[Any] = None
    debug_info: Optional[Any] = None
    message: Optional[str] = None


# ── Health Planner ────────────────────────────────────────
class HealthPlanRequest(BaseModel):
    health_issues: List[str] = Field(default_factory=list)
    diet_goal: Optional[str] = None
    meal_type: Optional[str] = None
    preferences: Optional[str] = None
    avoid_ingredients: List[str] = Field(default_factory=list)
    max_prep_time: Optional[int] = None


class FoodRecommendation(BaseModel):
    name: str
    reason: str
    usage: str


class HealthPlanResponse(BaseModel):
    summary: str
    recommended_foods: List[FoodRecommendation] = Field(default_factory=list)
    avoid_foods: List[str] = Field(default_factory=list)
    recipes: List[RecipeOut] = Field(default_factory=list)
    lifestyle_tips: List[str] = Field(default_factory=list)
    disclaimer: str


class LiveNutrientBenefitsResponse(BaseModel):
    nutrient_slug: str
    nutrient_name: str
    benefits: List[str] = Field(default_factory=list)
    source: str
    source_url: Optional[str] = None
    fetched_at_utc: str
    is_live: bool
