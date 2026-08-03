import type { Drift3DMacroWorldId } from "@/lib/drift3dMacroWorldConfig";

/**
 * DRIFT-IV-PRE-40 — mutable, bounded status snapshot for the five-macro-world
 * greybox, mutated in place by the scene (never via `setState` in a hot
 * path) and read by the dev-only diagnostics panel /
 * `window.__drift3dMacroWorldGreybox` harness. Deliberately small and
 * bounded — no unbounded history. Not a second evidence/quality authority:
 * render metrics (draw calls/triangles/FPS/geometries/textures) stay owned
 * by `drift3dEvidence.ts` (SYS-70) and a thin local memory probe, read
 * separately by the shell, never duplicated here.
 */
export type Drift3DMacroWorldGreyboxStatus = {
  activeMacroWorld: Drift3DMacroWorldId;
  /** `null` when the player is inside a world's own dressing radius, not mid-transition. */
  currentTransition: string | null;
  routeProgress: number;
  playerPosition: { x: number; z: number };
  playerSpeed: number;
  nearestResetPoint: Drift3DMacroWorldId;
  loadedResourceIds: string[];
  assetLoadErrors: string[];
  transitionCount: number;
  resetCount: number;
  disposalCount: number;
  worldBoundaryViolationCount: number;
};

export function createDrift3DMacroWorldGreyboxStatus(): Drift3DMacroWorldGreyboxStatus {
  return {
    activeMacroWorld: "entry",
    currentTransition: null,
    routeProgress: 0,
    playerPosition: { x: 0, z: 0 },
    playerSpeed: 0,
    nearestResetPoint: "entry",
    loadedResourceIds: [],
    assetLoadErrors: [],
    transitionCount: 0,
    resetCount: 0,
    disposalCount: 0,
    worldBoundaryViolationCount: 0,
  };
}
