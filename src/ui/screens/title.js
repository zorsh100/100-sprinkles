export function renderTitleScreen(saveSummary) {
  return `
    <section class="title-screen title-screen-minimal">
      <img class="title-logo" src="./logo.png?v=20260509-174353" alt="100 Sprinkles logo" />
      <div class="title-actions">
        <button class="primary-button title-button" type="button" data-go-profile>
          New Player
        </button>
        <button class="secondary-button title-button" type="button" data-go-recipe ${saveSummary ? "" : "disabled"}>
          Continue Game
        </button>
      </div>
    </section>
  `;
}
