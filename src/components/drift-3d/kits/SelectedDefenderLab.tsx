"use client";

import Link from "next/link";
import Script from "next/script";
import { useCallback, useRef, useState } from "react";
import {
  DRIFT_3D_SELECTED_VEHICLE,
  tintDrift3DSelectedVehicleBodyMaterial,
  type Drift3DSketchfabMaterial,
} from "@/lib/drift3dSelectedVehicle";

type SketchfabApi = {
  start: (callback?: () => void) => void;
  addEventListener: (event: string, callback: () => void) => void;
  getMaterialList: (
    callback: (error: unknown, materials: Drift3DSketchfabMaterial[]) => void
  ) => void;
  setMaterial: (
    material: Drift3DSketchfabMaterial,
    callback?: () => void
  ) => void;
};

type SketchfabClient = {
  init: (
    uid: string,
    options: {
      success: (api: SketchfabApi) => void;
      error: () => void;
      autostart: number;
      ui_infos: number;
      ui_help: number;
      ui_controls: number;
      ui_stop: number;
    }
  ) => void;
};

type SketchfabConstructor = new (
  version: string,
  iframe: HTMLIFrameElement
) => SketchfabClient;

declare global {
  interface Window {
    Sketchfab?: SketchfabConstructor;
  }
}

function cloneMaterial(
  material: Drift3DSketchfabMaterial
): Drift3DSketchfabMaterial {
  return JSON.parse(JSON.stringify(material)) as Drift3DSketchfabMaterial;
}

