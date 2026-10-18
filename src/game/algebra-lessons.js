import { parseEquation } from "./algebra.js?v=20261017-160000";
import { QUESTION_BANK } from "./questions/bank.js?v=20261017-160000";

// Algebra Lessons is a standalone mini-game: no baker profile, SR, coins, or sprinkles involved.
export const ALGEBRA_LESSONS = [
  {
    id: "undo-adding",
    templateId: "algebraic-missing-add",
    title: "Undo adding",
    form: "x + a = b",
    explain: "When a number is added to x, move it across the = sign. It flips to a minus.",
    example: ["x + 7 = 20", "x = 20 − 7", "x = 13"],
  },
  {
    id: "undo-taking-away",
    templateId: "algebraic-missing-subtract",
    title: "Undo taking away",
    form: "x − a = b",
    explain: "When a number is taken away from x, move it across the = sign. It flips to a plus.",
    example: ["x − 5 = 12", "x = 12 + 5", "x = 17"],
  },
  {
    id: "boxes-plus-extra",
    templateId: "algebraic-boxes-plus-extra",
    title: "Equal boxes + extras",
    form: "ax + b = c",
    explain: "Move the extras first. Then split what is left into the equal boxes by dividing.",
    example: ["3x + 4 = 19", "3x = 19 − 4 = 15", "x = 15 ÷ 3 = 5"],
  },
  {
    id: "trays-minus-taste",
    templateId: "algebraic-trays-minus-eaten",
    title: "Equal trays − a taste",
    form: "ax − b = c",
    explain: "Put back the tasted treats first. Then divide by the number of trays.",
    example: ["4x − 2 = 18", "4x = 18 + 2 = 20", "x = 20 ÷ 4 = 5"],
  },
];

const LESSON_RECIPES = ["Cupcakes", "Cookies", "Donuts", "Muffins", "Brownies"];
const STREAK_DIFFICULTY_STEP = 15;

export function getAlgebraLesson(lessonId) {
  return ALGEBRA_LESSONS.find((lesson) => lesson.id === lessonId) ?? ALGEBRA_LESSONS[0];
}

// Returns a usable practice object, building a fresh one when the saved one is missing or stale.
export function ensureAlgebraPractice(practice) {
  if (practice?.question?.equation && practice?.algebraState && ALGEBRA_LESSONS.some((lesson) => lesson.id === practice.lessonId)) {
    return practice;
  }

  return createPractice(practice?.lessonId, { solved: practice?.solved ?? {}, streak: 0 });
}

export function startAlgebraLesson(practice, lessonId) {
  return createPractice(lessonId, { solved: practice?.solved ?? {}, streak: 0 });
}

export function updateAlgebraPracticeState(practice, algebraState) {
  return { ...practice, algebraState };
}

export function getLessonSolvedCount(practice, lessonId) {
  return practice?.solved?.[lessonId] ?? 0;
}

export function submitAlgebraPractice(practice, answer) {
  const correct = String(answer) === String(practice.question.answer);

  if (!correct) {
    return {
      correct,
      practice: { ...practice, streak: 0, algebraState: parseEquation(practice.question.equation) },
    };
  }

  return {
    correct,
    practice: createPractice(practice.lessonId, {
      solved: { ...practice.solved, [practice.lessonId]: getLessonSolvedCount(practice, practice.lessonId) + 1 },
      streak: practice.streak + 1,
    }),
  };
}

function createPractice(lessonId, { solved = {}, streak = 0 } = {}) {
  const lesson = getAlgebraLesson(lessonId);
  const question = generateLessonQuestion(lesson, streak);

  return {
    lessonId: lesson.id,
    question,
    algebraState: parseEquation(question.equation),
    solved,
    streak,
  };
}

// Numbers grow a little with each correct answer in a row, so a hot streak gets a gentle stretch.
function generateLessonQuestion(lesson, streak) {
  const template = QUESTION_BANK.find((entry) => entry.id === lesson.templateId);
  const stage = template.stages[Math.floor(Math.random() * template.stages.length)];
  const recipeName = LESSON_RECIPES[Math.floor(Math.random() * LESSON_RECIPES.length)];
  const question = template.generator({
    stage,
    context: { recipeName },
    targetDifficulty: Math.min(900, template.difficulty + streak * STREAK_DIFFICULTY_STEP),
  });

  return { ...question, templateId: template.id, type: template.type };
}
