export function renderShell({ screenMarkup, flash }) {
  return `
    <div class="layout-stack">
      ${flash ? `<div class="message ${flash.kind}">${escapeHtml(flash.text)}</div>` : ""}
      ${screenMarkup}
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
