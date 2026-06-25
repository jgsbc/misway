import type { DriftZoneProximity } from "@/lib/driftControls";
import type { Track } from "@/lib/tracks";

type DriftHudProps = {
  proximity: DriftZoneProximity;
  activeTrack: Track | null;
  isActiveTrackCurrent: boolean;
  isActiveTrackPlaying: boolean;
  onToggleActiveTrack: () => void;
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

      {activeTrack ? (
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
          className="pointer-events-auto mt-3 inline-flex min-h-9 w-full items-center justify-center border border-neutral-400/70 bg-neutral-900 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white transition hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-900/30"
          aria-label={`${actionLabel} ${activeTrack.title} from ${
            proximity.activeZone?.label ?? "active zone"
          }`}
        >
          {actionLabel}
        </button>
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
