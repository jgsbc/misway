import assert from "node:assert/strict";
import test from "node:test";
import {
  DRIFT_3D_ORIGINAL_VEHICLE,
  getDrift3DOriginalVehicleIssues,
} from "./drift3dOriginalVehicle";

test("VEH-B01 original Safari 110 source stays valid and self-owned", () => {
  assert.deepEqual(getDrift3DOriginalVehicleIssues(), []);
  assert.equal(DRIFT_3D_ORIGINAL_VEHICLE.thirdPartyGeometry, false);
  assert.equal(DRIFT_3D_ORIGINAL_VEHICLE.origin, "MISWAY original geometry");
  assert.equal(DRIFT_3D_ORIGINAL_VEHICLE.bodyColor, "#ab9464");
  assert.equal(DRIFT_3D_ORIGINAL_VEHICLE.sourceFormat, "authored-buffer-geometry");
});

test("VEH-B01 keeps a credible metric expedition 4x4 envelope", () => {
  const asset = DRIFT_3D_ORIGINAL_VEHICLE;
  assert.ok(asset.dimensionsMeters.length >= 4.2 && asset.dimensionsMeters.length <= 5.2);
  assert.ok(asset.dimensionsMeters.width >= 1.8 && asset.dimensionsMeters.width <= 2.25);
  assert.ok(asset.dimensionsMeters.height >= 1.8 && asset.dimensionsMeters.height <= 2.45);
  assert.ok(asset.triangleBudget <= 60_000);
});
