"use client";

import { useEffect, useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Water } from "three/examples/jsm/objects/Water.js";
import { Sky } from "three/examples/jsm/objects/Sky.js";
import { getDrift3DQualityProfile, scaleDrift3DQualityDimension } from "@/lib/drift3dQuality";
import type { Drift3DQualityTier } from "@/lib/drift3dQuality";
import { getDrift3DGroundY } from "@/lib/drift3dTerrain";
import { getDrift3DAtmosphereAt } from "@/lib/drift3dAtmosphere";
import { getDrift3DMacroWorldConfig } from "@/lib/drift3dMacroWorldConfig";
import type { Drift3DMacroWorldGreyboxStatus } from "@/lib/drift3dMacroWorldGreyboxHarness";

/**
 * DRIFT-IV-PRE-40 — New Signal macro-world greybox.
 *
 * Binding guardrail (Era Contract, verbatim, ratified GOV-40): "One real
 * geography must dominate every New Signal frame. Other worlds may appear
 * only as reflection, light, signal, distant silhouette, weather, material,
 * or brief memory — never as a second fully-realized geography." This
 * greybox builds exactly ONE dominant geography — a coastal overlook, the
 * accepted masterframe's own frame: a headland road with the final beach
 * (Étééaooété's own, unchanged) visible far below and ahead, small, not yet
 * reached. Direct `Water.js`/`Sky.js` imports (PRE20-C02), no source copied.
 * No claim that final Étééaooété/erasure/weather/ocean art is complete.
 */

const NEW_SIGNAL = getDrift3DMacroWorldConfig("new-signal");

function createProceduralWaterNormalTexture(): THREE.Texture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");

  if (context) {
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const n1 = Math.sin(x * 0.21) * Math.cos(y * 0.17);
        const n2 = Math.sin((x + y) * 0.09);
        const nx = 128 + n1 * 40;
        const ny = 128 + n2 * 40;
        context.fillStyle = `rgb(${nx | 0},${ny | 0},255)`;
        context.fillRect(x, y, 1, 1);
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);

  return texture;
}

type NewSignalGreyboxProps = {
  qualityTier: Drift3DQualityTier;
  reducedMotion: boolean;
  statusRef: MutableRefObject<Drift3DMacroWorldGreyboxStatus>;
};

export default function NewSignalGreybox({
  qualityTier,
  reducedMotion,
  statusRef,
}: NewSignalGreyboxProps) {
  const groupRef = useRef<THREE.Group>(null);
  const waterRef = useRef<Water | null>(null);
  const normalTextureRef = useRef<THREE.Texture | null>(null);

  const profile = useMemo(() => getDrift3DQualityProfile(qualityTier), [qualityTier]);
  const textureSide = useMemo(
    () => scaleDrift3DQualityDimension(512, profile.capabilities.reflectionResolutionScale, 128),
    [profile]
  );

  // The final beach, visible far below and ahead — small, distant, not yet
  // reached. Positioned further along the route direction and lower in
  // elevation than the headland road itself.
  const oceanPosition = useMemo(() => {
    const x = NEW_SIGNAL.localOrigin.x + 26;
    const z = NEW_SIGNAL.localOrigin.z - 4;

    return { x, z, y: getDrift3DGroundY(x, z) - 3.5 };
  }, []);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    const normalTexture = createProceduralWaterNormalTexture();
    normalTextureRef.current = normalTexture;

    // Small relative to the headland frame — "small, not yet reached."
    const waterGeometry = new THREE.PlaneGeometry(22, 16);
    const atmosphere = getDrift3DAtmosphereAt({
      x: NEW_SIGNAL.localOrigin.x,
      z: NEW_SIGNAL.localOrigin.z,
    });
    const sunDirection = new THREE.Vector3(
      atmosphere.sunDirection.x,
      atmosphere.sunDirection.y,
      atmosphere.sunDirection.z
    ).normalize();

    const water = new Water(waterGeometry, {
      textureWidth: textureSide,
      textureHeight: textureSide,
      waterNormals: normalTexture,
      sunDirection,
      sunColor: 0xcdd8ee,
      waterColor: 0x0c1622,
      distortionScale: 1.4,
      fog: true,
    });
    water.rotation.x = -Math.PI / 2;
    water.position.set(oceanPosition.x, oceanPosition.y, oceanPosition.z);
    group.add(water);
    waterRef.current = water;

    const sky = new Sky();
    sky.scale.setScalar(300);
    const uniforms = sky.material.uniforms;
    uniforms.turbidity.value = 3;
    uniforms.rayleigh.value = 0.6;
    uniforms.mieCoefficient.value = 0.003;
    uniforms.mieDirectionalG.value = 0.85;
    const phi = THREE.MathUtils.degToRad(90 - 22);
    const theta = THREE.MathUtils.degToRad(200);
    const sunPosition = new THREE.Vector3().setFromSphericalCoords(1, phi, theta);
    (uniforms.sunPosition.value as THREE.Vector3).copy(sunPosition);
    group.add(sky);

    statusRef.current = {
      ...statusRef.current,
      loadedResourceIds: [
        ...new Set([...statusRef.current.loadedResourceIds, "new-signal-water-sky"]),
      ],
    };

    return () => {
      group.remove(water);
      group.remove(sky);
      water.geometry.dispose();
      water.material.dispose();
      normalTexture.dispose();
      sky.geometry.dispose();
      sky.material.dispose();
      waterRef.current = null;
      normalTextureRef.current = null;
      statusRef.current = {
        ...statusRef.current,
        disposalCount: statusRef.current.disposalCount + 1,
      };
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textureSide]);

  useFrame((_, delta) => {
    const water = waterRef.current;
    if (water && !reducedMotion) {
      water.material.uniforms.time.value += delta * 0.35;
    }
  });

  const distantWarmPointPosition = useMemo(() => {
    // "the distant city's small warm point along the shoreline's curve" —
    // a single trace of light, never a second geography.
    const x = NEW_SIGNAL.localOrigin.x + 40;
    const z = NEW_SIGNAL.localOrigin.z - 30;

    return { x, y: getDrift3DGroundY(x, z) + 3, z };
  }, []);

  const headlandRoadPosition = useMemo(() => {
    const x = NEW_SIGNAL.localOrigin.x;
    const z = NEW_SIGNAL.localOrigin.z;

    return { x, y: getDrift3DGroundY(x, z), z };
  }, []);

  return (
    <group ref={groupRef}>
      {/* One small, warm distant point — reflection/light/trace only, never
          a second geography. */}
      <mesh position={[distantWarmPointPosition.x, distantWarmPointPosition.y, distantWarmPointPosition.z]}>
        <sphereGeometry args={[0.15, 8, 6]} />
        <meshStandardMaterial
          color="#ffdca0"
          emissive="#ffb060"
          emissiveIntensity={1.6}
        />
      </mesh>
      <pointLight
        position={[distantWarmPointPosition.x, distantWarmPointPosition.y, distantWarmPointPosition.z]}
        color="#ffcf94"
        intensity={0.6}
        distance={6}
      />

      {/* Headland guardrail marker — a low, credible roadside edge, never a
          barrier that hides the overlook composition. */}
      <mesh
        position={[headlandRoadPosition.x + 6, headlandRoadPosition.y + 0.3, headlandRoadPosition.z]}
        rotation={[0, 0, 0]}
      >
        <boxGeometry args={[0.15, 0.5, 18]} />
        <meshStandardMaterial color="#3a3d3f" roughness={0.8} metalness={0.2} />
      </mesh>
    </group>
  );
}
