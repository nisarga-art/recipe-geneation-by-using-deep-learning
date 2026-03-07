from sqlalchemy import Column, Integer, String, Float, Text, ARRAY, JSON, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    id       = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False)
    email    = Column(String(200), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)


class Recipe(Base):
    __tablename__ = "recipes"

    id           = Column(Integer, primary_key=True, index=True)
    title        = Column(String(200), nullable=False)
    cuisine      = Column(String(100))
    diet         = Column(String(100))
    time         = Column(String(50))
    calories     = Column(Integer)
    difficulty   = Column(String(50))
    meal         = Column(String(100))
    image        = Column(Text)
    pantry_match = Column(Integer)
    cultural     = Column(Text)

    # JSON columns — stored as JSONB in PostgreSQL
    ingredients    = Column(JSON)   # { "available": [...], "missing": [...] }
    nutrition      = Column(JSON)   # { "protein": n, "carbs": n, "fat": n, "fiber": n }
    health_benefits = Column(JSON)  # [...]
    steps           = Column(JSON)  # [...]
    similar_dishes  = Column(JSON)  # [...]

    # Clarifai-detected food labels for fuzzy matching
    food_labels = Column(JSON, default=list)   # ["dosa", "pancake", ...]
