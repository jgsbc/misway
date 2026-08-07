import assert from "node:assert/strict";
import test from "node:test";
import {
  DRIFT_3D_CHASE_CAMERA_LOOK_AHEAD,
  DRIFT_3D_CHASE_CAMERA_TARGET_GROUND_CLEARANCE,
  DRIFT_3D_CHASE_CAMERA_TARGET_HEIGHT,
  getDrift3DChaseCameraRig,
} from "@/lib/drift3d";

function closeTo(actual: number, expected: number, epsilon = 1e-9) {
  assert.ok(
    Math.abs(actual - expected) <= epsilon,
    `expected ${actual} to be within ${epsilon} of ${expected}`
  );
}

test("chase camera keeps its look-ahead target above rising terrain", () => {
  const vehicle = { x: 0, y: 0.08, z: 0 };
  const slope = 0.25;
  const rig = getDrift3DChaseCameraRig(vehicle, 0, 1, {
    groundY: (_x, z) => z * slope,
  });
  const expectedGroundAtTarget = DRIFT_3D_CHASE_CAMERA_LOOK_AHEAD * slope;

  closeTo(rig.target.z, DRIFT_3D_CHASE_CAMERA_LOOK_AHEAD);
  closeTo(
    rig.target.y,
    expectedGroundAtTarget + DRIFT_3D_CHASE_CAMERA_TARGET_GROUND_CLEARANCE
  );
  assert.ok(
    rig.target.y > vehicle.y + DRIFT_3D_CHASE_CAMERA_TARGET_HEIGHT,
    "rising terrain should lift the look target above the nominal vehicle-relative height"
  );
});

test("flat terrain preserves the established nominal chase target height", () => {
  const vehicle = { x: 3, y: 0.08, z: -4 };
  const rig = getDrift3DChaseCameraRig(vehicle, 0, 1, {
    groundY: () => 0,
  });

  closeTo(rig.target.y, vehicle.y + DRIFT_3D_CHASE_CAMERA_TARGET_HEIGHT);
});
