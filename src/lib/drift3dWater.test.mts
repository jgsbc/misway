import assert from "node:assert/strict";
import test from "node:test";
import {
  DRIFT_3D_PENINSULA_REGIONS,
  DRIFT_3D_SEA_LEVEL,
  drift3dPeninsulaPoint,
} from "@/lib/drift3dPeninsula";
import { getDrift3DTerrainHeight } from "@/lib/drift3dTerrain";
import {
  getDrift3DWaterDepth,
  isDrift3DWater,
} from "@/lib/drift3dWater";

function region(id: string) {
  const found = DRIFT_3D_PENINSULA_REGIONS.find((candidate) => candidate.id === id);
  assert.ok(found, `missing region ${id}`);
  return found;
}

function hasWetDryTransition(
  fromSourceX: number,
  fromSourceZ: number,
  toSourceX: number,
  toSourceZ: number,
  steps: number
) {
  let previous: boolean | null = null;
  let wet = false;
  let dry = false;
  let transition = false;

  for (let index = 0; index <= steps; index += 1) {
    const t = index / steps;
    const sourceX = fromSourceX + (toSourceX - fromSourceX) * t;
    const sourceZ = fromSourceZ + (toSourceZ - fromSourceZ) * t;
    const point = drift3dPeninsulaPoint(sourceX, sourceZ);
    const current = isDrift3DWater(point.x, point.z);

    wet ||= current;
    dry ||= !current;
    transition ||= previous !== null && previous !== current;
    previous = current;
  }

  return { wet, dry, transition };
}

test("sea level has one canonical metric authority", () => {
  assert.equal(DRIFT_3D_SEA_LEVEL, 0);
});

test("central bay is materially submerged", () => {
  const bay = region("central-bay");
  const depth = getDrift3DWaterDepth(bay.x, bay.z);

  assert.ok(depth >= 5, `central bay depth=${depth}`);
  assert.equal(isDrift3DWater(bay.x, bay.z), true);
});

test("southern New Signal edge exposes real ocean depth", () => {
  const ocean = drift3dPeninsulaPoint(60, -220);
  const depth = getDrift3DWaterDepth(ocean.x, ocean.z);

  assert.ok(depth >= 4, `southern ocean depth=${depth}`);
  assert.equal(isDrift3DWater(ocean.x, ocean.z), true);
});

test("Birth Yard remains dry at its authored regional center", () => {
  const birthYard = region("birth-yard");

  assert.ok(
    getDrift3DTerrainHeight(birthYard.x, birthYard.z) > DRIFT_3D_SEA_LEVEL,
    `Birth Yard terrain=${getDrift3DTerrainHeight(birthYard.x, birthYard.z)}`
  );
  assert.equal(isDrift3DWater(birthYard.x, birthYard.z), false);
});

test("central bay has an opposite dry eastern shore", () => {
  const result = hasWetDryTransition(350, 85, 450, 85, 40);

  assert.equal(result.wet, true);
  assert.equal(result.dry, true);
  assert.equal(result.transition, true);
});

test("southern ocean meets a real New Signal coastline", () => {
  const result = hasWetDryTransition(60, -220, 60, -120, 40);

  assert.equal(result.wet, true);
  assert.equal(result.dry, true);
  assert.equal(result.transition, true);
});

test("water depth is deterministic and never negative", () => {
  for (const [sourceX, sourceZ] of [
    [258, 85],
    [60, -220],
    [450, 85],
    [210, 350],
  ] as const) {
    const point = drift3dPeninsulaPoint(sourceX, sourceZ);
    const first = getDrift3DWaterDepth(point.x, point.z);
    const second = getDrift3DWaterDepth(point.x, point.z);

    assert.ok(Number.isFinite(first));
    assert.ok(first >= 0);
    assert.equal(first, second);
  }
});
