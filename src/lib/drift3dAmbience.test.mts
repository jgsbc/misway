import assert from "node:assert/strict";
import test from "node:test";
import { getDrift3DVehicleEngineProfile } from "@/lib/drift3dAmbience";

test("vehicle engine keeps an audible idle profile", () => {
  assert.deepEqual(getDrift3DVehicleEngineProfile(0), {
    baseFrequency: 38,
    overtoneFrequency: 76,
    gain: 0.34,
  });
});

test("vehicle engine revs rise smoothly with speed", () => {
  const idle = getDrift3DVehicleEngineProfile(0);
  const cruise = getDrift3DVehicleEngineProfile(0.25);
  const fullSpeed = getDrift3DVehicleEngineProfile(1);

  assert.ok(cruise.baseFrequency > idle.baseFrequency);
  assert.ok(fullSpeed.baseFrequency > cruise.baseFrequency);
  assert.ok(fullSpeed.overtoneFrequency > cruise.overtoneFrequency);
  assert.ok(fullSpeed.gain > cruise.gain);
});

test("vehicle engine clamps overspeed and treats reverse as speed", () => {
  assert.deepEqual(
    getDrift3DVehicleEngineProfile(2),
    getDrift3DVehicleEngineProfile(1)
  );
  assert.deepEqual(
    getDrift3DVehicleEngineProfile(-0.5),
    getDrift3DVehicleEngineProfile(0.5)
  );
});
