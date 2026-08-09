import assert from "node:assert/strict";
import test from "node:test";
import {
  DRIFT_3D_TOPOLOGY_WORLD_DEPTH,
  drift3dThresholdNode,
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

test("recovered cave replaces the legacy Entry at its exact threshold", () => {
  const zeeland = drift3dTrackNodeBySlug["a-walk-in-zeeland"].position;

  assert.equal(DRIFT_EVOLUTION_ENTRY_CAVE.centerX, drift3dThresholdNode.position.x);
  assert.equal(DRIFT_EVOLUTION_ENTRY_CAVE.centerX, zeeland.x);
  assert.equal(DRIFT_EVOLUTION_ENTRY_CAVE.mouthZ, drift3dThresholdNode.position.z);
  assert.equal(
    DRIFT_EVOLUTION_ENTRY_CAVE.mouthZ + DRIFT_EVOLUTION_ENTRY_CAVE.portalDepth,
    zeeland.z
  );
});

test("evolution starts at the world edge deep inside the replacement tunnel", () => {
  const cave = DRIFT_EVOLUTION_ENTRY_CAVE;
  const start = getDriftEvolutionEntryStartPosition();
  const worldMinZ = -DRIFT_3D_TOPOLOGY_WORLD_DEPTH / 2;

  assert.ok(cave.startZ - worldMinZ <= 1.5);
  assert.equal(start.x, cave.centerX);
  assert.ok(start.z > cave.startZ);
  assert.ok(start.z < cave.mouthZ);
  assert.ok(cave.mouthZ - start.z >= 70);
});

test("portal hands directly from the legacy Entry footprint into Birth Yard", () => {
  const zeeland = drift3dTrackNodeBySlug["a-walk-in-zeeland"].position;
  const revealDistance = zeeland.z - DRIFT_EVOLUTION_ENTRY_CAVE.mouthZ;

  assert.equal(revealDistance, 8);
  assert.equal(DRIFT_EVOLUTION_ENTRY_CAVE.portalDepth, 8);
});

test("fractured portal keeps the monumental asymmetric Fable scale", () => {
  const bounds = getDriftEvolutionEntryPortalBounds();

  assert.ok(bounds.maxX - bounds.minX >= 9);
  assert.equal(bounds.minY, 0);
  assert.ok(bounds.maxY >= 14);
});

test("penumbra holds through the descent and resolves at Birth Yard", () => {
  const cave = DRIFT_EVOLUTION_ENTRY_CAVE;

  assert.equal(getDriftEvolutionEntryTunnelMix(cave.startZ + 5), 1);
  assert.ok(getDriftEvolutionEntryTunnelMix(cave.mouthZ) > 0.05);
  assert.ok(getDriftEvolutionEntryTunnelMix(cave.mouthZ) < 0.2);
  assert.equal(getDriftEvolutionEntryTunnelMix(cave.revealFadeEndZ), 0);
  assert.ok(cave.deepExposureFactor <= 0.3);
});

test("recovered cave detail stays inside a bounded runtime budget", () => {
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
