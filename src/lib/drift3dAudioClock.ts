import type { MutableRefObject } from "react";

export type Drift3DAudioClockSnapshot = {
  trackSlug: string | null;
  sampledTimeSeconds: number;
  durationSeconds: number;
  isPlaying: boolean;
  isLooping: boolean;
  sampledAtMs: number;
  revision: number;
};

export type Drift3DAudioClockRef =
  MutableRefObject<Drift3DAudioClockSnapshot>;

type Drift3DAudioClockUpdate = Omit<
  Drift3DAudioClockSnapshot,
  "sampledAtMs" | "revision"
>;

const MAX_VISUAL_EXTRAPOLATION_MS = 500;
const MAX_PAUSE_SAMPLE_DRIFT_SECONDS = 0.75;

function normalizeSeconds(value: number) {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function clampToDuration(value: number, durationSeconds: number) {
  const normalizedValue = normalizeSeconds(value);
  const normalizedDuration = normalizeSeconds(durationSeconds);

  return normalizedDuration > 0
    ? Math.min(normalizedValue, normalizedDuration)
    : normalizedValue;
}

export function createDrift3DAudioClockSnapshot(): Drift3DAudioClockSnapshot {
  return {
    trackSlug: null,
    sampledTimeSeconds: 0,
    durationSeconds: 0,
    isPlaying: false,
    isLooping: false,
    sampledAtMs: 0,
    revision: 0,
  };
}

export function resolveDrift3DAudioTime(
  snapshot: Drift3DAudioClockSnapshot,
  nowMs: number
) {
  const sampledTime = clampToDuration(
    snapshot.sampledTimeSeconds,
    snapshot.durationSeconds
  );

  if (!snapshot.isPlaying || !Number.isFinite(nowMs)) {
    return sampledTime;
  }

  const elapsedMs = Math.min(
    Math.max(nowMs - snapshot.sampledAtMs, 0),
    MAX_VISUAL_EXTRAPOLATION_MS
  );

  return clampToDuration(
    sampledTime + elapsedMs / 1000,
    snapshot.durationSeconds
  );
}

export function updateDrift3DAudioClockSnapshot(
  snapshot: Drift3DAudioClockSnapshot,
  update: Drift3DAudioClockUpdate,
  sampledAtMs: number
) {
  const safeSampledAtMs = Number.isFinite(sampledAtMs)
    ? sampledAtMs
    : snapshot.sampledAtMs;
  const nextDuration = normalizeSeconds(update.durationSeconds);
  let nextTime = clampToDuration(update.sampledTimeSeconds, nextDuration);

  if (
    snapshot.trackSlug === update.trackSlug &&
    snapshot.isPlaying &&
    !update.isPlaying &&
    Math.abs(nextTime - snapshot.sampledTimeSeconds) <=
      MAX_PAUSE_SAMPLE_DRIFT_SECONDS
  ) {
    nextTime = Math.max(
      nextTime,
      resolveDrift3DAudioTime(snapshot, safeSampledAtMs)
    );
  }

  snapshot.trackSlug = update.trackSlug;
  snapshot.sampledTimeSeconds = clampToDuration(nextTime, nextDuration);
  snapshot.durationSeconds = nextDuration;
  snapshot.isPlaying = update.isPlaying;
  snapshot.isLooping = update.isLooping;
  snapshot.sampledAtMs = safeSampledAtMs;
  snapshot.revision += 1;
}
