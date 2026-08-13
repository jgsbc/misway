import { driftMapConfig } from "@/lib/driftMap";
import type { DriftPropType } from "@/types/drift";
import {
  getDrift3DHeadingVector,
  getDrift3DPropTransform,
  getDrift3DYawFromVector,
  type Drift3DDriveInput,
  type Drift3DMovementBounds,
  type Drift3DPoint,
} from "@/lib/drift3d";
import {
  DRIFT_3D_TRANSMISSION_MAX_SPEED,
  getDrift3DTransmissionState,
  type Drift3DVehicleGear,
} from "@/lib/drift3dTransmission";

export const DRIFT_3D_VEHICLE_MAX_SPEED = DRIFT_3D_TRANSMISSION_MAX_SPEED;
export const DRIFT_3D_VEHICLE_REVERSE_MAX_SPEED = 3.1;
export const DRIFT_3D_VEHICLE_ACCELERATION = 2.4;
export const DRIFT_3D_VEHICLE_FRICTION = 7.2;
export const DRIFT_3D_VEHICLE_TURN_RATE_MAX = 3.6;
export const DRIFT_3D_VEHICLE_TURN_RATE_MIN = 1.25;
export const DRIFT_3D_VEHICLE_GRIP = 10.5;
export const DRIFT_3D_VEHICLE_DRIFT_GRIP_FACTOR = 0.2;
export const DRIFT_3D_VEHICLE_COLLISION_RADIUS = 0.34;
export const DRIFT_3D_VEHICLE_COLLISION_BOUNCE = 0.32;
export const DRIFT_3D_GRAVITY = 22;
/** Le point de référence physique = le contact des roues du 4x4. */
export const DRIFT_3D_VEHICLE_GROUND_CLEARANCE = 0.02;
/** Vitesse verticale max (u/s) à laquelle les roues suivent un sol qui descend. */
export const DRIFT_3D_MAX_GROUND_FOLLOW_RATE = 8.5;
/** Contrôle directionnel résiduel en vol. */
export const DRIFT_3D_AIR_CONTROL = 0.14;

const solidPropRadii: Partial<Record<DriftPropType, number>> = {
  sign: 0.16,
  lamp: 0.12,
  speaker: 0.16,
  desk: 0.22,
  stone: 0.1,
  synth: 0.2,
  chair: 0.12,
  bridge: 0.26,
};

export type Drift3DVehicleCollider = {
  x: number;
  z: number;
  radius: number;
};

export type Drift3DVehiclePhysicsState = {
  position: Drift3DPoint;
  velocityX: number;
  velocityZ: number;
  velocityY: number;
  heading: number;
  speed: number;
  gear: Drift3DVehicleGear;
  engineRevs: number;
  airborne: boolean;
  /** Taux vertical lissé au sol — devient la vitesse de décollage sur une lèvre. */
  slopeVerticalRate: number;
  /** Côté du half-pipe traversé pendant le saut (-1 ouest, 1 est). */
  halfPipeSide: -1 | 0 | 1;
  /** Cap réfléchi vers le centre, appliqué au sommet de la trajectoire. */
  halfPipeReturnHeading: number;
  /** Élan restitué vers le centre à la réception. */
  halfPipeReturnSpeed: number;
};

