import { randomInt, shuffle } from "../helpers.js";

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

function visualArithmetic({ SR }) {
  const addA = randomInt(1, SR < 50 ? 4 : 6);
  const addB = randomInt(1, SR < 50 ? 4 : 6);
  const answer = addA + addB;

  return {
    type: "arithmetic_visual",
    prompt: "How many treats are there all together?",
    promptSecondary: `${addA} + ${addB}`,
    answer,
    choices: makeChoices(answer, 4),
    visuals: {
      left: Array.from({ length: addA }, () => "🧁"),
      right: Array.from({ length: addB }, () => "🍩"),
    },
    hint: "Count each treat, then count them all together.",
  };
}

function arithmetic({ SR, stage }) {
  const base = SR < 250 ? 10 : SR < 500 ? 25 : 60;
  const a = randomInt(2, base);
  const b = randomInt(2, base);
  const useMultiply = SR >= 500 && Math.random() > 0.55;

  if (useMultiply) {
    const smallA = randomInt(2, Math.min(12, Math.floor(base / 4)));
    const smallB = randomInt(2, 12);
    const answer = smallA * smallB;

    return {
      type: "arithmetic",
      prompt: `You need ${smallA} trays with ${smallB} cookies each during ${stage}. How many cookies is that?`,
      answer,
      choices: makeChoices(answer, 10),
      hint: "Equal groups can be solved with multiplication.",
    };
  }

  const answer = a + b;
  return {
    type: "arithmetic",
    prompt: `A helper brings ${a} sprinkles and then ${b} more during ${stage}. How many sprinkles now?`,
    answer,
    choices: makeChoices(answer, 10),
    hint: "Add the first amount and the extra amount together.",
  };
}

function cost({ SR, stage }) {
  const trays = randomInt(2, SR < 300 ? 5 : 8);
  const coins = randomInt(2, SR < 300 ? 6 : 9);
  const answer = trays * coins;

  return {
    type: "cost",
    prompt: `Each tray costs ${coins} coins in ${stage}. If you sell ${trays} trays, how many coins do you earn?`,
    answer,
    choices: makeChoices(answer, 12),
    hint: "Same price each time means multiply price by trays.",
  };
}

function business({ SR, stage }) {
  const spend = randomInt(8, 20);
  const earn = spend + randomInt(4, Math.max(8, Math.floor(SR / 60)));
  const answer = earn - spend;

  return {
    type: "business",
    prompt: `You spent ${spend} coins on ingredients and earned ${earn} coins after ${stage}. What is your profit?`,
    answer,
    choices: makeChoices(answer, 8),
    hint: "Profit means money earned minus money spent.",
  };
}

function fraction() {
  const total = randomInt(4, 8) * 2;
  const numerator = total / 2;
  const answer = numerator;

  return {
    type: "fraction",
    prompt: `A pan has ${total} brownie squares. You frost 1/2 of them. How many squares get frosting?`,
    answer,
    choices: makeChoices(answer, 6),
    hint: "Half means split the total into 2 equal groups.",
  };
}

function ratio() {
  const flourParts = randomInt(2, 5);
  const sugarParts = flourParts + randomInt(1, 3);
  const flour = flourParts * 3;
  const answer = sugarParts * 3;

  return {
    type: "ratio",
    prompt: `A batter uses flour to sugar in a ${flourParts}:${sugarParts} ratio. If you use ${flour} cups of flour, how many cups of sugar do you need?`,
    answer,
    choices: makeChoices(answer, 6),
    hint: "Scale both parts of the ratio by the same amount.",
  };
}

function algebraic() {
  const x = randomInt(3, 12);
  const extra = randomInt(4, 12);
  const total = x * 2 + extra;

  return {
    type: "algebraic",
    prompt: `Two equal sprinkle jars plus ${extra} bonus sprinkles make ${total}. How many sprinkles are in one jar?`,
    answer: x,
    choices: makeChoices(x, 6),
    hint: "Subtract the bonus first, then split the rest into 2 equal parts.",
  };
}

function optimization() {
  const boxA = { size: 6, price: 8 };
  const boxB = { size: 10, price: 12 };
  const answer = boxB.price / boxB.size < boxA.price / boxA.size ? 10 : 6;

  return {
    type: "optimization",
    prompt: `Which box is the better deal: 6 cookies for 8 coins or 10 cookies for 12 coins?`,
    answer,
    choices: shuffle([6, 10, 8, 12]),
    answerLabel: answer === 10 ? "10-cookie box" : "6-cookie box",
    hint: "Compare cost per cookie for each box.",
  };
}

export const QUESTION_TEMPLATES = {
  arithmetic_visual: visualArithmetic,
  arithmetic,
  cost,
  business,
  fraction,
  ratio,
  algebraic,
  optimization,
};
