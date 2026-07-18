/**
 * Shared scene lifecycle service (DRIFT-IV-SYS-10).
 *
 * Framework-agnostic, DOM-agnostic and track-agnostic: it only knows how to
 * turn discrete lifecycle events into a stable, readable state snapshot. The
 * caller (Drift3DCanvas) owns the actual mount/visibility/route wiring and
 * feeds it events; consumers only ever read a snapshot, never mutate it.
 *
 * This module knows nothing about tracks, cues, phases or signatures — it is
 * the generic scaffolding a future Cue Resolver (DRIFT-IV-SYS-20) will sit
 * on top of, not a replacement for it.
 */

export type Drift3DSceneLifecycleState =
  | "UNMOUNTED"
  | "IDLE"
  | "ACTIVE"
  | "PAUSED"
  | "RESETTING";

export type Drift3DSceneLifecycleEvent =
  | "mount"
  | "activate"
  | "pause"
  | "resume"
  | "reset"
  | "reset-complete"
  | "unmount";

export type Drift3DSceneResetReason =
  | "route-unmount"
  | "fallback"
  | "manual"
  | "zone-exit"
  | "source-change"
  | "track-restart"
  | "loop";

export type Drift3DSceneLifecycleSnapshot = {
  state: Drift3DSceneLifecycleState;
  previousState: Drift3DSceneLifecycleState | null;
  lifecycleRevision: number;
  mountRevision: number;
  resetRevision: number;
  lastEvent: Drift3DSceneLifecycleEvent | "init";
  lastResetReason: Drift3DSceneResetReason | null;
  changedAtMs: number;
};

export type Drift3DSceneLifecycleRef = {
  current: Drift3DSceneLifecycleSnapshot;
};

/**
 * Valid target state per (current state, event) pair. `null` means the event
 * is invalid from that state — a deterministic no-op, never an exception.
 * Reproduces the canonical matrix exactly:
 *
 *   UNMOUNTED + mount            -> IDLE
 *   IDLE + activate              -> ACTIVE
 *   PAUSED + resume              -> ACTIVE
 *   ACTIVE + pause               -> PAUSED
 *   IDLE/ACTIVE/PAUSED + reset   -> RESETTING
 *   RESETTING + reset-complete   -> IDLE
 *   any mounted state + unmount  -> UNMOUNTED
 */
function resolveNextState(
  current: Drift3DSceneLifecycleState,
  event: Drift3DSceneLifecycleEvent
): Drift3DSceneLifecycleState | null {
  switch (current) {
    case "UNMOUNTED":
      return event === "mount" ? "IDLE" : null;

    case "IDLE":
      if (event === "activate") return "ACTIVE";
      if (event === "reset") return "RESETTING";
      if (event === "unmount") return "UNMOUNTED";
      return null;

    case "ACTIVE":
      if (event === "pause") return "PAUSED";
      if (event === "reset") return "RESETTING";
      if (event === "unmount") return "UNMOUNTED";
      return null;

    case "PAUSED":
      if (event === "resume") return "ACTIVE";
      if (event === "reset") return "RESETTING";
      if (event === "unmount") return "UNMOUNTED";
      return null;

    case "RESETTING":
      if (event === "reset-complete") return "IDLE";
      if (event === "unmount") return "UNMOUNTED";
      return null;
  }
}

export function createDrift3DSceneLifecycleSnapshot(
  nowMs: number
): Drift3DSceneLifecycleSnapshot {
  return {
    state: "UNMOUNTED",
    previousState: null,
    lifecycleRevision: 0,
    mountRevision: 0,
    resetRevision: 0,
    lastEvent: "init",
    lastResetReason: null,
    changedAtMs: nowMs,
  };
}

/**
 * Pure transition: returns a new snapshot, never mutates `previous`. A
 * repeated or invalid event (including a `reset` without a `resetReason`)
 * is a deterministic no-op that returns `previous` unchanged — no exception,
 * no partial state.
 */
export function transitionDrift3DSceneLifecycle(
  previous: Drift3DSceneLifecycleSnapshot,
  event: Drift3DSceneLifecycleEvent,
  nowMs: number,
  resetReason?: Drift3DSceneResetReason
): Drift3DSceneLifecycleSnapshot {
  if (event === "reset" && resetReason === undefined) {
    return previous;
  }

  const nextState = resolveNextState(previous.state, event);

  if (nextState === null) {
    return previous;
  }

  const isMount = event === "mount" && previous.state === "UNMOUNTED";
  const isReset = event === "reset" && nextState === "RESETTING";

  return {
    state: nextState,
    previousState: previous.state,
    lifecycleRevision: previous.lifecycleRevision + 1,
    mountRevision: isMount
      ? previous.mountRevision + 1
      : previous.mountRevision,
    resetRevision: isReset
      ? previous.resetRevision + 1
      : previous.resetRevision,
    lastEvent: event,
    lastResetReason: isReset
      ? (resetReason ?? previous.lastResetReason)
      : previous.lastResetReason,
    changedAtMs: nowMs,
  };
}
