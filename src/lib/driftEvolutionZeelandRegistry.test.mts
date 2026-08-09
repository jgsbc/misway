import assert from "node:assert/strict";
import test from "node:test";
import { drift3dLandmarks } from "./drift3dLandmarks";
import { drift3dTrackNodeBySlug } from "./drift3dTopology";
import { DRIFT_EVOLUTION_ENTRY_CAVE } from "./driftEvolutionEntryCave";
import {
  DRIFT_EVOLUTION_ZEELAND_LANDMARK_ID,
  DRIFT_EVOLUTION_ZEELAND_OFFSET,
  isZeelandStagedForEvolution,
  restoreZeelandAfterEvolution,
  stageZeelandForEvolution,
} from "./driftEvolutionZeelandRegistry";

test("Zeeland node and decor move together clear of the recovered Entry", () => {
  restoreZeelandAfterEvolution();
  const node = drift3dTrackNodeBySlug["a-walk-in-zeeland"];
  const landmark = drift3dLandmarks.find(
    (candidate) => candidate.id === DRIFT_EVOLUTION_ZEELAND_LANDMARK_ID
  );
  assert.ok(landmark);

  const original = {
    nodeX: node.position.x,
    nodeZ: node.position.z,
    landmarkX: landmark.origin.x,
    landmarkZ: landmark.origin.z,
  };

  try {
    stageZeelandForEvolution();
    assert.equal(isZeelandStagedForEvolution(), true);
    assert.equal(node.position.x, original.nodeX + DRIFT_EVOLUTION_ZEELAND_OFFSET.x);
    assert.equal(node.position.z, original.nodeZ + DRIFT_EVOLUTION_ZEELAND_OFFSET.z);
    assert.equal(landmark.origin.x, original.landmarkX + DRIFT_EVOLUTION_ZEELAND_OFFSET.x);
    assert.equal(landmark.origin.z, original.landmarkZ + DRIFT_EVOLUTION_ZEELAND_OFFSET.z);

    // The westernmost canal-house row uses x=-8.6 relative to the landmark.
    // It must sit east of the cave's exterior face instead of inside the portal.
    assert.ok(landmark.origin.x - 8.6 > DRIFT_EVOLUTION_ENTRY_CAVE.exitX);

    const revealDistance = Math.hypot(
      node.position.x - DRIFT_EVOLUTION_ENTRY_CAVE.exitX,
      node.position.z - DRIFT_EVOLUTION_ENTRY_CAVE.centerZ
    );
    assert.ok(revealDistance >= 12);
    assert.ok(revealDistance <= 18);
  } finally {
    restoreZeelandAfterEvolution();
  }

  assert.equal(isZeelandStagedForEvolution(), false);
  assert.equal(node.position.x, original.nodeX);
  assert.equal(node.position.z, original.nodeZ);
  assert.equal(landmark.origin.x, original.landmarkX);
  assert.equal(landmark.origin.z, original.landmarkZ);
});
