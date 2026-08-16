"use client";

import { useRef, type MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { publishDriftCompassHeadingDegrees } from "@/lib/driftCompassHeading";
import type { Drift3DVehiclePhysicsState } from "@/lib/drift3dVehiclePhysics";

const HALF_PIPE_MAX_VISUAL_PITCH = Math.PI * 0.47;
const COMPASS_UPDATE_INTERVAL_SECONDS = 0.08;

function findLegacyPoseGroup(scene: THREE.Scene): THREE.Group | null {
  let candidate: THREE.Group | null = null;
  scene.traverse((object) => {
    if (candidate || !(object instanceof THREE.Group)) return;
    if (object.renderOrder === 10) candidate = object;
  });
  return candidate;
}

function normalizeHeadingUpDegrees(yawRadians: number) {
  const degrees = (Math.PI - yawRadians) * (180 / Math.PI);
  return ((degrees % 360) + 360) % 360;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function DriftVehiclePresentationFinisher({
  vehicleStateRef,
}: {
  vehicleStateRef: MutableRefObject<Drift3DVehiclePhysicsState>;
}) {
  const scene = useThree((state) => state.scene);
  const legacyPoseRef = useRef<THREE.Group | null>(null);
  const lastCompassUpdateRef = useRef(Number.NEGATIVE_INFINITY);

  useFrame(({ clock }, delta) => {
    const state = vehicleStateRef.current;
    const elapsed = clock.elapsedTime;

    if (elapsed - lastCompassUpdateRef.current >= COMPASS_UPDATE_INTERVAL_SECONDS) {
      publishDriftCompassHeadingDegrees(normalizeHeadingUpDegrees(state.heading));
      lastCompassUpdateRef.current = elapsed;
    }

    let legacyPose = legacyPoseRef.current;
    if (!legacyPose || legacyPose.parent === null) {
      legacyPose = findLegacyPoseGroup(scene);
      legacyPoseRef.current = legacyPose;
    }
    if (!legacyPose || !state.airborne || state.halfPipeSide === 0) return;

    const horizontalSpeed = Math.hypot(state.velocityX, state.velocityZ);
    const targetPitch = clamp(
      -Math.atan2(state.velocityY, Math.max(horizontalSpeed, 0.35)),
      -HALF_PIPE_MAX_VISUAL_PITCH,
      HALF_PIPE_MAX_VISUAL_PITCH
    );
    const poseEase = Math.min(1, Math.max(delta, 1 / 240) * 10);

    legacyPose.rotation.order = "YXZ";
    legacyPose.rotation.x += (targetPitch - legacyPose.rotation.x) * poseEase;
  }, 0.58);

  return null;
}
