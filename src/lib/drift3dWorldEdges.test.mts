import assert from "node:assert/strict";
import test from "node:test";
import { getDrift3DMovementBounds } from "@/lib/drift3d";
import { getDrift3DGroundY } from "@/lib/drift3dTerrain";
import { drift3dTrackNodes } from "@/lib/drift3dTopology";
import {
  DRIFT_3D_NORTH_EAST_OCEAN,
  DRIFT_3D_SOUTH_VOID,
  getDrift3DWorldEdgeIssues,
} from "@/lib/drift3dWorldEdges";

test("north-east ocean and south void define a valid world-edge composition", () => {
  assert.deepEqual(getDrift3DWorldEdgeIssues(), []);
  assert.ok(DRIFT_3D_NORTH_EAST_OCEAN.minX > 0);
  assert.ok(DRIFT_3D_NORTH_EAST_OCEAN.nearZ < 0);
  assert.ok(DRIFT_3D_SOUTH_VOID.nearZ > 0);
});

test("north-east coast descends into the ocean while north-west stays land", () => {
  const ocean = DRIFT_3D_NORTH_EAST_OCEAN;
  const northEastShoreY = getDrift3DGroundY(60, ocean.coastZ);
  const northWestEdgeY = getDrift3DGroundY(-60, ocean.coastZ);

  assert.ok(northEastShoreY < ocean.waterY + 0.5);
  assert.ok(northWestEdgeY > ocean.waterY + 5);
});

test("south terrain becomes a cliff only after every track and playable road", () => {
  const bounds = getDrift3DMovementBounds();
  const southVoid = DRIFT_3D_SOUTH_VOID;
  const southernmostTrackZ = Math.max(
    ...drift3dTrackNodes.map(({ position }) => position.z)
  );
  const playableLipY = getDrift3DGroundY(0, bounds.maxZ);

  assert.ok(southernmostTrackZ <= southVoid.cliffStartZ - 20);
  assert.equal(bounds.maxZ, southVoid.cliffStartZ);
  assert.ok(playableLipY > -0.25);
  assert.ok(southVoid.floorY < playableLipY - 18);
});

test("world-edge biomes stay inside a small fixed render budget", () => {
  const ocean = DRIFT_3D_NORTH_EAST_OCEAN;
  const southVoid = DRIFT_3D_SOUTH_VOID;
  const vertices =
    (ocean.surfaceSegmentsX + 1) * (ocean.surfaceSegmentsZ + 1) +
    (ocean.coastSegmentsX + 1) * (ocean.coastSegmentsZ + 1) +
    (southVoid.cliffSegmentsX + 1) * (southVoid.cliffSegmentsZ + 1) +
    southVoid.starCount;

  assert.ok(vertices <= 2600);
  assert.ok(southVoid.starCount <= 200);
});
