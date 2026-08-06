import assert from "node:assert/strict";
import test from "node:test";
import {
  getDrift3DChaseCameraRig,
  getDrift3DDragDriveInput,
  getDrift3DDriveInput,
} from "@/overrides/drift3dChase";
import {
  createDrift3DVehiclePhysicsState,
  stepDrift3DVehiclePhysics,
} from "@/overrides/drift3dVehiclePhysicsChase";

const bounds = {
  minX: -100,
  maxX: 100,
  minZ: -100,
  maxZ: 100,
};
const flatGround = () => 0;

test("keyboard controls are relative throttle and steering", () => {
  const input = getDrift3DDriveInput(
    new Set(["ArrowUp", "ArrowRight"])
  );

  assert.deepEqual(input, { x: -1, z: 1, active: true });
  assert.deepEqual(getDrift3DDriveInput(new Set(["ArrowLeft"])), {
    x: 1,
    z: 0,
    active: true,
  });
  assert.deepEqual(getDrift3DDriveInput(new Set(["ArrowDown"])), {
    x: 0,
    z: -1,
    active: true,
  });
});

test("touch drag maps screen direction to matching steering", () => {
  const forward = getDrift3DDragDriveInput(
    { x: 100, y: 100 },
    { x: 100, y: 20 }
  );
  const reverse = getDrift3DDragDriveInput(
    { x: 100, y: 100 },
    { x: 100, y: 180 }
  );
  const right = getDrift3DDragDriveInput(
    { x: 100, y: 100 },
    { x: 180, y: 100 }
  );
  const left = getDrift3DDragDriveInput(
    { x: 100, y: 100 },
    { x: 20, y: 100 }
  );

  assert.ok(forward.z > 0);
  assert.ok(reverse.z < 0);
  assert.equal(forward.x, 0);
  assert.equal(reverse.x, 0);
  assert.ok(right.x < 0);
  assert.ok(left.x > 0);
});

test("chase camera stays behind the vehicle heading", () => {
  const north = getDrift3DChaseCameraRig(
    { x: 4, y: 2, z: 8 },
    0,
    1,
    { groundY: flatGround }
  );
  const east = getDrift3DChaseCameraRig(
    { x: 4, y: 2, z: 8 },
    Math.PI / 2,
    1,
    { groundY: flatGround }
  );

  assert.ok(north.position.z < 8);
  assert.ok(north.target.z > 8);
  assert.ok(east.position.x < 4);
  assert.ok(east.target.x > 4);
});

test("vehicle accelerates forward and can reverse", () => {
  const forwardState = createDrift3DVehiclePhysicsState(
    { x: 0, y: 0.02, z: 0 },
    0
  );
  const reverseState = createDrift3DVehiclePhysicsState(
    { x: 0, y: 0.02, z: 0 },
    0
  );

  for (let index = 0; index < 90; index += 1) {
    stepDrift3DVehiclePhysics(
      forwardState,
      { x: 0, z: 1, active: true },
      1 / 60,
      bounds,
      [],
      1,
      flatGround
    );
    stepDrift3DVehiclePhysics(
      reverseState,
      { x: 0, z: -1, active: true },
      1 / 60,
      bounds,
      [],
      1,
      flatGround
    );
  }

  assert.ok(forwardState.speed > 0);
  assert.ok(forwardState.position.z > 0);
  assert.ok(reverseState.speed < 0);
  assert.ok(reverseState.position.z < 0);
});

test("right steering turns the vehicle right while moving forward", () => {
  const state = createDrift3DVehiclePhysicsState(
    { x: 0, y: 0.02, z: 0 },
    0
  );

  for (let index = 0; index < 60; index += 1) {
    stepDrift3DVehiclePhysics(
      state,
      { x: -1, z: 1, active: true },
      1 / 60,
      bounds,
      [],
      1,
      flatGround
    );
  }

  assert.ok(state.heading < 0);
  assert.ok(state.position.x < 0);
});
