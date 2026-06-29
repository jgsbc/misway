"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAudioPlayer } from "@/components/audio/AudioPlayerProvider";
import Drift3DFallback, {
  type Drift3DFallbackReason,
} from "@/components/drift-3d/Drift3DFallback";

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
  const { isPlaying, toggleTrack, isCurrentTrack } = useAudioPlayer();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<
    boolean | null
  >(null);
  const [hasWebGL, setHasWebGL] = useState<boolean | null>(null);

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

  const fallbackReason: Drift3DFallbackReason | null =
    prefersReducedMotion === null || hasWebGL === null
      ? "checking"
      : prefersReducedMotion
        ? "reduced-motion"
        : hasWebGL
          ? null
          : "no-webgl";

  return (
    <main className="fixed inset-0 isolate overflow-hidden bg-[#f5f0e7] text-neutral-950">
      <p id="drift-3d-description" className="sr-only">
        Experimental fullscreen 3D preview with a pale plane, eight Drift zone
        landmarks, a follow camera, a compact proximity HUD, and a small
        capsule vehicle that moves with the keyboard. Playable zones expose an
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
            toggleTrack={toggleTrack}
            prefersReducedMotion={false}
          />
        )}
      </div>

      <div className="pointer-events-none absolute left-4 top-4 z-20 max-w-[min(92vw,18rem)] md:left-6 md:top-6">
        <p className="font-mono text-[9px] uppercase tracking-[0.34em] text-neutral-500">
          Experimental / Drift 3D Lab
        </p>
        <h1 className="mt-2 text-[clamp(1.35rem,2.4vw,2.5rem)] font-semibold tracking-tight text-neutral-950">
          Vehicle-led territory.
        </h1>
        <p className="mt-2 max-w-[16rem] text-[13px] leading-5 text-neutral-700 md:text-sm md:leading-6">
          Arrow keys or WASD move the capsule. Zones listen only on click.
        </p>
      </div>

      <div className="pointer-events-none absolute bottom-4 left-4 z-20 flex flex-wrap gap-3 md:bottom-6 md:left-6">
        <Link
          href="/drift-lab"
          className="pointer-events-auto inline-flex min-h-[42px] items-center justify-center border border-neutral-300 bg-white/72 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.22em] text-neutral-800 backdrop-blur-md transition hover:border-neutral-400 hover:bg-white"
        >
          Open 2D Lab
        </Link>

        <Link
          href="/drift"
          className="pointer-events-auto inline-flex min-h-[42px] items-center justify-center border border-neutral-300 bg-white/52 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.22em] text-neutral-700 backdrop-blur-md transition hover:border-neutral-400 hover:bg-white/70 hover:text-neutral-950"
        >
          Back to Drift
        </Link>
      </div>
    </main>
  );
}
