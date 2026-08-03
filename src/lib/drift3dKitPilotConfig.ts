import {
  getDrift3DQualityProfile,
  scaleDrift3DQualityCount,
  type Drift3DQualityTier,
} from "@/lib/drift3dQuality";

/**
 * DRIFT-IV-PRE-30 — pure configuration and validation for the three
 * representative shared-kit pilots. No Three.js import, no DOM access: only
 * pilot identity, fallback metadata, per-pilot Quality-Tier count mapping
 * (built on the existing SYS-40 profile/scale helpers, never a second
 * quality authority), deterministic traffic-path math and bounded
 * water-preset validation. Scene rendering lives in the pilot components.
 */

export type Drift3DKitPilotId =
  | "urban-human"
  | "nature-movement"
  | "water-weather-light";

export const DRIFT_3D_KIT_PILOT_IDS: readonly Drift3DKitPilotId[] =
  Object.freeze(["urban-human", "nature-movement", "water-weather-light"]);

export function isDrift3DKitPilotId(
  value: unknown
): value is Drift3DKitPilotId {
  return (
    value === "urban-human" ||
    value === "nature-movement" ||
    value === "water-weather-light"
  );
}

/**
 * Mutable, per-pilot status snapshot mutated in place by a pilot component
 * (never via `setState` in a hot path) and read by the dev-only diagnostics
 * panel / `window.__drift3dKitPilots` harness. Deliberately small and
 * bounded — no unbounded history, matching the existing evidence harness's
 * own "no unbounded history" rule. Not a second evidence authority: render
 * metrics (draw calls/triangles/FPS) stay owned by `drift3dEvidence.ts`
 * (SYS-70) and are read separately by the shell, never duplicated here.
 */
export type Drift3DKitPilotStatus = {
  pilotId: Drift3DKitPilotId;
  loadedAssetIds: string[];
  loadErrors: string[];
  animationClip: string | null;
  instanceCount: number;
  waterPreset: Drift3DWaterPresetId | null;
  disposalCount: number;
};

export function createDrift3DKitPilotStatus(
  pilotId: Drift3DKitPilotId
): Drift3DKitPilotStatus {
  return {
    pilotId,
    loadedAssetIds: [],
    loadErrors: [],
    animationClip: null,
    instanceCount: 0,
    waterPreset: null,
    disposalCount: 0,
  };
}

export type Drift3DKitPilotFallbackCard = Readonly<{
  id: Drift3DKitPilotId;
  title: string;
  whatItProves: string;
}>;

const FALLBACK_CARDS: readonly Drift3DKitPilotFallbackCard[] = Object.freeze([
  Object.freeze({
    id: "urban-human",
    title: "Urban / Human",
    whatItProves:
      "A real skinned Kenney character playing idle/walk/interact clips through an AnimationMixer, alongside instanced City Kit background massing.",
  }),
  Object.freeze({
    id: "nature-movement",
    title: "Nature / Movement",
    whatItProves:
      "The existing vegetation scatter system alongside a real Car Kit vehicle following a deterministic closed path with rotating named wheel nodes.",
  }),
  Object.freeze({
    id: "water-weather-light",
    title: "Water / Weather / Light",
    whatItProves:
      "three.js Water.js/Sky.js wired into R3F with two bounded presets, and the Poly Haven snow_02 PBR material on a neutral test surface.",
  }),
]);

export function getDrift3DKitPilotFallbackCards(): readonly Drift3DKitPilotFallbackCard[] {
  return FALLBACK_CARDS;
}

export type Drift3DKitPilotFallbackCardCandidate = Readonly<{
  id: string;
  title: string;
  whatItProves: string;
}>;

export type Drift3DKitPilotFallbackIssueType =
  | "card-missing"
  | "duplicate-id"
  | "invalid-id"
  | "empty-title"
  | "empty-what-it-proves";

export type Drift3DKitPilotFallbackIssue = Readonly<{
  type: Drift3DKitPilotFallbackIssueType;
  id: string;
  message: string;
}>;

/**
 * Validates a set of fallback card candidates: an invalid/unknown `id`, a
 * duplicate `id`, a missing card for one of the three canonical pilot ids,
 * or an empty `title`/`whatItProves`.
 */
