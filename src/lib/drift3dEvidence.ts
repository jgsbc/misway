/**
 * Generic evidence/performance harness contract (DRIFT-IV-SYS-70).
 *
 * Framework-agnostic, DOM-agnostic, track-agnostic, slug-agnostic,
 * cue-agnostic, scene-agnostic and quality-tier-agnostic: no React import,
 * no Three.js import, no direct `window` / `document` / `navigator` /
 * `performance` / `requestAnimationFrame` access anywhere in this module —
 * every timestamp, frame count and visibility value is supplied by the
 * caller. This module only MEASURES and RECORDS: it never decides what to
 * change, never selects a Quality Tier, never pilots reduced-motion or the
 * no-WebGL path, never triggers a track, never imposes an FPS threshold and
 * never declares an artistic pass/fail. A raw measurement (e.g.
 * `frameCount=532, elapsedMs=10532, fps=50.51...`) is a runtime fact; a
 * claim like "performance is good" is interpretation and does not belong
 * here.
 *
 * Keeps no module-scope mutable state and performs no allocation on a hot
 * path: the only mutable state is the caller-owned `Drift3DEvidenceRuntimeRef`
 * passed into these functions, and every value this module RETURNS is
 * frozen.
 */

export type Drift3DEvidenceClassification =
  | "MEASURED"
  | "INFERRED_FROM_REPRESENTATIVE_SAMPLE"
  | "AUTOMATED_STRUCTURAL_EVIDENCE"
  | "KNOWN_ENVIRONMENT_LIMITATION";

export const DRIFT_3D_EVIDENCE_CLASSIFICATIONS: readonly Drift3DEvidenceClassification[] =
  Object.freeze([
    "MEASURED",
    "INFERRED_FROM_REPRESENTATIVE_SAMPLE",
    "AUTOMATED_STRUCTURAL_EVIDENCE",
    "KNOWN_ENVIRONMENT_LIMITATION",
  ]);

/** Exactly the four canonical classifications above — no fifth value. */
export function isDrift3DEvidenceClassification(
  value: unknown
): value is Drift3DEvidenceClassification {
  return (
    typeof value === "string" &&
    (DRIFT_3D_EVIDENCE_CLASSIFICATIONS as readonly string[]).includes(value)
  );
}

export type Drift3DRenderMetrics = Readonly<{
  drawCalls: number;
  triangles: number;
}>;

export type Drift3DViewportMetrics = Readonly<{
  width: number;
  height: number;
  dpr: number;
}>;

export type Drift3DVisibilityState = "visible" | "hidden";

export type Drift3DPerformanceSnapshot = Readonly<{
  canvasPresent: boolean;
  cumulativeFrameCount: number;
  render: Drift3DRenderMetrics | null;
  viewport: Drift3DViewportMetrics | null;
  visibility: Drift3DVisibilityState;
}>;

/**
 * Widened candidate shape accepted by the validator below, so a
 * deliberately broken fixture (used only to prove detection) can be built
 * without lying about what a real snapshot's fields are typed as.
 */
export type Drift3DPerformanceSnapshotCandidate = Readonly<{
  canvasPresent: unknown;
  cumulativeFrameCount: unknown;
  render: unknown;
  viewport: unknown;
  visibility: unknown;
}>;

export type Drift3DFpsSampleToken = Readonly<{
  startedAtMs: number;
  startedFrameCount: number;
}>;

export type Drift3DFpsSample = Readonly<{
  frameCount: number;
  elapsedMs: number;
  fps: number;
}>;

export type Drift3DFpsSampleCandidate = Readonly<{
  frameCount: unknown;
  elapsedMs: unknown;
  fps: unknown;
}>;

/**
 * Mutable, caller-owned container. Not frozen (it is written every frame by
 * a frame probe) — every value this module RETURNS from it is frozen, but
 * the ref itself stays a plain mutable object by design.
 */
