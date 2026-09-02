"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useAudioPlayerRuntime } from "@/components/audio/AudioPlayerProvider";
import Drift3DFallback, {
  type Drift3DFallbackReason,
} from "@/components/drift-3d/Drift3DFallback";
import EuxGainentFallbackScene from "@/components/drift-3d/EuxGainentFallbackScene";
import { DRIFT_3D_WORLD_SUMMARY } from "@/components/drift-3d/Drift3DNoWebGLPath";
import {
  getDrift3DCanonicalNoWebGLIssues,
  getDrift3DNoWebGLNarrativePath,
  getDrift3DNoWebGLPathIssues,
  type Drift3DNoWebGLNarrativePathCandidate,
} from "@/lib/drift3dNoWebGL";
import {
  DRIFT_3D_REDUCED_MOTION_MODES,
  getDrift3DCanonicalReducedMotionIssues,
  getDrift3DReducedMotionPolicy,
  getDrift3DReducedMotionPolicyIssues,
  isDrift3DReducedMotionMode,
  resolveDrift3DReducedMotionMode,
  type Drift3DReducedMotionMode,
  type Drift3DReducedMotionPolicyCandidate,
} from "@/lib/drift3dReducedMotion";
import {
  DRIFT_3D_EVIDENCE_CLASSIFICATIONS,
  beginDrift3DFpsSample,
  computeDrift3DFps,
  createDrift3DEvidenceRuntimeRef,
  createDrift3DPerformanceSnapshot,
  endDrift3DFpsSample,
  getDrift3DFpsSampleIssues,
  getDrift3DPerformanceSnapshotIssues,
  isDrift3DEvidenceClassification,
  resolveDrift3DEvidenceVisibility,
  type Drift3DEvidenceRuntimeRef,
  type Drift3DFpsSampleCandidate,
  type Drift3DFpsSampleToken,
  type Drift3DPerformanceSnapshotCandidate,
} from "@/lib/drift3dEvidence";
import { DRIFT_STARTUP_RELEASE_EVENT } from "@/lib/driftStartup";

