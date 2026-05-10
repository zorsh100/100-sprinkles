import { syncRouteFromState, subscribeToRouteChanges } from "./app/router.js?v=20260509-205459";
import { createNewPlayer, loadGame, resetGame, saveGame } from "./state.js?v=20260509-205459";
import { renderApp } from "./ui/render.js?v=20260509-205459";

const appRoot = document.querySelector("#app");

let gameState = loadGame();
let uiState = {
  route: syncRouteFromState(gameState),
};

function syncAndRender() {
  uiState = {
    ...uiState,
    route: syncRouteFromState(gameState),
  };

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

      if (gameState.session.order || gameState.session.saleReady) {
        uiState = { ...uiState, route: "bake" };
      } else if (gameState.session.pendingRecipeUnlocks?.length) {
        uiState = { ...uiState, route: "unlock" };
      } else if (gameState.session.recentSale) {
        uiState = { ...uiState, route: "stats" };
      }
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

  syncAndRender();
}

subscribeToRouteChanges((route) => {
  uiState = { ...uiState, route };
  renderApp(appRoot, gameState, uiState, handleAction);
});

syncAndRender();
