"use client";

import { useEffect, useState } from "react";
import { withBasePath } from "@/lib/basePath";
import { DRIFT_STARTUP_RELEASE_EVENT } from "@/lib/driftStartup";

const desktopHero = withBasePath("/images/tracks-hero-1920x1080-v3.webp");
const mobileHero = withBasePath("/images/tracks-hero-mobile-1080x1920.webp");

export default function DriftStartupVeil() {
  const [releasing, setReleasing] = useState(false);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    let releaseTimer: number | null = null;

    function release() {
      setReleasing(true);
      releaseTimer = window.setTimeout(() => setRemoved(true), 220);
    }

    window.addEventListener(DRIFT_STARTUP_RELEASE_EVENT, release, { once: true });

    return () => {
      window.removeEventListener(DRIFT_STARTUP_RELEASE_EVENT, release);
      if (releaseTimer !== null) window.clearTimeout(releaseTimer);
    };
  }, []);

  if (removed) return null;

  const desktopStyle = {
    backgroundImage: `url(${desktopHero})`,
    backgroundPosition: "50% 50%",
    backgroundRepeat: "no-repeat",
    backgroundSize: "205% auto",
    WebkitMaskImage:
      "radial-gradient(ellipse 54% 60% at 50% 50%, #000 34%, rgba(0,0,0,.98) 51%, rgba(0,0,0,.42) 68%, transparent 81%)",
    maskImage:
      "radial-gradient(ellipse 54% 60% at 50% 50%, #000 34%, rgba(0,0,0,.98) 51%, rgba(0,0,0,.42) 68%, transparent 81%)",
  } as const;

  const mobileStyle = {
    backgroundImage: `url(${mobileHero})`,
    backgroundPosition: "50% 48%",
    backgroundRepeat: "no-repeat",
    backgroundSize: "auto 156%",
    WebkitMaskImage:
      "radial-gradient(ellipse 58% 58% at 50% 50%, #000 34%, rgba(0,0,0,.98) 52%, rgba(0,0,0,.4) 69%, transparent 82%)",
    maskImage:
      "radial-gradient(ellipse 58% 58% at 50% 50%, #000 34%, rgba(0,0,0,.98) 52%, rgba(0,0,0,.4) 69%, transparent 82%)",
  } as const;

  const glintMask = {
    WebkitMaskImage:
      "radial-gradient(ellipse 25% 34% at 50% 50%, #000 0%, rgba(0,0,0,.94) 44%, transparent 78%)",
    maskImage:
      "radial-gradient(ellipse 25% 34% at 50% 50%, #000 0%, rgba(0,0,0,.94) 44%, transparent 78%)",
  } as const;

  return (
    <div
      className={`fixed inset-0 z-[100] overflow-hidden bg-black transition-opacity duration-200 ${
        releasing ? "opacity-0" : "opacity-100"
      }`}
      role="status"
      aria-label="Opening the Drift world"
    >
      <style>{`
        @keyframes drift-hero-door-breathe {
          0%, 100% { opacity: .82; filter: brightness(.88) contrast(1.05); transform: scale(.994); }
          46% { opacity: 1; filter: brightness(1.09) contrast(1.08); transform: scale(1.006); }
          52% { opacity: .95; filter: brightness(1.01) contrast(1.07); transform: scale(1.002); }
          61% { opacity: 1; filter: brightness(1.13) contrast(1.08); transform: scale(1.006); }
        }

        @keyframes drift-hero-door-glint {
          0%, 62%, 100% { opacity: 0; filter: brightness(1.1); }
          68% { opacity: .12; filter: brightness(1.55); }
          72% { opacity: .03; filter: brightness(1.18); }
          76% { opacity: .16; filter: brightness(1.72); }
          82% { opacity: 0; filter: brightness(1.1); }
        }

        .drift-startup-hero-door {
          animation: drift-hero-door-breathe 2.8s ease-in-out infinite;
          transform-origin: center;
          will-change: opacity, filter, transform;
        }

        .drift-startup-hero-glint {
          animation: drift-hero-door-glint 3.7s ease-in-out infinite;
          mix-blend-mode: screen;
          will-change: opacity, filter;
        }

        @media (prefers-reduced-motion: reduce) {
          .drift-startup-hero-door,
          .drift-startup-hero-glint {
            animation: none;
          }
          .drift-startup-hero-door { opacity: .94; filter: brightness(1.02) contrast(1.06); }
          .drift-startup-hero-glint { opacity: 0; }
        }
      `}</style>

      <div className="absolute inset-0 bg-black" />

      <div className="absolute left-1/2 top-1/2 h-[min(58svh,430px)] w-[min(82vw,590px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-black">
        <div
          className="drift-startup-hero-door absolute inset-0 hidden md:block"
          style={desktopStyle}
          aria-hidden="true"
        />
        <div
          className="drift-startup-hero-door absolute inset-0 md:hidden"
          style={mobileStyle}
          aria-hidden="true"
        />

        <div
          className="drift-startup-hero-glint absolute inset-0 hidden md:block"
          style={{ ...desktopStyle, ...glintMask }}
          aria-hidden="true"
        />
        <div
          className="drift-startup-hero-glint absolute inset-0 md:hidden"
          style={{ ...mobileStyle, ...glintMask }}
          aria-hidden="true"
        />
      </div>

      <span className="sr-only">Opening the Drift world.</span>
    </div>
  );
}
