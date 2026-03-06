import React from "react";
import { useNavigate } from "react-router-dom";

import Hero from "../components/Hero";
import Features from "../components/Features";
import QuickNavigation from "../components/QuickNavigation";
import Stats from "../components/Stats";

function Home() {
  const navigate = useNavigate();

  const goToDashboard = () => navigate("/dashboard");
  const goToMenus = () => navigate("/menus");

  return (
    <div>
      <Hero onExplore={goToDashboard} />
      <Features onExplore={goToDashboard} />
      <QuickNavigation onBrowse={goToDashboard} onMenus={goToMenus} />
      <Stats />
    </div>
  );
}

export default Home;