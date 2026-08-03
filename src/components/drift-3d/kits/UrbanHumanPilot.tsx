"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { clone as cloneSkinnedObject3D } from "three/examples/jsm/utils/SkeletonUtils.js";
import {
  disposeDrift3DKitObject3D,
  loadDrift3DKitGltf,
} from "@/lib/drift3dKitGltfLoader";
import { getDrift3DKitAssetUrl } from "@/lib/drift3dKitAssets";
import {
  getDrift3DUrbanHumanCounts,
  type Drift3DKitPilotStatus,
} from "@/lib/drift3dKitPilotConfig";
import type { Drift3DQualityTier } from "@/lib/drift3dQuality";

/**
 * DRIFT-IV-PRE-30 — Urban/Human pilot. Proves real GLB loading, one real
 * skinned character (`PRE20-A01` Kenney Mini Characters) driven by an
 * `AnimationMixer`, deterministic clip switching without mixer
 * accumulation, and Kenney City Kit Commercial (`PRE20-A02`) background
 * massing sharing one material per building form. Both Kenney candidates
 * remain bounded to technical/background use — see the pilot's own README
 * (`public/models/human-crowd/README.md`, `public/models/urban/README.md`)
 * and `docs/evidence/DRIFT-IV-PRE-20/licensed-asset-provenance-registry.md`
 * §14.2 for the owner guardrails this pilot must not violate.
 */

const ANIMATED_CLIP_CYCLE = ["idle", "walk", "interact-right"] as const;
const CLIP_HOLD_SECONDS = 3.2;
const CLIP_CROSSFADE_SECONDS = 0.4;
const CHARACTER_SPACING_METERS = 1.4;

const BUILDING_ASSET_IDS = ["urban-building-a", "urban-building-b"] as const;
const BUILDING_AREA_HALF_METERS = 9;
const CROWD_RADIUS_METERS = 6.4;

function hash(seed: number, index: number) {
  const value = Math.sin(seed * 12.9898 + index * 78.233) * 43758.5453;

  return value - Math.floor(value);
}

type AnimatedCharacter = {
  root: THREE.Object3D;
  mixer: THREE.AnimationMixer;
  actionsByClip: Map<string, THREE.AnimationAction>;
  clipCursor: number;
  clipTimer: number;
  currentAction: THREE.AnimationAction | null;
};

type UrbanHumanPilotProps = {
  qualityTier: Drift3DQualityTier;
  reducedMotion: boolean;
  statusRef: MutableRefObject<Drift3DKitPilotStatus>;
};

