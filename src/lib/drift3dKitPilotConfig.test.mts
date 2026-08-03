import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DRIFT_3D_KIT_PILOT_IDS,
  DRIFT_3D_WATER_PRESETS,
  computeDrift3DWheelRotationDelta,
  getDrift3DCanonicalKitPilotFallbackIssues,
  getDrift3DCanonicalWaterPresetIssues,
  getDrift3DKitPilotFallbackIssues,
  getDrift3DNatureMovementCounts,
  getDrift3DTrafficLoopProgress,
  getDrift3DUrbanHumanCounts,
  getDrift3DWaterPresetIssues,
  getDrift3DWaterWeatherLightCapabilities,
  isDrift3DKitPilotId,
  sampleDrift3DTrafficPath,
} from "@/lib/drift3dKitPilotConfig";

test("isDrift3DKitPilotId accepts exactly the three canonical ids", () => {
  assert.equal(isDrift3DKitPilotId("urban-human"), true);
  assert.equal(isDrift3DKitPilotId("nature-movement"), true);
  assert.equal(isDrift3DKitPilotId("water-weather-light"), true);
  assert.equal(isDrift3DKitPilotId("weather"), false);
  assert.equal(isDrift3DKitPilotId(""), false);
  assert.equal(isDrift3DKitPilotId(undefined), false);
});

test("DRIFT_3D_KIT_PILOT_IDS has exactly three, unique entries", () => {
  assert.equal(DRIFT_3D_KIT_PILOT_IDS.length, 3);
  assert.equal(new Set(DRIFT_3D_KIT_PILOT_IDS).size, 3);
});

test("canonical fallback cards are valid", () => {
  assert.deepEqual(getDrift3DCanonicalKitPilotFallbackIssues(), []);
});

test("fallback card validation catches a missing pilot card", () => {
  const issues = getDrift3DKitPilotFallbackIssues([
    { id: "urban-human", title: "Urban", whatItProves: "x" },
    { id: "nature-movement", title: "Nature", whatItProves: "x" },
  ]);

  assert.ok(
    issues.some(
      (issue) =>
        issue.type === "card-missing" && issue.id === "water-weather-light"
    )
  );
});

test("fallback card validation catches duplicate id and empty fields", () => {
  const issues = getDrift3DKitPilotFallbackIssues([
    { id: "urban-human", title: "", whatItProves: "" },
    { id: "urban-human", title: "dup", whatItProves: "dup" },
    { id: "nature-movement", title: "n", whatItProves: "n" },
    { id: "water-weather-light", title: "w", whatItProves: "w" },
  ]);

  assert.ok(issues.some((issue) => issue.type === "duplicate-id"));
  assert.ok(issues.some((issue) => issue.type === "empty-title"));
  assert.ok(issues.some((issue) => issue.type === "empty-what-it-proves"));
});

test("Urban/Human Quality Tier counts are monotonic low <= medium <= high", () => {
  const low = getDrift3DUrbanHumanCounts("low");
  const medium = getDrift3DUrbanHumanCounts("medium");
  const high = getDrift3DUrbanHumanCounts("high");

  assert.ok(low.animatedCharacterCount <= medium.animatedCharacterCount);
  assert.ok(medium.animatedCharacterCount <= high.animatedCharacterCount);
  assert.ok(low.silhouetteCrowdCount <= medium.silhouetteCrowdCount);
  assert.ok(medium.silhouetteCrowdCount <= high.silhouetteCrowdCount);
  assert.ok(low.backgroundBuildingCount <= medium.backgroundBuildingCount);
  assert.ok(medium.backgroundBuildingCount <= high.backgroundBuildingCount);
  // Never below this pilot's own stated minimum bound, even at low tier.
  assert.ok(low.animatedCharacterCount >= 1);
});

test("Nature/Movement Quality Tier counts are monotonic low <= medium <= high", () => {
  const low = getDrift3DNatureMovementCounts("low");
  const medium = getDrift3DNatureMovementCounts("medium");
  const high = getDrift3DNatureMovementCounts("high");

  assert.ok(low.trafficVehicleCount <= medium.trafficVehicleCount);
  assert.ok(medium.trafficVehicleCount <= high.trafficVehicleCount);
  assert.ok(low.vegetationScatterScale <= medium.vegetationScatterScale);
  assert.ok(medium.vegetationScatterScale <= high.vegetationScatterScale);
  assert.ok(low.trafficVehicleCount >= 1);
});

test("Water/Weather/Light Quality Tier capabilities are monotonic and cap at 1", () => {
  const low = getDrift3DWaterWeatherLightCapabilities("low");
  const high = getDrift3DWaterWeatherLightCapabilities("high");

  assert.ok(low.reflectionResolutionScale <= high.reflectionResolutionScale);
  assert.ok(low.renderProbeScale <= high.renderProbeScale);
  assert.equal(high.reflectionResolutionScale, 1);
  assert.equal(high.renderProbeScale, 1);
});

