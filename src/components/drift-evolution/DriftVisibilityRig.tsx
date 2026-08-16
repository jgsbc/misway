"use client";

import { useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  createDrift3DAtmosphereState,
  getDrift3DAtmosphereAt,
} from "@/lib/drift3dAtmosphere";
import type { Drift3DVehiclePhysicsState } from "@/lib/drift3dVehiclePhysics";

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

export default function DriftVisibilityRig({
  vehicleStateRef,
}: {
  vehicleStateRef: MutableRefObject<Drift3DVehiclePhysicsState>;
}) {
  const fillRef = useRef<THREE.AmbientLight>(null);
  const atmosphereRef = useRef(createDrift3DAtmosphereState());
  const darknessRef = useRef(0);

  useFrame(({ gl, scene }, delta) => {
    const atmosphere = getDrift3DAtmosphereAt(
      vehicleStateRef.current.position,
      atmosphereRef.current
    );
    const skyLuminance =
      atmosphere.skyColor.r * 0.2126 +
      atmosphere.skyColor.g * 0.7152 +
      atmosphere.skyColor.b * 0.0722;
    const targetDarkness = clamp01((0.3 - skyLuminance) / 0.26);
    const ease = 1 - Math.exp(-delta * 2.8);
    darknessRef.current += (targetDarkness - darknessRef.current) * ease;
    const darkness = darknessRef.current;

    if (fillRef.current) {
      fillRef.current.intensity = darkness * 0.14;
    }

    const minimumExposure = 0.84 + darkness * 0.08;
    gl.toneMappingExposure = Math.max(gl.toneMappingExposure, minimumExposure);

    if (scene.fog instanceof THREE.FogExp2) {
      const maxDarkFogDensity = 0.045 - darkness * 0.012;
      scene.fog.density = Math.min(scene.fog.density, maxDarkFogDensity);
    }
  }, 0.82);

  return (
    <ambientLight
      ref={fillRef}
      color="#c8d5e8"
      intensity={0}
      aria-hidden="true"
    />
  );
}
