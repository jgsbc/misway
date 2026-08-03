import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DRIFT_3D_ROUTE_WAYPOINTS,
  checkDrift3DMacroWorldBoundary,
  getDrift3DMacroWorldRouteProjection,
  getDrift3DMacroWorldRouteTotalLength,
  getDrift3DRouteProgressIssues,
} from "@/lib/drift3dMacroWorldRoute";
import { getDrift3DMacroWorldConfig } from "@/lib/drift3dMacroWorldConfig";

test("route has exactly 5 waypoints matching the canonical order", () => {
  assert.equal(DRIFT_3D_ROUTE_WAYPOINTS.length, 5);
  assert.deepEqual(
    DRIFT_3D_ROUTE_WAYPOINTS.map((w) => w.worldId),
    ["entry", "birth-yard", "older-shadows", "vegetative-field", "new-signal"]
  );
  assert.equal(DRIFT_3D_ROUTE_WAYPOINTS[0].cumulativeDistance, 0);
  assert.ok(getDrift3DMacroWorldRouteTotalLength() > 0);
});

test("route progress is deterministic: same position always yields the same projection", () => {
  const point = { x: -80, z: 18 };
  const a = getDrift3DMacroWorldRouteProjection(point);
  const b = getDrift3DMacroWorldRouteProjection(point);

  assert.deepEqual(a, b);
});

test("route progress is 0 exactly at Entry's origin and 1 exactly at New Signal's origin", () => {
  const entry = getDrift3DMacroWorldConfig("entry").localOrigin;
  const newSignal = getDrift3DMacroWorldConfig("new-signal").localOrigin;

  const start = getDrift3DMacroWorldRouteProjection(entry);
  const end = getDrift3DMacroWorldRouteProjection(newSignal);

  assert.ok(Math.abs(start.routeProgress - 0) < 1e-9);
  assert.ok(Math.abs(end.routeProgress - 1) < 1e-9);
});

test("route progress increases monotonically along each waypoint in canonical order", () => {
  const progresses = DRIFT_3D_ROUTE_WAYPOINTS.map(
    (waypoint) => getDrift3DMacroWorldRouteProjection(waypoint.origin).routeProgress
  );

  for (let index = 1; index < progresses.length; index += 1) {
    assert.ok(progresses[index] >= progresses[index - 1]);
  }
});

test("world-boundary check: a world's own origin is always within its boundary", () => {
  const config = getDrift3DMacroWorldConfig("vegetative-field");
  const check = checkDrift3DMacroWorldBoundary(config.localOrigin);

  assert.equal(check.nearestWorld, "vegetative-field");
  assert.equal(check.withinDressingRadius, true);
  assert.equal(check.violatesBoundary, false);
});

test("world-boundary check: a point far from every world and off the route corridor violates the boundary", () => {
  const farAway = { x: 500, z: 500 };
  const check = checkDrift3DMacroWorldBoundary(farAway);

  assert.equal(check.violatesBoundary, true);
});

test("route progress validation catches out-of-bounds and non-finite values", () => {
  assert.deepEqual(getDrift3DRouteProgressIssues(0.5), []);
  assert.ok(
    getDrift3DRouteProgressIssues(1.2).some((issue) => issue.type === "progress-out-of-bounds")
  );
  assert.ok(
    getDrift3DRouteProgressIssues(-0.1).some((issue) => issue.type === "progress-out-of-bounds")
  );
  assert.ok(
    getDrift3DRouteProgressIssues(NaN).some((issue) => issue.type === "progress-non-finite")
  );
});
