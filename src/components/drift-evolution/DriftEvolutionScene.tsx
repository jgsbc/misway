"use client";

import type { ComponentProps } from "react";
import Drift3DSceneBase from "@/components/drift-3d/Drift3DSceneBase";
import EntryCaveSalvage from "@/components/drift-evolution/EntryCaveSalvage";
import DriftEvolutionSpatialRig from "@/components/drift-evolution/DriftEvolutionSpatialRig";

type DriftEvolutionSceneProps = ComponentProps<typeof Drift3DSceneBase>;

/**
 * Copy-on-write scene: production DRIFT remains the complete base authority;
 * evolution owns only the experimental presentation/spatial layers that need
 * to diverge. The base scene still provides the complete world, vehicle,
 * physics, audio and topology; the evolution rig owns the final camera render.
 */
export default function DriftEvolutionScene(props: DriftEvolutionSceneProps) {
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
