import assert from "node:assert/strict";
import test from "node:test";
import {
  DRIFT_3D_INSPECTOR_TELEPORTS,
  createDrift3DInspectorSnapshot,
  getDrift3DInspectorTeleportTarget,
} from "@/lib/drift3dInspector";
import { DRIFT_3D_PENINSULA_BOUNDS } from "@/lib/drift3dPeninsula";
import { getDrift3DRouteField } from "@/lib/drift3dRoutes";
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

test("all inspector teleports are finite, in bounds, dry and on the route network", () => {
  for (const target of DRIFT_3D_INSPECTOR_TELEPORTS) {
    assert.ok(Number.isFinite(target.x));
    assert.ok(Number.isFinite(target.y));
    assert.ok(Number.isFinite(target.z));
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
});

test("unknown inspector teleport ids are rejected", () => {
  assert.equal(getDrift3DInspectorTeleportTarget("not-a-place"), null);
});

test("inspector snapshot reads canonical spatial and renderer truth", () => {
  const target = DRIFT_3D_INSPECTOR_TELEPORTS[1];
  const vehicle = createDrift3DVehiclePhysicsState(
    { x: target.x, y: target.y, z: target.z },
    target.heading
  );
  const snapshot = createDrift3DInspectorSnapshot(
    vehicle,
    null,
    "top-down",
    { drawCalls: 12, triangles: 3456, geometries: 18, textures: 9 }
  );

  assert.equal(snapshot.viewMode, "top-down");
  assert.equal(snapshot.vehicle.x, target.x);
  assert.equal(snapshot.vehicle.z, target.z);
  assert.equal(snapshot.ground.waterDepth, 0);
  assert.ok(snapshot.spatial.routeId);
  assert.equal(snapshot.render.drawCalls, 12);
  assert.equal(snapshot.render.triangles, 3456);
  assert.equal(snapshot.render.geometries, 18);
  assert.equal(snapshot.render.textures, 9);
  assert.deepEqual(snapshot.worldBounds, DRIFT_3D_PENINSULA_BOUNDS);
});
