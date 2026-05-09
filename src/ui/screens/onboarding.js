export function renderOnboardingScreen() {
  return `
    <section class="panel onboarding-card">
      <div class="section-head">
        <div>
          <p class="eyebrow">Screen system</p>
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
        <label class="field">
          <span>Grade</span>
          <select id="grade" name="grade">
            <option value="K">Kindergarten</option>
            <option value="1">1st</option>
            <option value="2">2nd</option>
            <option value="3">3rd</option>
            <option value="4">4th</option>
            <option value="5">5th</option>
            <option value="6">6th</option>
            <option value="7">7th</option>
            <option value="8">8th</option>
          </select>
        </label>
        <div class="info-card">
          <strong>What changes with grade?</strong>
          <p class="muted tiny">Younger bakers start with visual counting. Older bakers unlock pantry math, profits, and strategy.</p>
        </div>
        <div class="field full">
          <button class="primary-button" type="submit">Start Baking</button>
        </div>
      </form>
    </section>
  `;
}
