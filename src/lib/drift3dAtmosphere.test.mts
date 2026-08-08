import assert from "node:assert/strict";
import test from "node:test";
import { getDrift3DAtmosphereAt } from "@/lib/drift3dAtmosphere";
import { drift3dTrackNodeBySlug } from "@/lib/drift3dTopology";

test("neutral New Signal is not polluted by distant local track atmospheres", () => {
  const atmosphere = getDrift3DAtmosphereAt({ x: 84.5, z: -178.7 });

  assert.ok(atmosphere.exposure > 0.97);
  assert.ok(atmosphere.sunIntensity > 0.82);
  assert.ok(atmosphere.ambientIntensity > 0.095);
  assert.ok(atmosphere.fogDensity < 0.016);
});

test("Hold the Light storm remains strong inside its authored local radius", () => {
  const center = drift3dTrackNodeBySlug["hold-the-light"].position;
  const atmosphere = getDrift3DAtmosphereAt(center);

  assert.ok(atmosphere.fogDensity > 0.025);
  assert.ok(atmosphere.exposure < 0.9);
});

test("Hold the Light storm no longer leaks beyond its authored radius", () => {
  const center = drift3dTrackNodeBySlug["hold-the-light"].position;
  const outside = getDrift3DAtmosphereAt({ x: center.x + 9.1, z: center.z });

  assert.ok(outside.fogDensity < 0.016);
  assert.ok(outside.exposure > 0.96);
});
