import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/RecipeDetail.css";

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
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [buyItem, setBuyItem] = useState(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const res = await fetch(`http://127.0.0.1:8000/recipes/${id}`);
        if (!res.ok) {
          throw new Error("Recipe not found");
        }

        const data = await res.json();
        const ingredients = data.ingredients && typeof data.ingredients === "object"
          ? {
              available: Array.isArray(data.ingredients.available) ? data.ingredients.available : [],
              missing: Array.isArray(data.ingredients.missing) ? data.ingredients.missing : [],
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

        const steps = Array.isArray(data.steps) && data.steps.length > 0
          ? data.steps
          : ["Detailed steps are being updated for this recipe."];

        setRecipe({
          ...data,
          ingredients,
          nutrition,
          steps,
          healthBenefits: Array.isArray(data.health_benefits) ? data.health_benefits : [],
          similarDishes: Array.isArray(data.similar_dishes) ? data.similar_dishes : [],
          pantryMatch: data.pantry_match ?? 0,
        });
      } catch (error) {
        setLoadError(error.message || "Unable to load recipe details");
        setRecipe(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

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

  const resumeVoice = () => {
    window.speechSynthesis.resume();
    setVoicePaused(false);
  };

  const skipStep = () => {
    window.speechSynthesis.cancel();
    setCurrentStep(prev => {
      const next = prev === -2 ? 0 : prev + 1;
      return next >= recipe.steps.length ? recipe.steps.length : next;
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
    { emoji: "🔥", label: "Calories", value: `${recipe.calories} kcal` },
    { emoji: "💪", label: "Protein",  value: `${recipe.nutrition.protein}g` },
    { emoji: "🌾", label: "Carbohydrates", value: `${recipe.nutrition.carbs}g` },
    { emoji: "🥑", label: "Fat", value: `${recipe.nutrition.fat}g` },
    { emoji: "🌿", label: "Fiber", value: `${recipe.nutrition.fiber}g` }
  ];

  return (
    <div className="rd-page">
      {buyItem && (
        <BuyModal
          item={buyItem}
          recipeName={recipe.title}
          onClose={() => setBuyItem(null)}
        />
      )}

      {/* Header */}
      <div className="rd-header">
        <button className="rd-back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div className="rd-hero">
          <div className="rd-tags">
            <span className="rd-tag rd-tag-grey">{recipe.cuisine}</span>
            <span className="rd-tag" style={{ background: difficultyColor[recipe.difficulty] }}>{recipe.difficulty}</span>
            <span className="rd-tag" style={{ background: dietColor[recipe.diet] || "#22c55e" }}>{recipe.diet}</span>
          </div>

          <h1 className="rd-title">{recipe.title}</h1>

          <div className="rd-meta">
            <span>⏱ {recipe.time}</span>
            <span>🔥 {recipe.calories} kcal</span>
            <span>🍽 {recipe.meal}</span>
          </div>
        </div>
      </div>

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
                  {recipe.ingredients.available.map((item, i) => (
                    <li key={i}><span className="rd-dot rd-dot-green" />{item}</li>
                  ))}
                </ul>
              </div>

              <div className="rd-ingredients-col">
                <p className="rd-ing-heading rd-ing-red">⊗ Missing Items</p>
                <ul className="rd-ing-list">
                  {recipe.ingredients.missing.map((item, i) => (
                    <li key={i} className="rd-missing-item">
                      <span className="rd-dot rd-dot-red" />{item}
                      <button
                        className="rd-buy-btn"
                        onClick={() => setBuyItem(item)}
                      >🛒 Buy</button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Cooking Instructions */}
          <div className="rd-card">
            <div className="rd-instructions-header">
              <h2 className="rd-section-title" style={{margin:0}}>Cooking Instructions</h2>
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
                    {voicePaused ? "Paused" : currentStep >= 0 ? `Speaking Step ${currentStep + 1} of ${recipe.steps.length}` : "Preparing..."}
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
              {recipe.steps.map((step, i) => (
                <li key={i} className={currentStep === i ? "rd-step-active" : ""}>
                  <span className="rd-step-num">{i + 1}</span>
                  <span className="rd-step-text">{step}</span>
                  {currentStep === i && (
                    <span className="rd-step-speaking-badge">🔊 Speaking...</span>
                  )}
                </li>
              ))}
            </ol>
          </div>

          {/* Cultural Insight */}
          <div className="rd-card rd-cultural">
            <h2 className="rd-section-title">💡 Cultural Insight</h2>
            <p className="rd-cultural-text">{recipe.cultural}</p>
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
              {recipe.healthBenefits.map((b, i) => (
                <span key={i} className="rd-benefit-tag">{b}</span>
              ))}
            </div>
          </div>

          {/* Similar Dishes */}
          <div className="rd-card">
            <h2 className="rd-section-title">Similar Dishes</h2>
            <ul className="rd-similar-list">
              {recipe.similarDishes.map((d, i) => (
                <li key={i} className="rd-similar-item">{d}</li>
              ))}
            </ul>
          </div>

          {/* Pantry Match */}
          <div className="rd-pantry-card">
            <p className="rd-pantry-label">Pantry Match</p>
            <p className="rd-pantry-percent">{recipe.pantryMatch}%</p>
            <p className="rd-pantry-sub">You have most ingredients for this recipe!</p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default RecipeDetail;
