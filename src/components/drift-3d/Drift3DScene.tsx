"use client";

import { useEffect, useRef } from "react";
import type { ComponentProps, MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import OriginalDrift3DScene from "./Drift3DSceneBase";
import Drift3DRoadNetwork from "./Drift3DRoadNetwork";
import Drift3DWaterSurface from "./Drift3DWaterSurface";
import { getDrift3DTrackMotion } from "@/lib/drift3dCinematography";
import {
  createDrift3DInspectorSnapshot,
  DRIFT_3D_INSPECTOR_TELEPORTS,
  getDrift3DInspectorTeleportTarget,
  type Drift3DInspectorRenderMetrics,
  type Drift3DInspectorViewMode,
  type Drift3DWorldInspectorProbe,
} from "@/lib/drift3dInspector";
import { getDrift3DGroundY } from "@/lib/drift3dTerrain";
import {
  getDrift3DTopologyProximity,
  type Drift3DTopologyProximity,
} from "@/lib/drift3dTopology";
import {
  createDrift3DVehiclePhysicsState,
  type Drift3DVehiclePhysicsState,
} from "@/lib/drift3dVehiclePhysics";
import { getDrift3DChaseCameraRig } from "@/lib/drift3d";

const DRIFT_3D_CHASE_CAMERA_POSITION_RESPONSE = 7.5;
const DRIFT_3D_CHASE_CAMERA_TARGET_RESPONSE = 10;
const DRIFT_3D_INSPECTOR_TOP_DOWN_Y = 170;

type Drift3DSceneProps = ComponentProps<typeof OriginalDrift3DScene>;

type ChaseCameraRigProps = {
  vehicleStateRef: MutableRefObject<Drift3DVehiclePhysicsState>;
  cameraZoomTargetRef: MutableRefObject<number>;
  proximity: Drift3DTopologyProximity | null;
  inspectorViewModeRef: MutableRefObject<Drift3DInspectorViewMode>;
  inspectorTeleportRevisionRef: MutableRefObject<number>;
  inspectorMetricsRef: MutableRefObject<Drift3DInspectorRenderMetrics>;
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

function ChaseCameraRig({
  vehicleStateRef,
  cameraZoomTargetRef,
  proximity,
  inspectorViewModeRef,
  inspectorTeleportRevisionRef,
  inspectorMetricsRef,
}: ChaseCameraRigProps) {
  const camera = useThree((state) => state.camera);
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const cinematicZoomRef = useRef(1);
  const initializedRef = useRef(false);
  const previousViewModeRef = useRef<Drift3DInspectorViewMode>("chase");
  const previousTeleportRevisionRef = useRef(-1);
  const smoothedPositionRef = useRef(new THREE.Vector3());
  const smoothedTargetRef = useRef(new THREE.Vector3());
  const desiredPositionRef = useRef(new THREE.Vector3());
  const desiredTargetRef = useRef(new THREE.Vector3());

  function captureRenderMetrics() {
    inspectorMetricsRef.current = {
      drawCalls: gl.info.render.calls,
      triangles: gl.info.render.triangles,
      geometries: gl.info.memory.geometries,
      textures: gl.info.memory.textures,
    };
  }

  // Positive priority guarantees this camera is applied after the legacy
  // translation-follow callback, then renders the completed frame once.
  useFrame((_, delta) => {
    const viewMode = inspectorViewModeRef.current;
    const teleportRevision = inspectorTeleportRevisionRef.current;

    if (teleportRevision !== previousTeleportRevisionRef.current) {
      initializedRef.current = false;
      previousTeleportRevisionRef.current = teleportRevision;
    }

    if (viewMode === "top-down") {
      const vehicle = vehicleStateRef.current.position;
      camera.up.set(0, 0, -1);
      camera.position.set(
        vehicle.x,
        vehicle.y + DRIFT_3D_INSPECTOR_TOP_DOWN_Y,
        vehicle.z + 0.1
      );
      camera.lookAt(vehicle.x, vehicle.y, vehicle.z);
      gl.render(scene, camera);
      captureRenderMetrics();
      previousViewModeRef.current = viewMode;
      initializedRef.current = false;
      return;
    }

    if (previousViewModeRef.current === "top-down") {
      camera.up.set(0, 1, 0);
      initializedRef.current = false;
    }
    previousViewModeRef.current = viewMode;

    const activeTrackSlug = getActiveTrackSlug(proximity);
    const trackMotion = getDrift3DTrackMotion(activeTrackSlug);
    const motionEase = 1 - Math.exp(-delta * 2);

    cinematicZoomRef.current +=
      (trackMotion.zoomScale - cinematicZoomRef.current) * motionEase;

    const rig = getDrift3DChaseCameraRig(
      vehicleStateRef.current.position,
      vehicleStateRef.current.heading,
      cameraZoomTargetRef.current,
      {
        cinematicScale: cinematicZoomRef.current,
        groundY: getDrift3DGroundY,
      }
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

    if (!initializedRef.current) {
      smoothedPositionRef.current.copy(desiredPosition);
      smoothedTargetRef.current.copy(desiredTarget);
      initializedRef.current = true;
    } else {
      const positionEase =
        1 - Math.exp(-delta * DRIFT_3D_CHASE_CAMERA_POSITION_RESPONSE);
      const targetEase =
        1 - Math.exp(-delta * DRIFT_3D_CHASE_CAMERA_TARGET_RESPONSE);

      smoothedPositionRef.current.lerp(desiredPosition, positionEase);
      smoothedTargetRef.current.lerp(desiredTarget, targetEase);
    }

    const terrainFloor =
      getDrift3DGroundY(
        smoothedPositionRef.current.x,
        smoothedPositionRef.current.z
      ) + 1.05;

    if (smoothedPositionRef.current.y < terrainFloor) {
      smoothedPositionRef.current.y = terrainFloor;
    }

    camera.position.copy(smoothedPositionRef.current);
    camera.lookAt(smoothedTargetRef.current);
    gl.render(scene, camera);
    captureRenderMetrics();
  }, 1);

  return null;
}

export default function Drift3DScene(props: Drift3DSceneProps) {
  const inspectorViewModeRef = useRef<Drift3DInspectorViewMode>("chase");
  const inspectorTeleportRevisionRef = useRef(0);
  const inspectorMetricsRef = useRef<Drift3DInspectorRenderMetrics>({
    drawCalls: 0,
    triangles: 0,
    geometries: 0,
    textures: 0,
  });
  const proximityRef = useRef(props.proximity);

  useEffect(() => {
    proximityRef.current = props.proximity;
  }, [props.proximity]);

  useEffect(() => {
    const normalizedPath = window.location.pathname.replace(/\/+$/, "");

    if (!normalizedPath.endsWith("/drift-greybox-lab")) {
      return;
    }

    const probe: Drift3DWorldInspectorProbe = Object.freeze({
      targets: DRIFT_3D_INSPECTOR_TELEPORTS,
      snapshot: () =>
        createDrift3DInspectorSnapshot(
          props.vehicleStateRef.current,
          proximityRef.current,
          inspectorViewModeRef.current,
          inspectorMetricsRef.current
        ),
      teleport: (id: string) => {
        const target = getDrift3DInspectorTeleportTarget(id);

        if (!target) {
          return false;
        }

        const nextVehicleState = createDrift3DVehiclePhysicsState(
          { x: target.x, y: target.y, z: target.z },
          target.heading
        );
        const nextProximity = getDrift3DTopologyProximity(
          nextVehicleState.position
        );

        props.vehicleStateRef.current = nextVehicleState;
        proximityRef.current = nextProximity;
        props.onProximityChange?.(nextProximity);
        inspectorTeleportRevisionRef.current += 1;
        return true;
      },
      getViewMode: () => inspectorViewModeRef.current,
      setViewMode: (mode: Drift3DInspectorViewMode) => {
        if (mode === "chase" || mode === "top-down") {
          inspectorViewModeRef.current = mode;
        }
      },
    });

    Object.defineProperty(window, "__drift3dWorldInspector", {
      configurable: true,
      value: probe,
    });

    return () => {
      if (
        (window as unknown as Record<string, unknown>).__drift3dWorldInspector ===
        probe
      ) {
        delete (window as unknown as Record<string, unknown>)
          .__drift3dWorldInspector;
      }
    };
  }, [props.onProximityChange, props.vehicleStateRef]);

  return (
    <>
      <OriginalDrift3DScene {...props} />
      <Drift3DRoadNetwork />
      <Drift3DWaterSurface />
      <ChaseCameraRig
        vehicleStateRef={props.vehicleStateRef}
        cameraZoomTargetRef={props.cameraZoomTargetRef}
        proximity={props.proximity}
        inspectorViewModeRef={inspectorViewModeRef}
        inspectorTeleportRevisionRef={inspectorTeleportRevisionRef}
        inspectorMetricsRef={inspectorMetricsRef}
      />
    </>
  );
}
