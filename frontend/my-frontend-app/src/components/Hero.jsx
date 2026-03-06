function Hero({ onExplore }) {
  return (
    <section className="hero">

      <h1>Welcome, one! 👋</h1>

      <p>
        Discover your culinary potential with our comprehensive recipe platform
      </p>

      <button className="hero-btn" onClick={onExplore}>
        Start Exploring Recipes
      </button>

    </section>
  );
}

export default Hero;