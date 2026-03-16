import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Menus.css";
import ProfileDropdown from "../components/ProfileDropdown";

const menus = [
  {
    id: 0,
    title: "Classic Italian Dinner",
    occasion: "Family Dinner",
    image: "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=600&q=80",
    description: "An authentic Italian feast perfect for family gatherings and special occasions",
    servings: 6,
    totalTime: "2 hours",
    calories: 2400,
    courses: [
      { name: "Appetizer", items: ["Bruschetta with Tomato & Basil", "Caprese Salad"] },
      { name: "Main Course", items: ["Spaghetti Carbonara", "Chicken Parmesan", "Garlic Bread"] },
      { name: "Side Dish", items: ["Caesar Salad", "Roasted Vegetables"] },
      { name: "Dessert", items: ["Tiramisu", "Panna Cotta"] }
    ]
  },
  {
    id: 1,
    title: "Healthy Breakfast Bundle",
    occasion: "Breakfast",
    description: "Start your day right with nutritious and delicious breakfast options",
    servings: 4,
    totalTime: "45 minutes",
    calories: 1200,
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&q=80",
    courses: [
      { name: "Main", items: ["Idli Sambar", "Greek Yogurt Parfait", "Spinach & Feta Omelette"] },
      { name: "Beverage", items: ["Fresh Orange Juice", "Green Smoothie"] },
      { name: "Side", items: ["Mixed Berry Bowl", "Whole Grain Toast"] }
    ]
  },
  {
    id: 2,
    title: "Asian Fusion Night",
    occasion: "Dinner Party",
    description: "Explore bold flavors from across Asia in this diverse menu",
    servings: 4,
    totalTime: "1.5 hours",
    calories: 2000,
    image: "https://images.unsplash.com/photo-1555126634-323283e090fa?w=600&q=80",
    courses: [
      { name: "Appetizer", items: ["Spring Rolls", "Edamame", "Gyoza"] },
      { name: "Main Course", items: ["Pad Thai", "Sushi Platter", "Teriyaki Chicken"] },
      { name: "Side Dish", items: ["Fried Rice", "Miso Soup"] },
      { name: "Dessert", items: ["Mochi Ice Cream", "Green Tea Cheesecake"] }
    ]
  },
  {
    id: 3,
    title: "Mexican Fiesta",
    occasion: "Party",
    description: "Vibrant and spicy Mexican dishes for a festive celebration",
    servings: 8,
    totalTime: "2.5 hours",
    calories: 2800,
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80",
    courses: [
      { name: "Appetizer", items: ["Guacamole & Chips", "Queso Fundido", "Salsa Trio"] },
      { name: "Main Course", items: ["Beef Tacos", "Chicken Enchiladas", "Vegetarian Burrito Bowl"] },
      { name: "Side Dish", items: ["Mexican Rice", "Refried Beans", "Street Corn"] },
      { name: "Dessert", items: ["Churros", "Tres Leches Cake"] }
    ]
  },
  {
    id: 4,
    title: "Mediterranean Lunch",
    occasion: "Lunch",
    description: "Light and fresh Mediterranean flavors perfect for a healthy lunch",
    servings: 4,
    totalTime: "1 hour",
    calories: 1800,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80",
    courses: [
      { name: "Appetizer", items: ["Hummus Platter", "Tabbouleh"] },
      { name: "Main Course", items: ["Grilled Salmon", "Chicken Souvlaki", "Falafel Wrap"] },
      { name: "Side Dish", items: ["Greek Salad", "Pita Bread", "Tzatziki"] },
      { name: "Dessert", items: ["Baklava", "Fresh Fruit Platter"] }
    ]
  },
  {
    id: 5,
    title: "American BBQ Cookout",
    occasion: "BBQ Party",
    description: "Classic American BBQ favorites for outdoor gatherings",
    servings: 10,
    totalTime: "3 hours",
    calories: 3200,
    image: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&q=80",
    courses: [
      { name: "Appetizer", items: ["Buffalo Wings", "Onion Rings", "Coleslaw"] },
      { name: "Main Course", items: ["BBQ Ribs", "Grilled Burgers", "Pulled Pork Sandwich"] },
      { name: "Side Dish", items: ["Mac & Cheese", "Baked Beans", "Corn on the Cob"] },
      { name: "Dessert", items: ["Apple Pie", "Brownies"] }
    ]
  },
  {
    id: 6,
    title: "Vegan Delight Menu",
    occasion: "Healthy Dinner",
    description: "Plant-based dishes that are both nutritious and delicious",
    servings: 4,
    totalTime: "1.5 hours",
    calories: 1600,
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80",
    courses: [
      { name: "Appetizer", items: ["Vegetable Spring Rolls", "Stuffed Mushrooms"] },
      { name: "Main Course", items: ["Quinoa Buddha Bowl", "Lentil Curry", "Quinoa Stuffed Peppers"] },
      { name: "Side Dish", items: ["Roasted Sweet Potato", "Steamed Broccoli"] },
      { name: "Dessert", items: ["Vegan Chocolate Mousse", "Coconut Chia Pudding"] }
    ]
  },
  {
    id: 7,
    title: "French Bistro Experience",
    occasion: "Fine Dining",
    description: "Elegant French cuisine for a sophisticated dining experience",
    servings: 4,
    totalTime: "2.5 hours",
    calories: 2500,
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80",
    courses: [
      { name: "Appetizer", items: ["French Onion Soup", "Escargot"] },
      { name: "Main Course", items: ["Coq Au Vin", "Beef Bourguignon", "Ratatouille"] },
      { name: "Side Dish", items: ["Pommes Frites", "Green Beans Almondine"] },
      { name: "Dessert", items: ["Crème Brûlée", "Chocolate Soufflé"] }
    ]
  }
];

