import assert from "node:assert/strict";
import test from "node:test";
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
