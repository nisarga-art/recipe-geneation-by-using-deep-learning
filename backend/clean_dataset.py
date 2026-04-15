import os
from PIL import Image

BASE_DIR = "data/classifier"

MAX_IMAGES_PER_CLASS = 30   # limit per class
MIN_IMAGES = 20             # remove weak classes


def is_valid_image(path):
    try:
        with Image.open(path) as img:
            img.verify()
        return True
    except:
        return False


def clean_dataset():
    print("🧹 Cleaning dataset (balanced + optimized)...")

    for dish in os.listdir(BASE_DIR):
        dish_path = os.path.join(BASE_DIR, dish)

        if not os.path.isdir(dish_path):
            continue

        print(f"\n🔍 Processing {dish}...")

        images = os.listdir(dish_path)
        valid_images = []

        # ✅ Step 1: Remove corrupt images
        for img_name in images:
            img_path = os.path.join(dish_path, img_name)

            if not is_valid_image(img_path):
                print(f"⚠ Removing corrupt image: {img_name}")
                os.remove(img_path)
            else:
                valid_images.append(img_name)

        # ❌ Step 2: Remove weak classes
        if len(valid_images) < MIN_IMAGES:
            print(f"❌ Removing {dish} (only {len(valid_images)} images)")

            for img_name in valid_images:
                os.remove(os.path.join(dish_path, img_name))

            os.rmdir(dish_path)
            continue

        # ✂ Step 3: Limit images per class
        if len(valid_images) > MAX_IMAGES_PER_CLASS:
            print(f"✂ Limiting {dish} to {MAX_IMAGES_PER_CLASS} images")

            for img_name in valid_images[MAX_IMAGES_PER_CLASS:]:
                os.remove(os.path.join(dish_path, img_name))

        print(f"✅ {dish}: {min(len(valid_images), MAX_IMAGES_PER_CLASS)} images")

    print("\n🎉 Dataset cleaned + balanced successfully!")


if __name__ == "__main__":
    clean_dataset()