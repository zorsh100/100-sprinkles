import { createInitialSession, STAGES } from "./data.js?v=20260510-024900";
import {
  canAffordIngredients,
  clamp,
  getAccuracyAdjustedRevenue,
  getMissingPantry,
  getNewlyUnlockedRecipes,
  getOrderCount,
  getOrderRevenue,
  getPantryNeed,
  getRecipeById,
  getShopCost,
  supportsRecipeSets,
} from "./helpers.js?v=20260510-024900";
import { formatSignedValue } from "./math.js?v=20260510-024900";
import { generateQuestion } from "./questions/generator.js?v=20260510-024900";
import { applySRResult, isVisualMode } from "./sr.js?v=20260510-024900";

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
  const units = clamp(Number(amount) || 1, 1, 12);
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
  const sprinkleReward = recipe.sprinkleReward * orderCount;
  const order = {
    recipeId: recipe.id,
    batchCount: orderCount,
    stageIndex: 0,
    completedStages: [],
    pantryNeed,
    estimatedRevenue,
    sprinkleReward,
    totalAttempts: 0,
    correctAnswers: 0,
    status: "baking",
    startedAt: Date.now(),
  };
  const nextQuestion = generateQuestion({
    SR: player.SR,
    stage: STAGES[0],
    context: {
      recipeId: recipe.id,
      recipeName: recipe.name,
      batchCount: orderCount,
    },
    recentTemplates: session.recentTemplates,
  });

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
          ? "Tap the right number to finish the treat tray."
          : `The ${recipe.name.toLowerCase()} order is rolling into prep.`,
    },
  };
}

export function submitAnswer(gameState, selectedAnswer) {
  const { player, session } = gameState;
  const question = session.currentQuestion;

  if (!question || !session.order) {
    return setFlash(gameState, "error", "Start an order to get a fresh math challenge.");
  }

  const correct = Number(selectedAnswer) === Number(question.answer);
  const attemptNumber = (question.attemptCount ?? 0) + 1;
  const srResult = applySRResult({
    player,
    question,
    correct,
    attemptNumber,
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
          selectedAnswer: Number(selectedAnswer),
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

  const nextStageIndex = session.order.stageIndex + 1;
  const completedStages = [...session.order.completedStages, question.stage];
  const newlyUnlockedRecipes = getNewlyUnlockedRecipes(player.SR, srResult.nextSR, player.knownRecipes);

  const nextOrderTotals = {
    totalAttempts: (session.order.totalAttempts ?? 0) + 1,
    correctAnswers: (session.order.correctAnswers ?? 0) + 1,
  };

  if (nextStageIndex >= STAGES.length) {
    return finishOrder(gameState, srResult.player, completedStages, newlyUnlockedRecipes, nextOrderTotals);
  }

  const recipe = getRecipeById(session.order.recipeId);
  const nextQuestion = generateQuestion({
    SR: srResult.nextSR,
    stage: STAGES[nextStageIndex],
    context: {
      recipeId: session.order.recipeId,
      recipeName: recipe?.name,
      batchCount: session.order.batchCount,
    },
    recentTemplates: session.recentTemplates,
  });

  return {
    ...gameState,
    player: {
      ...srResult.player,
      sprinkles: srResult.player.sprinkles + 2,
    },
    session: {
      ...session,
      order: {
        ...session.order,
        stageIndex: nextStageIndex,
        completedStages,
        ...nextOrderTotals,
      },
      questionResult: {
        correct: true,
        selectedAnswer: Number(selectedAnswer),
        attemptNumber,
        srDelta: srResult.delta,
      },
      currentQuestion: nextQuestion,
      recentTemplates: [...session.recentTemplates, nextQuestion.templateId].slice(-6),
      pendingRecipeUnlocks: queueRecipeUnlocks(session.pendingRecipeUnlocks, newlyUnlockedRecipes),
    },
    flash: {
      kind: "success",
      text: `${question.stage} is complete. On to ${STAGES[nextStageIndex]}. SR ${formatSignedValue(srResult.delta)}.`,
    },
  };
}

function finishOrder(gameState, updatedPlayer, completedStages, newlyUnlockedRecipes = [], orderTotals = {}) {
  const { session } = gameState;
  const recipe = getRecipeById(session.order.recipeId);
  const baseRevenue = getOrderRevenue(recipe, session.order.batchCount, updatedPlayer.SR);
  const sprinklesEarned = recipe.sprinkleReward * session.order.batchCount;
  const totalAttempts = orderTotals.totalAttempts ?? session.order.totalAttempts ?? completedStages.length;
  const correctAnswers = orderTotals.correctAnswers ?? session.order.correctAnswers ?? completedStages.length;
  const { accuracyPercent, adjustedRevenue } = getAccuracyAdjustedRevenue(
    baseRevenue,
    correctAnswers,
    totalAttempts,
  );
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
        pendingRecipeUnlocks: queueRecipeUnlocks(session.pendingRecipeUnlocks, newlyUnlockedRecipes),
      }),
      saleReady: {
        recipeId: recipe.id,
        recipeName: recipe.name,
        recipeIcon: recipe.icon,
        batchCount: session.order.batchCount,
        completedStages,
        revenue: adjustedRevenue,
        baseRevenue,
        accuracyPercent,
        totalAttempts,
        correctAnswers,
        sprinklesEarned: sprinklesEarned + 2,
        pantryUsed: session.order.pantryNeed,
        bakedAt: Date.now(),
      },
    },
    flash: {
      kind: "success",
      text: `Fresh ${recipe.name.toLowerCase()} are ready. Serve them to earn ${adjustedRevenue} coins at ${accuracyPercent}% bake accuracy.`,
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

  return {
    ...gameState,
    player: {
      ...player,
      bank: player.bank + saleReady.revenue,
      sprinkles: player.sprinkles + saleReady.sprinklesEarned,
    },
    session: {
      ...session,
      saleReady: null,
      recentSale: completedSale,
      recentSales,
    },
    flash: {
      kind: "success",
      text: supportsRecipeSets(player.SR)
        ? `Sold ${saleReady.batchCount} set${saleReady.batchCount > 1 ? "s" : ""} of ${saleReady.recipeName.toLowerCase()} for ${saleReady.revenue} coins.`
        : `Sold ${saleReady.recipeName.toLowerCase()} for ${saleReady.revenue} coins.`,
    },
  };
}

function queueRecipeUnlocks(existingUnlocks = [], newlyUnlockedRecipes = []) {
  const unlockMap = new Map((existingUnlocks ?? []).map((recipe) => [recipe.id, recipe]));

  for (const recipe of newlyUnlockedRecipes) {
    unlockMap.set(recipe.id, recipe);
  }

  return [...unlockMap.values()];
}
