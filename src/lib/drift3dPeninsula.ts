/**
 * MISWAY peninsula geography recovered from the Fable R&D branch.
 *
 * This module is deliberately pure and project-local. It contains the proven
 * metric geography only: bounds, folded spine, macro regions, deterministic
 * relief and the central bay. Routes are a later Campaign A slice.
 *
 * Fable authored its useful geometry in source coordinates x[-130..580],
 * z[-230..480]. Production terrain is centered at the world origin, so the
 * source geography is translated by its center only. No scale is applied:
 * one source unit remains one production metre.
 */

export type Drift3DPeninsulaEraId =
  | "entry"
  | "birth-yard"
  | "older-shadows"
  | "vegetative-field"
  | "new-signal";

export type Drift3DPeninsulaRelief =
  | "gorge"
  | "port"
  | "massif"
  | "basin"
  | "coast"
  | "water";

export type Drift3DPeninsulaRegion = Readonly<{
  id: string;
  era: Drift3DPeninsulaEraId;
  x: number;
  z: number;
  radius: number;
  baseY: number;
  relief: Drift3DPeninsulaRelief;
  lift?: number;
}>;

export const DRIFT_3D_PENINSULA_SOURCE_BOUNDS = Object.freeze({
  minX: -130,
  maxX: 580,
  minZ: -230,
  maxZ: 480,
});

export const DRIFT_3D_PENINSULA_SOURCE_ORIGIN = Object.freeze({
  x:
    (DRIFT_3D_PENINSULA_SOURCE_BOUNDS.minX +
      DRIFT_3D_PENINSULA_SOURCE_BOUNDS.maxX) /
    2,
  z:
    (DRIFT_3D_PENINSULA_SOURCE_BOUNDS.minZ +
      DRIFT_3D_PENINSULA_SOURCE_BOUNDS.maxZ) /
    2,
});

export const DRIFT_3D_PENINSULA_WIDTH =
  DRIFT_3D_PENINSULA_SOURCE_BOUNDS.maxX -
  DRIFT_3D_PENINSULA_SOURCE_BOUNDS.minX;
export const DRIFT_3D_PENINSULA_DEPTH =
  DRIFT_3D_PENINSULA_SOURCE_BOUNDS.maxZ -
  DRIFT_3D_PENINSULA_SOURCE_BOUNDS.minZ;

export const DRIFT_3D_PENINSULA_BOUNDS = Object.freeze({
  minX: -DRIFT_3D_PENINSULA_WIDTH / 2,
  maxX: DRIFT_3D_PENINSULA_WIDTH / 2,
  minZ: -DRIFT_3D_PENINSULA_DEPTH / 2,
  maxZ: DRIFT_3D_PENINSULA_DEPTH / 2,
});

export const DRIFT_3D_SEA_LEVEL = 0;

export function drift3dPeninsulaPoint(sourceX: number, sourceZ: number) {
  return {
    x: sourceX - DRIFT_3D_PENINSULA_SOURCE_ORIGIN.x,
    z: sourceZ - DRIFT_3D_PENINSULA_SOURCE_ORIGIN.z,
  };
}

export function drift3dPeninsulaSourcePoint(x: number, z: number) {
  return {
    x: x + DRIFT_3D_PENINSULA_SOURCE_ORIGIN.x,
    z: z + DRIFT_3D_PENINSULA_SOURCE_ORIGIN.z,
  };
}

const SOURCE_SPINE: ReadonlyArray<readonly [number, number, number]> = [
  [0, 0.4, 160],
  [6, 1.2, 182],
  [18, 3.5, 204],
  [36, 8, 226],
  [62, 15, 248],
  [96, 25, 268],
  [134, 38, 288],
  [172, 52, 310],
  [206, 64, 336],
  [232, 74, 366],
  [258, 78, 396],
  [288, 74, 418],
  [326, 62, 428],
  [366, 48, 424],
  [402, 36, 406],
  [430, 27, 378],
  [448, 20, 344],
  [458, 15, 306],
  [462, 13, 266],
  [458, 13, 224],
  [448, 13, 184],
  [434, 14, 146],
  [418, 17, 106],
  [400, 20, 66],
  [378, 22, 26],
  [350, 21, -14],
  [312, 19, -52],
  [266, 17, -84],
  [214, 15, -110],
  [158, 13, -130],
  [100, 11, -146],
  [40, 9, -158],
  [-20, 8, -166],
] as const;

