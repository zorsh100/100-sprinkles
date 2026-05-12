import { GRADE_TO_SR, PLAYER_AVATAR_IDS, createInitialSession, DEFAULT_PLAYER, normalizePlayer } from "./game/data.js?v=20260511-210200";

const STORAGE_KEY = "sprinkles-100-player";
const SAVE_VERSION = 4;
const SAVE_SLOT_IDS = ["slot-1", "slot-2"];
const AVAILABLE_NEW_PLAYER_GRADES = new Set(["K", "1", "2", "3", "4", "5"]);

function createSaveSlot(id, payload = {}) {
  const player = payload.player ? normalizePlayer(payload.player) : null;

  return {
    id,
    player,
    session: createInitialSession(payload.session),
    flash: payload.flash ?? null,
    savedAt: payload.savedAt ?? player?.createdAt ?? null,
  };
}

function getSaveSlotLabel(slotId) {
  const index = SAVE_SLOT_IDS.indexOf(slotId);
  return `Player ${index >= 0 ? index + 1 : 1}`;
}

function normalizeSaveSlots(rawSlots = []) {
  return SAVE_SLOT_IDS.map((slotId, index) => {
    const matchingSlot = rawSlots.find((slot) => slot?.id === slotId) ?? rawSlots[index] ?? {};
    return createSaveSlot(slotId, matchingSlot);
  });
}

function createEmptyGameState(flash = null) {
  return {
    player: null,
    session: createInitialSession(),
    flash,
    saveMeta: null,
    saveSlots: normalizeSaveSlots(),
    activeSaveSlot: SAVE_SLOT_IDS[0],
  };
}

function getPreferredActiveSlotId(saveSlots, preferredSlotId) {
  if (saveSlots.some((slot) => slot.id === preferredSlotId)) {
    return preferredSlotId;
  }

  return saveSlots.find((slot) => slot.player)?.id ?? SAVE_SLOT_IDS[0];
}

function buildGameState({ saveSlots, activeSaveSlot, flashOverride }) {
  const resolvedActiveSlot = getPreferredActiveSlotId(saveSlots, activeSaveSlot);
  const activeSlot = saveSlots.find((slot) => slot.id === resolvedActiveSlot) ?? createSaveSlot(resolvedActiveSlot);
  const loadedAt = Date.now();

  return {
    player: activeSlot.player,
    session: createInitialSession(activeSlot.session),
    flash: flashOverride ?? activeSlot.flash ?? null,
    saveMeta:
      activeSlot.player || activeSlot.savedAt
        ? {
            version: SAVE_VERSION,
            loadedAt,
            savedAt: activeSlot.savedAt ?? activeSlot.player?.createdAt ?? loadedAt,
            slotId: resolvedActiveSlot,
          }
        : null,
    saveSlots,
    activeSaveSlot: resolvedActiveSlot,
  };
}

function migrateLegacySave(parsed) {
  return normalizeSaveSlots([
    {
      id: SAVE_SLOT_IDS[0],
      player: parsed.player,
      session: parsed.session,
      flash: parsed.flash,
      savedAt: parsed.savedAt ?? parsed.player?.createdAt ?? Date.now(),
    },
  ]);
}

function syncActiveSlot(gameState) {
  const activeSaveSlot = getPreferredActiveSlotId(gameState.saveSlots ?? normalizeSaveSlots(), gameState.activeSaveSlot);
  const saveSlots = normalizeSaveSlots(gameState.saveSlots).map((slot) => {
    if (slot.id !== activeSaveSlot) {
      return slot;
    }

    return createSaveSlot(slot.id, {
      player: gameState.player,
      session: gameState.session,
      flash: gameState.flash,
      savedAt: gameState.player ? gameState.saveMeta?.savedAt ?? gameState.player.createdAt ?? Date.now() : null,
    });
  });

  return {
    ...gameState,
    activeSaveSlot,
    saveSlots,
  };
}

