import { getAllowedQuestionTypes, getAccuracy, getSRMode, getSRWindow, isBridgeMode, isVisualMode } from "../../game/sr.js?v=20260510-024900";
import { renderMascot } from "../components/mascot.js?v=20260510-024900";

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

  return `
    <section class="panel flow-screen utility-screen learn-screen">
      <div class="flow-header utility-header">
        <p class="eyebrow eyebrow-pill">Coach Room</p>
        <h2>Math Lab</h2>
        <p class="muted">Peek behind the bakery curtain to see which kinds of math your next orders are practicing.</p>
      </div>

      ${renderMascot({
        mood: "happy",
        compact: true,
        message: isVisualMode(player.SR)
          ? "You're still in picture-first mode, so every challenge stays concrete and countable."
          : `Right now your bakery is in ${getSRMode(player.SR)}. The lab keeps questions close to your current challenge zone.`,
      })}

      <div class="recipe-grid utility-summary-grid learn-summary-grid">
        <article class="mini-card utility-mini-card">
          <span class="muted tiny">Current mode</span>
          <strong>${getSRMode(player.SR)}</strong>
          <p class="muted tiny">${isBridgeMode(player.SR) ? "Bridge learners still get extra visual support before full Story Math begins." : "Your question mix shifts as SR rises through the bakery world."}</p>
        </article>
        <article class="mini-card utility-mini-card">
          <span class="muted tiny">Target window</span>
          <strong>${window.min}–${window.max}</strong>
          <p class="muted tiny">Most generated questions stay close to this SR band so challenge feels steady, not jumpy.</p>
        </article>
        <article class="mini-card utility-mini-card">
          <span class="muted tiny">Accuracy</span>
          <strong>${getAccuracy(player)}%</strong>
          <p class="muted tiny">${player.skill.correctAnswered} correct out of ${player.skill.totalAnswered} attempts so far.</p>
        </article>
        <article class="mini-card utility-mini-card">
          <span class="muted tiny">Best streak</span>
          <strong>${player.skill.bestStreak}</strong>
          <p class="muted tiny">Current streak: ${player.skill.currentStreak}. Last SR change: ${player.skill.lastDelta >= 0 ? "+" : ""}${player.skill.lastDelta}.</p>
        </article>
      </div>

      <section class="utility-save-card learn-ladder-card">
        <div class="utility-save-head">
          <div>
            <p class="eyebrow">Question Families</p>
            <h3>What can appear next?</h3>
          </div>
          <div class="badge">${allowedTypes.length} family${allowedTypes.length === 1 ? "" : "ies"} active</div>
        </div>
        <div class="utility-links-grid learn-links-grid">
          ${allowedTypes
            .map(
              (type) => `
                <article class="utility-link-card learn-type-card">
                  <p class="eyebrow">Active Now</p>
                  <h3>${escapeHtml(QUESTION_LABELS[type] ?? type)}</h3>
                  <p class="muted">${escapeHtml(getTypeDescription(type, player.SR))}</p>
                </article>
              `,
            )
            .join("")}
        </div>
      </section>

      <div class="flow-actions settings-actions">
        <button class="secondary-button" type="button" data-go-route="recipe">Back to Bake Menu</button>
        <button class="ghost-button" type="button" data-go-route="settings">Back to Settings</button>
      </div>
    </section>
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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
