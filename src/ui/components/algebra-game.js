import {
  formatTerm,
  moveSelectedTerm,
  resetAlgebraState,
  selectAlgebraTerm,
} from "../../game/algebra.js?v=20261017-120000";

export function renderAlgebraGame({ question, algebraState }) {
  const solved = algebraState.solvedValue !== null;

  return `
    <div class="algebra-game ${solved ? "solved" : ""}" data-algebra-game>
      <div class="algebra-game-head">
        <p class="algebra-game-tip">${
          solved
            ? "The mystery jar is balanced!"
            : algebraState.selected
              ? "Now tap the other side of the = sign to move it."
              : "Tap a number to pick it up."
        }</p>
        <button class="ghost-button algebra-reset-button" type="button" data-algebra-reset>Start over</button>
      </div>

      <div class="algebra-equation" aria-label="Equation">
        ${renderSide("left", algebraState)}
        <span class="algebra-equals" aria-hidden="true">=</span>
        ${renderSide("right", algebraState)}
      </div>

      ${
        algebraState.steps.length
          ? `
            <ol class="algebra-steps">
              ${algebraState.steps
                .map(
                  (step, index) => `
                    <li class="${step.auto ? "auto" : ""}">Step ${index + 1}: ${escapeHtml(step.text)} → <strong>${escapeHtml(step.result)}</strong></li>
                  `,
                )
                .join("")}
            </ol>
          `
          : ""
      }

      ${
        solved
          ? `<button class="primary-button algebra-confirm-button" type="button" data-algebra-confirm="${algebraState.solvedValue}">That's x = ${formatNumber(algebraState.solvedValue)} — Confirm ✓</button>`
          : ""
      }
    </div>
  `;
}

export function attachAlgebraEvents(root, gameState, dispatch, onConfirm) {
  const game = root.querySelector("[data-algebra-game]");
  const algebraState = gameState.session.algebraState;

  if (!game || !algebraState) {
    return;
  }

  const update = (nextAlgebraState) => {
    if (nextAlgebraState === algebraState) {
      return;
    }

    dispatch({
      type: "UPDATE_GAME",
      payload: { ...gameState, session: { ...gameState.session, algebraState: nextAlgebraState } },
    });
  };

  game.querySelectorAll("[data-algebra-term]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const [side, index] = button.dataset.algebraTerm.split(":");

      // Tapping a constant on the opposite side while holding one counts as a drop on that side.
      if (algebraState.selected && algebraState.selected.side !== side) {
        update(moveSelectedTerm(algebraState, side));
        return;
      }

      update(selectAlgebraTerm(algebraState, side, Number(index)));
    });
  });

  game.querySelectorAll("[data-side]").forEach((zone) => {
    zone.addEventListener("click", () => {
      update(moveSelectedTerm(algebraState, zone.dataset.side));
    });
  });

  game.querySelector("[data-algebra-reset]")?.addEventListener("click", () => {
    update(resetAlgebraState(algebraState));
  });

  game.querySelector("[data-algebra-confirm]")?.addEventListener("click", (event) => {
    onConfirm(event.currentTarget.dataset.algebraConfirm);
  });
}

function renderSide(side, algebraState) {
  const items = algebraState[side];
  const isDropTarget = algebraState.selected && algebraState.selected.side !== side;

  return `
    <div class="algebra-side ${isDropTarget ? "drop-target" : ""} ${algebraState.lastMoved === side ? "just-moved" : ""}" data-side="${side}">
      ${
        items.length
          ? items.map((item, index) => renderItem(item, index, side, algebraState)).join("")
          : '<span class="algebra-zero">0</span>'
      }
    </div>
  `;
}

function renderItem(item, index, side, algebraState) {
  const negative = item.kind === "constant" && item.value < 0;
  const operator = index === 0 ? (negative ? "−" : "") : negative ? "−" : "+";
  const operatorMarkup = operator ? `<span class="algebra-operator">${operator}</span>` : "";

  if (item.kind === "term") {
    return `${operatorMarkup}<span class="algebra-variable">${escapeHtml(formatTerm(item))}</span>`;
  }

  const selected = algebraState.selected?.side === side && algebraState.selected?.index === index;

  return `
    ${operatorMarkup}
    <button
      class="algebra-term-button ${selected ? "selected" : ""}"
      type="button"
      data-algebra-term="${side}:${index}"
      aria-pressed="${selected}"
      ${algebraState.solvedValue !== null ? "disabled" : ""}
    >${Math.abs(item.value)}</button>
  `;
}

function formatNumber(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
