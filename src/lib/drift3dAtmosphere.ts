import {
  drift3dEras,
  drift3dThresholdNode,
  drift3dTrackNodeBySlug,
} from "@/lib/drift3dTopology";
import type { Drift3DPoint } from "@/lib/drift3d";

/**
 * Runtime color script (DRIFT_3D_REALISM_BIBLE.md + DRIFT_3D_COLOR_SCRIPT.md).
 *
 * Each region carries one physically-plausible lighting hour: a single
 * sun/moon direction, tinted exponential fog, scripted exposure and a ground
 * albedo family. States blend continuously with the vehicle position so the
 * world never cuts between hours — and exposure smoothing in the scene gives
 * the 2-3s eye adaptation when leaving the cave.
 */

export type Drift3DRgb = { r: number; g: number; b: number };

export type Drift3DAtmosphereState = {
  skyColor: Drift3DRgb;
  fogColor: Drift3DRgb;
  fogDensity: number;
  exposure: number;
  sunDirection: { x: number; y: number; z: number };
  sunColor: Drift3DRgb;
  sunIntensity: number;
  hemiSkyColor: Drift3DRgb;
  hemiGroundColor: Drift3DRgb;
  hemiIntensity: number;
  ambientIntensity: number;
  groundColor: Drift3DRgb;
};

type Drift3DAtmosphereRegion = {
  id: string;
  center: { x: number; z: number };
  radius: number;
  /** Weight multiplier — sub-regions (storm, quarry fog) override their era. */
  strength?: number;
  state: Drift3DAtmosphereState;
};

function rgb(hex: string): Drift3DRgb {
  const value = parseInt(hex.slice(1), 16);

  return {
    r: ((value >> 16) & 255) / 255,
    g: ((value >> 8) & 255) / 255,
    b: (value & 255) / 255,
  };
}

const entryState: Drift3DAtmosphereState = {
  // grotte quasi noire, contre-jour froid d'aube dans la découpe λ
  skyColor: rgb("#05060a"),
  fogColor: rgb("#05060a"),
  fogDensity: 0.05,
  exposure: 0.8,
  sunDirection: { x: 1, y: 0.32, z: 0.12 },
  sunColor: rgb("#b8d4e8"),
  sunIntensity: 0.5,
  hemiSkyColor: rgb("#182030"),
  hemiGroundColor: rgb("#0a0a0c"),
  hemiIntensity: 0.25,
  ambientIntensity: 0.05,
  groundColor: rgb("#26262b"),
};

const birthYardState: Drift3DAtmosphereState = {
  // ville sous ciel laiteux voilé, soleil bas chaud (matin urbain)
  skyColor: rgb("#ccd0d2"),
  fogColor: rgb("#c3c7c7"),
  fogDensity: 0.016,
  exposure: 1.05,
  sunDirection: { x: 0.5, y: 0.42, z: 0.4 },
  sunColor: rgb("#ffd9a6"),
  sunIntensity: 1.35,
  hemiSkyColor: rgb("#dde2e6"),
  hemiGroundColor: rgb("#6a655d"),
  hemiIntensity: 0.72,
  ambientIntensity: 0.16,
  groundColor: rgb("#6f6b64"),
};

const olderShadowsState: Drift3DAtmosphereState = {
  // altitude, air limpide, soleil franc et ombres nettes, fin d'après-midi
  skyColor: rgb("#9fc4e6"),
  fogColor: rgb("#b6d0e8"),
  fogDensity: 0.007,
  exposure: 1.08,
  sunDirection: { x: 0.38, y: 0.72, z: 0.32 },
  sunColor: rgb("#fff1d2"),
  sunIntensity: 1.65,
  hemiSkyColor: rgb("#b9d6f2"),
  hemiGroundColor: rgb("#8a7659"),
  hemiIntensity: 0.5,
  ambientIntensity: 0.1,
  groundColor: rgb("#8a7a5e"),
};

