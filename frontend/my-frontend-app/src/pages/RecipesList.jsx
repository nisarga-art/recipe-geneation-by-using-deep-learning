import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileDropdown from "../components/ProfileDropdown";
import allRecipes from "../data/allRecipes";
import recipesData from "../data/recipes";
import "../styles/RecipesList.css";

const CUISINES = [
  "All",
  "Indian",
  "North Indian",
  "South Indian",
  "Asian",
  "Chinese",
  "Japanese",
  "Korean",
  "Thai",
  "Mediterranean",
  "Greek",
  "Italian",
  "French",
  "Western",
  "American",
  "Mexican",
  "Middle Eastern",
];

const DIET_COLORS = {
  Vegan: "#2e7d32",
  Vegetarian: "#558b2f",
  "Non-Vegetarian": "#b71c1c",
};

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80&auto=format&fit=crop";

const CUISINE_AREA_MAP = {
  indian: "Indian",
  "north indian": "Indian",
  "south indian": "Indian",
  asian: "Chinese",
  chinese: "Chinese",
  japanese: "Japanese",
  korean: "Japanese",
  thai: "Thai",
  mediterranean: "Greek",
  greek: "Greek",
  italian: "Italian",
  french: "French",
  western: "American",
  american: "American",
  mexican: "Mexican",
  "middle eastern": "Moroccan",
};

const RECIPE_IMAGE_MAP = {
  dosa: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Rameshwaram_Cafe_Dosa.jpg/330px-Rameshwaram_Cafe_Dosa.jpg",
  paneer: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Shahi_panner.jpg/330px-Shahi_panner.jpg",
  biryani: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/%22Hyderabadi_Dum_Biryani%22.jpg/330px-%22Hyderabadi_Dum_Biryani%22.jpg",
  salad: "https://images.unsplash.com/photo-1551248429-40975aa4de74?w=800&q=80&auto=format&fit=crop",
  brownie: "https://images.unsplash.com/photo-1604908177522-8b4a5f7f28a6?w=800&q=80&auto=format&fit=crop",
  pancake: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=800&q=80&auto=format&fit=crop",
  ramen: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Shoyu_ramen%2C_at_Kasukabe_Station_%282014.05.05%29_1.jpg/330px-Shoyu_ramen%2C_at_Kasukabe_Station_%282014.05.05%29_1.jpg",
  prawn: "https://placehold.co/800x600/fde68a/7c2d12?text=Prawn+Curry",
  shrimp: "https://placehold.co/800x600/fde68a/7c2d12?text=Shrimp+Curry",
  fish: "https://placehold.co/800x600/c7d2fe/1e3a8a?text=Fish+Curry",
  tofu: "https://placehold.co/800x600/d1fae5/065f46?text=Tofu+Stir+Fry",
  soup: "https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80&auto=format&fit=crop",
  pizza: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80&auto=format&fit=crop",
  burger: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80&auto=format&fit=crop",
  curry: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80&auto=format&fit=crop",
  indian: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Punjabi_style_Dal_Makhani.jpg/330px-Punjabi_style_Dal_Makhani.jpg",
  asian: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&q=80&auto=format&fit=crop",
  dessert: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80&auto=format&fit=crop",
};

const hasPreferredImage = (value) => {
  const image = String(value || "").trim();
  if (!image) return false;
  if (image.includes("source.unsplash.com")) return false;
  return true;
};

const getRelevantImage = (item) => {
  const haystack = `${item?.title || ""} ${item?.cuisine || ""} ${item?.meal || ""}`.toLowerCase();
  for (const [keyword, image] of Object.entries(RECIPE_IMAGE_MAP)) {
    if (haystack.includes(keyword)) {
      return image;
    }
  }
  return DEFAULT_IMAGE;
};

