import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const evolutionSceneSource = readFileSync(
  new URL("../components/drift-evolution/DriftEvolutionScene.tsx", import.meta.url),
  "utf8"
);
const evolutionVehicleSource = readFileSync(
  new URL(
    "../components/drift-evolution/FullFidelityDefenderVehicleVisual.tsx",
    import.meta.url
  ),
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

test("Evolution pilots the full-fidelity Defender without changing production", () => {
  assert.match(evolutionSceneSource, /FullFidelityDefenderVehicleVisual/);
  assert.match(evolutionSceneSource, /<FullFidelityDefenderVehicleVisual \/>/);
  assert.doesNotMatch(evolutionSceneSource, /<EvolutionSafari110VehicleVisual/);
  assert.match(productionSceneSource, /<EvolutionSafari110VehicleVisual/);
  assert.doesNotMatch(productionSceneSource, /FullFidelityDefenderVehicleVisual/);
  assert.doesNotMatch(productionBaseSource, /FullFidelityDefenderVehicleVisual/);
  assert.match(productionBaseSource, /<Drift3DVehicle/);
});

test("full-fidelity Defender mirrors pose and preserves source-first policy", () => {
  assert.match(evolutionVehicleSource, /findLegacyVehiclePoseGroup/);
  assert.match(evolutionVehicleSource, /legacy\.visible = false/);
  assert.match(evolutionVehicleSource, /poseGroup\.position\.copy\(legacy\.position\)/);
  assert.match(evolutionVehicleSource, /poseGroup\.quaternion\.copy\(legacy\.quaternion\)/);
  assert.match(
    evolutionVehicleSource,
    /misway-defender-1966\/misway-defender-1966-full\.glb/
  );
  assert.match(evolutionVehicleSource, /RUNTIME_SCALE = 0\.84/);
  assert.match(evolutionVehicleSource, /RUNTIME_Y_OFFSET = -0\.02/);
  assert.match(evolutionVehicleSource, /No decimation or replacement body geometry/);
  assert.doesNotMatch(evolutionVehicleSource, /stepDrift3DVehiclePhysics/);
  assert.doesNotMatch(evolutionVehicleSource, /constrainDriftEvolutionEntryVehicle/);
  assert.doesNotMatch(evolutionVehicleSource, /rotateDrift3DSafari110Wheels/);
});

test("VEH-FD-V1 keeps texture detail while separating sand body and dark tyres", () => {
  assert.match(evolutionVehicleSource, /BODY_TINT = "#d8c39a"/);
  assert.match(evolutionVehicleSource, /TIRE_TINT = "#4a4540"/);
  assert.match(evolutionVehicleSource, /SOURCE_PROJECTION_MATERIAL = "defender_projection"/);
  assert.match(evolutionVehicleSource, /cloneWheelMaterial/);
  assert.match(evolutionVehicleSource, /material\.clone\(\)/);
  assert.match(evolutionVehicleSource, /material\.color\.set\(MISWAY_DEFENDER_1966_BODY_TINT\)/);
  assert.doesNotMatch(evolutionVehicleSource, /geometry\.clone\(/);
});

test("VEH-FD-V1 adds only the three approved expedition cues", () => {
  assert.match(evolutionVehicleSource, /expedition_roof_rack/);
  assert.match(evolutionVehicleSource, /expedition_roof_roll/);
  assert.match(evolutionVehicleSource, /expedition_rear_spare/);
  assert.doesNotMatch(evolutionVehicleSource, /expedition_ladder/);
  assert.doesNotMatch(evolutionVehicleSource, /expedition_bullbar/);
  assert.doesNotMatch(evolutionVehicleSource, /expedition_snorkel/);
});
