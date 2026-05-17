import { renderMascot } from "../components/mascot.js?v=20260517-140300";
import { PLAYER_AVATAR_IDS } from "../../game/data.js?v=20260517-140300";
import { getPlayerAvatarOption, renderPlayerAvatar, renderPlayerAvatarPicker } from "../components/player-avatar.js?v=20260517-140300";

const GRADE_BUCKETS = [
  {
    key: "k-1",
    label: "K-1",
    title: "Picture-First Bakery Math",
    note: "Warm visuals, short prompts, and a gentle first step into story math.",
    grades: [
      {
        value: "K",
        label: "Kindergarten",
        sr: 50,
        note: "Picture counting",
        preview: "Kindergarten starts at SR 50 with picture counting and no reading required.",
        available: true,
      },
      {
        value: "1",
        label: "1st Grade",
        sr: 150,
        note: "Gentle story math",
        preview: "1st Grade starts at SR 150 with short bakery stories and a gentle bridge out of picture mode.",
        available: true,
      },
    ],
  },
  {
    key: "2-5",
    label: "2-5",
    title: "Bakery Adventure Math",
    note: "Active bake jobs, pantry math, and richer bakery story problems.",
    grades: [
      {
        value: "2",
        label: "2nd Grade",
        sr: 250,
        note: "Story totals",
        preview: "2nd Grade starts at SR 250 with bakery story totals, take-away questions, and clearer reading support.",
        available: true,
      },
      {
        value: "3",
        label: "3rd Grade",
        sr: 350,
        note: "Groups and sharing",
        preview: "3rd Grade starts at SR 350 with bakery groups, sharing, arrays, and early pantry jobs.",
        available: true,
      },
      {
        value: "4",
        label: "4th Grade",
        sr: 450,
        note: "Multi-step bakery jobs",
        preview: "4th Grade starts at SR 450 with stronger multiplication, fractions, and multi-step bakery questions.",
        available: true,
      },
      {
        value: "5",
        label: "5th Grade",
        sr: 550,
        note: "Bigger bakery systems",
        preview: "5th Grade starts at SR 550 with deeper cost, batch, and bakery planning math.",
        available: true,
      },
    ],
  },
  {
    key: "6-8",
    label: "6-8",
    title: "Middle School Bakery Math",
    note: "Cooling on the rack for a later update while we keep improving the younger paths.",
    grades: [
      {
        value: "6",
        label: "6th Grade",
        sr: 650,
        note: "Coming soon",
        preview: "Grades 6-8 are cooling on the rack for now while we focus on K-1 and grades 2-5.",
        available: false,
      },
      {
        value: "7",
        label: "7th Grade",
        sr: 750,
        note: "Coming soon",
        preview: "Grades 6-8 are cooling on the rack for now while we focus on K-1 and grades 2-5.",
        available: false,
      },
      {
        value: "8",
        label: "8th Grade",
        sr: 850,
        note: "Coming soon",
        preview: "Grades 6-8 are cooling on the rack for now while we focus on K-1 and grades 2-5.",
        available: false,
      },
    ],
  },
];

const GRADE_CARDS = GRADE_BUCKETS.flatMap((bucket) => bucket.grades);
const VISIBLE_GRADE_BUCKETS = GRADE_BUCKETS.filter((bucket) => bucket.key !== "6-8");

