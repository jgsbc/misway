import {
  getDrift3DChaseCameraRig,
  getDrift3DHeadingVector,
  type Drift3DPoint,
} from "./drift3d";
import { getDrift3DGroundY } from "./drift3dTerrain";
import {
  DRIFT_3D_VEHICLE_COLLISION_RADIUS,
  type Drift3DVehiclePhysicsState,
} from "./drift3dVehiclePhysics";
import {
  DRIFT_EVOLUTION_ENTRY_CAVE,
  getDriftEvolutionEntryPathCenterZ,
  getDriftEvolutionEntryTunnelMix,
} from "./driftEvolutionEntryCave";

export const DRIFT_EVOLUTION_ENTRY_DRIVE_HALF_WIDTH = 2.5;
export const DRIFT_EVOLUTION_ENTRY_BACK_STOP_INSET = 0.72;
export const DRIFT_EVOLUTION_ENTRY_CONSTRAINT_CAPTURE_MARGIN = 0.42;
export const DRIFT_EVOLUTION_ENTRY_CAMERA_DEPTH = 3.45;
export const DRIFT_EVOLUTION_ENTRY_CAMERA_HEIGHT = 1.68;
export const DRIFT_EVOLUTION_ENTRY_CAMERA_LOOK_AHEAD = 1.25;
export const DRIFT_EVOLUTION_ENTRY_CAMERA_TARGET_HEIGHT = 0.18;
export const DRIFT_EVOLUTION_ENTRY_CAMERA_BACK_WALL_INSET = 0.18;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function smoothstep01(value: number) {
  const t = clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
}

export function getDriftEvolutionEntryDriveEnvelope(x: number) {
  const cave = DRIFT_EVOLUTION_ENTRY_CAVE;
  const centerZ = getDriftEvolutionEntryPathCenterZ(x);
  const minX = cave.startX + DRIFT_EVOLUTION_ENTRY_BACK_STOP_INSET;
  const maxX = cave.exitX + 0.3;
  const lateralRadius =
    DRIFT_EVOLUTION_ENTRY_DRIVE_HALF_WIDTH - DRIFT_3D_VEHICLE_COLLISION_RADIUS;

  return {
    centerZ,
    minX,
    maxX,
    minZ: centerZ - lateralRadius,
    maxZ: centerZ + lateralRadius,
    active: x >= cave.startX - 0.5 && x <= maxX,
  };
}

/**
 * The cave is a local corridor, not a world-spanning X slab. The small capture
 * margin is only wide enough to catch a normal one-frame wall overshoot from
 * a vehicle already driving inside the tunnel. A vehicle travelling around the
 * outside of the ridge must remain completely unaffected even if its X happens
 * to line up with the cave.
 */
export function isDriftEvolutionEntryConstraintActive(point: {
  x: number;
  z: number;
}) {
  const envelope = getDriftEvolutionEntryDriveEnvelope(point.x);
  if (!envelope.active) return false;

  const lateralRadius = envelope.maxZ - envelope.centerZ;
  return (
    Math.abs(point.z - envelope.centerZ) <=
    lateralRadius + DRIFT_EVOLUTION_ENTRY_CONSTRAINT_CAPTURE_MARGIN
  );
}

export function getDriftEvolutionEntryEnclosureMix(point: {
  x: number;
  z: number;
}) {
  const cave = DRIFT_EVOLUTION_ENTRY_CAVE;
  const envelope = getDriftEvolutionEntryDriveEnvelope(point.x);

  if (!envelope.active) return 0;

  const lateralDistance = Math.abs(point.z - envelope.centerZ);
  const lateral =
    1 -
    smoothstep01(
      (lateralDistance - DRIFT_EVOLUTION_ENTRY_DRIVE_HALF_WIDTH * 0.72) /
        (DRIFT_EVOLUTION_ENTRY_DRIVE_HALF_WIDTH * 0.42)
    );
  const portalFade =
    point.x <= cave.mouthX
      ? 1
      : 1 -
        smoothstep01(
          (point.x - cave.mouthX) /
            Math.max(0.8, cave.exitX - cave.mouthX)
        );
  const deepMix = getDriftEvolutionEntryTunnelMix(point.x);
  const thresholdPresence = Math.max(portalFade, deepMix * 0.82);

  return clamp(lateral * thresholdPresence, 0, 1);
}

