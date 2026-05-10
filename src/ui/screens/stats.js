import { formatOrderCount } from "../../game/helpers.js?v=20260510-013300";
import { renderCoinIcon } from "../components/icons.js?v=20260510-013300";
import { getSRMode } from "../../game/sr.js?v=20260510-013300";
import { renderCelebrationBurst, renderMascot } from "../components/mascot.js?v=20260510-013300";

export function renderStatsScreen(gameState) {
  const { player, session } = gameState;
  const sale = session.recentSale;

  return `
    <section class="panel flow-screen">
      <div class="flow-header">
        <p class="eyebrow">Stats</p>
        <h2>Bakery Report</h2>
        <p class="muted">You finished a bake. Here’s how your bakery is growing.</p>
      </div>

      ${
        sale
          ? `
            <div class="receipt-card sale-report celebration-panel">
              ${renderCelebrationBurst({ icon: sale.recipeIcon, label: `${sale.recipeName} sold!` })}
              <strong>${sale.recipeIcon} ${sale.recipeName}</strong>
              <span>${formatOrderCount(player.SR, sale.batchCount) ? `${formatOrderCount(player.SR, sale.batchCount)} sold` : "Sold and served"}</span>
              <span>${renderCoinIcon("coin-icon-sm")} ${sale.revenue} coins earned</span>
              <span>${sale.sprinklesEarned} sprinkles earned</span>
            </div>
            ${renderMascot({ mood: "celebrate", compact: true, message: `Amazing job! Your ${sale.recipeName.toLowerCase()} brought in ${sale.revenue} coins.` })}
          `
          : ""
      }

      <div class="stats-grid flow-stats-grid">
        <div class="stat-card">
          <span class="muted tiny">Coins</span>
          <strong>${player.bank}</strong>
        </div>
        <div class="stat-card">
          <span class="muted tiny">Sprinkles</span>
          <strong>${player.sprinkles}</strong>
        </div>
        <div class="stat-card">
          <span class="muted tiny">Skill Rating</span>
          <strong>${player.SR}</strong>
        </div>
        <div class="stat-card">
          <span class="muted tiny">Mode</span>
          <strong>${getSRMode(player.SR)}</strong>
        </div>
      </div>

      <div class="pill-row">
        <span class="pill">Accuracy ${player.skill.totalAnswered ? Math.round((player.skill.correctAnswered / player.skill.totalAnswered) * 100) : 0}%</span>
        <span class="pill">Best streak ${player.skill.bestStreak}</span>
        <span class="pill">Last SR ${player.skill.lastDelta >= 0 ? "+" : ""}${player.skill.lastDelta}</span>
      </div>

      <div class="flow-actions settings-actions">
        <button class="primary-button" type="button" data-go-recipe>Bake More</button>
        <button class="secondary-button" type="button" data-go-settings>Settings</button>
      </div>
    </section>
  `;
}
