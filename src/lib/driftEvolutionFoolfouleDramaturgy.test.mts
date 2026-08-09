import assert from "node:assert/strict";
import test from "node:test";
import {
  createDrift3DAudioClockSnapshot,
  updateDrift3DAudioClock,
} from "./drift3dAudioClock";
import {
  DRIFT_EVOLUTION_FOOLFOULE_PANELS,
  DRIFT_EVOLUTION_FOOLFOULE_TRACKING_MAX_YAW,
  createDriftEvolutionFoolfouleCrowdSignal,
  getDriftEvolutionFoolfoulePanelYaw,
  isDriftEvolutionFoolfouleAudioSource,
  resolveDriftEvolutionFoolfouleDramaturgy,
} from "./driftEvolutionFoolfouleDramaturgy";

function playingTrack(slug: string) {
  const idle = createDrift3DAudioClockSnapshot(
    { kind: "track", slug },
    0
  );
  return updateDrift3DAudioClock(
    idle,
    { playbackState: "playing", durationSeconds: 180 },
    "play",
    0
  );
}

test("Foolfoule dramaturgy reuses the eight ordinary commercial panels", () => {
  assert.equal(DRIFT_EVOLUTION_FOOLFOULE_PANELS.length, 8);
  assert.equal(
    DRIFT_EVOLUTION_FOOLFOULE_PANELS.filter((panel) => panel.heroCounter).length,
    1
  );
  assert.ok(
    DRIFT_EVOLUTION_FOOLFOULE_PANELS.every(
      (panel) => panel.width > 1 && panel.height > 0.8
    )
  );
});

test("only the Foolfoule track can authorize the anomaly", () => {
  const foolfoule = playingTrack("foolfoule");
  const zeeland = playingTrack("a-walk-in-zeeland");

  assert.equal(isDriftEvolutionFoolfouleAudioSource(foolfoule), true);
  assert.equal(isDriftEvolutionFoolfouleAudioSource(zeeland), false);
  assert.equal(
    resolveDriftEvolutionFoolfouleDramaturgy(zeeland, true, 40).phase,
    "ordinary"
  );
  assert.equal(
    resolveDriftEvolutionFoolfouleDramaturgy(foolfoule, false, 40).phase,
    "ordinary"
  );
});

test("crowd passages escalate from ordinary to tracking to counting", () => {
  const audio = playingTrack("foolfoule");
  const ordinary = resolveDriftEvolutionFoolfouleDramaturgy(audio, true, 1);
  const tracking = resolveDriftEvolutionFoolfouleDramaturgy(audio, true, 8);
  const counting = resolveDriftEvolutionFoolfouleDramaturgy(audio, true, 30);

  assert.equal(ordinary.phase, "ordinary");
  assert.equal(ordinary.trackingBlend, 0);
  assert.equal(tracking.phase, "tracking");
  assert.ok(tracking.trackingBlend > 0);
  assert.equal(tracking.counterBlend, 0);
  assert.equal(counting.phase, "counting");
  assert.equal(counting.trackingBlend, 1);
  assert.equal(counting.counterBlend, 1);
  assert.equal(counting.counterValue, 22);
});

test("pause preserves the visible state but stops advancement authority", () => {
  const playing = playingTrack("foolfoule");
  const paused = updateDrift3DAudioClock(
    playing,
    { playbackState: "paused" },
    "pause",
    1200
  );
  const state = resolveDriftEvolutionFoolfouleDramaturgy(paused, true, 30);

  assert.equal(state.narrativeVisible, true);
  assert.equal(state.advancing, false);
  assert.equal(state.phase, "counting");
  assert.equal(state.counterValue, 22);
});

test("panel yaw follows the crowd without turret-like rotation", () => {
  const left = getDriftEvolutionFoolfoulePanelYaw(0, 5, -20, 0);
  const right = getDriftEvolutionFoolfoulePanelYaw(0, -5, 20, 0);

  assert.ok(left < 0);
  assert.ok(right > 0);
  assert.ok(Math.abs(left) <= DRIFT_EVOLUTION_FOOLFOULE_TRACKING_MAX_YAW);
  assert.ok(Math.abs(right) <= DRIFT_EVOLUTION_FOOLFOULE_TRACKING_MAX_YAW);
});

test("crowd signal starts neutral at Foolfoule", () => {
  const signal = createDriftEvolutionFoolfouleCrowdSignal();
  assert.equal(signal.totalCrossings, 0);
  assert.equal(signal.sampleCount, 0);
  assert.ok(Number.isFinite(signal.centroidX));
  assert.ok(Number.isFinite(signal.centroidZ));
});
