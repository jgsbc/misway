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
  assert.match(evolutionVehicleSource, /RUNTIME_SCALE = 1\.68/);
  assert.match(evolutionVehicleSource, /No decimation or replacement geometry is used/);
  assert.doesNotMatch(evolutionVehicleSource, /stepDrift3DVehiclePhysics/);
  assert.doesNotMatch(evolutionVehicleSource, /constrainDriftEvolutionEntryVehicle/);
  assert.doesNotMatch(evolutionVehicleSource, /rotateDrift3DSafari110Wheels/);
});
