import { clamp, randomInt, shuffle } from "../helpers.js?v=20260509-235200";

function makeChoices(answer, spread = 3, minimum = 0) {
  const choices = new Set([answer]);

  while (choices.size < 4) {
    const offset = randomInt(-spread, spread);
    const next = Math.max(minimum, answer + offset);

    if (next !== answer) {
      choices.add(next);
    }
  }

  return shuffle([...choices]);
}

function getRecipeLabel(context) {
  return (context.recipeName ?? "treats").toLowerCase();
}

function getRecipeSingularLabel(context) {
  const label = getRecipeLabel(context);

  if (label.endsWith("ies")) {
    return `${label.slice(0, -3)}y`;
  }

  if (label.endsWith("s")) {
    return label.slice(0, -1);
  }

  return label;
}

function getRecipeEmoji(context) {
  const label = getRecipeLabel(context);

  if (label.includes("cookie")) return "🍪";
  if (label.includes("donut")) return "🍩";
  if (label.includes("muffin")) return "🧁";
  return "🧁";
}

function getStagePlace(stage) {
  const places = {
    prep: "prep table",
    mixing: "mixing bowl",
    timing: "oven rack",
    finishing: "cooling rack",
    serving: "bakery counter",
  };

  return places[stage] ?? "bakery counter";
}

function getStageTask(stage) {
  const tasks = {
    prep: "get ready for the oven",
    mixing: "go into the batter",
    timing: "go in the oven",
    finishing: "go on the tray",
    serving: "go to your customers",
  };

  return tasks[stage] ?? "go to your bakery";
}

function getScale(targetDifficulty, low, high) {
  const normalized = clamp((targetDifficulty - 100) / 800, 0, 1);
  return Math.round(low + (high - low) * normalized);
}

export function visualCountAll({ targetDifficulty }) {
  const maxToken = targetDifficulty < 60 ? 4 : 7;
  const addA = randomInt(1, maxToken);
  const addB = randomInt(1, maxToken);
  const answer = addA + addB;

  return {
    prompt: "How many treats are there all together?",
    promptSecondary: `${addA} + ${addB}`,
    answer,
    choices: makeChoices(answer, 4),
    visuals: {
      left: Array.from({ length: addA }, () => "🧁"),
      right: Array.from({ length: addB }, () => "🧁"),
    },
    hint: "Count both groups, then add them together.",
  };
}

export function visualCountDifference({ targetDifficulty }) {
  const left = randomInt(4, targetDifficulty < 80 ? 7 : 9);
  const right = randomInt(1, left - 1);
  const answer = left - right;

  return {
    prompt: "How many more cupcakes are on the top tray?",
    answer,
    choices: makeChoices(answer, 4),
    visuals: {
      left: Array.from({ length: left }, () => "🧁"),
      right: Array.from({ length: right }, () => "🧁"),
    },
    hint: "Match the cupcakes in pairs and count what is left.",
  };
}

export function arithmeticAdditionStory({ targetDifficulty, stage, context }) {
  const maxValue = getScale(targetDifficulty, 10, 80);
  const a = randomInt(3, maxValue);
  const b = randomInt(3, maxValue);
  const answer = a + b;
  const easyPrompt = `Your ${getStagePlace(stage)} had ${a} sprinkles. You added ${b} more. How many sprinkles are there now?`;
  const standardPrompt = `Your ${getStagePlace(stage)} held ${a} sprinkles for the ${getRecipeLabel(context)}. You poured in ${b} more. How many sprinkles does your bakery have there now?`;

  return {
    prompt: targetDifficulty < 180 ? easyPrompt : standardPrompt,
    answer,
    choices: makeChoices(answer, 10),
    scene: {
      kind: "groups",
      label: "Sprinkles in the bowl",
      operator: "+",
      groups: [
        { emoji: "✨", count: a },
        { emoji: "✨", count: b },
      ],
    },
    hint: "Add the sprinkles you started with and the sprinkles you added.",
  };
}

