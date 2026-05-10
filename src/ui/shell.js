export function renderShell({ player, route, screenMarkup, flash, saveSummary }) {
  const playerSummary = player
    ? `
      <p class="muted">${player.grade === "K" ? "Kindergarten" : `Grade ${player.grade}`} baker</p>
    `
    : `<p class="muted">Adaptive K-8 bakery simulator</p>`;

  return `
    <div class="layout-stack">
      <section class="panel">
        <div class="section-head shell-head">
          <div class="shell-brand">
            <img class="shell-logo" src="./logo.png" alt="100 Sprinkles logo" />
            <div>
              <p class="eyebrow">Project shell</p>
              <h2>${player ? `${escapeHtml(player.username)}'s Shop` : "100 Sprinkles"}</h2>
              ${playerSummary}
            </div>
          </div>
          ${player ? renderFlowSteps(route) : ""}
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

function renderFlowSteps(route) {
  const steps = [
    { route: "title", label: "Title" },
    { route: "profile", label: "User Info" },
    { route: "recipe", label: "Recipe" },
    { route: "bake", label: "Bake" },
    { route: "stats", label: "Stats" },
  ];

  return `
    <div class="flow-steps">
      ${steps
        .map(
          (step) => `
            <div class="flow-step ${step.route === route ? "active" : ""}">
              ${step.label}
            </div>
          `,
        )
        .join("")}
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
