import {
  MAX_SR_GAIN_PER_BAKE,
  QUESTIONS_PER_BAKE,
  STAGES,
  STAGE_META,
  createInitialSession,
  getBakeStageByQuestionIndex,
  getBakeStageIndexByQuestionIndex,
} from "./data.js?v=20260517-134000";
import {
  canAffordIngredients,
  clamp,
  clampSprinkles,
  getBakeAccuracy,
  getMissingPantry,
  getNewlyUnlockedRecipes,
  getOrderCount,
  getOrderRevenue,
  getPantryNeed,
  getRecipeById,
  getShopCost,
  getSprinkleCapForBake,
  supportsRecipeSets,
} from "./helpers.js?v=20260517-134000";
import { formatSignedValue } from "./math.js?v=20260517-134000";
import { generateQuestion } from "./questions/generator.js?v=20260517-134000";
import { applySRResult, isVisualMode } from "./sr.js?v=20260517-134000";

export function setFlash(gameState, kind, text) {
  return {
    ...gameState,
    flash: { kind, text },
  };
}

export function clearQuestionResult(gameState) {
  return {
    ...gameState,
    session: {
      ...gameState.session,
      questionResult: null,
    },
  };
}

export function selectRecipe(gameState, recipeId) {
  return {
    ...gameState,
    session: {
      ...gameState.session,
      selectedRecipeId: recipeId,
      questionResult: null,
    },
  };
}

export function setBatchCount(gameState, batchCount) {
  return {
    ...gameState,
    session: {
      ...gameState.session,
      batchCount: getOrderCount(gameState.player.SR, batchCount),
      questionResult: null,
    },
  };
}

export function buyIngredient(gameState, ingredient, amount = 1) {
  const player = gameState.player;
  const units = clamp(Number(amount) || 1, 1, 24);
  const cost = getShopCost(ingredient, units);

  if (player.bank < cost) {
    return setFlash(gameState, "error", `You need ${cost} coins to buy ${units} ${ingredient}.`);
  }

  return {
    ...gameState,
    player: {
      ...player,
      bank: player.bank - cost,
      pantry: {
        ...player.pantry,
        [ingredient]: player.pantry[ingredient] + units,
      },
    },
    flash: {
      kind: "success",
      text: `You bought ${units} ${ingredient}. Great stocking.`,
    },
  };
}

export function startOrder(gameState) {
  const { player, session } = gameState;
  const recipe = getRecipeById(session.selectedRecipeId);

  if (!recipe) {
    return setFlash(gameState, "error", "Pick a recipe first.");
  }

  if (session.saleReady) {
    return setFlash(gameState, "error", "Serve and sell your finished bake before starting another one.");
  }

  const orderCount = getOrderCount(player.SR, session.batchCount);

  if (player.SR >= 300) {
    const need = getPantryNeed(recipe, orderCount);

    if (!canAffordIngredients(player, need)) {
      const missing = getMissingPantry(player, need);
      const missingLabel = Object.entries(missing)
        .map(([ingredient, amount]) => `${amount} ${ingredient}`)
        .join(", ");
      return setFlash(
        gameState,
        "error",
        `Your pantry needs more ingredients before this bake can start: ${missingLabel}.`,
      );
    }
  }

  const pantryNeed = getPantryNeed(recipe, orderCount);
  const estimatedRevenue = getOrderRevenue(recipe, orderCount, player.SR);
  const firstStage = getBakeStageByQuestionIndex(0);
  const order = {
    recipeId: recipe.id,
    batchCount: orderCount,
    questionIndex: 0,
    questionsPerBake: QUESTIONS_PER_BAKE,
    stageIndex: getBakeStageIndexByQuestionIndex(0),
    completedStages: [],
    pantryNeed,
    estimatedRevenue,
    totalAttempts: 0,
    correctAnswers: 0,
    firstTryCorrectAnswers: 0,
    streakBonusSprinkles: 0,
    srGainThisBake: 0,
    status: "baking",
    startedAt: Date.now(),
  };
  const nextQuestion = generateQuestion({
    SR: player.SR,
    stage: firstStage,
    context: {
      recipeId: recipe.id,
      recipeName: recipe.name,
      batchCount: orderCount,
    },
    recentTemplates: session.recentTemplates,
  });
  nextQuestion.orderQuestionIndex = 0;
  nextQuestion.questionsPerBake = QUESTIONS_PER_BAKE;

  return {
    ...gameState,
    session: {
      ...session,
      order,
      saleReady: null,
      questionResult: null,
      currentQuestion: nextQuestion,
      recentTemplates: [...session.recentTemplates, nextQuestion.templateId].slice(-6),
    },
    flash: {
      kind: "success",
      text:
        isVisualMode(player.SR)
          ? `Tap the right number to start this ${QUESTIONS_PER_BAKE}-question bakery job.`
          : `The ${recipe.name.toLowerCase()} order is rolling into prep for a ${QUESTIONS_PER_BAKE}-question bake.`,
    },
  };
}

