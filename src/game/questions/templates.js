import { clamp, randomInt, shuffle } from "../helpers.js?v=20260510-050500";

const INGREDIENT_OPTIONS = [
  {
    key: "flour",
    label: "flour bags",
    singular: "flour bag",
    tokenText: "FL",
    variant: "flour",
  },
  {
    key: "sugar",
    label: "sugar sacks",
    singular: "sugar sack",
    tokenText: "SG",
    variant: "sugar",
  },
  {
    key: "eggs",
    label: "egg cartons",
    singular: "egg carton",
    tokenText: "EG",
    variant: "treat",
  },
];

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

function pluralize(word, count) {
  return `${word}${count === 1 ? "" : "s"}`;
}

function getStagePlace(stage) {
  const places = {
    prep: "prep table",
    mixing: "mixing counter",
    timing: "oven rack",
    finishing: "cooling rack",
    serving: "bakery counter",
  };

  return places[stage] ?? "bakery counter";
}

function getScale(targetDifficulty, low, high) {
  const normalized = clamp((targetDifficulty - 100) / 800, 0, 1);
  return Math.round(low + (high - low) * normalized);
}

function pickIngredient(excludeKey = null) {
  const pool = excludeKey
    ? INGREDIENT_OPTIONS.filter((ingredient) => ingredient.key !== excludeKey)
    : INGREDIENT_OPTIONS;

  return pool[randomInt(0, pool.length - 1)];
}

function getStageBatchMeta(stage, context) {
  const recipeLabel = getRecipeLabel(context);
  const recipeSingular = getRecipeSingularLabel(context);
  const recipeToken = getRecipeToken(context);

  const metaByStage = {
    prep: {
      place: "prep table",
      collectionLabel: "Prep Pans",
      containerSingular: "pan",
      containerPlural: "pans",
      frame: "Pan",
      groupTokenText: "PN",
      unitSingular: "paper liner",
      unitPlural: "paper liners",
      tokenText: "LN",
      variant: "sugar",
    },
    mixing: {
      place: "mixing counter",
      collectionLabel: "Mixing Bowls",
      containerSingular: "bowl",
      containerPlural: "bowls",
      frame: "Bowl",
      groupTokenText: "BW",
      unitSingular: "batter scoop",
      unitPlural: "batter scoops",
      tokenText: "SC",
      variant: "flour",
    },
    timing: {
      place: "oven rack",
      collectionLabel: `${toTitleCase(recipeSingular)} Trays`,
      containerSingular: "tray",
      containerPlural: "trays",
      frame: "Tray",
      groupTokenText: "TR",
      unitSingular: recipeSingular,
      unitPlural: recipeLabel,
      tokenText: recipeToken,
      variant: "treat",
    },
    finishing: {
      place: "cooling rack",
      collectionLabel: "Finishing Trays",
      containerSingular: "tray",
      containerPlural: "trays",
      frame: "Tray",
      groupTokenText: "TR",
      unitSingular: recipeSingular,
      unitPlural: recipeLabel,
      tokenText: recipeToken,
      variant: "treat",
    },
    serving: {
      place: "bakery counter",
      collectionLabel: "Bakery Boxes",
      containerSingular: "box",
      containerPlural: "boxes",
      frame: "Box",
      groupTokenText: "BX",
      unitSingular: recipeSingular,
      unitPlural: recipeLabel,
      tokenText: recipeToken,
      variant: "treat",
    },
  };

  return metaByStage[stage] ?? metaByStage.serving;
}

function getHalfPrompt(stage, total, context) {
  const recipeLabel = getRecipeLabel(context);

  if (stage === "mixing") {
    return `The baker sets out ${total} batter scoops in the mixing bowls. Half are vanilla scoops. How many vanilla scoops are there?`;
  }

  if (stage === "serving") {
    return `${total} ${recipeLabel} are boxed at the bakery counter. Half go to the school order. How many ${recipeLabel} is that?`;
  }

  return `${total} ${recipeLabel} are cooling on the rack. Half get glaze. How many get glaze?`;
}

function getThirdPrompt(stage, total, context) {
  const recipeLabel = getRecipeLabel(context);

  if (stage === "mixing") {
    return `The mixing station split ${total} batter scoops evenly into 3 flavor bowls. How many scoops are one third of the batch?`;
  }

  if (stage === "serving") {
    return `${total} ${recipeLabel} are packed for 3 class tables. How many ${recipeLabel} is one third of the order?`;
  }

  return `${total} ${recipeLabel} are on the cooling rack. One third get berry drizzle. How many get berry drizzle?`;
}

