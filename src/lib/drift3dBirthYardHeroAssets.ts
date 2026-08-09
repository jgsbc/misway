import { DRIFT_3D_BIRTH_YARD_HERO_URBAN } from "@/lib/drift3dBirthYardUrban";
import { drift3dTrackNodeBySlug } from "@/lib/drift3dTopology";

/**
 * Campaign B / Hero Asset Pass 01.
 *
 * External model sources are pinned to immutable revisions and carry explicit
 * provenance here rather than being scattered through render components.
 * The first integration deliberately targets a masterframe-relevant object:
 * delivery pressure outside EUX GAINENT.
 */
const KHRONOS_SAMPLE_ASSETS_REVISION =
  "2bac6f8c57bf471df0d2a1e8a8ec023c7801dddf";

export const DRIFT_3D_BIRTH_YARD_DELIVERY_TRUCK_SOURCE = Object.freeze({
  id: "khronos-cesium-milk-truck-geometry",
  modelUrl:
    `https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/${KHRONOS_SAMPLE_ASSETS_REVISION}/Models/CesiumMilkTruck/glTF-Binary/CesiumMilkTruck.glb`,
  sourcePage:
    `https://github.com/KhronosGroup/glTF-Sample-Assets/blob/${KHRONOS_SAMPLE_ASSETS_REVISION}/Models/CesiumMilkTruck/README.md`,
  license: "CC-BY-4.0 with Cesium trademark limitations",
  credit: "Cesium (2017), distributed by KhronosGroup/glTF-Sample-Assets",
  policy:
    "geometry-only: original branded textures/materials are never rendered; MISWAY neutral materials replace them",
});

const euxGainent = drift3dTrackNodeBySlug["eux-gainent"].position;
const forecourt = DRIFT_3D_BIRTH_YARD_HERO_URBAN.euxForecourt;

/**
 * The source truck is approximately real-world sized while MISWAY's already
 * validated safari 4x4 is intentionally compact in the recovered runtime.
 * Normalize the imported model to the established vehicle grammar instead of
 * changing world or player-vehicle scale.
 */
export const DRIFT_3D_BIRTH_YARD_DELIVERY_TRUCK = Object.freeze({
  x: forecourt.centerX + 2.05,
  z: forecourt.centerZ - 0.3,
  targetLength: 1.72,
  rotationY: Math.PI / 2,
  maxDistanceFromEux: 7,
});

export const DRIFT_3D_BIRTH_YARD_HERO_ASSET_AUDIT = Object.freeze({
  reused: Object.freeze([
    "EUX GAINENT living scene",
    "existing concrete/PBR material grammar",
    "canonical Birth Yard terrain/routes/water",
    "existing instanced population runtime",
  ]),
  recoveredFromFable: Object.freeze([
    "geography/route/material lessons already promoted to production",
  ]),
  selectedExternal: Object.freeze([
    DRIFT_3D_BIRTH_YARD_DELIVERY_TRUCK_SOURCE.id,
  ]),
  heldForLater: Object.freeze([
    "CC0 urban utility props only after a local/vendorable asset path is proven",
    "real character assets after the first static GLB pipeline is measured",
  ]),
});

export function getDrift3DBirthYardDeliveryTruckDistanceFromEux() {
  return Math.hypot(
    DRIFT_3D_BIRTH_YARD_DELIVERY_TRUCK.x - euxGainent.x,
    DRIFT_3D_BIRTH_YARD_DELIVERY_TRUCK.z - euxGainent.z
  );
}
