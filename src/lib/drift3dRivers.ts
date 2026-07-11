/**
 * DRIFT-3D-20C-FIX2 — tracé partagé de la rivière.
 *
 * Défini ici (et pas dans le composant de rendu) pour que le système de
 * dispersion (`drift3dScatter`) puisse EXCLURE le couloir du fleuve : plus
 * d'arbres ni de rochers plantés au milieu de l'eau.
 *
 * Convention cardinale : nord = −z, sud = +z, est = +x, ouest = −x.
 * Le fleuve descend des plaines du sud (+z) vers l'océan du nord-est.
 */
export const DRIFT_3D_RIVER_PATH: ReadonlyArray<readonly [number, number]> = [
  [-2, 126],
  [-5, 106],
  [-9, 86],
  [-14, 66],
  [-22, 48],
  [-31, 30],
  [-35, 12],
  [-32, -6],
  [-24, -23],
  [-11, -39],
  [5, -51],
  [23, -61],
  [41, -71],
  [54, -85],
];

/** Demi-largeur du fleuve : étroit à la source (sud), large au débouché (mer). */
export function drift3dRiverHalfWidth(t: number): number {
  return 2 + t * 3.4;
}

/** Distance minimale (plan xz) d'un point au fil du fleuve. */
export function distanceToDrift3DRiver(x: number, z: number): number {
  let min = Infinity;

  for (let i = 0; i < DRIFT_3D_RIVER_PATH.length - 1; i += 1) {
    const [x1, z1] = DRIFT_3D_RIVER_PATH[i];
    const [x2, z2] = DRIFT_3D_RIVER_PATH[i + 1];
    const dx = x2 - x1;
    const dz = z2 - z1;
    const lengthSquared = dx * dx + dz * dz || 1;
    const t = Math.max(
      0,
      Math.min(1, ((x - x1) * dx + (z - z1) * dz) / lengthSquared)
    );
    const px = x1 + dx * t;
    const pz = z1 + dz * t;
    const distance = Math.hypot(x - px, z - pz);

    if (distance < min) {
      min = distance;
    }
  }

  return min;
}
