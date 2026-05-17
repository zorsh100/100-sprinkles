import { getSRMode } from "../../game/sr.js?v=20260517-140300";
import { renderMascot } from "../components/mascot.js?v=20260517-140300";
import { renderPlayerAvatar } from "../components/player-avatar.js?v=20260517-140300";

export function renderSettingsScreen(saveSummaries, activeSaveSummary, player) {
  const hasActiveSave = Boolean(activeSaveSummary && player);
  const otherSaveSummaries = saveSummaries.filter((summary) => !summary.isActive);

  return `
    <section class="panel flow-screen settings-screen utility-screen">
      <div class="flow-header utility-header">
        <p class="eyebrow eyebrow-pill">Settings</p>
        <h2>Bakery Settings</h2>
        <p class="muted">Choose which baker is using this device, or safely clear one notebook without touching the other one.</p>
      </div>

      ${renderMascot({
        mood: "happy",
        compact: true,
        message: hasActiveSave
          ? `${activeSaveSummary.username} is the current baker on this device.`
          : "Pick a notebook to start baking on this device.",
      })}

      <section class="utility-save-card settings-current-card">
        <p class="eyebrow">Current Baker</p>
        ${
          hasActiveSave
            ? `
              <div class="settings-current-baker">
                ${renderPlayerAvatar(activeSaveSummary.avatarId, { size: "lg", className: "settings-baker-avatar", label: `${activeSaveSummary.username}'s baker portrait` })}
                <h3>${escapeHtml(activeSaveSummary.username)}</h3>
              </div>
            `
            : "<h3>No baker selected</h3>"
        }
        <p class="settings-summary-line">
          ${hasActiveSave ? escapeHtml(getSettingsSummary(activeSaveSummary)) : "Open a notebook to create or switch to a baker."}
        </p>
        ${hasActiveSave ? `<p class="muted tiny settings-saved-line">${escapeHtml(formatSavedAt(activeSaveSummary.savedAt))}</p>` : ""}
        ${
          hasActiveSave
            ? `
              <div class="slot-action-row settings-current-actions">
                <button class="primary-button" type="button" data-go-route="recipe">
                  Back To Baking
                </button>
                <button class="secondary-button" type="button" data-edit-player-slot="${activeSaveSummary.slotId}">
                  Edit Baker Profile
                </button>
              </div>
              <div class="save-slot-danger-zone settings-current-danger">
                <button class="ghost-button danger-button" type="button" data-reset-save-prompt="${activeSaveSummary.slotId}" aria-expanded="false">
                  Clear ${escapeHtml(activeSaveSummary.slotLabel)}
                </button>
              </div>
              <div class="reset-confirmation" data-reset-confirm-slot="${activeSaveSummary.slotId}" hidden>
                <p><strong>This will erase all of ${escapeHtml(activeSaveSummary.username)}'s progress.</strong> Are you sure?</p>
                <div class="reset-confirm-actions">
                  <button class="ghost-button" type="button" data-cancel-reset-save="${activeSaveSummary.slotId}">
                    Cancel
                  </button>
                  <button class="primary-button danger-confirm-button" type="button" data-reset-save="${activeSaveSummary.slotId}">
                    Yes, clear it
                  </button>
                </div>
              </div>
            `
            : ""
        }
        <p class="muted tiny settings-switch-note">Use the cards below to switch bakers or clear a notebook with confirmation.</p>
      </section>

      <section class="utility-save-slots">
        ${otherSaveSummaries.map((summary) => renderSaveSlotCard(summary)).join("")}
      </section>

      <div class="flow-actions settings-actions">
        <button class="secondary-button" type="button" data-go-route="title">
          Back To Title
        </button>
      </div>
    </section>
  `;
}

function renderSaveSlotCard(summary) {
  if (summary.empty) {
    return `
      <article class="utility-save-card settings-save-card settings-empty-card save-slot-card save-slot-card-empty">
        <p class="eyebrow">${summary.slotLabel}</p>
        <h3>${summary.slotLabel} is empty</h3>
        <p class="muted">Start a second baker on this device.</p>
        <div class="slot-action-row settings-empty-actions">
          <button class="primary-button" type="button" data-new-player-slot="${summary.slotId}">Open ${summary.slotLabel}</button>
        </div>
      </article>
    `;
  }

  const slotName = escapeHtml(summary.slotLabel);
  const bakerName = escapeHtml(summary.username);
  const summaryLine = escapeHtml(getSettingsSummary(summary));
  const savedLine = escapeHtml(formatSavedAt(summary.savedAt));

  return `
    <article class="utility-save-card settings-save-card save-slot-card ${summary.isActive ? "active" : ""}">
      <div class="save-slot-head">
        <div class="save-slot-headline">
          ${renderPlayerAvatar(summary.avatarId, { size: "md", className: "save-slot-avatar", label: `${summary.username}'s baker portrait` })}
          <div>
            <p class="eyebrow">${slotName}</p>
            <h3>${bakerName}</h3>
          </div>
        </div>
        <div class="save-slot-chip ${summary.isActive ? "save-slot-chip-active" : ""}">
          ${summary.isActive ? "Current baker" : "Saved notebook"}
        </div>
      </div>

      <p class="settings-summary-line">${summaryLine}</p>
      <p class="muted tiny settings-saved-line">${savedLine}</p>

      <div class="slot-action-row">
        <button class="primary-button" type="button" data-open-save-slot="${summary.slotId}" data-go-route="recipe">
          Play As ${bakerName}
        </button>
      </div>

      <div class="save-slot-danger-zone">
        <button class="ghost-button danger-button" type="button" data-reset-save-prompt="${summary.slotId}" aria-expanded="false">
          Clear ${slotName}
        </button>
      </div>

      <div class="reset-confirmation" data-reset-confirm-slot="${summary.slotId}" hidden>
        <p><strong>This will erase all of ${bakerName}'s progress.</strong> Are you sure?</p>
        <div class="reset-confirm-actions">
          <button class="ghost-button" type="button" data-cancel-reset-save="${summary.slotId}">
            Cancel
          </button>
          <button class="primary-button danger-confirm-button" type="button" data-reset-save="${summary.slotId}">
            Yes, clear it
          </button>
        </div>
      </div>
    </article>
  `;
}

function getSettingsSummary(summary) {
  return `${formatGrade(summary.grade)} · ${getSRMode(summary.SR)} · ${summary.coins} coins`;
}

function formatSavedAt(timestamp) {
  if (!timestamp) {
    return "Saved just now";
  }

  const savedAt = new Date(timestamp);
  const now = new Date();
  const sameDay = savedAt.toDateString() === now.toDateString();
  const timeLabel = savedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  if (sameDay) {
    return `Saved today at ${timeLabel}`;
  }

  const dateLabel = savedAt.toLocaleDateString([], { month: "short", day: "numeric" });
  return `Saved ${dateLabel} at ${timeLabel}`;
}

function formatGrade(grade) {
  return grade === "K" ? "Kindergarten" : `Grade ${grade}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
