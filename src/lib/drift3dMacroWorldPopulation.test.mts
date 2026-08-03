import { test } from "node:test";
import assert from "node:assert/strict";
import {
  getDrift3DBirthYardCounts,
  getDrift3DOlderShadowsCounts,
  getDrift3DVegetativeFieldCounts,
} from "@/lib/drift3dMacroWorldPopulation";
import { DRIFT_3D_QUALITY_TIERS, getDrift3DQualityProfile } from "@/lib/drift3dQuality";

test("Birth Yard counts scale monotonically low <= medium <= high", () => {
  const low = getDrift3DBirthYardCounts("low");
  const medium = getDrift3DBirthYardCounts("medium");
  const high = getDrift3DBirthYardCounts("high");

  assert.ok(low.towerCount <= medium.towerCount);
  assert.ok(medium.towerCount <= high.towerCount);
  assert.ok(low.crowdCount <= medium.crowdCount);
  assert.ok(medium.crowdCount <= high.crowdCount);
  assert.ok(low.trafficCount <= medium.trafficCount);
  assert.ok(medium.trafficCount <= high.trafficCount);
  assert.ok(low.towerCount >= 1 && low.crowdCount >= 1 && low.trafficCount >= 1);
});

test("Older Shadows cairn count scales monotonically low <= medium <= high", () => {
  const low = getDrift3DOlderShadowsCounts("low");
  const high = getDrift3DOlderShadowsCounts("high");

  assert.ok(low.cairnCount <= getDrift3DOlderShadowsCounts("medium").cairnCount);
  assert.ok(getDrift3DOlderShadowsCounts("medium").cairnCount <= high.cairnCount);
  assert.ok(low.cairnCount >= 1);
});

test("Vegetative Field house count scales monotonically low <= medium <= high", () => {
  const low = getDrift3DVegetativeFieldCounts("low");
  const high = getDrift3DVegetativeFieldCounts("high");

  assert.ok(low.houseCount <= getDrift3DVegetativeFieldCounts("medium").houseCount);
  assert.ok(getDrift3DVegetativeFieldCounts("medium").houseCount <= high.houseCount);
  assert.ok(low.houseCount >= 1);
});

test("every Quality Tier preserves the required identity flags (world topology, core navigation, signature objects, primary cue)", () => {
  for (const tier of DRIFT_3D_QUALITY_TIERS) {
    const profile = getDrift3DQualityProfile(tier);

    assert.equal(profile.identity.worldTopology, true);
    assert.equal(profile.identity.coreNavigation, true);
    assert.equal(profile.identity.signatureObjects, true);
    assert.equal(profile.identity.primaryCue, true);
  }
});
