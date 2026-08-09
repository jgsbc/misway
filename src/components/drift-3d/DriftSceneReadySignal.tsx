"use client";

import { useRef } from "react";
import type { MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import type { Drift3DVehiclePhysicsState } from "@/lib/drift3dVehiclePhysics";
import { DRIFT_STARTUP_RELEASE_EVENT } from "@/lib/driftStartup";

type ExpectedPosition = {
  x: number;
  y: number;
  z: number;
};

type DriftSceneReadySignalProps = {
  vehicleStateRef?: MutableRefObject<Drift3DVehiclePhysicsState>;
  expectedPosition?: ExpectedPosition;
  stableFrames?: number;
  positionTolerance?: number;
};

/**
 * Releases the page-level startup veil only after the R3F world has produced
 * several stable frames. Evolution additionally supplies its cave spawn, so
 * the veil cannot disappear while the protected production spawn is still
 * briefly active underneath.
 */
export default function DriftSceneReadySignal({
  vehicleStateRef,
  expectedPosition,
  stableFrames = 4,
  positionTolerance = 0.4,
}: DriftSceneReadySignalProps) {
  const stableFrameCountRef = useRef(0);
  const releasedRef = useRef(false);

  useFrame(() => {
    if (releasedRef.current) return;

    if (vehicleStateRef && expectedPosition) {
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
    }

    stableFrameCountRef.current += 1;
    if (stableFrameCountRef.current < stableFrames) return;

    releasedRef.current = true;

    // `useFrame` callbacks run before the renderer completes the current
    // frame. A microtask fires only after that synchronous render cycle has
    // finished, so the veil never reveals a half-painted frame.
    queueMicrotask(() => {
      window.dispatchEvent(new Event(DRIFT_STARTUP_RELEASE_EVENT));
    });
  });

  return null;
}
