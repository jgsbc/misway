import {
  DRIFT_3D_GRAVITY,
  DRIFT_3D_VEHICLE_ACCELERATION,
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
  DRIFT_3D_MAX_GROUND_FOLLOW_RATE,
  type Drift3DVehicleCollider,
  type Drift3DVehiclePhysicsState,
} from "@/lib/drift3dVehiclePhysics";
import type { Drift3DMovementBounds } from "@/lib/drift3d";

/**
 * IMMERSION CORE — conduite.
 *
 * La physique de production ne sait qu'avancer : son entrée est un cap
 * désiré, et elle accélère d'elle-même dès qu'on le lui donne. Impossible
 * d'y brancher un frein, une marche arrière ou une pédale. Ce module la
 * remplace en gardant SES constantes — masse, adhérence, vitesses, rayon de
 * collision — pour que le 4x4 conserve son caractère canonique.
 *
 * Règle absolue : rien ici ne décide de la trajectoire à la place du
 * joueur. Pas de propulsion automatique, pas de rappel de cap, pas de rail.
 */

export type ImmersionDriveInput = {
  steer: number;
  throttle: number;
  brake: number;
};

export type ImmersionVehicleResult = {
  airborne: boolean;
  landingImpact: number;
  collided: boolean;
  /** Dérive latérale 0..1 — sert à la poussière et au son. */
  slip: number;
};

