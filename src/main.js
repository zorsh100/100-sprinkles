import { getRouteFromHash, navigate, subscribeToRouteChanges } from "./app/router.js?v=20260517-143100";
import { activateSaveSlot, createNewPlayer, loadGame, resetGame, saveGame, updatePlayerProfile } from "./state.js?v=20260517-143100";
import { renderApp } from "./ui/render.js?v=20260517-143100";

const appRoot = document.querySelector("#app");

let gameState = loadGame();
let uiState = {
  route: resolveRouteForGameState(gameState, getRouteFromHash()),
  pendingSaveSlotId: gameState.activeSaveSlot,
};

function hasActiveOrder(session) {
  return Boolean(session?.order?.recipeId && session?.currentQuestion);
}

function hasValidSaleReady(session) {
  return Boolean(
    session?.saleReady &&
      session.saleReady.recipeName &&
      session.saleReady.recipeIcon &&
      Number.isFinite(Number(session.saleReady.revenue)),
  );
}

function syncAndRender(requestedRoute = uiState.route) {
  const resolvedRoute = resolveRouteForGameState(gameState, requestedRoute);

  uiState = {
    ...uiState,
    route: resolvedRoute,
  };

  if (resolvedRoute !== getRouteFromHash()) {
    navigate(resolvedRoute);
  }

  saveGame(gameState);
  renderApp(appRoot, gameState, uiState, handleAction);
}

function handleAction(action) {
  switch (action.type) {
    case "START_GAME":
      gameState = createNewPlayer(gameState, action.payload);
      uiState = {
        ...uiState,
        route: "recipe",
        pendingSaveSlotId: gameState.activeSaveSlot,
      };
      break;
    case "UPDATE_PLAYER_PROFILE":
      gameState = updatePlayerProfile(gameState, action.payload);
      uiState = {
        ...uiState,
        pendingSaveSlotId: gameState.activeSaveSlot,
      };
      break;
    case "UPDATE_GAME":
      gameState = action.payload;
      break;
    case "NAVIGATE":
      uiState = {
        ...uiState,
        route: action.payload,
      };
      break;
    case "SET_PENDING_SAVE_SLOT":
      uiState = {
        ...uiState,
        pendingSaveSlotId: action.payload,
      };
      break;
    case "SWITCH_SAVE":
      gameState = activateSaveSlot(gameState, action.payload);
      uiState = {
        ...uiState,
        pendingSaveSlotId: gameState.activeSaveSlot,
      };
      break;
    case "OPEN_SAVE_SLOT":
      gameState = activateSaveSlot(gameState, action.payload.slotId);
      uiState = {
        ...uiState,
        route: action.payload.route ?? "recipe",
        pendingSaveSlotId: gameState.activeSaveSlot,
      };
      break;
    case "RESET_SAVE":
      gameState = resetGame(gameState, action.payload ?? gameState.activeSaveSlot);
      uiState = {
        ...uiState,
        route: resolveRouteForGameState(gameState, uiState.route),
        pendingSaveSlotId: gameState.activeSaveSlot,
      };
      break;
    default:
      break;
  }

  syncAndRender(uiState.route);
}

subscribeToRouteChanges((route) => {
  const resolvedRoute = resolveRouteForGameState(gameState, route);

  if (resolvedRoute !== route) {
    navigate(resolvedRoute);
    return;
  }

  uiState = { ...uiState, route: resolvedRoute };
  renderApp(appRoot, gameState, uiState, handleAction);
});

function resolveRouteForGameState(currentGameState, requestedRoute = "title") {
  if (requestedRoute === "title") {
    return "title";
  }

  if (["settings", "shop", "learn"].includes(requestedRoute)) {
    return currentGameState.player ? requestedRoute : "title";
  }

  if (!currentGameState.player) {
    return requestedRoute === "profile" ? "profile" : "title";
  }

  if (requestedRoute === "profile") {
    return "profile";
  }

  if (hasActiveOrder(currentGameState.session) || hasValidSaleReady(currentGameState.session)) {
    return "bake";
  }

  if (currentGameState.session.pendingRecipeUnlocks?.length) {
    return requestedRoute === "stats" ? "stats" : "unlock";
  }

  if (currentGameState.session.recentSale) {
    return requestedRoute === "stats" || requestedRoute === "recipe" ? requestedRoute : "stats";
  }

  return "recipe";
}

syncAndRender(uiState.route);
