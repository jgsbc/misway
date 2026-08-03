"use client";

import { useEffect, useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import Drift3DVehicle, {
  DRIFT_3D_VEHICLE_WHEEL_RADIUS,
  type Drift3DVehicleHandle,
} from "@/components/drift-3d/Drift3DVehicle";
import Drift3DScatterField from "@/components/drift-3d/Drift3DScatterField";
import Drift3DEvidenceProbe from "@/components/drift-3d/Drift3DEvidenceProbe";
import type { Drift3DEvidenceRuntimeRef } from "@/lib/drift3dEvidence";
import {
  DRIFT_3D_CAMERA_BASE_DEPTH,
  DRIFT_3D_CAMERA_BASE_HEIGHT,
  getDrift3DDriveInput,
  getDrift3DHeadingVector,
  resolveDrift3DDriveInput,
  type Drift3DMovementBounds,
  type Drift3DPoint,
  type Drift3DPointerDriveState,
} from "@/lib/drift3d";
import {
  createDrift3DVehiclePhysicsState,
  DRIFT_3D_VEHICLE_GROUND_CLEARANCE,
  stepDrift3DVehiclePhysics,
  type Drift3DVehiclePhysicsState,
} from "@/lib/drift3dVehiclePhysics";
import {
  getDrift3DGroundY,
  getDrift3DTerrainHeight,
  getDrift3DTerrainNormal,
} from "@/lib/drift3dTerrain";
import {
  createDrift3DAtmosphereState,
  getDrift3DAtmosphereAt,
  smoothDrift3DAtmosphere,
} from "@/lib/drift3dAtmosphere";
import { getDrift3DScatterColliders } from "@/lib/drift3dScatter";
import {
  checkDrift3DMacroWorldBoundary,
  getDrift3DMacroWorldRouteProjection,
} from "@/lib/drift3dMacroWorldRoute";
import { getDrift3DMacroWorldConfig } from "@/lib/drift3dMacroWorldConfig";
import type {
  Drift3DMacroWorldGreyboxStatus,
} from "@/lib/drift3dMacroWorldGreyboxHarness";
import type { Drift3DQualityTier } from "@/lib/drift3dQuality";
import EntryGreybox from "@/components/drift-3d/greybox/EntryGreybox";
import BirthYardGreybox from "@/components/drift-3d/greybox/BirthYardGreybox";
import OlderShadowsGreybox from "@/components/drift-3d/greybox/OlderShadowsGreybox";
import VegetativeFieldGreybox from "@/components/drift-3d/greybox/VegetativeFieldGreybox";
import NewSignalGreybox from "@/components/drift-3d/greybox/NewSignalGreybox";

/**
 * DRIFT-IV-PRE-40 — one continuous scene for the five-macro-world greybox.
 * Reuses the exact production terrain/atmosphere/vehicle-physics/camera pure
 * functions (see drift3dMacroWorldConfig.ts's own module header for why) —
 * this file re-derives the small mesh/rig glue Drift3DScene.tsx itself keeps
 * as unexported local functions, it does not fork that component or mount
 * any production zone/HUD/audio/track machinery.
 */

// Movement bounds sized to comfortably contain the whole 5-world route plus
// each world's own effective (not nominal-era-radius) dressing extent.
const MOVEMENT_BOUNDS: Drift3DMovementBounds = {
  minX: -125,
  maxX: 110,
  minZ: -90,
  maxZ: 45,
};
const TERRAIN_PLANE_WIDTH = 280;
const TERRAIN_PLANE_DEPTH = 200;
const TERRAIN_SEGMENTS_X = 112;
const TERRAIN_SEGMENTS_Z = 80;
const DRIFT_3D_FLOOR_Y = -0.08;

const VEHICLE_MAX_PITCH = 0.5;
const VEHICLE_MAX_TERRAIN_ROLL = 0.35;
const AIRBORNE_PITCH = -0.12;

function DriftGreyboxTerrainMesh() {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(
      TERRAIN_PLANE_WIDTH,
      TERRAIN_PLANE_DEPTH,
      TERRAIN_SEGMENTS_X,
      TERRAIN_SEGMENTS_Z
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
      <meshStandardMaterial color="#847c6c" roughness={0.96} />
    </mesh>
  );
}

function DriftGreyboxAtmosphereRig({
  vehicleStateRef,
  reducedMotion,
}: {
  vehicleStateRef: MutableRefObject<Drift3DVehiclePhysicsState>;
  reducedMotion: boolean;
}) {
  const sunRef = useRef<THREE.DirectionalLight>(null);
  const hemiRef = useRef<THREE.HemisphereLight>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const currentRef = useRef(createDrift3DAtmosphereState());
  const targetRef = useRef(createDrift3DAtmosphereState());

  useFrame(({ scene, gl }, delta) => {
    const position = vehicleStateRef.current.position;
    getDrift3DAtmosphereAt(position, targetRef.current);
    smoothDrift3DAtmosphere(
      currentRef.current,
      targetRef.current,
      reducedMotion ? 0 : delta
    );
    const state = currentRef.current;

    if (scene.fog instanceof THREE.FogExp2) {
      scene.fog.color.setRGB(state.fogColor.r, state.fogColor.g, state.fogColor.b);
      scene.fog.density = state.fogDensity;
    }

    if (scene.background instanceof THREE.Color) {
      scene.background.setRGB(state.skyColor.r, state.skyColor.g, state.skyColor.b);
    }

    gl.toneMappingExposure = state.exposure;

    if (sunRef.current) {
      sunRef.current.color.setRGB(
        state.sunColor.r,
        state.sunColor.g,
        state.sunColor.b
      );
      sunRef.current.intensity = state.sunIntensity;
      sunRef.current.position.set(
        position.x + state.sunDirection.x * 42,
        Math.max(8, state.sunDirection.y * 42),
        position.z + state.sunDirection.z * 42
      );
      sunRef.current.target.position.set(position.x, 0, position.z);
      sunRef.current.target.updateMatrixWorld();
    }

    if (hemiRef.current) {
      hemiRef.current.color.setRGB(
        state.hemiSkyColor.r,
        state.hemiSkyColor.g,
        state.hemiSkyColor.b
      );
      hemiRef.current.groundColor.setRGB(
        state.hemiGroundColor.r,
        state.hemiGroundColor.g,
        state.hemiGroundColor.b
      );
      hemiRef.current.intensity = state.hemiIntensity;
    }

    if (ambientRef.current) {
      ambientRef.current.intensity = state.ambientIntensity;
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
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-camera-near={1}
        shadow-camera-far={140}
      />
    </>
  );
}

function DriftGreyboxCameraRig({
  vehicleStateRef,
}: {
  vehicleStateRef: MutableRefObject<Drift3DVehiclePhysicsState>;
}) {
  const camera = useThree((state) => state.camera);

  useFrame((_, delta) => {
    const vehicleState = vehicleStateRef.current;
    const desiredX = vehicleState.position.x;
    const desiredY = vehicleState.position.y + DRIFT_3D_CAMERA_BASE_HEIGHT;
    const desiredZ = vehicleState.position.z + DRIFT_3D_CAMERA_BASE_DEPTH;
    const lerpAmount = Math.min(1, delta * 12);

    camera.position.set(
      camera.position.x + (desiredX - camera.position.x) * lerpAmount,
      camera.position.y + (desiredY - camera.position.y) * lerpAmount,
      camera.position.z + (desiredZ - camera.position.z) * lerpAmount
    );
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

type DriftGreyboxVehicleMotionProps = {
  vehicleRef: React.RefObject<Drift3DVehicleHandle | null>;
  vehicleStateRef: MutableRefObject<Drift3DVehiclePhysicsState>;
  pointerDriveStateRef: MutableRefObject<Drift3DPointerDriveState>;
  startPosition: Drift3DPoint;
  qualityTier: Drift3DQualityTier;
  reducedMotion: boolean;
  statusRef: MutableRefObject<Drift3DMacroWorldGreyboxStatus>;
  teleportRequestRef: MutableRefObject<{ x: number; z: number } | null>;
  resetRequestRef: MutableRefObject<boolean>;
};

function DriftGreyboxVehicleMotion({
  vehicleRef,
  vehicleStateRef,
  pointerDriveStateRef,
  startPosition,
  reducedMotion,
  statusRef,
  teleportRequestRef,
  resetRequestRef,
}: DriftGreyboxVehicleMotionProps) {
  const pressedKeysRef = useRef<Set<string>>(new Set());
  const poseRef = useRef({ pitch: 0, roll: 0 });
  const colliders = useMemo(() => getDrift3DScatterColliders(), []);

  useEffect(() => {
    vehicleStateRef.current = createDrift3DVehiclePhysicsState(startPosition, 0);
    vehicleRef.current?.position.set(
      vehicleStateRef.current.position.x,
      vehicleStateRef.current.position.y,
      vehicleStateRef.current.position.z
    );
    vehicleRef.current?.rotation.setY(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startPosition]);

  useEffect(() => {
    const pressedKeys = pressedKeysRef.current;

    function releaseAllKeys() {
      pressedKeysRef.current.clear();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (
        event.defaultPrevented ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        isEditableTarget(event.target) ||
        !movementCodes.has(event.code)
      ) {
        return;
      }

      event.preventDefault();
      pressedKeysRef.current.add(event.code);
    }

    function handleKeyUp(event: KeyboardEvent) {
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
      pressedKeys.clear();
    };
  }, []);

  useFrame((_, delta) => {
    const vehicle = vehicleRef.current;
    if (!vehicle) {
      return;
    }

    const state = vehicleStateRef.current;

    if (resetRequestRef.current) {
      resetRequestRef.current = false;
      Object.assign(state, createDrift3DVehiclePhysicsState(startPosition, 0));
      statusRef.current = {
        ...statusRef.current,
        resetCount: statusRef.current.resetCount + 1,
      };
    }

    if (teleportRequestRef.current) {
      const target = teleportRequestRef.current;
      teleportRequestRef.current = null;
      state.position.x = target.x;
      state.position.z = target.z;
      state.position.y =
        getDrift3DGroundY(target.x, target.z) + DRIFT_3D_VEHICLE_GROUND_CLEARANCE;
      state.velocityX = 0;
      state.velocityZ = 0;
      state.velocityY = 0;
      state.speed = 0;
      state.airborne = false;
    }

    const keyboardInput = reducedMotion
      ? { x: 0, z: 0, active: false }
      : getDrift3DDriveInput(pressedKeysRef.current);
    const pointerInput = reducedMotion
      ? { x: 0, z: 0, active: false }
      : pointerDriveStateRef.current.input;
    const input = resolveDrift3DDriveInput(keyboardInput, pointerInput);
    const frameDelta = Math.min(delta, 1 / 30);

    const { airborne } = stepDrift3DVehiclePhysics(
      state,
      input,
      frameDelta,
      MOVEMENT_BOUNDS,
      colliders,
      1,
      getDrift3DGroundY
    );

    let pitchTarget = AIRBORNE_PITCH;
    let terrainRollTarget = 0;

    if (!airborne) {
      const normal = getDrift3DTerrainNormal(state.position.x, state.position.z);
      const headingVector = getDrift3DHeadingVector(state.heading);
      const slopeAlong =
        -(normal.x * headingVector.x + normal.z * headingVector.z) / normal.y;
      const slopeAcross =
        -(normal.x * headingVector.z - normal.z * headingVector.x) / normal.y;
      pitchTarget = Math.max(
        -VEHICLE_MAX_PITCH,
        Math.min(VEHICLE_MAX_PITCH, -Math.atan(slopeAlong))
      );
      terrainRollTarget = Math.max(
        -VEHICLE_MAX_TERRAIN_ROLL,
        Math.min(VEHICLE_MAX_TERRAIN_ROLL, Math.atan(slopeAcross))
      );
    }

    const poseEase = Math.min(1, delta * 8);
    poseRef.current.pitch += (pitchTarget - poseRef.current.pitch) * poseEase;
    poseRef.current.roll += (terrainRollTarget - poseRef.current.roll) * poseEase;

    vehicle.position.set(state.position.x, state.position.y, state.position.z);
    vehicle.rotation.setY(state.heading);
    vehicle.rotation.setPitch(poseRef.current.pitch);
    vehicle.rotation.setLean(poseRef.current.roll);
    vehicle.setWheelRoll(
      reducedMotion
        ? 0
        : (state.speed * frameDelta) / DRIFT_3D_VEHICLE_WHEEL_RADIUS
    );

    const boundary = checkDrift3DMacroWorldBoundary(state.position);
    const projection = getDrift3DMacroWorldRouteProjection(state.position);
    const currentTransition = boundary.withinDressingRadius
      ? null
      : `${projection.fromWorld}-to-${projection.toWorld}`;
    const enteredNewWorld =
      boundary.withinDressingRadius &&
      boundary.nearestWorld !== statusRef.current.activeMacroWorld;

    statusRef.current = {
      ...statusRef.current,
      activeMacroWorld: boundary.nearestWorld,
      currentTransition,
      transitionCount:
        statusRef.current.transitionCount + (enteredNewWorld ? 1 : 0),
      routeProgress: projection.routeProgress,
      playerPosition: { x: state.position.x, z: state.position.z },
      playerSpeed: state.speed,
      nearestResetPoint: boundary.nearestWorld,
      worldBoundaryViolationCount:
        statusRef.current.worldBoundaryViolationCount +
        (boundary.violatesBoundary ? 1 : 0),
    };
  });

  return null;
}

export type DriftMacroWorldSceneProps = {
  vehicleStateRef: MutableRefObject<Drift3DVehiclePhysicsState>;
  pointerDriveStateRef: MutableRefObject<Drift3DPointerDriveState>;
  teleportRequestRef: MutableRefObject<{ x: number; z: number } | null>;
  resetRequestRef: MutableRefObject<boolean>;
  qualityTier: Drift3DQualityTier;
  reducedMotion: boolean;
  evidenceRuntimeRef: Drift3DEvidenceRuntimeRef;
  statusRef: MutableRefObject<Drift3DMacroWorldGreyboxStatus>;
};

export default function DriftMacroWorldScene({
  vehicleStateRef,
  pointerDriveStateRef,
  teleportRequestRef,
  resetRequestRef,
  qualityTier,
  reducedMotion,
  evidenceRuntimeRef,
  statusRef,
}: DriftMacroWorldSceneProps) {
  const vehicleRef = useRef<Drift3DVehicleHandle | null>(null);
  const entryOrigin = getDrift3DMacroWorldConfig("entry").localOrigin;
  const entrySpawnOffset = getDrift3DMacroWorldConfig("entry").spawnOffset;
  const startPosition = useMemo<Drift3DPoint>(() => {
    const x = entryOrigin.x + entrySpawnOffset.x;
    const z = entryOrigin.z + entrySpawnOffset.z;

    return {
      x,
      y: getDrift3DGroundY(x, z) + DRIFT_3D_VEHICLE_GROUND_CLEARANCE,
      z,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const vehicleInitialPosition = useMemo(
    () => [startPosition.x, startPosition.y, startPosition.z] as [number, number, number],
    [startPosition]
  );

  return (
    <>
      <fogExp2 attach="fog" args={["#05060a", 0.05]} />
      <color attach="background" args={["#05060a"]} />
      <DriftGreyboxAtmosphereRig
        vehicleStateRef={vehicleStateRef}
        reducedMotion={reducedMotion}
      />

      <DriftGreyboxTerrainMesh />

      <EntryGreybox qualityTier={qualityTier} statusRef={statusRef} />
      <BirthYardGreybox
        qualityTier={qualityTier}
        reducedMotion={reducedMotion}
        statusRef={statusRef}
      />
      <OlderShadowsGreybox qualityTier={qualityTier} statusRef={statusRef} />
      <VegetativeFieldGreybox
        qualityTier={qualityTier}
        reducedMotion={reducedMotion}
        statusRef={statusRef}
      />
      <NewSignalGreybox
        qualityTier={qualityTier}
        reducedMotion={reducedMotion}
        statusRef={statusRef}
      />

      <Drift3DScatterField />

      <Drift3DVehicle ref={vehicleRef} initialPosition={vehicleInitialPosition} />

      <DriftGreyboxVehicleMotion
        vehicleRef={vehicleRef}
        vehicleStateRef={vehicleStateRef}
        pointerDriveStateRef={pointerDriveStateRef}
        startPosition={startPosition}
        qualityTier={qualityTier}
        reducedMotion={reducedMotion}
        statusRef={statusRef}
        teleportRequestRef={teleportRequestRef}
        resetRequestRef={resetRequestRef}
      />

      <DriftGreyboxCameraRig vehicleStateRef={vehicleStateRef} />

      {process.env.NODE_ENV !== "production" ? (
        <Drift3DEvidenceProbe runtimeRef={evidenceRuntimeRef} />
      ) : null}
    </>
  );
}
