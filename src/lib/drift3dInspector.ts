import {
  DRIFT_3D_PENINSULA_BOUNDS,
  DRIFT_3D_SEA_LEVEL,
  getDrift3DPeninsulaRegionAt,
} from "./drift3dPeninsula";
import {
  getDrift3DNearestRoutePoint,
  getDrift3DRouteField,
} from "./drift3dRoutes";
import {
  getDrift3DGroundY,
  getDrift3DTerrainHeight,
} from "./drift3dTerrain";
import {
  drift3dEraById,
  drift3dThresholdNode,
  type Drift3DEraId,
  type Drift3DTopologyProximity,
} from "./drift3dTopology";
import {
  DRIFT_3D_VEHICLE_GROUND_CLEARANCE,
  type Drift3DVehiclePhysicsState,
} from "./drift3dVehiclePhysics";
import { getDrift3DWaterDepth } from "./drift3dWater";

export type Drift3DInspectorViewMode = "chase" | "top-down";

export type Drift3DInspectorTeleportTarget = Readonly<{
  id: "entry" | Drift3DEraId;
  label: string;
  x: number;
  y: number;
  z: number;
  heading: number;
}>;

export type Drift3DInspectorRenderMetrics = Readonly<{
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
}>;

export type Drift3DInspectorSnapshot = Readonly<{
  viewMode: Drift3DInspectorViewMode;
  vehicle: Readonly<{
    x: number;
    y: number;
    z: number;
    speed: number;
    heading: number;
    airborne: boolean;
  }>;
  ground: Readonly<{
    terrainHeight: number;
    groundY: number;
    seaLevel: number;
    waterDepth: number;
  }>;
  spatial: Readonly<{
    regionId: string;
    eraId: string;
    routeId: string | null;
    routeDistance: number;
    routeAltitude: number;
    activeNodeId: string | null;
    nearestNodeId: string | null;
  }>;
  render: Drift3DInspectorRenderMetrics;
  worldBounds: typeof DRIFT_3D_PENINSULA_BOUNDS;
}>;

export type Drift3DWorldInspectorProbe = Readonly<{
  targets: readonly Drift3DInspectorTeleportTarget[];
  snapshot: () => Drift3DInspectorSnapshot;
  teleport: (id: string) => boolean;
  getViewMode: () => Drift3DInspectorViewMode;
  setViewMode: (mode: Drift3DInspectorViewMode) => void;
}>;

function safeRoadTarget(
  id: Drift3DInspectorTeleportTarget["id"],
  label: string,
  x: number,
  z: number
) {
  const route = getDrift3DNearestRoutePoint(x, z);
  const targetX = route.routeId ? route.x : x;
  const targetZ = route.routeId ? route.z : z;

  return Object.freeze({
    id,
    label,
    x: targetX,
    y:
      getDrift3DGroundY(targetX, targetZ) +
      DRIFT_3D_VEHICLE_GROUND_CLEARANCE,
    z: targetZ,
    heading: route.routeId ? route.heading : 0,
  }) satisfies Drift3DInspectorTeleportTarget;
}

export const DRIFT_3D_INSPECTOR_TELEPORTS: readonly Drift3DInspectorTeleportTarget[] =
  Object.freeze([
    safeRoadTarget(
      "entry",
      "Entry",
      drift3dThresholdNode.position.x,
      drift3dThresholdNode.position.z
    ),
    safeRoadTarget(
      "birth-yard",
      "Birth Yard",
      drift3dEraById["birth-yard"].center.x,
      drift3dEraById["birth-yard"].center.z
    ),
    safeRoadTarget(
      "older-shadows",
      "Older Shadows",
      drift3dEraById["older-shadows"].center.x,
      drift3dEraById["older-shadows"].center.z
    ),
    safeRoadTarget(
      "vegetative-field",
      "Vegetative Field",
      drift3dEraById["vegetative-field"].center.x,
      drift3dEraById["vegetative-field"].center.z
    ),
    safeRoadTarget(
      "new-signal",
      "New Signal",
      drift3dEraById["new-signal"].center.x,
      drift3dEraById["new-signal"].center.z
    ),
  ]);

export function getDrift3DInspectorTeleportTarget(id: string) {
  return DRIFT_3D_INSPECTOR_TELEPORTS.find((target) => target.id === id) ?? null;
}

export function createDrift3DInspectorSnapshot(
  vehicle: Drift3DVehiclePhysicsState,
  proximity: Drift3DTopologyProximity | null,
  viewMode: Drift3DInspectorViewMode,
  render: Drift3DInspectorRenderMetrics
): Drift3DInspectorSnapshot {
  const { x, y, z } = vehicle.position;
  const terrainHeight = getDrift3DTerrainHeight(x, z);
  const region = getDrift3DPeninsulaRegionAt(x, z);
  const route = getDrift3DRouteField(x, z);

  return Object.freeze({
    viewMode,
    vehicle: Object.freeze({
      x,
      y,
      z,
      speed: vehicle.speed,
      heading: vehicle.heading,
      airborne: vehicle.airborne,
    }),
    ground: Object.freeze({
      terrainHeight,
      groundY: getDrift3DGroundY(x, z),
      seaLevel: DRIFT_3D_SEA_LEVEL,
      waterDepth: getDrift3DWaterDepth(x, z),
    }),
    spatial: Object.freeze({
      regionId: region.id,
      eraId: region.era,
      routeId: route.routeId,
      routeDistance: route.distance,
      routeAltitude: route.altitude,
      activeNodeId: proximity?.activeNode?.id ?? null,
      nearestNodeId: proximity?.nearestNode?.id ?? null,
    }),
    render: Object.freeze({ ...render }),
    worldBounds: DRIFT_3D_PENINSULA_BOUNDS,
  });
}
