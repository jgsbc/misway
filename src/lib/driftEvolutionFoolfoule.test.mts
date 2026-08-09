import assert from "node:assert/strict";
import test from "node:test";
import { drift3dLandmarks } from "./drift3dLandmarks";
import { drift3dTrackNodeBySlug } from "./drift3dTopology";
import { DRIFT_EVOLUTION_ZEELAND_BASIN } from "./driftEvolutionZeelandGeography";
import {
  DRIFT_EVOLUTION_FOOLFOULE_CENTER,
  DRIFT_EVOLUTION_FOOLFOULE_CORRIDOR,
  DRIFT_EVOLUTION_FOOLFOULE_CROWD,
  DRIFT_EVOLUTION_FOOLFOULE_CROWD_FLOWS,
  DRIFT_EVOLUTION_FOOLFOULE_LANDMARK_ID,
  DRIFT_EVOLUTION_FOOLFOULE_SOURCE_LANDMARK_ID,
  buildDriftEvolutionFoolfouleLandmark,
  getDriftEvolutionFoolfouleIssues,
  sampleDriftEvolutionFoolfouleCrowdFlow,
} from "./driftEvolutionFoolfoule";
import {
  isFoolfouleStagedForEvolution,
  restoreFoolfouleAfterEvolution,
  stageFoolfouleForEvolution,
} from "./driftEvolutionFoolfouleRegistry";

test("Foolfoule grows east from Zeeland without blocking the harbour or drive corridor", () => {
  assert.deepEqual(getDriftEvolutionFoolfouleIssues(), []);
  assert.deepEqual(DRIFT_EVOLUTION_FOOLFOULE_CENTER, { x: -62, z: 42 });
  assert.equal(DRIFT_EVOLUTION_FOOLFOULE_CORRIDOR.centerZ, 42);
  assert.ok(DRIFT_EVOLUTION_FOOLFOULE_CORRIDOR.minX < -68);
  assert.ok(DRIFT_EVOLUTION_FOOLFOULE_CORRIDOR.maxX > -50);

  const basinEast =
    DRIFT_EVOLUTION_ZEELAND_BASIN.centerX + DRIFT_EVOLUTION_ZEELAND_BASIN.width / 2;
  const landmark = buildDriftEvolutionFoolfouleLandmark();
  assert.equal(landmark.id, DRIFT_EVOLUTION_FOOLFOULE_LANDMARK_ID);
  assert.deepEqual(landmark.origin, DRIFT_EVOLUTION_FOOLFOULE_CENTER);
  assert.equal(landmark.primitives.some((primitive) => primitive.water), false);

  const solidBuildings = landmark.primitives.filter((primitive) => primitive.solid);
  assert.equal(solidBuildings.length, 8);
  assert.ok(
    solidBuildings.every((primitive) => {
      const worldX = DRIFT_EVOLUTION_FOOLFOULE_CENTER.x + primitive.offset[0];
      const halfWidth = primitive.kind === "box" ? primitive.args[0] / 2 : 0;
      return worldX - halfWidth > basinEast;
    }),
    "commercial masses must remain east of Zeeland harbour water"
  );

  const tall = solidBuildings.filter(
    (primitive) => primitive.kind === "box" && primitive.args[1] >= 4.8
  );
  assert.equal(tall.length, 8);
});

test("Foolfoule crowd is a bounded opposing-flow pressure field", () => {
  assert.equal(DRIFT_EVOLUTION_FOOLFOULE_CROWD_FLOWS.length, 4);
  assert.equal(
    DRIFT_EVOLUTION_FOOLFOULE_CROWD_FLOWS.reduce(
      (sum, flow) => sum + flow.slots,
      0
    ),
    DRIFT_EVOLUTION_FOOLFOULE_CROWD.count
  );
  assert.equal(DRIFT_EVOLUTION_FOOLFOULE_CROWD.count, 100);

  const flow = DRIFT_EVOLUTION_FOOLFOULE_CROWD_FLOWS[0];
  const start = sampleDriftEvolutionFoolfouleCrowdFlow(flow, 0, 0);
  const wrapped = sampleDriftEvolutionFoolfouleCrowdFlow(flow, 1, 0);
  assert.deepEqual(wrapped, start);

  const clamped = sampleDriftEvolutionFoolfouleCrowdFlow(
    flow,
    0.5,
    flow.halfWidth * 10
  );
  const centerline = sampleDriftEvolutionFoolfouleCrowdFlow(flow, 0.5, 0);
  assert.ok(Math.hypot(clamped.x - centerline.x, clamped.z - centerline.z) <= flow.halfWidth + 0.001);
});

test("Foolfoule evolution staging replaces only the local diorama and restores it exactly", () => {
  restoreFoolfouleAfterEvolution();
  const node = drift3dTrackNodeBySlug.foolfoule;
  const originalNode = { x: node.position.x, z: node.position.z };
  const originalIndex = drift3dLandmarks.findIndex(
    (candidate) => candidate.id === DRIFT_EVOLUTION_FOOLFOULE_SOURCE_LANDMARK_ID
  );
  const originalLandmark = drift3dLandmarks[originalIndex];
  assert.ok(originalIndex >= 0);
  assert.ok(originalLandmark);

  try {
    stageFoolfouleForEvolution();
    assert.equal(isFoolfouleStagedForEvolution(), true);
    assert.equal(
      drift3dLandmarks[originalIndex]?.id,
      DRIFT_EVOLUTION_FOOLFOULE_LANDMARK_ID
    );
    assert.deepEqual(
      { x: node.position.x, z: node.position.z },
      originalNode,
      "canonical Foolfoule node must never move"
    );
  } finally {
    restoreFoolfouleAfterEvolution();
  }

  assert.equal(isFoolfouleStagedForEvolution(), false);
  assert.equal(drift3dLandmarks[originalIndex], originalLandmark);
  assert.deepEqual({ x: node.position.x, z: node.position.z }, originalNode);
});
