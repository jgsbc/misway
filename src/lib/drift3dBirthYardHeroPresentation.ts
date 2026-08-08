const FOOLFOULE_LANDMARK_ID = "birth-foolfoule-canyon";

const FOOLFOULE_HEIGHT_SCALES = Object.freeze([0.7, 0.72, 0.65, 0.7] as const);

/**
 * Campaign B Hero Slice presentation override.
 *
 * Foolfoule's recovered footprints/colliders already drive correctly, but the
 * four narrow 4–6 m blocks still read as towers from the Birth Yard approach.
 * Compress only their vertical presentation so the existing physical street
 * plan stays unchanged while the skyline returns to a believable low-rise
 * port/business scale.
 */
export function getDrift3DHeroLandmarkHeightScale(
  landmarkId: string,
  primitiveIndex: number
): number {
  if (landmarkId !== FOOLFOULE_LANDMARK_ID) {
    return 1;
  }

  return FOOLFOULE_HEIGHT_SCALES[primitiveIndex] ?? 1;
}
