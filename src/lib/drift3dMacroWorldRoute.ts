import {
  DRIFT_3D_MACRO_WORLD_ROUTE_ORDER,
  DRIFT_3D_MACRO_WORLDS,
  getDrift3DMacroWorldConfig,
  type Drift3DLocalOrigin,
  type Drift3DMacroWorldId,
} from "@/lib/drift3dMacroWorldConfig";

/**
 * DRIFT-IV-PRE-40 — pure route/position math for the one continuous
 * five-macro-world greybox drive. No Three.js import. Builds a
 * piecewise-linear route through the five macro-worlds' own local origins
 * (in canonical order) and answers two deterministic questions from any
 * given (x, z): "how far along the whole route is this point?" and "which
 * macro-world (if any) does this point belong to?"
 */

export type Drift3DRouteWaypoint = Readonly<{
  worldId: Drift3DMacroWorldId;
  origin: Drift3DLocalOrigin;
  /** Cumulative distance from the route start (entry) to this waypoint. */
  cumulativeDistance: number;
}>;

function buildWaypoints(): readonly Drift3DRouteWaypoint[] {
  const waypoints: Drift3DRouteWaypoint[] = [];
  let cumulative = 0;

  for (let index = 0; index < DRIFT_3D_MACRO_WORLD_ROUTE_ORDER.length; index += 1) {
    const worldId = DRIFT_3D_MACRO_WORLD_ROUTE_ORDER[index];
    const origin = getDrift3DMacroWorldConfig(worldId).localOrigin;

    if (index > 0) {
      const previous = waypoints[index - 1];
      cumulative += Math.hypot(
        origin.x - previous.origin.x,
        origin.z - previous.origin.z
      );
    }

    waypoints.push({ worldId, origin, cumulativeDistance: cumulative });
  }

  return Object.freeze(waypoints);
}

export const DRIFT_3D_ROUTE_WAYPOINTS: readonly Drift3DRouteWaypoint[] =
  buildWaypoints();

export function getDrift3DMacroWorldRouteTotalLength(): number {
  return DRIFT_3D_ROUTE_WAYPOINTS[DRIFT_3D_ROUTE_WAYPOINTS.length - 1]
    .cumulativeDistance;
}

export type Drift3DRoutePoint = Readonly<{ x: number; z: number }>;

export type Drift3DRouteProjection = Readonly<{
  segmentIndex: number;
  fromWorld: Drift3DMacroWorldId;
  toWorld: Drift3DMacroWorldId;
  /** 0..1 within this segment. */
  segmentT: number;
  /** Perpendicular distance from the query point to the route polyline. */
  lateralDistance: number;
  /** 0..1 overall progress from Entry (0) to New Signal's endpoint (1). */
  routeProgress: number;
}>;

function projectOntoSegment(
  point: Drift3DRoutePoint,
  a: Drift3DLocalOrigin,
  b: Drift3DLocalOrigin
) {
  const dx = b.x - a.x;
  const dz = b.z - a.z;
  const lengthSquared = dx * dx + dz * dz;
  const t =
    lengthSquared === 0
      ? 0
      : Math.min(
          1,
          Math.max(
            0,
            ((point.x - a.x) * dx + (point.z - a.z) * dz) / lengthSquared
          )
        );
  const projectedX = a.x + dx * t;
  const projectedZ = a.z + dz * t;
  const lateralDistance = Math.hypot(point.x - projectedX, point.z - projectedZ);

  return { t, lateralDistance };
}

/**
 * Deterministic: the same (x, z) always yields the same projection. Finds
 * the nearest of the four route segments (by perpendicular distance) and
 * reports overall route progress as a pure function of position — no
 * per-frame accumulated state, so a teleport/reset reconstructs progress
 * correctly from position alone.
 */
