import Link from "next/link";
import Drift3DNoWebGLPath from "@/components/drift-3d/Drift3DNoWebGLPath";

export type Drift3DFallbackReason =
  | "checking"
  | "reduced-motion"
  | "no-webgl";

const fallbackCopy: Record<
  Exclude<Drift3DFallbackReason, "no-webgl">,
  { label: string; title: string; body: string }
> = {
  checking: {
    label: "Checking signal",
    title: "Checking the 3D room before opening it.",
    body: "No audio or controls start here. If the room stays closed, the 2D lab is the stable path.",
  },
  "reduced-motion": {
    label: "Reduced motion",
    title: "The 3D room stays closed today.",
    body: "Motion is reduced, so this route keeps the quieter path open.",
  },
};

function DriftStartupPortal() {
  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-[#030407]"
      role="status"
      aria-live="polite"
      aria-label="Opening the Drift 3D world"
    >
      <style>{`
        @keyframes drift-lambda-breathe {
          0%, 100% { opacity: .72; transform: scale(.985); }
          42% { opacity: 1; transform: scale(1.018); }
          58% { opacity: .93; transform: scale(1.006); }
        }

        @keyframes drift-lambda-glow {
          0%, 100% { opacity: .16; transform: scale(.88); }
          48% { opacity: .42; transform: scale(1.08); }
          62% { opacity: .24; transform: scale(.98); }
        }

        @keyframes drift-stone-breathe {
          0%, 100% { opacity: .66; }
          50% { opacity: .82; }
        }

        @keyframes drift-signal-sweep {
          0%, 68% { opacity: 0; transform: translateY(-22px); }
          76% { opacity: .8; }
          88% { opacity: 0; transform: translateY(28px); }
          100% { opacity: 0; transform: translateY(28px); }
        }

        .drift-startup-lambda {
          animation: drift-lambda-breathe 2.35s ease-in-out infinite;
          transform-box: fill-box;
          transform-origin: center;
        }

        .drift-startup-glow {
          animation: drift-lambda-glow 2.35s ease-in-out infinite;
          transform-box: fill-box;
          transform-origin: center;
        }

        .drift-startup-stones {
          animation: drift-stone-breathe 5.4s ease-in-out infinite;
        }

        .drift-startup-sweep {
          animation: drift-signal-sweep 3.8s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .drift-startup-lambda,
          .drift-startup-glow,
          .drift-startup-stones,
          .drift-startup-sweep {
            animation: none;
          }

          .drift-startup-lambda { opacity: .92; }
          .drift-startup-glow { opacity: .2; }
          .drift-startup-stones { opacity: .74; }
          .drift-startup-sweep { opacity: 0; }
        }
      `}</style>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(255,255,255,0.035),transparent_23%),radial-gradient(circle_at_50%_55%,#0a0b10_0%,#05060a_42%,#020306_76%,#010203_100%)]" />

      <svg
        viewBox="0 0 1000 1000"
        className="absolute left-1/2 top-1/2 h-[min(100svh,105vw)] w-[min(100svh,105vw)] -translate-x-1/2 -translate-y-1/2"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="driftPortalLight" cx="50%" cy="49%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
            <stop offset="37%" stopColor="#dfe6ed" stopOpacity="0.055" />
            <stop offset="100%" stopColor="#05060a" stopOpacity="0" />
          </radialGradient>
          <filter id="driftLambdaBlur" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="24" />
          </filter>
          <linearGradient id="driftStoneFace" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#24262b" />
            <stop offset="52%" stopColor="#111319" />
            <stop offset="100%" stopColor="#08090d" />
          </linearGradient>
        </defs>

        <circle cx="500" cy="505" r="245" fill="url(#driftPortalLight)" />

        <g
          className="drift-startup-stones"
          fill="url(#driftStoneFace)"
          stroke="#35383e"
          strokeOpacity="0.32"
          strokeWidth="2"
        >
          <path d="M120 856 80 714 104 590 165 466 248 356 347 286 372 370 300 434 245 523 210 628 214 739 260 856Z" />
          <path d="M880 856 920 714 896 590 835 466 752 356 653 286 628 370 700 434 755 523 790 628 786 739 740 856Z" />
          <path d="M345 286 392 197 468 153 500 142 532 153 608 197 655 286 626 371 584 322 545 294 500 284 455 294 416 322 374 371Z" />

          <path d="M112 706 177 676 208 716 214 792 168 821 113 790Z" />
          <path d="M141 548 205 530 243 575 216 650 165 663 120 620Z" />
          <path d="M196 421 256 407 294 444 252 516 198 518 164 479Z" />
          <path d="M274 330 334 292 379 328 358 393 302 421 258 388Z" />
          <path d="M365 236 430 188 473 204 452 284 393 314 351 283Z" />

          <path d="M888 706 823 676 792 716 786 792 832 821 887 790Z" />
          <path d="M859 548 795 530 757 575 784 650 835 663 880 620Z" />
          <path d="M804 421 744 407 706 444 748 516 802 518 836 479Z" />
          <path d="M726 330 666 292 621 328 642 393 698 421 742 388Z" />
          <path d="M635 236 570 188 527 204 548 284 607 314 649 283Z" />
        </g>

        <path
          d="M281 856 243 738 246 625 283 514 342 422 414 361 500 338 586 361 658 422 717 514 754 625 757 738 719 856Z"
          fill="#010204"
        />

        <ellipse
          className="drift-startup-glow"
          cx="500"
          cy="526"
          rx="116"
          ry="142"
          fill="#ffffff"
          opacity="0.2"
          filter="url(#driftLambdaBlur)"
        />

        <g className="drift-startup-lambda">
          <path
            d="M420 612 500 404 580 612"
            fill="none"
            stroke="#ffffff"
            strokeWidth="19"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M458 522H542"
            fill="none"
            stroke="#ffffff"
            strokeWidth="14"
            strokeLinecap="round"
            opacity="0.94"
          />
        </g>

        <rect
          className="drift-startup-sweep"
          x="420"
          y="492"
          width="160"
          height="4"
          rx="2"
          fill="#ffffff"
          opacity="0"
        />
      </svg>

      <span className="sr-only">Opening the Drift 3D world.</span>
    </div>
  );
}

