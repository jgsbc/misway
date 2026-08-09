import assert from "node:assert/strict";
import test from "node:test";
import {
  DRIFT_3D_SELECTED_VEHICLE,
  isDrift3DSelectedVehicleBodyMaterial,
  tintDrift3DSelectedVehicleBodyMaterial,
  type Drift3DSketchfabMaterial,
} from "./drift3dSelectedVehicle";

test("selected vehicle is the owner-chosen ROH3D Defender D110", () => {
  assert.equal(
    DRIFT_3D_SELECTED_VEHICLE.sketchfabModelUid,
    "35b435313f2048bba76c74be07388a43"
  );
  assert.equal(DRIFT_3D_SELECTED_VEHICLE.triangleCount, 29_223);
  assert.equal(DRIFT_3D_SELECTED_VEHICLE.targetBodyHex, "#ab9464");
  assert.equal(DRIFT_3D_SELECTED_VEHICLE.acquisition, "commercial");
});

test("olive body paint is detected while black trim and glass are not", () => {
  const body: Drift3DSketchfabMaterial = {
    channels: { AlbedoPBR: { color: [0.31, 0.43, 0.24] } },
  };
  const tyre: Drift3DSketchfabMaterial = {
    channels: { AlbedoPBR: { color: [0.04, 0.04, 0.04] } },
  };
  const glass: Drift3DSketchfabMaterial = {
    channels: { AlbedoPBR: { color: [0.12, 0.15, 0.16] } },
  };

  assert.equal(isDrift3DSelectedVehicleBodyMaterial(body), true);
  assert.equal(isDrift3DSelectedVehicleBodyMaterial(tyre), false);
  assert.equal(isDrift3DSelectedVehicleBodyMaterial(glass), false);
});

test("body tint uses the current MISWAY safari sand and leaves non-body untouched", () => {
  const body: Drift3DSketchfabMaterial = {
    channels: {
      AlbedoPBR: { color: [0.31, 0.43, 0.24] },
      DiffusePBR: { color: [0.31, 0.43, 0.24] },
    },
  };
  const trim: Drift3DSketchfabMaterial = {
    channels: { AlbedoPBR: { color: [0.08, 0.08, 0.075] } },
  };

  assert.equal(tintDrift3DSelectedVehicleBodyMaterial(body), true);
  assert.deepEqual(
    body.channels?.AlbedoPBR?.color,
    [...DRIFT_3D_SELECTED_VEHICLE.targetBodyRgb]
  );
  assert.equal(tintDrift3DSelectedVehicleBodyMaterial(trim), false);
  assert.deepEqual(trim.channels?.AlbedoPBR?.color, [0.08, 0.08, 0.075]);
});
