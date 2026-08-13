export const DRIFT_PRODUCTION_BASELINE = Object.freeze({
  commit: "99b343bb13e901df49d9bed530cb00decf1134cd",
  productionRoute: "/drift",
  evolutionRoute: "/drift-evolution",
  kitLabRoute: "/drift-kit-lab",
} as const);

export const DRIFT_EVOLUTION_PROMOTION = Object.freeze({
  decidedAt: "2026-08-13",
  status: "OWNER_APPROVED",
  sourceRoute: "/drift-evolution",
  targetRoute: "/drift",
  rollbackCommit: "525f86f7e34d225233e992695fe269600c1d067d",
  runtimeAuthority:
    "src/components/drift-evolution/DriftEvolutionClient.tsx",
} as const);

export type DriftEvolutionReuseStatus =
  | "KEEP_REUSE"
  | "TECHNICAL_REUSE"
  | "EXTRACT_CANDIDATE"
  | "REFERENCE_EXTRACT";

export type DriftEvolutionReuseSource = Readonly<{
  id: string;
  source: string;
  status: DriftEvolutionReuseStatus;
  authority: string;
  note: string;
}>;

/**
 * Reuse inventory, ordered by authority preference.
 * Production content comes first; experiments are harvested, never merged
 * wholesale into the protected world.
 */
export const DRIFT_EVOLUTION_REUSE_SOURCES = Object.freeze([
  Object.freeze({
    id: "production-entry-lambda-cave",
    source: "main@99b343bb13e901df49d9bed530cb00decf1134cd",
    status: "KEEP_REUSE",
    authority: "src/lib/drift3dLandmarks.ts#entry-lambda-cave",
    note: "Existing λ cave, dawn backlight, rock massing and threshold composition are production capital, not reconstruction work.",
  }),
  Object.freeze({
    id: "production-eux-gainent",
    source: "main@99b343bb13e901df49d9bed530cb00decf1134cd",
    status: "KEEP_REUSE",
    authority: "src/components/drift-3d/EuxGainentLivingScene.tsx",
    note: "Owner-accepted living track proof remains reusable as-is before any replacement is considered.",
  }),
  Object.freeze({
    id: "pre30-shared-kit-pilots",
    source: "/drift-kit-lab",
    status: "TECHNICAL_REUSE",
    authority: "src/components/drift-3d/kits/",
    note: "Reuse loaders, instancing, animation and water/sky technical patterns; pilot art is not final foreground art.",
  }),
  Object.freeze({
    id: "world-edges-20c",
    source: "drift-3d-20c-ocean-cliffs-world-edge-depth-v2",
    status: "EXTRACT_CANDIDATE",
    authority: "src/components/drift-3d/Drift3DWorldEdges.tsx",
    note: "Candidate ocean, cliffs, distant hills, south plains and river continuity layer; extract only after visual comparison against the baseline.",
  }),
  Object.freeze({
    id: "fable-r-and-d",
    source: "experiment/drift-greybox-fable",
    status: "REFERENCE_EXTRACT",
    authority: "branch",
    note: "Harvest proven geography, road, coastline and world-design lessons selectively. Never promote the Fable runtime or geography wholesale.",
  }),
  Object.freeze({
    id: "post-greybox-archive",
    source: "archive/drift-post-greybox-20260809",
    status: "REFERENCE_EXTRACT",
    authority: "branch",
    note: "Retains all peninsula, route, Inspector, water and Birth Yard experiments for selective salvage without contaminating production.",
  }),
] satisfies readonly DriftEvolutionReuseSource[]);

export const DRIFT_EVOLUTION_DISCIPLINE = Object.freeze([
  "PRESERVE_PRODUCTION",
  "REUSE_EXISTING",
  "EXTRACT_PROVEN_WORK",
  "ADAPT_IN_EVOLUTION_ONLY",
  "MEASURE_OBJECTIVE_BEHAVIOR",
  "COMPARE_VISUALLY_WITH_DRIFT",
  "PROMOTE_ONLY_IF_MANIFESTLY_BETTER",
] as const);
