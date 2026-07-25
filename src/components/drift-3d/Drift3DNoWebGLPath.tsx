import Link from "next/link";
import { getDrift3DNoWebGLNarrativePath } from "@/lib/drift3dNoWebGL";

/**
 * Shared with Drift3DClient.tsx's sr-only world description, so the
 * sentence describing what the 3D world is exists in exactly one place.
 * Deliberately only the descriptive sentence — never the interaction
 * instructions ("Keyboard, mouse drag...") that follow it there, since
 * this fallback must never promise 3D interaction (see DRIFT_3D_NO_WEBGL
 * NARRATIVE_PATH_CONTRACT.md).
 */
export const DRIFT_3D_WORLD_SUMMARY =
  "Fullscreen drivable 3D listening world: a safari 4x4 crosses four eras and twenty-six track places over real terrain — mountains, canals, storms and dawns.";

const DESTINATION_LABEL: Readonly<Record<"map" | "tracks", string>> = {
  map: "Open 2D Lab",
  tracks: "Tracks",
};

/**
 * Static, lightweight no-WebGL narrative path (DRIFT-IV-SYS-60). No Canvas,
 * no Three.js, no audio element, no fetch, no external asset — the two
 * destination links below are read from the pure contract in
 * drift3dNoWebGL.ts, so the UI can never drift from what the contract
 * declares.
 */
export default function Drift3DNoWebGLPath() {
  const path = getDrift3DNoWebGLNarrativePath();

  return (
    <section className="light-border light-card-bg border p-5 md:p-7">
      <p className="light-text-tertiary font-mono text-[10px] uppercase tracking-[0.28em]">
        No WebGL
      </p>
      <h2 className="light-text-primary mt-4 max-w-2xl text-xl font-semibold tracking-tight md:text-2xl">
        This browser cannot open the 3D room.
      </h2>
      <p className="light-text-secondary mt-3 max-w-2xl text-sm leading-6">
        The 2D lab remains the reference map. Nothing needs to play here.
      </p>

      <div className="light-border mt-5 border-t pt-5">
        <p className="light-text-tertiary font-mono text-[10px] uppercase tracking-[0.24em]">
          About the 3D room
        </p>
        <p className="light-text-secondary mt-3 max-w-2xl text-sm leading-6">
          {DRIFT_3D_WORLD_SUMMARY} This page only describes it — driving and
          exploring the 3D room are not available here.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        {path.destinations.map((destination) => (
          <Link
            key={destination.id}
            href={destination.href}
            className="light-text-primary light-border hover:light-card-hover inline-flex min-h-[44px] items-center justify-center border px-4 py-3 font-mono text-[10px] uppercase tracking-[0.22em] transition"
          >
            {DESTINATION_LABEL[destination.id]}
          </Link>
        ))}
      </div>
    </section>
  );
}
