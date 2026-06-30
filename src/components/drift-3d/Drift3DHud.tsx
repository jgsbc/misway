"use client";

import Link from "next/link";
import type { Track } from "@/lib/tracks";
import type { Drift3DZoneProximity } from "@/lib/drift3d";

type Drift3DHudProps = {
  proximity: Drift3DZoneProximity | null;
  activeTrack: Track | null;
  isActiveTrackCurrent: boolean;
  isActiveTrackPlaying: boolean;
  onToggleActiveTrack: () => void;
};

function getHudCopy(proximity: Drift3DZoneProximity | null) {
  const zone = proximity?.activeZone ?? proximity?.nearestZone ?? null;

  if (!zone || !proximity) {
    return {
      status: "CHECKING SIGNAL",
      title: "No lock yet",
      detail: "The room is settling.",
      note: "VISUAL ONLY",
      progress: 0,
    };
  }

  return {
    status: proximity.isInside ? "INSIDE SIGNAL" : "APPROACHING",
    title: zone.label,
    detail: zone.portalLabel,
    note: zone.microcopy[0] ?? "VISUAL ONLY",
    progress: Math.round(proximity.progress * 100),
  };
}

function getTrackAvailabilityLabel(
  proximity: Drift3DZoneProximity,
  activeTrack: Track | null
) {
  if (!proximity.activeZone) {
    return "NO TRACK TRIGGERED YET";
  }

  if (activeTrack) {
    return "TRACK READY";
  }

  return proximity.activeZone.trackSlug ? "TRACK MISSING" : "SIGNAL ONLY";
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
  const copy = getHudCopy(proximity);
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

      <p className="mt-2 line-clamp-2 font-mono text-[8px] uppercase leading-4 tracking-[0.12em] text-neutral-600">
        {copy.detail}
      </p>

      <p className="mt-1 line-clamp-2 font-mono text-[7px] uppercase leading-4 tracking-[0.12em] text-neutral-500">
        {copy.note}
      </p>

      <div className="mt-2 h-px overflow-hidden bg-neutral-200/80" aria-hidden="true">
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
                proximity.activeZone?.label ?? "active zone"
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
