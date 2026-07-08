import Link from "next/link";
import type { DriftZoneProximity } from "@/lib/driftControls";
import type { Track } from "@/lib/tracks";

type DriftHudProps = {
  proximity: DriftZoneProximity;
  activeTrack: Track | null;
  isActiveTrackCurrent: boolean;
  isActiveTrackPlaying: boolean;
  onToggleActiveTrack: () => void;
  prefersReducedMotion: boolean;
};

function getHudStatus(proximity: DriftZoneProximity) {
  const zone = proximity.activeZone ?? proximity.nearestZone;

  if (!zone) {
    return "NO SIGNAL";
  }

  if (proximity.isInside) {
    return zone.trackSlug === null ? "INSIDE SIGNAL" : "INSIDE ZONE";
  }

  return zone.trackSlug === null ? "NEAREST NODE" : "APPROACHING";
}

function getTrackAvailabilityLabel(
  proximity: DriftZoneProximity,
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

export default function DriftHud({
  proximity,
  activeTrack,
  isActiveTrackCurrent,
  isActiveTrackPlaying,
  onToggleActiveTrack,
  prefersReducedMotion,
}: DriftHudProps) {
  const zone = proximity.activeZone ?? proximity.nearestZone;
  const microcopy = zone?.microcopy[0] ?? "MOVE UNTIL THE MAP ANSWERS.";
  const distanceLabel =
    proximity.distance === null ? "--" : `${Math.round(proximity.distance)}u`;
  const progressPercent = Math.round(proximity.progress * 100);
  const trackAvailability = getTrackAvailabilityLabel(proximity, activeTrack);
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
      className="pointer-events-none absolute left-3 top-3 z-30 w-[min(260px,calc(100%-24px))] border border-neutral-300/75 bg-white/78 p-3 shadow-[0_18px_40px_rgba(55,49,42,0.12)] backdrop-blur-md md:left-4 md:top-4 md:w-72 md:p-4"
      aria-label="Drift Map zone proximity"
    >
      <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-neutral-500">
        {getHudStatus(proximity)}
      </p>

      <p className="mt-2 truncate font-mono text-xs uppercase tracking-[0.18em] text-neutral-900 md:text-sm">
        {zone?.label ?? "Between zones"}
      </p>

      <p className="mt-2 line-clamp-2 font-mono text-[9px] uppercase leading-4 tracking-[0.12em] text-neutral-600 md:text-[10px]">
        {microcopy}
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

      {activeTrack ? (
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

          <div className="mt-3 grid grid-cols-2 gap-2">
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
