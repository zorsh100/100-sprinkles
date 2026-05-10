export function renderSettingsScreen(saveSummary) {
  return `
    <section class="panel flow-screen">
      <div class="flow-header">
        <p class="eyebrow">Settings</p>
        <h2>Game Settings</h2>
        <p class="muted">Manage your saved game here.</p>
      </div>

      ${
        saveSummary
          ? `
            <div class="receipt-card sale-report">
              <strong>Current save</strong>
              <span>${escapeHtml(saveSummary.username)}</span>
              <span>Grade ${escapeHtml(saveSummary.grade)}</span>
              <span>SR ${saveSummary.SR}</span>
            </div>
          `
          : '<p class="muted tiny">No saved game found.</p>'
      }

      <div class="flow-actions settings-actions">
        ${
          saveSummary
            ? `
              <button class="secondary-button" type="button" data-go-route="recipe">
                Back to Recipes
              </button>
            `
            : ""
        }
        <button class="secondary-button" type="button" data-go-route="title">
          Back to Title
        </button>
        <button class="ghost-button danger-button" type="button" data-reset-save>
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
