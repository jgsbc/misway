import {
  drift3dLandmarks,
  type Drift3DLandmark,
} from "@/lib/drift3dLandmarks";
import {
  DRIFT_JAZZYPLING_LANDMARK_ID,
  DRIFT_JAZZYPLING_SOURCE_LANDMARK_ID,
  buildDriftJazzyplingDistrictLandmark,
} from "@/lib/driftJazzyplingDistrict";

type JazzyplingSnapshot = Readonly<{
  landmarkIndex: number;
  sourceLandmark: Drift3DLandmark;
}>;

let snapshot: JazzyplingSnapshot | null = null;

/**
 * Production-local replacement of the inherited tiny Jazzypling vignette.
 * The canonical node stays fixed; only the local landmark becomes a connected
 * alley/cellar district before the base scene captures collider authority.
 */
export function stageJazzyplingDistrict() {
  if (snapshot) return;

  const landmarkIndex = drift3dLandmarks.findIndex(
    (candidate) => candidate.id === DRIFT_JAZZYPLING_SOURCE_LANDMARK_ID
  );
  const sourceLandmark = drift3dLandmarks[landmarkIndex];
  if (landmarkIndex < 0 || !sourceLandmark) return;

  snapshot = { landmarkIndex, sourceLandmark };
  drift3dLandmarks[landmarkIndex] = buildDriftJazzyplingDistrictLandmark();
}

export function restoreJazzyplingDistrict() {
  if (!snapshot) return;

  const currentIndex = drift3dLandmarks.findIndex(
    (candidate) =>
      candidate.id === DRIFT_JAZZYPLING_SOURCE_LANDMARK_ID ||
      candidate.id === DRIFT_JAZZYPLING_LANDMARK_ID
  );

  if (currentIndex >= 0) {
    drift3dLandmarks[currentIndex] = snapshot.sourceLandmark;
  } else {
    drift3dLandmarks.splice(
      Math.min(snapshot.landmarkIndex, drift3dLandmarks.length),
      0,
      snapshot.sourceLandmark
    );
  }

  snapshot = null;
}

export function isJazzyplingDistrictStaged() {
  return snapshot !== null;
}
