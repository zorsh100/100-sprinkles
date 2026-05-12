import { allowedTypes, clamp, randomInt, weightedPick } from "../helpers.js?v=20260512-103200";
import { isVisualMode } from "../sr.js?v=20260512-103200";
import { QUESTION_BANK } from "./bank.js?v=20260512-103200";

const TEMPLATE_META_BY_ID = new Map(QUESTION_BANK.map((template) => [template.id, template]));

function getRecentPenalty(template, recentTemplates) {
  const recentOrder = [...recentTemplates].reverse();
  const exactIndex = recentOrder.indexOf(template.id);
  let penalty = 0;

  if (exactIndex === 0) {
    penalty += 36;
  } else if (exactIndex === 1) {
    penalty += 24;
  } else if (exactIndex === 2) {
    penalty += 14;
  } else if (exactIndex >= 3) {
    penalty += 8;
  }

  const recentMeta = recentOrder
    .slice(0, 4)
    .map((templateId) => TEMPLATE_META_BY_ID.get(templateId))
    .filter(Boolean);

  if (recentMeta.some((recentTemplate) => recentTemplate.subtype === template.subtype)) {
    penalty += 8;
  }

  if (recentMeta.slice(0, 2).some((recentTemplate) => recentTemplate.type === template.type)) {
    penalty += 4;
  }

  return penalty;
}

function getClosenessWeight(templateDifficulty, targetDifficulty) {
  const distance = Math.abs(templateDifficulty - targetDifficulty);

  if (distance <= 15) return 18;
  if (distance <= 35) return 15;
  if (distance <= 55) return 12;
  if (distance <= 75) return 10;
  return 8;
}

export function generateQuestion({ SR, stage, context = {}, recentTemplates = [] }) {
  const targetDifficulty = SR + randomInt(-20, 20);
  const allowedQuestionTypes = allowedTypes(SR);
  const isBridgeBand = SR >= 80 && SR < 110;
  const srMatches = (template) =>
    (template.minSR == null || SR >= template.minSR) &&
    (template.maxSR == null || SR <= template.maxSR);
  const stageMatches = (template) => isVisualMode(SR) || template.stages.includes(stage);
  const typeMatches = (template) => allowedQuestionTypes.includes(template.type) && srMatches(template);

  const candidatePool = QUESTION_BANK.filter(
    (template) =>
      typeMatches(template) &&
      stageMatches(template) &&
      Math.abs(template.difficulty - targetDifficulty) <= 50,
  );
  const nearbyPool = QUESTION_BANK.filter(
    (template) =>
      typeMatches(template) &&
      stageMatches(template) &&
      Math.abs(template.difficulty - targetDifficulty) <= 90,
  );
  const fallbackPool = QUESTION_BANK.filter((template) => typeMatches(template) && stageMatches(template));
  const permissivePool = QUESTION_BANK.filter(typeMatches);
  const selectable =
    (candidatePool.length >= 3
      ? candidatePool
      : nearbyPool.length
        ? nearbyPool
        : fallbackPool.length
          ? fallbackPool
          : permissivePool).filter(Boolean);

  const selectedTemplate = weightedPick(selectable, (template) => {
    const closeness = getClosenessWeight(template.difficulty, targetDifficulty);
    const recentPenalty = getRecentPenalty(template, recentTemplates);
    const adjustedPenalty =
      isBridgeBand && selectable.length <= 2
        ? Math.min(6, Math.round(recentPenalty * 0.25))
        : recentPenalty;
    return Math.max(isBridgeBand ? 4 : 1, closeness - adjustedPenalty);
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
