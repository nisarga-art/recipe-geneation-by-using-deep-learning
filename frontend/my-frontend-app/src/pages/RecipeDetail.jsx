import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import recipes from "../data/recipes";
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
  const recipe = recipes[Number(id)];
  const [buyItem, setBuyItem] = useState(null);

  if (!recipe) {
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
            <h2 className="rd-section-title">Cooking Instructions</h2>
            <ol className="rd-steps">
              {recipe.steps.map((step, i) => (
                <li key={i}>
                  <span className="rd-step-num">{i + 1}</span>
                  <span className="rd-step-text">{step}</span>
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
