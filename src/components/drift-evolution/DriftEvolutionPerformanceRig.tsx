"use client";

import { useLayoutEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { DriftEvolutionPerformanceProfile } from "@/lib/driftEvolutionPerformance";

const LEGACY_FOOLFOULE_CROWD_COUNT = 130;

function isLegacyFoolfouleCrowd(object: THREE.Object3D) {
  return (
    object instanceof THREE.InstancedMesh &&
    object.count === LEGACY_FOOLFOULE_CROWD_COUNT &&
    object.geometry.type === "CapsuleGeometry"
  );
}

/**
 * Evolution-only render-cost controls. Geometry, materials and navigation stay
 * mounted; the mobile profile only removes shadow work from secondary
 * instances and lowers the shared sun shadow-map resolution. The inherited
 * 130-person Foolfoule effect is hidden on every profile because Evolution
 * already owns its richer 100-person, two-part crowd in the same place.
 */
export default function DriftEvolutionPerformanceRig({
  profile,
}: {
  profile: DriftEvolutionPerformanceProfile;
}) {
  const scene = useThree((state) => state.scene);

  useLayoutEffect(() => {
    const suppressedLegacyCrowds = new Map<THREE.Object3D, boolean>();
    const shadowCasters = new Map<THREE.InstancedMesh, boolean>();
    const shadowLights = new Map<
      THREE.DirectionalLight,
      { width: number; height: number }
    >();

    scene.traverse((object) => {
      if (isLegacyFoolfouleCrowd(object)) {
        suppressedLegacyCrowds.set(object, object.visible);
        // The inherited crowd writes `visible` itself before doing its matrix
        // work. Keep this Evolution-only mesh observably hidden so that its
        // own frame callback exits immediately instead of simulating a second
        // crowd behind the richer Evolution population.
        Object.defineProperty(object, "visible", {
          configurable: true,
          enumerable: true,
          get: () => false,
          set: () => undefined,
        });
      }

      if (
        object instanceof THREE.InstancedMesh &&
        !profile.secondaryInstancedShadows
      ) {
        shadowCasters.set(object, object.castShadow);
        object.castShadow = false;
      }

      if (object instanceof THREE.DirectionalLight && object.castShadow) {
        shadowLights.set(object, {
          width: object.shadow.mapSize.width,
          height: object.shadow.mapSize.height,
        });
        object.shadow.mapSize.set(
          profile.shadowMapSize,
          profile.shadowMapSize
        );
        if (object.shadow.map) {
          object.shadow.map.dispose();
          object.shadow.map = null;
        }
      }
    });

    return () => {
      for (const [object, wasVisible] of suppressedLegacyCrowds) {
        Object.defineProperty(object, "visible", {
          configurable: true,
          enumerable: true,
          writable: true,
          value: wasVisible,
        });
      }
      for (const [object, castShadow] of shadowCasters) {
        object.castShadow = castShadow;
      }
      for (const [light, mapSize] of shadowLights) {
        light.shadow.mapSize.set(mapSize.width, mapSize.height);
        if (light.shadow.map) {
          light.shadow.map.dispose();
          light.shadow.map = null;
        }
      }
    };
  }, [profile, scene]);

  return null;
}
