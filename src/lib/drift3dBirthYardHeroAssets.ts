import { DRIFT_3D_BIRTH_YARD_HERO_URBAN } from "@/lib/drift3dBirthYardUrban";
import { drift3dTrackNodeBySlug } from "@/lib/drift3dTopology";

/**
 * Campaign B / Hero Asset pipeline.
 *
 * External model sources are pinned to immutable revisions and carry explicit
 * provenance here rather than being scattered through render components.
 */
export const KHRONOS_SAMPLE_ASSETS_REVISION =
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

export const DRIFT_3D_BIRTH_YARD_PEDESTRIAN_SOURCE = Object.freeze({
  id: "khronos-rigged-figure",
  modelUrl:
    `https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/${KHRONOS_SAMPLE_ASSETS_REVISION}/Models/RiggedFigure/glTF-Binary/RiggedFigure.glb`,
  sourcePage:
    `https://github.com/KhronosGroup/glTF-Sample-Assets/blob/${KHRONOS_SAMPLE_ASSETS_REVISION}/Models/RiggedFigure/README.md`,
  license: "CC-BY-4.0",
  credit: "Cesium (2017), distributed by KhronosGroup/glTF-Sample-Assets",
  policy:
    "foreground-only: skinned geometry and authored animation are preserved; MISWAY materials, metric scale and circulation own presentation",
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

export type Drift3DBirthYardHeroActor = Readonly<{
  id: string;
  flowId: "interbuilding-northbound" | "interbuilding-southbound";
  progress: number;
  lateralOffset: number;
  pace: number;
  targetHeight: number;
  phase: number;
  color: string;
}>;

/**
 * Six readable foreground walkers replace six procedural mannequins rather
 * than adding population. They stay in the longitudinal inter-building void,
 * where they are closest/readable but do not introduce a second collision or
 * road-crossing authority. The existing procedural mass still owns the two
 * transverse crossing streams and its vehicle-yield behaviour.
 */
export const DRIFT_3D_BIRTH_YARD_FOREGROUND_ACTORS: readonly Drift3DBirthYardHeroActor[] =
  Object.freeze([
    Object.freeze({
      id: "foreground-north-a",
      flowId: "interbuilding-northbound" as const,
      progress: 0.41,
      lateralOffset: -0.24,
      pace: 0.94,
      targetHeight: 0.88,
      phase: 0.08,
      color: "#555b60",
    }),
    Object.freeze({
      id: "foreground-north-b",
      flowId: "interbuilding-northbound" as const,
      progress: 0.51,
      lateralOffset: 0.18,
      pace: 1.04,
      targetHeight: 0.92,
      phase: 0.46,
      color: "#4b5357",
    }),
    Object.freeze({
      id: "foreground-north-c",
      flowId: "interbuilding-northbound" as const,
      progress: 0.6,
      lateralOffset: -0.05,
      pace: 0.98,
      targetHeight: 0.89,
      phase: 0.67,
      color: "#625b53",
    }),
    Object.freeze({
      id: "foreground-south-a",
      flowId: "interbuilding-southbound" as const,
      progress: 0.43,
      lateralOffset: -0.18,
      pace: 0.9,
      targetHeight: 0.86,
      phase: 0.7,
      color: "#60564f",
    }),
    Object.freeze({
      id: "foreground-south-b",
      flowId: "interbuilding-southbound" as const,
      progress: 0.53,
      lateralOffset: 0.22,
      pace: 1.06,
      targetHeight: 0.93,
      phase: 0.24,
      color: "#444b50",
    }),
    Object.freeze({
      id: "foreground-south-c",
      flowId: "interbuilding-southbound" as const,
      progress: 0.62,
      lateralOffset: 0.02,
      pace: 1.02,
      targetHeight: 0.91,
      phase: 0.34,
      color: "#4d5257",
    }),
  ]);

export const DRIFT_3D_BIRTH_YARD_HERO_ASSET_AUDIT = Object.freeze({
  reused: Object.freeze([
    "EUX GAINENT living scene",
    "existing concrete/PBR material grammar",
    "canonical Birth Yard terrain/routes/water",
    "existing instanced population runtime",
    "established Foolfoule circulation flows",
  ]),
  recoveredFromFable: Object.freeze([
    "geography/route/material lessons already promoted to production",
  ]),
  selectedExternal: Object.freeze([
    DRIFT_3D_BIRTH_YARD_DELIVERY_TRUCK_SOURCE.id,
    DRIFT_3D_BIRTH_YARD_PEDESTRIAN_SOURCE.id,
  ]),
  heldForLater: Object.freeze([
    "CC0 quay/street furniture after foreground actor cost is measured",
    "foreground architecture only from a visually coherent licensed urban kit",
  ]),
});

export function getDrift3DBirthYardDeliveryTruckDistanceFromEux() {
  return Math.hypot(
    DRIFT_3D_BIRTH_YARD_DELIVERY_TRUCK.x - euxGainent.x,
    DRIFT_3D_BIRTH_YARD_DELIVERY_TRUCK.z - euxGainent.z
  );
}
