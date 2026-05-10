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

export function renderOnboardingScreen() {
  return `
    <section class="panel onboarding-card flow-screen">
      <div class="section-head">
        <div>
          <p class="eyebrow">User Info</p>
          <h2>Open your bakery</h2>
          <p class="muted">Pick a grade so the Skill Rating starts in the right sweet spot.</p>
        </div>
        <div class="badge">Adaptive SR 0-1000</div>
      </div>
      <form id="onboarding-form" class="form-grid">
        <label class="field full">
          <span>Baker name</span>
          <input id="username" name="username" maxlength="24" placeholder="Chef Sunny" required />
        </label>
        <input id="grade" name="grade" type="hidden" value="K" />
        <div class="info-card">
          <strong>Grade preview</strong>
          <p class="muted tiny" id="grade-preview">Kindergarten starts at SR 50 with visual counting and no reading required.</p>
        </div>
        <div class="field full">
          <span>Choose a grade</span>
          <div class="grade-grid">
            ${GRADE_CARDS.map(
              (grade) => `
                <button
                  class="grade-card ${grade.value === "K" ? "active" : ""}"
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
        <div class="field full">
          <button class="primary-button" type="submit">Start Baking</button>
        </div>
      </form>
    </section>
  `;
}
