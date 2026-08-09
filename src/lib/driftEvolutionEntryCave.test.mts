import assert from "node:assert/strict";
import test from "node:test";
import { getDrift3DVehicleStartPosition } from "./drift3dBase";
import {
  DRIFT_3D_TOPOLOGY_WORLD_DEPTH,
  drift3dTrackNodeBySlug,
} from "./drift3dTopology";
import {
  DRIFT_EVOLUTION_ENTRY_CAVE,
  getDriftEvolutionEntryCaveIssues,
  getDriftEvolutionEntryPortalBounds,
  getDriftEvolutionEntryStartPosition,
  getDriftEvolutionEntryTunnelMix,
} from "./driftEvolutionEntryCave";

test("recovered evolution Entry cave is valid in protected DRIFT coordinates", () => {
  assert.deepEqual(getDriftEvolutionEntryCaveIssues(), []);
});

test("cave exit is exactly the former production 4x4 start", () => {
  const oldStart = getDrift3DVehicleStartPosition();

  assert.equal(DRIFT_EVOLUTION_ENTRY_CAVE.centerX, oldStart.x);
  assert.equal(DRIFT_EVOLUTION_ENTRY_CAVE.exitZ, oldStart.z);
  assert.equal(
    DRIFT_EVOLUTION_ENTRY_CAVE.mouthZ -
      1 +
      DRIFT_EVOLUTION_ENTRY_CAVE.portalDepth,
    oldStart.z
  );
});

test("world edge remains an exterior descent before the cave begins", () => {
  const cave = DRIFT_EVOLUTION_ENTRY_CAVE;
  const worldMinZ = -DRIFT_3D_TOPOLOGY_WORLD_DEPTH / 2;
  const descentLength = cave.startZ - worldMinZ;

  assert.ok(descentLength >= 35);
  assert.ok(descentLength <= 45);
});

test("cave keeps the exact EVO-21 validated total length", () => {
  const cave = DRIFT_EVOLUTION_ENTRY_CAVE;
  const start = getDriftEvolutionEntryStartPosition();

  assert.ok(Math.abs(cave.exitZ - cave.startZ - 45.2) < 0.001);
  assert.equal(start.x, cave.centerX);
  assert.ok(start.z > cave.startZ);
  assert.ok(start.z < cave.mouthZ);
  assert.ok(cave.exitZ - start.z >= 40);
});

test("exit reveals Birth Yard from the old vehicle staging point", () => {
  const zeeland = drift3dTrackNodeBySlug["a-walk-in-zeeland"].position;
  const revealDistance = zeeland.z - DRIFT_EVOLUTION_ENTRY_CAVE.exitZ;

  assert.ok(revealDistance >= 6);
  assert.ok(revealDistance <= 10);
  assert.equal(DRIFT_EVOLUTION_ENTRY_CAVE.portalDepth, 11);
});

test("fractured portal keeps the monumental asymmetric Fable scale", () => {
  const bounds = getDriftEvolutionEntryPortalBounds();

  assert.ok(bounds.maxX - bounds.minX >= 9);
  assert.equal(bounds.minY, 0);
  assert.ok(bounds.maxY >= 14);
});

test("penumbra holds deep in the cave and resolves after the Birth Yard reveal", () => {
  const cave = DRIFT_EVOLUTION_ENTRY_CAVE;

  assert.equal(getDriftEvolutionEntryTunnelMix(cave.startZ + 5), 1);
  assert.ok(getDriftEvolutionEntryTunnelMix(cave.exitZ) > 0.05);
  assert.ok(getDriftEvolutionEntryTunnelMix(cave.exitZ) < 0.5);
  assert.equal(getDriftEvolutionEntryTunnelMix(cave.revealFadeEndZ), 0);
  assert.ok(cave.deepExposureFactor <= 0.3);
});

test("recovered cave detail stays inside the validated runtime budget", () => {
  const cave = DRIFT_EVOLUTION_ENTRY_CAVE;
  const vertices = (cave.rings + 1) * (cave.around + 1);
  const triangles = cave.rings * cave.around * 2;

  assert.ok(vertices <= 1_800);
  assert.ok(triangles <= 3_400);
  assert.ok(cave.dustCount <= 240);
  assert.ok(cave.rockCount <= 100);
  assert.ok(cave.stalactiteCount <= 48);
  assert.ok(cave.dripCount <= 48);
});