function findFirstEmptySlotId(saveSlots) {
  return saveSlots.find((slot) => !slot.player)?.id ?? SAVE_SLOT_IDS[0];
}

function createSaveSummary(slot, activeSaveSlot) {
  if (!slot.player) {
    return {
      slotId: slot.id,
      slotLabel: getSaveSlotLabel(slot.id),
      isActive: slot.id === activeSaveSlot,
      empty: true,
      savedAt: null,
    };
  }

  return {
    slotId: slot.id,
    slotLabel: getSaveSlotLabel(slot.id),
    isActive: slot.id === activeSaveSlot,
    empty: false,
    username: slot.player.username,
    avatarId: slot.player.avatarId,
    grade: slot.player.grade,
    SR: slot.player.SR,
    coins: slot.player.bank,
    savedAt: slot.savedAt ?? slot.player.createdAt ?? Date.now(),
  };
}

export function loadGame() {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return createEmptyGameState();
  }

  try {
    const parsed = JSON.parse(raw);
    const saveSlots = Array.isArray(parsed.saveSlots) ? normalizeSaveSlots(parsed.saveSlots) : parsed.player ? migrateLegacySave(parsed) : normalizeSaveSlots();
    return buildGameState({
      saveSlots,
      activeSaveSlot: parsed.activeSaveSlot,
    });
  } catch (error) {
    return createEmptyGameState({
      kind: "error",
      text: "Your save was scrambled, so we baked a fresh set of notebooks.",
    });
  }
}

export function saveGame(gameState) {
  const syncedState = syncActiveSlot(gameState);
  const savedAt = Date.now();
  const activeSlot = syncedState.saveSlots.find((slot) => slot.id === syncedState.activeSaveSlot);

  if (activeSlot?.player) {
    activeSlot.savedAt = savedAt;
  }

  const payload = {
    version: SAVE_VERSION,
    activeSaveSlot: syncedState.activeSaveSlot,
    saveSlots: syncedState.saveSlots,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

  gameState.player = syncedState.player;
  gameState.session = syncedState.session;
  gameState.flash = syncedState.flash;
  gameState.activeSaveSlot = syncedState.activeSaveSlot;
  gameState.saveSlots = syncedState.saveSlots;
  gameState.saveMeta =
    activeSlot?.player || activeSlot?.savedAt
      ? {
          version: SAVE_VERSION,
          loadedAt: gameState.saveMeta?.loadedAt ?? savedAt,
          savedAt: activeSlot.savedAt ?? savedAt,
          slotId: syncedState.activeSaveSlot,
        }
      : null;
}

export function activateSaveSlot(gameState, slotId) {
  const syncedState = syncActiveSlot(gameState);
  return buildGameState({
    saveSlots: syncedState.saveSlots,
    activeSaveSlot: slotId,
  });
}

export function resetGame(gameState, slotId = gameState.activeSaveSlot) {
  const syncedState = syncActiveSlot(gameState);
  const nextSaveSlots = syncedState.saveSlots.map((slot) => (slot.id === slotId ? createSaveSlot(slot.id) : slot));
  const nextActiveSaveSlot =
    slotId === syncedState.activeSaveSlot
      ? nextSaveSlots.find((slot) => slot.id !== slotId && slot.player)?.id ?? slotId
      : syncedState.activeSaveSlot;

  const hasAnySave = nextSaveSlots.some((slot) => slot.player);

  if (!hasAnySave) {
    localStorage.removeItem(STORAGE_KEY);
    return createEmptyGameState();
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      version: SAVE_VERSION,
      activeSaveSlot: nextActiveSaveSlot,
      saveSlots: nextSaveSlots,
    }),
  );

  return buildGameState({
    saveSlots: nextSaveSlots,
    activeSaveSlot: nextActiveSaveSlot,
  });
}

