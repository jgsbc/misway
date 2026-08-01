"use client";

import type * as THREE from "three";

export type EuxGainentAthleteArchetype = "treadmill" | "bike" | "rower";

export type EuxGainentAthleteJointRefs = {
  root: THREE.Group | null;
  torso: THREE.Group | null;
  leftArm: THREE.Group | null;
  rightArm: THREE.Group | null;
  leftLeg: THREE.Group | null;
  rightLeg: THREE.Group | null;
};

export function createEuxGainentAthleteJointRefs(): EuxGainentAthleteJointRefs {
  return {
    root: null,
    torso: null,
    leftArm: null,
    rightArm: null,
    leftLeg: null,
    rightLeg: null,
  };
}

type ArchetypePose = Readonly<{
  /** Forward torso lean in radians (positive leans forward). */
  torsoLean: number;
  /** Rest angle of each arm at the shoulder before animation is applied. */
  armRest: number;
  /** Rest angle of each leg at the hip before animation is applied. */
  legRest: number;
  /** Vertical seat height as a fraction of total height (1 = standing). */
  hipHeightFraction: number;
}>;

/**
 * Exported so the parent scene's single `useFrame` can add an animated
 * swing/lean delta on top of the same rest pose used to build the static
 * geometry below — the joint refs start at this rest rotation, and the
 * parent is the sole authority overwriting them every frame (same
 * "recompute fully each frame" discipline as the rest of this lot).
 */
export const EUX_GAINENT_ARCHETYPE_POSE: Readonly<
  Record<EuxGainentAthleteArchetype, ArchetypePose>
> = {
  treadmill: { torsoLean: 0.05, armRest: -0.25, legRest: 0, hipHeightFraction: 1 },
  bike: { torsoLean: 0.42, armRest: -0.95, legRest: 0.3, hipHeightFraction: 0.62 },
  rower: { torsoLean: 0.3, armRest: -1.1, legRest: 0.55, hipHeightFraction: 0.4 },
};

type ArchetypeMotion = Readonly<{
  armRange: number;
  legRange: number;
  torsoLeanRange: number;
  torsoTwistRange: number;
  /** Fore-aft seat slide (rower's whole-body translation on the stroke). */
  seatSlideRange: number;
  /** Extra vertical knee-lift per leg (bike's pedal-circle illusion). */
  kneeLiftRange: number;
  verticalBobRange: number;
}>;

/**
 * Per-archetype motion character (owner review #2 — "encore un peu mou" /
 * "c'est encore un peu mou"): three physically different exercises, deliberately
 * large enough to read from the road (§29's own test: "peut-on distinguer le
 * geste du runner, du cyclist et du rower ?"). Exported so the parent scene's
 * `useFrame` drives real per-archetype gestures instead of one shared range.
 */
export const EUX_GAINENT_ARCHETYPE_MOTION: Readonly<
  Record<EuxGainentAthleteArchetype, ArchetypeMotion>
> = {
  treadmill: {
    armRange: 0.95,
    legRange: 0.85,
    torsoLeanRange: 0.1,
    torsoTwistRange: 0.16,
    seatSlideRange: 0,
    kneeLiftRange: 0,
    verticalBobRange: 0.07,
  },
  bike: {
    armRange: 0.16,
    legRange: 1.05,
    torsoLeanRange: 0.06,
    torsoTwistRange: 0.02,
    seatSlideRange: 0,
    kneeLiftRange: 0.09,
    verticalBobRange: 0.02,
  },
  rower: {
    armRange: 0.85,
    legRange: 0.6,
    torsoLeanRange: 0.6,
    torsoTwistRange: 0,
    seatSlideRange: 0.11,
    kneeLiftRange: 0,
    verticalBobRange: 0.01,
  },
};

export type EuxGainentAthleteProps = {
  archetype: EuxGainentAthleteArchetype;
  totalHeight: number;
  color: string;
  /**
   * One ref-callback per joint, created and owned by the parent scene (which
   * keeps the actual ref bucket as its own local `useRef`) — this component
   * never writes into a shared object handed to it as a prop, only forwards
   * these callbacks to its own native Three.js `ref` attributes.
   */
  onJointRef: (key: keyof EuxGainentAthleteJointRefs, node: THREE.Group | null) => void;
};

