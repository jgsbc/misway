"use client";

import Link from "next/link";
import type { Track } from "@/lib/tracks";
import type { Drift3DTopologyProximity } from "@/lib/drift3dTopology";

type Drift3DHudProps = {
  proximity: Drift3DTopologyProximity | null;
  activeTrack: Track | null;
  isActiveTrackCurrent: boolean;
  isActiveTrackPlaying: boolean;
  onToggleActiveTrack: () => void;
};

function getApproachCopy(proximity: Drift3DTopologyProximity | null) {
  const node = proximity?.activeNode ?? proximity?.nearestNode ?? null;
  const era = proximity?.activeEra ?? proximity?.nearestEra ?? null;

  if (!proximity || !node) {
    return {
      status: "CHECKING SIGNAL",
      title: "No lock yet",
      detail: "The room is settling.",
      progress: 0,
    };
  }

  if (node.role === "threshold") {
    return {
      status: proximity.isInside ? "ENTRY NODE" : "APPROACHING",
      title: "Entry Node",
      detail: era?.label ?? "Birth side origin",
      progress: Math.round(proximity.progress * 100),
    };
  }

  return {
    status: proximity.isInside ? "SIGNAL LOCKED" : "APPROACHING",
    title: era?.label ?? "Signal region",
    detail:
      node.role === "anchor"
        ? "Anchor node"
        : era?.topologyHints[0] ?? "Track signal",
    progress: Math.round(proximity.progress * 100),
  };
}

export default function Drift3DHud({
  proximity,
  activeTrack,
  isActiveTrackCurrent,
  isActiveTrackPlaying,
  onToggleActiveTrack,
}: Drift3DHudProps) {
  const copy = getApproachCopy(proximity);
  const distanceLabel = `${Math.round(proximity?.distance ?? 0)}u`;
  const activeEraLabel =
    proximity?.activeEra?.label ?? activeTrack?.publishedLabel ?? "Track";
  const playerState = isActiveTrackPlaying ? "PLAYING" : "PAUSED";
  const isInsideTrack = Boolean(activeTrack && proximity?.isInside);

  return (
    <aside
      className="pointer-events-auto rounded-[4px] bg-white/82 px-3 py-2.5 text-neutral-950 shadow-[0_12px_32px_rgba(0,0,0,0.16)] ring-1 ring-black/10 backdrop-blur-lg"
      aria-label="Drift 3D proximity HUD"
      onPointerDown={(event) => event.stopPropagation()}
      onTouchStart={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      {isInsideTrack && activeTrack ? (
        <>
          <div className="flex items-center justify-between gap-3 font-mono text-[8px] uppercase tracking-[0.22em] text-neutral-600">
            <p>{isActiveTrackCurrent ? playerState : "TRACK SIGNAL"}</p>
            <p>{distanceLabel}</p>
          </div>

          <h2 className="mt-1.5 truncate font-mono text-[11px] uppercase tracking-[0.16em] text-neutral-950">
            {activeTrack.title}
          </h2>

          <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.14em] text-neutral-600">
            {[activeEraLabel, activeTrack.duration].filter(Boolean).join(" / ")}
          </p>

          <p className="mt-2 line-clamp-2 text-[11px] leading-[1.45] text-neutral-700">
            {activeTrack.shortText}
          </p>

          <div className="mt-2.5 flex items-center gap-2 border-t border-black/10 pt-2">
            {!isActiveTrackCurrent ? (
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onToggleActiveTrack();
                }}
                onPointerDown={(event) => event.stopPropagation()}
                onPointerMove={(event) => event.stopPropagation()}
                onPointerUp={(event) => event.stopPropagation()}
                onPointerCancel={(event) => event.stopPropagation()}
                className="pointer-events-auto inline-flex min-h-7 items-center justify-center rounded-full bg-neutral-950 px-3 py-1 font-mono text-[8px] uppercase tracking-[0.18em] text-white transition hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-900/30"
                aria-label={`Listen to ${activeTrack.title}`}
              >
                LISTEN
              </button>
            ) : (
              <p className="font-mono text-[7px] uppercase tracking-[0.14em] text-neutral-500">
                CONTROL BELOW
              </p>
            )}

            <Link
              href={`/tracks/${activeTrack.slug}`}
              onClick={(event) => event.stopPropagation()}
              onPointerDown={(event) => event.stopPropagation()}
              onPointerMove={(event) => event.stopPropagation()}
              onPointerUp={(event) => event.stopPropagation()}
              onPointerCancel={(event) => event.stopPropagation()}
              className="pointer-events-auto ml-auto font-mono text-[8px] uppercase tracking-[0.18em] text-neutral-700 underline decoration-neutral-400 underline-offset-4 transition hover:text-neutral-950 focus:outline-none focus:ring-2 focus:ring-neutral-900/25"
              aria-label={`Open ${activeTrack.title} track page`}
            >
              DETAILS
            </Link>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3 font-mono text-[8px] uppercase tracking-[0.22em] text-neutral-600">
            <p>{copy.status}</p>
            <p>{distanceLabel}</p>
          </div>

          <p className="mt-1.5 truncate font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-950">
            {copy.title}
          </p>
          <p className="mt-1 line-clamp-1 text-[10px] leading-4 text-neutral-600">
            {copy.detail}
          </p>

          <div
            className="mt-2 h-px overflow-hidden bg-neutral-300/80"
            aria-hidden="true"
          >
            <span
              className="block h-full bg-neutral-800/80"
              style={{ width: `${copy.progress}%` }}
            />
          </div>
        </>
      )}
    </aside>
  );
}
