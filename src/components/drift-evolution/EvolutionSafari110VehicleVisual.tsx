"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { DRIFT_3D_VEHICLE_WHEEL_RADIUS } from "@/components/drift-3d/Drift3DVehicle";
import type { Drift3DVehiclePhysicsState } from "@/lib/drift3dVehiclePhysics";
import {
  buildDrift3DSafari110FinalVehicle,
  DRIFT_SAFARI_110_RUNTIME_SCALE,
  DRIFT_SAFARI_110_RUNTIME_Y_OFFSET,
} from "@/lib/drift3dSafari110FinalGeometry";
import { rotateDrift3DSafari110Wheels } from "@/lib/drift3dSafari110Runtime";

type EvolutionSafari110VehicleVisualProps = {
  vehicleStateRef: MutableRefObject<Drift3DVehiclePhysicsState>;
};

function findLegacyVehiclePoseGroup(scene: THREE.Scene) {
  let candidate: THREE.Group | null = null;

  scene.traverse((object) => {
    if (candidate || !(object instanceof THREE.Group)) return;
    if (object.renderOrder !== 10) return;
    if (Math.abs(object.scale.x - 1.34) > 0.001) return;

    const hasDrivingHeadlight = object.children.some(
      (child) => child instanceof THREE.SpotLight
    );
    if (hasDrivingHeadlight) candidate = object;
  });

  return candidate;
}

function disposeVehicle(root: THREE.Object3D) {
  const disposedMaterials = new Set<THREE.Material>();
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    object.geometry.dispose();
    const materials = Array.isArray(object.material)
      ? object.material
      : [object.material];
    for (const material of materials) {
      if (disposedMaterials.has(material)) continue;
      disposedMaterials.add(material);
      material.dispose();
    }
  });
}

/**
 * Evolution-only visual replacement.
 *
 * The hidden production vehicle remains the single motion/physics pose
 * authority. This layer only mirrors its transform, so vehicle dynamics,
 * collision, terrain pitch/roll, input and camera remain untouched.
 */
export default function EvolutionSafari110VehicleVisual({
  vehicleStateRef,
}: EvolutionSafari110VehicleVisualProps) {
  const scene = useThree((state) => state.scene);
  const poseGroupRef = useRef<THREE.Group | null>(null);
  const legacyPoseRef = useRef<THREE.Group | null>(null);
  const headlightRef = useRef<THREE.SpotLight | null>(null);
  const headlightTargetRef = useRef<THREE.Object3D | null>(null);
  const model = useMemo(() => buildDrift3DSafari110FinalVehicle(), []);

  useLayoutEffect(() => {
    const legacy = findLegacyVehiclePoseGroup(scene);
    legacyPoseRef.current = legacy;
    if (legacy) legacy.visible = false;

    if (headlightRef.current && headlightTargetRef.current) {
      headlightRef.current.target = headlightTargetRef.current;
    }

    return () => {
      if (legacyPoseRef.current) legacyPoseRef.current.visible = true;
      legacyPoseRef.current = null;
    };
  }, [scene]);

  useEffect(() => () => disposeVehicle(model), [model]);

  useFrame((_, delta) => {
    let legacy = legacyPoseRef.current;
    if (!legacy) {
      legacy = findLegacyVehiclePoseGroup(scene);
      if (legacy) {
        legacy.visible = false;
        legacyPoseRef.current = legacy;
      }
    }

    const poseGroup = poseGroupRef.current;
    if (legacy && poseGroup) {
      poseGroup.position.copy(legacy.position);
      poseGroup.quaternion.copy(legacy.quaternion);
    }

    const frameDelta = Math.min(delta, 1 / 30);
    const wheelDelta =
      (vehicleStateRef.current.speed * frameDelta) /
      DRIFT_3D_VEHICLE_WHEEL_RADIUS;
    rotateDrift3DSafari110Wheels(model, wheelDelta);
  }, 0.62);

  return (
    <group ref={poseGroupRef} renderOrder={11} aria-hidden="true">
      <primitive
        object={model}
        scale={DRIFT_SAFARI_110_RUNTIME_SCALE}
        position={[0, DRIFT_SAFARI_110_RUNTIME_Y_OFFSET, 0]}
      />
      <spotLight
        ref={headlightRef}
        position={[0, 0.42, 0.66]}
        color="#ffe6b0"
        intensity={2.15}
        distance={13}
        angle={0.52}
        penumbra={0.62}
        decay={1.5}
      />
      <object3D ref={headlightTargetRef} position={[0, 0.08, 4.4]} />
    </group>
  );
}
