export type Drift3DVehicleCandidateId =
  | "defender-90-kekomag"
  | "defender-classic-yongtun"
  | "land-cruiser-fj40-game-garage";

export type Drift3DVehicleCandidate = Readonly<{
  id: Drift3DVehicleCandidateId;
  label: string;
  family: string;
  sketchfabModelUid: string;
  sourceUrl: string;
  license: "CC BY";
  triangleCount: number;
  visualFit: "strong" | "promising";
  runtimeFit: "strong" | "medium";
  role: string;
  note: string;
}>;

/**
 * VEH-A01 — deliberately bounded shortlist for visual comparison only.
 *
 * These are public downloadable Sketchfab models whose model pages declare
 * Creative Commons Attribution. No third-party binary is adopted here: the
 * Kit Lab only embeds the publishers' public interactive viewers so the
 * owner can judge the actual geometry before we acquire/adapt one model.
 */
export const DRIFT_3D_REAL_VEHICLE_CANDIDATES: readonly Drift3DVehicleCandidate[] =
  Object.freeze([
    Object.freeze({
      id: "defender-90-kekomag",
      label: "Defender 90 · balanced",
      family: "Classic short-wheelbase expedition 4×4",
      sketchfabModelUid: "88e5f30687ec4d508cebafa876e014d6",
      sourceUrl:
        "https://sketchfab.com/3d-models/land-rover-defender-90-lowpoly-88e5f30687ec4d508cebafa876e014d6",
      license: "CC BY",
      triangleCount: 100_100,
      visualFit: "strong",
      runtimeFit: "medium",
      role: "Primary candidate",
      note:
        "Best current balance: recognisable real Defender geometry, detailed wheels/body and a tractable real-time triangle budget before optimisation.",
    }),
    Object.freeze({
      id: "land-cruiser-fj40-game-garage",
      label: "Land Cruiser FJ40 · safari",
      family: "Classic safari / expedition 4×4",
      sketchfabModelUid: "cbcbd901e8874205b5be294fa3dd3df2",
      sourceUrl:
        "https://sketchfab.com/3d-models/toyota-land-cruiser-cbcbd901e8874205b5be294fa3dd3df2",
      license: "CC BY",
      triangleCount: 138_800,
      visualFit: "strong",
      runtimeFit: "medium",
      role: "Safari alternative",
      note:
        "Game-ready FJ40 with substantially more credible automotive surfacing than the procedural study; useful if the masterframe identity reads more safari than Defender-specific.",
    }),
    Object.freeze({
      id: "defender-classic-yongtun",
      label: "Defender Classic · lightweight",
      family: "Classic Defender",
      sketchfabModelUid: "c095d646029246048fbb91f44f000e66",
      sourceUrl:
        "https://sketchfab.com/3d-models/land-rover-defender-classic-c095d646029246048fbb91f44f000e66",
      license: "CC BY",
      triangleCount: 10_000,
      visualFit: "promising",
      runtimeFit: "strong",
      role: "Performance floor",
      note:
        "Very light geometry. Kept only to test whether its real vehicle silhouette survives close inspection strongly enough to beat a heavier candidate after MISWAY material adaptation.",
    }),
  ]);

export function getDrift3DVehicleCandidate(
  id: Drift3DVehicleCandidateId
): Drift3DVehicleCandidate {
  const candidate = DRIFT_3D_REAL_VEHICLE_CANDIDATES.find(
    (item) => item.id === id
  );

  if (!candidate) {
    throw new Error(`Unknown DRIFT vehicle candidate: ${id}`);
  }

  return candidate;
}

export function getDrift3DVehicleCandidateEmbedUrl(
  candidate: Drift3DVehicleCandidate
): string {
  const params = new URLSearchParams({
    autostart: "1",
    ui_infos: "0",
    ui_help: "0",
    ui_watermark: "1",
    ui_controls: "1",
    ui_stop: "0",
  });

  return `https://sketchfab.com/models/${candidate.sketchfabModelUid}/embed?${params.toString()}`;
}