export function submitAnswer(gameState, selectedAnswer) {
  const { player, session } = gameState;
  const question = session.currentQuestion;

  if (!question || !session.order) {
    return setFlash(gameState, "error", "Start an order to get a fresh math challenge.");
  }

  const normalizedSelectedAnswer = String(selectedAnswer);
  const normalizedAnswer = String(question.answer);
  const correct = normalizedSelectedAnswer === normalizedAnswer;
  const attemptNumber = (question.attemptCount ?? 0) + 1;
  const srResult = applySRResult({
    player,
    question,
    correct,
    attemptNumber,
    maxPositiveDelta: MAX_SR_GAIN_PER_BAKE - (session.order.srGainThisBake ?? 0),
  });

  if (!correct) {
    return {
      ...gameState,
      player: srResult.player,
      session: {
        ...session,
        order: {
          ...session.order,
          totalAttempts: (session.order.totalAttempts ?? 0) + 1,
        },
        currentQuestion: {
          ...question,
          attemptCount: attemptNumber,
        },
        questionResult: {
          correct: false,
          selectedAnswer: normalizedSelectedAnswer,
          attemptNumber,
          srDelta: srResult.delta,
        },
      },
      flash: {
        kind: "error",
        text: `Not quite. ${question.hint} SR ${formatSignedValue(srResult.delta)}.`,
      },
    };
  }

  const currentQuestionIndex = session.order.questionIndex ?? ((session.order.stageIndex ?? 0) * 2);
  const nextQuestionIndex = currentQuestionIndex + 1;
  const currentStage = getBakeStageByQuestionIndex(currentQuestionIndex);
  const nextStage = nextQuestionIndex < QUESTIONS_PER_BAKE ? getBakeStageByQuestionIndex(nextQuestionIndex) : null;
  const completedStages =
    !session.order.completedStages.includes(currentStage) && currentStage !== nextStage
      ? [...session.order.completedStages, currentStage]
      : session.order.completedStages;
  const earnedFirstTrySprinkle = attemptNumber === 1 ? 1 : 0;
  const earnedStreakSprinkle = attemptNumber === 1 && srResult.player.skill.currentStreak >= 7 ? 1 : 0;

  const nextOrderTotals = {
    totalAttempts: (session.order.totalAttempts ?? 0) + 1,
    correctAnswers: (session.order.correctAnswers ?? 0) + 1,
    firstTryCorrectAnswers: (session.order.firstTryCorrectAnswers ?? 0) + earnedFirstTrySprinkle,
    streakBonusSprinkles: (session.order.streakBonusSprinkles ?? 0) + earnedStreakSprinkle,
    questionIndex: nextQuestionIndex,
    stageIndex: nextQuestionIndex < QUESTIONS_PER_BAKE ? getBakeStageIndexByQuestionIndex(nextQuestionIndex) : session.order.stageIndex,
    srGainThisBake: (session.order.srGainThisBake ?? 0) + Math.max(0, srResult.delta),
  };

  if (nextQuestionIndex >= QUESTIONS_PER_BAKE) {
    return finishOrder(gameState, srResult.player, completedStages, nextOrderTotals);
  }

  const recipe = getRecipeById(session.order.recipeId);
  const nextQuestion = generateQuestion({
    SR: srResult.nextSR,
    stage: nextStage,
    context: {
      recipeId: session.order.recipeId,
      recipeName: recipe?.name,
      batchCount: session.order.batchCount,
    },
    recentTemplates: session.recentTemplates,
  });
  nextQuestion.orderQuestionIndex = nextQuestionIndex;
  nextQuestion.questionsPerBake = QUESTIONS_PER_BAKE;

  return {
    ...gameState,
    player: srResult.player,
    session: {
      ...session,
      order: {
        ...session.order,
        completedStages,
        ...nextOrderTotals,
      },
      questionResult: null,
      currentQuestion: nextQuestion,
      recentTemplates: [...session.recentTemplates, nextQuestion.templateId].slice(-6),
    },
    flash: {
      kind: "success",
      text:
        currentStage !== nextStage
          ? `${STAGE_META[currentStage].title} is done. Next stop: ${STAGE_META[nextStage].title}. SR ${formatSignedValue(srResult.delta)}.`
          : `${STAGE_META[currentStage].title} keeps rolling. Question ${nextQuestionIndex + 1} of ${QUESTIONS_PER_BAKE}. SR ${formatSignedValue(srResult.delta)}.`,
    },
  };
}

