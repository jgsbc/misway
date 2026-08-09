import assert from "node:assert/strict";
import test from "node:test";
import * as THREE from "three";
import {
  buildDrift3DOriginalVehicle,
  getDrift3DOriginalVehicleGeometryStats,
} from "./drift3dOriginalVehicleGeometry";

test("VEH-B01 builds a complete renderable expedition 4x4 without an external asset", () => {
  const root = buildDrift3DOriginalVehicle();
  const stats = getDrift3DOriginalVehicleGeometryStats(root);

  assert.ok(stats.meshCount > 120);
  assert.ok(stats.triangleCount > 8_000);
  assert.ok(stats.triangleCount < 60_000);
  assert.ok(stats.size.x > 1.9 && stats.size.x < 2.2);
  assert.ok(stats.size.y > 2.0 && stats.size.y < 2.4);
  assert.ok(stats.size.z > 4.5 && stats.size.z < 4.9);

  for (const required of [
    "body_shell",
    "cabin_glasshouse",
    "roof",
    "hood",
    "tire_0",
    "rear_spare_tire",
    "rack_left",
    "snorkel_vertical",
    "bull_top",
  ]) {
    assert.ok(root.getObjectByName(required), `missing ${required}`);
  }

  const body = root.getObjectByName("body_shell") as THREE.Mesh;
  assert.ok(body.isMesh);
  assert.equal(body.geometry.type, "BufferGeometry");
  assert.ok(body.geometry.getAttribute("position").count > 100);

  const materialNames = new Set<string>();
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of materials) materialNames.add(material.name);
  });
  assert.ok(materialNames.has("MISWAY_SAFARI_SAND"));
  assert.ok(materialNames.has("SMOKED_GLASS"));
  assert.ok(materialNames.has("ALL_TERRAIN_RUBBER"));
});
