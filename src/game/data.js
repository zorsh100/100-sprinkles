export const GRADE_TO_SR = {
  // Keep kindergarten aligned with the spec so the visual-only ramp starts halfway in.
  K: 50,
  1: 150,
  2: 250,
  3: 350,
  4: 450,
  5: 550,
  6: 650,
  7: 750,
  8: 850,
};

export const STAGES = ["prep", "mixing", "timing", "finishing", "serving"];

export const STAGE_META = {
  prep: { icon: "🥣", title: "Prep Station" },
  mixing: { icon: "🌀", title: "Mixing Bowl" },
  timing: { icon: "⏲️", title: "Oven Timer" },
  finishing: { icon: "🍓", title: "Finishing Touches" },
  serving: { icon: "🧁", title: "Serving Counter" },
};

export const INGREDIENT_COSTS = {
  flour: 2,
  sugar: 3,
  eggs: 4,
};

export const RECIPES = [
  {
    id: "cupcakes",
    name: "Cupcakes",
    icon: "🧁",
    unlockSR: 0,
    baseReward: 12,
    sprinkleReward: 6,
    difficultyBonus: 0,
    ingredients: { flour: 2, sugar: 2, eggs: 1 },
  },
  {
    id: "cookies",
    name: "Cookies",
    icon: "🍪",
    unlockSR: 75,
    baseReward: 12,
    sprinkleReward: 6,
    difficultyBonus: 0,
    ingredients: { flour: 2, sugar: 1, eggs: 1 },
  },
  {
    id: "donuts",
    name: "Donuts",
    icon: "🍩",
    unlockSR: 150,
    baseReward: 15,
    sprinkleReward: 8,
    difficultyBonus: 10,
    ingredients: { flour: 3, sugar: 2, eggs: 1 },
  },
  {
    id: "muffins",
    name: "Muffins",
    icon: "🧁",
    unlockSR: 225,
    baseReward: 18,
    sprinkleReward: 9,
    difficultyBonus: 20,
    ingredients: { flour: 3, sugar: 2, eggs: 2 },
  },
];

export const DEFAULT_PLAYER = {
  username: "",
  grade: "K",
  SR: 50,
  bank: 0,
  sprinkles: 0,
  skill: {
    totalAnswered: 0,
    correctAnswered: 0,
    currentStreak: 0,
    bestStreak: 0,
    lastDelta: 0,
    lastQuestionType: "arithmetic_visual",
    recentResults: [],
  },
  pantry: {
    flour: 0,
    sugar: 0,
    eggs: 0,
  },
  knownRecipes: ["cupcakes", "cookies", "donuts", "muffins"],
  createdAt: 0,
};

export function normalizePlayer(player = {}) {
  const {
    knownRecipes: savedKnownRecipes,
    unlockedRecipes: legacyUnlockedRecipes,
    ...playerData
  } = player;
  const knownRecipes = Array.isArray(savedKnownRecipes)
    ? savedKnownRecipes
    : Array.isArray(legacyUnlockedRecipes)
      ? legacyUnlockedRecipes
      : DEFAULT_PLAYER.knownRecipes;

  return {
    ...DEFAULT_PLAYER,
    ...playerData,
    pantry: {
      ...DEFAULT_PLAYER.pantry,
      ...(playerData.pantry ?? {}),
    },
    skill: {
      ...DEFAULT_PLAYER.skill,
      ...(playerData.skill ?? {}),
      recentResults: Array.isArray(playerData.skill?.recentResults)
        ? playerData.skill.recentResults.slice(-8)
        : [],
    },
    knownRecipes,
  };
}

export function createInitialSession(overrides = {}) {
  return {
    selectedRecipeId: "cupcakes",
    batchCount: 1,
    order: null,
    saleReady: null,
    recentSale: null,
    pendingRecipeUnlocks: [],
    currentQuestion: null,
    questionResult: null,
    recentTemplates: [],
    ...overrides,
    pendingRecipeUnlocks: Array.isArray(overrides.pendingRecipeUnlocks) ? overrides.pendingRecipeUnlocks : [],
  };
}
