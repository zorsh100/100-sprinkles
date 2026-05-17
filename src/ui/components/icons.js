export function renderCoinIcon(className = "") {
  const suffix = className ? ` ${className}` : "";
  return `<span class="coin-icon${suffix}" aria-hidden="true"></span>`;
}

const INGREDIENT_SHEET_VERSION = "20260517-140300";
const INGREDIENT_SHEET_SRC = `./assets/ingredients/flour-sugar-eggs-sheet.png?v=${INGREDIENT_SHEET_VERSION}`;

const INGREDIENT_SPRITE_POSITIONS = {
  flour: "0%",
  sugar: "50%",
  eggs: "100%",
};

export function renderIngredientIcon(ingredient, className = "") {
  const suffix = className ? ` ${className}` : "";
  const position = INGREDIENT_SPRITE_POSITIONS[ingredient] ?? "0%";
  return `<span class="ingredient-mark ingredient-mark-${ingredient}${suffix}" aria-hidden="true" style="--ingredient-sheet:url('${INGREDIENT_SHEET_SRC}');--ingredient-x:${position};"></span>`;
}
