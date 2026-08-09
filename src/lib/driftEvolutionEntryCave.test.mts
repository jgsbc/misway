import assert from "node:assert/strict";
import test from "node:test";
import { getDrift3DVehicleStartPosition } from "./drift3dBase";
import { getDrift3DGroundY } from "./drift3dTerrain";
import {
  DRIFT_3D_TOPOLOGY_WORLD_WIDTH,
  drift3dTrackNodeBySlug,
} from "./drift3dTopology";
import {
  DRIFT_EVOLUTION_ENTRY_CAVE,
  getDriftEvolutionEntryCaveIssues,
  getDriftEvolutionEntryPathCenterZ,
  getDriftEvolutionEntryPortalBounds,
  getDriftEvolutionEntryStartPosition,
  getDriftEvolutionEntryTunnelMix,
} from "./driftEvolutionEntryCave";

test("west-ridge evolution Entry contract is valid", () => {
  assert.deepEqual(getDriftEvolutionEntryCaveIssues(), []);
});

test("cave runs from the west ridge to the exact former 4x4 start", () => {
  const cave = DRIFT_EVOLUTION_ENTRY_CAVE;
  const oldStart = getDrift3DVehicleStartPosition();
  const worldMinX = -DRIFT_3D_TOPOLOGY_WORLD_WIDTH / 2;

  assert.ok(cave.startX - worldMinX >= 0.4);
  assert.ok(cave.startX - worldMinX <= 1.5);
  assert.equal(cave.exitX, oldStart.x);
  assert.equal(cave.centerZ, oldStart.z);
  assert.ok(cave.exitX - cave.startX >= 22);
  assert.ok(cave.exitX - cave.startX <= 28);
});

test("4x4 starts at the back of the cave and faces an eastward run", () => {
  const cave = DRIFT_EVOLUTION_ENTRY_CAVE;
  const start = getDriftEvolutionEntryStartPosition();

  assert.equal(start.x, cave.spawnX);
  assert.ok(start.x > cave.startX);
  assert.ok(start.x < cave.mouthX);
  assert.ok(cave.exitX - start.x >= 18);
  assert.ok(Math.abs(start.z - getDriftEvolutionEntryPathCenterZ(start.x)) < 0.001);
});

test("existing west ridge provides the downhill cave floor", () => {
  const cave = DRIFT_EVOLUTION_ENTRY_CAVE;
  const start = getDriftEvolutionEntryStartPosition();
  const ridgeY = getDrift3DGroundY(start.x, start.z);
  const exitY = getDrift3DGroundY(cave.exitX, cave.centerZ);

  assert.ok(ridgeY - exitY >= 2.5);
});

test("portal exterior terminates exactly at the former vehicle position", () => {
  const cave = DRIFT_EVOLUTION_ENTRY_CAVE;
  const exteriorX = cave.mouthX - 1 + cave.portalDepth;

  assert.ok(Math.abs(exteriorX - cave.exitX) < 0.001);
  assert.ok(cave.portalDepth >= 3);
  assert.ok(cave.portalDepth <= 6);
});

test("exit reveals canonical Birth Yard without moving it", () => {
  const cave = DRIFT_EVOLUTION_ENTRY_CAVE;
  const zeeland = drift3dTrackNodeBySlug["a-walk-in-zeeland"].position;
  const revealDistance = Math.hypot(
    zeeland.x - cave.exitX,
    zeeland.z - cave.centerZ
  );

  assert.ok(revealDistance >= 6);
  assert.ok(revealDistance <= 10);
});

test("fractured portal keeps the asymmetric Fable scale", () => {
  const bounds = getDriftEvolutionEntryPortalBounds();

  assert.ok(bounds.maxX - bounds.minX >= 9);
  assert.equal(bounds.minY, 0);
  assert.ok(bounds.maxY >= 14);
});

test("penumbra resolves along west-to-east progress", () => {
  const cave = DRIFT_EVOLUTION_ENTRY_CAVE;

  assert.equal(getDriftEvolutionEntryTunnelMix(cave.spawnX), 1);
  assert.ok(getDriftEvolutionEntryTunnelMix(cave.exitX) > 0.05);
  assert.ok(getDriftEvolutionEntryTunnelMix(cave.exitX) < 0.5);
  assert.equal(getDriftEvolutionEntryTunnelMix(cave.revealFadeEndX), 0);
  assert.ok(cave.deepExposureFactor <= 0.3);
});

test("west-ridge cave detail stays inside runtime budget", () => {
  const cave = DRIFT_EVOLUTION_ENTRY_CAVE;
  const vertices = (cave.rings + 1) * (cave.around + 1);
  const triangles = cave.rings * cave.around * 2;

  assert.ok(vertices <= 1_800);
  assert.ok(triangles <= 3_400);
  assert.ok(cave.dustCount <= 220);
  assert.ok(cave.rockCount <= 100);
  assert.ok(cave.stalactiteCount <= 44);
  assert.ok(cave.dripCount <= 44);
});
