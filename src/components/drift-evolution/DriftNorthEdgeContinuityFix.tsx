"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  DRIFT_3D_PLANE_DEPTH,
  DRIFT_3D_PLANE_WIDTH,
} from "@/lib/drift3d";
import { getDrift3DGroundColorAt } from "@/lib/drift3dAtmosphere";
import { getDrift3DGroundY } from "@/lib/drift3dTerrain";
import { DRIFT_3D_NORTH_EAST_OCEAN } from "@/lib/drift3dWorldEdges";

const MAIN_TERRAIN_TEXTURE_SIZE = 512;
const NORTH_TEXTURE_WIDTH = 512;
const NORTH_TEXTURE_HEIGHT = 128;
const MOUNTAIN_TEXTURE_WIDTH = 176;
const MOUNTAIN_TEXTURE_HEIGHT = 384;

const northSkin = Object.freeze({
  minX: -112,
  maxX: 116,
  farZ: -112,
  oceanApproachStartX: -24,
  oceanApproachEndX: 16,
  westHighlandFadeStartX: -78,
  westHighlandFadeEndX: -18,
  acrossSegments: 64,
  alongSegments: 14,
});

const lateralMountains = Object.freeze({
  overlapX: 106,
  innerX: 112,
  outerX: 166,
  westMinZ: -90,
  eastMinZ: -90,
  maxZ: 72,
  westNorthFadeEndZ: -56,
  eastNorthFadeEndZ: -18,
  eastOceanRevealStartZ: -72,
  eastOceanRevealEndZ: -16,
  southFadeStartZ: 54,
  acrossSegments: 20,
  alongSegments: 34,
});

const oceanVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uWaveAmplitude;
  varying vec3 vWorldPosition;
  varying float vFogDepth;
  varying float vWave;

  void main() {
    vec3 displaced = position;
    float longWave = sin(position.x * 0.055 + uTime * 0.34);
    float crossWave = sin(position.y * 0.085 - uTime * 0.27);
    float fineWave = sin((position.x + position.y) * 0.12 + uTime * 0.21);
    vWave = (longWave + crossWave + fineWave) / 3.0;
    displaced.z += vWave * uWaveAmplitude;

    vec4 worldPosition = modelMatrix * vec4(displaced, 1.0);
    vec4 viewPosition = viewMatrix * worldPosition;
    vWorldPosition = worldPosition.xyz;
    vFogDepth = -viewPosition.z;
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const oceanFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uNearZ;
  uniform vec3 uCameraPosition;
  uniform vec3 fogColor;
  uniform float fogDensity;
  varying vec3 vWorldPosition;
  varying float vFogDepth;
  varying float vWave;

  void main() {
    vec2 p = vWorldPosition.xz;
    vec3 normal = normalize(vec3(
      0.10 * cos(p.x * 0.055 + uTime * 0.34) +
        0.05 * cos((p.x + p.y) * 0.12 + uTime * 0.21),
      1.0,
      0.09 * cos(p.y * 0.085 - uTime * 0.27) +
        0.05 * cos((p.x + p.y) * 0.12 + uTime * 0.21)
    ));
    vec3 viewDirection = normalize(uCameraPosition - vWorldPosition);
    float fresnel = pow(1.0 - clamp(dot(viewDirection, normal), 0.0, 1.0), 2.7);
    float shoreDistance = max(0.0, uNearZ - vWorldPosition.z);
    float shore = 1.0 - smoothstep(0.0, 11.0, shoreDistance);
    float glint = smoothstep(0.58, 0.96, vWave * 0.5 + 0.5);

    vec3 deep = vec3(0.018, 0.060, 0.082);
    vec3 horizon = vec3(0.26, 0.31, 0.33);
    vec3 color = mix(deep, horizon, 0.10 + fresnel * 0.78);
    color += vec3(0.18, 0.16, 0.12) * glint * 0.10;
    color += vec3(0.33, 0.35, 0.32) * shore * (0.10 + glint * 0.12);

    float fogFactor = 1.0 - exp(-fogDensity * fogDensity * vFogDepth * vFogDepth);
    color = mix(color, fogColor, clamp(fogFactor, 0.0, 1.0));
    gl_FragColor = vec4(color, 1.0);
  }
`;

function terrainNoise(x: number, y: number) {
  const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return value - Math.floor(value);
}

function edgeNoise(index: number, salt: number) {
  return terrainNoise(index, salt);
}

function smoothstep01(value: number) {
  const t = Math.min(1, Math.max(0, value));
  return t * t * (3 - 2 * t);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function writeTerrainPixel(
  image: ImageData,
  pixelOffset: number,
  worldX: number,
  worldZ: number,
  brightness = 1
) {
  const sampleX = clamp(
    worldX,
    -DRIFT_3D_PLANE_WIDTH / 2 + 0.001,
    DRIFT_3D_PLANE_WIDTH / 2 - 0.001
  );
  const sampleZ = clamp(
    worldZ,
    -DRIFT_3D_PLANE_DEPTH / 2,
    DRIFT_3D_PLANE_DEPTH / 2
  );
  const ground = getDrift3DGroundColorAt(sampleX, sampleZ);
  const textureX =
    (worldX / DRIFT_3D_PLANE_WIDTH + 0.5) *
    (MAIN_TERRAIN_TEXTURE_SIZE - 1);
  const textureY =
    (worldZ / DRIFT_3D_PLANE_DEPTH + 0.5) *
    (MAIN_TERRAIN_TEXTURE_SIZE - 1);
  const fineGrain = (terrainNoise(textureX, textureY) - 0.5) * 0.07;
  const coarseGrain =
    (terrainNoise(
      Math.floor(textureX / 9),
      Math.floor(textureY / 9)
    ) -
      0.5) *
    0.06;
  const grain = (1 + fineGrain + coarseGrain) * brightness;

  image.data[pixelOffset] = clamp(ground.r * grain * 255, 0, 255);
  image.data[pixelOffset + 1] = clamp(ground.g * grain * 255, 0, 255);
  image.data[pixelOffset + 2] = clamp(ground.b * grain * 255, 0, 255);
  image.data[pixelOffset + 3] = 255;
}

function createNorthContinuationTexture() {
  if (typeof document === "undefined") return null;

  const ocean = DRIFT_3D_NORTH_EAST_OCEAN;
  const canvas = document.createElement("canvas");
  canvas.width = NORTH_TEXTURE_WIDTH;
  canvas.height = NORTH_TEXTURE_HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) return null;

  const image = context.createImageData(
    NORTH_TEXTURE_WIDTH,
    NORTH_TEXTURE_HEIGHT
  );

  for (let py = 0; py < NORTH_TEXTURE_HEIGHT; py += 1) {
    const progress = py / (NORTH_TEXTURE_HEIGHT - 1);
    const worldZ = ocean.coastZ + (northSkin.farZ - ocean.coastZ) * progress;
    const brightness = 1 - progress * 0.07;

    for (let px = 0; px < NORTH_TEXTURE_WIDTH; px += 1) {
      const across = px / (NORTH_TEXTURE_WIDTH - 1);
      const worldX =
        northSkin.minX + (northSkin.maxX - northSkin.minX) * across;
      const offset = (py * NORTH_TEXTURE_WIDTH + px) * 4;
      writeTerrainPixel(image, offset, worldX, worldZ, brightness);
    }
  }

  context.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

function createNorthSkinGeometry() {
  const ocean = DRIFT_3D_NORTH_EAST_OCEAN;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const row = northSkin.acrossSegments + 1;
  const coastProgressEnd = Math.abs(
    (ocean.nearZ - ocean.coastZ) / (northSkin.farZ - ocean.coastZ)
  );

  for (let along = 0; along <= northSkin.alongSegments; along += 1) {
    const progress = along / northSkin.alongSegments;
    const z = ocean.coastZ + (northSkin.farZ - ocean.coastZ) * progress;

    for (let across = 0; across <= northSkin.acrossSegments; across += 1) {
      const acrossProgress = across / northSkin.acrossSegments;
      const x =
        northSkin.minX +
        (northSkin.maxX - northSkin.minX) * acrossProgress;
      const baseY = getDrift3DGroundY(x, ocean.coastZ) + 0.028;
      const westHighland =
        1 -
        smoothstep01(
          (x - northSkin.westHighlandFadeStartX) /
            (northSkin.westHighlandFadeEndX -
              northSkin.westHighlandFadeStartX)
        );
      const oceanApproach = smoothstep01(
        (x - northSkin.oceanApproachStartX) /
          (northSkin.oceanApproachEndX - northSkin.oceanApproachStartX)
      );
      const distantLandY = -1.2 + westHighland * 3;
      const submergedY = ocean.waterY - 0.72;
      const farY = distantLandY + (submergedY - distantLandY) * oceanApproach;
      const landProfile = smoothstep01(progress);
      const coastProfile = smoothstep01(
        progress / Math.max(coastProgressEnd, 0.001)
      );
      const falloff =
        landProfile + (coastProfile - landProfile) * oceanApproach;
      const undulation =
        (Math.sin(x * 0.105 + 0.4) + Math.sin(x * 0.047 - 0.8) * 0.55) *
        0.62 *
        westHighland *
        (1 - oceanApproach) *
        Math.sin(Math.PI * progress);
      const generatedY = baseY + (farY - baseY) * falloff + undulation;
      const westSeamBlend =
        1 - smoothstep01((x - northSkin.minX) / 18);
      const westSeamY = getDrift3DGroundY(northSkin.minX, z) + 0.024;
      const y = generatedY + (westSeamY - generatedY) * westSeamBlend;
      const u = clamp(
        (x - northSkin.minX) / (northSkin.maxX - northSkin.minX),
        0,
        1
      );

      positions.push(x, y, z);
      uvs.push(u, 1 - progress);
    }
  }

  for (let along = 0; along < northSkin.alongSegments; along += 1) {
    for (let across = 0; across < northSkin.acrossSegments; across += 1) {
      const a = along * row + across;
      const b = a + 1;
      const c = a + row;
      const d = c + 1;

      // z decreases as `along` increases. This winding keeps the surface
      // facing +Y, so it is visible from the playable map instead of being
      // back-face culled.
      indices.push(a, b, c, b, d, c);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function createLateralMountainGeometry(side: -1 | 1) {
  const config = lateralMountains;
  const minZ = side < 0 ? config.westMinZ : config.eastMinZ;
  const northFadeEndZ =
    side < 0 ? config.westNorthFadeEndZ : config.eastNorthFadeEndZ;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const row = config.acrossSegments + 1;
  const sideScale = side < 0 ? 1.08 : 0.94;

  for (let along = 0; along <= config.alongSegments; along += 1) {
    const alongProgress = along / config.alongSegments;
    const z = minZ + (config.maxZ - minZ) * alongProgress;
    const northFade = smoothstep01(
      (z - minZ) / (northFadeEndZ - minZ)
    );
    const southFade =
      1 -
      smoothstep01(
        (z - config.southFadeStartZ) /
          (config.maxZ - config.southFadeStartZ)
      );
    const edgeEnvelope = northFade * southFade;
    const seamX = side * config.innerX;
    const seamY = getDrift3DGroundY(seamX, z) + 0.024;
    const macro =
      0.76 +
      Math.sin(z * 0.073 + side * 0.9) * 0.16 +
      Math.sin(z * 0.151 - side * 0.55) * 0.08;
    const eastOceanExposure =
      side < 0
        ? 0
        : 1 -
          smoothstep01(
            (z - config.eastOceanRevealStartZ) /
              (config.eastOceanRevealEndZ - config.eastOceanRevealStartZ)
          );

    for (let across = 0; across <= config.acrossSegments; across += 1) {
      const progress = across / config.acrossSegments;
      const outward =
        config.overlapX + (config.outerX - config.overlapX) * progress;
      const x = side * outward;
      const mountainProgress = smoothstep01(
        (outward - (config.innerX - 1.5)) /
          (config.outerX - (config.innerX - 1.5))
      );
      const shoulder = smoothstep01(mountainProgress / 0.22);
      const crest =
        Math.exp(-Math.pow((mountainProgress - 0.56) / 0.24, 2) * 2.2) *
        shoulder;
      const farShoulder = smoothstep01((mountainProgress - 0.34) / 0.66);
      const oceanWindowAcross = smoothstep01(
        (mountainProgress - 0.1) / 0.76
      );
      const oceanWindow =
        side < 0
          ? 1
          : 1 - eastOceanExposure * oceanWindowAcross * 0.82;
      const roughness =
        (edgeNoise(along * row + across, side < 0 ? 17 : 29) - 0.5) *
        3.1 *
        shoulder *
        edgeEnvelope *
        oceanWindow;
      const rise =
        edgeEnvelope *
          oceanWindow *
          sideScale *
          (shoulder * 2.4 +
            crest * (11.5 + macro * 8.5) +
            farShoulder * 5.2) +
        roughness;
      const fadeDrop =
        (1 - edgeEnvelope) * shoulder * (1.5 + farShoulder * 5.6);
      const oceanDrop =
        side < 0 ? 0 : eastOceanExposure * oceanWindowAcross * 1.6;
      const terrainSampleX = side * Math.min(outward, config.innerX);
      const terrainY = getDrift3DGroundY(terrainSampleX, z) + 0.024;
      const seamBlend = smoothstep01(
        (outward - (config.innerX - 2.5)) / 2.5
      );
      const baseY = terrainY + (seamY - terrainY) * seamBlend;

      positions.push(x, baseY + rise - fadeDrop - oceanDrop, z);
      uvs.push(progress, alongProgress);
    }
  }

  for (let along = 0; along < config.alongSegments; along += 1) {
    for (let across = 0; across < config.acrossSegments; across += 1) {
      const a = along * row + across;
      const b = a + 1;
      const c = a + row;
      const d = c + 1;
      if (side < 0) {
        indices.push(a, b, c, b, d, c);
      } else {
        indices.push(a, c, b, b, c, d);
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function createMountainTerrainTexture(side: -1 | 1) {
  if (typeof document === "undefined") return null;

  const config = lateralMountains;
  const minZ = side < 0 ? config.westMinZ : config.eastMinZ;
  const canvas = document.createElement("canvas");
  canvas.width = MOUNTAIN_TEXTURE_WIDTH;
  canvas.height = MOUNTAIN_TEXTURE_HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) return null;

  const image = context.createImageData(
    MOUNTAIN_TEXTURE_WIDTH,
    MOUNTAIN_TEXTURE_HEIGHT
  );

  for (let py = 0; py < MOUNTAIN_TEXTURE_HEIGHT; py += 1) {
    // CanvasTexture flips image Y. Top row therefore represents v=1 / south,
    // bottom row v=0 / north, matching the geometry's authored UVs.
    const alongProgress = 1 - py / (MOUNTAIN_TEXTURE_HEIGHT - 1);
    const worldZ = minZ + (config.maxZ - minZ) * alongProgress;

    for (let px = 0; px < MOUNTAIN_TEXTURE_WIDTH; px += 1) {
      const outwardProgress = px / (MOUNTAIN_TEXTURE_WIDTH - 1);
      const worldX =
        side *
        (config.overlapX +
          (config.outerX - config.overlapX) * outwardProgress);
      const brightness = 1 - outwardProgress * 0.055;
      const offset = (py * MOUNTAIN_TEXTURE_WIDTH + px) * 4;
      writeTerrainPixel(image, offset, worldX, worldZ, brightness);
    }
  }

  context.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

function NorthGroundSkin() {
  const texture = useMemo(() => createNorthContinuationTexture(), []);
  const geometry = useMemo(() => createNorthSkinGeometry(), []);

  useEffect(
    () => () => {
      texture?.dispose();
      geometry.dispose();
    },
    [geometry, texture]
  );

  return (
    <mesh
      geometry={geometry}
      receiveShadow
      renderOrder={4}
      aria-hidden="true"
    >
      <meshStandardMaterial
        map={texture ?? undefined}
        color={texture ? "#ffffff" : "#77736a"}
        roughness={0.96}
        side={THREE.DoubleSide}
        polygonOffset
        polygonOffsetFactor={-2}
        polygonOffsetUnits={-2}
      />
    </mesh>
  );
}

function MountainContinuitySkins() {
  const westGeometry = useMemo(() => createLateralMountainGeometry(-1), []);
  const eastGeometry = useMemo(() => createLateralMountainGeometry(1), []);
  const westTexture = useMemo(() => createMountainTerrainTexture(-1), []);
  const eastTexture = useMemo(() => createMountainTerrainTexture(1), []);

  useEffect(
    () => () => {
      westGeometry.dispose();
      eastGeometry.dispose();
      westTexture?.dispose();
      eastTexture?.dispose();
    }, [eastGeometry, eastTexture, westGeometry, westTexture]
  );

  return (
    <group aria-hidden="true">
      {[
        { key: "west", geometry: westGeometry, texture: westTexture },
        { key: "east", geometry: eastGeometry, texture: eastTexture },
      ].map(({ key, geometry, texture }) => (
        <mesh
          key={key}
          geometry={geometry}
          receiveShadow
          castShadow={false}
          renderOrder={4}
        >
          <meshStandardMaterial
            map={texture ?? undefined}
            color={texture ? "#ffffff" : "#77736a"}
            roughness={0.96}
            side={THREE.DoubleSide}
            polygonOffset
            polygonOffsetFactor={-2}
            polygonOffsetUnits={-2}
          />
        </mesh>
      ))}
    </group>
  );
}

function OceanUnderlap() {
  const ocean = DRIFT_3D_NORTH_EAST_OCEAN;
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const renderMinX = ocean.minX - 8;
  const renderNearZ = ocean.coastZ + 2;
  const renderFarZ = ocean.nearZ - 5;
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: oceanVertexShader,
        fragmentShader: oceanFragmentShader,
        uniforms: THREE.UniformsUtils.merge([
          THREE.UniformsLib.fog,
          {
            uTime: { value: 0 },
            uWaveAmplitude: { value: ocean.waveAmplitude },
            uNearZ: { value: ocean.coastZ },
            uCameraPosition: { value: new THREE.Vector3() },
          },
        ]),
        fog: true,
        depthWrite: true,
        depthTest: true,
        side: THREE.DoubleSide,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      }),
    [ocean.coastZ, ocean.waveAmplitude]
  );

  useEffect(() => {
    materialRef.current = material;
    return () => {
      materialRef.current = null;
      material.dispose();
    };
  }, [material]);

  useFrame(({ camera, clock }) => {
    const current = materialRef.current;
    if (!current) return;
    current.uniforms.uTime.value = clock.elapsedTime;
    (current.uniforms.uCameraPosition.value as THREE.Vector3).copy(
      camera.position
    );
  });

  return (
    <mesh
      position={[
        (renderMinX + ocean.maxX) / 2,
        ocean.waterY + 0.008,
        (renderNearZ + renderFarZ) / 2,
      ]}
      rotation={[-Math.PI / 2, 0, 0]}
      material={material}
      receiveShadow
      renderOrder={3}
      aria-hidden="true"
    >
      <planeGeometry
        args={[
          ocean.maxX - renderMinX,
          renderNearZ - renderFarZ,
          40,
          6,
        ]}
      />
    </mesh>
  );
}

export default function DriftNorthEdgeContinuityFix() {
  return (
    <>
      <NorthGroundSkin />
      <MountainContinuitySkins />
      <OceanUnderlap />
    </>
  );
}
