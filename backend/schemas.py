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


# ── Analyze ────────────────────────────────────────────────
class AnalyzeResult(BaseModel):
    detected_labels: List[str]
    confidence_scores: List[float]
    matched_recipe: Optional[RecipeOut]
    message: str
