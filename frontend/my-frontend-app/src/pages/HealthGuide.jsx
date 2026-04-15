import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/HealthGuide.css";
import ProfileDropdown from "../components/ProfileDropdown";
import localRecipes from "../data/recipes";

const nutrients = [
  {
    emoji: "🍊", color: "#ff6a00", slug: "vitamin-c",
    name: "Vitamin C (Ascorbic Acid)",
    desc: "Vitamin C is a powerful antioxidant that plays a crucial role in immune function, collagen synthesis, and iron absorption. It protects cells from damage,...",
    ingredients: ["Bell Peppers", "Oranges", "Strawberries", "Broccoli", "Kiwi"]
  },
  {
    emoji: "🥩", color: "#ef4444", slug: "protein",
    name: "Protein",
    desc: "Protein is an essential macronutrient made up of amino acids, the building blocks of life. It's crucial for building and repairing tissues, making enzymes an...",
    ingredients: ["Chicken Breast", "Eggs", "Lentils", "Tofu", "Greek Yogurt"]
  },
  {
    emoji: "🌾", color: "#f97316", slug: "carbohydrates",
    name: "Carbohydrates",
    desc: "Carbohydrates are the body's primary energy source. They're broken down into glucose, which fuels your brain, muscles, and all bodily functions. Complex...",
    ingredients: ["Brown Rice", "Oats", "Sweet Potato", "Quinoa", "Whole Wheat Bread"]
  },
  {
    emoji: "🫒", color: "#eab308", slug: "healthy-fats",
    name: "Healthy Fats",
    desc: "Healthy fats are essential for hormone production, nutrient absorption, and cell membrane health. Healthy fats, particularly omega-3 fatty acids,...",
    ingredients: ["Avocado", "Olive Oil", "Almonds", "Walnuts", "Salmon"]
  },
  {
    emoji: "🥦", color: "#22c55e", slug: "dietary-fiber",
    name: "Dietary Fiber",
    desc: "Fiber is a type of carbohydrate that the body cannot digest. It's essential for digestive health, regulating blood sugar, lowering cholesterol, and maintaining ...",
    ingredients: ["Black Beans", "Chickpeas", "Chia Seeds", "Lentils", "Broccoli"]
  },
  {
    emoji: "☀️", color: "#f59e0b", slug: "vitamin-d",
    name: "Vitamin D",
    desc: "Vitamin D is a fat-soluble vitamin that's crucial for bone health, immune function, and mood regulation. Unlike most vitamins, your body can produce...",
    ingredients: ["Salmon", "Fortified Milk", "Egg Yolks", "Mushrooms", "Tuna"]
  },
  {
    emoji: "⚡", color: "#ef4444", slug: "iron",
    name: "Iron",
    desc: "Iron is an essential mineral that's crucial for producing hemoglobin, which carries oxygen in your blood. It's vital for energy production, immune...",
    ingredients: ["Spinach", "Red Meat", "Pumpkin Seeds", "Lentils", "Tofu"]
  },
  {
    emoji: "🦴", color: "#3b82f6", slug: "calcium",
    name: "Calcium",
    desc: "Calcium is the most abundant mineral in the body, essential for building and maintaining strong bones and teeth. It also plays vital roles in muscle functio...",
    ingredients: ["Milk", "Cheese", "Yogurt", "Kale", "Almonds"]
  },
  {
    emoji: "💙", color: "#6366f1", slug: "omega-3",
    name: "Omega-3 Fatty Acids",
    desc: "Omega-3 fatty acids are essential fats that your body cannot produce on its own. They're crucial for brain health, heart health, and reducing inflammation...",
    ingredients: ["Salmon", "Flaxseeds", "Chia Seeds", "Walnuts", "Mackerel"]
  }
];

const nutrientArticles = {
  "vitamin-c": {
    title: "NIH: Vitamin C Fact Sheet",
    url: "https://ods.od.nih.gov/factsheets/VitaminC-Consumer/",
  },
  protein: {
    title: "Harvard: Protein Guide",
    url: "https://www.hsph.harvard.edu/nutritionsource/what-should-you-eat/protein/",
  },
  carbohydrates: {
    title: "Harvard: Carbohydrates and Health",
    url: "https://www.hsph.harvard.edu/nutritionsource/carbohydrates/",
  },
  "healthy-fats": {
    title: "Harvard: Fats and Cholesterol",
    url: "https://www.hsph.harvard.edu/nutritionsource/what-should-you-eat/fats-and-cholesterol/",
  },
  "dietary-fiber": {
    title: "Mayo Clinic: Fiber Benefits",
    url: "https://www.mayoclinic.org/healthy-lifestyle/nutrition-and-healthy-eating/in-depth/fiber/art-20043983",
  },
  "vitamin-d": {
    title: "NIH: Vitamin D Fact Sheet",
    url: "https://ods.od.nih.gov/factsheets/VitaminD-Consumer/",
  },
  iron: {
    title: "NIH: Iron Fact Sheet",
    url: "https://ods.od.nih.gov/factsheets/Iron-Consumer/",
  },
  calcium: {
    title: "NIH: Calcium Fact Sheet",
    url: "https://ods.od.nih.gov/factsheets/Calcium-Consumer/",
  },
  "omega-3": {
    title: "NIH: Omega-3 Fact Sheet",
    url: "https://ods.od.nih.gov/factsheets/Omega3FattyAcids-Consumer/",
  },
};