export function getDrift3DMacroWorldRouteProjection(
  point: Drift3DRoutePoint
): Drift3DRouteProjection {
  const totalLength = getDrift3DMacroWorldRouteTotalLength();
  let best: Drift3DRouteProjection | null = null;

  for (let index = 0; index < DRIFT_3D_ROUTE_WAYPOINTS.length - 1; index += 1) {
    const from = DRIFT_3D_ROUTE_WAYPOINTS[index];
    const to = DRIFT_3D_ROUTE_WAYPOINTS[index + 1];
    const { t, lateralDistance } = projectOntoSegment(
      point,
      from.origin,
      to.origin
    );
    const segmentLength = to.cumulativeDistance - from.cumulativeDistance;
    const distanceAlong = from.cumulativeDistance + t * segmentLength;
    const routeProgress = totalLength === 0 ? 0 : distanceAlong / totalLength;

    if (!best || lateralDistance < best.lateralDistance) {
      best = {
        segmentIndex: index,
        fromWorld: from.worldId,
        toWorld: to.worldId,
        segmentT: t,
        lateralDistance,
        routeProgress,
      };
    }
  }

  // DRIFT_3D_MACRO_WORLD_ROUTE_ORDER always has exactly 5 entries (validated
  // by drift3dMacroWorldConfig's own canonical-issue checks), so `best` is
  // never null in practice; this satisfies the type checker without lying
  // about a runtime possibility this module doesn't actually allow.
  return (
    best ?? {
      segmentIndex: 0,
      fromWorld: DRIFT_3D_MACRO_WORLD_ROUTE_ORDER[0],
      toWorld: DRIFT_3D_MACRO_WORLD_ROUTE_ORDER[1],
      segmentT: 0,
      lateralDistance: 0,
      routeProgress: 0,
    }
  );
}

export type Drift3DWorldBoundaryCheck = Readonly<{
  nearestWorld: Drift3DMacroWorldId;
  distanceToNearestOrigin: number;
  withinDressingRadius: boolean;
  withinRouteCorridor: boolean;
  violatesBoundary: boolean;
}>;

/** Route corridor half-width — how far off the direct path is still "on route." */
const ROUTE_CORRIDOR_HALF_WIDTH = 24;

/**
 * A position is valid if it sits within its nearest macro-world's own
 * dressing radius, OR within the route corridor connecting two consecutive
 * worlds. Anything else counts as a world-boundary violation (used by the
 * dev harness's `worldBoundaryViolationCount`).
 */
export function checkDrift3DMacroWorldBoundary(
  point: Drift3DRoutePoint
): Drift3DWorldBoundaryCheck {
  let nearestWorld: Drift3DMacroWorldId = DRIFT_3D_MACRO_WORLDS[0].id;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const world of DRIFT_3D_MACRO_WORLDS) {
    const distance = Math.hypot(
      point.x - world.localOrigin.x,
      point.z - world.localOrigin.z
    );

    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestWorld = world.id;
    }
  }

  const nearestConfig = getDrift3DMacroWorldConfig(nearestWorld);
  const withinDressingRadius = nearestDistance <= nearestConfig.dressingRadius;
  const projection = getDrift3DMacroWorldRouteProjection(point);
  const withinRouteCorridor =
    projection.lateralDistance <= ROUTE_CORRIDOR_HALF_WIDTH;

  return {
    nearestWorld,
    distanceToNearestOrigin: nearestDistance,
    withinDressingRadius,
    withinRouteCorridor,
    violatesBoundary: !withinDressingRadius && !withinRouteCorridor,
  };
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export type Drift3DRouteProgressIssueType =
  | "progress-out-of-bounds"
  | "progress-non-finite";

export type Drift3DRouteProgressIssue = Readonly<{
  type: Drift3DRouteProgressIssueType;
  message: string;
}>;

/** Validates that a computed route progress value is a finite number in [0, 1]. */
export function getDrift3DRouteProgressIssues(
  progress: number
): readonly Drift3DRouteProgressIssue[] {
  const issues: Drift3DRouteProgressIssue[] = [];

  if (!Number.isFinite(progress)) {
    issues.push({
      type: "progress-non-finite",
      message: `Route progress must be a finite number (got ${progress}).`,
    });

    return issues;
  }

  if (progress < 0 || progress > 1) {
    issues.push({
      type: "progress-out-of-bounds",
      message: `Route progress must be within [0, 1] (got ${progress}).`,
    });
  }

  return issues;
}
