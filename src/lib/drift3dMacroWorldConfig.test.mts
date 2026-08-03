import { test } from "node:test";
import assert from "node:assert/strict";
import { tracks } from "@/lib/tracks";
import { DRIFT_3D_KIT_PILOT_IDS } from "@/lib/drift3dKitPilotConfig";
import {
  DRIFT_3D_MACRO_WORLD_IDS,
  DRIFT_3D_MACRO_WORLDS,
  DRIFT_3D_MACRO_WORLD_ROUTE_ORDER,
  DRIFT_3D_MACRO_WORLD_TRANSITIONS,
  getDrift3DCanonicalMacroWorldConfigIssues,
  getDrift3DCanonicalMacroWorldFallbackIssues,
  getDrift3DCanonicalMacroWorldTransitionIssues,
  getDrift3DMacroWorldConfigIssues,
  getDrift3DMacroWorldFallbackIssues,
  getDrift3DMacroWorldTransitionIssues,
  isDrift3DMacroWorldId,
} from "@/lib/drift3dMacroWorldConfig";

test("exactly five macro-world ids, in canonical order", () => {
  assert.equal(DRIFT_3D_MACRO_WORLD_IDS.length, 5);
  assert.deepEqual(DRIFT_3D_MACRO_WORLD_ROUTE_ORDER, [
    "entry",
    "birth-yard",
    "older-shadows",
    "vegetative-field",
    "new-signal",
  ]);
});

test("isDrift3DMacroWorldId accepts only the five canonical ids", () => {
  for (const id of DRIFT_3D_MACRO_WORLD_IDS) {
    assert.equal(isDrift3DMacroWorldId(id), true);
  }
  assert.equal(isDrift3DMacroWorldId("morne-et"), false);
  assert.equal(isDrift3DMacroWorldId("urban-human"), false);
  assert.equal(isDrift3DMacroWorldId(""), false);
});

test("no macro-world id collides with a PRE-30 pilot id or a track slug", () => {
  const trackSlugs = new Set(tracks.map((t) => t.slug));

  for (const id of DRIFT_3D_MACRO_WORLD_IDS) {
    assert.equal(
      (DRIFT_3D_KIT_PILOT_IDS as readonly string[]).includes(id),
      false,
      `macro-world id "${id}" must not equal a PRE-30 pilot id`
    );
    assert.equal(
      trackSlugs.has(id as never),
      false,
      `macro-world id "${id}" must not equal a track slug`
    );
  }
});

test("canonical macro-world config is valid (unique origins, sequential order, all five present)", () => {
  assert.deepEqual(getDrift3DCanonicalMacroWorldConfigIssues(), []);
  assert.equal(DRIFT_3D_MACRO_WORLDS.length, 5);
});

test("config validation catches duplicate origin, duplicate order and a missing world", () => {
  const issues = getDrift3DMacroWorldConfigIssues([
    { id: "entry", order: 1, localOrigin: { x: -88, z: 12 }, dominantGeographyGuardrail: false },
    { id: "birth-yard", order: 1, localOrigin: { x: -88, z: 12 }, dominantGeographyGuardrail: false },
  ]);

  assert.ok(issues.some((issue) => issue.type === "duplicate-order"));
  assert.ok(issues.some((issue) => issue.type === "duplicate-origin"));
  assert.ok(
    issues.some((issue) => issue.type === "world-missing" && issue.id === "older-shadows")
  );
});

test("config validation flags the dominant-geography guardrail on the wrong world", () => {
  const issues = getDrift3DMacroWorldConfigIssues([
    { id: "entry", order: 1, localOrigin: { x: -88, z: 12 }, dominantGeographyGuardrail: true },
  ]);

  assert.ok(
    issues.some(
      (issue) => issue.type === "dominant-geography-guardrail-misplaced" && issue.id === "entry"
    )
  );
});

test("New Signal carries the dominant-geography guardrail, no other world does", () => {
  for (const world of DRIFT_3D_MACRO_WORLDS) {
    assert.equal(
      world.dominantGeographyGuardrail,
      world.id === "new-signal",
      `dominantGeographyGuardrail mismatch for "${world.id}"`
    );
  }
});

test("exactly four canonical transitions, connected end-to-end, no skip/backwards step", () => {
  assert.equal(DRIFT_3D_MACRO_WORLD_TRANSITIONS.length, 4);
  assert.deepEqual(getDrift3DCanonicalMacroWorldTransitionIssues(), []);
});

test("transition validation catches a skipped step, a backwards step and a wrong count", () => {
  const skip = getDrift3DMacroWorldTransitionIssues([
    { id: "a", fromWorld: "entry", toWorld: "older-shadows" },
  ]);
  assert.ok(skip.some((issue) => issue.type === "not-adjacent-in-route-order"));
  assert.ok(skip.some((issue) => issue.type === "wrong-transition-count"));

  const backwards = getDrift3DMacroWorldTransitionIssues([
    { id: "a", fromWorld: "birth-yard", toWorld: "entry" },
    { id: "b", fromWorld: "birth-yard", toWorld: "older-shadows" },
    { id: "c", fromWorld: "older-shadows", toWorld: "vegetative-field" },
    { id: "d", fromWorld: "vegetative-field", toWorld: "new-signal" },
  ]);
  assert.ok(backwards.some((issue) => issue.type === "not-adjacent-in-route-order"));

  const disconnected = getDrift3DMacroWorldTransitionIssues([
    { id: "a", fromWorld: "entry", toWorld: "birth-yard" },
    { id: "b", fromWorld: "entry", toWorld: "birth-yard" },
    { id: "c", fromWorld: "older-shadows", toWorld: "vegetative-field" },
    { id: "d", fromWorld: "vegetative-field", toWorld: "new-signal" },
  ]);
  assert.ok(disconnected.some((issue) => issue.type === "duplicate-transition"));
  assert.ok(disconnected.some((issue) => issue.type === "transition-missing"));
});

test("every transition has a valid, distinct start/end world", () => {
  for (const transition of DRIFT_3D_MACRO_WORLD_TRANSITIONS) {
    assert.ok(isDrift3DMacroWorldId(transition.fromWorld));
    assert.ok(isDrift3DMacroWorldId(transition.toWorld));
    assert.notEqual(transition.fromWorld, transition.toWorld);
    assert.ok(transition.approxTravelLengthMeters > 0);
  }
});

test("canonical no-WebGL fallback cards are valid, one per macro-world", () => {
  assert.deepEqual(getDrift3DCanonicalMacroWorldFallbackIssues(), []);
});

test("fallback card validation catches a missing world and an empty field", () => {
  const issues = getDrift3DMacroWorldFallbackIssues([
    { worldId: "entry", title: "", whatItProves: "x" },
    { worldId: "birth-yard", title: "b", whatItProves: "x" },
    { worldId: "older-shadows", title: "o", whatItProves: "x" },
    { worldId: "vegetative-field", title: "v", whatItProves: "x" },
  ]);

  assert.ok(issues.some((issue) => issue.type === "empty-title"));
  assert.ok(
    issues.some((issue) => issue.type === "card-missing" && issue.worldId === "new-signal")
  );
});
