import assert from "node:assert/strict";
import test from "node:test";
import { getDrift3DVehicleStartPosition } from "./drift3d.ts";
import {
  DRIFT_EVOLUTION_ENTRY_CAVE,
  getDriftEvolutionEntryCaveIssues,
  getDriftEvolutionEntryPortalBounds,
} from "./driftEvolutionEntryCave.ts";

test("evolution Entry cave is valid in restored production coordinates", () => {
  assert.deepEqual(getDriftEvolutionEntryCaveIssues(), []);
});

test("production vehicle starts inside the cave and exits forward", () => {
  const start = getDrift3DVehicleStartPosition();

  assert.equal(DRIFT_EVOLUTION_ENTRY_CAVE.centerX, start.x);
  assert.ok(start.z > DRIFT_EVOLUTION_ENTRY_CAVE.startZ);
  assert.ok(start.z < DRIFT_EVOLUTION_ENTRY_CAVE.mouthZ);
  assert.ok(DRIFT_EVOLUTION_ENTRY_CAVE.mouthZ - start.z >= 7);
});

test("fractured portal remains broad and tall enough for a readable threshold", () => {
  const bounds = getDriftEvolutionEntryPortalBounds();

  assert.ok(bounds.maxX - bounds.minX >= 7.5);
  assert.equal(bounds.minY, 0);
  assert.ok(bounds.maxY >= 5.5);
});

test("cave mesh budget stays bounded", () => {
  const vertices =
    (DRIFT_EVOLUTION_ENTRY_CAVE.rings + 1) *
    (DRIFT_EVOLUTION_ENTRY_CAVE.around + 1);
  const triangles =
    DRIFT_EVOLUTION_ENTRY_CAVE.rings *
    DRIFT_EVOLUTION_ENTRY_CAVE.around *
    2;

  assert.ok(vertices <= 1_200);
  assert.ok(triangles <= 2_300);
  assert.ok(DRIFT_EVOLUTION_ENTRY_CAVE.dustCount <= 100);
});
