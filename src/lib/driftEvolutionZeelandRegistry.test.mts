import assert from "node:assert/strict";
import test from "node:test";
import { drift3dLandmarks } from "./drift3dLandmarks";
import { drift3dTrackNodeBySlug } from "./drift3dTopology";
import { DRIFT_EVOLUTION_ENTRY_CAVE } from "./driftEvolutionEntryCave";
import {
  DRIFT_EVOLUTION_ZEELAND_GEOGRAPHY_LANDMARK_ID,
  DRIFT_EVOLUTION_ZEELAND_TARGET,
} from "./driftEvolutionZeelandGeography";
import {
  DRIFT_EVOLUTION_ZEELAND_LANDMARK_ID,
  DRIFT_EVOLUTION_ZEELAND_OFFSET,
  isZeelandStagedForEvolution,
  restoreZeelandAfterEvolution,
  stageZeelandForEvolution,
} from "./driftEvolutionZeelandRegistry";

test("Zeeland stages as one Entry-cleared port composition and restores exactly", () => {
  restoreZeelandAfterEvolution();
  const node = drift3dTrackNodeBySlug["a-walk-in-zeeland"];
  const sourceLandmark = drift3dLandmarks.find(
    (candidate) => candidate.id === DRIFT_EVOLUTION_ZEELAND_LANDMARK_ID
  );
  assert.ok(sourceLandmark);

  const original = {
    nodeX: node.position.x,
    nodeZ: node.position.z,
    landmark: sourceLandmark,
    landmarkIndex: drift3dLandmarks.indexOf(sourceLandmark),
    landmarkCount: drift3dLandmarks.length,
    waterCount: sourceLandmark.primitives.filter((primitive) => primitive.water).length,
  };
  assert.ok(original.waterCount > 0);

  try {
    stageZeelandForEvolution();
    assert.equal(isZeelandStagedForEvolution(), true);
    assert.equal(node.position.x, original.nodeX + DRIFT_EVOLUTION_ZEELAND_OFFSET.x);
    assert.equal(node.position.z, original.nodeZ + DRIFT_EVOLUTION_ZEELAND_OFFSET.z);
    assert.deepEqual(
      { x: node.position.x, z: node.position.z },
      DRIFT_EVOLUTION_ZEELAND_TARGET
    );

    const stagedLandmark = drift3dLandmarks.find(
      (candidate) => candidate.id === DRIFT_EVOLUTION_ZEELAND_LANDMARK_ID
    );
    const geography = drift3dLandmarks.find(
      (candidate) => candidate.id === DRIFT_EVOLUTION_ZEELAND_GEOGRAPHY_LANDMARK_ID
    );
    assert.ok(stagedLandmark);
    assert.ok(geography);
    assert.notEqual(stagedLandmark, sourceLandmark);
    assert.equal(drift3dLandmarks.length, original.landmarkCount + 1);
    assert.deepEqual(stagedLandmark.origin, DRIFT_EVOLUTION_ZEELAND_TARGET);
    assert.equal(
      stagedLandmark.primitives.some((primitive) => primitive.water),
      false,
      "tiny inherited Reflector cards must yield to the evolution water authority"
    );

    // Historical houses/bridge/bollards stay in the staged local scene.
    assert.equal(
      stagedLandmark.primitives.length,
      sourceLandmark.primitives.length - original.waterCount
    );

    // The westernmost inherited canal-house row uses x=-8.6 relative to the
    // landmark. It must remain east of the recovered cave exterior.
    assert.ok(stagedLandmark.origin.x - 8.6 > DRIFT_EVOLUTION_ENTRY_CAVE.exitX);

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
  assert.equal(drift3dLandmarks.length, original.landmarkCount);
  assert.equal(drift3dLandmarks[original.landmarkIndex], original.landmark);
  assert.equal(
    drift3dLandmarks.some(
      (candidate) => candidate.id === DRIFT_EVOLUTION_ZEELAND_GEOGRAPHY_LANDMARK_ID
    ),
    false
  );
});
