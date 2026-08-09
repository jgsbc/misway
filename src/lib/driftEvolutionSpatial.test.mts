import assert from "node:assert/strict";
import test from "node:test";
import { getDrift3DChaseCameraRig } from "./drift3d";
import { getDrift3DGroundY } from "./drift3dTerrain";
import { createDrift3DVehiclePhysicsState } from "./drift3dVehiclePhysics";
import { DRIFT_EVOLUTION_ENTRY_CAVE } from "./driftEvolutionEntryCave";
import {
  DRIFT_EVOLUTION_ENTRY_DRIVE_HALF_WIDTH,
  constrainDriftEvolutionEntryVehicle,
  getDriftEvolutionAdaptiveCameraRig,
  getDriftEvolutionEntryDriveEnvelope,
  getDriftEvolutionEntryPathCenterX,
} from "./driftEvolutionSpatial";

test("cave wall constraint keeps the 4x4 inside the recovered tunnel", () => {
  const z = DRIFT_EVOLUTION_ENTRY_CAVE.spawnZ + 12;
  const envelope = getDriftEvolutionEntryDriveEnvelope(z);
  const state = createDrift3DVehiclePhysicsState(
    {
      x: envelope.maxX + 4,
      y: getDrift3DGroundY(envelope.centerX, z),
      z,
    },
    0
  );
  state.velocityX = 5;
  state.speed = 5;

  assert.equal(constrainDriftEvolutionEntryVehicle(state), true);
  assert.equal(state.position.x, envelope.maxX);
  assert.ok(state.velocityX <= 0);
});

test("cave back wall prevents reversing through the closed mountain", () => {
  const z = DRIFT_EVOLUTION_ENTRY_CAVE.startZ + 0.1;
  const state = createDrift3DVehiclePhysicsState(
    {
      x: getDriftEvolutionEntryPathCenterX(z),
      y: getDrift3DGroundY(getDriftEvolutionEntryPathCenterX(z), z),
      z,
    },
    Math.PI
  );
  state.velocityZ = -3;

  assert.equal(constrainDriftEvolutionEntryVehicle(state), true);
  assert.ok(state.position.z > DRIFT_EVOLUTION_ENTRY_CAVE.startZ + 0.6);
  assert.ok(state.velocityZ >= 0);
});

test("forward exit is released once the 4x4 clears the thick portal", () => {
  const z =
    DRIFT_EVOLUTION_ENTRY_CAVE.mouthZ +
    DRIFT_EVOLUTION_ENTRY_CAVE.portalDepth +
    1;
  const x = getDriftEvolutionEntryPathCenterX(z);
  const state = createDrift3DVehiclePhysicsState(
    { x: x + DRIFT_EVOLUTION_ENTRY_DRIVE_HALF_WIDTH * 3, y: 0, z },
    0
  );

  assert.equal(constrainDriftEvolutionEntryVehicle(state), false);
  assert.equal(state.position.x, x + DRIFT_EVOLUTION_ENTRY_DRIVE_HALF_WIDTH * 3);
});

test("enclosed camera pulls closer and stays inside the cave envelope", () => {
  const z = DRIFT_EVOLUTION_ENTRY_CAVE.spawnZ + 8;
  const x = getDriftEvolutionEntryPathCenterX(z);
  const vehicle = {
    x,
    y: getDrift3DGroundY(x, z) + 0.02,
    z,
  };
  const canonical = getDrift3DChaseCameraRig(vehicle, 0, 1, {
    groundY: getDrift3DGroundY,
  });
  const adaptive = getDriftEvolutionAdaptiveCameraRig(vehicle, 0, 1, 1);
  const cameraEnvelope = getDriftEvolutionEntryDriveEnvelope(adaptive.position.z);
  const canonicalDistance = Math.hypot(
    canonical.position.x - vehicle.x,
    canonical.position.z - vehicle.z
  );
  const adaptiveDistance = Math.hypot(
    adaptive.position.x - vehicle.x,
    adaptive.position.z - vehicle.z
  );

  assert.ok(adaptive.enclosure > 0.7);
  assert.ok(adaptiveDistance < canonicalDistance);
  assert.ok(adaptive.position.x >= cameraEnvelope.minX);
  assert.ok(adaptive.position.x <= cameraEnvelope.maxX);
  assert.ok(adaptive.position.z >= cameraEnvelope.minZ);
});

test("open-world evolution camera remains the canonical chase camera", () => {
  const vehicle = { x: 40, y: getDrift3DGroundY(40, 40) + 0.02, z: 40 };
  const canonical = getDrift3DChaseCameraRig(vehicle, 0.4, 1.1, {
    cinematicScale: 0.95,
    groundY: getDrift3DGroundY,
  });
  const adaptive = getDriftEvolutionAdaptiveCameraRig(vehicle, 0.4, 1.1, 0.95);

  assert.equal(adaptive.enclosure, 0);
  assert.deepEqual(adaptive.position, canonical.position);
  assert.deepEqual(adaptive.target, canonical.target);
});
