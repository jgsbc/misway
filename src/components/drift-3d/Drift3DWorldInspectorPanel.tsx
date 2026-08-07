"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type {
  Drift3DInspectorSnapshot,
  Drift3DWorldInspectorProbe,
} from "@/lib/drift3dInspector";

function getProbe() {
  return (
    window as unknown as {
      __drift3dWorldInspector?: Drift3DWorldInspectorProbe;
    }
  ).__drift3dWorldInspector;
}

function format(value: number, digits = 2) {
  return Number.isFinite(value) ? value.toFixed(digits) : "—";
}

export default function Drift3DWorldInspectorPanel() {
  const [snapshot, setSnapshot] = useState<Drift3DInspectorSnapshot | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    function refresh() {
      const probe = getProbe();

      if (!probe) {
        setReady(false);
        return;
      }

      setReady(true);
      setSnapshot(probe.snapshot());
    }

    refresh();
    const interval = window.setInterval(refresh, 250);

    return () => window.clearInterval(interval);
  }, []);

  const probe = typeof window === "undefined" ? undefined : getProbe();

  function teleport(id: string) {
    const current = getProbe();

    if (current?.teleport(id)) {
      setSnapshot(current.snapshot());
    }
  }

  function toggleView() {
    const current = getProbe();

    if (!current) {
      return;
    }

    current.setViewMode(
      current.getViewMode() === "chase" ? "top-down" : "chase"
    );
    setSnapshot(current.snapshot());
  }

  return (
    <aside className="pointer-events-auto fixed left-4 top-20 z-[100] w-[min(22rem,calc(100vw-2rem))] max-h-[calc(100vh-6rem)] overflow-y-auto border border-white/20 bg-black/78 p-3 font-mono text-[10px] leading-4 text-white shadow-2xl backdrop-blur-md md:left-6 md:top-24">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="uppercase tracking-[0.24em] text-white/55">MISWΛY</p>
          <h1 className="mt-1 text-[12px] uppercase tracking-[0.18em]">
            World Inspector
          </h1>
        </div>
        <Link
          href="/drift"
          className="border border-white/25 px-2 py-1 uppercase tracking-[0.14em] text-white/75 hover:bg-white/10"
        >
          Drift
        </Link>
      </div>

      {!ready || !snapshot ? (
        <p className="mt-4 text-white/55">Inspector runtime booting…</p>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-1 border-t border-white/15 pt-3">
            <span className="text-white/45">view</span>
            <span>{snapshot.viewMode}</span>
            <span className="text-white/45">xyz</span>
            <span>
              {format(snapshot.vehicle.x, 1)} / {format(snapshot.vehicle.y, 1)} / {format(snapshot.vehicle.z, 1)}
            </span>
            <span className="text-white/45">speed</span>
            <span>{format(snapshot.vehicle.speed)} m/s</span>
            <span className="text-white/45">heading</span>
            <span>{format(snapshot.vehicle.heading)} rad</span>
            <span className="text-white/45">airborne</span>
            <span>{snapshot.vehicle.airborne ? "yes" : "no"}</span>
            <span className="text-white/45">terrain</span>
            <span>{format(snapshot.ground.terrainHeight)} m</span>
            <span className="text-white/45">water depth</span>
            <span>{format(snapshot.ground.waterDepth)} m</span>
            <span className="text-white/45">region</span>
            <span>{snapshot.spatial.regionId}</span>
            <span className="text-white/45">era</span>
            <span>{snapshot.spatial.eraId}</span>
            <span className="text-white/45">route</span>
            <span>{snapshot.spatial.routeId ?? "none"}</span>
            <span className="text-white/45">route dist.</span>
            <span>{format(snapshot.spatial.routeDistance)} m</span>
            <span className="text-white/45">active node</span>
            <span>{snapshot.spatial.activeNodeId ?? "none"}</span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 border-t border-white/15 pt-3">
            <span className="text-white/45">zoom / cine</span>
            <span>
              {format(snapshot.camera.zoomTarget)} / {format(snapshot.camera.cinematicZoom)}
            </span>
            <span className="text-white/45">cam xyz</span>
            <span>
              {format(snapshot.camera.x, 1)} / {format(snapshot.camera.y, 1)} / {format(snapshot.camera.z, 1)}
            </span>
            <span className="text-white/45">cam target</span>
            <span>
              {format(snapshot.camera.targetX, 1)} / {format(snapshot.camera.targetY, 1)} / {format(snapshot.camera.targetZ, 1)}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 border-t border-white/15 pt-3">
            <span className="text-white/45">draw calls</span>
            <span>{snapshot.render.drawCalls}</span>
            <span className="text-white/45">triangles</span>
            <span>{snapshot.render.triangles.toLocaleString()}</span>
            <span className="text-white/45">geometries</span>
            <span>{snapshot.render.geometries}</span>
            <span className="text-white/45">textures</span>
            <span>{snapshot.render.textures}</span>
          </div>

          <button
            type="button"
            onClick={toggleView}
            className="mt-3 w-full border border-white/25 px-2 py-2 uppercase tracking-[0.16em] hover:bg-white/10"
          >
            {snapshot.viewMode === "chase" ? "Top-down world" : "Return to chase"}
          </button>

          <div className="mt-3 border-t border-white/15 pt-3">
            <p className="mb-2 uppercase tracking-[0.18em] text-white/45">Safe teleports</p>
            <div className="grid grid-cols-2 gap-1.5">
              {(probe?.targets ?? []).map((target) => (
                <button
                  key={target.id}
                  type="button"
                  onClick={() => teleport(target.id)}
                  className="border border-white/20 px-2 py-1.5 text-left uppercase tracking-[0.1em] hover:bg-white/10"
                >
                  {target.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </aside>
  );
}