export default function Drift3DFallback({
  reason,
}: {
  reason: Drift3DFallbackReason;
}) {
  // Startup is a transient experience, not a user-facing fallback. The cave
  // portal deliberately covers the full shell while capability checks and
  // the dynamic Canvas import finish, so no navigation/fallback UI can flash.
  if (reason === "checking") {
    return <DriftStartupPortal />;
  }

  // DRIFT-IV-SYS-60: the no-WebGL path gets its own dedicated static panel
  // (map/tracks destinations, honest 3D-unavailable summary) instead of the
  // generic template below — reduced-motion stays unchanged.
  if (reason === "no-webgl") {
    return <Drift3DNoWebGLPath />;
  }

  const copy = fallbackCopy[reason];

  return (
    <section className="light-border light-card-bg border p-5 md:p-7">
      <p className="light-text-tertiary font-mono text-[10px] uppercase tracking-[0.28em]">
        {copy.label}
      </p>
      <h2 className="light-text-primary mt-4 max-w-2xl text-xl font-semibold tracking-tight md:text-2xl">
        {copy.title}
      </h2>
      <p className="light-text-secondary mt-3 max-w-2xl text-sm leading-6">
        {copy.body}
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href="/drift-lab"
          className="light-text-primary light-border hover:light-card-hover inline-flex min-h-[44px] items-center justify-center border px-4 py-3 font-mono text-[10px] uppercase tracking-[0.22em] transition"
        >
          Open 2D Lab
        </Link>
        <Link
          href="/drift"
          className="light-text-secondary light-border hover:light-text-primary inline-flex min-h-[44px] items-center justify-center border px-4 py-3 font-mono text-[10px] uppercase tracking-[0.22em] transition"
        >
          Back to Drift
        </Link>
      </div>
    </section>
  );
}
