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
  const initialCameraRig = useMemo(() => {
    const startPosition = getDrift3DVehicleStartPosition({
      width: driftMapConfig.width,
      height: driftMapConfig.height,
    });

    return getDrift3DFollowCameraRig(startPosition, 0);
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
            fov: 31,
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
            prefersReducedMotion={prefersReducedMotion}
          />
        </div>
      </div>
    </div>
  );
}
