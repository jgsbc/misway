"use client";

import { useEffect, useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import LegacyEntryAuthoritySuppressor from "@/components/drift-evolution/LegacyEntryAuthoritySuppressor";
import DriftWorldEdgeBiomes from "@/components/drift-evolution/DriftWorldEdgeBiomes";
import DriftNorthEdgeContinuityFix from "@/components/drift-evolution/DriftNorthEdgeContinuityFix";
import ZeelandWaterSurface from "@/components/drift-evolution/ZeelandWaterSurface";
import {
  getDriftMaterialMaps,
  setDriftGeometryTextureRepeat,
} from "@/components/drift-3d/drift3dTextureFactory";
import { getDrift3DMovementBounds } from "@/lib/drift3d";
import { getDrift3DTrackMotion } from "@/lib/drift3dCinematography";
import { getDrift3DGroundY } from "@/lib/drift3dTerrain";
import type { Drift3DTopologyProximity } from "@/lib/drift3dTopology";
import type { Drift3DVehiclePhysicsState } from "@/lib/drift3dVehiclePhysics";
import {
  DRIFT_EVOLUTION_ENTRY_CAVE,
  getDriftEvolutionEntryPathCenterZ,
  getDriftEvolutionEntryTunnelMix,
} from "@/lib/driftEvolutionEntryCave";
import {
  DRIFT_EVOLUTION_ENTRY_DRIVE_HALF_WIDTH,
  constrainDriftEvolutionEntryVehicle,
  getDriftEvolutionAdaptiveCameraRig,
} from "@/lib/driftEvolutionSpatial";

type DriftEvolutionSpatialRigProps = {
  vehicleStateRef: MutableRefObject<Drift3DVehiclePhysicsState>;
  cameraZoomTargetRef: MutableRefObject<number>;
  proximity: Drift3DTopologyProximity | null;
};

const CAMERA_EDGE_INSET = 2.8;
const CAMERA_LINE_CLEARANCE = 0.9;
const CAMERA_GROUND_CLEARANCE = 1.2;
const CAMERA_RELIEF_PROBES = 6;
const movementBounds = getDrift3DMovementBounds();

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

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
  const maps = getDriftMaterialMaps("rock");
  const geometry = useMemo(() => {
    const alongSegments = 56;
    const acrossSegments = 10;
    const halfWidth = DRIFT_EVOLUTION_ENTRY_DRIVE_HALF_WIDTH + 0.62;
    const x0 = cave.startX + 0.25;
    const x1 = cave.exitX - 0.15;
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    for (let along = 0; along <= alongSegments; along += 1) {
      const v = along / alongSegments;
      const x = x0 + (x1 - x0) * v;
      const centerZ = getDriftEvolutionEntryPathCenterZ(x);

      for (let across = 0; across <= acrossSegments; across += 1) {
        const u = across / acrossSegments;
        const z = centerZ + (u * 2 - 1) * halfWidth;
        const y = getDrift3DGroundY(x, z) + 0.032;
        positions.push(x, y, z);
        uvs.push(v * 5, u * 2.4);
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
    setDriftGeometryTextureRepeat(result, 5, 2.4);
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

function CaveLightingContinuityRig({
  vehicleStateRef,
}: {
  vehicleStateRef: MutableRefObject<Drift3DVehiclePhysicsState>;
}) {
  const smoothMixRef = useRef<number | null>(null);
  const dark = useMemo(() => new THREE.Color("#03040a"), []);

  useFrame(({ gl, scene }, delta) => {
    const rawMix = getDriftEvolutionEntryTunnelMix(vehicleStateRef.current.position.x);
    if (smoothMixRef.current === null) smoothMixRef.current = rawMix;
    if (rawMix <= 0.0001 && smoothMixRef.current <= 0.0001) {
      smoothMixRef.current = 0;
      return;
    }
    const response = rawMix > smoothMixRef.current ? 4.4 : 2.35;
    const ease = 1 - Math.exp(-delta * response);
    smoothMixRef.current += (rawMix - smoothMixRef.current) * ease;
    const smoothMix = smoothMixRef.current;

    const deep = DRIFT_EVOLUTION_ENTRY_CAVE.deepExposureFactor;
    const rawFactor = 1 - rawMix * (1 - deep);
    const desiredFactor = 1 - smoothMix * (1 - deep);
    gl.toneMappingExposure *= desiredFactor / Math.max(0.05, rawFactor);

    if (scene.background instanceof THREE.Color) {
      compensateColorLerp(scene.background, dark, rawMix * 0.92, smoothMix * 0.92);
    }

    if (scene.fog instanceof THREE.FogExp2) {
      compensateColorLerp(scene.fog.color, dark, rawMix * 0.9, smoothMix * 0.9);
      const rawTunnelDensity = 0.018 + rawMix * 0.018;
      const smoothTunnelDensity = 0.018 + smoothMix * 0.018;
      if (scene.fog.density <= rawTunnelDensity + 0.0025) {
        scene.fog.density = smoothTunnelDensity;
      }
    }
  }, 0.72);

  return null;
}

function adaptCameraForVisibility(
  vehicleState: Drift3DVehiclePhysicsState,
  desiredPosition: THREE.Vector3,
  desiredTarget: THREE.Vector3,
  enclosure: number
) {
  const openWorldMix = 1 - clamp(enclosure, 0, 1);
  if (openWorldMix <= 0.001) return 0;

  const originalX = desiredPosition.x;
  const originalZ = desiredPosition.z;
  const safeX = clamp(
    originalX,
    movementBounds.minX + CAMERA_EDGE_INSET,
    movementBounds.maxX - CAMERA_EDGE_INSET
  );
  const safeZ = clamp(
    originalZ,
    movementBounds.minZ + CAMERA_EDGE_INSET,
    movementBounds.maxZ - CAMERA_EDGE_INSET
  );

  desiredPosition.x += (safeX - desiredPosition.x) * openWorldMix;
  desiredPosition.z += (safeZ - desiredPosition.z) * openWorldMix;
  desiredTarget.y = Math.max(
    desiredTarget.y,
    vehicleState.position.y + 0.42 * openWorldMix
  );

  let requiredCameraY = Math.max(
    desiredPosition.y,
    getDrift3DGroundY(desiredPosition.x, desiredPosition.z) +
      CAMERA_GROUND_CLEARANCE
  );

  for (let probe = 1; probe <= CAMERA_RELIEF_PROBES; probe += 1) {
    const t = probe / (CAMERA_RELIEF_PROBES + 1);
    const x = desiredTarget.x + (desiredPosition.x - desiredTarget.x) * t;
    const z = desiredTarget.z + (desiredPosition.z - desiredTarget.z) * t;
    const lineY = desiredTarget.y + (desiredPosition.y - desiredTarget.y) * t;
    const groundY = getDrift3DGroundY(x, z) + CAMERA_LINE_CLEARANCE;

    if (groundY > lineY) {
      requiredCameraY = Math.max(
        requiredCameraY,
        desiredTarget.y + (groundY - desiredTarget.y) / t
      );
    }
  }

  const edgeCorrection = Math.hypot(
    desiredPosition.x - originalX,
    desiredPosition.z - originalZ
  );
  requiredCameraY += Math.min(1.35, edgeCorrection * 0.18);
  requiredCameraY = Math.min(
    requiredCameraY,
    vehicleState.position.y + 8.5
  );
  desiredPosition.y +=
    (requiredCameraY - desiredPosition.y) * openWorldMix;

  return clamp(edgeCorrection / 3.5, 0, 1);
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
  const desiredPositionRef = useRef(new THREE.Vector3());
  const desiredTargetRef = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    const activeTrackSlug = getActiveTrackSlug(proximity);
    const trackMotion = getDrift3DTrackMotion(activeTrackSlug);
    const motionEase = 1 - Math.exp(-delta * 2);
    cinematicZoomRef.current +=
      (trackMotion.zoomScale - cinematicZoomRef.current) * motionEase;

    const vehicleState = vehicleStateRef.current;
    const rig = getDriftEvolutionAdaptiveCameraRig(
      vehicleState.position,
      vehicleState.heading,
      cameraZoomTargetRef.current,
      cinematicZoomRef.current
    );
    const desiredPosition = desiredPositionRef.current.set(
      rig.position.x,
      rig.position.y,
      rig.position.z
    );
    const desiredTarget = desiredTargetRef.current.set(
      rig.target.x,
      rig.target.y,
      rig.target.z
    );
    const visibilityCorrection = adaptCameraForVisibility(
      vehicleState,
      desiredPosition,
      desiredTarget,
      rig.enclosure
    );

    if (!initializedRef.current) {
      smoothedPositionRef.current.copy(desiredPosition);
      smoothedTargetRef.current.copy(desiredTarget);
      initializedRef.current = true;
    } else {
      const positionResponse =
        8.5 + rig.enclosure * 5.5 + visibilityCorrection * 2.5;
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
      <LegacyEntryAuthoritySuppressor />
      <CaveGroundRibbon />
      <ZeelandWaterSurface />
      <DriftWorldEdgeBiomes />
      <DriftNorthEdgeContinuityFix />
      <CaveCollisionRig vehicleStateRef={props.vehicleStateRef} />
      <CaveLightingContinuityRig vehicleStateRef={props.vehicleStateRef} />
      <AdaptiveCameraRig {...props} />
    </>
  );
}
