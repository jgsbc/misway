import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { gunzipSync } from "node:zlib";

const root = process.cwd();

function read(relativePath: string) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function readAssetPart(index: number) {
  const source = read(
    `src/components/drift-evolution/miswaySafariGzipPart${index}.ts`
  );
  const match = source.match(/const part\d = "([^"]+)";/);
  assert.ok(match, `missing embedded safari part ${index}`);
  return match[1];
}

test("MISWAY Safari candidate remains isolated to Drift Evolution", () => {
  const evolutionScene = read("src/components/drift-evolution/DriftEvolutionScene.tsx");
  const productionScene = read("src/components/drift-3d/Drift3DScene.tsx");

  assert.match(evolutionScene, /MiswaySafariVehicleVisual/);
  assert.doesNotMatch(evolutionScene, /<EvolutionSafari110VehicleVisual/);
  assert.match(productionScene, /EvolutionSafari110VehicleVisual/);
  assert.doesNotMatch(productionScene, /MiswaySafariVehicleVisual/);
});

test("MISWAY Safari embedded glTF stays lightweight and exposes four wheel pivots", () => {
  const component = read(
    "src/components/drift-evolution/MiswaySafariVehicleVisual.tsx"
  );
  const encoded = `${readAssetPart(0)}${readAssetPart(1)}`;
  const compressed = Buffer.from(encoded, "base64");
  const assetText = gunzipSync(compressed).toString("utf8");
  const asset = JSON.parse(assetText) as {
    asset?: { version?: string };
    buffers?: Array<{ uri?: string }>;
    nodes?: Array<{ name?: string }>;
  };
  const nodeNames = new Set(asset.nodes?.map((node) => node.name));

  assert.ok(compressed.byteLength < 20_000);
  assert.ok(Buffer.byteLength(assetText) < 70_000);
  assert.equal(asset.asset?.version, "2.0");
  assert.match(
    asset.buffers?.[0]?.uri ?? "",
    /^data:application\/octet-stream;base64,/
  );
  for (const wheelName of ["wheel_FL", "wheel_FR", "wheel_RL", "wheel_RR"]) {
    assert.ok(nodeNames.has(wheelName), `missing ${wheelName} pivot`);
  }

  assert.match(component, /MISWAY_SAFARI_RUNTIME_SCALE = 0\.32/);
  assert.match(component, /MISWAY_SAFARI_LOCAL_WHEEL_RADIUS = 0\.38/);
  assert.match(component, /DecompressionStream\("gzip"\)/);
  assert.match(component, /miswaySafariGzipPart0/);
  assert.match(component, /miswaySafariGzipPart1/);
});
