import { renderMascot } from "../components/mascot.js?v=20260517-133300";
import { renderPlayerAvatar } from "../components/player-avatar.js?v=20260517-133300";

export function renderTitleScreen(saveSummaries) {
  const filledSlots = saveSummaries.filter((summary) => !summary.empty);
  const mascotMessage =
    filledSlots.length === 0
      ? "Welcome to 100 Sprinkles! Pick a notebook and let's open your bakery."
      : filledSlots.length === 1
        ? `${filledSlots[0].username}'s bakery is ready. You can also open a second notebook for another player.`
        : "Two bakery notebooks are ready to go. Pick the chef you want to play as.";

  return `
    <section class="title-screen title-screen-minimal title-scene-stage">
      <div class="title-storefront-band">
        <div class="title-scene-art" aria-hidden="true">
          <div class="store-awning"></div>
          <div class="store-window window-left"></div>
          <div class="store-window window-right"></div>
          <div class="store-door"></div>
        </div>
        <img class="title-logo" src="./logo.png?v=20260517-133300" alt="100 Sprinkles logo" />
      </div>
      <div class="title-mascot-wrap">
        ${renderMascot({ mood: "happy", message: mascotMessage, variant: "speech", className: "title-mascot-scene" })}
      </div>
      <section class="title-save-grid" aria-label="Player save slots">
        ${saveSummaries.map((summary) => renderSaveSlot(summary)).join("")}
      </section>
      <div class="bakery-counter-scene title-counter-strip" aria-hidden="true">
        <div class="counter-item flour-sack"></div>
        <div class="counter-item mixing-bowl"></div>
        <div class="counter-item rolling-pin"></div>
        <div class="counter-item cupcake-plate"></div>
      </div>
    </section>
  `;
}

function renderSaveSlot(summary) {
  if (summary.empty) {
    return `
      <article class="title-slot-card title-slot-card-empty">
        <div class="title-slot-summary title-slot-summary-empty">
          <div class="title-slot-copy">
            <p class="eyebrow">${summary.slotLabel}</p>
            <h3>Open a new notebook</h3>
            <p class="muted">Create another baker profile.</p>
          </div>
        </div>
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
      <div class="title-slot-summary">
        <div class="title-slot-copy">
          ${renderPlayerAvatar(summary.avatarId, { size: "md", className: "save-slot-avatar", label: `${summary.username}'s baker portrait` })}
          <div class="title-slot-text">
            <p class="eyebrow">${summary.slotLabel}</p>
            <h3>${escapeHtml(summary.username)}</h3>
            <p class="muted title-slot-meta">${escapeHtml(summary.grade === "K" ? "Kindergarten" : `Grade ${summary.grade}`)} · SR ${summary.SR}</p>
          </div>
        </div>
      </div>
      <div class="slot-action-row">
        <button class="${summary.isActive ? "primary-button" : "secondary-button"} title-button" type="button" data-open-save-slot="${summary.slotId}" data-go-route="recipe">
          Play as ${escapeHtml(summary.username)}
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
