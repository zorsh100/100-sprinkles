import { clamp } from "./math.js?v=20260517-134000";

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
export const QUESTIONS_PER_BAKE = 10;
export const MAX_SR_GAIN_PER_BAKE = 10;
export const BAKE_STAGE_SEQUENCE = STAGES.flatMap((stage) => [stage, stage]);

const GRADE_SEQUENCE = ["K", "1", "2", "3", "4", "5", "6", "7", "8"];

export const STAGE_META = {
  prep: { icon: "🥣", title: "Prep Station" },
  mixing: { icon: "🌀", title: "Mixing Bowl" },
  timing: { icon: "⏲️", title: "Baking" },
  finishing: { icon: "🍓", title: "Finishing Touches" },
  serving: { icon: "🧁", title: "Serving Counter" },
};

export const INGREDIENT_COSTS = {
  flour: 5 / 17,
  sugar: 8 / 11,
  eggs: 10 / 12,
};

export const INGREDIENT_BULK_BUYS = {
  flour: { amount: 17, label: "5 lbs", cost: 5 },
  sugar: { amount: 11, label: "5 lbs", cost: 8 },
  eggs: { amount: 12, label: "1 dozen", cost: 10 },
};

export const MAX_SPRINKLES = 100;
export const PLAYER_AVATAR_IDS = ["baker-1", "baker-2", "baker-3", "baker-4", "baker-5", "baker-6", "baker-7", "baker-8"];

export const RECIPES = [
  {
    id: "cupcakes",
    name: "Cupcakes",
    icon: "🧁",
    unlockSprinkles: 0,
    pricePerItem: 2,
    itemsPerBatch: 6,
    baseReward: 12,
    sprinkleReward: 6,
    difficultyBonus: 0,
    ingredients: { flour: 2, sugar: 2, eggs: 1 },
  },
  {
    id: "cookies",
    name: "Cookies",
    icon: "🍪",
    unlockSprinkles: 0,
    pricePerItem: 2,
    itemsPerBatch: 9,
    baseReward: 12,
    sprinkleReward: 6,
    difficultyBonus: 0,
    ingredients: { flour: 2, sugar: 1, eggs: 1 },
  },
  {
    id: "donuts",
    name: "Donuts",
    icon: "🍩",
    unlockSprinkles: 0,
    pricePerItem: 2,
    itemsPerBatch: 6,
    baseReward: 15,
    sprinkleReward: 8,
    difficultyBonus: 10,
    ingredients: { flour: 3, sugar: 2, eggs: 1 },
  },
  {
    id: "muffins",
    name: "Muffins",
    icon: "🧁",
    unlockSprinkles: 0,
    pricePerItem: 3,
    itemsPerBatch: 6,
    baseReward: 18,
    sprinkleReward: 9,
    difficultyBonus: 20,
    ingredients: { flour: 3, sugar: 2, eggs: 2 },
  },
  {
    id: "brownies",
    name: "Brownies",
    icon: "🍫",
    unlockSprinkles: 15,
    pricePerItem: 2,
    itemsPerBatch: 9,
    baseReward: 20,
    sprinkleReward: 5,
    difficultyBonus: 24,
    ingredients: { flour: 3, sugar: 3, eggs: 2 },
  },
  {
    id: "sugar-cookies",
    name: "Sugar Cookies",
    icon: "🍪",
    unlockSprinkles: 25,
    pricePerItem: 2,
    itemsPerBatch: 9,
    baseReward: 22,
    sprinkleReward: 5,
    difficultyBonus: 28,
    ingredients: { flour: 3, sugar: 3, eggs: 2 },
  },
  {
    id: "cake",
    name: "Cake",
    icon: "🎂",
    unlockSprinkles: 35,
    pricePerItem: 11,
    itemsPerBatch: 2,
    baseReward: 25,
    sprinkleReward: 5,
    difficultyBonus: 34,
    ingredients: { flour: 4, sugar: 3, eggs: 3 },
  },
  {
    id: "cinnamon-rolls",
    name: "Cinnamon Rolls",
    icon: "🥐",
    unlockSprinkles: 45,
    pricePerItem: 3,
    itemsPerBatch: 8,
    baseReward: 28,
    sprinkleReward: 5,
    difficultyBonus: 40,
    ingredients: { flour: 4, sugar: 3, eggs: 2 },
  },
  {
    id: "macarons",
    name: "Macarons",
    icon: "🍬",
    unlockSprinkles: 55,
    pricePerItem: 2,
    itemsPerBatch: 12,
    baseReward: 31,
    sprinkleReward: 5,
    difficultyBonus: 46,
    ingredients: { flour: 4, sugar: 4, eggs: 3 },
  },
  {
    id: "ice-cream-sandwiches",
    name: "Ice Cream Sandwiches",
    icon: "🍨",
    unlockSprinkles: 65,
    pricePerItem: 4,
    itemsPerBatch: 6,
    baseReward: 35,
    sprinkleReward: 5,
    difficultyBonus: 52,
    ingredients: { flour: 4, sugar: 4, eggs: 3 },
  },
  {
    id: "cheesecake-slices",
    name: "Cheesecake Slices",
    icon: "🍰",
    unlockSprinkles: 75,
    pricePerItem: 4,
    itemsPerBatch: 8,
    baseReward: 38,
    sprinkleReward: 5,
    difficultyBonus: 58,
    ingredients: { flour: 4, sugar: 4, eggs: 4 },
  },
  {
    id: "pies",
    name: "Pies",
    icon: "🥧",
    unlockSprinkles: 85,
    pricePerItem: 17,
    itemsPerBatch: 2,
    baseReward: 42,
    sprinkleReward: 5,
    difficultyBonus: 64,
    ingredients: { flour: 5, sugar: 4, eggs: 4 },
  },
];

