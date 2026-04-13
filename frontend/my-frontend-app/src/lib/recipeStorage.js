const STORAGE_KEY = "rd_generated_recipes";

const safeParse = (value) => {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const getGeneratedRecipes = () => {
  if (typeof window === "undefined") {
    return [];
  }

  return safeParse(window.localStorage.getItem(STORAGE_KEY) || "[]");
};

export const addRecipeToStorage = (recipe) => {
  if (typeof window === "undefined" || !recipe) {
    return;
  }

  const existing = getGeneratedRecipes();
  const withoutDuplicate = existing.filter((item) => item.id !== recipe.id);
  const next = [recipe, ...withoutDuplicate].slice(0, 50);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
};

export const removeGeneratedRecipe = (recipeId) => {
  if (typeof window === "undefined") {
    return;
  }

  const next = getGeneratedRecipes().filter((item) => item.id !== recipeId);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
};
