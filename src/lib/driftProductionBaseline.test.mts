import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import test from "node:test";

const PROTECTED_DRIFT_BLOBS = Object.freeze({
  "src/app/drift/page.tsx": "03a26ccec4a50042497688120171e4558722f34c",
  "src/components/drift-3d/Drift3DClient.tsx": "03f05fe01c08a5345ba5ad824ac9ec7d3811c8bf",
  "src/components/drift-3d/Drift3DCanvas.tsx": "fe8b4d5ea72598b7c7cb59f2f0af8ae156b8bcfa",
  "src/components/drift-3d/Drift3DScene.tsx": "6689d518ffd16050a03e3c62d682bd44d0dfadec",
  "src/components/drift-3d/Drift3DSceneBase.tsx": "f71e78b325efb26353868209422a396c852ddb09",
  "src/components/drift-3d/Drift3DVehicle.tsx": "17e445de578d55ea4d7b3f1364d54e65b0c1a560",
  "src/components/drift-3d/Drift3DEffects.tsx": "2d15ed6e3020af6ebc6b9242359f6806819c4823",
  "src/components/drift-3d/Drift3DLandmark.tsx": "a1e5b40f90cab9166ab4f28b994cf4c49f0dea45",
  "src/components/drift-3d/Drift3DScatterField.tsx": "8d410d304f2d11abc8c44e5a5fbf7db3a02703d3",
  "src/components/drift-3d/DriftStartupVeil.tsx": "d136b99a7e933b2d1bff01766a616873c8bd9f5d",
  "src/components/drift-3d/DriftHeroBackdrop.tsx": "9c0fa176d3c1e4322e88fc8f335b9e8ef02cee56",

  // Promoted Evolution layers are now production dependencies. Keep them
  // protected even though their historical filenames still say Evolution.
  "src/components/drift-evolution/EntryCaveSalvage.tsx": "d1c2fa7b0930d6e92d51ac4b605e07b818ad349c",
  "src/components/drift-evolution/EntryPortalLightCorrection.tsx": "8716a7b36c6a98dc9f5c9d2910c43f72aeed5d9a",
  "src/components/drift-evolution/EvolutionSafari110VehicleVisual.tsx": "cac1d56f3a32a1dd51b4aac72b547f899147b00f",
  "src/components/drift-evolution/FoolfouleCrowd.tsx": "bbd2617073bbe2de1610c35fcad056c9c8a808e0",
  "src/components/drift-evolution/FoolfouleDramaturgy.tsx": "1bad81d8c59f9d86e607b09c72da5f88b31058d1",
  "src/components/drift-evolution/DriftEvolutionSpatialRig.tsx": "7e84725476ab7f5baad2802460f7b6598e5b576e",
  "src/components/drift-evolution/LegacyEntryAuthoritySuppressor.tsx": "d11022fc6b4960d078900ca13f60c3cb381d9c6d",
  "src/components/drift-evolution/ZeelandWaterSurface.tsx": "cd95b325ffebdd96e2cee7f08fdf2eccca6e9caf",

  "src/lib/drift3d.ts": "00d2eec130df2ee9469bd814d0030a538560064f",
  "src/lib/drift3dBase.ts": "cdd34e00101c12631807e82f1be5ab6ac4f9c074",
  "src/lib/drift3dVehiclePhysics.ts": "237fdff9e843ba0806bbf251406a6db48583e20f",
  "src/lib/drift3dTerrain.ts": "1e900df0b6e0e87332c2829bcba014d36827c6ee",
  "src/lib/drift3dTopology.ts": "7cd1ced44b6c06f6313999e673187c08da14b7d7",
  "src/lib/drift3dScatter.ts": "987cee6ca33590d47bb680791e965dd4515be482",
  "src/lib/drift3dAtmosphere.ts": "f6ce02259c08bcf2664bee6ecec1207732bb1f25",
  "src/lib/drift3dLandmarks.ts": "79c40f4d3b3d48b29a84d4a58ddb25ea8df1fa0c",
  "src/lib/drift3dSafari110FinalGeometry.ts": "764bb823622a37fa7c137a67867251b6715c6c5a",
  "src/lib/drift3dSafari110Runtime.ts": "a4e474671d698ea7209bef32e9bfeaa9f1e4ffbc",
  "src/lib/drift3dOriginalVehicleGeometry.ts": "e9c5a8ea27395937ca719847db4d9fd66bd9c9b8",
  "src/lib/driftEvolutionEntryCave.ts": "31a171bf263737f6efd377593f63c1c825c3dc2f",
  "src/lib/driftEvolutionFoolfoule.ts": "2d8b9c0bb0d77d37f70cec8c13b15bc8e12c4b4a",
  "src/lib/driftEvolutionFoolfouleDramaturgy.ts": "f38207bd6530692c6a70e30442aaafb4cf29c0d1",
  "src/lib/driftEvolutionSpatial.ts": "c21f9bb3e8997e7bb0c1b50dfbb28b508c6e78ab",
  "src/lib/driftEvolutionZeelandGeography.ts": "d0cc3f6e64208e30818ec3c4ce31db2c634962bc",
  "src/lib/driftEvolutionFoolfouleRegistry.ts": "f6e74b35e6a32fed517b303fd954257c3aca8145",
  "src/lib/driftEvolutionLegacyEntryRegistry.ts": "aadbde106b578df6c1bea9406fc366c006098281",
  "src/lib/driftEvolutionZeelandRegistry.ts": "348dace4ce3a956c93e411842348e843ce2069a8",
});

function readHeadBlob(path: string) {
  return execFileSync("git", ["rev-parse", `HEAD:${path}`], {
    encoding: "utf8",
  }).trim();
}

test("production /drift remains on the approved promoted baseline", () => {
  for (const [path, expectedBlob] of Object.entries(PROTECTED_DRIFT_BLOBS)) {
    assert.equal(
      readHeadBlob(path),
      expectedBlob,
      `${path} changed outside an explicit production-promotion decision`
    );
  }
});