export const DRIFT_3D_PENINSULA_SPINE = Object.freeze(
  SOURCE_SPINE.map(([sourceX, y, sourceZ]) => {
    const point = drift3dPeninsulaPoint(sourceX, sourceZ);

    return Object.freeze([point.x, y, point.z] as const);
  })
);

type SourceRegion = Readonly<{
  id: string;
  era: Drift3DPeninsulaEraId;
  x: number;
  z: number;
  radius: number;
  baseY: number;
  relief: Drift3DPeninsulaRelief;
  lift?: number;
}>;

const SOURCE_REGIONS: readonly SourceRegion[] = [
  { id: "entry", era: "entry", x: 0, z: -30, radius: 70, baseY: 5, relief: "gorge" },
  { id: "birth-yard", era: "birth-yard", x: 0, z: 80, radius: 120, baseY: 0.4, relief: "port" },
  {
    id: "os-approach",
    era: "older-shadows",
    x: 70,
    z: 240,
    radius: 90,
    baseY: 12,
    relief: "massif",
    lift: 22,
  },
  {
    id: "os-massif",
    era: "older-shadows",
    x: 210,
    z: 350,
    radius: 160,
    baseY: 38,
    relief: "massif",
    lift: 96,
  },
  {
    id: "vf-basin",
    era: "vegetative-field",
    x: 452,
    z: 250,
    radius: 150,
    baseY: 14,
    relief: "basin",
  },
  {
    id: "ns-coast",
    era: "new-signal",
    x: 300,
    z: -40,
    radius: 150,
    baseY: 19,
    relief: "coast",
  },
  {
    id: "ns-west",
    era: "new-signal",
    x: 60,
    z: -150,
    radius: 150,
    baseY: 10,
    relief: "coast",
  },
  {
    id: "central-bay",
    era: "new-signal",
    x: 258,
    z: 85,
    radius: 142,
    baseY: -4,
    relief: "water",
  },
] as const;

export const DRIFT_3D_PENINSULA_REGIONS: readonly Drift3DPeninsulaRegion[] =
  Object.freeze(
    SOURCE_REGIONS.map((region) => {
      const point = drift3dPeninsulaPoint(region.x, region.z);

      return Object.freeze({ ...region, x: point.x, z: point.z });
    })
  );

function regionById(id: string) {
  const region = DRIFT_3D_PENINSULA_REGIONS.find((candidate) => candidate.id === id);

  if (!region) {
    throw new Error(`Unknown peninsula region: ${id}`);
  }

  return region;
}

export const DRIFT_3D_PENINSULA_ERA_CENTERS = Object.freeze({
  "birth-yard": Object.freeze({
    x: regionById("birth-yard").x,
    z: regionById("birth-yard").z,
  }),
  "older-shadows": Object.freeze({
    x: regionById("os-massif").x,
    z: regionById("os-massif").z,
  }),
  "vegetative-field": Object.freeze({
    x: regionById("vf-basin").x,
    z: regionById("vf-basin").z,
  }),
  "new-signal": Object.freeze({
    x: regionById("ns-coast").x,
    z: regionById("ns-coast").z,
  }),
});

export const DRIFT_3D_PENINSULA_ENTRY_SPAWN = Object.freeze(
  drift3dPeninsulaPoint(0.66, -56.5)
);

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function smoothstep(edge0: number, edge1: number, value: number) {
  if (edge0 === edge1) {
    return value < edge0 ? 0 : 1;
  }

  const t = clamp01((value - edge0) / (edge1 - edge0));

  return t * t * (3 - 2 * t);
}

