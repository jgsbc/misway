"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  DRIFT_3D_REAL_VEHICLE_CANDIDATES,
  getDrift3DVehicleCandidateEmbedUrl,
  type Drift3DVehicleCandidateId,
} from "@/lib/drift3dVehicleCandidates";

export default function VehicleCandidateLab() {
  const [activeId, setActiveId] = useState<Drift3DVehicleCandidateId>(
    "defender-90-kekomag"
  );
  const candidate = useMemo(
    () =>
      DRIFT_3D_REAL_VEHICLE_CANDIDATES.find((item) => item.id === activeId) ??
      DRIFT_3D_REAL_VEHICLE_CANDIDATES[0],
    [activeId]
  );

  if (!candidate) return null;

  return (
    <main className="fixed inset-0 isolate overflow-hidden bg-[#171714] text-[#f3efe5]">
      <div className="absolute inset-0 bg-[#171714]">
        <iframe
          key={candidate.id}
          title={`${candidate.label} interactive 3D candidate`}
          src={getDrift3DVehicleCandidateEmbedUrl(candidate)}
          className="h-full w-full border-0"
          allow="autoplay; fullscreen; xr-spatial-tracking"
          allowFullScreen
        />
      </div>

      <section className="pointer-events-none absolute left-[calc(1rem+env(safe-area-inset-left))] top-[calc(1rem+env(safe-area-inset-top))] z-20 w-[min(88vw,31rem)] md:left-6 md:top-6">
        <div className="rounded-sm border border-white/15 bg-black/70 p-4 shadow-2xl backdrop-blur-md md:p-5">
          <p className="font-mono text-[9px] uppercase tracking-[0.32em] text-white/48">
            MISWΛY · VEH-A01 · real asset shortlist
          </p>
          <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
            <h1 className="text-lg font-semibold tracking-tight md:text-xl">
              {candidate.label}
            </h1>
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#d7bd7b]">
              {candidate.role}
            </span>
          </div>
          <p className="mt-1 text-xs text-white/58">{candidate.family}</p>
          <p className="mt-3 text-xs leading-5 text-white/72 md:text-sm">
            {candidate.note}
          </p>
          <dl className="mt-3 grid grid-cols-3 gap-3 border-t border-white/10 pt-3 font-mono text-[9px] uppercase tracking-[0.12em] text-white/48">
            <div><dt>Triangles</dt><dd className="mt-1 text-white/85">{candidate.triangleCount.toLocaleString("en-US")}</dd></div>
            <div><dt>Licence</dt><dd className="mt-1 text-white/85">{candidate.license}</dd></div>
            <div><dt>Runtime</dt><dd className="mt-1 text-white/85">{candidate.runtimeFit}</dd></div>
          </dl>
        </div>
      </section>

      <nav className="pointer-events-none absolute right-[calc(1rem+env(safe-area-inset-right))] top-[calc(1rem+env(safe-area-inset-top))] z-20 flex flex-col items-end gap-2 md:right-6 md:top-6">
        <Link href="/drift-kit-lab/vehicle/" className="pointer-events-auto rounded-full border border-white/20 bg-black/65 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-white/75 backdrop-blur-md transition hover:bg-black/85">Procedural study</Link>
        <Link href="/drift-kit-lab/" className="pointer-events-auto rounded-full border border-white/20 bg-black/65 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-white/75 backdrop-blur-md transition hover:bg-black/85">Kit lab</Link>
      </nav>

      <div className="pointer-events-none absolute bottom-[calc(1rem+env(safe-area-inset-bottom))] left-1/2 z-20 flex w-[min(94vw,58rem)] -translate-x-1/2 flex-wrap justify-center gap-2 md:bottom-6">
        {DRIFT_3D_REAL_VEHICLE_CANDIDATES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveId(item.id)}
            aria-pressed={activeId === item.id}
            className={`pointer-events-auto min-h-10 rounded-full border px-4 py-2 font-mono text-[9px] uppercase tracking-[0.16em] backdrop-blur-md transition ${activeId === item.id ? "border-[#d7bd7b] bg-[#d7bd7b] text-black" : "border-white/25 bg-black/70 text-white/78 hover:bg-black/90"}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <a href={candidate.sourceUrl} target="_blank" rel="noreferrer" className="absolute bottom-[calc(4.7rem+env(safe-area-inset-bottom))] right-[calc(1rem+env(safe-area-inset-right))] z-20 rounded-full border border-white/15 bg-black/60 px-3 py-1.5 font-mono text-[8px] uppercase tracking-[0.16em] text-white/60 backdrop-blur-md transition hover:text-white md:bottom-20 md:right-6">
        Source / licence ↗
      </a>

      <p className="pointer-events-none absolute bottom-[calc(4.8rem+env(safe-area-inset-bottom))] left-1/2 z-20 hidden -translate-x-1/2 text-center font-mono text-[8px] uppercase tracking-[0.19em] text-white/40 md:block md:bottom-20">
        EXTERNAL VIEWER ONLY · NO MODEL ADOPTED · SELECT ONE BEFORE THREE.JS INTEGRATION
      </p>
    </main>
  );
}
