"use client";

import { useMemo } from "react";
import type { MutableRefObject } from "react";
import * as THREE from "three";
import { getDriftMaterialTexture } from "@/components/drift-3d/drift3dTextureFactory";
import { getDrift3DGroundY } from "@/lib/drift3dTerrain";
import { getDrift3DMacroWorldConfig } from "@/lib/drift3dMacroWorldConfig";
import type { Drift3DMacroWorldGreyboxStatus } from "@/lib/drift3dMacroWorldGreyboxHarness";
import type { Drift3DQualityTier } from "@/lib/drift3dQuality";

/**
 * DRIFT-IV-PRE-40 — Entry macro-world greybox.
 *
 * Minimum proof per the accepted masterframe/Era Contract: a single
 * unbranching mineral corridor (no side passages), near-total darkness with
 * only a λ-shaped glow sculpted into the rock at the far end, raw PBR stone
 * (rock_boulder_dry, already in the repo via drift3dTextureFactory.ts), and
 * unmanned administrative infrastructure (relay/stamp/screen) — never a
 * clean modern room. Heightfield terrain cannot express an enclosed
 * tunnel/overhang, so the corridor walls/ceiling are authored primitive
 * geometry, matching this lot's own "low fidelity in props, high fidelity
 * in scale/composition" rule.
 */

const ENTRY = getDrift3DMacroWorldConfig("entry");
const CORRIDOR_WIDTH = 4.6;
const CORRIDOR_HEIGHT = 4;
// Direction from the spawn point toward Birth Yard (matches the real
// topology heading, not an invented direction).
const CORRIDOR_DIRECTION = (() => {
  const dx = 14;
  const dz = 10;
  const length = Math.hypot(dx, dz);

  return { x: dx / length, z: dz / length };
})();
const CORRIDOR_YAW = Math.atan2(CORRIDOR_DIRECTION.x, CORRIDOR_DIRECTION.z);
const CORRIDOR_LENGTH = 20;

type EntryGreyboxProps = {
  qualityTier: Drift3DQualityTier;
  statusRef: MutableRefObject<Drift3DMacroWorldGreyboxStatus>;
};

export default function EntryGreybox({ qualityTier }: EntryGreyboxProps) {
  void qualityTier; // Entry's density is SPARSE at every tier — nothing to scale.

  const rockTexture = useMemo(
    () => getDriftMaterialTexture("rock", 2, 1) ?? undefined,
    []
  );
  const groundY = getDrift3DGroundY(ENTRY.localOrigin.x, ENTRY.localOrigin.z);

  const lambdaShapeGeometry = useMemo(() => {
    // A crude two-stroke λ silhouette: a long diagonal + a short diagonal,
    // sculpted flush into the ceiling near the exit — never a floating icon.
    const shape = new THREE.Shape();
    shape.moveTo(-0.05, 0.6);
    shape.lineTo(0.05, 0.6);
    shape.lineTo(-0.25, -0.6);
    shape.lineTo(-0.35, -0.6);
    shape.closePath();
    const leftStroke = new THREE.ShapeGeometry(shape);

    return leftStroke;
  }, []);

  return (
    <group
      position={[ENTRY.localOrigin.x, groundY, ENTRY.localOrigin.z]}
      rotation={[0, CORRIDOR_YAW, 0]}
    >
      {/* Corridor walls + ceiling: raw PBR stone, no polish. */}
      <mesh
        position={[-CORRIDOR_WIDTH / 2, CORRIDOR_HEIGHT / 2, 0]}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[0.6, CORRIDOR_HEIGHT, CORRIDOR_LENGTH]} />
        <meshStandardMaterial map={rockTexture} color="#5b544a" roughness={0.97} />
      </mesh>
      <mesh
        position={[CORRIDOR_WIDTH / 2, CORRIDOR_HEIGHT / 2, 0]}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[0.6, CORRIDOR_HEIGHT, CORRIDOR_LENGTH]} />
        <meshStandardMaterial map={rockTexture} color="#5b544a" roughness={0.97} />
      </mesh>
      <mesh position={[0, CORRIDOR_HEIGHT, 0]} receiveShadow>
        <boxGeometry args={[CORRIDOR_WIDTH + 1.2, 0.6, CORRIDOR_LENGTH]} />
        <meshStandardMaterial map={rockTexture} color="#4a453d" roughness={0.98} />
      </mesh>

      {/* λ-shaped glow, sculpted into the ceiling near the exit toward Birth Yard. */}
      <mesh
        geometry={lambdaShapeGeometry}
        position={[0, CORRIDOR_HEIGHT - 0.32, CORRIDOR_LENGTH / 2 - 1.4]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <meshStandardMaterial
          color="#dbe8f5"
          emissive="#bcd6ef"
          emissiveIntensity={1.4}
          roughness={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Unmanned administrative relay: housing + stamp arm + small screen. */}
      <mesh position={[CORRIDOR_WIDTH / 2 - 0.42, 1.1, -3.5]} castShadow>
        <boxGeometry args={[0.4, 0.5, 0.3]} />
        <meshStandardMaterial color="#2f322e" roughness={0.6} metalness={0.3} />
      </mesh>
      <mesh position={[CORRIDOR_WIDTH / 2 - 0.55, 1.35, -3.35]} rotation={[0, 0, 0.4]}>
        <cylinderGeometry args={[0.02, 0.02, 0.35, 6]} />
        <meshStandardMaterial color="#8a8578" roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[CORRIDOR_WIDTH / 2 - 0.4, 1.3, -3.35]}>
        <planeGeometry args={[0.22, 0.12]} />
        <meshStandardMaterial
          color="#0d1a12"
          emissive="#3fae5c"
          emissiveIntensity={0.6}
          roughness={0.5}
        />
      </mesh>

      {/* Small indicator light — the only source in near-total darkness besides the exit. */}
      <pointLight
        position={[CORRIDOR_WIDTH / 2 - 0.4, 1.3, -3.35]}
        color="#4fce74"
        intensity={0.4}
        distance={2.5}
      />
    </group>
  );
}
