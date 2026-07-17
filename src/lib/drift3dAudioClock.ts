/**
 * Shared audio clock service (DRIFT-IV-SYS-00).
 *
 * Framework-agnostic, DOM-agnostic and track-agnostic: it only knows how to
 * turn discrete playback events into a stable, readable timeline snapshot.
 * The caller (AudioPlayerProvider) owns the actual <audio> element and feeds
 * it updates; consumers (Drift3DScene and future Cue Resolvers) only ever
 * read from a snapshot, never reach into the DOM themselves.
 */

export type Drift3DAudioPlaybackState =
  | "idle"
  | "playing"
  | "paused"
  | "seeking"
  | "ended";

export type Drift3DAudioClockSource = {
  kind: "ambient" | "track";
  slug: string;
};

export type Drift3DAudioClockUpdateReason =
  | "init"
  | "source-change"
  | "metadata"
  | "timeupdate"
  | "play"
  | "pause"
  | "seeking"
  | "seek"
  | "restart"
  | "loop"
  | "ended"
  | "rate-change";

export type Drift3DAudioClockSnapshot = {
  source: Drift3DAudioClockSource;
  playbackState: Drift3DAudioPlaybackState;
  anchorTimeSeconds: number;
  durationSeconds: number;
  capturedAtMs: number;
  playbackRate: number;
  loopEnabled: boolean;
  timelineRevision: number;
  lastReason: Drift3DAudioClockUpdateReason;
};

export type Drift3DAudioClockRef = {
  current: Drift3DAudioClockSnapshot;
};

/** Reasons that represent a temporal discontinuity — the only ones that bump `timelineRevision`. */
const DISCONTINUITY_REASONS: ReadonlySet<Drift3DAudioClockUpdateReason> =
  new Set(["source-change", "seek", "restart", "loop"]);

/** Extrapolation never reaches further than this past the last known anchor. */
export const DRIFT_3D_AUDIO_CLOCK_MAX_EXTRAPOLATION_MS = 500;

export function createDrift3DAudioClockSnapshot(
  source: Drift3DAudioClockSource,
  nowMs: number
): Drift3DAudioClockSnapshot {
  return {
    source,
    playbackState: "idle",
    anchorTimeSeconds: 0,
    durationSeconds: 0,
    capturedAtMs: nowMs,
    playbackRate: 1,
    loopEnabled: false,
    timelineRevision: 0,
    lastReason: "init",
  };
}

/**
 * Pure update: returns a new snapshot, never mutates `previous`. The caller
 * is responsible for assigning the result back onto its stable ref.
 */
export function updateDrift3DAudioClock(
  previous: Drift3DAudioClockSnapshot,
  patch: Partial<
    Omit<Drift3DAudioClockSnapshot, "capturedAtMs" | "timelineRevision" | "lastReason">
  >,
  reason: Drift3DAudioClockUpdateReason,
  nowMs: number
): Drift3DAudioClockSnapshot {
  return {
    ...previous,
    ...patch,
    capturedAtMs: nowMs,
    timelineRevision: DISCONTINUITY_REASONS.has(reason)
      ? previous.timelineRevision + 1
      : previous.timelineRevision,
    lastReason: reason,
  };
}

/**
 * Reads the current playback time. Extrapolates from the last anchor only
 * while playing, bounded to `DRIFT_3D_AUDIO_CLOCK_MAX_EXTRAPOLATION_MS` and
 * clamped to the known duration. Returns a plain number — no allocation.
 */
export function readDrift3DAudioClockTime(
  snapshot: Drift3DAudioClockSnapshot,
  nowMs: number
): number {
  if (snapshot.playbackState !== "playing") {
    return snapshot.anchorTimeSeconds;
  }

  const elapsedMs = Math.max(
    0,
    Math.min(nowMs - snapshot.capturedAtMs, DRIFT_3D_AUDIO_CLOCK_MAX_EXTRAPOLATION_MS)
  );
  const extrapolated =
    snapshot.anchorTimeSeconds + (elapsedMs / 1000) * snapshot.playbackRate;

  if (snapshot.durationSeconds > 0) {
    return Math.min(Math.max(extrapolated, 0), snapshot.durationSeconds);
  }

  return Math.max(extrapolated, 0);
}

export function readDrift3DAudioClockProgress(
  snapshot: Drift3DAudioClockSnapshot,
  nowMs: number
): number {
  if (snapshot.durationSeconds <= 0) {
    return 0;
  }

  return readDrift3DAudioClockTime(snapshot, nowMs) / snapshot.durationSeconds;
}
