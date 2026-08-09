import assert from "node:assert/strict";
import test from "node:test";
import { drift3dLandmarks } from "./drift3dLandmarks";
import {
  drift3dEraById,
  drift3dTrackNodeBySlug,
  getDrift3DTrackNodesByEra,
} from "./drift3dTopology";
import { getTrackBySlug } from "./tracks";

function countSlug(slugs: readonly string[], slug: string) {
  return slugs.filter((candidate) => candidate === slug).length;
}

test("Foolfoule replaces EUX in Birth Yard and EUX belongs to New Signal", () => {
  const foolfoule = drift3dTrackNodeBySlug.foolfoule;
  const eux = drift3dTrackNodeBySlug["eux-gainent"];
  const birthYard = drift3dEraById["birth-yard"];
  const newSignal = drift3dEraById["new-signal"];

  assert.deepEqual(
    { x: foolfoule.position.x, z: foolfoule.position.z },
    { x: -62, z: 42 }
  );
  assert.equal(foolfoule.eraId, "birth-yard");
  assert.equal(countSlug(birthYard.trackSlugs, "foolfoule"), 1);
  assert.equal(countSlug(birthYard.trackSlugs, "eux-gainent"), 0);
  assert.equal(birthYard.trackSlugs.at(-1), "foolfoule");

  assert.deepEqual(
    { x: eux.position.x, z: eux.position.z },
    { x: 58, z: 38 }
  );
  assert.equal(eux.eraId, "new-signal");
  assert.equal(countSlug(newSignal.trackSlugs, "eux-gainent"), 1);
  assert.equal(newSignal.trackSlugs.at(-1), "amidir");

  const distanceToEraCenter = Math.hypot(
    eux.position.x - newSignal.center.x,
    eux.position.z - newSignal.center.z
  );
  assert.ok(distanceToEraCenter <= newSignal.radius);

  const nearestOtherNewSignalNode = Math.min(
    ...getDrift3DTrackNodesByEra("new-signal")
      .filter((node) => node.trackSlug !== "eux-gainent")
      .map((node) =>
        Math.hypot(
          node.position.x - eux.position.x,
          node.position.z - eux.position.z
        )
      )
  );
  assert.ok(nearestOtherNewSignalNode >= 24);

  const foolfouleLandmark = drift3dLandmarks.find(
    (landmark) => landmark.id === "birth-foolfoule-canyon"
  );
  const euxLandmark = drift3dLandmarks.find(
    (landmark) => landmark.id === "birth-eux-gainent-glass-gym"
  );
  assert.ok(foolfouleLandmark);
  assert.ok(euxLandmark);
  assert.deepEqual(foolfouleLandmark.origin, {
    x: foolfoule.position.x,
    z: foolfoule.position.z,
  });
  assert.deepEqual(euxLandmark.origin, {
    x: eux.position.x,
    z: eux.position.z,
  });

  const euxTrack = getTrackBySlug("eux-gainent");
  assert.ok(euxTrack);
  assert.equal(euxTrack.publishedLabel, "New era");
  assert.ok(euxTrack.tags.includes("new era"));
  assert.equal(euxTrack.tags.includes("birth era"), false);
});
