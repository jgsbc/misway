"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { withBasePath } from "@/lib/basePath";

export const DEFENDER_90_LOWPOLY_ASSET_PATH =
  "/models/defender90-lowpoly/scene.gltf";
export const DEFENDER_90_LOWPOLY_RUNTIME_SCALE = 0.82;
export const DEFENDER_90_LOWPOLY_SOURCE_OFFSET = Object.freeze([
  4.84276,
  -0.09198,
  -0.24755,
] as const);
export const DEFENDER_90_LOWPOLY_BODY_COLOR = "#c5aa76";
export const DEFENDER_90_LOWPOLY_ROOF_COLOR = "#d3c39f";

const assetUrl = withBasePath(DEFENDER_90_LOWPOLY_ASSET_PATH);
const SOURCE_BODY_MATERIAL = "Material.002";
const SOURCE_ROOF_MATERIAL = "Material.003";
const SOURCE_TIRE_MATERIAL = "rubber";
const REAR_SPARE_HEIGHT_RATIO = 0.56;
const REAR_SPARE_DEPTH_FACTOR = 0.44;

function findLegacyVehiclePoseGroup(scene: THREE.Scene): THREE.Group | null {
  let candidate: THREE.Group | null = null;

  scene.traverse((object) => {
    if (candidate !== null || !(object instanceof THREE.Group)) return;
    if (object.renderOrder !== 10) return;
    if (Math.abs(object.scale.x - 1.34) > 0.001) return;

    const hasDrivingHeadlight = object.children.some(
      (child) => child instanceof THREE.SpotLight
    );
    if (hasDrivingHeadlight) candidate = object;
  });

  return candidate as THREE.Group | null;
}

function tuneMiswayMaterial(material: THREE.Material) {
  if (!(material instanceof THREE.MeshStandardMaterial)) return;

  if (material.name === SOURCE_BODY_MATERIAL) {
    material.color.set(DEFENDER_90_LOWPOLY_BODY_COLOR);
    material.metalness = 0.08;
    material.roughness = 0.72;
    return;
  }

  if (material.name === SOURCE_ROOF_MATERIAL) {
    material.color.set(DEFENDER_90_LOWPOLY_ROOF_COLOR);
    material.metalness = 0.05;
    material.roughness = 0.78;
  }
}

function meshUsesMaterialName(mesh: THREE.Mesh, materialName: string) {
  const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  return materials.some((material) => material.name === materialName);
}

function findSourceWheelAssembly(root: THREE.Group): THREE.Object3D | null {
  const candidates = new Set<THREE.Object3D>();

  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    if (!meshUsesMaterialName(object, SOURCE_TIRE_MATERIAL)) return;

    let current = object.parent;
    while (current && current !== root) {
      const directMeshChildren = current.children.filter(
        (child) => child instanceof THREE.Mesh
      ).length;
      if (directMeshChildren >= 2) {
        candidates.add(current);
        break;
      }
      current = current.parent;
    }
  });

  let best: THREE.Object3D | null = null;
  let bestVolume = -Infinity;
  for (const candidate of candidates) {
    const size = new THREE.Box3()
      .setFromObject(candidate)
      .getSize(new THREE.Vector3());
    const volume = size.x * size.y * size.z;
    if (volume > bestVolume) {
      best = candidate;
      bestVolume = volume;
    }
  }

  return best;
}

function installSourceRearSpare(root: THREE.Group) {
  root.updateMatrixWorld(true);

  const sourceWheel = findSourceWheelAssembly(root);
  if (!sourceWheel) return false;

  const vehicleBounds = new THREE.Box3().setFromObject(root);
  const vehicleSize = vehicleBounds.getSize(new THREE.Vector3());
  const vehicleCenter = vehicleBounds.getCenter(new THREE.Vector3());

  sourceWheel.updateWorldMatrix(true, true);

  // Keep the complete authored wheel assembly (rim + hub + tyre), but express
  // its current world transform in root-local space before cloning it.
  const spareWheel = sourceWheel.clone(true);
  spareWheel.name = "misway_rear_spare_source_clone";
  const rootInverse = root.matrixWorld.clone().invert();
  spareWheel.matrix.copy(rootInverse.multiply(sourceWheel.matrixWorld));
  spareWheel.matrix.decompose(
    spareWheel.position,
    spareWheel.quaternion,
    spareWheel.scale
  );
  spareWheel.matrixAutoUpdate = true;
  root.add(spareWheel);
  spareWheel.updateWorldMatrix(true, true);

  const spareBounds = new THREE.Box3().setFromObject(spareWheel);
  const sourceCenterWorld = spareBounds.getCenter(new THREE.Vector3());
  const spareSize = spareBounds.getSize(new THREE.Vector3());

  const pivot = new THREE.Group();
  pivot.name = "misway_rear_spare_pivot";
  pivot.position.copy(root.worldToLocal(sourceCenterWorld.clone()));
  root.add(pivot);
  pivot.attach(spareWheel);

  // The imported Defender faces +Z, so the rear door is the -Z face. Derive
  // the mounting point from the live model bounds instead of relying on a
  // Sketchfab node name or hand-authored world coordinate.
  const targetWorld = new THREE.Vector3(
    vehicleCenter.x,
    vehicleBounds.min.y + vehicleSize.y * REAR_SPARE_HEIGHT_RATIO,
    vehicleBounds.min.z - spareSize.x * REAR_SPARE_DEPTH_FACTOR
  );
  pivot.position.copy(root.worldToLocal(targetWorld));
  pivot.rotation.y = Math.PI / 2;
  pivot.updateMatrixWorld(true);

  return true;
}

