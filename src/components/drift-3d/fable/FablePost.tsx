"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { MutableRefObject } from "react";

/**
 * FABLE SPIKE — voile cinématographique plein écran : vignette qui se
 * resserre dans le noir, grain de pellicule, éblouissement à l'émergence.
 * Un triangle plein écran, aucune passe de post-processing externe.
 */

export type FablePostUniforms = {
  uTime: { value: number };
  uFlash: { value: number };
  uTunnel: { value: number };
};

const vertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = position.xy * 0.5 + 0.5;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uFlash;
  uniform float uTunnel;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    float d = distance(vUv, vec2(0.5, 0.46));
    float vignette = smoothstep(0.42, 0.98, d * (1.05 + uTunnel * 0.55));
    float letterbox = (smoothstep(0.1, 0.0, vUv.y) + smoothstep(0.9, 1.0, vUv.y)) * 0.4;
    float grain = hash(vUv * vec2(1287.0, 718.0) + fract(uTime * 61.7)) - 0.5;

    float dark = clamp(vignette * (0.6 + uTunnel * 0.25) + letterbox * 0.35, 0.0, 1.0);
    float flash = clamp(uFlash, 0.0, 1.0);
    vec3 color = mix(vec3(0.0), vec3(1.0, 0.96, 0.88), flash);
    float alpha = clamp(dark * (1.0 - flash) + flash + grain * 0.055, 0.0, 1.0);

    gl_FragColor = vec4(color, alpha);
  }
`;

export default function FablePost({
  uniformsRef,
}: {
  uniformsRef: MutableRefObject<FablePostUniforms | null>;
}) {
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);

  const { geometry, material, tintMaterial } = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3)
    );
    const mat = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uFlash: { value: 0 },
        uTunnel: { value: 1 },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
      fog: false,
    });
    // Vision scotopique : dans le noir, les ombres tirent vers le bleu froid.
    // Passe multiplicative séparée, pilotée par le même uTunnel.
    const tint = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader: /* glsl */ `
        uniform float uTunnel;
        varying vec2 vUv;

        void main() {
          vec3 cool = vec3(0.8, 0.88, 1.0);
          gl_FragColor = vec4(mix(vec3(1.0), cool, uTunnel * 0.55), 1.0);
        }
      `,
      uniforms: mat.uniforms,
      blending: THREE.MultiplyBlending,
      premultipliedAlpha: true,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      fog: false,
    });

    return { geometry: geo, material: mat, tintMaterial: tint };
  }, []);

  useEffect(() => {
    materialRef.current = material;
    uniformsRef.current = material.uniforms as unknown as FablePostUniforms;

    return () => {
      uniformsRef.current = null;
    };
  }, [material, uniformsRef]);

  useFrame(({ clock }) => {
    const mat = materialRef.current;

    if (mat) mat.uniforms.uTime.value = clock.elapsedTime;
  });

  return (
    <>
      <mesh geometry={geometry} material={tintMaterial} renderOrder={999} frustumCulled={false} />
      <mesh geometry={geometry} material={material} renderOrder={1000} frustumCulled={false} />
    </>
  );
}
