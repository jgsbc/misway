import {
  drift3dEras,
  drift3dThresholdNode,
  drift3dTrackNodes,
} from "@/lib/drift3dTopology";
import {
  getDrift3DTerrainHeight,
  getDrift3DTerrainNormal,
} from "@/lib/drift3dTerrain";
import type { Drift3DVehicleCollider } from "@/lib/drift3dVehiclePhysics";

/**
 * DRIFT-3D-32 — densification du décor.
 *
 * Dispersion déterministe d'instances par archétype (conifères, feuillus,
 * buissons, rochers, herbes, troncs morts, réverbères, acacias, coquelicots),
 * pilotée par les données : appartenance d'éra, altitude (ligne des neiges),
 * pente, et distance de protection aux nœuds de topologie. Tout est rendu en
 * InstancedMesh (~12 draw calls pour des milliers d'objets) ; seuls les gros
 * sujets loin des nœuds deviennent des colliders.
 */

export type Drift3DScatterKind =
  | "conifer"
  | "broadleaf"
  | "bush"
  | "rock"
  | "grass"
  | "deadTree"
  | "lamppost"
  | "acacia"
  | "poppy"
  | "cityBlock";

export type Drift3DScatterInstance = {
  x: number;
  z: number;
  y: number;
  scale: number;
  rotationY: number;
};

const NODE_PROTECTION_RADIUS = 8;
const COLLIDER_NODE_DISTANCE = 10;

const protectedPoints = [
  ...drift3dTrackNodes.map((node) => ({
    x: node.position.x,
    z: node.position.z,
  })),
  {
    x: drift3dThresholdNode.position.x,
    z: drift3dThresholdNode.position.z,
  },
];

function hash(seed: number, index: number) {
  const value = Math.sin(seed * 374761.31 + index * 668265.263) * 43758.5453;

  return value - Math.floor(value);
}

function distanceToNearestNode(x: number, z: number) {
  let nearest = Infinity;

  for (const point of protectedPoints) {
    const distance = Math.hypot(x - point.x, z - point.z);

    if (distance < nearest) {
      nearest = distance;
    }
  }

  return nearest;
}

function eraWeight(x: number, z: number, eraId: string) {
  const era = drift3dEras.find((candidate) => candidate.id === eraId);

  if (!era) {
    return 0;
  }

  const distance = Math.hypot(x - era.center.x, z - era.center.z);
  const outside = Math.max(0, distance - era.radius * 0.6);

  return 1 / (1 + outside * outside * 0.008);
}

type ScatterRule = {
  kind: Drift3DScatterKind;
  count: number;
  seed: number;
  /** Zone de tirage : centre + rayon, ou tout le monde jouable. */
  area?: { x: number; z: number; radius: number };
  minScale: number;
  maxScale: number;
  /** Probabilité d'apparition pilotée par la position (0..1). */
  density: (x: number, z: number, height: number, slope: number) => number;
  solid?: { radius: number };
};

const WORLD_HALF_X = 106;
const WORLD_HALF_Z = 74;

