import assert from "node:assert/strict";
import test from "node:test";
import * as THREE from "three";
import {
  buildDrift3DSafari110FinalVehicle,
  DRIFT_SAFARI_110_RUNTIME_SCALE,
  DRIFT_SAFARI_110_WHEEL_PIVOT_NAMES,
  getDrift3DSafari110FinalGeometryStats,
} from "./drift3dSafari110FinalGeometry";

test("VEH-B03 builds the approved MISWAY Safari 110 visual within realtime bounds", () => {
  const root = buildDrift3DSafari110FinalVehicle();
  const stats = getDrift3DSafari110FinalGeometryStats(root);

  assert.equal(root.name, "MISWAY_SAFARI_110_V2_APPROVED");
  assert.ok(stats.meshCount > 170, `expected detailed vehicle, got ${stats.meshCount} meshes`);
  assert.ok(stats.triangleCount > 10_000, `expected detailed geometry, got ${stats.triangleCount} triangles`);
  assert.ok(stats.triangleCount < 60_000, `vehicle exceeds 60k triangle budget: ${stats.triangleCount}`);
  assert.ok(stats.size.x > 2.0 && stats.size.x < 2.25, `unexpected width ${stats.size.x}`);
  assert.ok(stats.size.y > 2.2 && stats.size.y < 2.5, `unexpected height ${stats.size.y}`);
  assert.ok(stats.size.z > 4.5 && stats.size.z < 5.0, `unexpected length ${stats.size.z}`);

  for (const required of [
    "v2_front_mask",
    "v2_grille_recess",
    "v2_headlamp_ring_-0.57",
    "v2_headlamp_ring_0.57",
    "v2_skid_plate",
    "v2_roof_case_main",
    "v2_canvas_roll_0",
    "v2_rear_lamp_housing_-1",
    "v2_rear_lamp_housing_1",
    "rear_spare_tire",
    "snorkel_vertical",
    "ladder_rail_-0.73",
  ]) {
    assert.ok(root.getObjectByName(required), `missing approved visual system ${required}`);
  }

  const oldGrille = root.getObjectByName("front_grille");
  assert.ok(oldGrille);
  assert.equal(oldGrille.visible, false, "v1 grille must not show through the v2 fascia");

  for (const [index, name] of DRIFT_SAFARI_110_WHEEL_PIVOT_NAMES.entries()) {
    const pivot = root.getObjectByName(name);
    assert.ok(pivot instanceof THREE.Group, `missing wheel pivot ${name}`);
    assert.ok(pivot.getObjectByName(`tire_${index}`), `wheel pivot ${name} must own tire_${index}`);
    assert.ok(pivot.getObjectByName(`wheel_face_${index}`), `wheel pivot ${name} must own its sand steel face`);
  }

  const materialNames = new Set<string>();
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const item of materials) materialNames.add(item.name);
  });
  assert.ok(materialNames.has("MISWAY_SAFARI_SAND"));
  assert.ok(materialNames.has("SAFARI_110_BLACK_COAT"));
  assert.ok(materialNames.has("SAFARI_110_SAND_STEEL"));
  assert.ok(materialNames.has("SAFARI_110_CANVAS"));
  assert.ok(materialNames.has("SAFARI_110_HARD_CASE"));

  const runtimeLength = stats.size.z * DRIFT_SAFARI_110_RUNTIME_SCALE;
  assert.ok(runtimeLength > 1.4 && runtimeLength < 1.65, `runtime vehicle length drifted to ${runtimeLength}`);
});
