export * from "./drift3dVehiclePhysicsBase";

import {
  getDrift3DHeadingVector,
  type Drift3DDriveInput,
  type Drift3DMovementBounds,
} from "./drift3d";
import {
  DRIFT_3D_AIR_CONTROL,
  DRIFT_3D_GRAVITY,
  DRIFT_3D_MAX_GROUND_FOLLOW_RATE,
  DRIFT_3D_VEHICLE_COLLISION_BOUNCE,
  DRIFT_3D_VEHICLE_COLLISION_RADIUS,
  DRIFT_3D_VEHICLE_DRIFT_GRIP_FACTOR,
  DRIFT_3D_VEHICLE_FRICTION,
  DRIFT_3D_VEHICLE_GRIP,
  DRIFT_3D_VEHICLE_GROUND_CLEARANCE,
  DRIFT_3D_VEHICLE_MAX_SPEED,
  DRIFT_3D_VEHICLE_REVERSE_MAX_SPEED,
  DRIFT_3D_VEHICLE_TURN_RATE_MAX,
  DRIFT_3D_VEHICLE_TURN_RATE_MIN,
  type Drift3DVehicleCollider,
  type Drift3DVehiclePhysicsState,
  type Drift3DVehiclePhysicsStepResult,
} from "./drift3dVehiclePhysicsBase";
import { getDrift3DTransmissionState } from "./drift3dTransmission";

const DRIFT_3D_VEHICLE_BRAKE_DECELERATION = 13.5;
const DRIFT_3D_VEHICLE_REVERSE_ACCELERATION_FACTOR = 0.72;
const DRIFT_3D_VEHICLE_INPUT_EPSILON = 0.01;
const DRIFT_3D_VEHICLE_DRIFT_START_RATIO = 0.28;
const DRIFT_3D_VEHICLE_DRIFT_FULL_RATIO = 0.7;
const DRIFT_3D_VEHICLE_DRIFT_STEERING_THRESHOLD = 0.18;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function normalizeAngle(angle: number) {
  return Math.atan2(Math.sin(angle), Math.cos(angle));
}

function lerp(from: number, to: number, amount: number) {
  return from + (to - from) * clamp(amount, 0, 1);
}