const vegetativeFieldState: Drift3DAtmosphereState = {
  // ciel uniformément couvert : lumière plate, quasi aucune ombre marquée
  skyColor: rgb("#d6d6cf"),
  fogColor: rgb("#cfcfc6"),
  fogDensity: 0.014,
  exposure: 0.98,
  sunDirection: { x: 0.15, y: 1, z: 0.1 },
  sunColor: rgb("#e9e9e2"),
  sunIntensity: 0.4,
  hemiSkyColor: rgb("#e4e4da"),
  hemiGroundColor: rgb("#a8a493"),
  hemiIntensity: 1,
  ambientIntensity: 0.32,
  groundColor: rgb("#9aa277"),
};

const newSignalState: Drift3DAtmosphereState = {
  // nuit « argent » : lune froide, ciel sombre, les sources chaudes sont diégétiques
  skyColor: rgb("#0d1119"),
  fogColor: rgb("#10141f"),
  fogDensity: 0.014,
  exposure: 0.98,
  sunDirection: { x: -0.32, y: 0.72, z: -0.42 },
  sunColor: rgb("#cdd8ee"),
  sunIntensity: 0.85,
  hemiSkyColor: rgb("#202839"),
  hemiGroundColor: rgb("#0b0d13"),
  hemiIntensity: 0.48,
  ambientIntensity: 0.1,
  groundColor: rgb("#3a3f49"),
};

const zeelandSunsetState: Drift3DAtmosphereState = {
  // coucher de soleil sur les canaux : soleil à ~5° au-dessus de l'horizon
  skyColor: rgb("#e8c49a"),
  fogColor: rgb("#e0b98e"),
  fogDensity: 0.018,
  exposure: 1.04,
  sunDirection: { x: -0.85, y: 0.12, z: 0.35 },
  sunColor: rgb("#ffb45e"),
  sunIntensity: 1.5,
  hemiSkyColor: rgb("#eecfa8"),
  hemiGroundColor: rgb("#6a5a4c"),
  hemiIntensity: 0.5,
  ambientIntensity: 0.12,
  groundColor: rgb("#786e60"),
};

const jazzNightState: Drift3DAtmosphereState = {
  // 1 h du matin dans les ruelles : nuit urbaine, sodium résiduel
  skyColor: rgb("#12121a"),
  fogColor: rgb("#15151d"),
  fogDensity: 0.022,
  exposure: 0.88,
  sunDirection: { x: -0.2, y: 0.75, z: -0.3 },
  sunColor: rgb("#b9c4dd"),
  sunIntensity: 0.35,
  hemiSkyColor: rgb("#232433"),
  hemiGroundColor: rgb("#171512"),
  hemiIntensity: 0.3,
  ambientIntensity: 0.06,
  groundColor: rgb("#42403c"),
};

const chalkFogState: Drift3DAtmosphereState = {
  // carrière de craie : brouillard blanc dense, silence
  skyColor: rgb("#e6e4dc"),
  fogColor: rgb("#eae8e0"),
  fogDensity: 0.055,
  exposure: 1.02,
  sunDirection: { x: 0.15, y: 1, z: 0.1 },
  sunColor: rgb("#efefe8"),
  sunIntensity: 0.3,
  hemiSkyColor: rgb("#ececde"),
  hemiGroundColor: rgb("#bcb9ac"),
  hemiIntensity: 1,
  ambientIntensity: 0.35,
  groundColor: rgb("#d5d3c6"),
};

const stormState: Drift3DAtmosphereState = {
  // lande de hold-the-light : tempête, ciel écrasé, seul le halo est chaud
  skyColor: rgb("#0b0d13"),
  fogColor: rgb("#0e1118"),
  fogDensity: 0.032,
  exposure: 0.82,
  sunDirection: { x: -0.2, y: 0.7, z: -0.3 },
  sunColor: rgb("#9fb0c9"),
  sunIntensity: 0.28,
  hemiSkyColor: rgb("#1a2130"),
  hemiGroundColor: rgb("#0a0b10"),
  hemiIntensity: 0.25,
  ambientIntensity: 0.05,
  groundColor: rgb("#23262c"),
};

