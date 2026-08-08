import assert from "node:assert/strict";
import test from "node:test";
import {
  DRIFT_3D_BIRTH_YARD_CROWD,
  DRIFT_3D_BIRTH_YARD_CROWD_LANES,
  DRIFT_3D_BIRTH_YARD_CROWD_REFERENCE_HEIGHT,
  DRIFT_3D_BIRTH_YARD_PAVING_STRIPS,
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

  assert.ok(
    bed <= DRIFT_3D_SEA_LEVEL - 0.75,
    `expected submerged canal bed, got ${bed}`
  );
});

test("Birth Yard Hero canal stays clear of the recovered drive route", () => {
  const route = getDrift3DRouteField(canal.centerX, middleZ);

  assert.ok(route.distance > 10, `canal is too close to route: ${route.distance}`);
  assert.equal(route.routeId, "entry-birth-yard");
});

test("Zeeland node remains a dry east-bank destination", () => {
  const zeeland = drift3dTrackNodeBySlug["a-walk-in-zeeland"].position;
  const height = getDrift3DTerrainHeight(zeeland.x, zeeland.z);

  assert.ok(
    height > DRIFT_3D_SEA_LEVEL,
    `Zeeland node should stay dry, got ${height}`
  );
  assert.ok(
    zeeland.x - canal.centerX > canal.outerHalfWidth,
    "Zeeland node must remain outside the canal bank"
  );
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
  assert.equal(
    getDrift3DHeroLandmarkHeightScale("birth-eux-gainent-glass-gym", 0),
    1
  );
});

test("Foolfoule crowd is smaller than the old figures and dense across the song area", () => {
  const minHeight =
    DRIFT_3D_BIRTH_YARD_CROWD_REFERENCE_HEIGHT *
    DRIFT_3D_BIRTH_YARD_CROWD.scaleMin;
  const maxHeight =
    DRIFT_3D_BIRTH_YARD_CROWD_REFERENCE_HEIGHT *
    DRIFT_3D_BIRTH_YARD_CROWD.scaleMax;

  assert.ok(DRIFT_3D_BIRTH_YARD_CROWD.count >= 160);
  assert.ok(DRIFT_3D_BIRTH_YARD_CROWD.zoneHalfZ * 2 >= 34);
  assert.ok(minHeight >= 1.15, `crowd became too small: ${minHeight}`);
  assert.ok(maxHeight <= 1.4, `crowd remains too large: ${maxHeight}`);
});

test("Foolfoule pedestrian lanes sit on paving and remain outside the carriageway", () => {
  const foolfoule = drift3dTrackNodeBySlug.foolfoule.position;
  const sampleZs = [
    -DRIFT_3D_BIRTH_YARD_CROWD.zoneHalfZ,
    0,
    DRIFT_3D_BIRTH_YARD_CROWD.zoneHalfZ,
  ];

  for (const lane of DRIFT_3D_BIRTH_YARD_CROWD_LANES) {
    const containingStrip = DRIFT_3D_BIRTH_YARD_PAVING_STRIPS.find((strip) => {
      const min = strip.centerX - strip.width / 2;
      const max = strip.centerX + strip.width / 2;

      return lane.minX >= min && lane.maxX <= max;
    });

    assert.ok(containingStrip, `${lane.id} is not supported by a paving strip`);

    for (const relativeX of [lane.minX, lane.maxX]) {
      for (const relativeZ of sampleZs) {
        const route = getDrift3DRouteField(
          foolfoule.x + relativeX,
          foolfoule.z + relativeZ
        );

        // Route-field distance is measured from the road edge, not its
        // centerline. Keep at least a pedestrian-sized safety margin outside
        // every sampled carriageway edge across the full song-area span.
        assert.ok(
          route.distance > 0.75,
          `${lane.id} intrudes into carriageway at ${relativeX}/${relativeZ}: ${route.distance}`
        );
      }
    }
  }
});