function smoothstep(value: number) {
  const t = clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
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

function getSlopeFactor(
  state: Drift3DVehiclePhysicsState,
  throttle: number,
  getGroundY?: (x: number, z: number) => number
) {
  if (!getGroundY || Math.abs(throttle) <= DRIFT_3D_VEHICLE_INPUT_EPSILON) {
    return 1;
  }

  const headingVector = getDrift3DHeadingVector(state.heading);
  const travelDirection = throttle >= 0 ? 1 : -1;
  const probe = 1.2;
  const currentGround = getGroundY(state.position.x, state.position.z);
  const nextGround = getGroundY(
    state.position.x + headingVector.x * probe * travelDirection,
    state.position.z + headingVector.z * probe * travelDirection
  );
  const slopeAhead = (nextGround - currentGround) / probe;

  return clamp(1 - slopeAhead * 0.85, 0.3, 1.3);
}

/**
 * Arcade vehicle step for a chase camera:
 * input.x steers, input.z accelerates/brakes/reverses relative to the vehicle.
 */
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
  const maxSpeed = DRIFT_3D_VEHICLE_MAX_SPEED * speedScale;
  const reverseMaxSpeed = DRIFT_3D_VEHICLE_REVERSE_MAX_SPEED * speedScale;
  const throttle = clamp(input.z, -1, 1);
  const steering = clamp(input.x, -1, 1);
  const throttleActive =
    Math.abs(throttle) > DRIFT_3D_VEHICLE_INPUT_EPSILON;
  const steeringActive =
    Math.abs(steering) > DRIFT_3D_VEHICLE_INPUT_EPSILON;
  const referenceSpeed = state.speed >= 0 ? maxSpeed : reverseMaxSpeed;
  const speedRatio = clamp(
    Math.abs(state.speed) / Math.max(referenceSpeed, 0.001),
    0,
    1
  );
  const airFactor = state.airborne ? DRIFT_3D_AIR_CONTROL : 1;
  const turnRate =
    lerp(
      DRIFT_3D_VEHICLE_TURN_RATE_MAX,
      DRIFT_3D_VEHICLE_TURN_RATE_MIN,
      speedRatio
    ) * airFactor;

  if (steeringActive) {
    const reversing =
      state.speed < -0.05 ||
      (Math.abs(state.speed) <= 0.05 && throttle < -0.05);
    const steeringDirection = reversing ? -1 : 1;
    const steeringAuthority = clamp(
      speedRatio * 1.25 + (throttleActive ? 0.2 : 0),
      0,
      1
    );

    state.heading = normalizeAngle(
      state.heading +
        steering * steeringDirection * turnRate * steeringAuthority * dt
    );
  }

  if (!state.airborne) {
    if (throttle > DRIFT_3D_VEHICLE_INPUT_EPSILON) {
      if (state.speed < -0.05) {
        state.speed = Math.min(
          0,
          state.speed +
            DRIFT_3D_VEHICLE_BRAKE_DECELERATION * throttle * dt
        );
      } else {
        const slopeFactor = getSlopeFactor(state, throttle, getGroundY);
        const transmission = getDrift3DTransmissionState(
          state.speed,
          speedScale
        );
        state.speed +=
          transmission.acceleration *
          slopeFactor *
          throttle *
          dt;
      }
    } else if (throttle < -DRIFT_3D_VEHICLE_INPUT_EPSILON) {
      const reverseAmount = Math.abs(throttle);

      if (state.speed > 0.05) {
        state.speed = Math.max(
          0,
          state.speed -
            DRIFT_3D_VEHICLE_BRAKE_DECELERATION * reverseAmount * dt
        );
      } else {
        const slopeFactor = getSlopeFactor(state, throttle, getGroundY);
        state.speed -=
          getDrift3DTransmissionState(-Math.abs(state.speed), speedScale)
            .acceleration *
          DRIFT_3D_VEHICLE_REVERSE_ACCELERATION_FACTOR *
          slopeFactor *
          reverseAmount *
          dt;
      }
    } else if (Math.abs(state.speed) > 0.0001) {
      const decel = DRIFT_3D_VEHICLE_FRICTION * dt;
      state.speed =
        state.speed > 0
          ? Math.max(0, state.speed - decel)
          : Math.min(0, state.speed + decel);
    }
  }

  state.speed = clamp(state.speed, -reverseMaxSpeed, maxSpeed);
  const transmission = getDrift3DTransmissionState(state.speed, speedScale);
  state.gear = transmission.gear;
  state.engineRevs = transmission.normalizedRevs;

  const driftSpeedFactor = smoothstep(
    (speedRatio - DRIFT_3D_VEHICLE_DRIFT_START_RATIO) /
      (DRIFT_3D_VEHICLE_DRIFT_FULL_RATIO -
        DRIFT_3D_VEHICLE_DRIFT_START_RATIO)
  );
  const driftSteeringFactor = smoothstep(
    (Math.abs(steering) - DRIFT_3D_VEHICLE_DRIFT_STEERING_THRESHOLD) /
      (1 - DRIFT_3D_VEHICLE_DRIFT_STEERING_THRESHOLD)
  );
  const driftIntensity =
    state.speed > 0 && !state.airborne
      ? driftSpeedFactor * driftSteeringFactor
      : 0;
  const grip =
    lerp(
      DRIFT_3D_VEHICLE_GRIP,
      DRIFT_3D_VEHICLE_GRIP * DRIFT_3D_VEHICLE_DRIFT_GRIP_FACTOR,
      driftIntensity
    ) * airFactor;

  const headingVector = getDrift3DHeadingVector(state.heading);
  const targetVelocityX = headingVector.x * state.speed;
  const targetVelocityZ = headingVector.z * state.speed;
  const gripAmount = Math.min(1, grip * dt);

  state.velocityX += (targetVelocityX - state.velocityX) * gripAmount;
  state.velocityZ += (targetVelocityZ - state.velocityZ) * gripAmount;

  // La carrosserie tourne avant la trajectoire : cette vitesse latérale
  // persistante crée le drift, puis le grip normal la résorbe en ligne droite.
  const lateralVelocity =
    state.velocityX * headingVector.z - state.velocityZ * headingVector.x;
  const signedSlip =
    clamp(
      -lateralVelocity / Math.max(Math.abs(state.speed) * 0.5, 0.001),
      -1,
      1
    ) *
    (0.2 + driftSpeedFactor * 0.8);

  state.position.x += state.velocityX * dt;
  state.position.z += state.velocityZ * dt;

  const collidedWithProp = resolvePropCollisions(state, colliders);
  const collidedWithBoundary = resolveBoundaryCollision(state, bounds);

  if (collidedWithProp || collidedWithBoundary) {
    state.speed =
      state.velocityX * headingVector.x + state.velocityZ * headingVector.z;
  }

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
        state.airborne = true;
        state.velocityY = clamp(state.slopeVerticalRate, 0, 14);
        state.position.y += state.velocityY * dt;
      } else {
        state.slopeVerticalRate =
          state.slopeVerticalRate * 0.5 +
          clamp(requiredRate, -20, 20) * 0.5;
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
