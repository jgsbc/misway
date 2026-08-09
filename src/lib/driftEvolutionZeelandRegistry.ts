import { drift3dLandmarks } from "@/lib/drift3dLandmarks";
import { drift3dTrackNodeBySlug } from "@/lib/drift3dTopology";

export const DRIFT_EVOLUTION_ZEELAND_OFFSET = Object.freeze({ x: 12, z: 3 });
export const DRIFT_EVOLUTION_ZEELAND_LANDMARK_ID = "birth-zeeland-canal";

type ZeelandSnapshot = {
  nodeX: number;
  nodeZ: number;
  landmarkX: number;
  landmarkZ: number;
};

let snapshot: ZeelandSnapshot | null = null;

/**
 * Entry now occupies the former west-side staging volume. In evolution only,
 * move the first Birth Yard beat and its complete landmark together so the
 * recovered cave can reveal Zeeland rather than burying it inside the portal.
 * Production source data is restored on unmount.
 */
export function stageZeelandForEvolution() {
  if (snapshot) return;

  const node = drift3dTrackNodeBySlug["a-walk-in-zeeland"];
  const landmark = drift3dLandmarks.find(
    (candidate) => candidate.id === DRIFT_EVOLUTION_ZEELAND_LANDMARK_ID
  );
  if (!node || !landmark) return;

  snapshot = {
    nodeX: node.position.x,
    nodeZ: node.position.z,
    landmarkX: landmark.origin.x,
    landmarkZ: landmark.origin.z,
  };

  node.position.x += DRIFT_EVOLUTION_ZEELAND_OFFSET.x;
  node.position.z += DRIFT_EVOLUTION_ZEELAND_OFFSET.z;
  landmark.origin.x += DRIFT_EVOLUTION_ZEELAND_OFFSET.x;
  landmark.origin.z += DRIFT_EVOLUTION_ZEELAND_OFFSET.z;
}

export function restoreZeelandAfterEvolution() {
  if (!snapshot) return;

  const node = drift3dTrackNodeBySlug["a-walk-in-zeeland"];
  const landmark = drift3dLandmarks.find(
    (candidate) => candidate.id === DRIFT_EVOLUTION_ZEELAND_LANDMARK_ID
  );

  if (node) {
    node.position.x = snapshot.nodeX;
    node.position.z = snapshot.nodeZ;
  }
  if (landmark) {
    landmark.origin.x = snapshot.landmarkX;
    landmark.origin.z = snapshot.landmarkZ;
  }

  snapshot = null;
}

export function isZeelandStagedForEvolution() {
  return snapshot !== null;
}
