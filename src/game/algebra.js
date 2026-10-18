// Equation state for the mystery jar algebra mini-game.
// Shape: { initial, left, right, selected, steps, solvedValue }
// Each side is a list of { kind: "term", coefficient, variable } or { kind: "constant", value }.

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

  if (!item || item.kind !== "constant" || state.solvedValue !== null) {
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

  const sourceSide = selected.side;
  const moving = state[sourceSide][selected.index];
  const flipped = -moving.value;
  const nextSource = state[sourceSide].filter((_, index) => index !== selected.index);
  const nextDestination = [...state[destinationSide], { kind: "constant", value: flipped }];
  const moved = {
    ...state,
    [sourceSide]: simplifySide(nextSource),
    [destinationSide]: simplifySide(nextDestination),
    selected: null,
    lastMoved: destinationSide,
  };
  const step = {
    text: `Moved ${formatSigned(flipped)} to the ${destinationSide}`,
    result: formatEquation(moved),
  };

  return finalizeState({ ...moved, steps: [...state.steps, step] });
}

export function formatEquation(state) {
  return `${formatSide(state.left)} = ${formatSide(state.right)}`;
}

export function formatSigned(value) {
  return value < 0 ? `−${Math.abs(value)}` : `+${value}`;
}

// Auto-divides once the equation reaches [coefficient]x = [constant], then records the solved value.
function finalizeState(state) {
  const term = getLoneTerm(state.left);
  const rightConstants = state.right.filter((item) => item.kind === "constant");

  if (!term || rightConstants.length !== state.right.length || rightConstants.length > 1) {
    return { ...state, solvedValue: null };
  }

  const constant = rightConstants[0]?.value ?? 0;

  if (term.coefficient === 1) {
    return { ...state, solvedValue: constant };
  }

  const solvedValue = constant / term.coefficient;
  const divided = {
    ...state,
    left: [{ ...term, coefficient: 1 }],
    right: simplifySide([{ kind: "constant", value: solvedValue }]),
  };

  return {
    ...divided,
    steps: [
      ...state.steps,
      { text: `Divide both sides by ${term.coefficient}`, result: formatEquation(divided), auto: true },
    ],
    solvedValue,
  };
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

function formatSide(side) {
  if (!side.length) {
    return "0";
  }

  return side
    .map((item, index) => {
      const label = item.kind === "term" ? formatTerm(item) : String(Math.abs(item.value));
      const negative = item.kind === "constant" && item.value < 0;

      if (index === 0) {
        return negative ? `−${label}` : label;
      }

      return `${negative ? "−" : "+"} ${label}`;
    })
    .join(" ");
}

export function formatTerm(term) {
  return term.coefficient === 1 ? term.variable : `${term.coefficient}${term.variable}`;
}

function cloneItem(item) {
  return { ...item };
}