const concernArticles = [
  {
    key: "diabetes",
    keywords: ["diabetes", "diabetic", "blood sugar", "insulin"],
    title: "WHO: Diabetes Overview",
    url: "https://www.who.int/news-room/fact-sheets/detail/diabetes",
  },
  {
    key: "hypertension",
    keywords: ["hypertension", "blood pressure", "high bp"],
    title: "WHO: Hypertension Facts",
    url: "https://www.who.int/news-room/fact-sheets/detail/hypertension",
  },
  {
    key: "cholesterol",
    keywords: ["cholesterol", "ldl", "triglycerides"],
    title: "NHLBI: High Blood Cholesterol",
    url: "https://www.nhlbi.nih.gov/health/high-blood-cholesterol",
  },
  {
    key: "weight loss",
    keywords: ["weight loss", "obesity", "overweight"],
    title: "CDC: Healthy Weight Basics",
    url: "https://www.cdc.gov/healthy-weight-growth/about/index.html",
  },
  {
    key: "heart health",
    keywords: ["heart healthy", "heart", "cardio", "cardiovascular"],
    title: "WHO: Cardiovascular Diseases",
    url: "https://www.who.int/news-room/fact-sheets/detail/cardiovascular-diseases-(cvds)",
  },
  {
    key: "muscle gain",
    keywords: ["muscle gain", "muscle", "high protein", "protein"],
    title: "Mayo Clinic: Protein Needs",
    url: "https://www.mayoclinic.org/healthy-lifestyle/nutrition-and-healthy-eating/in-depth/protein/art-20046958",
  },
  {
    key: "acidity",
    keywords: ["acidity", "acid reflux", "gerd", "heartburn"],
    title: "NIDDK: Acid Reflux and GERD",
    url: "https://www.niddk.nih.gov/health-information/digestive-diseases/acid-reflux-ger-gerd-adults",
  },
  {
    key: "thyroid",
    keywords: ["thyroid", "hypothyroid", "hyperthyroid", "tsh"],
    title: "NIDDK: Thyroid Disease",
    url: "https://www.niddk.nih.gov/health-information/endocrine-diseases/thyroid-disease",
  },
  {
    key: "pcos",
    keywords: ["pcos", "pcod", "polycystic"],
    title: "NIH: PCOS Overview",
    url: "https://www.nichd.nih.gov/health/topics/pcos",
  },
  {
    key: "vegan",
    keywords: ["vegan", "vegetarian", "plant based", "plant-based"],
    title: "Harvard: Healthy Plant-Based Diet",
    url: "https://www.health.harvard.edu/staying-healthy/becoming-a-vegetarian",
  },
];

const normalizeText = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9\s-]+/g, " ");