const oceanDawnState: Drift3DAtmosphereState = {
  // plage de ÉTÉÉAOOÉTÉ : aube d'été, sel en suspension, or bas sur l'eau
  skyColor: rgb("#e8c7a2"),
  fogColor: rgb("#d7c4aa"),
  fogDensity: 0.024,
  exposure: 1.04,
  sunDirection: { x: -0.75, y: 0.18, z: -0.22 },
  sunColor: rgb("#ffd18b"),
  sunIntensity: 1.25,
  hemiSkyColor: rgb("#ead2b6"),
  hemiGroundColor: rgb("#8b7c69"),
  hemiIntensity: 0.58,
  ambientIntensity: 0.14,
  groundColor: rgb("#b49d7c"),
};

const eraStateById: Record<string, Drift3DAtmosphereState> = {
  "birth-yard": birthYardState,
  "older-shadows": olderShadowsState,
  "vegetative-field": vegetativeFieldState,
  "new-signal": newSignalState,
};

const atmosphereRegions: Drift3DAtmosphereRegion[] = [
  {
    id: "entry",
    center: {
      x: drift3dThresholdNode.position.x - 5,
      z: drift3dThresholdNode.position.z,
    },
    radius: 12,
    state: entryState,
  },
  ...drift3dEras.map((era) => ({
    id: era.id,
    center: { x: era.center.x, z: era.center.z },
    radius: era.radius,
    state: eraStateById[era.id] ?? birthYardState,
  })),
  // sous-zones : heures scriptées track par track (color script)
  {
    id: "zeeland-sunset",
    center: {
      x: drift3dTrackNodeBySlug["a-walk-in-zeeland"].position.x,
      z: drift3dTrackNodeBySlug["a-walk-in-zeeland"].position.z,
    },
    radius: 9,
    strength: 2.4,
    state: zeelandSunsetState,
  },
  {
    id: "jazz-night",
    center: {
      x: drift3dTrackNodeBySlug.jazzypling.position.x,
      z: drift3dTrackNodeBySlug.jazzypling.position.z,
    },
    radius: 8,
    strength: 2.4,
    state: jazzNightState,
  },
  {
    id: "chalk-fog",
    center: {
      x: drift3dTrackNodeBySlug.chailk.position.x,
      z: drift3dTrackNodeBySlug.chailk.position.z,
    },
    radius: 9,
    strength: 2.6,
    state: chalkFogState,
  },
  {
    id: "hold-the-light-storm",
    center: {
      x: drift3dTrackNodeBySlug["hold-the-light"].position.x,
      z: drift3dTrackNodeBySlug["hold-the-light"].position.z,
    },
    radius: 9,
    strength: 2.6,
    state: stormState,
  },
  {
    id: "eteeaooete-ocean-dawn",
    center: {
      x: drift3dTrackNodeBySlug.eteeaooete.position.x,
      z: drift3dTrackNodeBySlug.eteeaooete.position.z,
    },
    radius: 10,
    strength: 2.5,
    state: oceanDawnState,
  },
];

