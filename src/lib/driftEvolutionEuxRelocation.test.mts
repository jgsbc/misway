import assert from "node:assert/strict";
import test from "node:test";
import * as THREE from "three";
import { EUX_GAINENT_LANDMARK_ID } from "./drift3dEuxGainent";
import { drift3dLandmarks } from "./drift3dLandmarks";
import {
  findEuxGainentLivingSceneRoot,
  getEuxGainentEvolutionTranslation,
} from "./driftEvolutionEuxRelocation";

test("EUX evolution translation moves the entire authored scene to its New Signal slot", () => {
  const translation = getEuxGainentEvolutionTranslation();

  assert.equal(translation.x, 120);
  assert.equal(translation.z, -4);
  assert.equal(Number.isFinite(translation.y), true);
  assert.ok(Math.abs(translation.y) < 1);
});

test("EUX living-scene root is found from its unique semantic screen", () => {
  const landmark = drift3dLandmarks.find(
    (candidate) => candidate.id === EUX_GAINENT_LANDMARK_ID
  );
  assert.ok(landmark);

  const facade = landmark.primitives[0];
  const scene = new THREE.Scene();
  const unrelatedRoot = new THREE.Group();
  const euxRoot = new THREE.Group();

  const unrelatedMaterial = new THREE.MeshBasicMaterial();
  unrelatedMaterial.fog = false;
  unrelatedMaterial.toneMapped = false;
  unrelatedRoot.add(
    new THREE.Mesh(new THREE.PlaneGeometry(1, 1), unrelatedMaterial)
  );

  const screenMaterial = new THREE.MeshBasicMaterial();
  screenMaterial.fog = false;
  screenMaterial.toneMapped = false;
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(facade.args[0] * 0.86, facade.args[1] * 0.62),
    screenMaterial
  );
  euxRoot.add(screen);

  scene.add(unrelatedRoot, euxRoot);

  assert.equal(findEuxGainentLivingSceneRoot(scene), euxRoot);

  screen.geometry.dispose();
  screenMaterial.dispose();
  for (const child of unrelatedRoot.children) {
    if (child instanceof THREE.Mesh) child.geometry.dispose();
  }
  unrelatedMaterial.dispose();
});
