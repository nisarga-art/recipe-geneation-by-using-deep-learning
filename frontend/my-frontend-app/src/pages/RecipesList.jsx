import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProfileDropdown from "../components/ProfileDropdown";
import allRecipes from "../data/allRecipes";
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

const normalizeRecipe = (item) => ({
  id: item.id,
  title: item.title || "Untitled Recipe",
  cuisine: item.cuisine || "Fusion",
  diet: item.diet || "Unknown",
  time: item.time || "30 minutes",
  calories: typeof item.calories === "number" ? item.calories : item.calories || "Unknown",
  difficulty: item.difficulty || "Unknown",
  meal: item.meal || "Main Course",
  image: item.image || DEFAULT_IMAGE,
  pantry_match: item.pantry_match ?? null,
  steps: Array.isArray(item.steps) && item.steps.length
    ? item.steps
    : [
        "Prep ingredients: chop aromatics, measure spices, ready protein/veg.",
        "Cook base: heat oil, sauté aromatics, toast spices until fragrant.",
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
});

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

export default function RecipesList() {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCuisine, setActiveCuisine] = useState("All");
  const [activeDiet, setActiveDiet] = useState("All");
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem("rl_favorites") || "[]"); }
    catch { return []; }
  });
  const [favOpen, setFavOpen] = useState(false);
  const favRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (activeCuisine !== "All") params.append("cuisine", activeCuisine);
    if (activeDiet !== "All") params.append("diet", activeDiet);

    const fetchData = async () => {
      setLoading(true);
      try {
        const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
        const url = search
          ? `${API_BASE.replace(/\/$/, "")}/recipes/search?query=${encodeURIComponent(search)}&${params.toString()}`
          : `${API_BASE.replace(/\/$/, "")}/recipes?${params.toString()}`;
        const res = await fetch(url);
        const data = await res.json();
        const apiList = Array.isArray(data) ? data : [];

        const filteredApi = applyFilters(apiList, search, activeCuisine, activeDiet);
        const filteredFallback = applyFilters(allRecipes, search, activeCuisine, activeDiet);

        // Prefer live data; if none, fall back to curated local recipes so the grid is never empty.
        setRecipes(filteredApi.length ? filteredApi : filteredFallback);
      } catch (err) {
        console.error("Failed to fetch recipes:", err);
        setRecipes(applyFilters(allRecipes, search, activeCuisine, activeDiet));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [search, activeCuisine, activeDiet]);

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

  const filtered = recipes;

  return (
    <div className="rl-page">
      {/* ── Navbar ─────────────────────────────────────────── */}
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
        </div>
        <div className="search-box">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            placeholder="Search recipes, cuisines..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Favorites navbar icon */}
        <div className="rl-nav-fav" ref={favRef}>
          <button
            className={`rl-nav-fav-btn${favOpen ? " open" : ""}`}
            onClick={() => setFavOpen((o) => !o)}
            title="My Favorites"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill={favorites.length > 0 ? "#e53e3e" : "none"} stroke={favorites.length > 0 ? "#e53e3e" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            {favorites.length > 0 && (
              <span className="rl-nav-fav-badge">{favorites.length}</span>
            )}
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
                      <img src={r.image} alt={r.title} className="rl-fav-item-img" />
                      <div className="rl-fav-item-info">
                        <span className="rl-fav-item-title">{r.title}</span>
                        <span className="rl-fav-item-cuisine">{r.cuisine} · {r.time}</span>
                      </div>
                      <button
                        className="rl-fav-item-remove"
                        onClick={() => toggleFav(r.id)}
                        title="Remove"
                      >
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

      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="rl-header">
        <h1 className="rl-title">All Recipes</h1>
        <p className="rl-subtitle">
          Explore {recipes.length}+ recipes from cuisines around the world
        </p>
      </div>

      {/* ── Filter Bar ──────────────────────────────────────── */}
      <div className="rl-filter-bar">
        <div className="rl-filter-row">
          <span className="rl-filter-label">Cuisine</span>
          <div className="rl-pills">
            {CUISINES.map((c) => (
              <button
                key={c}
                className={`rl-pill${activeCuisine === c ? " active" : ""}`}
                onClick={() => setActiveCuisine(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="rl-filter-row">
          <span className="rl-filter-label">Diet</span>
          <div className="rl-pills">
            {["All", "Vegetarian", "Vegan", "Non-Vegetarian"].map((d) => (
              <button
                key={d}
                className={`rl-pill${activeDiet === d ? " active" : ""}`}
                onClick={() => setActiveDiet(d)}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recipe Count ────────────────────────────────────── */}
      <div className="rl-count">
        Showing <strong>{filtered.length}</strong> of {recipes.length} recipes
      </div>

      {/* ── Recipe Grid ─────────────────────────────────────── */}
      <div className="rl-grid">
        {loading ? (
          <div className="rl-empty" style={{textAlign:"center",padding:"2rem"}}>🔍 Searching recipes...</div>
        ) : filtered.length === 0 ? (
          <div className="rl-empty">No recipes match your filters. Try a different search.</div>
        ) : (
          filtered.map((r) => (
            <div className="rl-card" key={r.id}>
              <div className="rl-card-img-wrap">
                <img src={r.image} alt={r.title} className="rl-card-img" />
                <span className="rl-cuisine-badge">{r.cuisine}</span>
                <button
                  className={`rl-fav-btn${favorites.includes(r.id) ? " active" : ""}`}
                  onClick={() => toggleFav(r.id)}
                  title={favorites.includes(r.id) ? "Remove from favorites" : "Add to favorites"}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={favorites.includes(r.id) ? "#e53e3e" : "none"} stroke={favorites.includes(r.id) ? "#e53e3e" : "#fff"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </button>
              </div>
              <div className="rl-card-body">
                <h3 className="rl-card-title">{r.title}</h3>
                <div className="rl-card-meta">
                  <span className="rl-meta-tag rl-meal">{r.meal}</span>
                  <span
                    className="rl-meta-tag rl-diet"
                    style={{ background: (DIET_COLORS[r.diet] || "#6b7280") + "22", color: DIET_COLORS[r.diet] || "#6b7280" }}
                  >
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

                <button
                  className="rl-open-btn"
                  onClick={() => navigate(`/recipe/${r.id}`, { state: { recipe: r } })}
                >
                  View Details
                </button>

              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
