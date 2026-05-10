export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function formatSignedValue(value) {
  return `${value >= 0 ? "+" : ""}${value}`;
}
