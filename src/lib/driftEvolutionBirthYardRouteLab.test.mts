import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  DRIFT_EVOLUTION_BIRTH_YARD_ROUTE_LAB_LANDMARK_ID,
  DRIFT_EVOLUTION_BIRTH_YARD_ROUTE_LAB_ROUTES,
  buildDriftEvolutionBirthYardRouteLabLandmark,
  getDriftEvolutionBirthYardRouteLabIssues,
} from "./driftEvolutionBirthYardRouteLab";
import {
  DRIFT_EVOLUTION_FOOLFOULE_CENTER,
  DRIFT_EVOLUTION_FOOLFOULE_CORRIDOR,
} from "./driftEvolutionFoolfoule";
import { DRIFT_EVOLUTION_JAZZYPLING_ROUTE } from "./driftEvolutionJazzyplingDistrict";
import { DRIFT_EVOLUTION_ZEELAND_ROUTE } from "./driftEvolutionZeelandGeography";
import { drift3dTrackNodeBySlug } from "./drift3dTopology";

type GraphEdge = {
  id: string;
  status: string;
};

type BirthYardGraph = {
  edges: GraphEdge[];
};

const graph = JSON.parse(
  readFileSync(
    new URL("../../docs/DRIFT_3D_BIRTH_YARD_SPATIAL_GRAPH.json", import.meta.url),
    "utf8"
  )
) as BirthYardGraph;

function routeByEdge(edgeId: string) {
  return DRIFT_EVOLUTION_BIRTH_YARD_ROUTE_LAB_ROUTES.find(
    (route) => route.graphEdgeId === edgeId
  );
}

function first<T>(values: readonly T[]) {
  const value = values[0];
  assert.ok(value);
  return value;
}

function last<T>(values: readonly T[]) {
  const value = values[values.length - 1];
  assert.ok(value);
  return value;
}

test("BY-10 implements exactly the five BY-00 proposed Birth Yard edges", () => {
  const proposedEdgeIds = graph.edges
    .filter((edge) => edge.status === "proposed")
    .map((edge) => edge.id)
    .sort();
  const labEdgeIds = DRIFT_EVOLUTION_BIRTH_YARD_ROUTE_LAB_ROUTES.map(
    (route) => route.graphEdgeId
  ).sort();

  assert.deepEqual(labEdgeIds, proposedEdgeIds);
  assert.equal(labEdgeIds.length, 5);
  assert.equal(new Set(labEdgeIds).size, 5);
});

test("main-loop additions connect the accepted/proven Birth Yard mouths without moving nodes", () => {
  const foolfouleSugared = routeByEdge("foolfoule-sugared-peach");
  const sugaredPlay = routeByEdge("sugared-peach-play-it");
  const playJazzypling = routeByEdge("play-it-jazzypling");
  assert.ok(foolfouleSugared && sugaredPlay && playJazzypling);

  assert.deepEqual(first(foolfouleSugared.points), {
    x: DRIFT_EVOLUTION_FOOLFOULE_CORRIDOR.maxX,
    z: DRIFT_EVOLUTION_FOOLFOULE_CENTER.z,
  });
  assert.deepEqual(last(foolfouleSugared.points), {
    x: drift3dTrackNodeBySlug["sugared-peach"].position.x,
    z: drift3dTrackNodeBySlug["sugared-peach"].position.z,
  });

  assert.deepEqual(first(sugaredPlay.points), last(foolfouleSugared.points));
  assert.deepEqual(last(sugaredPlay.points), {
    x: drift3dTrackNodeBySlug["play-it"].position.x,
    z: drift3dTrackNodeBySlug["play-it"].position.z,
  });

  assert.deepEqual(first(playJazzypling.points), last(sugaredPlay.points));
  assert.deepEqual(
    last(playJazzypling.points),
    DRIFT_EVOLUTION_JAZZYPLING_ROUTE[
      DRIFT_EVOLUTION_JAZZYPLING_ROUTE.length - 1
    ]
  );
});

test("Funky Hoo remains a quay spur and crosses Zeeland water only on the authored service bridge", () => {
  const funky = routeByEdge("zeeland-funky-hoo");
  assert.ok(funky);
  assert.equal(funky.role, "spur");
  assert.deepEqual(first(funky.points), DRIFT_EVOLUTION_ZEELAND_ROUTE[4]);
  assert.deepEqual(last(funky.points), {
    x: drift3dTrackNodeBySlug["funky-hoo"].position.x,
    z: drift3dTrackNodeBySlug["funky-hoo"].position.z,
  });
  assert.deepEqual(funky.waterCrossing, {
    kind: "service_bridge",
    centerZ: 33.1,
    eastBankX: -77.4,
    westBankX: -82.6,
  });
  assert.ok(funky.turnaround);
});

test("Peut-etre is a Jazzypling spur, not an Entry shortcut", () => {
  const peutEtre = routeByEdge("jazzypling-peut-etre");
  assert.ok(peutEtre);
  assert.equal(peutEtre.role, "spur");
  assert.deepEqual(first(peutEtre.points), DRIFT_EVOLUTION_JAZZYPLING_ROUTE[1]);
  assert.deepEqual(last(peutEtre.points), {
    x: drift3dTrackNodeBySlug["peut-etre"].position.x,
    z: drift3dTrackNodeBySlug["peut-etre"].position.z,
  });
  assert.ok(peutEtre.turnaround);

  const entryExit = DRIFT_EVOLUTION_ZEELAND_ROUTE[0];
  const closest = Math.min(
    ...peutEtre.points.map((point) =>
      Math.hypot(point.x - entryExit.x, point.z - entryExit.z)
    )
  );
  assert.ok(closest > 7, `Peut-etre spur comes ${closest.toFixed(2)}m from Entry exit`);
});

test("Birth Yard route lab stays inside the compact world, follows terrain and avoids unauthorised water", () => {
  assert.deepEqual(getDriftEvolutionBirthYardRouteLabIssues(), []);
});

test("route lab is a lightweight non-collider road layer", () => {
  const landmark = buildDriftEvolutionBirthYardRouteLabLandmark();
  assert.equal(landmark.id, DRIFT_EVOLUTION_BIRTH_YARD_ROUTE_LAB_LANDMARK_ID);
  assert.ok(landmark.primitives.length >= 20);
  assert.equal(landmark.primitives.some((primitive) => primitive.water), false);
  assert.equal(landmark.primitives.some((primitive) => primitive.solid), false);
});

test("BY-10 mounts only in drift-evolution and leaves production scene untouched", () => {
  const evolutionScene = readFileSync(
    new URL("../components/drift-evolution/DriftEvolutionScene.tsx", import.meta.url),
    "utf8"
  );
  const productionScene = readFileSync(
    new URL("../components/drift-3d/Drift3DScene.tsx", import.meta.url),
    "utf8"
  );

  assert.match(evolutionScene, /buildDriftEvolutionBirthYardRouteLabLandmark/);
  assert.match(evolutionScene, /birthYardRouteLabLandmark/);
  assert.doesNotMatch(productionScene, /BirthYardRouteLab|birthYardRouteLab/);
});
