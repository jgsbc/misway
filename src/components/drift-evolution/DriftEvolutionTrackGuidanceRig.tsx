"use client";

import { useEffect, useRef } from "react";
import type { MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import type { Drift3DVehiclePhysicsState } from "@/lib/drift3dVehiclePhysics";
import { getDriftEvolutionTrackGuidance } from "@/lib/driftEvolutionFirstTrackGuidance";
import {
  clearDriftEvolutionTrackGuidance,
  publishDriftEvolutionTrackGuidance,
} from "@/lib/driftEvolutionTrackGuidanceStore";

const GUIDANCE_REFRESH_SECONDS = 0.12;
const GUIDANCE_FRAME_PRIORITY = 0.67;

function normalizeDegrees(value: number) {
  return ((value % 360) + 360) % 360;
}

export default function DriftEvolutionTrackGuidanceRig({
  vehicleStateRef,
}: {
  vehicleStateRef: MutableRefObject<Drift3DVehiclePhysicsState>;
}) {
  const elapsedRef = useRef(Number.POSITIVE_INFINITY);

  useEffect(() => {
    return () => clearDriftEvolutionTrackGuidance();
  }, []);

  useFrame((_, delta) => {
    elapsedRef.current += Math.min(delta, 0.1);
    if (elapsedRef.current < GUIDANCE_REFRESH_SECONDS) return;
    elapsedRef.current = 0;

    const state = vehicleStateRef.current;
    const guidance = getDriftEvolutionTrackGuidance(state.position);
    if (!guidance) {
      clearDriftEvolutionTrackGuidance();
      return;
    }

    const targetHeading = Math.atan2(
      guidance.target.x - state.position.x,
      guidance.target.z - state.position.z
    );
    const bearingDegrees = normalizeDegrees(
      (targetHeading - state.heading) * (180 / Math.PI)
    );

    publishDriftEvolutionTrackGuidance({
      trackSlug: guidance.trackSlug,
      distance: guidance.distance,
      activationRadius: guidance.activationRadius,
      bearingDegrees,
      mode: guidance.mode,
    });
  }, GUIDANCE_FRAME_PRIORITY);

  return null;
}
