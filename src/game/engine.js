import { createInitialSession, STAGES } from "./data.js";
import {
  canAffordIngredients,
  clamp,
  getOrderRevenue,
  getPantryNeed,
  getRecipeById,
  getShopCost,
} from "./helpers.js";
import { generateQuestion } from "./questions/generator.js";

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

export function buyIngredient(gameState, ingredient) {
  const player = gameState.player;
  const cost = getShopCost(ingredient);

  if (player.bank < cost) {
    return setFlash(gameState, "error", `You need ${cost} coins to buy ${ingredient}.`);
  }

  return {
    ...gameState,
    player: {
      ...player,
      bank: player.bank - cost,
      pantry: {
        ...player.pantry,
        [ingredient]: player.pantry[ingredient] + 1,
      },
    },
    flash: {
      kind: "success",
      text: `You bought 1 ${ingredient}. Great stocking.`,
    },
  };
}

export function startOrder(gameState) {
  const { player, session } = gameState;
  const recipe = getRecipeById(session.selectedRecipeId);

  if (!recipe) {
    return setFlash(gameState, "error", "Pick a recipe first.");
  }

  if (player.SR >= 300) {
    const need = getPantryNeed(recipe, session.batchCount);

    if (!canAffordIngredients(player, need)) {
      return setFlash(
        gameState,
        "error",
        "Your pantry needs more ingredients before this bake can start.",
      );
    }
  }

  const order = {
    recipeId: recipe.id,
    batchCount: session.batchCount,
    stageIndex: 0,
    completedStages: [],
  };

  return {
    ...gameState,
    session: {
      ...session,
      order,
      questionResult: null,
      currentQuestion: generateQuestion({
        SR: player.SR,
        stage: STAGES[0],
      }),
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
  const srDelta = correct ? 12 : -7;
  const nextSR = clamp(player.SR + srDelta, 0, 1000);

  if (!correct) {
    return {
      ...gameState,
      player: {
        ...player,
        SR: nextSR,
      },
      session: {
        ...session,
        questionResult: {
          correct: false,
          selectedAnswer: Number(selectedAnswer),
        },
      },
      flash: {
        kind: "error",
        text: `Not quite. ${question.hint}`,
      },
    };
  }

  const nextStageIndex = session.order.stageIndex + 1;
  const completedStages = [...session.order.completedStages, question.stage];

  if (nextStageIndex >= STAGES.length) {
    return finishOrder(gameState, nextSR, completedStages);
  }

  return {
    ...gameState,
    player: {
      ...player,
      SR: nextSR,
      sprinkles: player.sprinkles + 2,
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
      },
      currentQuestion: generateQuestion({
        SR: nextSR,
        stage: STAGES[nextStageIndex],
      }),
    },
    flash: {
      kind: "success",
      text: `${question.stage} is complete. On to ${STAGES[nextStageIndex]}.`,
    },
  };
}

function finishOrder(gameState, nextSR, completedStages) {
  const { player, session } = gameState;
  const recipe = getRecipeById(session.order.recipeId);
  const revenue = getOrderRevenue(recipe, session.order.batchCount, nextSR);
  const sprinklesEarned = recipe.sprinkleReward * session.order.batchCount;
  const pantry = { ...player.pantry };

  if (nextSR >= 300) {
    const need = getPantryNeed(recipe, session.order.batchCount);

    Object.entries(need).forEach(([ingredient, amount]) => {
      pantry[ingredient] -= amount;
    });
  }

  return {
    ...gameState,
    player: {
      ...player,
      SR: nextSR,
      bank: player.bank + revenue,
      sprinkles: player.sprinkles + sprinklesEarned + 2,
      pantry,
    },
    session: createInitialSession({
      selectedRecipeId: session.selectedRecipeId,
      batchCount: session.batchCount,
    }),
    flash: {
      kind: "success",
      text: `Order complete. You earned ${revenue} coins and ${sprinklesEarned + 2} sprinkles.`,
    },
    lastOrder: {
      recipeId: recipe.id,
      completedStages,
      revenue,
      sprinklesEarned,
    },
  };
}
