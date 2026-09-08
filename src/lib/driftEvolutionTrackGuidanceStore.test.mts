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
    activationRadius: 6.2,
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
    activationRadius: 6.2,
    bearingDegrees: 18.4,
    mode: "first-reveal",
  });
  assert.equal(notifications, 1);

  clearDriftEvolutionTrackGuidance();
  assert.equal(notifications, 2);
  assert.equal(getDriftEvolutionTrackGuidanceSnapshot(), null);
  unsubscribe();
});

test("guidance bearing crosses north without a near-full-circle visual spin", () => {
  clearDriftEvolutionTrackGuidance();

  publishDriftEvolutionTrackGuidance({
    trackSlug: "a-walk-in-zeeland",
    distance: 18,
    activationRadius: 6.2,
    bearingDegrees: 359,
    mode: "first-reveal",
  });
  const before = getDriftEvolutionTrackGuidanceSnapshot();
  assert.ok(before);
  assert.equal(before.bearingDegrees, -1);

  publishDriftEvolutionTrackGuidance({
    trackSlug: "a-walk-in-zeeland",
    distance: 17.8,
    activationRadius: 6.2,
    bearingDegrees: 1,
    mode: "first-reveal",
  });
  const after = getDriftEvolutionTrackGuidanceSnapshot();
  assert.ok(after);
  assert.ok(
    Math.abs(after.bearingDegrees - before.bearingDegrees) <= 2.1,
    `north crossing should move a few degrees, got ${before.bearingDegrees} -> ${after.bearingDegrees}`
  );

  clearDriftEvolutionTrackGuidance();
});
