import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import * as THREE from "three";
import { DRIFT_3D_ORIGINAL_VEHICLE } from "./drift3dOriginalVehicle";
import { parseDrift3DOriginalVehicleGlb } from "./drift3dOriginalVehicleGlb";

test("VEH-B01 committed GLB parses into renderable Three.js geometry", async () => {
  const file = await readFile(
    new URL(`../../public${DRIFT_3D_ORIGINAL_VEHICLE.path}`, import.meta.url)
  );
  const arrayBuffer = file.buffer.slice(
    file.byteOffset,
    file.byteOffset + file.byteLength
  ) as ArrayBuffer;

  const root = parseDrift3DOriginalVehicleGlb(arrayBuffer);
  assert.equal(root.children.length, 10);

  let triangleCount = 0;
  let meshCount = 0;
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    meshCount += 1;
    const index = object.geometry.getIndex();
    const positions = object.geometry.getAttribute("position");
    assert.ok(positions);
    triangleCount += index ? index.count / 3 : positions.count / 3;
  });

  assert.equal(meshCount, 10);
  assert.equal(triangleCount, DRIFT_3D_ORIGINAL_VEHICLE.triangleCount);

  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  assert.ok(Number.isFinite(size.x) && size.x > 1.8 && size.x < 2.3);
  assert.ok(Number.isFinite(size.y) && size.y > 2.0 && size.y < 2.5);
  assert.ok(Number.isFinite(size.z) && size.z > 4.4 && size.z < 5.0);
});
