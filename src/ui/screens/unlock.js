import { renderCoinIcon, renderIngredientIcon } from "../components/icons.js?v=20260516-215300";
import { renderMascot } from "../components/mascot.js?v=20260516-215300";
import { renderPlayerAvatar } from "../components/player-avatar.js?v=20260516-215300";

export function renderUnlockScreen(gameState) {
  const unlocks = gameState.session.pendingRecipeUnlocks ?? [];
  const primaryRoute = gameState.session.recentSale ? "stats" : "recipe";
  const primaryLabel = gameState.session.recentSale ? "See Bakery Stats" : "See Bake Menu";

  if (!unlocks.length) {
    return `
      <section class="panel flow-screen unlock-screen utility-screen">
        <div class="flow-header unlock-header">
          <p class="eyebrow eyebrow-pill">Recipe Book Update</p>
          <h2>Recipe Shelf Caught Up</h2>
          <p class="muted">There is not a fresh recipe waiting right now, so you can head back to the bakery whenever you are ready.</p>
        </div>

        ${renderMascot({
          mood: "happy",
          compact: true,
          message: "No new recipe page popped open this time, but the bakery is still ready for another order.",
        })}

        <section class="utility-save-card utility-baker-card">
          <div class="utility-baker-row">
            ${renderPlayerAvatar(gameState.player.avatarId, { size: "md", className: "utility-baker-avatar", label: `${gameState.player.username}'s baker portrait` })}
            <div>
              <p class="eyebrow">Current Baker</p>
              <h3>${escapeHtml(gameState.player.username)}</h3>
              <p class="muted tiny">Keep collecting sprinkles with this notebook to unlock the next bakery treat.</p>
            </div>
          </div>
        </section>

        <div class="empty-state utility-empty-card unlock-empty-card">
          <h3>No new unlocks yet</h3>
          <p class="muted">Keep baking and collecting sprinkles to discover the next treat in the recipe book.</p>
        </div>

        <div class="flow-actions settings-actions">
          <button class="primary-button" type="button" data-dismiss-unlocks data-go-route="${primaryRoute}">
            ${primaryLabel}
          </button>
        </div>
      </section>
    `;
  }

  return `
    <section class="panel flow-screen unlock-screen utility-screen">
      <div class="flow-header unlock-header">
        <p class="eyebrow eyebrow-pill">Recipe Book Update</p>
        <h2>${unlocks.length > 1 ? "New Recipes Unlocked!" : "New Recipe Unlocked!"}</h2>
        <p class="muted">Your bakery has grown enough to add fresh treats to the recipe book, so the menu can sparkle a little more.</p>
      </div>

      ${renderMascot({
        mood: "celebrate",
        compact: true,
        message: unlocks.length > 1
          ? "Look at that menu grow. These new treats are ready for a future baking day."
          : `A fresh page just opened in your recipe book. ${unlocks[0]?.name ?? "This treat"} is ready when you are.`,
      })}

      <section class="utility-save-card utility-baker-card">
        <div class="utility-baker-row">
          ${renderPlayerAvatar(gameState.player.avatarId, { size: "md", className: "utility-baker-avatar", label: `${gameState.player.username}'s baker portrait` })}
          <div>
            <p class="eyebrow">Current Baker</p>
            <h3>${escapeHtml(gameState.player.username)}</h3>
            <p class="muted tiny">This notebook earned the new recipe page, and the baker portrait stays with it everywhere.</p>
          </div>
        </div>
      </section>

      <section class="utility-save-card unlock-summary-card">
        <div class="utility-save-head">
          <div>
            <p class="eyebrow">Bakery Milestone</p>
            <h3>${unlocks.length > 1 ? `${unlocks.length} treats joined the menu` : `${escapeHtml(unlocks[0].name)} joined the menu`}</h3>
            <p class="muted">These recipe pages stay in your bakery book, and the bake board will bring them forward as your bakery path reaches the right moment.</p>
          </div>
          <div class="badge">${unlocks.length > 1 ? "Fresh pages added" : "Recipe page added"}</div>
        </div>
      </section>

      <div class="recipe-grid unlock-grid">
        ${unlocks
          .map(
            (recipe) => `
              <article class="recipe-card unlock-card unlock-recipe-card">
                <div class="unlock-icon">${recipe.icon}</div>
                <p class="eyebrow">Fresh Addition</p>
                <h3>${escapeHtml(recipe.name)}</h3>
                <p class="muted tiny">Unlocked at ✨ ${recipe.unlockSprinkles} sprinkles</p>
                <div class="recipe-icon-row unlock-ingredient-row">
                  <span>${renderIngredientIcon("flour", "ingredient-mark-inline")} ${recipe.ingredients.flour}</span>
                  <span>${renderIngredientIcon("sugar", "ingredient-mark-inline")} ${recipe.ingredients.sugar}</span>
                  <span>${renderIngredientIcon("eggs", "ingredient-mark-inline")} ${recipe.ingredients.eggs}</span>
                </div>
                <div class="recipe-meta unlock-meta">
                  <span>${renderCoinIcon("coin-icon-sm")} ${recipe.baseReward} base coins</span>
                </div>
                <p class="muted tiny">${getRecipeUnlockNote(recipe)}</p>
              </article>
            `,
          )
          .join("")}
      </div>

      <div class="flow-actions settings-actions">
        <button class="primary-button" type="button" data-dismiss-unlocks data-go-route="${primaryRoute}">
          ${primaryLabel}
        </button>
        ${
          gameState.session.recentSale
            ? '<button class="secondary-button" type="button" data-dismiss-unlocks data-go-route="recipe">See New Recipe</button>'
            : ""
        }
      </div>
    </section>
  `;
}

function getRecipeUnlockNote(recipe) {
  if (recipe.id === "cookies") {
    return "A quicker tray with a cozy sugar cost. Great for early bakery variety.";
  }

  if (recipe.id === "donuts") {
    return "Donuts pay a little more and start asking for stronger mid-bakery math.";
  }

  if (recipe.id === "muffins") {
    return "Muffins need extra ingredients, but they bring a stronger reward to the counter.";
  }

  return "A fresh bakery favorite for the recipe book.";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
