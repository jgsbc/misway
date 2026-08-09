import type {
  Drift3DLandmark,
  Drift3DLandmarkPrimitive,
  Drift3DMaterialKind,
} from "@/lib/drift3dLandmarks";
import { drift3dTrackNodeBySlug } from "@/lib/drift3dTopology";
import {
  DRIFT_EVOLUTION_ZEELAND_BASIN,
  DRIFT_EVOLUTION_ZEELAND_ROUTE,
} from "@/lib/driftEvolutionZeelandGeography";

export type DriftEvolutionFoolfouleCrowdFlow = Readonly<{
  id: string;
  start: readonly [number, number];
  end: readonly [number, number];
  halfWidth: number;
  slots: number;
}>;

const foolfoule = drift3dTrackNodeBySlug.foolfoule.position;
const zeelandApproach =
  DRIFT_EVOLUTION_ZEELAND_ROUTE[DRIFT_EVOLUTION_ZEELAND_ROUTE.length - 2];

export const DRIFT_EVOLUTION_FOOLFOULE_CENTER = Object.freeze({
  x: foolfoule.x,
  z: foolfoule.z,
});

/**
 * FOOLFOULE begins where Zeeland hands the player back to dry city streets.
 * The first proof is intentionally asymmetric: the harbour side stays open,
 * then the commercial canyon compresses progressively east of the track node.
 */
export const DRIFT_EVOLUTION_FOOLFOULE_CORRIDOR = Object.freeze({
  minX: zeelandApproach.x,
  maxX: DRIFT_EVOLUTION_FOOLFOULE_CENTER.x + 13.5,
  centerZ: DRIFT_EVOLUTION_FOOLFOULE_CENTER.z,
  halfWidth: 2.25,
  sidewalkOffset: 3.35,
  sidewalkDepth: 1.35,
});

export const DRIFT_EVOLUTION_FOOLFOULE_LANDMARK_ID =
  "evolution-foolfoule-commercial-canyon";

export const DRIFT_EVOLUTION_FOOLFOULE_SOURCE_LANDMARK_ID =
  "birth-foolfoule-canyon";

type BuildingSpec = Readonly<{
  x: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  material: Drift3DMaterialKind;
  color: string;
  rotation?: number;
}>;

const BUILDINGS: readonly BuildingSpec[] = Object.freeze([
  Object.freeze({
    x: -2.8,
    z: 6.25,
    width: 3.8,
    height: 6.6,
    depth: 3.2,
    material: "windowsDay" as const,
    color: "#ffffff",
    rotation: 0.03,
  }),
  Object.freeze({
    x: 2.0,
    z: 6.4,
    width: 4.0,
    height: 5.2,
    depth: 3.4,
    material: "granite" as const,
    color: "#9a9996",
    rotation: -0.025,
  }),
  Object.freeze({
    x: 7.0,
    z: 6.15,
    width: 4.5,
    height: 7.6,
    depth: 3.2,
    material: "windowsDay" as const,
    color: "#ffffff",
    rotation: 0.02,
  }),
  Object.freeze({
    x: 11.25,
    z: 6.35,
    width: 3.0,
    height: 4.8,
    depth: 3.0,
    material: "concrete" as const,
    color: "#85898c",
  }),
  Object.freeze({
    x: -3.0,
    z: -6.3,
    width: 3.6,
    height: 5.4,
    depth: 3.2,
    material: "concrete" as const,
    color: "#8a8985",
    rotation: -0.025,
  }),
  Object.freeze({
    x: 1.8,
    z: -6.2,
    width: 4.1,
    height: 7.2,
    depth: 3.3,
    material: "windowsDay" as const,
    color: "#ffffff",
    rotation: 0.025,
  }),
  Object.freeze({
    x: 6.8,
    z: -6.4,
    width: 4.2,
    height: 5.9,
    depth: 3.2,
    material: "granite" as const,
    color: "#969491",
    rotation: -0.02,
  }),
  Object.freeze({
    x: 11.2,
    z: -6.05,
    width: 3.1,
    height: 8.0,
    depth: 3.0,
    material: "windowsDay" as const,
    color: "#ffffff",
  }),
]);

/**
 * Rotated/adapted salvage of the historical pressure-field idea: two opposing
 * longitudinal streams plus two dense transverse crossings. The exact old
 * 192-person composition is deliberately not restored; 100 lightweight slots
 * are enough to prove pressure and circulation before foreground fidelity.
 */
export const DRIFT_EVOLUTION_FOOLFOULE_CROWD = Object.freeze({
  count: 100,
  speed: 0.5,
  visibilityRadius: 38,
  avoidanceRadius: 2.05,
});

