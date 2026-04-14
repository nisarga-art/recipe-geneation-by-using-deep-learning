"""
Tune scoring weights for match_recipe using labeled test images.

Usage:
  python backend/scripts/tune_scoring.py --images-dir path/to/images --annotations annotations.json

`annotations.json` should be a JSON object mapping image file names (relative to images-dir)
to the canonical dish name expected (matching values in dish_map.json canonical names).

Example:
{
  "img1.jpg": "paneer butter masala",
  "img2.jpg": "chicken curry"
}

Options:
  --grid-search : perform a grid search over sensible weight ranges and report best config
  --out csv     : output per-image results to CSV file

Note: this script calls the same `vision_service` used by the app. Make sure backend deps are installed.
"""

import argparse
import json
import csv
from pathlib import Path
from statistics import mean

from vision_service import analyze_image_bytes, match_recipe, get_image_caption, _load_dish_map


def load_annotations(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def evaluate(images_dir: Path, annotations: dict, weights: dict | None = None):
    results = []
    # build a fake in-memory DB from dish_map for matching
    dish_map = _load_dish_map()
    # create fake recipe objects
    class FakeRecipe:
        def __init__(self, title, labels):
            self.title = title
            self.food_labels = labels

    fake_recipes = []
    # dish_map is variant->canonical; invert to canonical->variants
    canon_to_variants = {}
    for variant, canon in dish_map.items():
        canon_to_variants.setdefault(canon, set()).add(variant)
    for canon, variants in canon_to_variants.items():
        fake_recipes.append(FakeRecipe(canon, list(variants)))

    class FakeQuery:
        def __init__(self, items):
            self._items = items
        def all(self):
            return self._items

    class FakeDB:
        def __init__(self, items):
            self._items = items
        def query(self, _):
            return FakeQuery(self._items)

    fake_db = FakeDB(fake_recipes)

    for fname, expected in annotations.items():
        img_path = images_dir / fname
        if not img_path.exists():
            results.append({"file": fname, "error": "missing file"})
            continue
        image_bytes = img_path.read_bytes()
        labels = analyze_image_bytes(image_bytes)
        # call match_recipe against the fake DB built from dish_map
        matched, score = match_recipe(labels, fake_db, weights=weights)
        top_label = labels[0].get("name") if labels and isinstance(labels[0], dict) else (labels[0] if labels else None)
        results.append({
            "file": fname,
            "expected": expected,
            "top_label": top_label,
            "matched": getattr(matched, "title", None) if matched else None,
            "score": score,
        })
    # compute basic stats
    matched_count = sum(1 for r in results if r.get("matched") and r.get("expected") and r.get("matched") and r.get("expected") in str(r.get("matched")).lower())
    valid = [r for r in results if r.get("matched")]
    avg_score = mean([r["score"] for r in valid]) if valid else 0.0
    accuracy = matched_count / len(annotations) if annotations else 0.0
    return results, {"accuracy": accuracy, "avg_score": avg_score}


def grid_search(images_dir: Path, annotations: dict):
    best = None
    best_cfg = None
    # small grid ranges
    exact_vals = [1.0, 2.0, 3.0, 4.0]
    partial_vals = [0.5, 1.0, 1.5]
    title_vals = [1.0, 2.0, 3.0]
    for ex in exact_vals:
        for pa in partial_vals:
            for ti in title_vals:
                weights = {"exact": ex, "partial": pa, "title": ti}
                _, stats = evaluate(images_dir, annotations, weights=weights)
                score = stats["accuracy"] + stats["avg_score"] * 0.01
                if best is None or score > best:
                    best = score
                    best_cfg = {**weights, **stats}
    return best_cfg


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--images-dir", required=True)
    parser.add_argument("--annotations", required=True)
    parser.add_argument("--grid-search", action="store_true")
    parser.add_argument("--out", default=None, help="CSV file to write per-image results")
    args = parser.parse_args()

    images_dir = Path(args.images_dir)
    annotations = load_annotations(Path(args.annotations))

    if args.grid_search:
        print("Running grid search...")
        best = grid_search(images_dir, annotations)
        print("Best config:", json.dumps(best, indent=2))
        return

    results, stats = evaluate(images_dir, annotations)
    print("Stats:", stats)
    if args.out:
        with open(args.out, "w", newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=["file", "expected", "top_label", "matched", "score", "error"], extrasaction='ignore')
            writer.writeheader()
            for r in results:
                writer.writerow(r)


if __name__ == "__main__":
    main()
