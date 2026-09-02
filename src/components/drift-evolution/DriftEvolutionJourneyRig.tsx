"use client";

import { useEffect, useRef } from "react";
import type { MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { getDrift3DGroundY } from "@/lib/drift3dTerrain";
import {
  createDrift3DVehiclePhysicsState,
  DRIFT_3D_VEHICLE_GROUND_CLEARANCE,
  type Drift3DVehiclePhysicsState,
} from "@/lib/drift3dVehiclePhysics";
import { getDriftEvolutionEntryStartPosition } from "@/lib/driftEvolutionEntryCave";
import {
  readDriftEvolutionJourneyPose,
  writeDriftEvolutionJourneyPose,
  type DriftEvolutionJourneyPose,
  type DriftEvolutionJourneyStorage,
} from "@/lib/driftEvolutionJourney";
import { DRIFT_STARTUP_RELEASE_EVENT } from "@/lib/driftStartup";

const JOURNEY_RESTORE_FRAME_PRIORITY = -99;
const JOURNEY_RESUME_STABLE_FRAMES = 5;
const JOURNEY_SAVE_INTERVAL_MS = 750;
const JOURNEY_POSITION_TOLERANCE = 0.35;
const JOURNEY_ENTRY_SPAWN_TOLERANCE = 0.2;

function getSessionStorage(): DriftEvolutionJourneyStorage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function getPoseFromState(
  state: Drift3DVehiclePhysicsState
): DriftEvolutionJourneyPose {
  return {
    x: state.position.x,
    z: state.position.z,
    heading: state.heading,
  };
}

function isEntrySpawnApplied(state: Drift3DVehiclePhysicsState) {
  const entryStart = getDriftEvolutionEntryStartPosition();
  return (
    Math.hypot(
      state.position.x - entryStart.x,
      state.position.z - entryStart.z
    ) <= JOURNEY_ENTRY_SPAWN_TOLERANCE
  );
}

export default function DriftEvolutionJourneyRig({
  vehicleStateRef,
}: {
  vehicleStateRef: MutableRefObject<Drift3DVehiclePhysicsState>;
}) {
  const storageRef = useRef<DriftEvolutionJourneyStorage | null>(null);
  const resumePoseRef = useRef<DriftEvolutionJourneyPose | null>(null);
  const storageReadyRef = useRef(false);
  const restoreAppliedRef = useRef(false);
  const resumeStableFramesRef = useRef(0);
  const startupReleasedRef = useRef(false);
  const lastSaveAtRef = useRef(Number.NEGATIVE_INFINITY);

  useEffect(() => {
    const storage = getSessionStorage();
    storageRef.current = storage;
    resumePoseRef.current = storage
      ? readDriftEvolutionJourneyPose(storage)
      : null;
    storageReadyRef.current = true;

    const saveCurrentPose = () => {
      if (!storageRef.current || !restoreAppliedRef.current) return;
      writeDriftEvolutionJourneyPose(
        storageRef.current,
        getPoseFromState(vehicleStateRef.current)
      );
    };

    window.addEventListener("pagehide", saveCurrentPose);
    return () => {
      saveCurrentPose();
      window.removeEventListener("pagehide", saveCurrentPose);
      storageReadyRef.current = false;
    };
  }, [vehicleStateRef]);

  useFrame(() => {
    if (!storageReadyRef.current) return;

    if (!restoreAppliedRef.current) {
      const pose = resumePoseRef.current;

      if (pose) {
        // EntrySequenceRig deliberately applies the canonical cave spawn only
        // after passive scene initialization has settled. A frame priority by
        // itself therefore cannot guarantee restore ordering: the journey rig
        // may otherwise restore first and be overwritten by the cave spawn on
        // the following frame. Wait until that canonical spawn is observable,
        // then replace it with the persisted journey pose in the same frame.
        if (!isEntrySpawnApplied(vehicleStateRef.current)) return;

        const y =
          getDrift3DGroundY(pose.x, pose.z) +
          DRIFT_3D_VEHICLE_GROUND_CLEARANCE;
        vehicleStateRef.current = createDrift3DVehiclePhysicsState(
          { x: pose.x, y, z: pose.z },
          pose.heading
        );
      }

      restoreAppliedRef.current = true;
      lastSaveAtRef.current = performance.now();
      return;
    }

    const resumePose = resumePoseRef.current;
    if (resumePose && !startupReleasedRef.current) {
      const current = vehicleStateRef.current.position;
      const horizontalDistance = Math.hypot(
        current.x - resumePose.x,
        current.z - resumePose.z
      );

      if (horizontalDistance <= JOURNEY_POSITION_TOLERANCE) {
        resumeStableFramesRef.current += 1;
      } else {
        resumeStableFramesRef.current = 0;
      }

      if (resumeStableFramesRef.current >= JOURNEY_RESUME_STABLE_FRAMES) {
        startupReleasedRef.current = true;
        queueMicrotask(() => {
          window.dispatchEvent(new Event(DRIFT_STARTUP_RELEASE_EVENT));
        });
      }
    }

    const storage = storageRef.current;
    const now = performance.now();
    if (
      storage &&
      now - lastSaveAtRef.current >= JOURNEY_SAVE_INTERVAL_MS
    ) {
      lastSaveAtRef.current = now;
      writeDriftEvolutionJourneyPose(
        storage,
        getPoseFromState(vehicleStateRef.current)
      );
    }
  }, JOURNEY_RESTORE_FRAME_PRIORITY);

  return null;
}
