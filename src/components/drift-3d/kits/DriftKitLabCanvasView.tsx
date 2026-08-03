"use client";

import type { MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ACESFilmicToneMapping } from "three";
import Drift3DEvidenceProbe from "@/components/drift-3d/Drift3DEvidenceProbe";
import type { Drift3DEvidenceRuntimeRef } from "@/lib/drift3dEvidence";
import UrbanHumanPilot from "@/components/drift-3d/kits/UrbanHumanPilot";
import NatureMovementPilot from "@/components/drift-3d/kits/NatureMovementPilot";
import WaterWeatherLightPilot from "@/components/drift-3d/kits/WaterWeatherLightPilot";
import type {
  Drift3DKitPilotId,
  Drift3DKitPilotStatus,
  Drift3DWaterPresetId,
} from "@/lib/drift3dKitPilotConfig";
import type { Drift3DQualityTier } from "@/lib/drift3dQuality";

/**
 * Dev-only, in-Canvas read of `gl.info.memory` (geometries/textures) — a
 * thin local counter for this lab route's own diagnostics panel, never
 * exposed globally and never a second evidence authority. Draw calls,
 * triangles and FPS stay owned exclusively by `drift3dEvidence.ts` (SYS-70)
 * via `Drift3DEvidenceProbe` alongside this component.
 */
function Drift3DKitPilotMemoryProbe({
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

type DriftKitLabCanvasViewProps = {
  activePilot: Drift3DKitPilotId;
  qualityTier: Drift3DQualityTier;
  reducedMotion: boolean;
  waterPresetId: Drift3DWaterPresetId;
  evidenceRuntimeRef: Drift3DEvidenceRuntimeRef;
  memoryRef: MutableRefObject<{ geometries: number; textures: number }>;
  statusRef: MutableRefObject<Drift3DKitPilotStatus>;
};

export default function DriftKitLabCanvasView({
  activePilot,
  qualityTier,
  reducedMotion,
  waterPresetId,
  evidenceRuntimeRef,
  memoryRef,
  statusRef,
}: DriftKitLabCanvasViewProps) {
  return (
    <Canvas
      className="absolute inset-0"
      camera={{ position: [0, 3.4, 9], fov: 42, near: 0.1, far: 200 }}
      dpr={[1, 1.5]}
      shadows
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
        toneMapping: ACESFilmicToneMapping,
      }}
    >
      <color attach="background" args={["#cfe0e8"]} />
      <hemisphereLight args={["#dfe9f0", "#5b5646", 0.9]} />
      <directionalLight
        position={[6, 9, 4]}
        intensity={1.4}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {activePilot === "urban-human" ? (
        <UrbanHumanPilot
          qualityTier={qualityTier}
          reducedMotion={reducedMotion}
          statusRef={statusRef}
        />
      ) : null}
      {activePilot === "nature-movement" ? (
        <NatureMovementPilot
          qualityTier={qualityTier}
          reducedMotion={reducedMotion}
          statusRef={statusRef}
        />
      ) : null}
      {activePilot === "water-weather-light" ? (
        <WaterWeatherLightPilot
          qualityTier={qualityTier}
          reducedMotion={reducedMotion}
          waterPresetId={waterPresetId}
          statusRef={statusRef}
        />
      ) : null}

      {process.env.NODE_ENV !== "production" ? (
        <>
          <Drift3DEvidenceProbe runtimeRef={evidenceRuntimeRef} />
          <Drift3DKitPilotMemoryProbe memoryRef={memoryRef} />
        </>
      ) : null}
    </Canvas>
  );
}
