import os
import shutil
from icrawler.builtin import BingImageCrawler
import subprocess

# ----------------------------
# STEP 1: DEFINE CLASSES
# ----------------------------
dishes = {
    "Pizza": "cheese pizza top view",
    "Burger": "burger cheese lettuce close up",
    "Dosa": "crispy dosa south indian plate",
    "Idli": "idli sambar chutney breakfast",
    "Biryani": "chicken biryani rice top view",
    "Pasta": "white sauce pasta bowl",
    "Cake": "chocolate cake dessert slice",
    "Samosa": "crispy samosa indian snack",
    "Fried_Rice": "veg fried rice bowl",
    "Noodles": "chowmein noodles street food"
}

DATASET_PATH = "backend/data/classifier"

# ----------------------------
# STEP 2: DOWNLOAD DATASET
# ----------------------------
def download_images():
    for dish, keyword in dishes.items():
        folder = os.path.join(DATASET_PATH, dish)
        os.makedirs(folder, exist_ok=True)

        print(f"\n📥 Downloading {dish}...")

        crawler = BingImageCrawler(storage={"root_dir": folder})
        crawler.crawl(keyword=keyword, max_num=80)

    print("\n✅ Dataset download completed!")

# ----------------------------
# STEP 3: BASIC CLEANUP
# ----------------------------
def clean_dataset():
    print("\n🧹 Cleaning dataset...")

    for dish in os.listdir(DATASET_PATH):
        folder = os.path.join(DATASET_PATH, dish)

        if not os.path.isdir(folder):
            continue

        seen_sizes = set()

        for file in os.listdir(folder):
            file_path = os.path.join(folder, file)

            try:
                size = os.path.getsize(file_path)

                # remove duplicates by size (simple auto-clean)
                if size in seen_sizes:
                    os.remove(file_path)
                else:
                    seen_sizes.add(size)

            except:
                pass

    print("✅ Cleaning completed!")

# ----------------------------
# STEP 4: TRAIN MODEL
# ----------------------------
def train_model():
    print("\n🚀 Training model...")

    subprocess.run([
        "python",
        "-m",
        "backend.dish_classifier",
        "backend/data/classifier",
        "--epochs", "10",
        "--batch-size", "16",
        "--log", "backend/logs/train.csv"
    ])

# ----------------------------
# RUN PIPELINE
# ----------------------------
if __name__ == "__main__":
    download_images()
    clean_dataset()
    train_model()

    print("\n🎉 FULL PIPELINE COMPLETED!")