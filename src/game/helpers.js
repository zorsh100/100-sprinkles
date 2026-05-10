import { INGREDIENT_COSTS, RECIPES } from "./data.js";
import { getAllowedQuestionTypes } from "./sr.js";

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
  if (sr < 80) return "Kindergarten";
  if (sr < 110) return "Kindergarten Bridge";
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
  return getAllowedQuestionTypes(sr);
}

export function weightedPick(items, getWeight) {
  const totalWeight = items.reduce((sum, item) => sum + Math.max(0, getWeight(item)), 0);

  if (totalWeight <= 0) {
    return items[0];
  }

  let roll = Math.random() * totalWeight;

  for (const item of items) {
    roll -= Math.max(0, getWeight(item));

    if (roll <= 0) {
      return item;
    }
  }

  return items[items.length - 1];
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

export function getMissingPantry(player, need) {
  return Object.fromEntries(
    Object.entries(need)
      .map(([ingredient, amount]) => [ingredient, Math.max(0, amount - player.pantry[ingredient])])
      .filter(([, missing]) => missing > 0),
  );
}

export function getOrderRevenue(recipe, batchCount, sr) {
  return recipe.baseReward * batchCount + Math.floor(sr / 80) + recipe.difficultyBonus;
}

export function getShopCost(ingredient, amount = 1) {
  return INGREDIENT_COSTS[ingredient] * amount;
}

export function getTotalShopCost(need) {
  return Object.entries(need).reduce((total, [ingredient, amount]) => total + getShopCost(ingredient, amount), 0);
}