const occasionColors = {
  "Family Dinner": "#f97316",
  "Breakfast":     "#22c55e",
  "Dinner Party":  "#ef4444",
  "Party":         "#8b5cf6",
  "Lunch":         "#3b82f6",
  "BBQ Party":     "#f97316",
  "Healthy Dinner":"#16a34a",
  "Fine Dining":   "#6366f1"
};

const occasions = ["All", "Breakfast", "Lunch", "Dinner Party", "Family Dinner", "Party", "BBQ Party", "Healthy Dinner", "Fine Dining"];

function Menus() {
  const navigate = useNavigate();
  const [activeOccasion, setActiveOccasion] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = menus.filter(m => {
    const occasionOk = activeOccasion === "All" || m.occasion === activeOccasion;
    if (!search) return occasionOk;
    const q = search.toLowerCase();
    const inTitle = m.title.toLowerCase().includes(q);
    const inDesc = m.description.toLowerCase().includes(q);
    const inCourses = m.courses.some(c =>
      c.name.toLowerCase().includes(q) ||
      c.items.some(item => item.toLowerCase().includes(q))
    );
    return occasionOk && (inTitle || inDesc || inCourses);
  });

  return (
    <div className="menus-page">

      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">🍲 RecipeDiscover</div>
        <div className="nav-links">
          <a onClick={() => navigate("/home")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Home
          </a>
          <a onClick={() => navigate("/recipes")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            Recipes
          </a>
          <a className="active">
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
            placeholder="Search menus, dishes or occasions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <ProfileDropdown />
      </nav>

      {/* Page Header */}
      <div className="menus-header">
        <h1 className="menus-title">Curated Menus</h1>
        <p className="menus-subtitle">Explore our carefully crafted menu collections for every occasion</p>

        {/* Filter Bar */}
        <div className="menus-filter-bar">
          <span className="menus-filter-label">Filter by Occasion</span>
          <div className="menus-filter-pills">
            {occasions.map(o => (
              <button
                key={o}
                className={`menus-pill ${activeOccasion === o ? "menus-pill-active" : ""}`}
                onClick={() => setActiveOccasion(o)}
              >
                {o}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="menus-grid">
        {filtered.length === 0 ? (
          <div style={{gridColumn:"1/-1",textAlign:"center",padding:"60px 20px",color:"#888"}}>
            <div style={{fontSize:"3rem",marginBottom:"12px"}}>🍽️</div>
            <p style={{fontSize:"1.1rem",fontWeight:600,color:"#555",marginBottom:"8px"}}>No menus match your search</p>
            <button style={{marginTop:"8px",background:"#ff6a00",color:"#fff",border:"none",borderRadius:"8px",padding:"10px 24px",fontWeight:600,cursor:"pointer"}} onClick={() => setSearch("")}>Clear Search</button>
          </div>
        ) : filtered.map(menu => (
          <div className="menu-card" key={menu.id}>

            {/* Image */}
            <div className="menu-card-img-wrap">
              <img src={menu.image} alt={menu.title} className="menu-card-img" />
              <span
                className="menu-occasion-badge"
                style={{ background: occasionColors[menu.occasion] || "#f97316" }}
              >
                {menu.occasion}
              </span>
            </div>

            {/* Content */}
            <div className="menu-card-body">
              <h2 className="menu-card-title">{menu.title}</h2>
              <p className="menu-card-desc">{menu.description}</p>

              {/* Stats */}
              <div className="menu-card-stats">
                <span>🍽 <strong>{menu.servings}</strong></span>
                <span>⏱ <strong>{menu.totalTime}</strong></span>
                <span>🔥 <strong>{menu.calories}</strong></span>
              </div>

              {/* Courses */}
              <div className="menu-courses">
                {menu.courses.map((course, i) => (
                  <div key={i} className="menu-course-row">
                    <p className="menu-course-name">
                      <span className="menu-course-dot" />
                      {course.name}
                    </p>
                    <ul className="menu-course-items">
                      {course.items.map((item, j) => (
                        <li key={j}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <button className="menu-view-btn" onClick={() => navigate("/recipes")}>
                View Recipes
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}

export default Menus;
