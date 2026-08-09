"use client";

import { useEffect, useState } from "react";
import DriftHeroBackdrop from "@/components/drift-3d/DriftHeroBackdrop";
import { DRIFT_STARTUP_RELEASE_EVENT } from "@/lib/driftStartup";

export default function DriftStartupVeil() {
  const [removed, setRemoved] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    let timer = 0;
    let released = false;

    const release = () => {
      if (released) return;
      released = true;
      setLeaving(true);
      timer = window.setTimeout(() => setRemoved(true), 220);
    };

    window.addEventListener(DRIFT_STARTUP_RELEASE_EVENT, release, { once: true });

    const reduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const probe = document.createElement("canvas");
    const webgl = Boolean(
      probe.getContext("webgl2") ||
        probe.getContext("webgl") ||
        probe.getContext("experimental-webgl")
    );

    if (reduced || !webgl) {
      window.requestAnimationFrame(release);
    }

    return () => {
      window.removeEventListener(DRIFT_STARTUP_RELEASE_EVENT, release);
      window.clearTimeout(timer);
    };
  }, []);

  if (removed) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] overflow-hidden bg-black transition-opacity duration-200 ${
        leaving ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      role="status"
      aria-label="Opening the Drift world"
    >
      <DriftHeroBackdrop shimmer />
      <span className="sr-only">Opening the Drift world.</span>
    </div>
  );
}
