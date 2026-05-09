import { GRADE_TO_SR, createInitialSession, DEFAULT_PLAYER, normalizePlayer } from "./game/data.js";

const STORAGE_KEY = "sprinkles-100-player";

export function loadGame() {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return {
      player: null,
      session: createInitialSession(),
      flash: null,
    };
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      player: parsed.player ? normalizePlayer(parsed.player) : null,
      session: parsed.session ? createInitialSession(parsed.session) : createInitialSession(),
      flash: parsed.flash ?? null,
    };
  } catch (error) {
    return {
      player: null,
      session: createInitialSession(),
      flash: {
        kind: "error",
        text: "Your save was scrambled, so we baked a fresh one.",
      },
    };
  }
}

export function saveGame(gameState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
}

export function resetGame() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getInitialScreen(gameState) {
  return gameState.player ? "game" : "onboarding";
}

export function createNewPlayer({ username, grade }) {
  const SR = GRADE_TO_SR[grade];
  const player = normalizePlayer({
    ...DEFAULT_PLAYER,
    username,
    grade,
    SR,
    bank: SR >= 300 ? 25 : 0,
    createdAt: Date.now(),
  });

  return {
    player,
    session: createInitialSession(),
    flash: {
      kind: "success",
      text:
        SR < 100
          ? "Welcome to cupcake counting mode. Tap the right answer to earn sprinkles."
          : "Your bakery is open. Pick a recipe and start solving sweet math.",
    },
  };
}