function getRegionWeight(
  region: Drift3DAtmosphereRegion,
  x: number,
  z: number
) {
  const dx = x - region.center.x;
  const dz = z - region.center.z;
  const distance = Math.sqrt(dx * dx + dz * dz);
  const inner = region.radius * 0.5;
  const outside = Math.max(0, distance - inner);

  return (region.strength ?? 1) / (1 + outside * outside * 0.02);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function mixRgbInto(target: Drift3DRgb, source: Drift3DRgb, weight: number) {
  target.r += source.r * weight;
  target.g += source.g * weight;
  target.b += source.b * weight;
}

export function createDrift3DAtmosphereState(): Drift3DAtmosphereState {
  return structuredClone(entryState);
}

export function getDrift3DAtmosphereAt(
  position: Drift3DPoint | { x: number; z: number },
  out?: Drift3DAtmosphereState
): Drift3DAtmosphereState {
  const result = out ?? createDrift3DAtmosphereState();
  let totalWeight = 0;
  const weights: number[] = [];

  for (const region of atmosphereRegions) {
    const weight = getRegionWeight(region, position.x, position.z);
    weights.push(weight);
    totalWeight += weight;
  }

  for (const color of [
    result.skyColor,
    result.fogColor,
    result.sunColor,
    result.hemiSkyColor,
    result.hemiGroundColor,
    result.groundColor,
  ]) {
    color.r = 0;
    color.g = 0;
    color.b = 0;
  }
  result.fogDensity = 0;
  result.exposure = 0;
  result.sunIntensity = 0;
  result.hemiIntensity = 0;
  result.ambientIntensity = 0;
  result.sunDirection.x = 0;
  result.sunDirection.y = 0;
  result.sunDirection.z = 0;

  for (let index = 0; index < atmosphereRegions.length; index += 1) {
    const weight = weights[index] / totalWeight;
    const state = atmosphereRegions[index].state;

    mixRgbInto(result.skyColor, state.skyColor, weight);
    mixRgbInto(result.fogColor, state.fogColor, weight);
    mixRgbInto(result.sunColor, state.sunColor, weight);
    mixRgbInto(result.hemiSkyColor, state.hemiSkyColor, weight);
    mixRgbInto(result.hemiGroundColor, state.hemiGroundColor, weight);
    mixRgbInto(result.groundColor, state.groundColor, weight);
    result.fogDensity += state.fogDensity * weight;
    result.exposure += state.exposure * weight;
    result.sunIntensity += state.sunIntensity * weight;
    result.hemiIntensity += state.hemiIntensity * weight;
    result.ambientIntensity += state.ambientIntensity * weight;
    result.sunDirection.x += state.sunDirection.x * weight;
    result.sunDirection.y += state.sunDirection.y * weight;
    result.sunDirection.z += state.sunDirection.z * weight;
  }

  return result;
}

/**
 * Moves `current` toward `target` with framerate-independent smoothing.
 * `rate` ~1.4 gives the scripted 2-3s eye adaptation on exposure; faster
 * rates suit fog/color so zone transitions stay readable while driving.
 */
export function smoothDrift3DAtmosphere(
  current: Drift3DAtmosphereState,
  target: Drift3DAtmosphereState,
  delta: number
) {
  const colorT = 1 - Math.exp(-delta * 2.2);
  const exposureT = 1 - Math.exp(-delta * 1.3);

  const pairs: Array<[Drift3DRgb, Drift3DRgb]> = [
    [current.skyColor, target.skyColor],
    [current.fogColor, target.fogColor],
    [current.sunColor, target.sunColor],
    [current.hemiSkyColor, target.hemiSkyColor],
    [current.hemiGroundColor, target.hemiGroundColor],
    [current.groundColor, target.groundColor],
  ];

  for (const [currentColor, targetColor] of pairs) {
    currentColor.r = lerp(currentColor.r, targetColor.r, colorT);
    currentColor.g = lerp(currentColor.g, targetColor.g, colorT);
    currentColor.b = lerp(currentColor.b, targetColor.b, colorT);
  }

  current.fogDensity = lerp(current.fogDensity, target.fogDensity, colorT);
  current.exposure = lerp(current.exposure, target.exposure, exposureT);
  current.sunIntensity = lerp(current.sunIntensity, target.sunIntensity, colorT);
  current.hemiIntensity = lerp(
    current.hemiIntensity,
    target.hemiIntensity,
    colorT
  );
  current.ambientIntensity = lerp(
    current.ambientIntensity,
    target.ambientIntensity,
    colorT
  );
  current.sunDirection.x = lerp(
    current.sunDirection.x,
    target.sunDirection.x,
    colorT
  );
  current.sunDirection.y = lerp(
    current.sunDirection.y,
    target.sunDirection.y,
    colorT
  );
  current.sunDirection.z = lerp(
    current.sunDirection.z,
    target.sunDirection.z,
    colorT
  );
}

export function getDrift3DGroundColorAt(x: number, z: number): Drift3DRgb {
  let totalWeight = 0;
  const result = { r: 0, g: 0, b: 0 };

  for (const region of atmosphereRegions) {
    const weight = getRegionWeight(region, x, z);
    totalWeight += weight;
    mixRgbInto(result, region.state.groundColor, weight);
  }

  result.r /= totalWeight;
  result.g /= totalWeight;
  result.b /= totalWeight;

  return result;
}
