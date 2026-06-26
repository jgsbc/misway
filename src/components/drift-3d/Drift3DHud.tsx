"use client";

import type { Drift3DZoneProximity } from "@/lib/drift3d";

type Drift3DHudProps = {
  proximity: Drift3DZoneProximity | null;
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

export default function Drift3DHud({ proximity }: Drift3DHudProps) {
  const copy = getHudCopy(proximity);

  return (
    <aside
      aria-label="Drift 3D proximity HUD"
      className="light-border light-card-bg border p-4 md:p-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0 flex-1">
          <p className="light-text-tertiary font-mono text-[10px] uppercase tracking-[0.3em]">
            {copy.status}
          </p>
          <h2 className="light-text-primary mt-3 text-xl font-semibold tracking-tight md:text-2xl">
            {copy.title}
          </h2>
          <p className="light-text-secondary mt-2 max-w-2xl text-sm leading-6">
            {copy.detail}
          </p>
          <p className="light-text-tertiary mt-2 max-w-2xl font-mono text-[10px] uppercase tracking-[0.24em]">
            {copy.note}
          </p>
        </div>

        <div className="sm:w-32">
          <p className="light-text-tertiary font-mono text-[10px] uppercase tracking-[0.3em]">
            Signal
          </p>
          <div className="mt-3 h-1.5 overflow-hidden bg-black/5">
            <div
              className="h-full bg-[#7a8d8b]"
              style={{ width: `${copy.progress}%` }}
            />
          </div>
          <p className="light-text-secondary mt-2 font-mono text-[10px] uppercase tracking-[0.24em]">
            {copy.progress}%
          </p>
        </div>
      </div>
    </aside>
  );
}
