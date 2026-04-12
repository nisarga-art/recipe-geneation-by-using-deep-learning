import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ChefHat,
  CheckCircle2,
  CircleX,
  Clock3,
  Copy,
  Download,
  Flame,
  Leaf,
  Loader2,
  RotateCcw,
  Save,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { addRecipeToStorage } from "../lib/recipeStorage";
import ProfileDropdown from "../components/ProfileDropdown";
import "../styles/GenerateRecipe.css";

const cuisineOptions = ["Indian", "South Indian", "North Indian", "Indo-Chinese", "Italian", "Japanese", "Mexican"];
const mealTypeOptions = ["Breakfast", "Lunch", "Dinner", "Snack"];
const dietTypeOptions = ["Vegetarian", "Non Vegetarian", "Eggetarian", "Vegan"];
const difficultyOptions = ["Easy", "Medium", "Hard"];
const ingredientQuickPicks = [
  "paneer",
  "potato",
  "chicken",
  "tofu",
  "spinach",
  "mushroom",
  "rice",
  "lentils",
  "capsicum",
  "broccoli",
];

const cuisinePantry = {
  Indian: ["onion", "tomato", "ginger", "garlic", "coriander", "garam masala"],
  "South Indian": ["mustard seeds", "curry leaves", "coconut", "turmeric", "toor dal", "tamarind"],
  "North Indian": ["cumin", "kasuri methi", "green chili", "ginger", "curd", "ghee"],
  "Indo-Chinese": ["soy sauce", "ginger", "garlic", "spring onion", "vinegar", "pepper"],
  Italian: ["olive oil", "oregano", "basil", "tomato", "garlic", "parmesan"],
  Japanese: ["soy sauce", "sesame", "ginger", "rice vinegar", "scallion", "miso"],
  Mexican: ["jalapeno", "beans", "corn", "lime", "cilantro", "paprika"],
};

const parseIngredients = (text) =>
  text
    .split(/[\n,]/)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

const serializeIngredients = (items) => items.join(", ");

const titleCase = (value) => value.replace(/\b\w/g, (char) => char.toUpperCase());

const randomPick = (items) => items[Math.floor(Math.random() * items.length)];

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

let imageCaptionPipelinePromise = null;
let zeroShotImagePipelinePromise = null;

const loadImageCaptionPipeline = async () => {
  if (!imageCaptionPipelinePromise) {
    imageCaptionPipelinePromise = (async () => {
      const { env, pipeline } = await import("@xenova/transformers");
      env.allowLocalModels = false;
      env.useBrowserCache = true;
      return pipeline("image-to-text", "Xenova/blip-image-captioning-base");
    })();
  }
  return imageCaptionPipelinePromise;
};

const loadZeroShotImagePipeline = async () => {
  if (!zeroShotImagePipelinePromise) {
    zeroShotImagePipelinePromise = (async () => {
      const { env, pipeline } = await import("@xenova/transformers");
      env.allowLocalModels = false;
      env.useBrowserCache = true;
      return pipeline("zero-shot-image-classification", "Xenova/clip-vit-base-patch32");
    })();
  }
  return zeroShotImagePipelinePromise;
};

const extractCaption = (result) => {
  if (Array.isArray(result)) {
    const first = result[0];
    return first?.generated_text ?? first?.text ?? "";
  }

  if (result && typeof result === "object") {
    return result.generated_text ?? result.text ?? "";
  }

  return "";
};

