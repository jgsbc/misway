import { drift3dLandmarks, type Drift3DLandmark } from "@/lib/drift3dLandmarks";

export const DRIFT_EVOLUTION_REPLACED_LANDMARK_ID = "entry-lambda-cave";

type RemovedLegacyEntry = {
  landmark: Drift3DLandmark;
  index: number;
};

let removedLegacyEntry: RemovedLegacyEntry | null = null;

/**
 * `/drift-evolution` replaces the production Entry completely. This gate is
 * applied before Drift3DSceneBase renders, so both its landmark loop and its
 * memoized landmark-collider list are built without the legacy cave.
 *
 * The production source data is restored when the evolution scene unmounts;
 * `/drift` remains byte-identical and receives its normal registry.
 */
export function suppressLegacyEntryForEvolution() {
  if (removedLegacyEntry) return;

  const index = drift3dLandmarks.findIndex(
    (landmark) => landmark.id === DRIFT_EVOLUTION_REPLACED_LANDMARK_ID
  );
  if (index < 0) return;

  const [landmark] = drift3dLandmarks.splice(index, 1);
  removedLegacyEntry = { landmark, index };
}

export function restoreLegacyEntryAfterEvolution() {
  if (!removedLegacyEntry) return;
  if (
    drift3dLandmarks.some(
      (landmark) => landmark.id === DRIFT_EVOLUTION_REPLACED_LANDMARK_ID
    )
  ) {
    removedLegacyEntry = null;
    return;
  }

  const insertionIndex = Math.min(removedLegacyEntry.index, drift3dLandmarks.length);
  drift3dLandmarks.splice(insertionIndex, 0, removedLegacyEntry.landmark);
  removedLegacyEntry = null;
}

export function isLegacyEntrySuppressedForEvolution() {
  return !drift3dLandmarks.some(
    (landmark) => landmark.id === DRIFT_EVOLUTION_REPLACED_LANDMARK_ID
  );
}
