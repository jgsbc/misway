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

export default function Drift3DFallback({
  reason,
}: {
  reason: Drift3DFallbackReason;
}) {
  // Startup is a transient technical state, not a user-facing fallback.
  // Cover the whole shell with the same dark tone as the 3D world so SSR,
  // capability checks and the dynamic Canvas import cannot flash the beige
  // fallback card, navigation or 2D-lab actions before the world is ready.
  if (reason === "checking") {
    return (
      <div
        className="fixed inset-0 z-50 bg-[#05060a]"
        role="status"
        aria-live="polite"
        aria-label="Opening the Drift 3D world"
      >
        <span className="sr-only">Opening the Drift 3D world.</span>
      </div>
    );
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
