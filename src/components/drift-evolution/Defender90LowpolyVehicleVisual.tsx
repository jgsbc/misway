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

function prepareSourceModel(root: THREE.Object3D) {
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    object.castShadow = true;
    object.receiveShadow = true;

    const materials = Array.isArray(object.material)
      ? object.material
      : [object.material];
    for (const material of materials) tuneMiswayMaterial(material);
  });
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
 * VEH-VIS-V1A — first non-destructive MISWAY material alignment for the
 * owner-approved Defender 90 Evolution candidate.
 *
 * Geometry, proportions, trim, rubber, glass and authored light materials stay
 * untouched. Only the identified source body and roof materials are retuned to
 * a warm expedition-sand family. No accessory geometry is added in this pass.
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
