import { DRIFT_3D_FLOOR_Y } from "@/lib/drift3d";
import {
  drift3dThresholdNode,
  drift3dTrackNodes,
  getDrift3DNodeRadius,
} from "@/lib/drift3dTopology";

/**
 * DRIFT-3D-27 — moteur de relief.
 *
 * Heightfield analytique : la hauteur est une somme de primitives lisses
 * (pics gaussiens, crêtes, cratères, rampes de saut) dérivées des données
 * éras/tracks. Analytique = la physique interroge hauteur et pente partout,
 * sans mesh de collision. Un aplatissement automatique protège chaque nœud
 * (pad plat + fondu), et des hautes terres de bordure remplacent les murs
 * artificiels aux limites du monde.
 */

type PeakFeature = {
  kind: "peak";
  x: number;
  z: number;
  radius: number;
  height: number;
};

type CraterFeature = {
  kind: "crater";
  x: number;
  z: number;
  radius: number;
  depth: number;
  rimHeight?: number;
  rimWidth?: number;
};

type RidgeFeature = {
  kind: "ridge";
  x1: number;
  z1: number;
  x2: number;
  z2: number;
  width: number;
  height: number;
};

type RampFeature = {
  kind: "ramp";
  x: number;
  z: number;
  directionX: number;
  directionZ: number;
  length: number;
  width: number;
  height: number;
  /** Longueur de la falaise après la lèvre (petite = gros saut). */
  lipDrop: number;
  /** Une courbe de skatepark garde une pente montante jusque sur la lèvre. */
  profile?: "smooth" | "quarter-pipe";
  /** Fondu latéral réservé aux extrémités ; le reste de la rampe reste plat. */
  edgeFade?: number;
};

export type Drift3DTerrainFeature =
  | PeakFeature
  | CraterFeature
  | RidgeFeature
  | RampFeature;

function smoothstep01(t: number) {
  const clamped = Math.min(1, Math.max(0, t));

  return clamped * clamped * (3 - 2 * clamped);
}

function gaussianFalloff(distance: number, radius: number) {
  const normalized = distance / radius;

  return Math.exp(-normalized * normalized * 2.2);
}

function segmentDistance(
  px: number,
  pz: number,
  x1: number,
  z1: number,
  x2: number,
  z2: number
) {
  const dx = x2 - x1;
  const dz = z2 - z1;
  const lengthSquared = dx * dx + dz * dz;
  const t =
    lengthSquared === 0
      ? 0
      : Math.min(
          1,
          Math.max(0, ((px - x1) * dx + (pz - z1) * dz) / lengthSquared)
        );

  return Math.hypot(px - (x1 + dx * t), pz - (z1 + dz * t));
}

export const DRIFT_3D_EDGE_JUMP_RAMPS = Object.freeze([
  {
    kind: "ramp",
    x: -103,
    z: 0,
    directionX: -1,
    directionZ: 0,
    length: 4.2,
    width: 136,
    height: 4.4,
    lipDrop: 0.7,
    profile: "quarter-pipe",
    edgeFade: 8,
  },
  {
    kind: "ramp",
    x: 103,
    z: 0,
    directionX: 1,
    directionZ: 0,
    length: 4.2,
    width: 136,
    height: 4.4,
    lipDrop: 0.7,
    profile: "quarter-pipe",
    edgeFade: 8,
  },
] as const satisfies readonly RampFeature[]);

