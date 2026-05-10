import { navigate } from "../app/router.js?v=20260510-024900";
import {
  buyIngredient,
  clearQuestionResult,
  dismissRecipeUnlocks,
  selectRecipe,
  sellCurrentOrder,
  setBatchCount,
  startOrder,
  submitAnswer,
} from "../game/engine.js?v=20260510-024900";
import { getSaveSummaries, getSaveSummary, isValidPlayerName } from "../state.js?v=20260510-024900";
import { renderShell } from "./shell.js?v=20260510-024900";
import { renderBakeryScreen } from "./screens/bakery.js?v=20260510-024900";
import { renderLearnScreen } from "./screens/learn.js?v=20260510-024900";
import { renderOnboardingScreen } from "./screens/onboarding.js?v=20260510-024900";
import { renderSettingsScreen } from "./screens/settings.js?v=20260510-024900";
import { renderShopScreen } from "./screens/shop.js?v=20260510-024900";
import { renderStatsScreen } from "./screens/stats.js?v=20260510-024900";
import { renderTitleScreen } from "./screens/title.js?v=20260510-024900";
import { renderUnlockScreen } from "./screens/unlock.js?v=20260510-024900";

export function renderApp(root, gameState, uiState, dispatch) {
  const saveSummary = getSaveSummary(gameState);
  const saveSummaries = getSaveSummaries(gameState);
  const pendingSaveSummary = saveSummaries.find((summary) => summary.slotId === uiState.pendingSaveSlotId) ?? saveSummaries[0] ?? null;
  document.body.classList.toggle("title-route", uiState.route === "title");

  if (uiState.route === "title") {
    root.innerHTML = renderShell({
      route: uiState.route,
      screenMarkup: renderTitleScreen(saveSummaries),
    });
    attachTitleEvents(root, dispatch);
    attachPageEvents(root, gameState, dispatch);
    return;
  }

  if (uiState.route === "profile" || (!gameState.player && uiState.route !== "settings")) {
    root.innerHTML = renderShell({
      route: uiState.route,
      screenMarkup: renderOnboardingScreen(pendingSaveSummary),
    });
    attachOnboardingEvents(root, gameState, uiState, dispatch);
    attachPageEvents(root, gameState, dispatch);
    return;
  }

  root.innerHTML = renderShell({
    route: uiState.route,
    screenMarkup: getScreenMarkup(gameState, uiState.route, saveSummary, saveSummaries),
  });

  attachTitleEvents(root, dispatch);
  attachRecipeEvents(root, gameState, dispatch);
  attachShopEvents(root, gameState, dispatch);
  attachQuestionEvents(root, gameState, dispatch);
  attachPageEvents(root, gameState, dispatch);
}

function getScreenMarkup(gameState, route, saveSummary, saveSummaries) {
  if (route === "stats") {
    return renderStatsScreen(gameState);
  }

  if (route === "settings") {
    return renderSettingsScreen(saveSummaries, saveSummary, gameState.player);
  }

  if (route === "shop") {
    return renderShopScreen(gameState.player);
  }

  if (route === "learn") {
    return renderLearnScreen(gameState.player);
  }

  if (route === "unlock") {
    return renderUnlockScreen(gameState);
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

function attachOnboardingEvents(root, gameState, uiState, dispatch) {
  const gradeInput = root.querySelector("#grade");
  const gradePreview = root.querySelector("#grade-preview");
  const gradePreviewCard = root.querySelector("#grade-preview-card");
  const usernameInput = root.querySelector("#username");
  const submitButton = root.querySelector("#start-baking");

  function updatePreview(button) {
    const { grade, sr, note } = button.dataset;
    gradePreview.textContent =
      grade === "K"
        ? `Kindergarten starts at SR ${sr} with ${note.toLowerCase()} and no reading required.`
        : `${button.querySelector("strong").textContent} starts at SR ${sr} with ${note.toLowerCase()}.`;
    gradePreviewCard.classList.add("preview-live");
  }

  function syncSubmitState() {
    const ready = isValidPlayerName(usernameInput.value) && Boolean(gradeInput.value);
    submitButton.disabled = !ready;
    submitButton.setAttribute("aria-disabled", String(!ready));
  }

  root.querySelectorAll("[data-grade]").forEach((button) => {
    button.addEventListener("click", () => {
      const { grade } = button.dataset;
      gradeInput.value = grade;

      root.querySelectorAll("[data-grade]").forEach((card) => {
        card.classList.toggle("active", card === button);
      });

      updatePreview(button);
      syncSubmitState();
    });
  });

  usernameInput.addEventListener("input", () => {
    syncSubmitState();
  });

  const activeGrade = root.querySelector("[data-grade].active");
  if (activeGrade) {
    updatePreview(activeGrade);
  }
  syncSubmitState();

  root.querySelector("#onboarding-form").addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const username = String(formData.get("username") ?? "").trim();
    const grade = String(formData.get("grade") ?? "K");

    if (!isValidPlayerName(username)) {
      syncSubmitState();
      return;
    }

    dispatch({
      type: "START_GAME",
      payload: {
        username,
        grade,
        slotId: uiState.pendingSaveSlotId ?? gameState.activeSaveSlot,
      },
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
    root.querySelectorAll("[data-batch-step]").forEach((button) => {
      button.addEventListener("click", () => {
        const nextValue = Number(batchInput.value || 1) + Number(button.dataset.batchStep || 0);
        const updated = setBatchCount(gameState, nextValue);
        dispatch({ type: "UPDATE_GAME", payload: updated });
      });
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

function attachPageEvents(root, gameState, dispatch) {
  root.querySelectorAll("[data-go-route]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.disabled) return;
      dispatch({ type: "NAVIGATE", payload: navigate(button.dataset.goRoute) });
    });
  });

  root.querySelectorAll("[data-go-recipe]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.disabled) return;
      dispatch({ type: "NAVIGATE", payload: navigate("recipe") });
    });
  });

  root.querySelectorAll("[data-go-settings]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.disabled) return;
      dispatch({ type: "NAVIGATE", payload: navigate("settings") });
    });
  });

  root.querySelectorAll("[data-open-save-slot]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.disabled) return;
      dispatch({ type: "SWITCH_SAVE", payload: button.dataset.openSaveSlot });
      dispatch({ type: "NAVIGATE", payload: navigate(button.dataset.goRoute || "recipe") });
    });
  });

  root.querySelectorAll("[data-new-player-slot]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.disabled) return;
      dispatch({ type: "SET_PENDING_SAVE_SLOT", payload: button.dataset.newPlayerSlot });
      dispatch({ type: "NAVIGATE", payload: navigate("profile") });
    });
  });

  root.querySelectorAll("[data-dismiss-unlocks]").forEach((button) => {
    button.addEventListener("click", () => {
      const updated = dismissRecipeUnlocks(gameState);
      dispatch({ type: "UPDATE_GAME", payload: updated });
      dispatch({ type: "NAVIGATE", payload: navigate(button.dataset.goRoute || "recipe") });
    });
  });

  root.querySelectorAll("[data-reset-save]").forEach((button) => {
    button.addEventListener("click", () => {
      dispatch({ type: "RESET_SAVE", payload: button.dataset.resetSave || undefined });
    });
  });
}
