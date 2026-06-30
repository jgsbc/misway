import type {
  DriftBiome,
  DriftMapConfig,
  DriftProp,
  DriftZoneConfig,
} from "@/types/drift";
import { driftMapConfig } from "@/lib/driftMap";

export const DRIFT_3D_PLANE_WIDTH = 48;
export const DRIFT_3D_PLANE_DEPTH = 30;

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

export type Drift3DFollowCameraRig = {
  position: Drift3DPoint;
  target: Drift3DPoint;
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

export type Drift3DZoneToneState = "neutral" | "nearest" | "active";

export type Drift3DDriveInput = {
  x: number;
  z: number;
  active: boolean;
};

export type Drift3DZoneProximity = {
  nearestZone: DriftZoneConfig | null;
  activeZone: DriftZoneConfig | null;
  distance: number;
  isInside: boolean;
  progress: number;
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

  return Math.min(Math.max(worldRadius * 0.68, 0.58), 1.05);
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

export function getDrift3DVehicleStartPosition(bounds: DriftMapBounds) {
  const spawnTransform = getDrift3DSpawnTransform(bounds);

  return {
    x: spawnTransform.x + 1.08,
    y: spawnTransform.y,
    z: spawnTransform.z + 1.08,
  };
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

export function approachDrift3DPoint(
  current: Drift3DPoint,
  target: Drift3DPoint,
  amount = 0.18
) {
  const delta = clamp(amount, 0, 1);

  return {
    x: current.x + (target.x - current.x) * delta,
    y: current.y + (target.y - current.y) * delta,
    z: current.z + (target.z - current.z) * delta,
  };
}

export function getDrift3DDriveInput(activeCodes: ReadonlySet<string>) {
  const z =
    (activeCodes.has("ArrowDown") || activeCodes.has("KeyS") ? 1 : 0) -
    (activeCodes.has("ArrowUp") ||
    activeCodes.has("KeyW") ||
    activeCodes.has("KeyZ")
      ? 1
      : 0);
  const x =
    (activeCodes.has("ArrowRight") || activeCodes.has("KeyD") ? 1 : 0) -
    (activeCodes.has("ArrowLeft") ||
    activeCodes.has("KeyA") ||
    activeCodes.has("KeyQ")
      ? 1
      : 0);
  const length = Math.hypot(x, z);

  return {
    x: length === 0 ? 0 : x / length,
    z: length === 0 ? 0 : z / length,
    active: length !== 0,
  } satisfies Drift3DDriveInput;
}

export function getDrift3DKeyboardVector(activeCodes: ReadonlySet<string>) {
  return getDrift3DDriveInput(activeCodes);
}

function normalizeDrift3DAngle(angle: number) {
  return Math.atan2(Math.sin(angle), Math.cos(angle));
}

export function getDrift3DYawFromVector(vector: { x: number; z: number }) {
  if (vector.x === 0 && vector.z === 0) {
    return 0;
  }

  return Math.atan2(vector.x, vector.z);
}

export function getDrift3DHeadingVector(yaw: number) {
  return {
    x: Math.sin(yaw),
    z: Math.cos(yaw),
  };
}

export function approachDrift3DAngle(
  current: number,
  target: number,
  amount = 0.18
) {
  const delta = normalizeDrift3DAngle(target - current);

  return current + delta * clamp(amount, 0, 1);
}

export function getDrift3DFollowCameraRig(
  vehiclePosition: Drift3DPoint
): Drift3DFollowCameraRig {
  return {
    position: {
      x: vehiclePosition.x,
      y: vehiclePosition.y + 4.35,
      z: vehiclePosition.z + 7.8,
    },
    target: {
      x: vehiclePosition.x,
      y: vehiclePosition.y,
      z: vehiclePosition.z,
    },
  };
}

type Drift3DZoneSample = {
  zone: DriftZoneConfig;
  distance: number;
  radius: number;
};

function getDrift3DZoneSample(
  point: Drift3DPoint,
  zone: DriftZoneConfig,
  bounds: DriftMapBounds
): Drift3DZoneSample {
  const transform = getDrift3DZoneTransform(zone, bounds);

  return {
    zone,
    distance: Math.hypot(
      point.x - transform.position.x,
      point.z - transform.position.z
    ),
    radius: transform.radius,
  };
}

export function getDrift3DZoneProximity(
  point: Drift3DPoint,
  zones: DriftZoneConfig[],
  bounds: DriftMapBounds
): Drift3DZoneProximity {
  let nearest: Drift3DZoneSample | null = null;
  let active: Drift3DZoneSample | null = null;

  for (const zone of zones) {
    const sample = getDrift3DZoneSample(point, zone, bounds);

    if (!nearest || sample.distance < nearest.distance) {
      nearest = sample;
    }

    if (sample.distance <= sample.radius && (!active || sample.distance < active.distance)) {
      active = sample;
    }
  }

  const selected = active ?? nearest;
  const distance = selected?.distance ?? 0;
  const radius = selected?.radius ?? 1;
  const isInside = active !== null;
  const falloff = isInside ? radius : radius * 1.45;

  return {
    nearestZone: nearest?.zone ?? null,
    activeZone: active?.zone ?? null,
    distance,
    isInside,
    progress: selected ? clamp(1 - distance / falloff, 0, 1) : 0,
  };
}

export function getDrift3DZoneToneState(
  zone: DriftZoneConfig,
  proximity: Drift3DZoneProximity | null
): Drift3DZoneToneState {
  if (proximity?.activeZone?.id === zone.id) {
    return "active";
  }

  if (proximity?.nearestZone?.id === zone.id) {
    return "nearest";
  }

  return "neutral";
}
