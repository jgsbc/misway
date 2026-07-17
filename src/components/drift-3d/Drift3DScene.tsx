"use client";

import { useEffect, useMemo, useRef } from "react";
import type { MutableRefObject, RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import Drift3DVehicle, {
  DRIFT_3D_VEHICLE_WHEEL_RADIUS,
  type Drift3DVehicleHandle,
} from "@/components/drift-3d/Drift3DVehicle";
import Drift3DProp from "@/components/drift-3d/Drift3DProp";
import Drift3DLandmark from "@/components/drift-3d/Drift3DLandmark";
import Drift3DAmbientEffects from "@/components/drift-3d/Drift3DEffects";
import Drift3DScatterField from "@/components/drift-3d/Drift3DScatterField";
import Drift3DZone from "@/components/drift-3d/Drift3DZone";
import { driftMapConfig } from "@/lib/driftMap";
import { getTrackBySlug } from "@/lib/tracks";
import {
  DRIFT_3D_CAMERA_BASE_DEPTH,
  DRIFT_3D_CAMERA_BASE_HEIGHT,
  DRIFT_3D_FLOOR_Y,
  DRIFT_3D_PLANE_DEPTH,
  DRIFT_3D_PLANE_WIDTH,
  getDrift3DDriveInput,
  getDrift3DHeadingVector,
  getDrift3DMovementBounds,
  getDrift3DVehicleStartPosition,
  resolveDrift3DDriveInput,
  type Drift3DPoint,
  type Drift3DPointerDriveState,
} from "@/lib/drift3d";
import {
  createDrift3DVehiclePhysicsState,
  DRIFT_3D_VEHICLE_GROUND_CLEARANCE,
  getDrift3DPropColliders,
  stepDrift3DVehiclePhysics,
  type Drift3DVehiclePhysicsState,
} from "@/lib/drift3dVehiclePhysics";
import {
  drift3dLandmarks,
  getDrift3DLandmarkColliders,
} from "@/lib/drift3dLandmarks";
import { getDrift3DScatterColliders } from "@/lib/drift3dScatter";
import {
  drift3dEras,
  drift3dEraById,
  drift3dThresholdNode,
  drift3dTrackNodeBySlug,
  getDrift3DNodeToneState,
  getDrift3DTrackNodesByEra,
  getDrift3DTopologyProximity,
  type Drift3DTopologyProximity,
} from "@/lib/drift3dTopology";
import {
  createDrift3DAtmosphereState,
  getDrift3DAtmosphereAt,
  getDrift3DGroundColorAt,
  smoothDrift3DAtmosphere,
} from "@/lib/drift3dAtmosphere";
import { getDrift3DTrackMotion } from "@/lib/drift3dCinematography";
import {
  getDrift3DGroundY,
  getDrift3DTerrainHeight,
  getDrift3DTerrainNormal,
} from "@/lib/drift3dTerrain";
import {
  readDrift3DAudioClockProgress,
  readDrift3DAudioClockTime,
  type Drift3DAudioClockRef,
} from "@/lib/drift3dAudioClock";

const DRIFT_3D_VEHICLE_MAX_LEAN = 0.24;
const DRIFT_3D_VEHICLE_MAX_PITCH = 0.5;
const DRIFT_3D_VEHICLE_MAX_TERRAIN_ROLL = 0.35;
const DRIFT_3D_AIRBORNE_PITCH = -0.12;
const DRIFT_3D_TERRAIN_TEXTURE_SIZE = 512;
const DRIFT_3D_TERRAIN_SEGMENTS_X = 224;
const DRIFT_3D_TERRAIN_SEGMENTS_Z = 144;

function terrainNoise(x: number, y: number) {
  const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;

  return value - Math.floor(value);
}

/**
 * Zone-blended ground albedo (color script palettes) with fine grain and a
 * chalk quarry patch around `chailk`. Generated once on the client; replaces
 * the flat single-color floor forbidden by the realism bible.
 */
function useDriftTerrainTexture() {
  return useMemo(() => {
    if (typeof document === "undefined") {
      return null;
    }

    const size = DRIFT_3D_TERRAIN_TEXTURE_SIZE;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");

    if (!context) {
      return null;
    }

    const image = context.createImageData(size, size);
    const chalkCenter = drift3dTrackNodeBySlug.chailk.position;

    for (let py = 0; py < size; py += 1) {
      const worldZ = (py / (size - 1) - 0.5) * DRIFT_3D_PLANE_DEPTH;

      for (let px = 0; px < size; px += 1) {
        const worldX = (px / (size - 1) - 0.5) * DRIFT_3D_PLANE_WIDTH;
        const ground = getDrift3DGroundColorAt(worldX, worldZ);
        let r = ground.r;
        let g = ground.g;
        let b = ground.b;

        const chalkDx = worldX - chalkCenter.x;
        const chalkDz = worldZ - chalkCenter.z;
        const chalkDistance = Math.sqrt(chalkDx * chalkDx + chalkDz * chalkDz);

        if (chalkDistance < 11) {
          const chalkMix = Math.min(1, (11 - chalkDistance) / 5);
          r += (0.9 - r) * chalkMix;
          g += (0.89 - g) * chalkMix;
          b += (0.85 - b) * chalkMix;
        }

        const fineGrain = (terrainNoise(px, py) - 0.5) * 0.07;
        const coarseGrain =
          (terrainNoise(Math.floor(px / 9), Math.floor(py / 9)) - 0.5) * 0.06;
        const grain = 1 + fineGrain + coarseGrain;

        const offset = (py * size + px) * 4;
        image.data[offset] = Math.max(0, Math.min(255, r * grain * 255));
        image.data[offset + 1] = Math.max(0, Math.min(255, g * grain * 255));
        image.data[offset + 2] = Math.max(0, Math.min(255, b * grain * 255));
        image.data[offset + 3] = 255;
      }
    }

    context.putImageData(image, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;

    return texture;
  }, []);
}

/**
 * Star field that follows the vehicle and only shows when the scripted sky
 * is dark (New Signal night, jazz alley, cave). Fog is disabled on the
 * material so the stars read as sky, not as fogged geometry.
 */
function NightSky({
  vehicleStateRef,
}: {
  vehicleStateRef: MutableRefObject<Drift3DVehiclePhysicsState>;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);
  const atmosphereRef = useRef(createDrift3DAtmosphereState());
  const starPositions = useMemo(() => {
    const count = 340;
    const positions = new Float32Array(count * 3);

    for (let index = 0; index < count; index += 1) {
      const angle = terrainNoise(index, 3) * Math.PI * 2;
      const horizontalRadius = 26 + terrainNoise(index, 7) * 62;
      positions[index * 3] = Math.cos(angle) * horizontalRadius;
      positions[index * 3 + 1] = 20 + terrainNoise(index, 11) * 55;
      positions[index * 3 + 2] = Math.sin(angle) * horizontalRadius;
    }

    return positions;
  }, []);

  useFrame(() => {
    const position = vehicleStateRef.current.position;
    const points = pointsRef.current;
    const material = materialRef.current;

    if (!points || !material) {
      return;
    }

    points.position.set(position.x, 0, position.z);

    const atmosphere = getDrift3DAtmosphereAt(position, atmosphereRef.current);
    const skyLuminance =
      0.2126 * atmosphere.skyColor.r +
      0.7152 * atmosphere.skyColor.g +
      0.0722 * atmosphere.skyColor.b;
    material.opacity = Math.min(1, Math.max(0, (0.16 - skyLuminance) * 10));
  });

  return (
    <points ref={pointsRef} renderOrder={-1}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[starPositions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        size={0.4}
        sizeAttenuation
        color="#e3e9f7"
        transparent
        opacity={0}
        fog={false}
        depthWrite={false}
      />
    </points>
  );
}

/**
 * Runtime color script: blends the per-zone lighting hours around the vehicle
 * and applies them to the single sun/moon, hemisphere fill, tinted
 * exponential fog, sky color and ACES exposure (eye adaptation included).
 */
function AtmosphereRig({
  vehicleStateRef,
}: {
  vehicleStateRef: MutableRefObject<Drift3DVehiclePhysicsState>;
}) {
  const sunRef = useRef<THREE.DirectionalLight>(null);
  const hemiRef = useRef<THREE.HemisphereLight>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const currentRef = useRef(createDrift3DAtmosphereState());
  const targetRef = useRef(createDrift3DAtmosphereState());

  useFrame(({ scene, gl }, delta) => {
    const position = vehicleStateRef.current.position;
    getDrift3DAtmosphereAt(position, targetRef.current);
    smoothDrift3DAtmosphere(currentRef.current, targetRef.current, delta);
    const state = currentRef.current;

    if (scene.fog instanceof THREE.FogExp2) {
      scene.fog.color.setRGB(
        state.fogColor.r,
        state.fogColor.g,
        state.fogColor.b,
        THREE.SRGBColorSpace
      );
      scene.fog.density = state.fogDensity;
    }

    if (scene.background instanceof THREE.Color) {
      scene.background.setRGB(
        state.skyColor.r,
        state.skyColor.g,
        state.skyColor.b,
        THREE.SRGBColorSpace
      );
    }

    gl.toneMappingExposure = state.exposure;

    const sun = sunRef.current;
    if (sun) {
      sun.color.setRGB(
        state.sunColor.r,
        state.sunColor.g,
        state.sunColor.b,
        THREE.SRGBColorSpace
      );
      sun.intensity = state.sunIntensity;
      sun.position.set(
        position.x + state.sunDirection.x * 42,
        Math.max(8, state.sunDirection.y * 42),
        position.z + state.sunDirection.z * 42
      );
      sun.target.position.set(position.x, 0, position.z);
      sun.target.updateMatrixWorld();
    }

    const hemi = hemiRef.current;
    if (hemi) {
      hemi.color.setRGB(
        state.hemiSkyColor.r,
        state.hemiSkyColor.g,
        state.hemiSkyColor.b,
        THREE.SRGBColorSpace
      );
      hemi.groundColor.setRGB(
        state.hemiGroundColor.r,
        state.hemiGroundColor.g,
        state.hemiGroundColor.b,
        THREE.SRGBColorSpace
      );
      hemi.intensity = state.hemiIntensity;
    }

    const ambient = ambientRef.current;
    if (ambient) {
      ambient.intensity = state.ambientIntensity;
    }

    if (process.env.NODE_ENV !== "production") {
      (
        window as unknown as { __drift3dRender?: object }
      ).__drift3dRender = {
        calls: gl.info.render.calls,
        triangles: gl.info.render.triangles,
      };
    }
  });

  return (
    <>
      <hemisphereLight ref={hemiRef} args={["#182030", "#0a0a0c", 0.25]} />
      <ambientLight ref={ambientRef} intensity={0.05} />
      <directionalLight
        ref={sunRef}
        castShadow
        position={[42, 14, 5]}
        intensity={0.5}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-28}
        shadow-camera-right={28}
        shadow-camera-top={28}
        shadow-camera-bottom={-28}
        shadow-camera-near={1}
        shadow-camera-far={130}
        shadow-bias={-0.0004}
        shadow-normalBias={0.05}
      />
    </>
  );
}

/**
 * Sol en relief : plan subdivisé déplacé par le heightfield analytique.
 * Le plan local (x, y) devient monde (x, -z) après la rotation -π/2, donc
 * chaque vertex reçoit h(x, -y) sur son axe local z (le futur monde y).
 */
function DriftTerrainMesh({ texture }: { texture: THREE.Texture | null }) {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(
      DRIFT_3D_PLANE_WIDTH,
      DRIFT_3D_PLANE_DEPTH,
      DRIFT_3D_TERRAIN_SEGMENTS_X,
      DRIFT_3D_TERRAIN_SEGMENTS_Z
    );
    const positions = geo.attributes.position;

    for (let index = 0; index < positions.count; index += 1) {
      const worldX = positions.getX(index);
      const worldZ = -positions.getY(index);
      positions.setZ(index, getDrift3DTerrainHeight(worldX, worldZ));
    }

    geo.computeVertexNormals();

    return geo;
  }, []);

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  return (
    <mesh
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, DRIFT_3D_FLOOR_Y, 0]}
      receiveShadow
      castShadow
    >
      <meshStandardMaterial
        map={texture ?? undefined}
        color={texture ? "#ffffff" : "#7d7a70"}
        roughness={0.96}
      />
    </mesh>
  );
}

