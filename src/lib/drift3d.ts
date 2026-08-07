export * from "./drift3dBase";
export {
  getDrift3DPropTransform,
  getDrift3DZoneTransform,
} from "./drift3dLegacyPlacement";

import {
  DRIFT_3D_CAMERA_MAX_SCALE,
  DRIFT_3D_CAMERA_MIN_SCALE,
  getDrift3DHeadingVector,
  type Drift3DDragDriveOptions,
  type Drift3DDragPoint,
  type Drift3DDriveInput,
  type Drift3DFollowCameraRig,
  type Drift3DPoint,
} from "./drift3dBase";

export const DRIFT_3D_CHASE_CAMERA_HEIGHT = 3.8;
export const DRIFT_3D_CHASE_CAMERA_DEPTH = 7.6;
export const DRIFT_3D_CHASE_CAMERA_LOOK_AHEAD = 3.2;
export const DRIFT_3D_CHASE_CAMERA_TARGET_HEIGHT = 0.72;
export const DRIFT_3D_CHASE_CAMERA_MIN_GROUND_CLEARANCE = 1.15;

export type Drift3DChaseCameraOptions = {
  cinematicScale?: number;
  groundY?: (x: number, z: number) => number;
  minimumGroundClearance?: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function normalizeSignedZero(value: number) {
  return value === 0 ? 0 : value;
}

/**
 * Vehicle-relative controls used by the chase camera mode.
 * x follows the scene yaw convention (+1 left, -1 right), while z is
 * throttle (-1 reverse, +1 forward).
 */
export function getDrift3DDriveInput(activeCodes: ReadonlySet<string>) {
  const throttle =
    (activeCodes.has("ArrowUp") ||
    activeCodes.has("KeyW") ||
    activeCodes.has("KeyZ")
      ? 1
      : 0) -
    (activeCodes.has("ArrowDown") || activeCodes.has("KeyS") ? 1 : 0);
  const steering =
    (activeCodes.has("ArrowLeft") ||
    activeCodes.has("KeyA") ||
    activeCodes.has("KeyQ")
      ? 1
      : 0) -
    (activeCodes.has("ArrowRight") || activeCodes.has("KeyD") ? 1 : 0);

  return {
    x: steering,
    z: throttle,
    active: steering !== 0 || throttle !== 0,
  } satisfies Drift3DDriveInput;
}

export function getDrift3DKeyboardVector(activeCodes: ReadonlySet<string>) {
  return getDrift3DDriveInput(activeCodes);
}

/**
 * One-finger drag behaves like a floating joystick:
 * up/down controls throttle and left/right controls steering.
 * Pinch zoom remains owned by Drift3DCanvas and never reaches this resolver.
 */
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
  const directionScale = distance === 0 ? 0 : magnitude / distance;
  const steering = clamp(-deltaX * directionScale, -1, 1);
  const throttle = clamp(-deltaY * directionScale, -1, 1);

  return {
    x: normalizeSignedZero(steering),
    z: normalizeSignedZero(throttle),
    active: magnitude > 0,
  } satisfies Drift3DDriveInput;
}

export function getDrift3DChaseCameraRig(
  vehiclePosition: Drift3DPoint,
  heading: number,
  cameraScale = 1,
  options: Drift3DChaseCameraOptions = {}
): Drift3DFollowCameraRig {
  const userScale = clamp(
    cameraScale,
    DRIFT_3D_CAMERA_MIN_SCALE,
    DRIFT_3D_CAMERA_MAX_SCALE
  );
  const cinematicScale = clamp(options.cinematicScale ?? 1, 0.72, 1.45);
  const effectiveScale = userScale * cinematicScale;
  const headingVector = getDrift3DHeadingVector(heading);
  const positionX =
    vehiclePosition.x -
    headingVector.x * DRIFT_3D_CHASE_CAMERA_DEPTH * effectiveScale;
  const positionZ =
    vehiclePosition.z -
    headingVector.z * DRIFT_3D_CHASE_CAMERA_DEPTH * effectiveScale;
  const minimumGroundClearance = Math.max(
    0,
    options.minimumGroundClearance ??
      DRIFT_3D_CHASE_CAMERA_MIN_GROUND_CLEARANCE
  );
  const terrainFloor = options.groundY
    ? options.groundY(positionX, positionZ) + minimumGroundClearance
    : Number.NEGATIVE_INFINITY;
  const positionY = Math.max(
    vehiclePosition.y + DRIFT_3D_CHASE_CAMERA_HEIGHT * effectiveScale,
    terrainFloor
  );
  const lookAheadScale = Math.min(effectiveScale, 1.6);

  return {
    position: {
      x: positionX,
      y: positionY,
      z: positionZ,
    },
    target: {
      x:
        vehiclePosition.x +
        headingVector.x * DRIFT_3D_CHASE_CAMERA_LOOK_AHEAD * lookAheadScale,
      y: vehiclePosition.y + DRIFT_3D_CHASE_CAMERA_TARGET_HEIGHT,
      z:
        vehiclePosition.z +
        headingVector.z * DRIFT_3D_CHASE_CAMERA_LOOK_AHEAD * lookAheadScale,
    },
  };
}
