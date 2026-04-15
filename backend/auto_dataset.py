from icrawler.builtin import BingImageCrawler
import os

print("🚀 Starting dataset download...")

dishes = {

    # South Indian
    "Idli": "idli south indian breakfast",
    "Dosa": "masala dosa crispy",
    "Vada": "medu vada south indian",
    "Upma": "upma breakfast dish",
    "Sambar_Rice": "sambar rice south indian",

    # North Indian
    "Paneer_Butter_Masala": "paneer butter masala curry",
    "Shahi_Paneer": "shahi paneer gravy",
    "Chole_Bhature": "chole bhature plate",
    "Dal_Tadka": "dal tadka indian",
    "Rajma_Chawal": "rajma chawal rice",

    # Rice
    "Biryani": "chicken biryani top view",
    "Fried_Rice": "veg fried rice",
    "Jeera_Rice": "jeera rice indian",
    "Pulao": "vegetable pulao",

    # Snacks
    "Pav_Bhaji": "pav bhaji street food",
    "Samosa": "samosa snack",
    "Pakora": "pakora fritters",
    "Panipuri": "pani puri golgappa",
    "Spring_Roll": "veg spring roll fried",

    # Fast Food
    "Pizza": "cheese pizza top view",
    "Burger": "burger with fries",
    "Sandwich": "veg sandwich",
    "Fries": "french fries crispy",

    # Non-Veg
    "Butter_Chicken": "butter chicken curry",
    "Chicken_Curry": "chicken curry indian",
    "Fish_Fry": "fish fry crispy",
    "Grilled_Chicken": "grilled chicken",

    # Desserts
    "Gulab_Jamun": "gulab jamun dessert",
    "Jalebi": "jalebi sweet",
    "Cake": "chocolate cake slice",
    "Ice_Cream": "ice cream scoop",
    "Rasgulla": "rasgulla sweet",

    # Drinks
    "Tea": "indian chai tea",
    "Coffee": "coffee cup",
    "Lassi": "lassi drink",
    "Juice": "fruit juice glass",

    # International
    "Pasta": "pasta italian",
    "Noodles": "noodles bowl",
    "Sushi": "sushi plate",
    "Tacos": "tacos mexican"
}

base_dir = "data/classifier"

for dish, keyword in dishes.items():
    folder = os.path.join(base_dir, dish)
    os.makedirs(folder, exist_ok=True)

    print(f"⬇ Downloading {dish}...")

    crawler = BingImageCrawler(storage={"root_dir": folder})
    crawler.crawl(
        keyword=keyword,
        max_num=100
    )

print("✅ All images downloaded successfully!")