function FollowCameraRig({
  vehicleStateRef,
  cameraZoomTargetRef,
  cinematicZoomRef,
}: {
  vehicleStateRef: MutableRefObject<Drift3DVehiclePhysicsState>;
  cameraZoomTargetRef: MutableRefObject<number>;
  cinematicZoomRef: MutableRefObject<number>;
}) {
  const camera = useThree((state) => state.camera);
  const currentZoomRef = useRef(1);

  useEffect(() => {
    const vehicleState = vehicleStateRef.current;
    currentZoomRef.current = cameraZoomTargetRef.current;
    const currentZoom = currentZoomRef.current * cinematicZoomRef.current;

    camera.position.set(
      vehicleState.position.x,
      vehicleState.position.y + DRIFT_3D_CAMERA_BASE_HEIGHT * currentZoom,
      vehicleState.position.z + DRIFT_3D_CAMERA_BASE_DEPTH * currentZoom
    );
    camera.lookAt(vehicleState.position.x, vehicleState.position.y, vehicleState.position.z);
    camera.updateProjectionMatrix();
  }, [camera, cameraZoomTargetRef, cinematicZoomRef, vehicleStateRef]);

  useFrame((_, delta) => {
    const vehicleState = vehicleStateRef.current;
    const zoomTarget = cameraZoomTargetRef.current;
    const zoomDelta = zoomTarget - currentZoomRef.current;

    if (Math.abs(zoomDelta) > 0.0005) {
      currentZoomRef.current += zoomDelta * Math.min(1, delta * 10);
    } else {
      currentZoomRef.current = zoomTarget;
    }

    const effectiveZoom = currentZoomRef.current * cinematicZoomRef.current;
    const desiredX = vehicleState.position.x;
    const desiredY =
      vehicleState.position.y + DRIFT_3D_CAMERA_BASE_HEIGHT * effectiveZoom;
    const desiredZ =
      vehicleState.position.z + DRIFT_3D_CAMERA_BASE_DEPTH * effectiveZoom;
    const positionLerp = Math.min(1, delta * 12);
    const nextX = camera.position.x + (desiredX - camera.position.x) * positionLerp;
    const nextY = camera.position.y + (desiredY - camera.position.y) * positionLerp;
    const nextZ = camera.position.z + (desiredZ - camera.position.z) * positionLerp;

    camera.position.set(nextX, nextY, nextZ);
    camera.lookAt(vehicleState.position.x, vehicleState.position.y, vehicleState.position.z);
  });

  return null;
}

