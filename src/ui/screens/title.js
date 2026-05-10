export function renderTitleScreen(saveSummary) {
  return `
    <section class="panel title-screen flow-screen">
      <img class="title-logo" src="./logo.png?v=20260509-174353" alt="100 Sprinkles logo" />
      <h2>100 Sprinkles</h2>
      <p class="title-copy">
        A math bakery adventure where each page leads to the next sweet step.
      </p>
      <div class="title-actions">
        <button class="primary-button title-button" type="button" data-go-profile>
          New Player
        </button>
        <button class="secondary-button title-button" type="button" data-go-recipe ${saveSummary ? "" : "disabled"}>
          Continue Game
        </button>
      </div>
      ${saveSummary ? "" : '<p class="muted tiny">No saved game yet.</p>'}
    </section>
  `;
}
