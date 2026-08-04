/**
 * IMMERSION CORE — mélangeurs de zones.
 * Outil de transition entre macro-mondes : tout état continu (brouillard,
 * exposition, gains sonores, densité) se pilote par des scalaires 0..1
 * dérivés de la position sur la route. Aucune identité artistique ici.
 */

export function immersionSmoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));

  return t * t * (3 - 2 * t);
}

export function immersionLerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** Bande 0→1→0 : montée sur [in0,in1], descente sur [out0,out1]. */
export function immersionBand(
  x: number,
  in0: number,
  in1: number,
  out0: number,
  out1: number
) {
  return (
    immersionSmoothstep(in0, in1, x) * (1 - immersionSmoothstep(out0, out1, x))
  );
}
