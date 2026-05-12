import { PLAYER_AVATAR_IDS } from "../../game/data.js?v=20260511-211500";

const AVATAR_SHEET_VERSION = "20260511-211500";
const AVATAR_SHEET_SRC = `./assets/player-avatars/kid-bakers-sheet.png?v=${AVATAR_SHEET_VERSION}`;

export const PLAYER_AVATAR_OPTIONS = [
  { id: PLAYER_AVATAR_IDS[0], label: "Blue Shirt Baker", col: 0, row: 0 },
  { id: PLAYER_AVATAR_IDS[1], label: "Pink Pigtails Baker", col: 1, row: 0 },
  { id: PLAYER_AVATAR_IDS[2], label: "Green Shirt Baker", col: 2, row: 0 },
  { id: PLAYER_AVATAR_IDS[3], label: "Yellow Clip Baker", col: 3, row: 0 },
  { id: PLAYER_AVATAR_IDS[4], label: "Purple Bandana Baker", col: 0, row: 1 },
  { id: PLAYER_AVATAR_IDS[5], label: "Teal Shirt Baker", col: 1, row: 1 },
  { id: PLAYER_AVATAR_IDS[6], label: "Red Shirt Baker", col: 2, row: 1 },
  { id: PLAYER_AVATAR_IDS[7], label: "Yellow Bow Baker", col: 3, row: 1 },
];

export function getPlayerAvatarOption(avatarId) {
  return PLAYER_AVATAR_OPTIONS.find((option) => option.id === avatarId) ?? PLAYER_AVATAR_OPTIONS[0];
}

export function renderPlayerAvatar(avatarId, { className = "", size = "md", label = "" } = {}) {
  const option = getPlayerAvatarOption(avatarId);
  const classes = [`player-avatar`, `player-avatar-${size}`, className].filter(Boolean).join(" ");
  const accessibleLabel = label || option.label;

  return `
    <div
      class="${classes}"
      role="img"
      aria-label="${escapeHtml(accessibleLabel)}"
      style="${getAvatarStyle(option)}"
    ></div>
  `;
}

export function renderPlayerAvatarPicker(selectedAvatarId) {
  const activeAvatarId = getPlayerAvatarOption(selectedAvatarId).id;

  return `
    <div class="avatar-picker-grid" role="radiogroup" aria-label="Choose a baker picture">
      ${PLAYER_AVATAR_OPTIONS.map((option) => {
        const active = option.id === activeAvatarId;

        return `
          <button
            class="avatar-choice-card ${active ? "active" : ""}"
            type="button"
            data-avatar-choice="${option.id}"
            role="radio"
            aria-checked="${active ? "true" : "false"}"
            aria-label="${escapeHtml(option.label)}"
          >
            ${renderPlayerAvatar(option.id, { size: "picker", className: "avatar-choice-portrait", label: option.label })}
            <span class="avatar-choice-label">${escapeHtml(option.label)}</span>
          </button>
        `;
      }).join("")}
    </div>
  `;
}

function getAvatarStyle(option) {
  return [
    `--avatar-sheet:url('${AVATAR_SHEET_SRC}')`,
    `--avatar-x:${getBackgroundX(option.col)}`,
    `--avatar-y:${getBackgroundY(option.row)}`,
  ].join(";");
}

function getBackgroundX(col) {
  return ["0%", "33.333%", "66.666%", "100%"][col] ?? "0%";
}

function getBackgroundY(row) {
  return ["0%", "100%"][row] ?? "0%";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