const normalizeRecipe = (item) => {
  const recipe = {
    id: item.id,
    title: item.title || "Untitled Recipe",
    cuisine: item.cuisine || "Fusion",
    diet: item.diet || "Unknown",
    time: item.time || "30 minutes",
    calories: typeof item.calories === "number" ? item.calories : item.calories || "Unknown",
    difficulty: item.difficulty || "Unknown",
    meal: item.meal || "Main Course",
    pantry_match: item.pantry_match ?? null,
    steps: Array.isArray(item.steps) && item.steps.length
      ? item.steps
      : [
          "Prep ingredients: chop aromatics, measure spices, ready protein/veg.",
          "Cook base: heat oil, saute aromatics, toast spices until fragrant.",
          "Build: add mains, simmer/roast until tender and flavors marry.",
          "Finish: adjust seasoning, garnish, and serve warm.",
        ],
    ingredients: item.ingredients && typeof item.ingredients === "object"
      ? item.ingredients
      : { available: ["Main produce", "Protein or legumes", "Spice blend", "Oil"], missing: [] },
    nutrition: item.nutrition && typeof item.nutrition === "object"
      ? item.nutrition
      : { protein: 12, carbs: 36, fat: 14, fiber: 5 },
    health_benefits: Array.isArray(item.health_benefits) ? item.health_benefits : [],
    similar_dishes: Array.isArray(item.similar_dishes) ? item.similar_dishes : [],
    food_labels: Array.isArray(item.food_labels) ? item.food_labels : [],
    cultural: item.cultural || null,
  };

  recipe.image = hasPreferredImage(item.image) ? item.image : getRelevantImage(recipe);
  recipe.image_available = hasPreferredImage(item.image);
  return recipe;
};

const applyFilters = (list, searchText, cuisine, diet) => {
  const term = searchText.trim().toLowerCase();
  const cuisineKey = cuisine.toLowerCase();
  const dietKey = diet.toLowerCase();

  return list
    .filter((item) => {
      const title = (item.title || "").toLowerCase();
      const itemCuisine = (item.cuisine || "").toLowerCase();
      const itemDiet = (item.diet || "Unknown").toLowerCase();

      const matchesSearch = term ? title.includes(term) || itemCuisine.includes(term) : true;
      const matchesCuisine = cuisine === "All" ? true : itemCuisine.includes(cuisineKey);
      const matchesDiet = diet === "All" ? true : itemDiet.includes(dietKey);

      return matchesSearch && matchesCuisine && matchesDiet;
    })
    .map(normalizeRecipe);
};

const parseMinutes = (value) => {
  if (!value) return 0;
  const digits = String(value).replace(/[^0-9]/g, "");
  return digits ? Number(digits) : 0;
};

const dedupeByTitle = (items) => {
  const seen = new Set();
  const deduped = [];
  for (const item of items) {
    const key = String(item?.title || "").trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    deduped.push(item);
  }
  return deduped;
};

const LOCAL_RECIPES_POOL = dedupeByTitle([...(recipesData || []), ...(allRecipes || [])]);

const splitInstructions = (text) => {
  const raw = String(text || "").replace(/\r/g, "\n").trim();
  if (!raw) return [];
  const byLine = raw.split("\n").map((line) => line.trim()).filter(Boolean);
  if (byLine.length >= 3) return byLine.slice(0, 12);
  return raw.split(".").map((part) => part.trim()).filter(Boolean).slice(0, 12);
};

