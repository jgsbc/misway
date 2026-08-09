"use client";

import { useRef } from "react";
import type { ComponentProps, MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import OriginalDrift3DScene from "./Drift3DSceneBase";
import DriftSceneReadySignal from "@/components/drift-3d/DriftSceneReadySignal";
import { getDrift3DTrackMotion } from "@/lib/drift3dCinematography";
import { getDrift3DGroundY } from "@/lib/drift3dTerrain";
import type { Drift3DTopologyProximity } from "@/lib/drift3dTopology";
import type { Drift3DVehiclePhysicsState } from "@/lib/drift3dVehiclePhysics";
import { getDrift3DChaseCameraRig } from "@/lib/drift3d";

const DRIFT_3D_CHASE_CAMERA_POSITION_RESPONSE = 7.5;
const DRIFT_3D_CHASE_CAMERA_TARGET_RESPONSE = 10;

type Drift3DSceneProps = ComponentProps<typeof OriginalDrift3DScene>;

type ChaseCameraRigProps = {
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

function ChaseCameraRig({
  vehicleStateRef,
  cameraZoomTargetRef,
  proximity,
}: ChaseCameraRigProps) {
  const camera = useThree((state) => state.camera);
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const cinematicZoomRef = useRef(1);
  const initializedRef = useRef(false);
  const smoothedPositionRef = useRef(new THREE.Vector3());
  const smoothedTargetRef = useRef(new THREE.Vector3());
  const desiredPositionRef = useRef(new THREE.Vector3());
  const desiredTargetRef = useRef(new THREE.Vector3());

  // Positive priority guarantees this camera is applied after the legacy
  // translation-follow callback, then renders the completed frame once.
  useFrame((_, delta) => {
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
  }, 1);

  return null;
}

export default function Drift3DScene(props: Drift3DSceneProps) {
  return (
    <>
      <OriginalDrift3DScene {...props} />
      <ChaseCameraRig
        vehicleStateRef={props.vehicleStateRef}
        cameraZoomTargetRef={props.cameraZoomTargetRef}
        proximity={props.proximity}
      />
      <DriftSceneReadySignal stableFrames={4} />
    </>
  );
}
