import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/dashboard.css";
import recipes from "../data/recipes";
import ProfileDropdown from "../components/ProfileDropdown";

const INIT_FILTERS = {
  meal: [],
  diet: [],
  cuisine: [],
  difficulty: [],
  maxTime: 95,
  maxCalories: 800,
  healthBenefits: [],
  pantry: [],
};

function filterRecipes(recipes, f, search) {
  return recipes.filter(r => {
    if (search) {
      const q = search.toLowerCase();
      if (!r.title.toLowerCase().includes(q) && !r.cuisine.toLowerCase().includes(q)) return false;
    }
    if (f.meal.length && !f.meal.includes(r.meal)) return false;
    if (f.diet.length && !f.diet.includes(r.diet)) return false;
    if (f.cuisine.length && !f.cuisine.includes(r.cuisine)) return false;
    if (f.difficulty.length && !f.difficulty.includes(r.difficulty)) return false;
    if (parseInt(r.time) > f.maxTime) return false;
    if (r.calories > f.maxCalories) return false;
    if (f.healthBenefits.length) {
      const ok = f.healthBenefits.every(hb =>
        r.healthBenefits.some(b => b.toLowerCase().includes(hb))
      );
      if (!ok) return false;
    }
    if (f.pantry.includes("usePantry") && r.pantryMatch < 70) return false;
    if (f.pantry.includes("maxMissing2") && r.ingredients.missing.length > 2) return false;
    return true;
  });
}

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [pending, setPending] = useState(INIT_FILTERS);
  const [applied, setApplied] = useState(INIT_FILTERS);
  const [search, setSearch] = useState(() => {
    const q = new URLSearchParams(location.search).get("q");
    return q || "";
  });

  useEffect(() => {
    const q = new URLSearchParams(location.search).get("q");
    if (q) setSearch(q);
  }, [location.search]);

  const toggle = (key, value) =>
    setPending(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(v => v !== value)
        : [...prev[key], value],
    }));

  const applyFilters = () => setApplied({ ...pending });

  const resetFilters = () => {
    setPending(INIT_FILTERS);
    setApplied(INIT_FILTERS);
  };

  const filtered = filterRecipes(recipes, applied, search);

  // Upload state
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const clearUpload = () => {
    setPreview(null);
    setFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="dashboard">

      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">🍲 RecipeDiscover</div>

        <div className="nav-links">
          <a className="active" onClick={() => navigate("/home")} style={{cursor:"pointer"}}>
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
        </div>

        <div className="search-box">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            placeholder="Search for dishes or ingredients..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <ProfileDropdown />
      </nav>

      <div className="container">

        {/* Sidebar */}
        <aside className="sidebar">

          <h3>Filters</h3>

          <div className="filter-group">
            <h4>Meal Type</h4>
            {["Breakfast","Lunch","Dinner","Snack","Dessert"].map(v => (
              <label key={v}>
                <input type="checkbox" checked={pending.meal.includes(v)} onChange={() => toggle("meal", v)}/> {v}
              </label>
            ))}
          </div>

          <div className="filter-group">
            <h4>Diet Preference</h4>
            {["Vegetarian","Vegan","Eggitarian","Non-Vegetarian","Gluten-Free"].map(v => (
              <label key={v}>
                <input type="checkbox" checked={pending.diet.includes(v)} onChange={() => toggle("diet", v)}/> {v}
              </label>
            ))}
          </div>

          <div className="filter-group">
            <h4>Cuisine</h4>
            {["Indian","North Indian","Asian","African","Western"].map(v => (
              <label key={v}>
                <input type="checkbox" checked={pending.cuisine.includes(v)} onChange={() => toggle("cuisine", v)}/> {v}
              </label>
            ))}
          </div>

          <div className="filter-group">
            <h4>Difficulty</h4>
            {["Easy","Medium","Hard"].map(v => (
              <label key={v}>
                <input type="checkbox" checked={pending.difficulty.includes(v)} onChange={() => toggle("difficulty", v)}/> {v}
              </label>
            ))}
          </div>

          <div className="filter-group">
            <h4>Cooking Time</h4>
            <input
              type="range"
              className="range-slider"
              min={0}
              max={95}
              value={pending.maxTime}
              onChange={e => setPending(p => ({ ...p, maxTime: Number(e.target.value) }))}
            />
            <div className="range-labels">
              <span>0 min</span>
              <span>{pending.maxTime} min</span>
            </div>
          </div>

          <div className="filter-group">
            <h4>Calories</h4>
            <input
              type="range"
              className="range-slider"
              min={0}
              max={800}
              value={pending.maxCalories}
              onChange={e => setPending(p => ({ ...p, maxCalories: Number(e.target.value) }))}
            />
            <div className="range-labels">
              <span>0 kcal</span>
              <span>{pending.maxCalories} kcal</span>
            </div>
          </div>

          <div className="filter-divider" />

          <div className="filter-group">
            <h4>Health Benefits</h4>
            {[["High protein","protein"],["Low Carb","carb"],["Diabetic Friendly","diabetic"],["Heart healthy","heart"]].map(([label, val]) => (
              <label key={val}>
                <input type="checkbox" checked={pending.healthBenefits.includes(val)} onChange={() => toggle("healthBenefits", val)}/> {label}
              </label>
            ))}
          </div>

          <div className="filter-divider" />

          <div className="filter-group">
            <h4>Pantry</h4>
            <label>
              <input type="checkbox" checked={pending.pantry.includes("usePantry")} onChange={() => toggle("pantry","usePantry")}/> Use My Pantry
            </label>
            <label>
              <input type="checkbox" checked={pending.pantry.includes("maxMissing2")} onChange={() => toggle("pantry","maxMissing2")}/> Missing &le; 2 items
            </label>
          </div>

          <button className="apply-filters-btn" onClick={applyFilters}>Apply Filters</button>
          <button className="apply-filters-btn" onClick={resetFilters} style={{marginTop:"8px",background:"#f3f4f6",color:"#555",border:"1px solid #ddd"}}>Reset</button>

        </aside>

        {/* Main Content */}
        <main className="main">

          {/* Upload Box */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{display:"none"}}
            onChange={e => handleFile(e.target.files[0])}
          />

          {!preview ? (
            <div
              className={`upload-box${dragOver ? " upload-box-dragover" : ""}`}
              onClick={() => fileInputRef.current.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <div className="upload-icon-circle">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ff6a00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <h3 className="upload-title">{dragOver ? "Drop it here!" : "Upload a dish image"}</h3>
              <p className="upload-sub">Drag and drop or <span className="upload-browse">click to browse</span></p>
              <small className="upload-formats">Supported formats: JPG, PNG, GIF</small>
            </div>
          ) : (
            <div className="upload-preview-box">
              <img src={preview} alt="preview" className="upload-preview-img" />
              <div className="upload-preview-bar">
                <div className="upload-preview-info">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  <span className="upload-preview-name">{fileName}</span>
                </div>
                <div style={{display:"flex",gap:"10px"}}>
                  <button className="upload-change-btn" onClick={() => fileInputRef.current.click()}>Change</button>
                  <button className="upload-change-btn" onClick={clearUpload} style={{borderColor:"#ef4444",color:"#ef4444"}}>Remove</button>
                </div>
              </div>
            </div>
          )}

          {/* Recipes */}
          <h2>{filtered.length} Recipe{filtered.length !== 1 ? "s" : ""} Found</h2>
          <p className="subtitle">
            Discover delicious recipes tailored to your preferences
          </p>

          {filtered.length === 0 ? (
            <div style={{textAlign:"center",padding:"60px 20px",color:"#888"}}>
              <div style={{fontSize:"3rem",marginBottom:"12px"}}>🍽️</div>
              <p style={{fontSize:"1.1rem",fontWeight:600,color:"#555",marginBottom:"8px"}}>No recipes match your filters</p>
              <p style={{marginBottom:"20px"}}>Try adjusting or resetting your filters</p>
              <button className="apply-filters-btn" onClick={resetFilters}>Reset Filters</button>
            </div>
          ) : (
            <div className="recipes-grid">
              {filtered.map((r, index) => (
                <div className="recipe-card" key={index}>
                  <img src={r.image} alt={r.title}/>
                  <span className="badge">{r.cuisine}</span>
                  <h3>{r.title}</h3>
                  <div className="meta">
                    <span>⏱ {r.time}</span>
                    <span>🔥 {r.calories} kcal</span>
                  </div>
                  <button onClick={() => navigate(`/recipe/${r.id}`)}>View Details</button>
                </div>
              ))}
            </div>
          )}

        </main>

      </div>
    </div>
  );
}

export default Dashboard;