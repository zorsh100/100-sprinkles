import { navigate } from "../app/router.js";
import { buyIngredient, clearQuestionResult, selectRecipe, sellCurrentOrder, setBatchCount, startOrder, submitAnswer } from "../game/engine.js";
import { getSaveSummary } from "../state.js";
import { renderShell } from "./shell.js";
import { renderBakeryScreen } from "./screens/bakery.js";
import { renderLearnScreen } from "./screens/learn.js";
import { renderOnboardingScreen } from "./screens/onboarding.js";
import { renderShopScreen } from "./screens/shop.js";

export function renderApp(root, gameState, uiState, dispatch) {
  if (uiState.route === "onboarding" || !gameState.player) {
    root.innerHTML = renderShell({
      player: null,
      route: "onboarding",
      flash: gameState.flash,
      saveSummary: null,
      screenMarkup: renderOnboardingScreen(),
    });
    attachOnboardingEvents(root, dispatch);
    return;
  }

  renderGame(root, gameState, uiState, dispatch);
}

function renderGame(root, gameState, uiState, dispatch) {
  const screenMarkup = getScreenMarkup(gameState, uiState.route);
  root.innerHTML = renderShell({
    player: gameState.player,
    route: uiState.route,
    flash: gameState.flash,
    saveSummary: getSaveSummary(gameState),
    screenMarkup,
  });

  root.querySelectorAll("[data-route]").forEach((button) => {
    button.addEventListener("click", () => {
      dispatch({ type: "NAVIGATE", payload: navigate(button.dataset.route) });
    });
  });

  attachRecipeEvents(root, gameState, dispatch);
  attachShopEvents(root, gameState, dispatch);
  attachQuestionEvents(root, gameState, dispatch);
}

function getScreenMarkup(gameState, route) {
  if (route === "shop") {
    return renderShopScreen(gameState.player);
  }

  if (route === "learn") {
    return renderLearnScreen(gameState.player);
  }

  return renderBakeryScreen(gameState);
}

function attachOnboardingEvents(root, dispatch) {
  const gradeInput = root.querySelector("#grade");
  const gradePreview = root.querySelector("#grade-preview");

  root.querySelectorAll("[data-grade]").forEach((button) => {
    button.addEventListener("click", () => {
      const { grade, sr, note } = button.dataset;
      gradeInput.value = grade;

      root.querySelectorAll("[data-grade]").forEach((card) => {
        card.classList.toggle("active", card === button);
      });

      gradePreview.textContent =
        grade === "K"
          ? `Kindergarten starts at SR ${sr} with ${note.toLowerCase()} and no reading required.`
          : `${button.querySelector("strong").textContent} starts at SR ${sr} with ${note.toLowerCase()}.`;
    });
  });

  root.querySelector("#onboarding-form").addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const username = String(formData.get("username") ?? "").trim();
    const grade = String(formData.get("grade") ?? "K");

    if (!username) {
      return;
    }

    dispatch({
      type: "START_GAME",
      payload: { username, grade },
    });
  });
}

function renderQuestionPanel(gameState, currentStage) {
  const { player, session } = gameState;
  const question = session.currentQuestion;

  if (!question) {
    return `
      <section class="panel question-card">
        <div class="section-head">
          <div>
            <p class="eyebrow">Math challenge</p>
            <h2>Ready to bake</h2>
            <p class="muted">Start an order to get your next adaptive question.</p>
          </div>
          <div class="stage-banner">🍬 SR ${player.SR}</div>
        </div>
        <div class="empty-state">
          Choose a recipe, then press <strong>Start Order</strong>.
        </div>
      </section>
    `;
  }

  const visuals = question.visuals
    ? `
      <div class="visual-group">
        ${question.visuals.left.map((token) => `<div class="visual-token">${token}</div>`).join("")}
      </div>
      <div class="visual-group">
        ${question.visuals.right.map((token) => `<div class="visual-token">${token}</div>`).join("")}
      </div>
    `
    : "";

  return `
    <section class="panel question-card stage-panel stage-${currentStage}">
      <div class="section-head">
        <div>
          <p class="eyebrow">Math challenge</p>
          <h2>${STAGE_META[currentStage].title}</h2>
          <p class="muted">${escapeHtml(question.prompt)}</p>
        </div>
        <div class="stage-banner">${STAGE_META[currentStage].icon} ${currentStage}</div>
      </div>
      ${question.promptSecondary ? `<p><strong>${escapeHtml(question.promptSecondary)}</strong></p>` : ""}
      ${visuals}
      <div class="answer-grid">
        ${question.choices
          .map((choice) => {
            const resultClass = getChoiceClass(session.questionResult, choice, question.answer);
            const label =
              question.type === "optimization" && choice === question.answer && question.answerLabel
                ? question.answerLabel
                : String(choice);

            return `
              <button class="choice-button ${resultClass}" type="button" data-answer="${choice}">
                ${escapeHtml(label)}
              </button>
            `;
          })
          .join("")}
      </div>
    </section>
  `;
}

