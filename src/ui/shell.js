export function renderShell({ screenMarkup, route }) {
  return `
    <div class="bakery-backdrop" aria-hidden="true">
      <div class="backdrop-sprinkles sprinkle-layer-a"></div>
      <div class="backdrop-sprinkles sprinkle-layer-b"></div>
      <div class="bakery-counter-scene">
        <span class="counter-item flour-sack"></span>
        <span class="counter-item mixing-bowl"></span>
        <span class="counter-item rolling-pin"></span>
        <span class="counter-item cupcake-plate"></span>
      </div>
    </div>
    <div class="shell-topbar">
      <button
        class="ghost-button shell-settings-button${route === "settings" ? " active" : ""}"
        type="button"
        data-go-settings
        ${route === "settings" ? 'disabled aria-current="page"' : ""}
      >
        Settings
      </button>
    </div>
    <div class="layout-stack">
      ${screenMarkup}
    </div>
  `;
}
