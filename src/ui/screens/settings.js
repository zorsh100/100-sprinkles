import { getSRMode } from "../../game/sr.js?v=20260510-024900";
import { renderCoinIcon } from "../components/icons.js?v=20260510-024900";
import { renderMascot } from "../components/mascot.js?v=20260510-024900";

export function renderSettingsScreen(saveSummaries, activeSaveSummary, player) {
  const hasActiveSave = Boolean(activeSaveSummary && player);

  return `
    <section class="panel flow-screen settings-screen utility-screen">
      <div class="flow-header utility-header">
        <p class="eyebrow eyebrow-pill">Bakery Notebook</p>
        <h2>Game Settings</h2>
        <p class="muted">Keep up to two bakers on this device, switch notebooks, or clear one slot without disturbing the other.</p>
      </div>

      ${renderMascot({
        mood: "happy",
        compact: true,
        message: hasActiveSave
          ? `${activeSaveSummary.username}, your bakery notes are safe. You can also swap to the other player's notebook from here.`
          : "Pick a notebook to keep two different bakers saved on this browser.",
      })}

      <section class="utility-save-slots">
        ${saveSummaries.map((summary) => renderSaveSlotCard(summary)).join("")}
      </section>

      <section class="utility-links-grid">
        <article class="utility-link-card">
          <p class="eyebrow">Back To Work</p>
          <h3>Bake Menu</h3>
          <p class="muted">Return to your recipes and pick the next treat to bake.</p>
          <button class="secondary-button" type="button" data-go-route="recipe" ${hasActiveSave ? "" : "disabled"}>Open Bake Menu</button>
        </article>
        <article class="utility-link-card">
          <p class="eyebrow">Pantry Corner</p>
          <h3>Ingredient Shop</h3>
          <p class="muted">Practice the restock flow and see what each ingredient powers in the bakery.</p>
          <button class="secondary-button" type="button" data-go-route="shop" ${hasActiveSave ? "" : "disabled"}>Visit Pantry Corner</button>
        </article>
        <article class="utility-link-card">
          <p class="eyebrow">Coach Room</p>
          <h3>Math Lab</h3>
          <p class="muted">See which question families are active and what challenge zone comes next.</p>
          <button class="secondary-button" type="button" data-go-route="learn" ${hasActiveSave ? "" : "disabled"}>Open Math Lab</button>
        </article>
      </section>

      <section class="utility-warning-card">
        <p class="eyebrow">Fresh Start</p>
        <h3>Clear one notebook at a time</h3>
        <p class="muted">Each save slot has its own clear button, so one player can restart without wiping the other bakery.</p>
      </section>

      <div class="flow-actions settings-actions">
        <button class="secondary-button" type="button" data-go-route="title">
          Back to Title
        </button>
      </div>
    </section>
  `;
}

function renderSaveSlotCard(summary) {
  if (summary.empty) {
    return `
      <article class="utility-save-card settings-save-card save-slot-card save-slot-card-empty">
        <div class="utility-save-head">
          <div>
            <p class="eyebrow">${summary.slotLabel}</p>
            <h3>Empty Notebook</h3>
          </div>
          <div class="badge">Ready for a new chef</div>
        </div>
        <p class="muted">Open this notebook to set a chef name, pick a grade, and save a second bakery on this device.</p>
        <div class="slot-action-row">
          <button class="primary-button" type="button" data-new-player-slot="${summary.slotId}">Create ${summary.slotLabel}</button>
        </div>
      </article>
    `;
  }

  const savedAtLabel = new Date(summary.savedAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });

  return `
    <article class="utility-save-card settings-save-card save-slot-card ${summary.isActive ? "active" : ""}">
      <div class="utility-save-head">
        <div>
          <p class="eyebrow">${summary.slotLabel}</p>
          <h3>${escapeHtml(summary.username)}</h3>
        </div>
        <div class="badge">${renderCoinIcon("coin-icon-sm")} ${summary.coins} coins in the till</div>
      </div>
      <div class="utility-summary-grid">
        <article class="mini-card utility-mini-card">
          <span class="muted tiny">Grade</span>
          <strong>${escapeHtml(summary.grade === "K" ? "Kindergarten" : `Grade ${summary.grade}`)}</strong>
          <p class="muted tiny">Starting lane for the bakery math journey.</p>
        </article>
        <article class="mini-card utility-mini-card">
          <span class="muted tiny">Current SR</span>
          <strong>${summary.SR}</strong>
          <p class="muted tiny">Mode: ${escapeHtml(getSRMode(summary.SR))}</p>
        </article>
        <article class="mini-card utility-mini-card">
          <span class="muted tiny">Last Saved</span>
          <strong>${escapeHtml(savedAtLabel)}</strong>
          <p class="muted tiny">Stored right in this browser.</p>
        </article>
      </div>
      <div class="slot-action-row">
        <button class="secondary-button" type="button" data-open-save-slot="${summary.slotId}" data-go-route="recipe" ${summary.isActive ? "disabled" : ""}>
          ${summary.isActive ? "Active Bakery" : `Switch To ${escapeHtml(summary.username)}`}
        </button>
        <button class="ghost-button danger-button" type="button" data-reset-save="${summary.slotId}">
          Clear ${summary.slotLabel}
        </button>
      </div>
    </article>
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