export type Drift3DVehiclePhysicsStepResult = {
  moved: boolean;
  slip: number;
  airborne: boolean;
  /** Vitesse verticale absorbée à l'atterrissage (0 si pas d'impact). */
  landingImpact: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function normalizeAngle(angle: number) {
  return Math.atan2(Math.sin(angle), Math.cos(angle));
}

function lerp(from: number, to: number, amount: number) {
  return from + (to - from) * clamp(amount, 0, 1);
}

export function createDrift3DVehiclePhysicsState(
  position: Drift3DPoint,
  heading = 0
): Drift3DVehiclePhysicsState {
  return {
    position: { ...position },
    velocityX: 0,
    velocityZ: 0,
    velocityY: 0,
    heading,
    speed: 0,
    gear: 1,
    engineRevs: 0.24,
    airborne: false,
    slopeVerticalRate: 0,
    halfPipeSide: 0,
    halfPipeReturnHeading: heading,
    halfPipeReturnSpeed: 0,
  };
}

export function getDrift3DPropColliders(): Drift3DVehicleCollider[] {
  const colliders: Drift3DVehicleCollider[] = [];

  for (const zone of driftMapConfig.zones) {
    for (const prop of zone.props ?? []) {
      const radius = solidPropRadii[prop.type];

      if (!radius) {
        continue;
      }

      const transform = getDrift3DPropTransform(prop, {
        width: driftMapConfig.width,
        height: driftMapConfig.height,
      });

      colliders.push({
        x: transform.position.x,
        z: transform.position.z,
        radius,
      });
    }
  }

  return colliders;
}

function resolvePropCollisions(
  state: Drift3DVehiclePhysicsState,
  colliders: readonly Drift3DVehicleCollider[]
) {
  let collided = false;

  for (const collider of colliders) {
    const dx = state.position.x - collider.x;
    const dz = state.position.z - collider.z;
    const distance = Math.hypot(dx, dz);
    const minDistance = DRIFT_3D_VEHICLE_COLLISION_RADIUS + collider.radius;

    if (distance === 0 || distance >= minDistance) {
      continue;
    }

    const normalX = dx / distance;
    const normalZ = dz / distance;
    const overlap = minDistance - distance;

    state.position.x += normalX * overlap;
    state.position.z += normalZ * overlap;

    const inwardSpeed =
      state.velocityX * normalX + state.velocityZ * normalZ;

    if (inwardSpeed < 0) {
      collided = true;
      const outwardBounce = -inwardSpeed * DRIFT_3D_VEHICLE_COLLISION_BOUNCE;
      state.velocityX += (-inwardSpeed + outwardBounce) * normalX;
      state.velocityZ += (-inwardSpeed + outwardBounce) * normalZ;
    }
  }

  return collided;
}

function resolveBoundaryCollision(
  state: Drift3DVehiclePhysicsState,
  bounds: Drift3DMovementBounds
) {
  let collided = false;

  if (state.position.x < bounds.minX) {
    state.position.x = bounds.minX;
    if (state.velocityX < 0) {
      state.velocityX *= -DRIFT_3D_VEHICLE_COLLISION_BOUNCE;
      collided = true;
    }
  } else if (state.position.x > bounds.maxX) {
    state.position.x = bounds.maxX;
    if (state.velocityX > 0) {
      state.velocityX *= -DRIFT_3D_VEHICLE_COLLISION_BOUNCE;
      collided = true;
    }
  }

  if (state.position.z < bounds.minZ) {
    state.position.z = bounds.minZ;
    if (state.velocityZ < 0) {
      state.velocityZ *= -DRIFT_3D_VEHICLE_COLLISION_BOUNCE;
      collided = true;
    }
  } else if (state.position.z > bounds.maxZ) {
    state.position.z = bounds.maxZ;
    if (state.velocityZ > 0) {
      state.velocityZ *= -DRIFT_3D_VEHICLE_COLLISION_BOUNCE;
      collided = true;
    }
  }

  return collided;
}

export function stepDrift3DVehiclePhysics(
  state: Drift3DVehiclePhysicsState,
  input: Drift3DDriveInput,
  dt: number,
  bounds: Drift3DMovementBounds,
  colliders: readonly Drift3DVehicleCollider[],
  speedScale = 1,
  getGroundY?: (x: number, z: number) => number
): Drift3DVehiclePhysicsStepResult {
  const previousPosition = { x: state.position.x, z: state.position.z };
  const previousHeading = state.heading;
  const maxSpeed = DRIFT_3D_VEHICLE_MAX_SPEED * speedScale;
  const reverseMaxSpeed = DRIFT_3D_VEHICLE_REVERSE_MAX_SPEED * speedScale;

  const speedRatio = clamp(Math.abs(state.speed) / maxSpeed, 0, 1);
  const airFactor = state.airborne ? DRIFT_3D_AIR_CONTROL : 1;
  const turnRate =
    lerp(
      DRIFT_3D_VEHICLE_TURN_RATE_MAX,
      DRIFT_3D_VEHICLE_TURN_RATE_MIN,
      speedRatio
    ) * airFactor;

  if (input.active) {
    const desiredHeading = getDrift3DYawFromVector(input);
    const headingDelta = normalizeAngle(desiredHeading - state.heading);
    const maxStep = turnRate * dt;
    state.heading = normalizeAngle(
      state.heading + clamp(headingDelta, -maxStep, maxStep)
    );

    if (!state.airborne) {
      // la pente freine la montée et pousse à la descente
      let slopeFactor = 1;

      if (getGroundY) {
        const headingVector = getDrift3DHeadingVector(state.heading);
        const probe = 1.2;
        const slopeAhead =
          (getGroundY(
            state.position.x + headingVector.x * probe,
            state.position.z + headingVector.z * probe
          ) -
            getGroundY(state.position.x, state.position.z)) /
          probe;
        slopeFactor = clamp(1 - slopeAhead * 0.85, 0.3, 1.3);
      }

      state.speed +=
        DRIFT_3D_VEHICLE_ACCELERATION * speedScale * slopeFactor * dt;
    }
  } else if (!state.airborne && Math.abs(state.speed) > 0.0001) {
    const decel = DRIFT_3D_VEHICLE_FRICTION * dt;
    state.speed =
      state.speed > 0
        ? Math.max(0, state.speed - decel)
        : Math.min(0, state.speed + decel);
  }

  state.speed = clamp(state.speed, -reverseMaxSpeed, maxSpeed);
  const transmission = getDrift3DTransmissionState(state.speed, speedScale);
  state.gear = transmission.gear;
  state.engineRevs = transmission.normalizedRevs;

  const appliedYawDelta = normalizeAngle(state.heading - previousHeading);
  const yawRate = dt > 0 ? Math.abs(appliedYawDelta) / dt : 0;
  const slipMagnitude = clamp(
    yawRate / (DRIFT_3D_VEHICLE_TURN_RATE_MAX * 1.4),
    0,
    1
  );
  const signedSlip = slipMagnitude * Math.sign(appliedYawDelta);
  const grip =
    lerp(
      DRIFT_3D_VEHICLE_GRIP,
      DRIFT_3D_VEHICLE_GRIP * DRIFT_3D_VEHICLE_DRIFT_GRIP_FACTOR,
      slipMagnitude
    ) * airFactor;

  const headingVector = getDrift3DHeadingVector(state.heading);
  const targetVelocityX = headingVector.x * state.speed;
  const targetVelocityZ = headingVector.z * state.speed;
  const gripAmount = Math.min(1, grip * dt);

  state.velocityX += (targetVelocityX - state.velocityX) * gripAmount;
  state.velocityZ += (targetVelocityZ - state.velocityZ) * gripAmount;

  state.position.x += state.velocityX * dt;
  state.position.z += state.velocityZ * dt;

  const collidedWithProp = resolvePropCollisions(state, colliders);
  const collidedWithBoundary = resolveBoundaryCollision(state, bounds);

  if (collidedWithProp || collidedWithBoundary) {
    state.speed =
      state.velocityX * headingVector.x + state.velocityZ * headingVector.z;
  }

  // ─── Verticale : suivi de sol, décollage, chute, atterrissage ────────────
  let landingImpact = 0;

  if (getGroundY) {
    const groundTarget =
      getGroundY(state.position.x, state.position.z) +
      DRIFT_3D_VEHICLE_GROUND_CLEARANCE;

    if (state.airborne) {
      state.velocityY -= DRIFT_3D_GRAVITY * dt;
      state.position.y += state.velocityY * dt;

      if (state.position.y <= groundTarget) {
        landingImpact = Math.max(0, -state.velocityY);
        state.position.y = groundTarget;
        state.velocityY = 0;
        state.airborne = false;
        state.slopeVerticalRate = 0;
      }
    } else {
      const requiredRate =
        dt > 0 ? (groundTarget - state.position.y) / dt : 0;

      if (requiredRate < -DRIFT_3D_MAX_GROUND_FOLLOW_RATE) {
        // le sol se dérobe (lèvre de rampe, falaise) : décollage balistique
        state.airborne = true;
        state.velocityY = clamp(state.slopeVerticalRate, 0, 14);
        state.position.y += state.velocityY * dt;
      } else {
        state.slopeVerticalRate =
          state.slopeVerticalRate * 0.5 + clamp(requiredRate, -20, 20) * 0.5;
        state.position.y = groundTarget;
        state.velocityY = 0;
      }
    }
  }

  const moved =
    state.position.x !== previousPosition.x ||
    state.position.z !== previousPosition.z;

  return {
    moved,
    slip: signedSlip,
    airborne: state.airborne,
    landingImpact,
  };
}
