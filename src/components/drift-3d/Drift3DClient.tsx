"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
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
    <main className="light-theme light-page-bg min-h-screen px-6 pb-64 pt-16 md:px-10 md:pb-48 md:pt-24">
      <section className="mx-auto max-w-6xl">
        <div className="grid gap-5 md:grid-cols-[1fr_0.58fr] md:items-end md:gap-8">
          <div>
            <p className="light-text-tertiary font-mono text-[10px] uppercase tracking-[0.35em]">
              Experimental / Drift 3D Lab
            </p>
            <h1 className="light-text-primary mt-4 max-w-3xl text-3xl font-semibold tracking-tight md:mt-6 md:text-6xl">
              A pale room behind the map.
            </h1>
            <div className="light-text-secondary mt-4 max-w-2xl space-y-2 text-sm leading-6 md:mt-7 md:text-base md:leading-7">
              <p>This is an isolated 3D spike. The 2D lab stays the map.</p>
              <p>No movement, no zones, no local audio controls. One signal only.</p>
            </div>
          </div>

          <div className="light-border light-card-bg border p-4 md:p-5">
            <p className="light-text-tertiary font-mono text-[10px] uppercase tracking-[0.24em]">
              Status
            </p>
            <p className="light-text-primary mt-3 font-mono text-xs uppercase tracking-[0.18em]">
              Client-only Canvas / noindex
            </p>
            <p className="light-text-secondary mt-2 text-sm leading-6">
              Reduced motion and missing WebGL use the quiet path.
            </p>
          </div>
        </div>

        <p id="drift-3d-description" className="sr-only">
          Experimental static 3D preview with a pale plane and one signal
          marker. It does not move and does not control audio.
        </p>

        <div className="mt-7 md:mt-10">
          {fallbackReason ? (
            <Drift3DFallback reason={fallbackReason} />
          ) : (
            <Drift3DCanvas />
          )}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/drift-lab"
            className="light-text-primary light-border hover:light-card-hover inline-flex min-h-[46px] items-center justify-center border px-5 py-3 font-mono text-[11px] uppercase tracking-[0.24em] transition"
          >
            Open 2D Lab
          </Link>

          <Link
            href="/drift"
            className="light-text-secondary light-border hover:light-text-primary inline-flex min-h-[46px] items-center justify-center border px-5 py-3 font-mono text-[11px] uppercase tracking-[0.24em] transition"
          >
            Back to Drift
          </Link>
        </div>
      </section>
    </main>
  );
}
