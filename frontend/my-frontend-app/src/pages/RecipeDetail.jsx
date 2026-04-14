import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import allRecipes from "../data/allRecipes";
import recipesData from "../data/recipes";
import "../styles/RecipeDetail.css";

// Estimate macros from calories if detailed nutrition is missing.
function estimateNutritionFromCalories(calories) {
  // reasonable default split: 20% protein, 55% carbs, 25% fat
  const proteinCals = calories * 0.20;
  const carbsCals = calories * 0.55;
  const fatCals = calories * 0.25;
  return {
    protein: proteinCals / 4,
    carbs: carbsCals / 4,
    fat: fatCals / 9,
    fiber: Math.max(0, Math.round((calories / 100) * 1.5)),
  };
}

const SUBSTITUTES = {
  Cream: ["Yogurt", "Coconut cream", "Milk + Butter"],
  "Kasuri Methi": ["Fenugreek leaves", "Dried fenugreek"],
  Saffron: ["Turmeric (color only)", "Annatto"],
  "Curry Leaves": ["Lime zest", "Bay leaf (different flavor)"] ,
  "Sesame Oil": ["Vegetable oil + sesame seeds", "Peanut oil"],
  "Heavy Cream": ["Greek yogurt", "Coconut cream", "Milk + butter"],
};

function findSubstitutes(item) {
  if (!item) return [];
  const key = Object.keys(SUBSTITUTES).find(k => k.toLowerCase() === item.toLowerCase());
  return key ? SUBSTITUTES[key] : [];
}

function asArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string" && value.trim()) return value.split(/[\n,;]+/).map((part) => part.trim()).filter(Boolean);
  return [];
}

function mapHealthTagToSlug(tag) {
  if (!tag) return null;
  const t = tag.toLowerCase();
  if (t.includes('protein')) return 'protein';
  if (t.includes('fiber')) return 'dietary-fiber';
  if (t.includes('vitamin c') || t.includes('vit c')) return 'vitamin-c';
  if (t.includes('vitamin d') || t.includes('vit d')) return 'vitamin-d';
  if (t.includes('omega')) return 'omega-3';
  if (t.includes('iron')) return 'iron';
  if (t.includes('calcium')) return 'calcium';
  if (t.includes('carb') || t.includes('carbo')) return 'carbohydrates';
  // fallback: no direct slug known
  return null;
}

const PLATFORMS = [
  {
    name: "Amazon",
    color: "#ff9900",
    logo: "🛒",
    url: (item, recipe) =>
      `https://www.amazon.in/s?k=${encodeURIComponent(item + " for " + recipe)}`,
  },
  {
    name: "Flipkart",
    color: "#2874f0",
    logo: "🏪",
    url: (item, recipe) =>
      `https://www.flipkart.com/search?q=${encodeURIComponent(item + " for " + recipe)}`,
  },
  {
    name: "Zepto",
    color: "#9b1fe8",
    logo: "⚡",
    url: (item, recipe) =>
      `https://www.zeptonow.com/search?query=${encodeURIComponent(item + " for " + recipe)}`,
  },
  {
    name: "Blinkit",
    color: "#f5c518",
    logo: "🟡",
    url: (item, recipe) =>
      `https://blinkit.com/s/?q=${encodeURIComponent(item + " for " + recipe)}`,
  },
  {
    name: "Freshmart",
    color: "#22c55e",
    logo: "🥬",
    url: (item, recipe) =>
      `https://www.freshmart.in/search?keyword=${encodeURIComponent(item + " for " + recipe)}`,
  },
];

const ORDER_PLATFORMS = [
  {
    name: "Swiggy",
    color: "#f1511b",
    logo: "🛵",
    url: (recipeName) =>
      `https://www.swiggy.com/search?query=${encodeURIComponent(recipeName)}`,
  },
  {
    name: "Zomato",
    color: "#d73008",
    logo: "🍽️",
    url: (recipeName) =>
      `https://www.zomato.com/search?query=${encodeURIComponent(recipeName)}`,
  },
];