export function getDrift3DKitPilotFallbackIssues(
  cards: readonly Drift3DKitPilotFallbackCardCandidate[]
): readonly Drift3DKitPilotFallbackIssue[] {
  const issues: Drift3DKitPilotFallbackIssue[] = [];
  const seenIds = new Set<string>();

  for (const card of cards) {
    if (!isDrift3DKitPilotId(card.id)) {
      issues.push({
        type: "invalid-id",
        id: card.id,
        message: `Fallback card id "${card.id}" is not a canonical pilot id.`,
      });
    } else if (seenIds.has(card.id)) {
      issues.push({
        type: "duplicate-id",
        id: card.id,
        message: `Fallback card id "${card.id}" is duplicated.`,
      });
    } else {
      seenIds.add(card.id);
    }

    if (!card.title.trim()) {
      issues.push({
        type: "empty-title",
        id: card.id,
        message: `Fallback card "${card.id}" has an empty title.`,
      });
    }

    if (!card.whatItProves.trim()) {
      issues.push({
        type: "empty-what-it-proves",
        id: card.id,
        message: `Fallback card "${card.id}" has an empty whatItProves.`,
      });
    }
  }

  for (const pilotId of DRIFT_3D_KIT_PILOT_IDS) {
    if (!seenIds.has(pilotId)) {
      issues.push({
        type: "card-missing",
        id: pilotId,
        message: `No fallback card found for pilot id "${pilotId}".`,
      });
    }
  }

  return issues;
}

export function getDrift3DCanonicalKitPilotFallbackIssues(): readonly Drift3DKitPilotFallbackIssue[] {
  return getDrift3DKitPilotFallbackIssues(FALLBACK_CARDS);
}

// ---------------------------------------------------------------------------
// Per-pilot Quality Tier count mapping — wraps the existing SYS-40 profile
// scale helpers; invents no new quality authority.
// ---------------------------------------------------------------------------

const BASE_ANIMATED_CHARACTER_COUNT = 3;
const MIN_ANIMATED_CHARACTER_COUNT = 1;
const BASE_SILHOUETTE_CROWD_COUNT = 24;
const BASE_BACKGROUND_BUILDING_COUNT = 18;
const MIN_BACKGROUND_BUILDING_COUNT = 4;

export type Drift3DUrbanHumanCounts = Readonly<{
  animatedCharacterCount: number;
  silhouetteCrowdCount: number;
  backgroundBuildingCount: number;
}>;

export function getDrift3DUrbanHumanCounts(
  tier: Drift3DQualityTier
): Drift3DUrbanHumanCounts {
  const profile = getDrift3DQualityProfile(tier);

  return {
    animatedCharacterCount: scaleDrift3DQualityCount(
      BASE_ANIMATED_CHARACTER_COUNT,
      profile.capabilities.populationScale,
      MIN_ANIMATED_CHARACTER_COUNT
    ),
    silhouetteCrowdCount: scaleDrift3DQualityCount(
      BASE_SILHOUETTE_CROWD_COUNT,
      profile.capabilities.populationScale,
      0
    ),
    backgroundBuildingCount: scaleDrift3DQualityCount(
      BASE_BACKGROUND_BUILDING_COUNT,
      profile.capabilities.backgroundDetailScale,
      MIN_BACKGROUND_BUILDING_COUNT
    ),
  };
}

const BASE_TRAFFIC_VEHICLE_COUNT = 5;
const MIN_TRAFFIC_VEHICLE_COUNT = 1;

export type Drift3DNatureMovementCounts = Readonly<{
  trafficVehicleCount: number;
  vegetationScatterScale: number;
}>;

export function getDrift3DNatureMovementCounts(
  tier: Drift3DQualityTier
): Drift3DNatureMovementCounts {
  const profile = getDrift3DQualityProfile(tier);

  return {
    trafficVehicleCount: scaleDrift3DQualityCount(
      BASE_TRAFFIC_VEHICLE_COUNT,
      profile.capabilities.populationScale,
      MIN_TRAFFIC_VEHICLE_COUNT
    ),
    vegetationScatterScale: profile.capabilities.scatterScale,
  };
}

export type Drift3DWaterWeatherLightCapabilities = Readonly<{
  reflectionResolutionScale: number;
  renderProbeScale: number;
}>;

export function getDrift3DWaterWeatherLightCapabilities(
  tier: Drift3DQualityTier
): Drift3DWaterWeatherLightCapabilities {
  const profile = getDrift3DQualityProfile(tier);

  return {
    reflectionResolutionScale: profile.capabilities.reflectionResolutionScale,
    renderProbeScale: profile.capabilities.renderProbeScale,
  };
}

// ---------------------------------------------------------------------------
// Nature/Movement — deterministic closed traffic path.
// ---------------------------------------------------------------------------

export type Drift3DTrafficPath = Readonly<{
  centerX: number;
  centerZ: number;
  radiusX: number;
  radiusZ: number;
}>;

export type Drift3DTrafficPathPoint = Readonly<{ x: number; z: number }>;

