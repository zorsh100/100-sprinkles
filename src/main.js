import { syncRouteFromState, subscribeToRouteChanges } from "./app/router.js";
import { createNewPlayer, loadGame, resetGame, saveGame } from "./state.js";
import { renderApp } from "./ui/render.js";

const appRoot = document.querySelector("#app");
const resetButton = document.querySelector("#reset-save");

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

resetButton.addEventListener("click", () => {
  handleAction({ type: "RESET_SAVE" });
});

subscribeToRouteChanges((route) => {
  uiState = { ...uiState, route };
  renderApp(appRoot, gameState, uiState, handleAction);
});

syncAndRender();
