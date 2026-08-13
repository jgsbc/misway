import assert from "node:assert/strict";
import test from "node:test";
import { getDrift3DVehicleEngineProfile } from "@/lib/drift3dAmbience";

test("vehicle engine keeps an audible low diesel idle", () => {
  const idle = getDrift3DVehicleEngineProfile({
    gear: 1,
    normalizedRevs: 0.24,
  });

  assert.ok(idle.baseFrequency >= 40 && idle.baseFrequency < 55);
  assert.ok(idle.overtoneFrequency > idle.baseFrequency);
  assert.ok(idle.filterFrequency > 300);
  assert.ok(idle.gain > 0.3);
});

test("vehicle engine climbs through a gear then audibly drops on upshift", () => {
  const topOfFirst = getDrift3DVehicleEngineProfile({
    gear: 1,
    normalizedRevs: 0.98,
  });
  const startOfSecond = getDrift3DVehicleEngineProfile({
    gear: 2,
    normalizedRevs: 0.28,
  });

  assert.ok(topOfFirst.baseFrequency > startOfSecond.baseFrequency);
  assert.ok(topOfFirst.overtoneFrequency > startOfSecond.overtoneFrequency);
  assert.ok(topOfFirst.filterFrequency > startOfSecond.filterFrequency);
});

test("vehicle engine clamps revs and keeps reverse slightly lower", () => {
  const forward = getDrift3DVehicleEngineProfile({
    gear: 1,
    normalizedRevs: 1,
  });
  const overspeed = getDrift3DVehicleEngineProfile({
    gear: 4,
    normalizedRevs: 2,
  });
  const reverse = getDrift3DVehicleEngineProfile({
    gear: -1,
    normalizedRevs: 1,
  });

  assert.deepEqual(overspeed, forward);
  assert.ok(reverse.baseFrequency < forward.baseFrequency);
  assert.ok(reverse.overtoneFrequency < forward.overtoneFrequency);
});
