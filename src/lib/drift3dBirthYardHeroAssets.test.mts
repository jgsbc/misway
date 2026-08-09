import assert from "node:assert/strict";
import test from "node:test";
import {
  DRIFT_3D_BIRTH_YARD_DELIVERY_TRUCK,
  DRIFT_3D_BIRTH_YARD_DELIVERY_TRUCK_SOURCE,
  DRIFT_3D_BIRTH_YARD_HERO_ASSET_AUDIT,
  getDrift3DBirthYardDeliveryTruckDistanceFromEux,
} from "@/lib/drift3dBirthYardHeroAssets";
import { DRIFT_3D_BIRTH_YARD_HERO_URBAN } from "@/lib/drift3dBirthYardUrban";
import { getDrift3DRouteField } from "@/lib/drift3dRoutes";

const truck = DRIFT_3D_BIRTH_YARD_DELIVERY_TRUCK;
const source = DRIFT_3D_BIRTH_YARD_DELIVERY_TRUCK_SOURCE;

test("Birth Yard first hero asset has immutable provenance and explicit licensing", () => {
  assert.match(source.modelUrl, /raw\.githubusercontent\.com\/KhronosGroup\/glTF-Sample-Assets\/[0-9a-f]{40}\//);
  assert.ok(!source.modelUrl.includes("/main/"));
  assert.match(source.license, /CC-BY-4\.0/);
  assert.match(source.credit, /Cesium/);
  assert.match(source.policy, /geometry-only/);
  assert.match(source.policy, /never rendered/);
});

test("Birth Yard delivery asset stays in the compact established vehicle grammar", () => {
  assert.ok(truck.targetLength >= 1.45);
  assert.ok(truck.targetLength <= 1.9);
});

test("Birth Yard delivery asset belongs to the EUX forecourt rather than the road", () => {
  const forecourt = DRIFT_3D_BIRTH_YARD_HERO_URBAN.euxForecourt;
  const minX = forecourt.centerX - forecourt.width / 2;
  const maxX = forecourt.centerX + forecourt.width / 2;
  const minZ = forecourt.centerZ - forecourt.depth / 2;
  const maxZ = forecourt.centerZ + forecourt.depth / 2;
  const route = getDrift3DRouteField(truck.x, truck.z);

  assert.ok(truck.x > minX && truck.x < maxX);
  assert.ok(truck.z > minZ && truck.z < maxZ);
  assert.ok(route.distance > 1.5, `delivery asset too close to route: ${route.distance}`);
  assert.ok(
    getDrift3DBirthYardDeliveryTruckDistanceFromEux() < truck.maxDistanceFromEux
  );
});

test("Hero Asset Pass 01 records reuse before external selection", () => {
  assert.ok(DRIFT_3D_BIRTH_YARD_HERO_ASSET_AUDIT.reused.length >= 4);
  assert.deepEqual(DRIFT_3D_BIRTH_YARD_HERO_ASSET_AUDIT.selectedExternal, [
    source.id,
  ]);
  assert.ok(DRIFT_3D_BIRTH_YARD_HERO_ASSET_AUDIT.heldForLater.length >= 1);
});
