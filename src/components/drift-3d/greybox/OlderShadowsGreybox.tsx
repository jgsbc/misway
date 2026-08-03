"use client";

import { useEffect, useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import * as THREE from "three";
import { getDrift3DKitAssetUrl } from "@/lib/drift3dKitAssets";
import type { Drift3DQualityTier } from "@/lib/drift3dQuality";
import { getDrift3DGroundY, getDrift3DTerrainHeight } from "@/lib/drift3dTerrain";
import { getDrift3DMacroWorldConfig } from "@/lib/drift3dMacroWorldConfig";
import { getDrift3DOlderShadowsCounts } from "@/lib/drift3dMacroWorldPopulation";
import type { Drift3DMacroWorldGreyboxStatus } from "@/lib/drift3dMacroWorldGreyboxHarness";

/**
 * DRIFT-IV-PRE-40 — Older Shadows macro-world greybox.
 *
 * Minimum proof: the mountain massing is already free from the existing
 * production heightfield (drift3dTerrain.ts already carries real peaks/
 * ridges hand-authored for this exact era at these exact coordinates). This
 * component adds only what a heightfield cannot express: one distant small
 * refuge structure (the mountain itself is the architecture — Masterframe
 * §3), the four-register memory device (mixed-generation cairn trail, one
 * piece of worn equipment, a second eroding path, faint footprint traces),
 * and the snow_02 (PRE20-C01) cold-altitude material patch near the peaks.
 */

const OLDER_SHADOWS = getDrift3DMacroWorldConfig("older-shadows");

function hash(seed: number, index: number) {
  const value = Math.sin(seed * 12.9898 + index * 78.233) * 43758.5453;

  return value - Math.floor(value);
}

type OlderShadowsGreyboxProps = {
  qualityTier: Drift3DQualityTier;
  statusRef: MutableRefObject<Drift3DMacroWorldGreyboxStatus>;
};

export default function OlderShadowsGreybox({
  qualityTier,
  statusRef,
}: OlderShadowsGreyboxProps) {
  const cairnMeshRef = useRef<THREE.InstancedMesh>(null);
  const snowMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const snowTexturesRef = useRef<THREE.Texture[]>([]);
  const groupRef = useRef<THREE.Group>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const { cairnCount } = useMemo(
    () => getDrift3DOlderShadowsCounts(qualityTier),
    [qualityTier]
  );

  // Cairn trail: roughly a third read as older/weathered (per the accepted
  // masterframe's exact memory-device requirement), placed along a simple
  // curved trail line, each with real terrain-sampled height.
  const cairnInstances = useMemo(() => {
    return Array.from({ length: cairnCount }, (_, index) => {
      const t = index / Math.max(cairnCount - 1, 1);
      const trailX = OLDER_SHADOWS.localOrigin.x - 10 + t * 20;
      const trailZ = OLDER_SHADOWS.localOrigin.z - 6 + Math.sin(t * Math.PI) * 8;
      const worldX = trailX + (hash(801, index) - 0.5) * 1.2;
      const worldZ = trailZ + (hash(801, index + 1) - 0.5) * 1.2;
      const weathered = index % 3 === 0; // ~a third, deterministic

      return {
        x: worldX,
        z: worldZ,
        scale: 0.5 + hash(801, index + 2) * 0.35,
        weathered,
      };
    });
  }, [cairnCount]);

  useEffect(() => {
    const mesh = cairnMeshRef.current;
    if (!mesh) return;

    cairnInstances.forEach((instance, index) => {
      const y = getDrift3DTerrainHeight(instance.x, instance.z);
      dummy.position.set(instance.x, y + 0.15 * instance.scale, instance.z);
      dummy.scale.setScalar(instance.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [cairnInstances, dummy]);

  // snow_02 (PRE20-C01) cold-altitude material patch near the peaks.
  useEffect(() => {
    let cancelled = false;
    const loader = new THREE.TextureLoader();

    const diffuse = loader.load(getDrift3DKitAssetUrl("material-snow02-diffuse"));
    diffuse.colorSpace = THREE.SRGBColorSpace;
    diffuse.wrapS = THREE.RepeatWrapping;
    diffuse.wrapT = THREE.RepeatWrapping;
    diffuse.repeat.set(3, 3);

    const normalGl = loader.load(getDrift3DKitAssetUrl("material-snow02-normal-gl"));
    normalGl.colorSpace = THREE.NoColorSpace;
    normalGl.wrapS = THREE.RepeatWrapping;
    normalGl.wrapT = THREE.RepeatWrapping;
    normalGl.repeat.set(3, 3);

    const roughness = loader.load(getDrift3DKitAssetUrl("material-snow02-roughness"));
    roughness.colorSpace = THREE.NoColorSpace;
    roughness.wrapS = THREE.RepeatWrapping;
    roughness.wrapT = THREE.RepeatWrapping;
    roughness.repeat.set(3, 3);

    snowTexturesRef.current = [diffuse, normalGl, roughness];
    const material = new THREE.MeshStandardMaterial({
      map: diffuse,
      normalMap: normalGl,
      roughnessMap: roughness,
      roughness: 1,
    });
    snowMaterialRef.current = material;

    if (!cancelled) {
      statusRef.current = {
        ...statusRef.current,
        loadedResourceIds: [
          ...new Set([
            ...statusRef.current.loadedResourceIds,
            "material-snow02-diffuse",
            "material-snow02-normal-gl",
            "material-snow02-roughness",
          ]),
        ],
      };
    }

    return () => {
      cancelled = true;
      material.dispose();
      for (const texture of snowTexturesRef.current) texture.dispose();
      snowTexturesRef.current = [];
      snowMaterialRef.current = null;
      statusRef.current = {
        ...statusRef.current,
        disposalCount: statusRef.current.disposalCount + 1,
      };
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const snowPatchPosition = useMemo(() => {
    const x = OLDER_SHADOWS.localOrigin.x - 30;
    const z = OLDER_SHADOWS.localOrigin.z - 26;

    return { x, z, y: getDrift3DGroundY(x, z) };
  }, []);

  const refugePosition = useMemo(() => {
    const x = OLDER_SHADOWS.localOrigin.x + 6;
    const z = OLDER_SHADOWS.localOrigin.z + 4;

    return { x, z, y: getDrift3DGroundY(x, z) };
  }, []);

  return (
    <group ref={groupRef}>
      {/* One distant small refuge structure — the mountain is the architecture. */}
      <group position={[refugePosition.x, refugePosition.y, refugePosition.z]}>
        <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.6, 1.8, 1.4]} />
          <meshStandardMaterial color="#5c5347" roughness={0.85} />
        </mesh>
        <mesh position={[0, 1.95, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[1.3, 0.7, 4]} />
          <meshStandardMaterial color="#3e3830" roughness={0.9} />
        </mesh>
      </group>

      {/* Second, older, eroding path — a thin low-opacity ribbon near the main trail. */}
      <mesh
        position={[OLDER_SHADOWS.localOrigin.x - 12, 0.02, OLDER_SHADOWS.localOrigin.z - 2]}
        rotation={[-Math.PI / 2, 0, 0.15]}
      >
        <planeGeometry args={[22, 1.1]} />
        <meshStandardMaterial color="#6b6255" roughness={0.95} transparent opacity={0.55} />
      </mesh>

      {/* Faint footprint traces — small darkened flattened patches. */}
      {[0, 1, 2, 3].map((index) => {
        const x = OLDER_SHADOWS.localOrigin.x - 4 + index * 1.4;
        const z = OLDER_SHADOWS.localOrigin.z + 2 + index * 0.4;
        const y = getDrift3DTerrainHeight(x, z);

        return (
          <mesh key={index} position={[x, y + 0.005, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.16, 8]} />
            <meshStandardMaterial color="#4a463c" roughness={0.98} transparent opacity={0.4} />
          </mesh>
        );
      })}

      {/* One piece of worn equipment left beside the trail. */}
      <mesh
        position={[
          OLDER_SHADOWS.localOrigin.x - 6,
          getDrift3DTerrainHeight(OLDER_SHADOWS.localOrigin.x - 6, OLDER_SHADOWS.localOrigin.z - 4) + 0.15,
          OLDER_SHADOWS.localOrigin.z - 4,
        ]}
        rotation={[0, 0.6, 0.3]}
      >
        <boxGeometry args={[0.5, 0.12, 0.18]} />
        <meshStandardMaterial color="#726a53" roughness={0.9} metalness={0.15} />
      </mesh>

      {/* Cairn trail — real terrain-sampled placement, ~1/3 read older/weathered. */}
      <instancedMesh
        ref={cairnMeshRef}
        args={[undefined, undefined, Math.max(cairnInstances.length, 1)]}
        count={cairnInstances.length}
        frustumCulled={false}
        castShadow
      >
        <dodecahedronGeometry args={[0.22, 0]} />
        <meshStandardMaterial color="#8f8778" roughness={0.92} />
      </instancedMesh>

      {/* snow_02 (PRE20-C01) cold-altitude material test patch near the peaks. */}
      {snowMaterialRef.current ? (
        <mesh
          position={[snowPatchPosition.x, snowPatchPosition.y + 0.01, snowPatchPosition.z]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
          material={snowMaterialRef.current}
        >
          <planeGeometry args={[16, 14]} />
        </mesh>
      ) : null}
    </group>
  );
}
