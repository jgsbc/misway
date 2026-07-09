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

function getHudCopy(
  proximity: Drift3DTopologyProximity | null,
  activeTrack: Track | null
) {
  const node = proximity?.activeNode ?? proximity?.nearestNode ?? null;
  const era = proximity?.activeEra ?? proximity?.nearestEra ?? null;

  if (!proximity || !node) {
    return {
      status: "CHECKING SIGNAL",
      title: "No lock yet",
      detail: "The room is settling.",
      note: "VISUAL ONLY",
      progress: 0,
    };
  }

  if (node.role === "threshold") {
    return {
      status: proximity.isInside ? "ENTRY NODE" : "APPROACHING",
      title: "Entry Node",
      detail: era?.label ?? "Birth side origin",
      note: "THRESHOLD ONLY",
      progress: Math.round(proximity.progress * 100),
    };
  }

  if (proximity.isInside && activeTrack) {
    return {
      status: "INSIDE SIGNAL",
      title: activeTrack.title,
      detail: era?.label ?? activeTrack.publishedLabel,
      note: activeTrack.shortText,
      progress: Math.round(proximity.progress * 100),
    };
  }

  return {
    status: "APPROACHING",
    title: era?.label ?? "Signal region",
    detail: node.role === "anchor" ? "ANCHOR NODE" : "TRACK NODE",
    note: era?.topologyHints[0] ?? "VISUAL ONLY",
    progress: Math.round(proximity.progress * 100),
  };
}

function getTrackAvailabilityLabel(
  proximity: Drift3DTopologyProximity,
  activeTrack: Track | null
) {
  if (!proximity.activeNode) {
    return "NO TRACK TRIGGERED YET";
  }

  if (proximity.activeNode.role === "threshold") {
    return "ENTRY THRESHOLD";
  }

  if (activeTrack) {
    return "TRACK READY";
  }

  return "TRACK MISSING";
}

function getActionLabel({
  isActiveTrackCurrent,
  isActiveTrackPlaying,
}: {
  isActiveTrackCurrent: boolean;
  isActiveTrackPlaying: boolean;
}) {
  if (!isActiveTrackCurrent) {
    return "LISTEN";
  }

  return isActiveTrackPlaying ? "PAUSE" : "RESUME";
}

export default function Drift3DHud({
  proximity,
  activeTrack,
  isActiveTrackCurrent,
  isActiveTrackPlaying,
  onToggleActiveTrack,
}: Drift3DHudProps) {
  const copy = getHudCopy(proximity, activeTrack);
  // DRIFT-3D-20B: mobile compact — on masque les lignes secondaires tant qu'on
  // n'est pas dans un node ; desktop garde le détail complet en permanence.
  const isInside = proximity?.isInside ?? false;
  const secondaryVisibility = isInside ? "" : "hidden md:block";
  const distanceLabel = `${Math.round(proximity?.distance ?? 0)}u`;
  const progressPercent = Math.round((proximity?.progress ?? 0) * 100);
  const trackAvailability =
    proximity && activeTrack
      ? getTrackAvailabilityLabel(proximity, activeTrack)
      : proximity
        ? getTrackAvailabilityLabel(proximity, null)
        : "NO TRACK TRIGGERED YET";
  const actionLabel = getActionLabel({
    isActiveTrackCurrent,
    isActiveTrackPlaying,
  });
  const activeTrackTags =
    activeTrack?.tags
      .filter(
        (tag) =>
          tag.toLowerCase() !== activeTrack.publishedLabel.toLowerCase()
      )
      .slice(0, 3) ?? [];
  const activeTrackMeta = activeTrack
    ? [activeTrack.publishedLabel, activeTrack.duration].filter(Boolean)
    : [];

  return (
    <aside
      className="pointer-events-auto rounded-[3px] bg-white/38 px-3 py-2.5 ring-1 ring-black/5 backdrop-blur-md"
      aria-label="Drift 3D proximity HUD"
      onPointerDown={(event) => event.stopPropagation()}
      onTouchStart={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-mono text-[8px] uppercase tracking-[0.3em] text-neutral-500">
            {copy.status}
          </p>

          <p className="mt-1 truncate font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-900">
            {copy.title}
          </p>
        </div>

        <div className="shrink-0 text-right font-mono text-[8px] uppercase tracking-[0.16em] text-neutral-500">
          <p>{distanceLabel}</p>
          <p className="mt-1">{trackAvailability}</p>
        </div>
      </div>

      <p
        className={`mt-2 line-clamp-2 font-mono text-[8px] uppercase leading-4 tracking-[0.12em] text-neutral-600 ${secondaryVisibility}`}
      >
        {copy.detail}
      </p>

      <p
        className={`mt-1 line-clamp-2 font-mono text-[7px] uppercase leading-4 tracking-[0.12em] text-neutral-500 ${secondaryVisibility}`}
      >
        {copy.note}
      </p>

      <div
        className="mt-2 h-px overflow-hidden bg-neutral-200/80"
        aria-hidden="true"
      >
        <span
          className="block h-full bg-neutral-700/80"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {activeTrack && proximity?.isInside ? (
        <>
          <div className="mt-3 border-t border-white/55 pt-2.5">
            <div className="flex items-start justify-between gap-3">
              <p className="font-mono text-[9px] uppercase leading-4 tracking-[0.18em] text-neutral-900">
                {activeTrack.title}
              </p>

              {activeTrackMeta.length ? (
                <p className="shrink-0 text-right font-mono text-[7px] uppercase leading-3 tracking-[0.14em] text-neutral-500">
                  {activeTrackMeta.join(" / ")}
                </p>
              ) : null}
            </div>

            {activeTrackTags.length ? (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {activeTrackTags.map((tag) => (
                  <span
                    key={tag}
                    className="border border-white/60 bg-white/35 px-1.5 py-0.5 font-mono text-[6px] uppercase tracking-[0.14em] text-neutral-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}

            <p className="mt-1.5 line-clamp-2 text-[9px] leading-4 text-neutral-600">
              {activeTrack.shortText}
            </p>
          </div>

          <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
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
              className="pointer-events-auto inline-flex min-h-8 items-center justify-center rounded-full border border-neutral-400/50 bg-neutral-900/88 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-white transition hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-900/30"
              aria-label={`${actionLabel} ${activeTrack.title} from ${
                proximity.activeEra?.label ?? "active signal"
              }`}
            >
              {actionLabel}
            </button>

            <Link
              href={`/tracks/${activeTrack.slug}`}
              onClick={(event) => event.stopPropagation()}
              onPointerDown={(event) => event.stopPropagation()}
              onPointerMove={(event) => event.stopPropagation()}
              onPointerUp={(event) => event.stopPropagation()}
              onPointerCancel={(event) => event.stopPropagation()}
              className="pointer-events-auto inline-flex min-h-8 items-center justify-center rounded-full border border-white/70 bg-white/65 px-3 py-1.5 text-center font-mono text-[8px] uppercase tracking-[0.18em] text-neutral-800 transition hover:bg-white hover:text-neutral-950 focus:outline-none focus:ring-2 focus:ring-neutral-900/25"
              aria-label={`Open ${activeTrack.title} track page`}
            >
              OPEN NODE
            </Link>
          </div>
        </>
      ) : null}
    </aside>
  );
}
