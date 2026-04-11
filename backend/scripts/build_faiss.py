"""Build FAISS index from recipes in the database and save to disk.

Usage:
  python backend/scripts/build_faiss.py
"""
from pathlib import Path
from database import SessionLocal
from models import Recipe
from rag_service import build_index_from_recipes, save_index


def build_and_save(out_index: Path, out_meta: Path):
    db = SessionLocal()
    try:
        recipes = db.query(Recipe).all()
        recipe_dicts = []
        for r in recipes:
            recipe_dicts.append({"id": r.id, "title": r.title, "ingredients": r.ingredients})

        if not recipe_dicts:
            print("No recipes found in DB to index.")
            return

        print(f"Building FAISS index for {len(recipe_dicts)} recipes...")
        build_index_from_recipes(recipe_dicts)
        save_index(str(out_index), str(out_meta))
        print(f"Saved index to {out_index} and metadata to {out_meta}")
    finally:
        db.close()


if __name__ == "__main__":
    out_index = Path(__file__).parent.parent / "faiss_index.bin"
    out_meta = Path(__file__).parent.parent / "faiss_meta.json"
    build_and_save(out_index, out_meta)
