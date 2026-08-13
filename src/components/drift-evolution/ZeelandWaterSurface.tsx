"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getDrift3DGroundY } from "@/lib/drift3dTerrain";
import {
  DRIFT_EVOLUTION_ZEELAND_BASIN,
  DRIFT_EVOLUTION_ZEELAND_CANAL,
} from "@/lib/driftEvolutionZeelandGeography";

const waterVertex = /* glsl */ `
  varying vec3 vWorldPos;

  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const waterFragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uCameraPos;
  varying vec3 vWorldPos;

  void main() {
    vec2 p = vWorldPos.xz;
    float a = sin(p.x * 0.31 + uTime * 0.42);
    float b = sin(p.y * 0.23 - uTime * 0.31);
    float c = sin((p.x + p.y) * 0.17 + uTime * 0.19);

    vec3 normal = normalize(vec3(
      0.12 * cos(p.x * 0.31 + uTime * 0.42) +
        0.05 * cos((p.x + p.y) * 0.17 + uTime * 0.19),
      1.0,
      0.10 * cos(p.y * 0.23 - uTime * 0.31) +
        0.05 * cos((p.x + p.y) * 0.17 + uTime * 0.19)
    ));
    vec3 viewDir = normalize(uCameraPos - vWorldPos);
    float fresnel = pow(1.0 - clamp(dot(viewDir, normal), 0.0, 1.0), 2.4);
    float ripple = (a + b + c + 3.0) / 6.0;

    vec3 deep = vec3(0.035, 0.085, 0.105);
    vec3 reflected = vec3(0.34, 0.31, 0.27);
    vec3 color = mix(deep, reflected, clamp(0.18 + fresnel * 0.78, 0.0, 1.0));
    color += vec3(0.045, 0.038, 0.028) * ripple;

    float alpha = clamp(0.76 + fresnel * 0.16 + ripple * 0.035, 0.0, 0.94);
    gl_FragColor = vec4(color, alpha);
  }
`;

function useZeelandWaterMaterial() {
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: waterVertex,
        fragmentShader: waterFragment,
        uniforms: {
          uTime: { value: 0 },
          uCameraPos: { value: new THREE.Vector3() },
        },
        transparent: true,
        depthWrite: false,
        depthTest: true,
        side: THREE.DoubleSide,
      }),
    []
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
    (current.uniforms.uCameraPos.value as THREE.Vector3).copy(camera.position);
  });

  return material;
}

/**
 * Zeeland water authority promoted with the accepted runtime.
 *
 * The inherited landmark used two 512px Reflectors over tiny rectangles. This
 * pass replaces those local water cards with one cheap material shared by a
 * real canal and harbour basin. Terrain carving is deliberately deferred until
 * the compact spatial composition passes the visual gate.
 */
export default function ZeelandWaterSurface() {
  const material = useZeelandWaterMaterial();
  const canal = DRIFT_EVOLUTION_ZEELAND_CANAL;
  const basin = DRIFT_EVOLUTION_ZEELAND_BASIN;
  const waterY =
    getDrift3DGroundY(canal.centerX, (canal.minZ + canal.maxZ) / 2) + 0.045;

  return (
    <group aria-hidden="true">
      <mesh
        position={[canal.centerX, waterY, (canal.minZ + canal.maxZ) / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={material}
        renderOrder={3}
      >
        <planeGeometry
          args={[canal.halfWidth * 2, canal.maxZ - canal.minZ, 1, 1]}
        />
      </mesh>

      <mesh
        position={[basin.centerX, waterY + 0.002, basin.centerZ]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={material}
        renderOrder={3}
      >
        <planeGeometry args={[basin.width, basin.depth, 1, 1]} />
      </mesh>
    </group>
  );
}
