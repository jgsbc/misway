"use client";

import { useRef } from "react";
import type { MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Drift3DLandmark from "@/components/drift-3d/Drift3DLandmark";
import {
  drift3dLandmarks,
  type Drift3DLandmark as Drift3DLandmarkData,
} from "@/lib/drift3dLandmarks";
import { getDrift3DGroundY } from "@/lib/drift3dTerrain";
import type { Drift3DVehiclePhysicsState } from "@/lib/drift3dVehiclePhysics";
import {
  resolveDrift3DAudioTime,
  type Drift3DAudioClockRef,
} from "@/lib/drift3dAudioClock";
import {
  EUX_GAINENT_TRACK_SLUG,
  euxGainentCues,
  resolveEuxGainentCueState,
  resolveEuxGainentPhaseProgress,
} from "@/lib/drift3dEuxGainentCues";

export const EUX_GAINENT_LANDMARK_ID = "birth-eux-gainent-glass-gym";

type EuxGainentLivingSceneProps = {
  audioClockRef: Drift3DAudioClockRef;
  isInsideZone: boolean;
  isCurrentTrack: boolean;
  isPlaying: boolean;
  vehicleStateRef: MutableRefObject<Drift3DVehiclePhysicsState>;
};

type AthleteSpec = {
  x: number;
  z: number;
  groundY: number;
  bodyHeight: number;
  bodyCenterY: number;
  headCenterY: number;
  color: string;
  phase: number;
  freezeCycle: number;
};

type TreadmillSpec = {
  x: number;
  z: number;
  groundY: number;
  phase: number;
};

const sourceLandmark = drift3dLandmarks.find(
  (landmark) => landmark.id === EUX_GAINENT_LANDMARK_ID
);

if (!sourceLandmark) {
  throw new Error(`Missing Drift landmark: ${EUX_GAINENT_LANDMARK_ID}`);
}

const staticGymLandmark: Drift3DLandmarkData = {
  ...sourceLandmark,
  id: `${EUX_GAINENT_LANDMARK_ID}-structure`,
  primitives: sourceLandmark.primitives.slice(0, 3),
};

const gymOrigin = sourceLandmark.origin;

const athleteSpecs: readonly AthleteSpec[] = [
  {
    x: gymOrigin.x - 4.7,
    z: gymOrigin.z - 3.05,
    groundY: getDrift3DGroundY(gymOrigin.x - 4.7, gymOrigin.z - 3.05),
    bodyHeight: 0.72,
    bodyCenterY: 0.48,
    headCenterY: 0.99,
    color: "#15181d",
    phase: 0,
    freezeCycle: 0.72,
  },
  {
    x: gymOrigin.x - 2.8,
    z: gymOrigin.z - 3.08,
    groundY: getDrift3DGroundY(gymOrigin.x - 2.8, gymOrigin.z - 3.08),
    bodyHeight: 0.76,
    bodyCenterY: 0.5,
    headCenterY: 1.03,
    color: "#171a1f",
    phase: 0.24,
    freezeCycle: 0.18,
  },
  {
    x: gymOrigin.x - 0.9,
    z: gymOrigin.z - 3.12,
    groundY: getDrift3DGroundY(gymOrigin.x - 0.9, gymOrigin.z - 3.12),
    bodyHeight: 0.68,
    bodyCenterY: 0.46,
    headCenterY: 0.95,
    color: "#15181d",
    phase: 0.48,
    freezeCycle: -0.42,
  },
];

const treadmillSpecs: readonly TreadmillSpec[] = [
  {
    x: gymOrigin.x - 4.7,
    z: gymOrigin.z - 3.05,
    groundY: getDrift3DGroundY(gymOrigin.x - 4.7, gymOrigin.z - 3.05),
    phase: 0,
  },
  {
    x: gymOrigin.x - 2.8,
    z: gymOrigin.z - 3.08,
    groundY: getDrift3DGroundY(gymOrigin.x - 2.8, gymOrigin.z - 3.08),
    phase: 0.24,
  },
  {
    x: gymOrigin.x - 0.9,
    z: gymOrigin.z - 3.12,
    groundY: getDrift3DGroundY(gymOrigin.x - 0.9, gymOrigin.z - 3.12),
    phase: 0.48,
  },
];

const firstMechanicY =
  getDrift3DGroundY(gymOrigin.x - 5.35, gymOrigin.z - 3.05) + 0.325;
const secondMechanicY =
  getDrift3DGroundY(gymOrigin.x - 1.45, gymOrigin.z - 3.12) + 0.325;

function clamp01(value: number) {
  return Math.min(Math.max(value, 0), 1);
}

export default function EuxGainentLivingScene({
  audioClockRef,
  isInsideZone,
  isCurrentTrack,
  isPlaying,
  vehicleStateRef,
}: EuxGainentLivingSceneProps) {
  const athleteRefs = useRef<Array<THREE.Group | null>>([null, null, null]);
  const treadmillRefs = useRef<Array<THREE.Group | null>>([null, null, null]);
  const mechanicsRef = useRef<THREE.Group | null>(null);
  const activityRef = useRef(0);
  const hasListenedRef = useRef(false);
  const wasActiveRef = useRef(false);

  useFrame((_, delta) => {
    const audioClock = audioClockRef.current;
    const shouldReset =
      !isInsideZone ||
      !isCurrentTrack ||
      audioClock.trackSlug !== EUX_GAINENT_TRACK_SLUG;

    if (shouldReset) {
      activityRef.current = 0;
      hasListenedRef.current = false;
      wasActiveRef.current = false;

      for (let index = 0; index < athleteSpecs.length; index += 1) {
        const spec = athleteSpecs[index];
        const athlete = athleteRefs.current[index];

        if (athlete) {
          athlete.position.y = spec.groundY;
          athlete.rotation.x = 0;
        }

        const treadmill = treadmillRefs.current[index];

        if (treadmill) {
          treadmill.position.z = treadmillSpecs[index].z;
          treadmill.scale.z = 1;
        }
      }

      if (mechanicsRef.current) {
        mechanicsRef.current.position.x = gymOrigin.x;
        mechanicsRef.current.rotation.z = 0;
      }

      return;
    }

    const firstActiveFrame = !wasActiveRef.current;
    wasActiveRef.current = true;

    if (isPlaying || audioClock.sampledTimeSeconds > 0) {
      hasListenedRef.current = true;
    }

    if (!hasListenedRef.current) {
      return;
    }

    if (firstActiveFrame && !isPlaying) {
      activityRef.current = 1;
    } else if (isPlaying) {
      activityRef.current +=
        (1 - activityRef.current) * Math.min(1, delta * 4);
    }

    const time = resolveDrift3DAudioTime(audioClock, performance.now());
    const cueState = resolveEuxGainentCueState(time);
    const phaseProgress = resolveEuxGainentPhaseProgress(time, cueState);
    const activity = activityRef.current;
    const correctionCue = euxGainentCues[3];
    const inversionCue = euxGainentCues[4];
    const correctionProgress = clamp01(
      (time - correctionCue.startSeconds) /
        (correctionCue.endSeconds - correctionCue.startSeconds)
    );
    const inversionFreeze = clamp01(
      (time - inversionCue.startSeconds) /
        (inversionCue.peakSeconds - inversionCue.startSeconds)
    );
    const aftermathReturn = clamp01(
      (time - euxGainentCues[5].startSeconds) / 0.4
    );
    const commonTime = time * 2.65;

    for (let index = 0; index < athleteSpecs.length; index += 1) {
      const spec = athleteSpecs[index];
      let phaseOffset = spec.phase;

      if (cueState.phase === "cadence-lock") {
        phaseOffset = spec.phase * (1 - phaseProgress);
      } else if (cueState.phase === "measurement") {
        phaseOffset = index === 2 ? 0.08 : index === 1 ? 0.03 : 0;
      } else if (cueState.phase === "deviation") {
        phaseOffset =
          index === 1
            ? 0.2 + phaseProgress * 0.9
            : index === 2
              ? 0.18
              : 0;
      } else if (cueState.phase === "correction") {
        phaseOffset =
          index === 1
            ? 1.1 * (1 - correctionProgress)
            : index === 2
              ? 0.12
              : 0;
      } else if (cueState.phase === "aftermath-return") {
        phaseOffset = index === 2 ? 0.14 : 0;
      } else if (cueState.phase === "residue") {
        phaseOffset = index === 2 ? 0.38 : 0;
      }

      const liveCycle = Math.sin(commonTime + phaseOffset);
      let cycle = liveCycle;

      if (cueState.phase === "reference-inversion") {
        cycle =
          liveCycle * (1 - inversionFreeze) +
          spec.freezeCycle * inversionFreeze;
      } else if (cueState.phase === "aftermath-return") {
        cycle =
          spec.freezeCycle * (1 - aftermathReturn) +
          liveCycle * aftermathReturn;
      }
      const amplitude = cueState.phase === "measurement" ? 0.021 : 0.025;
      const athlete = athleteRefs.current[index];

      if (athlete) {
        athlete.position.y =
          spec.groundY + Math.abs(cycle) * amplitude * activity;
        athlete.rotation.x = cycle * 0.075 * activity;
      }

      const treadmill = treadmillRefs.current[index];

      if (treadmill) {
        const machinePhaseOffset =
          cueState.phase === "pre-cadence"
            ? treadmillSpecs[index].phase
            : cueState.phase === "cadence-lock"
              ? treadmillSpecs[index].phase * (1 - phaseProgress)
              : cueState.phase === "residue" && index === 2
                ? 0.28
                : 0;
        const machineCycle = Math.sin(commonTime + machinePhaseOffset);

        treadmill.position.z =
          treadmillSpecs[index].z + machineCycle * 0.035 * activity;
        treadmill.scale.z = 1 + machineCycle * 0.025 * activity;
      }
    }

    if (mechanicsRef.current) {
      const mechanicalPhase =
        cueState.phase === "residue" ? 0.2 : 0;
      const mechanicalCycle = Math.sin(commonTime + mechanicalPhase);
      mechanicsRef.current.position.x =
        gymOrigin.x + mechanicalCycle * 0.025 * activity;
      mechanicsRef.current.rotation.z =
        mechanicalCycle * 0.035 * activity;
    }
  });

  return (
    <group aria-hidden="true">
      <Drift3DLandmark
        landmark={staticGymLandmark}
        vehicleStateRef={vehicleStateRef}
      />

      {treadmillSpecs.map((spec, index) => (
        <group
          key={`eux-treadmill-${index}`}
          ref={(group) => {
            treadmillRefs.current[index] = group;
          }}
          position={[spec.x, spec.groundY, spec.z]}
        >
          <mesh position={[0, 0.09, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.1, 0.08, 0.34]} />
            <meshStandardMaterial color="#1f252b" roughness={0.72} />
          </mesh>
        </group>
      ))}

      {athleteSpecs.map((spec, index) => (
        <group
          key={`eux-athlete-${index}`}
          ref={(group) => {
            athleteRefs.current[index] = group;
          }}
          position={[spec.x, spec.groundY, spec.z]}
        >
          <mesh position={[0, spec.bodyCenterY, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.11, spec.bodyHeight, 14]} />
            <meshStandardMaterial color={spec.color} roughness={0.9} />
          </mesh>
          <mesh position={[0, spec.headCenterY, 0]} castShadow>
            <sphereGeometry args={[0.13, 14, 12]} />
            <meshStandardMaterial color={spec.color} roughness={0.9} />
          </mesh>
        </group>
      ))}

      <group ref={mechanicsRef} position={[gymOrigin.x, 0, gymOrigin.z]}>
        <mesh
          position={[-5.35, firstMechanicY, -3.05]}
          rotation={[0, 0, Math.PI / 2]}
          castShadow
        >
          <cylinderGeometry args={[0.04, 0.04, 0.55, 14]} />
          <meshStandardMaterial color="#8d9399" roughness={0.62} />
        </mesh>
        <mesh
          position={[-1.45, secondMechanicY, -3.12]}
          rotation={[0, 0, Math.PI / 2]}
          castShadow
        >
          <cylinderGeometry args={[0.04, 0.04, 0.55, 14]} />
          <meshStandardMaterial color="#8d9399" roughness={0.62} />
        </mesh>
      </group>
    </group>
  );
}
