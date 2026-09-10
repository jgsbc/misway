import assert from "node:assert/strict";
import test from "node:test";
import {
  planAudioSourceAttachment,
  resolveDeferredAudioAttachment,
  shouldSuppressIdleAmbientOnDrift,
} from "@/lib/audioPlaybackPolicy";

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

test("a deferred ambient source is attached before it can play", () => {
  assert.deepEqual(
    resolveDeferredAudioAttachment({
      deferredSrc: "/misway/audio/entry-ambient.mp3",
      attachedSrc: null,
    }),
    { attach: true, src: "/misway/audio/entry-ambient.mp3" }
  );
});

test("an already attached source is never re-attached", () => {
  assert.deepEqual(
    resolveDeferredAudioAttachment({
      deferredSrc: "/misway/audio/entry-ambient.mp3",
      attachedSrc: "/misway/audio/entry-ambient.mp3",
    }),
    { attach: false }
  );
});

test("a deferred source replaces a different attached source", () => {
  assert.deepEqual(
    resolveDeferredAudioAttachment({
      deferredSrc: "/misway/audio/entry-ambient.mp3",
      attachedSrc: "/misway/audio/a-walk-in-zeeland.mp3",
    }),
    { attach: true, src: "/misway/audio/entry-ambient.mp3" }
  );
});

test("nothing is attached when no source was deferred", () => {
  assert.deepEqual(
    resolveDeferredAudioAttachment({ deferredSrc: null, attachedSrc: null }),
    { attach: false }
  );
  assert.deepEqual(
    resolveDeferredAudioAttachment({
      deferredSrc: null,
      attachedSrc: "/misway/audio/a-walk-in-zeeland.mp3",
    }),
    { attach: false }
  );
});

const AMBIENT = "/misway/audio/entry-ambient.mp3";
const TRACK = "/misway/audio/a-walk-in-zeeland.mp3";

/** The idle ambient on /drift must cost nothing: no source, so no request. */
test("an idle ambient on Drift is never attached to the element", () => {
  const suppressIdleAmbient = shouldSuppressIdleAmbientOnDrift({
    isDriftRoute: true,
    audioKind: "ambient",
    isActuallyPlaying: false,
  });
  assert.equal(suppressIdleAmbient, true);
  assert.deepEqual(
    planAudioSourceAttachment({ suppressIdleAmbient, attachedSrc: null, nextSrc: AMBIENT }),
    { action: "defer", src: AMBIENT }
  );
});

/** Deferring must not tear off a source that is already attached. */
test("deferring never detaches a source that is already attached", () => {
  const plan = planAudioSourceAttachment({
    suppressIdleAmbient: true,
    attachedSrc: AMBIENT,
    nextSrc: AMBIENT,
  });
  assert.equal(plan.action, "defer");
  assert.notEqual(plan.action, "attach");
});

/**
 * An ambient already playing when the route becomes Drift must survive intact:
 * re-assigning `src` or calling `load()` would reset currentTime to zero.
 */
test("an ambient already playing is neither detached, reloaded nor restarted", () => {
  const suppressIdleAmbient = shouldSuppressIdleAmbientOnDrift({
    isDriftRoute: true,
    audioKind: "ambient",
    isActuallyPlaying: true,
  });
  assert.equal(suppressIdleAmbient, false);
  assert.deepEqual(
    planAudioSourceAttachment({ suppressIdleAmbient, attachedSrc: AMBIENT, nextSrc: AMBIENT }),
    { action: "keep" }
  );
});

test("a track already playing is left alone the same way", () => {
  const suppressIdleAmbient = shouldSuppressIdleAmbientOnDrift({
    isDriftRoute: true,
    audioKind: "track",
    isActuallyPlaying: true,
  });
  assert.deepEqual(
    planAudioSourceAttachment({ suppressIdleAmbient, attachedSrc: TRACK, nextSrc: TRACK }),
    { action: "keep" }
  );
});

test("a genuinely different source is still attached and loaded", () => {
  assert.deepEqual(
    planAudioSourceAttachment({
      suppressIdleAmbient: false,
      attachedSrc: AMBIENT,
      nextSrc: TRACK,
    }),
    { action: "attach", src: TRACK }
  );
  assert.deepEqual(
    planAudioSourceAttachment({ suppressIdleAmbient: false, attachedSrc: null, nextSrc: TRACK }),
    { action: "attach", src: TRACK }
  );
});
