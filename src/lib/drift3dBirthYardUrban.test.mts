import assert from "node:assert/strict";
import test from "node:test";
import { DRIFT_3D_BIRTH_YARD_HERO_URBAN } from "@/lib/drift3dBirthYardUrban";
import { getDrift3DRouteField } from "@/lib/drift3dRoutes";
import { DRIFT_3D_BIRTH_YARD_CANAL } from "@/lib/drift3dTerrain";
import { drift3dTrackNodeBySlug } from "@/lib/drift3dTopology";

const urban = DRIFT_3D_BIRTH_YARD_HERO_URBAN;

test("Birth Yard hero quay follows the canonical canal east bank", () => {
  const expectedBankX =
    DRIFT_3D_BIRTH_YARD_CANAL.centerX +
    DRIFT_3D_BIRTH_YARD_CANAL.outerHalfWidth;

  assert.ok(urban.quay.x > expectedBankX);
  assert.ok(urban.quay.x - expectedBankX < 0.5);
  assert.ok(urban.quay.minZ > DRIFT_3D_BIRTH_YARD_CANAL.minZ);
  assert.ok(urban.quay.maxZ < DRIFT_3D_BIRTH_YARD_CANAL.maxZ);
  assert.ok(urban.quay.maxZ - urban.quay.minZ > 25);
});

test("Birth Yard hero quay and crane stay outside the drive carriageway", () => {
  const quayRoute = getDrift3DRouteField(
    urban.quay.x,
    (urban.quay.minZ + urban.quay.maxZ) / 2
  );
  const craneRoute = getDrift3DRouteField(urban.crane.x, urban.crane.z);

  assert.ok(quayRoute.distance > 7, `quay too close to route: ${quayRoute.distance}`);
  assert.ok(craneRoute.distance > 5, `crane too close to route: ${craneRoute.distance}`);
});

test("EUX forecourt and marker remain a compact destination cluster", () => {
  const eux = drift3dTrackNodeBySlug["eux-gainent"].position;
  const forecourtDistance = Math.hypot(
    urban.euxForecourt.centerX - eux.x,
    urban.euxForecourt.centerZ - eux.z
  );
  const markerDistance = Math.hypot(
    urban.euxMarker.x - urban.euxForecourt.centerX,
    urban.euxMarker.z - urban.euxForecourt.centerZ
  );

  assert.ok(forecourtDistance < 8.5);
  assert.ok(markerDistance < 2.2);
  assert.ok(urban.euxMarker.height > 2);
});

test("Birth Yard dusk authority spans Foolfoule and EUX without becoming era-wide", () => {
  const foolfoule = drift3dTrackNodeBySlug.foolfoule.position;
  const eux = drift3dTrackNodeBySlug["eux-gainent"].position;

  for (const point of [foolfoule, eux]) {
    const distance = Math.hypot(
      point.x - urban.duskCenter.x,
      point.z - urban.duskCenter.z
    );
    assert.ok(distance < urban.duskCenter.radius * 0.65);
  }

  assert.ok(urban.duskCenter.radius < 22);
});
