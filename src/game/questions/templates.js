import { clamp, randomInt, shuffle } from "../helpers.js?v=20260510-024900";

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

function getRecipeToken(context) {
  const words = getRecipeLabel(context)
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) {
    return "TR";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function toTitleCase(value) {
  return String(value)
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
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

function getStageSupply(stage) {
  const supplies = {
    prep: {
      label: "measuring scoops",
      tokenText: "SC",
      variant: "sugar",
      frame: "Bowls",
      labelText: "Sugar scoops at prep",
    },
    mixing: {
      label: "mixing scoops",
      tokenText: "MX",
      variant: "flour",
      frame: "Bowl",
      labelText: "Scoops in the bowl",
    },
    timing: {
      label: "oven trays",
      tokenText: "TR",
      variant: "treat",
      frame: "Rack",
      labelText: "Trays headed to the oven",
    },
    finishing: {
      label: "topping swirls",
      tokenText: "TP",
      variant: "sugar",
      frame: "Tray",
      labelText: "Finishing swirls",
    },
    serving: {
      label: "boxed treats",
      tokenText: "BX",
      variant: "treat",
      frame: "Box",
      labelText: "Treats at the counter",
    },
  };

  return supplies[stage] ?? supplies.prep;
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
  const supply = getStageSupply(stage);
  const easyPrompt = `Your ${getStagePlace(stage)} already has ${a} ${supply.label}. You add ${b} more for the ${getRecipeLabel(context)}. How many ${supply.label} are there now?`;
  const standardPrompt = `At the ${getStagePlace(stage)}, the baker measured ${a} ${supply.label} for the ${getRecipeLabel(context)}. Then ${b} more joined the station. How many ${supply.label} are there now?`;

  return {
    prompt: targetDifficulty < 180 ? easyPrompt : standardPrompt,
    answer,
    choices: makeChoices(answer, 10),
    scene: {
      kind: "groups",
      label: supply.labelText,
      caption: "Count what was already there and what the baker just added.",
      operator: "+",
      groups: [
        { tokenText: supply.tokenText, variant: supply.variant, count: a, frame: supply.frame },
        { tokenText: supply.tokenText, variant: supply.variant, count: b, frame: "Added" },
      ],
    },
    hint: `Add the ${supply.label} you started with and the ${supply.label} you added.`,
  };
}

export function arithmeticSubtractionStory({ targetDifficulty, stage, context }) {
  const total = randomInt(12, getScale(targetDifficulty, 18, 95));
  const used = randomInt(3, Math.max(5, Math.floor(total * 0.65)));
  const answer = total - used;
  const recipeLabel = getRecipeLabel(context);
  const tokenText = getRecipeToken(context);
  const easyPrompt = `Your ${getStagePlace(stage)} started with ${total} ${recipeLabel}. ${used} moved to the next step. How many are left?`;
  const standardPrompt = `You set ${total} ${recipeLabel} on the ${getStagePlace(stage)}. Then ${used} rolled ahead to the next bakery step. How many ${recipeLabel} are still there?`;

  return {
    prompt: targetDifficulty < 220 ? easyPrompt : standardPrompt,
    answer,
    choices: makeChoices(answer, 10),
    scene: {
      kind: "groups",
      label: "Treats still on the station",
      caption: "Start with the full tray, then take away the treats that moved on.",
      operator: "−",
      groups: [
        { tokenText, variant: "treat", count: total, frame: "Start" },
        { tokenText, variant: "treat", count: used, frame: "Moved" },
      ],
    },
    hint: "Start with all the treats, then take away the ones that moved to the next step.",
  };
}

export function arithmeticMultiplicationGroups({ targetDifficulty, stage, context }) {
  const trays = randomInt(3, Math.max(4, getScale(targetDifficulty, 5, 12)));
  const each = randomInt(3, Math.max(6, getScale(targetDifficulty, 6, 12)));
  const answer = trays * each;
  const recipeLabel = getRecipeLabel(context);
  const tokenText = getRecipeToken(context);
  const simplePrompt = `You loaded ${trays} trays with ${each} ${recipeLabel} on each tray. How many ${recipeLabel} ${getStageTask(stage)}?`;
  const standardPrompt = `During ${stage}, you lined up ${trays} trays of ${recipeLabel} with ${each} on each tray. How many ${recipeLabel} go through this step?`;
  const advancedPrompt = `Your ${stage} station has ${trays} trays of ${recipeLabel}, ${each} per tray. How many ${recipeLabel} does your bakery handle in this step?`;

  return {
    prompt: targetDifficulty < 300 ? simplePrompt : targetDifficulty < 500 ? standardPrompt : advancedPrompt,
    answer,
    choices: makeChoices(answer, 14),
    scene: {
      kind: "equal_groups",
      label: `${toTitleCase(getRecipeSingularLabel(context))} Trays`,
      caption: "Each frame is one tray. Count the same-size groups.",
      operator: "×",
      groups: Array.from({ length: trays }, () => ({ tokenText, variant: "treat", count: each, frame: "Tray" })),
    },
    hint: `Multiply the number of trays by the ${recipeLabel} on each tray.`,
  };
}

export function costRevenue({ targetDifficulty, stage, context }) {
  const batchCount = context.batchCount ?? 1;
  const trays = randomInt(Math.max(2, batchCount), getScale(targetDifficulty, 4, 10));
  const coins = randomInt(3, getScale(targetDifficulty, 6, 12));
  const answer = trays * coins;
  const recipeLabel = getRecipeLabel(context);
  const orderLabel = `${toTitleCase(getRecipeSingularLabel(context))} Order`;
  const simplePrompt = `A customer buys ${trays} trays of ${recipeLabel}. Each tray sells for ${coins} coins. How many coins does your bakery earn?`;
  const standardPrompt = `At the ${getStagePlace(stage)}, you sell ${trays} trays of ${recipeLabel} for ${coins} coins each. What is the total?`;
  const advancedPrompt = `Your bakery sells ${trays} trays of ${recipeLabel} at ${coins} coins per tray. What is the total revenue?`;

  return {
    prompt: targetDifficulty < 300 ? simplePrompt : targetDifficulty < 500 ? standardPrompt : advancedPrompt,
    answer,
    choices: makeChoices(answer, 12),
    scene: {
      kind: "equal_groups",
      label: orderLabel,
      caption: "Each tray matches the same coin total, so count equal groups of gold coins.",
      operator: "×",
      groups: Array.from({ length: trays }, () => ({ tokenText: "$", variant: "coin", count: coins, frame: "Tray" })),
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
      label: "Ingredient Bags",
      caption: "Every bag costs the same amount, so count equal groups of gold coins.",
      operator: "×",
      groups: Array.from({ length: bags }, () => ({ tokenText: "$", variant: "coin", count: costEach, frame: "Bag" })),
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
  const standardPrompt = `You set out ${total} ${getRecipeLabel(context)} on the ${getStagePlace(stage)}. Half get glaze. How many get glaze?`;
  const advancedPrompt = `Your ${getRecipeLabel(context)} tray holds ${total} pieces. One half get the finishing glaze. How many pieces is that?`;

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
  const standardPrompt = `You lined up ${total} ${getRecipeLabel(context)} on the ${getStagePlace(stage)}. One fourth get berry topping. How many is that?`;
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
    prompt: `At the ${getStagePlace(stage)}, ${multiplier} topping jars and ${extra} loose berries make ${total} toppings. How many toppings are in one jar?`,
    answer: x,
    choices: makeChoices(x, 8),
    hint: "Subtract the loose berries, then split the rest into equal jars.",
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
    prompt: `Two ${item} boxes are in your bakery case. Which is the better deal: 6 for 8 coins or 10 for 12 coins?`,
    answer: best.answer,
    answerLabel: best.label,
    choices: shuffle([6, 10, 8, 12]),
    hint: "Find the cost for one item in each box, then compare them.",
  };
}
