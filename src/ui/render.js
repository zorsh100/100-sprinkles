import { navigate } from "../app/router.js";
import {
  buyIngredient,
  clearQuestionResult,
  selectRecipe,
  sellCurrentOrder,
  setBatchCount,
  startOrder,
  submitAnswer,
} from "../game/engine.js";
import { getSaveSummary } from "../state.js";
import { renderShell } from "./shell.js";
import { renderBakeryScreen } from "./screens/bakery.js";
import { renderOnboardingScreen } from "./screens/onboarding.js";
import { renderStatsScreen } from "./screens/stats.js";
import { renderTitleScreen } from "./screens/title.js";

export function renderApp(root, gameState, uiState, dispatch) {
  const saveSummary = getSaveSummary(gameState);

  if (uiState.route === "title") {
    root.innerHTML = renderShell({
      player: gameState.player,
      route: "title",
      flash: gameState.flash,
      saveSummary,
      screenMarkup: renderTitleScreen(saveSummary),
    });
    attachTitleEvents(root, dispatch);
    return;
  }

  if (uiState.route === "profile" || !gameState.player) {
    root.innerHTML = renderShell({
      player: null,
      route: "profile",
      flash: gameState.flash,
      saveSummary,
      screenMarkup: renderOnboardingScreen(),
    });
    attachOnboardingEvents(root, dispatch);
    return;
  }

  root.innerHTML = renderShell({
    player: gameState.player,
    route: uiState.route,
    flash: gameState.flash,
    saveSummary,
    screenMarkup: getScreenMarkup(gameState, uiState.route),
  });

  attachTitleEvents(root, dispatch);
  attachRecipeEvents(root, gameState, dispatch);
  attachShopEvents(root, gameState, dispatch);
  attachQuestionEvents(root, gameState, dispatch);
}

function getScreenMarkup(gameState, route) {
  if (route === "stats") {
    return renderStatsScreen(gameState);
  }

  return renderBakeryScreen(gameState);
}

function attachTitleEvents(root, dispatch) {
  root.querySelectorAll("[data-go-profile]").forEach((button) => {
    button.addEventListener("click", () => {
      dispatch({ type: "NAVIGATE", payload: navigate("profile") });
    });
  });

  root.querySelectorAll("[data-go-recipe]").forEach((button) => {
    button.addEventListener("click", () => {
      dispatch({ type: "NAVIGATE", payload: navigate("recipe") });
    });
  });
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
    dispatch({ type: "NAVIGATE", payload: navigate("recipe") });
  });
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
      dispatch({ type: "NAVIGATE", payload: navigate("bake") });
    });
  }

  root.querySelectorAll("[data-sell-order]").forEach((sellButton) => {
    sellButton.addEventListener("click", () => {
      const updated = sellCurrentOrder(gameState);
      dispatch({ type: "UPDATE_GAME", payload: updated });
      dispatch({ type: "NAVIGATE", payload: navigate("stats") });
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
