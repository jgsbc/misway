import assert from "node:assert/strict";
import test from "node:test";
import { getDrift3DChaseCameraRig, getDrift3DMovementBounds } from "./drift3d";
import { getDrift3DGroundY } from "./drift3dTerrain";
import { drift3dTrackNodeBySlug } from "./drift3dTopology";
import { createDrift3DVehiclePhysicsState } from "./drift3dVehiclePhysics";
import {
  DRIFT_EVOLUTION_ENTRY_CAVE,
  getDriftEvolutionEntryPathCenterZ,
  getDriftEvolutionEntryStartPosition,
} from "./driftEvolutionEntryCave";
import {
  DRIFT_EVOLUTION_ENTRY_CAMERA_DEPTH,
  DRIFT_EVOLUTION_ENTRY_CONSTRAINT_CAPTURE_MARGIN,
  DRIFT_EVOLUTION_ENTRY_DRIVE_HALF_WIDTH,
  constrainDriftEvolutionEntryVehicle,
  getDriftEvolutionAdaptiveCameraRig,
  getDriftEvolutionEntryDriveEnvelope,
  isDriftEvolutionEntryConstraintActive,
} from "./driftEvolutionSpatial";

const NEW_TRACK_SLUGS = [
  "funky-hoo",
  "peut-etre",
  "sugared-peach",
  "white-clouds",
  "assokam",
  "wo-ha",
  "amidir",
] as const;

test("side walls keep the 4x4 inside the west-east tunnel", () => {
  const x = DRIFT_EVOLUTION_ENTRY_CAVE.spawnX + 7;
  const envelope = getDriftEvolutionEntryDriveEnvelope(x);
  const state = createDrift3DVehiclePhysicsState(
    {
      x,
      y: getDrift3DGroundY(x, envelope.centerZ),
      z: envelope.maxZ + DRIFT_EVOLUTION_ENTRY_CONSTRAINT_CAPTURE_MARGIN * 0.5,
    },
    Math.PI / 2
  );
  state.velocityZ = 5;

  assert.equal(constrainDriftEvolutionEntryVehicle(state), true);
  assert.equal(state.position.z, envelope.maxZ);
  assert.ok(state.velocityZ <= 0);
});

test("cave collision authority does not extend across the whole X slab", () => {
  const x = DRIFT_EVOLUTION_ENTRY_CAVE.spawnX + 7;
  const envelope = getDriftEvolutionEntryDriveEnvelope(x);
  const state = createDrift3DVehiclePhysicsState(
    {
      x,
      y: getDrift3DGroundY(x, envelope.centerZ + 12),
      z: envelope.centerZ + 12,
    },
    Math.PI / 2
  );
  const before = { ...state.position };

  assert.equal(isDriftEvolutionEntryConstraintActive(state.position), false);
  assert.equal(constrainDriftEvolutionEntryVehicle(state), false);
  assert.deepEqual(state.position, before);
});

test("all seven new track nodes remain inside world bounds and outside cave capture", () => {
  const bounds = getDrift3DMovementBounds();

  for (const slug of NEW_TRACK_SLUGS) {
    const node = drift3dTrackNodeBySlug[slug];
    assert.ok(node, `missing node for ${slug}`);
    assert.ok(node.position.x >= bounds.minX && node.position.x <= bounds.maxX, `${slug} x is unreachable`);
    assert.ok(node.position.z >= bounds.minZ && node.position.z <= bounds.maxZ, `${slug} z is unreachable`);
    assert.equal(
      isDriftEvolutionEntryConstraintActive(node.position),
      false,
      `${slug} is accidentally captured by the Entry cave`
    );
  }
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
  assert.ok(adaptive.position.x >= DRIFT_EVOLUTION_ENTRY_CAVE.startX);
  assert.ok(adaptive.position.x <= cameraEnvelope.maxX);
  assert.ok(adaptive.position.z >= cameraEnvelope.minZ);
  assert.ok(adaptive.position.z <= cameraEnvelope.maxZ);
});

test("cave spawn camera shows the Safari immediately without requiring movement", () => {
  const vehicle = getDriftEvolutionEntryStartPosition();
  const adaptive = getDriftEvolutionAdaptiveCameraRig(
    vehicle,
    Math.PI / 2,
    1,
    1
  );
  const vehicleDistance = Math.hypot(
    adaptive.position.x - vehicle.x,
    adaptive.position.z - vehicle.z
  );
  const targetDistance = Math.hypot(
    adaptive.position.x - adaptive.target.x,
    adaptive.position.z - adaptive.target.z
  );
  const vehicleDownAngle = Math.atan2(
    adaptive.position.y - vehicle.y,
    vehicleDistance
  );
  const targetDownAngle = Math.atan2(
    adaptive.position.y - adaptive.target.y,
    targetDistance
  );
  const vehicleBelowCenter = vehicleDownAngle - targetDownAngle;

  assert.ok(adaptive.enclosure > 0.95);
  assert.ok(
    vehicleDistance >= DRIFT_EVOLUTION_ENTRY_CAMERA_DEPTH * 0.92,
    `spawn chase distance collapsed to ${vehicleDistance.toFixed(2)}m`
  );
  assert.ok(
    vehicleBelowCenter < 0.22,
    `vehicle sits ${(vehicleBelowCenter * 180 / Math.PI).toFixed(1)}° below camera center`
  );
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