export function arithmeticSubtractionStory({ targetDifficulty, stage, context }) {
  const total = randomInt(12, getScale(targetDifficulty, 18, 95));
  const used = randomInt(3, Math.max(5, Math.floor(total * 0.65)));
  const answer = total - used;
  const easyPrompt = `Your ${getStagePlace(stage)} had ${total} ${getRecipeLabel(context)}. You used ${used}. How many are left?`;
  const standardPrompt = `You set ${total} ${getRecipeLabel(context)} on the ${getStagePlace(stage)}. Then ${used} went to the next step. How many ${getRecipeLabel(context)} are still there?`;

  return {
    prompt: targetDifficulty < 220 ? easyPrompt : standardPrompt,
    answer,
    choices: makeChoices(answer, 10),
    scene: {
      kind: "groups",
      label: "Treats still on the tray",
      operator: "−",
      groups: [
        { emoji: getRecipeEmoji(context), count: total },
        { emoji: getRecipeEmoji(context), count: used },
      ],
    },
    hint: "Start with all the treats, then take away the ones you used.",
  };
}

export function arithmeticMultiplicationGroups({ targetDifficulty, stage, context }) {
  const trays = randomInt(3, Math.max(4, getScale(targetDifficulty, 5, 12)));
  const each = randomInt(3, Math.max(6, getScale(targetDifficulty, 6, 12)));
  const answer = trays * each;
  const simplePrompt = `You loaded ${trays} trays with ${each} ${getRecipeLabel(context)} on each tray. How many ${getRecipeLabel(context)} ${getStageTask(stage)}?`;
  const standardPrompt = `During ${stage}, you lined up ${trays} trays of ${getRecipeLabel(context)} with ${each} on each tray. How many ${getRecipeLabel(context)} go through this step?`;
  const advancedPrompt = `Your ${stage} station has ${trays} trays of ${getRecipeLabel(context)}, ${each} per tray. How many ${getRecipeLabel(context)} does your bakery handle in this step?`;

  return {
    prompt: targetDifficulty < 300 ? simplePrompt : targetDifficulty < 500 ? standardPrompt : advancedPrompt,
    answer,
    choices: makeChoices(answer, 14),
    scene: {
      kind: "equal_groups",
      label: `${getRecipeSingularLabel(context)} trays`,
      operator: "×",
      groups: Array.from({ length: trays }, () => ({ emoji: getRecipeEmoji(context), count: each, frame: "🧺" })),
    },
    hint: `Multiply the number of trays by the ${getRecipeLabel(context)} on each tray.`,
  };
}

export function costRevenue({ targetDifficulty, stage, context }) {
  const batchCount = context.batchCount ?? 1;
  const trays = randomInt(Math.max(2, batchCount), getScale(targetDifficulty, 4, 10));
  const coins = randomInt(3, getScale(targetDifficulty, 6, 12));
  const answer = trays * coins;
  const simplePrompt = `A customer buys ${trays} trays of ${getRecipeLabel(context)}. Each tray sells for ${coins} coins. How many coins does your bakery earn?`;
  const standardPrompt = `At the ${getStagePlace(stage)}, you sell ${trays} trays of ${getRecipeLabel(context)} for ${coins} coins each. What is the total?`;
  const advancedPrompt = `Your bakery sells ${trays} trays of ${getRecipeLabel(context)} at ${coins} coins per tray. What is the total revenue?`;

  return {
    prompt: targetDifficulty < 300 ? simplePrompt : targetDifficulty < 500 ? standardPrompt : advancedPrompt,
    answer,
    choices: makeChoices(answer, 12),
    scene: {
      kind: "equal_groups",
      label: "Tray sales",
      operator: "×",
      groups: Array.from({ length: trays }, () => ({ emoji: "🪙", count: coins, frame: getRecipeEmoji(context) })),
    },
    hint: "Multiply the number of trays by the coins for each tray.",
  };
}

export function costBatches({ targetDifficulty, stage, context }) {
  const bags = randomInt(2, getScale(targetDifficulty, 4, 9));
  const costEach = randomInt(2, getScale(targetDifficulty, 5, 11));
  const answer = bags * costEach;
  const standardPrompt = `You need ${bags} ingredient bags for today's ${getRecipeLabel(context)}. Each bag costs ${costEach} coins. What is the total cost?`;
  const advancedPrompt = `For ${stage}, your ${getRecipeLabel(context)} order needs ${bags} ingredient bags at ${costEach} coins each. What is the total cost?`;

  return {
    prompt: targetDifficulty < 500 ? standardPrompt : advancedPrompt,
    answer,
    choices: makeChoices(answer, 12),
    scene: {
      kind: "equal_groups",
      label: "Ingredient bags",
      operator: "×",
      groups: Array.from({ length: bags }, () => ({ emoji: "🪙", count: costEach, frame: "🧺" })),
    },
    hint: "Multiply the number of bags by the cost of each bag.",
  };
}

