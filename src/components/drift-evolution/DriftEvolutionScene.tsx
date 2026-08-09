"use client";

import type { ComponentProps } from "react";
import Drift3DScene from "@/components/drift-3d/Drift3DScene";
import EntryCaveSalvage from "@/components/drift-evolution/EntryCaveSalvage";

type DriftEvolutionSceneProps = ComponentProps<typeof Drift3DScene>;

/**
 * Copy-on-write scene: production DRIFT remains the complete base authority;
 * evolution adds only the active experimental presentation layer.
 */
export default function DriftEvolutionScene(props: DriftEvolutionSceneProps) {
  return (
    <>
      <Drift3DScene {...props} />
      <EntryCaveSalvage vehicleStateRef={props.vehicleStateRef} />
    </>
  );
}