export function renderOnboardingScreen(slotSummary) {
  const slotLabel = slotSummary?.slotLabel ?? "Player 1";
  const defaultChefName = "Chef Sunny";
  const isEditing = Boolean(slotSummary && !slotSummary.empty);
  const currentGrade = slotSummary?.grade ?? "K";
  const currentName = isEditing ? escapeHtml(slotSummary.username ?? "") : "";
  const currentAvatarId = getPlayerAvatarOption(slotSummary?.avatarId ?? PLAYER_AVATAR_IDS[0]).id;

  return `
    <section class="panel onboarding-card flow-screen">
      <div class="section-head onboarding-head">
        <div>
          <p class="eyebrow eyebrow-pill">${slotLabel} Notebook</p>
          <h2>${isEditing ? "Edit your baker" : "Open your bakery"}</h2>
          <p class="muted onboarding-subcopy">
            ${
              isEditing
                ? "Change the baker picture or chef name for this notebook. If you leave the name blank, we'll use Chef Sunny."
                : "Pick a baker picture, add a chef name if you want one, or leave it blank and we'll use Chef Sunny."
            }
          </p>
        </div>
        <div class="badge onboarding-badge">${isEditing ? "📝 Safe to update anytime" : "✨ Gets harder as you grow"}</div>
      </div>
      ${renderMascot({
        mood: "happy",
        compact: true,
        message: isEditing
          ? `Update the baker picture or chef name for ${slotLabel.toLowerCase()}. If you leave the name blank, I'll use Chef Sunny.`
          : `Choose a baker picture, chef name, and grade for ${slotLabel.toLowerCase()}, and I'll set up the bakery math just right.`,
      })}
      <form id="onboarding-form" class="form-grid onboarding-form" data-onboarding-mode="${isEditing ? "edit" : "create"}">
        <label class="field full">
          <span>Your chef name</span>
          <input id="username" name="username" maxlength="24" placeholder="${defaultChefName}" value="${currentName}" />
          <p class="muted tiny">Leave it blank to use ${defaultChefName}.</p>
        </label>
        <input id="avatar-id" name="avatarId" type="hidden" value="${currentAvatarId}" />
        <div class="field full">
          <span>Pick your baker picture</span>
          <div class="onboarding-avatar-panel">
            <div class="onboarding-avatar-preview">
              <div id="avatar-preview-portrait">
                ${renderPlayerAvatar(currentAvatarId, { size: "xl", className: "onboarding-avatar-hero", label: `Selected baker: ${getPlayerAvatarOption(currentAvatarId).label}` })}
              </div>
              <div>
                <strong id="avatar-preview-name">${escapeHtml(getPlayerAvatarOption(currentAvatarId).label)}</strong>
                <p class="muted tiny">This baker picture will follow the notebook around the bakery.</p>
              </div>
            </div>
            ${renderPlayerAvatarPicker(currentAvatarId)}
          </div>
        </div>
        <input id="grade" name="grade" type="hidden" value="${currentGrade}" />
        ${
          isEditing
            ? `
              <div class="info-card onboarding-info-card">
                <strong>Current grade</strong>
                <p class="muted tiny">${getGradeLabel(currentGrade)} stays the same while you update this baker card.</p>
              </div>
            `
            : `
              <div class="info-card onboarding-info-card" id="grade-preview-card">
                <strong>About this path</strong>
                <p class="muted tiny" id="grade-preview">Kindergarten starts at SR 50 with picture counting and no reading required.</p>
              </div>
              <div class="field full">
                <span>Choose a grade path</span>
                <div class="onboarding-grade-buckets">
                  ${VISIBLE_GRADE_BUCKETS.map(
                    (bucket) => `
                      <section class="grade-bucket">
                        <div class="grade-bucket-head">
                          <div>
                            <p class="eyebrow eyebrow-pill">${bucket.label}</p>
                            <h3>${bucket.title}</h3>
                            <p class="muted tiny">${bucket.note}</p>
                          </div>
                        </div>
                        <div class="grade-grid onboarding-grade-grid">
                          ${bucket.grades
                            .map(
                              (grade) => `
                                <button
                                  class="grade-card ${grade.value === currentGrade ? "active" : ""} ${grade.available ? "" : "grade-card-disabled"}"
                                  data-grade="${grade.value}"
                                  data-sr="${grade.sr}"
                                  data-note="${grade.note}"
                                  data-preview="${grade.preview}"
                                  type="button"
                                  ${grade.available ? "" : 'disabled aria-disabled="true"'}
                                >
                                  <strong>${grade.label}</strong>
                                  <span>SR ${grade.sr}</span>
                                  <span>${grade.note}</span>
                                </button>
                              `,
                            )
                            .join("")}
                        </div>
                      </section>
                    `,
                  ).join("")}
                </div>
              </div>
            `
        }
        <div class="field full">
          <button class="primary-button onboarding-submit-button" id="start-baking" type="submit" disabled aria-disabled="true">
            ${isEditing ? "Save Baker Profile" : `Start Baking In ${slotLabel}`}
          </button>
        </div>
      </form>
    </section>
  `;
}

function getGradeLabel(grade) {
  const match = GRADE_CARDS.find((card) => card.value === grade);
  return match?.label ?? `Grade ${grade}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
