import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import test from "node:test";

const PROTECTED_DRIFT_BLOBS = Object.freeze({
  "src/app/drift/page.tsx": "dc9792403c70b2e6644ff6f0ed8a76b23dac2d1a",
  "src/components/drift-3d/Drift3DClient.tsx": "3864af2dfdb4e0dc34510f8721a38ba9c2c50ce8",
  "src/components/drift-3d/Drift3DCanvas.tsx": "e26e2beb6694962529624fc9c511411a83d8a88b",
  "src/components/drift-3d/Drift3DScene.tsx": "65fbc9190ec20ab2a471fdee24facc2df3fd9d95",
  "src/components/drift-3d/Drift3DSceneBase.tsx": "f71e78b325efb26353868209422a396c852ddb09",
  "src/components/drift-3d/Drift3DVehicle.tsx": "17e445de578d55ea4d7b3f1364d54e65b0c1a560",
  "src/components/drift-3d/Drift3DEffects.tsx": "2d15ed6e3020af6ebc6b9242359f6806819c4823",
  "src/components/drift-3d/Drift3DLandmark.tsx": "a1e5b40f90cab9166ab4f28b994cf4c49f0dea45",
  "src/components/drift-3d/Drift3DScatterField.tsx": "8d410d304f2d11abc8c44e5a5fbf7db3a02703d3",
  "src/lib/drift3d.ts": "00d2eec130df2ee9469bd814d0030a538560064f",
  "src/lib/drift3dVehiclePhysics.ts": "237fdff9e843ba0806bbf251406a6db48583e20f",
  "src/lib/drift3dTerrain.ts": "1e900df0b6e0e87332c2829bcba014d36827c6ee",
  "src/lib/drift3dTopology.ts": "c75aaf8cdf9ff08d0f5c79ae0c7b5793cbddb8dd",
  "src/lib/drift3dScatter.ts": "987cee6ca33590d47bb680791e965dd4515be482",
  "src/lib/drift3dAtmosphere.ts": "f6ce02259c08bcf2664bee6ecec1207732bb1f25",
  "src/lib/drift3dLandmarks.ts": "79c40f4d3b3d48b29a84d4a58ddb25ea8df1fa0c",
});

function readHeadBlob(path: string) {
  return execFileSync("git", ["rev-parse", `HEAD:${path}`], {
    encoding: "utf8",
  }).trim();
}

test("production /drift remains byte-identical to the restored baseline", () => {
  for (const [path, expectedBlob] of Object.entries(PROTECTED_DRIFT_BLOBS)) {
    assert.equal(
      readHeadBlob(path),
      expectedBlob,
      `${path} changed outside an explicit production-promotion decision`
    );
  }
});
