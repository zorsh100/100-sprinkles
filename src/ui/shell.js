export function renderShell({ screenMarkup, route }) {
  return `
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
