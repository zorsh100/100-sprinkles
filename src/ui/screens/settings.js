import { getSRMode } from "../../game/sr.js?v=20260510-040200";
import { renderCoinIcon } from "../components/icons.js?v=20260510-040200";
import { renderMascot } from "../components/mascot.js?v=20260510-040200";

export function renderSettingsScreen(saveSummaries, activeSaveSummary, player) {
  const hasActiveSave = Boolean(activeSaveSummary && player);
  const filledSlots = saveSummaries.filter((summary) => !summary.empty).length;
  const activeGradeLabel = hasActiveSave ? formatGrade(activeSaveSummary.grade) : "Open a notebook";
  const activeModeLabel = hasActiveSave ? getSRMode(activeSaveSummary.SR) : "Bakery notebook setup";
  const activeCoinsLabel = hasActiveSave ? `${renderCoinIcon("coin-icon-sm")} ${activeSaveSummary.coins}` : "No coins yet";

  return `
    <section class="panel flow-screen settings-screen utility-screen">
      <div class="flow-header utility-header">
        <p class="eyebrow eyebrow-pill">Bakery Office</p>
        <h2>Notebook & Front Desk</h2>
        <p class="muted">Keep two bakers on this device, swap notebooks between shifts, and tidy one save slot without touching the other bakery.</p>
      </div>

      ${renderMascot({
        mood: "happy",
        compact: true,
        message: hasActiveSave
          ? `${activeSaveSummary.username}, your bakery notebook is tucked safely behind the counter. Everything here is ready for a smooth shift change.`
          : "Pick a notebook to set up a new baker. Each save slot keeps its own bakery story on this browser.",
      })}

      <section class="utility-save-card settings-hero-card">
        <div class="utility-save-head">
          <div>
            <p class="eyebrow">Front Desk Snapshot</p>
            <h3>${hasActiveSave ? `${escapeHtml(activeSaveSummary.username)}'s Bakery Desk` : "Choose A Notebook To Begin"}</h3>
            <p class="muted">${hasActiveSave ? "These quick notes make it easy to jump back into the right bakery lane." : "One notebook is enough to start, and the second can stay ready for a sibling or a second bakery adventure."}</p>
          </div>
          <div class="badge">${filledSlots} of 2 notebooks in use</div>
        </div>
        <div class="utility-summary-grid settings-summary-grid">
          <article class="mini-card utility-mini-card settings-mini-card settings-mini-card-chef">
            <span class="muted tiny">Active baker</span>
            <strong>${hasActiveSave ? escapeHtml(activeSaveSummary.username) : "No baker yet"}</strong>
            <p class="muted tiny">${hasActiveSave ? `${activeSaveSummary.slotLabel} is open behind the counter.` : "Open a notebook to pick a chef name and grade."}</p>
          </article>
          <article class="mini-card utility-mini-card settings-mini-card-grade">
            <span class="muted tiny">Learning lane</span>
            <strong>${escapeHtml(activeGradeLabel)}</strong>
            <p class="muted tiny">${hasActiveSave ? `Current SR ${activeSaveSummary.SR}.` : "Kindergarten begins at SR 50 with picture-first counting."}</p>
          </article>
          <article class="mini-card utility-mini-card settings-mini-card-mode">
            <span class="muted tiny">Bakery mode</span>
            <strong>${escapeHtml(activeModeLabel)}</strong>
            <p class="muted tiny">${hasActiveSave ? "Route gating still happens in the bakery flow, not here at the office." : "Notebook setup unlocks the rest of the bakery world."}</p>
          </article>
          <article class="mini-card utility-mini-card settings-mini-card-coins">
            <span class="muted tiny">Till check</span>
            <strong>${activeCoinsLabel}</strong>
            <p class="muted tiny">${hasActiveSave ? "Coins stay with this notebook only." : "Coins and pantry shelves appear after a baker is created."}</p>
          </article>
        </div>
      </section>

      <section class="utility-save-slots">
        ${saveSummaries.map((summary) => renderSaveSlotCard(summary)).join("")}
      </section>

      <section class="utility-links-grid">
        <article class="utility-link-card settings-link-card settings-link-card-recipe">
          <div class="settings-link-art" aria-hidden="true">🧁</div>
          <p class="eyebrow">Back To Work</p>
          <h3>Bake Menu</h3>
          <p class="muted">Head back to the recipe board and choose which sweet order goes in the oven next.</p>
          <button class="secondary-button" type="button" data-go-route="recipe" ${hasActiveSave ? "" : "disabled"}>Open Bake Counter</button>
        </article>
        <article class="utility-link-card settings-link-card settings-link-card-shop">
          <div class="settings-link-art" aria-hidden="true">🥚</div>
          <p class="eyebrow">Pantry Corner</p>
          <h3>Ingredient Shop</h3>
          <p class="muted">Visit the shelves, restock flour and sugar, and see what each ingredient helps you bake.</p>
          <button class="secondary-button" type="button" data-go-route="shop" ${hasActiveSave ? "" : "disabled"}>Visit Pantry Shelves</button>
        </article>
        <article class="utility-link-card settings-link-card settings-link-card-learn">
          <div class="settings-link-art" aria-hidden="true">📚</div>
          <p class="eyebrow">Coach Room</p>
          <h3>Math Lab</h3>
          <p class="muted">Check the active question families, challenge zone, and what bakery math unlocks next.</p>
          <button class="secondary-button" type="button" data-go-route="learn" ${hasActiveSave ? "" : "disabled"}>Open Coach Board</button>
        </article>
      </section>

      <section class="utility-warning-card settings-reset-card">
        <div class="utility-save-head">
          <div>
            <p class="eyebrow">Fresh Start</p>
            <h3>Clear one notebook at a time</h3>
            <p class="muted">Each save slot has its own clear button, so one baker can restart without wiping the other bakery.</p>
          </div>
          <div class="badge">Safe for two-player saves</div>
        </div>
        <div class="settings-reset-grid">
          <article class="mini-card utility-mini-card">
            <span class="muted tiny">What clears</span>
            <strong>Just one notebook</strong>
            <p class="muted tiny">That slot's player, session, flash notes, and saved time are reset.</p>
          </article>
          <article class="mini-card utility-mini-card">
            <span class="muted tiny">What stays safe</span>
            <strong>The other slot</strong>
            <p class="muted tiny">The second bakery stays untouched, including its coins and recent bakery reports.</p>
          </article>
        </div>
      </section>

      <div class="flow-actions settings-actions">
        <button class="secondary-button" type="button" data-go-route="title">
          Back To Title
        </button>
      </div>
    </section>
  `;
}

function renderSaveSlotCard(summary) {
  if (summary.empty) {
    return `
      <article class="utility-save-card settings-save-card save-slot-card save-slot-card-empty">
        <div class="save-slot-head">
          <div>
            <p class="eyebrow">${summary.slotLabel}</p>
            <h3>Fresh Notebook</h3>
          </div>
          <div class="save-slot-chip">Ready for a new chef</div>
        </div>
        <p class="muted">Open this notebook to pick a chef name, choose a grade, and start another bakery story on this device.</p>
        <div class="utility-summary-grid">
          <article class="mini-card utility-mini-card">
            <span class="muted tiny">Starts with</span>
            <strong>Grade choice</strong>
            <p class="muted tiny">Kindergarten still begins at SR 50 with picture-first counting.</p>
          </article>
          <article class="mini-card utility-mini-card">
            <span class="muted tiny">Best for</span>
            <strong>Second baker</strong>
            <p class="muted tiny">Perfect for siblings, classmates, or a fresh bakery run.</p>
          </article>
        </div>
        <div class="slot-action-row">
          <button class="primary-button" type="button" data-new-player-slot="${summary.slotId}">Open ${summary.slotLabel}</button>
        </div>
      </article>
    `;
  }

  const savedAtLabel = new Date(summary.savedAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });

  return `
    <article class="utility-save-card settings-save-card save-slot-card ${summary.isActive ? "active" : ""}">
      <div class="save-slot-head">
        <div>
          <p class="eyebrow">${summary.slotLabel}</p>
          <h3>${escapeHtml(summary.username)}</h3>
        </div>
        <div class="save-slot-chip ${summary.isActive ? "save-slot-chip-active" : ""}">${summary.isActive ? "Active notebook" : `${renderCoinIcon("coin-icon-sm")} ${summary.coins} in the till`}</div>
      </div>
      <div class="utility-summary-grid">
        <article class="mini-card utility-mini-card">
          <span class="muted tiny">Grade</span>
          <strong>${escapeHtml(formatGrade(summary.grade))}</strong>
          <p class="muted tiny">Bakery lane for this notebook.</p>
        </article>
        <article class="mini-card utility-mini-card">
          <span class="muted tiny">Current SR</span>
          <strong>${summary.SR}</strong>
          <p class="muted tiny">Mode: ${escapeHtml(getSRMode(summary.SR))}</p>
        </article>
        <article class="mini-card utility-mini-card">
          <span class="muted tiny">Coins</span>
          <strong>${renderCoinIcon("coin-icon-sm")} ${summary.coins}</strong>
          <p class="muted tiny">Ready for shelves, bakes, and bakery growth.</p>
        </article>
        <article class="mini-card utility-mini-card">
          <span class="muted tiny">Last Saved</span>
          <strong>${escapeHtml(savedAtLabel)}</strong>
          <p class="muted tiny">Stored right in this browser only.</p>
        </article>
      </div>
      <div class="slot-action-row">
        <button class="secondary-button" type="button" data-open-save-slot="${summary.slotId}" data-go-route="recipe" ${summary.isActive ? "disabled" : ""}>
          ${summary.isActive ? "Already Open" : `Switch To ${escapeHtml(summary.username)}`}
        </button>
        <button class="ghost-button danger-button" type="button" data-reset-save="${summary.slotId}">
          Clear ${summary.slotLabel}
        </button>
      </div>
    </article>
  `;
}

function formatGrade(grade) {
  return grade === "K" ? "Kindergarten" : `Grade ${grade}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
