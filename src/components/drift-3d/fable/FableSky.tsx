"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { fableEraBlendAt } from "@/components/drift-3d/fable/fableTopology";
import * as THREE from "three";

/**
 * FABLE SPIKE — ciel de fin de jour. Dôme shader : horizon poussiéreux
 * chauffé au cuivre, zénith bleu-sarcelle éteint, soleil bas légèrement
 * devant-gauche de la route pour que la ville soit à contre-jour.
 */

export const FABLE_SUN_DIR = new THREE.Vector3(-0.55, 0.34, 0.62).normalize();
export const FABLE_SKY_ZENITH = new THREE.Color("#22374a");
export const FABLE_SKY_HORIZON = new THREE.Color("#d9995a");
export const FABLE_SUN_COLOR = new THREE.Color("#ffd9a0");
/**
 * Brume de ville : violette et froide, pas brune. C'est ce contraste qui
 * fait chanter les fenêtres chaudes et creuse la profondeur — un brouillard
 * de la couleur des murs aplatit tout.
 */
export const FABLE_FOG_CITY = new THREE.Color("#7d7391");
export const FABLE_FOG_TUNNEL = new THREE.Color("#05060a");

const vertexShader = /* glsl */ `
  varying vec3 vDir;

  void main() {
    vDir = normalize(position);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uZenith;
  uniform vec3 uHorizon;
  uniform vec3 uSunDir;
  uniform vec3 uSunColor;
  varying vec3 vDir;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    vec3 dir = normalize(vDir);
    float h = clamp(dir.y, -1.0, 1.0);

    // Gradient vertical avec une bande d'horizon épaisse et sale.
    float t = pow(clamp(h + 0.03, 0.0, 1.0), 0.5);
    vec3 sky = mix(uHorizon, uZenith, t);

    // Sous l'horizon : brume terreuse sombre.
    float below = smoothstep(0.0, -0.12, h);
    sky = mix(sky, uHorizon * 0.42, below);

    float d = clamp(dot(dir, uSunDir), 0.0, 1.0);
    // Disque solaire voilé + halo large.
    float disc = smoothstep(0.99955, 0.99985, d);
    float halo = pow(d, 30.0) * 0.75 + pow(d, 6.0) * 0.28;
    sky += uSunColor * (disc * 2.4 + halo);

    // Voiles horizontaux très légers (stratus de poussière).
    float bands = sin(h * 46.0 + dir.x * 4.0) * 0.5 + 0.5;
    sky *= 1.0 - bands * 0.014 * (1.0 - t) * step(0.0, h);

    // Dither pour casser le banding.
    sky += (hash(gl_FragCoord.xy) - 0.5) * 0.012;

    gl_FragColor = vec4(sky, 1.0);
  }
`;

/** Matière du dôme — partagée avec la sonde d'environnement. */
export function createFableSkyMaterial() {
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uZenith: { value: FABLE_SKY_ZENITH },
      uHorizon: { value: FABLE_SKY_HORIZON },
      uSunDir: { value: FABLE_SUN_DIR },
      uSunColor: { value: FABLE_SUN_COLOR },
    },
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
  });
}

export default function FableSky({
  vehicleZRef,
  vehicleXRef,
}: {
  vehicleZRef?: React.MutableRefObject<number>;
  vehicleXRef?: React.MutableRefObject<number>;
}) {
  const material = useMemo(() => createFableSkyMaterial(), []);
  const meshRef = useRef<THREE.Mesh>(null);

  // Le dôme suit le joueur et prend les couleurs de son ère.
  useFrame(({ camera }) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    mesh.position.set(camera.position.x, 0, camera.position.z);

    if (!vehicleZRef) return;

    const { from, to, t } = fableEraBlendAt(vehicleXRef?.current ?? 0, vehicleZRef.current);
    const uniforms = material.uniforms;
    (uniforms.uZenith.value as THREE.Color).copy(from.zenith).lerp(to.zenith, t);
    (uniforms.uHorizon.value as THREE.Color).copy(from.horizon).lerp(to.horizon, t);
    (uniforms.uSunColor.value as THREE.Color).copy(from.sunColor).lerp(to.sunColor, t);
    (uniforms.uSunDir.value as THREE.Vector3)
      .copy(from.sunDir)
      .lerp(to.sunDir, t)
      .normalize();
  });

  return (
    <mesh ref={meshRef} material={material} position={[0, 0, 60]} renderOrder={-100} frustumCulled={false}>
      <sphereGeometry args={[430, 32, 20]} />
    </mesh>
  );
}