const movementCodes = new Set([
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "KeyW",
  "KeyA",
  "KeyS",
  "KeyD",
  "KeyZ",
  "KeyQ",
]);

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  );
}

function isMovementCode(code: string) {
  return movementCodes.has(code);
}

function areDrift3DProximitySnapshotsEqual(
  a: Drift3DTopologyProximity | null,
  b: Drift3DTopologyProximity
) {
  const epsilon = 0.12;

  return (
    a?.nearestNode?.id === b.nearestNode?.id &&
    a?.activeNode?.id === b.activeNode?.id &&
    a?.nearestEra?.id === b.nearestEra?.id &&
    a?.activeEra?.id === b.activeEra?.id &&
    a?.isInside === b.isInside &&
    Math.abs((a?.distance ?? -1) - b.distance) < epsilon &&
    Math.abs((a?.progress ?? -1) - b.progress) < epsilon
  );
}

function KeyboardVehicleMotion({
  vehicleRef,
  vehicleStateRef,
  pointerDriveStateRef,
  startPosition,
  onProximityChange,
  cinematicZoomRef,
}: {
  vehicleRef: RefObject<Drift3DVehicleHandle | null>;
  vehicleStateRef: MutableRefObject<Drift3DVehiclePhysicsState>;
  pointerDriveStateRef: MutableRefObject<Drift3DPointerDriveState>;
  startPosition: Drift3DPoint;
  onProximityChange?: (proximity: Drift3DTopologyProximity) => void;
  cinematicZoomRef: MutableRefObject<number>;
}) {
  const pressedKeysRef = useRef<Set<string>>(new Set());
  const lastProximityRef = useRef<Drift3DTopologyProximity | null>(null);
  const motionSpeedScaleRef = useRef(1);
  const poseRef = useRef({ pitch: 0, roll: 0 });
  const movementBounds = useMemo(() => getDrift3DMovementBounds(), []);
  const colliders = useMemo(
    () => [
      ...getDrift3DPropColliders(),
      ...getDrift3DLandmarkColliders(),
      ...getDrift3DScatterColliders(),
    ],
    []
  );
  const maxMovementDelta = 1 / 30;

  useEffect(() => {
    vehicleStateRef.current = createDrift3DVehiclePhysicsState(
      startPosition,
      0
    );
    vehicleRef.current?.position.set(
      vehicleStateRef.current.position.x,
      vehicleStateRef.current.position.y,
      vehicleStateRef.current.position.z
    );
    vehicleRef.current?.rotation.setY(0);
    vehicleRef.current?.rotation.setLean(0);

    const initialProximity = getDrift3DTopologyProximity(
      vehicleStateRef.current.position
    );
    lastProximityRef.current = initialProximity;
    onProximityChange?.(initialProximity);
  }, [onProximityChange, startPosition, vehicleRef, vehicleStateRef]);

  useEffect(() => {
    function releaseAllKeys() {
      if (pressedKeysRef.current.size === 0) {
        return;
      }

      pressedKeysRef.current.clear();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (
        event.defaultPrevented ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.shiftKey ||
        isEditableTarget(event.target) ||
        isEditableTarget(document.activeElement) ||
        !isMovementCode(event.code)
      ) {
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();

      pressedKeysRef.current.add(event.code);
    }

    function handleKeyUp(event: KeyboardEvent) {
      if (!isMovementCode(event.code)) {
        return;
      }

      pressedKeysRef.current.delete(event.code);
    }

    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", releaseAllKeys);
    document.addEventListener("visibilitychange", releaseAllKeys);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", releaseAllKeys);
      document.removeEventListener("visibilitychange", releaseAllKeys);
    };
  }, []);

  useFrame((_, delta) => {
    const vehicle = vehicleRef.current;
    if (!vehicle) {
      return;
    }

    const keyboardInput = getDrift3DDriveInput(pressedKeysRef.current);
    const pointerInput = pointerDriveStateRef.current.input;
    const input = resolveDrift3DDriveInput(keyboardInput, pointerInput);
    const frameDelta = Math.min(delta, maxMovementDelta);
    const state = vehicleStateRef.current;

    if (process.env.NODE_ENV !== "production") {
      const teleportWindow = window as unknown as {
        __drift3dTeleport?: { x: number; z: number } | null;
      };
      const teleport = teleportWindow.__drift3dTeleport;

      if (teleport) {
        state.position.x = teleport.x;
        state.position.z = teleport.z;
        state.position.y =
          getDrift3DGroundY(teleport.x, teleport.z) +
          DRIFT_3D_VEHICLE_GROUND_CLEARANCE;
        state.velocityX = 0;
        state.velocityZ = 0;
        state.velocityY = 0;
        state.speed = 0;
        state.airborne = false;
        teleportWindow.__drift3dTeleport = null;

        const teleportProximity = getDrift3DTopologyProximity(state.position);
        lastProximityRef.current = teleportProximity;
        onProximityChange?.(teleportProximity);
      }
    }

    // grading caméra/vitesse par track (bible : l'émotion par le mouvement)
    const lastProximity = lastProximityRef.current;
    const activeTrackSlug =
      lastProximity?.isInside &&
      lastProximity.activeNode &&
      "trackSlug" in lastProximity.activeNode
        ? lastProximity.activeNode.trackSlug
        : null;
    const trackMotion = getDrift3DTrackMotion(activeTrackSlug);
    const motionEase = 1 - Math.exp(-delta * 2);
    motionSpeedScaleRef.current +=
      (trackMotion.speedScale - motionSpeedScaleRef.current) * motionEase;
    cinematicZoomRef.current +=
      (trackMotion.zoomScale - cinematicZoomRef.current) * motionEase;

    const { moved, slip, airborne } = stepDrift3DVehiclePhysics(
      state,
      input,
      frameDelta,
      movementBounds,
      colliders,
      motionSpeedScaleRef.current,
      getDrift3DGroundY
    );

    // assiette : pente du terrain au sol, léger piqué en vol
    let pitchTarget = DRIFT_3D_AIRBORNE_PITCH;
    let terrainRollTarget = 0;

    if (!airborne) {
      const normal = getDrift3DTerrainNormal(
        state.position.x,
        state.position.z
      );
      const headingVector = getDrift3DHeadingVector(state.heading);
      const slopeAlong =
        -(normal.x * headingVector.x + normal.z * headingVector.z) / normal.y;
      const slopeAcross =
        -(normal.x * headingVector.z - normal.z * headingVector.x) / normal.y;
      pitchTarget = Math.max(
        -DRIFT_3D_VEHICLE_MAX_PITCH,
        Math.min(DRIFT_3D_VEHICLE_MAX_PITCH, -Math.atan(slopeAlong))
      );
      terrainRollTarget = Math.max(
        -DRIFT_3D_VEHICLE_MAX_TERRAIN_ROLL,
        Math.min(DRIFT_3D_VEHICLE_MAX_TERRAIN_ROLL, Math.atan(slopeAcross))
      );
    }

    const poseEase = Math.min(1, delta * 8);
    poseRef.current.pitch += (pitchTarget - poseRef.current.pitch) * poseEase;
    poseRef.current.roll +=
      (terrainRollTarget - poseRef.current.roll) * poseEase;

    vehicle.position.set(state.position.x, state.position.y, state.position.z);
    vehicle.rotation.setY(state.heading);
    vehicle.rotation.setPitch(poseRef.current.pitch);
    vehicle.rotation.setLean(
      -slip * DRIFT_3D_VEHICLE_MAX_LEAN + poseRef.current.roll
    );
    vehicle.setWheelRoll(
      (state.speed * frameDelta) / DRIFT_3D_VEHICLE_WHEEL_RADIUS
    );

    if (process.env.NODE_ENV !== "production") {
      (
        window as unknown as { __drift3dDebug?: object }
      ).__drift3dDebug = {
        x: state.position.x,
        z: state.position.z,
        y: state.position.y,
        heading: state.heading,
        speed: state.speed,
        airborne: state.airborne,
      };
    }

    if (moved) {
      const nextProximity = getDrift3DTopologyProximity(state.position);

      if (
        !areDrift3DProximitySnapshotsEqual(
          lastProximityRef.current,
          nextProximity
        )
      ) {
        lastProximityRef.current = nextProximity;
        onProximityChange?.(nextProximity);
      }
    }
  });

  return null;
}

