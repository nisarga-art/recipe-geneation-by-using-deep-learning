import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/HealthGuide.css";
import ProfileDropdown from "../components/ProfileDropdown";

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
  const fileInputRef = useRef(null);

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

    // Use Vite env var if provided, otherwise default to localhost:8000
    const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
    const url = `${API_BASE.replace(/\/$/, "")}/health-plan/recommendations`;

    // Backend expects HealthPlanRequest schema (snake_case): arrays for health_issues and avoid_ingredients
    const payload = {
      health_issues: (plannerForm.healthIssues || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      diet_goal: plannerForm.dietGoal || null,
      meal_type: plannerForm.mealType || null,
      preferences: plannerForm.preferences || null,
      avoid_ingredients: (plannerForm.avoidIngredients || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      max_prep_time: plannerForm.maxPrepTime ? Number(plannerForm.maxPrepTime) : null,
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      // Network-level OK but server may return non-2xx JSON error
      const text = await res.text();
      let data = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch (err) {
        throw new Error("Invalid JSON response from server.");
      }

      if (!res.ok) {
        const message = (data && (data.detail || data.error || data.message)) || `Server responded with ${res.status}`;
        throw new Error(message);
      }

      // Expect `data` to contain a `recipes` array for rendering
      setPlannerResult(data);
    } catch (err) {
      if (err.name === "AbortError") {
        setPlannerError("Request timed out. Please try again.");
      } else {
        setPlannerError(err.message || "Failed to fetch recipes.");
      }
    } finally {
      clearTimeout(timeout);
      setPlannerLoading(false);
    }
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
            Tell us your health issues or diet goal and get food recommendations with recipes you can cook now.
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
              {plannerLoading ? "Generating Plan..." : "Get My Food & Recipe Plan"}
            </button>
          </form>

          {plannerError && <p className="hg-plan-error">{plannerError}</p>}

          {plannerResult && (
            <div className="hg-plan-result">
              <p className="hg-plan-summary">{plannerResult.summary}</p>

              <div className="hg-plan-grid">
                <div className="hg-plan-foods">
                  <h3>Recommended Foods</h3>
                  {plannerResult.recommended_foods.map((food, index) => (
                    <div key={index} className="hg-plan-food-card">
                      <p className="hg-plan-food-name">{food.name}</p>
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
            <div className="hg-nutrient-card" key={i}>
              <span className="hg-nutrient-emoji" style={{ background: n.color + "18" }}>
                {n.emoji}
              </span>
              <h3 className="hg-nutrient-name">{n.name}</h3>
              <p className="hg-nutrient-desc">{n.desc}</p>
              <button className="hg-learn-btn" style={{ color: n.color }} onClick={() => navigate("/nutrient/" + n.slug)}>
                Learn More &rsaquo;
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default HealthGuide;