export default function SelectedDefenderLab() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const apiRef = useRef<SketchfabApi | null>(null);
  const originalMaterialsRef = useRef<Drift3DSketchfabMaterial[]>([]);
  const [viewerReady, setViewerReady] = useState(false);
  const [mode, setMode] = useState<"sand" | "original">("sand");
  const [status, setStatus] = useState("Loading selected Defender…");

  const applySafariSand = useCallback((api: SketchfabApi) => {
    api.getMaterialList((error, materials) => {
      if (error || !materials?.length) {
        setStatus("Material list unavailable — source viewer left unchanged.");
        return;
      }

      if (originalMaterialsRef.current.length === 0) {
        originalMaterialsRef.current = materials.map(cloneMaterial);
      }

      const updates = materials
        .map(cloneMaterial)
        .filter((material) => tintDrift3DSelectedVehicleBodyMaterial(material));

      for (const material of updates) {
        api.setMaterial(material);
      }

      setMode("sand");
      setStatus(
        updates.length > 0
          ? `Safari sand applied to ${updates.length} olive body material${updates.length > 1 ? "s" : ""}.`
          : "No olive body material auto-detected — inspect before promotion."
      );
    });
  }, []);

  const initialiseViewer = useCallback(() => {
    const iframe = iframeRef.current;
    const Sketchfab = window.Sketchfab;

    if (!iframe || !Sketchfab || apiRef.current) {
      return;
    }

    const client = new Sketchfab("1.12.1", iframe);
    client.init(DRIFT_3D_SELECTED_VEHICLE.sketchfabModelUid, {
      autostart: 1,
      ui_infos: 0,
      ui_help: 0,
      ui_controls: 1,
      ui_stop: 0,
      success(api) {
        apiRef.current = api;
        api.start();
        api.addEventListener("viewerready", () => {
          setViewerReady(true);
          applySafariSand(api);
        });
      },
      error() {
        setStatus("Sketchfab viewer failed to initialise.");
      },
    });
  }, [applySafariSand]);

  const showOriginal = useCallback(() => {
    const api = apiRef.current;

    if (!api || originalMaterialsRef.current.length === 0) {
      return;
    }

    for (const material of originalMaterialsRef.current) {
      api.setMaterial(cloneMaterial(material));
    }

    setMode("original");
    setStatus("Original olive source materials restored.");
  }, []);

  const showSafariSand = useCallback(() => {
    const api = apiRef.current;

    if (api) {
      applySafariSand(api);
    }
  }, [applySafariSand]);

  return (
    <main className="fixed inset-0 isolate overflow-hidden bg-[#d8d3c8] text-[#191816]">
      <Script
        src="https://static.sketchfab.com/api/sketchfab-viewer-1.12.1.js"
        strategy="afterInteractive"
        onLoad={initialiseViewer}
      />

      <iframe
        ref={iframeRef}
        title="Selected ROH3D Defender D110 colour study"
        src=""
        className="absolute inset-0 h-full w-full border-0"
        allow="autoplay; fullscreen; xr-spatial-tracking"
        allowFullScreen
      />

      <section className="pointer-events-none absolute left-[calc(1rem+env(safe-area-inset-left))] top-[calc(1rem+env(safe-area-inset-top))] z-20 w-[min(90vw,30rem)] md:left-6 md:top-6">
        <div className="rounded-sm border border-black/15 bg-[#eee8da]/88 p-4 shadow-lg backdrop-blur-md md:p-5">
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-black/45">
            MISWΛY · Vehicle selected · Kit Lab only
          </p>
          <h1 className="mt-2 text-lg font-semibold tracking-tight md:text-xl">
            Defender D110 · safari sand study
          </h1>
          <p className="mt-2 text-xs leading-5 text-black/62 md:text-sm">
            Exact owner-selected ROH3D model. Geometry and PBR remain source
            controlled; only olive-painted body materials are tinted to the
            current MISWAY safari sand.
          </p>
          <div className="mt-3 flex items-center gap-3 border-t border-black/10 pt-3">
            <span
              className="h-7 w-7 rounded-full border border-black/20 shadow-inner"
              style={{ backgroundColor: DRIFT_3D_SELECTED_VEHICLE.targetBodyHex }}
              aria-label={`Safari sand ${DRIFT_3D_SELECTED_VEHICLE.targetBodyHex}`}
            />
            <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-black/55">
              <div>{DRIFT_3D_SELECTED_VEHICLE.targetBodyHex}</div>
              <div className="mt-0.5 text-black/75">29,223 tris · commercial source</div>
            </div>
          </div>
          <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.12em] text-black/50">
            {status}
          </p>
        </div>
      </section>

      <div className="absolute bottom-[calc(1rem+env(safe-area-inset-bottom))] left-1/2 z-20 flex -translate-x-1/2 gap-2 md:bottom-6">
        <button
          type="button"
          onClick={showSafariSand}
          disabled={!viewerReady}
          aria-pressed={mode === "sand"}
          className={`min-h-10 rounded-full border px-4 py-2 font-mono text-[9px] uppercase tracking-[0.16em] backdrop-blur-md transition disabled:opacity-40 ${
            mode === "sand"
              ? "border-[#ab9464] bg-[#ab9464] text-black"
              : "border-black/25 bg-[#eee8da]/82 text-black/75"
          }`}
        >
          Safari sand
        </button>
        <button
          type="button"
          onClick={showOriginal}
          disabled={!viewerReady}
          aria-pressed={mode === "original"}
          className={`min-h-10 rounded-full border px-4 py-2 font-mono text-[9px] uppercase tracking-[0.16em] backdrop-blur-md transition disabled:opacity-40 ${
            mode === "original"
              ? "border-black bg-black text-white"
              : "border-black/25 bg-[#eee8da]/82 text-black/75"
          }`}
        >
          Original olive
        </button>
      </div>

      <nav className="absolute right-[calc(1rem+env(safe-area-inset-right))] top-[calc(1rem+env(safe-area-inset-top))] z-20 flex flex-col items-end gap-2 md:right-6 md:top-6">
        <a
          href={DRIFT_3D_SELECTED_VEHICLE.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-black/20 bg-[#eee8da]/85 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-black/70 backdrop-blur-md"
        >
          Source ↗
        </a>
        <Link
          href="/drift-kit-lab/vehicle-candidates/"
          className="rounded-full border border-black/20 bg-[#eee8da]/85 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-black/70 backdrop-blur-md"
        >
          Other candidates
        </Link>
      </nav>

      <p className="pointer-events-none absolute bottom-[calc(4.7rem+env(safe-area-inset-bottom))] left-1/2 z-20 hidden -translate-x-1/2 text-center font-mono text-[8px] uppercase tracking-[0.18em] text-black/40 md:block md:bottom-20">
        VIEWER-ONLY COLOUR STUDY · COMMERCIAL MODEL NOT YET ACQUIRED · NO EVOLUTION CHANGE
      </p>
    </main>
  );
}