function prepareSourceModel(root: THREE.Group) {
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    object.castShadow = true;
    object.receiveShadow = true;

    const materials = Array.isArray(object.material)
      ? object.material
      : [object.material];
    for (const material of materials) tuneMiswayMaterial(material);
  });

  installSourceRearSpare(root);
}

function disposeSourceModel(root: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();

  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    geometries.add(object.geometry);
    const meshMaterials = Array.isArray(object.material)
      ? object.material
      : [object.material];
    for (const material of meshMaterials) materials.add(material);
  });

  for (const geometry of geometries) geometry.dispose();
  for (const material of materials) material.dispose();
}

/**
 * VEH-VIS-V1B-FIX — converged Evolution-only MISWAY Defender visual.
 *
 * Keeps the owner-approved 0.82 scale and V1A sand/roof materials. The rear
 * spare reuses a complete authored source wheel assembly, discovered from the
 * rubber material and positioned from the loaded vehicle bounds. This avoids
 * fragile GLTF node-name lookup and hand-authored rear-door coordinates.
 * Physics, collisions, controls, terrain pose and camera remain owned by the
 * existing hidden vehicle runtime.
 */
export default function Defender90LowpolyVehicleVisual() {
  const scene = useThree((state) => state.scene);
  const poseGroupRef = useRef<THREE.Group | null>(null);
  const legacyPoseRef = useRef<THREE.Group | null>(null);
  const headlightRef = useRef<THREE.SpotLight | null>(null);
  const headlightTargetRef = useRef<THREE.Object3D | null>(null);
  const [model, setModel] = useState<THREE.Group | null>(null);

  // Hide the inherited vehicle before the first painted Evolution frame so the
  // candidate does not appear to morph from the previous 4x4 while loading.
  // The inherited vehicle remains the pose/physics authority while hidden.
  useLayoutEffect(() => {
    const legacy = findLegacyVehiclePoseGroup(scene);
    legacyPoseRef.current = legacy;
    if (legacy) legacy.visible = false;

    return () => {
      const previous = legacyPoseRef.current;
      if (previous) previous.visible = true;
      legacyPoseRef.current = null;
    };
  }, [scene]);

  useEffect(() => {
    let cancelled = false;
    let loadedModel: THREE.Group | null = null;
    const loader = new GLTFLoader();

    loader.load(
      assetUrl,
      (gltf) => {
        loadedModel = gltf.scene;
        if (cancelled) {
          disposeSourceModel(loadedModel);
          return;
        }
        prepareSourceModel(loadedModel);
        setModel(loadedModel);
      },
      undefined,
      () => {
        // Loading failure is the only case where the inherited visual returns.
        const legacy =
          legacyPoseRef.current ?? findLegacyVehiclePoseGroup(scene);
        if (legacy) {
          legacy.visible = true;
          legacyPoseRef.current = legacy;
        }
      }
    );

    return () => {
      cancelled = true;
      if (loadedModel) disposeSourceModel(loadedModel);
    };
  }, [scene]);

  useLayoutEffect(() => {
    if (!model) return;
    if (headlightRef.current && headlightTargetRef.current) {
      headlightRef.current.target = headlightTargetRef.current;
    }
  }, [model]);

  useFrame(() => {
    if (!model) return;

    let legacy = legacyPoseRef.current;
    if (!legacy) {
      legacy = findLegacyVehiclePoseGroup(scene);
      if (legacy) {
        legacy.visible = false;
        legacyPoseRef.current = legacy;
      }
    }

    const poseGroup = poseGroupRef.current;
    if (legacy && poseGroup) {
      poseGroup.position.copy(legacy.position);
      poseGroup.quaternion.copy(legacy.quaternion);
    }
  }, 0.62);

  if (!model) return null;

  return (
    <group ref={poseGroupRef} renderOrder={12} aria-hidden="true">
      <group scale={DEFENDER_90_LOWPOLY_RUNTIME_SCALE}>
        <primitive
          object={model}
          position={DEFENDER_90_LOWPOLY_SOURCE_OFFSET}
        />
      </group>
      <spotLight
        ref={headlightRef}
        position={[0, 0.42, 0.78]}
        color="#ffe6b0"
        intensity={2.15}
        distance={13}
        angle={0.52}
        penumbra={0.62}
        decay={1.5}
      />
      <object3D ref={headlightTargetRef} position={[0, 0.08, 4.4]} />
    </group>
  );
}