const terrainFeatures: Drift3DTerrainFeature[] = [
  // ─── Bordures : quarter-pipes est/ouest, talus nord/sud ─────────────────
  { kind: "ridge", x1: -116, z1: -84, x2: -116, z2: 84, width: 13, height: 9 },
  { kind: "ridge", x1: 116, z1: -84, x2: 116, z2: 84, width: 13, height: 7 },
  { kind: "ridge", x1: -116, z1: 86, x2: 116, z2: 86, width: 13, height: 6 },
  { kind: "ridge", x1: -116, z1: -86, x2: 116, z2: -86, width: 13, height: 8 },

  // ─── Older Shadows — le massif ───────────────────────────────────────────
  { kind: "peak", x: -62, z: -78, radius: 24, height: 22 },
  { kind: "peak", x: -44, z: -80, radius: 16, height: 15 },
  { kind: "peak", x: -72, z: -56, radius: 13, height: 11 },
  { kind: "peak", x: -92, z: -70, radius: 18, height: 16 },
  { kind: "ridge", x1: -30, z1: -72, x2: -12, z2: -78, width: 9, height: 7 },
  // le col de minuit moins cinq, entre deux épaules
  { kind: "peak", x: -58, z: -28, radius: 9, height: 7 },
  { kind: "peak", x: -34, z: -44, radius: 8, height: 6 },
  // la méga-rampe de blossoming, lancée vers la plaine
  {
    kind: "ramp",
    x: -42,
    z: -60,
    directionX: 0.55,
    directionZ: 0.835,
    length: 12,
    width: 6,
    height: 6,
    lipDrop: 1.2,
  },

  // ─── Birth Yard — la ville plate, canaux en creux ────────────────────────
  { kind: "ridge", x1: -95.5, z1: 18, x2: -89.4, z2: 18, width: 1.7, height: -1.1 },
  { kind: "ridge", x1: -95.5, z1: 22.6, x2: -89.4, z2: 22.6, width: 1.7, height: -1.1 },

  // ─── Vegetative Field — ondulations douces, fosse de craie ──────────────
  { kind: "peak", x: -20, z: 16, radius: 20, height: 1.8 },
  { kind: "peak", x: 20, z: -2, radius: 22, height: 2.2 },
  {
    kind: "crater",
    x: 12,
    z: 8,
    radius: 9,
    depth: 3,
    rimHeight: 0.6,
    rimWidth: 2.5,
  },

  // ─── New Signal — vallonné nocturne ──────────────────────────────────────
  { kind: "peak", x: 66, z: 8, radius: 18, height: 2.5 },
  { kind: "peak", x: 70, z: -30, radius: 16, height: 3 },
  { kind: "peak", x: 84, z: 24, radius: 14, height: 2 },
  // gorge de glace d'asitis : deux parois, un passage
  { kind: "ridge", x1: 36, z1: 6, x2: 44, z2: 22, width: 4, height: 6 },
  { kind: "ridge", x1: 48, z1: 2, x2: 56, z2: 18, width: 4, height: 5 },
  // le puits de relative
  {
    kind: "crater",
    x: 60,
    z: -4,
    radius: 6.5,
    depth: 2.8,
    rimHeight: 0.5,
    rimWidth: 2,
  },
  // la lande du passeur, légèrement bombée
  { kind: "peak", x: 52, z: -28, radius: 12, height: 1.2 },
  // la colline calme de midnight work
  { kind: "peak", x: 86, z: -46, radius: 12, height: 4.5 },
  // le belvédère du monde qui s'endort
  { kind: "peak", x: 72, z: -60, radius: 10, height: 5 },
  // la descente vers la mer de renee
  { kind: "ridge", x1: 34, z1: -64, x2: 62, z2: -64, width: 10, height: -1.2 },
  { kind: "ridge", x1: 30, z1: -72, x2: 64, z2: -72, width: 14, height: -2.5 },
];