const dishProfiles = [
  {
    keywords: ["paneer", "cottage cheese", "paneer cubes", "indian cottage cheese"],
    title: "Paneer Butter Masala",
    cuisine: "Indian",
    mealType: "Dinner",
    dietType: "Vegetarian",
    difficulty: "Medium",
    spiceLevel: 3,
    maxCookTime: 45,
    ingredients: ["paneer", "tomato", "butter", "cream", "garam masala", "ginger", "garlic"],
    notes: ["Creamy tomato gravy cues detected.", "Best matched for paneer-style curry plating."],
  },
  {
    keywords: ["biryani", "rice", "spiced rice", "layered", "mint", "onion"],
    title: "Aromatic Biryani",
    cuisine: "Indian",
    mealType: "Dinner",
    dietType: "Non Vegetarian",
    difficulty: "Hard",
    spiceLevel: 4,
    maxCookTime: 60,
    ingredients: ["rice", "onion", "mint", "yogurt", "whole spices", "saffron"],
    notes: ["Layered rice cues detected.", "Aromatic whole-spice profile matched."],
  },
  {
    keywords: ["pasta", "spaghetti", "noodles", "noodle", "sauce", "tomato"],
    title: "Herbed Pasta Bowl",
    cuisine: "Italian",
    mealType: "Dinner",
    dietType: "Vegetarian",
    difficulty: "Medium",
    spiceLevel: 2,
    maxCookTime: 35,
    ingredients: ["pasta", "tomato", "garlic", "olive oil", "basil", "parmesan"],
    notes: ["Twirl-able noodle or pasta cues detected.", "Tomato-herb profile matched."],
  },
  {
    keywords: ["pizza", "flatbread", "cheese", "slice", "baked"],
    title: "Stone-Baked Pizza",
    cuisine: "Italian",
    mealType: "Dinner",
    dietType: "Vegetarian",
    difficulty: "Medium",
    spiceLevel: 2,
    maxCookTime: 40,
    ingredients: ["flour", "tomato", "mozzarella", "basil", "olive oil"],
    notes: ["Baked cheesy profile detected.", "Pizza-style plating matched."],
  },
  {
    keywords: ["salad", "greens", "leafy", "cucumber", "fresh"],
    title: "Fresh Grain Salad",
    cuisine: "Mediterranean",
    mealType: "Lunch",
    dietType: "Vegan",
    difficulty: "Easy",
    spiceLevel: 1,
    maxCookTime: 15,
    ingredients: ["greens", "cucumber", "tomato", "olive oil", "lemon", "herbs"],
    notes: ["Fresh and green cues detected.", "Light lunch profile matched."],
  },
  {
    keywords: ["curry", "gravy", "sauce", "masala", "dal", "stew"],
    title: "Comfort Curry Plate",
    cuisine: "Indian",
    mealType: "Dinner",
    dietType: "Vegetarian",
    difficulty: "Medium",
    spiceLevel: 4,
    maxCookTime: 45,
    ingredients: ["onion", "tomato", "ginger", "garlic", "cumin", "coriander"],
    notes: ["Saucy curry cues detected.", "Comfort-food gravy profile matched."],
  },
  {
    keywords: ["soup", "broth", "bowl", "warm", "steam"],
    title: "Golden Soup Bowl",
    cuisine: "Japanese",
    mealType: "Lunch",
    dietType: "Vegetarian",
    difficulty: "Easy",
    spiceLevel: 2,
    maxCookTime: 25,
    ingredients: ["broth", "ginger", "carrot", "mushroom", "spring onion"],
    notes: ["Warm bowl cues detected.", "Light broth profile matched."],
  },
  {
    keywords: ["dosa", "idli", "south indian", "crepe", "savory pancake"],
    title: "Crispy Dosa Platter",
    cuisine: "South Indian",
    mealType: "Breakfast",
    dietType: "Vegetarian",
    difficulty: "Medium",
    spiceLevel: 2,
    maxCookTime: 45,
    ingredients: ["rice", "lentils", "coconut", "curry leaves", "mustard seeds"],
    notes: ["South Indian breakfast cues detected.", "Crisp batter-based profile matched."],
  },
  {
    keywords: ["burger", "sandwich", "bun", "patty", "fries"],
    title: "Loaded Veg Burger",
    cuisine: "American",
    mealType: "Lunch",
    dietType: "Vegetarian",
    difficulty: "Easy",
    spiceLevel: 2,
    maxCookTime: 25,
    ingredients: ["bun", "patty", "lettuce", "tomato", "onion", "cheese"],
    notes: ["Stacked handheld cues detected.", "Burger-style build matched."],
  },
  {
    keywords: ["taco", "tortilla", "wrap", "salsa", "mexican"],
    title: "Street Style Tacos",
    cuisine: "Mexican",
    mealType: "Dinner",
    dietType: "Non Vegetarian",
    difficulty: "Medium",
    spiceLevel: 3,
    maxCookTime: 30,
    ingredients: ["tortilla", "beans", "corn", "lime", "cilantro"],
    notes: ["Handheld wrap cues detected.", "Taco-style profile matched."],
  },
];

const scoreProfile = (text, profile) => {
  const normalized = text.toLowerCase();
  return profile.keywords.reduce((score, keyword) => {
    if (normalized.includes(keyword)) {
      return score + Math.max(2, keyword.length / 3);
    }
    return score;
  }, 0);
};

const extractZeroShotScores = (result) => {
  const rows = Array.isArray(result) ? result : [];
  const scores = {};

  for (const row of rows) {
    if (!row?.label) {
      continue;
    }

    const title = row.label.split("|")[0]?.trim();
    if (title) {
      scores[title] = row.score ?? 0;
    }
  }

  return scores;
};

const inferDishProfile = (caption, fileName, zeroShotScores, previousTitle) => {
  const captionText = caption.toLowerCase();
  const fileText = fileName.replace(/[-_]/g, " ").toLowerCase();

  const ranked = dishProfiles
    .map((profile) => {
      const captionScore = scoreProfile(captionText, profile);
      const fileScore = scoreProfile(fileText, profile);
      const textScore = clamp(captionScore * 12 + fileScore * 3, 0, 100);
      const visionScore = clamp(Math.round((zeroShotScores[profile.title] ?? 0) * 100), 0, 100);
      const score = Math.round(textScore * 0.4 + visionScore * 0.6);
      return { profile, score };
    })
    .sort((a, b) => b.score - a.score);

  const top = ranked[0];
  const second = ranked[1];

  const best =
    previousTitle &&
    top?.profile.title === previousTitle &&
    second &&
    top.score - second.score <= 8
      ? second.profile
      : top?.profile ?? dishProfiles[5];

  const bestScore =
    previousTitle && top?.profile.title === previousTitle && second && top.score - second.score <= 8
      ? second.score
      : top?.score ?? 48;

  const confidence = clamp(Math.round(bestScore), 45, 97);

  const captionIngredients = caption
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  const extractedIngredients = Array.from(
    new Set([
      ...best.ingredients,
      ...captionIngredients.filter((token) => token.length > 3 && !["plate", "dish", "food", "bowl", "image", "with"].includes(token)),
    ]),
  ).slice(0, 8);

  return {
    caption,
    title: best.title,
    cuisine: best.cuisine,
    mealType: best.mealType,
    dietType: best.dietType,
    difficulty: best.difficulty,
    spiceLevel: best.spiceLevel,
    servings: best.mealType === "Breakfast" ? 1 : 2,
    maxCookTime: best.maxCookTime,
    ingredients: extractedIngredients,
    notes: [
      `Vision caption: ${caption || "No caption returned"}`,
      ...best.notes,
      `Matched using dual vision models (caption + zero-shot classification) at ${confidence}% confidence.`,
    ],
    confidence,
    modelName: "Xenova/blip-image-captioning-base + Xenova/clip-vit-base-patch32",
  };
};

