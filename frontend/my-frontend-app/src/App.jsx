import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import RecipeDetail from "./pages/RecipeDetail";
import RecipesList from "./pages/RecipesList";
import Menus from "./pages/Menus";
import HealthGuide from "./pages/HealthGuide";
import NutrientDetail from "./pages/NutrientDetail";

function App() {
  return (
    <Routes>

      <Route path="/login" element={<Login />} />

      <Route path="/home" element={<Home />} />

      <Route path="/dashboard" element={<Dashboard />} />

      <Route path="/recipe/:id" element={<RecipeDetail />} />

      <Route path="/recipes" element={<RecipesList />} />

      <Route path="/menus" element={<Menus />} />

      <Route path="/health-guide" element={<HealthGuide />} />

      <Route path="/nutrient/:slug" element={<NutrientDetail />} />

      <Route path="/" element={<Navigate to="/login" />} />

    </Routes>
  );
}

export default App;