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
export const DEFENDER_90_LOWPOLY_RACK_COLOR = "#1b1d1c";

const assetUrl = withBasePath(DEFENDER_90_LOWPOLY_ASSET_PATH);
const SOURCE_BODY_MATERIAL = "Material.002";
const SOURCE_ROOF_MATERIAL = "Material.003";
const SOURCE_TIRE_MATERIAL = "rubber";
const WHEEL_DIRECT_MESH_CHILDREN = 3;
const WHEEL_MIN_DIAMETER = 0.5;
const WHEEL_MAX_DIAMETER = 0.75;
const WHEEL_MAX_THICKNESS = 0.32;
const WHEEL_ROUNDNESS_TOLERANCE = 0.08;
const REAR_SPARE_HEIGHT_RATIO = 0.56;
const REAR_SPARE_DEPTH_FACTOR = 0.6;
const ROOF_RACK_WIDTH_RATIO = 0.9;
const ROOF_RACK_LENGTH_RATIO = 0.88;
const ROOF_RACK_BAR_THICKNESS = 0.025;
const ROOF_RACK_CLEARANCE = 0.035;
const ROOF_RACK_SIDE_HEIGHT = 0.055;
const ROOF_RACK_CROSSBAR_COUNT = 4;

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

function wheelLikeDimensions(object: THREE.Object3D) {
  const size = new THREE.Box3().setFromObject(object).getSize(new THREE.Vector3());
  const dimensions = [size.x, size.y, size.z].sort((a, b) => a - b);
  return {
    thickness: dimensions[0],
    diameterA: dimensions[1],
    diameterB: dimensions[2],
  };
}

function isWheelLikeAssembly(object: THREE.Object3D) {
  const directMeshChildren = object.children.filter(
    (child) => child instanceof THREE.Mesh
  ).length;
  if (directMeshChildren !== WHEEL_DIRECT_MESH_CHILDREN) return false;

  const { thickness, diameterA, diameterB } = wheelLikeDimensions(object);
  const roundnessError = Math.abs(diameterA - diameterB) / diameterB;

  return (
    thickness <= WHEEL_MAX_THICKNESS &&
    diameterA >= WHEEL_MIN_DIAMETER &&
    diameterB <= WHEEL_MAX_DIAMETER &&
    roundnessError <= WHEEL_ROUNDNESS_TOLERANCE
  );
}

function findSourceWheelAssembly(root: THREE.Group): THREE.Object3D | null {
  const candidates = new Set<THREE.Object3D>();

  root.updateMatrixWorld(true);
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    if (!meshUsesMaterialName(object, SOURCE_TIRE_MATERIAL)) return;

    const parent = object.parent;
    if (parent && parent !== root && isWheelLikeAssembly(parent)) {
      candidates.add(parent);
    }
  });

  let rearWheel: THREE.Object3D | null = null;
  let rearMostZ = Infinity;
  for (const candidate of candidates) {
    const center = new THREE.Box3()
      .setFromObject(candidate)
      .getCenter(new THREE.Vector3());
    if (center.z < rearMostZ) {
      rearWheel = candidate;
      rearMostZ = center.z;
    }
  }

  return rearWheel;
}

function installSourceRearSpare(root: THREE.Group) {
  root.updateMatrixWorld(true);

  const sourceWheel = findSourceWheelAssembly(root);
  if (!sourceWheel) return false;

  const vehicleBounds = new THREE.Box3().setFromObject(root);
  const vehicleSize = vehicleBounds.getSize(new THREE.Vector3());
  const vehicleCenter = vehicleBounds.getCenter(new THREE.Vector3());
  const { thickness } = wheelLikeDimensions(sourceWheel);

  sourceWheel.updateWorldMatrix(true, true);

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

  const sourceCenterWorld = new THREE.Box3()
    .setFromObject(spareWheel)
    .getCenter(new THREE.Vector3());

  const pivot = new THREE.Group();
  pivot.name = "misway_rear_spare_pivot";
  pivot.position.copy(root.worldToLocal(sourceCenterWorld.clone()));
  root.add(pivot);
  pivot.attach(spareWheel);

  const targetWorld = new THREE.Vector3(
    vehicleCenter.x,
    vehicleBounds.min.y + vehicleSize.y * REAR_SPARE_HEIGHT_RATIO,
    vehicleBounds.min.z - thickness * REAR_SPARE_DEPTH_FACTOR
  );
  pivot.position.copy(root.worldToLocal(targetWorld));
  pivot.rotation.y = Math.PI / 2;
  pivot.updateMatrixWorld(true);

  return true;
}

