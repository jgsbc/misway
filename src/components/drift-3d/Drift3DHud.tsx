"use client";

import Link from "next/link";
import { Navigation2, Play } from "lucide-react";
import { getTrackBySlug, type Track } from "@/lib/tracks";
import type { Drift3DTopologyProximity } from "@/lib/drift3dTopology";

type Drift3DHudProps = {
  proximity: Drift3DTopologyProximity | null;
  activeTrack: Track | null;
  isActiveTrackCurrent: boolean;
  isActiveTrackPlaying: boolean;
  onToggleActiveTrack: () => void;
  bearingDegrees?: number;
};

function getCompassTrack(
  proximity: Drift3DTopologyProximity | null,
  activeTrack: Track | null
) {
  if (activeTrack) return activeTrack;

  const node = proximity?.activeNode ?? proximity?.nearestNode ?? null;
  if (!node || !("trackSlug" in node)) return null;

  return getTrackBySlug(node.trackSlug) ?? null;
}

export default function Drift3DHud({
  proximity,
  activeTrack,
  isActiveTrackPlaying,
  onToggleActiveTrack,
  bearingDegrees = 0,
}: Drift3DHudProps) {
  const era = proximity?.activeEra ?? proximity?.nearestEra ?? null;
  const compassTrack = getCompassTrack(proximity, activeTrack);
  const isPlayable = Boolean(activeTrack && proximity?.isInside);
  const progress = Math.round((proximity?.progress ?? 0) * 100);
  const distanceLabel = `${Math.round(proximity?.distance ?? 0)}u`;

  return (
    <aside
      className="pointer-events-auto ml-auto h-44 w-44 rounded-full text-white"
      aria-label="Drift track compass"
      onPointerDown={(event) => event.stopPropagation()}
      onTouchStart={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <div
        className="relative h-full w-full rounded-full p-px shadow-[0_18px_40px_rgba(0,0,0,0.28)]"
        style={{
          background: `conic-gradient(from -90deg, rgba(255,255,255,0.78) 0 ${progress}%, rgba(255,255,255,0.14) ${progress}% 100%)`,
        }}
      >
        <div className="relative h-full w-full overflow-hidden rounded-full border border-white/10 bg-neutral-950/68 backdrop-blur-xl">
          <span className="absolute left-1/2 top-2 -translate-x-1/2 font-mono text-[7px] uppercase tracking-[0.2em] text-white/46">
            N
          </span>
          <span className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[7px] text-white/30">
            E
          </span>
          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 font-mono text-[7px] text-white/20">
            S
          </span>
          <span className="absolute left-2 top-1/2 -translate-y-1/2 font-mono text-[7px] text-white/30">
            W
          </span>

          <span aria-hidden="true" className="absolute left-1/2 top-5 h-[4.25rem] w-px -translate-x-1/2 bg-white/8" />
          <span aria-hidden="true" className="absolute left-5 right-5 top-[3.85rem] h-px bg-white/8" />

          <div
            aria-hidden="true"
            className="absolute left-1/2 top-[2.15rem] -ml-2.5 h-5 w-5 origin-[50%_1.7rem] text-white transition-transform duration-500 ease-out"
            style={{ transform: `rotate(${bearingDegrees}deg)` }}
          >
            <Navigation2 className="h-5 w-5" fill="currentColor" strokeWidth={1.2} />
          </div>

          <div className="absolute inset-x-7 top-[3.65rem] text-center">
            <p className="font-mono text-[7px] uppercase tracking-[0.18em] text-white/42">
              {era?.label ?? "NO ERA"} · {distanceLabel}
            </p>
            <p className="mt-1 truncate font-mono text-[10px] uppercase tracking-[0.12em] text-white">
              {compassTrack?.title ?? "SEEKING SIGNAL"}
            </p>
          </div>

          {compassTrack ? (
            <div className="absolute inset-x-5 bottom-5 flex items-center justify-center gap-1.5">
              {isPlayable ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    if (!isActiveTrackPlaying) onToggleActiveTrack();
                  }}
                  disabled={isActiveTrackPlaying}
                  className="inline-flex min-h-7 items-center gap-1 rounded-full border border-white/20 bg-white px-2.5 py-1 font-mono text-[7px] uppercase tracking-[0.14em] text-neutral-950 transition hover:bg-white/86 disabled:cursor-default disabled:bg-white/14 disabled:text-white/58"
                  aria-label={
                    isActiveTrackPlaying
                      ? `${compassTrack.title} is playing`
                      : `Play ${compassTrack.title}`
                  }
                >
                  <Play aria-hidden="true" className="h-2.5 w-2.5" fill="currentColor" />
                  {isActiveTrackPlaying ? "PLAYING" : "PLAY"}
                </button>
              ) : null}

              <Link
                href={`/tracks/${compassTrack.slug}`}
                onClick={(event) => event.stopPropagation()}
                onPointerDown={(event) => event.stopPropagation()}
                onPointerMove={(event) => event.stopPropagation()}
                onPointerUp={(event) => event.stopPropagation()}
                onPointerCancel={(event) => event.stopPropagation()}
                className="inline-flex min-h-7 items-center rounded-full border border-white/18 bg-white/8 px-2.5 py-1 font-mono text-[7px] uppercase tracking-[0.14em] text-white/78 transition hover:bg-white/16 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/25"
                aria-label={`More details about ${compassTrack.title}`}
              >
                DETAILS
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
