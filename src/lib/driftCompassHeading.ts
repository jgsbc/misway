let headingDegrees = 0;
const listeners = new Set<() => void>();

function normalizeDegrees(value: number) {
  const normalized = value % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

function angularDistanceDegrees(a: number, b: number) {
  const delta = Math.abs(normalizeDegrees(a) - normalizeDegrees(b));
  return Math.min(delta, 360 - delta);
}

export function getDriftCompassHeadingDegrees() {
  return headingDegrees;
}

export function getDriftCompassHeadingServerSnapshot() {
  return 0;
}

export function subscribeDriftCompassHeading(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function publishDriftCompassHeadingDegrees(nextHeadingDegrees: number) {
  const normalized = normalizeDegrees(nextHeadingDegrees);
  if (angularDistanceDegrees(normalized, headingDegrees) < 0.75) return;

  headingDegrees = normalized;
  for (const listener of listeners) listener();
}