function hashNoise(x: number, z: number) {
  const value = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;

  return value - Math.floor(value);
}

function valueNoise(x: number, z: number) {
  const xi = Math.floor(x);
  const zi = Math.floor(z);
  const xf = x - xi;
  const zf = z - zi;
  const u = xf * xf * (3 - 2 * xf);
  const v = zf * zf * (3 - 2 * zf);
  const a = hashNoise(xi, zi);
  const b = hashNoise(xi + 1, zi);
  const c = hashNoise(xi, zi + 1);
  const d = hashNoise(xi + 1, zi + 1);

  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v - 0.5;
}

function fbm(x: number, z: number) {
  return (
    valueNoise(x * 0.02, z * 0.02) * 1 +
    valueNoise(x * 0.06 + 17, z * 0.06) * 0.45 +
    valueNoise(x * 0.15 + 91, z * 0.15) * 0.2
  );
}

function regionWeight(region: Drift3DPeninsulaRegion, x: number, z: number) {
  const distance = Math.hypot(x - region.x, z - region.z);

  return 1 - smoothstep(region.radius * 0.55, region.radius * 1.25, distance);
}

export function getDrift3DPeninsulaRegionAt(x: number, z: number) {
  let best = DRIFT_3D_PENINSULA_REGIONS[1];
  let bestWeight = -1;

  for (const region of DRIFT_3D_PENINSULA_REGIONS) {
    const weight = regionWeight(region, x, z);

    if (weight > bestWeight) {
      best = region;
      bestWeight = weight;
    }
  }

  return best;
}

export function getDrift3DPeninsulaEraAt(x: number, z: number) {
  return getDrift3DPeninsulaRegionAt(x, z).era;
}

export function getDrift3DPeninsulaBayField(x: number, z: number) {
  const bay = regionById("central-bay");
  const dx = x - bay.x;
  const dz = (z - bay.z) / 1.35;

  return Math.hypot(dx, dz) - bay.radius;
}

/**
 * Base terrain before route carving. Route influence intentionally waits for
 * Campaign A3 so this migration changes one spatial authority at a time.
 */
export function getDrift3DPeninsulaBaseHeight(x: number, z: number) {
  let totalWeight = 0;
  let height = 0;
  const source = drift3dPeninsulaSourcePoint(x, z);

  for (const region of DRIFT_3D_PENINSULA_REGIONS) {
    const weight = regionWeight(region, x, z);

    if (weight <= 0.001) {
      continue;
    }

    const distance = Math.hypot(x - region.x, z - region.z);
    let local = region.baseY;

    switch (region.relief) {
      case "massif": {
        const core = 1 - Math.min(1, distance / region.radius);
        local =
          region.baseY +
          Math.pow(core, 1.7) * (region.lift ?? 90) +
          fbm(source.x, source.z) * (3 + core * 12);
        break;
      }
      case "basin":
        local =
          region.baseY +
          Math.min(6, distance * 0.02) +
          fbm(source.x, source.z) * 0.8;
        break;
      case "coast": {
        const seaward = smoothstep(-120, -260, source.z);
        local =
          region.baseY -
          seaward * 46 +
          Math.max(0, distance - region.radius * 0.5) * 0.16 +
          fbm(source.x, source.z) * 2.4;
        break;
      }
      case "water":
        local = region.baseY - 6;
        break;
      case "port":
      case "gorge":
      default:
        local = region.baseY + fbm(source.x, source.z) * 0.4;
        break;
    }

    height += local * weight;
    totalWeight += weight;
  }

  let ground =
    totalWeight < 0.001
      ? 26 + fbm(source.x, source.z) * 6
      : height / totalWeight;
  const bayField = getDrift3DPeninsulaBayField(x, z);

  if (bayField < 30) {
    const submerge = 1 - smoothstep(-40, 30, bayField);
    ground =
      ground * (1 - submerge) +
      (DRIFT_3D_SEA_LEVEL - 9) * submerge;
  }

  return ground;
}
