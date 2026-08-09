import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();

function read(relativePath: string) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

test("home and Drift startup share the same hero doorway authority", () => {
  const home = read("src/app/page.tsx");
  const entry = read("src/components/drift-3d/DriftEntryLink.tsx");
  const veil = read("src/components/drift-3d/DriftStartupVeil.tsx");
  const driftPage = read("src/app/drift/page.tsx");

  assert.match(home, /<DriftHeroBackdrop \/>/);
  assert.match(home, /<DriftEntryLink \/>/);
  assert.match(entry, /<DriftHeroBackdrop shimmer \/>/);
  assert.match(veil, /<DriftHeroBackdrop shimmer \/>/);
  assert.match(driftPage, /<DriftStartupVeil \/>/);
});

test("production Drift releases the hero only from rendered cave readiness", () => {
  const scene = read("src/components/drift-3d/Drift3DScene.tsx");

  assert.match(scene, /getDriftEvolutionEntryStartPosition/);
  assert.match(scene, /<DriftSceneReadySignal/);
  assert.match(scene, /expectedPosition=\{evolutionStartPosition\}/);
  assert.match(scene, /stableFrames=\{5\}/);
});
