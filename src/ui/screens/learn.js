import { getAllowedQuestionTypes, getAccuracy, getSRMode, getSRWindow, isBridgeMode, isVisualMode } from "../../game/sr.js?v=20260509-233000";

export function renderLearnScreen(player) {
  const window = getSRWindow(player.SR);
  const allowedTypes = getAllowedQuestionTypes(player.SR);

  return `
    <section class="panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">SR engine</p>
          <h2>Math Lab</h2>
          <p class="muted">The question generator keeps challenges near the current Skill Rating.</p>
        </div>
        <div class="badge">Target ${window.min} to ${window.max}</div>
      </div>
      <div class="recipe-grid">
        <div class="mini-card">
          <span class="muted tiny">Current mode</span>
          <strong>${getSRMode(player.SR)}</strong>
          <p class="muted tiny">The SR engine now keeps kids in visual math through SR 109, with a gentler bridge into 1st grade.</p>
        </div>
        <div class="mini-card">
          <span class="muted tiny">Accuracy</span>
          <strong>${getAccuracy(player)}%</strong>
          <p class="muted tiny">${player.skill.correctAnswered} correct out of ${player.skill.totalAnswered} attempts.</p>
        </div>
        <div class="mini-card">
          <span class="muted tiny">Best streak</span>
          <strong>${player.skill.bestStreak}</strong>
          <p class="muted tiny">Current streak: ${player.skill.currentStreak}. Last SR change: ${player.skill.lastDelta >= 0 ? "+" : ""}${player.skill.lastDelta}.</p>
        </div>
        <div class="mini-card">
          <span class="muted tiny">Question types</span>
          <strong>${allowedTypes.length}</strong>
          <p class="muted tiny">${allowedTypes.join(", ")}${isBridgeMode(player.SR) ? " • bridge zone" : isVisualMode(player.SR) ? " • visual zone" : ""}</p>
        </div>
      </div>
    </section>
  `;
}
