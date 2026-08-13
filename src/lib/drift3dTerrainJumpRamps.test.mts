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
import { drift3dTrackNodes } from "@/lib/drift3dTopology";
import {
  DRIFT_3D_VEHICLE_GROUND_CLEARANCE,
  createDrift3DVehiclePhysicsState,
  stepDrift3DVehiclePhysics,
} from "@/lib/drift3dVehiclePhysics";

function sampleRamp(
  ramp: (typeof DRIFT_3D_EDGE_JUMP_RAMPS)[number],
  distance: number,
  worldZ: number = ramp.z
) {
  return getDrift3DTerrainHeight(
    ramp.x + ramp.directionX * distance,
    worldZ + ramp.directionZ * distance
  );
}

test("east and west edges expose two continuous quarter-pipe profiles", () => {
  assert.equal(DRIFT_3D_EDGE_JUMP_RAMPS.length, 2);
  assert.deepEqual(
    DRIFT_3D_EDGE_JUMP_RAMPS.map((ramp) => Math.sign(ramp.directionX)),
    [-1, 1]
  );

  for (const ramp of DRIFT_3D_EDGE_JUMP_RAMPS) {
    assert.ok(ramp.width >= 160);
    assert.ok(Math.abs(ramp.height - ramp.length) < 0.01);

    for (const worldZ of [-24, 0, 40]) {
      const approach = sampleRamp(ramp, 0, worldZ);
      const middle = sampleRamp(ramp, ramp.length / 2, worldZ);
      const lip = sampleRamp(ramp, ramp.length, worldZ);
      const landingSide = sampleRamp(
        ramp,
        ramp.length + ramp.lipDrop,
        worldZ
      );

      assert.ok(middle > approach + 0.5);
      assert.ok(lip > middle + 1.5);
      assert.ok(lip - middle > (middle - approach) * 4);
      assert.ok(landingSide < lip - 2.5);
    }
  }
});

test("flatten pads keep edge-track centers level beside the ramps", () => {
  for (const node of drift3dTrackNodes.filter(
    ({ position }) => Math.abs(position.x) >= 90
  )) {
    const center = getDrift3DTerrainHeight(node.position.x, node.position.z);
    const samples = [
      getDrift3DTerrainHeight(node.position.x - 1, node.position.z),
      getDrift3DTerrainHeight(node.position.x + 1, node.position.z),
      getDrift3DTerrainHeight(node.position.x, node.position.z - 1),
      getDrift3DTerrainHeight(node.position.x, node.position.z + 1),
    ];

    assert.ok(
      samples.every((height) => Math.abs(height - center) < 0.05),
      `${node.trackSlug} is no longer level at its center`
    );
  }
});

test("the 4x4 rises vertically, falls into the wall and leaves toward the center", () => {
  const bounds = getDrift3DMovementBounds();

  for (const ramp of DRIFT_3D_EDGE_JUMP_RAMPS) {
    const lanes = ramp.directionX < 0 ? [0, 40, -48] : [-24, 28, 48];

    for (const worldZ of lanes) {
      const heading = Math.atan2(ramp.directionX, ramp.directionZ);
      const startX = ramp.x - ramp.directionX * 35;
      const state = createDrift3DVehiclePhysicsState(
        {
          x: startX,
          y:
            getDrift3DGroundY(startX, worldZ) +
            DRIFT_3D_VEHICLE_GROUND_CLEARANCE,
          z: worldZ,
        },
        heading
      );
      let launch:
        | { x: number; y: number; horizontalSpeed: number; verticalSpeed: number }
        | undefined;
      let apexY = -Infinity;
      let landedX: number | undefined;
      let returnVelocityX: number | undefined;
      let returnHeadingX: number | undefined;
      let maximumOutwardX = -Infinity;

      for (let frame = 0; frame < 900; frame += 1) {
        const wasAirborne = state.airborne;
        const result = stepDrift3DVehiclePhysics(
          state,
          { x: 0, z: 1, active: true },
          1 / 60,
          bounds,
          [],
          1,
          getDrift3DGroundY
        );
        const outwardX = state.position.x * ramp.directionX;

        maximumOutwardX = Math.max(maximumOutwardX, outwardX);

        if (!wasAirborne && result.airborne) {
          launch = {
            x: state.position.x,
            y: state.position.y,
            horizontalSpeed: Math.hypot(state.velocityX, state.velocityZ),
            verticalSpeed: state.velocityY,
          };
        }

        if (result.airborne) {
          apexY = Math.max(apexY, state.position.y);
        } else if (wasAirborne) {
          landedX = state.position.x;
          returnVelocityX = state.velocityX;
          returnHeadingX = getDrift3DHeadingVector(state.heading).x;
          break;
        }
      }

      assert.ok(launch, `no launch at z=${worldZ}`);
      assert.ok(landedX !== undefined, `no landing at z=${worldZ}`);
      assert.ok(launch.verticalSpeed >= 8, `weak launch at z=${worldZ}`);
      assert.ok(
        launch.verticalSpeed > launch.horizontalSpeed * 6,
        `launch is not vertical at z=${worldZ}`
      );
      assert.ok(apexY > launch.y + 3, `flat trajectory at z=${worldZ}`);
      assert.ok(
        maximumOutwardX < bounds.maxX - 0.1,
        `trajectory still hits the boundary at z=${worldZ}`
      );
      assert.ok(
        (launch.x - landedX) * ramp.directionX > 1.2,
        `4x4 did not fall back into the ramp at z=${worldZ}`
      );
      assert.ok(
        returnVelocityX !== undefined &&
          returnVelocityX * ramp.directionX < -4,
        `landing does not leave toward the center at z=${worldZ}`
      );
      assert.ok(
        returnHeadingX !== undefined && returnHeadingX * ramp.directionX < -0.9,
        `4x4 does not face the return direction at z=${worldZ}`
      );
      assert.equal(state.halfPipeSide, 0);

      const returnStartX = state.position.x;

      for (let frame = 0; frame < 90; frame += 1) {
        stepDrift3DVehiclePhysics(
          state,
          { x: 0, z: 1, active: true },
          1 / 60,
          bounds,
          [],
          1,
          getDrift3DGroundY
        );
      }

      assert.ok(
        (returnStartX - state.position.x) * ramp.directionX > 8,
        `4x4 does not continue across the half-pipe at z=${worldZ}`
      );
    }
  }
});
