const recipes = [
  {
    id: 0,
    title: "Masala Dosa",
    cuisine: "Indian",
    diet: "Vegetarian",
    time: "30 minutes",
    calories: 320,
    difficulty: "Easy",
    meal: "Breakfast",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Rameshwaram_Cafe_Dosa.jpg/330px-Rameshwaram_Cafe_Dosa.jpg",
    pantryMatch: 85,
    ingredients: {
      available: ["Rice", "Urad Dal", "Potato", "Mustard Seeds"],
      missing: ["Curry Leaves"]
    },
    nutrition: { protein: 12, carbs: 45, fat: 8, fiber: 6 },
    healthBenefits: ["Good digestion", "Low fat", "Energy rich"],
    steps: [
      "Prepare the dosa batter by soaking rice and urad dal overnight",
      "Grind the soaked ingredients into a smooth batter",
      "Ferment the batter for 8-12 hours",
      "Prepare the potato filling with boiled potatoes, onions, and spices",
      "Heat a griddle and pour a ladleful of batter",
      "Spread it thin in a circular motion",
      "Add oil around the edges and cook until crispy",
      "Place the potato filling in the center and fold",
      "Serve hot with coconut chutney and sambar"
    ],
    cultural: "Masala Dosa is a traditional South Indian breakfast served with chutney and sambar.",
    similarDishes: ["Plain Dosa", "Uttapam", "Set Dosa"]
  },
  {
    id: 1,
    title: "Paneer Butter Masala",
    cuisine: "North Indian",
    diet: "Vegetarian",
    time: "45 minutes",
    calories: 520,
    difficulty: "Medium",
    meal: "Dinner",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Shahi_panner.jpg/330px-Shahi_panner.jpg",
    pantryMatch: 72,
    ingredients: {
      available: ["Paneer", "Butter", "Tomatoes", "Onion", "Spices"],
      missing: ["Cream", "Kasuri Methi"]
    },
    nutrition: { protein: 18, carbs: 35, fat: 28, fiber: 4 },
    healthBenefits: ["High protein", "Calcium rich", "Bone health"],
    steps: [
      "Cube the paneer and lightly fry until golden",
      "Blend tomatoes and onions into a smooth puree",
      "Heat butter and sauté spices until fragrant",
      "Add the tomato-onion puree and cook for 10 minutes",
      "Stir in cream and kasuri methi",
      "Add fried paneer cubes to the gravy",
      "Simmer for 5 minutes on low heat",
      "Garnish with fresh cream and serve hot"
    ],
    cultural: "Paneer Butter Masala is a rich North Indian curry loved worldwide for its creamy tomato gravy.",
    similarDishes: ["Shahi Paneer", "Kadai Paneer", "Matar Paneer"]
  },
  {
    id: 2,
    title: "Vegetable Stir Fry",
    cuisine: "Asian",
    diet: "Vegan",
    time: "20 minutes",
    calories: 250,
    difficulty: "Easy",
    meal: "Lunch",
    image: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=600&q=80",
    pantryMatch: 80,
    ingredients: {
      available: ["Bell Peppers", "Broccoli", "Soy Sauce", "Garlic"],
      missing: ["Sesame Oil"]
    },
    nutrition: { protein: 8, carbs: 32, fat: 10, fiber: 7 },
    healthBenefits: ["Low calorie", "High fiber", "Antioxidants"],
    steps: [
      "Chop all vegetables into bite-sized pieces",
      "Heat oil in a wok over high heat",
      "Add garlic and stir fry for 30 seconds",
      "Add hard vegetables like broccoli first",
      "Toss in bell peppers and cook for 2 minutes",
      "Drizzle soy sauce and sesame oil, toss well"
    ],
    cultural: "Stir frying originated in China and is one of the quickest, most nutritious cooking techniques.",
    similarDishes: ["Fried Rice", "Chow Mein", "Pad Thai"]
  },
  {
    id: 3,
    title: "Chicken Biryani",
    cuisine: "Indian",
    diet: "Non-Vegetarian",
    time: "90 minutes",
    calories: 650,
    difficulty: "Hard",
    meal: "Lunch",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/%22Hyderabadi_Dum_Biryani%22.jpg/330px-%22Hyderabadi_Dum_Biryani%22.jpg",
    pantryMatch: 75,
    ingredients: {
      available: ["Basmati Rice", "Chicken", "Onion", "Tomatoes", "Spices"],
      missing: ["Saffron", "Kewra Water"]
    },
    nutrition: { protein: 35, carbs: 60, fat: 22, fiber: 3 },
    healthBenefits: ["High protein", "Energy rich", "Iron rich"],
    steps: [
      "Marinate chicken with yogurt and spices for 2 hours",
      "Soak basmati rice for 30 minutes",
      "Fry onions until golden brown",
      "Cook marinated chicken until half done",
      "Parboil the rice with whole spices",
      "Layer rice and chicken in a heavy-bottomed pot",
      "Sprinkle saffron milk, fried onions and ghee",
      "Seal the pot and cook on dum (low heat) for 25 minutes",
      "Gently mix and serve with raita",
      "Garnish with boiled eggs and fresh coriander"
    ],
    cultural: "Biryani traces its origins to Persia and was brought to India by the Mughals, evolving into dozens of regional varieties.",
    similarDishes: ["Pulao", "Dum Biryani", "Hyderabadi Biryani"]
  },
  {
    id: 4,
    title: "Greek Salad",
    cuisine: "Western",
    diet: "Vegetarian",
    time: "15 minutes",
    calories: 180,
    difficulty: "Easy",
    meal: "Snack",
    image: "https://images.unsplash.com/photo-1551248429-40975aa4de74?w=600&q=80",
    pantryMatch: 80,
    ingredients: {
      available: ["Cucumber", "Tomatoes", "Olives", "Olive Oil"],
      missing: ["Feta Cheese"]
    },
    nutrition: { protein: 6, carbs: 15, fat: 12, fiber: 4 },
    healthBenefits: ["Heart healthy", "Low carb", "Antioxidants"],
    steps: [
      "Chop cucumber, tomatoes, and red onion into chunks",
      "Add Kalamata olives and crumbled feta cheese",
      "Drizzle generously with extra virgin olive oil",
      "Season with oregano, salt, and pepper and toss gently"
    ],
    cultural: "Greek Salad, known as Horiatiki, is a staple of Mediterranean cuisine celebrated for its simplicity and freshness.",
    similarDishes: ["Caesar Salad", "Caprese Salad", "Fattoush"]
  },
  {
    id: 5,
    title: "Chocolate Lava Cake",
    cuisine: "Western",
    diet: "Vegetarian",
    time: "25 minutes",
    calories: 450,
    difficulty: "Medium",
    meal: "Dessert",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80",
    pantryMatch: 80,
    ingredients: {
      available: ["Dark Chocolate", "Butter", "Eggs", "Sugar"],
      missing: ["Heavy Cream"]
    },
    nutrition: { protein: 8, carbs: 52, fat: 24, fiber: 3 },
    healthBenefits: ["Mood booster", "Antioxidants", "Energy rich"],
    steps: [
      "Preheat oven to 220°C and butter the ramekins",
      "Melt dark chocolate and butter together",
      "Whisk eggs, egg yolks, and sugar until pale",
      "Fold the chocolate mixture into the egg mixture",
      "Sift in flour and gently fold",
      "Pour batter into ramekins and refrigerate for 20 minutes",
      "Bake for exactly 12 minutes and invert onto plates"
    ],
    cultural: "Chocolate Lava Cake was invented in New York in 1987 by chef Jean-Georges Vongerichten and became a global dessert icon.",
    similarDishes: ["Chocolate Soufflé", "Brownie", "Chocolate Fondant"]
  },
  {
    id: 6,
    title: "Vegetable Spring Rolls",
    cuisine: "Asian",
    diet: "Vegan",
    time: "35 minutes",
    calories: 280,
    difficulty: "Medium",
    meal: "Snack",
    image: "https://images.unsplash.com/photo-1548943487-a2e4e43b4853?w=600&q=80",
    pantryMatch: 67,
    ingredients: {
      available: ["Cabbage", "Carrots", "Spring Roll Wrappers", "Soy Sauce"],
      missing: ["Bean Sprouts", "Rice Noodles"]
    },
    nutrition: { protein: 7, carbs: 38, fat: 11, fiber: 5 },
    healthBenefits: ["Low calorie", "High fiber", "Vitamins"],
    steps: [
      "Shred cabbage and julienne carrots",
      "Stir fry vegetables with soy sauce until tender",
      "Soak rice noodles and mix with vegetables",
      "Place filling on each spring roll wrapper",
      "Roll tightly, sealing edges with a flour paste",
      "Heat oil in a deep pan to 175°C",
      "Fry spring rolls until golden and crispy"
    ],
    cultural: "Spring rolls originated in China and are traditionally eaten during the Spring Festival to symbolize wealth and prosperity.",
    similarDishes: ["Egg Rolls", "Summer Rolls", "Lumpia"]
  },
  {
    id: 7,
    title: "Quinoa Buddha Bowl",
    cuisine: "Western",
    diet: "Vegan",
    time: "30 minutes",
    calories: 380,
    difficulty: "Easy",
    meal: "Lunch",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80",
    pantryMatch: 80,
    ingredients: {
      available: ["Quinoa", "Chickpeas", "Spinach", "Avocado"],
      missing: ["Tahini"]
    },
    nutrition: { protein: 16, carbs: 48, fat: 14, fiber: 10 },
    healthBenefits: ["High protein", "High fiber", "Diabetic friendly"],
    steps: [
      "Rinse and cook quinoa in vegetable broth for extra flavor",
      "Roast chickpeas with olive oil and spices at 200°C for 20 minutes",
      "Massage spinach with a pinch of salt and lemon juice",
      "Slice avocado and arrange all ingredients over quinoa",
      "Whisk tahini with lemon juice, garlic, and water for dressing",
      "Drizzle dressing over the bowl and serve"
    ],
    cultural: "Buddha Bowls represent balanced, nourishing meals popularized in the global wellness food movement for their wholesome goodness.",
    similarDishes: ["Poke Bowl", "Grain Bowl", "Açaí Bowl"]
  },
  {
    id: 8,
    title: "Upma",
    cuisine: "Indian",
    diet: "Vegan",
    time: "20 minutes",
    calories: 240,
    difficulty: "Easy",
    meal: "Breakfast",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/A_photo_of_Upma.jpg/330px-A_photo_of_Upma.jpg",
    pantryMatch: 90,
    ingredients: {
      available: ["Semolina", "Onion", "Green Chili", "Mustard Seeds", "Curry Leaves"],
      missing: ["Cashews"]
    },
    nutrition: { protein: 6, carbs: 36, fat: 7, fiber: 3 },
    healthBenefits: ["Light meal", "Quick breakfast", "Comfort food"],
    steps: [
      "Dry roast semolina lightly and keep aside",
      "Temper mustard seeds and curry leaves",
      "Saute onion and green chili",
      "Add hot water, then semolina slowly with stirring",
      "Cook until fluffy and serve hot"
    ],
    cultural: "Upma is a classic South Indian breakfast prepared in many Indian homes.",
    similarDishes: ["Poha", "Pongal", "Sheera"]
  },
  {
    id: 9,
    title: "Rajma Chawal",
    cuisine: "North Indian",
    diet: "Vegetarian",
    time: "50 minutes",
    calories: 460,
    difficulty: "Medium",
    meal: "Lunch",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Rajma_Masala_%2832081557778%29.jpg/330px-Rajma_Masala_%2832081557778%29.jpg",
    pantryMatch: 84,
    ingredients: {
      available: ["Kidney Beans", "Rice", "Onion", "Tomato", "Spices"],
      missing: ["Kasuri Methi"]
    },
    nutrition: { protein: 15, carbs: 62, fat: 10, fiber: 12 },
    healthBenefits: ["Plant protein", "High fiber", "Iron rich"],
    steps: [
      "Cook soaked rajma until soft",
      "Prepare onion tomato masala",
      "Simmer rajma in masala",
      "Cook rice separately",
      "Serve hot"
    ],
    cultural: "Rajma chawal is a comfort lunch meal in North India.",
    similarDishes: ["Chole Chawal", "Dal Chawal", "Lobia Curry"]
  },
  {
    id: 10,
    title: "Palak Paneer",
    cuisine: "North Indian",
    diet: "Vegetarian",
    time: "40 minutes",
    calories: 390,
    difficulty: "Medium",
    meal: "Dinner",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Palakpaneer_Rayagada_Odisha_0009.jpg/330px-Palakpaneer_Rayagada_Odisha_0009.jpg",
    pantryMatch: 82,
    ingredients: {
      available: ["Spinach", "Paneer", "Onion", "Tomato", "Spices"],
      missing: ["Cream"]
    },
    nutrition: { protein: 21, carbs: 18, fat: 24, fiber: 7 },
    healthBenefits: ["Calcium rich", "Iron rich", "High protein"],
    steps: [
      "Blanch spinach and make puree",
      "Cook onion tomato masala",
      "Add spinach puree and simmer",
      "Add paneer cubes and cook briefly",
      "Serve with roti"
    ],
    cultural: "Palak paneer is a classic Punjabi dinner curry.",
    similarDishes: ["Saag Paneer", "Matar Paneer", "Shahi Paneer"]
  },
  {
    id: 11,
    title: "Roasted Chickpea Chaat",
    cuisine: "Indian",
    diet: "Vegan",
    time: "15 minutes",
    calories: 210,
    difficulty: "Easy",
    meal: "Snack",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Dahi_puri%2C_Doi_phuchka.jpg/330px-Dahi_puri%2C_Doi_phuchka.jpg",
    pantryMatch: 92,
    ingredients: {
      available: ["Chickpeas", "Onion", "Tomato", "Cucumber", "Lemon", "Spices"],
      missing: []
    },
    nutrition: { protein: 10, carbs: 26, fat: 6, fiber: 8 },
    healthBenefits: ["High fiber", "Protein snack", "Low calorie"],
    steps: [
      "Roast chickpeas with spices",
      "Combine chopped vegetables",
      "Mix chickpeas and vegetables",
      "Add lemon and chaat masala",
      "Serve fresh"
    ],
    cultural: "Chaat style snacks are popular across India.",
    similarDishes: ["Bhel Puri", "Sprout Salad", "Masala Corn"]
  }
];

export default recipes;
