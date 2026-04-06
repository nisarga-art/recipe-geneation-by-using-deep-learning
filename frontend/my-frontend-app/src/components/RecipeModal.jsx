import React from "react";
import "../styles/RecipeModal.css";

export default function RecipeModal({ recipe, onClose }) {
  if (!recipe) return null;

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
            </div>
          </div>

          <section className="rm-section">
            <h3>Ingredients</h3>
            <div className="rm-ingredients">
              <div>
                <strong>Available</strong>
                <ul>
                  {recipe.ingredients?.available?.map((it, i) => (
                    <li key={`av-${i}`}>{it}</li>
                  ))}
                </ul>
              </div>
              <div>
                <strong>Missing</strong>
                <ul>
                  {recipe.ingredients?.missing?.map((it, i) => (
                    <li key={`mi-${i}`}>{it}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="rm-section">
            <h3>Steps</h3>
            <ol className="rm-steps">
              {recipe.steps?.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}
