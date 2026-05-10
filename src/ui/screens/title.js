export function renderTitleScreen(saveSummary) {
  return `
    <section class="panel title-screen flow-screen">
      <img class="title-logo" src="./logo.png?v=20260509-174353" alt="100 Sprinkles logo" />
      <p class="eyebrow">Title Page</p>
      <h2>100 Sprinkles</h2>
      <p class="title-copy">
        A math bakery adventure where each page leads to the next sweet step.
      </p>
      <div class="title-actions">
        <button class="primary-button title-button" type="button" data-go-profile>
          New Baker
        </button>
        ${
          saveSummary
            ? `
              <button class="secondary-button title-button" type="button" data-go-recipe>
                Continue ${escapeHtml(saveSummary.username)}
              </button>
            `
            : ""
        }
      </div>
      ${
        saveSummary
          ? `
            <div class="receipt-card title-save-card">
              <strong>Saved bakery</strong>
              <span>${escapeHtml(saveSummary.username)}</span>
              <span>Grade ${escapeHtml(saveSummary.grade)} • SR ${saveSummary.SR}</span>
            </div>
          `
          : ""
      }
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
