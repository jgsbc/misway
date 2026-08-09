"use client";

import { useEffect, useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { getDriftMaterialMaps } from "@/components/drift-3d/drift3dTextureFactory";
import { getDrift3DTrackMotion } from "@/lib/drift3dCinematography";
import { getDrift3DGroundY } from "@/lib/drift3dTerrain";
import type { Drift3DTopologyProximity } from "@/lib/drift3dTopology";
import type { Drift3DVehiclePhysicsState } from "@/lib/drift3dVehiclePhysics";
import {
  DRIFT_EVOLUTION_ENTRY_CAVE,
  getDriftEvolutionEntryTunnelMix,
} from "@/lib/driftEvolutionEntryCave";
import {
  DRIFT_EVOLUTION_ENTRY_DRIVE_HALF_WIDTH,
  constrainDriftEvolutionEntryVehicle,
  getDriftEvolutionAdaptiveCameraRig,
  getDriftEvolutionEntryPathCenterX,
} from "@/lib/driftEvolutionSpatial";

type DriftEvolutionSpatialRigProps = {
  vehicleStateRef: MutableRefObject<Drift3DVehiclePhysicsState>;
  cameraZoomTargetRef: MutableRefObject<number>;
  proximity: Drift3DTopologyProximity | null;
};

function getActiveTrackSlug(proximity: Drift3DTopologyProximity | null) {
  if (
    !proximity?.isInside ||
    !proximity.activeNode ||
    !("trackSlug" in proximity.activeNode)
  ) {
    return null;
  }

  return proximity.activeNode.trackSlug;
}

function CaveGroundRibbon() {
  const cave = DRIFT_EVOLUTION_ENTRY_CAVE;
  const maps = getDriftMaterialMaps("rock", 2.4, 8);
  const geometry = useMemo(() => {
    const alongSegments = 72;
    const acrossSegments = 10;
    const halfWidth = DRIFT_EVOLUTION_ENTRY_DRIVE_HALF_WIDTH + 0.62;
    const z0 = cave.startZ + 0.25;
    const z1 = cave.mouthZ + cave.portalDepth - 0.25;
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    for (let along = 0; along <= alongSegments; along += 1) {
      const v = along / alongSegments;
      const z = z0 + (z1 - z0) * v;
      const centerX = getDriftEvolutionEntryPathCenterX(z);

      for (let across = 0; across <= acrossSegments; across += 1) {
        const u = across / acrossSegments;
        const x = centerX + (u * 2 - 1) * halfWidth;
        const y = getDrift3DGroundY(x, z) + 0.032;
        positions.push(x, y, z);
        uvs.push(u * 2.4, v * 8);
      }
    }

    const row = acrossSegments + 1;
    for (let along = 0; along < alongSegments; along += 1) {
      for (let across = 0; across < acrossSegments; across += 1) {
        const a = along * row + across;
        const b = a + 1;
        const c = a + row;
        const d = c + 1;
        indices.push(a, c, b, b, c, d);
      }
    }

    const result = new THREE.BufferGeometry();
    result.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    result.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    result.setIndex(indices);
    result.computeVertexNormals();
    return result;
  }, [cave]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry} receiveShadow renderOrder={2} aria-hidden="true">
      <meshStandardMaterial
        map={maps.map ?? undefined}
        normalMap={maps.normalMap ?? undefined}
        normalScale={new THREE.Vector2(1.05, 1.05)}
        color="#4b463f"
        roughness={0.99}
        polygonOffset
        polygonOffsetFactor={-1}
        polygonOffsetUnits={-1}
      />
    </mesh>
  );
}

/**
 * EVO-20R carried a temporary perfectly-flat floor card. The recovered cave
 * shell and vehicle physics both follow DRIFT's terrain, so that card is the
 * visual discontinuity. Hide only that exact evolution-only compatibility
 * mesh; the production terrain and every `/drift` landmark remain untouched.
 */
function LegacyFlatFloorSuppressor() {
  const scene = useThree((state) => state.scene);

  useEffect(() => {
    const hidden: THREE.Object3D[] = [];
    const expectedLength =
      DRIFT_EVOLUTION_ENTRY_CAVE.mouthZ - DRIFT_EVOLUTION_ENTRY_CAVE.startZ;

    scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      if (!(object.geometry instanceof THREE.PlaneGeometry)) return;

      const { width, height } = object.geometry.parameters;
      const material = Array.isArray(object.material)
        ? null
        : object.material instanceof THREE.MeshStandardMaterial
          ? object.material
          : null;

      if (
        material &&
        Math.abs(width - 6.3) < 0.01 &&
        Math.abs(height - expectedLength) < 0.05 &&
        material.color.getHex() === 0x17151c &&
        Math.abs(material.opacity - 0.78) < 0.01
      ) {
        object.visible = false;
        hidden.push(object);
      }
    });

    return () => {
      for (const object of hidden) object.visible = true;
    };
  }, [scene]);

  return null;
}

function CaveCollisionRig({
  vehicleStateRef,
}: {
  vehicleStateRef: MutableRefObject<Drift3DVehiclePhysicsState>;
}) {
  useFrame(() => {
    constrainDriftEvolutionEntryVehicle(vehicleStateRef.current);
  }, 0.55);

  return null;
}

