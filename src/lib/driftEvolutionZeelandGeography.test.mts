import assert from "node:assert/strict";
import test from "node:test";
import { drift3dTrackNodeBySlug } from "./drift3dTopology";
import { DRIFT_EVOLUTION_ENTRY_CAVE } from "./driftEvolutionEntryCave";
import {
  DRIFT_EVOLUTION_ZEELAND_BASIN,
  DRIFT_EVOLUTION_ZEELAND_CANAL,
  DRIFT_EVOLUTION_ZEELAND_GEOGRAPHY_LANDMARK_ID,
  DRIFT_EVOLUTION_ZEELAND_ROUTE,
  DRIFT_EVOLUTION_ZEELAND_TARGET,
  buildDriftEvolutionZeelandGeographyLandmark,
  getDriftEvolutionZeelandGeographyIssues,
} from "./driftEvolutionZeelandGeography";

test("Zeeland geography is a bounded canal-to-harbour route between Entry and Foolfoule", () => {
  assert.deepEqual(getDriftEvolutionZeelandGeographyIssues(), []);
  assert.deepEqual(DRIFT_EVOLUTION_ZEELAND_TARGET, { x: -76, z: 23 });

  assert.equal(DRIFT_EVOLUTION_ZEELAND_CANAL.centerX, -80);
  assert.equal(DRIFT_EVOLUTION_ZEELAND_CANAL.minZ, 17);
  assert.equal(DRIFT_EVOLUTION_ZEELAND_CANAL.maxZ, 48);
  assert.equal(DRIFT_EVOLUTION_ZEELAND_CANAL.halfWidth, 2.6);

  assert.deepEqual(DRIFT_EVOLUTION_ZEELAND_BASIN, {
    centerX: -77,
    centerZ: 54,
    width: 18,
    depth: 16,
  });

  const routeStart = DRIFT_EVOLUTION_ZEELAND_ROUTE[0];
  const routeEnd = DRIFT_EVOLUTION_ZEELAND_ROUTE.at(-1);
  const foolfoule = drift3dTrackNodeBySlug.foolfoule.position;
  assert.deepEqual(routeStart, {
    x: DRIFT_EVOLUTION_ENTRY_CAVE.exitX,
    z: DRIFT_EVOLUTION_ENTRY_CAVE.centerZ,
  });
  assert.ok(routeEnd);
  assert.deepEqual(routeEnd, { x: foolfoule.x, z: foolfoule.z });

  const eastCanalEdge =
    DRIFT_EVOLUTION_ZEELAND_CANAL.centerX + DRIFT_EVOLUTION_ZEELAND_CANAL.halfWidth;
  const firstRoutePointBesideWater = DRIFT_EVOLUTION_ZEELAND_ROUTE.find(
    (point) => point.z >= DRIFT_EVOLUTION_ZEELAND_CANAL.minZ
  );
  assert.ok(firstRoutePointBesideWater);
  assert.ok(firstRoutePointBesideWater.x > eastCanalEdge);

  const basinEast =
    DRIFT_EVOLUTION_ZEELAND_BASIN.centerX + DRIFT_EVOLUTION_ZEELAND_BASIN.width / 2;
  const basinNorth =
    DRIFT_EVOLUTION_ZEELAND_BASIN.centerZ + DRIFT_EVOLUTION_ZEELAND_BASIN.depth / 2;
  assert.ok(foolfoule.x > basinEast);
  assert.ok(foolfoule.z < basinNorth);
});

test("Zeeland geography landmark provides route, physical quays, bridge and low port massing", () => {
  const landmark = buildDriftEvolutionZeelandGeographyLandmark();
  assert.equal(landmark.id, DRIFT_EVOLUTION_ZEELAND_GEOGRAPHY_LANDMARK_ID);
  assert.deepEqual(landmark.origin, DRIFT_EVOLUTION_ZEELAND_TARGET);

  const solid = landmark.primitives.filter((primitive) => primitive.solid);
  const tall = landmark.primitives.filter(
    (primitive) => primitive.kind === "box" && primitive.args[1] >= 1.7
  );
  const roadLike = landmark.primitives.filter(
    (primitive) =>
      primitive.kind === "box" &&
      Math.abs(primitive.args[0] - 3.2) < 0.001 &&
      primitive.args[1] <= 0.06
  );

  assert.ok(solid.length >= 28, `expected segmented physical banks, got ${solid.length}`);
  assert.ok(tall.length >= 5, `expected bridge/port vertical markers, got ${tall.length}`);
  assert.equal(
    roadLike.length,
    DRIFT_EVOLUTION_ZEELAND_ROUTE.length - 1,
    "each masterplan leg must be visible as one road segment"
  );
  assert.equal(
    landmark.primitives.some((primitive) => primitive.water),
    false,
    "water belongs to the shared cheap evolution surface, not landmark Reflectors"
  );

  for (const primitive of solid) {
    assert.ok(
      primitive.solidRadius !== undefined && primitive.solidRadius <= 1.5,
      "long quay geometry must not create oversized circular colliders"
    );
  }
});
