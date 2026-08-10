import type {
  Drift3DLandmark,
  Drift3DLandmarkPrimitive,
  Drift3DMaterialKind,
} from "@/lib/drift3dLandmarks";
import { getDrift3DGroundY } from "@/lib/drift3dTerrain";
import {
  DRIFT_3D_TOPOLOGY_WORLD_DEPTH,
  DRIFT_3D_TOPOLOGY_WORLD_WIDTH,
  drift3dTrackNodeBySlug,
} from "@/lib/drift3dTopology";
import {
  DRIFT_EVOLUTION_FOOLFOULE_CENTER,
  DRIFT_EVOLUTION_FOOLFOULE_CORRIDOR,
} from "@/lib/driftEvolutionFoolfoule";
import {
  DRIFT_EVOLUTION_JAZZYPLING_ROUTE,
} from "@/lib/driftEvolutionJazzyplingDistrict";
import {
  DRIFT_EVOLUTION_ZEELAND_BASIN,
  DRIFT_EVOLUTION_ZEELAND_CANAL,
  DRIFT_EVOLUTION_ZEELAND_ROUTE,
} from "@/lib/driftEvolutionZeelandGeography";

export type DriftEvolutionBirthYardRoutePoint = Readonly<{
  x: number;
  z: number;
}>;

export type DriftEvolutionBirthYardRouteLabRoute = Readonly<{
  id: string;
  graphEdgeId: string;
  role: "main_loop" | "spur";
  width: number;
  material: Drift3DMaterialKind;
  color: string;
  points: readonly DriftEvolutionBirthYardRoutePoint[];
  turnaround?: Readonly<{ x: number; z: number; width: number; depth: number }>;
  waterCrossing?: Readonly<{
    kind: "service_bridge";
    centerZ: number;
    eastBankX: number;
    westBankX: number;
  }>;
}>;

const foolfoule = drift3dTrackNodeBySlug.foolfoule.position;
const sugaredPeach = drift3dTrackNodeBySlug["sugared-peach"].position;
const playIt = drift3dTrackNodeBySlug["play-it"].position;
const funkyHoo = drift3dTrackNodeBySlug["funky-hoo"].position;
const peutEtre = drift3dTrackNodeBySlug["peut-etre"].position;

const foolfouleEastMouth = Object.freeze({
  x: DRIFT_EVOLUTION_FOOLFOULE_CORRIDOR.maxX,
  z: DRIFT_EVOLUTION_FOOLFOULE_CENTER.z,
});
const jazzyplingEastMouth =
  DRIFT_EVOLUTION_JAZZYPLING_ROUTE[DRIFT_EVOLUTION_JAZZYPLING_ROUTE.length - 1];
const jazzyplingSouthFringeJunction = DRIFT_EVOLUTION_JAZZYPLING_ROUTE[1];
const zeelandQuayJunction = DRIFT_EVOLUTION_ZEELAND_ROUTE[4];

/**
 * DRIFT-SPATIAL-BY-10 — evolution-only road proof.
 *
 * These polylines do not move a track and do not redefine the accepted
 * Zeeland/Foolfoule/Jazzypling territories. They only materialize the five
 * missing BY-00 graph edges so the owner can drive the complete Birth Yard
 * network before any production promotion.
 */
