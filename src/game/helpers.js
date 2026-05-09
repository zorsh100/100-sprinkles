import { INGREDIENT_COSTS, RECIPES } from "./data.js";

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function shuffle(array) {
  const copy = [...array];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

export function formatGrade(grade) {
  return grade === "K" ? "Kindergarten" : `Grade ${grade}`;
}

export function srToBand(sr) {
  if (sr < 100) return "Kindergarten";
  if (sr < 200) return "1st Grade";
  if (sr < 300) return "2nd Grade";
  if (sr < 400) return "3rd Grade";
  if (sr < 500) return "4th Grade";
  if (sr < 600) return "5th Grade";
  if (sr < 700) return "6th Grade";
  if (sr < 800) return "7th Grade";
  if (sr < 900) return "8th Grade";
  return "Advanced";
}

export function allowedTypes(sr) {
  if (sr < 100) return ["arithmetic_visual"];

  const types = ["arithmetic", "cost"];

  if (sr >= 300) types.push("business", "fraction");
  if (sr >= 700) types.push("ratio");
  if (sr >= 800) types.push("algebraic");
  if (sr >= 900) types.push("optimization");

  return types;
}

export function getRecipeById(recipeId) {
  return RECIPES.find((recipe) => recipe.id === recipeId);
}

export function getUnlockedRecipes(player) {
  return RECIPES.filter(
    (recipe) => player.unlockedRecipes.includes(recipe.id) && player.SR >= recipe.unlockSR,
  );
}

export function getPantryNeed(recipe, batchCount) {
  const totals = {};

  Object.entries(recipe.ingredients).forEach(([ingredient, amount]) => {
    totals[ingredient] = amount * batchCount;
  });

  return totals;
}

export function canAffordIngredients(player, need) {
  return Object.entries(need).every(([ingredient, amount]) => player.pantry[ingredient] >= amount);
}

export function getOrderRevenue(recipe, batchCount, sr) {
  return recipe.baseReward * batchCount + Math.floor(sr / 80) + recipe.difficultyBonus;
}

export function getShopCost(ingredient, amount = 1) {
  return INGREDIENT_COSTS[ingredient] * amount;
}