export const DRIFT_EVOLUTION_FOOLFOULE_CROWD_FLOWS: readonly DriftEvolutionFoolfouleCrowdFlow[] =
  Object.freeze([
    Object.freeze({
      id: "south-side-eastbound",
      start: [-9.5, -3.35] as const,
      end: [12.5, -3.35] as const,
      halfWidth: 0.48,
      slots: 30,
    }),
    Object.freeze({
      id: "north-side-westbound",
      start: [12.5, 3.35] as const,
      end: [-9.5, 3.35] as const,
      halfWidth: 0.48,
      slots: 30,
    }),
    Object.freeze({
      id: "west-crossing-northbound",
      start: [-1.5, -4.55] as const,
      end: [-1.5, 4.55] as const,
      halfWidth: 0.26,
      slots: 20,
    }),
    Object.freeze({
      id: "east-crossing-southbound",
      start: [5.4, 4.55] as const,
      end: [5.4, -4.55] as const,
      halfWidth: 0.26,
      slots: 20,
    }),
  ]);

function box(
  offset: [number, number, number],
  args: [number, number, number],
  options: Partial<Drift3DLandmarkPrimitive> = {}
): Drift3DLandmarkPrimitive {
  return {
    kind: "box",
    offset,
    args,
    color: "#6d6c68",
    material: "concrete",
    roughness: 0.92,
    ...options,
  } as Drift3DLandmarkPrimitive;
}

function buildingPrimitive(spec: BuildingSpec): Drift3DLandmarkPrimitive {
  return box([spec.x, 0, spec.z], [spec.width, spec.height, spec.depth], {
    color: spec.color,
    material: spec.material,
    textureRepeat: [Math.max(1, Math.round(spec.width / 2)), 3],
    roughness: spec.material === "windowsDay" ? 0.56 : 0.86,
    rotation: spec.rotation ? [0, spec.rotation, 0] : undefined,
    solid: true,
    solidRadius: Math.min(1.85, Math.max(spec.width, spec.depth) * 0.4),
  });
}

function panelPrimitive(
  x: number,
  z: number,
  width: number,
  height: number,
  color: string
): Drift3DLandmarkPrimitive {
  return box([x, height * 0.55, z], [width, height, 0.08], {
    color,
    material: undefined,
    roughness: 0.38,
    emissive: color,
    emissiveIntensity: 0.16,
  });
}

export function buildDriftEvolutionFoolfouleLandmark(): Drift3DLandmark {
  const corridor = DRIFT_EVOLUTION_FOOLFOULE_CORRIDOR;
  const roadLength = corridor.maxX - corridor.minX;
  const roadCenterX =
    (corridor.minX + corridor.maxX) / 2 - DRIFT_EVOLUTION_FOOLFOULE_CENTER.x;
  const primitives: Drift3DLandmarkPrimitive[] = [
    box([roadCenterX, 0.025, 0], [roadLength, 0.05, corridor.halfWidth * 2], {
      color: "#505153",
      roughness: 0.97,
    }),
    box(
      [roadCenterX, 0.04, corridor.sidewalkOffset],
      [roadLength, 0.08, corridor.sidewalkDepth],
      { color: "#85827c", roughness: 0.94 }
    ),
    box(
      [roadCenterX, 0.04, -corridor.sidewalkOffset],
      [roadLength, 0.08, corridor.sidewalkDepth],
      { color: "#85827c", roughness: 0.94 }
    ),
    ...BUILDINGS.map(buildingPrimitive),
  ];

  // Static commercial screens only establish the ordinary streetscape. Their
  // tracking/pivot/counter behaviour is deliberately deferred to dramaturgy.
  primitives.push(
    panelPrimitive(-2.8, 4.61, 1.7, 1.0, "#d2b98d"),
    panelPrimitive(2.0, 4.66, 2.0, 1.15, "#a9c3c9"),
    panelPrimitive(7.0, 4.51, 2.2, 1.35, "#c8a7a0"),
    panelPrimitive(11.25, 4.81, 1.55, 0.9, "#c7c1ae"),
    panelPrimitive(-3.0, -4.66, 1.65, 0.95, "#b5bdc8"),
    panelPrimitive(1.8, -4.51, 2.0, 1.25, "#d0b18e"),
    panelPrimitive(6.8, -4.76, 2.05, 1.1, "#a7b9ae"),
    panelPrimitive(11.2, -4.51, 1.6, 1.3, "#c3a9b3")
  );

  return {
    id: DRIFT_EVOLUTION_FOOLFOULE_LANDMARK_ID,
    origin: {
      x: DRIFT_EVOLUTION_FOOLFOULE_CENTER.x,
      z: DRIFT_EVOLUTION_FOOLFOULE_CENTER.z,
    },
    primitives,
  };
}

