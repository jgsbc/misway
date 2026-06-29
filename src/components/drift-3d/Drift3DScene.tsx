"use client";

import { useEffect, useMemo, useRef } from "react";
import type { MutableRefObject, RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import Drift3DVehicle, {
  type Drift3DVehicleHandle,
} from "@/components/drift-3d/Drift3DVehicle";
import Drift3DProp from "@/components/drift-3d/Drift3DProp";
import Drift3DZone from "@/components/drift-3d/Drift3DZone";
import { driftMapConfig } from "@/lib/driftMap";
import {
  approachDrift3DAngle,
  approachDrift3DPoint,
  clampDrift3DPoint,
  getDrift3DKeyboardVector,
  getDrift3DFollowCameraRig,
  getDrift3DYawFromVector,
  getDrift3DZoneProximity,
  getDrift3DZoneToneState,
  getDrift3DVehicleStartPosition,
  type Drift3DPoint,
  type Drift3DZoneProximity,
} from "@/lib/drift3d";

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
  const cameraTargetRef = useRef<Drift3DPoint | null>(null);

  useEffect(() => {
    const vehicleState = vehicleStateRef.current;
    if (!vehicleState) {
      return;
    }

    const initialRig = getDrift3DFollowCameraRig(
      vehicleState.position,
      vehicleState.yaw
    );

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
    cameraTargetRef.current = initialRig.target;
    invalidate();
  }, [camera, invalidate, vehicleStateRef]);

  useFrame(() => {
    const vehicleState = vehicleStateRef.current;
    if (!vehicleState) {
      return;
    }

    const desiredRig = getDrift3DFollowCameraRig(
      vehicleState.position,
      vehicleState.yaw
    );
    const nextPosition = approachDrift3DPoint(
      cameraPositionRef.current ?? desiredRig.position,
      desiredRig.position,
      0.12
    );
    const nextTarget = approachDrift3DPoint(
      cameraTargetRef.current ?? desiredRig.target,
      desiredRig.target,
      0.14
    );
    const positionChanged =
      !cameraPositionRef.current ||
      Math.abs(cameraPositionRef.current.x - nextPosition.x) > 0.001 ||
      Math.abs(cameraPositionRef.current.y - nextPosition.y) > 0.001 ||
      Math.abs(cameraPositionRef.current.z - nextPosition.z) > 0.001;
    const targetChanged =
      !cameraTargetRef.current ||
      Math.abs(cameraTargetRef.current.x - nextTarget.x) > 0.001 ||
      Math.abs(cameraTargetRef.current.y - nextTarget.y) > 0.001 ||
      Math.abs(cameraTargetRef.current.z - nextTarget.z) > 0.001;

    if (!positionChanged && !targetChanged) {
      return;
    }

    camera.position.set(nextPosition.x, nextPosition.y, nextPosition.z);
    camera.lookAt(nextTarget.x, nextTarget.y, nextTarget.z);
    cameraPositionRef.current = nextPosition;
    cameraTargetRef.current = nextTarget;
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
  a: Drift3DZoneProximity | null,
  b: Drift3DZoneProximity
) {
  return (
    a?.nearestZone?.id === b.nearestZone?.id &&
    a?.activeZone?.id === b.activeZone?.id &&
    a?.isInside === b.isInside &&
    Math.abs((a?.distance ?? -1) - b.distance) < 0.02 &&
    Math.abs((a?.progress ?? -1) - b.progress) < 0.02
  );
}

function KeyboardVehicleMotion({
  vehicleRef,
  vehicleStateRef,
  startPosition,
  bounds,
  zones,
  onProximityChange,
}: {
  vehicleRef: RefObject<Drift3DVehicleHandle | null>;
  vehicleStateRef: MutableRefObject<Drift3DVehicleMotionState>;
  startPosition: { x: number; y: number; z: number };
  bounds: { width: number; height: number };
  zones: typeof driftMapConfig.zones;
  onProximityChange?: (proximity: Drift3DZoneProximity) => void;
}) {
  const invalidate = useThree((state) => state.invalidate);
  const positionRef = useRef(startPosition);
  const yawRef = useRef(0);
  const pressedKeysRef = useRef<Set<string>>(new Set());
  const lastProximityRef = useRef<Drift3DZoneProximity | null>(null);

  useEffect(() => {
    positionRef.current = { ...startPosition };
    yawRef.current = 0;
    vehicleStateRef.current.position = { ...startPosition };
    vehicleStateRef.current.yaw = 0;
    vehicleRef.current?.position.set(
      startPosition.x,
      startPosition.y,
      startPosition.z
    );
    vehicleRef.current?.rotation.setY(0);

    const initialProximity = getDrift3DZoneProximity(
      startPosition,
      zones,
      bounds
    );
    lastProximityRef.current = initialProximity;
    onProximityChange?.(initialProximity);
  }, [
    bounds,
    onProximityChange,
    startPosition,
    vehicleRef,
    vehicleStateRef,
    zones,
  ]);

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

    const input = getDrift3DKeyboardVector(pressedKeysRef.current);
    if (!input.active) {
      return;
    }

    const targetYaw = getDrift3DYawFromVector(input);
    const nextYaw = approachDrift3DAngle(yawRef.current, targetYaw, 0.2);
    const yawChanged = Math.abs(nextYaw - yawRef.current) > 0.0005;

    if (yawChanged) {
      yawRef.current = nextYaw;
      vehicleStateRef.current.yaw = nextYaw;
      vehicle.rotation.setY(nextYaw);
    }

    const next = clampDrift3DPoint({
      x: positionRef.current.x + input.x * 2.15 * delta,
      y: positionRef.current.y,
      z: positionRef.current.z + input.z * 2.15 * delta,
    });
    const moved =
      next.x !== positionRef.current.x || next.z !== positionRef.current.z;

    if (!moved) {
      if (yawChanged) {
        invalidate();
      }

      return;
    }

    positionRef.current = next;
    vehicleStateRef.current.position = next;
    vehicle.position.set(next.x, next.y, next.z);
    const nextProximity = getDrift3DZoneProximity(next, zones, bounds);

    if (!areDrift3DProximitySnapshotsEqual(lastProximityRef.current, nextProximity)) {
      lastProximityRef.current = nextProximity;
      onProximityChange?.(nextProximity);
    }

    invalidate();
  });

  return null;
}