export const DRIFT_EVOLUTION_BIRTH_YARD_ROUTE_LAB_ROUTES: readonly DriftEvolutionBirthYardRouteLabRoute[] =
  Object.freeze([
    Object.freeze({
      id: "by10-foolfoule-sugared-peach",
      graphEdgeId: "foolfoule-sugared-peach",
      role: "main_loop" as const,
      width: 3.8,
      material: "granite" as const,
      color: "#515254",
      points: Object.freeze([
        foolfouleEastMouth,
        Object.freeze({ x: -47.7, z: 43.8 }),
        Object.freeze({ x: sugaredPeach.x, z: sugaredPeach.z }),
      ]),
    }),
    Object.freeze({
      id: "by10-sugared-peach-play-it",
      graphEdgeId: "sugared-peach-play-it",
      role: "main_loop" as const,
      width: 3.8,
      material: "granite" as const,
      color: "#535456",
      points: Object.freeze([
        Object.freeze({ x: sugaredPeach.x, z: sugaredPeach.z }),
        Object.freeze({ x: -45.8, z: 43.2 }),
        Object.freeze({ x: -46.2, z: 38.5 }),
        Object.freeze({ x: -48.4, z: 34 }),
        Object.freeze({ x: -51.5, z: 30 }),
        Object.freeze({ x: playIt.x, z: playIt.z }),
      ]),
    }),
    Object.freeze({
      id: "by10-play-it-jazzypling",
      graphEdgeId: "play-it-jazzypling",
      role: "main_loop" as const,
      width: 3.7,
      material: "granite" as const,
      color: "#454749",
      points: Object.freeze([
        Object.freeze({ x: playIt.x, z: playIt.z }),
        Object.freeze({ x: -55, z: 24.2 }),
        Object.freeze({ x: -56.2, z: 22.4 }),
        Object.freeze({ x: jazzyplingEastMouth.x, z: jazzyplingEastMouth.z }),
      ]),
    }),
    Object.freeze({
      id: "by10-zeeland-funky-hoo",
      graphEdgeId: "zeeland-funky-hoo",
      role: "spur" as const,
      width: 3.6,
      material: "granite" as const,
      color: "#595957",
      points: Object.freeze([
        Object.freeze({ x: zeelandQuayJunction.x, z: zeelandQuayJunction.z }),
        Object.freeze({ x: -76.1, z: 32.2 }),
        Object.freeze({ x: -77.4, z: 33.1 }),
        Object.freeze({ x: -80, z: 33.1 }),
        Object.freeze({ x: -82.6, z: 33.1 }),
        Object.freeze({ x: -84.2, z: 33.4 }),
        Object.freeze({ x: -88, z: 34.8 }),
        Object.freeze({ x: -92, z: 37.2 }),
        Object.freeze({ x: funkyHoo.x, z: funkyHoo.z }),
      ]),
      turnaround: Object.freeze({
        x: funkyHoo.x,
        z: funkyHoo.z,
        width: 6.4,
        depth: 5.2,
      }),
      waterCrossing: Object.freeze({
        kind: "service_bridge" as const,
        centerZ: 33.1,
        eastBankX: -77.4,
        westBankX: -82.6,
      }),
    }),
    Object.freeze({
      id: "by10-jazzypling-peut-etre",
      graphEdgeId: "jazzypling-peut-etre",
      role: "spur" as const,
      width: 3.8,
      material: "granite" as const,
      color: "#5b5953",
      points: Object.freeze([
        Object.freeze({
          x: jazzyplingSouthFringeJunction.x,
          z: jazzyplingSouthFringeJunction.z,
        }),
        Object.freeze({ x: -74, z: 12 }),
        Object.freeze({ x: -78, z: 8 }),
        Object.freeze({ x: -82, z: 5 }),
        Object.freeze({ x: -87, z: 2.5 }),
        Object.freeze({ x: -92, z: 1 }),
        Object.freeze({ x: peutEtre.x, z: peutEtre.z }),
      ]),
      turnaround: Object.freeze({
        x: peutEtre.x,
        z: peutEtre.z,
        width: 6.6,
        depth: 5.4,
      }),
    }),
  ]);

export const DRIFT_EVOLUTION_BIRTH_YARD_ROUTE_LAB_LANDMARK_ID =
  "evolution-birth-yard-route-lab";

const ROUTE_LAB_ORIGIN = Object.freeze({ x: -74, z: 22 });

function box(
  offset: [number, number, number],
  args: [number, number, number],
  options: Partial<Drift3DLandmarkPrimitive> = {}
): Drift3DLandmarkPrimitive {
  return {
    kind: "box",
    offset,
    args,
    color: "#515254",
    material: "granite",
    roughness: 0.95,
    ...options,
  } as Drift3DLandmarkPrimitive;
}

function segmentPrimitive(
  route: DriftEvolutionBirthYardRouteLabRoute,
  from: DriftEvolutionBirthYardRoutePoint,
  to: DriftEvolutionBirthYardRoutePoint
): Drift3DLandmarkPrimitive {
  const dx = to.x - from.x;
  const dz = to.z - from.z;
  const length = Math.hypot(dx, dz);
  const midpointX = (from.x + to.x) / 2;
  const midpointZ = (from.z + to.z) / 2;
  const isServiceBridge =
    route.waterCrossing?.kind === "service_bridge" &&
    Math.abs(midpointZ - route.waterCrossing.centerZ) <= 0.2 &&
    midpointX <= route.waterCrossing.eastBankX + 0.2 &&
    midpointX >= route.waterCrossing.westBankX - 0.2;

  return box(
    [
      midpointX - ROUTE_LAB_ORIGIN.x,
      isServiceBridge ? 0.055 : 0.018,
      midpointZ - ROUTE_LAB_ORIGIN.z,
    ],
    [route.width, isServiceBridge ? 0.055 : 0.036, length + 0.14],
    {
      color: isServiceBridge ? "#686760" : route.color,
      material: route.material,
      textureRepeat: [2, Math.max(1, Math.round(length / 2))],
      rotation: [0, Math.atan2(dx, dz), 0],
      roughness: isServiceBridge ? 0.88 : 0.96,
    }
  );
}

