"use client";

import { useRef } from "react";
import type { MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import type { Drift3DVehiclePhysicsState } from "@/lib/drift3dVehiclePhysics";
import { DRIFT_STARTUP_RELEASE_EVENT } from "@/lib/driftStartup";

export default function DriftSceneReadySignal({
  vehicleStateRef,
  expectedPosition,
  stableFrames = 5,
  positionTolerance = 0.35,
}: {
  vehicleStateRef: MutableRefObject<Drift3DVehiclePhysicsState>;
  expectedPosition: { x: number; y: number; z: number };
  stableFrames?: number;
  positionTolerance?: number;
}) {
  const stableFrameCountRef = useRef(0);
  const releasedRef = useRef(false);

  useFrame(() => {
    if (releasedRef.current) return;

    const position = vehicleStateRef.current.position;
    const horizontalDistance = Math.hypot(
      position.x - expectedPosition.x,
      position.z - expectedPosition.z
    );
    const verticalDistance = Math.abs(position.y - expectedPosition.y);

    if (
      horizontalDistance > positionTolerance ||
      verticalDistance > Math.max(positionTolerance * 2, 0.8)
    ) {
      stableFrameCountRef.current = 0;
      return;
    }

    stableFrameCountRef.current += 1;
    if (stableFrameCountRef.current < stableFrames) return;

    releasedRef.current = true;
    queueMicrotask(() => {
      window.dispatchEvent(new Event(DRIFT_STARTUP_RELEASE_EVENT));
    });
  });

  return null;
}
