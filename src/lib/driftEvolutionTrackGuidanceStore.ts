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

export function publishDriftEvolutionTrackGuidance(
  next: DriftEvolutionTrackGuidanceSnapshot
) {
  const previous = snapshot;
  if (
    previous &&
    previous.trackSlug === next.trackSlug &&
    previous.mode === next.mode &&
    previous.activationRadius === next.activationRadius &&
    Math.abs(previous.distance - next.distance) < 0.08 &&
    Math.abs(previous.bearingDegrees - next.bearingDegrees) < 0.8
  ) {
    return;
  }

  snapshot = next;
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
