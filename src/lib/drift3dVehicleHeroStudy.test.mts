import test from "node:test";
import assert from "node:assert/strict";
import {
  DRIFT_3D_VEHICLE_HERO_PROFILE,
  getDrift3DVehicleHeroStudyIssues,
} from "@/lib/drift3dVehicleHeroStudy";

test("canonical hero safari vehicle profile is valid", () => {
  assert.deepEqual(getDrift3DVehicleHeroStudyIssues(), []);
});

test("hero vehicle keeps the PRE-10 safari identity traits", () => {
  assert.deepEqual(DRIFT_3D_VEHICLE_HERO_PROFILE.traits, {
    boxySafariBody: true,
    highGroundClearance: true,
    roofRack: true,
    rearSpareWheel: true,
    roundHeadlights: true,
    snorkel: true,
    bullBar: true,
  });
});

test("hero vehicle uses a realistic compact metric envelope", () => {
  const profile = DRIFT_3D_VEHICLE_HERO_PROFILE;
  assert.ok(profile.lengthMeters > profile.widthMeters * 2);
  assert.ok(profile.heightMeters > profile.widthMeters);
  assert.ok(profile.wheelRadiusMeters / profile.heightMeters > 0.17);
  assert.ok(profile.groundClearanceMeters / profile.wheelRadiusMeters > 0.6);
});

test("validator rejects toy-scale or non-safari proportions", () => {
  const issues = getDrift3DVehicleHeroStudyIssues({
    ...DRIFT_3D_VEHICLE_HERO_PROFILE,
    lengthMeters: 1.3,
    groundClearanceMeters: 0.08,
  });

  assert.ok(issues.some((issue) => issue.field === "lengthMeters"));
  assert.ok(issues.some((issue) => issue.field === "groundClearanceMeters"));
});