function renderStagePanel(gameState, currentStage) {
  const { player, session } = gameState;
  const progress = session.order ? ((session.order.stageIndex + 1) / STAGES.length) * 100 : 0;

  return `
    <section class="panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">Bakery flow</p>
          <h2>Stage Tracker</h2>
          <p class="muted">${player.SR < 100 ? "Picture counting powers the whole tray." : "Each correct answer clears the next bakery stage."}</p>
        </div>
        <div class="badge">${Math.round(progress)}% complete</div>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${progress}%"></div>
      </div>
      <div class="stage-grid" style="margin-top: 16px;">
        ${STAGES.map((stage, index) => {
          const done = session.order && session.order.completedStages.includes(stage);
          const active = currentStage === stage && session.order;
          const className = done ? "done" : active ? "active" : "";

          return `
            <div class="stage-chip ${className}">
              <div>${STAGE_META[stage].icon}</div>
              <div>${stage}</div>
            </div>
          `;
        }).join("")}
      </div>
      <div class="panel" style="margin-top: 18px;">
        <div class="pill-row">
          <span class="pill">Flour ${player.pantry.flour}</span>
          <span class="pill">Sugar ${player.pantry.sugar}</span>
          <span class="pill">Eggs ${player.pantry.eggs}</span>
        </div>
      </div>
    </section>
  `;
}

function attachRecipeEvents(root, gameState, dispatch) {
  root.querySelectorAll("[data-recipe]").forEach((button) => {
    button.addEventListener("click", () => {
      const updated = selectRecipe(gameState, button.dataset.recipe);
      dispatch({ type: "UPDATE_GAME", payload: updated });
    });
  });

  const batchInput = root.querySelector("#batch-count");

  if (batchInput) {
    batchInput.addEventListener("change", () => {
      const updated = setBatchCount(gameState, batchInput.value);
      dispatch({ type: "UPDATE_GAME", payload: updated });
    });
  }

  const startButton = root.querySelector("#start-order");

  if (startButton) {
    startButton.addEventListener("click", () => {
      const updated = startOrder(gameState);
      dispatch({ type: "UPDATE_GAME", payload: updated });
    });
  }

  root.querySelectorAll("[data-sell-order]").forEach((sellButton) => {
    sellButton.addEventListener("click", () => {
      const updated = sellCurrentOrder(gameState);
      dispatch({ type: "UPDATE_GAME", payload: updated });
    });
  });
}

function attachShopEvents(root, gameState, dispatch) {
  root.querySelectorAll("[data-buy]").forEach((button) => {
    button.addEventListener("click", () => {
      const updated = buyIngredient(gameState, button.dataset.buy, button.dataset.buyAmount);
      dispatch({ type: "UPDATE_GAME", payload: updated });
    });
  });
}

function attachQuestionEvents(root, gameState, dispatch) {
  root.querySelectorAll("[data-answer]").forEach((button) => {
    button.addEventListener("click", () => {
      let updated = gameState;

      if (gameState.session.questionResult) {
        updated = clearQuestionResult(gameState);
      }

      updated = submitAnswer(updated, button.dataset.answer);
      dispatch({ type: "UPDATE_GAME", payload: updated });
    });
  });
}
