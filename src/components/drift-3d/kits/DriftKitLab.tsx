"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  DRIFT_3D_KIT_PILOT_IDS,
  createDrift3DKitPilotStatus,
  getDrift3DKitPilotFallbackCards,
  getDrift3DCanonicalKitPilotFallbackIssues,
  DRIFT_3D_WATER_PRESETS,
  getDrift3DCanonicalWaterPresetIssues,
  type Drift3DKitPilotId,
  type Drift3DWaterPresetId,
} from "@/lib/drift3dKitPilotConfig";
import {
  DRIFT_3D_QUALITY_TIERS,
  getDrift3DQualityProfile,
  type Drift3DQualityTier,
} from "@/lib/drift3dQuality";
import {
  createDrift3DEvidenceRuntimeRef,
  createDrift3DPerformanceSnapshot,
  resolveDrift3DEvidenceVisibility,
  beginDrift3DFpsSample,
  endDrift3DFpsSample,
  type Drift3DEvidenceRuntimeRef,
  type Drift3DFpsSampleToken,
} from "@/lib/drift3dEvidence";
import { getDrift3DCanonicalKitAssetManifestIssues } from "@/lib/drift3dKitAssets";

const DriftKitLabCanvasView = dynamic(
  () => import("@/components/drift-3d/kits/DriftKitLabCanvasView"),
  { ssr: false, loading: () => null }
);

function canUseWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl")
    );
  } catch {
    return false;
  }
}

const PILOT_LABEL: Record<Drift3DKitPilotId, string> = {
  "urban-human": "Urban / Human",
  "nature-movement": "Nature / Movement",
  "water-weather-light": "Water / Weather / Light",
};

