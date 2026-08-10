import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { drift3dEras, drift3dTrackNodes } from "./drift3dTopology";

type GraphNode = {
  slug: string;
  graphRole: string;
  topologyPosition: { x: number; z: number };
  graphAnchorPosition: { x: number; z: number };
  placementBasis: string;
  territoryDecision: string;
};

type GraphEdge = {
  id: string;
  from: string;
  to: string;
  status: string;
  role: string;
  bidirectional: boolean;
  constraint: string;
};

type BirthYardGraph = {
  lot: string;
  status: string;
  coordinatePolicy: string;
  entryPolicy: string;
  mainLoop: string[];
  nodes: GraphNode[];
  edges: GraphEdge[];
  futureOpenDecisions: string[];
  nextLot: string;
};

const graph = JSON.parse(
  readFileSync(
    new URL("../../docs/DRIFT_3D_BIRTH_YARD_SPATIAL_GRAPH.json", import.meta.url),
    "utf8"
  )
) as BirthYardGraph;

const birthYard = drift3dEras.find((era) => era.id === "birth-yard");
assert.ok(birthYard);

const topologyBySlug = new Map<string, { x: number; z: number }>(
  drift3dTrackNodes
    .filter((node) => node.eraId === "birth-yard")
    .map((node) => [node.trackSlug, { x: node.position.x, z: node.position.z }])
);

function sorted(values: readonly string[]) {
  return [...values].sort((a, b) => a.localeCompare(b));
}

function trackAdjacency() {
  const adjacency = new Map<string, Set<string>>();
  for (const node of graph.nodes) adjacency.set(node.slug, new Set());

  for (const edge of graph.edges) {
    if (edge.from === "entry") continue;
    adjacency.get(edge.from)?.add(edge.to);
    if (edge.bidirectional) adjacency.get(edge.to)?.add(edge.from);
  }

  return adjacency;
}

test("Birth Yard graph covers exactly the seven active Birth Yard tracks", () => {
  assert.equal(graph.lot, "DRIFT-SPATIAL-BY-00");
  assert.equal(graph.nodes.length, 7);
  assert.equal(new Set(graph.nodes.map((node) => node.slug)).size, 7);
  assert.deepEqual(
    sorted(graph.nodes.map((node) => node.slug)),
    sorted(birthYard.trackSlugs)
  );
  assert.equal(graph.nodes.some((node) => node.slug === "eux-gainent"), false);
  assert.equal(graph.nodes.some((node) => node.slug === "eteeaooete"), false);
});

test("graph proposal reuses current topology anchors instead of moving nodes", () => {
  assert.equal(graph.coordinatePolicy, "REUSE_CURRENT_ANCHORS_NO_NODE_MOVE");

  for (const node of graph.nodes) {
    const topology = topologyBySlug.get(node.slug);
    assert.ok(topology, `${node.slug}: missing Birth Yard topology node`);
    assert.deepEqual(
      node.topologyPosition,
      topology,
      `${node.slug}: proposal silently changed raw topology coordinates`
    );
  }

  const zeeland = graph.nodes.find((node) => node.slug === "a-walk-in-zeeland");
  assert.ok(zeeland);
  assert.deepEqual(zeeland.topologyPosition, { x: -88, z: 20 });
  assert.deepEqual(zeeland.graphAnchorPosition, { x: -76, z: 23 });
  assert.equal(zeeland.placementBasis, "production_promoted");
});

test("Entry can reveal only Zeeland before Birth Yard branches", () => {
  assert.equal(graph.entryPolicy, "ENTRY_REVEALS_ZEELAND_FIRST_NO_BYPASS");
  const entryEdges = graph.edges.filter((edge) => edge.from === "entry");
  assert.equal(entryEdges.length, 1);
  assert.equal(entryEdges[0].to, "a-walk-in-zeeland");
  assert.equal(entryEdges[0].status, "production_promoted");
  assert.equal(entryEdges[0].bidirectional, false);
});