function getQuarterPrompt(stage, total, context) {
  const recipeLabel = getRecipeLabel(context);

  if (stage === "serving") {
    return `${total} ${recipeLabel} are boxed for customers. One fourth go into party boxes. How many ${recipeLabel} is one fourth?`;
  }

  return `${total} ${recipeLabel} are lined up on finishing trays. One fourth get the star topping. How many treats is that?`;
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
  const supply = getStageBatchMeta(stage, context);
  const easyPrompt = `Your ${supply.place} already has ${a} ${supply.unitPlural}. You add ${b} more for the ${getRecipeLabel(context)}. How many ${supply.unitPlural} are there now?`;
  const standardPrompt = `At the ${supply.place}, the baker starts with ${a} ${supply.unitPlural}. Then ${b} more join the station. How many ${supply.unitPlural} are there now?`;

  return {
    prompt: targetDifficulty < 180 ? easyPrompt : standardPrompt,
    answer,
    choices: makeChoices(answer, 10),
    scene: {
      kind: "groups",
      label: supply.collectionLabel,
      caption: "Count what was already there and what the baker just added.",
      operator: "+",
      groups: [
        { tokenText: supply.tokenText, variant: supply.variant, count: a, frame: "Start" },
        { tokenText: supply.tokenText, variant: supply.variant, count: b, frame: "Added" },
      ],
    },
    hint: `Add the ${supply.unitPlural} you started with and the ${supply.unitPlural} you added.`,
  };
}

export function arithmeticSubtractionStory({ targetDifficulty, stage, context }) {
  const total = randomInt(12, getScale(targetDifficulty, 18, 95));
  const used = randomInt(3, Math.max(5, Math.floor(total * 0.65)));
  const answer = total - used;
  const supply = getStageBatchMeta(stage, context);
  const easyPrompt = `Your ${supply.place} started with ${total} ${supply.unitPlural}. ${used} moved to the next step. How many are left?`;
  const standardPrompt = `You set ${total} ${supply.unitPlural} on the ${supply.place}. Then ${used} rolled ahead to the next bakery step. How many ${supply.unitPlural} are still there?`;

  return {
    prompt: targetDifficulty < 220 ? easyPrompt : standardPrompt,
    answer,
    choices: makeChoices(answer, 10),
    scene: {
      kind: "groups",
      label: "Still on the station",
      caption: "Start with the full set, then take away the ones that moved on.",
      operator: "−",
      groups: [
        { tokenText: supply.tokenText, variant: supply.variant, count: total, frame: "Start" },
        { tokenText: supply.tokenText, variant: supply.variant, count: used, frame: "Moved" },
      ],
    },
    hint: "Start with all of them, then take away the ones that moved to the next step.",
  };
}

export function arithmeticMultiplicationGroups({ targetDifficulty, stage, context }) {
  const meta = getStageBatchMeta(stage, context);
  const groups = randomInt(3, Math.max(4, getScale(targetDifficulty, 5, 8)));
  const each = randomInt(4, Math.max(6, getScale(targetDifficulty, 6, 9)));
  const answer = groups * each;
  const promptByStage = {
    prep: `The baker lines up ${groups} prep pans with ${each} ${meta.unitPlural} in each pan. How many ${meta.unitPlural} are ready?`,
    mixing: `${groups} mixing bowls each need ${each} ${meta.unitPlural}. How many ${meta.unitPlural} go into the mixing station?`,
    timing: `${groups} oven trays each hold ${each} ${meta.unitPlural}. How many ${meta.unitPlural} go into the oven?`,
    finishing: `${groups} cooling trays each have ${each} ${meta.unitPlural} waiting for toppings. How many ${meta.unitPlural} are on the rack?`,
    serving: `${groups} bakery boxes each hold ${each} ${meta.unitPlural}. How many ${meta.unitPlural} are ready for customers?`,
  };

  return {
    prompt: promptByStage[stage] ?? promptByStage.serving,
    answer,
    choices: makeChoices(answer, 14),
    scene: {
      kind: "equal_groups",
      label: meta.collectionLabel,
      caption: `Each ${meta.containerSingular} holds the same number. Count the equal groups.`,
      operator: "×",
      groups: Array.from({ length: groups }, () => ({
        tokenText: meta.tokenText,
        variant: meta.variant,
        count: each,
        frame: toTitleCase(meta.containerSingular),
      })),
    },
    hint: `Multiply the number of ${meta.containerPlural} by the ${meta.unitPlural} in each one.`,
  };
}

