"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { Drift3DVehiclePhysicsState } from "@/lib/drift3dVehiclePhysics";
import { withBasePath } from "@/lib/basePath";

const MISWAY_SAFARI_MODEL_URL = withBasePath(
  "/models/misway-safari/misway-safari-v1.gltf"
);

export const MISWAY_SAFARI_RUNTIME_SCALE = 0.32;
export const MISWAY_SAFARI_RUNTIME_Y_OFFSET = -0.048;
export const MISWAY_SAFARI_LOCAL_WHEEL_RADIUS = 0.38;

const MISWAY_SAFARI_WHEEL_NAMES = Object.freeze([
  "wheel_FL",
  "wheel_FR",
  "wheel_RL",
  "wheel_RR",
] as const);

type MiswaySafariVehicleVisualProps = {
  vehicleStateRef: MutableRefObject<Drift3DVehiclePhysicsState>;
};

function findLegacyVehiclePoseGroup(scene: THREE.Scene): THREE.Group | null {
  let candidate: THREE.Group | null = null;

  scene.traverse((object) => {
    if (candidate !== null || !(object instanceof THREE.Group)) return;
    if (object.renderOrder !== 10) return;
    if (Math.abs(object.scale.x - 1.34) > 0.001) return;

    const hasDrivingHeadlight = object.children.some(
      (child) => child instanceof THREE.SpotLight
    );
    if (hasDrivingHeadlight) candidate = object;
  });

  return candidate as THREE.Group | null;
}

/**
 * Evolution-only candidate vehicle built from the lightweight old Land Rover
 * sub-model supplied under the Sketchfab Standard license, then adapted into
 * the sand expedition language of the MISWAY masterframes.
 *
 * Physics, collision, terrain pose and camera stay owned by the hidden legacy
 * vehicle. This component is a visual follower only.
 */
export default function MiswaySafariVehicleVisual({
  vehicleStateRef,
}: MiswaySafariVehicleVisualProps) {
  const scene = useThree((state) => state.scene);
  const gltf = useLoader(GLTFLoader, MISWAY_SAFARI_MODEL_URL);
  const poseGroupRef = useRef<THREE.Group>(null);
  const legacyPoseRef = useRef<THREE.Group | null>(null);
  const headlightRef = useRef<THREE.SpotLight>(null);
  const headlightTargetRef = useRef<THREE.Object3D>(null);
  const model = useMemo(() => gltf.scene.clone(true), [gltf.scene]);
  const wheels = useMemo(
    () =>
      MISWAY_SAFARI_WHEEL_NAMES.map((name) => model.getObjectByName(name)).filter(
        (object): object is THREE.Object3D => Boolean(object)
      ),
    [model]
  );

  useLayoutEffect(() => {
    const legacy = findLegacyVehiclePoseGroup(scene);
    legacyPoseRef.current = legacy;
    if (legacy) legacy.visible = false;

    model.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.castShadow = true;
      object.receiveShadow = true;
      if (!object.geometry.getAttribute("normal")) object.geometry.computeVertexNormals();
    });

    if (headlightRef.current && headlightTargetRef.current) {
      headlightRef.current.target = headlightTargetRef.current;
    }

    return () => {
      const previous = legacyPoseRef.current;
      if (previous) previous.visible = true;
      legacyPoseRef.current = null;
    };
  }, [model, scene]);

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

    const visualWheelRadius =
      MISWAY_SAFARI_LOCAL_WHEEL_RADIUS * MISWAY_SAFARI_RUNTIME_SCALE;
    const frameDelta = Math.min(delta, 1 / 30);
    const wheelDelta =
      (vehicleStateRef.current.speed * frameDelta) / visualWheelRadius;

    for (const wheel of wheels) wheel.rotation.x += wheelDelta;
  }, 0.62);

  return (
    <group ref={poseGroupRef} renderOrder={12} aria-hidden="true">
      <primitive
        object={model}
        scale={MISWAY_SAFARI_RUNTIME_SCALE}
        position={[0, MISWAY_SAFARI_RUNTIME_Y_OFFSET, 0]}
      />
      <spotLight
        ref={headlightRef}
        position={[0, 0.34, 0.78]}
        color="#ffe4aa"
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
