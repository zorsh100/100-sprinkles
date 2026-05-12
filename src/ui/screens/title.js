import { renderCoinIcon } from "../components/icons.js?v=20260511-201500";
import { renderMascot } from "../components/mascot.js?v=20260511-201500";
import { renderPlayerAvatar } from "../components/player-avatar.js?v=20260511-201500";

export function renderTitleScreen(saveSummaries) {
  const filledSlots = saveSummaries.filter((summary) => !summary.empty);
  const mascotMessage =
    filledSlots.length === 0
      ? "Welcome to 100 Sprinkles! Pick a notebook and let's open your bakery."
      : filledSlots.length === 1
        ? `${filledSlots[0].username}'s bakery is ready. You can also open a second notebook for another player.`
        : "Two bakery notebooks are ready to go. Pick the chef you want to play as.";

  return `
    <section class="title-screen title-screen-minimal title-scene-panel">
      <div class="title-scene-art" aria-hidden="true">
        <div class="store-awning"></div>
        <div class="store-window window-left"></div>
        <div class="store-window window-right"></div>
        <div class="store-door"></div>
      </div>
      <img class="title-logo" src="./logo.png?v=20260511-201500" alt="100 Sprinkles logo" />
      ${renderMascot({ mood: "happy", message: mascotMessage })}
      <section class="title-save-grid" aria-label="Player save slots">
        ${saveSummaries.map((summary) => renderSaveSlot(summary)).join("")}
      </section>
    </section>
  `;
}

function renderSaveSlot(summary) {
  if (summary.empty) {
    return `
      <article class="title-slot-card title-slot-card-empty">
        <div class="save-slot-head">
          <p class="eyebrow">${summary.slotLabel}</p>
          <span class="save-slot-chip">Open notebook</span>
        </div>
        <h3>Start a new bakery</h3>
        <p class="muted">This spot is ready for another chef name, grade, and bakery adventure.</p>
        <div class="slot-action-row">
          <button class="primary-button title-button" type="button" data-new-player-slot="${summary.slotId}">
            Create ${summary.slotLabel}
          </button>
        </div>
      </article>
    `;
  }

  return `
    <article class="title-slot-card ${summary.isActive ? "active" : ""}">
      <div class="save-slot-head">
        <div class="save-slot-headline">
          ${renderPlayerAvatar(summary.avatarId, { size: "md", className: "save-slot-avatar", label: `${summary.username}'s baker portrait` })}
          <div>
            <p class="eyebrow">${summary.slotLabel}</p>
            <h3>${escapeHtml(summary.username)}</h3>
          </div>
        </div>
        ${summary.isActive ? '<span class="save-slot-chip save-slot-chip-active">Last used</span>' : '<span class="save-slot-chip">Saved</span>'}
      </div>
      <p class="muted">${escapeHtml(summary.grade === "K" ? "Kindergarten" : `Grade ${summary.grade}`)} baker, SR ${summary.SR}</p>
      <div class="title-slot-stats">
        <span class="badge">${renderCoinIcon("coin-icon-sm")} ${summary.coins} coins</span>
        <span class="badge">Saved ${escapeHtml(formatSavedAt(summary.savedAt))}</span>
      </div>
      <div class="slot-action-row">
        <button class="secondary-button title-button" type="button" data-open-save-slot="${summary.slotId}" data-go-route="recipe">
          Play as ${escapeHtml(summary.username)}
        </button>
      </div>
    </article>
  `;
}

function formatSavedAt(savedAt) {
  if (!savedAt) {
    return "just now";
  }

  return new Date(savedAt).toLocaleDateString([], {
    month: "short",
    day: "numeric",
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
