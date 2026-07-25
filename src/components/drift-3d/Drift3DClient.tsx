"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAudioPlayerRuntime } from "@/components/audio/AudioPlayerProvider";
import Drift3DFallback, {
  type Drift3DFallbackReason,
} from "@/components/drift-3d/Drift3DFallback";
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

const Drift3DCanvas = dynamic(
  () => import("@/components/drift-3d/Drift3DCanvas"),
  {
    ssr: false,
    loading: () => <Drift3DFallback reason="checking" />,
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

export default function Drift3DClient() {
  const {
    current,
    isPlaying,
    toggleTrack,
    togglePlayback,
    isCurrentTrack,
    audioClockRef,
  } = useAudioPlayerRuntime();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<
    boolean | null
  >(null);
  const [hasWebGL, setHasWebGL] = useState<boolean | null>(null);
  const currentTrack = current.kind === "track" ? current : null;
  // Owned here (the shell), not inside Drift3DCanvas, so the harness below
  // stays available even when the Canvas is absent (reduced-motion,
  // no-WebGL, still checking) — it honestly reports canvasPresent=false in
  // that case rather than disappearing. `useState`'s lazy initializer (not
  // `useRef().current`) keeps this stable across renders without reading a
  // ref during render.
  const [evidenceRuntimeRef] = useState<Drift3DEvidenceRuntimeRef>(
    createDrift3DEvidenceRuntimeRef
  );

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

    function syncReducedMotionPreference() {
      queueMicrotask(() => {
        if (!cancelled) {
          setPrefersReducedMotion(mediaQuery.matches);
        }
      });
    }

    syncReducedMotionPreference();
    mediaQuery.addEventListener("change", syncReducedMotionPreference);

    return () => {
      cancelled = true;
      mediaQuery.removeEventListener("change", syncReducedMotionPreference);
    };
  }, []);

  // Dev-only, read-only reduced-motion harness. Lives here (Drift3DClient,
  // the shell) rather than in Drift3DCanvas: the Canvas is intentionally
  // absent whenever reduced motion is active, so a probe installed there
  // would disappear exactly when it is most useful to inspect. It only
  // lets a caller CALCULATE a mode/policy — it never applies a mode, never
  // toggles the system preference, and issues no scene/audio/lifecycle/
  // quality command of any kind.
  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      return;
    }

    const probe = Object.freeze({
      modes: DRIFT_3D_REDUCED_MOTION_MODES,
      resolveMode: (prefersReducedMotionValue: boolean) =>
        resolveDrift3DReducedMotionMode(prefersReducedMotionValue),
      getPolicy: (mode: string) =>
        isDrift3DReducedMotionMode(mode)
          ? getDrift3DReducedMotionPolicy(mode)
          : null,
      validate: (policy: Drift3DReducedMotionPolicyCandidate) =>
        getDrift3DReducedMotionPolicyIssues(policy),
      validateCanonical: () => getDrift3DCanonicalReducedMotionIssues(),
    });

    Object.defineProperty(window, "__drift3dReducedMotion", {
      configurable: true,
      value: probe,
    });

    return () => {
      // Same simple identity check as the SYS-20/SYS-30/SYS-40 probes.
      if (
        (window as unknown as Record<string, unknown>)
          .__drift3dReducedMotion === probe
      ) {
        delete (window as unknown as Record<string, unknown>)
          .__drift3dReducedMotion;
      }
    };
  }, []);

  // Dev-only, read-only no-WebGL narrative path harness. Same rationale as
  // the reduced-motion harness above: lives at the shell level because the
  // Canvas is intentionally absent whenever this fallback is active. It
  // only lets a caller CALCULATE the contract/validate a candidate — it
  // never applies anything: no forceNoWebGL, no disableWebGL, no
  // setFallback, no navigate, no play/pause.
  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      return;
    }

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
      // Same simple identity check as the other dev probes above.
      if (
        (window as unknown as Record<string, unknown>).__drift3dNoWebGL ===
        probe
      ) {
        delete (window as unknown as Record<string, unknown>)
          .__drift3dNoWebGL;
      }
    };
  }, []);

  // Dev-only evidence/performance harness (DRIFT-IV-SYS-70). Lives here (the
  // shell), reading `evidenceRuntimeRef` — owned above — so it stays present
  // even when Drift3DCanvas is unmounted. It only measures and records: no
  // setTier/forceLow/forceReduced/forceNoWebGL/teleport/play/pause/seek/
  // resetScene/setQuality/setPerformanceTarget/autoOptimize is exposed here
  // or anywhere in drift3dEvidence.ts.
  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      return;
    }

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
      validateClassification: (value: unknown) =>
        isDrift3DEvidenceClassification(value),
    });

    Object.defineProperty(window, "__drift3dEvidence", {
      configurable: true,
      value: probe,
    });

    return () => {
      // Same simple identity check as the other dev probes above.
      if (
        (window as unknown as Record<string, unknown>).__drift3dEvidence ===
        probe
      ) {
        delete (window as unknown as Record<string, unknown>)
          .__drift3dEvidence;
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

  return (
    <main className="fixed inset-0 isolate overflow-hidden bg-[#f5f0e7] text-neutral-950">
      <p id="drift-3d-description" className="sr-only">
        {DRIFT_3D_WORLD_SUMMARY} Keyboard, mouse drag or touch drag to drive,
        mouse wheel to adjust camera distance. Playable places expose an
        explicit audio button and nothing plays on its own.
      </p>

      <div className="absolute inset-0">
        {fallbackReason ? (
          <div className="absolute inset-0 flex items-center justify-center p-4 md:p-6">
            <Drift3DFallback reason={fallbackReason} />
          </div>
        ) : (
          <Drift3DCanvas
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

      <div className="pointer-events-none absolute left-[calc(1rem+env(safe-area-inset-left))] top-[calc(1rem+env(safe-area-inset-top))] z-20 max-w-[min(52vw,15rem)] md:left-6 md:top-6 md:max-w-[15rem]">
        <p className="font-mono text-[9px] uppercase tracking-[0.34em] text-neutral-500">
          MISWΛY · Drift
        </p>
        {/* DRIFT-3D-20B: le tutoriel permanent est masqué sur mobile pour
            dégager la vue ; il reste sur desktop. DRIFT-IV-SYS-60: masqué
            aussi quand un fallback est actif (Canvas absent) pour ne
            jamais promettre une interaction de conduite indisponible. */}
        {!fallbackReason ? (
          <p className="mt-2 hidden max-w-[14rem] text-[12px] leading-5 text-neutral-700 md:block md:text-[13px]">
            ZQSD / WASD / ARROWS / DRAG / WHEEL. Nodes listen only on click.
          </p>
        ) : null}
      </div>

      <div className="pointer-events-none absolute bottom-[calc(1rem+env(safe-area-inset-bottom))] left-[calc(1rem+env(safe-area-inset-left))] z-20 flex flex-wrap gap-2 md:bottom-6 md:left-6 md:gap-3">
        <Link
          href="/"
          className="pointer-events-auto inline-flex min-h-8 items-center justify-center rounded-full border border-neutral-300 bg-white/72 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.22em] text-neutral-800 backdrop-blur-md transition hover:border-neutral-400 hover:bg-white md:min-h-[42px] md:rounded-none md:px-4 md:py-2.5 md:text-[10px]"
        >
          MISWΛY
        </Link>

        <Link
          href="/tracks"
          className="pointer-events-auto inline-flex min-h-8 items-center justify-center rounded-full border border-neutral-300 bg-white/52 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.22em] text-neutral-700 backdrop-blur-md transition hover:border-neutral-400 hover:bg-white/70 hover:text-neutral-950 md:min-h-[42px] md:rounded-none md:px-4 md:py-2.5 md:text-[10px]"
        >
          Tracks
        </Link>
      </div>
    </main>
  );
}
