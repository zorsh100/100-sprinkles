// Equation state for the mystery jar algebra mini-game.
// Shape: { initial, left, right, divisor, selected, steps, solvedValue }
// Each side is a list of { kind: "term", coefficient, variable } or { kind: "constant", value }.
// divisor holds a pending "÷ n" per side ({ left, right }) after Divide both sides, until that side is finished.
// Every operation is shown on both sides first; the player then finishes each side with its own button.

const NO_DIVISOR = { left: null, right: null };

export function parseEquation(equation) {
  if (!equation || !Array.isArray(equation.left) || !Array.isArray(equation.right)) {
    return null;
  }

  const initial = {
    left: equation.left.map(cloneItem),
    right: equation.right.map(cloneItem),
  };

  return finalizeState({
    initial,
    left: initial.left.map(cloneItem),
    right: initial.right.map(cloneItem),
    divisor: NO_DIVISOR,
    selected: null,
    steps: [],
    solvedValue: null,
  });
}

export function resetAlgebraState(state) {
  return parseEquation(state.initial);
}

export function selectAlgebraTerm(state, side, index) {
  const item = state[side]?.[index];

  if (!item || item.kind !== "constant" || state.solvedValue !== null || hasPendingDivide(state)) {
    return state;
  }

  const alreadySelected = state.selected?.side === side && state.selected?.index === index;

  return {
    ...state,
    selected: alreadySelected ? null : { side, index },
    lastMoved: null,
  };
}

export function moveSelectedTerm(state, destinationSide) {
  const selected = state.selected;

  if (!selected || selected.side === destinationSide) {
    return state;
  }

  // Balance method: the opposite of the picked number is applied to BOTH sides,
  // e.g. 4x + 4 = 20 becomes 4x + 4 − 4 = 20 − 4.
  const moving = state[selected.side][selected.index];
  const flipped = -moving.value;
  const added = { kind: "constant", value: flipped, added: true };
  const moved = {
    ...state,
    left: [...state.left, added],
    right: [...state.right, added],
    selected: null,
    lastMoved: "both",
  };
  const step = {
    text: flipped < 0 ? `Took away ${-flipped} from both sides` : `Added ${flipped} to both sides`,
    result: formatEquation(moved),
  };

  return finalizeState({ ...moved, steps: [...state.steps, step] });
}

// Returns the number to divide both sides by once the equation reads [a]x = [c] with a ≠ 1, else null.
export function getDivideBy(state) {
  const term = getLoneTerm(state.left);

  if (!term || term.coefficient === 1 || state.solvedValue !== null || hasPendingDivide(state)) {
    return null;
  }

  return isSingleConstantSide(state.right) ? term.coefficient : null;
}

export function divideBothSides(state) {
  const divideBy = getDivideBy(state);

  if (!divideBy) {
    return state;
  }

  const divided = {
    ...state,
    divisor: { left: divideBy, right: divideBy },
    selected: null,
    lastMoved: "both",
  };
  const step = {
    text: `Divided both sides by ${divideBy}`,
    result: formatEquation(divided),
  };

  return finalizeState({ ...divided, steps: [...state.steps, step] });
}

// Sides that still have work to finish: numbers to combine, or a pending ÷.
export function getCombinableSides(state) {
  if (state.solvedValue !== null) {
    return [];
  }

  return ["left", "right"].filter((side) => getDivisor(state, side) || countConstants(state[side]) > 1);
}

export function getSideActionLabel(state, side) {
  const divisor = getDivisor(state, side);
  return divisor ? `Divide ${formatSideWithDivisor(state, side)}` : `Combine ${formatConstants(state[side])}`;
}

export function combineSide(state, side) {
  if (!getCombinableSides(state).includes(side)) {
    return state;
  }

  const divisor = getDivisor(state, side);
  const label = divisor ? formatSideWithDivisor(state, side) : formatConstants(state[side]);
  const combined = {
    ...state,
    [side]: divisor ? divideSide(state[side], divisor) : simplifySide(state[side]),
    divisor: { ...getDivisors(state), [side]: null },
    selected: null,
    lastMoved: null,
  };
  const step = {
    text: `${divisor ? "Divided" : "Combined"} ${label}`,
    result: formatEquation(combined),
  };

  return finalizeState({ ...combined, steps: [...state.steps, step] });
}

export function getDivisor(state, side) {
  return getDivisors(state)[side] ?? null;
}

// Shows just the numbers on a side, e.g. "10 − 4", for the Combine button and step log.
export function formatConstants(side) {
  return formatItems(side.filter((item) => item.kind === "constant"));
}

export function formatEquation(state) {
  return `${formatSideWithDivisor(state, "left")} = ${formatSideWithDivisor(state, "right")}`;
}

export function formatTerm(term) {
  return term.coefficient === 1 ? term.variable : `${formatNumber(term.coefficient)}${term.variable}`;
}

export function formatNumber(value) {
  return Number.isInteger(value) ? String(value) : String(Math.round(value * 100) / 100);
}

// Solved once the equation reads x = [c] with nothing left to combine or divide.
function finalizeState(state) {
  const term = getLoneTerm(state.left);
  const solved = term?.coefficient === 1 && isSingleConstantSide(state.right) && !hasPendingDivide(state);

  return { ...state, solvedValue: solved ? (state.right[0]?.value ?? 0) : null };
}

function getDivisors(state) {
  return state.divisor ?? NO_DIVISOR;
}

function hasPendingDivide(state) {
  const divisors = getDivisors(state);
  return Boolean(divisors.left || divisors.right);
}

function isSingleConstantSide(side) {
  return side.length === 0 || (side.length === 1 && side[0].kind === "constant");
}

function countConstants(side) {
  return side.filter((item) => item.kind === "constant").length;
}

function getLoneTerm(side) {
  return side.length === 1 && side[0].kind === "term" ? side[0] : null;
}

// Combines constants into one and drops a zero constant.
function simplifySide(side) {
  const terms = side.filter((item) => item.kind === "term");
  const total = side.filter((item) => item.kind === "constant").reduce((sum, item) => sum + item.value, 0);

  return total === 0 ? terms : [...terms, { kind: "constant", value: total }];
}

function divideSide(side, divisor) {
  return side.map((item) =>
    item.kind === "term"
      ? { kind: "term", coefficient: item.coefficient / divisor, variable: item.variable }
      : { kind: "constant", value: item.value / divisor },
  );
}

function formatSideWithDivisor(state, side) {
  const divisor = getDivisor(state, side);
  const text = formatItems(state[side]);
  return divisor ? `${text} ÷ ${divisor}` : text;
}

function formatItems(side) {
  if (!side.length) {
    return "0";
  }

  return side
    .map((item, index) => {
      const label = item.kind === "term" ? formatTerm(item) : formatNumber(Math.abs(item.value));
      const negative = item.kind === "constant" && item.value < 0;

      if (index === 0) {
        return negative ? `−${label}` : label;
      }

      return `${negative ? "−" : "+"} ${label}`;
    })
    .join(" ");
}

function cloneItem(item) {
  return { ...item };
}