const scatterRules: ScatterRule[] = [
  {
    // conifères sur les pentes du massif, sous la ligne des neiges
    kind: "conifer",
    count: 260,
    seed: 11,
    minScale: 0.7,
    maxScale: 1.5,
    density: (x, z, height, slope) => {
      if (height > 9 || slope > 0.55) {
        return 0;
      }

      return eraWeight(x, z, "older-shadows") * (height > 0.6 ? 0.95 : 0.15);
    },
    solid: { radius: 0.22 },
  },
  {
    // feuillus de plaine et de lisière urbaine
    kind: "broadleaf",
    count: 170,
    seed: 23,
    minScale: 0.7,
    maxScale: 1.3,
    density: (x, z, height, slope) => {
      if (slope > 0.35 || height > 4) {
        return 0;
      }

      return (
        eraWeight(x, z, "vegetative-field") * 0.5 +
        eraWeight(x, z, "birth-yard") * 0.3
      );
    },
    solid: { radius: 0.2 },
  },
  {
    // buissons partout où c'est doux
    kind: "bush",
    count: 320,
    seed: 37,
    minScale: 0.6,
    maxScale: 1.4,
    density: (x, z, height, slope) => (slope > 0.5 ? 0 : 0.55),
  },
  {
    // rochers d'éboulis sur les pentes, épars ailleurs
    kind: "rock",
    count: 320,
    seed: 41,
    minScale: 0.5,
    maxScale: 1.8,
    density: (x, z, height, slope) =>
      Math.min(1, 0.18 + slope * 1.6 + (height > 6 ? 0.3 : 0)),
    solid: { radius: 0.3 },
  },
  {
    // herbes hautes de la plaine céréalière
    kind: "grass",
    count: 720,
    seed: 53,
    minScale: 0.6,
    maxScale: 1.3,
    density: (x, z, height, slope) => {
      if (slope > 0.4) {
        return 0;
      }

      return eraWeight(x, z, "vegetative-field") * 0.95;
    },
  },
  {
    // tissu urbain de Birth Yard : immeubles de fond entre les scènes
    kind: "cityBlock",
    count: 90,
    seed: 103,
    minScale: 0.8,
    maxScale: 1.7,
    density: (x, z, height, slope) => {
      if (slope > 0.15 || height > 1.5) {
        return 0;
      }

      return eraWeight(x, z, "birth-yard") * 0.5;
    },
    solid: { radius: 0.8 },
  },
  {
    // troncs argentés morts de la nuit New Signal
    kind: "deadTree",
    count: 130,
    seed: 67,
    minScale: 0.7,
    maxScale: 1.4,
    density: (x, z, height, slope) => {
      if (slope > 0.45) {
        return 0;
      }

      return eraWeight(x, z, "new-signal") * 0.7;
    },
    solid: { radius: 0.16 },
  },
  {
    // réverbères de la ville basse
    kind: "lamppost",
    count: 46,
    seed: 71,
    minScale: 0.9,
    maxScale: 1.1,
    density: (x, z, height, slope) => {
      if (slope > 0.2 || height > 1.5) {
        return 0;
      }

      return eraWeight(x, z, "birth-yard") * 0.85;
    },
    solid: { radius: 0.1 },
  },
  {
    // acacias du plateau d'ethnic-stick
    kind: "acacia",
    count: 44,
    seed: 83,
    area: { x: -18, z: -72, radius: 26 },
    minScale: 0.8,
    maxScale: 1.4,
    density: (x, z, height, slope) => (slope > 0.4 || height > 8 ? 0 : 0.8),
    solid: { radius: 0.18 },
  },
  {
    // les coquelicots de tantitom — la couleur revient
    kind: "poppy",
    count: 130,
    seed: 97,
    area: { x: 36, z: 14, radius: 16 },
    minScale: 0.8,
    maxScale: 1.2,
    density: (x, z, height, slope) => (slope > 0.35 ? 0 : 0.9),
  },
];

let cachedInstances: Record<
  Drift3DScatterKind,
  Drift3DScatterInstance[]
> | null = null;
let cachedColliders: Drift3DVehicleCollider[] | null = null;

function buildScatter() {
  const instances = {} as Record<Drift3DScatterKind, Drift3DScatterInstance[]>;
  const colliders: Drift3DVehicleCollider[] = [];

  for (const rule of scatterRules) {
    const placed: Drift3DScatterInstance[] = [];

    for (let index = 0; index < rule.count; index += 1) {
      const u = hash(rule.seed, index * 2);
      const v = hash(rule.seed, index * 2 + 1);
      let x: number;
      let z: number;

      if (rule.area) {
        const angle = u * Math.PI * 2;
        const distance = Math.sqrt(v) * rule.area.radius;
        x = rule.area.x + Math.cos(angle) * distance;
        z = rule.area.z + Math.sin(angle) * distance;
      } else {
        x = (u - 0.5) * 2 * WORLD_HALF_X;
        z = (v - 0.5) * 2 * WORLD_HALF_Z;
      }

      if (distanceToNearestNode(x, z) < NODE_PROTECTION_RADIUS) {
        continue;
      }

      const height = getDrift3DTerrainHeight(x, z);
      const normal = getDrift3DTerrainNormal(x, z);
      const slope = Math.hypot(normal.x, normal.z) / normal.y;
      const probability = rule.density(x, z, height, slope);

      if (hash(rule.seed + 1, index) > probability) {
        continue;
      }

      const scale =
        rule.minScale +
        hash(rule.seed + 2, index) * (rule.maxScale - rule.minScale);

      placed.push({
        x,
        z,
        y: height,
        scale,
        rotationY: hash(rule.seed + 3, index) * Math.PI * 2,
      });

      if (
        rule.solid &&
        scale > 0.75 &&
        distanceToNearestNode(x, z) > COLLIDER_NODE_DISTANCE
      ) {
        colliders.push({ x, z, radius: rule.solid.radius * scale });
      }
    }

    instances[rule.kind] = placed;
  }

  return { instances, colliders };
}

export function getDrift3DScatterInstances() {
  if (!cachedInstances) {
    const built = buildScatter();
    cachedInstances = built.instances;
    cachedColliders = built.colliders;
  }

  return cachedInstances;
}

export function getDrift3DScatterColliders(): Drift3DVehicleCollider[] {
  if (!cachedColliders) {
    getDrift3DScatterInstances();
  }

  return cachedColliders ?? [];
}