export type Drift3DTrafficPathSample = Readonly<{
  position: Drift3DTrafficPathPoint;
  tangent: Drift3DTrafficPathPoint;
  headingRadians: number;
}>;

/**
 * Samples a closed elliptical path at normalized progress `t` (any real
 * number; wrapped via `t mod 1`). Returns world-space position, a unit
 * tangent vector (direction of travel), and the equivalent Y-axis heading in
 * radians (`atan2(tangent.x, tangent.z)`, matching three.js's Z-forward/
 * Y-up convention for `object.rotation.y`). Pure, no rigid-body/collision
 * simulation — path-following only, per this kit's own bounded scope.
 */
export function sampleDrift3DTrafficPath(
  path: Drift3DTrafficPath,
  t: number
): Drift3DTrafficPathSample {
  const wrapped = ((t % 1) + 1) % 1;
  const angle = wrapped * Math.PI * 2;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const position: Drift3DTrafficPathPoint = {
    x: path.centerX + cos * path.radiusX,
    z: path.centerZ + sin * path.radiusZ,
  };
  const rawTangentX = -sin * path.radiusX;
  const rawTangentZ = cos * path.radiusZ;
  const length = Math.hypot(rawTangentX, rawTangentZ) || 1;
  const tangent: Drift3DTrafficPathPoint = {
    x: rawTangentX / length,
    z: rawTangentZ / length,
  };

  return {
    position,
    tangent,
    headingRadians: Math.atan2(tangent.x, tangent.z),
  };
}

/**
 * Normalizes `elapsedSeconds` into a `[0, 1)` loop progress given a positive
 * `loopDurationSeconds`. Deterministic and side-effect-free: the same pair
 * of inputs always yields the same progress, so a caller can reconstruct
 * traffic position directly from absolute time — no accumulated per-frame
 * state to desynchronize.
 */
export function getDrift3DTrafficLoopProgress(
  elapsedSeconds: number,
  loopDurationSeconds: number
): number {
  if (
    !Number.isFinite(elapsedSeconds) ||
    !Number.isFinite(loopDurationSeconds) ||
    loopDurationSeconds <= 0
  ) {
    return 0;
  }

  const wrapped = elapsedSeconds % loopDurationSeconds;

  return wrapped < 0
    ? (wrapped + loopDurationSeconds) / loopDurationSeconds
    : wrapped / loopDurationSeconds;
}

/**
 * Rotation delta (radians) for a wheel of `wheelRadiusMeters` travelling at
 * `speedMetersPerSecond` over `deltaSeconds` — `distance / radius`. Returns
 * `0` for any non-finite input, a non-positive radius, or a negative delta,
 * never `NaN`/`Infinity`.
 */
export function computeDrift3DWheelRotationDelta(
  speedMetersPerSecond: number,
  wheelRadiusMeters: number,
  deltaSeconds: number
): number {
  if (
    !Number.isFinite(speedMetersPerSecond) ||
    !Number.isFinite(wheelRadiusMeters) ||
    wheelRadiusMeters <= 0 ||
    !Number.isFinite(deltaSeconds) ||
    deltaSeconds < 0
  ) {
    return 0;
  }

  return (speedMetersPerSecond * deltaSeconds) / wheelRadiusMeters;
}

// ---------------------------------------------------------------------------
// Water/Weather/Light — bounded technical presets (parameter tests, not
// final ocean art; see the pilot component and evidence package).
// ---------------------------------------------------------------------------

export type Drift3DWaterPresetId = "calm-canal-seed" | "rough-open-water-seed";

export type Drift3DWaterPreset = Readonly<{
  id: Drift3DWaterPresetId;
  label: string;
  distortionScale: number;
  waveSpeed: number;
  sunElevationDegrees: number;
}>;

const CALM_CANAL_SEED: Drift3DWaterPreset = Object.freeze({
  id: "calm-canal-seed",
  label: "Calm / canal seed",
  distortionScale: 0.9,
  waveSpeed: 0.25,
  sunElevationDegrees: 38,
});

const ROUGH_OPEN_WATER_SEED: Drift3DWaterPreset = Object.freeze({
  id: "rough-open-water-seed",
  label: "Rougher / open-water seed",
  distortionScale: 4.2,
  waveSpeed: 0.9,
  sunElevationDegrees: 18,
});

export const DRIFT_3D_WATER_PRESETS: readonly Drift3DWaterPreset[] =
  Object.freeze([CALM_CANAL_SEED, ROUGH_OPEN_WATER_SEED]);

export function isDrift3DWaterPresetId(
  value: unknown
): value is Drift3DWaterPresetId {
  return value === "calm-canal-seed" || value === "rough-open-water-seed";
}

