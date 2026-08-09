import assert from "node:assert/strict";
import test from "node:test";
import { getDrift3DChaseCameraRig } from "./drift3d";
import { getDrift3DGroundY } from "./drift3dTerrain";
import { createDrift3DVehiclePhysicsState } from "./drift3dVehiclePhysics";
import {
  DRIFT_EVOLUTION_ENTRY_CAVE,
  getDriftEvolutionEntryPathCenterZ,
} from "./driftEvolutionEntryCave";
import {
  DRIFT_EVOLUTION_ENTRY_DRIVE_HALF_WIDTH,
  constrainDriftEvolutionEntryVehicle,
  getDriftEvolutionAdaptiveCameraRig,
  getDriftEvolutionEntryDriveEnvelope,
} from "./driftEvolutionSpatial";

test("side walls keep the 4x4 inside the west-east tunnel", () => {
  const x = DRIFT_EVOLUTION_ENTRY_CAVE.spawnX + 7;
  const envelope = getDriftEvolutionEntryDriveEnvelope(x);
  const state = createDrift3DVehiclePhysicsState(
    {
      x,
      y: getDrift3DGroundY(x, envelope.centerZ),
      z: envelope.maxZ + 4,
    },
    Math.PI / 2
  );
  state.velocityZ = 5;

  assert.equal(constrainDriftEvolutionEntryVehicle(state), true);
  assert.equal(state.position.z, envelope.maxZ);
  assert.ok(state.velocityZ <= 0);
});

test("back wall prevents reversing out through the west ridge", () => {
  const cave = DRIFT_EVOLUTION_ENTRY_CAVE;
  const x = cave.startX + 0.1;
  const z = getDriftEvolutionEntryPathCenterZ(x);
  const state = createDrift3DVehiclePhysicsState(
    { x, y: getDrift3DGroundY(x, z), z },
    -Math.PI / 2
  );
  state.velocityX = -3;

  assert.equal(constrainDriftEvolutionEntryVehicle(state), true);
  assert.ok(state.position.x > cave.startX + 0.6);
  assert.ok(state.velocityX >= 0);
});

test("eastward exit is released after the old vehicle staging point", () => {
  const cave = DRIFT_EVOLUTION_ENTRY_CAVE;
  const x = cave.exitX + 1;
  const z = getDriftEvolutionEntryPathCenterZ(x);
  const state = createDrift3DVehiclePhysicsState(
    { x, y: 0, z: z + DRIFT_EVOLUTION_ENTRY_DRIVE_HALF_WIDTH * 3 },
    Math.PI / 2
  );

  assert.equal(constrainDriftEvolutionEntryVehicle(state), false);
});

test("enclosed camera follows an east-facing 4x4 inside the cave envelope", () => {
  const cave = DRIFT_EVOLUTION_ENTRY_CAVE;
  const x = cave.spawnX + 8;
  const z = getDriftEvolutionEntryPathCenterZ(x);
  const vehicle = { x, y: getDrift3DGroundY(x, z) + 0.02, z };
  const canonical = getDrift3DChaseCameraRig(vehicle, Math.PI / 2, 1, {
    groundY: getDrift3DGroundY,
  });
  const adaptive = getDriftEvolutionAdaptiveCameraRig(
    vehicle,
    Math.PI / 2,
    1,
    1
  );
  const cameraEnvelope = getDriftEvolutionEntryDriveEnvelope(adaptive.position.x);
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
  assert.ok(adaptive.position.z <= cameraEnvelope.maxZ);
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
