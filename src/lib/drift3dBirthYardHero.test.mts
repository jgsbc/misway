import assert from "node:assert/strict";
import test from "node:test";
import {
  DRIFT_3D_BIRTH_YARD_CROWD,
  DRIFT_3D_BIRTH_YARD_CROWD_FLOWS,
  DRIFT_3D_BIRTH_YARD_CROWD_REFERENCE_HEIGHT,
  DRIFT_3D_BIRTH_YARD_PAVING_STRIPS,
  getDrift3DBirthYardCrowdFlowLength,
  sampleDrift3DBirthYardCrowdFlow,
} from "@/lib/drift3dBirthYardHeroCrowd";
import {
  getDrift3DHeroLandmarkHeightScale,
  shouldRenderDrift3DLegacyWater,
} from "@/lib/drift3dBirthYardHeroPresentation";
import { DRIFT_3D_SEA_LEVEL } from "@/lib/drift3dPeninsula";
import { getDrift3DRouteField } from "@/lib/drift3dRoutes";
import {
  DRIFT_3D_BIRTH_YARD_CANAL,
  getDrift3DTerrainHeight,
} from "@/lib/drift3dTerrain";
import { drift3dTrackNodeBySlug } from "@/lib/drift3dTopology";

const canal = DRIFT_3D_BIRTH_YARD_CANAL;
const middleZ = (canal.minZ + canal.maxZ) / 2;

test("Birth Yard Hero canal is a real submerged terrain trench", () => {
  const bed = getDrift3DTerrainHeight(canal.centerX, middleZ);
  assert.ok(bed <= DRIFT_3D_SEA_LEVEL - 0.75, `expected submerged canal bed, got ${bed}`);
});

test("Birth Yard Hero canal stays clear of the recovered drive route", () => {
  const route = getDrift3DRouteField(canal.centerX, middleZ);
  assert.ok(route.distance > 10, `canal is too close to route: ${route.distance}`);
  assert.equal(route.routeId, "entry-birth-yard");
});

test("Zeeland node remains a dry east-bank destination", () => {
  const zeeland = drift3dTrackNodeBySlug["a-walk-in-zeeland"].position;
  const height = getDrift3DTerrainHeight(zeeland.x, zeeland.z);
  assert.ok(height > DRIFT_3D_SEA_LEVEL, `Zeeland node should stay dry, got ${height}`);
  assert.ok(zeeland.x - canal.centerX > canal.outerHalfWidth, "Zeeland node must remain outside the canal bank");
});

test("Birth Yard canal fades back to dry terrain beyond its authored ends", () => {
  const before = getDrift3DTerrainHeight(canal.centerX, canal.minZ - 1);
  const after = getDrift3DTerrainHeight(canal.centerX, canal.maxZ + 1);
  assert.ok(before > DRIFT_3D_SEA_LEVEL);
  assert.ok(after > DRIFT_3D_SEA_LEVEL);
});

test("Birth Yard canal uses the canonical world water instead of legacy reflector tiles", () => {
  assert.equal(shouldRenderDrift3DLegacyWater("birth-zeeland-canal"), false);
  assert.equal(shouldRenderDrift3DLegacyWater("birth-jazzypling-alley"), true);
});

test("Foolfoule Hero Slice skyline stays low-rise without changing other landmarks", () => {
  const scales = [0, 1, 2, 3].map((index) =>
    getDrift3DHeroLandmarkHeightScale("birth-foolfoule-canyon", index)
  );
  assert.deepEqual(scales, [0.7, 0.72, 0.65, 0.7]);
  assert.equal(getDrift3DHeroLandmarkHeightScale("birth-eux-gainent-glass-gym", 0), 1);
});

