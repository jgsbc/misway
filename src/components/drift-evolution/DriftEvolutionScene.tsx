"use client";

import { useLayoutEffect, type ComponentProps } from "react";
import Drift3DSceneBase from "@/components/drift-3d/Drift3DSceneBase";
import EntryCaveSalvage from "@/components/drift-evolution/EntryCaveSalvage";
import DriftEvolutionSpatialRig from "@/components/drift-evolution/DriftEvolutionSpatialRig";
import {
  restoreLegacyEntryAfterEvolution,
  suppressLegacyEntryForEvolution,
} from "@/lib/driftEvolutionLegacyEntryRegistry";

type DriftEvolutionSceneProps = ComponentProps<typeof Drift3DSceneBase>;

// Must happen before Drift3DSceneBase's first render: its collider useMemo is
// intentionally constructed without the superseded production cave.
suppressLegacyEntryForEvolution();

/**
 * Copy-on-write scene: production DRIFT remains the complete base authority;
 * evolution owns only the experimental presentation/spatial layers that need
 * to diverge. The recovered Entry fully replaces the old cave while this
 * route is mounted; the production registry is restored on unmount.
 */
export default function DriftEvolutionScene(props: DriftEvolutionSceneProps) {
  useLayoutEffect(() => {
    // React Strict Mode may replay layout effects in development. Reassert the
    // evolution override after a cleanup replay, then restore on real unmount.
    suppressLegacyEntryForEvolution();
    return restoreLegacyEntryAfterEvolution;
  }, []);

  return (
    <>
      <Drift3DSceneBase {...props} />
      <EntryCaveSalvage vehicleStateRef={props.vehicleStateRef} />
      <DriftEvolutionSpatialRig
        vehicleStateRef={props.vehicleStateRef}
        cameraZoomTargetRef={props.cameraZoomTargetRef}
        proximity={props.proximity}
      />
    </>
  );
}
