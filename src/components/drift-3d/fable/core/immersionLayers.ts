import * as THREE from "three";

/**
 * IMMERSION CORE — couches de profondeur.
 * Un plan n'existe jamais seul : premier plan tactile (< 15 m), plan moyen
 * habité (15–60 m), fond noyé d'atmosphère (> 60 m). Ce module fournit le
 * générateur d'anneau de fond ; la densité des deux premières couches reste
 * une décision du monde.
 */

export type ImmersionBackdropParams = {
  seed: () => number;
  count: number;
  center: { x: number; z: number };
  radiusMin: number;
  radiusMax: number;
  angleMin: number;
  angleMax: number;
  heightMin: number;
  heightMax: number;
  widthMin: number;
  widthMax: number;
  /** Aplatissement de l'anneau vers l'axe z (1 = cercle). */
  depthScale?: number;
};

/** Matrices d'instances pour un anneau de silhouettes de fond. */
export function immersionBackdropRing(params: ImmersionBackdropParams): THREE.Matrix4[] {
  const rng = params.seed;
  const matrices: THREE.Matrix4[] = [];
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();

  for (let i = 0; i < params.count; i += 1) {
    const angle = params.angleMin + rng() * (params.angleMax - params.angleMin);
    const radius = params.radiusMin + rng() * (params.radiusMax - params.radiusMin);
    const x = params.center.x + Math.sin(angle) * radius;
    const z =
      params.center.z +
      Math.cos(angle) * radius * (params.depthScale ?? 1) * (0.55 + rng() * 0.45);
    const h = params.heightMin + rng() * rng() * (params.heightMax - params.heightMin);
    e.set(0, rng() * 0.4, 0);
    q.setFromEuler(e);
    matrices.push(
      new THREE.Matrix4().compose(
        new THREE.Vector3(x, h / 2, z),
        q,
        new THREE.Vector3(
          params.widthMin + rng() * (params.widthMax - params.widthMin),
          h,
          params.widthMin + rng() * (params.widthMax - params.widthMin) * 0.8
        )
      )
    );
  }

  return matrices;
}