export type Drift3DEvidenceRuntimeRef = {
  current: {
    canvasPresent: boolean;
    cumulativeFrameCount: number;
    drawCalls: number | null;
    triangles: number | null;
    width: number | null;
    height: number | null;
    dpr: number | null;
  };
};

export function createDrift3DEvidenceRuntimeRef(): Drift3DEvidenceRuntimeRef {
  return {
    current: {
      canvasPresent: false,
      cumulativeFrameCount: 0,
      drawCalls: null,
      triangles: null,
      width: null,
      height: null,
      dpr: null,
    },
  };
}

/**
 * `document.visibilityState` translated to the two-value contract used
 * throughout this module. Any value other than the literal string
 * `"visible"` normalizes to `"hidden"` — an unrecognized value must never
 * silently read as foreground.
 */
export function resolveDrift3DEvidenceVisibility(
  rawVisibilityState: string
): Drift3DVisibilityState {
  return rawVisibilityState === "visible" ? "visible" : "hidden";
}

/**
 * Builds a frozen snapshot from the current contents of `runtimeRef` and a
 * caller-supplied visibility value. `canvasPresent=false` always yields
 * `render=null, viewport=null` — a `0` metric is a real measurement, never a
 * substitute for "no Canvas".
 */
export function createDrift3DPerformanceSnapshot(
  runtimeRef: Drift3DEvidenceRuntimeRef,
  visibility: Drift3DVisibilityState
): Drift3DPerformanceSnapshot {
  const state = runtimeRef.current;

  if (!state.canvasPresent) {
    return Object.freeze({
      canvasPresent: false,
      cumulativeFrameCount: state.cumulativeFrameCount,
      render: null,
      viewport: null,
      visibility,
    });
  }

  return Object.freeze({
    canvasPresent: true,
    cumulativeFrameCount: state.cumulativeFrameCount,
    render: Object.freeze({
      drawCalls: state.drawCalls ?? 0,
      triangles: state.triangles ?? 0,
    }),
    viewport: Object.freeze({
      width: state.width ?? 0,
      height: state.height ?? 0,
      dpr: state.dpr ?? 0,
    }),
    visibility,
  });
}

/**
 * `fps = frameCount / (elapsedMs / 1000)`, no rounding. Returns `null`
 * (never `Infinity`, never a silently coerced value) for `elapsedMs<=0`,
 * `NaN`/`Infinity` inputs, or a negative/non-integer `frameCount`.
 */
export function computeDrift3DFps(
  frameCount: number,
  elapsedMs: number
): number | null {
  if (typeof frameCount !== "number" || typeof elapsedMs !== "number") {
    return null;
  }

  if (!Number.isFinite(frameCount) || !Number.isFinite(elapsedMs)) {
    return null;
  }

  if (!Number.isInteger(frameCount) || frameCount < 0) {
    return null;
  }

  if (elapsedMs <= 0) {
    return null;
  }

  const fps = frameCount / (elapsedMs / 1000);

  if (!Number.isFinite(fps)) {
    return null;
  }

  return fps;
}

/**
 * Reads the current cumulative frame count and starts nothing: no timer, no
 * autonomous rAF loop. Frames only ever advance because the R3F frame probe
 * (elsewhere) is already rendering.
 */
export function beginDrift3DFpsSample(
  runtimeRef: Drift3DEvidenceRuntimeRef,
  nowMs: number
): Drift3DFpsSampleToken {
  return Object.freeze({
    startedAtMs: nowMs,
    startedFrameCount: runtimeRef.current.cumulativeFrameCount,
  });
}

/**
 * Reads the current cumulative frame count again and computes the delta
 * against `token`. Returns `null` when the resulting sample would be
 * invalid (e.g. `nowMs <= token.startedAtMs`) rather than fabricating a
 * value.
 */