function turnaroundPrimitive(
  route: DriftEvolutionBirthYardRouteLabRoute
): Drift3DLandmarkPrimitive | null {
  const turnaround = route.turnaround;
  if (!turnaround) return null;

  return box(
    [
      turnaround.x - ROUTE_LAB_ORIGIN.x,
      0.016,
      turnaround.z - ROUTE_LAB_ORIGIN.z,
    ],
    [turnaround.width, 0.032, turnaround.depth],
    {
      color: route.color,
      material: route.material,
      textureRepeat: [2, 2],
      roughness: 0.97,
    }
  );
}

export function buildDriftEvolutionBirthYardRouteLabLandmark(): Drift3DLandmark {
  const primitives: Drift3DLandmarkPrimitive[] = [];

  for (const route of DRIFT_EVOLUTION_BIRTH_YARD_ROUTE_LAB_ROUTES) {
    for (let index = 0; index < route.points.length - 1; index += 1) {
      primitives.push(
        segmentPrimitive(route, route.points[index], route.points[index + 1])
      );
    }

    const turnaround = turnaroundPrimitive(route);
    if (turnaround) primitives.push(turnaround);
  }

  return {
    id: DRIFT_EVOLUTION_BIRTH_YARD_ROUTE_LAB_LANDMARK_ID,
    origin: ROUTE_LAB_ORIGIN,
    primitives,
  };
}

function pointInsideCanal(point: DriftEvolutionBirthYardRoutePoint) {
  const canal = DRIFT_EVOLUTION_ZEELAND_CANAL;
  return (
    point.z >= canal.minZ &&
    point.z <= canal.maxZ &&
    Math.abs(point.x - canal.centerX) <= canal.halfWidth
  );
}

function pointInsideBasin(point: DriftEvolutionBirthYardRoutePoint) {
  const basin = DRIFT_EVOLUTION_ZEELAND_BASIN;
  return (
    Math.abs(point.x - basin.centerX) <= basin.width / 2 &&
    Math.abs(point.z - basin.centerZ) <= basin.depth / 2
  );
}

function sampleRoute(
  route: DriftEvolutionBirthYardRouteLabRoute,
  spacing = 0.5
) {
  const samples: Array<{ x: number; z: number; segmentIndex: number }> = [];

  for (let index = 0; index < route.points.length - 1; index += 1) {
    const from = route.points[index];
    const to = route.points[index + 1];
    const length = Math.hypot(to.x - from.x, to.z - from.z);
    const steps = Math.max(1, Math.ceil(length / spacing));

    for (let step = 0; step <= steps; step += 1) {
      const t = step / steps;
      samples.push({
        x: from.x + (to.x - from.x) * t,
        z: from.z + (to.z - from.z) * t,
        segmentIndex: index,
      });
    }
  }

  return samples;
}

export function getDriftEvolutionBirthYardRouteLabIssues() {
  const issues: string[] = [];
  const worldHalfWidth = DRIFT_3D_TOPOLOGY_WORLD_WIDTH / 2;
  const worldHalfDepth = DRIFT_3D_TOPOLOGY_WORLD_DEPTH / 2;

  for (const route of DRIFT_EVOLUTION_BIRTH_YARD_ROUTE_LAB_ROUTES) {
    if (route.width < 3.5) {
      issues.push(`${route.graphEdgeId}: ordinary road width is too narrow for route proof`);
    }

    for (let index = 0; index < route.points.length - 1; index += 1) {
      const from = route.points[index];
      const to = route.points[index + 1];
      const length = Math.hypot(to.x - from.x, to.z - from.z);
      if (length > 6.5) {
        issues.push(`${route.graphEdgeId}: segment ${index} is too long to follow terrain cleanly`);
      }

      const y0 = getDrift3DGroundY(from.x, from.z);
      const y1 = getDrift3DGroundY(to.x, to.z);
      const grade = length > 0 ? Math.abs(y1 - y0) / length : 0;
      if (grade > 0.16) {
        issues.push(`${route.graphEdgeId}: segment ${index} exceeds the Birth Yard grade envelope`);
      }
    }

    for (const sample of sampleRoute(route)) {
      if (
        Math.abs(sample.x) > worldHalfWidth ||
        Math.abs(sample.z) > worldHalfDepth
      ) {
        issues.push(`${route.graphEdgeId}: route leaves compact world bounds`);
        break;
      }

      const inCanal = pointInsideCanal(sample);
      const inBasin = pointInsideBasin(sample);
      if (!inCanal && !inBasin) continue;

      const bridge = route.waterCrossing;
      const validBridgeSample =
        bridge?.kind === "service_bridge" &&
        inCanal &&
        !inBasin &&
        Math.abs(sample.z - bridge.centerZ) <= 0.35 &&
        sample.x <= bridge.eastBankX + 0.15 &&
        sample.x >= bridge.westBankX - 0.15;

      if (!validBridgeSample) {
        issues.push(`${route.graphEdgeId}: route enters Zeeland water outside the authored service crossing`);
        break;
      }
    }
  }

  return issues;
}
