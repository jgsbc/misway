"use client";

import type { MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ACESFilmicToneMapping } from "three";
import type { Drift3DEvidenceRuntimeRef } from "@/lib/drift3dEvidence";
import DriftMacroWorldScene from "@/components/drift-3d/greybox/DriftMacroWorldScene";
import type { Drift3DVehiclePhysicsState } from "@/lib/drift3dVehiclePhysics";
import type { Drift3DPointerDriveState } from "@/lib/drift3d";
import type { Drift3DMacroWorldGreyboxStatus } from "@/lib/drift3dMacroWorldGreyboxHarness";
import type { Drift3DQualityTier } from "@/lib/drift3dQuality";

/** Dev-only, in-Canvas gl.info.memory read — mirrors PRE-30's own local
 * memory probe pattern; never a second evidence authority. */
function DriftGreyboxMemoryProbe({
  memoryRef,
}: {
  memoryRef: MutableRefObject<{ geometries: number; textures: number }>;
}) {
  const { gl } = useThree();

  useFrame(() => {
    memoryRef.current.geometries = gl.info.memory.geometries;
    memoryRef.current.textures = gl.info.memory.textures;
  });

  return null;
}

export type DriftMacroWorldGreyboxCanvasViewProps = {
  vehicleStateRef: MutableRefObject<Drift3DVehiclePhysicsState>;
  pointerDriveStateRef: MutableRefObject<Drift3DPointerDriveState>;
  teleportRequestRef: MutableRefObject<{ x: number; z: number } | null>;
  resetRequestRef: MutableRefObject<boolean>;
  qualityTier: Drift3DQualityTier;
  reducedMotion: boolean;
  evidenceRuntimeRef: Drift3DEvidenceRuntimeRef;
  memoryRef: MutableRefObject<{ geometries: number; textures: number }>;
  statusRef: MutableRefObject<Drift3DMacroWorldGreyboxStatus>;
};

export default function DriftMacroWorldGreyboxCanvasView({
  vehicleStateRef,
  pointerDriveStateRef,
  teleportRequestRef,
  resetRequestRef,
  qualityTier,
  reducedMotion,
  evidenceRuntimeRef,
  memoryRef,
  statusRef,
}: DriftMacroWorldGreyboxCanvasViewProps) {
  return (
    <Canvas
      className="absolute inset-0"
      camera={{ position: [-96, 6, 22], fov: 34, near: 0.1, far: 260 }}
      dpr={[1, 1.5]}
      shadows
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
        toneMapping: ACESFilmicToneMapping,
      }}
    >
      <DriftMacroWorldScene
        vehicleStateRef={vehicleStateRef}
        pointerDriveStateRef={pointerDriveStateRef}
        teleportRequestRef={teleportRequestRef}
        resetRequestRef={resetRequestRef}
        qualityTier={qualityTier}
        reducedMotion={reducedMotion}
        evidenceRuntimeRef={evidenceRuntimeRef}
        statusRef={statusRef}
      />

      {process.env.NODE_ENV !== "production" ? (
        <DriftGreyboxMemoryProbe memoryRef={memoryRef} />
      ) : null}
    </Canvas>
  );
}
