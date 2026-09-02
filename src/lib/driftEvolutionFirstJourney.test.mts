import assert from "node:assert/strict";
import test from "node:test";
import { getDrift3DMovementBounds } from "./drift3d";
import { getDrift3DLandmarkColliders } from "./drift3dLandmarks";
import { getDrift3DScatterColliders } from "./drift3dScatter";
import { getDrift3DGroundY } from "./drift3dTerrain";
import {
  createDrift3DVehiclePhysicsState,
  getDrift3DPropColliders,
  stepDrift3DVehiclePhysics,
} from "./drift3dVehiclePhysics";
import {
  DRIFT_EVOLUTION_ENTRY_CAVE,
  getDriftEvolutionEntryStartPosition,
} from "./driftEvolutionEntryCave";
import {
  restoreLegacyEntryAfterEvolution,
  suppressLegacyEntryForEvolution,
} from "./driftEvolutionLegacyEntryRegistry";
import { constrainDriftEvolutionEntryVehicle } from "./driftEvolutionSpatial";

const FRAME_DT = 1 / 60;
const MAX_SIMULATION_SECONDS = 20;
const EXIT_CLEARANCE = 0.8;

function getEvolutionProductionColliders() {
  suppressLegacyEntryForEvolution();
  try {
    return [
      ...getDrift3DPropColliders(),
      ...getDrift3DLandmarkColliders(),
      ...getDrift3DScatterColliders(),
    ];
  } finally {
    restoreLegacyEntryAfterEvolution();
  }
}

test("canonical Entry spawn reaches Birth Yard by holding forward only", () => {
  const start = getDriftEvolutionEntryStartPosition();
  const state = createDrift3DVehiclePhysicsState(start, Math.PI / 2);
  const bounds = getDrift3DMovementBounds();
  const colliders = getEvolutionProductionColliders();
  const forward = { x: 0, z: 1, active: true } as const;
  const targetX = DRIFT_EVOLUTION_ENTRY_CAVE.exitX + EXIT_CLEARANCE;
  let furthestX = state.position.x;
  let reachedExit = false;

  for (
    let frame = 0;
    frame < MAX_SIMULATION_SECONDS / FRAME_DT;
    frame += 1
  ) {
    stepDrift3DVehiclePhysics(
      state,
      forward,
      FRAME_DT,
      bounds,
      colliders,
      1,
      getDrift3DGroundY
    );
    constrainDriftEvolutionEntryVehicle(state);
    furthestX = Math.max(furthestX, state.position.x);

    if (state.position.x >= targetX) {
      reachedExit = true;
      break;
    }
  }

  assert.ok(
    reachedExit,
    `forward-only first journey stalled at x=${furthestX.toFixed(2)} before target x=${targetX.toFixed(2)}`
  );
});

test("canonical Entry spawn starts clear of production colliders", () => {
  const start = getDriftEvolutionEntryStartPosition();
  const colliders = getEvolutionProductionColliders();
  const nearest = colliders.reduce(
    (best, collider) => {
      const edgeDistance =
        Math.hypot(start.x - collider.x, start.z - collider.z) - collider.radius;
      return edgeDistance < best ? edgeDistance : best;
    },
    Number.POSITIVE_INFINITY
  );

  assert.ok(
    nearest > 0.34,
    `Entry spawn overlaps a production collider: nearest edge is ${nearest.toFixed(2)}m away`
  );
});