export function businessProfit({ targetDifficulty, stage, context }) {
  const spend = randomInt(10, getScale(targetDifficulty, 16, 34));
  const profit = randomInt(5, getScale(targetDifficulty, 10, 26));
  const earn = spend + profit;
  const standardPrompt = `Your ${getRecipeLabel(context)} sale earned ${earn} coins. Ingredients cost ${spend} coins. What is the profit?`;
  const advancedPrompt = `After ${stage}, your ${getRecipeLabel(context)} sale brought in ${earn} coins and your ingredient cost was ${spend} coins. What profit did your bakery make?`;

  return {
    prompt: targetDifficulty < 500 ? standardPrompt : advancedPrompt,
    answer: profit,
    choices: makeChoices(profit, 8),
    hint: "Subtract the ingredient cost from the money earned.",
  };
}

export function fractionHalf({ targetDifficulty, stage, context }) {
  const total = randomInt(3, getScale(targetDifficulty, 4, 8)) * 2;
  const answer = total / 2;
  const standardPrompt = `You set out ${total} ${getRecipeLabel(context)} on the ${getStagePlace(stage)}. Half get sprinkles. How many get sprinkles?`;
  const advancedPrompt = `Your ${getRecipeLabel(context)} tray holds ${total} pieces. One half get the finishing topping. How many pieces is that?`;

  return {
    prompt: targetDifficulty < 500 ? standardPrompt : advancedPrompt,
    answer,
    choices: makeChoices(answer, 6),
    hint: "Split the total into 2 equal groups to find one half.",
  };
}

export function fractionQuarter({ targetDifficulty, stage, context }) {
  const total = randomInt(2, getScale(targetDifficulty, 3, 6)) * 4;
  const answer = total / 4;
  const standardPrompt = `You lined up ${total} ${getRecipeLabel(context)} on the ${getStagePlace(stage)}. One fourth get rainbow sugar. How many is that?`;
  const advancedPrompt = `Your bakery made ${total} ${getRecipeLabel(context)} for ${stage}. One fourth get the special topping. How many ${getRecipeLabel(context)} is one fourth?`;

  return {
    prompt: targetDifficulty < 500 ? standardPrompt : advancedPrompt,
    answer,
    choices: makeChoices(answer, 8),
    hint: "Split the total into 4 equal groups to find one fourth.",
  };
}

export function ratioScale({ targetDifficulty, stage, context }) {
  const flourParts = randomInt(2, 5);
  const sugarParts = flourParts + randomInt(1, 3);
  const multiplier = randomInt(2, Math.max(3, getScale(targetDifficulty, 3, 5)));
  const flour = flourParts * multiplier;
  const answer = sugarParts * multiplier;

  return {
    prompt: `Your ${getRecipeLabel(context)} batter uses a ${flourParts}:${sugarParts} flour-to-sugar ratio. If the ${getStagePlace(stage)} gets ${flour} cups of flour, how many cups of sugar does it need?`,
    answer,
    choices: makeChoices(answer, 6),
    hint: "Scale the sugar part by the same factor as the flour part.",
  };
}

export function algebraicBalance({ targetDifficulty, stage, context }) {
  const x = randomInt(4, getScale(targetDifficulty, 8, 18));
  const multiplier = randomInt(2, 3);
  const extra = randomInt(6, 18);
  const total = x * multiplier + extra;

  return {
    prompt: `At the ${getStagePlace(stage)}, ${multiplier} sprinkle jars and ${extra} loose sprinkles make ${total}. How many sprinkles are in one jar?`,
    answer: x,
    choices: makeChoices(x, 8),
    hint: "Subtract the loose sprinkles, then split the rest into equal jars.",
  };
}

export function optimizationBestDeal({ context }) {
  const item = getRecipeSingularLabel(context);
  const options = [
    { label: `6-${item} box`, size: 6, price: 8, answer: 6 },
    { label: `10-${item} box`, size: 10, price: 12, answer: 10 },
  ];
  const best = options[1].price / options[1].size < options[0].price / options[0].size ? options[1] : options[0];

  return {
    prompt: `Two ${item} boxes are on your bakery shelf. Which is the better deal: 6 for 8 coins or 10 for 12 coins?`,
    answer: best.answer,
    answerLabel: best.label,
    choices: shuffle([6, 10, 8, 12]),
    hint: "Find the cost for one item in each box, then compare them.",
  };
}
