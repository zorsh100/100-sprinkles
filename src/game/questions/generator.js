import { allowedTypes, clamp, randomInt, weightedPick } from "../helpers.js?v=20260509-235200";
import { isVisualMode } from "../sr.js?v=20260509-235200";
import { QUESTION_BANK } from "./bank.js?v=20260509-235200";

export function generateQuestion({ SR, stage, context = {}, recentTemplates = [] }) {
  const targetDifficulty = SR + randomInt(-20, 20);
  const allowedQuestionTypes = allowedTypes(SR);
  const candidatePool = QUESTION_BANK.filter((template) =>
    allowedQuestionTypes.includes(template.type) &&
    (isVisualMode(SR) || template.stages.includes(stage)) &&
    Math.abs(template.difficulty - targetDifficulty) <= 30,
  );
  const fallbackPool = QUESTION_BANK.filter((template) =>
    allowedQuestionTypes.includes(template.type) &&
    (isVisualMode(SR) || template.stages.includes(stage)),
  );
  const permissivePool = QUESTION_BANK.filter((template) => allowedQuestionTypes.includes(template.type));
  const selectable = (candidatePool.length ? candidatePool : fallbackPool.length ? fallbackPool : permissivePool).filter(Boolean);
  const selectedTemplate = weightedPick(selectable, (template) => {
    const closeness = 40 - Math.min(39, Math.abs(template.difficulty - targetDifficulty));
    const recentPenalty = recentTemplates.includes(template.id) ? 8 : 0;
    return Math.max(1, closeness - recentPenalty);
  });
  const question = selectedTemplate.generator({
    stage,
    context,
    targetDifficulty: clamp(targetDifficulty, 0, 1000),
  });
  const difficulty = clamp(
    Math.round((selectedTemplate.difficulty + clamp(targetDifficulty, 0, 1000)) / 2),
    0,
    1000,
  );

  return {
    ...question,
    templateId: selectedTemplate.id,
    type: selectedTemplate.type,
    subtype: selectedTemplate.subtype,
    stage,
    steps: selectedTemplate.steps,
    difficulty,
    targetDifficulty: clamp(targetDifficulty, 0, 1000),
    attemptCount: 0,
  };
}