export default function DriftKitLab() {
  const [hasWebGL, setHasWebGL] = useState<boolean | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<
    boolean | null
  >(null);
  const [activePilot, setActivePilot] = useState<Drift3DKitPilotId>(
    "urban-human"
  );
  const [qualityTier, setQualityTier] = useState<Drift3DQualityTier>("high");
  const [waterPresetId, setWaterPresetId] = useState<Drift3DWaterPresetId>(
    "calm-canal-seed"
  );

  const [evidenceRuntimeRef] = useState<Drift3DEvidenceRuntimeRef>(
    createDrift3DEvidenceRuntimeRef
  );
  const statusRef = useRef(createDrift3DKitPilotStatus(activePilot));
  const memoryRef = useRef({ geometries: 0, textures: 0 });
  const fpsTokenRef = useRef<Drift3DFpsSampleToken | null>(null);
  const [lastFps, setLastFps] = useState<number | null>(null);
  // Snapshot of the three refs above, refreshed on a throttled interval
  // (never per-frame) — the diagnostics panel below renders only from this
  // plain state, never by reading `.current` during render (React Compiler
  // rejects that; refs may only be read in effects/handlers).
  const [diagnosticsSnapshot, setDiagnosticsSnapshot] = useState<{
    status: ReturnType<typeof createDrift3DKitPilotStatus>;
    memory: { geometries: number; textures: number };
    render: { drawCalls: number | null; triangles: number | null };
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (!cancelled) {
        setHasWebGL(canUseWebGL());
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (!window.matchMedia) {
      queueMicrotask(() => {
        if (!cancelled) {
          setPrefersReducedMotion(false);
        }
      });

      return () => {
        cancelled = true;
      };
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    function sync() {
      queueMicrotask(() => {
        if (!cancelled) {
          setPrefersReducedMotion(mediaQuery.matches);
        }
      });
    }

    sync();
    mediaQuery.addEventListener("change", sync);

    return () => {
      cancelled = true;
      mediaQuery.removeEventListener("change", sync);
    };
  }, []);

  // Resetting the status ref on every pilot switch keeps the diagnostics
  // panel honest across a switch — no stale loaded-asset id or clip name
  // from the pilot that was just unmounted.
  useEffect(() => {
    statusRef.current = createDrift3DKitPilotStatus(activePilot);
  }, [activePilot]);

  // Dev-only diagnostics panel refresh: throttled polling of the mutable
  // refs (statusRef, memoryRef, evidenceRuntimeRef) into a plain snapshot
  // for display only — never a per-frame setState, matching the shared
  // convention every SYS-* dev probe already follows. Reading `.current`
  // here (inside an interval callback) is a valid, non-render read site.
  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      return;
    }

    const interval = window.setInterval(() => {
      setDiagnosticsSnapshot({
        status: { ...statusRef.current },
        memory: { ...memoryRef.current },
        render: {
          drawCalls: evidenceRuntimeRef.current.drawCalls,
          triangles: evidenceRuntimeRef.current.triangles,
        },
      });
    }, 500);

    return () => window.clearInterval(interval);
  }, [evidenceRuntimeRef]);

  // Dev-only, read-only harness: window.__drift3dKitPilots. Mirrors the
  // shape/rationale of every other SYS-* dev probe in this codebase — only
  // lets a caller READ current state; no setTier/forcePilot/teleport/etc.
  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      return;
    }

    const probe = Object.freeze({
      activePilot: () => activePilot,
      qualityTier: () => qualityTier,
      waterPreset: () => waterPresetId,
      status: () => ({ ...statusRef.current }),
      memory: () => ({ ...memoryRef.current }),
      evidenceSnapshot: () =>
        createDrift3DPerformanceSnapshot(
          evidenceRuntimeRef,
          resolveDrift3DEvidenceVisibility(document.visibilityState)
        ),
      beginFpsSample: () => {
        fpsTokenRef.current = beginDrift3DFpsSample(
          evidenceRuntimeRef,
          performance.now()
        );
        return fpsTokenRef.current;
      },
      endFpsSample: () => {
        if (!fpsTokenRef.current) {
          return null;
        }

        const sample = endDrift3DFpsSample(
          evidenceRuntimeRef,
          fpsTokenRef.current,
          performance.now()
        );
        fpsTokenRef.current = null;

        if (sample) {
          setLastFps(sample.fps);
        }

        return sample;
      },
      pilotIds: DRIFT_3D_KIT_PILOT_IDS,
      qualityTiers: DRIFT_3D_QUALITY_TIERS,
      waterPresetIds: DRIFT_3D_WATER_PRESETS.map((preset) => preset.id),
      validateFallbackCards: () => getDrift3DCanonicalKitPilotFallbackIssues(),
      validateWaterPresets: () => getDrift3DCanonicalWaterPresetIssues(),
      validateAssetManifest: () => getDrift3DCanonicalKitAssetManifestIssues(),
    });

    Object.defineProperty(window, "__drift3dKitPilots", {
      configurable: true,
      value: probe,
    });

    return () => {
      if (
        (window as unknown as Record<string, unknown>).__drift3dKitPilots ===
        probe
      ) {
        delete (window as unknown as Record<string, unknown>)
          .__drift3dKitPilots;
      }
    };
  }, [activePilot, qualityTier, waterPresetId, evidenceRuntimeRef]);

  const fallbackCards = useMemo(() => getDrift3DKitPilotFallbackCards(), []);
  const qualityProfile = useMemo(
    () => getDrift3DQualityProfile(qualityTier),
    [qualityTier]
  );

  const checking = hasWebGL === null || prefersReducedMotion === null;
  const reducedMotion = prefersReducedMotion === true;

  return (
    <main className="fixed inset-0 isolate overflow-hidden bg-[#f5f0e7] text-neutral-950">
      <div className="absolute inset-0">
        {checking ? (
          <div className="flex h-full items-center justify-center p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-neutral-500">
              Checking signal…
            </p>
          </div>
        ) : !hasWebGL ? (
          <DriftKitLabNoWebGL cards={fallbackCards} />
        ) : (
          <>
            <DriftKitLabCanvasView
              activePilot={activePilot}
              qualityTier={qualityTier}
              reducedMotion={reducedMotion}
              waterPresetId={waterPresetId}
              evidenceRuntimeRef={evidenceRuntimeRef}
              memoryRef={memoryRef}
              statusRef={statusRef}
            />
            {reducedMotion ? (
              <div className="pointer-events-none absolute left-1/2 top-4 z-20 -translate-x-1/2 rounded-full bg-white/70 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.24em] text-neutral-700 backdrop-blur">
                Reduced motion — poses/traffic/water held static
              </div>
            ) : null}
          </>
        )}
      </div>

      <div className="pointer-events-none absolute left-[calc(1rem+env(safe-area-inset-left))] top-[calc(1rem+env(safe-area-inset-top))] z-20 max-w-[min(70vw,20rem)] md:left-6 md:top-6">
        <p className="font-mono text-[9px] uppercase tracking-[0.34em] text-neutral-500">
          MISWΛY · Drift Kit Lab
        </p>
        <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-400">
          DRIFT-IV-PRE-30 technical pilot — not production Drift
        </p>
      </div>

      {!checking && hasWebGL ? (
        <div className="pointer-events-none absolute bottom-[calc(1rem+env(safe-area-inset-bottom))] left-1/2 z-20 flex -translate-x-1/2 flex-wrap justify-center gap-2 md:bottom-6">
          {DRIFT_3D_KIT_PILOT_IDS.map((pilotId) => (
            <button
              key={pilotId}
              type="button"
              data-testid={`drift-kit-lab-pilot-${pilotId}`}
              onClick={() => setActivePilot(pilotId)}
              className={`pointer-events-auto inline-flex min-h-9 items-center justify-center rounded-full border px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em] backdrop-blur-md transition ${
                activePilot === pilotId
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-400/60 bg-white/60 text-neutral-800 hover:bg-white/80"
              }`}
              aria-pressed={activePilot === pilotId}
            >
              {PILOT_LABEL[pilotId]}
            </button>
          ))}
        </div>
      ) : null}

      <div className="pointer-events-none absolute bottom-[calc(1rem+env(safe-area-inset-bottom))] right-[calc(1rem+env(safe-area-inset-right))] z-20 md:bottom-6 md:right-6">
        <Link
          href="/"
          className="pointer-events-auto inline-flex min-h-8 items-center justify-center rounded-full border border-neutral-300 bg-white/72 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.22em] text-neutral-800 backdrop-blur-md transition hover:border-neutral-400 hover:bg-white"
        >
          Leave lab
        </Link>
      </div>

      {!checking && hasWebGL && activePilot === "water-weather-light" ? (
        <div className="pointer-events-none absolute right-[calc(1rem+env(safe-area-inset-right))] top-[calc(1rem+env(safe-area-inset-top))] z-20 flex flex-col gap-1.5 md:right-6 md:top-6">
          {DRIFT_3D_WATER_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setWaterPresetId(preset.id)}
              className={`pointer-events-auto inline-flex min-h-8 items-center justify-center rounded-full border px-3 py-1 font-mono text-[9px] uppercase tracking-[0.18em] backdrop-blur-md transition ${
                waterPresetId === preset.id
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-400/60 bg-white/60 text-neutral-800 hover:bg-white/80"
              }`}
              aria-pressed={waterPresetId === preset.id}
            >
              {preset.label}
            </button>
          ))}
        </div>
      ) : null}

      {process.env.NODE_ENV !== "production" &&
      !checking &&
      hasWebGL &&
      diagnosticsSnapshot ? (
        <DriftKitLabDiagnostics
          activePilot={activePilot}
          qualityTier={qualityTier}
          qualityScales={qualityProfile.capabilities}
          onQualityTierChange={setQualityTier}
          snapshot={diagnosticsSnapshot}
          lastFps={lastFps}
        />
      ) : null}
    </main>
  );
}

