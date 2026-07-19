/**
 * Generic cue resolver harness (DRIFT-IV-SYS-20).
 *
 * Framework-agnostic, DOM-agnostic, track-agnostic and cue-agnostic: it only
 * knows how to resolve a caller-supplied phase timeline against an absolute
 * time. It never remembers a previous phase, never accumulates progress and
 * never mutates anything — resolving the same absolute time always produces
 * the same result, whether that time was reached by continuous playback, a
 * seek, a restart, a loop wrap or a source change. This is the property a
 * future track-local resolver (one definition/resolution unit per track,
 * with the concrete file location decided by the first proven track Build)
 * will build on; this module carries no track, slug or narrative-phase
 * vocabulary of its own.
 */

import {
  readDrift3DAudioClockTime,
  type Drift3DAudioClockSnapshot,
  type Drift3DAudioPlaybackState,
} from "@/lib/drift3dAudioClock";

export type Drift3DCuePhase<TPhaseId extends string = string> = Readonly<{
  id: TPhaseId;
  startTimeSeconds: number;
  endTimeSeconds: number;
}>;

export type Drift3DCueResolution<TPhaseId extends string = string> = Readonly<{
  phaseId: TPhaseId | null;
  phaseIndex: number;

  absoluteTimeSeconds: number;
  durationSeconds: number;

  phaseStartTimeSeconds: number | null;
  phaseEndTimeSeconds: number | null;

  phaseProgress: number;
  timelineProgress: number;

  isBeforeFirstPhase: boolean;
  isAfterLastPhase: boolean;
}>;

export type Drift3DCueClockResolution<TPhaseId extends string = string> =
  Drift3DCueResolution<TPhaseId> &
    Readonly<{
      sourceKind: "ambient" | "track";
      sourceSlug: string;
      playbackState: Drift3DAudioPlaybackState;
      timelineRevision: number;
    }>;

export type Drift3DCueTimelineIssueType =
  | "empty-id"
  | "duplicate-id"
  | "non-finite-boundary"
  | "negative-start"
  | "end-not-after-start"
  | "unsorted"
  | "overlap";

export type Drift3DCueTimelineIssue = Readonly<{
  type: Drift3DCueTimelineIssueType;
  phaseIndex: number;
  message: string;
}>;

function clamp01(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(1, Math.max(0, value));
}

/**
 * Validates a timeline definition: empty/duplicate ids, non-finite or
 * negative boundaries, an end not strictly after its start, an unsorted
 * order, or overlapping phases. Gaps between phases are allowed and never
 * reported. Intended for authoring a cue map, tests, development and
 * acceptance — the hot resolver below assumes an already-validated timeline
 * and does not re-validate it on every call.
 */
export function getDrift3DCueTimelineIssues<TPhaseId extends string = string>(
  phases: readonly Drift3DCuePhase<TPhaseId>[]
): readonly Drift3DCueTimelineIssue[] {
  const issues: Drift3DCueTimelineIssue[] = [];
  const seenIds = new Set<string>();

  phases.forEach((phase, index) => {
    if (phase.id.trim().length === 0) {
      issues.push({
        type: "empty-id",
        phaseIndex: index,
        message: `Phase at index ${index} has an empty id.`,
      });
    } else if (seenIds.has(phase.id)) {
      issues.push({
        type: "duplicate-id",
        phaseIndex: index,
        message: `Phase id "${phase.id}" is duplicated at index ${index}.`,
      });
    } else {
      seenIds.add(phase.id);
    }

    if (
      !Number.isFinite(phase.startTimeSeconds) ||
      !Number.isFinite(phase.endTimeSeconds)
    ) {
      issues.push({
        type: "non-finite-boundary",
        phaseIndex: index,
        message: `Phase "${phase.id}" at index ${index} has a non-finite boundary.`,
      });
      return;
    }

    if (phase.startTimeSeconds < 0) {
      issues.push({
        type: "negative-start",
        phaseIndex: index,
        message: `Phase "${phase.id}" at index ${index} has a negative start time.`,
      });
    }

    if (phase.endTimeSeconds <= phase.startTimeSeconds) {
      issues.push({
        type: "end-not-after-start",
        phaseIndex: index,
        message: `Phase "${phase.id}" at index ${index} has endTimeSeconds <= startTimeSeconds.`,
      });
    }

    if (index === 0) {
      return;
    }

    const previous = phases[index - 1];

    if (
      Number.isFinite(previous.startTimeSeconds) &&
      phase.startTimeSeconds < previous.startTimeSeconds
    ) {
      issues.push({
        type: "unsorted",
        phaseIndex: index,
        message: `Phase "${phase.id}" at index ${index} starts before the previous phase — the timeline must be sorted by startTimeSeconds.`,
      });
    } else if (
      Number.isFinite(previous.endTimeSeconds) &&
      phase.startTimeSeconds < previous.endTimeSeconds
    ) {
      issues.push({
        type: "overlap",
        phaseIndex: index,
        message: `Phase "${phase.id}" at index ${index} overlaps the previous phase.`,
      });
    }
  });

  return issues;
}

