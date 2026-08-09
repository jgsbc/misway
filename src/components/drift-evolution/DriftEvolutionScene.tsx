"use client";

import { useLayoutEffect, useRef, type ComponentProps } from "react";
import Drift3DSceneBase from "@/components/drift-3d/Drift3DSceneBase";
import DriftSceneReadySignal from "@/components/drift-3d/DriftSceneReadySignal";
import EntryCaveSalvage from "@/components/drift-evolution/EntryCaveSalvage";
import EntryPortalLightCorrection from "@/components/drift-evolution/EntryPortalLightCorrection";
import EvolutionSafari110VehicleVisual from "@/components/drift-evolution/EvolutionSafari110VehicleVisual";
import FoolfouleCrowd from "@/components/drift-evolution/FoolfouleCrowd";
import FoolfouleDramaturgy from "@/components/drift-evolution/FoolfouleDramaturgy";
import DriftEvolutionSpatialRig from "@/components/drift-evolution/DriftEvolutionSpatialRig";
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

type DriftEvolutionSceneProps = ComponentProps<typeof Drift3DSceneBase>;

// Must happen before Drift3DSceneBase's first render: its landmark collider
// memo and topology nodes must already reflect the evolution-only staging.
suppressLegacyEntryForEvolution();
stageZeelandForEvolution();
stageFoolfouleForEvolution();

/**
 * Copy-on-write scene: production DRIFT remains the complete base authority;
 * evolution owns only the presentation/spatial layers that explicitly diverge.
 */
export default function DriftEvolutionScene(props: DriftEvolutionSceneProps) {
  const evolutionStartPosition = getDriftEvolutionEntryStartPosition();
  const foolfouleCrowdSignalRef = useRef(
    createDriftEvolutionFoolfouleCrowdSignal()
  );
  const isInsideFoolfoule =
    props.proximity?.activeNode?.id === drift3dTrackNodeBySlug.foolfoule.id;

  useLayoutEffect(() => {
    // React Strict Mode may replay layout effects in development. Reassert the
    // evolution overrides after a cleanup replay, then restore on real unmount.
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
