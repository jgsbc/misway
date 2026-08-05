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
  /** Dernière position connue du sujet, pour détecter les sauts. */
  lastSubject: THREE.Vector3;
};

export function createImmersionCameraState(): ImmersionCameraState {
  return {
    position: new THREE.Vector3(),
    look: new THREE.Vector3(),
    roll: 0,
    initialized: false,
    lastSubject: new THREE.Vector3(),
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
  /*
    Un saut de position n'est pas un déplacement : interpoler à travers la
    distance ferait passer la caméra sous la montagne. Mesuré au col, une
    relocalisation creusait 5,3 m sous le terrain, là où la conduite
    continue gardait 2,3 m de garde. On détecte donc la discontinuité et
    on repose la caméra d'un coup, vitesse comprise.
  */
  const jumped =
    state.initialized &&
    state.lastSubject.distanceTo(targets.subject) >
      Math.max(6, params.distance * 2 + targets.speedRatio * 40 * dt);

  if (!state.initialized || jumped) {
    state.initialized = true;
    state.position.copy(desired);
    state.roll = 0;
    state.look.set(
      targets.subject.x + targets.headingX * params.lookAhead,
      targets.subject.y + params.lookHeight,
      targets.subject.z + targets.headingZ * params.lookAhead
    );
  }

  state.lastSubject.copy(targets.subject);
  state.position.lerp(desired, 1 - Math.exp(-dt * params.positionDamping));

  const lookTarget = new THREE.Vector3(
    targets.subject.x + targets.headingX * params.lookAhead,
    targets.subject.y + params.lookHeight,
    targets.subject.z + targets.headingZ * params.lookAhead
  );
  state.look.lerp(lookTarget, 1 - Math.exp(-dt * params.lookDamping));

  // Roulis de virage : la caméra penche dans la courbe, doucement — et
  // jamais au-delà d'un souffle, sinon l'horizon part en diagonale.
  const rollTarget = Math.max(
    -0.05,
    Math.min(0.05, -targets.yawRate * params.rollGain * targets.speedRatio)
  );
  state.roll += (rollTarget - state.roll) * Math.min(1, dt * 3);

  camera.position.copy(state.position);
  camera.up.set(Math.sin(state.roll), Math.cos(state.roll), 0);
  camera.lookAt(state.look);

  return params.fovBase + targets.speedRatio * params.fovSpeedKick;
}