const mapMealDbToRecipe = (meal) => {
  const available = [];
  for (let i = 1; i <= 20; i += 1) {
    const ingredient = String(meal[`strIngredient${i}`] || "").trim();
    const measure = String(meal[`strMeasure${i}`] || "").trim();
    if (!ingredient) continue;
    available.push(`${measure} ${ingredient}`.trim());
  }

  const safeId = Number(meal.idMeal);
  return {
    id: Number.isFinite(safeId) ? -safeId : -Math.floor(Math.random() * 1000000),
    title: meal.strMeal || "External Recipe",
    cuisine: meal.strArea || "External",
    diet: "Unknown",
    time: "35 minutes",
    calories: 380,
    difficulty: "Medium",
    meal: meal.strCategory || "Main Course",
    image: meal.strMealThumb || DEFAULT_IMAGE,
    pantry_match: null,
    ingredients: {
      available: available.length ? available.slice(0, 12) : ["Main ingredient", "Spices", "Oil"],
      missing: [],
    },
    nutrition: { protein: 14, carbs: 40, fat: 14, fiber: 5 },
    health_benefits: ["Cuisine variety", "Home-cook friendly"],
    steps: splitInstructions(meal.strInstructions),
    similar_dishes: [],
    food_labels: [],
    cultural: "External recipe sourced from TheMealDB.",
  };
};

