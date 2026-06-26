import type {
  DriftBiome,
  DriftMapConfig,
  DriftProp,
  DriftZoneConfig,
} from "@/types/drift";
import { driftMapConfig } from "@/lib/driftMap";

export const DRIFT_3D_PLANE_WIDTH = 16;
export const DRIFT_3D_PLANE_DEPTH = 10;

type DriftMapPoint = {
  x: number;
  y: number;
};

type DriftMapBounds = Pick<DriftMapConfig, "width" | "height">;

export type Drift3DPoint = {
  x: number;
  y: number;
  z: number;
};

export type Drift3DZoneTransform = {
  position: Drift3DPoint;
  radius: number;
  height: number;
};

export type Drift3DPropTransform = {
  position: Drift3DPoint;
  rotationY: number;
};

export type Drift3DMovementBounds = {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
};

const biomeHeights: Record<DriftBiome, number> = {
  "entry-signal": 0.08,
  "zeeland-road": 0.05,
  "midnight-office": 0.12,
  "here-there": 0.07,
  "plain-signal": 0.04,
  "neural-loop": 0.06,
  "hold-light": 0.08,
  "birth-yard": 0.09,
};

function degreesToRadians(value: number) {
  return (value * Math.PI) / 180;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function mapPointToDrift3D(
  point: DriftMapPoint,
  bounds: DriftMapBounds,
  y = 0
): Drift3DPoint {
  return {
    x: (point.x / bounds.width - 0.5) * DRIFT_3D_PLANE_WIDTH,
    y,
    z: (point.y / bounds.height - 0.5) * DRIFT_3D_PLANE_DEPTH,
  };
}

export function scaleDriftZoneRadius(
  radius: number,
  bounds: DriftMapBounds
) {
  const worldRadius = radius * (DRIFT_3D_PLANE_WIDTH / bounds.width);

  return Math.min(Math.max(worldRadius * 0.72, 0.62), 1.14);
}

export function getDrift3DZoneTransform(
  zone: DriftZoneConfig,
  bounds: DriftMapBounds
): Drift3DZoneTransform {
  const height = biomeHeights[zone.biome];

  return {
    position: mapPointToDrift3D(zone, bounds, height / 2),
    radius: scaleDriftZoneRadius(zone.radius, bounds),
    height,
  };
}

export function getDrift3DPropTransform(
  prop: DriftProp,
  bounds: DriftMapBounds
): Drift3DPropTransform {
  return {
    position: mapPointToDrift3D(prop, bounds, 0.14),
    rotationY: degreesToRadians(prop.rotation ?? 0),
  };
}

export function getDrift3DSpawnTransform(bounds: DriftMapBounds) {
  return mapPointToDrift3D(driftMapConfig.spawn, bounds, 0.12);
}

export function getDrift3DMovementBounds(): Drift3DMovementBounds {
  return {
    minX: -DRIFT_3D_PLANE_WIDTH / 2 + 1.3,
    maxX: DRIFT_3D_PLANE_WIDTH / 2 - 1.3,
    minZ: -DRIFT_3D_PLANE_DEPTH / 2 + 1.1,
    maxZ: DRIFT_3D_PLANE_DEPTH / 2 - 1.1,
  };
}

export function clampDrift3DPoint(point: Drift3DPoint): Drift3DPoint {
  const bounds = getDrift3DMovementBounds();

  return {
    x: clamp(point.x, bounds.minX, bounds.maxX),
    y: point.y,
    z: clamp(point.z, bounds.minZ, bounds.maxZ),
  };
}

export function getDrift3DKeyboardVector(activeCodes: ReadonlySet<string>) {
  const x =
    (activeCodes.has("ArrowRight") || activeCodes.has("KeyD") ? 1 : 0) -
    (activeCodes.has("ArrowLeft") || activeCodes.has("KeyA") ? 1 : 0);
  const z =
    (activeCodes.has("ArrowUp") || activeCodes.has("KeyW") ? 1 : 0) -
    (activeCodes.has("ArrowDown") || activeCodes.has("KeyS") ? 1 : 0);
  const length = Math.hypot(x, z);

  if (length === 0) {
    return { x: 0, z: 0, active: false };
  }

  return {
    x: x / length,
    z: z / length,
    active: true,
  };
}
