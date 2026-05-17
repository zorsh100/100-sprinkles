import { MAX_SPRINKLES, STAGE_META } from "../../game/data.js?v=20260516-212800";
import { renderCelebrationBurst, renderMascot } from "../components/mascot.js?v=20260516-212800";
import { renderPlayerAvatar } from "../components/player-avatar.js?v=20260516-212800";
import { renderStageArt } from "../components/stage-art.js?v=20260516-212800";

export function renderKindergartenBakery({ player, session, currentStage, selectedRecipe }) {
  return `
    <section class="kinder-layout">
      <section class="panel kinder-hero-panel">
        <div class="section-head">
          <div>
            <p class="eyebrow">Start Bake</p>
            <h2>Bakery Math</h2>
            <p class="muted">Kindergarten path. Read the bakery problem and tap the number that solves it.</p>
          </div>
          <div class="badge">Early Math</div>
        </div>
        <div class="kinder-summary kinder-hud-strip">
          <div class="kinder-summary-card kinder-summary-baker">
            <span class="muted tiny">Baker</span>
            <div class="kinder-baker-row">
              ${renderPlayerAvatar(player.avatarId, { size: "sm", className: "kinder-baker-avatar", label: `${player.username}'s baker portrait` })}
              <strong>${escapeHtml(player.username)}</strong>
            </div>
          </div>
          <div class="kinder-summary-card kinder-summary-sprinkles">
            <span class="muted tiny">Sprinkles</span>
            <strong>${player.sprinkles >= MAX_SPRINKLES ? "Expert Baker" : `${player.sprinkles}/${MAX_SPRINKLES}`}</strong>
          </div>
          <div class="kinder-summary-card kinder-summary-streak">
            <span class="muted tiny">Streak</span>
            <strong>${player.skill.currentStreak}</strong>
          </div>
        </div>
        <div class="kinder-stage-banner-row">
          <div class="kinder-stage-banner">
            <span class="kinder-stage-banner-art">
              ${renderStageArt(currentStage, { className: "stage-art-image-banner", altLabel: `${STAGE_META[currentStage].title} stage art` })}
            </span>
            <span>${selectedRecipe?.icon ?? "🧁"} ${escapeHtml(selectedRecipe?.name ?? "Cupcakes")}</span>
          </div>
          <div class="badge">SR ${player.SR}</div>
        </div>
        <div class="kinder-path-block">
          <p class="muted tiny">Bakery Path</p>
          <div class="kinder-stage-track">
            ${renderKindergartenStageTrack(session, currentStage)}
          </div>
        </div>
      </section>

      ${
        session.saleReady
          ? renderKindergartenSale(session.saleReady)
          : session.currentQuestion
            ? renderKindergartenQuestion({ session, currentStage })
            : renderKindergartenStart()
      }
    </section>
  `;
}

function renderKindergartenSale(saleReady) {
  return `
    <section class="panel kinder-question-panel celebration-panel kinder-celebration-panel">
      ${renderCelebrationBurst({ icon: saleReady.recipeIcon, label: 'Treats Ready!' })}
      <div class="empty-state kinder-empty">
        <div class="kinder-empty-art">${saleReady.recipeIcon} 🎉</div>
        <h2>All baked!</h2>
        <p class="muted">Tap the big button to serve your treats.</p>
        ${renderMascot({ mood: 'celebrate', compact: true, message: `Hooray! These treats are ready to earn ${saleReady.revenue} coins at ${saleReady.accuracyPercent ?? 100}% accuracy.` })}
        <p class="muted tiny">Accuracy bonus: ${saleReady.revenue} of ${saleReady.baseRevenue ?? saleReady.revenue} coins</p>
        <button class="primary-button kinder-start-button" data-sell-order type="button">
          Serve for ${saleReady.revenue} coins
        </button>
      </div>
    </section>
  `;
}

function renderKindergartenQuestion({ session, currentStage }) {
  const question = session.currentQuestion;
  const promptLabel =
    question.subtype === "compare_groups"
      ? "How many more?"
      : question.subtype === "take_away"
        ? "How many are left?"
        : "Count them all";

  return `
    <section class="panel kinder-question-panel stage-panel stage-${currentStage}">
      <div class="section-head kinder-head">
        <div>
          <p class="eyebrow">Math time</p>
          <h2>${promptLabel}</h2>
          <p class="muted kinder-question-prompt">${escapeHtml(question.prompt ?? "")}</p>
        </div>
      </div>
      <div class="kinder-equation-row">
        ${question.promptSecondary ? `<div class="kinder-equation-bubble">${escapeHtml(question.promptSecondary)}</div>` : ""}
      </div>
      <div class="kinder-answer-grid colorful-answer-grid">
        ${question.choices
          .map((choice, index) => {
            const resultClass = getChoiceClass(session.questionResult, choice, question.answer);
            return `
              <button class="choice-button kinder-choice-button answer-color-${index % 4} ${resultClass}" type="button" data-answer="${choice}">
                <span class="kinder-choice-number">${choice}</span>
              </button>
            `;
          })
          .join("")}
      </div>
    </section>
  `;
}

function renderKindergartenStart() {
  return `
    <section class="panel kinder-question-panel">
      <div class="empty-state kinder-empty">
        <div class="kinder-empty-art">🧁 🍩 🍪</div>
        <h2>Ready for bakery math?</h2>
        <p class="muted">Press <strong>Start Order</strong> to begin a new bakery problem.</p>
      </div>
    </section>
  `;
}

function renderKindergartenStageTrack(session, currentStage) {
  const steps = ["prep", "mixing", "timing", "finishing", "serving"];

  return steps
    .map((stage) => {
      const done = session.saleReady || (session.order && session.order.completedStages.includes(stage));
      const active = !session.saleReady && session.order && stage === currentStage;
      const className = done ? "done" : active ? "active" : "";
      return `
        <div class="kinder-stage-stop ${className}">
          <div class="kinder-stage-icon">
            ${renderStageArt(stage, { className: "stage-art-image-track", altLabel: `${STAGE_META[stage].title} stage icon` })}
            ${done ? '<span class="stage-chip-check">✓</span>' : ""}
          </div>
          <div class="kinder-stage-label">${stage}</div>
        </div>
      `;
    })
    .join("");
}

function getChoiceClass(result, choice, answer) {
  if (!result) {
    return "";
  }

  if (String(choice) === String(result.selectedAnswer) && result.correct) {
    return "correct";
  }

  if (String(choice) === String(result.selectedAnswer) && !result.correct) {
    return "wrong";
  }

  return "";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
