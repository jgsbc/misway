/**
 * Per-track motion grading (realism bible — « l'émotion par le mouvement »).
 * `speedScale` multiplies the arcade physics top speed / acceleration while
 * the vehicle is inside the node; `zoomScale` biases the follow camera
 * (>1 pulls back for open vistas, <1 tightens for pressure). Values ease in
 * and out smoothly so entering or leaving a scene never snaps.
 */

export type Drift3DTrackMotion = {
  speedScale: number;
  zoomScale: number;
};

export const DRIFT_3D_DEFAULT_TRACK_MOTION: Drift3DTrackMotion = {
  speedScale: 1,
  zoomScale: 1,
};

const trackMotionBySlug: Record<string, Drift3DTrackMotion> = {
  // Birth Yard
  foolfoule: { speedScale: 1, zoomScale: 0.9 },
  jazzypling: { speedScale: 0.85, zoomScale: 0.88 },
  "play-it": { speedScale: 0.95, zoomScale: 0.95 },
  // Older Shadows
  rise: { speedScale: 0.8, zoomScale: 1.12 },
  blossoming: { speedScale: 1.3, zoomScale: 1.18 },
  "ethnic-stick": { speedScale: 0.85, zoomScale: 1 },
  // Vegetative Field
  chailk: { speedScale: 0.9, zoomScale: 1.06 },
  // New Signal
  time: { speedScale: 0.4, zoomScale: 1 },
  telatelaba: { speedScale: 0.7, zoomScale: 0.88 },
  relative: { speedScale: 1.1, zoomScale: 1 },
  renee: { speedScale: 0.6, zoomScale: 1.14 },
  // prolongement océanique rituel de renee : même lenteur contemplative
  eteeaooete: { speedScale: 0.6, zoomScale: 1.16 },
};

export function getDrift3DTrackMotion(
  trackSlug: string | null | undefined
): Drift3DTrackMotion {
  if (!trackSlug) {
    return DRIFT_3D_DEFAULT_TRACK_MOTION;
  }

  return trackMotionBySlug[trackSlug] ?? DRIFT_3D_DEFAULT_TRACK_MOTION;
}
