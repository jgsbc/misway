"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import type {
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import type { Track } from "@/lib/tracks";
import { getTrackBySlug } from "@/lib/tracks";
import Drift3DScene from "@/components/drift-3d/Drift3DScene";
import Drift3DHud from "@/components/drift-3d/Drift3DHud";
import {
  getDrift3DDragDriveInput,
  getDrift3DFollowCameraRig,
  getDrift3DVehicleStartPosition,
  type Drift3DPointerDriveState,
} from "@/lib/drift3d";
import type { Drift3DTopologyProximity } from "@/lib/drift3dTopology";

type Drift3DCanvasProps = {
  isCurrentTrack: (track: Track) => boolean;
  isPlaying: boolean;
  toggleTrack: (track: Track) => void;
  currentTrack: Track | null;
  togglePlayback: () => void;
};

export default function Drift3DCanvas({
  isCurrentTrack,
  isPlaying,
  toggleTrack,
  currentTrack,
  togglePlayback,
}: Drift3DCanvasProps) {
  const [proximity, setProximity] = useState<Drift3DTopologyProximity | null>(
    null
  );
  const invalidateRef = useRef<(() => void) | null>(null);
  const pointerDriveStateRef = useRef<Drift3DPointerDriveState>({
    active: false,
    pointerId: null,
    origin: null,
    input: {
      x: 0,
      z: 0,
      active: false,
    },
  });
  const initialCameraRig = useMemo(() => {
    const startPosition = getDrift3DVehicleStartPosition();

    return getDrift3DFollowCameraRig(startPosition);
  }, []);

  useEffect(() => {
    function releasePointerDriveState() {
      const pointerDriveState = pointerDriveStateRef.current;

      if (
        !pointerDriveState.active &&
        !pointerDriveState.input.active &&
        pointerDriveState.pointerId === null &&
        pointerDriveState.origin === null
      ) {
        return;
      }

      pointerDriveStateRef.current = {
        active: false,
        pointerId: null,
        origin: null,
        input: {
          x: 0,
          z: 0,
          active: false,
        },
      };
      invalidateRef.current?.();
    }

    window.addEventListener("blur", releasePointerDriveState);
    document.addEventListener("visibilitychange", releasePointerDriveState);

    return () => {
      window.removeEventListener("blur", releasePointerDriveState);
      document.removeEventListener("visibilitychange", releasePointerDriveState);
    };
  }, []);

  function setPointerDriveInput(
    pointerId: number,
    clientX: number,
    clientY: number
  ) {
    const pointerDriveState = pointerDriveStateRef.current;

    if (pointerDriveState.pointerId !== pointerId || !pointerDriveState.origin) {
      return;
    }

    const nextInput = getDrift3DDragDriveInput(pointerDriveState.origin, {
      x: clientX,
      y: clientY,
    });
    const nextState: Drift3DPointerDriveState = {
      active: nextInput.active,
      pointerId,
      origin: pointerDriveState.origin,
      input: nextInput.active
        ? nextInput
        : {
            x: 0,
            z: 0,
            active: false,
          },
    };

    const changed =
      nextState.active !== pointerDriveState.active ||
      nextState.input.active !== pointerDriveState.input.active ||
      Math.abs(nextState.input.x - pointerDriveState.input.x) > 0.001 ||
      Math.abs(nextState.input.z - pointerDriveState.input.z) > 0.001;

    if (!changed) {
      return;
    }

    pointerDriveStateRef.current = nextState;
    invalidateRef.current?.();
  }

  function clearPointerDriveInput(pointerId?: number) {
    const pointerDriveState = pointerDriveStateRef.current;

    if (
      pointerId !== undefined &&
      pointerDriveState.pointerId !== null &&
      pointerDriveState.pointerId !== pointerId
    ) {
      return;
    }

    if (
      !pointerDriveState.active &&
      !pointerDriveState.input.active &&
      pointerDriveState.pointerId === null &&
      pointerDriveState.origin === null
    ) {
      return;
    }

    pointerDriveStateRef.current = {
      active: false,
      pointerId: null,
      origin: null,
      input: {
        x: 0,
        z: 0,
        active: false,
      },
    };
    invalidateRef.current?.();
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (
      event.button !== 0 ||
      event.defaultPrevented ||
      pointerDriveStateRef.current.pointerId !== null
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    pointerDriveStateRef.current = {
      active: false,
      pointerId: event.pointerId,
      origin: { x: event.clientX, y: event.clientY },
      input: {
        x: 0,
        z: 0,
        active: false,
      },
    };

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Ignore pointer capture errors on unsupported or synthetic sequences.
    }
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (pointerDriveStateRef.current.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    setPointerDriveInput(event.pointerId, event.clientX, event.clientY);
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (pointerDriveStateRef.current.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Ignore pointer capture errors on unsupported or synthetic sequences.
    }

    clearPointerDriveInput(event.pointerId);
  }

  function handlePointerCancel(event: ReactPointerEvent<HTMLDivElement>) {
    if (pointerDriveStateRef.current.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Ignore pointer capture errors on unsupported or synthetic sequences.
    }

    clearPointerDriveInput(event.pointerId);
  }

  function handleClickCapture(event: ReactMouseEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
  }

  const activeTrack = useMemo(() => {
    if (!proximity?.activeNode || !("trackSlug" in proximity.activeNode)) {
      return null;
    }

    return getTrackBySlug(proximity.activeNode.trackSlug) ?? null;
  }, [proximity]);
  const isActiveTrackCurrent = activeTrack
    ? isCurrentTrack(activeTrack)
    : false;
  const isActiveTrackPlaying = isActiveTrackCurrent && isPlaying;
  const activeNodeTrackSlug =
    proximity?.activeNode && "trackSlug" in proximity.activeNode
      ? proximity.activeNode.trackSlug
      : null;
  const showPersistentAudioChip =
    Boolean(currentTrack) &&
    (!proximity?.isInside || activeNodeTrackSlug !== currentTrack?.slug);

  function handleToggleActiveTrack() {
    if (!activeTrack) {
      return;
    }

    toggleTrack(activeTrack);
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#f5f0e7]">
      <section
        className="pointer-events-auto absolute inset-0"
        aria-label="Experimental Drift 3D preview"
        aria-describedby="drift-3d-description"
      >
        <Canvas
          className="absolute inset-0"
          onCreated={({ invalidate }) => {
            invalidateRef.current = invalidate;
          }}
          camera={{
            position: [
              initialCameraRig.position.x,
              initialCameraRig.position.y,
              initialCameraRig.position.z,
            ],
            fov: 28,
            near: 0.1,
            far: 80,
          }}
          dpr={[1, 1.5]}
          frameloop="demand"
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
          }}
        >
          <Drift3DScene
            proximity={proximity}
            onProximityChange={setProximity}
            pointerDriveStateRef={pointerDriveStateRef}
          />
        </Canvas>

        <div
          aria-hidden="true"
          className="absolute inset-0 z-10 touch-none cursor-grab select-none"
          onPointerDownCapture={handlePointerDown}
          onPointerMoveCapture={handlePointerMove}
          onPointerUpCapture={handlePointerUp}
          onPointerCancelCapture={handlePointerCancel}
          onClickCapture={handleClickCapture}
          onContextMenu={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
        />
      </section>

      <div className="pointer-events-none absolute right-4 top-4 z-20 max-w-[min(92vw,24rem)] md:right-6 md:top-6">
        <div className="pointer-events-auto">
          <Drift3DHud
            proximity={proximity}
            activeTrack={activeTrack}
            isActiveTrackCurrent={isActiveTrackCurrent}
            isActiveTrackPlaying={isActiveTrackPlaying}
            onToggleActiveTrack={handleToggleActiveTrack}
          />
        </div>
      </div>

      {showPersistentAudioChip && currentTrack ? (
        <div className="pointer-events-none absolute inset-x-4 bottom-16 z-20 flex justify-center md:inset-x-6 md:bottom-6">
          <div className="pointer-events-auto inline-flex max-w-[min(92vw,24rem)] items-center gap-3 rounded-full bg-white/36 px-3 py-2.5 text-neutral-950 ring-1 ring-black/5 backdrop-blur-md">
            <div className="min-w-0">
              <p className="font-mono text-[8px] uppercase tracking-[0.28em] text-neutral-500">
                {isPlaying ? "NOW PLAYING" : "TRACK HELD"}
              </p>
              <p className="truncate font-mono text-[9px] uppercase tracking-[0.18em] text-neutral-900">
                {currentTrack.title}
              </p>
            </div>

            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                togglePlayback();
              }}
              onPointerDown={(event) => event.stopPropagation()}
              onPointerMove={(event) => event.stopPropagation()}
              onPointerUp={(event) => event.stopPropagation()}
              onPointerCancel={(event) => event.stopPropagation()}
              className="pointer-events-auto inline-flex min-h-8 shrink-0 items-center justify-center rounded-full border border-neutral-300/80 bg-white/72 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-900 transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
              aria-label={
                isPlaying ? "Pause current track" : "Resume current track"
              }
            >
              {isPlaying ? "PAUSE" : "RESUME"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
