"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import BirthYardHeroPedestrians from "@/components/drift-3d/BirthYardHeroPedestrians";
import {
  DRIFT_3D_BIRTH_YARD_DELIVERY_TRUCK,
  DRIFT_3D_BIRTH_YARD_DELIVERY_TRUCK_SOURCE,
} from "@/lib/drift3dBirthYardHeroAssets";
import { getDrift3DGroundY } from "@/lib/drift3dTerrain";

function neutralMaterialFor(source: THREE.Material) {
  const name = source.name.toLowerCase();
  if (name.includes("glass")) {
    return new THREE.MeshStandardMaterial({ name: "misway-delivery-glass", color: "#26333b", roughness: 0.22, metalness: 0.05, transparent: true, opacity: 0.72, depthWrite: false });
  }
  if (name.includes("wheel")) {
    return new THREE.MeshStandardMaterial({ name: "misway-delivery-wheel", color: "#202225", roughness: 0.9, metalness: 0.08 });
  }
  if (name.includes("trim")) {
    return new THREE.MeshStandardMaterial({ name: "misway-delivery-trim", color: "#2e3235", roughness: 0.72, metalness: 0.22 });
  }
  return new THREE.MeshStandardMaterial({ name: "misway-delivery-body", color: "#85857f", roughness: 0.72, metalness: 0.1 });
}

function disposeSourceMaterial(material: THREE.Material) {
  const candidate = material as THREE.Material & Record<string, unknown>;
  for (const value of Object.values(candidate)) {
    if (value instanceof THREE.Texture) value.dispose();
  }
  material.dispose();
}

function disposeModel(model: THREE.Object3D) {
  const materials = new Set<THREE.Material>();
  const geometries = new Set<THREE.BufferGeometry>();
  model.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    geometries.add(child.geometry);
    const meshMaterials = Array.isArray(child.material) ? child.material : [child.material];
    meshMaterials.forEach((material) => materials.add(material));
  });
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
}

function DeliveryTruckAsset() {
  const rootRef = useRef<THREE.Group>(null);
  const truck = DRIFT_3D_BIRTH_YARD_DELIVERY_TRUCK;
  const groundY = getDrift3DGroundY(truck.x, truck.z);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let active = true;
    let loadedModel: THREE.Object3D | null = null;
    const loader = new GLTFLoader();

    loader.load(
      DRIFT_3D_BIRTH_YARD_DELIVERY_TRUCK_SOURCE.modelUrl,
      (gltf) => {
        const model = gltf.scene;
        const oldMaterials = new Set<THREE.Material>();
        model.traverse((child) => {
          if (!(child instanceof THREE.Mesh)) return;
          child.castShadow = true;
          child.receiveShadow = true;
          if (Array.isArray(child.material)) {
            child.material = child.material.map((material) => {
              oldMaterials.add(material);
              return neutralMaterialFor(material);
            });
          } else {
            oldMaterials.add(child.material);
            child.material = neutralMaterialFor(child.material);
          }
        });
        oldMaterials.forEach(disposeSourceMaterial);
        model.updateMatrixWorld(true);
        const initialBounds = new THREE.Box3().setFromObject(model);
        const initialSize = initialBounds.getSize(new THREE.Vector3());
        const sourceLength = Math.max(initialSize.x, initialSize.z);
        if (sourceLength > 0) model.scale.setScalar(truck.targetLength / sourceLength);
        model.updateMatrixWorld(true);
        const scaledBounds = new THREE.Box3().setFromObject(model);
        model.position.y -= scaledBounds.min.y;
        model.updateMatrixWorld(true);
        if (!active) {
          disposeModel(model);
          return;
        }
        loadedModel = model;
        root.add(model);
      },
      undefined,
      (error) => {
        if (process.env.NODE_ENV !== "production") console.warn("Birth Yard delivery hero asset failed to load", error);
      }
    );

    return () => {
      active = false;
      if (loadedModel) {
        root.remove(loadedModel);
        disposeModel(loadedModel);
      }
    };
  }, [truck.targetLength]);

  return <group ref={rootRef} position={[truck.x, groundY + 0.025, truck.z]} rotation={[0, truck.rotationY, 0]} aria-hidden="true" />;
}

export default function BirthYardHeroAssets() {
  return (
    <>
      <DeliveryTruckAsset />
      <BirthYardHeroPedestrians />
    </>
  );
}
