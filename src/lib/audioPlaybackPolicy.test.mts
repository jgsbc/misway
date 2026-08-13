import assert from "node:assert/strict";
import test from "node:test";
import { shouldSuppressIdleAmbientOnDrift } from "@/lib/audioPlaybackPolicy";

test("Drift never suppresses a track that is already playing", () => {
  assert.equal(
    shouldSuppressIdleAmbientOnDrift({
      isDriftRoute: true,
      audioKind: "track",
      isActuallyPlaying: true,
    }),
    false
  );
});

test("Drift preserves ambient audio that was already playing", () => {
  assert.equal(
    shouldSuppressIdleAmbientOnDrift({
      isDriftRoute: true,
      audioKind: "ambient",
      isActuallyPlaying: true,
    }),
    false
  );
});

test("Drift suppresses only an idle ambient autoplay attempt", () => {
  assert.equal(
    shouldSuppressIdleAmbientOnDrift({
      isDriftRoute: true,
      audioKind: "ambient",
      isActuallyPlaying: false,
    }),
    true
  );
});