function findSourceRoofMesh(root: THREE.Group): THREE.Mesh | null {
  let roof: THREE.Mesh | null = null;
  let largestFootprint = -Infinity;

  root.updateMatrixWorld(true);
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    if (!meshUsesMaterialName(object, SOURCE_ROOF_MATERIAL)) return;

    const size = new THREE.Box3().setFromObject(object).getSize(new THREE.Vector3());
    const footprint = size.x * size.z;
    if (footprint > largestFootprint) {
      roof = object;
      largestFootprint = footprint;
    }
  });

  return roof;
}

function makeRoofRackBar(
  size: readonly [number, number, number],
  position: readonly [number, number, number],
  material: THREE.MeshStandardMaterial
) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function installSourceRoofRack(root: THREE.Group) {
  const roof = findSourceRoofMesh(root);
  if (!roof) return false;

  root.updateMatrixWorld(true);
  const roofBounds = new THREE.Box3().setFromObject(roof);
  const roofSize = roofBounds.getSize(new THREE.Vector3());
  const roofCenter = roofBounds.getCenter(new THREE.Vector3());
  const rackWidth = roofSize.x * ROOF_RACK_WIDTH_RATIO;
  const rackLength = roofSize.z * ROOF_RACK_LENGTH_RATIO;
  const bar = ROOF_RACK_BAR_THICKNESS;

  const rackMaterial = new THREE.MeshStandardMaterial({
    name: "misway_roof_rack_material",
    color: DEFENDER_90_LOWPOLY_RACK_COLOR,
    metalness: 0.18,
    roughness: 0.76,
  });

  const rack = new THREE.Group();
  rack.name = "misway_roof_rack";
  const rackCenterWorld = new THREE.Vector3(
    roofCenter.x,
    roofBounds.max.y + ROOF_RACK_CLEARANCE + bar * 0.5,
    roofCenter.z
  );
  rack.position.copy(root.worldToLocal(rackCenterWorld));

  const sideX = rackWidth * 0.5 - bar * 0.5;
  const sideY = bar * 0.5 + ROOF_RACK_SIDE_HEIGHT * 0.5;
  rack.add(
    makeRoofRackBar(
      [bar, ROOF_RACK_SIDE_HEIGHT, rackLength],
      [-sideX, sideY, 0],
      rackMaterial
    )
  );
  rack.add(
    makeRoofRackBar(
      [bar, ROOF_RACK_SIDE_HEIGHT, rackLength],
      [sideX, sideY, 0],
      rackMaterial
    )
  );

  for (let index = 0; index < ROOF_RACK_CROSSBAR_COUNT; index += 1) {
    const t = ROOF_RACK_CROSSBAR_COUNT === 1
      ? 0.5
      : index / (ROOF_RACK_CROSSBAR_COUNT - 1);
    const z = -rackLength * 0.42 + rackLength * 0.84 * t;
    rack.add(
      makeRoofRackBar([rackWidth, bar, bar], [0, 0, z], rackMaterial)
    );
  }

  const footHeight = ROOF_RACK_CLEARANCE;
  const footY = -(footHeight + bar) * 0.5;
  const footX = rackWidth * 0.44;
  const footZ = rackLength * 0.4;
  for (const x of [-footX, footX]) {
    for (const z of [-footZ, footZ]) {
      rack.add(
        makeRoofRackBar(
          [bar * 1.25, footHeight, bar * 1.25],
          [x, footY, z],
          rackMaterial
        )
      );
    }
  }

  root.add(rack);
  rack.updateMatrixWorld(true);
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

  // Keep the already-approved rear spare placement independent from the new
  // roof equipment by installing the rack only after the spare is resolved.
  installSourceRearSpare(root);
  installSourceRoofRack(root);
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
 * VEH-VIS-V1C — bounded expedition silhouette pass for the Evolution Defender.
 *
 * Keeps the approved 0.82 scale, V1A materials and source-native rear spare.
 * Adds one low-profile roof rack whose dimensions are derived from the authored
 * roof mesh itself: two side rails, four crossbars and four short feet. No
 * luggage, ladder, bullbar, snorkel or other accessory is introduced here.
 * Physics, collisions, controls, terrain pose and camera remain unchanged.
 */
export default function Defender90LowpolyVehicleVisual() {
  const scene = useThree((state) => state.scene);
  const poseGroupRef = useRef<THREE.Group | null>(null);
  const legacyPoseRef = useRef<THREE.Group | null>(null);
  const headlightRef = useRef<THREE.SpotLight | null>(null);
  const headlightTargetRef = useRef<THREE.Object3D | null>(null);
  const [model, setModel] = useState<THREE.Group | null>(null);

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