export function arithmeticArrayRows({ targetDifficulty, stage, context }) {
  const meta = getStageBatchMeta(stage, context);
  const rows = randomInt(3, Math.max(4, getScale(targetDifficulty, 4, 6)));
  const columns = randomInt(4, Math.max(6, getScale(targetDifficulty, 5, 8)));
  const answer = rows * columns;
  const promptByStage = {
    prep: `One prep pan has ${rows} rows of ${columns} paper liners. How many liners are set out?`,
    timing: `An oven tray has ${rows} rows of ${columns} ${meta.unitPlural}. How many ${meta.unitPlural} are baking?`,
    finishing: `A finishing tray shows ${rows} rows of ${columns} ${meta.unitPlural}. How many treats are on the rack?`,
    serving: `A bakery display tray has ${rows} rows of ${columns} ${meta.unitPlural}. How many treats are on display?`,
  };

  return {
    prompt: promptByStage[stage] ?? promptByStage.serving,
    answer,
    choices: makeChoices(answer, 14),
    scene: {
      kind: "equal_groups",
      label: `${rows} Rows on the ${toTitleCase(meta.frame)}`,
      caption: "Count rows and columns to find the full array.",
      operator: "×",
      groups: Array.from({ length: rows }, (_, index) => ({
        tokenText: meta.tokenText,
        variant: meta.variant,
        count: columns,
        frame: `Row ${index + 1}`,
      })),
    },
    hint: "Multiply the number of rows by the number in each row.",
  };
}

export function arithmeticDivisionShare({ targetDifficulty, stage, context }) {
  const meta = getStageBatchMeta(stage, context);
  const groups = randomInt(3, Math.max(4, getScale(targetDifficulty, 4, 6)));
  const each = randomInt(4, Math.max(5, getScale(targetDifficulty, 5, 7)));
  const total = groups * each;
  const promptByStage = {
    prep: `${total} paper liners are shared equally into ${groups} pans. How many liners go in each pan?`,
    mixing: `${total} batter scoops are shared equally into ${groups} bowls. How many scoops go in each bowl?`,
    timing: `${total} ${meta.unitPlural} are spread equally across ${groups} oven trays. How many go on each tray?`,
    finishing: `${total} ${meta.unitPlural} need to be shared equally onto ${groups} finishing trays. How many go on each tray?`,
    serving: `${total} ${meta.unitPlural} are packed equally into ${groups} boxes. How many go in each box?`,
  };

  return {
    prompt: promptByStage[stage] ?? promptByStage.serving,
    answer: each,
    choices: makeChoices(each, 8, 1),
    scene: {
      kind: "groups",
      label: "Share the Batch Evenly",
      caption: `Split the whole set into ${groups} equal ${meta.containerPlural}.`,
      operator: "÷",
      groups: [
        { tokenText: meta.tokenText, variant: meta.variant, count: total, frame: "Whole Batch" },
        { tokenText: meta.groupTokenText, variant: "treat", count: groups, frame: toTitleCase(meta.containerPlural) },
      ],
    },
    hint: `Divide the total by the number of ${meta.containerPlural}.`,
  };
}

export function arithmeticMissingFactor({ targetDifficulty, stage, context }) {
  const meta = getStageBatchMeta(stage, context);
  const each = randomInt(4, Math.max(6, getScale(targetDifficulty, 6, 8)));
  const groups = randomInt(3, Math.max(4, getScale(targetDifficulty, 4, 7)));
  const total = groups * each;
  const promptByStage = {
    prep: `The baker used ${total} paper liners with ${each} liners in each pan. How many pans were filled?`,
    timing: `The oven rack has ${total} ${meta.unitPlural} with ${each} on each tray. How many trays are there?`,
    serving: `${total} ${meta.unitPlural} are packed with ${each} in each box. How many boxes can you fill?`,
  };

  return {
    prompt: promptByStage[stage] ?? promptByStage.serving,
    answer: groups,
    choices: makeChoices(groups, 6, 1),
    scene: {
      kind: "groups",
      label: "Find the Number of Groups",
      caption: `Use the total and the size of each ${meta.containerSingular} to find how many ${meta.containerPlural} there are.`,
      operator: "÷",
      groups: [
        { tokenText: meta.tokenText, variant: meta.variant, count: total, frame: "Total" },
        { tokenText: meta.tokenText, variant: meta.variant, count: each, frame: `Each ${toTitleCase(meta.containerSingular)}` },
      ],
    },
    hint: `Divide the total by the number in each ${meta.containerSingular}.`,
  };
}

