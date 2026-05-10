import { createInitialSession, STAGES } from "./data.js";
import {
  canAffordIngredients,
  clamp,
  getMissingPantry,
  getOrderRevenue,
  getPantryNeed,
  getRecipeById,
  getShopCost,
} from "./helpers.js";
import { generateQuestion } from "./questions/generator.js";
import { applySRResult } from "./sr.js";

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
      batchCount: clamp(Number(batchCount) || 1, 1, 6),
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

  if (player.SR >= 300) {
    const need = getPantryNeed(recipe, session.batchCount);

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

  const pantryNeed = getPantryNeed(recipe, session.batchCount);
  const estimatedRevenue = getOrderRevenue(recipe, session.batchCount, player.SR);
  const sprinkleReward = recipe.sprinkleReward * session.batchCount;
  const order = {
    recipeId: recipe.id,
    batchCount: session.batchCount,
    stageIndex: 0,
    completedStages: [],
    pantryNeed,
    estimatedRevenue,
    sprinkleReward,
    status: "baking",
    startedAt: Date.now(),
  };
  const nextQuestion = generateQuestion({
    SR: player.SR,
    stage: STAGES[0],
    context: {
      recipeId: recipe.id,
      recipeName: recipe.name,
      batchCount: session.batchCount,
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
        player.SR < 100
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
        text: `Not quite. ${question.hint} SR ${srResult.delta}.`,
      },
    };
  }

  const nextStageIndex = session.order.stageIndex + 1;
  const completedStages = [...session.order.completedStages, question.stage];

  if (nextStageIndex >= STAGES.length) {
    return finishOrder(gameState, srResult.player, completedStages);
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
      },
      questionResult: {
        correct: true,
        selectedAnswer: Number(selectedAnswer),
        attemptNumber,
        srDelta: srResult.delta,
      },
      currentQuestion: nextQuestion,
      recentTemplates: [...session.recentTemplates, nextQuestion.templateId].slice(-6),
    },
    flash: {
      kind: "success",
      text: `${question.stage} is complete. On to ${STAGES[nextStageIndex]}. SR +${srResult.delta}.`,
    },
  };
}

function finishOrder(gameState, updatedPlayer, completedStages) {
  const { session } = gameState;
  const recipe = getRecipeById(session.order.recipeId);
  const revenue = getOrderRevenue(recipe, session.order.batchCount, updatedPlayer.SR);
  const sprinklesEarned = recipe.sprinkleReward * session.order.batchCount;
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
        batchCount: session.batchCount,
        recentTemplates: session.recentTemplates,
        recentSale: session.recentSale,
      }),
      saleReady: {
        recipeId: recipe.id,
        recipeName: recipe.name,
        recipeIcon: recipe.icon,
        batchCount: session.order.batchCount,
        completedStages,
        revenue,
        sprinklesEarned: sprinklesEarned + 2,
        pantryUsed: session.order.pantryNeed,
        bakedAt: Date.now(),
      },
    },
    flash: {
      kind: "success",
      text: `Fresh ${recipe.name.toLowerCase()} are ready. Serve them to earn ${revenue} coins.`,
    },
  };
}

export function sellCurrentOrder(gameState) {
  const { player, session } = gameState;
  const saleReady = session.saleReady;

  if (!saleReady) {
    return setFlash(gameState, "error", "Finish baking a batch before trying to sell it.");
  }

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
      recentSale: {
        ...saleReady,
        soldAt: Date.now(),
      },
    },
    flash: {
      kind: "success",
      text: `Sold ${saleReady.batchCount} batch${saleReady.batchCount > 1 ? "es" : ""} of ${saleReady.recipeName.toLowerCase()} for ${saleReady.revenue} coins.`,
    },
  };
}