const estimateNutrition = (calories, highProtein, lowOil) => ({
  protein: Math.max(12, Math.round((calories * (highProtein ? 0.32 : 0.2)) / 4)),
  carbs: Math.max(18, Math.round((calories * 0.43) / 4)),
  fat: Math.max(8, Math.round((calories * (lowOil ? 0.2 : 0.28)) / 9)),
});

const buildRecipeFromImageAnalysis = (analysis) => {
  const estimatedCalories = Math.max(260, 250 + analysis.ingredients.length * 22 + analysis.spiceLevel * 10);
  const ingredientTitle = analysis.ingredients[0] ?? "dish";

  return {
    id: crypto.randomUUID(),
    title: analysis.title,
    cuisine: analysis.cuisine,
    mealType: analysis.mealType,
    dietType: analysis.dietType,
    difficulty: analysis.difficulty,
    spiceLevel: analysis.spiceLevel,
    servings: analysis.servings,
    cookTimeMinutes: analysis.maxCookTime,
    estimatedCalories,
    macros: estimateNutrition(estimatedCalories, analysis.dietType === "Non Vegetarian", analysis.spiceLevel <= 2),
    ingredients: analysis.ingredients.map(titleCase),
    steps: [
      `Use the uploaded dish image as the visual reference and prep ${analysis.ingredients[0] ?? "the main ingredient"} first.`,
      "Build the base aromatics and sauce to match the color, texture, and richness shown in the photo.",
      "Cook until the dish reaches a similar consistency and visual finish to the reference image.",
      "Balance salt, acid, and spice at the end so the flavor profile aligns with the captured caption.",
      "Plate with a garnish that matches the dish style and serve immediately.",
    ],
    tips: [
      `Image model: ${analysis.modelName}`,
      `Caption confidence: ${analysis.confidence}%`,
      ...analysis.notes,
      "If you want an exact match, upload a clearer, closer crop of the finished dish.",
    ],
    imageUrl: `https://www.themealdb.com/images/ingredients/${encodeURIComponent(ingredientTitle)}.png`,
    createdAt: new Date().toISOString(),
  };
};

const MEAL_DB_BASE_URL = "https://www.themealdb.com/api/json/v1/1";
const beefKeywords = ["beef", "steak", "brisket", "oxtail", "corned beef", "beefy"];

const isBeefText = (value) => beefKeywords.some((keyword) => value.toLowerCase().includes(keyword));

const isBeefMeal = (meal) => {
  if (isBeefText(meal.strMeal || "")) return true;
  if (isBeefText(meal.strCategory || "")) return true;

  for (let index = 1; index <= 20; index += 1) {
    const ingredient = meal[`strIngredient${index}`]?.trim().toLowerCase();
    if (ingredient && isBeefText(ingredient)) {
      return true;
    }
  }

  return false;
};

const normalizedCuisineForApi = (cuisine) => {
  if (["South Indian", "North Indian", "Indo-Chinese"].includes(cuisine)) {
    return "Indian";
  }
  return cuisine;
};

const extractIngredientsFromApiMeal = (meal) => {
  const list = [];
  for (let index = 1; index <= 20; index += 1) {
    const ingredient = meal[`strIngredient${index}`]?.trim();
    const measure = meal[`strMeasure${index}`]?.trim();

    if (!ingredient) continue;
    list.push(measure ? `${measure} ${ingredient}` : ingredient);
  }
  return list;
};

const buildDetailedSteps = (instructions) => {
  const compact = instructions
    .replace(/\r/g, "\n")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join(" ");

  const rawSteps = compact
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map((step) => step.trim())
    .filter((step) => step.length > 18);

  if (rawSteps.length >= 6) {
    return rawSteps.slice(0, 12);
  }

  return [
    "Prep all ingredients, wash and cut everything to even sizes for consistent cooking.",
    "Heat your pan and add aromatics first; saute until they smell rich and flavorful.",
    ...rawSteps,
    "Taste and adjust salt, spice, and acidity before finishing the dish.",
    "Rest for 2 to 3 minutes before serving so flavors settle nicely.",
  ].slice(0, 10);
};

const pickMealFromSearch = (meals, form) => {
  const cuisine = normalizedCuisineForApi(form.cuisine).toLowerCase();
  const allowedMeals = meals.filter((meal) => !isBeefMeal(meal));
  return allowedMeals.find((meal) => meal.strArea?.toLowerCase() === cuisine) ?? allowedMeals[0] ?? null;
};

