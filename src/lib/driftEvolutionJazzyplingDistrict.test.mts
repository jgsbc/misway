import assert from "node:assert/strict";
import test from "node:test";
import { drift3dLandmarks } from "./drift3dLandmarks";
import { drift3dTrackNodeBySlug } from "./drift3dTopology";
import {
  DRIFT_EVOLUTION_JAZZYPLING_CELLARS,
  DRIFT_EVOLUTION_JAZZYPLING_CENTER,
  DRIFT_EVOLUTION_JAZZYPLING_LANDMARK_ID,
  DRIFT_EVOLUTION_JAZZYPLING_ROUTE,
  DRIFT_EVOLUTION_JAZZYPLING_SOURCE_LANDMARK_ID,
  buildDriftEvolutionJazzyplingDistrictLandmark,
  getDriftEvolutionJazzyplingDistrictIssues,
} from "./driftEvolutionJazzyplingDistrict";
import {
  isJazzyplingStagedForEvolution,
  restoreJazzyplingAfterEvolution,
  stageJazzyplingForEvolution,
} from "./driftEvolutionJazzyplingRegistry";
import { DRIFT_EVOLUTION_ZEELAND_ROUTE } from "./driftEvolutionZeelandGeography";

test("Jazzypling lab route branches from Zeeland south and opens toward Play It", () => {
  assert.deepEqual(getDriftEvolutionJazzyplingDistrictIssues(), []);
  assert.deepEqual(DRIFT_EVOLUTION_JAZZYPLING_CENTER, { x: -68, z: 14 });
  assert.deepEqual(DRIFT_EVOLUTION_JAZZYPLING_ROUTE[0], DRIFT_EVOLUTION_ZEELAND_ROUTE[3]);

  const playIt = drift3dTrackNodeBySlug["play-it"].position;
  const last = DRIFT_EVOLUTION_JAZZYPLING_ROUTE[DRIFT_EVOLUTION_JAZZYPLING_ROUTE.length - 1];
  assert.ok(
    Math.hypot(last.x - playIt.x, last.z - playIt.z) <
      Math.hypot(
        DRIFT_EVOLUTION_JAZZYPLING_CENTER.x - playIt.x,
        DRIFT_EVOLUTION_JAZZYPLING_CENTER.z - playIt.z
      )
  );
});

test("Jazzypling lab scene reads as a multi-cellar district", () => {
  const landmark = buildDriftEvolutionJazzyplingDistrictLandmark();
  assert.equal(landmark.id, DRIFT_EVOLUTION_JAZZYPLING_LANDMARK_ID);
  assert.equal(DRIFT_EVOLUTION_JAZZYPLING_CELLARS.length, 6);

  const buildingMasses = landmark.primitives.filter(
    (primitive) => primitive.solid && primitive.kind === "box" && primitive.args[1] >= 3.8
  );
  assert.equal(buildingMasses.length, 10);
  assert.ok(
    landmark.primitives.filter((primitive) => primitive.pointLight).length >=
      DRIFT_EVOLUTION_JAZZYPLING_CELLARS.length
  );
  assert.equal(landmark.primitives.some((primitive) => primitive.water), false);
});

test("Jazzypling staging is evolution-only and restores the inherited landmark exactly", () => {
  restoreJazzyplingAfterEvolution();
  const sourceIndex = drift3dLandmarks.findIndex(
    (landmark) => landmark.id === DRIFT_EVOLUTION_JAZZYPLING_SOURCE_LANDMARK_ID
  );
  const source = drift3dLandmarks[sourceIndex];
  const originalOrder = drift3dLandmarks.map((landmark) => landmark.id);

  assert.ok(sourceIndex >= 0);
  assert.ok(source);
  assert.equal(isJazzyplingStagedForEvolution(), false);

  stageJazzyplingForEvolution();
  assert.equal(isJazzyplingStagedForEvolution(), true);
  assert.equal(drift3dLandmarks[sourceIndex].id, DRIFT_EVOLUTION_JAZZYPLING_LANDMARK_ID);

  restoreJazzyplingAfterEvolution();
  assert.strictEqual(drift3dLandmarks[sourceIndex], source);
  assert.deepEqual(drift3dLandmarks.map((landmark) => landmark.id), originalOrder);
});
