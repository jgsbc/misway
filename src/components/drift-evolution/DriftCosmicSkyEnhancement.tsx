"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function cosmicNoise(index: number, salt: number) {
  const value = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453;

  return value - Math.floor(value);
}

function createStarField(
  count: number,
  radiusMin: number,
  radiusMax: number,
  seedOffset = 0
) {
  const positions = new Float32Array(count * 3);

  for (let index = 0; index < count; index += 1) {
    const theta = cosmicNoise(index, 3 + seedOffset * 7) * Math.PI * 2;
    const vertical = cosmicNoise(index, 7 + seedOffset * 11) * 2 - 1;
    const horizontal = Math.sqrt(Math.max(0, 1 - vertical * vertical));
    const radius =
      radiusMin +
      cosmicNoise(index, 11 + seedOffset * 13) * (radiusMax - radiusMin);

    positions[index * 3] = Math.cos(theta) * horizontal * radius;
    positions[index * 3 + 1] = vertical * radius;
    positions[index * 3 + 2] = Math.sin(theta) * horizontal * radius;
  }

  return positions;
}

function createGalaxyTexture(core: string, halo: string, dust: string) {
  if (typeof document === "undefined") return null;

  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");

  if (!context) return null;

  context.clearRect(0, 0, size, size);

  const gradient = context.createRadialGradient(
    size * 0.5,
    size * 0.5,
    0,
    size * 0.5,
    size * 0.5,
    size * 0.5
  );
  gradient.addColorStop(0, core);
  gradient.addColorStop(0.22, halo);
  gradient.addColorStop(0.55, dust);
  gradient.addColorStop(1, "rgba(0,0,0,0)");

  context.fillStyle = gradient;
  context.beginPath();
  context.arc(size * 0.5, size * 0.5, size * 0.5, 0, Math.PI * 2);
  context.fill();

  context.globalCompositeOperation = "screen";
  context.globalAlpha = 0.25;

  for (let index = 0; index < 7; index += 1) {
    const x = size * (0.22 + cosmicNoise(index, 31) * 0.56);
    const y = size * (0.22 + cosmicNoise(index, 47) * 0.56);
    const radius = 18 + cosmicNoise(index, 59) * 42;
    const puff = context.createRadialGradient(x, y, 0, x, y, radius);
    puff.addColorStop(0, "rgba(255,255,255,0.20)");
    puff.addColorStop(0.35, halo);
    puff.addColorStop(1, "rgba(0,0,0,0)");

    context.fillStyle = puff;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;

  return texture;
}

function GalaxyBillboards() {
  const textures = useMemo(
    () => [
      createGalaxyTexture(
        "rgba(255,255,255,0.90)",
        "rgba(120,170,255,0.42)",
        "rgba(40,70,120,0.12)"
      ),
      createGalaxyTexture(
        "rgba(255,245,220,0.88)",
        "rgba(255,180,120,0.38)",
        "rgba(90,55,28,0.10)"
      ),
      createGalaxyTexture(
        "rgba(255,255,255,0.86)",
        "rgba(180,130,255,0.38)",
        "rgba(70,35,110,0.10)"
      ),
    ],
    []
  );

  const galaxySpecs = useMemo(
    () => [
      {
        position: [72, 46, -118] as [number, number, number],
        scale: 34,
        rotation: 0.18,
      },
      {
        position: [-96, 28, -74] as [number, number, number],
        scale: 26,
        rotation: -0.44,
      },
      {
        position: [114, -16, 52] as [number, number, number],
        scale: 22,
        rotation: 0.72,
      },
    ],
    []
  );

  useEffect(
    () => () => {
      textures.forEach((texture) => texture?.dispose());
    },
    [textures]
  );

  return (
    <group aria-hidden="true">
      {galaxySpecs.map((spec, index) => (
        <sprite
          key={`galaxy-${index}`}
          position={spec.position}
          scale={[spec.scale, spec.scale, 1]}
          renderOrder={-1}
          frustumCulled={false}
        >
          <spriteMaterial
            map={textures[index] ?? undefined}
            rotation={spec.rotation}
            transparent
            depthWrite={false}
            depthTest
            fog={false}
            opacity={0.72}
            color="#ffffff"
          />
        </sprite>
      ))}
    </group>
  );
}

export default function DriftCosmicSkyEnhancement() {
  const groupRef = useRef<THREE.Group>(null);
  const faintStarPositions = useMemo(
    () => createStarField(480, 126, 176, 0),
    []
  );
  const brightStarPositions = useMemo(
    () => createStarField(140, 132, 170, 1),
    []
  );

  useFrame(({ camera }) => {
    groupRef.current?.position.copy(camera.position);
  });

  return (
    <group ref={groupRef} aria-hidden="true">
      <GalaxyBillboards />

      <points frustumCulled={false} renderOrder={-2}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[faintStarPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.28}
          sizeAttenuation
          color="#bfcbe2"
          transparent
          opacity={0.42}
          fog={false}
          depthWrite={false}
          depthTest
        />
      </points>

      <points frustumCulled={false} renderOrder={-1}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[brightStarPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.52}
          sizeAttenuation
          color="#eef3ff"
          transparent
          opacity={0.92}
          fog={false}
          depthWrite={false}
          depthTest
        />
      </points>
    </group>
  );
}
