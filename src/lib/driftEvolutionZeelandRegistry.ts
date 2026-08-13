import {
  drift3dLandmarks,
  type Drift3DLandmark,
} from "@/lib/drift3dLandmarks";
import { drift3dTrackNodeBySlug } from "@/lib/drift3dTopology";
import {
  DRIFT_EVOLUTION_ZEELAND_GEOGRAPHY_LANDMARK_ID,
  DRIFT_EVOLUTION_ZEELAND_TARGET,
  buildDriftEvolutionZeelandGeographyLandmark,
} from "@/lib/driftEvolutionZeelandGeography";

export { DRIFT_EVOLUTION_ZEELAND_OFFSET } from "@/lib/driftEvolutionZeelandGeography";

export const DRIFT_EVOLUTION_ZEELAND_LANDMARK_ID = "birth-zeeland-canal";

type ZeelandSnapshot = {
  nodeX: number;
  nodeZ: number;
  landmarkIndex: number;
  sourceLandmark: Drift3DLandmark;
};

let snapshot: ZeelandSnapshot | null = null;

/**
 * Zeeland staging promoted with the accepted runtime.
 *
 * The inherited houses, small bridge and quay details remain useful, but the
 * two tiny Reflector water cards are not geography. Move the inherited scene
 * to the Entry-cleared target, remove only those local water cards, and append
 * a bounded port/canal geography landmark before Drift3DSceneBase builds its
 * visual and collider authorities.
 */
export function stageZeelandForEvolution() {
  if (snapshot) return;

  const node = drift3dTrackNodeBySlug["a-walk-in-zeeland"];
  const landmarkIndex = drift3dLandmarks.findIndex(
    (candidate) => candidate.id === DRIFT_EVOLUTION_ZEELAND_LANDMARK_ID
  );
  const sourceLandmark = drift3dLandmarks[landmarkIndex];
  if (!node || landmarkIndex < 0 || !sourceLandmark) return;

  snapshot = {
    nodeX: node.position.x,
    nodeZ: node.position.z,
    landmarkIndex,
    sourceLandmark,
  };

  node.position.x = DRIFT_EVOLUTION_ZEELAND_TARGET.x;
  node.position.z = DRIFT_EVOLUTION_ZEELAND_TARGET.z;

  drift3dLandmarks[landmarkIndex] = {
    ...sourceLandmark,
    origin: {
      x: DRIFT_EVOLUTION_ZEELAND_TARGET.x,
      z: DRIFT_EVOLUTION_ZEELAND_TARGET.z,
    },
    primitives: sourceLandmark.primitives.filter((primitive) => !primitive.water),
  };

  drift3dLandmarks.push(buildDriftEvolutionZeelandGeographyLandmark());
}

export function restoreZeelandAfterEvolution() {
  if (!snapshot) return;

  const node = drift3dTrackNodeBySlug["a-walk-in-zeeland"];
  if (node) {
    node.position.x = snapshot.nodeX;
    node.position.z = snapshot.nodeZ;
  }

  const geographyIndex = drift3dLandmarks.findIndex(
    (candidate) => candidate.id === DRIFT_EVOLUTION_ZEELAND_GEOGRAPHY_LANDMARK_ID
  );
  if (geographyIndex >= 0) {
    drift3dLandmarks.splice(geographyIndex, 1);
  }

  const currentLandmarkIndex = drift3dLandmarks.findIndex(
    (candidate) => candidate.id === DRIFT_EVOLUTION_ZEELAND_LANDMARK_ID
  );
  if (currentLandmarkIndex >= 0) {
    drift3dLandmarks[currentLandmarkIndex] = snapshot.sourceLandmark;
  } else {
    drift3dLandmarks.splice(
      Math.min(snapshot.landmarkIndex, drift3dLandmarks.length),
      0,
      snapshot.sourceLandmark
    );
  }

  snapshot = null;
}

export function isZeelandStagedForEvolution() {
  return snapshot !== null;
}
