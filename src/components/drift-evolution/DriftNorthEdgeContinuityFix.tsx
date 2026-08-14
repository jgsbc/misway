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

const NORTH_TEXTURE_WIDTH = 512;
const NORTH_TEXTURE_HEIGHT = 128;

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

function smoothstep01(value: number) {
  const t = Math.min(1, Math.max(0, value));

  return t * t * (3 - 2 * t);
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
    const mainTextureY =
      (worldZ / DRIFT_3D_PLANE_DEPTH + 0.5) * (NORTH_TEXTURE_WIDTH - 1);

    for (let px = 0; px < NORTH_TEXTURE_WIDTH; px += 1) {
      const worldX =
        (px / (NORTH_TEXTURE_WIDTH - 1) - 0.5) * DRIFT_3D_PLANE_WIDTH;
      const ground = getDrift3DGroundColorAt(worldX, ocean.coastZ);
      const fineGrain = (terrainNoise(px, mainTextureY) - 0.5) * 0.07;
      const coarseGrain =
        (terrainNoise(
          Math.floor(px / 9),
          Math.floor(mainTextureY / 9)
        ) -
          0.5) *
        0.06;
      const grain = 1 + fineGrain + coarseGrain;
      const offset = (py * NORTH_TEXTURE_WIDTH + px) * 4;

      image.data[offset] = Math.max(0, Math.min(255, ground.r * grain * 255));
      image.data[offset + 1] = Math.max(
        0,
        Math.min(255, ground.g * grain * 255)
      );
      image.data[offset + 2] = Math.max(
        0,
        Math.min(255, ground.b * grain * 255)
      );
      image.data[offset + 3] = 255;
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
      const x = northSkin.minX + (northSkin.maxX - northSkin.minX) * acrossProgress;
      const baseY = getDrift3DGroundY(x, ocean.coastZ) + 0.026;
      const westHighland =
        1 -
        smoothstep01(
          (x - northSkin.westHighlandFadeStartX) /
            (northSkin.westHighlandFadeEndX - northSkin.westHighlandFadeStartX)
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
      const falloff = landProfile + (coastProfile - landProfile) * oceanApproach;
      const undulation =
        (Math.sin(x * 0.105 + 0.4) + Math.sin(x * 0.047 - 0.8) * 0.55) *
        0.62 *
        westHighland *
        (1 - oceanApproach) *
        Math.sin(Math.PI * progress);
      const generatedY = baseY + (farY - baseY) * falloff + undulation;
      const westSeamBlend = 1 - smoothstep01((x - northSkin.minX) / 18);
      const westSeamY = getDrift3DGroundY(northSkin.minX, z) + 0.022;
      const y = generatedY + (westSeamY - generatedY) * westSeamBlend;
      const u = Math.min(
        1,
        Math.max(0, (x + DRIFT_3D_PLANE_WIDTH / 2) / DRIFT_3D_PLANE_WIDTH)
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
      indices.push(a, c, b, b, c, d);
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
      renderOrder={3}
      aria-hidden="true"
    >
      <meshStandardMaterial
        map={texture ?? undefined}
        color={texture ? "#ffffff" : "#77736a"}
        roughness={0.96}
        polygonOffset
        polygonOffsetFactor={-1}
        polygonOffsetUnits={-1}
      />
    </mesh>
  );
}

function OceanUnderlap() {
  const ocean = DRIFT_3D_NORTH_EAST_OCEAN;
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const renderMinX = ocean.minX - 5;
  const renderNearZ = ocean.nearZ + 5;
  const renderFarZ = ocean.nearZ - 2;
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
            uNearZ: { value: ocean.nearZ },
            uCameraPosition: { value: new THREE.Vector3() },
          },
        ]),
        fog: true,
        depthWrite: true,
        depthTest: true,
        side: THREE.DoubleSide,
      }),
    [ocean.nearZ, ocean.waveAmplitude]
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
    (current.uniforms.uCameraPosition.value as THREE.Vector3).copy(camera.position);
  });

  return (
    <mesh
      position={[
        (renderMinX + ocean.maxX) / 2,
        ocean.waterY - 0.08,
        (renderNearZ + renderFarZ) / 2,
      ]}
      rotation={[-Math.PI / 2, 0, 0]}
      material={material}
      receiveShadow
      renderOrder={0}
      aria-hidden="true"
    >
      <planeGeometry
        args={[
          ocean.maxX - renderMinX,
          renderNearZ - renderFarZ,
          12,
          3,
        ]}
      />
    </mesh>
  );
}

export default function DriftNorthEdgeContinuityFix() {
  return (
    <>
      <NorthGroundSkin />
      <OceanUnderlap />
    </>
  );
}
