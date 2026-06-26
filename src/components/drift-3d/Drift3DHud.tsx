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
  prefersReducedMotion: boolean;
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
  prefersReducedMotion,
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
      className="border border-neutral-300/75 bg-white/78 p-3 shadow-[0_18px_40px_rgba(55,49,42,0.12)] backdrop-blur-md md:p-4"
      aria-label="Drift 3D proximity HUD"
      onPointerDown={(event) => event.stopPropagation()}
      onTouchStart={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-neutral-500">
        {copy.status}
      </p>

      <p className="mt-2 truncate font-mono text-xs uppercase tracking-[0.18em] text-neutral-900 md:text-sm">
        {copy.title}
      </p>

      <p className="mt-2 line-clamp-2 font-mono text-[9px] uppercase leading-4 tracking-[0.12em] text-neutral-600 md:text-[10px]">
        {copy.detail}
      </p>

      <p className="mt-1 line-clamp-2 font-mono text-[8px] uppercase leading-4 tracking-[0.12em] text-neutral-500 md:text-[9px]">
        {copy.note}
      </p>

      <div className="mt-3 flex items-center justify-between gap-3 font-mono text-[8px] uppercase tracking-[0.16em] text-neutral-500 md:text-[9px]">
        <span>{distanceLabel}</span>
        <span>{trackAvailability}</span>
      </div>

      {prefersReducedMotion ? (
        <p className="mt-2 font-mono text-[8px] uppercase leading-3 tracking-[0.16em] text-neutral-500 md:text-[9px]">
          List path below
        </p>
      ) : null}

      {activeTrack && proximity?.isInside ? (
        <>
          <div className="mt-3 border-t border-neutral-200/80 pt-3">
            <div className="flex items-start justify-between gap-3">
              <p className="font-mono text-[10px] uppercase leading-4 tracking-[0.18em] text-neutral-900 md:text-[11px]">
                {activeTrack.title}
              </p>

              {activeTrackMeta.length ? (
                <p className="shrink-0 text-right font-mono text-[7px] uppercase leading-3 tracking-[0.14em] text-neutral-500 md:text-[8px]">
                  {activeTrackMeta.join(" / ")}
                </p>
              ) : null}
            </div>

            {activeTrackTags.length ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {activeTrackTags.map((tag) => (
                  <span
                    key={tag}
                    className="border border-neutral-300/70 bg-white/45 px-1.5 py-0.5 font-mono text-[6px] uppercase tracking-[0.14em] text-neutral-600 md:text-[7px]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}

            <p className="mt-2 line-clamp-2 text-[10px] leading-4 text-neutral-600 md:text-[11px]">
              {activeTrack.shortText}
            </p>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
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
              className="pointer-events-auto inline-flex min-h-9 items-center justify-center border border-neutral-400/70 bg-neutral-900 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white transition hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-900/30"
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
              className="pointer-events-auto inline-flex min-h-9 items-center justify-center border border-neutral-300/80 bg-white/70 px-3 py-2 text-center font-mono text-[9px] uppercase tracking-[0.18em] text-neutral-800 transition hover:bg-white hover:text-neutral-950 focus:outline-none focus:ring-2 focus:ring-neutral-900/25"
              aria-label={`Open ${activeTrack.title} track page`}
            >
              OPEN NODE
            </Link>
          </div>
        </>
      ) : null}

      <div
        className="mt-2 h-px overflow-hidden bg-neutral-200"
        aria-hidden="true"
      >
        <span
          className="block h-full bg-neutral-700"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </aside>
  );
}