test("main urban loop uses Zeeland, Foolfoule, Sugared Peach, Play It and Jazzypling", () => {
  assert.deepEqual(graph.mainLoop, [
    "a-walk-in-zeeland",
    "foolfoule",
    "sugared-peach",
    "play-it",
    "jazzypling",
    "a-walk-in-zeeland",
  ]);

  const adjacency = trackAdjacency();
  for (let index = 0; index < graph.mainLoop.length - 1; index += 1) {
    const from = graph.mainLoop[index];
    const to = graph.mainLoop[index + 1];
    assert.ok(adjacency.get(from)?.has(to), `${from} must connect to ${to}`);
  }
});

test("all seven Birth Yard tracks are connected to the Zeeland gateway", () => {
  const adjacency = trackAdjacency();
  const seen = new Set<string>();
  const queue = ["a-walk-in-zeeland"];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || seen.has(current)) continue;
    seen.add(current);
    for (const next of adjacency.get(current) ?? []) {
      if (!seen.has(next)) queue.push(next);
    }
  }

  assert.deepEqual(sorted([...seen]), sorted(graph.nodes.map((node) => node.slug)));
});

test("Funky Hoo and Peut-etre remain purposeful spurs rather than forced loop districts", () => {
  const adjacency = trackAdjacency();
  assert.deepEqual([...adjacency.get("funky-hoo") ?? []], ["a-walk-in-zeeland"]);
  assert.deepEqual([...adjacency.get("peut-etre") ?? []], ["jazzypling"]);

  const funky = graph.nodes.find((node) => node.slug === "funky-hoo");
  const peutEtre = graph.nodes.find((node) => node.slug === "peut-etre");
  assert.equal(funky?.graphRole, "west_quay_spur");
  assert.equal(peutEtre?.graphRole, "southern_fringe_spur");
  assert.match(funky?.territoryDecision ?? "", /Zeeland harbour/i);
  assert.match(peutEtre?.territoryDecision ?? "", /partially buried/i);
});

test("existing promoted and lab spatial evidence is preserved, not upgraded", () => {
  const edgeById = new Map(graph.edges.map((edge) => [edge.id, edge]));
  assert.equal(edgeById.get("entry-zeeland")?.status, "production_promoted");
  assert.equal(edgeById.get("zeeland-foolfoule")?.status, "production_promoted");
  assert.equal(edgeById.get("jazzypling-zeeland")?.status, "lab_implemented");

  for (const id of [
    "foolfoule-sugared-peach",
    "sugared-peach-play-it",
    "play-it-jazzypling",
    "zeeland-funky-hoo",
    "jazzypling-peut-etre",
  ]) {
    assert.equal(edgeById.get(id)?.status, "proposed", `${id} must remain proposed`);
  }
});

test("proposed direct anchor chords stay compact enough for a Birth Yard lab proof", () => {
  const anchorBySlug = new Map(
    graph.nodes.map((node) => [node.slug, node.graphAnchorPosition] as const)
  );

  for (const edge of graph.edges.filter(
    (candidate) => candidate.status === "proposed" && candidate.from !== "entry"
  )) {
    const from = anchorBySlug.get(edge.from);
    const to = anchorBySlug.get(edge.to);
    assert.ok(from && to, `${edge.id}: missing graph anchor`);
    const chord = Math.hypot(to.x - from.x, to.z - from.z);
    assert.ok(chord <= 36, `${edge.id}: ${chord.toFixed(1)}m chord is too large for a short Birth Yard link`);
  }
});

test("inter-era handoff and route polylines stay explicitly open for later lots", () => {
  assert.ok(
    graph.futureOpenDecisions.some((decision) => decision.includes("exact lab polylines"))
  );
  assert.ok(
    graph.futureOpenDecisions.some((decision) => decision.includes("Older Shadows"))
  );
  assert.match(graph.nextLot, /DRIFT-SPATIAL-BY-10/);
});
