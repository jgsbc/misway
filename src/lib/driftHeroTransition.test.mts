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
  assert.match(driftPage, /<DriftEvolutionClient \/>/);
  assert.doesNotMatch(driftPage, /<Drift3DClient \/>/);
});

test("production Drift releases the hero only from rendered cave readiness", () => {
  const scene = read("src/components/drift-evolution/DriftEvolutionScene.tsx");

  assert.match(scene, /getDriftEvolutionEntryStartPosition/);
  assert.match(scene, /<DriftSceneReadySignal/);
  assert.match(scene, /expectedPosition=\{evolutionStartPosition\}/);
  assert.match(scene, /stableFrames=\{5\}/);
});

test("production Drift uses a track compass and one unified footer dock", () => {
  const canvas = read(
    "src/components/drift-evolution/DriftEvolutionCanvas.tsx"
  );
  const hud = read("src/components/drift-3d/Drift3DHud.tsx");
  const footer = read(
    "src/components/drift-evolution/DriftEvolutionFooter.tsx"
  );
  const runtime = read(
    "src/components/drift-evolution/DriftEvolutionRuntimeClient.tsx"
  );

  assert.match(canvas, /<DriftEvolutionFooter/);
  assert.match(canvas, /bearingDegrees=\{compassBearingDegrees\}/);
  assert.doesNotMatch(canvas, /showPersistentAudioChip/);
  assert.match(hud, /aria-label="Drift track compass"/);
  assert.match(hud, /<Navigation2/);
  assert.match(hud, /<Play/);
  assert.match(hud, /<Info/);
  assert.doesNotMatch(hud, />\s*PLAYING\s*</);
  assert.doesNotMatch(hud, />\s*DETAILS\s*</);
  assert.doesNotMatch(hud, /shortText|activeTrackTags|CONTROL BELOW/);
  assert.match(footer, /href="\/"/);
  assert.match(footer, /href="\/tracks"/);
  assert.match(footer, /onClick=\{onTogglePlayback\}/);
  assert.match(footer, /onClick=\{onToggleAmbience\}/);
  assert.match(footer, /AMBIENT/);
  assert.doesNotMatch(runtime, /href="\/tracks"/);
});
