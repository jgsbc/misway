import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();

function read(relativePath: string) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

test("MISWAY Safari candidate remains isolated to Drift Evolution", () => {
  const evolutionScene = read("src/components/drift-evolution/DriftEvolutionScene.tsx");
  const productionScene = read("src/components/drift-3d/Drift3DScene.tsx");

  assert.match(evolutionScene, /MiswaySafariVehicleVisual/);
  assert.doesNotMatch(evolutionScene, /<EvolutionSafari110VehicleVisual/);
  assert.match(productionScene, /EvolutionSafari110VehicleVisual/);
  assert.doesNotMatch(productionScene, /MiswaySafariVehicleVisual/);
});

test("MISWAY Safari glTF stays lightweight and exposes four wheel pivots", () => {
  const component = read(
    "src/components/drift-evolution/MiswaySafariVehicleVisual.tsx"
  );
  const assetPath = path.join(
    root,
    "public/models/misway-safari/misway-safari-v1.gltf"
  );
  const assetText = fs.readFileSync(assetPath, "utf8");
  const asset = JSON.parse(assetText) as {
    asset?: { version?: string };
    buffers?: Array<{ uri?: string }>;
    nodes?: Array<{ name?: string }>;
  };
  const nodeNames = new Set(asset.nodes?.map((node) => node.name));

  assert.equal(asset.asset?.version, "2.0");
  assert.ok(Buffer.byteLength(assetText) < 100_000);
  assert.match(
    asset.buffers?.[0]?.uri ?? "",
    /^data:application\/octet-stream;base64,/
  );
  for (const wheelName of ["wheel_FL", "wheel_FR", "wheel_RL", "wheel_RR"]) {
    assert.ok(nodeNames.has(wheelName), `missing ${wheelName} pivot`);
  }
  assert.match(component, /MISWAY_SAFARI_RUNTIME_SCALE = 0\.32/);
  assert.match(component, /MISWAY_SAFARI_LOCAL_WHEEL_RADIUS = 0\.38/);
  assert.match(component, /wheel_FL/);
  assert.match(component, /wheel_FR/);
  assert.match(component, /wheel_RL/);
  assert.match(component, /wheel_RR/);
  assert.match(component, /misway-safari-v1\.gltf/);
});
