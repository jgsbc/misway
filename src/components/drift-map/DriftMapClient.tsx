"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import DriftMapScene from "@/components/drift-map/DriftMapScene";
import { driftMapConfig } from "@/lib/driftMap";
import {
  getMovementInput,
  getNextDriftVehicleState,
  hasVehicleStateChanged,
  isDriftMovementKey,
  isEditableKeyboardTarget,
  type DriftVehicleState,
} from "@/lib/driftControls";

const movementSpeed = 260;

const initialVehicleState: DriftVehicleState = {
  position: driftMapConfig.spawn,
  facing: 0,
  isMoving: false,
};

export default function DriftMapClient() {
  const pressedKeysRef = useRef(new Set<string>());
  const frameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const vehicleStateRef = useRef<DriftVehicleState>(initialVehicleState);
  const [vehicleState, setVehicleState] =
    useState<DriftVehicleState>(initialVehicleState);

  useEffect(() => {
    function updateVehicleState(time: number) {
      const lastTime = lastTimeRef.current ?? time;
      const deltaSeconds = Math.min((time - lastTime) / 1000, 0.05);
      lastTimeRef.current = time;

      const nextState = getNextDriftVehicleState({
        state: vehicleStateRef.current,
        input: getMovementInput(pressedKeysRef.current),
        deltaSeconds,
        speed: movementSpeed,
        bounds: {
          width: driftMapConfig.width,
          height: driftMapConfig.height,
        },
      });

      if (hasVehicleStateChanged(vehicleStateRef.current, nextState)) {
        vehicleStateRef.current = nextState;
        setVehicleState(nextState);
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
    <main className="light-theme light-page-bg min-h-screen px-6 pb-48 pt-24 md:px-10">
      <section className="mx-auto max-w-6xl">
        <div className="mb-8 grid gap-6 md:grid-cols-[1fr_0.74fr] md:items-end">
          <div>
            <p className="light-text-tertiary font-mono text-[10px] uppercase tracking-[0.35em]">
              Experimental / Drift Map Lab
            </p>

            <h1 className="light-text-primary mt-6 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
              The map can move now.
            </h1>

            <div className="light-text-secondary mt-7 max-w-2xl space-y-3 text-sm leading-7 md:text-base">
              <p>Desktop prototype only: drive the small signal with the keyboard.</p>
              <p>Zones and audio stay asleep for now.</p>
              <p>Keyboard-free path: use Drift or Tracks below while this map learns manners.</p>
            </div>
          </div>

          <div className="light-border light-card-bg border p-5">
            <p className="light-text-tertiary font-mono text-[10px] uppercase tracking-[0.24em]">
              Controls
            </p>
            <p className="light-text-primary mt-4 font-mono text-xs uppercase tracking-[0.18em]">
              WASD / Arrow keys
            </p>
            <p className="light-text-secondary mt-3 text-sm leading-6">
              Movement is clamped inside the map. Diagonals are normalized. No song starts here.
            </p>
          </div>
        </div>

        <DriftMapScene
          vehiclePosition={vehicleState.position}
          vehicleFacing={vehicleState.facing}
          isVehicleMoving={vehicleState.isMoving}
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
