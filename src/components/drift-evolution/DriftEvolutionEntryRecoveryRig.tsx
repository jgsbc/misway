"use client";

import { useEffect, useRef } from "react";
import type { MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import type { Drift3DPointerDriveState } from "@/lib/drift3d";
import type { Drift3DVehiclePhysicsState } from "@/lib/drift3dVehiclePhysics";
import {
  DRIFT_EVOLUTION_ENTRY_RECOVERY_MIN_EAST_PROGRESS,
  DRIFT_EVOLUTION_ENTRY_RECOVERY_STALL_SECONDS,
  isDriftEvolutionEntryRecoveryZone,
  recoverDriftEvolutionEntryVehicle,
} from "@/lib/driftEvolutionSpatial";

const ENTRY_RECOVERY_FRAME_PRIORITY = 0.66;
const POINTER_FORWARD_THRESHOLD = 0.35;
const EASTWARD_HEADING_THRESHOLD = 0.45;
const FORWARD_CODES = new Set(["ArrowUp", "KeyW", "KeyZ"]);

type RecoverySample = {
  x: number;
  elapsed: number;
};

export default function DriftEvolutionEntryRecoveryRig({
  vehicleStateRef,
  pointerDriveStateRef,
}: {
  vehicleStateRef: MutableRefObject<Drift3DVehiclePhysicsState>;
  pointerDriveStateRef: MutableRefObject<Drift3DPointerDriveState>;
}) {
  const forwardKeysRef = useRef<Set<string>>(new Set());
  const sampleRef = useRef<RecoverySample | null>(null);

  useEffect(() => {
    const forwardKeys = forwardKeysRef.current;

    const reset = () => {
      forwardKeys.clear();
      sampleRef.current = null;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (FORWARD_CODES.has(event.code)) forwardKeys.add(event.code);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (FORWARD_CODES.has(event.code)) forwardKeys.delete(event.code);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", reset);
    document.addEventListener("visibilitychange", reset);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", reset);
      document.removeEventListener("visibilitychange", reset);
      reset();
    };
  }, []);

  useFrame((_, delta) => {
    const state = vehicleStateRef.current;
    const keyboardForward = forwardKeysRef.current.size > 0;
    const pointerForward =
      pointerDriveStateRef.current.input.z >= POINTER_FORWARD_THRESHOLD;
    const eastwardHeading = Math.sin(state.heading);
    const recoveryEligible =
      (keyboardForward || pointerForward) &&
      eastwardHeading >= EASTWARD_HEADING_THRESHOLD &&
      isDriftEvolutionEntryRecoveryZone(state.position);

    if (!recoveryEligible) {
      sampleRef.current = null;
      return;
    }

    const sample = sampleRef.current;
    if (!sample) {
      sampleRef.current = { x: state.position.x, elapsed: 0 };
      return;
    }

    const eastProgress = state.position.x - sample.x;
    if (eastProgress >= DRIFT_EVOLUTION_ENTRY_RECOVERY_MIN_EAST_PROGRESS) {
      sample.x = state.position.x;
      sample.elapsed = 0;
      return;
    }

    sample.elapsed += Math.min(delta, 0.1);
    if (sample.elapsed < DRIFT_EVOLUTION_ENTRY_RECOVERY_STALL_SECONDS) return;

    if (recoverDriftEvolutionEntryVehicle(state)) {
      sampleRef.current = { x: state.position.x, elapsed: 0 };
    } else {
      sampleRef.current = null;
    }
  }, ENTRY_RECOVERY_FRAME_PRIORITY);

  return null;
}