export function getDrift3DWaterPreset(
  id: Drift3DWaterPresetId
): Drift3DWaterPreset {
  return id === "calm-canal-seed" ? CALM_CANAL_SEED : ROUGH_OPEN_WATER_SEED;
}

export type Drift3DWaterPresetCandidate = Readonly<{
  id: string;
  label: string;
  distortionScale: number;
  waveSpeed: number;
  sunElevationDegrees: number;
}>;

export type Drift3DWaterPresetIssueType =
  | "invalid-id"
  | "duplicate-id"
  | "preset-missing"
  | "empty-label"
  | "distortion-scale-out-of-bounds"
  | "wave-speed-out-of-bounds"
  | "sun-elevation-out-of-bounds";

export type Drift3DWaterPresetIssue = Readonly<{
  type: Drift3DWaterPresetIssueType;
  id: string;
  message: string;
}>;

const DISTORTION_SCALE_BOUNDS = { min: 0, max: 8 };
const WAVE_SPEED_BOUNDS = { min: 0, max: 2 };
const SUN_ELEVATION_BOUNDS = { min: 0, max: 90 };

/**
 * Validates a set of water preset candidates against bounded technical
 * ranges (never an artistic judgement) and the two-canonical-preset
 * requirement: invalid/unknown `id`, duplicate `id`, a missing canonical
 * preset, empty `label`, or a numeric field outside its bounded range.
 */
export function getDrift3DWaterPresetIssues(
  presets: readonly Drift3DWaterPresetCandidate[]
): readonly Drift3DWaterPresetIssue[] {
  const issues: Drift3DWaterPresetIssue[] = [];
  const seenIds = new Set<string>();

  for (const preset of presets) {
    if (!isDrift3DWaterPresetId(preset.id)) {
      issues.push({
        type: "invalid-id",
        id: preset.id,
        message: `Water preset id "${preset.id}" is not canonical.`,
      });
    } else if (seenIds.has(preset.id)) {
      issues.push({
        type: "duplicate-id",
        id: preset.id,
        message: `Water preset id "${preset.id}" is duplicated.`,
      });
    } else {
      seenIds.add(preset.id);
    }

    if (!preset.label.trim()) {
      issues.push({
        type: "empty-label",
        id: preset.id,
        message: `Water preset "${preset.id}" has an empty label.`,
      });
    }

    if (
      !Number.isFinite(preset.distortionScale) ||
      preset.distortionScale < DISTORTION_SCALE_BOUNDS.min ||
      preset.distortionScale > DISTORTION_SCALE_BOUNDS.max
    ) {
      issues.push({
        type: "distortion-scale-out-of-bounds",
        id: preset.id,
        message: `Water preset "${preset.id}" distortionScale (${preset.distortionScale}) must be within [${DISTORTION_SCALE_BOUNDS.min}, ${DISTORTION_SCALE_BOUNDS.max}].`,
      });
    }

    if (
      !Number.isFinite(preset.waveSpeed) ||
      preset.waveSpeed < WAVE_SPEED_BOUNDS.min ||
      preset.waveSpeed > WAVE_SPEED_BOUNDS.max
    ) {
      issues.push({
        type: "wave-speed-out-of-bounds",
        id: preset.id,
        message: `Water preset "${preset.id}" waveSpeed (${preset.waveSpeed}) must be within [${WAVE_SPEED_BOUNDS.min}, ${WAVE_SPEED_BOUNDS.max}].`,
      });
    }

    if (
      !Number.isFinite(preset.sunElevationDegrees) ||
      preset.sunElevationDegrees < SUN_ELEVATION_BOUNDS.min ||
      preset.sunElevationDegrees > SUN_ELEVATION_BOUNDS.max
    ) {
      issues.push({
        type: "sun-elevation-out-of-bounds",
        id: preset.id,
        message: `Water preset "${preset.id}" sunElevationDegrees (${preset.sunElevationDegrees}) must be within [${SUN_ELEVATION_BOUNDS.min}, ${SUN_ELEVATION_BOUNDS.max}].`,
      });
    }
  }

  const requiredIds: readonly Drift3DWaterPresetId[] = [
    "calm-canal-seed",
    "rough-open-water-seed",
  ];

  for (const requiredId of requiredIds) {
    if (!seenIds.has(requiredId)) {
      issues.push({
        type: "preset-missing",
        id: requiredId,
        message: `Required water preset "${requiredId}" is missing.`,
      });
    }
  }

  return issues;
}

export function getDrift3DCanonicalWaterPresetIssues(): readonly Drift3DWaterPresetIssue[] {
  return getDrift3DWaterPresetIssues(DRIFT_3D_WATER_PRESETS);
}
