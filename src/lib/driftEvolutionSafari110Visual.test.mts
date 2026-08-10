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

test("Defender 90 remains Evolution-only", () => {
  assert.match(evolutionSceneSource, /Defender90LowpolyVehicleVisual/);
  assert.match(evolutionSceneSource, /<Defender90LowpolyVehicleVisual \/>/);
  assert.doesNotMatch(evolutionSceneSource, /<FullFidelityDefenderVehicleVisual/);
  assert.doesNotMatch(productionSceneSource, /Defender90LowpolyVehicleVisual/);
  assert.doesNotMatch(productionBaseSource, /Defender90LowpolyVehicleVisual/);
  assert.match(productionBaseSource, /<Drift3DVehicle/);
});

test("VEH-VIS convergence keeps approved pose and size", () => {
  assert.match(evolutionVehicleSource, /findLegacyVehiclePoseGroup/);
  assert.match(evolutionVehicleSource, /legacy\.visible = false/);
  assert.match(evolutionVehicleSource, /poseGroup\.position\.copy\(legacy\.position\)/);
  assert.match(evolutionVehicleSource, /poseGroup\.quaternion\.copy\(legacy\.quaternion\)/);
  assert.match(evolutionVehicleSource, /defender90-lowpoly\/scene\.gltf/);
  assert.match(evolutionVehicleSource, /RUNTIME_SCALE = 0\.82/);
  assert.match(evolutionVehicleSource, /4\.84276/);
  assert.match(evolutionVehicleSource, /-0\.09198/);
  assert.match(evolutionVehicleSource, /-0\.24755/);
  assert.doesNotMatch(evolutionVehicleSource, /stepDrift3DVehiclePhysics/);
  assert.doesNotMatch(evolutionVehicleSource, /constrainDriftEvolutionEntryVehicle/);
});

test("VEH-VIS convergence includes the owner-approved V1A materials", () => {
  assert.match(evolutionVehicleSource, /BODY_COLOR = "#c5aa76"/);
  assert.match(evolutionVehicleSource, /ROOF_COLOR = "#d3c39f"/);
  assert.match(evolutionVehicleSource, /SOURCE_BODY_MATERIAL = "Material\.002"/);
  assert.match(evolutionVehicleSource, /SOURCE_ROOF_MATERIAL = "Material\.003"/);
  assert.match(evolutionVehicleSource, /tuneMiswayMaterial/);
  assert.match(evolutionVehicleSource, /material\.metalness = 0\.08/);
  assert.match(evolutionVehicleSource, /material\.roughness = 0\.72/);
  assert.match(evolutionVehicleSource, /material\.metalness = 0\.05/);
  assert.match(evolutionVehicleSource, /material\.roughness = 0\.78/);
});

test("VEH-VIS-V1B-FIX discovers and places a source-native rear spare geometrically", () => {
  assert.match(evolutionVehicleSource, /SOURCE_TIRE_MATERIAL = "rubber"/);
  assert.match(evolutionVehicleSource, /findSourceWheelAssembly/);
  assert.match(evolutionVehicleSource, /meshUsesMaterialName/);
  assert.match(evolutionVehicleSource, /sourceWheel\.clone\(true\)/);
  assert.match(evolutionVehicleSource, /vehicleBounds = new THREE\.Box3\(\)\.setFromObject\(root\)/);
  assert.match(evolutionVehicleSource, /vehicleBounds\.min\.z/);
  assert.match(evolutionVehicleSource, /root\.worldToLocal/);
  assert.match(evolutionVehicleSource, /pivot\.rotation\.y = Math\.PI \/ 2/);
  assert.match(evolutionVehicleSource, /misway_rear_spare_source_clone/);
  assert.doesNotMatch(evolutionVehicleSource, /getObjectByName\(SOURCE_REAR_WHEEL_GROUP\)/);
  assert.doesNotMatch(evolutionVehicleSource, /REAR_SPARE_CENTER = Object\.freeze/);
  assert.doesNotMatch(evolutionVehicleSource, /new THREE\.Mesh\(/);
  assert.doesNotMatch(
    evolutionVehicleSource,
    /roof_rack|roof_roll|bullbar|ladder|snorkel/
  );
});

test("Defender hides the inherited visual during load but restores it on failure", () => {
  assert.match(
    evolutionVehicleSource,
    /useLayoutEffect\(\(\) => \{[\s\S]*legacy\.visible = false;[\s\S]*\}, \[scene\]\);/
  );
  assert.match(evolutionVehicleSource, /Loading failure is the only case/);
  assert.match(evolutionVehicleSource, /legacy\.visible = true/);
});

test("Defender source asset is complete and attribution-ready", () => {
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
