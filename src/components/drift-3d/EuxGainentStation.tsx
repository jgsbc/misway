"use client";

import type * as THREE from "three";
import {
  getEuxGainentBlackPlasticTexture,
  getEuxGainentBrushedMetalTexture,
  getEuxGainentRubberFloorTexture,
} from "@/lib/drift3dEuxGainentMaterials";
import type { EuxGainentAthleteArchetype } from "@/components/drift-3d/EuxGainentAthlete";

export type EuxGainentStationRefs = {
  /** The one primary moving part the signature must show "continuing for itself". */
  movingPart: THREE.Group | null;
  consoleMaterial: THREE.MeshBasicMaterial | null;
};

export function createEuxGainentStationRefs(): EuxGainentStationRefs {
  return { movingPart: null, consoleMaterial: null };
}

export type EuxGainentStationProps = {
  archetype: EuxGainentAthleteArchetype;
  footprint: readonly [number, number, number];
  color: string;
  /**
   * Ref-callbacks created and owned by the parent scene (its own local
   * `useRef` bucket) — this component never mutates a shared object handed
   * to it as a prop, only forwards these callbacks to its own elements.
   */
  onMovingPartRef: (node: THREE.Group | null) => void;
  onConsoleMaterialRef: (node: THREE.MeshBasicMaterial | null) => void;
};

/**
 * One recognizable cardio-machine archetype (DRIFT-IV-BY-EUX-30 realism
 * pass): a treadmill, an elliptical/bike, or a rowing machine — sharing a
 * family palette (brushed metal mast, black plastic console, rubber-floor
 * base tone) so the A/B/C comparison stays legible, while each silhouette
 * reads as genuine gym equipment before any anomaly. `movingPart` is the one
 * element the signature keeps visibly active while its athlete freezes.
 */
export default function EuxGainentStation({
  archetype,
  footprint,
  color,
  onMovingPartRef,
  onConsoleMaterialRef,
}: EuxGainentStationProps) {
  const [width, , depth] = footprint;
  const rubberMap = getEuxGainentRubberFloorTexture(1, 1);
  const metalMap = getEuxGainentBrushedMetalTexture(1, 1);
  const plasticMap = getEuxGainentBlackPlasticTexture(1, 1);

  const mastHeight = 0.62;
  const consoleY = mastHeight;

  return (
    <group>
      {/* Shared base plinth — rubber-toned, family resemblance across A/B/C. */}
      <mesh position={[0, 0.03, 0]} receiveShadow castShadow>
        <boxGeometry args={[width, 0.06, depth]} />
        <meshStandardMaterial
          color={color}
          map={rubberMap ?? undefined}
          roughness={0.88}
        />
      </mesh>

      {/* Console mast, shared silhouette across archetypes. */}
      <mesh position={[0, mastHeight / 2, depth * 0.3]} castShadow>
        <cylinderGeometry args={[0.018, 0.018, mastHeight, 8]} />
        <meshStandardMaterial map={metalMap ?? undefined} color="#aeb6bd" roughness={0.4} />
      </mesh>
      <mesh position={[0, consoleY, depth * 0.3]} castShadow>
        <boxGeometry args={[0.16, 0.1, 0.02]} />
        <meshBasicMaterial ref={onConsoleMaterialRef} color="#0c1013" toneMapped={false} />
      </mesh>

      {archetype === "treadmill" ? (
        <>
          <mesh position={[0, 0.08, -depth * 0.05]} castShadow>
            <boxGeometry args={[width * 0.72, 0.02, depth * 0.7]} />
            <meshStandardMaterial map={plasticMap ?? undefined} color="#1c1e21" roughness={0.55} />
          </mesh>
          {/* Visible roller end-cap — a flat wheel disc so the parent group
              can spin it around X, the same axis as its own static tilt
              below (both rotations share one axis, composing trivially). */}
          <group ref={onMovingPartRef} position={[0, 0.09, -depth * 0.36]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.055, 0.055, 0.02, 12]} />
              <meshStandardMaterial map={metalMap ?? undefined} color="#c3cad1" roughness={0.3} />
            </mesh>
          </group>
        </>
      ) : null}

      {archetype === "bike" ? (
        <>
          <mesh position={[0, 0.28, -depth * 0.1]} castShadow>
            <cylinderGeometry args={[0.03, 0.035, 0.26, 8]} />
            <meshStandardMaterial map={metalMap ?? undefined} color="#aeb6bd" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.42, -depth * 0.1]} castShadow>
            <boxGeometry args={[0.16, 0.05, 0.12]} />
            <meshStandardMaterial map={plasticMap ?? undefined} color="#1c1e21" roughness={0.6} />
          </mesh>
          <group ref={onMovingPartRef} position={[0, 0.1, -depth * 0.32]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.02, 0.02, 0.04, 8]} />
              <meshStandardMaterial map={metalMap ?? undefined} color="#c3cad1" roughness={0.3} />
            </mesh>
            <mesh position={[0.09, 0, 0]} castShadow>
              <boxGeometry args={[0.14, 0.02, 0.04]} />
              <meshStandardMaterial map={plasticMap ?? undefined} color="#1c1e21" roughness={0.6} />
            </mesh>
            <mesh position={[-0.09, 0, 0]} castShadow>
              <boxGeometry args={[0.14, 0.02, 0.04]} />
              <meshStandardMaterial map={plasticMap ?? undefined} color="#1c1e21" roughness={0.6} />
            </mesh>
          </group>
        </>
      ) : null}

      {archetype === "rower" ? (
        <>
          <mesh position={[0, 0.05, depth * 0.02]} castShadow>
            <boxGeometry args={[0.09, 0.03, depth * 0.9]} />
            <meshStandardMaterial map={metalMap ?? undefined} color="#aeb6bd" roughness={0.4} />
          </mesh>
          <group ref={onMovingPartRef} position={[0, 0.1, depth * 0.15]}>
            <mesh castShadow>
              <boxGeometry args={[0.14, 0.05, 0.12]} />
              <meshStandardMaterial map={plasticMap ?? undefined} color="#1c1e21" roughness={0.6} />
            </mesh>
          </group>
        </>
      ) : null}
    </group>
  );
}
