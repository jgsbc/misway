"use client";

import { useEffect, useState } from "react";
import { withBasePath } from "@/lib/basePath";
import { DRIFT_STARTUP_RELEASE_EVENT } from "@/lib/driftStartup";

const desktopHero = withBasePath("/images/tracks-hero-1920x1080-v3.webp");
const mobileHero = withBasePath("/images/tracks-hero-mobile-1080x1920.webp");

export default function DriftStartupVeil() {
  const [removed, setRemoved] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    let released = false;

    const release = () => {
      if (released) return;
      released = true;
      setLeaving(true);
    };

    window.addEventListener(DRIFT_STARTUP_RELEASE_EVENT, release, { once: true });

    return () => {
      window.removeEventListener(DRIFT_STARTUP_RELEASE_EVENT, release);
    };
  }, []);

  if (removed) return null;

  const mask =
    "radial-gradient(ellipse 52% 60% at 50% 50%,#000 34%,rgba(0,0,0,.96) 50%,rgba(0,0,0,.38) 68%,transparent 82%)";

  return (
    <div
      className={`fixed inset-0 z-[100] overflow-hidden bg-black transition-opacity duration-200 ${
        leaving ? "opacity-0" : "opacity-100"
      }`}
      role="status"
      aria-label="Opening the Drift world"
      onTransitionEnd={() => {
        if (leaving) setRemoved(true);
      }}
    >
      <style>{`
        @keyframes drift-lambda-shimmer {
          0%,100% { opacity:.82; filter:brightness(.88); transform:scale(.997) }
          44% { opacity:1; filter:brightness(1.12); transform:scale(1.004) }
          52% { opacity:.91; filter:brightness(1.01); transform:scale(1) }
          61% { opacity:1; filter:brightness(1.22); transform:scale(1.004) }
        }
        .drift-startup-portal { animation:drift-lambda-shimmer 2.7s ease-in-out infinite; transform-origin:center }
        @media (prefers-reduced-motion:reduce) { .drift-startup-portal { animation:none; opacity:.94 } }
      `}</style>

      <div className="absolute inset-0 bg-black" />
      <div className="absolute left-1/2 top-1/2 h-[min(60svh,440px)] w-[min(84vw,600px)] -translate-x-1/2 -translate-y-1/2">
        <div
          className="drift-startup-portal absolute inset-0 hidden bg-no-repeat md:block"
          style={{
            backgroundImage: `url(${desktopHero})`,
            backgroundPosition: "50% 50%",
            backgroundSize: "205% auto",
            WebkitMaskImage: mask,
            maskImage: mask,
          }}
          aria-hidden="true"
        />
        <div
          className="drift-startup-portal absolute inset-0 bg-no-repeat md:hidden"
          style={{
            backgroundImage: `url(${mobileHero})`,
            backgroundPosition: "50% 48%",
            backgroundSize: "auto 156%",
            WebkitMaskImage: mask,
            maskImage: mask,
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-[32%] rounded-full bg-white/10 blur-2xl"
          aria-hidden="true"
        />
      </div>

      <span className="sr-only">Opening the Drift world.</span>
    </div>
  );
}
