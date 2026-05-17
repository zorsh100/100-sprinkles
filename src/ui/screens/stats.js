import { formatOrderCount } from "../../game/helpers.js?v=20260517-141300";
import { renderCoinIcon } from "../components/icons.js?v=20260517-141300";
import { getSRMode } from "../../game/sr.js?v=20260517-141300";
import { renderCelebrationBurst, renderMascot } from "../components/mascot.js?v=20260517-141300";
import { renderPlayerAvatar } from "../components/player-avatar.js?v=20260517-141300";

export function renderStatsScreen(gameState) {
  const { player, session } = gameState;
  const sale = session.recentSale;
  const saleHistory = Array.isArray(session.recentSales) && session.recentSales.length
    ? session.recentSales.slice(0, 5)
    : sale
      ? [sale]
      : [];

  return `
    <section class="panel flow-screen">
      <div class="flow-header">
        <p class="eyebrow">Stats</p>
        <h2>Bakery Report</h2>
        <p class="muted">You finished a bake. Here’s how your bakery is growing.</p>
      </div>

      <div class="report-baker-card">
        ${renderPlayerAvatar(player.avatarId, { size: "lg", className: "report-baker-avatar", label: `${player.username}'s baker portrait` })}
        <div>
          <span class="muted tiny">Baker</span>
          <strong>${escapeHtml(player.username)}</strong>
        </div>
      </div>

      ${
        sale
          ? `
            <div class="receipt-card sale-report celebration-panel">
              ${renderCelebrationBurst({ icon: sale.recipeIcon, label: `${sale.recipeName} sold!` })}
              <strong>${sale.recipeIcon} ${sale.recipeName}</strong>
              <span>${formatOrderCount(player.SR, sale.batchCount) ? `${formatOrderCount(player.SR, sale.batchCount)} sold` : "Sold and served"}</span>
              <span>${sale.questionsPerBake ?? sale.correctAnswers ?? 10} bakery questions finished</span>
              <span>${renderCoinIcon("coin-icon-sm")} ${sale.revenue} of ${sale.baseRevenue ?? sale.revenue} coins earned</span>
              <span>Bake accuracy ${sale.accuracyPercent ?? 100}%</span>
              <span>${sale.sprinklesEarned} sprinkles earned</span>
            </div>
            ${renderMascot({ mood: "celebrate", compact: true, message: `Amazing job! Your ${sale.recipeName.toLowerCase()} bake landed ${sale.accuracyPercent ?? 100}% accuracy and earned ${sale.revenue} coins.` })}
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
          <strong>${player.sprinkles}/100</strong>
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

      ${saleHistory.length
        ? `
          <section class="sale-history-panel">
            <div class="section-head compact-head">
              <div>
                <p class="eyebrow">Recent Bakes</p>
                <h3>Last 5 bakery reports</h3>
              </div>
              <div class="badge">${saleHistory.length} shown</div>
            </div>
            <div class="sale-history-list">
              ${saleHistory.map((entry, index) => renderSaleHistoryItem(entry, player.SR, index)).join("")}
            </div>
          </section>
        `
        : ""
      }

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

function renderSaleHistoryItem(sale, currentSR, index) {
  return `
    <article class="sale-history-card ${index === 0 ? "sale-history-card-featured" : ""}">
      <div class="sale-history-main">
        <div>
          <p class="eyebrow">${index === 0 ? "Most Recent" : `Bake ${index + 1}`}</p>
          <h4>${sale.recipeIcon} ${sale.recipeName}</h4>
        </div>
        <div class="badge">${escapeHtml(formatSaleTime(sale.soldAt ?? sale.bakedAt))}</div>
      </div>
      <div class="sale-history-metrics">
        <span>${formatOrderCount(currentSR, sale.batchCount) || "Fresh batch"}</span>
        <span>${renderCoinIcon("coin-icon-sm")} ${sale.revenue} of ${sale.baseRevenue ?? sale.revenue} coins</span>
        <span>Accuracy ${sale.accuracyPercent ?? 100}%</span>
        <span>${sale.sprinklesEarned} sprinkles</span>
      </div>
    </article>
  `;
}

function formatSaleTime(timestamp) {
  if (!timestamp) {
    return "Just now";
  }

  return new Date(timestamp).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