const BRAKE_DECEL = 11;
const REVERSE_ACCEL = 5.4;
/** Sous cette vitesse, le frein bascule en marche arrière. */
const REVERSE_THRESHOLD = 0.25;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function stepImmersionVehicle(
  state: Drift3DVehiclePhysicsState,
  input: ImmersionDriveInput,
  dt: number,
  bounds: Drift3DMovementBounds,
  colliders: readonly Drift3DVehicleCollider[],
  getGroundY: (x: number, z: number) => number
): ImmersionVehicleResult {
  const speedRatio = clamp(Math.abs(state.speed) / DRIFT_3D_VEHICLE_MAX_SPEED, 0, 1);

  /* ── Direction : au taux, et seulement si le joueur la demande ─────── */
  const turnRate = lerp(
    DRIFT_3D_VEHICLE_TURN_RATE_MAX,
    DRIFT_3D_VEHICLE_TURN_RATE_MIN,
    speedRatio
  );
  // À l'arrêt les roues tournent sans faire pivoter la caisse ; en marche
  // arrière la géométrie du train inverse le sens — comme une vraie voiture.
  const steerAuthority = clamp(Math.abs(state.speed) / 1.1, 0, 1);
  const direction = state.speed < -0.05 ? -1 : 1;
  const airFactor = state.airborne ? 0.14 : 1;
  state.heading +=
    input.steer * turnRate * dt * steerAuthority * direction * airFactor;
  state.heading = Math.atan2(Math.sin(state.heading), Math.cos(state.heading));

  /* ── Longitudinal : accélérer, freiner, reculer ────────────────────── */
  if (!state.airborne) {
    // La pente freine la montée et pousse à la descente.
    const headingX = Math.sin(state.heading);
    const headingZ = Math.cos(state.heading);
    const probe = 1.2;
    const slope =
      (getGroundY(state.position.x + headingX * probe, state.position.z + headingZ * probe) -
        getGroundY(state.position.x, state.position.z)) /
      probe;
    const slopeFactor = clamp(1 - slope * 0.85, 0.25, 1.35);

    if (input.throttle > 0.02) {
      state.speed +=
        DRIFT_3D_VEHICLE_ACCELERATION * input.throttle * slopeFactor * dt;
    }

    if (input.brake > 0.02) {
      if (state.speed > REVERSE_THRESHOLD) {
        state.speed -= BRAKE_DECEL * input.brake * dt;
      } else {
        state.speed -= REVERSE_ACCEL * input.brake * slopeFactor * dt;
      }
    }

    // Frein moteur / roulement quand aucune pédale n'est enfoncée.
    if (input.throttle <= 0.02 && input.brake <= 0.02) {
      const decel = DRIFT_3D_VEHICLE_FRICTION * 0.42 * dt;
      state.speed =
        state.speed > 0
          ? Math.max(0, state.speed - decel)
          : Math.min(0, state.speed + decel);
    }

    // La pente entraîne le véhicule à l'arrêt.
    if (Math.abs(state.speed) < 0.4 && Math.abs(slope) > 0.06) {
      state.speed -= slope * 2.4 * dt;
    }
  }

  state.speed = clamp(
    state.speed,
    -DRIFT_3D_VEHICLE_REVERSE_MAX_SPEED,
    DRIFT_3D_VEHICLE_MAX_SPEED
  );

  /* ── Adhérence : la caisse suit le cap avec du retard ──────────────── */
  const headingX = Math.sin(state.heading);
  const headingZ = Math.cos(state.heading);
  const targetVelocityX = headingX * state.speed;
  const targetVelocityZ = headingZ * state.speed;
  const lateral = Math.abs(
    (state.velocityX - targetVelocityX) * headingZ -
      (state.velocityZ - targetVelocityZ) * headingX
  );
  const slip = clamp(lateral / (DRIFT_3D_VEHICLE_MAX_SPEED * 0.55), 0, 1);
  const grip =
    lerp(
      DRIFT_3D_VEHICLE_GRIP,
      DRIFT_3D_VEHICLE_GRIP * DRIFT_3D_VEHICLE_DRIFT_GRIP_FACTOR,
      slip
    ) * airFactor;
  const gripAmount = Math.min(1, grip * dt);
  state.velocityX += (targetVelocityX - state.velocityX) * gripAmount;
  state.velocityZ += (targetVelocityZ - state.velocityZ) * gripAmount;

  state.position.x += state.velocityX * dt;
  state.position.z += state.velocityZ * dt;

  /* ── Collisions ────────────────────────────────────────────────────── */
  let collided = false;

  for (const collider of colliders) {
    const dx = state.position.x - collider.x;
    const dz = state.position.z - collider.z;
    const minDistance = collider.radius + DRIFT_3D_VEHICLE_COLLISION_RADIUS;
    const distanceSq = dx * dx + dz * dz;

    if (distanceSq >= minDistance * minDistance || distanceSq === 0) continue;

    const distance = Math.sqrt(distanceSq);
    const nx = dx / distance;
    const nz = dz / distance;
    state.position.x = collider.x + nx * minDistance;
    state.position.z = collider.z + nz * minDistance;
    const along = state.velocityX * nx + state.velocityZ * nz;

    if (along < 0) {
      state.velocityX -= along * nx * (1 + DRIFT_3D_VEHICLE_COLLISION_BOUNCE);
      state.velocityZ -= along * nz * (1 + DRIFT_3D_VEHICLE_COLLISION_BOUNCE);
      collided = true;
    }
  }

  if (state.position.x < bounds.minX) {
    state.position.x = bounds.minX;
    state.velocityX = Math.max(0, state.velocityX);
    collided = true;
  } else if (state.position.x > bounds.maxX) {
    state.position.x = bounds.maxX;
    state.velocityX = Math.min(0, state.velocityX);
    collided = true;
  }

  if (state.position.z < bounds.minZ) {
    state.position.z = bounds.minZ;
    state.velocityZ = Math.max(0, state.velocityZ);
    collided = true;
  } else if (state.position.z > bounds.maxZ) {
    state.position.z = bounds.maxZ;
    state.velocityZ = Math.min(0, state.velocityZ);
    collided = true;
  }

  if (collided) {
    state.speed = state.velocityX * headingX + state.velocityZ * headingZ;
  }

  /* ── Verticale : suivi de sol, décollage, chute ────────────────────── */
  let landingImpact = 0;
  const groundTarget =
    getGroundY(state.position.x, state.position.z) + DRIFT_3D_VEHICLE_GROUND_CLEARANCE;

  if (state.airborne) {
    state.velocityY -= DRIFT_3D_GRAVITY * dt;
    state.position.y += state.velocityY * dt;

    if (state.position.y <= groundTarget) {
      landingImpact = Math.max(0, -state.velocityY);
      state.position.y = groundTarget;
      state.velocityY = 0;
      state.airborne = false;
    }
  } else {
    const drop = groundTarget - state.position.y;
    const maxFollow = DRIFT_3D_MAX_GROUND_FOLLOW_RATE * dt;

    if (drop < -maxFollow) {
      // Le sol se dérobe plus vite que la suspension : on décolle.
      state.airborne = true;
      state.velocityY = 0;
      state.position.y += drop * 0.25;
    } else {
      state.position.y += clamp(drop, -maxFollow, maxFollow * 3);
    }
  }

  return { airborne: state.airborne, landingImpact, collided, slip };
}
