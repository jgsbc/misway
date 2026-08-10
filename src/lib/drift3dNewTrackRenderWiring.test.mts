import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const scenePaths = [
  "src/components/drift-3d/Drift3DScene.tsx",
  "src/components/drift-evolution/DriftEvolutionScene.tsx",
] as const;

test("production and evolution scenes render the canonical new-track landmarks", () => {
  for (const path of scenePaths) {
    const source = readFileSync(path, "utf8");

    assert.match(
      source,
      /drift3dNewTrackLandmarks/,
      `${path} must import the canonical new-track landmark layer`
    );
    assert.match(
      source,
      /drift3dNewTrackLandmarks\.map\(\(landmark\) =>/,
      `${path} must render every canonical new-track landmark`
    );
    assert.match(
      source,
      /<Drift3DLandmark/,
      `${path} must render the layer through Drift3DLandmark`
    );
  }
});
