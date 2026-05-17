import { getAllowedQuestionTypes, getAccuracy, getSRMode, getSRWindow, isBridgeMode, isVisualMode } from "../../game/sr.js?v=20260517-124800";
import { renderMascot } from "../components/mascot.js?v=20260517-124800";
import { renderPlayerAvatar } from "../components/player-avatar.js?v=20260517-124800";

const QUESTION_LABELS = {
  arithmetic_visual: "Picture counting",
  arithmetic: "Story math",
  cost: "Cost and coin math",
  business: "Profit thinking",
  fraction: "Fraction toppings",
  ratio: "Recipe ratios",
  algebraic: "Mystery jar algebra",
  optimization: "Best deal strategy",
};

export function renderLearnScreen(player) {
  const window = getSRWindow(player.SR);
  const allowedTypes = getAllowedQuestionTypes(player.SR);
  const nextUnlocks = getUpcomingUnlocks(player.SR);
  const recentResults = Array.isArray(player.skill.recentResults) ? player.skill.recentResults.slice(-8) : [];

  return `
    <section class="panel flow-screen utility-screen learn-screen">
      <div class="flow-header utility-header">
        <p class="eyebrow eyebrow-pill">Coach Room</p>
        <h2>Math Lab</h2>
        <p class="muted">Peek behind the bakery curtain to see which kinds of math your next orders are practicing, and what unlocks later in the bakery journey.</p>
      </div>

      ${renderMascot({
        mood: "happy",
        compact: true,
        message: isVisualMode(player.SR)
          ? "You're still in picture-first mode, so every challenge stays concrete and countable."
          : `Right now your bakery is in ${getSRMode(player.SR)}. The lab keeps questions close to your current challenge zone.`,
      })}

      <section class="utility-save-card utility-baker-card">
        <div class="utility-baker-row">
          ${renderPlayerAvatar(player.avatarId, { size: "md", className: "utility-baker-avatar", label: `${player.username}'s baker portrait` })}
          <div>
            <p class="eyebrow">Current Baker</p>
            <h3>${escapeHtml(player.username)}</h3>
            <p class="muted tiny">This baker card travels with the notebook through every bakery room.</p>
          </div>
        </div>
      </section>

      <section class="utility-save-card learn-overview-card">
        <div class="utility-save-head">
          <div>
            <p class="eyebrow">Coaching Board</p>
            <h3>How your bakery math is tuned</h3>
            <p class="muted">These cards show the challenge lane, score window, and how steadily the bakery is growing.</p>
          </div>
          <div class="badge">${getBandLabel(player.SR)}</div>
        </div>

        <div class="recipe-grid utility-summary-grid learn-summary-grid">
          <article class="mini-card utility-mini-card learn-summary-card">
            <span class="muted tiny">Current mode</span>
            <strong>${getSRMode(player.SR)}</strong>
            <p class="muted tiny">${isBridgeMode(player.SR) ? "Bridge learners still get extra visual support before full Story Math begins." : "Your question mix shifts as SR rises through the bakery world."}</p>
          </article>
          <article class="mini-card utility-mini-card learn-summary-card">
            <span class="muted tiny">Target window</span>
            <strong>${window.min}–${window.max}</strong>
            <p class="muted tiny">Most generated questions stay close to this SR band so challenge feels steady, not jumpy.</p>
          </article>
          <article class="mini-card utility-mini-card learn-summary-card">
            <span class="muted tiny">Accuracy</span>
            <strong>${getAccuracy(player)}%</strong>
            <p class="muted tiny">${player.skill.correctAnswered} correct out of ${player.skill.totalAnswered} attempts so far.</p>
          </article>
          <article class="mini-card utility-mini-card learn-summary-card">
            <span class="muted tiny">Best streak</span>
            <strong>${player.skill.bestStreak}</strong>
            <p class="muted tiny">Current streak: ${player.skill.currentStreak}. Last SR change: ${player.skill.lastDelta >= 0 ? "+" : ""}${player.skill.lastDelta}.</p>
          </article>
        </div>

        <div class="learn-results-strip" aria-label="Recent results">
          <span class="learn-results-label">Recent bake answers</span>
          <div class="learn-results-row">
            ${
              recentResults.length
                ? recentResults
                    .map(
                      (result, index) =>
                        `<span class="learn-result-dot ${result ? "correct" : "wrong"}" title="Result ${index + 1}: ${result ? "correct" : "wrong"}"></span>`,
                    )
                    .join("")
                : '<span class="muted tiny">No answer history yet. Start baking to fill the coach board.</span>'
            }
          </div>
        </div>
      </section>

      <section class="utility-save-card learn-roadmap-card">
        <div class="utility-save-head">
          <div>
            <p class="eyebrow">Bakery Journey</p>
            <h3>Where your SR can lead next</h3>
          </div>
          <div class="badge">SR ${player.SR}</div>
        </div>
        <div class="learn-roadmap-grid">
          ${renderModeStep("Visual Arithmetic", "SR 0-79", player.SR < 80, player.SR >= 80, "Picture counting and concrete trays.")}
          ${renderModeStep("Visual Bridge", "SR 80-109", player.SR >= 80 && player.SR < 110, player.SR >= 110, "Still visual, with a gentler path toward reading prompts.")}
          ${renderModeStep("Story Math", "SR 110-299", player.SR >= 110 && player.SR < 300, player.SR >= 300, "Bakery action stories, coin totals, and tray moves.")}
          ${renderModeStep("Pantry Math", "SR 300-499", player.SR >= 300 && player.SR < 500, player.SR >= 500, "Ingredients, pantry checks, and more bakery business.")}
          ${renderModeStep("Full Simulator", "SR 500-699", player.SR >= 500 && player.SR < 700, player.SR >= 700, "Bigger bake loops with richer bakery systems.")}
          ${renderModeStep("Strategy Mode", "SR 700+", player.SR >= 700, false, "Ratios, better deals, and long-range bakery planning.")}
        </div>
      </section>

      <section class="utility-save-card learn-ladder-card">
        <div class="utility-save-head">
          <div>
            <p class="eyebrow">Question Families</p>
            <h3>What can appear on the next order?</h3>
          </div>
          <div class="badge">${allowedTypes.length} family${allowedTypes.length === 1 ? "" : "ies"} active</div>
        </div>
        <div class="utility-links-grid learn-links-grid">
          ${allowedTypes
            .map(
              (type, index) => `
                <article class="utility-link-card learn-type-card learn-type-card-${index % 4}">
                  <p class="eyebrow">Active Now</p>
                  <h3>${escapeHtml(QUESTION_LABELS[type] ?? type)}</h3>
                  <p class="muted">${escapeHtml(getTypeDescription(type, player.SR))}</p>
                </article>
              `,
            )
            .join("")}
        </div>
      </section>

      <section class="utility-save-card learn-next-card">
        <div class="utility-save-head">
          <div>
            <p class="eyebrow">Coming Soon</p>
            <h3>What unlocks later?</h3>
          </div>
          <div class="badge">${nextUnlocks.length ? `${nextUnlocks.length} next goals` : "Everything unlocked"}</div>
        </div>
        ${
          nextUnlocks.length
            ? `
              <div class="utility-links-grid learn-links-grid">
                ${nextUnlocks
                  .map(
                    (unlock) => `
                      <article class="utility-link-card learn-upcoming-card">
                        <p class="eyebrow">SR ${unlock.sr}</p>
                        <h3>${escapeHtml(unlock.title)}</h3>
                        <p class="muted">${escapeHtml(unlock.note)}</p>
                      </article>
                    `,
                  )
                  .join("")}
              </div>
            `
            : `
              <div class="empty-state utility-empty-card learn-empty-card">
                <h3>Every current math family is open</h3>
                <p class="muted">You have reached the end of the current bakery roadmap, so the lab will keep mixing from the full advanced menu.</p>
              </div>
            `
        }
      </section>

      <div class="flow-actions settings-actions">
        <button class="secondary-button" type="button" data-go-route="recipe">Back To Bake Menu</button>
        <button class="ghost-button" type="button" data-go-route="settings">Back To Settings</button>
      </div>
    </section>
  `;
}

function renderModeStep(title, range, isActive, isDone, note) {
  return `
    <article class="learn-roadmap-step ${isActive ? "active" : ""} ${isDone ? "done" : ""}">
      <span class="learn-roadmap-range">${range}</span>
      <h3>${title}</h3>
      <p class="muted tiny">${note}</p>
    </article>
  `;
}

function getTypeDescription(type, sr) {
  if (type === "arithmetic_visual") {
    return "Count, compare, and tap the matching answer with strong picture support.";
  }

  if (type === "arithmetic") {
    return sr < 220
      ? "Simple bakery stories with totals, leftovers, and next-step counts."
      : "Multi-step bakery actions still grounded in trays, bowls, and orders.";
  }

  if (type === "cost") {
    return "Use coins, ingredient bags, and tray prices to reason about totals.";
  }

  if (type === "business") {
    return "Think about earnings, costs, and what the bakery keeps as profit.";
  }

  if (type === "fraction") {
    return "Split toppings and trays into fair parts like halves and quarters.";
  }

  if (type === "ratio") {
    return "Scale recipe parts while keeping the flour-to-sugar balance steady.";
  }

  if (type === "algebraic") {
    return "Solve mystery jar problems by undoing extra bakery pieces first.";
  }

  if (type === "optimization") {
    return "Compare bakery deals to choose the best value for customers.";
  }

  return "Adaptive bakery math tuned near the player's current SR.";
}

function getUpcomingUnlocks(sr) {
  return [
    {
      sr: 110,
      title: "Story Math opens",
      note: "Bakery action prompts and coin jobs begin once SR reaches 110.",
    },
    {
      sr: 300,
      title: "Pantry Math joins in",
      note: "Business and fraction questions join the mix, and pantry systems matter more.",
    },
    {
      sr: 700,
      title: "Strategy ratios unlock",
      note: "Recipe ratios and long-range planning arrive in Strategy Mode.",
    },
    {
      sr: 800,
      title: "Mystery jar algebra",
      note: "Algebraic bakery puzzles appear with unknown amounts to solve.",
    },
    {
      sr: 900,
      title: "Best-deal strategy",
      note: "Optimization questions ask which bakery deal gives the smartest value.",
    },
  ]
    .filter((entry) => sr < entry.sr)
    .slice(0, 3);
}

function getBandLabel(sr) {
  if (sr < 80) return "Kindergarten band";
  if (sr < 110) return "Bridge band";
  if (sr < 300) return "Story Math band";
  if (sr < 500) return "Pantry Math band";
  if (sr < 700) return "Full Simulator band";
  return "Strategy band";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
