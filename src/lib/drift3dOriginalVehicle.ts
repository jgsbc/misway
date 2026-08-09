export const DRIFT_3D_ORIGINAL_VEHICLE = Object.freeze({
  id: "misway-safari-110-v1",
  label: "MISWAY Safari 110 · v1",
  sourceFormat: "authored-buffer-geometry",
  triangleBudget: 60_000,
  dimensionsMeters: Object.freeze({
    length: 4.71,
    width: 2.09,
    height: 2.20,
  }),
  bodyColor: "#ab9464",
  origin: "MISWAY original geometry",
  thirdPartyGeometry: false,
});

export function getDrift3DOriginalVehicleIssues(): readonly string[] {
  const asset = DRIFT_3D_ORIGINAL_VEHICLE;
  const issues: string[] = [];

  if (!/^#[0-9a-f]{6}$/i.test(asset.bodyColor)) {
    issues.push("original vehicle body colour must be a six-digit hex value");
  }
  if (asset.sourceFormat !== "authored-buffer-geometry") {
    issues.push("VEH-B01 must use its deterministic authored geometry source");
  }
  if (asset.triangleBudget <= 0 || asset.triangleBudget > 60_000) {
    issues.push("original hero vehicle study must stay inside the 60k triangle cap");
  }
  if (asset.thirdPartyGeometry) {
    issues.push("VEH-B01 must contain no third-party vehicle geometry");
  }
  if (
    asset.dimensionsMeters.length < 4.2 ||
    asset.dimensionsMeters.length > 5.2 ||
    asset.dimensionsMeters.width < 1.8 ||
    asset.dimensionsMeters.width > 2.25 ||
    asset.dimensionsMeters.height < 1.8 ||
    asset.dimensionsMeters.height > 2.45
  ) {
    issues.push("original vehicle dimensions must stay in a credible expedition 4x4 envelope");
  }

  return issues;
}
