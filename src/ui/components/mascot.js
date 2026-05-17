import { renderCoinIcon } from "./icons.js?v=20260516-225800";

const CHEF_SPRINKLES_COACH_VERSION = "20260516-225800";
const CHEF_SPRINKLES_COACH_SRC = `./assets/characters/chef-sprinkles-coach.png?v=${CHEF_SPRINKLES_COACH_VERSION}`;

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function renderMascot({ mood = "happy", message = "", compact = false, variant = "card", className = "" } = {}) {
  if (variant === "speech") {
    const classes = ["mascot-scene", "mascot-scene-speech", `mascot-${mood}`, className].filter(Boolean).join(" ");
    return `
      <div class="${classes}">
        <div class="mascot-avatar" aria-hidden="true">
          <img class="mascot-portrait" src="${CHEF_SPRINKLES_COACH_SRC}" alt="" loading="eager" decoding="async" />
        </div>
        ${message ? `<div class="mascot-bubble"><p class="mascot-message">${escapeHtml(message)}</p></div>` : ""}
      </div>
    `;
  }

  return `
    <div class="mascot-card mascot-${mood} ${compact ? "compact" : ""} ${className}">
      <div class="mascot-avatar" aria-hidden="true">
        <img class="mascot-portrait" src="${CHEF_SPRINKLES_COACH_SRC}" alt="" loading="eager" decoding="async" />
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