export function endDrift3DFpsSample(
  runtimeRef: Drift3DEvidenceRuntimeRef,
  token: Drift3DFpsSampleToken,
  nowMs: number
): Drift3DFpsSample | null {
  const frameCount =
    runtimeRef.current.cumulativeFrameCount - token.startedFrameCount;
  const elapsedMs = nowMs - token.startedAtMs;
  const fps = computeDrift3DFps(frameCount, elapsedMs);

  if (fps === null) {
    return null;
  }

  return Object.freeze({ frameCount, elapsedMs, fps });
}

export type Drift3DPerformanceSnapshotIssueType =
  | "canvas-present-not-boolean"
  | "cumulative-frame-count-invalid"
  | "render-null-while-canvas-present"
  | "viewport-null-while-canvas-present"
  | "render-not-null-while-canvas-absent"
  | "viewport-not-null-while-canvas-absent"
  | "draw-calls-invalid"
  | "triangles-invalid"
  | "width-invalid"
  | "height-invalid"
  | "dpr-invalid"
  | "visibility-invalid";

export type Drift3DPerformanceSnapshotIssue = Readonly<{
  type: Drift3DPerformanceSnapshotIssueType;
  message: string;
}>;

function isFiniteNonNegativeInteger(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    Number.isInteger(value) &&
    value >= 0
  );
}

function isPositiveFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

/**
 * Validates a candidate snapshot: non-boolean `canvasPresent`; invalid
 * `cumulativeFrameCount`; a Canvas-present snapshot with a null
 * `render`/`viewport`; a Canvas-absent snapshot with a non-null
 * `render`/`viewport`; invalid `drawCalls`/`triangles`/`width`/`height`/
 * `dpr`; and an invalid `visibility`. Never checks a performance
 * threshold — only structural validity.
 */
export function getDrift3DPerformanceSnapshotIssues(
  snapshot: Drift3DPerformanceSnapshotCandidate
): readonly Drift3DPerformanceSnapshotIssue[] {
  const issues: Drift3DPerformanceSnapshotIssue[] = [];
  const canvasPresent = snapshot.canvasPresent;
  const canvasPresentIsBoolean = typeof canvasPresent === "boolean";

  if (!canvasPresentIsBoolean) {
    issues.push({
      type: "canvas-present-not-boolean",
      message: `canvasPresent must be a boolean (got ${JSON.stringify(canvasPresent)}).`,
    });
  }

  if (!isFiniteNonNegativeInteger(snapshot.cumulativeFrameCount)) {
    issues.push({
      type: "cumulative-frame-count-invalid",
      message: `cumulativeFrameCount must be a finite non-negative integer (got ${JSON.stringify(snapshot.cumulativeFrameCount)}).`,
    });
  }

  const render = snapshot.render;
  const viewport = snapshot.viewport;
  const canvasPresentTrue = canvasPresentIsBoolean && canvasPresent === true;
  const canvasPresentFalse = canvasPresentIsBoolean && canvasPresent === false;

  if (canvasPresentTrue && render === null) {
    issues.push({
      type: "render-null-while-canvas-present",
      message: "render must not be null while canvasPresent is true.",
    });
  }

  if (canvasPresentTrue && viewport === null) {
    issues.push({
      type: "viewport-null-while-canvas-present",
      message: "viewport must not be null while canvasPresent is true.",
    });
  }

  if (canvasPresentFalse && render !== null) {
    issues.push({
      type: "render-not-null-while-canvas-absent",
      message: "render must be null while canvasPresent is false.",
    });
  }

  if (canvasPresentFalse && viewport !== null) {
    issues.push({
      type: "viewport-not-null-while-canvas-absent",
      message: "viewport must be null while canvasPresent is false.",
    });
  }

  if (render !== null && typeof render === "object") {
    const renderRecord = render as Record<string, unknown>;

    if (!isFiniteNonNegativeInteger(renderRecord.drawCalls)) {
      issues.push({
        type: "draw-calls-invalid",
        message: `render.drawCalls must be a finite non-negative integer (got ${JSON.stringify(renderRecord.drawCalls)}).`,
      });
    }

    if (!isFiniteNonNegativeInteger(renderRecord.triangles)) {
      issues.push({
        type: "triangles-invalid",
        message: `render.triangles must be a finite non-negative integer (got ${JSON.stringify(renderRecord.triangles)}).`,
      });
    }
  }

  if (viewport !== null && typeof viewport === "object") {
    const viewportRecord = viewport as Record<string, unknown>;

    if (!isPositiveFiniteNumber(viewportRecord.width)) {
      issues.push({
        type: "width-invalid",
        message: `viewport.width must be a positive finite number (got ${JSON.stringify(viewportRecord.width)}).`,
      });
    }

    if (!isPositiveFiniteNumber(viewportRecord.height)) {
      issues.push({
        type: "height-invalid",
        message: `viewport.height must be a positive finite number (got ${JSON.stringify(viewportRecord.height)}).`,
      });
    }

    if (!isPositiveFiniteNumber(viewportRecord.dpr)) {
      issues.push({
        type: "dpr-invalid",
        message: `viewport.dpr must be a positive finite number (got ${JSON.stringify(viewportRecord.dpr)}).`,
      });
    }
  }

  if (snapshot.visibility !== "visible" && snapshot.visibility !== "hidden") {
    issues.push({
      type: "visibility-invalid",
      message: `visibility must be "visible" or "hidden" (got ${JSON.stringify(snapshot.visibility)}).`,
    });
  }

  return issues;
}

