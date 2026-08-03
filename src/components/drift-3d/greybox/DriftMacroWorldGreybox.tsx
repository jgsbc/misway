"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import {
  DRIFT_3D_MACRO_WORLD_ROUTE_ORDER,
  getDrift3DCanonicalMacroWorldConfigIssues,
  getDrift3DCanonicalMacroWorldFallbackIssues,
  getDrift3DCanonicalMacroWorldTransitionIssues,
  getDrift3DMacroWorldConfig,
  getDrift3DMacroWorldFallbackCards,
  type Drift3DMacroWorldId,
} from "@/lib/drift3dMacroWorldConfig";
import { getDrift3DMacroWorldRouteProjection } from "@/lib/drift3dMacroWorldRoute";
import {
  createDrift3DMacroWorldGreyboxStatus,
  type Drift3DMacroWorldGreyboxStatus,
} from "@/lib/drift3dMacroWorldGreyboxHarness";
import {
  DRIFT_3D_QUALITY_TIERS,
  getDrift3DQualityProfile,
  type Drift3DQualityTier,
} from "@/lib/drift3dQuality";
import {
  createDrift3DEvidenceRuntimeRef,
  createDrift3DPerformanceSnapshot,
  resolveDrift3DEvidenceVisibility,
  type Drift3DEvidenceRuntimeRef,
} from "@/lib/drift3dEvidence";
import { getDrift3DDragDriveInput } from "@/lib/drift3d";
import type { Drift3DPointerDriveState } from "@/lib/drift3d";
import { createDrift3DVehiclePhysicsState } from "@/lib/drift3dVehiclePhysics";
import type { Drift3DVehiclePhysicsState } from "@/lib/drift3dVehiclePhysics";

