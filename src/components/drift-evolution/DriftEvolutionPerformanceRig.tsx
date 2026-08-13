"use client";

import { useLayoutEffect, useRef } from "react";
import type { MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { DriftEvolutionPerformanceProfile } from "@/lib/driftEvolutionPerformance";
import type { Drift3DVehiclePhysicsState } from "@/lib/drift3dVehiclePhysics";

const LEGACY_FOOLFOULE_CROWD_COUNT = 130;
const LOCAL_POINT_LIGHT_REFRESH_MS = 250;

type PointLightCandidate = {
  light: THREE.PointLight;
  wasVisible: boolean;
  distanceSq: number;
};

function isLegacyFoolfouleCrowd(object: THREE.Object3D) {
  return (
    object instanceof THREE.InstancedMesh &&
    object.count === LEGACY_FOOLFOULE_CROWD_COUNT &&
    object.geometry.type === "CapsuleGeometry"
  );
}

/**
 * Production render-cost controls. Geometry, materials and navigation stay
 * mounted; secondary instance shadows, the sun shadow cadence/resolution and
 * the number of locally relevant point lights are bounded by capability. The
 * inherited 130-person Foolfoule effect stays hidden because Evolution already
 * owns its richer 100-person, two-part crowd in the same place.
 */
export default function DriftEvolutionPerformanceRig({
  profile,
  vehicleStateRef,
}: {
  profile: DriftEvolutionPerformanceProfile;
  vehicleStateRef: MutableRefObject<Drift3DVehiclePhysicsState>;
}) {
  const scene = useThree((state) => state.scene);
  const gl = useThree((state) => state.gl);
  const shadowMapRef = useRef(gl.shadowMap);
  const shadowElapsedMsRef = useRef(0);
  const pointLightElapsedMsRef = useRef(0);
  const pointLightCandidatesRef = useRef<PointLightCandidate[]>([]);
  const pointLightPositionScratchRef = useRef(new THREE.Vector3());

  useLayoutEffect(() => {
    const shadowMap = shadowMapRef.current;
    const previousAutoUpdate = shadowMap.autoUpdate;
    const throttled = profile.shadowUpdateIntervalMs > 0;

    shadowElapsedMsRef.current = 0;
    if (throttled) {
      shadowMap.autoUpdate = false;
      shadowMap.needsUpdate = true;
    }

    return () => {
      shadowMap.autoUpdate = previousAutoUpdate;
      shadowMap.needsUpdate = true;
      shadowElapsedMsRef.current = 0;
    };
  }, [profile.shadowUpdateIntervalMs]);

  useFrame((_, delta) => {
    const intervalMs = profile.shadowUpdateIntervalMs;
    if (intervalMs > 0) {
      shadowElapsedMsRef.current += delta * 1000;
      if (shadowElapsedMsRef.current >= intervalMs) {
        // Request one normal Three.js shadow pass on the render that follows
        // this callback. Camera/vehicle/world rendering stays continuous.
        shadowElapsedMsRef.current %= intervalMs;
        shadowMapRef.current.needsUpdate = true;
      }
    }

    pointLightElapsedMsRef.current += delta * 1000;
    if (pointLightElapsedMsRef.current < LOCAL_POINT_LIGHT_REFRESH_MS) return;
    pointLightElapsedMsRef.current %= LOCAL_POINT_LIGHT_REFRESH_MS;

    const vehicle = vehicleStateRef.current.position;
    const scratch = pointLightPositionScratchRef.current;
    const candidates = pointLightCandidatesRef.current;
    for (const candidate of candidates) {
      candidate.light.getWorldPosition(scratch);
      const dx = scratch.x - vehicle.x;
      const dz = scratch.z - vehicle.z;
      candidate.distanceSq = dx * dx + dz * dz;
    }
    candidates.sort((a, b) => a.distanceSq - b.distanceSq);
    const budget = profile.mode === "mobile" ? 5 : 8;
    for (let index = 0; index < candidates.length; index += 1) {
      candidates[index].light.visible =
        candidates[index].wasVisible && index < budget;
    }
  });

  useLayoutEffect(() => {
    const suppressedLegacyCrowds = new Map<THREE.Object3D, boolean>();
    const shadowCasters = new Map<THREE.InstancedMesh, boolean>();
    const shadowLights = new Map<
      THREE.DirectionalLight,
      { width: number; height: number }
    >();
    const pointLightCandidates: PointLightCandidate[] = [];

    scene.traverse((object) => {
      if (isLegacyFoolfouleCrowd(object)) {
        suppressedLegacyCrowds.set(object, object.visible);
        // The inherited crowd writes `visible` itself before doing its matrix
        // work. Keep this promoted mesh observably hidden so that its
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

      if (object instanceof THREE.PointLight) {
        pointLightCandidates.push({
          light: object,
          wasVisible: object.visible,
          distanceSq: Number.POSITIVE_INFINITY,
        });
      }
    });
    pointLightCandidatesRef.current = pointLightCandidates;
    pointLightElapsedMsRef.current = LOCAL_POINT_LIGHT_REFRESH_MS;

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
      for (const candidate of pointLightCandidates) {
        candidate.light.visible = candidate.wasVisible;
      }
      pointLightCandidatesRef.current = [];
      pointLightElapsedMsRef.current = 0;
    };
  }, [profile, scene]);

  return null;
}
