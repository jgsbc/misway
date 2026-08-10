import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { gunzipSync } from "node:zlib";

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

test("MISWAY Safari static glTF stays lightweight and exposes four wheel pivots", () => {
  const component = read(
    "src/components/drift-evolution/MiswaySafariVehicleVisual.tsx"
  );
  const partBuffers = [0, 1, 2, 3].map((index) =>
    fs.readFileSync(
      path.join(
        root,
        `public/models/misway-safari/misway-safari-v1.gltf.gz.part${index}`
      )
    )
  );

  assert.deepEqual(
    partBuffers.map((buffer) => buffer.byteLength),
    [4096, 4096, 4096, 4093]
  );

  const compressed = Buffer.concat(partBuffers);
  assert.equal(compressed.byteLength, 16_381);
  assert.equal(
    createHash("sha256").update(compressed).digest("hex"),
    "c66404e563dde2278830b30dea29c6a9410d691e0dfe84800529769270b3023a"
  );

  const assetText = gunzipSync(compressed).toString("utf8");
  assert.ok(Buffer.byteLength(assetText) < 70_000);
  const asset = JSON.parse(assetText) as {
    asset?: { version?: string };
    buffers?: Array<{ uri?: string }>;
    nodes?: Array<{ name?: string }>;
  };
  const nodeNames = new Set(asset.nodes?.map((node) => node.name));

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
  assert.match(component, /misway-safari-v1\.gltf\.gz\.part\$\{index\}/);
});
