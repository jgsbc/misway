import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import test from "node:test";

// Keep the rear-spare guard source-driven: exactly four three-part road-wheel
// assemblies are valid candidates in the supplied Defender glTF.
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
const productionPageSource = readFileSync(
  new URL("../app/drift/page.tsx", import.meta.url),
  "utf8"
);
const legacySceneSource = readFileSync(
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

test("Defender 90 ships through the Evolution runtime promoted to /drift", () => {
  assert.match(productionPageSource, /<DriftEvolutionClient \/>/);
  assert.match(evolutionSceneSource, /Defender90LowpolyVehicleVisual/);
  assert.match(evolutionSceneSource, /<Defender90LowpolyVehicleVisual \/>/);
  assert.doesNotMatch(evolutionSceneSource, /<FullFidelityDefenderVehicleVisual/);
  assert.doesNotMatch(legacySceneSource, /Defender90LowpolyVehicleVisual/);
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

test("VEH-VIS-V1B-FIX2 only accepts wheel-sized source assemblies", () => {
  assert.match(evolutionVehicleSource, /SOURCE_TIRE_MATERIAL = "rubber"/);
  assert.match(evolutionVehicleSource, /WHEEL_DIRECT_MESH_CHILDREN = 3/);
  assert.match(evolutionVehicleSource, /WHEEL_MIN_DIAMETER = 0\.5/);
  assert.match(evolutionVehicleSource, /WHEEL_MAX_DIAMETER = 0\.75/);
  assert.match(evolutionVehicleSource, /WHEEL_MAX_THICKNESS = 0\.32/);
  assert.match(evolutionVehicleSource, /WHEEL_ROUNDNESS_TOLERANCE = 0\.08/);
  assert.match(evolutionVehicleSource, /isWheelLikeAssembly/);
  assert.match(evolutionVehicleSource, /directMeshChildren !== WHEEL_DIRECT_MESH_CHILDREN/);
  assert.match(evolutionVehicleSource, /sourceWheel\.clone\(true\)/);
  assert.match(evolutionVehicleSource, /vehicleBounds\.min\.z/);
  assert.match(evolutionVehicleSource, /pivot\.rotation\.y = Math\.PI \/ 2/);
  assert.match(evolutionVehicleSource, /misway_rear_spare_source_clone/);
  assert.doesNotMatch(evolutionVehicleSource, /getObjectByName\(/);
});

test("VEH-VIS-V1C derives a restrained roof rack from the authored roof mesh", () => {
  assert.match(evolutionVehicleSource, /RACK_COLOR = "#1b1d1c"/);
  assert.match(evolutionVehicleSource, /ROOF_RACK_WIDTH_RATIO = 0\.9/);
  assert.match(evolutionVehicleSource, /ROOF_RACK_LENGTH_RATIO = 0\.88/);
  assert.match(evolutionVehicleSource, /ROOF_RACK_BAR_THICKNESS = 0\.025/);
  assert.match(evolutionVehicleSource, /ROOF_RACK_CLEARANCE = 0\.035/);
  assert.match(evolutionVehicleSource, /ROOF_RACK_SIDE_HEIGHT = 0\.055/);
  assert.match(evolutionVehicleSource, /ROOF_RACK_CROSSBAR_COUNT = 4/);
  assert.match(evolutionVehicleSource, /findSourceRoofMesh/);
  assert.match(evolutionVehicleSource, /meshUsesMaterialName\(object, SOURCE_ROOF_MATERIAL\)/);
  assert.match(evolutionVehicleSource, /new THREE\.BoxGeometry/);
  assert.match(evolutionVehicleSource, /misway_roof_rack/);
  assert.match(
    evolutionVehicleSource,
    /installSourceRearSpare\(root\);[\s\S]*installSourceRoofRack\(root\);/
  );
});

test("Defender source exposes exactly four three-part rubber road-wheel assemblies", () => {
  const gltf = JSON.parse(readFileSync(assetGltfUrl, "utf8")) as {
    materials: Array<{ name?: string }>;
    nodes: Array<{ children?: number[]; mesh?: number }>;
    meshes: Array<{ primitives: Array<{ material?: number }> }>;
  };
  const rubberMaterialIndex = gltf.materials.findIndex(
    (material) => material.name === "rubber"
  );
  assert.notEqual(rubberMaterialIndex, -1);

  const wheelAssemblies = gltf.nodes.filter((node) => {
    const children = node.children ?? [];
    if (children.length !== 3) return false;
    const meshChildren = children
      .map((childIndex) => gltf.nodes[childIndex]?.mesh)
      .filter((meshIndex): meshIndex is number => meshIndex !== undefined);
    if (meshChildren.length !== 3) return false;
    return meshChildren.some((meshIndex) =>
      gltf.meshes[meshIndex].primitives.some(
        (primitive) => primitive.material === rubberMaterialIndex
      )
    );
  });

  assert.equal(wheelAssemblies.length, 4);
});

test("Defender hides the inherited visual during load but restores it on failure", () => {
  assert.match(
    evolutionVehicleSource,
    /useLayoutEffect\(\(\) => \{[\s\S]*legacy\.visible = false;[\s\S]*\}, \[scene\]\);/
  );
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
  /*
   * LOT 04 repacked this buffer (see public/models/defender90-lowpoly/README.md).
   * The invariant this assertion protects is that the shipped model is still the
   * whole Sketchfab vehicle with its attribution, not a substitute -- so it is
   * expressed as "the declared length matches the file on disk" plus the exact
   * triangle count, instead of the pre-repack magic number it used to hold.
   */
  assert.equal(gltf.buffers?.[0]?.byteLength, statSync(assetBinUrl).size);
  assert.equal(triangles, 100_075);
  assert.match(license, /CC-BY-4\.0/);
  assert.match(license, /kekis69/);
});

/*
 * LOT 04 -- critical loading path.
 *
 * This model was 60.7% of everything a cold visit to /drift downloads, and on a
 * throttled mobile connection the player became drivable roughly 18 seconds
 * before the vehicle appeared on screen. It was repacked, not decimated: the
 * geometry below must stay exactly what Sketchfab exported.
 */
const DEFENDER_BIN_BYTE_BUDGET = 3_000 * 1024;

test("Defender payload stays repacked without losing any geometry", () => {
  const gltf = JSON.parse(readFileSync(assetGltfUrl, "utf8")) as {
    images?: unknown[];
    textures?: unknown[];
    samplers?: unknown[];
    materials: Array<Record<string, unknown>>;
    accessors: Array<{ count: number; componentType: number; type: string }>;
    meshes: Array<{
      primitives: Array<{
        indices?: number;
        attributes: Record<string, number>;
      }>;
    }>;
  };

  const primitives = gltf.meshes.flatMap((mesh) => mesh.primitives);
  assert.equal(primitives.length, 51, "primitive count changed");

  const vertices = primitives.reduce(
    (total, primitive) => total + gltf.accessors[primitive.attributes.POSITION].count,
    0
  );
  assert.equal(vertices, 90_962, "vertex count changed");

  // Dropping the UV channel is only lossless while nothing can sample it.
  assert.equal(gltf.images?.length ?? 0, 0, "the model now declares images");
  assert.equal(gltf.textures?.length ?? 0, 0, "the model now declares textures");
  assert.equal(gltf.samplers?.length ?? 0, 0, "the model now declares samplers");
  for (const material of gltf.materials) {
    assert.ok(
      !/Texture/.test(JSON.stringify(material)),
      "a material references a texture; the repacked asset has no UVs to sample it with"
    );
  }
  for (const primitive of primitives) {
    const uvAttributes = Object.keys(primitive.attributes).filter((name) =>
      name.startsWith("TEXCOORD_")
    );
    assert.deepEqual(uvAttributes, [], "an unsampled UV channel is back in the payload");
    assert.ok(primitive.attributes.POSITION !== undefined, "primitive lost POSITION");
    assert.ok(primitive.attributes.NORMAL !== undefined, "primitive lost NORMAL");
  }

  // Narrowing the indices is only lossless while every index fits in 16 bits.
  const UNSIGNED_SHORT = 5123;
  for (const primitive of primitives) {
    assert.notEqual(primitive.indices, undefined, "primitive lost its index buffer");
    const indexAccessor = gltf.accessors[primitive.indices as number];
    assert.equal(
      indexAccessor.componentType,
      UNSIGNED_SHORT,
      "index buffer widened back to 32 bits"
    );
    const positionCount = gltf.accessors[primitive.attributes.POSITION].count;
    assert.ok(
      positionCount <= 65_536,
      `a primitive holds ${positionCount} vertices, which no longer fits a 16-bit index`
    );
  }

  assert.ok(
    statSync(assetBinUrl).size <= DEFENDER_BIN_BYTE_BUDGET,
    `scene.bin is ${statSync(assetBinUrl).size} bytes, over the LOT 04 budget of ${DEFENDER_BIN_BYTE_BUDGET}`
  );
});
