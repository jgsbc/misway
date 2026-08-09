import type {
  Drift3DLandmark,
  Drift3DLandmarkPrimitive,
} from "@/lib/drift3dLandmarks";
import {
  DRIFT_3D_TOPOLOGY_WORLD_DEPTH,
  DRIFT_3D_TOPOLOGY_WORLD_WIDTH,
  drift3dTrackNodeBySlug,
} from "@/lib/drift3dTopology";
import { DRIFT_EVOLUTION_ENTRY_CAVE } from "@/lib/driftEvolutionEntryCave";

export const DRIFT_EVOLUTION_ZEELAND_OFFSET = Object.freeze({ x: 12, z: 3 });

const canonicalZeeland = drift3dTrackNodeBySlug["a-walk-in-zeeland"].position;
const foolfoule = drift3dTrackNodeBySlug.foolfoule.position;

export const DRIFT_EVOLUTION_ZEELAND_TARGET = Object.freeze({
  x: canonicalZeeland.x + DRIFT_EVOLUTION_ZEELAND_OFFSET.x,
  z: canonicalZeeland.z + DRIFT_EVOLUTION_ZEELAND_OFFSET.z,
});

export const DRIFT_EVOLUTION_ZEELAND_CANAL = Object.freeze({
  centerX: DRIFT_EVOLUTION_ZEELAND_TARGET.x - 4,
  minZ: DRIFT_EVOLUTION_ZEELAND_TARGET.z - 6,
  maxZ: DRIFT_EVOLUTION_ZEELAND_TARGET.z + 25,
  halfWidth: 2.6,
  quayOffset: 0.25,
});

export const DRIFT_EVOLUTION_ZEELAND_BASIN = Object.freeze({
  centerX: DRIFT_EVOLUTION_ZEELAND_TARGET.x - 1,
  centerZ: DRIFT_EVOLUTION_ZEELAND_TARGET.z + 31,
  width: 18,
  depth: 16,
});

/**
 * First spatial pass only: the route proves how Entry reveals water, how the
 * drive stays dry on the east bank, and how Foolfoule becomes the Birth Yard
 * horizon. It is not yet a generalized road system.
 */
export const DRIFT_EVOLUTION_ZEELAND_ROUTE = Object.freeze([
  Object.freeze({
    x: DRIFT_EVOLUTION_ENTRY_CAVE.exitX,
    z: DRIFT_EVOLUTION_ENTRY_CAVE.centerZ,
  }),
  Object.freeze({ x: -82.8, z: 13.6 }),
  Object.freeze({ x: -78, z: 15.4 }),
  Object.freeze({ x: -74.8, z: 18 }),
  Object.freeze({ x: -74.8, z: 31 }),
  Object.freeze({ x: -74.5, z: 39.5 }),
  Object.freeze({ x: -70.5, z: 42 }),
  Object.freeze({ x: foolfoule.x, z: foolfoule.z }),
] as const);

export const DRIFT_EVOLUTION_ZEELAND_ROUTE_WIDTH = 3.2;
export const DRIFT_EVOLUTION_ZEELAND_GEOGRAPHY_LANDMARK_ID =
  "evolution-zeeland-port-geography";

function box(
  offset: [number, number, number],
  args: [number, number, number],
  options: Partial<Drift3DLandmarkPrimitive> = {}
): Drift3DLandmarkPrimitive {
  return {
    kind: "box",
    offset,
    args,
    color: "#77736d",
    material: "concrete",
    roughness: 0.94,
    ...options,
  } as Drift3DLandmarkPrimitive;
}

function roadSegment(
  from: { x: number; z: number },
  to: { x: number; z: number }
): Drift3DLandmarkPrimitive {
  const dx = to.x - from.x;
  const dz = to.z - from.z;
  const length = Math.hypot(dx, dz);
  const centerX = (from.x + to.x) / 2 - DRIFT_EVOLUTION_ZEELAND_TARGET.x;
  const centerZ = (from.z + to.z) / 2 - DRIFT_EVOLUTION_ZEELAND_TARGET.z;

  return box(
    [centerX, 0.025, centerZ],
    [DRIFT_EVOLUTION_ZEELAND_ROUTE_WIDTH, 0.05, length + 0.18],
    {
      color: "#565652",
      roughness: 0.97,
      rotation: [0, Math.atan2(dx, dz), 0],
    }
  );
}

