import { clamp } from "./math.js?v=20260517-172300";
import { getPromotedGrade } from "./data.js?v=20260517-172300";

export const VISUAL_MODE_END_SR = 110;
export const VISUAL_BRIDGE_START_SR = 80;

export function getSRWindow(sr) {
  return {
    min: clamp(sr - 20, 0, 1000),
    max: clamp(sr + 20, 0, 1000),
  };
}

export function isVisualMode(sr) {
  return sr < VISUAL_MODE_END_SR;
}

export function isBridgeMode(sr) {
  return sr >= VISUAL_BRIDGE_START_SR && sr < VISUAL_MODE_END_SR;
}

export function getSRMode(sr) {
  if (sr < VISUAL_BRIDGE_START_SR) return "Visual Arithmetic";
  if (sr < VISUAL_MODE_END_SR) return "Visual Bridge";
  if (sr < 300) return "Story Math";
  if (sr < 500) return "Pantry Math";
  if (sr < 700) return "Full Simulator";
  return "Strategy Mode";
}

export function getAllowedQuestionTypes(sr) {
  if (isVisualMode(sr)) return ["arithmetic_visual"];

  const types = ["arithmetic", "cost"];

  if (sr >= 300) types.push("business", "fraction");
  if (sr >= 700) types.push("ratio");
  if (sr >= 800) types.push("algebraic");
  if (sr >= 900) types.push("optimization");

  return types;
}

export function getAccuracy(player) {
  if (!player.skill.totalAnswered) {
    return 0;
  }

  return Math.round((player.skill.correctAnswered / player.skill.totalAnswered) * 100);
}

export function applySRResult({ player, question, correct, attemptNumber, maxPositiveDelta = Infinity }) {
  const skill = player.skill;
  let delta = 0;

  if (correct) {
    if (attemptNumber === 1) {
      delta = 1;
    } else if (attemptNumber === 2) {
      delta = 0;
    } else {
      delta = -1;
    }
  } else {
    delta = -1;
  }

  if (delta > 0) {
    delta = Math.min(delta, Math.max(0, Number(maxPositiveDelta) || 0));
  }

  const nextSR = clamp(player.SR + delta, 0, 1000);
  const nextStreak = correct ? skill.currentStreak + 1 : 0;
  const recentResults = [...skill.recentResults, correct ? 1 : 0].slice(-8);
  const nextGrade = getPromotedGrade(player.grade, nextSR);

  return {
    delta,
    nextSR,
    player: {
      ...player,
      grade: nextGrade,
      SR: nextSR,
      skill: {
        ...skill,
        totalAnswered: skill.totalAnswered + 1,
        correctAnswered: skill.correctAnswered + (correct ? 1 : 0),
        currentStreak: nextStreak,
        bestStreak: Math.max(skill.bestStreak, nextStreak),
        lastDelta: delta,
        lastQuestionType: question.type,
        recentResults,
      },
    },
  };
}
