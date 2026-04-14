from icrawler.builtin import BingImageCrawler
import os

# ✅ Correct dictionary format
new_dishes = {
    "Upma": "upma south indian breakfast",
    "Poha": "poha indian breakfast",
    "Vada": "medu vada south indian",
    "Samosa": "samosa indian snack",
    "Pav_Bhaji": "pav bhaji street food",
    "Rajma": "rajma curry indian",
    "Palak_Paneer": "palak paneer curry",
    "Kadai_Paneer": "kadai paneer indian dish",
    "Butter_Chicken": "butter chicken curry",
    "Tandoori_Chicken": "tandoori chicken grilled",
    "Fish_Curry": "fish curry indian",
    "Egg_Curry": "egg curry indian",
    "Omelette": "omelette breakfast",
    "Dhokla": "dhokla gujarati snack",
    "Kachori": "kachori indian snack",
    "Pakora": "pakora fritters indian",
    "Spring_Rolls": "spring rolls snack",
    "Manchurian": "gobi manchurian",
    "Momos": "momos dumplings",
    "Hot_Dog": "hot dog fast food",
    "Donut": "donut dessert",
    "Brownie": "chocolate brownie",
    "Cupcake": "cupcake dessert",
    "Milkshake": "milkshake drink",
    "Juice": "fruit juice glass",
    "Salad": "vegetable salad bowl",
    "Soup": "soup bowl hot",
    "Steak": "steak grilled",
    "Sushi": "sushi japanese food",
    "Tacos": "tacos mexican food"
}

base_dir = "data/classifier"

for dish, keyword in new_dishes.items():
    folder_path = os.path.join(base_dir, dish)

    # Skip existing folders
    if os.path.exists(folder_path):
        print(f"⚠️ Skipping {dish} (already exists)")
        continue

    os.makedirs(folder_path, exist_ok=True)

    print(f"📥 Downloading {dish} images...")

    crawler = BingImageCrawler(
        downloader_threads=4,
        storage={'root_dir': folder_path}
    )

    crawler.crawl(
        keyword=keyword,
        max_num=10
    )

print("\n✅ New dishes downloaded successfully!")