"use client";

import { useEffect, useMemo, useRef } from "react";
import type { MutableRefObject, RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import Drift3DVehicle, {
  type Drift3DVehicleHandle,
} from "@/components/drift-3d/Drift3DVehicle";
import Drift3DProp from "@/components/drift-3d/Drift3DProp";
import Drift3DZone, {
  Drift3DEraRegion,
} from "@/components/drift-3d/Drift3DZone";
import { driftMapConfig } from "@/lib/driftMap";
import { getTrackBySlug } from "@/lib/tracks";
import {
  DRIFT_3D_PLANE_DEPTH,
  DRIFT_3D_PLANE_WIDTH,
  approachDrift3DAngle,
  clampDrift3DPoint,
  getDrift3DDriveInput,
  getDrift3DFollowCameraRig,
  getDrift3DVehicleStartPosition,
  getDrift3DYawFromVector,
  resolveDrift3DDriveInput,
  type Drift3DPoint,
  type Drift3DPointerDriveState,
} from "@/lib/drift3d";
import {
  drift3dEras,
  drift3dEraById,
  drift3dThresholdNode,
  getDrift3DEraToneState,
  getDrift3DNodeToneState,
  getDrift3DTrackNodesByEra,
  getDrift3DTopologyProximity,
  type Drift3DTopologyProximity,
} from "@/lib/drift3dTopology";

type Drift3DVehicleMotionState = {
  position: Drift3DPoint;
  yaw: number;
};

function FollowCameraRig({
  vehicleStateRef,
}: {
  vehicleStateRef: MutableRefObject<Drift3DVehicleMotionState>;
}) {
  const camera = useThree((state) => state.camera);
  const invalidate = useThree((state) => state.invalidate);
  const cameraPositionRef = useRef<Drift3DPoint | null>(null);

  useEffect(() => {
    const vehicleState = vehicleStateRef.current;
    const initialRig = getDrift3DFollowCameraRig(vehicleState.position);

    camera.position.set(
      initialRig.position.x,
      initialRig.position.y,
      initialRig.position.z
    );
    camera.lookAt(
      initialRig.target.x,
      initialRig.target.y,
      initialRig.target.z
    );
    camera.updateProjectionMatrix();
    cameraPositionRef.current = initialRig.position;
    invalidate();
  }, [camera, invalidate, vehicleStateRef]);

  useFrame(() => {
    const vehicleState = vehicleStateRef.current;
    const desiredRig = getDrift3DFollowCameraRig(vehicleState.position);
    const nextPosition = desiredRig.position;
    const nextTarget = desiredRig.target;
    const positionChanged =
      !cameraPositionRef.current ||
      Math.abs(cameraPositionRef.current.x - nextPosition.x) > 0.001 ||
      Math.abs(cameraPositionRef.current.y - nextPosition.y) > 0.001 ||
      Math.abs(cameraPositionRef.current.z - nextPosition.z) > 0.001;

    camera.lookAt(nextTarget.x, nextTarget.y, nextTarget.z);

    if (!positionChanged) {
      return;
    }

    camera.position.set(nextPosition.x, nextPosition.y, nextPosition.z);
    cameraPositionRef.current = nextPosition;
    invalidate();
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
  return (
    a?.nearestNode?.id === b.nearestNode?.id &&
    a?.activeNode?.id === b.activeNode?.id &&
    a?.nearestEra?.id === b.nearestEra?.id &&
    a?.activeEra?.id === b.activeEra?.id &&
    a?.isInside === b.isInside &&
    Math.abs((a?.distance ?? -1) - b.distance) < 0.02 &&
    Math.abs((a?.progress ?? -1) - b.progress) < 0.02
  );
}

function KeyboardVehicleMotion({
  vehicleRef,
  vehicleStateRef,
  pointerDriveStateRef,
  startPosition,
  onProximityChange,
}: {
  vehicleRef: RefObject<Drift3DVehicleHandle | null>;
  vehicleStateRef: MutableRefObject<Drift3DVehicleMotionState>;
  pointerDriveStateRef: MutableRefObject<Drift3DPointerDriveState>;
  startPosition: Drift3DPoint;
  onProximityChange?: (proximity: Drift3DTopologyProximity) => void;
}) {
  const invalidate = useThree((state) => state.invalidate);
  const yawRef = useRef(0);
  const pressedKeysRef = useRef<Set<string>>(new Set());
  const lastProximityRef = useRef<Drift3DTopologyProximity | null>(null);
  const maxMovementDelta = 1 / 30;

  useEffect(() => {
    yawRef.current = 0;
    vehicleStateRef.current.position = { ...startPosition };
    vehicleStateRef.current.yaw = 0;
    vehicleRef.current?.position.set(
      startPosition.x,
      startPosition.y,
      startPosition.z
    );
    vehicleRef.current?.rotation.setY(0);

    const initialProximity = getDrift3DTopologyProximity(startPosition);
    lastProximityRef.current = initialProximity;
    onProximityChange?.(initialProximity);
  }, [onProximityChange, startPosition, vehicleRef, vehicleStateRef]);

  useEffect(() => {
    function releaseAllKeys() {
      if (pressedKeysRef.current.size === 0) {
        return;
      }

      pressedKeysRef.current.clear();
      invalidate();
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

      const before = pressedKeysRef.current.size;
      pressedKeysRef.current.add(event.code);

      if (pressedKeysRef.current.size !== before) {
        invalidate();
      }
    }

    function handleKeyUp(event: KeyboardEvent) {
      if (!isMovementCode(event.code)) {
        return;
      }

      const before = pressedKeysRef.current.size;
      pressedKeysRef.current.delete(event.code);

      if (pressedKeysRef.current.size !== before) {
        invalidate();
      }
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
  }, [invalidate]);

  useFrame((_, delta) => {
    const vehicle = vehicleRef.current;
    if (!vehicle) {
      return;
    }

    const keyboardInput = getDrift3DDriveInput(pressedKeysRef.current);
    const pointerInput = pointerDriveStateRef.current.input;
    const input = resolveDrift3DDriveInput(keyboardInput, pointerInput);
    if (!input.active) {
      return;
    }

    const frameDelta = Math.min(delta, maxMovementDelta);
    const targetYaw = getDrift3DYawFromVector(input);
    const nextYaw = approachDrift3DAngle(
      yawRef.current,
      targetYaw,
      Math.min(1, frameDelta * 12)
    );
    const yawChanged = Math.abs(nextYaw - yawRef.current) > 0.0005;

    yawRef.current = nextYaw;
    vehicleStateRef.current.yaw = nextYaw;

    if (yawChanged) {
      vehicle.rotation.setY(nextYaw);
    }

    const movementSpeed = 5.4;
    const currentPosition = vehicleStateRef.current.position;
    const next = clampDrift3DPoint({
      x: currentPosition.x + input.x * movementSpeed * frameDelta,
      y: currentPosition.y,
      z: currentPosition.z + input.z * movementSpeed * frameDelta,
    });
    const moved =
      next.x !== currentPosition.x || next.z !== currentPosition.z;

    if (moved) {
      vehicleStateRef.current.position = next;
      vehicle.position.set(next.x, next.y, next.z);
      const nextProximity = getDrift3DTopologyProximity(next);

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

    if (moved || yawChanged) {
      invalidate();
    }
  });

  return null;
}

type Drift3DSceneProps = {
  proximity: Drift3DTopologyProximity | null;
  onProximityChange?: (proximity: Drift3DTopologyProximity) => void;
  pointerDriveStateRef: MutableRefObject<Drift3DPointerDriveState>;
};

export default function Drift3DScene({
  proximity,
  onProximityChange,
  pointerDriveStateRef,
}: Drift3DSceneProps) {
  const vehicleStateRef = useRef<Drift3DVehicleMotionState>({
    position: getDrift3DVehicleStartPosition(),
    yaw: 0,
  });
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

  return (
    <>
      <fog attach="fog" args={["#f4efe5", 12.5, 33.5]} />
      <color attach="background" args={["#f5f0e7"]} />
      <hemisphereLight args={["#fffdf8", "#d6cbbd", 1.35]} />
      <directionalLight position={[5, 8, 5]} intensity={1.18} />
      <ambientLight intensity={0.3} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]}>
        <planeGeometry args={[DRIFT_3D_PLANE_WIDTH, DRIFT_3D_PLANE_DEPTH]} />
        <meshStandardMaterial color="#ece7dc" roughness={0.98} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-52, -0.05, 18]}>
        <ringGeometry args={[10, 10.9, 64]} />
        <meshStandardMaterial color="#d8c6b0" roughness={0.9} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-10, -0.05, -28]}>
        <ringGeometry args={[13, 13.9, 72]} />
        <meshStandardMaterial color="#c8d0d2" roughness={0.9} />
      </mesh>

      {drift3dEras.map((era) => (
        <Drift3DEraRegion
          key={era.id}
          era={era}
          toneState={getDrift3DEraToneState(era, proximity)}
        />
      ))}

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
      />

      <FollowCameraRig vehicleStateRef={vehicleStateRef} />
    </>
  );
}
