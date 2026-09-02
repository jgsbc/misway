"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { Info, Navigation2, Play } from "lucide-react";
import { getTrackBySlug, type Track } from "@/lib/tracks";
import type { Drift3DTopologyProximity } from "@/lib/drift3dTopology";
import {
  getDriftCompassHeadingDegrees,
  getDriftCompassHeadingServerSnapshot,
  subscribeDriftCompassHeading,
} from "@/lib/driftCompassHeading";
import {
  getDriftEvolutionTrackGuidanceServerSnapshot,
  getDriftEvolutionTrackGuidanceSnapshot,
  subscribeDriftEvolutionTrackGuidance,
} from "@/lib/driftEvolutionTrackGuidanceStore";

type Drift3DHudProps = {
  proximity: Drift3DTopologyProximity | null;
  activeTrack: Track | null;
  isActiveTrackCurrent: boolean;
  isActiveTrackPlaying: boolean;
  onToggleActiveTrack: () => void;
  bearingDegrees?: number;
};

function getFallbackCompassTrack(
  proximity: Drift3DTopologyProximity | null,
  activeTrack: Track | null
) {
  if (activeTrack) return activeTrack;

  const node = proximity?.activeNode ?? proximity?.nearestNode ?? null;
  if (!node || !("trackSlug" in node)) return null;

  return getTrackBySlug(node.trackSlug) ?? null;
}

function getGuidedProgress(distance: number, activationRadius: number) {
  const falloff =
    distance <= activationRadius ? activationRadius : activationRadius * 1.45;
  if (falloff <= 0) return 0;
  return Math.min(1, Math.max(0, 1 - distance / falloff));
}

export default function Drift3DHud({
  proximity,
  activeTrack,
  isActiveTrackPlaying,
  onToggleActiveTrack,
  bearingDegrees = 0,
}: Drift3DHudProps) {
  const era = proximity?.activeEra ?? proximity?.nearestEra ?? null;
  const evolutionGuidance = useSyncExternalStore(
    subscribeDriftEvolutionTrackGuidance,
    getDriftEvolutionTrackGuidanceSnapshot,
    getDriftEvolutionTrackGuidanceServerSnapshot
  );
  const guidedTrack = evolutionGuidance
    ? getTrackBySlug(evolutionGuidance.trackSlug) ?? null
    : null;
  const guidanceMatchesActiveTrack =
    !activeTrack || evolutionGuidance?.trackSlug === activeTrack.slug;
  const useEvolutionGuidance = Boolean(
    evolutionGuidance && guidedTrack && guidanceMatchesActiveTrack
  );
  const compassTrack =
    activeTrack ??
    (useEvolutionGuidance ? guidedTrack : null) ??
    getFallbackCompassTrack(proximity, activeTrack);
  const isPlayable = Boolean(activeTrack && proximity?.isInside);
  const progress = Math.round(
    (useEvolutionGuidance && evolutionGuidance
      ? getGuidedProgress(
          evolutionGuidance.distance,
          evolutionGuidance.activationRadius
        )
      : proximity?.progress ?? 0) * 100
  );
  const compassDistance = useEvolutionGuidance
    ? evolutionGuidance?.distance ?? 0
    : proximity?.distance ?? 0;
  const distanceLabel = `${Math.round(compassDistance)}u`;
  const compassBearingDegrees = useEvolutionGuidance
    ? evolutionGuidance?.bearingDegrees ?? bearingDegrees
    : bearingDegrees;
  const headingDegrees = useSyncExternalStore(
    subscribeDriftCompassHeading,
    getDriftCompassHeadingDegrees,
    getDriftCompassHeadingServerSnapshot
  );

  return (
    <aside
      className="pointer-events-auto ml-auto h-28 w-28 rounded-full text-white sm:h-32 sm:w-32"
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
          <div
            aria-hidden="true"
            className="absolute inset-0 transition-transform duration-100 ease-out"
            style={{ transform: `rotate(${-headingDegrees}deg)` }}
          >
            <span className="absolute left-1/2 top-1.5 -translate-x-1/2 font-mono text-[6px] uppercase tracking-[0.18em] text-white/46">
              <span
                className="inline-block"
                style={{ transform: `rotate(${headingDegrees}deg)` }}
              >
                N
              </span>
            </span>
            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 font-mono text-[6px] text-white/30">
              <span
                className="inline-block"
                style={{ transform: `rotate(${headingDegrees}deg)` }}
              >
                E
              </span>
            </span>
            <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 font-mono text-[6px] text-white/20">
              <span
                className="inline-block"
                style={{ transform: `rotate(${headingDegrees}deg)` }}
              >
                S
              </span>
            </span>
            <span className="absolute left-1.5 top-1/2 -translate-y-1/2 font-mono text-[6px] text-white/30">
              <span
                className="inline-block"
                style={{ transform: `rotate(${headingDegrees}deg)` }}
              >
                W
              </span>
            </span>

            <span className="absolute left-1/2 top-4 h-12 w-px -translate-x-1/2 bg-white/8 sm:h-14" />
            <span className="absolute left-4 right-4 top-[2.8rem] h-px bg-white/8 sm:top-[3.15rem]" />
          </div>

          <div
            aria-hidden="true"
            className="absolute left-1/2 top-[1.5rem] -ml-2 h-4 w-4 origin-[50%_1.35rem] text-white transition-transform duration-200 ease-out sm:top-[1.7rem]"
            style={{ transform: `rotate(${compassBearingDegrees}deg)` }}
          >
            <Navigation2 className="h-4 w-4" fill="currentColor" strokeWidth={1.2} />
          </div>

          <div className="absolute inset-x-5 top-[2.7rem] text-center sm:top-[3rem]">
            <p className="truncate font-mono text-[6px] uppercase tracking-[0.12em] text-white/42">
              {era?.label ?? "NO ERA"} · {distanceLabel}
            </p>
            <p className="mt-0.5 truncate font-mono text-[8px] uppercase tracking-[0.1em] text-white sm:text-[9px]">
              {compassTrack?.title ?? "SEEKING SIGNAL"}
            </p>
          </div>

          {compassTrack ? (
            <div className="absolute inset-x-4 bottom-3 flex items-center justify-center gap-1.5 sm:bottom-3.5">
              {isPlayable ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    if (!isActiveTrackPlaying) onToggleActiveTrack();
                  }}
                  disabled={isActiveTrackPlaying}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-white text-neutral-950 transition hover:bg-white/86 disabled:cursor-default disabled:bg-white/14 disabled:text-white/58"
                  aria-label={
                    isActiveTrackPlaying
                      ? `${compassTrack.title} is playing`
                      : `Play ${compassTrack.title}`
                  }
                >
                  <Play
                    aria-hidden="true"
                    className="h-2.5 w-2.5 translate-x-px"
                    fill="currentColor"
                  />
                </button>
              ) : null}

              <Link
                href={`/tracks/${compassTrack.slug}`}
                onClick={(event) => event.stopPropagation()}
                onPointerDown={(event) => event.stopPropagation()}
                onPointerMove={(event) => event.stopPropagation()}
                onPointerUp={(event) => event.stopPropagation()}
                onPointerCancel={(event) => event.stopPropagation()}
                className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/18 bg-white/8 text-white/78 transition hover:bg-white/16 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/25"
                aria-label={`More details about ${compassTrack.title}`}
              >
                <Info aria-hidden="true" className="h-3 w-3" strokeWidth={1.8} />
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
