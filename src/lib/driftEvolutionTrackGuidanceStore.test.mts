import assert from "node:assert/strict";
import test from "node:test";
import {
  clearDriftEvolutionTrackGuidance,
  getDriftEvolutionTrackGuidanceSnapshot,
  publishDriftEvolutionTrackGuidance,
  subscribeDriftEvolutionTrackGuidance,
} from "./driftEvolutionTrackGuidanceStore";

test("guidance store publishes, suppresses tiny jitter and clears", () => {
  clearDriftEvolutionTrackGuidance();
  let notifications = 0;
  const unsubscribe = subscribeDriftEvolutionTrackGuidance(() => {
    notifications += 1;
  });

  publishDriftEvolutionTrackGuidance({
    trackSlug: "a-walk-in-zeeland",
    distance: 24,
    bearingDegrees: 18,
    mode: "first-reveal",
  });
  assert.equal(notifications, 1);
  assert.equal(
    getDriftEvolutionTrackGuidanceSnapshot()?.trackSlug,
    "a-walk-in-zeeland"
  );

  publishDriftEvolutionTrackGuidance({
    trackSlug: "a-walk-in-zeeland",
    distance: 23.96,
    bearingDegrees: 18.4,
    mode: "first-reveal",
  });
  assert.equal(notifications, 1);

  clearDriftEvolutionTrackGuidance();
  assert.equal(notifications, 2);
  assert.equal(getDriftEvolutionTrackGuidanceSnapshot(), null);
  unsubscribe();
});