function evaluateFeature(
  feature: Drift3DTerrainFeature,
  x: number,
  z: number
): number {
  switch (feature.kind) {
    case "peak": {
      const distance = Math.hypot(x - feature.x, z - feature.z);

      return feature.height * gaussianFalloff(distance, feature.radius);
    }
    case "crater": {
      const distance = Math.hypot(x - feature.x, z - feature.z);
      const bowl = -feature.depth * gaussianFalloff(distance, feature.radius);
      const rim =
        feature.rimHeight && feature.rimWidth
          ? feature.rimHeight *
            Math.exp(
              -(((distance - feature.radius) / feature.rimWidth) ** 2) * 2.2
            )
          : 0;

      return bowl + rim;
    }
    case "ridge": {
      const distance = segmentDistance(
        x,
        z,
        feature.x1,
        feature.z1,
        feature.x2,
        feature.z2
      );

      return feature.height * gaussianFalloff(distance, feature.width);
    }
    case "ramp": {
      const localU =
        (x - feature.x) * feature.directionX +
        (z - feature.z) * feature.directionZ;
      const localV =
        -(x - feature.x) * feature.directionZ +
        (z - feature.z) * feature.directionX;

      if (localU < 0 || localU > feature.length + feature.lipDrop) {
        return 0;
      }

      const halfWidth = feature.width / 2;
      const across = feature.edgeFade
        ? smoothstep01((halfWidth - Math.abs(localV)) / feature.edgeFade)
        : smoothstep01(1 - Math.abs(localV) / halfWidth);
      const progress = localU / feature.length;
      const along =
        localU <= feature.length
          ? feature.profile === "quarter-pipe"
            ? progress * progress
            : smoothstep01(progress)
          : Math.max(0, 1 - (localU - feature.length) / feature.lipDrop);

      return feature.height * along * across;
    }
  }
}

function getRawTerrainHeight(x: number, z: number) {
  let height = 0;

  for (const feature of terrainFeatures) {
    height += evaluateFeature(feature, x, z);
  }

  return height;
}

function getEdgeJumpRampHeight(x: number, z: number) {
  let height = 0;

  for (const ramp of DRIFT_3D_EDGE_JUMP_RAMPS) {
    height += evaluateFeature(ramp, x, z);
  }

  return height;
}

/** Pads plats autour des nœuds : centre plat, fondu jusqu'au bord. */
const FLATTEN_INNER = 2.6;
const FLATTEN_OUTER = 6;

type FlattenPad = { x: number; z: number; targetHeight: number; outer: number };

const flattenPads: FlattenPad[] = [
  ...drift3dTrackNodes.map((node) => ({
    x: node.position.x,
    z: node.position.z,
    targetHeight: getRawTerrainHeight(node.position.x, node.position.z),
    outer: Math.max(FLATTEN_OUTER, getDrift3DNodeRadius(node) * 0.9),
  })),
  {
    x: drift3dThresholdNode.position.x,
    z: drift3dThresholdNode.position.z,
    targetHeight: getRawTerrainHeight(
      drift3dThresholdNode.position.x,
      drift3dThresholdNode.position.z
    ),
    outer: 8,
  },
];

export function getDrift3DTerrainHeight(x: number, z: number): number {
  const raw = getRawTerrainHeight(x, z);
  let weightSum = 0;
  let weightedTarget = 0;

  for (const pad of flattenPads) {
    const distance = Math.hypot(x - pad.x, z - pad.z);

    if (distance >= pad.outer) {
      continue;
    }

    const weight = smoothstep01(
      1 - (distance - FLATTEN_INNER) / (pad.outer - FLATTEN_INNER)
    );
    weightSum += weight;
    weightedTarget += pad.targetHeight * weight;
  }

  if (weightSum <= 0) {
    return raw + getEdgeJumpRampHeight(x, z);
  }

  const blend = Math.min(1, weightSum);
  const flattened =
    raw * (1 - blend) + (weightedTarget / weightSum) * blend;

  return flattened + getEdgeJumpRampHeight(x, z);
}

/** Hauteur absolue (monde) du sol en ce point. */
export function getDrift3DGroundY(x: number, z: number): number {
  return DRIFT_3D_FLOOR_Y + getDrift3DTerrainHeight(x, z);
}

export function getDrift3DTerrainNormal(
  x: number,
  z: number
): { x: number; y: number; z: number } {
  const epsilon = 0.35;
  const heightWest = getDrift3DTerrainHeight(x - epsilon, z);
  const heightEast = getDrift3DTerrainHeight(x + epsilon, z);
  const heightNorth = getDrift3DTerrainHeight(x, z - epsilon);
  const heightSouth = getDrift3DTerrainHeight(x, z + epsilon);
  const normalX = (heightWest - heightEast) / (2 * epsilon);
  const normalZ = (heightNorth - heightSouth) / (2 * epsilon);
  const length = Math.hypot(normalX, 1, normalZ);

  return { x: normalX / length, y: 1 / length, z: normalZ / length };
}
