import assert from "node:assert/strict";
import test from "node:test";
import {
  DRIFT_EVOLUTION_MOBILE_MEDIA_QUERY,
  getDriftEvolutionPerformanceProfile,
  hasDriftEvolutionSceneProximityIdentityChanged,
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
  assert.ok(pixelRatio < 0.75);
  assert.equal(mobile.shadowMapSize, 1024);
  assert.ok(shadowTexelRatio < 0.45);
  assert.ok(mobile.shadowUpdateIntervalMs >= 60);
  assert.equal(mobile.proximityRefreshIntervalMs, 100);
  assert.equal(mobile.secondaryInstancedShadows, false);
  assert.equal(mobile.antialias, false);
  assert.equal(mobile.alpha, false);
  assert.equal(mobile.shadows, true);
});

test("Evolution desktop keeps high identity with bounded render work", () => {
  const profile = getDriftEvolutionPerformanceProfile(false);

  assert.equal(profile.mode, "desktop");
  assert.equal(profile.qualityTier, "high");
  assert.equal(profile.maxDpr, 1.35);
  assert.equal(profile.shadowMapSize, 1536);
  assert.ok(profile.shadowUpdateIntervalMs >= 33);
  assert.equal(profile.proximityRefreshIntervalMs, 50);
  assert.equal(profile.secondaryInstancedShadows, false);
  assert.equal(profile.antialias, true);
  assert.equal(profile.alpha, false);
  assert.equal(profile.shadows, true);
  assert.equal(Object.isFrozen(profile), true);
});

test("Evolution scene proximity ignores numeric HUD-only movement", () => {
  const identity = {
    nearestNode: { id: "birth-yard-foolfoule" },
    activeNode: null,
    nearestEra: { id: "birth-yard" },
    activeEra: { id: "birth-yard" },
    isInside: false,
  } as const;

  assert.equal(
    hasDriftEvolutionSceneProximityIdentityChanged(null, identity),
    true
  );
  assert.equal(
    hasDriftEvolutionSceneProximityIdentityChanged(identity, {
      ...identity,
      nearestNode: { id: "birth-yard-foolfoule" },
    }),
    false
  );
  assert.equal(
    hasDriftEvolutionSceneProximityIdentityChanged(identity, {
      ...identity,
      activeNode: { id: "birth-yard-foolfoule" },
      isInside: true,
    }),
    true
  );
});
