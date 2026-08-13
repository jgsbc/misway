import assert from "node:assert/strict";
import test from "node:test";
import { getDrift3DMovementBounds } from "@/lib/drift3d";
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
    assert.ok(ramp.width >= 130);

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

test("a natural approach from rest launches across common edge lanes", () => {
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
      let becameAirborne = false;
      let launchVelocity = 0;

      for (let frame = 0; frame < 900; frame += 1) {
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
        } else if (becameAirborne) {
          break;
        }
      }

      assert.equal(becameAirborne, true, `no launch at z=${worldZ}`);
      assert.ok(launchVelocity > 5, `weak launch at z=${worldZ}`);
      assert.ok(
        state.position.x >= bounds.minX && state.position.x <= bounds.maxX
      );
      assert.ok(Math.abs(state.velocityX) <= 12.5);
    }
  }
});
