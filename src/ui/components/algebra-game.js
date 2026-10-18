import {
  combineSide,
  divideBothSides,
  formatNumber,
  formatTerm,
  getCombinableSides,
  getDivideBy,
  getDivisor,
  getSideActionLabel,
  moveSelectedTerm,
  resetAlgebraState,
  selectAlgebraTerm,
} from "../../game/algebra.js?v=20261017-201000";

export function renderAlgebraGame({ question, algebraState }) {
  const solved = algebraState.solvedValue !== null;
  const combinableSides = getCombinableSides(algebraState);
  const canCombine = combinableSides.length > 0 && !solved;
  const divideBy = getDivideBy(algebraState);

  return `
    <div class="algebra-game ${solved ? "solved" : ""}" data-algebra-game>
      <div class="algebra-game-head">
        <p class="algebra-game-tip">${
          solved
            ? "The mystery jar is balanced!"
            : algebraState.selected
              ? "Now tap the other side of the = sign to undo it on both sides."
              : combinableSides.length
                ? "Both sides stay balanced! Now finish each side."
                : divideBy
                  ? `x is stuck in ${divideBy} equal groups. Divide both sides by ${divideBy}!`
                  : "Tap a number to pick it up."
        }</p>
        <button class="ghost-button algebra-reset-button" type="button" data-algebra-reset>Start over</button>
      </div>

      <div class="algebra-equation ${canCombine ? "has-combine" : ""}" aria-label="Equation">
        ${renderSideColumn("left", algebraState, canCombine && combinableSides.includes("left"))}
        <span class="algebra-equals" aria-hidden="true">=</span>
        ${renderSideColumn("right", algebraState, canCombine && combinableSides.includes("right"))}
      </div>

      ${
        divideBy
          ? `<div class="algebra-divide-row"><button class="secondary-button algebra-divide-button" type="button" data-algebra-divide>${markDivide("÷")} Divide both sides by ${divideBy}</button></div>`
          : ""
      }

      ${
        algebraState.steps.length
          ? `
            <ol class="algebra-steps">
              ${algebraState.steps
                .map(
                  (step, index) => `
                    <li>Step ${index + 1}: ${markDivide(escapeHtml(step.text))} → <strong>${markDivide(escapeHtml(step.result))}</strong></li>
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

export function attachAlgebraEvents(root, algebraState, onChange, onConfirm) {
  const game = root.querySelector("[data-algebra-game]");

  if (!game || !algebraState) {
    return;
  }

  const update = (nextAlgebraState) => {
    if (nextAlgebraState !== algebraState) {
      onChange(nextAlgebraState);
    }
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

  game.querySelectorAll("[data-algebra-combine]").forEach((button) => {
    button.addEventListener("click", () => {
      update(combineSide(algebraState, button.dataset.algebraCombine));
    });
  });

  game.querySelector("[data-algebra-divide]")?.addEventListener("click", () => {
    update(divideBothSides(algebraState));
  });

  game.querySelector("[data-algebra-reset]")?.addEventListener("click", () => {
    update(resetAlgebraState(algebraState));
  });

  game.querySelector("[data-algebra-confirm]")?.addEventListener("click", (event) => {
    onConfirm(event.currentTarget.dataset.algebraConfirm);
  });
}

// Each side sits above its own Combine / Divide button so kids see which part gets finished.
function renderSideColumn(side, algebraState, showCombine) {
  return `
    <div class="algebra-side-column">
      ${renderSide(side, algebraState)}
      ${
        showCombine
          ? `<button class="secondary-button algebra-combine-button" type="button" data-algebra-combine="${side}">${markDivide(escapeHtml(getSideActionLabel(algebraState, side)))}</button>`
          : ""
      }
    </div>
  `;
}

function renderSide(side, algebraState) {
  const items = algebraState[side];
  const isDropTarget = algebraState.selected && algebraState.selected.side !== side;
  const divisor = getDivisor(algebraState, side);

  return `
    <div class="algebra-side ${isDropTarget ? "drop-target" : ""} ${algebraState.lastMoved === side || algebraState.lastMoved === "both" ? "just-moved" : ""}" data-side="${side}">
      ${
        items.length
          ? items.map((item, index) => renderItem(item, index, side, algebraState)).join("")
          : '<span class="algebra-zero">0</span>'
      }
      ${divisor ? `<span class="algebra-operator">${markDivide("÷")}</span><span class="algebra-divisor">${divisor}</span>` : ""}
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
      class="algebra-term-button ${selected ? "selected" : ""} ${item.added ? "added" : ""}"
      type="button"
      data-algebra-term="${side}:${index}"
      aria-pressed="${selected}"
      ${algebraState.solvedValue !== null || getDivisor(algebraState, "left") || getDivisor(algebraState, "right") ? "disabled" : ""}
    >${formatNumber(Math.abs(item.value))}</button>
  `;
}

// Baloo 2 draws ÷ so faintly it reads as +, so every ÷ gets a clearer font.
export function markDivide(html) {
  return String(html).replaceAll("÷", '<span class="div-sign">÷</span>');
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