function resolveEffectiveDurationSeconds<TPhaseId extends string>(
  phases: readonly Drift3DCuePhase<TPhaseId>[],
  durationSeconds: number
): number {
  if (Number.isFinite(durationSeconds) && durationSeconds > 0) {
    return durationSeconds;
  }

  const last = phases[phases.length - 1];

  if (last && Number.isFinite(last.endTimeSeconds)) {
    return last.endTimeSeconds;
  }

  return 0;
}

/**
 * Intermediate phases use a half-open interval `[start, end)`. The last
 * phase alone also accepts its exact `endTimeSeconds` (a closed interval),
 * so `phaseProgress` reaches exactly `1` at the precise end of a track
 * instead of falsely reporting a gap during that final instant.
 */
function findDrift3DCuePhaseIndex<TPhaseId extends string>(
  phases: readonly Drift3DCuePhase<TPhaseId>[],
  absoluteTimeSeconds: number
): number {
  for (let index = 0; index < phases.length; index += 1) {
    const phase = phases[index];
    const isLastPhase = index === phases.length - 1;
    const withinPhase = isLastPhase
      ? absoluteTimeSeconds >= phase.startTimeSeconds &&
        absoluteTimeSeconds <= phase.endTimeSeconds
      : absoluteTimeSeconds >= phase.startTimeSeconds &&
        absoluteTimeSeconds < phase.endTimeSeconds;

    if (withinPhase) {
      return index;
    }
  }

  return -1;
}

/**
 * Pure: `f(timeline, absoluteTime)`, never `f(previousState, deltaTime)`.
 * Resolving the same `absoluteTimeSeconds` always returns the same result —
 * no previous phase, no accumulated progress and no mutable cursor are ever
 * kept between calls.
 */
export function resolveDrift3DCueAtTime<TPhaseId extends string = string>(
  phases: readonly Drift3DCuePhase<TPhaseId>[],
  absoluteTimeSeconds: number,
  durationSeconds: number
): Drift3DCueResolution<TPhaseId> {
  const safeTimeSeconds = Number.isFinite(absoluteTimeSeconds)
    ? Math.max(0, absoluteTimeSeconds)
    : 0;
  const effectiveDurationSeconds = resolveEffectiveDurationSeconds(
    phases,
    durationSeconds
  );
  const phaseIndex = findDrift3DCuePhaseIndex(phases, safeTimeSeconds);
  const phase = phaseIndex >= 0 ? phases[phaseIndex] : null;

  const isBeforeFirstPhase =
    phases.length > 0 && safeTimeSeconds < phases[0].startTimeSeconds;
  const isAfterLastPhase =
    phases.length > 0 &&
    safeTimeSeconds > phases[phases.length - 1].endTimeSeconds;

  const phaseProgress = phase
    ? clamp01(
        (safeTimeSeconds - phase.startTimeSeconds) /
          (phase.endTimeSeconds - phase.startTimeSeconds)
      )
    : 0;

  const timelineProgress =
    effectiveDurationSeconds > 0
      ? clamp01(safeTimeSeconds / effectiveDurationSeconds)
      : 0;

  return {
    phaseId: phase ? phase.id : null,
    phaseIndex,
    absoluteTimeSeconds: safeTimeSeconds,
    durationSeconds: effectiveDurationSeconds,
    phaseStartTimeSeconds: phase ? phase.startTimeSeconds : null,
    phaseEndTimeSeconds: phase ? phase.endTimeSeconds : null,
    phaseProgress,
    timelineProgress,
    isBeforeFirstPhase,
    isAfterLastPhase,
  };
}

/**
 * Reads the absolute time from the shared audio clock snapshot and resolves
 * the timeline from it. `timelineRevision` is exposed as-is from the
 * snapshot — it is never consulted to decide *how* to resolve (this
 * function always reconstructs directly from absolute time); it exists so a
 * future consumer can tell a logical discontinuity (seek/restart/loop/
 * source-change) happened and invalidate any local cache of its own.
 */
export function resolveDrift3DCueFromAudioClock<TPhaseId extends string = string>(
  phases: readonly Drift3DCuePhase<TPhaseId>[],
  snapshot: Drift3DAudioClockSnapshot,
  nowMs: number
): Drift3DCueClockResolution<TPhaseId> {
  const absoluteTimeSeconds = readDrift3DAudioClockTime(snapshot, nowMs);
  const resolution = resolveDrift3DCueAtTime(
    phases,
    absoluteTimeSeconds,
    snapshot.durationSeconds
  );

  return {
    ...resolution,
    sourceKind: snapshot.source.kind,
    sourceSlug: snapshot.source.slug,
    playbackState: snapshot.playbackState,
    timelineRevision: snapshot.timelineRevision,
  };
}
