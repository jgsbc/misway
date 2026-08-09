import assert from "node:assert/strict";
import test from "node:test";
import {
  DRIFT_3D_REAL_VEHICLE_CANDIDATES,
  getDrift3DVehicleCandidateEmbedUrl,
} from "./drift3dVehicleCandidates";

test("VEH-A01 shortlist stays bounded to three real vehicle candidates", () => {
  assert.equal(DRIFT_3D_REAL_VEHICLE_CANDIDATES.length, 3);
  assert.equal(
    new Set(DRIFT_3D_REAL_VEHICLE_CANDIDATES.map((candidate) => candidate.id)).size,
    3
  );
  assert.equal(
    new Set(
      DRIFT_3D_REAL_VEHICLE_CANDIDATES.map(
        (candidate) => candidate.sketchfabModelUid
      )
    ).size,
    3
  );
});

test("every candidate is attribution-licensed and inside the comparison triangle cap", () => {
  for (const candidate of DRIFT_3D_REAL_VEHICLE_CANDIDATES) {
    assert.equal(candidate.license, "CC BY");
    assert.ok(candidate.triangleCount > 0);
    assert.ok(candidate.triangleCount <= 150_000);
    assert.match(candidate.sourceUrl, /^https:\/\/sketchfab\.com\/3d-models\//);
  }
});

test("shortlist contains a strong masterframe-fit primary candidate", () => {
  const primary = DRIFT_3D_REAL_VEHICLE_CANDIDATES.find(
    (candidate) => candidate.role === "Primary candidate"
  );

  assert.ok(primary);
  assert.equal(primary.visualFit, "strong");
  assert.equal(primary.id, "defender-90-kekomag");
});

test("embed URLs are viewer-only Sketchfab URLs for the exact candidate uid", () => {
  for (const candidate of DRIFT_3D_REAL_VEHICLE_CANDIDATES) {
    const url = getDrift3DVehicleCandidateEmbedUrl(candidate);
    assert.ok(url.startsWith(`https://sketchfab.com/models/${candidate.sketchfabModelUid}/embed?`));
    assert.ok(url.includes("ui_controls=1"));
  }
});