export function getDriftEvolutionFoolfouleCrowdFlowForIndex(index: number) {
  const normalized =
    ((Math.trunc(index) % DRIFT_EVOLUTION_FOOLFOULE_CROWD.count) +
      DRIFT_EVOLUTION_FOOLFOULE_CROWD.count) %
    DRIFT_EVOLUTION_FOOLFOULE_CROWD.count;
  let cursor = 0;

  for (const flow of DRIFT_EVOLUTION_FOOLFOULE_CROWD_FLOWS) {
    cursor += flow.slots;
    if (normalized < cursor) return flow;
  }

  return DRIFT_EVOLUTION_FOOLFOULE_CROWD_FLOWS[0];
}

export function getDriftEvolutionFoolfouleCrowdFlowLength(
  flow: DriftEvolutionFoolfouleCrowdFlow
) {
  return Math.hypot(flow.end[0] - flow.start[0], flow.end[1] - flow.start[1]);
}

export function sampleDriftEvolutionFoolfouleCrowdFlow(
  flow: DriftEvolutionFoolfouleCrowdFlow,
  progress: number,
  lateralOffset: number
) {
  const t = ((progress % 1) + 1) % 1;
  const dx = flow.end[0] - flow.start[0];
  const dz = flow.end[1] - flow.start[1];
  const length = Math.hypot(dx, dz) || 1;
  const lateral = Math.max(-flow.halfWidth, Math.min(flow.halfWidth, lateralOffset));
  const rightX = dz / length;
  const rightZ = -dx / length;

  return {
    x: flow.start[0] + dx * t + rightX * lateral,
    z: flow.start[1] + dz * t + rightZ * lateral,
    heading: Math.atan2(dx, dz),
  };
}

function rectanglesOverlap(
  a: { minX: number; maxX: number; minZ: number; maxZ: number },
  b: { minX: number; maxX: number; minZ: number; maxZ: number }
) {
  return !(
    a.maxX <= b.minX ||
    a.minX >= b.maxX ||
    a.maxZ <= b.minZ ||
    a.minZ >= b.maxZ
  );
}

export function getDriftEvolutionFoolfouleIssues() {
  const issues: string[] = [];
  const basin = DRIFT_EVOLUTION_ZEELAND_BASIN;
  const basinBounds = {
    minX: basin.centerX - basin.width / 2,
    maxX: basin.centerX + basin.width / 2,
    minZ: basin.centerZ - basin.depth / 2,
    maxZ: basin.centerZ + basin.depth / 2,
  };
  const routeEnd = DRIFT_EVOLUTION_ZEELAND_ROUTE[DRIFT_EVOLUTION_ZEELAND_ROUTE.length - 1];

  if (
    Math.hypot(
      routeEnd.x - DRIFT_EVOLUTION_FOOLFOULE_CENTER.x,
      routeEnd.z - DRIFT_EVOLUTION_FOOLFOULE_CENTER.z
    ) > 0.001
  ) {
    issues.push("Zeeland route must hand directly into Foolfoule");
  }

  for (const building of BUILDINGS) {
    const worldX = DRIFT_EVOLUTION_FOOLFOULE_CENTER.x + building.x;
    const worldZ = DRIFT_EVOLUTION_FOOLFOULE_CENTER.z + building.z;
    const bounds = {
      minX: worldX - building.width / 2,
      maxX: worldX + building.width / 2,
      minZ: worldZ - building.depth / 2,
      maxZ: worldZ + building.depth / 2,
    };

    if (rectanglesOverlap(bounds, basinBounds)) {
      issues.push("Foolfoule buildings must stay out of Zeeland harbour water");
      break;
    }

    if (
      Math.abs(building.z) - building.depth / 2 <
      DRIFT_EVOLUTION_FOOLFOULE_CORRIDOR.halfWidth + 1
    ) {
      issues.push("commercial canyon must preserve a driveable central corridor");
      break;
    }
  }

  const slots = DRIFT_EVOLUTION_FOOLFOULE_CROWD_FLOWS.reduce(
    (sum, flow) => sum + flow.slots,
    0
  );
  if (slots !== DRIFT_EVOLUTION_FOOLFOULE_CROWD.count) {
    issues.push("crowd-flow slots must exactly match the bounded population count");
  }

  if (
    DRIFT_EVOLUTION_FOOLFOULE_CORRIDOR.minX > zeelandApproach.x + 0.01 ||
    DRIFT_EVOLUTION_FOOLFOULE_CORRIDOR.maxX <
      DRIFT_EVOLUTION_FOOLFOULE_CENTER.x + 10
  ) {
    issues.push("commercial corridor must continue east from the Zeeland approach");
  }

  return issues;
}
