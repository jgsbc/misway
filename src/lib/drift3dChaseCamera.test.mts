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

function opticalPitch(rig: ReturnType<typeof getDrift3DChaseCameraRig>) {
  const horizontal = Math.hypot(
    rig.target.x - rig.position.x,
    rig.target.z - rig.position.z
  );

  return Math.atan2(rig.target.y - rig.position.y, horizontal);
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
  assert.ok(
    opticalPitch(rig) > (-5 * Math.PI) / 180,
    "a 25% climb should not force the chase camera to stare down into the slope"
  );
});

test("flat terrain preserves target height while keeping the horizon readable", () => {
  const vehicle = { x: 3, y: 0.08, z: -4 };
  const rig = getDrift3DChaseCameraRig(vehicle, 0, 1, {
    groundY: () => 0,
  });

  closeTo(rig.target.y, vehicle.y + DRIFT_3D_CHASE_CAMERA_TARGET_HEIGHT);
  assert.ok(
    DRIFT_3D_CHASE_CAMERA_LOOK_AHEAD >= 9,
    "the narrow 28 degree production FOV needs a meaningful forward look distance"
  );
  assert.ok(
    opticalPitch(rig) > (-11 * Math.PI) / 180,
    "default chase framing should leave vertical room for the horizon"
  );
});
