"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Water } from "three/examples/jsm/objects/Water.js";
import { Sky } from "three/examples/jsm/objects/Sky.js";
import { getDrift3DKitAssetUrl } from "@/lib/drift3dKitAssets";
import {
  getDrift3DWaterPreset,
  getDrift3DWaterWeatherLightCapabilities,
  type Drift3DKitPilotStatus,
  type Drift3DWaterPresetId,
} from "@/lib/drift3dKitPilotConfig";
import {
  scaleDrift3DQualityDimension,
  type Drift3DQualityTier,
} from "@/lib/drift3dQuality";

/**
 * DRIFT-IV-PRE-30 — Water/Weather/Light pilot. Direct `Water.js`/`Sky.js`
 * imports from the installed `three@0.185.0` package (`PRE20-C02`, no
 * source copied, no new npm dependency), two bounded technical presets, and
 * the Poly Haven `snow_02` material (`PRE20-C01`) on a neutral test surface
 * through the existing diffuse/normal-GL/roughness `TextureLoader`
 * convention. Technical seeds only — this does not implement Étééaooété's
 * ocean, its erasure mechanic, or final New Signal/Older Shadows art.
 *
 * Known upstream limitation (see the evidence package): `Water`'s internal
 * reflection `WebGLRenderTarget` is a private constructor closure variable,
 * not exposed via any public accessor or `dispose()` method — this pilot
 * disposes every resource it owns directly (geometry, material, procedural
 * normal texture, Sky mesh) on unmount, but cannot call `.dispose()` on a
 * render target it was never given a reference to. This is an upstream
 * `three/examples/jsm/objects/Water.js` limitation, not introduced by this
 * pilot's own code.
 */

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
  texture.repeat.set(6, 6);

  return texture;
}

function applySunPosition(
  sky: Sky,
  water: Water,
  elevationDegrees: number
): void {
  const phi = THREE.MathUtils.degToRad(90 - elevationDegrees);
  const theta = THREE.MathUtils.degToRad(180);
  const sunPosition = new THREE.Vector3().setFromSphericalCoords(
    1,
    phi,
    theta
  );

  (sky.material.uniforms.sunPosition.value as THREE.Vector3).copy(
    sunPosition
  );
  water.material.uniforms.sunDirection.value
    .copy(sunPosition)
    .normalize();
}

type WaterWeatherLightPilotProps = {
  qualityTier: Drift3DQualityTier;
  reducedMotion: boolean;
  waterPresetId: Drift3DWaterPresetId;
  statusRef: MutableRefObject<Drift3DKitPilotStatus>;
};

