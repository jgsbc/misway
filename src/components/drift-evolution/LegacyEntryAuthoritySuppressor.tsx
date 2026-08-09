"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { drift3dThresholdNode } from "@/lib/drift3dTopology";

/**
 * `/drift-evolution` replaces the restored production Entry presentation with
 * the recovered long Fable cave. Production `/drift` remains untouched.
 *
 * Both the legacy threshold marker and the legacy cave are direct scene
 * groups anchored on the production threshold coordinates. Hiding only
 * those exact roots removes the visual duplicate without mutating the shared
 * production landmark registry.
 */
export default function LegacyEntryAuthoritySuppressor() {
  const scene = useThree((state) => state.scene);

  useEffect(() => {
    const hidden: THREE.Group[] = [];
    const targetX = drift3dThresholdNode.position.x;
    const targetZ = drift3dThresholdNode.position.z;

    for (const object of scene.children) {
      if (!(object instanceof THREE.Group)) continue;
      if (
        Math.abs(object.position.x - targetX) > 0.001 ||
        Math.abs(object.position.z - targetZ) > 0.001
      ) {
        continue;
      }

      object.visible = false;
      hidden.push(object);
    }

    return () => {
      for (const object of hidden) object.visible = true;
    };
  }, [scene]);

  return null;
}
