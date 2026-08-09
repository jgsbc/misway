"use client";

import { useLayoutEffect, type ComponentProps } from "react";
import Drift3DSceneBase from "@/components/drift-3d/Drift3DSceneBase";
import EntryCaveSalvage from "@/components/drift-evolution/EntryCaveSalvage";
import EntryPortalLightCorrection from "@/components/drift-evolution/EntryPortalLightCorrection";
import EvolutionSafari110VehicleVisual from "@/components/drift-evolution/EvolutionSafari110VehicleVisual";
import FoolfouleCrowd from "@/components/drift-evolution/FoolfouleCrowd";
import DriftEvolutionSpatialRig from "@/components/drift-evolution/DriftEvolutionSpatialRig";
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
      <FoolfouleCrowd vehicleStateRef={props.vehicleStateRef} />
      <DriftEvolutionSpatialRig
        vehicleStateRef={props.vehicleStateRef}
        cameraZoomTargetRef={props.cameraZoomTargetRef}
        proximity={props.proximity}
      />
    </>
  );
}
