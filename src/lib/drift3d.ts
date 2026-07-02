import type {
  DriftBiome,
  DriftMapConfig,
  DriftProp,
  DriftZoneConfig,
} from "@/types/drift";
import { driftMapConfig } from "@/lib/driftMap";
import {
  DRIFT_3D_TOPOLOGY_WORLD_DEPTH,
  DRIFT_3D_TOPOLOGY_WORLD_WIDTH,
  drift3dThresholdNode,
} from "@/lib/drift3dTopology";

export const DRIFT_3D_PLANE_WIDTH = DRIFT_3D_TOPOLOGY_WORLD_WIDTH;
export const DRIFT_3D_PLANE_DEPTH = DRIFT_3D_TOPOLOGY_WORLD_DEPTH;
export const DRIFT_3D_FLOOR_Y = -0.08;
export const DRIFT_3D_ZONE_MARKER_Y = -0.06;
export const DRIFT_3D_ZONE_MARKER_HEIGHT = 0.004;
export const DRIFT_3D_ZONE_RING_THICKNESS = 0.0035;
export const DRIFT_3D_ZONE_CORE_HEIGHT = 0.004;
export const DRIFT_3D_TRAVEL_Y = 0.16;
export const DRIFT_3D_CAMERA_BASE_HEIGHT = 4.35;
export const DRIFT_3D_CAMERA_BASE_DEPTH = 7.8;
export const DRIFT_3D_CAMERA_MIN_SCALE = 0.82;
export const DRIFT_3D_CAMERA_MAX_SCALE = 1.28;

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

export type Drift3DDragPoint = {
  x: number;
  y: number;
};

export type Drift3DPointerDriveState = {
  active: boolean;
  pointerId: number | null;
  origin: Drift3DDragPoint | null;
  input: Drift3DDriveInput;
};

export type Drift3DDragDriveOptions = {
  deadZone?: number;
  maxDistance?: number;
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

  return Math.min(Math.max(worldRadius * 0.76, 0.68), 1.3);
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
  return mapPointToDrift3D(driftMapConfig.spawn, bounds, getDrift3DTraversalY());
}

export function getDrift3DTraversalY() {
  return DRIFT_3D_TRAVEL_Y;
}

export function getDrift3DVehicleStartPosition() {
  return {
    x: drift3dThresholdNode.position.x + 2.15,
    y: getDrift3DTraversalY(),
    z: drift3dThresholdNode.position.z + 0.82,
  };
}

export function getDrift3DMovementBounds(): Drift3DMovementBounds {
  return {
    minX: -DRIFT_3D_PLANE_WIDTH / 2 + 3.2,
    maxX: DRIFT_3D_PLANE_WIDTH / 2 - 3.2,
    minZ: -DRIFT_3D_PLANE_DEPTH / 2 + 3.2,
    maxZ: DRIFT_3D_PLANE_DEPTH / 2 - 3.2,
  };
}

export function clampDrift3DPoint(point: Drift3DPoint): Drift3DPoint {
  const bounds = getDrift3DMovementBounds();

  return {
    x: clamp(point.x, bounds.minX, bounds.maxX),
    y: getDrift3DTraversalY(),
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

export function getDrift3DDragDriveInput(
  origin: Drift3DDragPoint,
  current: Drift3DDragPoint,
  options: Drift3DDragDriveOptions = {}
) {
  const deadZone = Math.max(0, options.deadZone ?? 14);
  const maxDistance = Math.max(deadZone + 1, options.maxDistance ?? 120);
  const deltaX = current.x - origin.x;
  const deltaY = current.y - origin.y;
  const distance = Math.hypot(deltaX, deltaY);

  if (distance <= deadZone) {
    return {
      x: 0,
      z: 0,
      active: false,
    } satisfies Drift3DDriveInput;
  }

  const magnitude = clamp(
    (distance - deadZone) / (maxDistance - deadZone),
    0,
    1
  );
  const scale = distance === 0 ? 0 : magnitude / distance;

  return {
    x: clamp(deltaX * scale, -1, 1),
    z: clamp(deltaY * scale, -1, 1),
    active: magnitude > 0,
  } satisfies Drift3DDriveInput;
}

export function resolveDrift3DDriveInput(
  keyboardInput: Drift3DDriveInput,
  pointerInput: Drift3DDriveInput
) {
  return keyboardInput.active ? keyboardInput : pointerInput;
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
  vehiclePosition: Drift3DPoint,
  cameraScale = 1
): Drift3DFollowCameraRig {
  const scale = clamp(cameraScale, DRIFT_3D_CAMERA_MIN_SCALE, DRIFT_3D_CAMERA_MAX_SCALE);

  return {
    position: {
      x: vehiclePosition.x,
      y: vehiclePosition.y + DRIFT_3D_CAMERA_BASE_HEIGHT * scale,
      z: vehiclePosition.z + DRIFT_3D_CAMERA_BASE_DEPTH * scale,
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
