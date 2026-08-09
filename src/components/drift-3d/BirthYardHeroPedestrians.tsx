"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";
import {
  DRIFT_3D_BIRTH_YARD_FOREGROUND_ACTORS,
  DRIFT_3D_BIRTH_YARD_PEDESTRIAN_SOURCE,
  type Drift3DBirthYardHeroActor,
} from "@/lib/drift3dBirthYardHeroAssets";
import {
  DRIFT_3D_BIRTH_YARD_CROWD,
  DRIFT_3D_BIRTH_YARD_CROWD_FLOWS,
  getDrift3DBirthYardCrowdFlowLength,
  sampleDrift3DBirthYardCrowdFlow,
} from "@/lib/drift3dBirthYardHeroCrowd";
import { getDrift3DGroundY } from "@/lib/drift3dTerrain";
import { drift3dTrackNodeBySlug } from "@/lib/drift3dTopology";

type RuntimeActor = {
  root: THREE.Group;
  mixer: THREE.AnimationMixer | null;
  config: Drift3DBirthYardHeroActor;
};

function disposeMaterial(material: THREE.Material) {
  const candidate = material as THREE.Material & Record<string, unknown>;

  for (const value of Object.values(candidate)) {
    if (value instanceof THREE.Texture) {
      value.dispose();
    }
  }

  material.dispose();
}

function disposeSourceScene(scene: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();

  scene.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) {
      return;
    }

    geometries.add(child.geometry);
    const sourceMaterials = Array.isArray(child.material)
      ? child.material
      : [child.material];
    sourceMaterials.forEach((material) => materials.add(material));
  });

  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach(disposeMaterial);
}

function applyActorMaterial(root: THREE.Object3D, color: string) {
  const materials: THREE.Material[] = [];

  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) {
      return;
    }

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
 * Hero Asset Pass 02 foreground tier.
 *
 * The 186-instance primitive crowd remains the pressure/background layer.
 * Exactly six of the previous procedural slots are promoted to skinned,
 * authored-animation walkers moving through the same inter-building grammar.
 * This gives the camera a readable human silhouette without turning 192
 * pedestrians into 192 separately-skinned draw/animation costs.
 */
export default function BirthYardHeroPedestrians() {
  const rootRef = useRef<THREE.Group>(null);
  const runtimeActorsRef = useRef<RuntimeActor[]>([]);
  const ownedMaterialsRef = useRef<THREE.Material[]>([]);
  const sourceSceneRef = useRef<THREE.Object3D | null>(null);
  const center = drift3dTrackNodeBySlug.foolfoule.position;

  useEffect(() => {
    const root = rootRef.current;

    if (!root) {
      return;
    }

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
        const sourceSize = sourceBounds.getSize(new THREE.Vector3());
        const sourceHeight = sourceSize.y;

        if (!Number.isFinite(sourceHeight) || sourceHeight <= 0.001) {
          disposeSourceScene(gltf.scene);
          return;
        }

        sourceSceneRef.current = gltf.scene;
        const clip = gltf.animations[0] ?? null;
        const actors: RuntimeActor[] = [];

        for (const config of DRIFT_3D_BIRTH_YARD_FOREGROUND_ACTORS) {
          const model = cloneSkeleton(gltf.scene);
          const scale = config.targetHeight / sourceHeight;
          model.scale.setScalar(scale);
          model.updateMatrixWorld(true);

          const scaledBounds = new THREE.Box3().setFromObject(model);
          model.position.y -= scaledBounds.min.y;
          model.updateMatrixWorld(true);

          ownedMaterialsRef.current.push(
            ...applyActorMaterial(model, config.color)
          );

          const actorRoot = new THREE.Group();
          actorRoot.add(model);
          root.add(actorRoot);

          let mixer: THREE.AnimationMixer | null = null;

          if (clip) {
            mixer = new THREE.AnimationMixer(model);
            const action = mixer.clipAction(clip);
            action.play();
            action.time = clip.duration * config.phase;
          }

          actors.push({ root: actorRoot, mixer, config });
        }

        runtimeActorsRef.current = actors;
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

      for (const actor of runtimeActorsRef.current) {
        actor.mixer?.stopAllAction();
        root.remove(actor.root);
      }
      runtimeActorsRef.current = [];

      ownedMaterialsRef.current.forEach((material) => material.dispose());
      ownedMaterialsRef.current = [];

      if (sourceSceneRef.current) {
        disposeSourceScene(sourceSceneRef.current);
        sourceSceneRef.current = null;
      }
    };
  }, []);

  useFrame(({ camera, clock }, delta) => {
    const actors = runtimeActorsRef.current;

    if (actors.length === 0) {
      return;
    }

    const visible =
      Math.hypot(camera.position.x - center.x, camera.position.z - center.z) <
      DRIFT_3D_BIRTH_YARD_CROWD.visibilityRadius + 10;

    for (const actor of actors) {
      actor.root.visible = visible;

      if (!visible) {
        continue;
      }

      const flow = DRIFT_3D_BIRTH_YARD_CROWD_FLOWS.find(
        (candidate) => candidate.id === actor.config.flowId
      );

      if (!flow) {
        actor.root.visible = false;
        continue;
      }

      const flowLength = getDrift3DBirthYardCrowdFlowLength(flow);
      const progress =
        actor.config.progress +
        (clock.elapsedTime * DRIFT_3D_BIRTH_YARD_CROWD.marchSpeed *
          actor.config.pace) /
          Math.max(1, flowLength);
      const sample = sampleDrift3DBirthYardCrowdFlow(
        flow,
        progress,
        actor.config.lateralOffset
      );
      const worldX = center.x + sample.x;
      const worldZ = center.z + sample.z;
      const groundY = getDrift3DGroundY(worldX, worldZ) + 0.045;

      actor.root.position.set(worldX, groundY, worldZ);
      actor.root.rotation.set(0, sample.heading, 0);
      actor.mixer?.update(delta * actor.config.pace);
    }
  });

  return <group ref={rootRef} aria-hidden="true" />;
}