function compensateColorLerp(
  color: THREE.Color,
  dark: THREE.Color,
  rawAmount: number,
  desiredAmount: number
) {
  const rawRemain = Math.max(0.02, 1 - rawAmount);
  const baseR = (color.r - dark.r * rawAmount) / rawRemain;
  const baseG = (color.g - dark.g * rawAmount) / rawRemain;
  const baseB = (color.b - dark.b * rawAmount) / rawRemain;

  color.setRGB(
    baseR * (1 - desiredAmount) + dark.r * desiredAmount,
    baseG * (1 - desiredAmount) + dark.g * desiredAmount,
    baseB * (1 - desiredAmount) + dark.b * desiredAmount
  );
}

/** Smooth the recovered cave eye adaptation instead of stepping it by z. */
function CaveLightingContinuityRig({
  vehicleStateRef,
}: {
  vehicleStateRef: MutableRefObject<Drift3DVehiclePhysicsState>;
}) {
  const smoothMixRef = useRef<number | null>(null);
  const dark = useMemo(() => new THREE.Color("#03040a"), []);

  useFrame(({ gl, scene }, delta) => {
    const rawMix = getDriftEvolutionEntryTunnelMix(vehicleStateRef.current.position.z);
    if (smoothMixRef.current === null) smoothMixRef.current = rawMix;
    const response = rawMix > smoothMixRef.current ? 4.4 : 2.35;
    const ease = 1 - Math.exp(-delta * response);
    smoothMixRef.current += (rawMix - smoothMixRef.current) * ease;
    const smoothMix = smoothMixRef.current;

    const deep = DRIFT_EVOLUTION_ENTRY_CAVE.deepExposureFactor;
    const rawFactor = 1 - rawMix * (1 - deep);
    const desiredFactor = 1 - smoothMix * (1 - deep);
    gl.toneMappingExposure *= desiredFactor / Math.max(0.05, rawFactor);

    if (scene.background instanceof THREE.Color) {
      compensateColorLerp(
        scene.background,
        dark,
        rawMix * 0.92,
        smoothMix * 0.92
      );
    }

    if (scene.fog instanceof THREE.FogExp2) {
      compensateColorLerp(
        scene.fog.color,
        dark,
        rawMix * 0.9,
        smoothMix * 0.9
      );
      const rawTunnelDensity = 0.018 + rawMix * 0.018;
      const smoothTunnelDensity = 0.018 + smoothMix * 0.018;
      if (scene.fog.density <= rawTunnelDensity + 0.0025) {
        scene.fog.density = smoothTunnelDensity;
      }
    }
  }, 0.72);

  return null;
}

function AdaptiveCameraRig({
  vehicleStateRef,
  cameraZoomTargetRef,
  proximity,
}: DriftEvolutionSpatialRigProps) {
  const camera = useThree((state) => state.camera);
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const cinematicZoomRef = useRef(1);
  const initializedRef = useRef(false);
  const smoothedPositionRef = useRef(new THREE.Vector3());
  const smoothedTargetRef = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    const activeTrackSlug = getActiveTrackSlug(proximity);
    const trackMotion = getDrift3DTrackMotion(activeTrackSlug);
    const motionEase = 1 - Math.exp(-delta * 2);
    cinematicZoomRef.current +=
      (trackMotion.zoomScale - cinematicZoomRef.current) * motionEase;

    const rig = getDriftEvolutionAdaptiveCameraRig(
      vehicleStateRef.current.position,
      vehicleStateRef.current.heading,
      cameraZoomTargetRef.current,
      cinematicZoomRef.current
    );
    const desiredPosition = new THREE.Vector3(
      rig.position.x,
      rig.position.y,
      rig.position.z
    );
    const desiredTarget = new THREE.Vector3(
      rig.target.x,
      rig.target.y,
      rig.target.z
    );

    if (!initializedRef.current) {
      smoothedPositionRef.current.copy(desiredPosition);
      smoothedTargetRef.current.copy(desiredTarget);
      initializedRef.current = true;
    } else {
      const positionResponse = 8.5 + rig.enclosure * 5.5;
      const targetResponse = 10.5 + rig.enclosure * 4.5;
      smoothedPositionRef.current.lerp(
        desiredPosition,
        1 - Math.exp(-delta * positionResponse)
      );
      smoothedTargetRef.current.lerp(
        desiredTarget,
        1 - Math.exp(-delta * targetResponse)
      );
    }

    camera.position.copy(smoothedPositionRef.current);
    camera.lookAt(smoothedTargetRef.current);
    gl.render(scene, camera);
  }, 1);

  return null;
}

export default function DriftEvolutionSpatialRig(
  props: DriftEvolutionSpatialRigProps
) {
  return (
    <>
      <LegacyFlatFloorSuppressor />
      <CaveGroundRibbon />
      <CaveCollisionRig vehicleStateRef={props.vehicleStateRef} />
      <CaveLightingContinuityRig vehicleStateRef={props.vehicleStateRef} />
      <AdaptiveCameraRig {...props} />
    </>
  );
}
