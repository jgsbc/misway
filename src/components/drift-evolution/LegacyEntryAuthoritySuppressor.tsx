"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { drift3dThresholdNode } from "@/lib/drift3dTopology";

/**
 * The promoted runtime replaces the legacy Entry presentation with the
 * recovered long Fable cave on `/drift` and its internal review mirror.
 *
 * Both the legacy threshold marker and the legacy cave are direct scene
 * groups anchored on the production threshold coordinates. Hiding only
 * those exact roots removes the visual duplicate without mutating the shared
 * production landmark registry.
 */
export default function LegacyEntryAuthoritySuppressor() {
  const initializedRef = useRef(false);
  const hiddenRef = useRef<THREE.Group[]>([]);

  useFrame(({ scene }) => {
    if (initializedRef.current) return;

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
      hiddenRef.current.push(object);
    }

    initializedRef.current = true;
  }, -90);

  useEffect(
    () => () => {
      for (const object of hiddenRef.current) object.visible = true;
      hiddenRef.current = [];
      initializedRef.current = false;
    },
    []
  );

  return null;
}
