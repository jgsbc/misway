import * as THREE from "three";

/**
 * IMMERSION CORE — caméra de poursuite incarnée.
 * Basse, inertielle, légèrement portée à l'épaule ; le FOV respire avec la
 * vitesse ; l'inclinaison suit le virage. Les paramètres par zone (distance,
 * hauteur, FOV) appartiennent au monde ; la sensation appartient au core.
 */

export type ImmersionCameraTargets = {
  /** Position du sujet (le véhicule). */
  subject: THREE.Vector3;
  /** Direction avant normalisée (xz). */
  headingX: number;
  headingZ: number;
  /** 0..1 vitesse relative. */
  speedRatio: number;
  /** Lacet appliqué ce pas (rad) — pour la prise de roulis en virage. */
  yawRate: number;
};

export type ImmersionCameraParams = {
  distance: number;
  height: number;
  lookAhead: number;
  lookHeight: number;
  fovBase: number;
  fovSpeedKick: number;
  shakeAmplitude: number;
  positionDamping: number;
  lookDamping: number;
  rollGain: number;
};

export type ImmersionCameraState = {
  position: THREE.Vector3;
  look: THREE.Vector3;
  roll: number;
  initialized: boolean;
};

export function createImmersionCameraState(): ImmersionCameraState {
  return {
    position: new THREE.Vector3(),
    look: new THREE.Vector3(),
    roll: 0,
    initialized: false,
  };
}

/** Position désirée brute (avant contraintes du monde : tunnels, parois…). */
export function immersionCameraDesired(
  targets: ImmersionCameraTargets,
  params: ImmersionCameraParams,
  time: number,
  out: THREE.Vector3
) {
  const shake = params.shakeAmplitude * (0.35 + targets.speedRatio);
  out.set(
    targets.subject.x - targets.headingX * params.distance + Math.sin(time * 1.7) * shake,
    targets.subject.y + params.height + Math.sin(time * 2.3) * shake * 0.6,
    targets.subject.z - targets.headingZ * params.distance + Math.cos(time * 1.4) * shake
  );
}

/**
 * Applique l'inertie et oriente la caméra. `desired` a déjà subi les
 * contraintes du monde. Retourne le FOV cible (à lisser côté appelant).
 */
export function stepImmersionCamera(
  camera: THREE.PerspectiveCamera,
  state: ImmersionCameraState,
  desired: THREE.Vector3,
  targets: ImmersionCameraTargets,
  params: ImmersionCameraParams,
  dt: number
): number {
  if (!state.initialized) {
    state.initialized = true;
    state.position.copy(desired);
    state.look.set(
      targets.subject.x + targets.headingX * params.lookAhead,
      targets.subject.y + params.lookHeight,
      targets.subject.z + targets.headingZ * params.lookAhead
    );
  }

  state.position.lerp(desired, 1 - Math.exp(-dt * params.positionDamping));

  const lookTarget = new THREE.Vector3(
    targets.subject.x + targets.headingX * params.lookAhead,
    targets.subject.y + params.lookHeight,
    targets.subject.z + targets.headingZ * params.lookAhead
  );
  state.look.lerp(lookTarget, 1 - Math.exp(-dt * params.lookDamping));

  // Roulis de virage : la caméra penche dans la courbe, doucement.
  const rollTarget = -targets.yawRate * params.rollGain * targets.speedRatio;
  state.roll += (rollTarget - state.roll) * Math.min(1, dt * 3);

  camera.position.copy(state.position);
  camera.up.set(Math.sin(state.roll), Math.cos(state.roll), 0);
  camera.lookAt(state.look);

  return params.fovBase + targets.speedRatio * params.fovSpeedKick;
}