type Drift3DSceneProps = {
  proximity: Drift3DZoneProximity | null;
  onProximityChange?: (proximity: Drift3DZoneProximity) => void;
};

export default function Drift3DScene({
  proximity,
  onProximityChange,
}: Drift3DSceneProps) {
  const { width, height, zones } = driftMapConfig;
  const worldBounds = useMemo(() => ({ width, height }), [width, height]);
  const vehicleStateRef = useRef<Drift3DVehicleMotionState>({
    position: getDrift3DVehicleStartPosition({ width, height }),
    yaw: 0,
  });
  const vehicleRef = useRef<Drift3DVehicleHandle | null>(null);
  const vehicleStartPosition = useMemo(
    () => getDrift3DVehicleStartPosition({ width, height }),
    [height, width]
  );

  return (
    <>
      <fog attach="fog" args={["#f3eee5", 9.5, 21.5]} />
      <color attach="background" args={["#f5f0e7"]} />
      <hemisphereLight args={["#fffdf8", "#d6cbbd", 1.35]} />
      <directionalLight position={[5, 8, 5]} intensity={1.18} />
      <ambientLight intensity={0.3} />

      <group rotation={[0, -0.28, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]}>
          <planeGeometry args={[15.8, 10.1]} />
          <meshStandardMaterial color="#ece7dc" roughness={0.98} />
        </mesh>

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.065, 0]}>
          <ringGeometry args={[1.08, 1.12, 72]} />
          <meshStandardMaterial color="#c4d3d5" roughness={0.86} />
        </mesh>

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.055, 0]}>
          <ringGeometry args={[1.72, 1.75, 72]} />
          <meshStandardMaterial color="#d9ccb6" roughness={0.9} />
        </mesh>

        <mesh position={[2.8, 0.02, -1.7]} rotation={[0, 0.28, 0]}>
          <boxGeometry args={[1.6, 0.04, 0.06]} />
          <meshStandardMaterial color="#d2c5b1" roughness={0.88} />
        </mesh>

        <mesh position={[-3.2, 0.02, 1.8]} rotation={[0, -0.2, 0]}>
          <boxGeometry args={[1.9, 0.04, 0.06]} />
          <meshStandardMaterial color="#cfd3d1" roughness={0.88} />
        </mesh>

        {zones.map((zone) => (
          <Drift3DZone
            key={zone.id}
            zone={zone}
            mapWidth={width}
            mapHeight={height}
            toneState={getDrift3DZoneToneState(zone, proximity)}
          />
        ))}

        {zones.flatMap((zone) =>
          (zone.props ?? []).map((prop) => (
            <Drift3DProp
              key={prop.id}
              prop={prop}
              mapWidth={width}
              mapHeight={height}
            />
          ))
        )}

        <Drift3DVehicle
          ref={vehicleRef}
          position={[
            vehicleStartPosition.x,
            vehicleStartPosition.y,
            vehicleStartPosition.z,
          ]}
        />

        <KeyboardVehicleMotion
          vehicleRef={vehicleRef}
          vehicleStateRef={vehicleStateRef}
          startPosition={vehicleStartPosition}
          bounds={worldBounds}
          zones={zones}
          onProximityChange={onProximityChange}
        />

        <FollowCameraRig vehicleStateRef={vehicleStateRef} />
      </group>
    </>
  );
}
