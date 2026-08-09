import type { Drift3DAudioClockSnapshot } from "@/lib/drift3dAudioClock";
import {
  DRIFT_EVOLUTION_FOOLFOULE_CENTER,
  buildDriftEvolutionFoolfouleLandmark,
} from "@/lib/driftEvolutionFoolfoule";

export type DriftEvolutionFoolfouleCrowdSignal = {
  centroidX: number;
  centroidZ: number;
  totalCrossings: number;
  sampleCount: number;
};

export type DriftEvolutionFoolfoulePhase =
  | "ordinary"
  | "tracking"
  | "counting";

export type DriftEvolutionFoolfouleDramaturgyState = Readonly<{
  phase: DriftEvolutionFoolfoulePhase;
  narrativeVisible: boolean;
  advancing: boolean;
  trackingBlend: number;
  counterBlend: number;
  counterValue: number;
}>;

export type DriftEvolutionFoolfoulePanel = Readonly<{
  id: string;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  color: string;
  heroCounter: boolean;
}>;

export const DRIFT_EVOLUTION_FOOLFOULE_TRACK_SLUG = "foolfoule";
export const DRIFT_EVOLUTION_FOOLFOULE_TRACKING_MAX_YAW = 0.58;

const TRACKING_START_CROSSINGS = 2;
const TRACKING_FULL_CROSSINGS = 14;
const COUNTER_START_CROSSINGS = 10;
const COUNTER_FULL_CROSSINGS = 26;
const COUNTER_ZERO_OFFSET = 8;

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function smoothstep(min: number, max: number, value: number) {
  if (max <= min) return value >= max ? 1 : 0;
  const t = clamp01((value - min) / (max - min));
  return t * t * (3 - 2 * t);
}

const staticFoolfoule = buildDriftEvolutionFoolfouleLandmark();
const panelPrimitives = staticFoolfoule.primitives.filter(
  (primitive) =>
    primitive.kind === "box" &&
    primitive.emissive !== undefined &&
    primitive.args[2] <= 0.12
);
const heroPanelIndex = panelPrimitives.reduce((winner, primitive, index) => {
  if (winner < 0) return index;
  const current = panelPrimitives[winner];
  if (primitive.offset[0] > current.offset[0] + 0.01) return index;
  if (
    Math.abs(primitive.offset[0] - current.offset[0]) <= 0.01 &&
    primitive.offset[2] < current.offset[2]
  ) {
    return index;
  }
  return winner;
}, -1);

/**
 * Dynamic copies of the eight already-approved ordinary commercial screens.
 * Their geometry is derived from the staged landmark rather than duplicated,
 * so the anomaly can pivot the exact streetscape the normal-world proof uses.
 */
export const DRIFT_EVOLUTION_FOOLFOULE_PANELS: readonly DriftEvolutionFoolfoulePanel[] =
  Object.freeze(
    panelPrimitives.map((primitive, index) =>
      Object.freeze({
        id: `foolfoule-panel-${index + 1}`,
        x: primitive.offset[0],
        y: primitive.offset[1],
        z: primitive.offset[2],
        width: primitive.args[0],
        height: primitive.args[1],
        color: primitive.color,
        heroCounter: index === heroPanelIndex,
      })
    )
  );

export function createDriftEvolutionFoolfouleCrowdSignal(): DriftEvolutionFoolfouleCrowdSignal {
  return {
    centroidX: DRIFT_EVOLUTION_FOOLFOULE_CENTER.x,
    centroidZ: DRIFT_EVOLUTION_FOOLFOULE_CENTER.z,
    totalCrossings: 0,
    sampleCount: 0,
  };
}

export function isDriftEvolutionFoolfouleAudioSource(
  snapshot: Drift3DAudioClockSnapshot
) {
  return (
    snapshot.source.kind === "track" &&
    snapshot.source.slug === DRIFT_EVOLUTION_FOOLFOULE_TRACK_SLUG
  );
}

/**
 * The audio clock authorizes the track anomaly but does not invent musical
 * timestamps. The crowd itself drives escalation: a few completed passages
 * wake the screens, then sustained flow reveals the diegetic counter.
 */
export function resolveDriftEvolutionFoolfouleDramaturgy(
  snapshot: Drift3DAudioClockSnapshot,
  insideZone: boolean,
  narrativeCrossings: number
): DriftEvolutionFoolfouleDramaturgyState {
  const ownsSource = isDriftEvolutionFoolfouleAudioSource(snapshot);
  const narrativeVisible =
    insideZone &&
    ownsSource &&
    snapshot.playbackState !== "idle" &&
    snapshot.playbackState !== "ended";
  const advancing = narrativeVisible && snapshot.playbackState === "playing";
  const crossings = Math.max(0, Math.floor(narrativeCrossings));
  const trackingBlend = narrativeVisible
    ? smoothstep(TRACKING_START_CROSSINGS, TRACKING_FULL_CROSSINGS, crossings)
    : 0;
  const counterBlend = narrativeVisible
    ? smoothstep(COUNTER_START_CROSSINGS, COUNTER_FULL_CROSSINGS, crossings)
    : 0;
  const phase: DriftEvolutionFoolfoulePhase =
    counterBlend >= 0.08
      ? "counting"
      : trackingBlend >= 0.08
        ? "tracking"
        : "ordinary";

  return {
    phase,
    narrativeVisible,
    advancing,
    trackingBlend,
    counterBlend,
    counterValue: narrativeVisible
      ? Math.max(0, crossings - COUNTER_ZERO_OFFSET)
      : 0,
  };
}

/**
 * A billboard plane is visually identical after a 180° turn, so normalize the
 * look-at yaw into the nearest half-turn before clamping it. Result: screens
 * stay believable street furniture, then visibly lean toward the crowd rather
 * than spinning like game turrets.
 */
export function getDriftEvolutionFoolfoulePanelYaw(
  panelWorldX: number,
  panelWorldZ: number,
  focusWorldX: number,
  focusWorldZ: number
) {
  const dx = focusWorldX - panelWorldX;
  const dz = focusWorldZ - panelWorldZ;
  if (Math.hypot(dx, dz) < 0.001) return 0;

  let yaw = Math.atan2(dx, dz);
  while (yaw > Math.PI / 2) yaw -= Math.PI;
  while (yaw < -Math.PI / 2) yaw += Math.PI;

  return Math.max(
    -DRIFT_EVOLUTION_FOOLFOULE_TRACKING_MAX_YAW,
    Math.min(DRIFT_EVOLUTION_FOOLFOULE_TRACKING_MAX_YAW, yaw)
  );
}
