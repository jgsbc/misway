import assert from "node:assert/strict";
import test from "node:test";
import {
  DRIFT_3D_INSPECTOR_TELEPORTS,
  createDrift3DInspectorSnapshot,
  getDrift3DInspectorTeleportTarget,
} from "@/lib/drift3dInspector";
import {
  DRIFT_3D_PENINSULA_BOUNDS,
  getDrift3DPeninsulaEraAt,
} from "@/lib/drift3dPeninsula";
import { getDrift3DRouteField } from "@/lib/drift3dRoutes";
import { getDrift3DTopologyProximity } from "@/lib/drift3dTopology";
import { getDrift3DWaterDepth } from "@/lib/drift3dWater";
import { createDrift3DVehiclePhysicsState } from "@/lib/drift3dVehiclePhysics";

test("World Inspector exposes one safe teleport for Entry and each era", () => {
  assert.deepEqual(
    DRIFT_3D_INSPECTOR_TELEPORTS.map((target) => target.id),
    [
      "entry",
      "birth-yard",
      "older-shadows",
      "vegetative-field",
      "new-signal",
    ]
  );
});

test("all inspector teleports are finite, in bounds, dry and aligned to the route network", () => {
  for (const target of DRIFT_3D_INSPECTOR_TELEPORTS) {
    assert.ok(Number.isFinite(target.x));
    assert.ok(Number.isFinite(target.y));
    assert.ok(Number.isFinite(target.z));
    assert.ok(Number.isFinite(target.heading));
    assert.ok(target.x >= DRIFT_3D_PENINSULA_BOUNDS.minX);
    assert.ok(target.x <= DRIFT_3D_PENINSULA_BOUNDS.maxX);
    assert.ok(target.z >= DRIFT_3D_PENINSULA_BOUNDS.minZ);
    assert.ok(target.z <= DRIFT_3D_PENINSULA_BOUNDS.maxZ);
    assert.equal(getDrift3DWaterDepth(target.x, target.z), 0, `${target.id} is wet`);
    assert.ok(
      getDrift3DRouteField(target.x, target.z).distance <= 1e-9,
      `${target.id} is not on a route centerline`
    );
  }

  const nonZeroHeadings = DRIFT_3D_INSPECTOR_TELEPORTS.filter(
    (target) => Math.abs(target.heading) > 1e-6
  );
  const olderShadows = getDrift3DInspectorTeleportTarget("older-shadows");

  assert.ok(nonZeroHeadings.length >= 2, "route teleports still look globally hard-coded to heading 0");
  assert.ok(olderShadows);
  assert.ok(
    Math.abs(olderShadows.heading) > 0.05,
    "Older Shadows must face along its local route rather than the old global heading"
  );
});

test("Vegetative Field teleport samples the era baseline outside track nodes", () => {
  const target = getDrift3DInspectorTeleportTarget("vegetative-field");

  assert.ok(target);
  assert.equal(getDrift3DPeninsulaEraAt(target.x, target.z), "vegetative-field");
  const proximity = getDrift3DTopologyProximity({
    x: target.x,
    y: target.y,
    z: target.z,
  });
  assert.equal(
    proximity.activeNode,
    null,
    "Vegetative Field Inspector teleport must not land inside CHAILK or another track node"
  );
});

test("unknown inspector teleport ids are rejected", () => {
  assert.equal(getDrift3DInspectorTeleportTarget("not-a-place"), null);
});

test("inspector snapshot reads canonical spatial, camera and renderer truth", () => {
  const target = DRIFT_3D_INSPECTOR_TELEPORTS[1];
  const vehicle = createDrift3DVehiclePhysicsState(
    { x: target.x, y: target.y, z: target.z },
    target.heading
  );
  const camera = {
    zoomTarget: 1.25,
    cinematicZoom: 1.1,
    x: 10,
    y: 20,
    z: 30,
    targetX: 11,
    targetY: 12,
    targetZ: 13,
  };
  const snapshot = createDrift3DInspectorSnapshot(
    vehicle,
    null,
    "top-down",
    { drawCalls: 12, triangles: 3456, geometries: 18, textures: 9 },
    camera
  );

  assert.equal(snapshot.viewMode, "top-down");
  assert.equal(snapshot.vehicle.x, target.x);
  assert.equal(snapshot.vehicle.z, target.z);
  assert.equal(snapshot.vehicle.heading, target.heading);
  assert.equal(snapshot.ground.waterDepth, 0);
  assert.ok(snapshot.spatial.routeId);
  assert.deepEqual(snapshot.camera, camera);
  assert.equal(snapshot.render.drawCalls, 12);
  assert.equal(snapshot.render.triangles, 3456);
  assert.deepEqual(snapshot.worldBounds, DRIFT_3D_PENINSULA_BOUNDS);
});
