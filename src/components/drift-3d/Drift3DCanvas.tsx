"use client";

import { Canvas } from "@react-three/fiber";
import { useMemo, useState } from "react";
import type { Track } from "@/lib/tracks";
import { getTrackForDriftZone } from "@/lib/driftMap";
import Drift3DHud from "@/components/drift-3d/Drift3DHud";
import Drift3DScene from "@/components/drift-3d/Drift3DScene";
import { driftMapConfig } from "@/lib/driftMap";
import {
  getDrift3DFollowCameraRig,
  getDrift3DVehicleStartPosition,
  type Drift3DZoneProximity,
} from "@/lib/drift3d";

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
  const [proximity, setProximity] = useState<Drift3DZoneProximity | null>(
    null
  );
  const initialCameraRig = useMemo(() => {
    const startPosition = getDrift3DVehicleStartPosition({
      width: driftMapConfig.width,
      height: driftMapConfig.height,
    });

    return getDrift3DFollowCameraRig(startPosition);
  }, []);
  const activeTrack = useMemo(
    () =>
      proximity?.activeZone ? getTrackForDriftZone(proximity.activeZone) : null,
    [proximity]
  );
  const isActiveTrackCurrent = activeTrack
    ? isCurrentTrack(activeTrack)
    : false;
  const isActiveTrackPlaying = isActiveTrackCurrent && isPlaying;
  const showPersistentAudioChip =
    Boolean(currentTrack) &&
    (!proximity?.isInside ||
      proximity.activeZone?.trackSlug !== currentTrack?.slug);

  function handleToggleActiveTrack() {
    if (!activeTrack) {
      return;
    }

    toggleTrack(activeTrack);
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#f5f0e7]">
      <section
        className="pointer-events-none absolute inset-0"
        aria-label="Experimental Drift 3D preview"
        aria-describedby="drift-3d-description"
      >
        <Canvas
          className="absolute inset-0"
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
          />
        </Canvas>
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
              aria-label={isPlaying ? "Pause current track" : "Resume current track"}
            >
              {isPlaying ? "PAUSE" : "RESUME"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