const fetchExternalRecipes = async ({ searchText, cuisine }) => {
  const term = String(searchText || "").trim();
  const cuisineKey = String(cuisine || "").toLowerCase();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);

  try {
    if (term) {
      const url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(term)}`;
      const response = await fetch(url, { signal: controller.signal });
      const data = await response.json();
      const meals = Array.isArray(data?.meals) ? data.meals : [];
      return meals.map(mapMealDbToRecipe);
    }

    if (cuisine && cuisine !== "All") {
      const area = CUISINE_AREA_MAP[cuisineKey] || cuisine;
      const filterUrl = `https://www.themealdb.com/api/json/v1/1/filter.php?a=${encodeURIComponent(area)}`;
      const response = await fetch(filterUrl, { signal: controller.signal });
      const data = await response.json();
      const meals = Array.isArray(data?.meals) ? data.meals.slice(0, 12) : [];

      const detailPromises = meals.map(async (item) => {
        const idMeal = item?.idMeal;
        if (!idMeal) return null;
        try {
          const detailResp = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${idMeal}`, { signal: controller.signal });
          const detailData = await detailResp.json();
          const full = Array.isArray(detailData?.meals) ? detailData.meals[0] : null;
          return full ? mapMealDbToRecipe(full) : null;
        } catch {
          return null;
        }
      });

      const detailed = await Promise.all(detailPromises);
      return detailed.filter(Boolean);
    }

    return [];
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
};

const sortRecipes = (list, sortBy, sortOrder) => {
  const direction = sortOrder === "desc" ? -1 : 1;
  const sorted = [...list].sort((a, b) => {
    if (a.image_available !== b.image_available) {
      return a.image_available ? -1 : 1;
    }

    if (sortBy === "title") return direction * (a.title || "").localeCompare(b.title || "");
    if (sortBy === "cuisine") return direction * (a.cuisine || "").localeCompare(b.cuisine || "");
    if (sortBy === "calories") return direction * ((Number(a.calories) || 0) - (Number(b.calories) || 0));
    if (sortBy === "time") return direction * (parseMinutes(a.time) - parseMinutes(b.time));
    if (sortBy === "pantry_match") return direction * ((Number(a.pantry_match) || 0) - (Number(b.pantry_match) || 0));
    return direction * ((Number(a.id) || 0) - (Number(b.id) || 0));
  });

  return sorted;
};

export default function RecipesList() {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCuisine, setActiveCuisine] = useState("All");
  const [activeDiet, setActiveDiet] = useState("All");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState("desc");
  const [reloadKey, setReloadKey] = useState(0);
  const [actionError, setActionError] = useState("");
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("rl_favorites") || "[]");
    } catch {
      return [];
    }
  });
  const [favOpen, setFavOpen] = useState(false);
  const favRef = useRef(null);

  const onRecipeImageError = (event, recipe) => {
    const fallback = getRelevantImage(recipe);
    if (event.currentTarget.src !== fallback) {
      event.currentTarget.src = fallback;
      return;
    }
    if (event.currentTarget.src !== DEFAULT_IMAGE) {
      event.currentTarget.src = DEFAULT_IMAGE;
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search, activeCuisine, activeDiet, pageSize, sortBy, sortOrder]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setActionError("");
      try {
        const localFiltered = applyFilters(LOCAL_RECIPES_POOL, search, activeCuisine, activeDiet);
        const externalRaw = await fetchExternalRecipes({ searchText: search, cuisine: activeCuisine });
        const externalFiltered = applyFilters(externalRaw, search, activeCuisine, activeDiet);

        const merged = dedupeByTitle([...localFiltered, ...externalFiltered]).map(normalizeRecipe);
        const sorted = sortRecipes(merged, sortBy, sortOrder);
        const total = sorted.length;
        const pages = Math.max(1, Math.ceil(total / pageSize));
        const start = (page - 1) * pageSize;
        const paged = sorted.slice(start, start + pageSize);

        setRecipes(paged);
        setTotalCount(total);
        setTotalPages(pages);
      } catch (err) {
        console.error("Failed to build frontend recipe list:", err);
        const local = sortRecipes(applyFilters(LOCAL_RECIPES_POOL, search, activeCuisine, activeDiet), sortBy, sortOrder);
        const localTotal = local.length;
        const start = (page - 1) * pageSize;
        const paged = local.slice(start, start + pageSize);

        setRecipes(paged);
        setTotalCount(localTotal);
        setTotalPages(Math.max(1, Math.ceil(localTotal / pageSize)));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [search, activeCuisine, activeDiet, page, pageSize, sortBy, sortOrder, reloadKey]);

  useEffect(() => {
    const handler = (e) => {
      if (favRef.current && !favRef.current.contains(e.target)) setFavOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const favRecipes = recipes.filter((r) => favorites.includes(r.id));

  const toggleFav = (id) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem("rl_favorites", JSON.stringify(next));
      return next;
    });
  };

  const buildRecipePayload = (recipe) => ({
    title: recipe.title,
    cuisine: recipe.cuisine,
    diet: recipe.diet,
    time: recipe.time,
    calories: Number(recipe.calories) || null,
    difficulty: recipe.difficulty,
    meal: recipe.meal,
    image: recipe.image,
    pantry_match: Number(recipe.pantry_match) || null,
    cultural: recipe.cultural,
    ingredients: recipe.ingredients,
    nutrition: recipe.nutrition,
    health_benefits: recipe.health_benefits,
    steps: recipe.steps,
    similar_dishes: recipe.similar_dishes,
    food_labels: recipe.food_labels,
  });

  const saveRecipeCopy = async (recipe) => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      const response = await fetch(`${API_BASE.replace(/\/$/, "")}/recipes/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildRecipePayload(recipe)),
      });

      if (!response.ok) throw new Error(`Save failed with ${response.status}`);

      const saved = await response.json();
      navigate(`/recipe/${saved.id}`, { state: { recipe: normalizeRecipe(saved) } });
    } catch (error) {
      setActionError(error.message || "Unable to save recipe copy.");
    }
  };

  const deleteRecipe = async (recipe) => {
    if (recipe.id < 0) {
      setActionError("External recipes cannot be deleted.");
      return;
    }

    if (!window.confirm(`Delete ${recipe.title}?`)) return;

    try {
      const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      const response = await fetch(`${API_BASE.replace(/\/$/, "")}/recipes/${recipe.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error(`Delete failed with ${response.status}`);

      setReloadKey((key) => key + 1);
    } catch (error) {
      setActionError(error.message || "Unable to delete recipe.");
    }
  };

  const openRecipe = (recipe, index) => {
    navigate(`/recipe/${recipe.id}`, {
      state: {
        ...(recipe.id < 0 ? { recipe } : {}),
        listContext: {
          recipes,
          currentIndex: index,
          page,
          pageSize,
          totalCount,
          totalPages,
          search,
          activeCuisine,
          activeDiet,
          sortBy,
          sortOrder,
        },
      },
    });
  };

  return (
    <div className="rl-page">
      <nav className="navbar">
        <div className="logo">🍲 RecipeDiscover</div>
        <div className="nav-links">
          <a onClick={() => navigate("/home")} style={{ cursor: "pointer" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Home
          </a>
          <a className="active">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            Recipes
          </a>
          <a onClick={() => navigate("/menus")} style={{ cursor: "pointer" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            Menus
          </a>
          <a onClick={() => navigate("/health-guide")} style={{ cursor: "pointer" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            Health Guide
          </a>
          <a onClick={() => navigate("/generate-recipe")} style={{ cursor: "pointer" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.912 3.874L18 8.786l-3 2.924.708 4.138L12 13.85l-3.708 1.998L9 11.71 6 8.786l4.088-1.912z"/></svg>
            Generate
          </a>
        </div>
        <div className="search-box">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            placeholder="Search recipes, cuisines..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="rl-nav-fav" ref={favRef}>
          <button
            className={`rl-nav-fav-btn${favOpen ? " open" : ""}`}
            onClick={() => setFavOpen((o) => !o)}
            title="My Favorites"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill={favorites.length > 0 ? "#e53e3e" : "none"} stroke={favorites.length > 0 ? "#e53e3e" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            {favorites.length > 0 && <span className="rl-nav-fav-badge">{favorites.length}</span>}
          </button>

          {favOpen && (
            <div className="rl-fav-panel">
              <div className="rl-fav-panel-header">
                <span>❤️ My Favorites</span>
                <span className="rl-fav-panel-count">{favRecipes.length} saved</span>
              </div>
              {favRecipes.length === 0 ? (
                <p className="rl-fav-panel-empty">No favorites yet. Tap the ❤️ on any recipe card!</p>
              ) : (
                <ul className="rl-fav-list">
                  {favRecipes.map((r) => (
                    <li key={r.id} className="rl-fav-item">
                      <img
                        src={r.image}
                        alt={r.title}
                        className="rl-fav-item-img"
                        onError={(event) => onRecipeImageError(event, r)}
                      />
                      <div className="rl-fav-item-info">
                        <span className="rl-fav-item-title">{r.title}</span>
                        <span className="rl-fav-item-cuisine">{r.cuisine} · {r.time}</span>
                      </div>
                      <button className="rl-fav-item-remove" onClick={() => toggleFav(r.id)} title="Remove">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <ProfileDropdown />
      </nav>

      <div className="rl-header">
        <h1 className="rl-title">All Recipes</h1>
        <p className="rl-subtitle">Explore {totalCount}+ recipes from cuisines around the world</p>
      </div>

      <div className="rl-filter-bar">
        <div className="rl-filter-row">
          <span className="rl-filter-label">Cuisine</span>
          <div className="rl-pills">
            {CUISINES.map((c) => (
              <button key={c} className={`rl-pill${activeCuisine === c ? " active" : ""}`} onClick={() => setActiveCuisine(c)}>
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="rl-filter-row">
          <span className="rl-filter-label">Diet</span>
          <div className="rl-pills">
            {["All", "Vegetarian", "Vegan", "Non-Vegetarian"].map((d) => (
              <button key={d} className={`rl-pill${activeDiet === d ? " active" : ""}`} onClick={() => setActiveDiet(d)}>
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rl-toolbar">
        <div className="rl-toolbar-group">
          <span className="rl-toolbar-label">Sort</span>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rl-toolbar-select">
            <option value="id">Newest</option>
            <option value="title">Title</option>
            <option value="cuisine">Cuisine</option>
            <option value="calories">Calories</option>
            <option value="time">Cooking time</option>
            <option value="pantry_match">Pantry match</option>
          </select>
          <button className="rl-toolbar-toggle" onClick={() => setSortOrder((order) => (order === "asc" ? "desc" : "asc"))}>
            {sortOrder === "asc" ? "Asc" : "Desc"}
          </button>
        </div>
        <div className="rl-toolbar-group">
          <span className="rl-toolbar-label">Per page</span>
          <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="rl-toolbar-select">
            {[6, 12, 24].map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="rl-count">
        Showing <strong>{recipes.length}</strong> of {totalCount} recipes · Page {page} of {totalPages}
      </div>

      {actionError && <div className="rl-empty" style={{ maxWidth: 1280, margin: "0 auto 18px", color: "#b91c1c" }}>{actionError}</div>}

      <div className="rl-grid">
        {loading ? (
          <div className="rl-empty" style={{ textAlign: "center", padding: "2rem" }}>Searching recipes...</div>
        ) : recipes.length === 0 ? (
          <div className="rl-empty">No recipes match your filters. Try a different search.</div>
        ) : (
          recipes.map((r, index) => (
            <div
              className="rl-card"
              key={r.id}
              onClick={() => openRecipe(r, index)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter") openRecipe(r, index); }}
              style={{ cursor: "pointer" }}
            >
              <div className="rl-card-img-wrap">
                <img
                  src={r.image}
                  alt={r.title}
                  className="rl-card-img"
                  onError={(event) => onRecipeImageError(event, r)}
                />
                <span className="rl-cuisine-badge">{r.cuisine}</span>
                <button
                  className={`rl-fav-btn${favorites.includes(r.id) ? " active" : ""}`}
                  onClick={(e) => { e.stopPropagation(); toggleFav(r.id); }}
                  title={favorites.includes(r.id) ? "Remove from favorites" : "Add to favorites"}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={favorites.includes(r.id) ? "#e53e3e" : "none"} stroke={favorites.includes(r.id) ? "#e53e3e" : "#fff"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </button>
              </div>
              <div className="rl-card-body">
                <h3 className="rl-card-title">{r.title}</h3>
                <div className="rl-card-meta">
                  <span className="rl-meta-tag rl-meal">{r.meal}</span>
                  <span className="rl-meta-tag rl-diet" style={{ background: (DIET_COLORS[r.diet] || "#6b7280") + "22", color: DIET_COLORS[r.diet] || "#6b7280" }}>
                    {r.diet}
                  </span>
                </div>
                <div className="rl-card-info">
                  <span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    {r.time}
                  </span>
                  <span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
                    {r.calories} kcal
                  </span>
                  <span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    {r.difficulty}
                  </span>
                </div>

                <button className="rl-open-btn" onClick={(e) => { e.stopPropagation(); openRecipe(r, index); }}>
                  View Details
                </button>

                <div className="rl-card-actions">
                  <button className="rl-card-action-btn" onClick={(e) => { e.stopPropagation(); saveRecipeCopy(r); }}>
                    Save Copy
                  </button>
                  <button className="rl-card-action-btn" onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/recipe/${r.id}?edit=1`, {
                      state: {
                        recipe: r,
                        listContext: {
                          recipes,
                          currentIndex: index,
                          page,
                          pageSize,
                          totalCount,
                          totalPages,
                          search,
                          activeCuisine,
                          activeDiet,
                          sortBy,
                          sortOrder,
                        },
                      },
                    });
                  }}>
                    Edit
                  </button>
                  {r.id >= 0 && (
                    <button className="rl-card-action-btn danger" onClick={(e) => { e.stopPropagation(); deleteRecipe(r); }}>
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="rl-pagination">
        <button className="rl-pagination-btn" disabled={page <= 1 || loading} onClick={() => setPage((current) => Math.max(1, current - 1))}>
          Previous
        </button>
        <span className="rl-pagination-info">Page {page} of {totalPages}</span>
        <button className="rl-pagination-btn" disabled={page >= totalPages || loading} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>
          Next
        </button>
      </div>
    </div>
  );
}
