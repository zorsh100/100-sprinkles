import { STAGE_META } from "../../game/data.js?v=20260509-205459";

export function renderKindergartenBakery({ player, session, currentStage, selectedRecipe }) {
  return `
    <section class="kinder-layout">
      <section class="panel kinder-hero-panel">
        <div class="section-head">
          <div>
            <p class="eyebrow">Kindergarten renderer</p>
            <h2>Count the treats</h2>
            <p class="muted">Tap the number that matches the treats you see.</p>
          </div>
          <div class="badge">Picture mode</div>
        </div>
        <div class="kinder-summary">
          <div class="kinder-summary-card">
            <span class="muted tiny">Baker</span>
            <strong>${escapeHtml(player.username)}</strong>
          </div>
          <div class="kinder-summary-card">
            <span class="muted tiny">Sprinkles</span>
            <strong>${player.sprinkles}</strong>
          </div>
          <div class="kinder-summary-card">
            <span class="muted tiny">Streak</span>
            <strong>${player.skill.currentStreak}</strong>
          </div>
        </div>
        <div class="kinder-stage-banner">
          <span>${STAGE_META[currentStage].icon}</span>
          <span>${selectedRecipe?.icon ?? "🧁"} ${escapeHtml(selectedRecipe?.name ?? "Cupcakes")}</span>
        </div>
      </section>

      ${
        session.saleReady
          ? renderKindergartenSale(session.saleReady)
          : session.currentQuestion
            ? renderKindergartenQuestion({ session, currentStage })
            : renderKindergartenStart()
      }

      <section class="panel kinder-progress-panel">
        <div class="section-head">
          <div>
            <p class="eyebrow">Sweet progress</p>
            <h2>Bakery Path</h2>
            <p class="muted">Each right answer fills the sprinkle trail.</p>
          </div>
          <div class="badge">SR ${player.SR}</div>
        </div>
        <div class="kinder-stage-track">
          ${renderKindergartenStageTrack(session, currentStage)}
        </div>
      </section>
    </section>
  `;
}

function renderKindergartenSale(saleReady) {
  return `
    <section class="panel kinder-question-panel">
      <div class="empty-state kinder-empty">
        <div class="kinder-empty-art">${saleReady.recipeIcon} 🎉</div>
        <h2>All baked!</h2>
        <p class="muted">Tap the big button to serve your treats.</p>
        <button class="primary-button kinder-start-button" data-sell-order type="button">
          Serve for ${saleReady.revenue} coins
        </button>
      </div>
    </section>
  `;
}

function renderKindergartenQuestion({ session, currentStage }) {
  const question = session.currentQuestion;
  const promptLabel = question.subtype === "compare_groups" ? "How many more?" : "Count them all";

  return `
    <section class="panel kinder-question-panel stage-panel stage-${currentStage}">
      <div class="section-head kinder-head">
        <div>
          <p class="eyebrow">Math time</p>
          <h2>${promptLabel}</h2>
        </div>
        <div class="stage-banner">${STAGE_META[currentStage].icon} ${currentStage}</div>
      </div>
      <div class="kinder-equation-row">
        ${question.promptSecondary ? `<div class="kinder-equation-bubble">${escapeHtml(question.promptSecondary)}</div>` : ""}
      </div>
      <div class="kinder-tray-grid">
        <div class="kinder-tray">
          ${question.visuals.left.map((token) => `<div class="kinder-token">${token}</div>`).join("")}
        </div>
        <div class="kinder-tray tray-soft">
          ${question.visuals.right.map((token) => `<div class="kinder-token">${token}</div>`).join("")}
        </div>
      </div>
      <div class="kinder-answer-grid">
        ${question.choices
          .map((choice) => {
            const resultClass = getChoiceClass(session.questionResult, choice, question.answer);
            return `
              <button class="choice-button kinder-choice-button ${resultClass}" type="button" data-answer="${choice}">
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
        <h2>Ready to count?</h2>
        <p class="muted">Press <strong>Start Order</strong> to begin the treat game.</p>
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
          <div class="kinder-stage-icon">${STAGE_META[stage].icon}</div>
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

  if (result.correct && Number(choice) === Number(result.selectedAnswer)) {
    return "correct";
  }

  if (Number(choice) === Number(result.selectedAnswer) && !result.correct) {
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
