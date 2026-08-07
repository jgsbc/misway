import assert from "node:assert/strict";
import test from "node:test";
import {
  DRIFT_3D_PENINSULA_BOUNDS,
  DRIFT_3D_PENINSULA_SPINE,
} from "@/lib/drift3dPeninsula";
import {
  DRIFT_3D_ROUTES,
  getDrift3DRouteField,
} from "@/lib/drift3dRoutes";
import { getDrift3DTerrainHeight } from "@/lib/drift3dTerrain";
import { drift3dRenderableNodes } from "@/lib/drift3dTopology";

const MAX_ROUTE_GRADE = 0.36;

function nearestNodeDistance(x: number, z: number) {
  let nearest = Number.POSITIVE_INFINITY;

  for (const node of drift3dRenderableNodes) {
    nearest = Math.min(
      nearest,
      Math.hypot(x - node.position.x, z - node.position.z)
    );
  }

  return nearest;
}

test("recovered production network exposes the five proven routes", () => {
  assert.deepEqual(
    DRIFT_3D_ROUTES.map((route) => route.id),
    [
      "entry-birth-yard",
      "peninsula-spine",
      "older-shadows-belvedere",
      "vegetative-field-loop",
      "new-signal-headland",
    ]
  );
});

test("all route points are finite and remain inside production bounds", () => {
  for (const route of DRIFT_3D_ROUTES) {
    assert.ok(route.points.length >= 2, `${route.id}: route too short`);

    for (const [x, y, z] of route.points) {
      assert.ok(Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z));
      assert.ok(
        x >= DRIFT_3D_PENINSULA_BOUNDS.minX &&
          x <= DRIFT_3D_PENINSULA_BOUNDS.maxX,
        `${route.id}: x=${x} outside bounds`
      );
      assert.ok(
        z >= DRIFT_3D_PENINSULA_BOUNDS.minZ &&
          z <= DRIFT_3D_PENINSULA_BOUNDS.maxZ,
        `${route.id}: z=${z} outside bounds`
      );
    }
  }
});

test("route grades remain inside the recovered simcade-safe envelope", () => {
  for (const route of DRIFT_3D_ROUTES) {
    for (let index = 1; index < route.points.length; index += 1) {
      const previous = route.points[index - 1];
      const current = route.points[index];
      const horizontal = Math.hypot(
        current[0] - previous[0],
        current[2] - previous[2]
      );

      assert.ok(horizontal > 0, `${route.id}: duplicate route point`);

      const grade = Math.abs(current[1] - previous[1]) / horizontal;
      assert.ok(
        grade <= MAX_ROUTE_GRADE,
        `${route.id}: grade=${grade.toFixed(3)} exceeds ${MAX_ROUTE_GRADE}`
      );
    }
  }
});

test("entry route joins the folded peninsula spine exactly", () => {
  const entryRoute = DRIFT_3D_ROUTES.find(
    (route) => route.id === "entry-birth-yard"
  );

  assert.ok(entryRoute);
  assert.deepEqual(
    entryRoute.points[entryRoute.points.length - 1],
    DRIFT_3D_PENINSULA_SPINE[0]
  );
});

test("all lateral routes start on the canonical spine", () => {
  const lateralRouteIds = new Set([
    "older-shadows-belvedere",
    "vegetative-field-loop",
    "new-signal-headland",
  ]);

  for (const route of DRIFT_3D_ROUTES) {
    if (!lateralRouteIds.has(route.id)) {
      continue;
    }

    const start = route.points[0];
    assert.ok(
      DRIFT_3D_PENINSULA_SPINE.some(
        (point) => point[0] === start[0] && point[1] === start[1] && point[2] === start[2]
      ),
      `${route.id}: branch no longer starts on spine`
    );
  }
});

test("route field reports zero edge distance on authored centerlines", () => {
  for (const route of DRIFT_3D_ROUTES) {
    for (const [x, , z] of route.points) {
      const field = getDrift3DRouteField(x, z);

      assert.ok(Number.isFinite(field.altitude));
      assert.ok(field.distance <= 1e-9, `${route.id}: distance=${field.distance}`);
    }
  }
});

test("terrain converges exactly to route authority away from authored node pads", () => {
  let checked = 0;

  for (const route of DRIFT_3D_ROUTES) {
    for (const [x, , z] of route.points) {
      if (nearestNodeDistance(x, z) <= 12) {
        continue;
      }

      const field = getDrift3DRouteField(x, z);
      const terrain = getDrift3DTerrainHeight(x, z);

      assert.ok(
        Math.abs(terrain - field.altitude) <= 1e-7,
        `${route.id}: terrain=${terrain}, route=${field.altitude}`
      );
      checked += 1;
    }
  }

  assert.ok(checked > 20, `insufficient route/terrain samples: ${checked}`);
});

test("route field is deterministic", () => {
  for (const route of DRIFT_3D_ROUTES) {
    const middle = route.points[Math.floor(route.points.length / 2)];
    const first = getDrift3DRouteField(middle[0] + 7.25, middle[2] - 3.5);
    const second = getDrift3DRouteField(middle[0] + 7.25, middle[2] - 3.5);

    assert.deepEqual(first, second);
  }
});
