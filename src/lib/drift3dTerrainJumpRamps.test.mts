import assert from "node:assert/strict";
import test from "node:test";
import {
  getDrift3DHeadingVector,
  getDrift3DMovementBounds,
} from "@/lib/drift3d";
import {
  DRIFT_3D_EDGE_JUMP_RAMPS,
  getDrift3DGroundY,
  getDrift3DTerrainHeight,
} from "@/lib/drift3dTerrain";
import { drift3dTrackNodes, getDrift3DNodeRadius } from "@/lib/drift3dTopology";
import {
  DRIFT_3D_VEHICLE_GROUND_CLEARANCE,
  createDrift3DVehiclePhysicsState,
  stepDrift3DVehiclePhysics,
} from "@/lib/drift3dVehiclePhysics";

function sampleRamp(
  ramp: (typeof DRIFT_3D_EDGE_JUMP_RAMPS)[number],
  distance: number
) {
  return getDrift3DTerrainHeight(
    ramp.x + ramp.directionX * distance,
    ramp.z + ramp.directionZ * distance
  );
}

test("east and west edges expose two quarter-pipe jump profiles", () => {
  assert.equal(DRIFT_3D_EDGE_JUMP_RAMPS.length, 2);
  assert.deepEqual(
    DRIFT_3D_EDGE_JUMP_RAMPS.map((ramp) => Math.sign(ramp.directionX)),
    [-1, 1]
  );

  for (const ramp of DRIFT_3D_EDGE_JUMP_RAMPS) {
    const approach = sampleRamp(ramp, 0);
    const middle = sampleRamp(ramp, ramp.length / 2);
    const lip = sampleRamp(ramp, ramp.length);
    const landingSide = sampleRamp(ramp, ramp.length + ramp.lipDrop);

    assert.ok(middle > approach + 0.7);
    assert.ok(lip > middle + 2);
    assert.ok(landingSide < lip - 3);
  }
});

test("jump corridors stay clear of every track footprint", () => {
  for (const ramp of DRIFT_3D_EDGE_JUMP_RAMPS) {
    for (const node of drift3dTrackNodes) {
      const offsetX = node.position.x - ramp.x;
      const offsetZ = node.position.z - ramp.z;
      const localU =
        offsetX * ramp.directionX + offsetZ * ramp.directionZ;
      const localV =
        -offsetX * ramp.directionZ + offsetZ * ramp.directionX;
      const nodeRadius = getDrift3DNodeRadius(node);
      const overlapsLength =
        localU + nodeRadius >= 0 &&
        localU - nodeRadius <= ramp.length + ramp.lipDrop;
      const overlapsWidth =
        Math.abs(localV) - nodeRadius <= ramp.width / 2;

      assert.equal(
        overlapsLength && overlapsWidth,
        false,
        `${node.trackSlug} overlaps a boundary jump corridor`
      );
    }
  }
});

test("the vehicle becomes airborne after either boundary lip", () => {
  const bounds = getDrift3DMovementBounds();

  for (const ramp of DRIFT_3D_EDGE_JUMP_RAMPS) {
    const heading = Math.atan2(ramp.directionX, ramp.directionZ);
    const headingVector = getDrift3DHeadingVector(heading);
    const state = createDrift3DVehiclePhysicsState(
      {
        x: ramp.x,
        y:
          getDrift3DGroundY(ramp.x, ramp.z) +
          DRIFT_3D_VEHICLE_GROUND_CLEARANCE,
        z: ramp.z,
      },
      heading
    );
    state.speed = 12;
    state.velocityX = headingVector.x * state.speed;
    state.velocityZ = headingVector.z * state.speed;
    let becameAirborne = false;
    let launchVelocity = 0;

    for (let frame = 0; frame < 90; frame += 1) {
      const result = stepDrift3DVehiclePhysics(
        state,
        { x: 0, z: 1, active: true },
        1 / 60,
        bounds,
        [],
        1,
        getDrift3DGroundY
      );

      if (result.airborne) {
        becameAirborne = true;
        launchVelocity = Math.max(launchVelocity, state.velocityY);
      }
    }

    assert.equal(becameAirborne, true);
    assert.ok(launchVelocity > 5);
    assert.ok(state.position.x >= bounds.minX && state.position.x <= bounds.maxX);
  }
});
