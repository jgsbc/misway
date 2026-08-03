"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Drift3DScatterField from "@/components/drift-3d/Drift3DScatterField";
import { loadDrift3DKitGltf } from "@/lib/drift3dKitGltfLoader";
import { getDrift3DKitAssetUrl } from "@/lib/drift3dKitAssets";
import {
  computeDrift3DWheelRotationDelta,
  getDrift3DNatureMovementCounts,
  getDrift3DTrafficLoopProgress,
  sampleDrift3DTrafficPath,
  type Drift3DKitPilotStatus,
  type Drift3DTrafficPath,
} from "@/lib/drift3dKitPilotConfig";
import type { Drift3DQualityTier } from "@/lib/drift3dQuality";

/**
 * DRIFT-IV-PRE-30 — Nature/Movement pilot. Reuses the existing, unmodified
 * `Drift3DScatterField` (`drift3dScatter.ts`) for vegetation — no rebuild —
 * alongside one real Kenney Car Kit vehicle (`PRE20-B01`) whose four named
 * wheel nodes are resolved and rotated procedurally as it follows a
 * deterministic closed path. Background-only: no rigid-body/collision
 * simulation, no interaction with the player's physics, no replacement of
 * the canonical sand safari 4x4.
 */

const TRAFFIC_PATH: Drift3DTrafficPath = {
  centerX: 0,
  centerZ: 0,
  radiusX: 7,
  radiusZ: 4.5,
};
const NOMINAL_SPEED_METERS_PER_SECOND = 2.4;
const WHEEL_RADIUS_METERS = 0.3;
const PATH_CIRCUMFERENCE_APPROX =
  Math.PI *
  (3 * (TRAFFIC_PATH.radiusX + TRAFFIC_PATH.radiusZ) -
    Math.sqrt(
      (3 * TRAFFIC_PATH.radiusX + TRAFFIC_PATH.radiusZ) *
        (TRAFFIC_PATH.radiusX + 3 * TRAFFIC_PATH.radiusZ)
    ));
const LOOP_DURATION_SECONDS =
  PATH_CIRCUMFERENCE_APPROX / NOMINAL_SPEED_METERS_PER_SECOND;

const VEHICLE_PART_IDS = [
  "body",
  "wheel-front-left",
  "wheel-front-right",
  "wheel-back-left",
  "wheel-back-right",
] as const;
type VehiclePartId = (typeof VEHICLE_PART_IDS)[number];
const WHEEL_PART_IDS: readonly VehiclePartId[] = [
  "wheel-front-left",
  "wheel-front-right",
  "wheel-back-left",
  "wheel-back-right",
];

type NatureMovementPilotProps = {
  qualityTier: Drift3DQualityTier;
  reducedMotion: boolean;
  statusRef: MutableRefObject<Drift3DKitPilotStatus>;
};

