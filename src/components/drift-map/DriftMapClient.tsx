"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import DriftMapScene from "@/components/drift-map/DriftMapScene";
import { driftMapConfig, driftZones } from "@/lib/driftMap";
import {
  getDriftZoneProximity,
  getMovementInput,
  getNextDriftVehicleState,
  getNextDriftVehicleStateTowardTarget,
  hasActiveMovementInput,
  hasDriftZoneProximityChanged,
  hasVehicleStateChanged,
  isDriftMovementKey,
  isEditableKeyboardTarget,
  type DriftPoint,
  type DriftVehicleState,
  type DriftZoneProximity,
} from "@/lib/driftControls";

const movementSpeed = 260;

const initialVehicleState: DriftVehicleState = {
  position: driftMapConfig.spawn,
  facing: 0,
  isMoving: false,
};

const initialZoneProximity = getDriftZoneProximity(
  initialVehicleState.position,
  driftZones
);

export default function DriftMapClient() {
  const pressedKeysRef = useRef(new Set<string>());
  const pointerTargetRef = useRef<DriftPoint | null>(null);
  const frameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const vehicleStateRef = useRef<DriftVehicleState>(initialVehicleState);
  const zoneProximityRef =
    useRef<DriftZoneProximity>(initialZoneProximity);
  const [vehicleState, setVehicleState] =
    useState<DriftVehicleState>(initialVehicleState);
  const [zoneProximity, setZoneProximity] =
    useState<DriftZoneProximity>(initialZoneProximity);

  const handlePointerTargetChange = useCallback((target: DriftPoint | null) => {
    pointerTargetRef.current = target;
  }, []);

  useEffect(() => {
    function updateVehicleState(time: number) {
      const lastTime = lastTimeRef.current ?? time;
      const deltaSeconds = Math.min((time - lastTime) / 1000, 0.05);
      lastTimeRef.current = time;
      const bounds = {
        width: driftMapConfig.width,
        height: driftMapConfig.height,
      };
      const keyboardInput = getMovementInput(pressedKeysRef.current);
      const pointerTarget = pointerTargetRef.current;

      const nextState =
        !hasActiveMovementInput(keyboardInput) && pointerTarget
          ? getNextDriftVehicleStateTowardTarget({
              state: vehicleStateRef.current,
              target: pointerTarget,
              deltaSeconds,
              speed: movementSpeed,
              bounds,
            })
          : getNextDriftVehicleState({
              state: vehicleStateRef.current,
              input: keyboardInput,
              deltaSeconds,
              speed: movementSpeed,
              bounds,
            });

      if (hasVehicleStateChanged(vehicleStateRef.current, nextState)) {
        vehicleStateRef.current = nextState;
        setVehicleState(nextState);
      }

      const nextZoneProximity = getDriftZoneProximity(
        nextState.position,
        driftZones
      );

      if (
        hasDriftZoneProximityChanged(
          zoneProximityRef.current,
          nextZoneProximity
        )
      ) {
        zoneProximityRef.current = nextZoneProximity;
        setZoneProximity(nextZoneProximity);
      }

      frameRef.current = requestAnimationFrame(updateVehicleState);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (
        isEditableKeyboardTarget(event.target) ||
        !isDriftMovementKey(event.code)
      ) {
        return;
      }

      event.preventDefault();
      pressedKeysRef.current.add(event.code);
    }

    function handleKeyUp(event: KeyboardEvent) {
      if (!isDriftMovementKey(event.code)) {
        return;
      }

      pressedKeysRef.current.delete(event.code);
    }

    function clearPressedKeys() {
      pressedKeysRef.current.clear();
      pointerTargetRef.current = null;
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", clearPressedKeys);
    frameRef.current = requestAnimationFrame(updateVehicleState);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", clearPressedKeys);

      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return (
    <main className="light-theme light-page-bg min-h-screen px-6 pb-64 pt-16 md:px-10 md:pb-48 md:pt-24">
      <section className="mx-auto max-w-6xl">
        <div className="mb-5 grid gap-4 md:mb-8 md:grid-cols-[1fr_0.74fr] md:items-end md:gap-6">
          <div>
            <p className="light-text-tertiary font-mono text-[10px] uppercase tracking-[0.35em]">
              Experimental / Drift Map Lab
            </p>

            <h1 className="light-text-primary mt-4 max-w-3xl text-3xl font-semibold tracking-tight md:mt-6 md:text-6xl">
              The map can move now.
            </h1>

            <div className="light-text-secondary mt-4 max-w-2xl space-y-2 text-sm leading-6 md:mt-7 md:space-y-3 md:text-base md:leading-7">
              <p>Desktop: arrows or WASD. Mobile: touch and drag the map.</p>
              <p>Proximity answers visually. Audio stays asleep for now.</p>
              <p>No controls today? Drift and Tracks still have doors.</p>
            </div>
          </div>

          <div className="light-border light-card-bg border p-4 md:p-5">
            <p className="light-text-tertiary font-mono text-[10px] uppercase tracking-[0.24em]">
              Controls
            </p>
            <p className="light-text-primary mt-3 font-mono text-xs uppercase tracking-[0.18em] md:mt-4">
              WASD / Arrow keys / Touch + drag
            </p>
            <p className="light-text-secondary mt-2 text-sm leading-6 md:mt-3">
              Movement is clamped inside the map. Keys win while pressed. No
              song starts here.
            </p>
          </div>
        </div>

        <DriftMapScene
          vehiclePosition={vehicleState.position}
          vehicleFacing={vehicleState.facing}
          isVehicleMoving={vehicleState.isMoving}
          zoneProximity={zoneProximity}
          onPointerTargetChange={handlePointerTargetChange}
        />

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/drift"
            className="light-text-primary light-border hover:light-card-hover inline-flex min-h-[46px] items-center justify-center border px-5 py-3 font-mono text-[11px] uppercase tracking-[0.24em] transition"
          >
            Back to Drift
          </Link>

          <Link
            href="/tracks"
            className="light-text-secondary light-border hover:light-text-primary inline-flex min-h-[46px] items-center justify-center border px-5 py-3 font-mono text-[11px] uppercase tracking-[0.24em] transition"
          >
            Open Tracks
          </Link>
        </div>
      </section>
    </main>
  );
}
