import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ChefHat,
  Sparkles,
  Sprout,
  Utensils,
} from "lucide-react";

import "../styles/Home.css";

const highlights = [
  { value: "10k+", label: "recipes to explore" },
  { value: "50+", label: "cuisines covered" },
  { value: "100+", label: "health insights" },
];

const actions = [
  {
    icon: ChefHat,
    title: "Generate a recipe",
    text: "Use the generator to create a fresh idea tailored to your ingredients.",
    target: "/generate-recipe",
  },
  {
    icon: Utensils,
    title: "View menus",
    text: "Jump into meal ideas and planned combinations for easier week-ahead cooking.",
    target: "/menus",
  },
  {
    icon: Sprout,
    title: "Health guide",
    text: "Open the nutrition-focused guide for balanced meal planning.",
    target: "/health-guide",
  },
];

const sampleRecipes = [
  {
    title: "Creamy Tomato Basil Pasta",
    time: "20 min",
    tags: "Vegetarian · Comfort",
    note: "Simple weeknight pasta with fresh basil and garlic.",
    image:
      "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Lemon Herb Grilled Chicken",
    time: "30 min",
    tags: "High Protein · Dinner",
    note: "Tender chicken with lemon, herbs, and roasted vegetables.",
    image:
      "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Mango Yogurt Chia Bowl",
    time: "10 min",
    tags: "Breakfast · Balanced",
    note: "Light and refreshing bowl packed with fiber and vitamins.",
    image:
      "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=1200&q=80",
  },
];

const heroCarouselRecipes = [
  {
    title: "Spicy Garlic Noodles",
    meta: "15 min · Indo-Asian",
    image: "https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=1400&q=80",
  },
  {
    title: "Classic Margherita Pizza",
    meta: "28 min · Italian",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1400&q=80",
  },
  {
    title: "Fresh Salmon Bowl",
    meta: "20 min · High Protein",
    image: "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1400&q=80",
  },
  {
    title: "Herb Chicken Salad",
    meta: "18 min · Balanced",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1400&q=80",
  },
  {
    title: "Berry Yogurt Bowl",
    meta: "8 min · Breakfast",
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1400&q=80",
  },
];

function Home() {
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(() => Math.floor(Math.random() * heroCarouselRecipes.length));

  const goToDashboard = () => navigate("/dashboard");
  const goToMenus = () => navigate("/menus");
  const goToGenerator = () => navigate("/generate-recipe");

  useEffect(() => {
    const intervalId = setInterval(() => {
      setActiveSlide((prev) => {
        if (heroCarouselRecipes.length <= 1) {
          return prev;
        }
        let next = prev;
        while (next === prev) {
          next = Math.floor(Math.random() * heroCarouselRecipes.length);
        }
        return next;
      });
    }, 3200);

    return () => clearInterval(intervalId);
  }, []);

  const carouselPreview = useMemo(() => {
    const ordered = heroCarouselRecipes.slice(activeSlide).concat(heroCarouselRecipes.slice(0, activeSlide));
    return ordered.slice(0, 3);
  }, [activeSlide]);

  return (
    <main className="home-page">
      <div className="home-orb home-orb-one" />
      <div className="home-orb home-orb-two" />

      <section className="home-shell">
        <header className="home-topbar">
          <div className="home-brand">
            <div className="home-brand-mark">
              <Sparkles size={18} />
            </div>
            <div>
              <p>Recipe Discover</p>
              <span>Intelligent cooking workspace</span>
            </div>
          </div>

          <div className="home-topbar-actions">
            <button type="button" className="ghost-button" onClick={goToMenus}>
              View menus
            </button>
            <button type="button" className="primary-button" onClick={goToDashboard}>
              Open dashboard <ArrowRight size={16} />
            </button>
          </div>
        </header>

        <section className="home-hero">
          <div className="home-hero-copy">
            <div className="eyebrow">
              <Sparkles size={14} />
              Fresh recipe discovery made simple
            </div>
            <h1>A wider, calmer home screen for exploring recipes, planning meals, and cooking better.</h1>
            <p>
              Start with a spacious landing area that highlights the main actions without crowding the page. The design keeps the focus on food, nutrition,
              and quick decisions.
            </p>

            <div className="hero-actions">
              <button type="button" className="primary-button large" onClick={goToDashboard}>
                Explore recipes <ArrowRight size={16} />
              </button>
              <button type="button" className="secondary-button large" onClick={goToGenerator}>
                Generate recipe
              </button>
            </div>

            <div className="highlight-row">
              {highlights.map((item) => (
                <article key={item.label} className="highlight-chip">
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </article>
              ))}
            </div>
          </div>

          <div className="home-hero-visual">
            <article className="hero-carousel-card">
              <div className="hero-carousel-main-image-wrap">
                <img
                  key={carouselPreview[0].image}
                  src={carouselPreview[0].image}
                  alt={carouselPreview[0].title}
                  className="hero-carousel-main-image"
                />
              </div>
              <div className="hero-carousel-content">
                <p className="hero-carousel-label">Recipe inspiration</p>
                <h3>{carouselPreview[0].title}</h3>
                <p>{carouselPreview[0].meta}</p>
              </div>
            </article>

            <div className="hero-carousel-thumbs">
              {carouselPreview.slice(1).map((item) => (
                <article key={item.image} className="hero-thumb-card">
                  <img src={item.image} alt={item.title} className="hero-thumb-image" />
                  <div>
                    <h4>{item.title}</h4>
                    <p>{item.meta}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section-block sample-recipes">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Sample recipes</p>
              <h2>Try these quick starter ideas</h2>
            </div>
          </div>

          <div className="sample-grid">
            {sampleRecipes.map((recipe) => (
              <article key={recipe.title} className="sample-card">
                <img src={recipe.image} alt={recipe.title} className="sample-image" loading="lazy" />
                <h3>{recipe.title}</h3>
                <p className="sample-meta">{recipe.time} · {recipe.tags}</p>
                <p>{recipe.note}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section-block action-strip">
          {actions.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.title} type="button" className="action-card" onClick={() => navigate(item.target)}>
                <div className="quick-card-icon">
                  <Icon size={18} />
                </div>
                <div className="quick-card-copy">
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
                <ArrowRight size={16} />
              </button>
            );
          })}
        </section>

        <section className="home-cta">
          <div>
            <p className="section-kicker">Ready to cook</p>
            <h2>Open the part of the app you need and keep the rest of the screen uncluttered.</h2>
          </div>
          <div className="home-cta-actions">
            <button type="button" className="secondary-button" onClick={goToMenus}>
              Browse menus
            </button>
            <button type="button" className="primary-button" onClick={goToGenerator}>
              Generate now <ArrowRight size={16} />
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}

export default Home;