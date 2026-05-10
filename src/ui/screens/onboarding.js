import { renderMascot } from "../components/mascot.js?v=20260510-054400";

const GRADE_CARDS = [
  { value: "K", label: "Kindergarten", sr: 50, note: "Picture counting" },
  { value: "1", label: "1st Grade", sr: 150, note: "Basic story math" },
  { value: "2", label: "2nd Grade", sr: 250, note: "Addition and subtraction" },
  { value: "3", label: "3rd Grade", sr: 350, note: "Pantry unlocks soon" },
  { value: "4", label: "4th Grade", sr: 450, note: "Bigger numbers" },
  { value: "5", label: "5th Grade", sr: 550, note: "Multiplication and cost" },
  { value: "6", label: "6th Grade", sr: 650, note: "Full simulator" },
  { value: "7", label: "7th Grade", sr: 750, note: "Ratios and strategy" },
  { value: "8", label: "8th Grade", sr: 850, note: "Advanced bakery math" },
];

export function renderOnboardingScreen(slotSummary) {
  const slotLabel = slotSummary?.slotLabel ?? "Player 1";
  const defaultChefName = "Chef Sunny";
  const isEditing = Boolean(slotSummary && !slotSummary.empty);
  const currentGrade = slotSummary?.grade ?? "K";
  const currentName = isEditing ? escapeHtml(slotSummary.username ?? "") : "";

  return `
    <section class="panel onboarding-card flow-screen">
      <div class="section-head onboarding-head">
        <div>
          <p class="eyebrow eyebrow-pill">${slotLabel} Notebook</p>
          <h2>${isEditing ? "Edit your baker" : "Open your bakery"}</h2>
          <p class="muted onboarding-subcopy">
            ${
              isEditing
                ? "Change the chef name for this notebook. If you leave it blank, we'll use Chef Sunny."
                : "Add a chef name if you want one, or leave it blank and we'll use Chef Sunny."
            }
          </p>
        </div>
        <div class="badge onboarding-badge">${isEditing ? "📝 Safe to update anytime" : "✨ Gets harder as you grow"}</div>
      </div>
      ${renderMascot({
        mood: "happy",
        compact: true,
        message: isEditing
          ? `Update the chef name for ${slotLabel.toLowerCase()}. If you leave it blank, I'll use Chef Sunny.`
          : `Choose a chef name and grade for ${slotLabel.toLowerCase()}, and I'll set up the bakery math just right.`,
      })}
      <form id="onboarding-form" class="form-grid onboarding-form" data-onboarding-mode="${isEditing ? "edit" : "create"}">
        <label class="field full">
          <span>Your chef name</span>
          <input id="username" name="username" maxlength="24" placeholder="${defaultChefName}" value="${currentName}" />
          <p class="muted tiny">Leave it blank to use ${defaultChefName}.</p>
        </label>
        <input id="grade" name="grade" type="hidden" value="${currentGrade}" />
        ${
          isEditing
            ? `
              <div class="info-card onboarding-info-card">
                <strong>Current grade</strong>
                <p class="muted tiny">${getGradeLabel(currentGrade)} stays the same while you rename this notebook.</p>
              </div>
            `
            : `
              <div class="info-card onboarding-info-card" id="grade-preview-card">
                <strong>About this grade</strong>
                <p class="muted tiny" id="grade-preview">Kindergarten starts at SR 50 with picture counting and no reading required.</p>
              </div>
              <div class="field full">
                <span>Choose a grade</span>
                <div class="grade-grid onboarding-grade-grid">
                  ${GRADE_CARDS.map(
                    (grade) => `
                      <button
                        class="grade-card ${grade.value === currentGrade ? "active" : ""}"
                        data-grade="${grade.value}"
                        data-sr="${grade.sr}"
                        data-note="${grade.note}"
                        type="button"
                      >
                        <strong>${grade.label}</strong>
                        <span>SR ${grade.sr}</span>
                        <span>${grade.note}</span>
                      </button>
                    `,
                  ).join("")}
                </div>
              </div>
            `
        }
        <div class="field full">
          <button class="primary-button onboarding-submit-button" id="start-baking" type="submit" disabled aria-disabled="true">
            ${isEditing ? "Save Baker Name" : `Start Baking In ${slotLabel}`}
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
