import {
  drift3dLandmarks,
  type Drift3DLandmark,
} from "@/lib/drift3dLandmarks";
import {
  DRIFT_EVOLUTION_JAZZYPLING_LANDMARK_ID,
  DRIFT_EVOLUTION_JAZZYPLING_SOURCE_LANDMARK_ID,
  buildDriftEvolutionJazzyplingDistrictLandmark,
} from "@/lib/driftEvolutionJazzyplingDistrict";

type JazzyplingSnapshot = Readonly<{
  landmarkIndex: number;
  sourceLandmark: Drift3DLandmark;
}>;

let snapshot: JazzyplingSnapshot | null = null;

export function stageJazzyplingForEvolution() {
  if (snapshot) return;

  const landmarkIndex = drift3dLandmarks.findIndex(
    (candidate) => candidate.id === DRIFT_EVOLUTION_JAZZYPLING_SOURCE_LANDMARK_ID
  );
  const sourceLandmark = drift3dLandmarks[landmarkIndex];
  if (landmarkIndex < 0 || !sourceLandmark) return;

  snapshot = { landmarkIndex, sourceLandmark };
  drift3dLandmarks[landmarkIndex] = buildDriftEvolutionJazzyplingDistrictLandmark();
}

export function restoreJazzyplingAfterEvolution() {
  if (!snapshot) return;

  const currentIndex = drift3dLandmarks.findIndex(
    (candidate) =>
      candidate.id === DRIFT_EVOLUTION_JAZZYPLING_SOURCE_LANDMARK_ID ||
      candidate.id === DRIFT_EVOLUTION_JAZZYPLING_LANDMARK_ID
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

export function isJazzyplingStagedForEvolution() {
  return snapshot !== null;
}
