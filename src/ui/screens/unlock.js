export function renderUnlockScreen(gameState) {
  const unlocks = gameState.session.pendingRecipeUnlocks ?? [];
  const primaryRoute = gameState.session.recentSale ? "stats" : "recipe";
  const primaryLabel = gameState.session.recentSale ? "See Bakery Stats" : "See Bake Menu";

  return `
    <section class="panel flow-screen unlock-screen">
      <div class="flow-header unlock-header">
        <p class="eyebrow">New Recipe</p>
        <h2>${unlocks.length > 1 ? "New Recipes Unlocked!" : "New Recipe Unlocked!"}</h2>
        <p class="muted">Your bakery leveled up. A new treat is ready to bake.</p>
      </div>

      <div class="recipe-grid unlock-grid">
        ${unlocks
          .map(
            (recipe) => `
              <article class="recipe-card unlock-card">
                <div class="unlock-icon">${recipe.icon}</div>
                <h3>${escapeHtml(recipe.name)}</h3>
                <p class="muted tiny">Unlocked at SR ${recipe.unlockSR}</p>
                <div class="recipe-meta">
                  <span>${recipe.baseReward} base coins</span>
                  <span>${recipe.sprinkleReward} sprinkle reward</span>
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
