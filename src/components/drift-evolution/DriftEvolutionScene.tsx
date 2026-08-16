"use client";

import { memo, useLayoutEffect, useRef, type ComponentProps } from "react";
import Drift3DSceneBase from "@/components/drift-3d/Drift3DSceneBase";
import Drift3DLandmark from "@/components/drift-3d/Drift3DLandmark";
import DriftSceneReadySignal from "@/components/drift-3d/DriftSceneReadySignal";
import Defender90LowpolyVehicleVisual from "@/components/drift-evolution/Defender90LowpolyVehicleVisual";
import DriftCosmicSkyEnhancement from "@/components/drift-evolution/DriftCosmicSkyEnhancement";
import DriftVehiclePresentationFinisher from "@/components/drift-evolution/DriftVehiclePresentationFinisher";
import DriftEvolutionPerformanceRig from "@/components/drift-evolution/DriftEvolutionPerformanceRig";
import EntryCaveSalvage from "@/components/drift-evolution/EntryCaveSalvage";
import EntryPortalLightCorrection from "@/components/drift-evolution/EntryPortalLightCorrection";
import FoolfouleCrowd from "@/components/drift-evolution/FoolfouleCrowd";
import FoolfouleDramaturgy from "@/components/drift-evolution/FoolfouleDramaturgy";
import DriftEvolutionSpatialRig from "@/components/drift-evolution/DriftEvolutionSpatialRig";
import { drift3dNewTrackLandmarks } from "@/lib/drift3dNewTrackLandmarks";
import { drift3dTrackNodeBySlug } from "@/lib/drift3dTopology";
import { buildDriftEvolutionBirthYardRouteLabLandmark } from "@/lib/driftEvolutionBirthYardRouteLab";
import { getDriftEvolutionEntryStartPosition } from "@/lib/driftEvolutionEntryCave";
import { createDriftEvolutionFoolfouleCrowdSignal } from "@/lib/driftEvolutionFoolfouleDramaturgy";
import {
  restoreFoolfouleAfterEvolution,
  stageFoolfouleForEvolution,
} from "@/lib/driftEvolutionFoolfouleRegistry";
import {
  restoreJazzyplingAfterEvolution,
  stageJazzyplingForEvolution,
} from "@/lib/driftEvolutionJazzyplingRegistry";
import {
  restoreLegacyEntryAfterEvolution,
  suppressLegacyEntryForEvolution,
} from "@/lib/driftEvolutionLegacyEntryRegistry";
import {
  restoreZeelandAfterEvolution,
  stageZeelandForEvolution,
} from "@/lib/driftEvolutionZeelandRegistry";
import type { DriftEvolutionPerformanceProfile } from "@/lib/driftEvolutionPerformance";

type DriftEvolutionSceneProps = ComponentProps<typeof Drift3DSceneBase> & {
  performanceProfile: DriftEvolutionPerformanceProfile;
};

// Must happen before Drift3DSceneBase's first render: its landmark collider
// memo and topology nodes must already reflect the promoted staging.
suppressLegacyEntryForEvolution();
stageZeelandForEvolution();
stageFoolfouleForEvolution();
stageJazzyplingForEvolution();

const birthYardRouteLabLandmark =
  buildDriftEvolutionBirthYardRouteLabLandmark();

/**
 * Promoted production composition: the shared base remains authoritative for
 * unchanged layers and every accepted divergence stays explicit here.
 */
function DriftEvolutionScene({
  performanceProfile,
  ...props
}: DriftEvolutionSceneProps) {
  const evolutionStartPosition = getDriftEvolutionEntryStartPosition();
  const foolfouleCrowdSignalRef = useRef(
    createDriftEvolutionFoolfouleCrowdSignal()
  );
  const isInsideFoolfoule =
    props.proximity?.activeNode?.id === drift3dTrackNodeBySlug.foolfoule.id;

  useLayoutEffect(() => {
    // React Strict Mode may replay layout effects in development. Reassert the
    // promoted overrides after a cleanup replay, then restore on real unmount.
    suppressLegacyEntryForEvolution();
    stageZeelandForEvolution();
    stageFoolfouleForEvolution();
    stageJazzyplingForEvolution();

    return () => {
      restoreJazzyplingAfterEvolution();
      restoreFoolfouleAfterEvolution();
      restoreZeelandAfterEvolution();
      restoreLegacyEntryAfterEvolution();
    };
  }, []);

  return (
    <>
      <Drift3DSceneBase {...props} cameraAuthority="external" />
      <Drift3DLandmark
        landmark={birthYardRouteLabLandmark}
        vehicleStateRef={props.vehicleStateRef}
      />
      {drift3dNewTrackLandmarks.map((landmark) => (
        <Drift3DLandmark
          key={landmark.id}
          landmark={landmark}
          vehicleStateRef={props.vehicleStateRef}
        />
      ))}
      <Defender90LowpolyVehicleVisual />
      <DriftVehiclePresentationFinisher />
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
      <DriftCosmicSkyEnhancement />
      <DriftEvolutionPerformanceRig
        profile={performanceProfile}
        vehicleStateRef={props.vehicleStateRef}
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

// The HUD receives distance/progress snapshots more often than the 3D world
// needs them. Stable props must therefore stop those lightweight shell updates
// from reconciling every landmark, zone and material in the R3F subtree.
export default memo(DriftEvolutionScene);