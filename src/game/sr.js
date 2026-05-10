import { clamp } from "./math.js?v=20260510-031800";

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

export function applySRResult({ player, question, correct, attemptNumber }) {
  const skill = player.skill;
  const challengeOffset = (question.difficulty ?? player.SR) - player.SR;
  let delta = 0;

  if (correct) {
    delta += 8;
    delta += Math.round(clamp(challengeOffset / 35, -1, 5));
    delta += Math.min(skill.currentStreak, 4);
    delta += attemptNumber === 1 ? 2 : 0;
    delta -= attemptNumber > 1 ? Math.min(attemptNumber - 1, 3) : 0;
    delta = clamp(delta, 5, 18);
  } else {
    let penalty = 5;
    penalty += Math.round(clamp((player.SR - (question.difficulty ?? player.SR)) / 40, -1, 4));
    penalty += Math.min(Math.max(0, attemptNumber - 1), 2);
    delta = -clamp(penalty, 3, 11);
  }

  if (player.SR < VISUAL_MODE_END_SR) {
    if (correct) {
      delta = clamp(Math.round(delta * 0.65), 3, 8);
    } else {
      delta = -clamp(Math.round(Math.abs(delta) * 0.6), 2, 6);
    }
  }

  const nextSR = clamp(player.SR + delta, 0, 1000);
  const nextStreak = correct ? skill.currentStreak + 1 : 0;
  const recentResults = [...skill.recentResults, correct ? 1 : 0].slice(-8);

  return {
    delta,
    nextSR,
    player: {
      ...player,
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
