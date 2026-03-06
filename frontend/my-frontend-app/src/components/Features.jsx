function Features({ onExplore }) {

const features = [
	{ emoji: "🔍", title: "Smart Recipe Search", desc: "Find recipes by ingredients, cuisine, diet preferences, or cooking time. Our advanced search helps you discover exactly what you're craving." },
	{ emoji: "🖼️", title: "Image Recognition", desc: "Upload a photo of ingredients or a dish, and we'll identify it and suggest matching recipes. Cook what you see!" },
	{ emoji: "🧮", title: "Advanced Filtering", desc: "Filter by meal type, diet (vegan, keto, etc.), cuisine, difficulty, cooking time, calories, and health benefits to find your perfect recipe." },
	{ emoji: "📚", title: "Recipe Collections", desc: "Browse curated collections and save your favorites. Create custom meal plans and organize recipes for easy access." },
	{ emoji: "❤️", title: "Health Benefits Tracker", desc: "Discover recipes rich in specific nutrients. Learn about vitamins, minerals, and their health benefits with detailed nutritional insights." },
	{ emoji: "🛒", title: "Pantry Management", desc: "Track what's in your pantry and find recipes based on ingredients you have. Get shopping lists for missing items with direct Amazon links." },
	{ emoji: "⭐", title: "Personalized Recommendations", desc: "Get recipe suggestions based on your preferences, dietary needs, and cooking history. Discover new favorites tailored just for you." },
	{ emoji: "📊", title: "Nutritional Information", desc: "View detailed nutrition facts for every recipe including calories, protein, carbs, fats, fiber, vitamins, and minerals." },
	{ emoji: "🌐", title: "Community Features", desc: "Share your cooking experiences, rate recipes, and learn from a community of food enthusiasts around the world." },
	{ emoji: "🧑‍🍳", title: "Skill Level Matching", desc: "Find recipes that match your cooking skills - from beginner-friendly to advanced chef techniques. Grow your culinary expertise!" },
	{ emoji: "⏰", title: "Time-Based Planning", desc: "Filter recipes by preparation and cooking time. Perfect for busy weeknights or leisurely weekend cooking projects." },
	{ emoji: "🌎", title: "Cultural Insights", desc: "Learn about the cultural origins and traditions behind each recipe. Expand your culinary knowledge and appreciation." }
];

return(

<section className="features">

<h2>Explore Our Features</h2>

<p className="feature-subtitle">
Your profile gives you access to powerful tools that make cooking easier,
healthier and more enjoyable.
</p>

<div className="feature-grid">

{features.map((item, index) => (
	<div className="feature-card" key={index}>
		<span className="feature-emoji">{item.emoji}</span>
		<h3 className="feature-title">{item.title}</h3>
		<p className="feature-desc">{item.desc}</p>
	</div>
))}

</div>

<div style={{textAlign:"center", marginTop:"36px"}}>
  <button
    onClick={onExplore}
    style={{
      background:"#ff6a00",
      color:"white",
      border:"none",
      borderRadius:"10px",
      padding:"14px 40px",
      fontSize:"16px",
      fontWeight:"600",
      cursor:"pointer"
    }}
  >
    Explore Features
  </button>
</div>

</section>

)

}

export default Features