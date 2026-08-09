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
  getDriftEvolutionEntryTunnelMix,
} from "./driftEvolutionEntryCave";

export const DRIFT_EVOLUTION_ENTRY_DRIVE_HALF_WIDTH = 2.5;
export const DRIFT_EVOLUTION_ENTRY_BACK_STOP_INSET = 0.72;
export const DRIFT_EVOLUTION_ENTRY_CAMERA_DEPTH = 3.45;
export const DRIFT_EVOLUTION_ENTRY_CAMERA_HEIGHT = 2.15;
export const DRIFT_EVOLUTION_ENTRY_CAMERA_LOOK_AHEAD = 3.8;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function smoothstep01(value: number) {
  const t = clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
}

export function getDriftEvolutionEntryPathOffsetX(z: number) {
  const cave = DRIFT_EVOLUTION_ENTRY_CAVE;
  const progress = clamp((z - cave.startZ) / (cave.mouthZ - cave.startZ), 0, 1);

  return Math.sin(progress * Math.PI * 1.08) * 0.72;
}

export function getDriftEvolutionEntryPathCenterX(z: number) {
  return DRIFT_EVOLUTION_ENTRY_CAVE.centerX + getDriftEvolutionEntryPathOffsetX(z);
}

export function getDriftEvolutionEntryDriveEnvelope(z: number) {
  const cave = DRIFT_EVOLUTION_ENTRY_CAVE;
  const centerX = getDriftEvolutionEntryPathCenterX(z);
  const minZ = cave.startZ + DRIFT_EVOLUTION_ENTRY_BACK_STOP_INSET;
  const maxZ = cave.mouthZ + cave.portalDepth - 0.35;

  return {
    centerX,
    minX:
      centerX -
      DRIFT_EVOLUTION_ENTRY_DRIVE_HALF_WIDTH +
      DRIFT_3D_VEHICLE_COLLISION_RADIUS,
    maxX:
      centerX +
      DRIFT_EVOLUTION_ENTRY_DRIVE_HALF_WIDTH -
      DRIFT_3D_VEHICLE_COLLISION_RADIUS,
    minZ,
    maxZ,
    active: z >= cave.startZ - 0.5 && z <= maxZ,
  };
}

export function getDriftEvolutionEntryEnclosureMix(point: {
  x: number;
  z: number;
}) {
  const cave = DRIFT_EVOLUTION_ENTRY_CAVE;
  const envelope = getDriftEvolutionEntryDriveEnvelope(point.z);

  if (!envelope.active) return 0;

  const lateralDistance = Math.abs(point.x - envelope.centerX);
  const lateral =
    1 -
    smoothstep01(
      (lateralDistance - DRIFT_EVOLUTION_ENTRY_DRIVE_HALF_WIDTH * 0.72) /
        (DRIFT_EVOLUTION_ENTRY_DRIVE_HALF_WIDTH * 0.42)
    );
  const portalFade =
    point.z <= cave.mouthZ
      ? 1
      : 1 - smoothstep01((point.z - cave.mouthZ) / Math.max(1, cave.portalDepth));
  const deepMix = getDriftEvolutionEntryTunnelMix(point.z);
  const thresholdPresence = Math.max(portalFade, deepMix * 0.82);

  return clamp(lateral * thresholdPresence, 0, 1);
}

/**
 * Evolution-only cave wall authority.
 * Production physics remains untouched; this post-step constraint makes the
 * recovered cave behave like the solid space it visually represents.
 */
export function constrainDriftEvolutionEntryVehicle(
  state: Drift3DVehiclePhysicsState
) {
  const envelope = getDriftEvolutionEntryDriveEnvelope(state.position.z);

  if (!envelope.active) {
    return false;
  }

  let collided = false;

  if (state.position.x < envelope.minX) {
    state.position.x = envelope.minX;
    if (state.velocityX < 0) state.velocityX *= -0.12;
    collided = true;
  } else if (state.position.x > envelope.maxX) {
    state.position.x = envelope.maxX;
    if (state.velocityX > 0) state.velocityX *= -0.12;
    collided = true;
  }

  if (state.position.z < envelope.minZ) {
    state.position.z = envelope.minZ;
    if (state.velocityZ < 0) state.velocityZ *= -0.12;
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
 * Context camera authority for `/drift-evolution`.
 * Open world = canonical chase camera. Enclosed volumes progressively pull
 * the camera closer, lower it, and keep it inside the driveable envelope.
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

  if (enclosure <= 0.0001) {
    return { ...canonical, enclosure: 0 };
  }

  const headingVector = getDrift3DHeadingVector(heading);
  const effectiveScale = clamp(cameraScale * cinematicScale, 0.78, 1.28);
  const depth = DRIFT_EVOLUTION_ENTRY_CAMERA_DEPTH * effectiveScale;
  const desiredZ = vehiclePosition.z - headingVector.z * depth;
  const desiredX = vehiclePosition.x - headingVector.x * depth;
  const cameraEnvelope = getDriftEvolutionEntryDriveEnvelope(desiredZ);
  const safeX = clamp(desiredX, cameraEnvelope.minX + 0.12, cameraEnvelope.maxX - 0.12);
  const safeZ = clamp(desiredZ, cameraEnvelope.minZ + 0.18, cameraEnvelope.maxZ - 0.18);
  const ground = getDrift3DGroundY(safeX, safeZ);
  const enclosedPosition = {
    x: safeX,
    y: Math.max(
      ground + 1.22,
      vehiclePosition.y + DRIFT_EVOLUTION_ENTRY_CAMERA_HEIGHT * effectiveScale
    ),
    z: safeZ,
  };
  const lookAhead = DRIFT_EVOLUTION_ENTRY_CAMERA_LOOK_AHEAD * Math.min(effectiveScale, 1.15);
  const enclosedTarget = {
    x: vehiclePosition.x + headingVector.x * lookAhead,
    y: vehiclePosition.y + 0.64,
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