export default function WaterWeatherLightPilot({
  qualityTier,
  reducedMotion,
  waterPresetId,
  statusRef,
}: WaterWeatherLightPilotProps) {
  const groupRef = useRef<THREE.Group>(null);
  const waterRef = useRef<Water | null>(null);
  const skyRef = useRef<Sky | null>(null);
  const normalTextureRef = useRef<THREE.Texture | null>(null);
  const snowMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const snowTexturesRef = useRef<THREE.Texture[]>([]);
  const capabilities = useMemo(
    () => getDrift3DWaterWeatherLightCapabilities(qualityTier),
    [qualityTier]
  );
  const textureSide = useMemo(
    () =>
      scaleDrift3DQualityDimension(
        512,
        capabilities.reflectionResolutionScale,
        128
      ),
    [capabilities.reflectionResolutionScale]
  );

  // Build Water + Sky once per mount.
  useLayoutEffect(() => {
    const group = groupRef.current;

    if (!group) {
      return;
    }

    const normalTexture = createProceduralWaterNormalTexture();
    normalTextureRef.current = normalTexture;

    const waterGeometry = new THREE.PlaneGeometry(14, 10);
    const water = new Water(waterGeometry, {
      textureWidth: textureSide,
      textureHeight: textureSide,
      waterNormals: normalTexture,
      sunDirection: new THREE.Vector3(0, 1, 0),
      sunColor: 0xffffff,
      waterColor: 0x11364a,
      distortionScale: 1,
      fog: false,
    });
    water.rotation.x = -Math.PI / 2;
    water.position.set(-6, 0, 3);
    group.add(water);
    waterRef.current = water;

    const sky = new Sky();
    sky.scale.setScalar(200);
    const uniforms = sky.material.uniforms;
    uniforms.turbidity.value = 6;
    uniforms.rayleigh.value = 1.6;
    uniforms.mieCoefficient.value = 0.004;
    uniforms.mieDirectionalG.value = 0.8;
    group.add(sky);
    skyRef.current = sky;

    const preset = getDrift3DWaterPreset(waterPresetId);
    water.material.uniforms.distortionScale.value = preset.distortionScale;
    applySunPosition(sky, water, preset.sunElevationDegrees);

    // Snow_02 (PRE20-C01) neutral material test surface, diffuse/normal-GL/
    // roughness — same TextureLoader convention as drift3dTextureFactory.ts.
    const loader = new THREE.TextureLoader();
    const diffuse = loader.load(
      getDrift3DKitAssetUrl("material-snow02-diffuse")
    );
    diffuse.colorSpace = THREE.SRGBColorSpace;
    diffuse.wrapS = THREE.RepeatWrapping;
    diffuse.wrapT = THREE.RepeatWrapping;
    diffuse.repeat.set(2, 2);

    const normalGl = loader.load(
      getDrift3DKitAssetUrl("material-snow02-normal-gl")
    );
    normalGl.colorSpace = THREE.NoColorSpace;
    normalGl.wrapS = THREE.RepeatWrapping;
    normalGl.wrapT = THREE.RepeatWrapping;
    normalGl.repeat.set(2, 2);

    const roughness = loader.load(
      getDrift3DKitAssetUrl("material-snow02-roughness")
    );
    roughness.colorSpace = THREE.NoColorSpace;
    roughness.wrapS = THREE.RepeatWrapping;
    roughness.wrapT = THREE.RepeatWrapping;
    roughness.repeat.set(2, 2);

    snowTexturesRef.current = [diffuse, normalGl, roughness];

    const snowMaterial = new THREE.MeshStandardMaterial({
      map: diffuse,
      normalMap: normalGl,
      roughnessMap: roughness,
      roughness: 1,
    });
    snowMaterialRef.current = snowMaterial;

    const snowGeometry = new THREE.PlaneGeometry(8, 8);
    const snowMesh = new THREE.Mesh(snowGeometry, snowMaterial);
    snowMesh.rotation.x = -Math.PI / 2;
    snowMesh.position.set(6, 0.001, 3);
    snowMesh.receiveShadow = true;
    group.add(snowMesh);

    statusRef.current = {
      ...statusRef.current,
      loadedAssetIds: [
        "material-snow02-diffuse",
        "material-snow02-normal-gl",
        "material-snow02-roughness",
      ],
      waterPreset: waterPresetId,
      instanceCount: 1,
    };

    return () => {
      group.remove(water);
      group.remove(sky);
      group.remove(snowMesh);

      water.geometry.dispose();
      water.material.dispose();
      normalTexture.dispose();

      sky.geometry.dispose();
      sky.material.dispose();

      snowGeometry.dispose();
      snowMaterial.dispose();
      for (const texture of snowTexturesRef.current) {
        texture.dispose();
      }
      snowTexturesRef.current = [];

      waterRef.current = null;
      skyRef.current = null;
      snowMaterialRef.current = null;
      normalTextureRef.current = null;

      statusRef.current = {
        ...statusRef.current,
        loadedAssetIds: [],
        waterPreset: null,
        instanceCount: 0,
        disposalCount: statusRef.current.disposalCount + 1,
      };
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textureSide]);

  // Apply preset changes without rebuilding Water/Sky.
  useEffect(() => {
    const water = waterRef.current;
    const sky = skyRef.current;

    if (!water || !sky) {
      return;
    }

    const preset = getDrift3DWaterPreset(waterPresetId);
    water.material.uniforms.distortionScale.value = preset.distortionScale;
    applySunPosition(sky, water, preset.sunElevationDegrees);
    statusRef.current = { ...statusRef.current, waterPreset: waterPresetId };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [waterPresetId]);

  useFrame((_, delta) => {
    const water = waterRef.current;

    if (!water) {
      return;
    }

    if (!reducedMotion) {
      const preset = getDrift3DWaterPreset(waterPresetId);
      water.material.uniforms.time.value += delta * preset.waveSpeed;
    }
  });

  return <group ref={groupRef} />;
}