function quaySegments(
  worldX: number,
  minZ: number,
  maxZ: number,
  count: number
): Drift3DLandmarkPrimitive[] {
  const depth = (maxZ - minZ) / count;

  return Array.from({ length: count }, (_, index) => {
    const worldZ = minZ + depth * (index + 0.5);

    return box(
      [
        worldX - DRIFT_EVOLUTION_ZEELAND_TARGET.x,
        0.02,
        worldZ - DRIFT_EVOLUTION_ZEELAND_TARGET.z,
      ],
      [0.38, 0.42, depth + 0.08],
      {
        color: index % 3 === 0 ? "#6c6964" : "#77736d",
        solid: true,
        solidRadius: 0.5,
      }
    );
  });
}

function basinEdgeSegments(): Drift3DLandmarkPrimitive[] {
  const basin = DRIFT_EVOLUTION_ZEELAND_BASIN;
  const minX = basin.centerX - basin.width / 2;
  const maxX = basin.centerX + basin.width / 2;
  const minZ = basin.centerZ - basin.depth / 2;
  const maxZ = basin.centerZ + basin.depth / 2;
  const primitives: Drift3DLandmarkPrimitive[] = [];

  // West/east and north edges make the basin physically legible. The south
  // edge stays open where the canal enters the harbour.
  primitives.push(...quaySegments(minX - 0.2, minZ, maxZ, 5));
  primitives.push(...quaySegments(maxX + 0.2, minZ, maxZ, 5));

  const northSegments = 6;
  const width = basin.width / northSegments;
  for (let index = 0; index < northSegments; index += 1) {
    const worldX = minX + width * (index + 0.5);
    primitives.push(
      box(
        [
          worldX - DRIFT_EVOLUTION_ZEELAND_TARGET.x,
          0.02,
          maxZ + 0.2 - DRIFT_EVOLUTION_ZEELAND_TARGET.z,
        ],
        [width + 0.08, 0.42, 0.38],
        {
          color: index % 2 === 0 ? "#716d67" : "#7a766f",
          solid: true,
          solidRadius: 0.55,
        }
      )
    );
  }

  return primitives;
}

export function buildDriftEvolutionZeelandGeographyLandmark(): Drift3DLandmark {
  const canal = DRIFT_EVOLUTION_ZEELAND_CANAL;
  const eastWallX = canal.centerX + canal.halfWidth + canal.quayOffset;
  const westWallX = canal.centerX - canal.halfWidth - canal.quayOffset;
  const primitives: Drift3DLandmarkPrimitive[] = [
    ...DRIFT_EVOLUTION_ZEELAND_ROUTE.slice(0, -1).map((point, index) =>
      roadSegment(point, DRIFT_EVOLUTION_ZEELAND_ROUTE[index + 1])
    ),
    ...quaySegments(westWallX, canal.minZ, canal.maxZ, 10),
    ...quaySegments(eastWallX, canal.minZ, canal.maxZ, 10),
    ...basinEdgeSegments(),
  ];

  // Continuous east-bank promenade. It visually stitches Entry, the inherited
  // canal houses and the larger working harbour without becoming a collider.
  primitives.push(
    box(
      [
        eastWallX + 1.35 - DRIFT_EVOLUTION_ZEELAND_TARGET.x,
        0.035,
        (canal.minZ + canal.maxZ) / 2 - DRIFT_EVOLUTION_ZEELAND_TARGET.z,
      ],
      [2.25, 0.07, canal.maxZ - canal.minZ],
      { color: "#858078", roughness: 0.92 }
    )
  );

  // Lifting-bridge silhouette: spatial marker only in this pass. Its later
  // motion belongs to track activity/cues, not to this geography proof.
  const bridgeZ = 36;
  primitives.push(
    box(
      [
        canal.centerX - DRIFT_EVOLUTION_ZEELAND_TARGET.x,
        0.24,
        bridgeZ - DRIFT_EVOLUTION_ZEELAND_TARGET.z,
      ],
      [7.1, 0.18, 2.15],
      { color: "#6d6b66", material: "wood", roughness: 0.86 }
    ),
    box(
      [
        westWallX - DRIFT_EVOLUTION_ZEELAND_TARGET.x,
        0,
        bridgeZ - DRIFT_EVOLUTION_ZEELAND_TARGET.z,
      ],
      [0.28, 2.4, 0.3],
      { color: "#565b60", roughness: 0.68 }
    ),
    box(
      [
        eastWallX - DRIFT_EVOLUTION_ZEELAND_TARGET.x,
        0,
        bridgeZ - DRIFT_EVOLUTION_ZEELAND_TARGET.z,
      ],
      [0.28, 2.4, 0.3],
      { color: "#565b60", roughness: 0.68 }
    )
  );

  // Low working-port masses give the basin a real opposite bank while keeping
  // Foolfoule's taller canyon as the unmistakable Birth Yard horizon.
  primitives.push(
    box([-13, 0, 31], [4.6, 2.2, 6.2], {
      color: "#7d7770",
      material: "brick",
      roughness: 0.94,
      solid: true,
      solidRadius: 1.4,
    }),
    box([-5, 0, 42], [8.2, 1.75, 3.4], {
      color: "#797a77",
      roughness: 0.9,
      solid: true,
      solidRadius: 1.5,
    }),
    box([3.2, 0, 41], [0.22, 3.6, 0.22], {
      color: "#5d6267",
      roughness: 0.68,
    }),
    box([4.65, 3.05, 41], [3.1, 0.16, 0.18], {
      color: "#62676c",
      roughness: 0.66,
    })
  );

  return {
    id: DRIFT_EVOLUTION_ZEELAND_GEOGRAPHY_LANDMARK_ID,
    origin: {
      x: DRIFT_EVOLUTION_ZEELAND_TARGET.x,
      z: DRIFT_EVOLUTION_ZEELAND_TARGET.z,
    },
    primitives,
  };
}