export const STARTER_RECIPE_IDS = RECIPES.filter((recipe) => recipe.unlockSprinkles === 0).map((recipe) => recipe.id);

export const DEFAULT_PLAYER = {
  username: "",
  avatarId: PLAYER_AVATAR_IDS[0],
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
  knownRecipes: STARTER_RECIPE_IDS,
  createdAt: 0,
};

export function getGradeRank(grade) {
  const rank = GRADE_SEQUENCE.indexOf(String(grade ?? "K"));
  return rank >= 0 ? rank : 0;
}

export function getGradeForSR(sr) {
  const normalizedSR = clamp(Number(sr) || DEFAULT_PLAYER.SR, 0, 1000);
  let resolvedGrade = "K";

  for (const grade of GRADE_SEQUENCE) {
    if (normalizedSR >= GRADE_TO_SR[grade]) {
      resolvedGrade = grade;
    }
  }

  return resolvedGrade;
}

export function getPromotedGrade(currentGrade, sr) {
  const srGrade = getGradeForSR(sr);
  return getGradeRank(srGrade) > getGradeRank(currentGrade) ? srGrade : String(currentGrade ?? "K");
}

export function getBakeStageByQuestionIndex(questionIndex) {
  const normalizedIndex = clamp(Number(questionIndex) || 0, 0, BAKE_STAGE_SEQUENCE.length - 1);
  return BAKE_STAGE_SEQUENCE[normalizedIndex] ?? STAGES[0];
}

export function getBakeStageIndexByQuestionIndex(questionIndex) {
  return STAGES.indexOf(getBakeStageByQuestionIndex(questionIndex));
}

export function normalizePlayer(player = {}) {
  const {
    knownRecipes: savedKnownRecipes,
    unlockedRecipes: legacyUnlockedRecipes,
    ...playerData
  } = player;
  const normalizedSprinkles = clamp(Number(playerData.sprinkles ?? DEFAULT_PLAYER.sprinkles) || 0, 0, MAX_SPRINKLES);
  const knownRecipes = Array.isArray(savedKnownRecipes)
    ? savedKnownRecipes
    : Array.isArray(legacyUnlockedRecipes)
      ? legacyUnlockedRecipes
      : DEFAULT_PLAYER.knownRecipes;
  const allowedKnownRecipeIds = new Set(
    RECIPES
      .filter((recipe) => recipe.unlockSprinkles === 0 || normalizedSprinkles >= recipe.unlockSprinkles)
      .map((recipe) => recipe.id),
  );
  const normalizedKnownRecipes = RECIPES
    .map((recipe) => recipe.id)
    .filter((recipeId) => allowedKnownRecipeIds.has(recipeId));
  const normalizedSR = clamp(Number(playerData.SR ?? DEFAULT_PLAYER.SR) || DEFAULT_PLAYER.SR, 0, 1000);
  const normalizedGrade = getPromotedGrade(playerData.grade ?? DEFAULT_PLAYER.grade, normalizedSR);

  return {
    ...DEFAULT_PLAYER,
    ...playerData,
    grade: normalizedGrade,
    SR: normalizedSR,
    avatarId: PLAYER_AVATAR_IDS.includes(playerData.avatarId) ? playerData.avatarId : DEFAULT_PLAYER.avatarId,
    sprinkles: normalizedSprinkles,
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
    knownRecipes: normalizedKnownRecipes,
  };
}

export function createInitialSession(overrides = {}) {
  const recentSales = Array.isArray(overrides.recentSales)
    ? overrides.recentSales.slice(0, 5)
    : overrides.recentSale
      ? [overrides.recentSale]
      : [];

  return {
    selectedRecipeId: "cupcakes",
    batchCount: 1,
    order: null,
    saleReady: null,
    recentSale: recentSales[0] ?? null,
    recentSales,
    pendingRecipeUnlocks: [],
    currentQuestion: null,
    questionResult: null,
    recentTemplates: [],
    ...overrides,
    recentSale: overrides.recentSale ?? recentSales[0] ?? null,
    recentSales,
    pendingRecipeUnlocks: Array.isArray(overrides.pendingRecipeUnlocks) ? overrides.pendingRecipeUnlocks : [],
  };
}
