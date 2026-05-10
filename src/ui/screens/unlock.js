import { renderCoinIcon } from "../components/icons.js?v=20260510-013300";
import { renderMascot } from "../components/mascot.js?v=20260510-013300";

export function renderUnlockScreen(gameState) {
  const unlocks = gameState.session.pendingRecipeUnlocks ?? [];
  const primaryRoute = gameState.session.recentSale ? "stats" : "recipe";
  const primaryLabel = gameState.session.recentSale ? "See Bakery Stats" : "See Bake Menu";

  return `
    <section class="panel flow-screen unlock-screen utility-screen">
      <div class="flow-header unlock-header">
        <p class="eyebrow eyebrow-pill">Recipe Book Update</p>
        <h2>${unlocks.length > 1 ? "New Recipes Unlocked!" : "New Recipe Unlocked!"}</h2>
        <p class="muted">Your bakery has grown enough to add fresh treats to the recipe book.</p>
      </div>

      ${renderMascot({
        mood: "celebrate",
        compact: true,
        message: unlocks.length > 1
          ? "Look at that menu grow. These new treats are ready for a future baking day."
          : `A fresh page just opened in your recipe book. ${unlocks[0]?.name ?? "This treat"} is ready when you are.`,
      })}

      <div class="recipe-grid unlock-grid">
        ${unlocks
          .map(
            (recipe) => `
              <article class="recipe-card unlock-card unlock-recipe-card">
                <div class="unlock-icon">${recipe.icon}</div>
                <p class="eyebrow">Fresh Addition</p>
                <h3>${escapeHtml(recipe.name)}</h3>
                <p class="muted tiny">Unlocked at SR ${recipe.unlockSR}</p>
                <div class="recipe-meta unlock-meta">
                  <span>${renderCoinIcon("coin-icon-sm")} ${recipe.baseReward} base coins</span>
                  <span>${recipe.sprinkleReward} sprinkle bonus</span>
                </div>
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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
