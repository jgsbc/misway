import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import test from "node:test";

const PROTECTED_DRIFT_BLOBS = Object.freeze({
  "src/app/drift/page.tsx": "bff0166b9194f354f87ab39c7588c5d77107b3d6",
  "src/app/drift/layout.tsx": "65b5e62d9dd69f2af4b370ae7151d537d10cb782",
  "src/components/drift-3d/Drift3DSceneBase.tsx": "d731caff43d1e78518a217a512d68aa340158f2e",
  "src/components/drift-3d/Drift3DVehicle.tsx": "17e445de578d55ea4d7b3f1364d54e65b0c1a560",
  "src/components/drift-3d/Drift3DEffects.tsx": "2d15ed6e3020af6ebc6b9242359f6806819c4823",
  "src/components/drift-3d/Drift3DLandmark.tsx": "787868bbb560efb8537cd8c0717ca3e3429922e4",
  "src/components/drift-3d/Drift3DScatterField.tsx": "8d410d304f2d11abc8c44e5a5fbf7db3a02703d3",
  "src/components/drift-3d/DriftStartupVeil.tsx": "d136b99a7e933b2d1bff01766a616873c8bd9f5d",
  "src/components/drift-3d/DriftHeroBackdrop.tsx": "9c0fa176d3c1e4322e88fc8f335b9e8ef02cee56",
  "src/components/drift-3d/Drift3DHud.tsx": "49c3f5126e7e1b0437695c5a7846e656c35fcd2a",

  // Owner-approved Evolution runtime promoted to production on 2026-08-13.
  "src/components/drift-evolution/DriftEvolutionClient.tsx": "76af465108cb8813ea46a60a3d732d232ad160b7",
  "src/components/drift-evolution/DriftEvolutionRuntimeClient.tsx": "d467a6d34f905b859422720444de1ca5ea3ed2c9",
  "src/components/drift-evolution/DriftEvolutionCanvas.tsx": "d4197173d8d3751c7588d00007caacf55d5f950c",
  "src/components/drift-evolution/DriftEvolutionFooter.tsx": "e1dfdb44d762fa566b6d8b50f002bc594df2f2a5",
  "src/components/drift-evolution/DriftEvolutionScene.tsx": "3928f92edecf9d92511086863b7d2d829a0a49cf",
  "src/components/drift-evolution/DriftEvolutionPerformanceRig.tsx": "70b907994856d85880fcb0694406204e4e40c7cb",
  "src/components/drift-evolution/Defender90LowpolyVehicleVisual.tsx": "97d5a31f26bd09c35b41a88a345ab86bf4c519bd",
  "src/components/drift-evolution/EntryCaveSalvage.tsx": "028e4c67cca8fb622714a8a3d22d55ec9b0635e6",
  "src/components/drift-evolution/EntryPortalLightCorrection.tsx": "8716a7b36c6a98dc9f5c9d2910c43f72aeed5d9a",
  "src/components/drift-evolution/FoolfouleCrowd.tsx": "bbd2617073bbe2de1610c35fcad056c9c8a808e0",
  "src/components/drift-evolution/FoolfouleDramaturgy.tsx": "587fc99e188f4c18f33d84481ca89abc64913902",
  // Owner-approved world-edge continuity correction promoted on 2026-08-14.
  "src/components/drift-evolution/DriftEvolutionSpatialRig.tsx": "1eccd4b55da7b51337e1ffd98321e5a29c6f3957",
  "src/components/drift-evolution/DriftNorthEdgeContinuityFix.tsx": "f5bdf9ba6105906415d90ee92a9922356ffac521",
  "src/components/drift-evolution/LegacyEntryAuthoritySuppressor.tsx": "a555152016d9f6e43c98e0f3593130872bdd19a1",
  "src/components/drift-evolution/ZeelandWaterSurface.tsx": "8f906a989c1fd910894688c7e4981d04bc48fe53",

  "public/models/defender90-lowpoly/license.txt": "1988ff678583f8549efcdadd0e01c1204f3e0816",
  "public/models/defender90-lowpoly/scene.bin": "2af9a90cf0fc1dd88e40034d2ca3566adb6e185b",
  "public/models/defender90-lowpoly/scene.gltf": "5977870861e3fab90761e369e7ca6c35925d0192",

  "src/lib/drift3d.ts": "00d2eec130df2ee9469bd814d0030a538560064f",
  "src/lib/drift3dBase.ts": "0a7a386cd9734c41037707b9890f8048bf8a54f4",
  "src/lib/drift3dVehiclePhysics.ts": "ef7e9bf22a5b90dfa8df859fcdb1e87d4c84dfbe",
  "src/lib/drift3dVehiclePhysicsBase.ts": "68e3583a095d1a9a94acedf238f6ac460d440fb6",
  "src/lib/drift3dTransmission.ts": "cdcea0d354a6b3071b7920f5407368b7abeb6221",
  "src/lib/drift3dAmbience.ts": "a51f85e11e715fbcb3b61c5d6f4d69a9ff06ac3b",
  "src/lib/drift3dTerrain.ts": "9ea3c85c7d58112fcc2fb7c6ba6cd1a3f89f6dca",
  "src/lib/drift3dTopology.ts": "7cd1ced44b6c06f6313999e673187c08da14b7d7",
  "src/lib/drift3dScatter.ts": "987cee6ca33590d47bb680791e965dd4515be482",
  "src/lib/drift3dAtmosphere.ts": "f6ce02259c08bcf2664bee6ecec1207732bb1f25",
  "src/lib/drift3dLandmarks.ts": "79c40f4d3b3d48b29a84d4a58ddb25ea8df1fa0c",
  "src/lib/drift3dSafari110FinalGeometry.ts": "764bb823622a37fa7c137a67867251b6715c6c5a",
  "src/lib/drift3dSafari110Runtime.ts": "a4e474671d698ea7209bef32e9bfeaa9f1e4ffbc",
  "src/lib/drift3dOriginalVehicleGeometry.ts": "e9c5a8ea27395937ca719847db4d9fd66bd9c9b8",
  "src/lib/driftEvolutionEntryCave.ts": "4d5626373557e7c9a10050404a1ea26c57d7bc84",
  "src/lib/driftEvolutionFoolfoule.ts": "2d8b9c0bb0d77d37f70cec8c13b15bc8e12c4b4a",
  "src/lib/driftEvolutionFoolfouleDramaturgy.ts": "f38207bd6530692c6a70e30442aaafb4cf29c0d1",
  "src/lib/driftEvolutionSpatial.ts": "444f4e33f189ef6b7c6dc953fcad15d3cbf785af",
  "src/lib/driftEvolutionZeelandGeography.ts": "d0cc3f6e64208e30818ec3c4ce31db2c634962bc",
  "src/lib/driftEvolutionFoolfouleRegistry.ts": "5e9e1bf8dc7687a7f0d6ee3b75e299abb3e7b796",
  "src/lib/driftEvolutionLegacyEntryRegistry.ts": "7dd3b172cfb85e48c784c8fdb19eb698c9df4f48",
  "src/lib/driftEvolutionZeelandRegistry.ts": "e58de4886961ea6a1cb2f9bbf804abb884360996",
  "src/lib/driftEvolutionPerformance.ts": "8ab67e365bd64f4f8d11ab17afb1b3d61504a7e1",
  "src/lib/driftEvolutionBirthYardRouteLab.ts": "2a6ef70f8d4d2bfb9955756dd6fabd733ce0279a",
  "src/lib/driftEvolutionJazzyplingDistrict.ts": "3068e31f84ad46f898ff378de347939d9fdbfc30",
  "src/lib/driftEvolutionJazzyplingRegistry.ts": "ad665c7381018e18cbd9e4e8f1d7740fcff928ba",
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