export function costRevenue({ targetDifficulty, context }) {
  const boxes = randomInt(3, getScale(targetDifficulty, 4, 8));
  const coins = randomInt(4, getScale(targetDifficulty, 6, 10));
  const answer = boxes * coins;
  const recipeLabel = getRecipeLabel(context);
  const recipeSingular = getRecipeSingularLabel(context);

  return {
    prompt: `At the bakery counter, a customer buys ${boxes} boxes of ${recipeLabel}. Each box sells for ${coins} coins. How many coins does the bakery earn?`,
    answer,
    choices: makeChoices(answer, 12),
    scene: {
      kind: "equal_groups",
      label: `${toTitleCase(recipeSingular)} Boxes`,
      caption: "Each box earns the same number of gold coins.",
      operator: "×",
      groups: Array.from({ length: boxes }, () => ({
        tokenText: "$",
        variant: "coin",
        count: coins,
        frame: "Box",
      })),
    },
    hint: "Multiply the number of boxes by the coins for each box.",
  };
}

export function costBatches({ targetDifficulty, stage }) {
  const ingredient = pickIngredient();
  const bags = randomInt(3, getScale(targetDifficulty, 4, 7));
  const costEach = randomInt(3, getScale(targetDifficulty, 5, 8));
  const answer = bags * costEach;
  const promptByStage = {
    prep: `Before the bake starts, you buy ${bags} ${ingredient.label} for ${costEach} coins each. What is the total cost?`,
    mixing: `The mixing station needs ${bags} more ${ingredient.label}. Each one costs ${costEach} coins. What is the total cost?`,
  };

  return {
    prompt: promptByStage[stage] ?? promptByStage.prep,
    answer,
    choices: makeChoices(answer, 12),
    scene: {
      kind: "equal_groups",
      label: toTitleCase(ingredient.label),
      caption: `Each ${ingredient.singular} costs the same amount.`,
      operator: "×",
      groups: Array.from({ length: bags }, () => ({
        tokenText: "$",
        variant: "coin",
        count: costEach,
        frame: toTitleCase(ingredient.singular),
      })),
    },
    hint: `Multiply the number of ${ingredient.label} by the cost of each one.`,
  };
}

export function costIngredientCombo({ targetDifficulty, stage }) {
  const firstIngredient = pickIngredient();
  const secondIngredient = pickIngredient(firstIngredient.key);
  const firstCount = randomInt(2, getScale(targetDifficulty, 3, 5));
  const secondCount = randomInt(2, getScale(targetDifficulty, 3, 5));
  const firstCost = randomInt(3, getScale(targetDifficulty, 4, 7));
  const secondCost = randomInt(3, getScale(targetDifficulty, 4, 7));
  const firstTotal = firstCount * firstCost;
  const secondTotal = secondCount * secondCost;
  const answer = firstTotal + secondTotal;
  const promptByStage = {
    prep: `The prep table needs ${firstCount} ${firstIngredient.label} at ${firstCost} coins each and ${secondCount} ${secondIngredient.label} at ${secondCost} coins each. What is the total cost?`,
    mixing: `To restock the mixing station, you buy ${firstCount} ${firstIngredient.label} at ${firstCost} coins each and ${secondCount} ${secondIngredient.label} at ${secondCost} coins each. What is the total cost?`,
  };

  return {
    prompt: promptByStage[stage] ?? promptByStage.prep,
    answer,
    choices: makeChoices(answer, 16),
    scene: {
      kind: "groups",
      label: "Two Ingredient Costs",
      caption: "Find each ingredient total, then add them together.",
      operator: "+",
      groups: [
        { tokenText: "$", variant: "coin", count: firstTotal, frame: toTitleCase(firstIngredient.label) },
        { tokenText: "$", variant: "coin", count: secondTotal, frame: toTitleCase(secondIngredient.label) },
      ],
    },
    hint: "Multiply each ingredient count by its cost, then add the two totals.",
  };
}