const DriftMacroWorldGreyboxCanvasView = dynamic(
  () => import("@/components/drift-3d/greybox/DriftMacroWorldGreyboxCanvasView"),
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

const WORLD_LABEL: Record<Drift3DMacroWorldId, string> = {
  entry: "Entry",
  "birth-yard": "Birth Yard",
  "older-shadows": "Older Shadows",
  "vegetative-field": "Vegetative Field",
  "new-signal": "New Signal",
};


export default function DriftMacroWorldGreybox() {
  const [hasWebGL, setHasWebGL] = useState<boolean | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean | null>(
    null
  );
  const [qualityTier, setQualityTier] = useState<Drift3DQualityTier>("high");
  const [diagnosticsSnapshot, setDiagnosticsSnapshot] = useState<{
    status: Drift3DMacroWorldGreyboxStatus;
    memory: { geometries: number; textures: number };
    render: { drawCalls: number | null; triangles: number | null };
  } | null>(null);

  const [evidenceRuntimeRef] = useState<Drift3DEvidenceRuntimeRef>(
    createDrift3DEvidenceRuntimeRef
  );
  const statusRef = useRef(createDrift3DMacroWorldGreyboxStatus());
  const memoryRef = useRef({ geometries: 0, textures: 0 });
  const vehicleStateRef = useRef<Drift3DVehiclePhysicsState>(
    createDrift3DVehiclePhysicsState({ x: 0, y: 0, z: 0 }, 0)
  );
  const pointerDriveStateRef = useRef<Drift3DPointerDriveState>({
    active: false,
    pointerId: null,
    origin: null,
    input: { x: 0, z: 0, active: false },
  });
  const teleportRequestRef = useRef<{ x: number; z: number } | null>(null);
  const resetRequestRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (!cancelled) setHasWebGL(canUseWebGL());
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (!window.matchMedia) {
      queueMicrotask(() => {
        if (!cancelled) setPrefersReducedMotion(false);
      });

      return () => {
        cancelled = true;
      };
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    function sync() {
      queueMicrotask(() => {
        if (!cancelled) setPrefersReducedMotion(mediaQuery.matches);
      });
    }

    sync();
    mediaQuery.addEventListener("change", sync);

    return () => {
      cancelled = true;
      mediaQuery.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;

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

  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;

    const probe = Object.freeze({
      status: () => ({ ...statusRef.current }),
      memory: () => ({ ...memoryRef.current }),
      qualityTier: () => qualityTier,
      reducedMotion: () => prefersReducedMotion === true,
      evidenceSnapshot: () =>
        createDrift3DPerformanceSnapshot(
          evidenceRuntimeRef,
          resolveDrift3DEvidenceVisibility(document.visibilityState)
        ),
      routeOrder: DRIFT_3D_MACRO_WORLD_ROUTE_ORDER,
      qualityTiers: DRIFT_3D_QUALITY_TIERS,
      teleportTo: (worldId: string) => {
        const config = DRIFT_3D_MACRO_WORLD_ROUTE_ORDER.includes(
          worldId as Drift3DMacroWorldId
        )
          ? getDrift3DMacroWorldConfig(worldId as Drift3DMacroWorldId)
          : null;
        if (!config) return false;
        teleportRequestRef.current = {
          x: config.localOrigin.x + config.spawnOffset.x,
          z: config.localOrigin.z + config.spawnOffset.z,
        };

        return true;
      },
      reset: () => {
        resetRequestRef.current = true;
      },
      routeProjectionAt: (x: number, z: number) =>
        getDrift3DMacroWorldRouteProjection({ x, z }),
      validateConfig: () => getDrift3DCanonicalMacroWorldConfigIssues(),
      validateTransitions: () => getDrift3DCanonicalMacroWorldTransitionIssues(),
      validateFallbackCards: () => getDrift3DCanonicalMacroWorldFallbackIssues(),
    });

    Object.defineProperty(window, "__drift3dMacroWorldGreybox", {
      configurable: true,
      value: probe,
    });

    return () => {
      if (
        (window as unknown as Record<string, unknown>)
          .__drift3dMacroWorldGreybox === probe
      ) {
        delete (window as unknown as Record<string, unknown>)
          .__drift3dMacroWorldGreybox;
      }
    };
  }, [qualityTier, prefersReducedMotion, evidenceRuntimeRef]);

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0 && event.pointerType !== "touch") return;
    if (pointerDriveStateRef.current.pointerId !== null) return;

    pointerDriveStateRef.current = {
      active: false,
      pointerId: event.pointerId,
      origin: { x: event.clientX, y: event.clientY },
      input: { x: 0, z: 0, active: false },
    };

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // ignore
    }
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drive = pointerDriveStateRef.current;
    if (drive.pointerId !== event.pointerId || !drive.origin) return;

    const nextInput = getDrift3DDragDriveInput(drive.origin, {
      x: event.clientX,
      y: event.clientY,
    });
    pointerDriveStateRef.current = {
      ...drive,
      active: nextInput.active,
      input: nextInput,
    };
  }

  function releasePointer(event: ReactPointerEvent<HTMLDivElement>) {
    if (pointerDriveStateRef.current.pointerId !== event.pointerId) return;
    pointerDriveStateRef.current = {
      active: false,
      pointerId: null,
      origin: null,
      input: { x: 0, z: 0, active: false },
    };
  }

  const checking = hasWebGL === null || prefersReducedMotion === null;
  const reducedMotion = prefersReducedMotion === true;
  const qualityProfile = useMemo(
    () => getDrift3DQualityProfile(qualityTier),
    [qualityTier]
  );

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
          <DriftGreyboxNoWebGL />
        ) : (
          <>
            <DriftMacroWorldGreyboxCanvasView
              vehicleStateRef={vehicleStateRef}
              pointerDriveStateRef={pointerDriveStateRef}
              teleportRequestRef={teleportRequestRef}
              resetRequestRef={resetRequestRef}
              qualityTier={qualityTier}
              reducedMotion={reducedMotion}
              evidenceRuntimeRef={evidenceRuntimeRef}
              memoryRef={memoryRef}
              statusRef={statusRef}
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 z-10 touch-none cursor-grab select-none"
              onPointerDownCapture={handlePointerDown}
              onPointerMoveCapture={handlePointerMove}
              onPointerUpCapture={releasePointer}
              onPointerCancelCapture={releasePointer}
            />
            {reducedMotion ? (
              <div className="pointer-events-none absolute left-1/2 top-4 z-20 -translate-x-1/2 rounded-full bg-white/70 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.24em] text-neutral-700 backdrop-blur">
                Reduced motion — traffic/crowd/water held static
              </div>
            ) : null}
          </>
        )}
      </div>

      <div className="pointer-events-none absolute left-[calc(1rem+env(safe-area-inset-left))] top-[calc(1rem+env(safe-area-inset-top))] z-20 max-w-[min(70vw,20rem)] md:left-6 md:top-6">
        <p className="font-mono text-[9px] uppercase tracking-[0.34em] text-neutral-500">
          MISWΛY · Drift Greybox Lab
        </p>
        <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-400">
          DRIFT-IV-PRE-40 readiness greybox — not production Drift
        </p>
      </div>

      {!checking && hasWebGL ? (
        <div className="pointer-events-none absolute bottom-[calc(1rem+env(safe-area-inset-bottom))] left-1/2 z-20 flex -translate-x-1/2 flex-wrap justify-center gap-2 md:bottom-6">
          {DRIFT_3D_MACRO_WORLD_ROUTE_ORDER.map((worldId) => (
            <button
              key={worldId}
              type="button"
              data-testid={`drift-greybox-teleport-${worldId}`}
              onClick={() => {
                const config = getDrift3DMacroWorldConfig(worldId);
                teleportRequestRef.current = {
                  x: config.localOrigin.x + config.spawnOffset.x,
                  z: config.localOrigin.z + config.spawnOffset.z,
                };
              }}
              className="pointer-events-auto inline-flex min-h-9 items-center justify-center rounded-full border border-neutral-400/60 bg-white/60 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-800 backdrop-blur-md transition hover:bg-white/80"
            >
              {WORLD_LABEL[worldId]}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              resetRequestRef.current = true;
            }}
            className="pointer-events-auto inline-flex min-h-9 items-center justify-center rounded-full border border-neutral-900 bg-neutral-900 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-white backdrop-blur-md transition hover:bg-neutral-800"
          >
            Reset
          </button>
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

      {process.env.NODE_ENV !== "production" && !checking && hasWebGL && diagnosticsSnapshot ? (
        <DriftGreyboxDiagnostics
          qualityTier={qualityTier}
          qualityScales={qualityProfile.capabilities}
          onQualityTierChange={setQualityTier}
          snapshot={diagnosticsSnapshot}
        />
      ) : null}
    </main>
  );
}

function DriftGreyboxNoWebGL() {
  return (
    <div className="flex h-full items-center justify-center overflow-y-auto p-4 md:p-6">
      <section className="light-border light-card-bg w-full max-w-3xl border p-5 md:p-7">
        <p className="light-text-tertiary font-mono text-[10px] uppercase tracking-[0.28em]">
          No WebGL
        </p>
        <h2 className="light-text-primary mt-4 text-xl font-semibold tracking-tight md:text-2xl">
          This browser cannot open the greybox lab.
        </h2>
        <p className="light-text-secondary mt-3 max-w-2xl text-sm leading-6">
          This is a macro-world readiness representation only — a technical
          spatial proof, not final Drift art. No 3D interaction or driving is
          available here.
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {getDrift3DMacroWorldFallbackCards().map((card) => (
            <div key={card.worldId} className="light-border border p-4">
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

function DriftGreyboxDiagnostics({
  qualityTier,
  qualityScales,
  onQualityTierChange,
  snapshot,
}: {
  qualityTier: Drift3DQualityTier;
  qualityScales: { populationScale: number; backgroundDetailScale: number; scatterScale: number };
  onQualityTierChange: (tier: Drift3DQualityTier) => void;
  snapshot: {
    status: Drift3DMacroWorldGreyboxStatus;
    memory: { geometries: number; textures: number };
    render: { drawCalls: number | null; triangles: number | null };
  };
}) {
  const { status, memory, render } = snapshot;

  return (
    <div className="pointer-events-auto absolute bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-[calc(1rem+env(safe-area-inset-left))] z-20 w-[min(90vw,20rem)] rounded-md border border-neutral-400/50 bg-white/85 p-3 font-mono text-[9px] leading-4 text-neutral-800 backdrop-blur-md md:bottom-6 md:left-6">
      <p className="uppercase tracking-[0.2em] text-neutral-500">
        Dev diagnostics (not shown in production)
      </p>
      <dl className="mt-2 grid grid-cols-2 gap-x-2 gap-y-0.5">
        <dt className="text-neutral-500">world</dt>
        <dd>{status.activeMacroWorld}</dd>
        <dt className="text-neutral-500">transition</dt>
        <dd className="truncate">{status.currentTransition ?? "—"}</dd>
        <dt className="text-neutral-500">route progress</dt>
        <dd>{(status.routeProgress * 100).toFixed(1)}%</dd>
        <dt className="text-neutral-500">position</dt>
        <dd>
          {status.playerPosition.x.toFixed(1)}, {status.playerPosition.z.toFixed(1)}
        </dd>
        <dt className="text-neutral-500">speed</dt>
        <dd>{status.playerSpeed.toFixed(2)}</dd>
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
        <dt className="text-neutral-500">scatter×</dt>
        <dd>{qualityScales.scatterScale.toFixed(2)}</dd>
        <dt className="text-neutral-500">assets</dt>
        <dd>{status.loadedResourceIds.length}</dd>
        <dt className="text-neutral-500">errors</dt>
        <dd>{status.assetLoadErrors.length}</dd>
        <dt className="text-neutral-500">draw calls</dt>
        <dd>{render.drawCalls ?? "—"}</dd>
        <dt className="text-neutral-500">triangles</dt>
        <dd>{render.triangles ?? "—"}</dd>
        <dt className="text-neutral-500">geometries</dt>
        <dd>{memory.geometries}</dd>
        <dt className="text-neutral-500">textures</dt>
        <dd>{memory.textures}</dd>
        <dt className="text-neutral-500">transitions</dt>
        <dd>{status.transitionCount}</dd>
        <dt className="text-neutral-500">resets</dt>
        <dd>{status.resetCount}</dd>
        <dt className="text-neutral-500">disposals</dt>
        <dd>{status.disposalCount}</dd>
        <dt className="text-neutral-500">boundary violations</dt>
        <dd>{status.worldBoundaryViolationCount}</dd>
      </dl>
    </div>
  );
}
