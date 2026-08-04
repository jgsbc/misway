"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createDrift3DVehiclePhysicsState } from "@/lib/drift3dVehiclePhysics";
import type { Drift3DVehiclePhysicsState } from "@/lib/drift3dVehiclePhysics";
import { FableAmbience } from "@/components/drift-3d/fable/fableAudio";
import { ImmersionInput } from "@/components/drift-3d/fable/core/immersionInput";

const FableCanvas = dynamic(
  () => import("@/components/drift-3d/fable/FableCanvas"),
  { ssr: false, loading: () => null }
);

/**
 * FABLE SPIKE — coquille de l'expérience : détection WebGL, entrée
 * clavier/pointeur, ambiance sonore (opt-in), habillage minimal qui
 * s'efface dès qu'on conduit.
 */

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

export default function FableExperience() {
  const [hasWebGL, setHasWebGL] = useState<boolean | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean | null>(null);
  const [soundOn, setSoundOn] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  const vehicleStateRef = useRef<Drift3DVehiclePhysicsState>(
    createDrift3DVehiclePhysicsState({ x: 0, y: 0, z: 0 }, 0)
  );
  const ambienceRef = useRef<FableAmbience | null>(null);
  const inputRef = useRef<ImmersionInput | null>(null);
  const surfaceRef = useRef<HTMLDivElement | null>(null);

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
    return () => {
      ambienceRef.current?.stop();
      ambienceRef.current = null;
    };
  }, []);

  // Interaction : un seul modèle, choisi par le périphérique lui-même.
  useEffect(() => {
    const surface = surfaceRef.current;

    if (hasWebGL !== true || prefersReducedMotion === null || !surface) return;

    const input = new ImmersionInput();
    input.attach(surface, () => setHasMoved(true));
    inputRef.current = input;

    return () => {
      input.detach();
      inputRef.current = null;
    };
  }, [hasWebGL, prefersReducedMotion]);

  // Lecture primaire annoncée : celle du périphérique présent, pas la liste.
  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;

      setIsTouch(window.matchMedia?.("(pointer: coarse)")?.matches ?? false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  function toggleSound() {
    if (soundOn) {
      ambienceRef.current?.stop();
      ambienceRef.current = null;
      setSoundOn(false);
    } else {
      const ambience = new FableAmbience();
      ambience.start();
      ambienceRef.current = ambience;
      setSoundOn(true);
    }
  }

  const checking = hasWebGL === null || prefersReducedMotion === null;
  const reducedMotion = prefersReducedMotion === true;

  return (
    <main className="fixed inset-0 isolate overflow-hidden bg-[#05060a] text-neutral-100">
      <div className="absolute inset-0">
        {checking ? (
          <div className="flex h-full items-center justify-center p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-neutral-500">
              Signal…
            </p>
          </div>
        ) : !hasWebGL ? (
          <div className="flex h-full items-center justify-center p-6">
            <div className="max-w-md text-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-neutral-500">
                Pas de WebGL
              </p>
              <p className="mt-4 text-sm leading-6 text-neutral-300">
                Ce navigateur ne peut pas ouvrir la gorge. L&apos;expérience
                demande un rendu 3D matériel.
              </p>
              <Link
                href="/"
                className="mt-6 inline-flex min-h-[44px] items-center justify-center border border-neutral-700 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-neutral-200 transition hover:border-neutral-500"
              >
                Revenir
              </Link>
            </div>
          </div>
        ) : (
          <>
            <FableCanvas
              vehicleStateRef={vehicleStateRef}
              inputRef={inputRef}
              ambienceRef={ambienceRef}
              onFirstMove={() => setHasMoved(true)}
              reducedMotion={reducedMotion}
            />
            {/* Surface d'interaction : aucune commande visible, le geste suffit. */}
            <div
              ref={surfaceRef}
              aria-hidden="true"
              className="absolute inset-0 z-10 touch-none select-none"
            />
          </>
        )}
      </div>

      {/* Titre discret. */}
      <div className="pointer-events-none absolute left-[calc(1.25rem+env(safe-area-inset-left))] top-[calc(1.25rem+env(safe-area-inset-top))] z-20">
        <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-neutral-400/80">
          MISWΛY · DRIFT
        </p>
        <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.26em] text-neutral-500/70">
          fable — gorge &amp; chantier de naissance
        </p>
      </div>

      {/* Amorce : une seule phrase, celle du périphérique présent. */}
      {!checking && hasWebGL ? (
        <div
          className={`pointer-events-none absolute bottom-[calc(2rem+env(safe-area-inset-bottom))] left-1/2 z-20 -translate-x-1/2 transition-opacity duration-[1600ms] ${
            hasMoved ? "opacity-0" : "opacity-100"
          }`}
        >
          <p className="text-center font-mono text-[10px] uppercase tracking-[0.32em] text-neutral-300/85">
            {isTouch ? "Glisse pour diriger" : "Bouge la main pour diriger"}
          </p>
        </div>
      ) : null}

      {/* Ambiance sonore — opt-in, jamais automatique. */}
      {!checking && hasWebGL ? (
        <button
          type="button"
          onClick={toggleSound}
          className="absolute bottom-[calc(1.25rem+env(safe-area-inset-bottom))] right-[calc(1.25rem+env(safe-area-inset-right))] z-20 inline-flex min-h-9 items-center justify-center rounded-full border border-neutral-700/70 bg-black/40 px-4 py-1.5 font-mono text-[9px] uppercase tracking-[0.24em] text-neutral-300 backdrop-blur-md transition hover:border-neutral-500 hover:text-neutral-100"
        >
          {soundOn ? "ambiance ◼" : "ambiance ⏵"}
        </button>
      ) : null}

      <div className="absolute left-[calc(1.25rem+env(safe-area-inset-left))] bottom-[calc(1.25rem+env(safe-area-inset-bottom))] z-20">
        <Link
          href="/"
          className="inline-flex items-center font-mono text-[9px] uppercase tracking-[0.24em] text-neutral-600 transition hover:text-neutral-400"
        >
          quitter
        </Link>
      </div>
    </main>
  );
}
