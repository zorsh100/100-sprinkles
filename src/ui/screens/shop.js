import { INGREDIENT_COSTS } from "../../game/data.js?v=20260510-013300";
import { renderCoinIcon, renderIngredientIcon } from "../components/icons.js?v=20260510-013300";
import { renderMascot } from "../components/mascot.js?v=20260510-013300";

const INGREDIENT_META = {
  flour: {
    label: "Flour",
    note: "For batter, dough, and anything that needs a bakery base.",
    accentClass: "ingredient-flour",
  },
  sugar: {
    label: "Sugar",
    note: "Sweetens batters and powers your finishing sparkle.",
    accentClass: "ingredient-sugar",
  },
  eggs: {
    label: "Eggs",
    note: "Helps cakes and cookies hold together through the oven.",
    accentClass: "ingredient-eggs",
  },
};

export function renderShopScreen(player) {
  return `
    <section class="panel flow-screen utility-screen shop-screen">
      <div class="flow-header utility-header">
        <p class="eyebrow eyebrow-pill">Pantry Corner</p>
        <h2>Ingredient Shop</h2>
        <p class="muted">Stock the shelves before a big baking rush. Pantry mode matters most at SR 300 and above, but you can practice the flow anytime.</p>
      </div>

      ${renderMascot({
        mood: "happy",
        compact: true,
        message: `You have ${player.bank} coins ready. Let's fill the pantry with just enough for the next bake.`,
      })}

      <div class="pill-row utility-pill-row">
        <span class="pill pantry-pill">${renderCoinIcon("coin-icon-sm")} ${player.bank} coins ready</span>
        <span class="pill pantry-pill">${renderIngredientIcon("flour", "ingredient-mark-inline")} ${player.pantry.flour} flour</span>
        <span class="pill pantry-pill">${renderIngredientIcon("sugar", "ingredient-mark-inline")} ${player.pantry.sugar} sugar</span>
        <span class="pill pantry-pill">${renderIngredientIcon("eggs", "ingredient-mark-inline")} ${player.pantry.eggs} eggs</span>
      </div>

      <div class="shop-grid pantry-shop-grid">
        ${Object.entries(INGREDIENT_COSTS)
          .map(([ingredient, cost]) => {
            const meta = INGREDIENT_META[ingredient];
            return `
              <article class="shop-card pantry-shelf-card ${meta.accentClass}">
                <div class="pantry-shelf-head">
                  <div class="ingredient-shop-icon ingredient-shop-stamp">${renderIngredientIcon(ingredient)}</div>
                  <div>
                    <h3>${meta.label}</h3>
                    <p class="muted tiny">${meta.note}</p>
                  </div>
                </div>
                <div class="ingredient-list pantry-shelf-stats">
                  <span>Cost ${renderCoinIcon("coin-icon-sm")} ${cost}</span>
                  <span>Owned ${player.pantry[ingredient]}</span>
                </div>
                <button class="shop-button ingredient-buy-button" type="button" data-buy="${ingredient}">Buy 1 ${meta.label}</button>
              </article>
            `;
          })
          .join("")}
      </div>

      <div class="flow-actions settings-actions">
        <button class="secondary-button" type="button" data-go-route="recipe">Back to Bake Menu</button>
        <button class="ghost-button" type="button" data-go-route="settings">Back to Settings</button>
      </div>
    </section>
  `;
}