test("sampleDrift3DTrafficPath returns points on the ellipse with a unit tangent", () => {
  const path = { centerX: 2, centerZ: -1, radiusX: 5, radiusZ: 3 };

  const start = sampleDrift3DTrafficPath(path, 0);
  assert.ok(Math.abs(start.position.x - (path.centerX + path.radiusX)) < 1e-9);
  assert.ok(Math.abs(start.position.z - path.centerZ) < 1e-9);

  const quarter = sampleDrift3DTrafficPath(path, 0.25);
  assert.ok(Math.abs(quarter.position.x - path.centerX) < 1e-9);
  assert.ok(Math.abs(quarter.position.z - (path.centerZ + path.radiusZ)) < 1e-9);

  for (const t of [0, 0.1, 0.25, 0.5, 0.73, 0.99]) {
    const sample = sampleDrift3DTrafficPath(path, t);
    const tangentLength = Math.hypot(sample.tangent.x, sample.tangent.z);
    assert.ok(Math.abs(tangentLength - 1) < 1e-9);
  }
});

test("sampleDrift3DTrafficPath wraps t outside [0, 1) deterministically", () => {
  const path = { centerX: 0, centerZ: 0, radiusX: 4, radiusZ: 4 };
  const a = sampleDrift3DTrafficPath(path, 1.25);
  const b = sampleDrift3DTrafficPath(path, 0.25);
  const c = sampleDrift3DTrafficPath(path, -0.75);

  assert.ok(Math.abs(a.position.x - b.position.x) < 1e-9);
  assert.ok(Math.abs(a.position.z - b.position.z) < 1e-9);
  assert.ok(Math.abs(c.position.x - b.position.x) < 1e-9);
  assert.ok(Math.abs(c.position.z - b.position.z) < 1e-9);
});

test("getDrift3DTrafficLoopProgress is deterministic and bounded to [0, 1)", () => {
  assert.equal(getDrift3DTrafficLoopProgress(0, 10), 0);
  assert.ok(Math.abs(getDrift3DTrafficLoopProgress(5, 10) - 0.5) < 1e-9);
  assert.ok(Math.abs(getDrift3DTrafficLoopProgress(15, 10) - 0.5) < 1e-9);
  assert.ok(getDrift3DTrafficLoopProgress(-2, 10) >= 0);
  assert.equal(getDrift3DTrafficLoopProgress(5, 0), 0);
  assert.equal(getDrift3DTrafficLoopProgress(NaN, 10), 0);
});

test("computeDrift3DWheelRotationDelta matches distance/radius", () => {
  assert.ok(
    Math.abs(computeDrift3DWheelRotationDelta(3, 0.3, 1) - 10) < 1e-9
  );
  assert.equal(computeDrift3DWheelRotationDelta(3, 0.3, 0), 0);
  assert.equal(computeDrift3DWheelRotationDelta(3, 0, 1), 0);
  assert.equal(computeDrift3DWheelRotationDelta(3, -1, 1), 0);
  assert.equal(computeDrift3DWheelRotationDelta(3, 0.3, -1), 0);
  assert.equal(computeDrift3DWheelRotationDelta(NaN, 0.3, 1), 0);
});

test("canonical water presets are valid and bounded", () => {
  assert.deepEqual(getDrift3DCanonicalWaterPresetIssues(), []);
  assert.equal(DRIFT_3D_WATER_PRESETS.length, 2);
});

test("water preset validation catches an out-of-bounds parameter", () => {
  const issues = getDrift3DWaterPresetIssues([
    {
      id: "calm-canal-seed",
      label: "Calm",
      distortionScale: 999,
      waveSpeed: 0.2,
      sunElevationDegrees: 30,
    },
    {
      id: "rough-open-water-seed",
      label: "Rough",
      distortionScale: 3,
      waveSpeed: 0.5,
      sunElevationDegrees: 20,
    },
  ]);

  assert.ok(
    issues.some((issue) => issue.type === "distortion-scale-out-of-bounds")
  );
});

test("water preset validation catches a missing canonical preset", () => {
  const issues = getDrift3DWaterPresetIssues([
    {
      id: "calm-canal-seed",
      label: "Calm",
      distortionScale: 1,
      waveSpeed: 0.2,
      sunElevationDegrees: 30,
    },
  ]);

  assert.ok(
    issues.some(
      (issue) =>
        issue.type === "preset-missing" && issue.id === "rough-open-water-seed"
    )
  );
});
