import { GRADE_TO_SR, createInitialSession, DEFAULT_PLAYER, normalizePlayer } from "./game/data.js?v=20260510-013300";

const STORAGE_KEY = "sprinkles-100-player";
const SAVE_VERSION = 2;

function createEmptyGameState(flash = null) {
  return {
    player: null,
    session: createInitialSession(),
    flash,
    saveMeta: null,
  };
}

export function loadGame() {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return createEmptyGameState();
  }

  try {
    const parsed = JSON.parse(raw);
    const player = parsed.player ? normalizePlayer(parsed.player) : null;

    return {
      player,
      session: parsed.session ? createInitialSession(parsed.session) : createInitialSession(),
      flash: parsed.flash ?? null,
      saveMeta: {
        version: parsed.version ?? 1,
        loadedAt: Date.now(),
        savedAt: parsed.savedAt ?? player?.createdAt ?? Date.now(),
      },
    };
  } catch (error) {
    return createEmptyGameState({
      kind: "error",
      text: "Your save was scrambled, so we baked a fresh one.",
    });
  }
}

export function saveGame(gameState) {
  const savedAt = Date.now();
  const payload = {
    version: SAVE_VERSION,
    savedAt,
    player: gameState.player,
    session: gameState.session,
    flash: gameState.flash,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  gameState.saveMeta = {
    version: SAVE_VERSION,
    loadedAt: gameState.saveMeta?.loadedAt ?? savedAt,
    savedAt,
  };
}

export function resetGame() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getSaveSummary(gameState) {
  if (!gameState.player) {
    return null;
  }

  return {
    username: gameState.player.username,
    grade: gameState.player.grade,
    SR: gameState.player.SR,
    coins: gameState.player.bank,
    sprinkles: gameState.player.sprinkles,
    savedAt: gameState.saveMeta?.savedAt ?? gameState.player.createdAt ?? Date.now(),
  };
}

export function isValidPlayerName(username) {
  const trimmedName = String(username ?? "").trim();
  const letterMatches = trimmedName.match(/[A-Za-z]/g) ?? [];
  return trimmedName.length >= 2 && letterMatches.length >= 2;
}

export function createNewPlayer({ username, grade }) {
  const SR = GRADE_TO_SR[grade];
  const trimmedName = String(username ?? "").trim().slice(0, 24);
  const safeName = isValidPlayerName(trimmedName) ? trimmedName : "Chef Sprinkle";
  const createdAt = Date.now();
  const player = normalizePlayer({
    ...DEFAULT_PLAYER,
    username: safeName,
    grade,
    SR,
    bank: SR >= 300 ? 25 : 0,
    createdAt,
  });

  return {
    player,
    session: createInitialSession(),
    flash: {
      kind: "success",
      text:
        SR < 110
          ? "Welcome to cupcake counting mode. The first-grade bridge stays visual a little longer so the jump feels gentler."
          : "Your bakery is open. Pick a recipe and start solving sweet math.",
    },
    saveMeta: {
      version: SAVE_VERSION,
      loadedAt: createdAt,
      savedAt: createdAt,
    },
  };
}
