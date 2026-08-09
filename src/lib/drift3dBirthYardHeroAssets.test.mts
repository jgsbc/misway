import assert from "node:assert/strict";
import test from "node:test";
import {
  DRIFT_3D_BIRTH_YARD_DELIVERY_TRUCK,
  DRIFT_3D_BIRTH_YARD_DELIVERY_TRUCK_SOURCE,
  DRIFT_3D_BIRTH_YARD_FOREGROUND_ACTORS,
  DRIFT_3D_BIRTH_YARD_HERO_ASSET_AUDIT,
  DRIFT_3D_BIRTH_YARD_PEDESTRIAN_SOURCE,
  getDrift3DBirthYardDeliveryTruckDistanceFromEux,
} from "@/lib/drift3dBirthYardHeroAssets";
import { DRIFT_3D_BIRTH_YARD_CROWD } from "@/lib/drift3dBirthYardHeroCrowd";
import { DRIFT_3D_BIRTH_YARD_HERO_URBAN } from "@/lib/drift3dBirthYardUrban";
import { getDrift3DRouteField } from "@/lib/drift3dRoutes";

const truck = DRIFT_3D_BIRTH_YARD_DELIVERY_TRUCK;
const truckSource = DRIFT_3D_BIRTH_YARD_DELIVERY_TRUCK_SOURCE;
const pedestrianSource = DRIFT_3D_BIRTH_YARD_PEDESTRIAN_SOURCE;

test("Birth Yard hero assets have immutable provenance and explicit licensing", () => {
  for (const source of [truckSource, pedestrianSource]) {
    assert.match(source.modelUrl, /raw\.githubusercontent\.com\/KhronosGroup\/glTF-Sample-Assets\/[0-9a-f]{40}\//);
    assert.ok(!source.modelUrl.includes("/main/"));
    assert.match(source.license, /CC-BY-4\.0/);
    assert.match(source.credit, /Cesium/);
  }

  assert.match(truckSource.policy, /geometry-only/);
  assert.match(truckSource.policy, /never rendered/);
  assert.equal(pedestrianSource.license, "CC-BY-4.0");
  assert.match(pedestrianSource.policy, /skinned geometry/);
  assert.ok(!pedestrianSource.license.toLowerCase().includes("trademark"));
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
  assert.ok(getDrift3DBirthYardDeliveryTruckDistanceFromEux() < truck.maxDistanceFromEux);
});

test("Hero Asset Pass 02 replaces six procedural slots without increasing crowd density", () => {
  assert.equal(DRIFT_3D_BIRTH_YARD_FOREGROUND_ACTORS.length, 6);
  assert.equal(
    DRIFT_3D_BIRTH_YARD_CROWD.count + DRIFT_3D_BIRTH_YARD_FOREGROUND_ACTORS.length,
    192
  );

  for (const actor of DRIFT_3D_BIRTH_YARD_FOREGROUND_ACTORS) {
    assert.ok(actor.flowId.startsWith("interbuilding-"));
    assert.ok(actor.progress >= 0.4 && actor.progress <= 0.65);
    assert.ok(Math.abs(actor.lateralOffset) <= 0.25);
    assert.ok(actor.targetHeight >= 0.84 && actor.targetHeight <= 0.95);
    assert.ok(actor.pace >= 0.85 && actor.pace <= 1.1);
  }
});

test("Hero Asset Pass 02 records reuse before additional external selection", () => {
  assert.ok(DRIFT_3D_BIRTH_YARD_HERO_ASSET_AUDIT.reused.length >= 5);
  assert.deepEqual(DRIFT_3D_BIRTH_YARD_HERO_ASSET_AUDIT.selectedExternal, [
    truckSource.id,
    pedestrianSource.id,
  ]);
  assert.ok(DRIFT_3D_BIRTH_YARD_HERO_ASSET_AUDIT.heldForLater.length >= 1);
});
