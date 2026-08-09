import { withBasePath } from "@/lib/basePath";

export const DRIFT_3D_ORIGINAL_VEHICLE = Object.freeze({
  id: "misway-safari-110-v1",
  label: "MISWAY Safari 110 · v1",
  path: "/models/vehicle-hero/misway-safari-110-v1.glb",
  sha256: "a0ac46218340b0a40a5cf3863e1331b9d8ebcada73cc8d10f9dc71b648f4b0a3",
  sizeBytes: 325_028,
  triangleCount: 13_864,
  geometryCount: 227,
  dimensionsMeters: Object.freeze({
    length: 4.71,
    width: 2.09,
    height: 2.20,
  }),
  bodyColor: "#ab9464",
  origin: "MISWAY original geometry",
  thirdPartyGeometry: false,
});

export function getDrift3DOriginalVehicleUrl(): string {
  return withBasePath(DRIFT_3D_ORIGINAL_VEHICLE.path);
}

export function getDrift3DOriginalVehicleIssues(): readonly string[] {
  const asset = DRIFT_3D_ORIGINAL_VEHICLE;
  const issues: string[] = [];

  if (!/^#[0-9a-f]{6}$/i.test(asset.bodyColor)) {
    issues.push("original vehicle body colour must be a six-digit hex value");
  }
  if (!/^[0-9a-f]{64}$/.test(asset.sha256)) {
    issues.push("original vehicle sha256 must be pinned");
  }
  if (asset.triangleCount <= 0 || asset.triangleCount > 60_000) {
    issues.push("original hero vehicle must stay inside the 60k triangle study cap");
  }
  if (asset.sizeBytes <= 0 || asset.sizeBytes > 2_000_000) {
    issues.push("original hero vehicle GLB must stay below 2 MB in the Kit Lab");
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
