import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { tracks } from "./tracks";
import { drift3dEras, drift3dTrackNodes } from "./drift3dTopology";

type SpatialAtlasTrack = {
  slug: string;
  eraId: string;
  topologyPosition: { x: number; z: number };
  effectiveProductionPosition: { x: number; z: number };
  placementStatus: string;
  spatialIdentity: string;
  approachExitStatus: string;
  spatialOpenQuestions: string[];
};

type SpatialAtlas = {
  catalogue: {
    activeTrackCount: number;
    eraCounts: Record<string, number>;
    retiredSlugs: string[];
  };
  eras: Array<{ id: string; trackSlugs: string[] }>;
  tracks: SpatialAtlasTrack[];
  routeEvidence: Array<{ id: string; status: string }>;
  retired: Array<{ slug: string; status: string }>;
};

const atlas = JSON.parse(
  readFileSync(
    new URL("../../docs/DRIFT_3D_SPATIAL_ATLAS.json", import.meta.url),
    "utf8"
  )
) as SpatialAtlas;

const runtimeSlugs = tracks.map((track) => track.slug);
const runtimeSlugSet = new Set<string>(runtimeSlugs);
const topologySlugs = drift3dTrackNodes.map((node) => node.trackSlug);
const atlasSlugs = atlas.tracks.map((track) => track.slug);

function sorted(values: readonly string[]) {
  return [...values].sort((a, b) => a.localeCompare(b));
}

test("spatial atlas covers the active 32-track runtime catalogue exactly once", () => {
  assert.equal(atlas.catalogue.activeTrackCount, 32);
  assert.equal(runtimeSlugs.length, 32);
  assert.equal(new Set(atlasSlugs).size, atlasSlugs.length);
  assert.deepEqual(sorted(atlasSlugs), sorted(runtimeSlugs));
  assert.deepEqual(sorted(topologySlugs), sorted(runtimeSlugs));
});

test("spatial atlas owns current era membership instead of the retired 26-track inventory", () => {
  const expectedCounts = {
    "birth-yard": 7,
    "older-shadows": 5,
    "vegetative-field": 6,
    "new-signal": 14,
  } as const;

  assert.deepEqual(atlas.catalogue.eraCounts, expectedCounts);

  for (const era of drift3dEras) {
    assert.equal(era.trackSlugs.length, expectedCounts[era.id]);
    assert.deepEqual(
      sorted(atlas.eras.find((entry) => entry.id === era.id)?.trackSlugs ?? []),
      sorted(era.trackSlugs)
    );
  }

  const eux = atlas.tracks.find((track) => track.slug === "eux-gainent");
  assert.equal(eux?.eraId, "new-signal");
  assert.equal(runtimeSlugSet.has("eteeaooete"), false);
  assert.equal(atlasSlugs.includes("eteeaooete"), false);
  assert.ok(atlas.catalogue.retiredSlugs.includes("eteeaooete"));
  assert.ok(
    atlas.retired.some(
      (entry) => entry.slug === "eteeaooete" && entry.status === "retired"
    )
  );
});

test("raw topology coordinates are recorded without pretending they are accepted final placement", () => {
  const topologyBySlug = new Map(
    drift3dTrackNodes.map((node) => [node.trackSlug, node.position] as const)
  );

  for (const track of atlas.tracks) {
    const topology = topologyBySlug.get(track.slug);
    assert.ok(topology, `${track.slug}: missing runtime topology node`);
    assert.equal(track.topologyPosition.x, topology.x, `${track.slug}: x drift`);
    assert.equal(track.topologyPosition.z, topology.z, `${track.slug}: z drift`);
    assert.ok(track.spatialIdentity.length > 0, `${track.slug}: missing spatial identity`);
    assert.ok(track.approachExitStatus.length > 0, `${track.slug}: missing approach/exit state`);
  }
});

test("Zeeland records the promoted effective position separately from its raw topology position", () => {
  const zeeland = atlas.tracks.find(
    (track) => track.slug === "a-walk-in-zeeland"
  );
  assert.ok(zeeland);
  assert.deepEqual(zeeland.topologyPosition, { x: -88, z: 20 });
  assert.deepEqual(zeeland.effectiveProductionPosition, { x: -76, z: 23 });
  assert.equal(zeeland.placementStatus, "production_promoted");
});

test("existing spatial evidence is not silently upgraded past its real gate", () => {
  const foolfoule = atlas.tracks.find((track) => track.slug === "foolfoule");
  const jazzypling = atlas.tracks.find((track) => track.slug === "jazzypling");

  assert.equal(foolfoule?.placementStatus, "production_promoted");
  assert.equal(jazzypling?.placementStatus, "lab_implemented");

  const jazzyplingRoute = atlas.routeEvidence.find(
    (route) => route.id === "zeeland-jazzypling-playit-lab"
  );
  assert.equal(jazzyplingRoute?.status, "lab_implemented");
});

test("newer owner-meaning tracks keep open spatial decisions explicit", () => {
  const newerSlugs = [
    "funky-hoo",
    "peut-etre",
    "sugared-peach",
    "white-clouds",
    "assokam",
    "wo-ha",
    "amidir",
  ];

  for (const slug of newerSlugs) {
    const track = atlas.tracks.find((entry) => entry.slug === slug);
    assert.ok(track, `${slug}: missing atlas entry`);
    assert.equal(track?.placementStatus, "current_runtime_provisional");
    assert.ok(
      (track?.spatialOpenQuestions.length ?? 0) > 0,
      `${slug}: open spatial decisions were silently collapsed`
    );
  }
});