/**
 * One authored, low/medium-poly human silhouette (DRIFT-IV-BY-EUX-30 realism
 * pass) — pelvis, torso, head, two arms and two legs, posed for one of three
 * ordinary cardio-machine archetypes. No face, costume or text identifies the
 * athlete (Identity Contract §10): A/B/C remain legible only through
 * comparative posture and timing, driven imperatively from the parent's
 * single `useFrame` via the joint refs above — this component only builds
 * the static rest geometry once.
 */
export default function EuxGainentAthlete({
  archetype,
  totalHeight,
  color,
  onJointRef,
}: EuxGainentAthleteProps) {
  const pose = EUX_GAINENT_ARCHETYPE_POSE[archetype];
  const legLength = totalHeight * 0.46 * pose.hipHeightFraction + totalHeight * 0.02;
  const torsoLength = totalHeight * 0.34;
  const headRadius = totalHeight * 0.16;
  const hipY = legLength;
  const limbRadius = totalHeight * 0.055;
  const armLength = totalHeight * 0.4;

  const setRef = (key: keyof EuxGainentAthleteJointRefs) => (node: THREE.Group | null) => {
    onJointRef(key, node);
  };

  return (
    <group
      ref={setRef("root")}
      position={[0, 0, 0]}
    >
      {/* Pelvis */}
      <mesh position={[0, hipY, 0]} castShadow>
        <boxGeometry args={[totalHeight * 0.22, totalHeight * 0.16, totalHeight * 0.14]} />
        <meshStandardMaterial color={color} roughness={0.82} />
      </mesh>

      {/* Torso + head, leaning forward per archetype */}
      <group
        ref={setRef("torso")}
        position={[0, hipY + totalHeight * 0.08, 0]}
        rotation={[pose.torsoLean, 0, 0]}
      >
        <mesh position={[0, torsoLength / 2, 0]} castShadow>
          <capsuleGeometry args={[totalHeight * 0.12, torsoLength * 0.6, 4, 8]} />
          <meshStandardMaterial color={color} roughness={0.85} />
        </mesh>
        <mesh position={[0, torsoLength + headRadius * 0.9, 0]} castShadow>
          <sphereGeometry args={[headRadius, 12, 10]} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>

        {/* Arms, pivoting at the shoulder */}
        <group
          ref={setRef("leftArm")}
          position={[totalHeight * 0.16, torsoLength * 0.86, 0]}
          rotation={[pose.armRest, 0, 0.12]}
        >
          <mesh position={[0, -armLength / 2, 0]} castShadow>
            <capsuleGeometry args={[limbRadius, armLength * 0.72, 4, 6]} />
            <meshStandardMaterial color={color} roughness={0.85} />
          </mesh>
        </group>
        <group
          ref={setRef("rightArm")}
          position={[-totalHeight * 0.16, torsoLength * 0.86, 0]}
          rotation={[pose.armRest, 0, -0.12]}
        >
          <mesh position={[0, -armLength / 2, 0]} castShadow>
            <capsuleGeometry args={[limbRadius, armLength * 0.72, 4, 6]} />
            <meshStandardMaterial color={color} roughness={0.85} />
          </mesh>
        </group>
      </group>

      {/* Legs, pivoting at the hip */}
      <group
        ref={setRef("leftLeg")}
        position={[totalHeight * 0.08, hipY, 0]}
        rotation={[pose.legRest, 0, 0]}
      >
        <mesh position={[0, -legLength / 2, 0]} castShadow>
          <capsuleGeometry args={[limbRadius * 1.1, legLength * 0.75, 4, 6]} />
          <meshStandardMaterial color={color} roughness={0.82} />
        </mesh>
      </group>
      <group
        ref={setRef("rightLeg")}
        position={[-totalHeight * 0.08, hipY, 0]}
        rotation={[pose.legRest, 0, 0]}
      >
        <mesh position={[0, -legLength / 2, 0]} castShadow>
          <capsuleGeometry args={[limbRadius * 1.1, legLength * 0.75, 4, 6]} />
          <meshStandardMaterial color={color} roughness={0.82} />
        </mesh>
      </group>
    </group>
  );
}
