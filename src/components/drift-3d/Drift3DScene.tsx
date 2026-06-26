"use client";

import { useEffect, useMemo, useRef } from "react";
import type { RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import Drift3DVehicle, {
  type Drift3DVehicleHandle,
} from "@/components/drift-3d/Drift3DVehicle";
import Drift3DProp from "@/components/drift-3d/Drift3DProp";
import Drift3DZone from "@/components/drift-3d/Drift3DZone";
import { driftMapConfig } from "@/lib/driftMap";
import {
  clampDrift3DPoint,
  getDrift3DKeyboardVector,
  getDrift3DSpawnTransform,
  getDrift3DZoneProximity,
  getDrift3DZoneToneState,
  type Drift3DZoneProximity,
} from "@/lib/drift3d";

function StaticCameraFrame() {
  const camera = useThree((state) => state.camera);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    camera.position.set(8.8, 8.5, 11);
    camera.lookAt(0, 0, 0.58);
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, invalidate]);

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
  startPosition,
  bounds,
  zones,
  onProximityChange,
}: {
  vehicleRef: RefObject<Drift3DVehicleHandle | null>;
  startPosition: { x: number; y: number; z: number };
  bounds: { width: number; height: number };
  zones: typeof driftMapConfig.zones;
  onProximityChange?: (proximity: Drift3DZoneProximity) => void;
}) {
  const invalidate = useThree((state) => state.invalidate);
  const positionRef = useRef(startPosition);
  const pressedKeysRef = useRef<Set<string>>(new Set());
  const lastProximityRef = useRef<Drift3DZoneProximity | null>(null);

  useEffect(() => {
    positionRef.current = { ...startPosition };
    vehicleRef.current?.position.set(
      startPosition.x,
      startPosition.y,
      startPosition.z
    );

    const initialProximity = getDrift3DZoneProximity(
      startPosition,
      zones,
      bounds
    );
    lastProximityRef.current = initialProximity;
    onProximityChange?.(initialProximity);
  }, [bounds, onProximityChange, startPosition, vehicleRef, zones]);

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

    const next = clampDrift3DPoint({
      x: positionRef.current.x + input.x * 2.15 * delta,
      y: positionRef.current.y,
      z: positionRef.current.z + input.z * 2.15 * delta,
    });
    const moved =
      next.x !== positionRef.current.x || next.z !== positionRef.current.z;

    if (!moved) {
      return;
    }

    positionRef.current = next;
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
  const spawnTransform = getDrift3DSpawnTransform({ width, height });
  const vehicleRef = useRef<Drift3DVehicleHandle | null>(null);
  const vehicleStartPosition = useMemo(
    () => ({
      x: spawnTransform.x + 1.08,
      y: spawnTransform.y,
      z: spawnTransform.z + 1.08,
    }),
    [spawnTransform.x, spawnTransform.y, spawnTransform.z]
  );

  return (
    <>
      <StaticCameraFrame />
      <color attach="background" args={["#f7f4ed"]} />
      <hemisphereLight args={["#ffffff", "#d6cec1", 1.6]} />
      <directionalLight position={[4, 7, 3]} intensity={1.2} />
      <ambientLight intensity={0.45} />

      <group rotation={[0, -0.32, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]}>
          <planeGeometry args={[15, 9.5]} />
          <meshStandardMaterial color="#f1ede4" roughness={0.92} />
        </mesh>

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.065, 0]}>
          <ringGeometry args={[1.08, 1.12, 72]} />
          <meshStandardMaterial color="#cfd8d9" roughness={0.86} />
        </mesh>

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.055, 0]}>
          <ringGeometry args={[1.72, 1.75, 72]} />
          <meshStandardMaterial color="#e0d4bf" roughness={0.9} />
        </mesh>

        <mesh position={[2.8, 0.02, -1.7]} rotation={[0, 0.28, 0]}>
          <boxGeometry args={[1.6, 0.04, 0.06]} />
          <meshStandardMaterial color="#d7cab6" roughness={0.88} />
        </mesh>

        <mesh position={[-3.2, 0.02, 1.8]} rotation={[0, -0.2, 0]}>
          <boxGeometry args={[1.9, 0.04, 0.06]} />
          <meshStandardMaterial color="#d5d9d7" roughness={0.88} />
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
          startPosition={vehicleStartPosition}
          bounds={worldBounds}
          zones={zones}
          onProximityChange={onProximityChange}
        />
      </group>
    </>
  );
}
