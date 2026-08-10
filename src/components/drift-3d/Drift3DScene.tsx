"use client";

import { useLayoutEffect, useRef, type ComponentProps } from "react";
import Drift3DSceneBase from "@/components/drift-3d/Drift3DSceneBase";
import Drift3DLandmark from "@/components/drift-3d/Drift3DLandmark";
import DriftSceneReadySignal from "@/components/drift-3d/DriftSceneReadySignal";
import EntryCaveSalvage from "@/components/drift-evolution/EntryCaveSalvage";
import EntryPortalLightCorrection from "@/components/drift-evolution/EntryPortalLightCorrection";
import EvolutionSafari110VehicleVisual from "@/components/drift-evolution/EvolutionSafari110VehicleVisual";
import FoolfouleCrowd from "@/components/drift-evolution/FoolfouleCrowd";
import FoolfouleDramaturgy from "@/components/drift-evolution/FoolfouleDramaturgy";
import DriftEvolutionSpatialRig from "@/components/drift-evolution/DriftEvolutionSpatialRig";
import { drift3dNewTrackLandmarks } from "@/lib/drift3dNewTrackLandmarks";
import { drift3dTrackNodeBySlug } from "@/lib/drift3dTopology";
import { getDriftEvolutionEntryStartPosition } from "@/lib/driftEvolutionEntryCave";
import { createDriftEvolutionFoolfouleCrowdSignal } from "@/lib/driftEvolutionFoolfouleDramaturgy";
import {
  restoreFoolfouleAfterEvolution,
  stageFoolfouleForEvolution,
} from "@/lib/driftEvolutionFoolfouleRegistry";
import {
  restoreLegacyEntryAfterEvolution,
  suppressLegacyEntryForEvolution,
} from "@/lib/driftEvolutionLegacyEntryRegistry";
import {
  restoreZeelandAfterEvolution,
  stageZeelandForEvolution,
} from "@/lib/driftEvolutionZeelandRegistry";

type Drift3DSceneProps = ComponentProps<typeof Drift3DSceneBase>;

// The promoted world uses the approved Evolution staging before the base
// scene computes landmark colliders and topology-dependent render state.
suppressLegacyEntryForEvolution();
stageZeelandForEvolution();
stageFoolfouleForEvolution();

/**
 * Production composition promoted from the validated Drift Evolution world.
 * The underlying base scene remains shared, while the approved cave, Safari,
 * Zeeland and Foolfoule layers now belong to the production experience.
 */
export default function Drift3DScene(props: Drift3DSceneProps) {
  const evolutionStartPosition = getDriftEvolutionEntryStartPosition();
  const foolfouleCrowdSignalRef = useRef(
    createDriftEvolutionFoolfouleCrowdSignal()
  );
  const isInsideFoolfoule =
    props.proximity?.activeNode?.id === drift3dTrackNodeBySlug.foolfoule.id;

  useLayoutEffect(() => {
    // React Strict Mode may replay layout effects in development. Reassert the
    // approved staging after a cleanup replay, then restore on real unmount.
    suppressLegacyEntryForEvolution();
    stageZeelandForEvolution();
    stageFoolfouleForEvolution();

    return () => {
      restoreFoolfouleAfterEvolution();
      restoreZeelandAfterEvolution();
      restoreLegacyEntryAfterEvolution();
    };
  }, []);

  return (
    <>
      <Drift3DSceneBase {...props} />
      {drift3dNewTrackLandmarks.map((landmark) => (
        <Drift3DLandmark
          key={landmark.id}
          landmark={landmark}
          vehicleStateRef={props.vehicleStateRef}
        />
      ))}
      <EvolutionSafari110VehicleVisual vehicleStateRef={props.vehicleStateRef} />
      <EntryCaveSalvage vehicleStateRef={props.vehicleStateRef} />
      <EntryPortalLightCorrection vehicleStateRef={props.vehicleStateRef} />
      <FoolfouleCrowd
        vehicleStateRef={props.vehicleStateRef}
        signalRef={foolfouleCrowdSignalRef}
      />
      <FoolfouleDramaturgy
        audioClockRef={props.audioClockRef}
        isInsideZone={isInsideFoolfoule}
        crowdSignalRef={foolfouleCrowdSignalRef}
      />
      <DriftEvolutionSpatialRig
        vehicleStateRef={props.vehicleStateRef}
        cameraZoomTargetRef={props.cameraZoomTargetRef}
        proximity={props.proximity}
      />
      <DriftSceneReadySignal
        vehicleStateRef={props.vehicleStateRef}
        expectedPosition={evolutionStartPosition}
        stableFrames={5}
        positionTolerance={0.35}
      />
    </>
  );
}
