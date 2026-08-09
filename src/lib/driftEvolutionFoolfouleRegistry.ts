import {
  drift3dLandmarks,
  type Drift3DLandmark,
} from "@/lib/drift3dLandmarks";
import {
  DRIFT_EVOLUTION_FOOLFOULE_SOURCE_LANDMARK_ID,
  buildDriftEvolutionFoolfouleLandmark,
} from "@/lib/driftEvolutionFoolfoule";

type FoolfouleSnapshot = Readonly<{
  landmarkIndex: number;
  sourceLandmark: Drift3DLandmark;
}>;

let snapshot: FoolfouleSnapshot | null = null;

/**
 * Evolution-only replacement of the inherited four-tower Foolfoule diorama.
 * The canonical node does not move; only its local scene grows into a real
 * commercial canyon before Drift3DSceneBase captures landmark colliders.
 */
export function stageFoolfouleForEvolution() {
  if (snapshot) return;

  const landmarkIndex = drift3dLandmarks.findIndex(
    (candidate) => candidate.id === DRIFT_EVOLUTION_FOOLFOULE_SOURCE_LANDMARK_ID
  );
  const sourceLandmark = drift3dLandmarks[landmarkIndex];
  if (landmarkIndex < 0 || !sourceLandmark) return;

  snapshot = { landmarkIndex, sourceLandmark };
  drift3dLandmarks[landmarkIndex] = buildDriftEvolutionFoolfouleLandmark();
}

export function restoreFoolfouleAfterEvolution() {
  if (!snapshot) return;

  const currentIndex = drift3dLandmarks.findIndex(
    (candidate) =>
      candidate.id === DRIFT_EVOLUTION_FOOLFOULE_SOURCE_LANDMARK_ID ||
      candidate.id === "evolution-foolfoule-commercial-canyon"
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

export function isFoolfouleStagedForEvolution() {
  return snapshot !== null;
}
