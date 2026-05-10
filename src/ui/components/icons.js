export function renderCoinIcon(className = "") {
  const suffix = className ? ` ${className}` : "";
  return `<span class="coin-icon${suffix}" aria-hidden="true"></span>`;
}

const INGREDIENT_MARKS = {
  flour: "FL",
  sugar: "SU",
  eggs: "EG",
};

export function renderIngredientIcon(ingredient, className = "") {
  const suffix = className ? ` ${className}` : "";
  const label = INGREDIENT_MARKS[ingredient] ?? String(ingredient ?? "?").slice(0, 2).toUpperCase();
  return `<span class="ingredient-mark ingredient-mark-${ingredient}${suffix}" aria-hidden="true">${label}</span>`;
}
