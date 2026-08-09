import { EUX_GAINENT_LANDMARK_ID } from "@/lib/drift3dEuxGainent";
import { drift3dLandmarks } from "@/lib/drift3dLandmarks";
import {
  drift3dEraById,
  drift3dTrackNodeBySlug,
} from "@/lib/drift3dTopology";
import type { Track } from "@/lib/tracks";

type TrackSlug = Track["slug"];

export const DRIFT_EVOLUTION_FOOLFOULE_LANDMARK_ID =
  "birth-foolfoule-canyon";

/** Foolfoule takes the exact former EUX GAINENT Birth Yard slot. */
export const DRIFT_EVOLUTION_FOOLFOULE_TARGET = Object.freeze({
  x: -62,
  z: 42,
});

/**
 * Free New Signal pocket: inside the era radius, naturally near-flat and
 * separated from the existing New Signal nodes so EUX keeps readable space.
 */
export const DRIFT_EVOLUTION_EUX_GAINENT_TARGET = Object.freeze({
  x: 58,
  z: 38,
});

type TrackPlacementSnapshot = {
  foolfouleNodeX: number;
  foolfouleNodeZ: number;
  foolfouleEraId: "birth-yard" | "older-shadows" | "vegetative-field" | "new-signal";
  euxNodeX: number;
  euxNodeZ: number;
  euxEraId: "birth-yard" | "older-shadows" | "vegetative-field" | "new-signal";
  foolfouleLandmarkX: number;
  foolfouleLandmarkZ: number;
  euxLandmarkX: number;
  euxLandmarkZ: number;
  birthYardTrackSlugs: TrackSlug[];
  newSignalTrackSlugs: TrackSlug[];
};

let snapshot: TrackPlacementSnapshot | null = null;

function replaceTrackSlugs(
  target: readonly TrackSlug[],
  next: readonly TrackSlug[]
) {
  const mutable = target as TrackSlug[];
  mutable.splice(0, mutable.length, ...next);
}

/**
 * Owner spatial correction for /drift-evolution only:
 * - Foolfoule replaces EUX GAINENT at the existing Birth Yard map slot;
 * - EUX GAINENT moves with its complete landmark into a free New Signal pocket;
 * - EUX changes era authority to New Signal while its stable internal node id
 *   is preserved so the accepted cue/living-scene runtime does not fork.
 *
 * Production registries are restored exactly on unmount.
 */
