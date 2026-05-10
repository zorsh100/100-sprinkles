import { renderMascot } from "../components/mascot.js?v=20260509-233000";

export function renderTitleScreen(saveSummary) {
  return `
    <section class="title-screen title-screen-minimal title-scene-panel">
      <div class="title-scene-art" aria-hidden="true">
        <div class="store-awning"></div>
        <div class="store-window window-left"></div>
        <div class="store-window window-right"></div>
        <div class="store-door"></div>
      </div>
      <img class="title-logo" src="./logo.png?v=20260509-233000" alt="100 Sprinkles logo" />
      ${renderMascot({ mood: "happy", message: saveSummary ? `Welcome back, ${saveSummary.username}! Your bakery is ready for another sweet round.` : "Welcome to 100 Sprinkles! Pick a chef name and let's open your bakery." })}
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
