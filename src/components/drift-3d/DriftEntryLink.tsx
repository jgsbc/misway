"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import DriftHeroBackdrop from "@/components/drift-3d/DriftHeroBackdrop";

export default function DriftEntryLink() {
  const router = useRouter();
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    router.prefetch("/drift");
  }, [router]);

  function enterDrift(event: MouseEvent<HTMLAnchorElement>) {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    if (transitioning) return;

    setTransitioning(true);

    requestAnimationFrame(() => {
      router.push("/drift");
    });
  }

  return (
    <>
      <Link
        href="/drift"
        onClick={enterDrift}
        aria-busy={transitioning}
        className="group order-3 relative flex min-h-[50px] items-center justify-center overflow-hidden border border-white/25 bg-[linear-gradient(115deg,#57f2ff_0%,#8b5cf6_24%,#ff4fd8_48%,#ffb84a_72%,#c8ff57_100%)] px-7 py-3 font-mono text-[11px] tracking-[0.24em] text-black shadow-[0_0_28px_rgba(255,79,216,0.28)] transition duration-500 hover:scale-[1.015] hover:border-white/50 hover:shadow-[0_0_42px_rgba(87,242,255,0.34)] focus:outline-none focus:ring-2 focus:ring-white/40 md:order-2 md:min-h-[54px]"
      >
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(255,255,255,0.72),transparent_24%),radial-gradient(circle_at_78%_30%,rgba(255,255,255,0.42),transparent_22%),linear-gradient(90deg,rgba(255,255,255,0.18),transparent_46%,rgba(0,0,0,0.12))] opacity-70 transition-opacity duration-500 group-hover:opacity-95" />
        <span className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/10" />
        <span className="relative z-10 font-semibold drop-shadow-[0_1px_10px_rgba(255,255,255,0.45)]">
          DRIFT
        </span>
      </Link>

      {transitioning ? (
        <div
          className="fixed inset-0 z-[200] overflow-hidden bg-black"
          role="status"
          aria-label="Entering Drift"
        >
          <DriftHeroBackdrop shimmer />
          <span className="sr-only">Entering Drift.</span>
        </div>
      ) : null}
    </>
  );
}
