import { allowedTypes, clamp, randomInt } from "../helpers.js";
import { QUESTION_TEMPLATES } from "./templates.js";

export function generateQuestion({ SR, stage }) {
  const targetDifficulty = SR + randomInt(-20, 20);
  const candidates = allowedTypes(SR).filter((type) => QUESTION_TEMPLATES[type]);
  const selectedType = candidates[randomInt(0, candidates.length - 1)];
  const template = QUESTION_TEMPLATES[selectedType];
  const question = template({ SR: targetDifficulty, stage });

  return {
    ...question,
    stage,
    targetDifficulty: clamp(targetDifficulty, 0, 1000),
  };
}
