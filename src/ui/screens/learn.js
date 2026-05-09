export function renderLearnScreen(player) {
  return `
    <section class="panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">Routing screen</p>
          <h2>Math Lab</h2>
          <p class="muted">The question generator keeps challenges near the current Skill Rating.</p>
        </div>
        <div class="badge">Target ${player.SR - 20} to ${player.SR + 20}</div>
      </div>
      <div class="recipe-grid">
        <div class="mini-card">
          <span class="muted tiny">Visual mode</span>
          <strong>${player.SR < 100 ? "Active" : "Unlocked earlier"}</strong>
          <p class="muted tiny">Kindergarten players get picture-based counting with no reading required.</p>
        </div>
        <div class="mini-card">
          <span class="muted tiny">Word problems</span>
          <strong>${player.SR >= 100 ? "Active" : "Coming next"}</strong>
          <p class="muted tiny">Bake stages add short story math once players move past visual mode.</p>
        </div>
        <div class="mini-card">
          <span class="muted tiny">Economy math</span>
          <strong>${player.SR >= 300 ? "Active" : "Unlocks at 300"}</strong>
          <p class="muted tiny">Profit, pantry planning, and ingredient costs join the game in simulator mode.</p>
        </div>
      </div>
    </section>
  `;
}
