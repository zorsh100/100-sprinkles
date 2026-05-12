import { INGREDIENT_COSTS, RECIPES } from "../../game/data.js?v=20260512-093500";
import { renderCoinIcon, renderIngredientIcon } from "../components/icons.js?v=20260512-093500";
import { renderMascot } from "../components/mascot.js?v=20260512-093500";
import { renderPlayerAvatar } from "../components/player-avatar.js?v=20260512-093500";

const INGREDIENT_META = {
  flour: {
    label: "Flour",
    note: "For batter, dough, and anything that needs a bakery base.",
    accentClass: "ingredient-flour",
    shelfLabel: "Main baking base",
  },
  sugar: {
    label: "Sugar",
    note: "Sweetens batters and powers your finishing sparkle.",
    accentClass: "ingredient-sugar",
    shelfLabel: "Sweet finishing helper",
  },
  eggs: {
    label: "Eggs",
    note: "Helps cakes and cookies hold together through the oven.",
    accentClass: "ingredient-eggs",
    shelfLabel: "Structure booster",
  },
};

const PANTRY_SCENE_VERSION = "20260512-093500";
const PANTRY_SCENE_SRC = `./assets/bakery-scenes/pantry-cupboard.png?v=${PANTRY_SCENE_VERSION}`;

export function renderShopScreen(player) {
  const pantryTotal = Object.values(player.pantry).reduce((sum, amount) => sum + Number(amount || 0), 0);
  const hasLowCoins = player.bank < Math.min(...Object.values(INGREDIENT_COSTS));

  return `
    <section class="panel flow-screen utility-screen shop-screen">
      <div class="flow-header utility-header">
        <p class="eyebrow eyebrow-pill">Pantry Corner</p>
        <h2>Ingredient Shop</h2>
        <p class="muted">Stock the shelves before the bakery rush. Pantry math matters most at SR 300 and above, but this room stays open whenever you want to practice restocking.</p>
      </div>

      ${renderMascot({
        mood: "happy",
        compact: true,
        message: hasLowCoins
          ? `You only have ${player.bank} coins right now, so even a tiny restock matters. Sell another bake soon and we can fill more shelves.`
          : `You have ${player.bank} coins ready. Let's fill the pantry with just enough for the next bake.`,
      })}

      <section class="utility-save-card utility-baker-card">
        <div class="utility-baker-row">
          ${renderPlayerAvatar(player.avatarId, { size: "md", className: "utility-baker-avatar", label: `${player.username}'s baker portrait` })}
          <div>
            <p class="eyebrow">Current Baker</p>
            <h3>${escapeHtml(player.username)}</h3>
            <p class="muted tiny">Your chosen baker portrait stays with this notebook while you restock the pantry.</p>
          </div>
        </div>
      </section>

      <section class="utility-save-card shop-overview-card">
        <div class="utility-save-head">
          <div>
            <p class="eyebrow">Shelf Snapshot</p>
            <h3>What is in the pantry right now?</h3>
            <p class="muted">Use the quick-buy trays below to top off just the ingredients you need.</p>
          </div>
          <div class="badge">${renderCoinIcon("coin-icon-sm")} ${player.bank} coins ready</div>
        </div>

        ${
          hasLowCoins
            ? `<div class="restock-alert-banner shop-alert-banner" role="alert">${renderCoinIcon()} Coins are low. Sell a bake or buy one small item at a time.</div>`
            : ""
        }

        <div class="shop-scene-layout">
          <figure class="shop-scene-figure">
            <img class="shop-scene-image" src="${PANTRY_SCENE_SRC}" alt="Bakery pantry shelves filled with labeled jars and baking supplies" loading="lazy" decoding="async" />
            <figcaption class="shop-scene-caption">The pantry grows with every careful restock.</figcaption>
          </figure>

          <div class="utility-summary-grid shop-summary-grid">
            <article class="mini-card utility-mini-card shop-summary-card">
              <span class="muted tiny">Pantry pieces</span>
              <strong>${pantryTotal}</strong>
              <p class="muted tiny">Total ingredients on your shelves across flour, sugar, and eggs.</p>
            </article>
            <article class="mini-card utility-mini-card shop-summary-card">
              <span class="muted tiny">Flour shelf</span>
              <strong>${renderIngredientIcon("flour", "ingredient-mark-inline")} ${player.pantry.flour}</strong>
              <p class="muted tiny">${getShelfStatus(player.pantry.flour)}</p>
            </article>
            <article class="mini-card utility-mini-card shop-summary-card">
              <span class="muted tiny">Sugar shelf</span>
              <strong>${renderIngredientIcon("sugar", "ingredient-mark-inline")} ${player.pantry.sugar}</strong>
              <p class="muted tiny">${getShelfStatus(player.pantry.sugar)}</p>
            </article>
            <article class="mini-card utility-mini-card shop-summary-card">
              <span class="muted tiny">Egg basket</span>
              <strong>${renderIngredientIcon("eggs", "ingredient-mark-inline")} ${player.pantry.eggs}</strong>
              <p class="muted tiny">${getShelfStatus(player.pantry.eggs)}</p>
            </article>
          </div>
        </div>
      </section>

      <div class="shop-grid pantry-shop-grid">
        ${Object.entries(INGREDIENT_COSTS)
          .map(([ingredient, cost]) => {
            const meta = INGREDIENT_META[ingredient];
            const recipeTags = getRecipesForIngredient(ingredient);
            return `
              <article class="shop-card pantry-shelf-card ${meta.accentClass}">
                <div class="pantry-shelf-head">
                  <div class="ingredient-shop-icon ingredient-shop-stamp">${renderIngredientIcon(ingredient)}</div>
                  <div>
                    <h3>${meta.label}</h3>
                    <p class="eyebrow pantry-shelf-eyebrow">${meta.shelfLabel}</p>
                    <p class="muted tiny">${meta.note}</p>
                  </div>
                </div>
                <div class="ingredient-list pantry-shelf-stats">
                  <span>Cost ${renderCoinIcon("coin-icon-sm")} ${cost} each</span>
                  <span>Owned ${player.pantry[ingredient]}</span>
                  <span>Shelf mood: ${getShelfStatus(player.pantry[ingredient])}</span>
                </div>
                <div class="shop-tag-row">
                  ${recipeTags.map((tag) => `<span class="shop-tag">${escapeHtml(tag)}</span>`).join("")}
                </div>
                <div class="shop-buy-grid" aria-label="Buy ${meta.label}">
                  ${renderBuyButton({ ingredient, label: meta.label, amount: 1, cost: cost * 1, playerCoins: player.bank })}
                  ${renderBuyButton({ ingredient, label: meta.label, amount: 3, cost: cost * 3, playerCoins: player.bank })}
                  ${renderBuyButton({ ingredient, label: meta.label, amount: 5, cost: cost * 5, playerCoins: player.bank })}
                </div>
              </article>
            `;
          })
          .join("")}
      </div>

      <div class="flow-actions settings-actions">
        <button class="secondary-button" type="button" data-go-route="recipe">Back To Bake Menu</button>
        <button class="ghost-button" type="button" data-go-route="settings">Back To Settings</button>
      </div>
    </section>
  `;
}

function renderBuyButton({ ingredient, label, amount, cost, playerCoins }) {
  const affordable = playerCoins >= cost;

  return `
    <button
      class="shop-button ingredient-buy-button shop-buy-option ${affordable ? "" : "shop-buy-option-locked"}"
      type="button"
      data-buy="${ingredient}"
      data-buy-amount="${amount}"
      ${affordable ? "" : "disabled"}
    >
      <span>Buy ${amount}</span>
      <span>${renderCoinIcon("coin-icon-sm")} ${cost}</span>
      <span class="tiny">${affordable ? `${label} restock` : "Need more coins"}</span>
    </button>
  `;
}

function getRecipesForIngredient(ingredient) {
  return RECIPES.filter((recipe) => Number(recipe.ingredients?.[ingredient] || 0) > 0).map((recipe) => recipe.name);
}

function getShelfStatus(amount) {
  if (amount <= 0) {
    return "Running low";
  }

  if (amount <= 2) {
    return "Just enough for a cozy bake";
  }

  if (amount <= 5) {
    return "Nicely stocked";
  }

  return "Plenty for a bakery rush";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
