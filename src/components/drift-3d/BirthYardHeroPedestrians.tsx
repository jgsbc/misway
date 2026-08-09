"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";
import {
  DRIFT_3D_BIRTH_YARD_FOREGROUND_ACTORS,
  DRIFT_3D_BIRTH_YARD_PEDESTRIAN_SOURCE,
} from "@/lib/drift3dBirthYardHeroAssets";
import {
  DRIFT_3D_BIRTH_YARD_CROWD,
  DRIFT_3D_BIRTH_YARD_CROWD_FLOWS,
  getDrift3DBirthYardCrowdFlowLength,
  sampleDrift3DBirthYardCrowdFlow,
} from "@/lib/drift3dBirthYardHeroCrowd";
import { getDrift3DGroundY } from "@/lib/drift3dTerrain";
import { drift3dTrackNodeBySlug } from "@/lib/drift3dTopology";

function disposeMaterial(material: THREE.Material) {
  const candidate = material as THREE.Material & Record<string, unknown>;
  for (const value of Object.values(candidate)) {
    if (value instanceof THREE.Texture) value.dispose();
  }
  material.dispose();
}

function disposeSourceScene(scene: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  scene.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    geometries.add(child.geometry);
    const sourceMaterials = Array.isArray(child.material) ? child.material : [child.material];
    sourceMaterials.forEach((material) => materials.add(material));
  });
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach(disposeMaterial);
}

function applyActorMaterial(root: THREE.Object3D, color: string) {
  const materials: THREE.Material[] = [];
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.castShadow = true;
    child.receiveShadow = true;
    const material = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.86,
      metalness: 0.01,
    });
    child.material = material;
    materials.push(material);
  });
  return materials;
}

/**
 * Six skinned walkers replace six primitive crowd slots. Their transform
 * groups are owned by React refs, matching the mutation pattern used by the
 * rest of the R3F runtime; the loaded GLB supplies only model/rig/animation.
 */
export default function BirthYardHeroPedestrians() {
  const actorGroupRefs = useRef<Array<THREE.Group | null>>(
    new Array(DRIFT_3D_BIRTH_YARD_FOREGROUND_ACTORS.length).fill(null)
  );
  const actorModelRefs = useRef<Array<THREE.Object3D | null>>(
    new Array(DRIFT_3D_BIRTH_YARD_FOREGROUND_ACTORS.length).fill(null)
  );
  const mixerRefs = useRef<Array<THREE.AnimationMixer | null>>(
    new Array(DRIFT_3D_BIRTH_YARD_FOREGROUND_ACTORS.length).fill(null)
  );
  const ownedMaterialsRef = useRef<THREE.Material[]>([]);
  const sourceSceneRef = useRef<THREE.Object3D | null>(null);
  const center = drift3dTrackNodeBySlug.foolfoule.position;

  useEffect(() => {
    let active = true;
    const loader = new GLTFLoader();

    loader.load(
      DRIFT_3D_BIRTH_YARD_PEDESTRIAN_SOURCE.modelUrl,
      (gltf) => {
        if (!active) {
          disposeSourceScene(gltf.scene);
          return;
        }

        gltf.scene.updateMatrixWorld(true);
        const sourceBounds = new THREE.Box3().setFromObject(gltf.scene);
        const sourceHeight = sourceBounds.getSize(new THREE.Vector3()).y;

        if (!Number.isFinite(sourceHeight) || sourceHeight <= 0.001) {
          disposeSourceScene(gltf.scene);
          return;
        }

        sourceSceneRef.current = gltf.scene;
        const clip = gltf.animations[0] ?? null;

        DRIFT_3D_BIRTH_YARD_FOREGROUND_ACTORS.forEach((config, index) => {
          const host = actorGroupRefs.current[index];
          if (!host) return;

          const model = cloneSkeleton(gltf.scene);
          model.scale.setScalar(config.targetHeight / sourceHeight);
          model.updateMatrixWorld(true);
          const scaledBounds = new THREE.Box3().setFromObject(model);
          model.position.y -= scaledBounds.min.y;
          model.updateMatrixWorld(true);
          ownedMaterialsRef.current.push(...applyActorMaterial(model, config.color));
          host.add(model);
          actorModelRefs.current[index] = model;

          if (clip) {
            const mixer = new THREE.AnimationMixer(model);
            const action = mixer.clipAction(clip);
            action.play();
            action.time = clip.duration * config.phase;
            mixerRefs.current[index] = mixer;
          }
        });
      },
      undefined,
      (error) => {
        if (process.env.NODE_ENV !== "production") {
          console.warn("Birth Yard foreground actors failed to load", error);
        }
      }
    );

    return () => {
      active = false;
      mixerRefs.current.forEach((mixer) => mixer?.stopAllAction());
      mixerRefs.current.fill(null);

      actorModelRefs.current.forEach((model, index) => {
        const host = actorGroupRefs.current[index];
        if (model && host) host.remove(model);
      });
      actorModelRefs.current.fill(null);

      ownedMaterialsRef.current.forEach((material) => material.dispose());
      ownedMaterialsRef.current = [];

      if (sourceSceneRef.current) {
        disposeSourceScene(sourceSceneRef.current);
        sourceSceneRef.current = null;
      }
    };
  }, []);

  useFrame(({ camera, clock }, delta) => {
    const visible =
      Math.hypot(camera.position.x - center.x, camera.position.z - center.z) <
      DRIFT_3D_BIRTH_YARD_CROWD.visibilityRadius + 10;

    DRIFT_3D_BIRTH_YARD_FOREGROUND_ACTORS.forEach((config, index) => {
      const group = actorGroupRefs.current[index];
      if (!group) return;

      group.visible = visible;
      if (!visible) return;

      const flow = DRIFT_3D_BIRTH_YARD_CROWD_FLOWS.find(
        (candidate) => candidate.id === config.flowId
      );
      if (!flow) {
        group.visible = false;
        return;
      }

      const flowLength = getDrift3DBirthYardCrowdFlowLength(flow);
      const progress =
        config.progress +
        (clock.elapsedTime * DRIFT_3D_BIRTH_YARD_CROWD.marchSpeed * config.pace) /
          Math.max(1, flowLength);
      const sample = sampleDrift3DBirthYardCrowdFlow(
        flow,
        progress,
        config.lateralOffset
      );
      const worldX = center.x + sample.x;
      const worldZ = center.z + sample.z;
      group.position.set(worldX, getDrift3DGroundY(worldX, worldZ) + 0.045, worldZ);
      group.rotation.set(0, sample.heading, 0);
      mixerRefs.current[index]?.update(delta * config.pace);
    });
  });

  return (
    <group aria-hidden="true">
      {DRIFT_3D_BIRTH_YARD_FOREGROUND_ACTORS.map((actor, index) => (
        <group
          key={actor.id}
          ref={(group) => {
            actorGroupRefs.current[index] = group;
          }}
        />
      ))}
    </group>
  );
}
