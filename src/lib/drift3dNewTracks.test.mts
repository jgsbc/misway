import assert from "node:assert/strict";
import test from "node:test";
import {
  drift3dEraById,
  drift3dTrackNodeBySlug,
  validateDrift3DTopology,
} from "./drift3dTopology";
import { getTrackBySlug } from "./tracks";

const additions = [
  { slug: "funky-hoo", eraId: "birth-yard", position: { x: -96, z: 40 } },
  { slug: "peut-etre", eraId: "birth-yard", position: { x: -96, z: 0 } },
  { slug: "sugared-peach", eraId: "birth-yard", position: { x: -48, z: 46 } },
  { slug: "white-clouds", eraId: "vegetative-field", position: { x: -22, z: 30 } },
  { slug: "assokam", eraId: "new-signal", position: { x: 102, z: -24 } },
  { slug: "wo-ha", eraId: "new-signal", position: { x: 22, z: -44 } },
  { slug: "amidir", eraId: "new-signal", position: { x: 56, z: -66 } },
] as const;

test("new MISWAY titles are registered once in their intended eras", () => {
  for (const addition of additions) {
    const track = getTrackBySlug(addition.slug);
    const node = drift3dTrackNodeBySlug[addition.slug];
    const era = drift3dEraById[addition.eraId];

    assert.ok(track, `missing track metadata: ${addition.slug}`);
    assert.ok(node, `missing topology node: ${addition.slug}`);
    assert.equal(node.eraId, addition.eraId);
    assert.equal(
      era.trackSlugs.filter((slug) => slug === addition.slug).length,
      1,
      `unexpected era membership count: ${addition.slug}`
    );
    assert.deepEqual(
      { x: node.position.x, z: node.position.z },
      addition.position
    );

    const distanceToEraCenter = Math.hypot(
      node.position.x - era.center.x,
      node.position.z - era.center.z
    );
    assert.ok(
      distanceToEraCenter <= era.radius,
      `${addition.slug} falls outside ${addition.eraId}`
    );
  }
});

test("AMIDIR replaces ETEEAOOETE rather than duplicating the finale", () => {
  assert.equal(getTrackBySlug("eteeaooete"), undefined);
  assert.equal(drift3dTrackNodeBySlug.eteeaooete, undefined);
  assert.equal(drift3dEraById["new-signal"].trackSlugs.at(-1), "amidir");
  assert.equal(getTrackBySlug("amidir")?.audioSrc, "/audio/amidir.mp3");
});

test("canonical topology remains internally valid after the additions", () => {
  assert.deepEqual(validateDrift3DTopology(), { ok: true, issues: [] });
});
