import { renderCoinIcon } from "./icons.js?v=20260512-101400";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function renderMascot({ mood = "happy", message = "", compact = false } = {}) {
  return `
    <div class="mascot-card mascot-${mood} ${compact ? "compact" : ""}">
      <div class="mascot-avatar" aria-hidden="true">
        <div class="mascot-hat">
          <span class="mascot-hat-top"></span>
          <span class="mascot-hat-band"></span>
        </div>
        <div class="mascot-face">
          <span class="mascot-cheek mascot-cheek-left"></span>
          <span class="mascot-cheek mascot-cheek-right"></span>
          <span class="mascot-eye mascot-eye-left"></span>
          <span class="mascot-eye mascot-eye-right"></span>
          <span class="mascot-mouth mascot-mouth-${mood}"></span>
        </div>
      </div>
      ${message ? `<p class="mascot-message">${escapeHtml(message)}</p>` : ""}
    </div>
  `;
}

export function renderCelebrationBurst({ icon = "🧁", label = "Fresh treats!" } = {}) {
  return `
    <div class="celebration-burst" aria-hidden="true">
      <span class="celebration-badge">${escapeHtml(label)}</span>
      <span class="celebration-main-icon">${escapeHtml(icon)}</span>
      <span class="celebration-token token-a">✨</span>
      ${renderCoinIcon("celebration-token token-b coin-icon-burst")}
      <span class="celebration-token token-c">🎉</span>
      <span class="celebration-ribbon ribbon-a"></span>
      <span class="celebration-ribbon ribbon-b"></span>
    </div>
  `;
}