export default function UrbanHumanPilot({
  qualityTier,
  reducedMotion,
  statusRef,
}: UrbanHumanPilotProps) {
  const groupRef = useRef<THREE.Group>(null);
  const charactersRef = useRef<AnimatedCharacter[]>([]);
  const characterTemplateRef = useRef<THREE.Object3D | null>(null);
  const characterClipsRef = useRef<THREE.AnimationClip[]>([]);
  const buildingMeshRefs = useRef<
    Partial<Record<(typeof BUILDING_ASSET_IDS)[number], THREE.InstancedMesh>>
  >({});
  const buildingGeometryCacheRef = useRef<Map<string, THREE.BufferGeometry>>(
    new Map()
  );
  const buildingMaterialCacheRef = useRef<Map<string, THREE.Material>>(
    new Map()
  );
  const counts = useMemo(
    () => getDrift3DUrbanHumanCounts(qualityTier),
    [qualityTier]
  );

  const buildingInstances = useMemo(() => {
    const perForm = Math.max(
      1,
      Math.ceil(counts.backgroundBuildingCount / BUILDING_ASSET_IDS.length)
    );
    const instances: Record<
      (typeof BUILDING_ASSET_IDS)[number],
      { x: number; z: number; rotationY: number; scale: number }[]
    > = { "urban-building-a": [], "urban-building-b": [] };

    let placed = 0;

    for (const assetId of BUILDING_ASSET_IDS) {
      for (let index = 0; index < perForm; index += 1) {
        if (placed >= counts.backgroundBuildingCount) {
          break;
        }

        const seed = assetId === "urban-building-a" ? 401 : 523;
        const u = hash(seed, index * 2);
        const v = hash(seed, index * 2 + 1);
        instances[assetId].push({
          x: (u - 0.5) * 2 * BUILDING_AREA_HALF_METERS,
          z: -6 - v * 10,
          rotationY: hash(seed + 1, index) * Math.PI * 2,
          scale: 0.9 + hash(seed + 2, index) * 0.35,
        });
        placed += 1;
      }
    }

    return instances;
  }, [counts.backgroundBuildingCount]);

  // Load the character GLB once per mount and build N independent skinned
  // clones (SkeletonUtils.clone — plain Object3D cloning would share bind
  // skeletons across instances). Small count by design (this is the "few
  // real skinned characters" half of the hybrid distance strategy, never
  // the crowd).
  useEffect(() => {
    let cancelled = false;

    loadDrift3DKitGltf(getDrift3DKitAssetUrl("human-crowd-character-male-a"))
      .then((gltf) => {
        if (cancelled) {
          return;
        }

        characterTemplateRef.current = gltf.scene;
        characterClipsRef.current = gltf.animations;

        const group = groupRef.current;

        if (!group) {
          return;
        }

        const characters: AnimatedCharacter[] = [];

        for (let index = 0; index < counts.animatedCharacterCount; index += 1) {
          const root = cloneSkinnedObject3D(gltf.scene);
          root.position.set(
            (index - (counts.animatedCharacterCount - 1) / 2) *
              CHARACTER_SPACING_METERS,
            0,
            0
          );
          const mixer = new THREE.AnimationMixer(root);

          characters.push({
            root,
            mixer,
            actionsByClip: new Map(),
            clipCursor: 0,
            clipTimer: 0,
            currentAction: null,
          });
          group.add(root);
        }

        charactersRef.current = characters;
        statusRef.current = {
          ...statusRef.current,
          loadedAssetIds: [
            ...new Set([
              ...statusRef.current.loadedAssetIds,
              "human-crowd-character-male-a",
            ]),
          ],
          instanceCount:
            counts.animatedCharacterCount + counts.silhouetteCrowdCount,
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
            `human-crowd-character-male-a: ${String(error)}`,
          ],
        };
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counts.animatedCharacterCount]);

  // Load the two building forms once, build one InstancedMesh per form.
  useEffect(() => {
    let cancelled = false;

    for (const assetId of BUILDING_ASSET_IDS) {
      loadDrift3DKitGltf(getDrift3DKitAssetUrl(assetId))
        .then((gltf) => {
          if (cancelled) {
            return;
          }

          let sourceMesh: THREE.Mesh | null = null;

          gltf.scene.traverse((object) => {
            if (!sourceMesh && (object as THREE.Mesh).isMesh) {
              sourceMesh = object as THREE.Mesh;
            }
          });

          if (!sourceMesh) {
            return;
          }

          const geometry = (sourceMesh as THREE.Mesh).geometry;
          const material = (sourceMesh as THREE.Mesh).material;
          buildingGeometryCacheRef.current.set(assetId, geometry);
          buildingMaterialCacheRef.current.set(
            assetId,
            Array.isArray(material) ? material[0] : material
          );

          const group = groupRef.current;
          const instances = buildingInstances[assetId];

          if (!group || !instances) {
            return;
          }

          const mesh = new THREE.InstancedMesh(
            geometry,
            Array.isArray(material) ? material[0] : material,
            Math.max(instances.length, 1)
          );
          mesh.frustumCulled = false;
          const dummy = new THREE.Object3D();

          instances.forEach((instance, index) => {
            dummy.position.set(instance.x, 0, instance.z);
            dummy.rotation.set(0, instance.rotationY, 0);
            dummy.scale.setScalar(instance.scale);
            dummy.updateMatrix();
            mesh.setMatrixAt(index, dummy.matrix);
          });
          mesh.count = instances.length;
          mesh.instanceMatrix.needsUpdate = true;

          group.add(mesh);
          buildingMeshRefs.current[assetId] = mesh;

          statusRef.current = {
            ...statusRef.current,
            loadedAssetIds: [
              ...new Set([...statusRef.current.loadedAssetIds, assetId]),
            ],
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

  // Rebuild building instance matrices when the Quality-Tier-derived count
  // changes, reusing the already-loaded geometry/material (no re-fetch).
  useEffect(() => {
    for (const assetId of BUILDING_ASSET_IDS) {
      const mesh = buildingMeshRefs.current[assetId];
      const instances = buildingInstances[assetId];

      if (!mesh || !instances) {
        continue;
      }

      const dummy = new THREE.Object3D();

      instances.forEach((instance, index) => {
        dummy.position.set(instance.x, 0, instance.z);
        dummy.rotation.set(0, instance.rotationY, 0);
        dummy.scale.setScalar(instance.scale);
        dummy.updateMatrix();
        mesh.setMatrixAt(index, dummy.matrix);
      });
      mesh.count = instances.length;
      mesh.instanceMatrix.needsUpdate = true;
    }
  }, [buildingInstances]);

  // Full disposal on unmount: characters (mixer + cloned skinned meshes) and
  // building InstancedMeshes. Bumps the shared disposal counter so the dev
  // harness/evidence package can confirm switching pilots does not leak.
  useLayoutEffect(() => {
    const geometryCache = buildingGeometryCacheRef.current;
    const materialCache = buildingMaterialCacheRef.current;

    return () => {
      for (const character of charactersRef.current) {
        character.mixer.stopAllAction();
        character.mixer.uncacheRoot(character.root);
        disposeDrift3DKitObject3D(character.root);
        character.root.parent?.remove(character.root);
      }
      charactersRef.current = [];

      for (const assetId of BUILDING_ASSET_IDS) {
        const mesh = buildingMeshRefs.current[assetId];

        mesh?.geometry?.dispose();
        mesh?.parent?.remove(mesh);
      }
      buildingMeshRefs.current = {};

      for (const geometry of geometryCache.values()) {
        geometry.dispose();
      }
      geometryCache.clear();

      for (const material of materialCache.values()) {
        const map = (material as THREE.MeshStandardMaterial).map;
        map?.dispose();
        material.dispose();
      }
      materialCache.clear();

      statusRef.current = {
        ...statusRef.current,
        loadedAssetIds: [],
        animationClip: null,
        instanceCount: 0,
        disposalCount: statusRef.current.disposalCount + 1,
      };
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((_, delta) => {
    const clips = characterClipsRef.current;

    if (clips.length === 0) {
      return;
    }

    const boundedDelta = reducedMotion ? 0 : Math.min(delta, 0.1);

    for (const character of charactersRef.current) {
      character.mixer.update(boundedDelta);

      if (reducedMotion) {
        continue;
      }

      character.clipTimer += delta;

      if (character.clipTimer < CLIP_HOLD_SECONDS) {
        continue;
      }

      character.clipTimer = 0;
      character.clipCursor =
        (character.clipCursor + 1) % ANIMATED_CLIP_CYCLE.length;
      const clipName = ANIMATED_CLIP_CYCLE[character.clipCursor];

      let nextAction = character.actionsByClip.get(clipName);

      if (!nextAction) {
        const clip = clips.find((candidate) => candidate.name === clipName);

        if (!clip) {
          continue;
        }

        nextAction = character.mixer.clipAction(clip);
        character.actionsByClip.set(clipName, nextAction);
      }

      const previousAction = character.currentAction;

      nextAction.reset();
      nextAction.play();

      if (previousAction && previousAction !== nextAction) {
        previousAction.crossFadeTo(nextAction, CLIP_CROSSFADE_SECONDS, false);
      } else {
        nextAction.fadeIn(CLIP_CROSSFADE_SECONDS);
      }

      character.currentAction = nextAction;

      if (character === charactersRef.current[0]) {
        statusRef.current = {
          ...statusRef.current,
          animationClip: clipName,
        };
      }
    }
  });

  const silhouetteInstances = useMemo(() => {
    return Array.from({ length: counts.silhouetteCrowdCount }, (_, index) => {
      const angle = hash(701, index) * Math.PI * 2;
      const radius = CROWD_RADIUS_METERS + hash(701, index + 1) * 3;

      return {
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius - 4,
        scale: 0.85 + hash(701, index + 2) * 0.3,
        phase: hash(701, index + 3) * Math.PI * 2,
      };
    });
  }, [counts.silhouetteCrowdCount]);

  const silhouetteMeshRef = useRef<THREE.InstancedMesh>(null);
  const silhouetteDummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    const mesh = silhouetteMeshRef.current;

    if (!mesh) {
      return;
    }

    const bob = reducedMotion
      ? 0
      : Math.sin(clock.elapsedTime * 2.1) * 0.03;

    silhouetteInstances.forEach((instance, index) => {
      silhouetteDummy.position.set(
        instance.x,
        0.42 * instance.scale + bob * Math.sin(instance.phase),
        instance.z
      );
      silhouetteDummy.scale.setScalar(instance.scale);
      silhouetteDummy.updateMatrix();
      mesh.setMatrixAt(index, silhouetteDummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={groupRef}>
      <mesh position={[0, -0.01, -2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[24, 24]} />
        <meshStandardMaterial color="#8d8579" roughness={0.95} />
      </mesh>
      <instancedMesh
        ref={silhouetteMeshRef}
        args={[undefined, undefined, Math.max(silhouetteInstances.length, 1)]}
        count={silhouetteInstances.length}
        frustumCulled={false}
        castShadow
      >
        <capsuleGeometry args={[0.09, 0.36, 3, 6]} />
        <meshStandardMaterial color="#2e2c33" roughness={0.9} />
      </instancedMesh>
    </group>
  );
}
