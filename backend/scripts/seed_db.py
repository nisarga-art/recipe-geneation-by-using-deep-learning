"""Seed the database with sample recipes.

Usage:
  python backend/scripts/seed_db.py
  (ensure your .env has DATABASE_URL or set DATABASE_URL env var)
"""
import json
from pathlib import Path
from database import SessionLocal, engine, Base
from models import Recipe


def load_sample(path: Path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        existing = db.query(Recipe).first()
        if existing:
            print("DB already has recipes; skipping seed.")
            return

        sample_path = Path(__file__).parent.parent / "data" / "sample_recipes.json"
        if sample_path.exists():
            recipes = load_sample(sample_path)
        else:
            recipes = []

        to_add = []
        for r in recipes:
            rec = Recipe(
                title=r.get("title"),
                cuisine=None,
                diet=None,
                time=None,
                calories=r.get("nutrition", {}).get("calories"),
                difficulty=None,
                meal=None,
                image=None,
                pantry_match=None,
                cultural=None,
                ingredients=r.get("ingredients"),
                nutrition=r.get("nutrition"),
                health_benefits=None,
                steps=r.get("steps"),
                similar_dishes=None,
                food_labels=[i.get("name") for i in (r.get("ingredients") or [])],
            )
            to_add.append(rec)

        if to_add:
            db.add_all(to_add)
            db.commit()
            print(f"Seeded {len(to_add)} recipes.")
        else:
            print("No sample recipes found to seed.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
