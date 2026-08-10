"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { withBasePath } from "@/lib/basePath";

export const MISWAY_DEFENDER_1966_ASSET_PATH =
  "/models/misway-defender-1966/misway-defender-1966-full.glb";
export const MISWAY_DEFENDER_1966_RUNTIME_SCALE = 0.84;
export const MISWAY_DEFENDER_1966_RUNTIME_Y_OFFSET = -0.02;
export const MISWAY_DEFENDER_1966_BODY_TINT = "#d8c39a";
export const MISWAY_DEFENDER_1966_TIRE_TINT = "#4a4540";

const assetUrl = withBasePath(MISWAY_DEFENDER_1966_ASSET_PATH);
const SOURCE_PROJECTION_MATERIAL = "defender_projection";
const SOURCE_DARK_MATERIAL = "Material";
const SOURCE_WHEEL_MESHES = Object.freeze([
  "Plane.008_defender_projection_0",
  "Plane.009_defender_projection_0",
  "Plane.010_defender_projection_0",
] as const);

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

function tuneProjectedMaterial(material: THREE.Material) {
  if (!(material instanceof THREE.MeshStandardMaterial)) return;

  if (material.name === SOURCE_PROJECTION_MATERIAL) {
    // Keep the authored projection map as the visual authority and multiply it
    // by a warm sand tint. Texture detail, dirt and baked variation survive.
    material.color.set(MISWAY_DEFENDER_1966_BODY_TINT);
    material.roughness = Math.max(material.roughness, 0.78);
    material.metalness = 0;
  } else if (material.name === SOURCE_DARK_MATERIAL) {
    material.color.set("#171717");
    material.roughness = 0.42;
    material.metalness = 0;
  }
}

function cloneWheelMaterial(material: THREE.Material) {
  const clone = material.clone();
  if (clone instanceof THREE.MeshStandardMaterial) {
    clone.name = `${material.name}__misway_tire`;
    clone.color.set(MISWAY_DEFENDER_1966_TIRE_TINT);
    clone.roughness = 0.96;
    clone.metalness = 0;
  }
  return clone;
}

function prepareSourceModel(root: THREE.Object3D) {
  const wheelMeshes: THREE.Mesh[] = [];

  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    object.castShadow = true;
    object.receiveShadow = true;
    if (SOURCE_WHEEL_MESHES.includes(object.name as (typeof SOURCE_WHEEL_MESHES)[number])) {
      wheelMeshes.push(object);
    }
  });

  // Wheels share the same projected material as the body in the source file.
  // Clone only their materials before tinting the shared body material so tyres
  // remain dark without touching geometry, UVs or the authored texture map.
  for (const wheel of wheelMeshes) {
    wheel.material = Array.isArray(wheel.material)
      ? wheel.material.map(cloneWheelMaterial)
      : cloneWheelMaterial(wheel.material);
  }

  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    const materials = Array.isArray(object.material)
      ? object.material
      : [object.material];
    for (const material of materials) {
      if (!material.name.endsWith("__misway_tire")) tuneProjectedMaterial(material);
    }
  });
}

function disposeSourceModel(root: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();

  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    geometries.add(object.geometry);
    const meshMaterials = Array.isArray(object.material)
      ? object.material
      : [object.material];
    for (const material of meshMaterials) {
      materials.add(material);
      for (const value of Object.values(material)) {
        if (value instanceof THREE.Texture) textures.add(value);
      }
    }
  });

  for (const geometry of geometries) geometry.dispose();
  for (const texture of textures) texture.dispose();
  for (const material of materials) material.dispose();
}

function DefenderExpeditionAccessories() {
  return (
    <group name="misway_defender_expedition_accessories">
      <group name="expedition_roof_rack">
        {[-0.43, 0.43].map((x) => (
          <mesh key={`rack-rail-${x}`} position={[x, 1.245, -0.04]} castShadow>
            <boxGeometry args={[0.035, 0.045, 1.55]} />
            <meshStandardMaterial color="#242321" roughness={0.84} metalness={0.18} />
          </mesh>
        ))}
        {[-0.58, 0, 0.58].map((z) => (
          <mesh key={`rack-cross-${z}`} position={[0, 1.255, z]} castShadow>
            <boxGeometry args={[0.9, 0.035, 0.035]} />
            <meshStandardMaterial color="#242321" roughness={0.84} metalness={0.18} />
          </mesh>
        ))}
      </group>

      <group name="expedition_roof_roll">
        <mesh position={[0, 1.395, -0.16]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.12, 0.12, 0.58, 12]} />
          <meshStandardMaterial color="#9f8962" roughness={0.94} metalness={0} />
        </mesh>
      </group>

      <group name="expedition_rear_spare" position={[0, 0.55, -1.105]}>
        <mesh castShadow>
          <torusGeometry args={[0.18, 0.058, 10, 22]} />
          <meshStandardMaterial color="#302e2b" roughness={0.98} metalness={0} />
        </mesh>
        <mesh position={[0, 0, -0.035]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.075, 0.075, 0.055, 12]} />
          <meshStandardMaterial color="#4b4a46" roughness={0.72} metalness={0.35} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Full-fidelity Evolution-only vehicle candidate.
 *
 * The source vehicle geometry, UVs, texture and material structure are kept
 * intact. The extraction only removes the unrelated redesign vehicle from the
 * downloaded Sketchfab scene and normalises the old 1966 vehicle to Y-up,
 * ground-centred coordinates. No decimation or replacement body geometry is
 * used. V1 alignment is deliberately non-destructive: material multiplication
 * plus three additive expedition cues only.
 *
 * Motion remains owned by the hidden production vehicle. This component only
 * mirrors that pose, so physics, collisions, terrain pitch/roll, controls and
 * camera behaviour remain unchanged.
 */
export default function FullFidelityDefenderVehicleVisual() {
  const scene = useThree((state) => state.scene);
  const poseGroupRef = useRef<THREE.Group | null>(null);
  const legacyPoseRef = useRef<THREE.Group | null>(null);
  const headlightRef = useRef<THREE.SpotLight | null>(null);
  const headlightTargetRef = useRef<THREE.Object3D | null>(null);
  const [model, setModel] = useState<THREE.Group | null>(null);

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
        // Keep the approved Safari visible if the candidate asset cannot load.
      }
    );

    return () => {
      cancelled = true;
      if (loadedModel) disposeSourceModel(loadedModel);
    };
  }, []);

  useLayoutEffect(() => {
    if (!model) return;

    const legacy = findLegacyVehiclePoseGroup(scene);
    legacyPoseRef.current = legacy;
    if (legacy) legacy.visible = false;

    if (headlightRef.current && headlightTargetRef.current) {
      headlightRef.current.target = headlightTargetRef.current;
    }

    return () => {
      const previous = legacyPoseRef.current;
      if (previous) previous.visible = true;
      legacyPoseRef.current = null;
    };
  }, [model, scene]);

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

    // Deliberately no wheel surgery: the source groups both rear wheels in one
    // authored mesh, and source fidelity remains more important than cosmetic
    // wheel spin in this alignment pass.
  }, 0.62);

  if (!model) return null;

  return (
    <group ref={poseGroupRef} renderOrder={12} aria-hidden="true">
      <group
        scale={MISWAY_DEFENDER_1966_RUNTIME_SCALE}
        position={[0, MISWAY_DEFENDER_1966_RUNTIME_Y_OFFSET, 0]}
      >
        <primitive object={model} />
        <DefenderExpeditionAccessories />
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
