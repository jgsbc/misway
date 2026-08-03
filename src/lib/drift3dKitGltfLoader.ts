import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

/**
 * DRIFT-IV-PRE-30 — thin glTF loading layer for the three shared-kit pilots.
 * Deliberately not cached at the module level: only one pilot mounts at a
 * time, and each mount owns and disposes exactly the GPU resources it
 * created (see each pilot's unmount cleanup). A shared in-memory cache of
 * loaded scenes would risk one pilot disposing geometry/materials another
 * still-mounted consumer depends on — this loader avoids that class of bug
 * entirely by never sharing GPU-resident objects across mounts. Repeated
 * loads of the same URL are still bounded: the browser's own HTTP cache
 * avoids a real repeated network fetch for these static, immutable files.
 */
const loader = new GLTFLoader();

export function loadDrift3DKitGltf(url: string): Promise<GLTF> {
  return loader.loadAsync(url);
}

/**
 * Disposes every `BufferGeometry`/`Material`/`Texture` reachable from
 * `root`, matching `DRIFT_3D_SHARED_KIT_ARCHITECTURE.md` §1.7's explicit
 * glTF disposal obligation (GC alone does not reclaim GPU memory). Safe to
 * call on a detached (already-removed-from-scene) root.
 */
export function disposeDrift3DKitObject3D(root: {
  traverse: (callback: (object: unknown) => void) => void;
}): void {
  root.traverse((object) => {
    const mesh = object as {
      geometry?: { dispose?: () => void };
      material?: unknown;
    };

    mesh.geometry?.dispose?.();

    const materials = Array.isArray(mesh.material)
      ? mesh.material
      : mesh.material
        ? [mesh.material]
        : [];

    for (const material of materials) {
      const materialRecord = material as Record<string, unknown>;

      for (const value of Object.values(materialRecord)) {
        const maybeTexture = value as { isTexture?: boolean; dispose?: () => void };

        if (maybeTexture?.isTexture) {
          maybeTexture.dispose?.();
        }
      }

      (materialRecord as { dispose?: () => void }).dispose?.();
    }
  });
}