const toGeneratedRecipeFromApi = (meal, form) => {
  const steps = buildDetailedSteps(meal.strInstructions || "");
  const ingredients = extractIngredientsFromApiMeal(meal).slice(0, 18);
  const estimatedCookTime = Math.min(120, Math.max(20, Math.round(steps.length * 6 + 8)));
  const estimatedCalories = Math.max(220, 240 + ingredients.length * 18 + form.servings * 35 + form.spiceLevel * 8);

  return {
    id: crypto.randomUUID(),
    title: meal.strMeal,
    cuisine: meal.strArea || form.cuisine,
    mealType: form.mealType,
    dietType: form.dietType,
    difficulty: form.difficulty,
    spiceLevel: form.spiceLevel,
    servings: form.servings,
    cookTimeMinutes: Math.min(form.maxCookTime, estimatedCookTime),
    estimatedCalories,
    macros: estimateNutrition(estimatedCalories, form.highProtein, form.lowOil),
    ingredients,
    steps,
    tips: [
      "Read all steps once before you start to avoid interruptions while cooking.",
      `Serve this ${form.mealType.toLowerCase()} dish hot for best texture and flavor.`,
      form.lowOil
        ? "Use a non-stick pan and add small splashes of water while sauteing instead of extra oil."
        : "Finish with a small drizzle of fat (ghee/olive oil) for richer aroma.",
    ],
    imageUrl: meal.strMealThumb,
    createdAt: new Date().toISOString(),
  };
};

const fetchJson = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  return response.json();
};

const lookupFirstNonBeefMeal = async (meals) => {
  for (const item of meals) {
    const lookupUrl = `${MEAL_DB_BASE_URL}/lookup.php?i=${encodeURIComponent(item.idMeal)}`;
    const lookupData = await fetchJson(lookupUrl);
    const meal = lookupData.meals?.[0];
    if (meal && !isBeefMeal(meal)) {
      return meal;
    }
  }
  return null;
};

const fetchApiRecipe = async (form) => {
  const normalizedCuisine = normalizedCuisineForApi(form.cuisine);
  const ingredients = parseIngredients(form.ingredientsText);

  const queryCandidates = [
    form.recipeIdea.trim(),
    `${normalizedCuisine} ${form.mealType}`,
    ingredients[0] ?? "",
  ].filter(Boolean);

  for (const candidate of queryCandidates) {
    const searchUrl = `${MEAL_DB_BASE_URL}/search.php?s=${encodeURIComponent(candidate)}`;
    const searchData = await fetchJson(searchUrl);
    if (searchData.meals?.length) {
      const meal = pickMealFromSearch(searchData.meals, form);
      if (meal) return toGeneratedRecipeFromApi(meal, form);
    }
  }

  const areaUrl = `${MEAL_DB_BASE_URL}/filter.php?a=${encodeURIComponent(normalizedCuisine)}`;
  const areaData = await fetchJson(areaUrl);
  if (areaData.meals?.length) {
    const nonBeefMeal = await lookupFirstNonBeefMeal(areaData.meals.slice(0, 12));
    if (nonBeefMeal) return toGeneratedRecipeFromApi(nonBeefMeal, form);
  }

  if (ingredients[0]) {
    const ingredientUrl = `${MEAL_DB_BASE_URL}/filter.php?i=${encodeURIComponent(ingredients[0])}`;
    const ingredientData = await fetchJson(ingredientUrl);
    if (ingredientData.meals?.length) {
      const nonBeefMeal = await lookupFirstNonBeefMeal(ingredientData.meals.slice(0, 12));
      if (nonBeefMeal) return toGeneratedRecipeFromApi(nonBeefMeal, form);
    }
  }

  return null;
};

const buildFallbackRecipe = (form) => {
  const userIngredients = parseIngredients(form.ingredientsText).filter((item) => !isBeefText(item)).slice(0, 20);
  const pantryItems = cuisinePantry[form.cuisine] ?? cuisinePantry.Indian;

  const mergedIngredients = Array.from(
    new Set([...userIngredients, ...pantryItems.slice(0, Math.max(3, Math.ceil(form.servings / 2)))]),
  ).slice(0, 14);

  const titleSeed = form.recipeIdea.trim().length > 0 ? form.recipeIdea.trim() : `${form.cuisine} ${form.mealType} Special`;
  const title = titleCase(titleSeed);

  const proteinBoost = form.highProtein ? 110 : 0;
  const oilAdjust = form.lowOil ? -40 : 0;
  const difficultyAdjust = form.difficulty === "Hard" ? 70 : form.difficulty === "Medium" ? 30 : 0;
  const spiceAdjust = form.spiceLevel * 12;

  const estimatedCalories = Math.max(220, 260 + form.servings * 60 + proteinBoost + oilAdjust + spiceAdjust + difficultyAdjust);

  const steps = [
    "Marinate core ingredients with salt, spice, and a little acid for 10 to 15 minutes to build flavor depth.",
    "Heat a heavy pan on medium heat, add aromatics, and cook until translucent and lightly golden.",
    "Add base spices gradually and stir continuously for 60 to 90 seconds so they bloom without burning.",
    "Add main ingredients and cook on medium heat, tossing every 1 to 2 minutes for even cooking.",
    "Add moisture (water/stock) in small batches, then simmer until texture is tender and sauce thickens.",
    "Finish with fresh garnish and rest briefly before plating for better flavor balance.",
  ];

  if (form.lowOil) {
    steps.splice(3, 0, "Use minimal oil and deglaze with water between saute stages to keep the dish light.");
  }
  if (form.highProtein) {
    steps.splice(2, 0, "Prioritize your protein ingredient first so it cooks through while retaining moisture.");
  }

  const tips = [
    `For better flavor, rest the dish for ${Math.max(3, Math.floor(form.spiceLevel / 2) + 2)} minutes before serving.`,
    `Balance the dish with a fresh side like cucumber salad or raita for ${form.mealType.toLowerCase()}.`,
    `If cooking for ${form.servings} servings, prep ingredients in advance to stay under ${form.maxCookTime} minutes.`,
  ];

  const primaryIngredient = mergedIngredients[0] ?? "food";

  return {
    id: crypto.randomUUID(),
    title,
    cuisine: form.cuisine,
    mealType: form.mealType,
    dietType: form.dietType,
    difficulty: form.difficulty,
    spiceLevel: form.spiceLevel,
    servings: form.servings,
    cookTimeMinutes: form.maxCookTime,
    estimatedCalories,
    macros: estimateNutrition(estimatedCalories, form.highProtein, form.lowOil),
    ingredients: mergedIngredients.map(titleCase),
    steps,
    tips,
    imageUrl: `https://www.themealdb.com/images/ingredients/${encodeURIComponent(primaryIngredient)}.png`,
    createdAt: new Date().toISOString(),
  };
};

