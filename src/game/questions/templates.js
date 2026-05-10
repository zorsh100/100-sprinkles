import { clamp, randomInt, shuffle } from "../helpers.js?v=20260509-205459";

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
  return context.recipeName ?? "bakery treat";
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
    hint: "Count each treat, then count them all together.",
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
    hint: "Match the cupcakes in pairs, then count what is left over.",
  };
}

export function arithmeticAdditionStory({ targetDifficulty, stage, context }) {
  const maxValue = getScale(targetDifficulty, 10, 80);
  const a = randomInt(3, maxValue);
  const b = randomInt(3, maxValue);
  const answer = a + b;
  const easyPrompt = `${a} sprinkles. Then ${b} more. How many now?`;
  const standardPrompt = `You have ${a} sprinkles. You get ${b} more. How many sprinkles now?`;

  return {
    prompt: targetDifficulty < 180 ? easyPrompt : standardPrompt,
    answer,
    choices: makeChoices(answer, 10),
    hint: "Add the first amount and the extra amount together.",
  };
}

export function arithmeticSubtractionStory({ targetDifficulty, stage, context }) {
  const total = randomInt(12, getScale(targetDifficulty, 18, 95));
  const used = randomInt(3, Math.max(5, Math.floor(total * 0.65)));
  const answer = total - used;
  const easyPrompt = `${total} sprinkles. Use ${used}. How many left?`;
  const standardPrompt = `You have ${total} sprinkles. You use ${used}. How many are left?`;

  return {
    prompt: targetDifficulty < 220 ? easyPrompt : standardPrompt,
    answer,
    choices: makeChoices(answer, 10),
    hint: "Start with the total, then take away the part you used.",
  };
}

export function arithmeticMultiplicationGroups({ targetDifficulty, stage, context }) {
  const trays = randomInt(3, Math.max(4, getScale(targetDifficulty, 5, 12)));
  const each = randomInt(3, Math.max(6, getScale(targetDifficulty, 6, 12)));
  const answer = trays * each;

  return {
    prompt: `In ${stage}, you line up ${trays} trays of ${getRecipeLabel(context)} with ${each} pieces on each tray. How many pieces are there total?`,
    answer,
    choices: makeChoices(answer, 14),
    hint: "Equal groups can be solved with multiplication.",
  };
}

export function costRevenue({ targetDifficulty, stage, context }) {
  const batchCount = context.batchCount ?? 1;
  const trays = randomInt(Math.max(2, batchCount), getScale(targetDifficulty, 4, 10));
  const coins = randomInt(3, getScale(targetDifficulty, 6, 12));
  const answer = trays * coins;
  const easyPrompt = `${trays} trays. ${coins} coins each. How many coins?`;
  const standardPrompt = `You sell ${trays} trays. Each tray is ${coins} coins. How many coins do you get?`;

  return {
    prompt: targetDifficulty < 230 ? easyPrompt : standardPrompt,
    answer,
    choices: makeChoices(answer, 12),
    hint: "Same price each time means multiply the price by the number of trays.",
  };
}

export function costBatches({ targetDifficulty, context }) {
  const bags = randomInt(2, getScale(targetDifficulty, 4, 9));
  const costEach = randomInt(2, getScale(targetDifficulty, 5, 11));
  const answer = bags * costEach;

  return {
    prompt: `You need ${bags} ingredient bags for your ${getRecipeLabel(context)} order. Each bag costs ${costEach} coins. What is the total cost?`,
    answer,
    choices: makeChoices(answer, 12),
    hint: "Multiply the number of bags by the cost of each bag.",
  };
}

export function businessProfit({ targetDifficulty, stage, context }) {
  const spend = randomInt(10, getScale(targetDifficulty, 16, 34));
  const profit = randomInt(5, getScale(targetDifficulty, 10, 26));
  const earn = spend + profit;

  return {
    prompt: `After ${stage}, your ${getRecipeLabel(context)} sale brought in ${earn} coins and ingredients cost ${spend} coins. What is the profit?`,
    answer: profit,
    choices: makeChoices(profit, 8),
    hint: "Profit means the money earned minus the money spent.",
  };
}

export function fractionHalf({ targetDifficulty }) {
  const total = randomInt(3, getScale(targetDifficulty, 4, 8)) * 2;
  const answer = total / 2;

  return {
    prompt: `A brownie pan has ${total} squares. You frost 1/2 of them. How many squares get frosting?`,
    answer,
    choices: makeChoices(answer, 6),
    hint: "Half means split the total into 2 equal groups.",
  };
}

export function fractionQuarter({ targetDifficulty }) {
  const total = randomInt(2, getScale(targetDifficulty, 3, 6)) * 4;
  const answer = total / 4;

  return {
    prompt: `A cookie rack holds ${total} cookies. One fourth of them get rainbow sugar. How many cookies is 1/4?`,
    answer,
    choices: makeChoices(answer, 8),
    hint: "One fourth means split the total into 4 equal groups.",
  };
}

export function ratioScale({ targetDifficulty }) {
  const flourParts = randomInt(2, 5);
  const sugarParts = flourParts + randomInt(1, 3);
  const multiplier = randomInt(2, Math.max(3, getScale(targetDifficulty, 3, 5)));
  const flour = flourParts * multiplier;
  const answer = sugarParts * multiplier;

  return {
    prompt: `A batter uses flour to sugar in a ${flourParts}:${sugarParts} ratio. If you use ${flour} cups of flour, how many cups of sugar do you need?`,
    answer,
    choices: makeChoices(answer, 6),
    hint: "Scale both parts of the ratio by the same amount.",
  };
}

export function algebraicBalance({ targetDifficulty }) {
  const x = randomInt(4, getScale(targetDifficulty, 8, 18));
  const multiplier = randomInt(2, 3);
  const extra = randomInt(6, 18);
  const total = x * multiplier + extra;

  return {
    prompt: `${multiplier} equal sprinkle jars plus ${extra} bonus sprinkles make ${total}. How many sprinkles are in one jar?`,
    answer: x,
    choices: makeChoices(x, 8),
    hint: "Subtract the bonus first, then split the rest into equal groups.",
  };
}

export function optimizationBestDeal() {
  const options = [
    { label: "6-cookie box", size: 6, price: 8, answer: 6 },
    { label: "10-cookie box", size: 10, price: 12, answer: 10 },
  ];
  const best = options[1].price / options[1].size < options[0].price / options[0].size ? options[1] : options[0];

  return {
    prompt: "Which box is the better deal: 6 cookies for 8 coins or 10 cookies for 12 coins?",
    answer: best.answer,
    answerLabel: best.label,
    choices: shuffle([6, 10, 8, 12]),
    hint: "Compare the cost per cookie for each box.",
  };
}