function finishOrder(gameState, updatedPlayer, completedStages, orderTotals = {}) {
  const { session } = gameState;
  const recipe = getRecipeById(session.order.recipeId);
  const totalAttempts = orderTotals.totalAttempts ?? session.order.totalAttempts ?? completedStages.length;
  const correctAnswers = orderTotals.correctAnswers ?? session.order.correctAnswers ?? completedStages.length;
  const firstTryCorrectAnswers = orderTotals.firstTryCorrectAnswers ?? session.order.firstTryCorrectAnswers ?? 0;
  const streakBonusSprinkles = orderTotals.streakBonusSprinkles ?? session.order.streakBonusSprinkles ?? 0;
  const accuracyPercent = getBakeAccuracy(correctAnswers, totalAttempts);
  const totalPossibleItems = recipe.itemsPerBatch * session.order.batchCount;
  const itemsMade = Math.floor(totalPossibleItems * (accuracyPercent / 100));
  const saleRevenue = itemsMade * recipe.pricePerItem;
  const streakBonus = updatedPlayer.skill.currentStreak >= 7
    ? Math.floor(saleRevenue * 0.10)
    : 0;
  const totalRevenue = saleRevenue + streakBonus;
  const sprinklesEarned = getBakeProgressSprinkles({
    recipe,
    firstTryCorrectAnswers,
    streakBonusSprinkles,
  });
  const pantry = { ...updatedPlayer.pantry };

  if (updatedPlayer.SR >= 300) {
    const need = getPantryNeed(recipe, session.order.batchCount);

    Object.entries(need).forEach(([ingredient, amount]) => {
      pantry[ingredient] -= amount;
    });
  }

  return {
    ...gameState,
    player: {
      ...updatedPlayer,
      pantry,
    },
    session: {
      ...createInitialSession({
        selectedRecipeId: session.selectedRecipeId,
        batchCount: getOrderCount(updatedPlayer.SR, session.batchCount),
        recentTemplates: session.recentTemplates,
        recentSale: session.recentSale,
        recentSales: session.recentSales,
        pendingRecipeUnlocks: session.pendingRecipeUnlocks,
      }),
      saleReady: {
        recipeId: recipe.id,
        recipeName: recipe.name,
        recipeIcon: recipe.icon,
        batchCount: session.order.batchCount,
        completedStages,
        totalPossibleItems,
        itemsMade,
        pricePerItem: recipe.pricePerItem,
        saleRevenue,
        streakBonus,
        revenue: totalRevenue,
        accuracyPercent,
        questionsPerBake: session.order.questionsPerBake ?? QUESTIONS_PER_BAKE,
        totalAttempts,
        correctAnswers,
        firstTryCorrectAnswers,
        streakBonusSprinkles,
        pantryUsed: session.order.pantryNeed,
        sprinklesEarned,
        bakedAt: Date.now(),
      },
    },
    flash: {
      kind: "success",
      text: `Fresh ${recipe.name.toLowerCase()} are ready. Serve them to earn ${totalRevenue} coins at ${accuracyPercent}% bake accuracy.`,
    },
  };
}

export function dismissRecipeUnlocks(gameState) {
  return {
    ...gameState,
    session: {
      ...gameState.session,
      pendingRecipeUnlocks: [],
    },
  };
}

export function sellCurrentOrder(gameState) {
  const { player, session } = gameState;
  const saleReady = session.saleReady;

  if (!saleReady) {
    return setFlash(gameState, "error", "Finish baking this order before trying to sell it.");
  }

  const completedSale = {
    ...saleReady,
    soldAt: Date.now(),
  };
  const recentSales = [completedSale, ...(Array.isArray(session.recentSales) ? session.recentSales : session.recentSale ? [session.recentSale] : [])]
    .slice(0, 5);
  const nextSprinkles = clampSprinkles(player.sprinkles + saleReady.sprinklesEarned);
  const newlyUnlockedRecipes = getNewlyUnlockedRecipes(player.sprinkles, nextSprinkles);
  const nextKnownRecipes = [...new Set([...(player.knownRecipes ?? []), ...newlyUnlockedRecipes.map((recipe) => recipe.id)])];

  return {
    ...gameState,
    player: {
      ...player,
      bank: player.bank + saleReady.revenue,
      sprinkles: nextSprinkles,
      knownRecipes: nextKnownRecipes,
    },
    session: {
      ...session,
      saleReady: null,
      recentSale: completedSale,
      recentSales,
      pendingRecipeUnlocks: queueRecipeUnlocks(session.pendingRecipeUnlocks, newlyUnlockedRecipes),
    },
    flash: {
      kind: "success",
      text: supportsRecipeSets(player.SR)
        ? `Sold ${saleReady.batchCount} set${saleReady.batchCount > 1 ? "s" : ""} of ${saleReady.recipeName.toLowerCase()} for ${saleReady.revenue} coins.`
        : `Sold ${saleReady.recipeName.toLowerCase()} for ${saleReady.revenue} coins.`,
    },
  };
}

function getBakeProgressSprinkles({ recipe, firstTryCorrectAnswers = 0, streakBonusSprinkles = 0 }) {
  // Sprinkles now act as the bake progression meter, so one bake should only
  // move the player a little even when the recipe's legacy reward value is high.
  const cappedBakeReward = getSprinkleCapForBake(recipe);
  const rawBakeProgress = Number(firstTryCorrectAnswers || 0) + Number(streakBonusSprinkles || 0) + 1;

  return clamp(rawBakeProgress, 0, cappedBakeReward);
}

function queueRecipeUnlocks(existingUnlocks = [], newlyUnlockedRecipes = []) {
  const unlockMap = new Map((existingUnlocks ?? []).map((recipe) => [recipe.id, recipe]));

  for (const recipe of newlyUnlockedRecipes) {
    unlockMap.set(recipe.id, recipe);
  }

  return [...unlockMap.values()];
}