export type Drift3DFpsSampleIssueType =
  | "frame-count-invalid"
  | "elapsed-ms-invalid"
  | "fps-invalid"
  | "fps-inconsistent";

export type Drift3DFpsSampleIssue = Readonly<{
  type: Drift3DFpsSampleIssueType;
  message: string;
}>;

const FPS_CONSISTENCY_TOLERANCE = 0.01;

/**
 * Validates a candidate FPS sample: invalid `frameCount` (negative,
 * fractional, `NaN`, `Infinity`); invalid `elapsedMs` (`<=0`, `NaN`,
 * `Infinity`); invalid `fps` (negative, `NaN`, `Infinity`); and `fps`
 * numerically inconsistent with `frameCount`/`elapsedMs` beyond a small
 * tolerance. Never checks `fps >= 60` or `fps >= 30` — no performance
 * threshold lives here.
 */
export function getDrift3DFpsSampleIssues(
  sample: Drift3DFpsSampleCandidate
): readonly Drift3DFpsSampleIssue[] {
  const issues: Drift3DFpsSampleIssue[] = [];
  const frameCountValid = isFiniteNonNegativeInteger(sample.frameCount);

  if (!frameCountValid) {
    issues.push({
      type: "frame-count-invalid",
      message: `frameCount must be a finite non-negative integer (got ${JSON.stringify(sample.frameCount)}).`,
    });
  }

  const elapsedMs = sample.elapsedMs;
  const elapsedMsValid =
    typeof elapsedMs === "number" && Number.isFinite(elapsedMs) && elapsedMs > 0;

  if (!elapsedMsValid) {
    issues.push({
      type: "elapsed-ms-invalid",
      message: `elapsedMs must be a finite number greater than 0 (got ${JSON.stringify(elapsedMs)}).`,
    });
  }

  const fps = sample.fps;
  const fpsValid = typeof fps === "number" && Number.isFinite(fps) && fps >= 0;

  if (!fpsValid) {
    issues.push({
      type: "fps-invalid",
      message: `fps must be a finite non-negative number (got ${JSON.stringify(fps)}).`,
    });
  }

  if (frameCountValid && elapsedMsValid && fpsValid) {
    const expectedFps =
      (sample.frameCount as number) / ((elapsedMs as number) / 1000);

    if (Math.abs(expectedFps - (fps as number)) > FPS_CONSISTENCY_TOLERANCE) {
      issues.push({
        type: "fps-inconsistent",
        message: `fps (${fps}) is inconsistent with frameCount/elapsedMs (expected ${expectedFps}).`,
      });
    }
  }

  return issues;
}
