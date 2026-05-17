import { clamp } from "./math.js?v=20260517-163900";
import { INGREDIENT_COSTS, MAX_SPRINKLES, RECIPES } from "./data.js?v=20260517-163900";
import { getAllowedQuestionTypes } from "./sr.js?v=20260517-163900";

export { clamp } from "./math.js?v=20260517-163900";

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

export const SETS_UNLOCK_SR = 400;

export function supportsRecipeSets(sr) {
  return sr >= SETS_UNLOCK_SR;
}

export function getOrderCount(sr, count = 1) {
  return supportsRecipeSets(sr) ? clamp(Number(count) || 1, 1, 6) : 1;
}

export function formatOrderCount(sr, count) {
  if (!supportsRecipeSets(sr)) {
    return "";
  }

  const total = getOrderCount(sr, count);
  return `${total} set${total === 1 ? "" : "s"}`;
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
    (recipe) => player.knownRecipes.includes(recipe.id) && player.sprinkles >= recipe.unlockSprinkles,
  );
}

export function getNewlyUnlockedRecipes(previousSprinkles, nextSprinkles) {
  return RECIPES.filter(
    (recipe) =>
      previousSprinkles < recipe.unlockSprinkles &&
      nextSprinkles >= recipe.unlockSprinkles,
  );
}

export function getSprinkleCapForBake(recipe) {
  return clamp(recipe?.sprinkleReward ?? 0, 0, 5);
}

export function clampSprinkles(value) {
  return clamp(Number(value) || 0, 0, MAX_SPRINKLES);
}

export function getSprinklePercent(value) {
  return Math.round((clampSprinkles(value) / MAX_SPRINKLES) * 100);
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
  const baseTotal = recipe.baseReward * batchCount;
  const srBonus = Math.floor(sr / 80);
  const cappedBonus = Math.min(srBonus, Math.max(1, Math.round(baseTotal * 0.1)));
  return baseTotal + cappedBonus;
}

export function getBakeAccuracy(correctAnswers = 0, totalAttempts = 0) {
  if (!totalAttempts) {
    return 100;
  }

  return Math.round((correctAnswers / totalAttempts) * 100);
}

export function getAccuracyAdjustedRevenue(baseRevenue, correctAnswers = 0, totalAttempts = 0) {
  const accuracyPercent = getBakeAccuracy(correctAnswers, totalAttempts);
  return {
    accuracyPercent,
    adjustedRevenue: Math.max(1, Math.round(baseRevenue * (accuracyPercent / 100))),
  };
}

export function getShopCost(ingredient, amount = 1) {
  return Math.round((INGREDIENT_COSTS[ingredient] ?? 0) * amount);
}

export function getTotalShopCost(need) {
  return Object.entries(need).reduce((total, [ingredient, amount]) => total + getShopCost(ingredient, amount), 0);
}
