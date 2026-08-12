import assert from "node:assert/strict";
import test from "node:test";
import {
  DRIFT_EVOLUTION_MOBILE_MEDIA_QUERY,
  getDriftEvolutionPerformanceProfile,
} from "@/lib/driftEvolutionPerformance";

test("Evolution mobile uses a medium capability budget without losing identity", () => {
  const profile = getDriftEvolutionPerformanceProfile(true);

  assert.equal(profile.mode, "mobile");
  assert.equal(profile.qualityTier, "medium");
  assert.notEqual(profile.qualityTier, "low");
  assert.deepEqual(profile.qualityProfile.identity, {
    worldTopology: true,
    coreNavigation: true,
    signatureObjects: true,
    primaryCue: true,
  });
  assert.match(DRIFT_EVOLUTION_MOBILE_MEDIA_QUERY, /pointer: coarse/);
});

test("Evolution mobile reduces raster and shadow budgets while keeping the renderer", () => {
  const mobile = getDriftEvolutionPerformanceProfile(true);
  const desktop = getDriftEvolutionPerformanceProfile(false);
  const pixelRatio = (mobile.maxDpr / desktop.maxDpr) ** 2;
  const shadowTexelRatio =
    (mobile.shadowMapSize / desktop.shadowMapSize) ** 2;

  assert.equal(mobile.maxDpr, 1.15);
  assert.ok(pixelRatio < 0.59);
  assert.equal(mobile.shadowMapSize, 1024);
  assert.equal(shadowTexelRatio, 0.25);
  assert.equal(mobile.secondaryInstancedShadows, false);
  assert.equal(mobile.antialias, true);
  assert.equal(mobile.shadows, true);
});

test("Evolution desktop retains the existing high-capability render profile", () => {
  const profile = getDriftEvolutionPerformanceProfile(false);

  assert.equal(profile.mode, "desktop");
  assert.equal(profile.qualityTier, "high");
  assert.equal(profile.maxDpr, 1.5);
  assert.equal(profile.shadowMapSize, 2048);
  assert.equal(profile.secondaryInstancedShadows, true);
  assert.equal(profile.antialias, true);
  assert.equal(profile.shadows, true);
  assert.equal(Object.isFrozen(profile), true);
});
