import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const evolutionSceneSource = readFileSync(
  new URL("../components/drift-evolution/DriftEvolutionScene.tsx", import.meta.url),
  "utf8"
);
const evolutionVehicleSource = readFileSync(
  new URL("../components/drift-evolution/EvolutionSafari110VehicleVisual.tsx", import.meta.url),
  "utf8"
);
const productionSceneSource = readFileSync(
  new URL("../components/drift-3d/Drift3DScene.tsx", import.meta.url),
  "utf8"
);
const productionBaseSource = readFileSync(
  new URL("../components/drift-3d/Drift3DSceneBase.tsx", import.meta.url),
  "utf8"
);

test("Evolution may pilot a successor vehicle without changing production", () => {
  assert.match(evolutionSceneSource, /MiswaySafariVehicleVisual/);
  assert.doesNotMatch(evolutionSceneSource, /<EvolutionSafari110VehicleVisual/);
  assert.match(productionSceneSource, /<EvolutionSafari110VehicleVisual/);
  assert.doesNotMatch(productionSceneSource, /MiswaySafariVehicleVisual/);
  assert.doesNotMatch(productionBaseSource, /MiswaySafariVehicleVisual/);
  assert.match(productionBaseSource, /<Drift3DVehicle/);
});

test("VEH-B03 mirrors the existing vehicle pose instead of replacing physics", () => {
  assert.match(evolutionVehicleSource, /findLegacyVehiclePoseGroup/);
  assert.match(evolutionVehicleSource, /legacy\.visible = false/);
  assert.match(evolutionVehicleSource, /poseGroup\.position\.copy\(legacy\.position\)/);
  assert.match(evolutionVehicleSource, /poseGroup\.quaternion\.copy\(legacy\.quaternion\)/);
  assert.doesNotMatch(evolutionVehicleSource, /stepDrift3DVehiclePhysics/);
  assert.doesNotMatch(evolutionVehicleSource, /constrainDriftEvolutionEntryVehicle/);
});
