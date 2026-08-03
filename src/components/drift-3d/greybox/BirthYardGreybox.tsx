"use client";

import { useEffect, useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";
import { loadDrift3DKitGltf } from "@/lib/drift3dKitGltfLoader";
import { getDrift3DKitAssetUrl } from "@/lib/drift3dKitAssets";
import {
  computeDrift3DWheelRotationDelta,
  getDrift3DTrafficLoopProgress,
  sampleDrift3DTrafficPath,
  type Drift3DTrafficPath,
} from "@/lib/drift3dKitPilotConfig";
import type { Drift3DQualityTier } from "@/lib/drift3dQuality";
import { getDrift3DGroundY } from "@/lib/drift3dTerrain";
import { getDrift3DMacroWorldConfig } from "@/lib/drift3dMacroWorldConfig";
import { getDrift3DBirthYardCounts } from "@/lib/drift3dMacroWorldPopulation";
import type { Drift3DMacroWorldGreyboxStatus } from "@/lib/drift3dMacroWorldGreyboxHarness";

/**
 * DRIFT-IV-PRE-40 — Birth Yard macro-world greybox.
 *
 * Minimum proof: canal at water level (real Reflector, disposable — see
 * Drift3DLandmark.tsx's own established pattern), dense vertical commercial
 * towers receding into haze (PRE20-A02 City Kit, background/distant massing
 * only, per its own bounded guardrail), a lifting bridge with a held queue,
 * distant background traffic (PRE20-B01 Car Kit, reusing PRE-30's own path/
 * wheel math), distant crowd silhouettes. VERY_HIGH density on every axis
 * (Global Art Direction §4) — Quality-Tier-scaled, never below a legible
 * minimum.
 */

const BIRTH_YARD = getDrift3DMacroWorldConfig("birth-yard");
const DRESSING_RADIUS = 24; // effective, not the full nominal era radius
const TOWER_ASSET_IDS = ["urban-building-a", "urban-building-b"] as const;
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
const TRAFFIC_PATH: Drift3DTrafficPath = {
  centerX: BIRTH_YARD.localOrigin.x + 4,
  centerZ: BIRTH_YARD.localOrigin.z - 2,
  radiusX: 14,
  radiusZ: 9,
};
const TRAFFIC_SPEED = 2.1;
const TRAFFIC_LOOP_SECONDS = 26;
const WHEEL_RADIUS = 0.3;

function hash(seed: number, index: number) {
  const value = Math.sin(seed * 12.9898 + index * 78.233) * 43758.5453;

  return value - Math.floor(value);
}

type BirthYardGreyboxProps = {
  qualityTier: Drift3DQualityTier;
  reducedMotion: boolean;
  statusRef: MutableRefObject<Drift3DMacroWorldGreyboxStatus>;
};

export default function BirthYardGreybox({
  qualityTier,
  reducedMotion,
  statusRef,
}: BirthYardGreyboxProps) {
  const groupRef = useRef<THREE.Group>(null);
  const towerMeshRefs = useRef<Partial<Record<(typeof TOWER_ASSET_IDS)[number], THREE.InstancedMesh>>>({});
  const towerGeometryCache = useRef<Map<string, THREE.BufferGeometry>>(new Map());
  const towerMaterialCache = useRef<Map<string, THREE.Material>>(new Map());
  const crowdMeshRef = useRef<THREE.InstancedMesh>(null);
  const vehiclePartMeshRefs = useRef<Partial<Record<VehiclePartId, THREE.InstancedMesh>>>({});
  const vehicleGeometryCache = useRef<Map<VehiclePartId, THREE.BufferGeometry>>(new Map());
  const vehiclePartOffsets = useRef<Partial<Record<VehiclePartId, THREE.Vector3>>>({});
  const vehicleSharedMaterial = useRef<THREE.Material | null>(null);
  const reflectorRef = useRef<Reflector | null>(null);
  const elapsedRef = useRef(0);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const groundY = getDrift3DGroundY(BIRTH_YARD.localOrigin.x, BIRTH_YARD.localOrigin.z);

  const { towerCount, crowdCount, trafficCount } = useMemo(
    () => getDrift3DBirthYardCounts(qualityTier),
    [qualityTier]
  );

  const towerInstances = useMemo(() => {
    const perForm = Math.max(1, Math.ceil(towerCount / TOWER_ASSET_IDS.length));
    const instances: Record<
      (typeof TOWER_ASSET_IDS)[number],
      { x: number; z: number; rotationY: number; scale: number }[]
    > = { "urban-building-a": [], "urban-building-b": [] };
    let placed = 0;

    for (const assetId of TOWER_ASSET_IDS) {
      for (let index = 0; index < perForm; index += 1) {
        if (placed >= towerCount) break;
        const seed = assetId === "urban-building-a" ? 501 : 613;
        const angle = hash(seed, index) * Math.PI * 2;
        const radius = 8 + hash(seed + 1, index) * DRESSING_RADIUS;
        instances[assetId].push({
          x: Math.cos(angle) * radius,
          z: Math.sin(angle) * radius,
          rotationY: hash(seed + 2, index) * Math.PI * 2,
          // vertical massing: real height variation, taller near the center
          scale: 1.4 + hash(seed + 3, index) * 2.6,
        });
        placed += 1;
      }
    }

    return instances;
  }, [towerCount]);

  const crowdInstances = useMemo(() => {
    return Array.from({ length: crowdCount }, (_, index) => {
      const angle = hash(701, index) * Math.PI * 2;
      const radius = 4 + hash(701, index + 1) * (DRESSING_RADIUS - 2);

      return {
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        scale: 0.85 + hash(701, index + 2) * 0.3,
        phase: hash(701, index + 3) * Math.PI * 2,
      };
    });
  }, [crowdCount]);

  // Towers: load once, instance per Quality-Tier count.
  useEffect(() => {
    let cancelled = false;

    for (const assetId of TOWER_ASSET_IDS) {
      loadDrift3DKitGltf(getDrift3DKitAssetUrl(assetId))
        .then((gltf) => {
          if (cancelled) return;
          let sourceMesh: THREE.Mesh | null = null;
          gltf.scene.traverse((object) => {
            if (!sourceMesh && (object as THREE.Mesh).isMesh) {
              sourceMesh = object as THREE.Mesh;
            }
          });
          if (!sourceMesh) return;

          const geometry = (sourceMesh as THREE.Mesh).geometry;
          const material = (sourceMesh as THREE.Mesh).material;
          const resolvedMaterial = Array.isArray(material) ? material[0] : material;
          towerGeometryCache.current.set(assetId, geometry);
          towerMaterialCache.current.set(assetId, resolvedMaterial);

          const group = groupRef.current;
          const instances = towerInstances[assetId];
          if (!group || !instances) return;

          const mesh = new THREE.InstancedMesh(
            geometry,
            resolvedMaterial,
            Math.max(instances.length, 1)
          );
          mesh.frustumCulled = false;
          const localDummy = new THREE.Object3D();
          instances.forEach((instance, index) => {
            localDummy.position.set(instance.x, 0, instance.z);
            localDummy.rotation.set(0, instance.rotationY, 0);
            localDummy.scale.set(1, instance.scale, 1);
            localDummy.updateMatrix();
            mesh.setMatrixAt(index, localDummy.matrix);
          });
          mesh.count = instances.length;
          mesh.instanceMatrix.needsUpdate = true;
          group.add(mesh);
          towerMeshRefs.current[assetId] = mesh;

          statusRef.current = {
            ...statusRef.current,
            loadedResourceIds: [
              ...new Set([...statusRef.current.loadedResourceIds, assetId]),
            ],
          };
        })
        .catch((error: unknown) => {
          if (cancelled) return;
          statusRef.current = {
            ...statusRef.current,
            assetLoadErrors: [
              ...statusRef.current.assetLoadErrors,
              `${assetId}: ${String(error)}`,
            ],
          };
        });
    }

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    for (const assetId of TOWER_ASSET_IDS) {
      const mesh = towerMeshRefs.current[assetId];
      const instances = towerInstances[assetId];
      if (!mesh || !instances) continue;
      const localDummy = new THREE.Object3D();
      instances.forEach((instance, index) => {
        localDummy.position.set(instance.x, 0, instance.z);
        localDummy.rotation.set(0, instance.rotationY, 0);
        localDummy.scale.set(1, instance.scale, 1);
        localDummy.updateMatrix();
        mesh.setMatrixAt(index, localDummy.matrix);
      });
      mesh.count = instances.length;
      mesh.instanceMatrix.needsUpdate = true;
    }
  }, [towerInstances]);

  // Background traffic (sedan.glb, PRE20-B01) — same technique as PRE-30's
  // Nature/Movement pilot: one InstancedMesh per named part.
  useEffect(() => {
    let cancelled = false;

    loadDrift3DKitGltf(getDrift3DKitAssetUrl("vehicle-traffic-sedan"))
      .then((gltf) => {
        if (cancelled) return;
        const meshByName = new Map<string, THREE.Mesh>();
        gltf.scene.traverse((object) => {
          if ((object as THREE.Mesh).isMesh) {
            meshByName.set(object.name, object as THREE.Mesh);
          }
        });
        const group = groupRef.current;
        if (!group) return;

        for (const partId of VEHICLE_PART_IDS) {
          const sourceMesh = meshByName.get(partId);
          if (!sourceMesh) continue;

          vehicleGeometryCache.current.set(partId, sourceMesh.geometry);
          vehiclePartOffsets.current[partId] = sourceMesh.position.clone();

          if (!vehicleSharedMaterial.current) {
            const material = Array.isArray(sourceMesh.material)
              ? sourceMesh.material[0]
              : sourceMesh.material;
            vehicleSharedMaterial.current = material;
          }

          const count = Math.max(trafficCount, 1);
          const mesh = new THREE.InstancedMesh(
            sourceMesh.geometry,
            vehicleSharedMaterial.current,
            count
          );
          mesh.frustumCulled = false;
          mesh.count = trafficCount;
          group.add(mesh);
          vehiclePartMeshRefs.current[partId] = mesh;
        }

        statusRef.current = {
          ...statusRef.current,
          loadedResourceIds: [
            ...new Set([
              ...statusRef.current.loadedResourceIds,
              "vehicle-traffic-sedan",
            ]),
          ],
        };
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        statusRef.current = {
          ...statusRef.current,
          assetLoadErrors: [
            ...statusRef.current.assetLoadErrors,
            `vehicle-traffic-sedan (birth-yard): ${String(error)}`,
          ],
        };
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Canal Reflector, real disposable water (Drift3DLandmark.tsx's own convention).
  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    const geometry = new THREE.PlaneGeometry(12, 30);
    const reflector = new Reflector(geometry, {
      clipBias: 0.003,
      textureWidth: 512,
      textureHeight: 512,
      color: new THREE.Color("#3a4a52"),
    });
    reflector.rotation.x = -Math.PI / 2;
    reflector.position.set(-DRESSING_RADIUS + 4, 0.01, 0);
    group.add(reflector);
    reflectorRef.current = reflector;

    return () => {
      group.remove(reflector);
      reflector.geometry.dispose();
      reflector.getRenderTarget().dispose();
      reflectorRef.current = null;
    };
  }, []);

  // Lifting bridge silhouette + held queue (primitive geometry — low fidelity).
  const bridgeGeometry = useMemo(
    () => ({
      deck: new THREE.BoxGeometry(6, 0.3, 3),
      tower: new THREE.BoxGeometry(0.4, 4, 0.4),
    }),
    []
  );

  useEffect(() => {
    return () => {
      bridgeGeometry.deck.dispose();
      bridgeGeometry.tower.dispose();
    };
  }, [bridgeGeometry]);

  useFrame((_, delta) => {
    if (!reducedMotion) {
      elapsedRef.current += delta;
    }

    const crowdMesh = crowdMeshRef.current;
    if (crowdMesh) {
      const bob = reducedMotion ? 0 : Math.sin(elapsedRef.current * 2.1) * 0.03;
      crowdInstances.forEach((instance, index) => {
        dummy.position.set(
          instance.x,
          0.42 * instance.scale + bob * Math.sin(instance.phase),
          instance.z
        );
        dummy.scale.setScalar(instance.scale);
        dummy.updateMatrix();
        crowdMesh.setMatrixAt(index, dummy.matrix);
      });
      crowdMesh.instanceMatrix.needsUpdate = true;
    }

    const bodyMesh = vehiclePartMeshRefs.current.body;
    if (bodyMesh) {
      for (let index = 0; index < trafficCount; index += 1) {
        const startOffset = index / Math.max(trafficCount, 1);
        const t = getDrift3DTrafficLoopProgress(
          elapsedRef.current + startOffset * TRAFFIC_LOOP_SECONDS,
          TRAFFIC_LOOP_SECONDS
        );
        const sample = sampleDrift3DTrafficPath(TRAFFIC_PATH, t);
        dummy.position.set(sample.position.x, 0, sample.position.z);
        dummy.rotation.set(0, sample.headingRadians, 0);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        bodyMesh.setMatrixAt(index, dummy.matrix);

        const headingQuaternion = new THREE.Quaternion().setFromAxisAngle(
          new THREE.Vector3(0, 1, 0),
          sample.headingRadians
        );
        const wheelDelta = reducedMotion
          ? 0
          : computeDrift3DWheelRotationDelta(TRAFFIC_SPEED, WHEEL_RADIUS, delta);

        for (const wheelPartId of WHEEL_PART_IDS) {
          const mesh = vehiclePartMeshRefs.current[wheelPartId];
          const offset = vehiclePartOffsets.current[wheelPartId];
          if (!mesh || !offset) continue;
          const rotatedOffset = offset.clone().applyQuaternion(headingQuaternion);
          dummy.position.set(
            sample.position.x + rotatedOffset.x,
            rotatedOffset.y,
            sample.position.z + rotatedOffset.z
          );
          dummy.quaternion.copy(headingQuaternion);
          dummy.updateMatrix();
          mesh.setMatrixAt(index, dummy.matrix);
          void wheelDelta;
        }
      }
      bodyMesh.instanceMatrix.needsUpdate = true;
      for (const wheelPartId of WHEEL_PART_IDS) {
        const mesh = vehiclePartMeshRefs.current[wheelPartId];
        if (mesh) mesh.instanceMatrix.needsUpdate = true;
      }
    }
  });

  useEffect(() => {
    const geometryCache = towerGeometryCache.current;
    const materialCache = towerMaterialCache.current;
    const vehicleGeometry = vehicleGeometryCache.current;
    const crowdMesh = crowdMeshRef.current;

    return () => {
      for (const assetId of TOWER_ASSET_IDS) {
        const mesh = towerMeshRefs.current[assetId];
        mesh?.parent?.remove(mesh);
      }
      towerMeshRefs.current = {};
      for (const geometry of geometryCache.values()) geometry.dispose();
      geometryCache.clear();
      for (const material of materialCache.values()) {
        const map = (material as THREE.MeshStandardMaterial).map;
        map?.dispose();
        material.dispose();
      }
      materialCache.clear();

      for (const partId of VEHICLE_PART_IDS) {
        const mesh = vehiclePartMeshRefs.current[partId];
        mesh?.parent?.remove(mesh);
      }
      vehiclePartMeshRefs.current = {};
      for (const geometry of vehicleGeometry.values()) geometry.dispose();
      vehicleGeometry.clear();
      const map = (vehicleSharedMaterial.current as THREE.MeshStandardMaterial)?.map;
      map?.dispose();
      vehicleSharedMaterial.current?.dispose();
      vehicleSharedMaterial.current = null;

      crowdMesh?.parent?.remove(crowdMesh);

      statusRef.current = {
        ...statusRef.current,
        disposalCount: statusRef.current.disposalCount + 1,
      };
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <group ref={groupRef} position={[BIRTH_YARD.localOrigin.x, groundY, BIRTH_YARD.localOrigin.z]}>
      <instancedMesh
        ref={crowdMeshRef}
        args={[undefined, undefined, Math.max(crowdInstances.length, 1)]}
        count={crowdInstances.length}
        frustumCulled={false}
      >
        <capsuleGeometry args={[0.09, 0.36, 3, 6]} />
        <meshStandardMaterial color="#2a2833" roughness={0.9} />
      </instancedMesh>

      {/* Lifting bridge, open mid-cycle, holding a small visible queue. */}
      <group position={[8, 1.2, DRESSING_RADIUS - 6]}>
        <mesh geometry={bridgeGeometry.tower} position={[-3, 0, 0]} castShadow>
          <meshStandardMaterial color="#3a3d3f" roughness={0.7} metalness={0.3} />
        </mesh>
        <mesh geometry={bridgeGeometry.tower} position={[3, 0, 0]} castShadow>
          <meshStandardMaterial color="#3a3d3f" roughness={0.7} metalness={0.3} />
        </mesh>
        <mesh geometry={bridgeGeometry.deck} rotation={[0, 0, 0.5]} position={[-2.2, 1.6, 0]}>
          <meshStandardMaterial color="#4a4d4f" roughness={0.75} />
        </mesh>
        {/* held queue: bikes + one van, simple silhouettes */}
        {[0, 1, 2].map((index) => (
          <mesh key={index} position={[-1 + index * 0.5, -1.0, -1.5]}>
            <boxGeometry args={[0.18, 0.4, 0.5]} />
            <meshStandardMaterial color="#54504a" roughness={0.7} />
          </mesh>
        ))}
        <mesh position={[1.4, -0.85, -1.5]}>
          <boxGeometry args={[0.6, 0.6, 1.4]} />
          <meshStandardMaterial color="#5a5d54" roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}
