"use client";

import { useEffect, useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { clone as cloneSkinnedObject3D } from "three/examples/jsm/utils/SkeletonUtils.js";
import { disposeDrift3DKitObject3D, loadDrift3DKitGltf } from "@/lib/drift3dKitGltfLoader";
import { getDrift3DKitAssetUrl } from "@/lib/drift3dKitAssets";
import type { Drift3DQualityTier } from "@/lib/drift3dQuality";
import { getDrift3DGroundY } from "@/lib/drift3dTerrain";
import { getDrift3DMacroWorldConfig } from "@/lib/drift3dMacroWorldConfig";
import { getDrift3DVegetativeFieldCounts } from "@/lib/drift3dMacroWorldPopulation";
import type { Drift3DMacroWorldGreyboxStatus } from "@/lib/drift3dMacroWorldGreyboxHarness";

/**
 * DRIFT-IV-PRE-40 — Vegetative Field macro-world greybox.
 *
 * Minimum proof: a repetitive suburban housing grid (two near-identical
 * house forms, same massing/materials, differentiated only by trivial
 * per-instance details — a hedge-height/accent-color variation, per the
 * accepted masterframe) and one resident mid-routine with a single
 * desynchronization beat ("what keeps them human, not a robot"). Flat,
 * slightly overcast midday light is already the existing
 * `vegetativeFieldState` in drift3dAtmosphere.ts — nothing new needed here.
 */

const VEGETATIVE_FIELD = getDrift3DMacroWorldConfig("vegetative-field");
const GRID_SPACING = 6.5;
const RESIDENT_ROUTINE_SECONDS = 7;
const RESIDENT_STUTTER_AT = 4.2; // the single desynchronization beat

function hash(seed: number, index: number) {
  const value = Math.sin(seed * 12.9898 + index * 78.233) * 43758.5453;

  return value - Math.floor(value);
}

type VegetativeFieldGreyboxProps = {
  qualityTier: Drift3DQualityTier;
  reducedMotion: boolean;
  statusRef: MutableRefObject<Drift3DMacroWorldGreyboxStatus>;
};

export default function VegetativeFieldGreybox({
  qualityTier,
  reducedMotion,
  statusRef,
}: VegetativeFieldGreyboxProps) {
  const groupRef = useRef<THREE.Group>(null);
  const residentRootRef = useRef<THREE.Object3D | null>(null);
  const residentMixerRef = useRef<THREE.AnimationMixer | null>(null);
  const residentActionsRef = useRef<Map<string, THREE.AnimationAction>>(new Map());
  const residentClipsRef = useRef<THREE.AnimationClip[]>([]);
  const residentCycleRef = useRef({ elapsed: 0, stuttered: false, currentClip: "idle" });

  const { houseCount } = useMemo(
    () => getDrift3DVegetativeFieldCounts(qualityTier),
    [qualityTier]
  );

  const houseInstances = useMemo(() => {
    const perRow = Math.ceil(Math.sqrt(houseCount));

    return Array.from({ length: houseCount }, (_, index) => {
      const row = Math.floor(index / perRow);
      const column = index % perRow;

      return {
        x: VEGETATIVE_FIELD.localOrigin.x + (column - perRow / 2) * GRID_SPACING,
        z: VEGETATIVE_FIELD.localOrigin.z + (row - perRow / 2) * GRID_SPACING,
        // trivial per-instance variation only — same massing, same materials
        garageAccent: hash(901, index) > 0.5 ? "#8a6a4a" : "#5c6a72",
        hedgeHeight: 0.28 + hash(901, index + 1) * 0.12,
      };
    });
  }, [houseCount]);

  // One resident, mid-routine, with one desynchronization beat.
  useEffect(() => {
    let cancelled = false;

    loadDrift3DKitGltf(getDrift3DKitAssetUrl("human-crowd-character-male-a"))
      .then((gltf) => {
        if (cancelled) return;
        const group = groupRef.current;
        if (!group) return;

        const root = cloneSkinnedObject3D(gltf.scene);
        root.position.set(
          VEGETATIVE_FIELD.localOrigin.x + 1.4,
          0,
          VEGETATIVE_FIELD.localOrigin.z - 1.2
        );
        const mixer = new THREE.AnimationMixer(root);
        residentRootRef.current = root;
        residentMixerRef.current = mixer;
        residentClipsRef.current = gltf.animations;
        group.add(root);

        statusRef.current = {
          ...statusRef.current,
          loadedResourceIds: [
            ...new Set([
              ...statusRef.current.loadedResourceIds,
              "human-crowd-character-male-a",
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
            `human-crowd-character-male-a (vegetative-field): ${String(error)}`,
          ],
        };
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const residentActions = residentActionsRef.current;

    return () => {
      const root = residentRootRef.current;
      const mixer = residentMixerRef.current;
      if (mixer) {
        mixer.stopAllAction();
        if (root) mixer.uncacheRoot(root);
      }
      if (root) {
        disposeDrift3DKitObject3D(root);
        root.parent?.remove(root);
      }
      residentRootRef.current = null;
      residentMixerRef.current = null;
      residentActions.clear();
      statusRef.current = {
        ...statusRef.current,
        disposalCount: statusRef.current.disposalCount + 1,
      };
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((_, delta) => {
    const mixer = residentMixerRef.current;
    const clips = residentClipsRef.current;
    if (!mixer || clips.length === 0) return;

    if (reducedMotion) {
      mixer.update(0);

      return;
    }

    const cycle = residentCycleRef.current;
    cycle.elapsed += delta;

    if (cycle.elapsed >= RESIDENT_ROUTINE_SECONDS) {
      cycle.elapsed = 0;
      cycle.stuttered = false;
    }

    // The single desynchronization beat: the routine holds (mixer paused)
    // for one brief instant near the same point in every cycle — "the
    // resident fumbles the routine for a single beat," never a machine's
    // exact repeat.
    const inStutterWindow =
      cycle.elapsed >= RESIDENT_STUTTER_AT && cycle.elapsed < RESIDENT_STUTTER_AT + 0.3;

    if (inStutterWindow) {
      cycle.stuttered = true;

      return; // mixer.update skipped this frame only — a single held beat
    }

    const desiredClipName = cycle.elapsed < RESIDENT_STUTTER_AT ? "walk" : "idle";

    if (desiredClipName !== cycle.currentClip) {
      let action = residentActionsRef.current.get(desiredClipName);

      if (!action) {
        const clip = clips.find((candidate) => candidate.name === desiredClipName);
        if (clip) {
          action = mixer.clipAction(clip);
          residentActionsRef.current.set(desiredClipName, action);
        }
      }

      const previousAction = residentActionsRef.current.get(cycle.currentClip);
      action?.reset().play();
      if (previousAction && previousAction !== action) {
        previousAction.fadeOut(0.3);
        action?.fadeIn(0.3);
      }

      cycle.currentClip = desiredClipName;
    }

    mixer.update(delta);
  });

  const groundY = getDrift3DGroundY(VEGETATIVE_FIELD.localOrigin.x, VEGETATIVE_FIELD.localOrigin.z);

  return (
    <group ref={groupRef} position={[0, groundY, 0]}>
      {houseInstances.map((house, index) => (
        <group key={index} position={[house.x, 0, house.z]}>
          <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
            <boxGeometry args={[3.6, 2.2, 3.2]} />
            <meshStandardMaterial color="#cfc9ba" roughness={0.85} />
          </mesh>
          <mesh position={[0, 2.5, 0]} rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[2.7, 1.1, 4]} />
            <meshStandardMaterial color="#8a7d68" roughness={0.9} />
          </mesh>
          <mesh position={[1.2, 0.5, 1.62]}>
            <boxGeometry args={[1, 1, 0.06]} />
            <meshStandardMaterial color={house.garageAccent} roughness={0.7} />
          </mesh>
          <mesh position={[-1.6, house.hedgeHeight / 2, 1.9]}>
            <boxGeometry args={[1.3, house.hedgeHeight, 0.4]} />
            <meshStandardMaterial color="#7a8a5c" roughness={0.95} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