test("Foolfoule procedural mass stays compact, dense and spans the full song corridor", () => {
  const minHeight = DRIFT_3D_BIRTH_YARD_CROWD_REFERENCE_HEIGHT * DRIFT_3D_BIRTH_YARD_CROWD.scaleMin;
  const maxHeight = DRIFT_3D_BIRTH_YARD_CROWD_REFERENCE_HEIGHT * DRIFT_3D_BIRTH_YARD_CROWD.scaleMax;
  const maxFlowLength = Math.max(...DRIFT_3D_BIRTH_YARD_CROWD_FLOWS.map(getDrift3DBirthYardCrowdFlowLength));

  assert.ok(DRIFT_3D_BIRTH_YARD_CROWD.count >= 180);
  assert.ok(maxFlowLength >= 34, `crowd corridor is too short: ${maxFlowLength}`);
  assert.ok(minHeight >= 0.8, `crowd became implausibly tiny: ${minHeight}`);
  assert.ok(maxHeight <= 0.95, `crowd remains too large: ${maxHeight}`);
});

test("Foolfoule crowd slots exactly fill the configured instance budget", () => {
  const slotCount = DRIFT_3D_BIRTH_YARD_CROWD_FLOWS.reduce((sum, flow) => sum + flow.slots, 0);
  assert.equal(slotCount, DRIFT_3D_BIRTH_YARD_CROWD.count);
});

test("most Foolfoule pedestrians circulate inside the gap between the building rows", () => {
  const centralFlows = DRIFT_3D_BIRTH_YARD_CROWD_FLOWS.filter((flow) => flow.id.startsWith("interbuilding-"));
  const centralSlots = centralFlows.reduce((sum, flow) => sum + flow.slots, 0);
  assert.ok(centralSlots >= DRIFT_3D_BIRTH_YARD_CROWD.count / 2);

  for (const flow of centralFlows) {
    for (const progress of [0, 0.25, 0.5, 0.75]) {
      const sample = sampleDrift3DBirthYardCrowdFlow(flow, progress, 0);
      assert.ok(sample.x > -2.6 && sample.x < 2.6, `${flow.id} escaped the inter-building corridor at x=${sample.x}`);
    }
  }
});

test("transverse Foolfoule flows cross through the shared gap between all four blocks", () => {
  const crossingFlows = DRIFT_3D_BIRTH_YARD_CROWD_FLOWS.filter((flow) => flow.id.startsWith("building-gap-"));
  assert.equal(crossingFlows.length, 2);

  for (const flow of crossingFlows) {
    assert.ok(Math.abs(flow.start[0]) >= 7.5);
    assert.ok(Math.abs(flow.end[0]) >= 7.5);

    for (const z of [flow.start[1], flow.end[1]]) {
      assert.ok(z > -0.65 && z < -0.05, `${flow.id} misses the authored building gap at z=${z}`);
    }

    const midpoint = sampleDrift3DBirthYardCrowdFlow(flow, 0.5, 0);
    assert.ok(Math.abs(midpoint.x) < 0.1);
    const foolfoule = drift3dTrackNodeBySlug.foolfoule.position;
    const route = getDrift3DRouteField(foolfoule.x + midpoint.x, foolfoule.z + midpoint.z);
    assert.ok(route.distance <= 0.05, `${flow.id} should visibly cross the drive route between buildings`);
  }
});

test("the remaining Foolfoule paving marks the transverse building-gap passage", () => {
  assert.equal(DRIFT_3D_BIRTH_YARD_PAVING_STRIPS.length, 1);
  const strip = DRIFT_3D_BIRTH_YARD_PAVING_STRIPS[0];
  assert.equal(strip.id, "building-gap-crossing");

  const minX = strip.centerX - strip.width / 2;
  const maxX = strip.centerX + strip.width / 2;
  const minZ = strip.centerZ - strip.depth / 2;
  const maxZ = strip.centerZ + strip.depth / 2;

  for (const flow of DRIFT_3D_BIRTH_YARD_CROWD_FLOWS.filter((candidate) => candidate.id.startsWith("building-gap-"))) {
    for (const point of [flow.start, flow.end]) {
      assert.ok(point[0] >= minX && point[0] <= maxX);
      assert.ok(point[1] >= minZ && point[1] <= maxZ);
    }
  }
});