export default function NatureMovementPilot({
  qualityTier,
  reducedMotion,
  statusRef,
}: NatureMovementPilotProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRefs = useRef<Partial<Record<VehiclePartId, THREE.InstancedMesh>>>(
    {}
  );
  const partOffsets = useRef<Partial<Record<VehiclePartId, THREE.Vector3>>>(
    {}
  );
  const geometryCacheRef = useRef<Map<VehiclePartId, THREE.BufferGeometry>>(
    new Map()
  );
  const sharedMaterialRef = useRef<THREE.Material | null>(null);
  const wheelAngleRef = useRef<number[]>([]);
  const elapsedRef = useRef(0);
  const counts = useMemo(
    () => getDrift3DNatureMovementCounts(qualityTier),
    [qualityTier]
  );
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    wheelAngleRef.current = new Array(counts.trafficVehicleCount).fill(0);
  }, [counts.trafficVehicleCount]);

  useEffect(() => {
    let cancelled = false;

    loadDrift3DKitGltf(getDrift3DKitAssetUrl("vehicle-traffic-sedan"))
      .then((gltf) => {
        if (cancelled) {
          return;
        }

        const meshByName = new Map<string, THREE.Mesh>();

        gltf.scene.traverse((object) => {
          if ((object as THREE.Mesh).isMesh) {
            meshByName.set(object.name, object as THREE.Mesh);
          }
        });

        const group = groupRef.current;

        if (!group) {
          return;
        }

        for (const partId of VEHICLE_PART_IDS) {
          const sourceMesh = meshByName.get(partId);

          if (!sourceMesh) {
            continue;
          }

          geometryCacheRef.current.set(partId, sourceMesh.geometry);
          partOffsets.current[partId] = sourceMesh.position.clone();

          if (!sharedMaterialRef.current) {
            const material = Array.isArray(sourceMesh.material)
              ? sourceMesh.material[0]
              : sourceMesh.material;
            sharedMaterialRef.current = material;
          }

          const count = Math.max(counts.trafficVehicleCount, 1);
          const mesh = new THREE.InstancedMesh(
            sourceMesh.geometry,
            sharedMaterialRef.current,
            count
          );
          mesh.frustumCulled = false;
          mesh.count = counts.trafficVehicleCount;
          group.add(mesh);
          meshRefs.current[partId] = mesh;
        }

        statusRef.current = {
          ...statusRef.current,
          loadedAssetIds: ["vehicle-traffic-sedan"],
          instanceCount: counts.trafficVehicleCount,
        };
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }

        statusRef.current = {
          ...statusRef.current,
          loadErrors: [
            ...statusRef.current.loadErrors,
            `vehicle-traffic-sedan: ${String(error)}`,
          ],
        };
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rebuild instance counts (not geometry — reused as-is) when Quality Tier
  // changes the vehicle count.
  useEffect(() => {
    for (const partId of VEHICLE_PART_IDS) {
      const mesh = meshRefs.current[partId];

      if (mesh) {
        mesh.count = Math.min(counts.trafficVehicleCount, mesh.instanceMatrix.count);
      }
    }
  }, [counts.trafficVehicleCount]);

  useLayoutEffect(() => {
    const geometryCache = geometryCacheRef.current;

    return () => {
      for (const partId of VEHICLE_PART_IDS) {
        const mesh = meshRefs.current[partId];
        mesh?.parent?.remove(mesh);
      }
      meshRefs.current = {};

      for (const geometry of geometryCache.values()) {
        geometry.dispose();
      }
      geometryCache.clear();

      const map = (sharedMaterialRef.current as THREE.MeshStandardMaterial)
        ?.map;
      map?.dispose();
      sharedMaterialRef.current?.dispose();
      sharedMaterialRef.current = null;

      statusRef.current = {
        ...statusRef.current,
        loadedAssetIds: [],
        instanceCount: 0,
        disposalCount: statusRef.current.disposalCount + 1,
      };
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((_, delta) => {
    if (!reducedMotion) {
      elapsedRef.current += delta;
    }

    const bodyMesh = meshRefs.current.body;

    if (!bodyMesh) {
      return;
    }

    for (let index = 0; index < counts.trafficVehicleCount; index += 1) {
      const startOffset = index / Math.max(counts.trafficVehicleCount, 1);
      const t = getDrift3DTrafficLoopProgress(
        elapsedRef.current + startOffset * LOOP_DURATION_SECONDS,
        LOOP_DURATION_SECONDS
      );
      const sample = sampleDrift3DTrafficPath(TRAFFIC_PATH, t);

      dummy.position.set(sample.position.x, 0, sample.position.z);
      dummy.rotation.set(0, sample.headingRadians, 0);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      bodyMesh.setMatrixAt(index, dummy.matrix);

      if (!reducedMotion) {
        const wheelDelta = computeDrift3DWheelRotationDelta(
          NOMINAL_SPEED_METERS_PER_SECOND,
          WHEEL_RADIUS_METERS,
          delta
        );
        wheelAngleRef.current[index] =
          (wheelAngleRef.current[index] ?? 0) + wheelDelta;
      }

      const headingQuaternion = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 1, 0),
        sample.headingRadians
      );

      for (const wheelPartId of WHEEL_PART_IDS) {
        const mesh = meshRefs.current[wheelPartId];
        const offset = partOffsets.current[wheelPartId];

        if (!mesh || !offset) {
          continue;
        }

        const rotatedOffset = offset.clone().applyQuaternion(headingQuaternion);
        dummy.position.set(
          sample.position.x + rotatedOffset.x,
          rotatedOffset.y,
          sample.position.z + rotatedOffset.z
        );
        dummy.quaternion
          .copy(headingQuaternion)
          .multiply(
            new THREE.Quaternion().setFromAxisAngle(
              new THREE.Vector3(1, 0, 0),
              wheelAngleRef.current[index] ?? 0
            )
          );
        dummy.updateMatrix();
        mesh.setMatrixAt(index, dummy.matrix);
      }
    }

    bodyMesh.instanceMatrix.needsUpdate = true;

    for (const wheelPartId of WHEEL_PART_IDS) {
      const mesh = meshRefs.current[wheelPartId];

      if (mesh) {
        mesh.instanceMatrix.needsUpdate = true;
      }
    }
  });

  return (
    <group ref={groupRef}>
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#6f7a52" roughness={0.97} />
      </mesh>
      {/* Real, unmodified reuse of the existing Vegetation Kit scatter
          system — proves coexistence, not a rebuild. */}
      <Drift3DScatterField />
    </group>
  );
}