function DriftKitLabNoWebGL({
  cards,
}: {
  cards: ReturnType<typeof getDrift3DKitPilotFallbackCards>;
}) {
  return (
    <div className="flex h-full items-center justify-center overflow-y-auto p-4 md:p-6">
      <section className="light-border light-card-bg w-full max-w-2xl border p-5 md:p-7">
        <p className="light-text-tertiary font-mono text-[10px] uppercase tracking-[0.28em]">
          No WebGL
        </p>
        <h2 className="light-text-primary mt-4 text-xl font-semibold tracking-tight md:text-2xl">
          This browser cannot open the kit lab.
        </h2>
        <p className="light-text-secondary mt-3 max-w-2xl text-sm leading-6">
          These three cards describe what each pilot technically proves. No
          3D interaction is available here.
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.id}
              className="light-border border p-4"
              data-testid={`drift-kit-lab-fallback-card-${card.id}`}
            >
              <p className="light-text-primary font-mono text-[10px] uppercase tracking-[0.2em]">
                {card.title}
              </p>
              <p className="light-text-secondary mt-2 text-xs leading-5">
                {card.whatItProves}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/"
            className="light-text-primary light-border hover:light-card-hover inline-flex min-h-[44px] items-center justify-center border px-4 py-3 font-mono text-[10px] uppercase tracking-[0.22em] transition"
          >
            Leave lab
          </Link>
        </div>
      </section>
    </div>
  );
}