const DriftEvolutionCanvas = dynamic(
  () => import("@/components/drift-evolution/DriftEvolutionCanvas"),
  {
    ssr: false,
    loading: () => null,
  }
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

export default function DriftEvolutionRuntimeClient() {
  const {
    current,
    isPlaying,
    toggleTrack,
    togglePlayback,
    isCurrentTrack,
    audioClockRef,
  } = useAudioPlayerRuntime();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean | null>(null);
  const [hasWebGL, setHasWebGL] = useState<boolean | null>(null);
  const currentTrack = current.kind === "track" ? current : null;
  const [evidenceRuntimeRef] = useState<Drift3DEvidenceRuntimeRef>(
    createDrift3DEvidenceRuntimeRef
  );

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
    function syncReducedMotionPreference() {
      queueMicrotask(() => {
        if (!cancelled) setPrefersReducedMotion(mediaQuery.matches);
      });
    }
    syncReducedMotionPreference();
    mediaQuery.addEventListener("change", syncReducedMotionPreference);
    return () => {
      cancelled = true;
      mediaQuery.removeEventListener("change", syncReducedMotionPreference);
    };
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const probe = Object.freeze({
      modes: DRIFT_3D_REDUCED_MOTION_MODES,
      resolveMode: (value: boolean) => resolveDrift3DReducedMotionMode(value),
      getPolicy: (mode: string) =>
        isDrift3DReducedMotionMode(mode) ? getDrift3DReducedMotionPolicy(mode) : null,
      validate: (policy: Drift3DReducedMotionPolicyCandidate) =>
        getDrift3DReducedMotionPolicyIssues(policy),
      validateCanonical: () => getDrift3DCanonicalReducedMotionIssues(),
    });
    Object.defineProperty(window, "__drift3dReducedMotion", {
      configurable: true,
      value: probe,
    });
    return () => {
      if ((window as unknown as Record<string, unknown>).__drift3dReducedMotion === probe) {
        delete (window as unknown as Record<string, unknown>).__drift3dReducedMotion;
      }
    };
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const probe = Object.freeze({
      getPath: () => getDrift3DNoWebGLNarrativePath(),
      validate: (path: Drift3DNoWebGLNarrativePathCandidate) =>
        getDrift3DNoWebGLPathIssues(path),
      validateCanonical: () => getDrift3DCanonicalNoWebGLIssues(),
    });
    Object.defineProperty(window, "__drift3dNoWebGL", {
      configurable: true,
      value: probe,
    });
    return () => {
      if ((window as unknown as Record<string, unknown>).__drift3dNoWebGL === probe) {
        delete (window as unknown as Record<string, unknown>).__drift3dNoWebGL;
      }
    };
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const probe = Object.freeze({
      classifications: DRIFT_3D_EVIDENCE_CLASSIFICATIONS,
      snapshot: () =>
        createDrift3DPerformanceSnapshot(
          evidenceRuntimeRef,
          resolveDrift3DEvidenceVisibility(document.visibilityState)
        ),
      beginFpsSample: () =>
        beginDrift3DFpsSample(evidenceRuntimeRef, performance.now()),
      endFpsSample: (token: Drift3DFpsSampleToken) =>
        endDrift3DFpsSample(evidenceRuntimeRef, token, performance.now()),
      computeFps: (frameCount: number, elapsedMs: number) =>
        computeDrift3DFps(frameCount, elapsedMs),
      validateSnapshot: (snapshot: Drift3DPerformanceSnapshotCandidate) =>
        getDrift3DPerformanceSnapshotIssues(snapshot),
      validateFpsSample: (sample: Drift3DFpsSampleCandidate) =>
        getDrift3DFpsSampleIssues(sample),
      validateClassification: (value: unknown) => isDrift3DEvidenceClassification(value),
    });
    Object.defineProperty(window, "__drift3dEvidence", {
      configurable: true,
      value: probe,
    });
    return () => {
      if ((window as unknown as Record<string, unknown>).__drift3dEvidence === probe) {
        delete (window as unknown as Record<string, unknown>).__drift3dEvidence;
      }
    };
  }, [evidenceRuntimeRef]);

  const reducedMotionMode: Drift3DReducedMotionMode | null =
    prefersReducedMotion === null
      ? null
      : resolveDrift3DReducedMotionMode(prefersReducedMotion);
  const fallbackReason: Drift3DFallbackReason | null =
    reducedMotionMode === null || hasWebGL === null
      ? "checking"
      : reducedMotionMode === "reduced"
        ? "reduced-motion"
        : hasWebGL
          ? null
          : "no-webgl";
  const isStaticFallback =
    fallbackReason === "reduced-motion" || fallbackReason === "no-webgl";

  useEffect(() => {
    if (!isStaticFallback) return;

    const frame = window.requestAnimationFrame(() => {
      window.dispatchEvent(new Event(DRIFT_STARTUP_RELEASE_EVENT));
    });

    return () => window.cancelAnimationFrame(frame);
  }, [isStaticFallback]);

  return (
    <main
      className={`fixed inset-0 isolate overflow-hidden ${
        isStaticFallback
          ? "bg-[#f5f0e7] text-neutral-950"
          : "bg-black text-white"
      }`}
    >
      <p id="drift-3d-description" className="sr-only">
        {DRIFT_3D_WORLD_SUMMARY} Keyboard arrows, WASD or ZQSD drive the 4x4;
        up, W or Z drives forward and down or S reverses. Mouse drag or touch
        drag steers and controls throttle; mouse wheel adjusts camera distance.
        Playable places expose an explicit audio button and nothing plays on
        its own.
      </p>

      <div className="absolute inset-0">
        {fallbackReason === "checking" ? null : fallbackReason ? (
          <div className="absolute inset-0 flex items-center justify-center overflow-y-auto p-4 md:p-6">
            <div className="w-full max-w-2xl">
              <Drift3DFallback reason={fallbackReason} />
              <EuxGainentFallbackScene />
            </div>
          </div>
        ) : (
          <DriftEvolutionCanvas
            isCurrentTrack={isCurrentTrack}
            isPlaying={isPlaying}
            currentTrack={currentTrack}
            toggleTrack={toggleTrack}
            togglePlayback={togglePlayback}
            audioClockRef={audioClockRef}
            evidenceRuntimeRef={evidenceRuntimeRef}
          />
        )}
      </div>

      {!fallbackReason ? (
        <>
          <div className="pointer-events-none absolute left-[calc(1rem+env(safe-area-inset-left))] top-[calc(1rem+env(safe-area-inset-top))] z-20 max-w-[min(58vw,16rem)] md:left-6 md:top-6 md:max-w-[16rem]">
            <p className="font-mono text-[9px] uppercase tracking-[0.34em] text-neutral-400">
              MISWΛY · Drift
            </p>
            <p className="mt-2 max-w-[16rem] font-mono text-[10px] uppercase leading-4 tracking-[0.12em] text-white/60 md:text-[11px] md:leading-5 md:tracking-[0.08em]">
              <span className="md:hidden">Drag ↑ drive · ↓ reverse</span>
              <span className="hidden md:inline">
                WASD / ZQSD / arrows · ↓ / S reverse · drag · wheel
              </span>
            </p>
          </div>
        </>
      ) : null}
    </main>
  );
}
