import assert from "node:assert/strict";
import test from "node:test";
import { drift3dLandmarks } from "./drift3dLandmarks";
import { drift3dTrackNodeBySlug } from "./drift3dTopology";
import {
  DRIFT_JAZZYPLING_ALLEY_HALF_WIDTH,
  DRIFT_JAZZYPLING_CELLARS,
  DRIFT_JAZZYPLING_CENTER,
  DRIFT_JAZZYPLING_LANDMARK_ID,
  DRIFT_JAZZYPLING_ROUTE,
  DRIFT_JAZZYPLING_SOURCE_LANDMARK_ID,
  buildDriftJazzyplingDistrictLandmark,
  getDriftJazzyplingDistrictIssues,
} from "./driftJazzyplingDistrict";
import {
  isJazzyplingDistrictStaged,
  restoreJazzyplingDistrict,
  stageJazzyplingDistrict,
} from "./driftJazzyplingRegistry";
import { DRIFT_EVOLUTION_ZEELAND_ROUTE } from "./driftEvolutionZeelandGeography";

test("Jazzypling becomes a connected cellar district between Zeeland and Play It", () => {
  assert.deepEqual(getDriftJazzyplingDistrictIssues(), []);
  assert.deepEqual(DRIFT_JAZZYPLING_CENTER, { x: -68, z: 14 });
  assert.ok(DRIFT_JAZZYPLING_ALLEY_HALF_WIDTH >= 1.7);
  assert.ok(DRIFT_JAZZYPLING_ROUTE.length >= 6);

  const zeelandApproach =
    DRIFT_EVOLUTION_ZEELAND_ROUTE[DRIFT_EVOLUTION_ZEELAND_ROUTE.length - 2];
  const first = DRIFT_JAZZYPLING_ROUTE[0];
  assert.ok(Math.hypot(first.x - zeelandApproach.x, first.z - zeelandApproach.z) <= 1.2);

  const playIt = drift3dTrackNodeBySlug["play-it"].position;
  const last = DRIFT_JAZZYPLING_ROUTE[DRIFT_JAZZYPLING_ROUTE.length - 1];
  const centerDistance = Math.hypot(
    DRIFT_JAZZYPLING_CENTER.x - playIt.x,
    DRIFT_JAZZYPLING_CENTER.z - playIt.z
  );
  assert.ok(Math.hypot(last.x - playIt.x, last.z - playIt.z) < centerDistance);
});

test("Jazzypling reads as several cellar doors rather than one isolated vignette", () => {
  const landmark = buildDriftJazzyplingDistrictLandmark();
  assert.equal(landmark.id, DRIFT_JAZZYPLING_LANDMARK_ID);
  assert.deepEqual(landmark.origin, DRIFT_JAZZYPLING_CENTER);
  assert.equal(DRIFT_JAZZYPLING_CELLARS.length, 6);

  const solidBuildings = landmark.primitives.filter(
    (primitive) => primitive.solid && primitive.kind === "box" && primitive.args[1] >= 3.8
  );
  assert.equal(solidBuildings.length, 10);

  const motivatedLights = landmark.primitives.filter(
    (primitive) => primitive.pointLight !== undefined
  );
  assert.ok(motivatedLights.length >= DRIFT_JAZZYPLING_CELLARS.length);
  assert.equal(landmark.primitives.some((primitive) => primitive.water), false);
  assert.ok(
    landmark.primitives
      .filter((primitive) => primitive.solid)
      .every((primitive) => (primitive.solidRadius ?? 0) <= 1.5)
  );
});

test("Jazzypling staging replaces only the inherited alley and restores it exactly", () => {
  restoreJazzyplingDistrict();
  const sourceIndex = drift3dLandmarks.findIndex(
    (landmark) => landmark.id === DRIFT_JAZZYPLING_SOURCE_LANDMARK_ID
  );
  const source = drift3dLandmarks[sourceIndex];
  const originalOrder = drift3dLandmarks.map((landmark) => landmark.id);

  assert.ok(sourceIndex >= 0);
  assert.ok(source);
  assert.equal(isJazzyplingDistrictStaged(), false);

  stageJazzyplingDistrict();
  assert.equal(isJazzyplingDistrictStaged(), true);
  assert.equal(drift3dLandmarks[sourceIndex].id, DRIFT_JAZZYPLING_LANDMARK_ID);
  assert.equal(
    drift3dLandmarks.some((landmark) => landmark.id === DRIFT_JAZZYPLING_SOURCE_LANDMARK_ID),
    false
  );

  restoreJazzyplingDistrict();
  assert.equal(isJazzyplingDistrictStaged(), false);
  assert.strictEqual(drift3dLandmarks[sourceIndex], source);
  assert.deepEqual(drift3dLandmarks.map((landmark) => landmark.id), originalOrder);
});