export function stageTrackPlacementForEvolution() {
  if (snapshot) return;

  const foolfouleNode = drift3dTrackNodeBySlug.foolfoule;
  const euxNode = drift3dTrackNodeBySlug["eux-gainent"];
  const foolfouleLandmark = drift3dLandmarks.find(
    (candidate) => candidate.id === DRIFT_EVOLUTION_FOOLFOULE_LANDMARK_ID
  );
  const euxLandmark = drift3dLandmarks.find(
    (candidate) => candidate.id === EUX_GAINENT_LANDMARK_ID
  );
  const birthYardEra = drift3dEraById["birth-yard"];
  const newSignalEra = drift3dEraById["new-signal"];

  if (
    !foolfouleNode ||
    !euxNode ||
    !foolfouleLandmark ||
    !euxLandmark ||
    !birthYardEra ||
    !newSignalEra
  ) {
    return;
  }

  snapshot = {
    foolfouleNodeX: foolfouleNode.position.x,
    foolfouleNodeZ: foolfouleNode.position.z,
    foolfouleEraId: foolfouleNode.eraId,
    euxNodeX: euxNode.position.x,
    euxNodeZ: euxNode.position.z,
    euxEraId: euxNode.eraId,
    foolfouleLandmarkX: foolfouleLandmark.origin.x,
    foolfouleLandmarkZ: foolfouleLandmark.origin.z,
    euxLandmarkX: euxLandmark.origin.x,
    euxLandmarkZ: euxLandmark.origin.z,
    birthYardTrackSlugs: [...birthYardEra.trackSlugs],
    newSignalTrackSlugs: [...newSignalEra.trackSlugs],
  };

  foolfouleNode.position.x = DRIFT_EVOLUTION_FOOLFOULE_TARGET.x;
  foolfouleNode.position.z = DRIFT_EVOLUTION_FOOLFOULE_TARGET.z;
  foolfouleNode.eraId = "birth-yard";
  foolfouleLandmark.origin.x = DRIFT_EVOLUTION_FOOLFOULE_TARGET.x;
  foolfouleLandmark.origin.z = DRIFT_EVOLUTION_FOOLFOULE_TARGET.z;

  euxNode.position.x = DRIFT_EVOLUTION_EUX_GAINENT_TARGET.x;
  euxNode.position.z = DRIFT_EVOLUTION_EUX_GAINENT_TARGET.z;
  euxNode.eraId = "new-signal";
  euxLandmark.origin.x = DRIFT_EVOLUTION_EUX_GAINENT_TARGET.x;
  euxLandmark.origin.z = DRIFT_EVOLUTION_EUX_GAINENT_TARGET.z;

  const birthYardTrackSlugs = snapshot.birthYardTrackSlugs.filter(
    (slug) => slug !== "foolfoule" && slug !== "eux-gainent"
  );
  const oldEuxIndex = snapshot.birthYardTrackSlugs.indexOf("eux-gainent");
  const foolfouleIndex =
    oldEuxIndex >= 0
      ? Math.min(oldEuxIndex, birthYardTrackSlugs.length)
      : birthYardTrackSlugs.length;
  birthYardTrackSlugs.splice(foolfouleIndex, 0, "foolfoule");
  replaceTrackSlugs(birthYardEra.trackSlugs, birthYardTrackSlugs);

  const newSignalTrackSlugs = snapshot.newSignalTrackSlugs.filter(
    (slug) => slug !== "eux-gainent"
  );
  const finaleIndex = newSignalTrackSlugs.indexOf("eteeaooete");
  newSignalTrackSlugs.splice(
    finaleIndex >= 0 ? finaleIndex : newSignalTrackSlugs.length,
    0,
    "eux-gainent"
  );
  replaceTrackSlugs(newSignalEra.trackSlugs, newSignalTrackSlugs);
}

export function restoreTrackPlacementAfterEvolution() {
  if (!snapshot) return;

  const foolfouleNode = drift3dTrackNodeBySlug.foolfoule;
  const euxNode = drift3dTrackNodeBySlug["eux-gainent"];
  const foolfouleLandmark = drift3dLandmarks.find(
    (candidate) => candidate.id === DRIFT_EVOLUTION_FOOLFOULE_LANDMARK_ID
  );
  const euxLandmark = drift3dLandmarks.find(
    (candidate) => candidate.id === EUX_GAINENT_LANDMARK_ID
  );
  const birthYardEra = drift3dEraById["birth-yard"];
  const newSignalEra = drift3dEraById["new-signal"];

  if (foolfouleNode) {
    foolfouleNode.position.x = snapshot.foolfouleNodeX;
    foolfouleNode.position.z = snapshot.foolfouleNodeZ;
    foolfouleNode.eraId = snapshot.foolfouleEraId;
  }
  if (euxNode) {
    euxNode.position.x = snapshot.euxNodeX;
    euxNode.position.z = snapshot.euxNodeZ;
    euxNode.eraId = snapshot.euxEraId;
  }
  if (foolfouleLandmark) {
    foolfouleLandmark.origin.x = snapshot.foolfouleLandmarkX;
    foolfouleLandmark.origin.z = snapshot.foolfouleLandmarkZ;
  }
  if (euxLandmark) {
    euxLandmark.origin.x = snapshot.euxLandmarkX;
    euxLandmark.origin.z = snapshot.euxLandmarkZ;
  }
  if (birthYardEra) {
    replaceTrackSlugs(birthYardEra.trackSlugs, snapshot.birthYardTrackSlugs);
  }
  if (newSignalEra) {
    replaceTrackSlugs(newSignalEra.trackSlugs, snapshot.newSignalTrackSlugs);
  }

  snapshot = null;
}

export function isTrackPlacementStagedForEvolution() {
  return snapshot !== null;
}