export function arithmeticMultiStepTotal({ targetDifficulty, stage, context }) {
  const meta = getStageBatchMeta(stage, context);
  const groups = randomInt(3, Math.max(4, getScale(targetDifficulty, 4, 6)));
  const each = randomInt(4, Math.max(6, getScale(targetDifficulty, 5, 8)));
  const extra = randomInt(2, Math.max(3, getScale(targetDifficulty, 4, 7)));
  const answer = groups * each + extra;
  const promptByStage = {
    timing: `The oven rack holds ${groups} trays with ${each} ${meta.unitPlural} on each tray, plus ${extra} more on the tester pan. How many ${meta.unitPlural} are at the timing station?`,
    finishing: `The cooling rack has ${groups} trays of ${each} ${meta.unitPlural} each, and ${extra} extra treats just arrived from the small pan. How many ${meta.unitPlural} are ready to decorate?`,
    serving: `The bakery counter has ${groups} boxes with ${each} ${meta.unitPlural} each, plus ${extra} extra treats on the sample stand. How many ${meta.unitPlural} are out front?`,
  };

  return {
    prompt: promptByStage[stage] ?? promptByStage.finishing,
    answer,
    choices: makeChoices(answer, 16),
    hint: `First multiply ${groups} by ${each}, then add the extra ${extra}.`,
  };
}

export function businessProfit({ targetDifficulty, context }) {
  const boxes = randomInt(3, getScale(targetDifficulty, 4, 7));
  const priceEach = randomInt(5, getScale(targetDifficulty, 6, 10));
  const revenue = boxes * priceEach;
  const spend = randomInt(10, Math.max(12, revenue - 8));
  const answer = revenue - spend;
  const recipeLabel = getRecipeLabel(context);

  return {
    prompt: `At the bakery counter, you sell ${boxes} boxes of ${recipeLabel} for ${priceEach} coins each. Ingredients cost ${spend} coins. What profit does the bakery keep?`,
    answer,
    choices: makeChoices(answer, 12, 1),
    scene: {
      kind: "groups",
      label: "Profit Check",
      caption: "Find the money earned, then take away the cost.",
      operator: "−",
      groups: [
        { tokenText: "$", variant: "coin", count: revenue, frame: "Earned" },
        { tokenText: "$", variant: "coin", count: spend, frame: "Cost" },
      ],
    },
    hint: "Multiply to find the money earned, then subtract the ingredient cost.",
  };
}

export function fractionHalf({ targetDifficulty, stage, context }) {
  const total = randomInt(4, getScale(targetDifficulty, 5, 10)) * 2;
  const answer = total / 2;

  return {
    prompt: getHalfPrompt(stage, total, context),
    answer,
    choices: makeChoices(answer, 8, 1),
    hint: "Split the total into 2 equal groups to find one half.",
  };
}

export function fractionThird({ targetDifficulty, stage, context }) {
  const total = randomInt(3, getScale(targetDifficulty, 4, 8)) * 3;
  const answer = total / 3;

  return {
    prompt: getThirdPrompt(stage, total, context),
    answer,
    choices: makeChoices(answer, 10, 1),
    hint: "Split the total into 3 equal groups to find one third.",
  };
}

export function fractionQuarter({ targetDifficulty, stage, context }) {
  const total = randomInt(3, getScale(targetDifficulty, 4, 8)) * 4;
  const answer = total / 4;

  return {
    prompt: getQuarterPrompt(stage, total, context),
    answer,
    choices: makeChoices(answer, 10, 1),
    hint: "Split the total into 4 equal groups to find one fourth.",
  };
}

export function arithmeticRemainderLeftover({ targetDifficulty, context }) {
  const boxSize = randomInt(4, Math.max(5, getScale(targetDifficulty, 5, 8)));
  const fullBoxes = randomInt(3, Math.max(4, getScale(targetDifficulty, 4, 6)));
  const leftover = randomInt(1, boxSize - 1);
  const total = fullBoxes * boxSize + leftover;
  const recipeLabel = getRecipeLabel(context);

  return {
    prompt: `${total} ${recipeLabel} are packed ${boxSize} to a box. After all the full boxes are filled, how many are left for the sample plate?`,
    answer: leftover,
    choices: makeChoices(leftover, 4, 0),
    hint: "Use division to fill the full boxes, then find the leftover treats.",
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

export function algebraicBalance({ targetDifficulty, stage }) {
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