type Drift3DSceneProps = {
  proximity: Drift3DTopologyProximity | null;
  onProximityChange?: (proximity: Drift3DTopologyProximity) => void;
  pointerDriveStateRef: MutableRefObject<Drift3DPointerDriveState>;
  cameraZoomTargetRef: MutableRefObject<number>;
  vehicleStateRef: MutableRefObject<Drift3DVehiclePhysicsState>;
  audioClockRef: Drift3DAudioClockRef;
};

export default function Drift3DScene({
  proximity,
  onProximityChange,
  pointerDriveStateRef,
  cameraZoomTargetRef,
  vehicleStateRef,
  audioClockRef,
}: Drift3DSceneProps) {
  const vehicleRef = useRef<Drift3DVehicleHandle | null>(null);
  const vehicleStartPosition = useMemo(
    () => getDrift3DVehicleStartPosition(),
    []
  );
  const vehicleInitialPosition = useMemo(
    () =>
      [
        vehicleStartPosition.x,
        vehicleStartPosition.y,
        vehicleStartPosition.z,
      ] satisfies [number, number, number],
    [vehicleStartPosition]
  );

  const terrainTexture = useDriftTerrainTexture();
  const cinematicZoomRef = useRef(1);

  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      return;
    }

    Object.defineProperty(window, "__drift3dAudioClock", {
      configurable: true,
      get() {
        const snapshot = audioClockRef.current;
        const nowMs = performance.now();

        return {
          sourceKind: snapshot.source.kind,
          sourceSlug: snapshot.source.slug,
          playbackState: snapshot.playbackState,
          timeSeconds: readDrift3DAudioClockTime(snapshot, nowMs),
          durationSeconds: snapshot.durationSeconds,
          progress: readDrift3DAudioClockProgress(snapshot, nowMs),
          playbackRate: snapshot.playbackRate,
          loopEnabled: snapshot.loopEnabled,
          timelineRevision: snapshot.timelineRevision,
          lastReason: snapshot.lastReason,
        };
      },
    });

    return () => {
      delete (window as unknown as Record<string, unknown>).__drift3dAudioClock;
    };
  }, [audioClockRef]);

  return (
    <>
      <fogExp2 attach="fog" args={["#05060a", 0.05]} />
      <color attach="background" args={["#05060a"]} />
      <AtmosphereRig vehicleStateRef={vehicleStateRef} />
      <NightSky vehicleStateRef={vehicleStateRef} />

      <DriftTerrainMesh texture={terrainTexture} />

      <Drift3DZone
        node={drift3dThresholdNode}
        era={drift3dEraById["birth-yard"]}
        track={null}
        toneState={getDrift3DNodeToneState(drift3dThresholdNode, proximity)}
      />

      {drift3dEras.flatMap((era) =>
        getDrift3DTrackNodesByEra(era.id).map((node) => {
          const track = getTrackBySlug(node.trackSlug) ?? null;

          return (
            <Drift3DZone
              key={node.id}
              node={node}
              era={era}
              track={track}
              toneState={getDrift3DNodeToneState(node, proximity)}
            />
          );
        })
      )}

      {driftMapConfig.zones.flatMap((zone) =>
        (zone.props ?? []).map((prop) => (
          <Drift3DProp
            key={prop.id}
            prop={prop}
            mapWidth={driftMapConfig.width}
            mapHeight={driftMapConfig.height}
          />
        ))
      )}

      {drift3dLandmarks.map((landmark) => (
        <Drift3DLandmark
          key={landmark.id}
          landmark={landmark}
          vehicleStateRef={vehicleStateRef}
        />
      ))}

      <Drift3DScatterField />

      <Drift3DAmbientEffects vehicleStateRef={vehicleStateRef} />

      <Drift3DVehicle
        ref={vehicleRef}
        initialPosition={vehicleInitialPosition}
      />

      <KeyboardVehicleMotion
        vehicleRef={vehicleRef}
        vehicleStateRef={vehicleStateRef}
        pointerDriveStateRef={pointerDriveStateRef}
        startPosition={vehicleStartPosition}
        onProximityChange={onProximityChange}
        cinematicZoomRef={cinematicZoomRef}
      />

      <FollowCameraRig
        vehicleStateRef={vehicleStateRef}
        cameraZoomTargetRef={cameraZoomTargetRef}
        cinematicZoomRef={cinematicZoomRef}
      />
    </>
  );
}