export function getSaveSummaries(gameState) {
  const saveSlots = normalizeSaveSlots(gameState.saveSlots);
  return saveSlots.map((slot) => createSaveSummary(slot, gameState.activeSaveSlot));
}

export function getSaveSummary(gameState) {
  return getSaveSummaries(gameState).find((summary) => summary.isActive && !summary.empty) ?? null;
}

export function isValidPlayerName(username) {
  const trimmedName = String(username ?? "").trim();
  const letterMatches = trimmedName.match(/[A-Za-z]/g) ?? [];
  return trimmedName.length >= 2 && letterMatches.length >= 2;
}

export function createNewPlayer(gameState, { username, grade, slotId, avatarId }) {
  const syncedState = syncActiveSlot(gameState);
  const targetSlotId = getPreferredActiveSlotId(syncedState.saveSlots, slotId ?? findFirstEmptySlotId(syncedState.saveSlots));
  const normalizedGrade = AVAILABLE_NEW_PLAYER_GRADES.has(String(grade)) ? String(grade) : "K";
  const normalizedAvatarId = PLAYER_AVATAR_IDS.includes(String(avatarId)) ? String(avatarId) : DEFAULT_PLAYER.avatarId;
  const SR = GRADE_TO_SR[normalizedGrade];
  const trimmedName = String(username ?? "").trim().slice(0, 24);
  const safeName = isValidPlayerName(trimmedName) ? trimmedName : "Chef Sunny";
  const createdAt = Date.now();
  const player = normalizePlayer({
    ...DEFAULT_PLAYER,
    username: safeName,
    avatarId: normalizedAvatarId,
    grade: normalizedGrade,
    SR,
    bank: SR >= 300 ? 25 : 0,
    createdAt,
  });
  const flash = {
    kind: "success",
    text:
      SR < 110
        ? "Welcome to cupcake counting mode. The first-grade bridge stays visual a little longer so the jump feels gentler."
        : "Your bakery is open. Pick a recipe and start solving sweet math.",
  };
  const nextSaveSlots = syncedState.saveSlots.map((slot) => {
    if (slot.id !== targetSlotId) {
      return slot;
    }

    return createSaveSlot(slot.id, {
      player,
      session: createInitialSession(),
      flash,
      savedAt: createdAt,
    });
  });

  return buildGameState({
    saveSlots: nextSaveSlots,
    activeSaveSlot: targetSlotId,
    flashOverride: flash,
  });
}

export function updatePlayerProfile(gameState, { username, slotId, avatarId }) {
  const syncedState = syncActiveSlot(gameState);
  const targetSlotId = getPreferredActiveSlotId(syncedState.saveSlots, slotId ?? syncedState.activeSaveSlot);
  const targetSlot = syncedState.saveSlots.find((slot) => slot.id === targetSlotId);

  if (!targetSlot?.player) {
    return syncedState;
  }

  const trimmedName = String(username ?? "").trim().slice(0, 24);
  const safeName = isValidPlayerName(trimmedName) ? trimmedName : "Chef Sunny";
  const normalizedAvatarId = PLAYER_AVATAR_IDS.includes(String(avatarId)) ? String(avatarId) : targetSlot.player.avatarId ?? DEFAULT_PLAYER.avatarId;
  const flash = {
    kind: "success",
    text: `${safeName}'s baker card is updated and ready for more bakery math.`,
  };

  const nextSaveSlots = syncedState.saveSlots.map((slot) => {
    if (slot.id !== targetSlotId) {
      return slot;
    }

    const nextPlayer = normalizePlayer({
      ...slot.player,
      username: safeName,
      avatarId: normalizedAvatarId,
    });

    return createSaveSlot(slot.id, {
      player: nextPlayer,
      session: slot.session,
      flash,
      savedAt: slot.savedAt ?? Date.now(),
    });
  });

  return buildGameState({
    saveSlots: nextSaveSlots,
    activeSaveSlot: targetSlotId,
    flashOverride: flash,
  });
}
