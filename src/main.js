import { getRouteFromHash, navigate, subscribeToRouteChanges } from "./app/router.js?v=20260509-235200";
import { createNewPlayer, loadGame, resetGame, saveGame } from "./state.js?v=20260509-235200";
import { renderApp } from "./ui/render.js?v=20260509-235200";

const appRoot = document.querySelector("#app");

let gameState = loadGame();
let uiState = {
  route: resolveRouteForGameState(gameState, getRouteFromHash()),
};

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
      gameState = createNewPlayer(action.payload);
      uiState = { ...uiState, route: "recipe" };
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
    case "RESET_SAVE":
      resetGame();
      gameState = loadGame();
      uiState = { ...uiState, route: "title" };
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

  if (requestedRoute === "settings") {
    return "settings";
  }

  if (!currentGameState.player) {
    return requestedRoute === "profile" ? "profile" : "title";
  }

  if (currentGameState.session.order || currentGameState.session.saleReady) {
    return "bake";
  }

  if (currentGameState.session.pendingRecipeUnlocks?.length) {
    return requestedRoute === "stats" ? "stats" : "unlock";
  }

  if (currentGameState.session.recentSale) {
    return requestedRoute === "stats" || requestedRoute === "recipe" ? requestedRoute : "stats";
  }

  if (requestedRoute === "profile") {
    return "profile";
  }

  return "recipe";
}

syncAndRender(uiState.route);
