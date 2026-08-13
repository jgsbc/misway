import assert from "node:assert/strict";
import test from "node:test";
import * as THREE from "three";
import { setDriftGeometryTextureRepeat } from "@/components/drift-3d/drift3dTextureFactory";

function readUv(geometry: THREE.BufferGeometry, index: number) {
  const uv = geometry.getAttribute("uv");
  return [uv.getX(index), uv.getY(index)] as const;
}

test("geometry UV repeat is idempotent and supports authored repeat changes", () => {
  const geometry = new THREE.PlaneGeometry(1, 1);
  const before = readUv(geometry, 0);

  setDriftGeometryTextureRepeat(geometry, 3, 2);
  assert.deepEqual(readUv(geometry, 0), [before[0] * 3, before[1] * 2]);

  setDriftGeometryTextureRepeat(geometry, 3, 2);
  assert.deepEqual(readUv(geometry, 0), [before[0] * 3, before[1] * 2]);

  setDriftGeometryTextureRepeat(geometry, 0.5, 4);
  assert.deepEqual(readUv(geometry, 0), [before[0] * 0.5, before[1] * 4]);
  geometry.dispose();
});

test("geometry UV repeat ignores invalid capability inputs", () => {
  const geometry = new THREE.PlaneGeometry(1, 1);
  const before = readUv(geometry, 1);

  setDriftGeometryTextureRepeat(geometry, Number.NaN, -2);
  assert.deepEqual(readUv(geometry, 1), before);
  geometry.dispose();
});