function pointInsideBasin(point: { x: number; z: number }) {
  const basin = DRIFT_EVOLUTION_ZEELAND_BASIN;
  return (
    Math.abs(point.x - basin.centerX) <= basin.width / 2 &&
    Math.abs(point.z - basin.centerZ) <= basin.depth / 2
  );
}

export function getDriftEvolutionZeelandGeographyIssues(): readonly string[] {
  const issues: string[] = [];
  const worldHalfWidth = DRIFT_3D_TOPOLOGY_WORLD_WIDTH / 2;
  const worldHalfDepth = DRIFT_3D_TOPOLOGY_WORLD_DEPTH / 2;
  const canal = DRIFT_EVOLUTION_ZEELAND_CANAL;
  const basin = DRIFT_EVOLUTION_ZEELAND_BASIN;
  const revealDistance = Math.hypot(
    DRIFT_EVOLUTION_ZEELAND_TARGET.x - DRIFT_EVOLUTION_ENTRY_CAVE.exitX,
    DRIFT_EVOLUTION_ZEELAND_TARGET.z - DRIFT_EVOLUTION_ENTRY_CAVE.centerZ
  );

  if (revealDistance < 12 || revealDistance > 18) {
    issues.push("Zeeland must reveal immediately after the recovered Entry");
  }

  if (canal.maxZ - canal.minZ < 28) {
    issues.push("Zeeland canal must read as geography, not a decorative basin");
  }

  const basinMinX = basin.centerX - basin.width / 2;
  const basinMaxX = basin.centerX + basin.width / 2;
  const basinMinZ = basin.centerZ - basin.depth / 2;
  const basinMaxZ = basin.centerZ + basin.depth / 2;
  if (
    basinMinX < -worldHalfWidth ||
    basinMaxX > worldHalfWidth ||
    basinMinZ < -worldHalfDepth ||
    basinMaxZ > worldHalfDepth
  ) {
    issues.push("Zeeland harbour basin must remain inside the compact DRIFT map");
  }

  if (pointInsideBasin(foolfoule)) {
    issues.push("Foolfoule must stay on land as Zeeland's distant urban horizon");
  }

  const routeStart = DRIFT_EVOLUTION_ZEELAND_ROUTE[0];
  const routeEnd = DRIFT_EVOLUTION_ZEELAND_ROUTE.at(-1);
  if (
    Math.hypot(
      routeStart.x - DRIFT_EVOLUTION_ENTRY_CAVE.exitX,
      routeStart.z - DRIFT_EVOLUTION_ENTRY_CAVE.centerZ
    ) > 0.01
  ) {
    issues.push("Zeeland route must begin at the Entry exit");
  }
  if (!routeEnd || Math.hypot(routeEnd.x - foolfoule.x, routeEnd.z - foolfoule.z) > 0.01) {
    issues.push("Zeeland route must hand the player toward Foolfoule");
  }

  const firstDryCrossing = DRIFT_EVOLUTION_ZEELAND_ROUTE.find(
    (point) => point.z >= canal.minZ
  );
  if (!firstDryCrossing || firstDryCrossing.x <= canal.centerX + canal.halfWidth) {
    issues.push("Entry-to-Zeeland route must reach the dry east bank before the canal begins");
  }

  return issues;
}