const uniqueBy = (items, keyGetter) => {
  const seen = new Set();
  return items.filter((item) => {
    const key = keyGetter(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

const healthConcernProfiles = [
  {
    key: "diabetes",
    label: "Blood Sugar Balance",
    keywords: ["diabetes", "diabetic", "blood sugar", "insulin", "glucose", "a1c", "sugar control"],
    benefits: [
      { title: "Steadier blood sugar", detail: "Fiber-rich foods slow digestion and reduce post-meal glucose spikes." },
      { title: "Longer satiety", detail: "Protein and healthy fats help reduce cravings and keep energy more stable." },
      { title: "Cleaner energy curve", detail: "Balanced meals reduce crashes and make the day feel more predictable." },
    ],
    foods: [
      { name: "Lentils and beans", reason: "slow-digesting carbs plus fiber help flatten glucose spikes", usage: "Use in dals, soups, salads, or wraps" },
      { name: "Non-starchy vegetables", reason: "high volume and low glycemic load support balanced meals", usage: "Build half of the plate with spinach, broccoli, cucumber, and peppers" },
      { name: "Nuts and seeds", reason: "healthy fats and protein slow carb absorption", usage: "Add a small handful to snacks, yogurt, or salads" },
      { name: "Plain yogurt", reason: "protein-rich and easy to pair with fiber for a gentler glucose response", usage: "Choose unsweetened yogurt with chia, nuts, or berries" },
    ],
    avoid: ["Sugary drinks", "Refined flour snacks", "Large white rice portions", "Desserts on an empty stomach"],
    tips: [
      "Pair carbohydrates with protein and fiber instead of eating them alone.",
      "Choose smaller portions of rice, roti, or bread and add more vegetables.",
      "Keep a consistent meal rhythm to avoid large glucose swings.",
    ],
    recipeTags: ["diabetic friendly", "high fiber", "low carb"],
  },
  {
    key: "heart",
    label: "Heart Health",
    keywords: ["heart", "cardio", "cardiovascular", "cholesterol", "bp", "blood pressure", "hypertension"],
    benefits: [
      { title: "Better cholesterol balance", detail: "Fiber and unsaturated fats can help support healthier lipid levels." },
      { title: "Lower blood pressure load", detail: "Food choices lower in sodium and rich in potassium support circulation." },
      { title: "Less inflammation pressure", detail: "Antioxidant-rich meals support the heart and blood vessels." },
    ],
    foods: [
      { name: "Oats and whole grains", reason: "soluble fiber supports cholesterol control", usage: "Use as breakfast bowls or grain bases" },
      { name: "Olive oil and avocado", reason: "unsaturated fats support heart-friendly meal patterns", usage: "Use in dressings, dips, and light cooking" },
      { name: "Fatty fish", reason: "omega-3 fats support cardiovascular health", usage: "Choose grilled or baked fish a few times per week" },
      { name: "Leafy greens", reason: "rich in potassium, folate, and antioxidants", usage: "Add to salads, curries, smoothies, or sautés" },
    ],
    avoid: ["Deep fried snacks", "Heavy cream sauces", "Excess salt", "Processed meats"],
    tips: [
      "Prefer grilled, steamed, roasted, or lightly sautéed cooking methods.",
      "Use herbs, lemon, garlic, and spices for flavor instead of excess salt.",
      "Aim for regular movement and good sleep alongside heart-friendly meals.",
    ],
    recipeTags: ["heart healthy", "low carb", "high fiber"],
  },
  {
    key: "weight",
    label: "Weight Management",
    keywords: ["weight loss", "fat loss", "obesity", "overweight", "weight management", "lean"],
    benefits: [
      { title: "Better fullness", detail: "Protein and fiber reduce hunger between meals." },
      { title: "Lower calorie density", detail: "Vegetable-rich meals provide volume without excess calories." },
      { title: "More steady routines", detail: "Simple, predictable meals make portion control easier to maintain." },
    ],
    foods: [
      { name: "Vegetables", reason: "high volume and low calorie density support satiety", usage: "Load up salads, stir-fries, soups, and curries" },
      { name: "Lean protein", reason: "helps preserve muscle while improving fullness", usage: "Use eggs, tofu, paneer, fish, or chicken as the meal anchor" },
      { name: "Whole grains", reason: "provide fiber and longer-lasting energy than refined flour", usage: "Choose smaller portions of brown rice, oats, or quinoa" },
      { name: "Fruit", reason: "sweetness with fiber is better than added sugar desserts", usage: "Choose whole fruit instead of juice when possible" },
    ],
    avoid: ["Sugary drinks", "Large fried portions", "Desserts", "Frequent ultra-processed snacks"],
    tips: [
      "Build meals around protein first, then add vegetables and a measured starch portion.",
      "Keep snacks simple and planned instead of grazing all day.",
      "Focus on consistency instead of extreme restriction.",
    ],
    recipeTags: ["low calorie", "high fiber", "high protein"],
  },
  {
    key: "muscle",
    label: "Muscle Gain",
    keywords: ["muscle gain", "muscle", "bodybuilding", "strength", "high protein", "bulking"],
    benefits: [
      { title: "More muscle repair", detail: "Enough protein and recovery foods support tissue rebuilding." },
      { title: "Better training energy", detail: "Carbohydrates provide fuel for workouts and recovery." },
      { title: "Improved satiety", detail: "Protein-dense meals can reduce random snacking and improve meal quality." },
    ],
    foods: [
      { name: "Eggs and paneer", reason: "dense protein for muscle repair", usage: "Use in breakfast dishes, bowls, and quick curries" },
      { name: "Greek yogurt", reason: "protein-rich and convenient around training", usage: "Pair with fruit, seeds, or oats" },
      { name: "Lentils and chickpeas", reason: "plant protein plus carbs for training support", usage: "Add to stews, wraps, and grain bowls" },
      { name: "Rice, oats, or potatoes", reason: "fuel training and help refill glycogen", usage: "Balance with protein and vegetables" },
    ],
    avoid: ["Skipping meals", "Very low carb plans during heavy training", "Empty-calorie snacks", "Under-eating protein"],
    tips: [
      "Split protein across the day instead of eating it all in one meal.",
      "Include a carb source after training to support recovery.",
      "Prioritize sleep because muscle growth happens during recovery, not just workouts.",
    ],
    recipeTags: ["high protein", "protein snack"],
  },
  {
    key: "digestion",
    label: "Digestion and Acidity",
    keywords: ["acidity", "acid reflux", "gerd", "heartburn", "indigestion", "constipation", "bloating"],
    benefits: [
      { title: "Less reflux pressure", detail: "Smaller, lighter meals can reduce the chance of irritation." },
      { title: "Smoother digestion", detail: "Fiber and hydration support regular bowel movements." },
      { title: "More comfortable meals", detail: "Gentler spices and simpler preparations are easier on the stomach." },
    ],
    foods: [
      { name: "Oats", reason: "soft fiber can be gentle and filling", usage: "Use for breakfast or light meals" },
      { name: "Bananas", reason: "easy-to-digest fruit for many people", usage: "Pair with yogurt or oats" },
      { name: "Cooked vegetables", reason: "softer texture is usually easier to tolerate than raw heavy meals", usage: "Prefer steamed or sautéed dishes" },
      { name: "Ginger and fennel", reason: "often used in soothing meals and teas", usage: "Add carefully to warm drinks or food" },
    ],
    avoid: ["Very spicy food", "Large oily meals", "Late-night heavy eating", "Excess caffeine"],
    tips: [
      "Eat smaller meals and avoid lying down right after eating.",
      "Keep dinner earlier and lighter when reflux is a concern.",
      "Track trigger foods because tolerance varies from person to person.",
    ],
    recipeTags: ["light meal", "low fat", "comforting"],
  },
  {
    key: "bone",
    label: "Bone Strength",
    keywords: ["bone", "calcium", "osteoporosis", "vitamin d", "joints", "bone health"],
    benefits: [
      { title: "Stronger bones", detail: "Calcium and vitamin D support bone density and remodeling." },
      { title: "Better muscle function", detail: "Mineral balance helps muscles contract normally." },
      { title: "Long-term protection", detail: "Adequate nutrition now helps lower bone loss risk later." },
    ],
    foods: [
      { name: "Yogurt and milk", reason: "reliable calcium sources for many meal plans", usage: "Use in breakfast bowls, drinks, or snacks" },
      { name: "Leafy greens", reason: "support calcium and micronutrient intake", usage: "Add to curries, soups, and salads" },
      { name: "Eggs and mushrooms", reason: "support vitamin D intake patterns", usage: "Use in breakfast or savory meals" },
      { name: "Fortified foods", reason: "help close calcium or vitamin D gaps", usage: "Check labels on plant milks and cereals" },
    ],
    avoid: ["Skipping calcium-rich foods", "Very low protein diets", "Too much soda", "Highly processed snack patterns"],
    tips: [
      "Combine calcium-rich foods with regular movement or weight-bearing exercise.",
      "Pay attention to vitamin D because calcium works best when vitamin D is adequate.",
      "Include protein to support bone structure as well as muscle.",
    ],
    recipeTags: ["calcium rich", "bone health", "high protein"],
  },
  {
    key: "immunity",
    label: "Immunity and Recovery",
    keywords: ["immunity", "immune", "cold", "fever", "recovery", "infection"],
    benefits: [
      { title: "Better nutrient coverage", detail: "Vitamin-rich meals give the immune system the building blocks it needs." },
      { title: "Faster recovery support", detail: "Protein and fluids help the body repair and bounce back." },
      { title: "Lower inflammation load", detail: "Antioxidant-rich foods can support a healthier recovery pattern." },
    ],
    foods: [
      { name: "Citrus fruits", reason: "vitamin C is useful for immune-supportive eating patterns", usage: "Eat whole fruit or add to salads" },
      { name: "Garlic and ginger", reason: "common flavor builders in recovery-focused meals", usage: "Use in soups, broths, and teas" },
      { name: "Leafy greens", reason: "provide folate, vitamin C, and other micronutrients", usage: "Use in cooked or blended dishes" },
      { name: "Protein foods", reason: "the immune system still needs amino acids for repair", usage: "Include eggs, tofu, chicken, paneer, or legumes" },
    ],
    avoid: ["Excess alcohol", "Very sugary drinks", "Skipping meals", "Too little fluid"],
    tips: [
      "Hydration matters as much as food choice when recovery is the goal.",
      "Use simple, nourishing meals when appetite is low.",
      "Sleep and stress management strongly influence recovery.",
    ],
    recipeTags: ["vitamin rich", "high protein"],
  },
  {
    key: "hormonal",
    label: "Hormonal Balance",
    keywords: ["pcos", "pcod", "thyroid", "hormone", "hormonal", "cycle", "metabolism"],
    benefits: [
      { title: "More stable metabolism", detail: "Regular balanced meals help the body avoid energy crashes." },
      { title: "Better blood sugar rhythm", detail: "Fiber and protein can help with insulin sensitivity-focused meal patterns." },
      { title: "Steadier mood and appetite", detail: "Protein and healthy fats can reduce intense hunger swings." },
    ],
    foods: [
      { name: "High fiber foods", reason: "help with meal stability and satiety", usage: "Use vegetables, legumes, fruit, and whole grains" },
      { name: "Lean protein", reason: "supports hormone-friendly meal patterns", usage: "Make protein part of every main meal" },
      { name: "Healthy fats", reason: "help absorb fat-soluble nutrients and support fullness", usage: "Use nuts, seeds, avocado, or olive oil" },
      { name: "Iron-rich foods", reason: "help when fatigue is part of the picture", usage: "Use spinach, lentils, tofu, or fortified options" },
    ],
    avoid: ["Highly refined sweets", "Irregular meal skipping", "Very low protein eating", "Large fried meals"],
    tips: [
      "Keep meals regular and protein-forward.",
      "Use a balanced plate instead of relying on one food group.",
      "If thyroid symptoms are suspected, follow up with a clinician for testing and treatment advice.",
    ],
    recipeTags: ["plant protein", "high fiber", "high protein"],
  },
  {
    key: "plantBased",
    label: "Plant-Based Balance",
    keywords: ["vegan", "vegetarian", "plant based", "plant-based", "meatless"],
    benefits: [
      { title: "More fiber", detail: "Plant-forward meals naturally increase fiber, which supports digestion and fullness." },
      { title: "Better micronutrient variety", detail: "A wider plant mix improves vitamin, mineral, and antioxidant coverage." },
      { title: "Flexible protein pairing", detail: "Legumes, soy, grains, and dairy alternatives can be combined to cover protein needs." },
    ],
    foods: [
      { name: "Lentils and chickpeas", reason: "foundation proteins for plant-based plates", usage: "Use in curries, bowls, soups, and wraps" },
      { name: "Tofu and soy foods", reason: "versatile protein sources with a neutral flavor base", usage: "Stir-fry, grill, or crumble into fillings" },
      { name: "Whole grains", reason: "pair well with legumes for a balanced amino acid profile", usage: "Use brown rice, quinoa, oats, or whole wheat" },
      { name: "Seeds and nuts", reason: "provide healthy fats and extra calories when needed", usage: "Add to salads, breakfasts, and snacks" },
    ],
    avoid: ["Relying only on refined carbs", "Skipping protein at meals", "Very repetitive one-food plans"],
    tips: [
      "Combine legumes with grains for a more complete protein profile.",
      "If using plant milks or yogurts, choose fortified options when possible.",
      "Watch iron, B12, calcium, and vitamin D if you are fully plant-based.",
    ],
    recipeTags: ["plant protein", "high fiber", "low calorie"],
  },
];

const generalWellnessProfile = {
  key: "general-wellness",
  label: "General Wellness",
  benefits: [
    { title: "Steady energy", detail: "Balanced meals with protein, fiber, and healthy fats help avoid energy crashes." },
    { title: "Better nutrient coverage", detail: "A varied plate makes it easier to cover vitamins, minerals, and protein." },
    { title: "Easier meal planning", detail: "Simple meal structure makes healthy choices more repeatable." },
  ],
  foods: [
    { name: "Vegetables", reason: "provide fiber and micronutrients", usage: "Use in every lunch or dinner" },
    { name: "Protein foods", reason: "support fullness and tissue repair", usage: "Include eggs, dairy, tofu, fish, legumes, or lean meats" },
    { name: "Whole grains", reason: "offer longer-lasting energy than refined options", usage: "Choose oats, brown rice, or whole wheat in modest portions" },
    { name: "Fruit", reason: "adds sweetness with fiber and antioxidants", usage: "Use whole fruit for snacks and desserts" },
  ],
  avoid: ["Skipping meals", "Sugary drinks", "Ultra-processed snacks"],
  tips: [
    "Start with one or two realistic changes instead of overhauling everything at once.",
    "Use a simple plate rule: protein, vegetables, and a measured carb portion.",
    "Hydration and sleep improve how any food plan feels day to day.",
  ],
  recipeTags: ["high protein", "high fiber", "low calorie"],
};

const dietGoalToConcernKeys = {
  "weight loss": ["weight"],
  "muscle gain": ["muscle"],
  "diabetic friendly": ["diabetes"],
  "heart healthy": ["heart"],
  "high protein": ["muscle"],
  vegan: ["plantBased"],
  vegetarian: ["plantBased"],
};

const buildLocalHealthPlan = (plannerForm) => {
  const inputText = normalizeText([
    plannerForm.healthIssues,
    plannerForm.dietGoal,
    plannerForm.mealType,
    plannerForm.preferences,
    plannerForm.avoidIngredients,
  ].filter(Boolean).join(" "));

  const explicitMatches = healthConcernProfiles.filter((profile) =>
    profile.keywords.some((keyword) => inputText.includes(normalizeText(keyword))),
  );

  const goalMatches = (dietGoalToConcernKeys[plannerForm.dietGoal] || [])
    .map((key) => healthConcernProfiles.find((profile) => profile.key === key))
    .filter(Boolean);

  const matchedProfiles = uniqueBy([...explicitMatches, ...goalMatches], (profile) => profile.key);
  const activeProfiles = matchedProfiles.length ? matchedProfiles : [generalWellnessProfile];

  const relevantBenefits = uniqueBy(
    activeProfiles.flatMap((profile) => profile.benefits.map((benefit) => ({ ...benefit, source: profile.label }))),
    (benefit) => benefit.title,
  );

  const recommendedFoods = uniqueBy(
    activeProfiles.flatMap((profile) => profile.foods.map((food) => ({ ...food, source: profile.label }))),
    (food) => food.name,
  );

  const avoidFoods = uniqueBy(
    [
      ...activeProfiles.flatMap((profile) => profile.avoid),
      ...String(plannerForm.avoidIngredients || "").split(/[,/;\n]+/).map((item) => item.trim()).filter(Boolean),
    ],
    (item) => item.toLowerCase(),
  );

  const lifestyleTips = uniqueBy(
    [
      ...activeProfiles.flatMap((profile) => profile.tips),
      "Drink enough water and keep meals consistent through the day.",
    ],
    (tip) => tip.toLowerCase(),
  );

  const matchedLabels = activeProfiles.map((profile) => profile.label);
  const concernSummary = matchedLabels.length
    ? `Your plan is tailored for ${matchedLabels.join(", ")}.`
    : "Your plan is tailored for general wellness.";

  const maxPrepTime = plannerForm.maxPrepTime ? Number(plannerForm.maxPrepTime) : null;
  const avoidText = normalizeText(avoidFoods.join(" "));

  const scoredRecipes = localRecipes
    .map((recipe) => {
      const recipeText = normalizeText([
        recipe.title,
        recipe.cuisine,
        recipe.diet,
        recipe.meal,
        recipe.healthBenefits?.join(" "),
        recipe.similarDishes?.join(" "),
        recipe.ingredients?.available?.join(" "),
        recipe.ingredients?.missing?.join(" "),
      ].filter(Boolean).join(" "));

      let score = 0;
      const reasons = [];
      const lowerHealthBenefits = (recipe.healthBenefits || []).map((benefit) => normalizeText(benefit));

      activeProfiles.forEach((profile) => {
        const matchedTag = profile.recipeTags.find((tag) => lowerHealthBenefits.some((benefit) => benefit.includes(normalizeText(tag))))
          || profile.keywords.find((keyword) => recipeText.includes(normalizeText(keyword)));
        if (matchedTag) {
          score += 3;
          reasons.push(`${profile.label} match`);
        }
      });

      if (plannerForm.dietGoal) {
        const dietGoal = normalizeText(plannerForm.dietGoal);
        if (normalizeText(recipe.diet).includes(dietGoal) || lowerHealthBenefits.some((benefit) => benefit.includes(dietGoal))) {
          score += 2;
          reasons.push(`Matches ${plannerForm.dietGoal}`);
        }
      }

      if (plannerForm.mealType && normalizeText(recipe.meal).includes(normalizeText(plannerForm.mealType))) {
        score += 1;
        reasons.push(`Good for ${plannerForm.mealType}`);
      }

      if (maxPrepTime && recipe.time) {
        const minutes = Number(String(recipe.time).match(/\d+/)?.[0] || 0);
        if (minutes && minutes <= maxPrepTime) {
          score += 1;
          reasons.push(`Fits your ${maxPrepTime}-minute cap`);
        }
      }

      if (plannerForm.preferences) {
        const prefs = normalizeText(plannerForm.preferences);
        if (prefs.includes("quick") && normalizeText(recipe.time).includes("minute")) {
          score += 1;
          reasons.push("Quick to prepare");
        }
        if (prefs.includes("low oil") && lowerHealthBenefits.some((benefit) => benefit.includes("low fat") || benefit.includes("low calorie"))) {
          score += 1;
          reasons.push("Works for a lighter cooking style");
        }
      }

      if (avoidText && recipeText.includes(avoidText)) {
        score -= 5;
      }

      return {
        ...recipe,
        reason: reasons.length ? uniqueBy(reasons, (item) => item.toLowerCase()).join(" • ") : "Balanced local option from the embedded recipe library.",
        score,
      };
    })
    .filter((recipe) => recipe.score > 0 || matchedLabels.length === 0)
    .sort((left, right) => right.score - left.score || left.calories - right.calories)
    .slice(0, 5)
    .map((recipe) => ({
      id: recipe.id,
      title: recipe.title,
      image: recipe.image,
      meal: recipe.meal,
      time: recipe.time,
      diet: recipe.diet,
      steps: recipe.steps || [],
      healthBenefits: recipe.healthBenefits || [],
      reason: recipe.reason,
    }));

  const summary = [
    concernSummary,
    relevantBenefits.slice(0, 3).map((benefit) => benefit.title).join(", "),
  ].filter(Boolean).join(" ");

  return {
    summary,
    matched_concerns: matchedLabels,
    relevant_health_benefits: relevantBenefits,
    recommended_foods: recommendedFoods,
    avoid_foods: avoidFoods,
    recipes: scoredRecipes,
    lifestyle_tips: lifestyleTips,
    disclaimer: "This guidance is educational and generated entirely in your browser from the local nutrition library. For medical decisions or persistent symptoms, consult a qualified clinician.",
  };
};

const collectRelatedArticles = (plannerForm, plannerResult) => {
  if (!plannerResult) {
    return [];
  }

  const combinedText = [
    plannerForm.healthIssues,
    plannerForm.dietGoal,
    plannerForm.preferences,
    plannerResult?.summary,
    plannerResult?.matched_concerns?.join(" "),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const matched = concernArticles.filter((article) =>
    article.keywords.some((keyword) => combinedText.includes(keyword)),
  );

  return uniqueBy([...(matched.length ? matched : concernArticles.slice(0, 4))], (article) => article.key);
};

// Mock analysis: randomly picks 2-4 "missing" nutrients to simulate detection
function analyzeImage() {
  const shuffled = [...nutrients].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.floor(Math.random() * 3) + 2);
}

const NAVBAR_SVG = {
  home:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  recipes:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  menus:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  health: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  search: <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  user:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff6a00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
};

function HealthGuide() {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  const plannerRef = useRef(null);
  const [topicBanner, setTopicBanner] = useState(null);

  const nutRefs = useRef({});
  const [focusedSlug, setFocusedSlug] = useState(null);

  const [preview, setPreview]       = useState(null);
  const [analyzing, setAnalyzing]   = useState(false);
  const [result, setResult]         = useState(null);
  const [dragOver, setDragOver]     = useState(false);
  const [search, setSearch]         = useState("");
  const [plannerLoading, setPlannerLoading] = useState(false);
  const [plannerError, setPlannerError] = useState("");
  const [plannerResult, setPlannerResult] = useState(null);
  const [plannerForm, setPlannerForm] = useState({
    healthIssues: "",
    dietGoal: "",
    mealType: "",
    avoidIngredients: "",
    preferences: "",
    maxPrepTime: "",
  });

  const visibleNutrients = search
    ? nutrients.filter(n =>
        n.name.toLowerCase().includes(search.toLowerCase()) ||
        n.desc.toLowerCase().includes(search.toLowerCase()) ||
        n.ingredients.some(ing => ing.toLowerCase().includes(search.toLowerCase()))
      )
    : nutrients;

  const plannerRelatedArticles = useMemo(
    () => collectRelatedArticles(plannerForm, plannerResult),
    [plannerForm, plannerResult],
  );

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    setResult(null);
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setResult(analyzeImage());
    }, 2000);
  };

  useEffect(() => {
    // read URL params: focus (slug) or search
    const params = new URLSearchParams(location.search);
    const focus = params.get("focus");
    const q = params.get("search") || params.get("q");
    if (q) {
      try { setSearch(decodeURIComponent(q)); } catch(e) { setSearch(q); }
    }
    if (focus) {
      setFocusedSlug(focus);
      // small delay to ensure refs are set
      setTimeout(() => {
        const el = nutRefs.current[focus];
        if (el && typeof el.scrollIntoView === 'function') {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // temporarily add highlight class
          el.classList.add('hg-highlight');
          setTimeout(() => el.classList.remove('hg-highlight'), 3000);
        }
      }, 120);
    }

    // topic-based handling (e.g., low-calorie -> preselect weight loss in planner)
    const topic = params.get("topic");
    if (topic === "low-calorie") {
      setTopicBanner("Low-calorie tips: preselected Weight Loss guidance");
      setPlannerForm((p) => ({ ...p, dietGoal: "weight loss" }));
      setTimeout(() => {
        if (plannerRef.current && typeof plannerRef.current.scrollIntoView === 'function') {
          plannerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 140);
      setTimeout(() => setTopicBanner(null), 5000);
    }
  }, [location.search]);

  const onFileChange = (e) => handleFile(e.target.files[0]);

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const updatePlannerField = (key, value) => {
    setPlannerForm((prev) => ({ ...prev, [key]: value }));
  };

  const submitHealthPlanner = async (e) => {
    e.preventDefault();
    setPlannerLoading(true);
    setPlannerError("");
    setPlannerResult(null);
    const data = buildLocalHealthPlan(plannerForm);
    setPlannerResult(data);
    setPlannerLoading(false);
  };

  return (
    <div className="hg-page">

      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">🍲 RecipeDiscover</div>
        <div className="nav-links">
          <a onClick={() => navigate("/home")}>{NAVBAR_SVG.home} Home</a>
          <a onClick={() => navigate("/recipes")}>{NAVBAR_SVG.recipes} Recipes</a>
          <a onClick={() => navigate("/menus")}>{NAVBAR_SVG.menus} Menus</a>
          <a className="active">{NAVBAR_SVG.health} Health Guide</a>
          <a onClick={() => navigate("/generate-recipe")} style={{cursor:"pointer"}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.912 3.874L18 8.786l-3 2.924.708 4.138L12 13.85l-3.708 1.998L9 11.71 6 8.786l4.088-1.912z"/></svg>
            Generate
          </a>
        </div>
        <div className="search-box">
          {NAVBAR_SVG.search}
          <input
            placeholder="Search nutrients, vitamins, minerals..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="nav-avatar"><ProfileDropdown /></div>
      </nav>

      {/* Page Header */}
      <div className="hg-header">
        <h1 className="hg-title">Health Benefits Guide</h1>
        <p className="hg-subtitle">Discover the importance of essential nutrients, their health benefits, and the best food sources</p>
      </div>

      <div className="hg-content">

        <div className="hg-plan-card">
          <h2 className="hg-plan-title">Health & Diet Planner</h2>
          <p className="hg-plan-subtitle">
            Tell us your health concern or diet goal and get a fully local plan with health benefits, foods to emphasize, and recipes from the built-in library.
          </p>

          <form className="hg-plan-form" onSubmit={submitHealthPlanner}>
            <label>
              Health Issues
              <textarea
                placeholder="Example: diabetes, cholesterol, acidity"
                value={plannerForm.healthIssues}
                onChange={(e) => updatePlannerField("healthIssues", e.target.value)}
              />
            </label>

            <label>
              Diet Goal
              <select
                value={plannerForm.dietGoal}
                onChange={(e) => updatePlannerField("dietGoal", e.target.value)}
              >
                <option value="">Select a goal</option>
                <option value="weight loss">Weight Loss</option>
                <option value="muscle gain">Muscle Gain</option>
                <option value="diabetic friendly">Diabetic Friendly</option>
                <option value="heart healthy">Heart Healthy</option>
                <option value="high protein">High Protein</option>
                <option value="vegan">Vegan</option>
                <option value="vegetarian">Vegetarian</option>
              </select>
            </label>

            <label>
              Meal Type
              <select
                value={plannerForm.mealType}
                onChange={(e) => updatePlannerField("mealType", e.target.value)}
              >
                <option value="">Any meal</option>
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Snack">Snack</option>
              </select>
            </label>

            <label>
              Avoid Ingredients
              <input
                type="text"
                placeholder="Example: peanuts, shellfish"
                value={plannerForm.avoidIngredients}
                onChange={(e) => updatePlannerField("avoidIngredients", e.target.value)}
              />
            </label>

            <label>
              Preferences
              <input
                type="text"
                placeholder="Example: Indian spicy, low oil, quick meals"
                value={plannerForm.preferences}
                onChange={(e) => updatePlannerField("preferences", e.target.value)}
              />
            </label>

            <label>
              Max Prep Time (minutes)
              <input
                type="number"
                min="1"
                max="180"
                value={plannerForm.maxPrepTime}
                onChange={(e) => updatePlannerField("maxPrepTime", e.target.value)}
              />
            </label>

            <button className="hg-plan-submit" disabled={plannerLoading}>
              {plannerLoading ? "Building Plan..." : "Build My Health Plan"}
            </button>
          </form>

          {plannerError && <p className="hg-plan-error">{plannerError}</p>}

          {topicBanner && (
            <div style={{background:'#fff7ed',border:'1px solid #ffe3c7',padding:12,borderRadius:10,marginTop:12}}>
              <strong>{topicBanner}</strong>
            </div>
          )}

          <div ref={plannerRef} />

          {plannerResult && (
            <div className="hg-plan-result">
              <div className="hg-plan-summary-block">
                <p className="hg-plan-summary">{plannerResult.summary}</p>
                {plannerResult.matched_concerns?.length > 0 && (
                  <div className="hg-plan-chip-row">
                    {plannerResult.matched_concerns.map((concern) => (
                      <span key={concern} className="hg-plan-chip">{concern}</span>
                    ))}
                  </div>
                )}
              </div>

              {plannerResult.relevant_health_benefits?.length > 0 && (
                <div className="hg-plan-benefit-section">
                  <h3>Relevant Health Benefits</h3>
                  <div className="hg-plan-benefit-grid">
                    {plannerResult.relevant_health_benefits.map((benefit) => (
                      <div key={benefit.title} className="hg-plan-benefit-card">
                        <p className="hg-plan-benefit-title">{benefit.title}</p>
                        <p className="hg-plan-benefit-detail">{benefit.detail}</p>
                        <span className="hg-plan-benefit-source">Source: {benefit.source}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="hg-plan-grid">
                <div className="hg-plan-foods">
                  <h3>Recommended Foods</h3>
                  {plannerResult.recommended_foods.map((food, index) => (
                    <div key={index} className="hg-plan-food-card">
                      <p className="hg-plan-food-name">{food.name}</p>
                      <p className="hg-plan-food-source">Source: {food.source}</p>
                      <p className="hg-plan-food-reason">{food.reason}</p>
                      <p className="hg-plan-food-usage">How to use: {food.usage}</p>
                    </div>
                  ))}
                </div>

                <div className="hg-plan-avoid">
                  <h3>Foods to Limit</h3>
                  {plannerResult.avoid_foods.length === 0 ? (
                    <p className="hg-plan-muted">No specific avoid list from your current input.</p>
                  ) : (
                    <ul>
                      {plannerResult.avoid_foods.map((food, index) => (
                        <li key={index}>{food}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="hg-plan-recipes">
                <h3>Recommended Recipes to Prepare</h3>
                <div className="hg-plan-recipe-grid">
                  {plannerResult.recipes.map((recipe) => (
                    <div key={recipe.id} className="hg-plan-recipe-card">
                      <img src={recipe.image} alt={recipe.title} />
                      <div className="hg-plan-recipe-body">
                        <p className="hg-plan-recipe-title">{recipe.title}</p>
                        <p className="hg-plan-recipe-meta">{recipe.meal} • {recipe.time} • {recipe.diet}</p>
                        <p className="hg-plan-recipe-reason">{recipe.reason}</p>
                        {Array.isArray(recipe.healthBenefits) && recipe.healthBenefits.length > 0 && (
                          <div className="hg-plan-recipe-tags">
                            {recipe.healthBenefits.map((benefit) => (
                              <span key={benefit} className="hg-plan-recipe-tag">{benefit}</span>
                            ))}
                          </div>
                        )}
                        {Array.isArray(recipe.steps) && recipe.steps.length > 0 && (
                          <p className="hg-plan-recipe-step">First step: {recipe.steps[0]}</p>
                        )}
                        {recipe.id >= 0 ? (
                          <button onClick={() => navigate(`/recipe/${recipe.id}`)}>Open Full Recipe</button>
                        ) : (
                          <button type="button" disabled title="Generated plan recipe">
                            Custom Plan Recipe
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {plannerResult.lifestyle_tips.length > 0 && (
                <div className="hg-plan-tips">
                  <h3>Lifestyle Tips</h3>
                  <ul>
                    {plannerResult.lifestyle_tips.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {plannerRelatedArticles.length > 0 && (
                <div className="hg-plan-articles">
                  <h3>Related Health Articles</h3>
                  <div className="hg-plan-article-links">
                    {plannerRelatedArticles.map((article) => (
                      <a
                        key={article.key}
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {article.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <p className="hg-plan-disclaimer">{plannerResult.disclaimer}</p>
            </div>
          )}
        </div>

        {/* Analyze Section */}
        <div className="hg-analyze-card">
          <h2 className="hg-analyze-title">
            <span className="hg-analyze-icon">📷</span>
            Analyze Your Recipe
          </h2>
          <p className="hg-analyze-sub">Upload an image of your dish to discover its nutritional profile and get suggestions to enhance it</p>

          {/* Drop Zone */}
          <div
            className={`hg-dropzone ${dragOver ? "hg-dropzone-over" : ""}`}
            onClick={() => fileInputRef.current.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
          >
            {preview ? (
              <img src={preview} alt="Uploaded recipe" className="hg-preview-img" />
            ) : (
              <>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <p className="hg-drop-text">Drag and drop your recipe image here</p>
                <p className="hg-drop-or">or</p>
              </>
            )}
            <button
              className="hg-choose-btn"
              onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }}
            >
              {preview ? "Change Image" : "Choose File"}
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={onFileChange}
          />

          {/* Analyzing spinner */}
          {analyzing && (
            <div className="hg-analyzing">
              <div className="hg-spinner" />
              <span>Analyzing your recipe for nutritional content...</span>
            </div>
          )}

          {/* Analysis Result */}
          {result && (
            <div className="hg-result">
              <h3 className="hg-result-title">⚠️ Missing Nutrients Detected</h3>
              <p className="hg-result-sub">
                Your dish appears to be low in the following nutrients. Add these ingredients to enrich your recipe:
              </p>
              <div className="hg-result-grid">
                {result.map((n, i) => (
                  <div className="hg-result-card" key={i}>
                    <div className="hg-result-card-top">
                      <span className="hg-result-emoji" style={{ background: n.color + "20", color: n.color }}>
                        {n.emoji}
                      </span>
                      <span className="hg-result-name">{n.name}</span>
                    </div>
                    <p className="hg-result-suggestion">Add these ingredients to boost <strong>{n.name}</strong>:</p>
                    <ul className="hg-result-ingredients">
                      {n.ingredients.map((ing, j) => (
                        <li key={j}>
                          <span className="hg-result-dot" style={{ background: n.color }} />
                          {ing}
                        </li>
                      ))}
                    </ul>
                    {nutrientArticles[n.slug] ? (
                      <a
                        className="hg-article-link"
                        href={nutrientArticles[n.slug].url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Read: {nutrientArticles[n.slug].title}
                      </a>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Nutrient Cards Grid */}
        <div className="hg-nutrients-grid">
          {visibleNutrients.length === 0 ? (
            <div style={{gridColumn:"1/-1",textAlign:"center",padding:"40px 20px",color:"#888"}}>
              <div style={{fontSize:"2.5rem",marginBottom:"10px"}}>🔍</div>
              <p style={{fontWeight:600,color:"#555",marginBottom:"8px"}}>No nutrients match &ldquo;{search}&rdquo;</p>
              <button style={{background:"#ff6a00",color:"#fff",border:"none",borderRadius:"8px",padding:"8px 20px",fontWeight:600,cursor:"pointer"}} onClick={() => setSearch("")}>Clear</button>
            </div>
          ) : visibleNutrients.map((n, i) => (
            <div
              ref={(el) => { if (el) nutRefs.current[n.slug] = el; }}
              className={`hg-nutrient-card ${focusedSlug === n.slug ? 'hg-highlight' : ''}`}
              key={i}
            >
              <span className="hg-nutrient-emoji" style={{ background: n.color + "18" }}>
                {n.emoji}
              </span>
              <h3 className="hg-nutrient-name">{n.name}</h3>
              <p className="hg-nutrient-desc">{n.desc}</p>
              <div className="hg-nutrient-actions">
                <button className="hg-learn-btn" style={{ color: n.color }} onClick={() => navigate("/nutrient/" + n.slug)}>
                  Learn More &rsaquo;
                </button>
                {nutrientArticles[n.slug] ? (
                  <a
                    className="hg-article-link"
                    href={nutrientArticles[n.slug].url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Health Article
                  </a>
                ) : null}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default HealthGuide;