function DriftKitLabDiagnostics({
  activePilot,
  qualityTier,
  qualityScales,
  onQualityTierChange,
  snapshot,
  lastFps,
}: {
  activePilot: Drift3DKitPilotId;
  qualityTier: Drift3DQualityTier;
  qualityScales: { populationScale: number; backgroundDetailScale: number };
  onQualityTierChange: (tier: Drift3DQualityTier) => void;
  snapshot: {
    status: ReturnType<typeof createDrift3DKitPilotStatus>;
    memory: { geometries: number; textures: number };
    render: { drawCalls: number | null; triangles: number | null };
  };
  lastFps: number | null;
}) {
  const { status, memory, render } = snapshot;

  return (
    <div className="pointer-events-auto absolute bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-[calc(1rem+env(safe-area-inset-left))] z-20 w-[min(88vw,19rem)] rounded-md border border-neutral-400/50 bg-white/85 p-3 font-mono text-[9px] leading-4 text-neutral-800 backdrop-blur-md md:bottom-6 md:left-6">
      <p className="uppercase tracking-[0.2em] text-neutral-500">
        Dev diagnostics (not shown in production)
      </p>
      <dl className="mt-2 grid grid-cols-2 gap-x-2 gap-y-0.5">
        <dt className="text-neutral-500">pilot</dt>
        <dd>{activePilot}</dd>
        <dt className="text-neutral-500">tier</dt>
        <dd>
          <div className="flex gap-1">
            {DRIFT_3D_QUALITY_TIERS.map((tier) => (
              <button
                key={tier}
                type="button"
                onClick={() => onQualityTierChange(tier)}
                className={`rounded border px-1 ${
                  tier === qualityTier
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-400"
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        </dd>
        <dt className="text-neutral-500">population×</dt>
        <dd>{qualityScales.populationScale.toFixed(2)}</dd>
        <dt className="text-neutral-500">bg-detail×</dt>
        <dd>{qualityScales.backgroundDetailScale.toFixed(2)}</dd>
        <dt className="text-neutral-500">assets</dt>
        <dd className="truncate" title={status.loadedAssetIds.join(", ")}>
          {status.loadedAssetIds.length}
        </dd>
        <dt className="text-neutral-500">errors</dt>
        <dd>{status.loadErrors.length}</dd>
        <dt className="text-neutral-500">clip</dt>
        <dd>{status.animationClip ?? "—"}</dd>
        <dt className="text-neutral-500">instances</dt>
        <dd>{status.instanceCount}</dd>
        <dt className="text-neutral-500">water preset</dt>
        <dd>{status.waterPreset ?? "—"}</dd>
        <dt className="text-neutral-500">draw calls</dt>
        <dd>{render.drawCalls ?? "—"}</dd>
        <dt className="text-neutral-500">triangles</dt>
        <dd>{render.triangles ?? "—"}</dd>
        <dt className="text-neutral-500">geometries</dt>
        <dd>{memory.geometries}</dd>
        <dt className="text-neutral-500">textures</dt>
        <dd>{memory.textures}</dd>
        <dt className="text-neutral-500">fps sample</dt>
        <dd>{lastFps !== null ? lastFps.toFixed(1) : "—"}</dd>
        <dt className="text-neutral-500">disposals</dt>
        <dd>{status.disposalCount}</dd>
      </dl>
    </div>
  );
}
