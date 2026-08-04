/**
 * IMMERSION CORE — ancrage du véhicule.
 * Assiette depuis le champ de hauteur, ombre de contact qui respire avec la
 * garde au sol, micro-tassement de caisse avec la vitesse. Fonctions pures :
 * le monde fournit sa fonction de sol, le core fournit la sensation de masse.
 */

export type ImmersionGroundPose = {
  pitch: number;
  roll: number;
};

export function immersionGroundPose(
  x: number,
  z: number,
  headingX: number,
  headingZ: number,
  groundY: (x: number, z: number) => number,
  airborne: boolean,
  probe = 0.9,
  maxPitch = 0.5,
  maxRoll = 0.35
): ImmersionGroundPose {
  if (airborne) {
    return { pitch: -0.12, roll: 0 };
  }

  const here = groundY(x, z);
  const ahead = groundY(x + headingX * probe, z + headingZ * probe);
  const side = groundY(x + headingZ * probe, z - headingX * probe);

  return {
    pitch: Math.max(-maxPitch, Math.min(maxPitch, -Math.atan((ahead - here) / probe))),
    roll: Math.max(-maxRoll, Math.min(maxRoll, Math.atan((side - here) / probe))),
  };
}

export type ImmersionContactShadow = {
  scale: number;
  opacity: number;
};

/** Ombre de contact : pleine au sol, s'élargit et s'évanouit en l'air. */
export function immersionContactShadow(
  heightAboveGround: number,
  baseOpacity = 0.42
): ImmersionContactShadow {
  const lift = Math.min(1, Math.max(0, heightAboveGround) / 1.2);

  return {
    scale: 1 + lift * 0.7,
    opacity: baseOpacity * (1 - lift * 0.85),
  };
}

/** Micro-tassement de caisse : enfoncement et tangage subtils avec la vitesse. */
export function immersionBodySettle(speedRatio: number, time: number) {
  return {
    drop: speedRatio * 0.012 + Math.sin(time * 17) * 0.0022 * speedRatio,
    pitchNose: speedRatio * 0.012,
  };
}
