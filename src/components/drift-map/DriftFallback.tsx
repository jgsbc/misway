import Link from "next/link";
import type { DriftZoneConfig } from "@/types/drift";
import type { Track } from "@/lib/tracks";

type DriftFallbackProps = {
  zones: readonly DriftZoneConfig[];
  getTrackForZone: (zone: DriftZoneConfig) => Track | null;
  isCurrentTrack: (track: Track) => boolean;
  isPlaying: boolean;
  onToggleTrack: (track: Track) => void;
  prefersReducedMotion: boolean;
};

function getFallbackActionLabel({
  isCurrent,
  isPlaying,
}: {
  isCurrent: boolean;
  isPlaying: boolean;
}) {
  if (!isCurrent) {
    return "LISTEN";
  }

  return isPlaying ? "PAUSE" : "RESUME";
}

export default function DriftFallback({
  zones,
  getTrackForZone,
  isCurrentTrack,
  isPlaying,
  onToggleTrack,
  prefersReducedMotion,
}: DriftFallbackProps) {
  const playableZones = zones
    .map((zone) => ({
      zone,
      track: getTrackForZone(zone),
    }))
    .filter(
      (item): item is { zone: DriftZoneConfig; track: Track } =>
        item.track !== null
    );

  return (
    <section
      className="light-border light-card-bg mt-6 border p-4 md:p-5"
      aria-labelledby="drift-fallback-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="light-text-tertiary font-mono text-[10px] uppercase tracking-[0.28em]">
            Open List
          </p>
          <h2
            id="drift-fallback-heading"
            className="light-text-primary mt-2 font-mono text-sm uppercase tracking-[0.2em]"
          >
            No driving today
          </h2>
        </div>

        <p className="light-text-secondary max-w-sm text-sm leading-6">
          {prefersReducedMotion
            ? "Reduced motion is on. The map can wait."
            : "Same tracks, no steering wheel."}
        </p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {playableZones.map(({ zone, track }) => {
          const isCurrent = isCurrentTrack(track);
          const actionLabel = getFallbackActionLabel({
            isCurrent,
            isPlaying: isCurrent && isPlaying,
          });

          return (
            <article
              key={zone.id}
              className="border border-neutral-200/85 bg-white/58 p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-500">
                    {zone.label}
                  </p>
                  <h3 className="mt-1 font-mono text-[11px] uppercase leading-4 tracking-[0.16em] text-neutral-900">
                    {track.title}
                  </h3>
                </div>

                {track.duration ? (
                  <p className="shrink-0 font-mono text-[8px] uppercase tracking-[0.14em] text-neutral-500">
                    {track.duration}
                  </p>
                ) : null}
              </div>

              <p className="mt-2 line-clamp-2 text-[11px] leading-5 text-neutral-600">
                {zone.microcopy[0] ?? track.shortText}
              </p>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onToggleTrack(track)}
                  className="inline-flex min-h-10 items-center justify-center border border-neutral-400/70 bg-neutral-900 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white transition hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-900/30"
                  aria-label={`${actionLabel} ${track.title} from ${zone.label}`}
                >
                  {actionLabel}
                </button>

                <Link
                  href={`/tracks/${track.slug}`}
                  className="inline-flex min-h-10 items-center justify-center border border-neutral-300/80 bg-white/70 px-3 py-2 text-center font-mono text-[9px] uppercase tracking-[0.16em] text-neutral-800 transition hover:bg-white hover:text-neutral-950 focus:outline-none focus:ring-2 focus:ring-neutral-900/25"
                  aria-label={`Open ${track.title} track page`}
                >
                  OPEN NODE
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
