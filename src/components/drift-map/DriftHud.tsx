import type { DriftZoneProximity } from "@/lib/driftControls";

type DriftHudProps = {
  proximity: DriftZoneProximity;
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

export default function DriftHud({ proximity }: DriftHudProps) {
  const zone = proximity.activeZone ?? proximity.nearestZone;
  const microcopy = zone?.microcopy[0] ?? "MOVE UNTIL THE MAP ANSWERS.";
  const distanceLabel =
    proximity.distance === null ? "--" : `${Math.round(proximity.distance)}u`;
  const progressPercent = Math.round(proximity.progress * 100);

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
        <span>NO TRACK TRIGGERED YET</span>
      </div>

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
