import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import test from "node:test";

const evolutionSceneSource = readFileSync(
  new URL("../components/drift-evolution/DriftEvolutionScene.tsx", import.meta.url),
  "utf8"
);
const evolutionVehicleSource = readFileSync(
  new URL(
    "../components/drift-evolution/Defender90LowpolyVehicleVisual.tsx",
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

const assetGltfUrl = new URL(
  "../../public/models/defender90-lowpoly/scene.gltf",
  import.meta.url
);
const assetBinUrl = new URL(
  "../../public/models/defender90-lowpoly/scene.bin",
  import.meta.url
);
const assetLicenseUrl = new URL(
  "../../public/models/defender90-lowpoly/license.txt",
  import.meta.url
);

test("VEH-SOURCE-03 pilots Defender 90 only in Drift Evolution", () => {
  assert.match(evolutionSceneSource, /Defender90LowpolyVehicleVisual/);
  assert.match(evolutionSceneSource, /<Defender90LowpolyVehicleVisual \/>/);
  assert.doesNotMatch(evolutionSceneSource, /<FullFidelityDefenderVehicleVisual/);
  assert.doesNotMatch(productionSceneSource, /Defender90LowpolyVehicleVisual/);
  assert.doesNotMatch(productionBaseSource, /Defender90LowpolyVehicleVisual/);
  assert.match(productionBaseSource, /<Drift3DVehicle/);
});

test("VEH-SOURCE-03 remains a raw visual follower", () => {
  assert.match(evolutionVehicleSource, /findLegacyVehiclePoseGroup/);
  assert.match(evolutionVehicleSource, /legacy\.visible = false/);
  assert.match(evolutionVehicleSource, /poseGroup\.position\.copy\(legacy\.position\)/);
  assert.match(evolutionVehicleSource, /poseGroup\.quaternion\.copy\(legacy\.quaternion\)/);
  assert.match(evolutionVehicleSource, /defender90-lowpoly\/scene\.gltf/);
  assert.match(evolutionVehicleSource, /RUNTIME_SCALE = 0\.82/);
  assert.match(evolutionVehicleSource, /4\.84276/);
  assert.match(evolutionVehicleSource, /-0\.09198/);
  assert.match(evolutionVehicleSource, /-0\.24755/);
  assert.doesNotMatch(evolutionVehicleSource, /BODY_TINT|TIRE_TINT|expedition_/);
  assert.doesNotMatch(
    evolutionVehicleSource,
    /boxGeometry|torusGeometry|cylinderGeometry|meshStandardMaterial/
  );
  assert.doesNotMatch(evolutionVehicleSource, /stepDrift3DVehiclePhysics/);
  assert.doesNotMatch(evolutionVehicleSource, /constrainDriftEvolutionEntryVehicle/);
});

test("VEH-SOURCE-03 hides the inherited visual during load but restores it on failure", () => {
  assert.match(
    evolutionVehicleSource,
    /useLayoutEffect\(\(\) => \{[\s\S]*legacy\.visible = false;[\s\S]*\}, \[scene\]\);/
  );
  assert.match(evolutionVehicleSource, /Loading failure is the only case/);
  assert.match(evolutionVehicleSource, /legacy\.visible = true/);
});

test("VEH-SOURCE-03 source asset is complete and attribution-ready", () => {
  const gltf = JSON.parse(readFileSync(assetGltfUrl, "utf8")) as {
    asset?: { extras?: { title?: string; author?: string; license?: string } };
    accessors: Array<{ count: number }>;
    meshes: Array<{
      primitives: Array<{ indices?: number }>;
    }>;
    buffers?: Array<{ uri?: string; byteLength?: number }>;
  };
  const license = readFileSync(assetLicenseUrl, "utf8");
  const triangles = gltf.meshes.reduce(
    (total, mesh) =>
      total +
      mesh.primitives.reduce((meshTotal, primitive) => {
        if (primitive.indices === undefined) return meshTotal;
        return meshTotal + gltf.accessors[primitive.indices].count / 3;
      }, 0),
    0
  );

  assert.equal(gltf.asset?.extras?.title, "Land Rover Defender 90 Lowpoly");
  assert.match(gltf.asset?.extras?.author ?? "", /kekis69/);
  assert.match(gltf.asset?.extras?.license ?? "", /CC-BY-4\.0/);
  assert.equal(gltf.buffers?.[0]?.uri, "scene.bin");
  assert.equal(gltf.buffers?.[0]?.byteLength, 4_111_684);
  assert.equal(statSync(assetBinUrl).size, 4_111_684);
  assert.equal(triangles, 100_075);
  assert.match(license, /CC-BY-4\.0/);
  assert.match(license, /kekis69/);
});
