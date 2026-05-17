import { MAX_SPRINKLES, QUESTIONS_PER_BAKE, STAGE_META } from "../../game/data.js?v=20260517-161200";
import { renderCoinIcon } from "../components/icons.js?v=20260517-161200";
import { renderCelebrationBurst, renderMascot } from "../components/mascot.js?v=20260517-161200";
import { renderPlayerAvatar } from "../components/player-avatar.js?v=20260517-161200";
import { renderStageArt } from "../components/stage-art.js?v=20260517-161200";

export function renderKindergartenBakery({ player, session, currentStage, selectedRecipe }) {
  return `
    <section class="kinder-layout">
      <section class="panel kinder-hero-panel">
        <div class="kinder-compact-hud">
          <div class="kinder-baker-row">
            ${renderPlayerAvatar(player.avatarId, { size: "sm", className: "kinder-baker-avatar", label: `${player.username}'s baker portrait` })}
            <strong>${escapeHtml(player.username)}</strong>
          </div>
          <span>✨ ${player.sprinkles >= MAX_SPRINKLES ? "100/100" : `${player.sprinkles}/${MAX_SPRINKLES}`}</span>
          <span>🔥 Streak ${player.skill.currentStreak}</span>
          <span>SR ${player.SR}</span>
        </div>
        <div class="kinder-stage-focus">
          <span class="kinder-stage-focus-art">
            ${renderStageArt(currentStage, { className: "stage-art-image-kinder-focus", altLabel: `${STAGE_META[currentStage].title} stage art` })}
          </span>
          <div class="kinder-stage-focus-copy">
            <strong>Recipe: ${escapeHtml(selectedRecipe?.name ?? "Cupcakes")} ${selectedRecipe?.icon ?? "🧁"}</strong>
            <span>Step: ${escapeHtml(STAGE_META[currentStage].title)}</span>
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
        ${renderBakeSaleReceipt(saleReady)}
        <button class="primary-button kinder-start-button" data-sell-order type="button">
          Serve & Sell — ${renderCoinIcon("coin-icon-sm")} ${saleReady.revenue}
        </button>
      </div>
    </section>
  `;
}

function renderKindergartenQuestion({ session, currentStage }) {
  const question = session.currentQuestion;
  const activeQuestionNumber = Math.min((question.orderQuestionIndex ?? 0) + 1, question.questionsPerBake ?? QUESTIONS_PER_BAKE);
  const promptLabel =
    question.subtype === "compare_groups"
      ? "How many more?"
      : question.subtype === "take_away"
        ? "How many are left?"
        : "Count them all";

  return `
    <section class="panel kinder-question-panel stage-panel stage-${currentStage}">
      <div class="kinder-head">
        <div>
          <p class="eyebrow">Math Time · Question ${activeQuestionNumber}/${question.questionsPerBake ?? QUESTIONS_PER_BAKE}</p>
          <h2>${promptLabel}</h2>
          <p class="kinder-question-prompt">${escapeHtml(question.prompt ?? "")}</p>
        </div>
      </div>
      ${renderKinderVisuals(question.visuals, question.subtype)}
      <div class="kinder-equation-row">
        ${question.promptSecondary ? `<div class="kinder-equation-bubble">${escapeHtml(formatKinderEquation(question.promptSecondary))}</div>` : ""}
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
        <h2>Ready for bakery math?</h2>
        <p class="muted">Press <strong>Start Order</strong> to begin a new bakery problem.</p>
      </div>
    </section>
  `;
}

function formatKinderEquation(value) {
  const equation = String(value ?? "").trim();

  if (!equation) {
    return "";
  }

  if (equation.includes("=")) {
    return equation;
  }

  return `${equation} =`;
}

function renderKinderVisuals(visuals, subtype = "") {
  if (!visuals || !Array.isArray(visuals.left) || !Array.isArray(visuals.right)) {
    return "";
  }

  const useContrastTray = subtype === "compare_groups" || subtype === "take_away";

  return `
    <div class="kinder-tray-grid">
      <div class="kinder-tray tray-soft">
        <div class="kinder-tray-label">${escapeHtml(visuals.leftLabel ?? "First tray")}</div>
        ${visuals.left.map((token) => `<span class="kinder-token">${escapeHtml(token)}</span>`).join("")}
      </div>
      <div class="kinder-tray tray-soft ${useContrastTray ? "tray-contrast" : ""}">
        <div class="kinder-tray-label">${escapeHtml(visuals.rightLabel ?? "Second tray")}</div>
        ${visuals.right.map((token) => `<span class="kinder-token">${escapeHtml(token)}</span>`).join("")}
      </div>
    </div>
  `;
}

function renderBakeSaleReceipt(saleReady) {
  const imperfectBake = saleReady.itemsMade < saleReady.totalPossibleItems;
  const singularLabel = getRecipeSingularLabel(saleReady.recipeName);

  return `
    <div class="receipt-card bake-sale-receipt">
      <strong class="bake-sale-receipt-title">${saleReady.recipeIcon} Fresh ${escapeHtml(saleReady.recipeName)}</strong>
      <div class="bake-sale-receipt-lines">
        <div class="bake-sale-receipt-line">
          <span>Baked:</span>
          <span>${saleReady.itemsMade} of ${saleReady.totalPossibleItems} ${escapeHtml(saleReady.recipeName.toLowerCase())}</span>
        </div>
        <div class="bake-sale-receipt-line">
          <span>Price:</span>
          <span>${renderCoinIcon("coin-icon-sm")} ${saleReady.pricePerItem} per ${escapeHtml(singularLabel)}</span>
        </div>
        <div class="bake-sale-receipt-line">
          <span>Subtotal:</span>
          <span>${renderCoinIcon("coin-icon-sm")} ${saleReady.saleRevenue}</span>
        </div>
        ${
          saleReady.streakBonus > 0
            ? `
              <div class="bake-sale-receipt-line">
                <span>Streak bonus:</span>
                <span>${renderCoinIcon("coin-icon-sm")} ${saleReady.streakBonus}</span>
              </div>
            `
            : ""
        }
        <div class="bake-sale-receipt-rule" aria-hidden="true"></div>
        <div class="bake-sale-receipt-line bake-sale-receipt-total">
          <span>Total:</span>
          <span>${renderCoinIcon("coin-icon-sm")} ${saleReady.revenue}</span>
        </div>
      </div>
      <p class="bake-sale-sprinkles">✨ ${saleReady.sprinklesEarned} sprinkles earned</p>
      <p class="${imperfectBake ? "bake-sale-note bake-sale-note-warning" : "bake-sale-note bake-sale-note-success"}">
        ${
          imperfectBake
            ? "Some treats didn't make it — more right answers next time means a fuller tray."
            : "⭐ Perfect bake! Every treat made it to the counter."
        }
      </p>
    </div>
  `;
}

function getRecipeSingularLabel(recipeName) {
  const singularMap = {
    Cupcakes: "cupcake",
    Cookies: "cookie",
    Donuts: "donut",
    Muffins: "muffin",
    Brownies: "brownie",
    "Sugar Cookies": "sugar cookie",
    Cake: "cake",
    "Cinnamon Rolls": "cinnamon roll",
    Macarons: "macaron",
    "Ice Cream Sandwiches": "ice cream sandwich",
    "Cheesecake Slices": "cheesecake slice",
    Pies: "pie",
  };

  return singularMap[recipeName] ?? recipeName.toLowerCase();
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
