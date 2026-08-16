"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { getDrift3DMovementBounds } from "@/lib/drift3d";
import { publishDriftCompassHeadingDegrees } from "@/lib/driftCompassHeading";

const HALF_PIPE_MAX_LANE_Z = 74;
const HALF_PIPE_POSE_DEPTH = 5.5;
const HALF_PIPE_MAX_VISUAL_PITCH = Math.PI * 0.47;
const HALF_PIPE_MIN_VERTICAL_SPEED = 0.35;
const COMPASS_UPDATE_INTERVAL_SECONDS = 0.08;
const movementBounds = getDrift3DMovementBounds();

function findPoseGroup(
  scene: THREE.Scene,
  renderOrder: number
): THREE.Group | null {
  let candidate: THREE.Group | null = null;

  scene.traverse((object) => {
    if (candidate || !(object instanceof THREE.Group)) return;
    if (object.renderOrder === renderOrder) candidate = object;
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

/**
 * Presentation-only finishing pass.
 *
 * - publishes a throttled vehicle heading for the DOM compass without causing
 *   the R3F scene tree to reconcile on every physics frame;
 * - aligns the visible Defender with the tangent of a half-pipe jump so the
 *   body becomes near-vertical on ascent/descent instead of staying flat.
 *
 * Physics, collisions and the hidden legacy pose remain authoritative.
 */
export default function DriftVehiclePresentationFinisher() {
  const scene = useThree((state) => state.scene);
  const previousPositionRef = useRef<THREE.Vector3 | null>(null);
  const lastCompassUpdateRef = useRef(Number.NEGATIVE_INFINITY);

  useFrame(({ clock }, delta) => {
    const legacyPose = findPoseGroup(scene, 10);
    if (!legacyPose) return;

    const elapsed = clock.elapsedTime;
    if (
      elapsed - lastCompassUpdateRef.current >=
      COMPASS_UPDATE_INTERVAL_SECONDS
    ) {
      publishDriftCompassHeadingDegrees(
        normalizeHeadingUpDegrees(legacyPose.rotation.y)
      );
      lastCompassUpdateRef.current = elapsed;
    }

    const visiblePose = findPoseGroup(scene, 12);
    const previousPosition = previousPositionRef.current;
    if (!previousPosition) {
      previousPositionRef.current = legacyPose.position.clone();
      return;
    }

    const safeDelta = Math.max(delta, 1 / 240);
    const dx = legacyPose.position.x - previousPosition.x;
    const dy = legacyPose.position.y - previousPosition.y;
    const dz = legacyPose.position.z - previousPosition.z;
    const horizontalSpeed = Math.hypot(dx, dz) / safeDelta;
    const verticalSpeed = dy / safeDelta;
    previousPosition.copy(legacyPose.position);

    if (!visiblePose) return;

    const nearWestRamp =
      legacyPose.position.x <= movementBounds.minX + HALF_PIPE_POSE_DEPTH;
    const nearEastRamp =
      legacyPose.position.x >= movementBounds.maxX - HALF_PIPE_POSE_DEPTH;
    const insideHalfPipeLane =
      Math.abs(legacyPose.position.z) <= HALF_PIPE_MAX_LANE_Z;
    const isHalfPipeFlight =
      insideHalfPipeLane &&
      (nearWestRamp || nearEastRamp) &&
      Math.abs(verticalSpeed) >= HALF_PIPE_MIN_VERTICAL_SPEED;

    if (!isHalfPipeFlight) return;

    const targetPitch = clamp(
      -Math.atan2(verticalSpeed, Math.max(horizontalSpeed, 0.35)),
      -HALF_PIPE_MAX_VISUAL_PITCH,
      HALF_PIPE_MAX_VISUAL_PITCH
    );
    const currentEuler = new THREE.Euler().setFromQuaternion(
      visiblePose.quaternion,
      "YXZ"
    );
    const poseEase = Math.min(1, safeDelta * 11);
    currentEuler.x += (targetPitch - currentEuler.x) * poseEase;
    visiblePose.rotation.order = "YXZ";
    visiblePose.rotation.set(currentEuler.x, currentEuler.y, currentEuler.z);
  }, 0.7);

  return null;
}
