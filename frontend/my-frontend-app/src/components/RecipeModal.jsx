import React from "react";
import "../styles/RecipeModal.css";

export default function RecipeModal({ recipe, onClose }) {
  if (!recipe) return null;

  const availableIngredients = Array.isArray(recipe.ingredients?.available) ? recipe.ingredients.available.filter(Boolean) : [];
  const missingIngredients = Array.isArray(recipe.ingredients?.missing) ? recipe.ingredients.missing.filter(Boolean) : [];
  const steps = Array.isArray(recipe.steps) ? recipe.steps.filter(Boolean) : [];

  return (
    <div className="rm-overlay" onClick={onClose}>
      <div className="rm-modal" onClick={(e) => e.stopPropagation()}>
        <button className="rm-close" onClick={onClose}>✕</button>
        <div className="rm-content">
          <div className="rm-hero">
            <img src={recipe.image} alt={recipe.title} className="rm-image" />
            <div className="rm-hero-info">
              <h2 className="rm-title">{recipe.title}</h2>
              <div className="rm-meta">{recipe.cuisine} • {recipe.time} • {recipe.meal}</div>
              <div className="rm-meta rm-meta-secondary">
                {recipe.difficulty ? <span>{recipe.difficulty}</span> : <span>Difficulty not listed</span>}
                {typeof recipe.calories === "number" ? <span>• {recipe.calories} kcal</span> : null}
              </div>
            </div>
          </div>

          <section className="rm-section">
            <h3>Ingredients</h3>
            <div className="rm-ingredients">
              <div>
                <strong>Available</strong>
                <ul>
                  {availableIngredients.length > 0 ? (
                    availableIngredients.map((it, i) => (
                      <li key={`av-${i}`}>{it}</li>
                    ))
                  ) : (
                    <li className="rm-empty">No ingredient details available.</li>
                  )}
                </ul>
              </div>
              <div>
                <strong>Missing</strong>
                <ul>
                  {missingIngredients.length > 0 ? (
                    missingIngredients.map((it, i) => (
                      <li key={`mi-${i}`}>{it}</li>
                    ))
                  ) : (
                    <li className="rm-empty">No missing items listed.</li>
                  )}
                </ul>
              </div>
            </div>
          </section>

          <section className="rm-section">
            <h3>Steps</h3>
            <ol className="rm-steps">
              {steps.length > 0 ? (
                steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))
              ) : (
                <li className="rm-empty">No step-by-step instructions available.</li>
              )}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}