const spiceLabel = (value) => {
  if (value <= 2) return "Mild";
  if (value <= 3) return "Medium";
  if (value <= 4) return "Hot";
  return "Very Hot";
};

const DEFAULT_FORM = {
  recipeIdea: "",
  ingredientsText: "paneer, onion, tomato",
  cuisine: "Indian",
  mealType: "Dinner",
  dietType: "Vegetarian",
  difficulty: "Medium",
  servings: 2,
  maxCookTime: 35,
  spiceLevel: 3,
  highProtein: false,
  lowOil: false,
};

export default function GenerateRecipe() {
  const navigate = useNavigate();
  const imageInputRef = useRef(null);
  const uploadedImageUrlRef = useRef(null);
  const formRef = useRef(DEFAULT_FORM);

  const [form, setForm] = useState(DEFAULT_FORM);
  const [generatedRecipe, setGeneratedRecipe] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastSavedRecipeId, setLastSavedRecipeId] = useState(null);
  const [uploadedImageName, setUploadedImageName] = useState(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState(null);
  const [uploadedImageAnalysis, setUploadedImageAnalysis] = useState(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [activeTab, setActiveTab] = useState("ingredients");
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    formRef.current = form;
  }, [form]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(null), 3000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => () => {
    if (uploadedImageUrlRef.current) {
      URL.revokeObjectURL(uploadedImageUrlRef.current);
    }
  }, []);

  const canGenerate = useMemo(() => form.ingredientsText.trim().length > 0, [form.ingredientsText]);

  const setField = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const showNotice = (type, text) => {
    setNotice({ type, text });
  };

  const runGeneration = async (inputForm) => {
    const formToUse = inputForm && typeof inputForm === "object" && "ingredientsText" in inputForm ? inputForm : formRef.current;

    if (!formToUse?.ingredientsText?.trim()) {
      showNotice("error", "Please enter at least one ingredient to generate a recipe.");
      return;
    }

    setIsGenerating(true);
    try {
      const apiRecipe = await fetchApiRecipe(formToUse);
      const recipe = apiRecipe ?? buildFallbackRecipe(formToUse);
      setGeneratedRecipe(recipe);
      setLastSavedRecipeId(null);
      showNotice("success", `${recipe.title} is ready with ${recipe.steps.length} detailed steps.`);
    } catch {
      const fallbackRecipe = buildFallbackRecipe(formToUse);
      setGeneratedRecipe(fallbackRecipe);
      setLastSavedRecipeId(null);
      showNotice("error", "Live recipe source unavailable. Generated with local fallback engine.");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSurprise = async () => {
    const cuisine = randomPick(cuisineOptions);
    const mealType = randomPick(mealTypeOptions);
    const dietType = randomPick(dietTypeOptions);

    const nextForm = {
      ...form,
      cuisine,
      mealType,
      dietType,
      difficulty: randomPick(difficultyOptions),
      recipeIdea: `${cuisine} ${mealType} Delight`,
      ingredientsText: (cuisinePantry[cuisine] ?? cuisinePantry.Indian).slice(0, 4).join(", "),
      spiceLevel: Math.max(2, Math.min(5, form.spiceLevel)),
    };

    setForm(nextForm);
    await runGeneration(nextForm);
  };

  const resetForm = () => {
    setForm(DEFAULT_FORM);
    setGeneratedRecipe(null);
    setLastSavedRecipeId(null);
    setUploadedImageAnalysis(null);
  };

  const appendIngredient = (ingredient) => {
    const next = Array.from(new Set([...parseIngredients(form.ingredientsText), ingredient.toLowerCase()]));
    setField("ingredientsText", serializeIngredients(next));
  };

  const clearImageAnalysis = () => {
    if (uploadedImageUrlRef.current) {
      URL.revokeObjectURL(uploadedImageUrlRef.current);
      uploadedImageUrlRef.current = null;
    }

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }

    setUploadedImageName(null);
    setUploadedImagePreview(null);
    setUploadedImageAnalysis(null);
  };

  const analyzeImageFile = async (file) => {
    setIsAnalyzingImage(true);

    try {
      const previewUrl = URL.createObjectURL(file);
      if (uploadedImageUrlRef.current) {
        URL.revokeObjectURL(uploadedImageUrlRef.current);
      }
      uploadedImageUrlRef.current = previewUrl;
      setUploadedImagePreview(previewUrl);
      setUploadedImageName(file.name);

      const [pipelineModule, zeroShotModule, rawImage] = await Promise.all([
        loadImageCaptionPipeline(),
        loadZeroShotImagePipeline(),
        import("@xenova/transformers"),
      ]);

      const { RawImage } = rawImage;
      const visionImage = await RawImage.fromURL(previewUrl);
      const captionOutput = await pipelineModule(visionImage);
      const caption = extractCaption(captionOutput);

      const zeroShotLabels = dishProfiles.map((profile) => `${profile.title} | ${profile.cuisine} | ${profile.mealType}`);
      const zeroShotOutput = await zeroShotModule(visionImage, zeroShotLabels);
      const zeroShotScores = extractZeroShotScores(zeroShotOutput);

      const analysis = inferDishProfile(caption, file.name, zeroShotScores, generatedRecipe?.title ?? null);
      setUploadedImageAnalysis(analysis);

      const recipe = buildRecipeFromImageAnalysis(analysis);
      setGeneratedRecipe(recipe);
      setLastSavedRecipeId(null);

      setForm((previous) => ({
        ...previous,
        recipeIdea: analysis.title,
        cuisine: analysis.cuisine,
        mealType: analysis.mealType,
        dietType: analysis.dietType,
        difficulty: analysis.difficulty,
        servings: analysis.servings,
        maxCookTime: analysis.maxCookTime,
        spiceLevel: analysis.spiceLevel,
        ingredientsText: serializeIngredients(analysis.ingredients),
      }));

      showNotice("success", `${analysis.title} was generated from your uploaded dish image.`);
    } catch {
      showNotice("error", "Image analysis failed. Try a clearer image or use text input mode.");
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const handleImageSelection = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await analyzeImageFile(file);
  };

  const saveRecipe = () => {
    if (!generatedRecipe) return;

    addRecipeToStorage(generatedRecipe);
    setLastSavedRecipeId(generatedRecipe.id);
    showNotice("success", "Recipe saved successfully. You can open Dashboard to review.");
  };

  const copyRecipe = async () => {
    if (!generatedRecipe) return;

    const payload = [
      generatedRecipe.title,
      `${generatedRecipe.cuisine} | ${generatedRecipe.mealType} | ${generatedRecipe.dietType}`,
      "",
      "Ingredients:",
      ...generatedRecipe.ingredients.map((item) => `- ${item}`),
      "",
      "Steps:",
      ...generatedRecipe.steps.map((step, index) => `${index + 1}. ${step}`),
      "",
      "Tips:",
      ...generatedRecipe.tips.map((tip) => `- ${tip}`),
    ].join("\n");

    try {
      await navigator.clipboard.writeText(payload);
      showNotice("success", "Recipe copied to clipboard.");
    } catch {
      showNotice("error", "Clipboard permission is not available.");
    }
  };

  const downloadRecipe = () => {
    if (!generatedRecipe) return;

    const payload = [
      generatedRecipe.title,
      `${generatedRecipe.cuisine} | ${generatedRecipe.mealType} | ${generatedRecipe.dietType}`,
      `Difficulty: ${generatedRecipe.difficulty ?? "Medium"}`,
      `Time: ${generatedRecipe.cookTimeMinutes} min | Calories: ${generatedRecipe.estimatedCalories} kcal`,
      "",
      "Ingredients:",
      ...generatedRecipe.ingredients.map((item) => `- ${item}`),
      "",
      "Cooking Steps:",
      ...generatedRecipe.steps.map((step, index) => `${index + 1}. ${step}`),
      "",
      "Chef Tips:",
      ...generatedRecipe.tips.map((tip) => `- ${tip}`),
    ].join("\n");

    const blob = new Blob([payload], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${generatedRecipe.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const location = useLocation();

  return (
    <div className="gr-page">
      {/* Navbar */}
      <nav className="gr-navbar">
        <div className="logo">🍲 RecipeDiscover</div>

        <div className="nav-links">
          <a onClick={() => navigate("/home")} style={{cursor:"pointer"}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Home
          </a>
          <a onClick={() => navigate("/recipes")} style={{cursor:"pointer"}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            Recipes
          </a>
          <a onClick={() => navigate("/menus")} style={{cursor:"pointer"}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            Menus
          </a>
          <a onClick={() => navigate("/health-guide")} style={{cursor:"pointer"}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            Health Guide
          </a>
          <a className={location.pathname === "/generate-recipe" ? "active" : ""} onClick={() => navigate("/generate-recipe")} style={{cursor:"pointer"}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.912 3.874L18 8.786l-3 2.924.708 4.138L12 13.85l-3.708 1.998L9 11.71 6 8.786l4.088-1.912z"/></svg>
            Recipe Generate
          </a>
        </div>

        <div className="search-box">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            placeholder="Search for dishes or ingredients..."
            disabled
          />
        </div>

        <ProfileDropdown />
      </nav>

      <div className="gr-shell">
        <section className="gr-hero">
          <div>
            <h1>Generate Recipes</h1>
            <p>Build personalized recipes with ingredient-based generation and optional image-based AI inference.</p>
          </div>
          <div className="gr-badge">
            <Sparkles size={14} /> Smart Generator v2
          </div>
        </section>

        {notice ? <div className={`gr-notice ${notice.type}`}>{notice.text}</div> : null}

        <section className="gr-grid">
          <article className="gr-card">
            <div className="gr-card-head">
              <h2>Recipe Inputs</h2>
              <p>Generate from ingredients or upload a dish image.</p>
            </div>

            <div className="gr-card-body">
              <div className="gr-tabs">
                <button type="button" className={`gr-tab ${activeTab === "ingredients" ? "active" : ""}`} onClick={() => setActiveTab("ingredients")}>
                  Text Input
                </button>
                <button type="button" className={`gr-tab ${activeTab === "image" ? "active" : ""}`} onClick={() => setActiveTab("image")}>
                  Image Upload
                </button>
              </div>

              {activeTab === "ingredients" ? (
                <>
                  <div className="gr-field">
                    <label htmlFor="recipe-idea">Recipe idea</label>
                    <input
                      id="recipe-idea"
                      placeholder="Example: Dhaba style paneer curry"
                      value={form.recipeIdea}
                      onChange={(event) => setField("recipeIdea", event.target.value)}
                    />
                  </div>

                  <div className="gr-field">
                    <label htmlFor="ingredients">Ingredients (comma or newline separated)</label>
                    <textarea
                      id="ingredients"
                      rows={4}
                      value={form.ingredientsText}
                      onChange={(event) => setField("ingredientsText", event.target.value)}
                      placeholder="paneer, capsicum, onion, tomato"
                    />
                    <div className="gr-quick-picks">
                      {ingredientQuickPicks.map((ingredient) => (
                        <button key={ingredient} type="button" onClick={() => appendIngredient(ingredient)}>
                          + {titleCase(ingredient)}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="gr-field">
                    <label htmlFor="dish-image">Upload dish image</label>
                    <input id="dish-image" ref={imageInputRef} type="file" accept="image/*" onChange={handleImageSelection} />
                    <p className="gr-file-help">Upload a clear dish photo. Browser model caption + classifier will infer recipe.</p>
                  </div>

                  {uploadedImagePreview ? (
                    <div className="gr-image-box">
                      <img src={uploadedImagePreview} alt={uploadedImageName ?? "Uploaded dish"} />
                      <div className="gr-image-body">
                        <div className="gr-image-meta">
                          <div>
                            <strong>{uploadedImageName ?? "Uploaded image"}</strong>
                          </div>
                          {uploadedImageAnalysis ? <span className="gr-confidence">Confidence {uploadedImageAnalysis.confidence}%</span> : null}
                        </div>

                        {uploadedImageAnalysis ? (
                          <div className="gr-analysis">
                            <p><strong>Suggested dish:</strong> {uploadedImageAnalysis.title}</p>
                            <p><strong>Cuisine:</strong> {uploadedImageAnalysis.cuisine}</p>
                            <p><strong>Caption:</strong> {uploadedImageAnalysis.caption}</p>
                            <p><strong>Model:</strong> {uploadedImageAnalysis.modelName}</p>
                            <p><strong>Ingredients:</strong> {uploadedImageAnalysis.ingredients.join(", ")}</p>
                          </div>
                        ) : null}

                        <div className="gr-actions" style={{ marginTop: 10 }}>
                          <button type="button" className="gr-btn secondary" onClick={() => imageInputRef.current?.click()} disabled={isAnalyzingImage}>
                            Choose another image
                          </button>
                          <button type="button" className="gr-btn ghost" onClick={clearImageAnalysis} disabled={isAnalyzingImage}>
                            Clear image
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="gr-upload-placeholder">Upload a dish image to auto-infer the recipe.</div>
                  )}
                </>
              )}

              <div className="gr-two" style={{ marginTop: 12 }}>
                <div className="gr-field">
                  <label>Cuisine</label>
                  <select value={form.cuisine} onChange={(event) => setField("cuisine", event.target.value)}>
                    {cuisineOptions.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>

                <div className="gr-field">
                  <label>Meal Type</label>
                  <select value={form.mealType} onChange={(event) => setField("mealType", event.target.value)}>
                    {mealTypeOptions.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="gr-two">
                <div className="gr-field">
                  <label>Diet preference</label>
                  <select value={form.dietType} onChange={(event) => setField("dietType", event.target.value)}>
                    {dietTypeOptions.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>

                <div className="gr-field">
                  <label>Difficulty</label>
                  <select value={form.difficulty} onChange={(event) => setField("difficulty", event.target.value)}>
                    {difficultyOptions.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="gr-two">
                <div className="gr-field">
                  <label htmlFor="servings">Servings</label>
                  <input
                    id="servings"
                    type="number"
                    min={1}
                    max={8}
                    value={form.servings}
                    onChange={(event) => setField("servings", Math.max(1, Math.min(8, Number(event.target.value) || 1)))}
                  />
                </div>

                <div className="gr-field">
                  <label htmlFor="max-time">Max cook time (minutes)</label>
                  <input
                    id="max-time"
                    type="number"
                    min={10}
                    max={120}
                    value={form.maxCookTime}
                    onChange={(event) => setField("maxCookTime", Math.max(10, Math.min(120, Number(event.target.value) || 10)))}
                  />
                </div>
              </div>

              <div className="gr-field">
                <label htmlFor="spice-range">Spice Level: {spiceLabel(form.spiceLevel)}</label>
                <input
                  id="spice-range"
                  type="range"
                  min={1}
                  max={5}
                  step={1}
                  value={form.spiceLevel}
                  onChange={(event) => setField("spiceLevel", Number(event.target.value))}
                />
              </div>

              <div className="gr-toggle-wrap">
                <button
                  type="button"
                  onClick={() => setField("highProtein", !form.highProtein)}
                  className={`gr-toggle ${form.highProtein ? "active" : ""}`}
                >
                  High Protein
                </button>
                <button
                  type="button"
                  onClick={() => setField("lowOil", !form.lowOil)}
                  className={`gr-toggle ${form.lowOil ? "active" : ""}`}
                >
                  Low Oil
                </button>
              </div>

              <div className="gr-actions" style={{ marginTop: 12 }}>
                <button type="button" className="gr-btn primary" onClick={() => runGeneration()} disabled={isGenerating || !canGenerate}>
                  {isGenerating ? <Loader2 size={16} className="spin" /> : <ChefHat size={16} />} Generate Recipe
                </button>
                <button type="button" className="gr-btn secondary" onClick={generateSurprise} disabled={isGenerating}>
                  <WandSparkles size={16} /> Surprise Me
                </button>
                <button type="button" className="gr-btn ghost" onClick={resetForm} disabled={isGenerating}>
                  <RotateCcw size={16} /> Reset
                </button>
              </div>
            </div>
          </article>

          <article className="gr-card">
            <div className="gr-card-head">
              <h2>Generated Output</h2>
              <p>Get ingredients, steps, and nutrition insights based on your preferences.</p>
            </div>
            <div className="gr-card-body">
              {!generatedRecipe ? (
                <div className="gr-empty">
                  <Sparkles size={38} color="#f59e0b" />
                  <p>Your generated recipe will appear here with ingredients, steps, and tips.</p>
                </div>
              ) : (
                <>
                  <div className="gr-output-image">
                    <img src={generatedRecipe.imageUrl} alt={generatedRecipe.title} />
                    <div className="gr-output-pad">
                      <h3>{generatedRecipe.title}</h3>
                      <div className="gr-output-tags">
                        <span>{generatedRecipe.cuisine}</span>
                        <span>{generatedRecipe.mealType}</span>
                        <span>{generatedRecipe.dietType}</span>
                        <span>{generatedRecipe.difficulty ?? "Medium"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="gr-three" style={{ marginBottom: 12 }}>
                    <div className="gr-stat">
                      <p>Cook Time</p>
                      <strong><Clock3 size={15} /> {generatedRecipe.cookTimeMinutes} min</strong>
                    </div>
                    <div className="gr-stat">
                      <p>Spice</p>
                      <strong><Flame size={15} /> {spiceLabel(generatedRecipe.spiceLevel)}</strong>
                    </div>
                    <div className="gr-stat">
                      <p>Calories</p>
                      <strong><Leaf size={15} /> {generatedRecipe.estimatedCalories} kcal</strong>
                    </div>
                  </div>

                  <div className="gr-three" style={{ marginBottom: 12 }}>
                    <div className="gr-stat"><p>Protein</p><strong>{generatedRecipe.macros?.protein ?? "-"} g</strong></div>
                    <div className="gr-stat"><p>Carbs</p><strong>{generatedRecipe.macros?.carbs ?? "-"} g</strong></div>
                    <div className="gr-stat"><p>Fat</p><strong>{generatedRecipe.macros?.fat ?? "-"} g</strong></div>
                  </div>

                  <div className="gr-output-lists">
                    <div>
                      <h4>Ingredients</h4>
                      <ul>
                        {generatedRecipe.ingredients.map((ingredient) => (
                          <li key={ingredient}>{ingredient}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4>Chef Tips</h4>
                      <ul>
                        {generatedRecipe.tips.map((tip) => (
                          <li key={tip}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="gr-steps" style={{ marginTop: 12 }}>
                    <h4>Cooking Steps</h4>
                    <ol>
                      {generatedRecipe.steps.map((step, index) => (
                        <li key={`${index}-${step}`}>{step}</li>
                      ))}
                    </ol>
                  </div>

                  <div className="gr-output-actions" style={{ marginTop: 12 }}>
                    <button type="button" className="gr-btn primary" onClick={saveRecipe}><Save size={16} /> Save</button>
                    <button type="button" className="gr-btn secondary" onClick={copyRecipe}><Copy size={16} /> Copy</button>
                    <button type="button" className="gr-btn secondary" onClick={downloadRecipe}><Download size={16} /> Download</button>
                    <button type="button" className="gr-btn ghost" onClick={() => runGeneration()} disabled={isGenerating}><Sparkles size={16} /> Regenerate</button>
                  </div>

                  <div className="gr-save-state">
                    <span>
                      {lastSavedRecipeId === generatedRecipe.id ? (
                        <><CheckCircle2 size={15} color="#16a34a" /> Saved successfully.</>
                      ) : (
                        <><CircleX size={15} color="#6b7280" /> Not saved yet.</>
                      )}
                    </span>
                    <Link to="/dashboard">Open Dashboard</Link>
                  </div>
                </>
              )}
            </div>
          </article>
        </section>

        <div style={{ marginTop: 12 }}>
          <button type="button" className="gr-btn ghost" onClick={() => navigate("/home")}>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
