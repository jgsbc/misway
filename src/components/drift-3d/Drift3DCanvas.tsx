"use client";

import { Canvas } from "@react-three/fiber";
import { useMemo, useState } from "react";
import type { Track } from "@/lib/tracks";
import { getTrackForDriftZone } from "@/lib/driftMap";
import Drift3DHud from "@/components/drift-3d/Drift3DHud";
import Drift3DScene from "@/components/drift-3d/Drift3DScene";
import type { Drift3DZoneProximity } from "@/lib/drift3d";

type Drift3DCanvasProps = {
  isCurrentTrack: (track: Track) => boolean;
  isPlaying: boolean;
  toggleTrack: (track: Track) => void;
  prefersReducedMotion: boolean;
};

export default function Drift3DCanvas({
  isCurrentTrack,
  isPlaying,
  toggleTrack,
  prefersReducedMotion,
}: Drift3DCanvasProps) {
  const [proximity, setProximity] = useState<Drift3DZoneProximity | null>(
    null
  );
  const activeTrack = useMemo(
    () =>
      proximity?.activeZone ? getTrackForDriftZone(proximity.activeZone) : null,
    [proximity]
  );
  const isActiveTrackCurrent = activeTrack
    ? isCurrentTrack(activeTrack)
    : false;
  const isActiveTrackPlaying = isActiveTrackCurrent && isPlaying;

  function handleToggleActiveTrack() {
    if (!activeTrack) {
      return;
    }

    toggleTrack(activeTrack);
  }

  return (
    <div className="space-y-3">
      <Drift3DHud
        proximity={proximity}
        activeTrack={activeTrack}
        isActiveTrackCurrent={isActiveTrackCurrent}
        isActiveTrackPlaying={isActiveTrackPlaying}
        onToggleActiveTrack={handleToggleActiveTrack}
        prefersReducedMotion={prefersReducedMotion}
      />

      <section
        aria-describedby="drift-3d-description"
        aria-label="Experimental Drift 3D preview"
        className="light-border light-card-bg h-[min(32vh,320px)] min-h-[240px] overflow-hidden border bg-[#f6f3ec] md:h-[min(42vh,390px)] md:min-h-[360px]"
        onPointerDown={(event) => event.stopPropagation()}
        onTouchStart={(event) => event.stopPropagation()}
      >
        <Canvas
          camera={{
            position: [8.8, 8.5, 11],
            fov: 36,
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
    </div>
  );
}
