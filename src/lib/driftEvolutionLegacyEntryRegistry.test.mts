import assert from "node:assert/strict";
import test from "node:test";
import {
  drift3dLandmarks,
  getDrift3DLandmarkColliders,
} from "./drift3dLandmarks";
import {
  DRIFT_EVOLUTION_REPLACED_LANDMARK_ID,
  isLegacyEntrySuppressedForEvolution,
  restoreLegacyEntryAfterEvolution,
  suppressLegacyEntryForEvolution,
} from "./driftEvolutionLegacyEntryRegistry";

test("evolution removes the legacy Entry from both render and collider authority", () => {
  restoreLegacyEntryAfterEvolution();
  const beforeColliderCount = getDrift3DLandmarkColliders().length;
  assert.ok(
    drift3dLandmarks.some(
      (landmark) => landmark.id === DRIFT_EVOLUTION_REPLACED_LANDMARK_ID
    )
  );

  suppressLegacyEntryForEvolution();
  try {
    assert.equal(isLegacyEntrySuppressedForEvolution(), true);
    assert.equal(
      drift3dLandmarks.some(
        (landmark) => landmark.id === DRIFT_EVOLUTION_REPLACED_LANDMARK_ID
      ),
      false
    );
    assert.ok(getDrift3DLandmarkColliders().length < beforeColliderCount);
  } finally {
    restoreLegacyEntryAfterEvolution();
  }

  assert.equal(isLegacyEntrySuppressedForEvolution(), false);
  assert.equal(getDrift3DLandmarkColliders().length, beforeColliderCount);
});
