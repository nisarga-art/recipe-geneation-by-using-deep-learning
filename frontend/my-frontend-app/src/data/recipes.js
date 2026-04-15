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
      available: [
        "Dosa batter (fermented rice-urad batter)",
        "Potatoes",
        "Onion",
        "Mustard seeds",
        "Curry leaves",
        "Green chilies",
        "Turmeric",
        "Oil or ghee"
      ],
      missing: ["Chana dal", "Fresh coriander"]
    },
    nutrition: { protein: 12, carbs: 45, fat: 8, fiber: 6 },
    healthBenefits: ["Good digestion", "Low fat", "Energy rich"],
    steps: [
      "Boil potatoes until fork tender, peel, and mash coarsely.",
      "Heat oil, crackle mustard seeds, then saute chana dal, onions, curry leaves, and green chilies.",
      "Add turmeric, salt, and mashed potatoes; cook 3 to 4 minutes and finish with coriander.",
      "Heat a cast-iron tawa, spread a ladle of batter in a thin circle, and drizzle a little oil around edges.",
      "Cook until the base turns golden and crisp; do not flip for classic dosa texture.",
      "Place potato masala in the center, fold, and serve immediately with chutney and sambar."
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
      available: [
        "Paneer cubes",
        "Tomatoes",
        "Onion",
        "Ginger-garlic paste",
        "Butter",
        "Fresh cream",
        "Kashmiri chili powder",
        "Garam masala"
      ],
      missing: ["Kasuri methi", "Honey"]
    },
    nutrition: { protein: 18, carbs: 35, fat: 28, fiber: 4 },
    healthBenefits: ["High protein", "Calcium rich", "Bone health"],
    steps: [
      "Saute onions, tomatoes, and ginger-garlic paste in butter until soft.",
      "Cool slightly and blend to a smooth gravy base.",
      "Return puree to pan, add chili powder, coriander powder, and salt; cook until butter separates.",
      "Add a splash of water to adjust consistency and simmer 5 minutes.",
      "Add paneer cubes, cream, kasuri methi, and a pinch of garam masala.",
      "Simmer gently for 2 to 3 minutes and serve with naan or jeera rice."
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
      available: [
        "Broccoli florets",
        "Bell peppers",
        "Carrot",
        "French beans",
        "Garlic",
        "Soy sauce",
        "Sesame oil",
        "Black pepper"
      ],
      missing: ["Spring onion", "Toasted sesame seeds"]
    },
    nutrition: { protein: 8, carbs: 32, fat: 10, fiber: 7 },
    healthBenefits: ["Low calorie", "High fiber", "Antioxidants"],
    steps: [
      "Cut all vegetables into similar bite-size pieces for even cooking.",
      "Heat a wok until very hot, add sesame oil, then add garlic.",
      "Add hard vegetables first (carrot, beans, broccoli) and toss on high heat.",
      "Add bell peppers and stir-fry 2 more minutes so they stay crisp.",
      "Season with soy sauce, pepper, and a small splash of water.",
      "Finish with spring onion and sesame seeds; serve hot."
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
      available: [
        "Basmati rice",
        "Chicken pieces",
        "Yogurt",
        "Onions",
        "Ginger-garlic paste",
        "Whole spices (cardamom, cloves, bay leaf)",
        "Biryani masala",
        "Mint and coriander"
      ],
      missing: ["Saffron", "Kewra water", "Fried onions"]
    },
    nutrition: { protein: 35, carbs: 60, fat: 22, fiber: 3 },
    healthBenefits: ["High protein", "Energy rich", "Iron rich"],
    steps: [
      "Marinate chicken with yogurt, ginger-garlic paste, biryani masala, and salt for at least 1 hour.",
      "Soak basmati rice 30 minutes, then parboil with whole spices until 70% cooked.",
      "Fry sliced onions until deep golden; reserve half for layering.",
      "Cook marinated chicken in a heavy pot until it is mostly done and masala thickens.",
      "Layer chicken masala, rice, fried onions, mint, coriander, and saffron milk.",
      "Seal pot and cook on dum (low heat) for 20 to 25 minutes.",
      "Rest 10 minutes, fluff gently, and serve with raita."
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
      available: [
        "Cucumber",
        "Tomatoes",
        "Red onion",
        "Kalamata olives",
        "Feta cheese",
        "Extra virgin olive oil",
        "Dried oregano",
        "Lemon juice"
      ],
      missing: ["Red wine vinegar"]
    },
    nutrition: { protein: 6, carbs: 15, fat: 12, fiber: 4 },
    healthBenefits: ["Heart healthy", "Low carb", "Antioxidants"],
    steps: [
      "Chop cucumber, tomatoes, and onion into medium chunks.",
      "Combine vegetables and olives in a wide bowl.",
      "Whisk olive oil, lemon juice, oregano, black pepper, and a little salt.",
      "Pour dressing over salad and toss lightly.",
      "Top with feta chunks and a final drizzle of olive oil.",
      "Serve immediately while vegetables are crisp."
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
      available: [
        "Dark chocolate",
        "Unsalted butter",
        "Whole eggs",
        "Egg yolks",
        "Caster sugar",
        "All-purpose flour",
        "Vanilla extract",
        "Butter and cocoa for ramekins"
      ],
      missing: ["Whipping cream", "Ice cream for serving"]
    },
    nutrition: { protein: 8, carbs: 52, fat: 24, fiber: 3 },
    healthBenefits: ["Mood booster", "Antioxidants", "Energy rich"],
    steps: [
      "Preheat oven to 220 C and grease ramekins with butter and cocoa.",
      "Melt chocolate and butter together over a double boiler.",
      "Whisk eggs, yolks, and sugar until pale and slightly thick.",
      "Fold melted chocolate into egg mixture gently.",
      "Sift flour and fold just until combined; do not overmix.",
      "Fill ramekins three-fourths full and chill 10 minutes.",
      "Bake 10 to 12 minutes until edges set and center remains soft.",
      "Unmold carefully and serve immediately."
    ],
    cultural: "Chocolate Lava Cake was invented in New York in 1987 by chef Jean-Georges Vongerichten and became a global dessert icon.",
    similarDishes: ["Chocolate Souffle", "Brownie", "Chocolate Fondant"]
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
      available: [
        "Spring roll wrappers",
        "Cabbage",
        "Carrot",
        "Bell pepper",
        "Spring onion",
        "Soy sauce",
        "Black pepper",
        "Oil for frying"
      ],
      missing: ["Bean sprouts", "Rice noodles"]
    },
    nutrition: { protein: 7, carbs: 38, fat: 11, fiber: 5 },
    healthBenefits: ["Low calorie", "High fiber", "Vitamins"],
    steps: [
      "Shred all vegetables thinly so the filling cooks quickly.",
      "Heat a little oil in a wok and stir-fry garlic and spring onion.",
      "Add vegetables, soy sauce, pepper, and cook on high heat until just tender.",
      "Cool filling fully before rolling to prevent soggy wrappers.",
      "Place filling on wrapper, fold sides inward, and roll tightly with slurry seal.",
      "Deep fry in medium-hot oil until crisp and golden.",
      "Drain and serve with chili-garlic dip."
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
      available: [
        "Quinoa",
        "Chickpeas",
        "Spinach",
        "Avocado",
        "Cucumber",
        "Cherry tomatoes",
        "Lemon juice",
        "Olive oil"
      ],
      missing: ["Tahini", "Pumpkin seeds"]
    },
    nutrition: { protein: 16, carbs: 48, fat: 14, fiber: 10 },
    healthBenefits: ["High protein", "High fiber", "Diabetic friendly"],
    steps: [
      "Rinse quinoa and cook in water or vegetable stock until fluffy.",
      "Roast chickpeas with olive oil, paprika, and salt until crisp.",
      "Prep raw vegetables and slice avocado just before serving.",
      "Whisk tahini, lemon juice, garlic, water, and salt into a dressing.",
      "Assemble bowl with quinoa base and arrange toppings by sections.",
      "Drizzle dressing and finish with seeds for crunch."
    ],
    cultural: "Buddha Bowls represent balanced, nourishing meals popularized in the global wellness food movement for their wholesome goodness.",
    similarDishes: ["Poke Bowl", "Grain Bowl", "Acai Bowl"]
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
      available: [
        "Semolina (rava)",
        "Onion",
        "Green chili",
        "Mustard seeds",
        "Curry leaves",
        "Ginger",
        "Oil or ghee",
        "Hot water"
      ],
      missing: ["Cashews", "Lemon juice"]
    },
    nutrition: { protein: 6, carbs: 36, fat: 7, fiber: 3 },
    healthBenefits: ["Light meal", "Quick breakfast", "Comfort food"],
    steps: [
      "Dry roast semolina on low heat until aromatic; keep aside.",
      "Heat oil, crackle mustard seeds, then saute ginger, chili, curry leaves, and onions.",
      "Add optional vegetables and cook briefly.",
      "Pour hot water and salt; bring to a boil.",
      "Add roasted semolina gradually while stirring continuously.",
      "Cook covered for 2 to 3 minutes, fluff, and finish with lemon juice."
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
      available: [
        "Kidney beans (soaked)",
        "Basmati rice",
        "Onion",
        "Tomato puree",
        "Ginger-garlic paste",
        "Cumin seeds",
        "Rajma masala",
        "Coriander leaves"
      ],
      missing: ["Kasuri methi", "Bay leaf"]
    },
    nutrition: { protein: 15, carbs: 62, fat: 10, fiber: 12 },
    healthBenefits: ["Plant protein", "High fiber", "Iron rich"],
    steps: [
      "Pressure cook soaked rajma with salt until soft and creamy.",
      "Cook rice separately until grains are fluffy and separate.",
      "Saute cumin, onions, and ginger-garlic paste until golden.",
      "Add tomato puree and spices; cook until oil separates.",
      "Add cooked rajma with its stock and simmer 15 minutes.",
      "Mash a small portion for body, garnish with coriander, and serve with rice."
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
      available: [
        "Spinach",
        "Paneer",
        "Onion",
        "Tomato",
        "Ginger-garlic paste",
        "Green chili",
        "Garam masala",
        "Cream"
      ],
      missing: ["Kasuri methi"]
    },
    nutrition: { protein: 21, carbs: 18, fat: 24, fiber: 7 },
    healthBenefits: ["Calcium rich", "Iron rich", "High protein"],
    steps: [
      "Blanch spinach for 2 minutes, shock in cold water, and blend to smooth puree.",
      "Lightly pan-fry paneer cubes and keep in warm water to stay soft.",
      "Saute onions, ginger-garlic, and green chili until translucent.",
      "Add tomatoes and cook down to a thick masala.",
      "Stir in spinach puree, season, and simmer gently 5 minutes.",
      "Add paneer, cream, and garam masala; cook 2 minutes and serve."
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
      available: [
        "Boiled or roasted chickpeas",
        "Onion",
        "Tomato",
        "Cucumber",
        "Green chili",
        "Lemon juice",
        "Chaat masala",
        "Coriander"
      ],
      missing: ["Pomegranate seeds"]
    },
    nutrition: { protein: 10, carbs: 26, fat: 6, fiber: 8 },
    healthBenefits: ["High fiber", "Protein snack", "Low calorie"],
    steps: [
      "Toss chickpeas with oil, chili powder, and roast until lightly crisp.",
      "Finely chop onion, tomato, cucumber, and coriander.",
      "Combine vegetables and chickpeas in a mixing bowl.",
      "Season with chaat masala, roasted cumin powder, salt, and lemon juice.",
      "Mix just before serving to keep textures fresh.",
      "Top with coriander and pomegranate seeds."
    ],
    cultural: "Chaat style snacks are popular across India.",
    similarDishes: ["Bhel Puri", "Sprout Salad", "Masala Corn"]
  },
  {
    id: 12,
    title: "Butter Chicken",
    cuisine: "North Indian",
    diet: "Non-Vegetarian",
    time: "50 minutes",
    calories: 540,
    difficulty: "Medium",
    meal: "Dinner",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Butter_chicken_%282%29.jpg/330px-Butter_chicken_%282%29.jpg",
    pantryMatch: 70,
    ingredients: {
      available: [
        "Boneless chicken",
        "Yogurt",
        "Tomato puree",
        "Onion",
        "Butter",
        "Fresh cream",
        "Ginger-garlic paste",
        "Kashmiri chili powder"
      ],
      missing: ["Kasuri methi", "Honey"]
    },
    nutrition: { protein: 28, carbs: 20, fat: 34, fiber: 2 },
    healthBenefits: ["High protein", "Iron rich"],
    steps: [
      "Marinate chicken in yogurt, ginger-garlic, chili powder, and salt.",
      "Grill or pan-sear chicken pieces until lightly charred and almost cooked.",
      "Saute onions, add tomato puree and spices, and cook until thick.",
      "Blend gravy smooth and return to pan with butter.",
      "Add chicken, cream, kasuri methi, and simmer 8 to 10 minutes.",
      "Finish with butter swirl and serve hot with naan."
    ],
    cultural: "A popular Mughlai dish enjoyed globally.",
    similarDishes: ["Paneer Butter Masala", "Chicken Tikka Masala"]
  },
  {
    id: 13,
    title: "Tandoori Chicken",
    cuisine: "North Indian",
    diet: "Non-Vegetarian",
    time: "60 minutes",
    calories: 430,
    difficulty: "Medium",
    meal: "Dinner",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Tandoori_Chicken_%282%29.jpg/330px-Tandoori_Chicken_%282%29.jpg",
    pantryMatch: 65,
    ingredients: {
      available: [
        "Chicken leg quarters",
        "Thick yogurt",
        "Ginger-garlic paste",
        "Kashmiri chili powder",
        "Turmeric",
        "Garam masala",
        "Lemon juice",
        "Mustard oil"
      ],
      missing: ["Kasuri methi", "Chaat masala"]
    },
    nutrition: { protein: 34, carbs: 6, fat: 26, fiber: 1 },
    healthBenefits: ["High protein"],
    steps: [
      "Make deep slits in chicken for better marinade penetration.",
      "Rub with lemon juice and salt; rest 15 minutes.",
      "Mix yogurt, spices, ginger-garlic paste, and mustard oil.",
      "Coat chicken thoroughly and marinate at least 2 hours.",
      "Roast in a hot oven or grill until charred outside and cooked through.",
      "Brush with butter and finish with chaat masala before serving."
    ],
    cultural: "Classic Punjabi dish cooked in a tandoor or oven.",
    similarDishes: ["Chicken Tikka", "Seekh Kebab"]
  },
  {
    id: 14,
    title: "Samosa",
    cuisine: "Indian",
    diet: "Vegetarian",
    time: "40 minutes",
    calories: 260,
    difficulty: "Medium",
    meal: "Snack",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Samosa_%28India%29.jpg/330px-Samosa_%28India%29.jpg",
    pantryMatch: 75,
    ingredients: {
      available: [
        "All-purpose flour",
        "Potatoes",
        "Green peas",
        "Cumin seeds",
        "Ginger",
        "Green chili",
        "Coriander powder",
        "Oil for frying"
      ],
      missing: ["Ajwain", "Amchur powder"]
    },
    nutrition: { protein: 5, carbs: 30, fat: 12, fiber: 3 },
    healthBenefits: ["Energy rich"],
    steps: [
      "Knead a tight dough with flour, salt, oil, and water; rest 20 minutes.",
      "Boil and mash potatoes; cook with peas, cumin, ginger, and spices.",
      "Divide dough, roll oval sheets, and cut each in half.",
      "Form cones, fill with potato mixture, and seal edges with water.",
      "Fry on medium-low heat until crisp and evenly golden.",
      "Serve with tamarind and mint chutney."
    ],
    cultural: "Popular snack across South Asia and beyond.",
    similarDishes: ["Empanada", "Pasty"]
  },
  {
    id: 15,
    title: "Aloo Gobi",
    cuisine: "North Indian",
    diet: "Vegan",
    time: "30 minutes",
    calories: 200,
    difficulty: "Easy",
    meal: "Lunch",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Aloo_Gobi.jpg/330px-Aloo_Gobi.jpg",
    pantryMatch: 88,
    ingredients: {
      available: [
        "Potatoes",
        "Cauliflower",
        "Onion",
        "Tomato",
        "Ginger-garlic",
        "Turmeric",
        "Coriander powder",
        "Cumin seeds"
      ],
      missing: ["Kasuri methi", "Lemon juice"]
    },
    nutrition: { protein: 6, carbs: 35, fat: 6, fiber: 5 },
    healthBenefits: ["High fiber", "Low fat"],
    steps: [
      "Cut potatoes and cauliflower into similar medium pieces.",
      "Heat oil and crackle cumin seeds.",
      "Saute onions and ginger-garlic, then add tomatoes and dry spices.",
      "Add potatoes first, cook 5 minutes, then add cauliflower and salt.",
      "Sprinkle little water, cover, and cook until tender but not mushy.",
      "Finish with coriander and lemon juice."
    ],
    cultural: "A comforting homestyle vegetable curry.",
    similarDishes: ["Gobi Manchurian", "Bombay Potatoes"]
  },
  {
    id: 16,
    title: "Pav Bhaji",
    cuisine: "North Indian",
    diet: "Vegetarian",
    time: "35 minutes",
    calories: 420,
    difficulty: "Medium",
    meal: "Snack",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Pav_Bhaji.jpg/330px-Pav_Bhaji.jpg",
    pantryMatch: 70,
    ingredients: {
      available: [
        "Potatoes",
        "Cauliflower",
        "Peas",
        "Capsicum",
        "Tomatoes",
        "Onion",
        "Pav bhaji masala",
        "Pav buns"
      ],
      missing: ["Butter", "Lemon wedges"]
    },
    nutrition: { protein: 8, carbs: 58, fat: 14, fiber: 7 },
    healthBenefits: ["Filling meal"],
    steps: [
      "Boil mixed vegetables until soft, then mash coarsely.",
      "Saute onions and capsicum in butter until aromatic.",
      "Add tomatoes, pav bhaji masala, chili powder, and cook to a thick base.",
      "Add mashed vegetables and water; simmer while mashing further.",
      "Toast pav with butter on a hot griddle.",
      "Serve bhaji topped with butter, onion, coriander, and lemon."
    ],
    cultural: "Mumbai street-food favorite served with buttery rolls.",
    similarDishes: ["Chole Bhature", "Vada Pav"]
  },
  {
    id: 17,
    title: "Prawn Curry",
    cuisine: "Coastal",
    diet: "Non-Vegetarian",
    time: "30 minutes",
    calories: 360,
    difficulty: "Medium",
    meal: "Lunch",
    image: "https://placehold.co/600x400/fde68a/7c2d12?text=Prawn+Curry",
    pantryMatch: 66,
    ingredients: {
      available: [
        "Prawns",
        "Onion",
        "Tomato",
        "Coconut milk",
        "Ginger-garlic paste",
        "Turmeric",
        "Red chili powder",
        "Curry leaves"
      ],
      missing: ["Kokum or tamarind", "Mustard seeds"]
    },
    nutrition: { protein: 25, carbs: 10, fat: 22, fiber: 1 },
    healthBenefits: ["High protein", "Low carb"],
    steps: [
      "Clean and devein prawns; marinate lightly with turmeric and salt.",
      "Saute onions, curry leaves, and ginger-garlic until fragrant.",
      "Add tomatoes and spice powders; cook to thick masala.",
      "Add coconut milk and bring to a gentle simmer.",
      "Add prawns and cook only 4 to 5 minutes until just done.",
      "Finish with tamarind or kokum and serve with rice."
    ],
    cultural: "Coastal curry with tangy and spicy flavors.",
    similarDishes: ["Fish Curry", "Shrimp Vindaloo"]
  },
  {
    id: 18,
    title: "Fish Curry",
    cuisine: "Coastal",
    diet: "Non-Vegetarian",
    time: "35 minutes",
    calories: 380,
    difficulty: "Medium",
    meal: "Lunch",
    image: "https://placehold.co/600x400/c7d2fe/1e3a8a?text=Fish+Curry",
    pantryMatch: 68,
    ingredients: {
      available: [
        "Fish steaks",
        "Onion",
        "Tomato",
        "Tamarind pulp",
        "Coconut milk",
        "Turmeric",
        "Red chili powder",
        "Fenugreek seeds"
      ],
      missing: ["Curry leaves", "Coriander leaves"]
    },
    nutrition: { protein: 30, carbs: 8, fat: 20, fiber: 1 },
    healthBenefits: ["Omega-3", "High protein"],
    steps: [
      "Marinate fish pieces with turmeric and salt for 10 minutes.",
      "Heat oil, splutter fenugreek seeds, and saute onions.",
      "Add tomato and spice powders; cook to a smooth masala.",
      "Add tamarind water and coconut milk; simmer 5 minutes.",
      "Slide in fish pieces and cook gently until flaky.",
      "Rest curry for 5 minutes before serving to deepen flavor."
    ],
    cultural: "Popular in coastal regions with regional variations.",
    similarDishes: ["Prawn Curry", "Fish Moilee"]
  },
  {
    id: 19,
    title: "Chocolate Brownie",
    cuisine: "Western",
    diet: "Vegetarian",
    time: "30 minutes",
    calories: 420,
    difficulty: "Easy",
    meal: "Dessert",
    image: "https://images.unsplash.com/photo-1604908177522-8b4a5f7f28a6?w=800&q=80",
    pantryMatch: 85,
    ingredients: {
      available: [
        "Dark chocolate",
        "Butter",
        "Sugar",
        "Eggs",
        "All-purpose flour",
        "Cocoa powder",
        "Vanilla extract",
        "Salt"
      ],
      missing: ["Walnuts", "Chocolate chips"]
    },
    nutrition: { protein: 6, carbs: 50, fat: 22, fiber: 3 },
    healthBenefits: ["Mood booster"],
    steps: [
      "Preheat oven to 180 C and line a square baking pan.",
      "Melt chocolate and butter together until smooth.",
      "Whisk eggs, sugar, and vanilla until glossy.",
      "Fold in melted chocolate mixture.",
      "Sift flour, cocoa, and salt into batter and fold gently.",
      "Pour into pan and bake 20 to 24 minutes for fudgy texture.",
      "Cool fully before slicing clean squares."
    ],
    cultural: "Classic American dessert loved worldwide.",
    similarDishes: ["Chocolate Lava Cake", "Brownie Sundae"]
  },
  {
    id: 20,
    title: "Pancakes",
    cuisine: "Western",
    diet: "Vegetarian",
    time: "20 minutes",
    calories: 320,
    difficulty: "Easy",
    meal: "Breakfast",
    image: "https://placehold.co/600x400/fecaca/991b1b?text=Pancakes",
    pantryMatch: 90,
    ingredients: {
      available: [
        "All-purpose flour",
        "Milk",
        "Egg",
        "Baking powder",
        "Sugar",
        "Melted butter",
        "Vanilla essence",
        "Salt"
      ],
      missing: ["Maple syrup", "Fresh berries"]
    },
    nutrition: { protein: 8, carbs: 45, fat: 10, fiber: 1 },
    healthBenefits: ["Quick energy"],
    steps: [
      "Whisk flour, baking powder, sugar, and salt in a bowl.",
      "Mix milk, egg, melted butter, and vanilla in another bowl.",
      "Combine wet and dry ingredients; keep batter slightly lumpy.",
      "Rest batter 5 minutes for better rise.",
      "Cook ladlefuls on a greased hot pan until bubbles form.",
      "Flip and cook second side until golden; serve with syrup and fruit."
    ],
    cultural: "Breakfast staple in many Western countries.",
    similarDishes: ["Crepes", "Waffles"]
  },
  {
    id: 21,
    title: "Shakshuka",
    cuisine: "Middle Eastern",
    diet: "Vegetarian",
    time: "25 minutes",
    calories: 300,
    difficulty: "Easy",
    meal: "Breakfast",
    image: "https://images.unsplash.com/photo-1562967914-6086d8b2f4f5?w=800&q=80",
    pantryMatch: 78,
    ingredients: {
      available: [
        "Eggs",
        "Tomatoes",
        "Onion",
        "Bell pepper",
        "Garlic",
        "Paprika",
        "Cumin powder",
        "Olive oil"
      ],
      missing: ["Feta", "Parsley"]
    },
    nutrition: { protein: 12, carbs: 28, fat: 16, fiber: 5 },
    healthBenefits: ["High protein", "Vitamin rich"],
    steps: [
      "Saute onion, bell pepper, and garlic in olive oil until soft.",
      "Add paprika, cumin, and chili flakes and cook briefly.",
      "Add crushed tomatoes and simmer until sauce thickens.",
      "Make small wells in sauce and crack eggs into each well.",
      "Cover and cook until egg whites set but yolks remain soft.",
      "Top with herbs or feta and serve with toasted bread."
    ],
    cultural: "Popular breakfast in North Africa and the Middle East.",
    similarDishes: ["Menemen", "Huevos Rancheros"]
  },
  {
    id: 22,
    title: "Tofu Stir Fry",
    cuisine: "Asian",
    diet: "Vegan",
    time: "20 minutes",
    calories: 280,
    difficulty: "Easy",
    meal: "Lunch",
    image: "https://placehold.co/600x400/d1fae5/065f46?text=Tofu+Stir+Fry",
    pantryMatch: 82,
    ingredients: {
      available: [
        "Firm tofu",
        "Broccoli",
        "Bell pepper",
        "Garlic",
        "Soy sauce",
        "Sesame oil",
        "Cornstarch",
        "Black pepper"
      ],
      missing: ["Rice vinegar", "Sesame seeds"]
    },
    nutrition: { protein: 18, carbs: 20, fat: 12, fiber: 4 },
    healthBenefits: ["Plant protein", "Low calorie"],
    steps: [
      "Press tofu to remove moisture, then cut into cubes.",
      "Coat lightly with cornstarch and pan-fry until golden.",
      "Stir-fry garlic and vegetables in a hot wok.",
      "Mix soy sauce, vinegar, pepper, and a little water.",
      "Return tofu, pour sauce, and toss until glossy.",
      "Finish with sesame seeds and serve with steamed rice."
    ],
    cultural: "Quick, protein-packed vegetarian main course.",
    similarDishes: ["Vegetable Stir Fry", "Mapo Tofu"]
  },
  {
    id: 23,
    title: "Ramen",
    cuisine: "Asian",
    diet: "Non-Vegetarian",
    time: "45 minutes",
    calories: 520,
    difficulty: "Medium",
    meal: "Dinner",
    image: "https://placehold.co/600x400/f3e8ff/6b21a8?text=Ramen",
    pantryMatch: 60,
    ingredients: {
      available: [
        "Ramen noodles",
        "Chicken or pork broth",
        "Soy sauce",
        "Garlic",
        "Ginger",
        "Boiled eggs",
        "Mushrooms",
        "Spring onion"
      ],
      missing: ["Nori", "Miso paste"]
    },
    nutrition: { protein: 30, carbs: 60, fat: 18, fiber: 3 },
    healthBenefits: ["Comforting", "Protein rich"],
    steps: [
      "Prepare broth with garlic, ginger, soy sauce, and optional miso.",
      "Simmer toppings such as mushrooms or corn separately.",
      "Boil ramen noodles just until al dente and drain.",
      "Place noodles in serving bowls.",
      "Pour hot broth over noodles and arrange toppings.",
      "Finish with halved soft-boiled egg and spring onion."
    ],
    cultural: "Japanese noodle soup with endless regional variations.",
    similarDishes: ["Udon", "Soba"]
  },
  {
    id: 24,
    title: "Matar Paneer",
    cuisine: "North Indian",
    diet: "Vegetarian",
    time: "40 minutes",
    calories: 420,
    difficulty: "Medium",
    meal: "Dinner",
    image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&q=80",
    pantryMatch: 78,
    ingredients: {
      available: [
        "Paneer",
        "Green peas",
        "Onion",
        "Tomatoes",
        "Ginger-garlic paste",
        "Cumin seeds",
        "Coriander powder",
        "Garam masala"
      ],
      missing: ["Fresh cream", "Kasuri methi"]
    },
    nutrition: { protein: 18, carbs: 30, fat: 22, fiber: 6 },
    healthBenefits: ["Calcium rich", "Good protein"],
    steps: [
      "Saute onions, ginger-garlic, and cumin until lightly golden.",
      "Add tomatoes and dry spices and cook down to masala.",
      "Blend masala if smoother gravy is preferred.",
      "Return to pan, add peas and a little water, and cook until peas are tender.",
      "Add paneer cubes, cream, and kasuri methi.",
      "Simmer briefly and serve with roti or rice."
    ],
    cultural: "Comforting Punjabi curry served with roti or rice.",
    similarDishes: ["Paneer Butter Masala", "Shahi Paneer"]
  },
  {
    id: 25,
    title: "Gulab Jamun",
    cuisine: "Indian",
    diet: "Vegetarian",
    time: "45 minutes",
    calories: 320,
    difficulty: "Medium",
    meal: "Dessert",
    image: "https://images.unsplash.com/photo-1604908177522-8b4a5f7f28a6?w=800&q=80",
    pantryMatch: 88,
    ingredients: {
      available: [
        "Milk powder",
        "All-purpose flour",
        "Baking soda",
        "Ghee",
        "Milk",
        "Sugar",
        "Cardamom",
        "Oil or ghee for frying"
      ],
      missing: ["Rose water", "Saffron strands"]
    },
    nutrition: { protein: 6, carbs: 60, fat: 10, fiber: 0 },
    healthBenefits: ["High calorie treat"],
    steps: [
      "Prepare sugar syrup with sugar, water, cardamom, and optional rose water.",
      "Mix milk powder, flour, soda, and ghee; add milk gradually to form soft dough.",
      "Rest dough 10 minutes and shape smooth crack-free balls.",
      "Fry on low heat until evenly deep golden brown.",
      "Transfer hot jamuns to warm syrup and soak at least 1 hour.",
      "Serve warm or chilled with syrup."
    ],
    cultural: "Classic Indian sweet often served at festivals and celebrations.",
    similarDishes: ["Rasgulla", "Kheer"]
  },
  {
    id: 26,
    title: "Vegetable Biryani",
    cuisine: "Indian",
    diet: "Vegan",
    time: "60 minutes",
    calories: 480,
    difficulty: "Medium",
    meal: "Dinner",
    image: "https://images.unsplash.com/photo-1601924582971-7f7f6d1f6d6b?w=600&q=80",
    pantryMatch: 74,
    ingredients: {
      available: [
        "Basmati rice",
        "Mixed vegetables",
        "Onion",
        "Tomato",
        "Ginger-garlic paste",
        "Biryani masala",
        "Mint leaves",
        "Coriander leaves"
      ],
      missing: ["Saffron", "Fried onions", "Cashews"]
    },
    nutrition: { protein: 10, carbs: 80, fat: 12, fiber: 8 },
    healthBenefits: ["Vegetarian comfort meal"],
    steps: [
      "Soak rice for 30 minutes and parboil with whole spices.",
      "Saute onions and ginger-garlic, then add vegetables and biryani masala.",
      "Add tomatoes, salt, mint, and coriander and cook until vegetables are half done.",
      "Layer vegetable masala and parboiled rice in a heavy pot.",
      "Top with saffron water, fried onions, and a little oil.",
      "Seal and cook on dum for 20 minutes, then rest before fluffing."
    ],
    cultural: "A vegetarian take on classic biryani styles.",
    similarDishes: ["Pulao", "Dum Biryani"]
  },
  {
    id: 27,
    title: "Rogan Josh",
    cuisine: "Kashmiri",
    diet: "Non-Vegetarian",
    time: "70 minutes",
    calories: 620,
    difficulty: "Medium",
    meal: "Dinner",
    image: "https://images.unsplash.com/photo-1543352634-2d4b9c04a0a4?w=600&q=80",
    pantryMatch: 68,
    ingredients: {
      available: [
        "Lamb pieces",
        "Yogurt",
        "Onion",
        "Ginger-garlic paste",
        "Kashmiri red chili powder",
        "Fennel powder",
        "Garam masala",
        "Mustard oil"
      ],
      missing: ["Ratanjot", "Asafoetida"]
    },
    nutrition: { protein: 36, carbs: 8, fat: 32, fiber: 1 },
    healthBenefits: ["High protein"],
    steps: [
      "Heat mustard oil and sear lamb pieces until lightly browned.",
      "Saute onions and ginger-garlic in the same pot.",
      "Add yogurt gradually with spices, stirring to avoid splitting.",
      "Return lamb, add warm water, and bring to a gentle boil.",
      "Cover and simmer on low heat until lamb is tender.",
      "Adjust seasoning and rest 10 minutes before serving."
    ],
    cultural: "A signature dish from Kashmir, rich and aromatic.",
    similarDishes: ["Raan", "Korma"]
  },
  {
    id: 28,
    title: "Kheer (Rice Pudding)",
    cuisine: "Indian",
    diet: "Vegetarian",
    time: "50 minutes",
    calories: 300,
    difficulty: "Easy",
    meal: "Dessert",
    image: "https://images.unsplash.com/photo-1581235720704-8d4a5a1b9a0a?w=600&q=80",
    pantryMatch: 85,
    ingredients: {
      available: [
        "Full-fat milk",
        "Basmati rice",
        "Sugar",
        "Cardamom powder",
        "Saffron",
        "Almonds",
        "Pistachios",
        "Raisins"
      ],
      missing: ["Rose water"]
    },
    nutrition: { protein: 6, carbs: 40, fat: 10, fiber: 0 },
    healthBenefits: ["Comforting dessert"],
    steps: [
      "Rinse rice and soak for 20 minutes.",
      "Bring milk to a boil in a heavy-bottom pan.",
      "Add drained rice and cook on low, stirring often to avoid sticking.",
      "When rice is soft and milk thickens, add sugar and cardamom.",
      "Stir in saffron and chopped nuts and simmer 5 more minutes.",
      "Serve warm or chilled after the kheer thickens naturally."
    ],
    cultural: "Traditional rice pudding enjoyed across South Asia.",
    similarDishes: ["Payasam", "Rice Kheer"]
  }
];

export default recipes;
