import { ALGEBRA_LESSONS, getAlgebraLesson, getLessonSolvedCount } from "../../game/algebra-lessons.js?v=20261017-201000";
import { markDivide, renderAlgebraGame } from "../components/algebra-game.js?v=20261017-201000";
import { renderMascot } from "../components/mascot.js?v=20261017-201000";

export function renderAlgebraLessonsScreen(practice) {
  const lesson = getAlgebraLesson(practice.lessonId);

  return `
    <section class="panel flow-screen utility-screen algebra-lessons-screen">
      <div class="flow-header utility-header">
        <p class="eyebrow eyebrow-pill">100 Sprinkles Mini-Game</p>
        <h2>Algebra Lessons</h2>
        <p class="muted">Pick a lesson, read the quick example, then find the mystery number x. Keep both sides of the = sign balanced!</p>
      </div>

      ${renderMascot({
        mood: "happy",
        compact: true,
        message:
          practice.streak >= 3
            ? `${practice.streak} in a row! The numbers get a little bigger each time.`
            : "Tap a number, then tap the other side of the = sign to move it.",
      })}

      <div class="algebra-lesson-tabs" role="tablist" aria-label="Algebra lessons">
        ${ALGEBRA_LESSONS.map(
          (entry, index) => `
            <button
              class="algebra-lesson-tab ${entry.id === lesson.id ? "active" : ""}"
              type="button"
              role="tab"
              aria-selected="${entry.id === lesson.id}"
              data-algebra-lesson="${entry.id}"
            >
              <span class="algebra-lesson-number">Lesson ${index + 1}</span>
              <strong>${escapeHtml(entry.title)}</strong>
              <span class="algebra-lesson-form">${escapeHtml(entry.form)}</span>
              <span class="algebra-lesson-count">✓ ${getLessonSolvedCount(practice, entry.id)} solved</span>
            </button>
          `,
        ).join("")}
      </div>

      <section class="utility-save-card algebra-lesson-card">
        <div>
          <p class="eyebrow">How it works</p>
          <h3>${escapeHtml(lesson.title)}</h3>
          <p>${markDivide(escapeHtml(lesson.explain))}</p>
        </div>
        <ol class="algebra-example" aria-label="Worked example">
          ${lesson.example.map((line) => `<li>${markDivide(escapeHtml(line))}</li>`).join("")}
        </ol>
      </section>

      <section class="utility-save-card algebra-practice-card">
        <p class="eyebrow">Your turn</p>
        <p class="story-problem-copy">${escapeHtml(practice.question.prompt)}</p>
        ${renderAlgebraGame({ question: practice.question, algebraState: practice.algebraState })}
      </section>

      <div class="flow-actions settings-actions">
        <a class="secondary-button algebra-home-link" href="./index.html">Back to 100 Sprinkles</a>
      </div>
    </section>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
