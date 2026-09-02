import assert from "node:assert/strict";
import test from "node:test";
import { getDrift3DGroundY } from "./drift3dTerrain";
import {
  createDrift3DVehiclePhysicsState,
  DRIFT_3D_VEHICLE_GROUND_CLEARANCE,
} from "./drift3dVehiclePhysics";
import {
  DRIFT_EVOLUTION_ENTRY_CAVE,
  getDriftEvolutionEntryPathCenterZ,
  getDriftEvolutionEntryStartPosition,
} from "./driftEvolutionEntryCave";
import {
  DRIFT_EVOLUTION_ENTRY_RECOVERY_NUDGE,
  isDriftEvolutionEntryRecoveryZone,
  recoverDriftEvolutionEntryVehicle,
} from "./driftEvolutionSpatial";

test("Entry recovery recenters a stalled first journey and nudges it east", () => {
  const start = getDriftEvolutionEntryStartPosition();
  const state = createDrift3DVehiclePhysicsState(
    { ...start, z: start.z + 1.4 },
    0.72
  );
  state.velocityX = -1.2;
  state.velocityZ = 0.8;
  state.velocityY = 2;
  state.speed = 3;
  state.airborne = true;
  state.halfPipeSide = -1;

  const beforeX = state.position.x;
  assert.equal(isDriftEvolutionEntryRecoveryZone(state.position), true);
  assert.equal(recoverDriftEvolutionEntryVehicle(state), true);

  assert.ok(state.position.x > beforeX);
  assert.ok(
    state.position.x <= beforeX + DRIFT_EVOLUTION_ENTRY_RECOVERY_NUDGE + 1e-9
  );
  assert.ok(
    Math.abs(
      state.position.z - getDriftEvolutionEntryPathCenterZ(state.position.x)
    ) < 1e-9
  );
  assert.equal(state.heading, Math.PI / 2);
  assert.equal(state.speed, 0);
  assert.equal(state.velocityX, 0);
  assert.equal(state.velocityZ, 0);
  assert.equal(state.velocityY, 0);
  assert.equal(state.airborne, false);
  assert.equal(state.halfPipeSide, 0);
  assert.ok(
    Math.abs(
      state.position.y -
        (getDrift3DGroundY(state.position.x, state.position.z) +
          DRIFT_3D_VEHICLE_GROUND_CLEARANCE)
    ) < 1e-9
  );
});

test("Entry recovery never captures open-world driving after the cave mouth", () => {
  const x = DRIFT_EVOLUTION_ENTRY_CAVE.exitX + 4;
  const z = getDriftEvolutionEntryPathCenterZ(x);
  const state = createDrift3DVehiclePhysicsState(
    { x, y: getDrift3DGroundY(x, z), z },
    Math.PI / 2
  );
  const before = structuredClone(state);

  assert.equal(isDriftEvolutionEntryRecoveryZone(state.position), false);
  assert.equal(recoverDriftEvolutionEntryVehicle(state), false);
  assert.deepEqual(state, before);
});

test("Entry recovery does not own the west-side revisit behind canonical spawn", () => {
  const cave = DRIFT_EVOLUTION_ENTRY_CAVE;
  const x = cave.spawnX - 0.8;
  const z = getDriftEvolutionEntryPathCenterZ(x);
  const state = createDrift3DVehiclePhysicsState(
    { x, y: getDrift3DGroundY(x, z), z },
    -Math.PI / 2
  );

  assert.equal(isDriftEvolutionEntryRecoveryZone(state.position), false);
  assert.equal(recoverDriftEvolutionEntryVehicle(state), false);
});