function OrderModal({ recipeName, onClose }) {
  return (
    <div className="rd-modal-overlay" onClick={onClose}>
      <div className="rd-modal" onClick={e => e.stopPropagation()}>
        <div className="rd-modal-header">
          <div>
            <p className="rd-modal-label">Order Online</p>
            <h3 className="rd-modal-item">{recipeName}</h3>
            <p className="rd-modal-sub">Find this dish from nearby restaurants</p>
          </div>
          <button className="rd-modal-close" onClick={onClose}>✕</button>
        </div>
        <p className="rd-modal-hint">Choose a delivery platform:</p>
        <div className="rd-platform-list">
          {ORDER_PLATFORMS.map(p => (
            <a
              key={p.name}
              className="rd-platform-btn"
              href={p.url(recipeName)}
              target="_blank"
              rel="noopener noreferrer"
              style={{ "--platform-color": p.color }}
            >
              <span className="rd-platform-logo">{p.logo}</span>
              <span className="rd-platform-name">{p.name}</span>
              <span className="rd-platform-arrow">→</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function BuyModal({ item, recipeName, onClose }) {
  return (
    <div className="rd-modal-overlay" onClick={onClose}>
      <div className="rd-modal" onClick={e => e.stopPropagation()}>
        <div className="rd-modal-header">
          <div>
            <p className="rd-modal-label">Buy Ingredient</p>
            <h3 className="rd-modal-item">{item}</h3>
            <p className="rd-modal-sub">for <em>{recipeName}</em></p>
          </div>
          <button className="rd-modal-close" onClick={onClose}>✕</button>
        </div>
        <p className="rd-modal-hint">Choose a platform to shop on:</p>
        <div className="rd-platform-list">
          {PLATFORMS.map(p => (
            <a
              key={p.name}
              className="rd-platform-btn"
              href={p.url(item, recipeName)}
              target="_blank"
              rel="noopener noreferrer"
              style={{ "--platform-color": p.color }}
            >
              <span className="rd-platform-logo">{p.logo}</span>
              <span className="rd-platform-name">{p.name}</span>
              <span className="rd-platform-arrow">→</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const listContext = location.state?.listContext || null;
  const editRequested = new URLSearchParams(location.search).get("edit") === "1";
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [buyItem, setBuyItem] = useState(null);
  const [orderOpen, setOrderOpen] = useState(false);
  const [localRecipe, setLocalRecipe] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [saveCopyBusy, setSaveCopyBusy] = useState(false);
  const [regenerateBusy, setRegenerateBusy] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [editForm, setEditForm] = useState(null);

  const splitLines = (value) =>
    String(value || "")
      .split(/[\n,;]+/)
      .map((part) => part.trim())
      .filter(Boolean);

  const formatLines = (value) =>
    Array.isArray(value) ? value.filter(Boolean).join("\n") : "";

  const buildEditForm = (data) => ({
    title: data.title || "",
    cuisine: data.cuisine || "",
    diet: data.diet || "",
    time: data.time || "",
    calories: data.calories ?? "",
    difficulty: data.difficulty || "",
    meal: data.meal || "",
    image: data.image || "",
    cultural: data.cultural || "",
    pantry_match: data.pantryMatch ?? data.pantry_match ?? "",
    ingredients_available: formatLines(data.ingredients?.available),
    ingredients_missing: formatLines(data.ingredients?.missing),
    nutrition_protein: data.nutrition?.protein ?? "",
    nutrition_carbs: data.nutrition?.carbs ?? "",
    nutrition_fat: data.nutrition?.fat ?? "",
    nutrition_fiber: data.nutrition?.fiber ?? "",
    steps: formatLines(data.steps),
    health_benefits: formatLines(data.healthBenefits || data.health_benefits),
    similar_dishes: formatLines(data.similarDishes || data.similar_dishes),
    food_labels: formatLines(data.food_labels),
  });

  const buildRecipePayload = (data) => ({
    title: data.title,
    cuisine: data.cuisine || null,
    diet: data.diet || null,
    time: data.time || null,
    calories: data.calories ?? null,
    difficulty: data.difficulty || null,
    meal: data.meal || null,
    image: data.image || null,
    pantry_match: data.pantry_match ?? data.pantryMatch ?? null,
    cultural: data.cultural || null,
    ingredients: data.ingredients,
    nutrition: data.nutrition,
    health_benefits: data.health_benefits || data.healthBenefits || null,
    steps: data.steps,
    similar_dishes: data.similar_dishes || data.similarDishes || null,
    food_labels: data.food_labels || null,
  });

  const buildPayloadFromEditForm = () => ({
    title: editForm.title?.trim() || current.title,
    cuisine: editForm.cuisine?.trim() || null,
    diet: editForm.diet?.trim() || null,
    time: editForm.time?.trim() || null,
    calories: editForm.calories === "" ? null : Number(editForm.calories),
    difficulty: editForm.difficulty?.trim() || null,
    meal: editForm.meal?.trim() || null,
    image: editForm.image?.trim() || null,
    pantry_match: editForm.pantry_match === "" ? null : Number(editForm.pantry_match),
    cultural: editForm.cultural?.trim() || null,
    ingredients: {
      available: splitLines(editForm.ingredients_available),
      missing: splitLines(editForm.ingredients_missing),
    },
    nutrition: {
      protein: Number(editForm.nutrition_protein || 0),
      carbs: Number(editForm.nutrition_carbs || 0),
      fat: Number(editForm.nutrition_fat || 0),
      fiber: Number(editForm.nutrition_fiber || 0),
    },
    health_benefits: splitLines(editForm.health_benefits),
    steps: splitLines(editForm.steps),
    similar_dishes: splitLines(editForm.similar_dishes),
    food_labels: splitLines(editForm.food_labels),
  });

  const toRecipeView = (data) => {
    const rawIngredients = data.ingredients;
    const ingredients = Array.isArray(rawIngredients)
      ? { available: rawIngredients.filter(Boolean), missing: [] }
      : rawIngredients && typeof rawIngredients === "object"
        ? {
            available: asArray(rawIngredients.available),
            missing: asArray(rawIngredients.missing),
          }
        : { available: [], missing: [] };

    const nutrition = data.nutrition && typeof data.nutrition === "object"
      ? {
          protein: Number(data.nutrition.protein || 0),
          carbs: Number(data.nutrition.carbs || 0),
          fat: Number(data.nutrition.fat || 0),
          fiber: Number(data.nutrition.fiber || 0),
        }
      : { protein: 0, carbs: 0, fat: 0, fiber: 0 };

    // Estimate nutrition if missing but calories present
    if ((!nutrition.protein && !nutrition.carbs && !nutrition.fat) && data.calories) {
      const est = estimateNutritionFromCalories(Number(data.calories));
      nutrition.protein = Math.round(est.protein);
      nutrition.carbs = Math.round(est.carbs);
      nutrition.fat = Math.round(est.fat);
      nutrition.fiber = Math.round(est.fiber || 0);
    }

    const steps = asArray(data.steps);
    const normalizedSteps = steps.length > 0
      ? steps
      : ["Detailed steps are being updated for this recipe."];

    const fallbackImage = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80&auto=format&fit=crop";

    const normalizedRecipe = {
      ...data,
      image: data.image || fallbackImage,
      ingredients,
      nutrition,
      steps: normalizedSteps,
      healthBenefits: asArray(data.health_benefits),
      similarDishes: asArray(data.similar_dishes),
      cultural: data.cultural || "No cultural insight is available for this recipe yet.",
      pantryMatch: data.pantry_match ?? 0,
    };

    setRecipe(normalizedRecipe);
    // Keep a fully normalized local copy to avoid render-time undefined field crashes.
    setLocalRecipe(normalizedRecipe);
  };

  useEffect(() => {
    const stateRecipe = location.state && location.state.recipe ? location.state.recipe : null;

    if (stateRecipe) {
      toRecipeView(stateRecipe);
      setLoading(false);
      return;
    }

    const fetchRecipe = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
        const res = await fetch(`${API_BASE.replace(/\/$/, "")}/recipes/${id}`);
        if (!res.ok) {
          throw new Error("Recipe not found");
        }

        const data = await res.json();
        toRecipeView(data);
      } catch (error) {
        // Try local fallback from curated dataset
        try {
          // prefer richer `recipesData` dataset, then fall back to `allRecipes`
          const fallback = (recipesData || []).find((r) => String(r.id) === String(id)) || allRecipes.find((r) => String(r.id) === String(id));
          if (fallback) {
            toRecipeView(fallback);
            setLoadError("");
          } else {
            setLoadError(error.message || "Unable to load recipe details");
            setRecipe(null);
          }
        } catch (e) {
          setLoadError(error.message || "Unable to load recipe details");
          setRecipe(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id, location.state, location.search]);

  useEffect(() => {
    if (recipe && editRequested && !editOpen) {
      setEditForm(buildEditForm(recipe));
      setEditOpen(true);
      setEditError("");
    }
  }, [recipe, editRequested, editOpen]);

  // ── Voice Assistant ──────────────────────────────────────
  // currentStep: -1 = idle, -2 = intro, 0+ = step index
  const [voiceActive, setVoiceActive] = useState(false);
  const [voicePaused, setVoicePaused] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const keepAliveRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => () => {
    window.speechSynthesis.cancel();
    if (keepAliveRef.current) clearInterval(keepAliveRef.current);
  }, []);

  // React-state-driven speech: fires whenever voiceActive or currentStep changes
  useEffect(() => {
    if (!recipe || !voiceActive || currentStep === -1) return;

    // All steps finished
    if (currentStep >= recipe.steps.length) {
      if (keepAliveRef.current) clearInterval(keepAliveRef.current);
      setVoiceActive(false);
      setCurrentStep(-1);
      return;
    }

    const isIntro = currentStep === -2;
    const text = isIntro
      ? `Let's prepare ${recipe.title}. I will guide you through each step.`
      : `Step ${currentStep + 1}. ${recipe.steps[currentStep]}`;

    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.9;
    utter.volume = 1;
    // No lang override — uses browser/system default for best compatibility
    utter.onend = () => setCurrentStep(prev => (prev === -2 ? 0 : prev + 1));
    utter.onerror = (e) => {
      if (e.error !== "interrupted") {
        if (keepAliveRef.current) clearInterval(keepAliveRef.current);
        setVoiceActive(false);
        setCurrentStep(-1);
      }
    };
    window.speechSynthesis.speak(utter);

    // Cleanup cancels the current utterance when step changes (prevents overlap)
    return () => window.speechSynthesis.cancel();
  }, [voiceActive, currentStep]); // eslint-disable-line react-hooks/exhaustive-deps

  const startVoice = () => {
    if (!window.speechSynthesis) { alert("Your browser does not support voice."); return; }
    window.speechSynthesis.cancel();
    // Chrome keep-alive: Chrome silently stops synthesis after ~15s without this
    if (keepAliveRef.current) clearInterval(keepAliveRef.current);
    keepAliveRef.current = setInterval(() => {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 10000);
    setVoicePaused(false);
    setVoiceActive(true);
    setCurrentStep(-2); // triggers intro utterance via useEffect
  };

  const stopVoice = () => {
    window.speechSynthesis.cancel();
    if (keepAliveRef.current) clearInterval(keepAliveRef.current);
    setVoiceActive(false);
    setVoicePaused(false);
    setCurrentStep(-1);
  };

  const pauseVoice = () => {
    window.speechSynthesis.pause();
    setVoicePaused(true);
  };

  const useSubstitute = (missingItem, substitute) => {
    if (!localRecipe) return;
    const iAvailable = Array.from(localRecipe.ingredients.available || []);
    const iMissing = Array.from(localRecipe.ingredients.missing || []).filter(m => m !== missingItem);
    iAvailable.push(substitute);
    const updated = {
      ...localRecipe,
      ingredients: { available: iAvailable, missing: iMissing },
    };
    setLocalRecipe(updated);
    setRecipe(prev => ({ ...prev, ingredients: updated.ingredients }));
  };

  const resumeVoice = () => {
    window.speechSynthesis.resume();
    setVoicePaused(false);
  };

  const skipStep = () => {
    window.speechSynthesis.cancel();
    setCurrentStep(prev => {
      const next = prev === -2 ? 0 : prev + 1;
      const currentSteps = (localRecipe || recipe).steps || [];
      return next >= currentSteps.length ? currentSteps.length : next;
    });
  };

  const prevStep = () => {
    window.speechSynthesis.cancel();
    setCurrentStep(prev => Math.max(0, prev === -2 ? 0 : prev - 1));
  };
  // ────────────────────────────────────────────────────────

  if (loading) {
    return <div className="rd-notfound">Loading recipe details...</div>;
  }

  if (loadError || !recipe) {
    return <div className="rd-notfound">Recipe not found.</div>;
  }

  const current = localRecipe || recipe;

  const currentList = listContext?.recipes || [];
  const currentIndex = typeof listContext?.currentIndex === "number" ? listContext.currentIndex : -1;

  const goToRecipeAtIndex = (nextIndex) => {
    const nextRecipe = currentList[nextIndex];
    if (!nextRecipe) return;

    navigate(`/recipe/${nextRecipe.id}`, {
      state: {
        recipe: nextRecipe,
        listContext: {
          ...listContext,
          currentIndex: nextIndex,
        },
      },
    });
  };

  const openEditor = () => {
    if (!current) return;
    setEditForm(buildEditForm(current));
    setEditError("");
    setEditOpen(true);
  };

  const closeEditor = () => {
    setEditOpen(false);
    setEditError("");
  };

  const saveCurrentRecipe = async () => {
    if (!current || !editForm) return;

    setEditSaving(true);
    setEditError("");
    try {
      const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      const payload = buildPayloadFromEditForm();
      const isExistingRecipe = Number(current.id) >= 0;
      const response = await fetch(
        isExistingRecipe ? `${API_BASE.replace(/\/$/, "")}/recipes/${current.id}` : `${API_BASE.replace(/\/$/, "")}/recipes/`,
        {
          method: isExistingRecipe ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        throw new Error(`Save failed with ${response.status}`);
      }

      const saved = await response.json();
      toRecipeView(saved);
      setEditOpen(false);
      if (!isExistingRecipe) {
        navigate(`/recipe/${saved.id}`, { replace: true, state: { recipe: saved, listContext } });
      }
    } catch (error) {
      setEditError(error.message || "Unable to save recipe.");
    } finally {
      setEditSaving(false);
    }
  };

  const saveRecipeCopy = async () => {
    if (!current) return;

    setSaveCopyBusy(true);
    setEditError("");
    try {
      const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      const response = await fetch(`${API_BASE.replace(/\/$/, "")}/recipes/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildRecipePayload(current)),
      });

      if (!response.ok) {
        throw new Error(`Save copy failed with ${response.status}`);
      }

      const saved = await response.json();
      navigate(`/recipe/${saved.id}`, { state: { recipe: saved } });
    } catch (error) {
      setEditError(error.message || "Unable to save recipe copy.");
    } finally {
      setSaveCopyBusy(false);
    }
  };

  const regenerateRecipe = async () => {
    if (!current) return;

    setRegenerateBusy(true);
    setEditError("");
    try {
      const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      if (Number(current.id) >= 0) {
        const response = await fetch(`${API_BASE.replace(/\/$/, "")}/recipes/${current.id}/regenerate`, { method: "POST" });
        if (!response.ok) {
          throw new Error(`Regenerate failed with ${response.status}`);
        }

        const regenerated = await response.json();
        navigate(`/recipe/${regenerated.id}`, { state: { recipe: regenerated, listContext } });
        return;
      }

      const regeneratedDraft = {
        ...current,
        title: `${current.title} (Regenerated)`,
        time: current.time || "35 minutes",
        steps: Array.isArray(current.steps) && current.steps.length > 0
          ? [...current.steps, "Finish with a final seasoning pass before serving."]
          : ["Prep the ingredients.", "Cook the recipe.", "Finish and serve."],
      };

      const response = await fetch(`${API_BASE.replace(/\/$/, "")}/recipes/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildRecipePayload(regeneratedDraft)),
      });

      if (!response.ok) {
        throw new Error(`Regenerate failed with ${response.status}`);
      }

      const regenerated = await response.json();
      navigate(`/recipe/${regenerated.id}`, { state: { recipe: regenerated } });
    } catch (error) {
      setEditError(error.message || "Unable to regenerate recipe.");
    } finally {
      setRegenerateBusy(false);
    }
  };

  const deleteCurrentRecipe = async () => {
    if (!current || Number(current.id) < 0) {
      setEditError("External recipes cannot be deleted.");
      return;
    }

    if (!window.confirm(`Delete ${current.title}?`)) {
      return;
    }

    setDeleteBusy(true);
    setEditError("");
    try {
      const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      const response = await fetch(`${API_BASE.replace(/\/$/, "")}/recipes/${current.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Delete failed with ${response.status}`);
      }

      navigate("/recipes");
    } catch (error) {
      setEditError(error.message || "Unable to delete recipe.");
    } finally {
      setDeleteBusy(false);
    }
  };

  const difficultyColor = {
    Easy: "#22c55e",
    Medium: "#f97316",
    Hard: "#ef4444"
  };

  const dietColor = {
    Vegetarian: "#22c55e",
    Vegan: "#16a34a",
    "Non-Vegetarian": "#ef4444"
  };

  const nutritionItems = [
    { emoji: "🔥", label: "Calories", value: `${current.calories} kcal` },
    { emoji: "💪", label: "Protein",  value: `${current.nutrition.protein}g` },
    { emoji: "🌾", label: "Carbohydrates", value: `${current.nutrition.carbs}g` },
    { emoji: "🥑", label: "Fat", value: `${current.nutrition.fat}g` },
    { emoji: "🌿", label: "Fiber", value: `${current.nutrition.fiber}g` }
  ];

  const getHealthyAlternatives = (cur) => {
    if (!cur) return [];
    const candidates = (recipesData || []).filter(r => String(r.id) !== String(cur.id));
    const better = candidates.filter(r => {
      // prefer same meal or same cuisine, and lower calories
      const similarMeal = r.meal === cur.meal;
      const similarCuisine = r.cuisine === cur.cuisine;
      const lowerCal = (r.calories || 0) <= (cur.calories || 9999);
      const isHealthier = (r.diet === "Vegan" || r.diet === "Vegetarian") || (r.calories || 0) < (cur.calories || 0);
      return (similarMeal || similarCuisine) && lowerCal && isHealthier;
    });
    return better.slice(0,4);
  };

  const healthyAlternatives = getHealthyAlternatives(current);

  return (
    <div className="rd-page">
      {buyItem && (
        <BuyModal
          item={buyItem}
          recipeName={current ? current.title : recipe.title}
          onClose={() => setBuyItem(null)}
        />
      )}

      {orderOpen && (
        <OrderModal
          recipeName={current ? current.title : recipe.title}
          onClose={() => setOrderOpen(false)}
        />
      )}

      {/* Header */}
      <div className="rd-header">
        <button className="rd-back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div className="rd-hero">
          <div className="rd-tags">
            <span className="rd-tag rd-tag-grey">{current.cuisine}</span>
            <span className="rd-tag" style={{ background: difficultyColor[current.difficulty] }}>{current.difficulty}</span>
            <span className="rd-tag" style={{ background: dietColor[current.diet] || "#22c55e" }}>{current.diet}</span>
          </div>

          <h1 className="rd-title">{current.title}</h1>

          <div className="rd-meta">
            <span>⏱ {current.time}</span>
            <span
              title={current.calories <= 350 ? "Low calorie — click to learn more" : undefined}
              style={current.calories <= 350 ? { cursor: "pointer", textDecoration: "underline" } : {}}
              onClick={() => { if (current.calories <= 350) navigate(`/health-guide?topic=low-calorie`); }}
            >🔥 {current.calories} kcal</span>
            <span>🍽 {current.meal}</span>
          </div>

          <div className="rd-order-buttons">
            <button 
              className="rd-order-btn rd-swiggy-btn" 
              onClick={() => setOrderOpen(true)}
              title="Order from Swiggy"
            >
              🛵 Order on Swiggy
            </button>
            <button 
              className="rd-order-btn rd-zomato-btn" 
              onClick={() => setOrderOpen(true)}
              title="Order from Zomato"
            >
              🍽️ Order on Zomato
            </button>
          </div>

          <div className="rd-action-row">
            {currentIndex > 0 && (
              <button className="rd-action-btn" onClick={() => goToRecipeAtIndex(currentIndex - 1)}>
                ← Previous
              </button>
            )}
            {currentIndex >= 0 && currentIndex < currentList.length - 1 && (
              <button className="rd-action-btn" onClick={() => goToRecipeAtIndex(currentIndex + 1)}>
                Next →
              </button>
            )}
            <button className="rd-action-btn" onClick={saveRecipeCopy} disabled={saveCopyBusy}>
              {saveCopyBusy ? "Saving..." : "Save Copy"}
            </button>
            <button className="rd-action-btn" onClick={openEditor}>
              Edit
            </button>
            <button className="rd-action-btn" onClick={regenerateRecipe} disabled={regenerateBusy}>
              {regenerateBusy ? "Regenerating..." : "Regenerate"}
            </button>
            {current.id >= 0 && (
              <button className="rd-action-btn danger" onClick={deleteCurrentRecipe} disabled={deleteBusy}>
                {deleteBusy ? "Deleting..." : "Delete"}
              </button>
            )}
          </div>
        </div>
      </div>

      {editOpen && editForm && (
        <div className="rd-body" style={{ paddingTop: 0 }}>
          <div className="rd-card" style={{ width: "100%" }}>
            <div className="rd-edit-header">
              <div>
                <h2 className="rd-section-title" style={{ marginBottom: 6 }}>Edit Recipe</h2>
                <p style={{ margin: 0, color: "#6b7280" }}>Update the stored recipe fields and save changes back to the database.</p>
              </div>
              <div className="rd-edit-actions">
                <button className="rd-action-btn" onClick={closeEditor}>Close</button>
                <button className="rd-action-btn primary" onClick={saveCurrentRecipe} disabled={editSaving}>
                  {editSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>

            {editError && <div className="rd-edit-error">{editError}</div>}

            <div className="rd-edit-grid">
              <label>
                <span>Title</span>
                <input value={editForm.title} onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))} />
              </label>
              <label>
                <span>Cuisine</span>
                <input value={editForm.cuisine} onChange={(e) => setEditForm((prev) => ({ ...prev, cuisine: e.target.value }))} />
              </label>
              <label>
                <span>Diet</span>
                <input value={editForm.diet} onChange={(e) => setEditForm((prev) => ({ ...prev, diet: e.target.value }))} />
              </label>
              <label>
                <span>Meal</span>
                <input value={editForm.meal} onChange={(e) => setEditForm((prev) => ({ ...prev, meal: e.target.value }))} />
              </label>
              <label>
                <span>Time</span>
                <input value={editForm.time} onChange={(e) => setEditForm((prev) => ({ ...prev, time: e.target.value }))} />
              </label>
              <label>
                <span>Calories</span>
                <input type="number" value={editForm.calories} onChange={(e) => setEditForm((prev) => ({ ...prev, calories: e.target.value }))} />
              </label>
              <label>
                <span>Difficulty</span>
                <input value={editForm.difficulty} onChange={(e) => setEditForm((prev) => ({ ...prev, difficulty: e.target.value }))} />
              </label>
              <label>
                <span>Pantry Match</span>
                <input type="number" value={editForm.pantry_match} onChange={(e) => setEditForm((prev) => ({ ...prev, pantry_match: e.target.value }))} />
              </label>
              <label className="rd-edit-wide">
                <span>Image URL</span>
                <input value={editForm.image} onChange={(e) => setEditForm((prev) => ({ ...prev, image: e.target.value }))} />
              </label>
              <label className="rd-edit-wide">
                <span>Cultural Note</span>
                <input value={editForm.cultural} onChange={(e) => setEditForm((prev) => ({ ...prev, cultural: e.target.value }))} />
              </label>
              <label>
                <span>Protein</span>
                <input type="number" value={editForm.nutrition_protein} onChange={(e) => setEditForm((prev) => ({ ...prev, nutrition_protein: e.target.value }))} />
              </label>
              <label>
                <span>Carbs</span>
                <input type="number" value={editForm.nutrition_carbs} onChange={(e) => setEditForm((prev) => ({ ...prev, nutrition_carbs: e.target.value }))} />
              </label>
              <label>
                <span>Fat</span>
                <input type="number" value={editForm.nutrition_fat} onChange={(e) => setEditForm((prev) => ({ ...prev, nutrition_fat: e.target.value }))} />
              </label>
              <label>
                <span>Fiber</span>
                <input type="number" value={editForm.nutrition_fiber} onChange={(e) => setEditForm((prev) => ({ ...prev, nutrition_fiber: e.target.value }))} />
              </label>
              <label className="rd-edit-wide">
                <span>Available Ingredients</span>
                <textarea rows="4" value={editForm.ingredients_available} onChange={(e) => setEditForm((prev) => ({ ...prev, ingredients_available: e.target.value }))} />
              </label>
              <label className="rd-edit-wide">
                <span>Missing Ingredients</span>
                <textarea rows="4" value={editForm.ingredients_missing} onChange={(e) => setEditForm((prev) => ({ ...prev, ingredients_missing: e.target.value }))} />
              </label>
              <label className="rd-edit-wide">
                <span>Steps</span>
                <textarea rows="6" value={editForm.steps} onChange={(e) => setEditForm((prev) => ({ ...prev, steps: e.target.value }))} />
              </label>
              <label className="rd-edit-wide">
                <span>Health Benefits</span>
                <textarea rows="4" value={editForm.health_benefits} onChange={(e) => setEditForm((prev) => ({ ...prev, health_benefits: e.target.value }))} />
              </label>
              <label className="rd-edit-wide">
                <span>Similar Dishes</span>
                <textarea rows="3" value={editForm.similar_dishes} onChange={(e) => setEditForm((prev) => ({ ...prev, similar_dishes: e.target.value }))} />
              </label>
              <label className="rd-edit-wide">
                <span>Food Labels</span>
                <textarea rows="3" value={editForm.food_labels} onChange={(e) => setEditForm((prev) => ({ ...prev, food_labels: e.target.value }))} />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Body */}
      <div className="rd-body">

        {/* Left Column */}
        <div className="rd-left">

          {/* Ingredients */}
          <div className="rd-card">
            <h2 className="rd-section-title">🥢 Ingredients</h2>

            <div className="rd-ingredients-row">
              <div className="rd-ingredients-col">
                <p className="rd-ing-heading rd-ing-green">✅ Available in Pantry</p>
                <ul className="rd-ing-list">
                  {current.ingredients.available.length > 0 ? (
                    current.ingredients.available.map((item, i) => (
                      <li key={i}><span className="rd-dot rd-dot-green" />{item}</li>
                    ))
                  ) : (
                    <li className="rd-empty-line">No ingredient details available yet.</li>
                  )}
                </ul>
              </div>

              <div className="rd-ingredients-col">
                <p className="rd-ing-heading rd-ing-red">⊗ Missing Items</p>
                <ul className="rd-ing-list">
                  {current.ingredients.missing.length > 0 ? (
                    current.ingredients.missing.map((item, i) => (
                      <li key={i} className="rd-missing-item">
                        <span className="rd-dot rd-dot-red" />{item}
                        <button
                          className="rd-buy-btn"
                          onClick={() => setBuyItem(item)}
                        >🛒 Buy</button>

                        {(() => {
                          const subs = findSubstitutes(item);
                          if (!subs || subs.length === 0) return null;
                          return (
                            <div className="rd-substitute-list">
                              <small>Try substitutes:</small>
                              {subs.map((s, idx) => (
                                <button key={idx} className="rd-sub-btn" onClick={() => useSubstitute(item, s)}>{s}</button>
                              ))}
                            </div>
                          );
                        })()}
                      </li>
                    ))
                  ) : (
                    <li className="rd-empty-line">No missing items listed for this recipe.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Cooking Instructions */}
          <div className="rd-card">
            <div className="rd-instructions-header">
              <h2 className="rd-section-title" style={{margin:0}}>Cooking Instructions</h2>
              <div className="rd-header-buttons">
                <button 
                  className="rd-youtube-btn" 
                  onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(current.title + ' recipe')}`, '_blank')}
                  title="Watch recipe videos on YouTube"
                >
                  ▶ YouTube
                </button>
                {!voiceActive ? (
                  <button className="rd-voice-start-btn" onClick={startVoice}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1a4 4 0 0 1 4 4v7a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v7a2 2 0 0 0 4 0V5a2 2 0 0 0-2-2zm-7 8a1 1 0 0 1 1 1 7 7 0 0 0 14 0 1 1 0 1 1 2 0 9 9 0 0 1-8 8.94V22h3a1 1 0 1 1 0 2H7a1 1 0 1 1 0-2h3v-1.06A9 9 0 0 1 2 12a1 1 0 0 1 1-1z"/></svg>
                    🎙 Start Voice Guide
                  </button>
                ) : (
                  <button className="rd-voice-stop-btn" onClick={stopVoice}>
                    ✕ Stop Voice
                  </button>
                )}
              </div>
            </div>

            {/* Voice Player Bar */}
            {voiceActive && (
              <div className="rd-voice-bar">
                <div className="rd-voice-bar-info">
                  <span className="rd-voice-wave">
                    {[1,2,3,4,5].map(n => (
                      <span key={n} className={`rd-wave-bar${voicePaused ? " paused" : ""}`} style={{animationDelay:`${n * 0.1}s`}} />
                    ))}
                  </span>
                  <span className="rd-voice-status">
                    {voicePaused ? "Paused" : currentStep >= 0 ? `Speaking Step ${currentStep + 1} of ${current.steps.length}` : "Preparing..."}
                  </span>
                </div>
                <div className="rd-voice-controls">
                  <button className="rd-vc-btn" onClick={prevStep} title="Previous step">⏮</button>
                  {voicePaused
                    ? <button className="rd-vc-btn rd-vc-play" onClick={resumeVoice} title="Resume">▶ Resume</button>
                    : <button className="rd-vc-btn rd-vc-pause" onClick={pauseVoice} title="Pause">⏸ Pause</button>
                  }
                  <button className="rd-vc-btn" onClick={skipStep} title="Next step">⏭</button>
                </div>
              </div>
            )}

            <ol className="rd-steps">
              {current.steps.length > 0 ? (
                current.steps.map((step, i) => (
                  <li key={i} className={currentStep === i ? "rd-step-active" : ""}>
                    <span className="rd-step-num">{i + 1}</span>
                    <span className="rd-step-text">{step}</span>
                    {currentStep === i && (
                      <span className="rd-step-speaking-badge">🔊 Speaking...</span>
                    )}
                  </li>
                ))
              ) : (
                <li className="rd-empty-line">No preparation steps are available for this recipe yet.</li>
              )}
            </ol>
          </div>

          {/* Cultural Insight */}
          <div className="rd-card rd-cultural">
            <h2 className="rd-section-title">💡 Cultural Insight</h2>
            <p className="rd-cultural-text">{current.cultural}</p>
          </div>

        </div>

        {/* Right Column */}
        <div className="rd-right">

          {/* Nutritional Information */}
          <div className="rd-card">
            <h2 className="rd-section-title">Nutritional Information</h2>
            <ul className="rd-nutrition-list">
              {nutritionItems.map((n, i) => (
                <li key={i} className="rd-nutrition-item">
                  <span className="rd-nutrition-emoji">{n.emoji}</span>
                  <span className="rd-nutrition-label">{n.label}</span>
                  <span className="rd-nutrition-value">{n.value}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Health Benefits */}
          <div className="rd-card">
            <h2 className="rd-section-title">Health Benefits</h2>
            <div className="rd-benefit-tags">
              {current.healthBenefits.length > 0 ? (
                current.healthBenefits.map((b, i) => (
                  <button key={i} className="rd-benefit-tag" onClick={() => {
                    const slug = mapHealthTagToSlug(b);
                    if (slug) navigate(`/health-guide?focus=${slug}`);
                    else navigate(`/health-guide?search=${encodeURIComponent(b)}`);
                  }}>{b}</button>
                ))
              ) : (
                <span className="rd-empty-inline">No health benefits listed yet.</span>
              )}
            </div>
            {current.calories <= 350 && (
              <div style={{ marginTop: 12 }}>
                <button className="rd-view-alt" onClick={() => navigate(`/health-guide?topic=low-calorie`)}>Low-calorie tips</button>
              </div>
            )}
          </div>

          {/* Similar Dishes */}
          <div className="rd-card">
            <h2 className="rd-section-title">Similar Dishes</h2>
            <ul className="rd-similar-list">
              {current.similarDishes.length > 0 ? (
                current.similarDishes.map((d, i) => (
                  <li key={i} className="rd-similar-item">{d}</li>
                ))
              ) : (
                <li className="rd-empty-line">No similar dishes listed yet.</li>
              )}
            </ul>
          </div>

          {/* Healthy Alternatives */}
          <div className="rd-card">
            <h2 className="rd-section-title">Healthy Alternatives</h2>
            {healthyAlternatives.length === 0 ? (
              <p className="rd-empty-small">No healthier alternatives found nearby.</p>
            ) : (
              <ul className="rd-healthy-list">
                {healthyAlternatives.map((h) => (
                  <li key={h.id} className="rd-healthy-item">
                    <img src={h.image} alt={h.title} className="rd-healthy-thumb"/>
                    <div className="rd-healthy-info">
                      <strong>{h.title}</strong>
                      <small>{h.cuisine} • {h.time} • {h.calories} kcal</small>
                    </div>
                    <div>
                      <button className="rd-view-alt" onClick={() => navigate(`/recipe/${h.id}`, { state: { recipe: h } })}>View</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Pantry Match */}
          <div className="rd-pantry-card">
            <p className="rd-pantry-label">Pantry Match</p>
            <p className="rd-pantry-percent">{current.pantryMatch}%</p>
            <p className="rd-pantry-sub">You have most ingredients for this recipe!</p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default RecipeDetail;
