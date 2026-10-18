import {
  ensureAlgebraPractice,
  startAlgebraLesson,
  submitAlgebraPractice,
  updateAlgebraPracticeState,
} from "./game/algebra-lessons.js?v=20261017-201000";
import { loadAlgebraPractice, saveAlgebraPractice } from "./state.js?v=20261017-201000";
import { attachAlgebraEvents } from "./ui/components/algebra-game.js?v=20261017-201000";
import { renderAlgebraLessonsScreen } from "./ui/screens/algebra-lessons.js?v=20261017-201000";

const SPLASH_DURATION_MS = 1000;
const appRoot = document.querySelector("#algebra-app");

let practice = ensureAlgebraPractice(loadAlgebraPractice());
let pendingAdvance = null;

function setPractice(nextPractice) {
  practice = nextPractice;
  saveAlgebraPractice(practice);
  render();
}

function render() {
  appRoot.innerHTML = `<div class="layout-stack">${renderAlgebraLessonsScreen(practice)}</div>`;

  appRoot.querySelectorAll("[data-algebra-lesson]").forEach((button) => {
    button.addEventListener("click", () => {
      if (pendingAdvance || button.dataset.algebraLesson === practice.lessonId) return;
      setPractice(startAlgebraLesson(practice, button.dataset.algebraLesson));
    });
  });

  attachAlgebraEvents(
    appRoot,
    practice.algebraState,
    (algebraState) => setPractice(updateAlgebraPracticeState(practice, algebraState)),
    (solvedValue) => {
      if (pendingAdvance) return;

      const result = submitAlgebraPractice(practice, solvedValue);

      if (!result.correct) {
        showSplash("Try Again", "error");
        setPractice(result.practice);
        return;
      }

      showSplash("Correct!", "success");
      pendingAdvance = window.setTimeout(() => {
        pendingAdvance = null;
        setPractice(result.practice);
      }, SPLASH_DURATION_MS);
    },
  );
}

function showSplash(message, kind) {
  document.querySelector(".answer-splash")?.remove();

  const splash = document.createElement("div");
  splash.className = `answer-splash answer-splash-${kind}`;
  splash.textContent = message;
  document.body.appendChild(splash);

  window.setTimeout(() => splash.classList.add("visible"), 10);
  window.setTimeout(() => {
    splash.classList.remove("visible");
    window.setTimeout(() => splash.remove(), 220);
  }, SPLASH_DURATION_MS);
}

saveAlgebraPractice(practice);
render();
