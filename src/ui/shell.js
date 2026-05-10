const NAV_ITEMS = [
  { route: "bakery", label: "Bakery" },
  { route: "shop", label: "Pantry Shop" },
  { route: "learn", label: "Math Lab" },
];

export function renderShell({ player, route, screenMarkup, flash, saveSummary }) {
  const navMarkup = player
    ? `
      <div class="tabs">
        ${NAV_ITEMS.map(
          (item) => `
            <button class="tab-button ${route === item.route ? "active" : ""}" data-route="${item.route}" type="button">
              ${item.label}
            </button>
          `,
        ).join("")}
      </div>
    `
    : "";

  const playerSummary = player
    ? `
      <p class="muted">${player.grade === "K" ? "Kindergarten" : `Grade ${player.grade}`} baker</p>
    `
    : `<p class="muted">Adaptive K-8 bakery simulator</p>`;

  return `
    <div class="layout-stack">
      <section class="panel">
        <div class="section-head">
          <div>
            <p class="eyebrow">Project shell</p>
            <h2>${player ? `${escapeHtml(player.username)}'s Shop` : "Sprinkles 100"}</h2>
            ${playerSummary}
          </div>
          ${navMarkup}
        </div>
        ${flash ? `<div class="message ${flash.kind}">${escapeHtml(flash.text)}</div>` : ""}
        ${
          saveSummary
            ? `
              <div class="save-banner">
                <span><strong>Save loaded:</strong> ${escapeHtml(saveSummary.username)}</span>
                <span>Grade ${escapeHtml(saveSummary.grade)}</span>
                <span>SR ${saveSummary.SR}</span>
                <span>${formatSaveTime(saveSummary.savedAt)}</span>
              </div>
            `
            : ""
        }
      </section>
      ${screenMarkup}
      <p class="footer-note">Progress saves on this device with local storage.</p>
    </div>
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

function formatSaveTime(timestamp) {
  return `Saved ${new Date(timestamp).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })}`;
}