/** Promoted solid envelope for the recovered west-ridge cave. */
export function constrainDriftEvolutionEntryVehicle(
  state: Drift3DVehiclePhysicsState
) {
  if (!isDriftEvolutionEntryConstraintActive(state.position)) return false;

  const envelope = getDriftEvolutionEntryDriveEnvelope(state.position.x);
  let collided = false;

  if (state.position.z < envelope.minZ) {
    state.position.z = envelope.minZ;
    if (state.velocityZ < 0) state.velocityZ *= -0.12;
    collided = true;
  } else if (state.position.z > envelope.maxZ) {
    state.position.z = envelope.maxZ;
    if (state.velocityZ > 0) state.velocityZ *= -0.12;
    collided = true;
  }

  if (state.position.x < envelope.minX) {
    state.position.x = envelope.minX;
    if (state.velocityX < 0) state.velocityX *= -0.12;
    collided = true;
  }

  if (collided) {
    const heading = getDrift3DHeadingVector(state.heading);
    state.speed = state.velocityX * heading.x + state.velocityZ * heading.z;
  }

  return collided;
}

export type DriftEvolutionCameraRig = {
  position: Drift3DPoint;
  target: Drift3DPoint;
  enclosure: number;
};

/**
 * Open world = canonical chase camera. Inside the west-ridge cave the camera
 * comes closer/lower and keeps the 4x4 clearly framed in the lower third.
 */
export function getDriftEvolutionAdaptiveCameraRig(
  vehiclePosition: Drift3DPoint,
  heading: number,
  cameraScale = 1,
  cinematicScale = 1
): DriftEvolutionCameraRig {
  const canonical = getDrift3DChaseCameraRig(
    vehiclePosition,
    heading,
    cameraScale,
    {
      cinematicScale,
      groundY: getDrift3DGroundY,
    }
  );
  const enclosure = getDriftEvolutionEntryEnclosureMix(vehiclePosition);

  if (enclosure <= 0.0001) return { ...canonical, enclosure: 0 };

  const cave = DRIFT_EVOLUTION_ENTRY_CAVE;
  const headingVector = getDrift3DHeadingVector(heading);
  const effectiveScale = clamp(cameraScale * cinematicScale, 0.78, 1.28);
  const depth = DRIFT_EVOLUTION_ENTRY_CAMERA_DEPTH * effectiveScale;
  const desiredX = vehiclePosition.x - headingVector.x * depth;
  const desiredZ = vehiclePosition.z - headingVector.z * depth;
  const cameraEnvelope = getDriftEvolutionEntryDriveEnvelope(desiredX);

  // The camera may use the visual cave all the way to its rock back wall.
  // Keeping it inside the vehicle drive envelope was shortening the chase
  // distance at the initial spawn and pushing the Safari below the viewport.
  const cameraMinX = cave.startX + DRIFT_EVOLUTION_ENTRY_CAMERA_BACK_WALL_INSET;
  const safeX = clamp(desiredX, cameraMinX, cameraEnvelope.maxX - 0.18);
  const safeZ = clamp(desiredZ, cameraEnvelope.minZ + 0.12, cameraEnvelope.maxZ - 0.12);
  const ground = getDrift3DGroundY(safeX, safeZ);
  const enclosedPosition = {
    x: safeX,
    y: Math.max(
      ground + 1.22,
      vehiclePosition.y + DRIFT_EVOLUTION_ENTRY_CAMERA_HEIGHT * effectiveScale
    ),
    z: safeZ,
  };
  const lookAhead =
    DRIFT_EVOLUTION_ENTRY_CAMERA_LOOK_AHEAD * Math.min(effectiveScale, 1.15);
  const enclosedTarget = {
    x: vehiclePosition.x + headingVector.x * lookAhead,
    y: vehiclePosition.y + DRIFT_EVOLUTION_ENTRY_CAMERA_TARGET_HEIGHT,
    z: vehiclePosition.z + headingVector.z * lookAhead,
  };

  return {
    position: {
      x: canonical.position.x + (enclosedPosition.x - canonical.position.x) * enclosure,
      y: canonical.position.y + (enclosedPosition.y - canonical.position.y) * enclosure,
      z: canonical.position.z + (enclosedPosition.z - canonical.position.z) * enclosure,
    },
    target: {
      x: canonical.target.x + (enclosedTarget.x - canonical.target.x) * enclosure,
      y: canonical.target.y + (enclosedTarget.y - canonical.target.y) * enclosure,
      z: canonical.target.z + (enclosedTarget.z - canonical.target.z) * enclosure,
    },
    enclosure,
  };
}
