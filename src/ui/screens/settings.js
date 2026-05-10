import { getSRMode } from "../../game/sr.js?v=20260510-013300";
import { renderCoinIcon } from "../components/icons.js?v=20260510-013300";
import { renderMascot } from "../components/mascot.js?v=20260510-013300";

export function renderSettingsScreen(saveSummary, player) {
  const hasSave = Boolean(saveSummary && player);
  const savedAtLabel = hasSave
    ? new Date(saveSummary.savedAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })
    : "";

  return `
    <section class="panel flow-screen settings-screen utility-screen">
      <div class="flow-header utility-header">
        <p class="eyebrow eyebrow-pill">Bakery Notebook</p>
        <h2>Game Settings</h2>
        <p class="muted">Check on your bakery, hop into practice rooms, or start fresh when you want a brand-new shop.</p>
      </div>

      ${renderMascot({
        mood: "happy",
        compact: true,
        message: hasSave
          ? `${saveSummary.username}, your bakery notes are tucked away and ready whenever you want another shift.`
          : "No save is loaded yet, but you can head back and open a bakery whenever you're ready.",
      })}

      ${
        hasSave
          ? `
            <section class="utility-save-card settings-save-card">
              <div class="utility-save-head">
                <div>
                  <p class="eyebrow">Current Save</p>
                  <h3>${escapeHtml(saveSummary.username)}</h3>
                </div>
                <div class="badge">${renderCoinIcon("coin-icon-sm")} ${saveSummary.coins} coins in the till</div>
              </div>
              <div class="utility-summary-grid">
                <article class="mini-card utility-mini-card">
                  <span class="muted tiny">Grade</span>
                  <strong>${escapeHtml(saveSummary.grade === "K" ? "Kindergarten" : `Grade ${saveSummary.grade}`)}</strong>
                  <p class="muted tiny">Starting lane for the bakery math journey.</p>
                </article>
                <article class="mini-card utility-mini-card">
                  <span class="muted tiny">Current SR</span>
                  <strong>${saveSummary.SR}</strong>
                  <p class="muted tiny">Mode: ${escapeHtml(getSRMode(saveSummary.SR))}</p>
                </article>
                <article class="mini-card utility-mini-card">
                  <span class="muted tiny">Last Saved</span>
                  <strong>${escapeHtml(savedAtLabel)}</strong>
                  <p class="muted tiny">Your bakery progress is stored right in this browser.</p>
                </article>
              </div>
            </section>
          `
          : `
            <section class="utility-empty-card">
              <h3>No bakery notebook yet</h3>
              <p class="muted">Start a new player from the title screen to unlock your save card, pantry notes, and math lab.</p>
            </section>
          `
      }

      <section class="utility-links-grid">
        <article class="utility-link-card">
          <p class="eyebrow">Back To Work</p>
          <h3>Bake Menu</h3>
          <p class="muted">Return to your recipes and pick the next treat to bake.</p>
          <button class="secondary-button" type="button" data-go-route="recipe" ${hasSave ? "" : "disabled"}>Open Bake Menu</button>
        </article>
        <article class="utility-link-card">
          <p class="eyebrow">Pantry Corner</p>
          <h3>Ingredient Shop</h3>
          <p class="muted">Practice the restock flow and see what each ingredient powers in the bakery.</p>
          <button class="secondary-button" type="button" data-go-route="shop" ${hasSave ? "" : "disabled"}>Visit Pantry Corner</button>
        </article>
        <article class="utility-link-card">
          <p class="eyebrow">Coach Room</p>
          <h3>Math Lab</h3>
          <p class="muted">See which question families are active and what challenge zone comes next.</p>
          <button class="secondary-button" type="button" data-go-route="learn" ${hasSave ? "" : "disabled"}>Open Math Lab</button>
        </article>
      </section>

      <section class="utility-warning-card">
        <p class="eyebrow">Fresh Start</p>
        <h3>Reset Save</h3>
        <p class="muted">This clears the bakery name, coins, pantry, and progress from this browser. Use it only if you want to begin again from the title screen.</p>
      </section>

      <div class="flow-actions settings-actions">
        <button class="secondary-button" type="button" data-go-route="title">
          Back to Title
        </button>
        <button class="ghost-button danger-button" type="button" data-reset-save ${hasSave ? "" : "disabled"}>
          Reset Save
        </button>
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
