export function shouldSuppressIdleAmbientOnDrift({
  isDriftRoute,
  audioKind,
  isActuallyPlaying,
}: {
  isDriftRoute: boolean;
  audioKind: "ambient" | "track";
  isActuallyPlaying: boolean;
}) {
  return isDriftRoute && audioKind === "ambient" && !isActuallyPlaying;
}

/*
 * LOT 04 -- critical loading path.
 *
 * On /drift the idle ambient cannot start without a click, yet a cold mobile
 * visit was spending 0.9-2.5 MB fetching it in the same seconds the world's own
 * assets were still downloading. `preload="none"` does not stop that: measured
 * in Chrome, an element with a `src` opens the stream and pulls megabytes even
 * with the hint set before the assignment. Not attaching the source at all is
 * the only thing that reliably costs nothing.
 *
 * The source is therefore held aside and attached on the click that asks for
 * the sound. This resolves that hand-off: a deferred source must always end up
 * attached before playback, and must never be re-attached (which would reset
 * `currentTime` and restart the media load algorithm mid-play).
 */
export function resolveDeferredAudioAttachment({
  deferredSrc,
  attachedSrc,
}: {
  deferredSrc: string | null;
  attachedSrc: string | null;
}): { attach: false } | { attach: true; src: string } {
  if (deferredSrc === null) return { attach: false };
  if (deferredSrc === attachedSrc) return { attach: false };
  return { attach: true, src: deferredSrc };
}

/*
 * LOT 04 -- what `syncSource` must do with the media element's source.
 *
 * Two invariants the drift route depends on, and one that every route does:
 *  - an IDLE ambient on /drift is never attached (no `src`, therefore no
 *    request) and an already-attached source is never torn off;
 *  - an ambient that is ALREADY PLAYING when the route changes is left exactly
 *    as it is: re-assigning `src` or calling `load()` would reset
 *    `currentTime` to zero and cut the sound mid-playback;
 *  - a genuinely different source is attached and loaded, as before.
 */
export type AudioSourcePlan =
  | { action: "defer"; src: string }
  | { action: "keep" }
  | { action: "attach"; src: string };

export function planAudioSourceAttachment({
  suppressIdleAmbient,
  attachedSrc,
  nextSrc,
}: {
  suppressIdleAmbient: boolean;
  attachedSrc: string | null;
  nextSrc: string;
}): AudioSourcePlan {
  if (suppressIdleAmbient) return { action: "defer", src: nextSrc };
  if (attachedSrc === nextSrc) return { action: "keep" };
  return { action: "attach", src: nextSrc };
}
