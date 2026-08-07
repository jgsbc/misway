"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { DRIFT_3D_FLOOR_Y } from "@/lib/drift3d";
import {
  DRIFT_3D_PENINSULA_DEPTH,
  DRIFT_3D_PENINSULA_WIDTH,
  DRIFT_3D_SEA_LEVEL,
} from "@/lib/drift3dPeninsula";

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
    float a = sin(p.x * 0.075 + uTime * 0.42);
    float b = sin(p.y * 0.052 - uTime * 0.31);
    float c = sin((p.x + p.y) * 0.031 + uTime * 0.19);

    vec3 normal = normalize(vec3(
      0.075 * cos(p.x * 0.075 + uTime * 0.42) * 0.35 +
        0.031 * cos((p.x + p.y) * 0.031 + uTime * 0.19) * 0.2,
      1.0,
      0.052 * cos(p.y * 0.052 - uTime * 0.31) * 0.35 +
        0.031 * cos((p.x + p.y) * 0.031 + uTime * 0.19) * 0.2
    ));
    vec3 viewDir = normalize(uCameraPos - vWorldPos);
    float fresnel = pow(1.0 - clamp(dot(viewDir, normal), 0.0, 1.0), 2.6);
    float ripple = (a + b + c + 3.0) / 6.0;

    vec3 deep = vec3(0.035, 0.085, 0.105);
    vec3 reflected = vec3(0.22, 0.34, 0.39);
    vec3 color = mix(deep, reflected, clamp(0.22 + fresnel * 0.82, 0.0, 1.0));
    color += vec3(0.035, 0.055, 0.06) * ripple;

    float alpha = clamp(0.68 + fresnel * 0.22 + ripple * 0.04, 0.0, 0.94);
    gl_FragColor = vec4(color, alpha);
  }
`;

/**
 * One sea surface for the whole peninsula. Land and seabed geometry decide
 * where it is visible through normal depth testing, so the coast is the real
 * terrain/sea intersection rather than a collection of authored rectangles.
 */
export default function Drift3DWaterSurface() {
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

    return () => material.dispose();
  }, [material]);

  useFrame(({ camera, clock }) => {
    const current = materialRef.current;

    if (!current) {
      return;
    }

    current.uniforms.uTime.value = clock.elapsedTime;
    (current.uniforms.uCameraPos.value as THREE.Vector3).copy(camera.position);
  });

  return (
    <mesh
      position={[0, DRIFT_3D_FLOOR_Y + DRIFT_3D_SEA_LEVEL + 0.015, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      material={material}
      renderOrder={3}
    >
      <planeGeometry
        args={[DRIFT_3D_PENINSULA_WIDTH, DRIFT_3D_PENINSULA_DEPTH, 1, 1]}
      />
    </mesh>
  );
}
