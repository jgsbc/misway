import assert from "node:assert/strict";
import test from "node:test";
import { EUX_GAINENT_LANDMARK_ID } from "./drift3dEuxGainent";
import { drift3dLandmarks } from "./drift3dLandmarks";
import {
  drift3dEraById,
  drift3dTrackNodeBySlug,
  getDrift3DTrackNodesByEra,
} from "./drift3dTopology";
import { getDrift3DTerrainHeight } from "./drift3dTerrain";
import {
  DRIFT_EVOLUTION_EUX_GAINENT_TARGET,
  DRIFT_EVOLUTION_FOOLFOULE_LANDMARK_ID,
  DRIFT_EVOLUTION_FOOLFOULE_TARGET,
  isTrackPlacementStagedForEvolution,
  restoreTrackPlacementAfterEvolution,
  stageTrackPlacementForEvolution,
} from "./driftEvolutionTrackPlacementRegistry";

function countSlug(slugs: readonly string[], slug: string) {
  return slugs.filter((candidate) => candidate === slug).length;
}

test("Foolfoule replaces EUX in Birth Yard and EUX moves into free New Signal space", () => {
  restoreTrackPlacementAfterEvolution();

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

  assert.ok(foolfouleLandmark);
  assert.ok(euxLandmark);

  const original = {
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

  try {
    stageTrackPlacementForEvolution();
    assert.equal(isTrackPlacementStagedForEvolution(), true);

    // "Replace EUX by Foolfoule" is literal: Foolfoule inherits EUX's old slot.
    assert.deepEqual(DRIFT_EVOLUTION_FOOLFOULE_TARGET, {
      x: original.euxNodeX,
      z: original.euxNodeZ,
    });
    assert.equal(foolfouleNode.position.x, DRIFT_EVOLUTION_FOOLFOULE_TARGET.x);
    assert.equal(foolfouleNode.position.z, DRIFT_EVOLUTION_FOOLFOULE_TARGET.z);
    assert.equal(foolfouleNode.eraId, "birth-yard");
    assert.equal(
      foolfouleLandmark.origin.x,
      DRIFT_EVOLUTION_FOOLFOULE_TARGET.x
    );
    assert.equal(
      foolfouleLandmark.origin.z,
      DRIFT_EVOLUTION_FOOLFOULE_TARGET.z
    );

    // EUX migrates as a complete scene and its actual era authority changes.
    assert.equal(euxNode.position.x, DRIFT_EVOLUTION_EUX_GAINENT_TARGET.x);
    assert.equal(euxNode.position.z, DRIFT_EVOLUTION_EUX_GAINENT_TARGET.z);
    assert.equal(euxNode.eraId, "new-signal");
    assert.equal(euxLandmark.origin.x, DRIFT_EVOLUTION_EUX_GAINENT_TARGET.x);
    assert.equal(euxLandmark.origin.z, DRIFT_EVOLUTION_EUX_GAINENT_TARGET.z);

    assert.equal(countSlug(birthYardEra.trackSlugs, "eux-gainent"), 0);
    assert.equal(countSlug(birthYardEra.trackSlugs, "foolfoule"), 1);
    assert.equal(birthYardEra.trackSlugs.at(-1), "foolfoule");
    assert.equal(countSlug(newSignalEra.trackSlugs, "eux-gainent"), 1);
    // ÉTÉÉAOOÉTÉ stays the New Signal conclusion.
    assert.equal(newSignalEra.trackSlugs.at(-1), "eteeaooete");

    const otherNewSignalNodes = getDrift3DTrackNodesByEra("new-signal").filter(
      (node) => node.trackSlug !== "eux-gainent"
    );
    const nearestOtherNodeDistance = Math.min(
      ...otherNewSignalNodes.map((node) =>
        Math.hypot(
          node.position.x - DRIFT_EVOLUTION_EUX_GAINENT_TARGET.x,
          node.position.z - DRIFT_EVOLUTION_EUX_GAINENT_TARGET.z
        )
      )
    );
    assert.ok(nearestOtherNodeDistance >= 24);

    // No evolution terrain fork is needed: this pocket is naturally near-flat.
    const centerHeight = getDrift3DTerrainHeight(
      DRIFT_EVOLUTION_EUX_GAINENT_TARGET.x,
      DRIFT_EVOLUTION_EUX_GAINENT_TARGET.z
    );
    const localHeightDelta = Math.max(
      ...[
        [2, 0],
        [-2, 0],
        [0, 2],
        [0, -2],
      ].map(([dx, dz]) =>
        Math.abs(
          getDrift3DTerrainHeight(
            DRIFT_EVOLUTION_EUX_GAINENT_TARGET.x + dx,
            DRIFT_EVOLUTION_EUX_GAINENT_TARGET.z + dz
          ) - centerHeight
        )
      )
    );
    assert.ok(localHeightDelta <= 0.35);
  } finally {
    restoreTrackPlacementAfterEvolution();
  }

  assert.equal(isTrackPlacementStagedForEvolution(), false);
  assert.equal(foolfouleNode.position.x, original.foolfouleNodeX);
  assert.equal(foolfouleNode.position.z, original.foolfouleNodeZ);
  assert.equal(foolfouleNode.eraId, original.foolfouleEraId);
  assert.equal(euxNode.position.x, original.euxNodeX);
  assert.equal(euxNode.position.z, original.euxNodeZ);
  assert.equal(euxNode.eraId, original.euxEraId);
  assert.equal(foolfouleLandmark.origin.x, original.foolfouleLandmarkX);
  assert.equal(foolfouleLandmark.origin.z, original.foolfouleLandmarkZ);
  assert.equal(euxLandmark.origin.x, original.euxLandmarkX);
  assert.equal(euxLandmark.origin.z, original.euxLandmarkZ);
  assert.deepEqual(birthYardEra.trackSlugs, original.birthYardTrackSlugs);
  assert.deepEqual(newSignalEra.trackSlugs, original.newSignalTrackSlugs);
});
