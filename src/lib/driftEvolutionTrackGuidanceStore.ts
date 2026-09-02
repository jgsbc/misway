import type { Track } from "./tracks";

export type DriftEvolutionTrackGuidanceSnapshot = {
  trackSlug: Track["slug"];
  distance: number;
  activationRadius: number;
  bearingDegrees: number;
  mode: "first-reveal" | "nearest";
};

type Listener = () => void;

let snapshot: DriftEvolutionTrackGuidanceSnapshot | null = null;
const listeners = new Set<Listener>();

function normalizeSignedDegrees(value: number) {
  return ((value + 180) % 360 + 360) % 360 - 180;
}

function unwrapBearingDegrees(previous: number, next: number) {
  return previous + normalizeSignedDegrees(next - previous);
}

export function publishDriftEvolutionTrackGuidance(
  next: DriftEvolutionTrackGuidanceSnapshot
) {
  const previous = snapshot;
  const sameGuidance = Boolean(
    previous &&
      previous.trackSlug === next.trackSlug &&
      previous.mode === next.mode
  );
  const continuousNext = {
    ...next,
    bearingDegrees:
      sameGuidance && previous
        ? unwrapBearingDegrees(previous.bearingDegrees, next.bearingDegrees)
        : normalizeSignedDegrees(next.bearingDegrees),
  };

  if (
    previous &&
    sameGuidance &&
    previous.activationRadius === continuousNext.activationRadius &&
    Math.abs(previous.distance - continuousNext.distance) < 0.08 &&
    Math.abs(previous.bearingDegrees - continuousNext.bearingDegrees) < 0.8
  ) {
    return;
  }

  snapshot = continuousNext;
  for (const listener of listeners) listener();
}

export function clearDriftEvolutionTrackGuidance() {
  if (snapshot === null) return;
  snapshot = null;
  for (const listener of listeners) listener();
}

export function subscribeDriftEvolutionTrackGuidance(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getDriftEvolutionTrackGuidanceSnapshot() {
  return snapshot;
}

export function getDriftEvolutionTrackGuidanceServerSnapshot() {
  return null;
}
