"use client";

import { useEffect, useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { getDriftMaterialMaps } from "@/components/drift-3d/drift3dTextureFactory";
import { getFableGlowTexture } from "@/components/drift-3d/fable/fableTextures";
import {
  FABLE_BRIDGE_Z,
  FABLE_CANAL_FAR_X,
  FABLE_CANAL_Z0,
  FABLE_CANAL_Z1,
  FABLE_QUAY_X,
  FABLE_WATER_Y,
  FABLE_SHOWROOM_Z,
  fableGroundY,
  fableRng,
  fableStreetHalfWidth,
} from "@/components/drift-3d/fable/fableWorld";
import {
  FABLE_SKY_HORIZON,
  FABLE_SKY_ZENITH,
  FABLE_SUN_COLOR,
  FABLE_SUN_DIR,
} from "@/components/drift-3d/fable/FableSky";
import { swaySignal } from "@/components/drift-3d/fable/core/immersionSecondary";

/**
 * A WALK IN ZEELAND — le bassin. Eau à hauteur d'œil le long du quai, pont
 * levant qui suit son propre horaire, péniche lente, vélos qui changent de
 * berge sans cavalier.
 *
 * Anomalie canonique : la surface rend des vies qui ne sont pas sur le quai.
 * Les silhouettes vivent SOUS l'eau, inversées ; rien au-dessus ne les
 * projette. On ne les voit qu'en reflet.
 */

/* ─── Sources réfléchies ──────────────────────────────────────────────── */

export type CanalLight = {
  x: number;
  z: number;
  /** Hauteur au-dessus de l'eau : elle étire la traînée. */
  height: number;
  color: THREE.Color;
  intensity: number;
};

/**
 * Les lumières que le bassin rend. Elles sont déclarées une seule fois et
 * consommées deux fois : par la géométrie qui les porte, et par l'eau qui
 * les réfléchit. Sans cette source unique, les reflets mentiraient.
 */
export const FABLE_CANAL_LIGHTS: CanalLight[] = (() => {
  const rng = fableRng(662201);
  const lights: CanalLight[] = [];
  const bankTints = ["#ffb066", "#ffd39a", "#cfe0f2", "#ff9a5e"];

  // Fenêtres et lampes de la rive d'en face.
  let z = FABLE_CANAL_Z0 - 10;

  while (z < FABLE_CANAL_Z1 + 12 && lights.length < 7) {
    const width = 6 + rng() * 11;

    if (rng() < 0.8) {
      lights.push({
        x: FABLE_CANAL_FAR_X + 0.6,
        z: z + width * (0.2 + rng() * 0.6),
        height: 1.4 + rng() * 5,
        color: new THREE.Color(bankTints[Math.floor(rng() * bankTints.length)]),
        intensity: 0.5 + rng() * 0.5,
      });
    }

    z += width + 3 + rng() * 5;
  }

  // Lampes de quai — rares, froides, hautes.
  for (const lz of [FABLE_CANAL_Z0 + 8, FABLE_CANAL_Z0 + 22, FABLE_CANAL_Z0 + 34]) {
    lights.push({
      x: FABLE_QUAY_X + 0.9,
      z: lz,
      height: 5.2,
      color: new THREE.Color("#cfe2f2"),
      intensity: 0.75,
    });
  }

  // La vitrine : sa nappe froide traverse la chaussée et touche l'eau.
  lights.push({
    x: FABLE_QUAY_X + 2.6,
    z: FABLE_SHOWROOM_Z,
    height: 3.4,
    color: new THREE.Color("#dcecfa"),
    intensity: 1.15,
  });

  // Feu de manœuvre de la grue.
  lights.push({
    x: FABLE_CANAL_FAR_X + 4,
    z: FABLE_CANAL_Z0 + 17,
    height: 9,
    color: new THREE.Color("#ffe2a8"),
    intensity: 0.9,
  });

  return lights;
})();

const CANAL_LIGHT_SLOTS = 12;

/* ─── Eau ──────────────────────────────────────────────────────────────── */

const waterVertex = /* glsl */ `
  varying vec3 vWorldPos;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const waterFragment = /* glsl */ `
  uniform vec3 uZenith;
  uniform vec3 uHorizon;
  uniform vec3 uSunDir;
  uniform vec3 uSunColor;
  uniform vec3 uCameraPos;
  uniform float uTime;
  /** x, z, hauteur — les sources que le bassin doit rendre. */
  uniform vec3 uLights[LIGHT_SLOTS];
  uniform vec3 uLightColors[LIGHT_SLOTS];
  uniform float uLightPower[LIGHT_SLOTS];
  /** Centre et demi-longueur de la péniche : elle coupe les traînées. */
  uniform vec3 uOccluder;
  varying vec3 vWorldPos;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  void main() {
    // Rides : deux trains croisés, lents, plus une houle longue.
    vec2 p = vWorldPos.xz;
    float r1 = noise(p * 0.55 + vec2(uTime * 0.11, uTime * 0.06));
    float r2 = noise(p * 1.35 - vec2(uTime * 0.09, uTime * 0.14));
    float swell = sin(p.y * 0.22 + uTime * 0.5) * 0.5 + 0.5;
    vec3 normal = normalize(vec3(
      (r1 - r2) * 0.55,
      1.0,
      (r2 - swell) * 0.4
    ));

    vec3 viewDir = normalize(vWorldPos - uCameraPos);
    vec3 reflected = reflect(viewDir, normal);
    float t = pow(clamp(reflected.y, 0.0, 1.0), 0.55);
    vec3 sky = mix(uHorizon, uZenith, t);

    // Traînée solaire — hachée par les rides, sinon elle se pose en nappe.
    float sunRipple = noise(p * 2.6 + vec2(uTime * 0.3, -uTime * 0.2));
    float glare = pow(clamp(dot(reflected, uSunDir), 0.0, 1.0), 22.0);
    sky += uSunColor * glare * (0.35 + sunRipple * 1.15);

    // Fresnel : rasant, l'eau devient miroir ; à la verticale, elle se
    // creuse — mais jamais jusqu'au noir, un port garde toujours du ciel.
    float fresnel = pow(1.0 - clamp(dot(-viewDir, normal), 0.0, 1.0), 2.4);
    vec3 deep = vec3(0.06, 0.075, 0.085);
    vec3 color = mix(deep, sky, clamp(fresnel * 1.7 + 0.3, 0.0, 1.0));

    /*
      Traînées des sources réelles. Chacune s'étire depuis sa berge vers
      l'œil, se brise sur les rides, et s'éteint derrière la péniche —
      c'est cette coupure mobile qui donne au bassin sa profondeur.
    */
    vec3 streaks = vec3(0.0);
    float ripple = noise(p * 1.9 + vec2(uTime * 0.22, -uTime * 0.15));
    float ripple2 = noise(p * 4.5 - vec2(uTime * 0.4, uTime * 0.3));

    for (int i = 0; i < LIGHT_SLOTS; i++) {
      float power = uLightPower[i];

      if (power <= 0.001) continue;

      vec3 L = uLights[i];
      // Largeur : une source haute traîne un peu plus large, jamais assez
      // pour se fondre avec sa voisine — ce sont des colonnes, pas une nappe.
      float w = 0.34 + L.z * 0.07;
      float lateral = p.y - L.y;
      float band = exp(-(lateral * lateral) / (w * w));

      // Longitudinale : la traînée court de la source vers l'observateur,
      // et s'épuise bien avant de l'atteindre.
      float span = uCameraPos.x - L.x;
      float t2 = clamp((p.x - L.x) / (abs(span) < 0.001 ? 0.001 : span), 0.0, 1.0);
      float along = smoothstep(1.0, 0.02, t2) * smoothstep(-0.04, 0.1, t2) * exp(-t2 * 1.7);

      // Occlusion : la coque masque tout ce qui est derrière elle.
      float behind = step(p.x, uOccluder.x) * step(abs(p.y - uOccluder.y), uOccluder.z);
      float shadow = 1.0 - behind * 0.92;

      // Les rides hachent la colonne : sans elles, c'est un néon posé à plat.
      float broken = max(0.0, -0.12 + ripple * 1.15 + ripple2 * 0.5);
      streaks += uLightColors[i] * band * along * broken * power * shadow;
    }

    streaks = min(streaks, vec3(1.4));
    color += streaks * 0.42;

    // L'eau reste translucide : ce qui est dessous doit pouvoir remonter.
    float alpha = clamp(0.58 + fresnel * 0.38 + min(0.22, streaks.r * 0.3), 0.0, 0.96);

    gl_FragColor = vec4(color, alpha);
  }
`;

function CanalWater({
  bargeRef,
}: {
  bargeRef: MutableRefObject<THREE.Group | null>;
}) {
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);

  const material = useMemo(() => {
    const positions: THREE.Vector3[] = [];
    const colors: THREE.Color[] = [];
    const powers: number[] = [];

    for (let i = 0; i < CANAL_LIGHT_SLOTS; i += 1) {
      const light = FABLE_CANAL_LIGHTS[i];
      positions.push(
        light ? new THREE.Vector3(light.x, light.z, light.height) : new THREE.Vector3()
      );
      colors.push(light ? light.color.clone() : new THREE.Color());
      powers.push(light ? light.intensity : 0);
    }

    return new THREE.ShaderMaterial({
      vertexShader: waterVertex,
      fragmentShader: `#define LIGHT_SLOTS ${CANAL_LIGHT_SLOTS}\n${waterFragment}`,
      uniforms: {
        uZenith: { value: FABLE_SKY_ZENITH },
        uHorizon: { value: FABLE_SKY_HORIZON },
        uSunDir: { value: FABLE_SUN_DIR },
        uSunColor: { value: FABLE_SUN_COLOR },
        uCameraPos: { value: new THREE.Vector3() },
        uTime: { value: 0 },
        uLights: { value: positions },
        uLightColors: { value: colors },
        uLightPower: { value: powers },
        uOccluder: { value: new THREE.Vector3(-999, -999, 7.5) },
      },
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
  }, []);

  useEffect(() => {
    materialRef.current = material;

    return () => {
      material.dispose();
    };
  }, [material]);

  useFrame(({ camera, clock }) => {
    const mat = materialRef.current;
    if (!mat) return;

    mat.uniforms.uCameraPos.value.copy(camera.position);
    mat.uniforms.uTime.value = clock.elapsedTime;

    const barge = bargeRef.current;

    if (barge) {
      const occluder = mat.uniforms.uOccluder.value as THREE.Vector3;
      occluder.set(barge.position.x, barge.position.z, 7.5);
    }
  });

  const width = FABLE_QUAY_X - FABLE_CANAL_FAR_X;
  const length = FABLE_CANAL_Z1 - FABLE_CANAL_Z0 + 16;

  return (
    <mesh
      material={material}
      position={[
        (FABLE_QUAY_X + FABLE_CANAL_FAR_X) / 2,
        FABLE_WATER_Y,
        (FABLE_CANAL_Z0 + FABLE_CANAL_Z1) / 2 + 4,
      ]}
      rotation={[-Math.PI / 2, 0, 0]}
      renderOrder={4}
    >
      <planeGeometry args={[width, length, 48, 64]} />
    </mesh>
  );
}

/* ─── L'anomalie : les vies absentes ──────────────────────────────────── */

/**
 * Des passants, des cyclistes — mais seulement leur reflet. Ils marchent
 * sous la surface, tête en bas, à l'endroit exact où personne ne se tient.
 */
function AbsentReflections({ reducedMotion }: { reducedMotion: boolean }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 16;
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const figures = useMemo(() => {
    const rng = fableRng(880412);

    return Array.from({ length: count }, () => ({
      // Ils longent le quai, mais du mauvais côté de la surface.
      x: FABLE_QUAY_X - 0.6 - rng() * 5.5,
      z: FABLE_CANAL_Z0 + 4 + rng() * (FABLE_CANAL_Z1 - FABLE_CANAL_Z0 - 10),
      speed: 0.3 + rng() * 0.5,
      dir: rng() < 0.5 ? 1 : -1,
      scale: 0.66 + rng() * 0.16,
      phase: rng() * 20,
    }));
  }, []);

  const geometry = useMemo(() => {
    // Silhouette sommaire : c'est un reflet, il n'a pas à être net.
    const geo = new THREE.CapsuleGeometry(0.11, 0.62, 3, 6);
    geo.translate(0, 0.42, 0);
    // Inversée : elle pend sous la surface.
    geo.scale(1, -1, 1);

    return geo;
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const t = reducedMotion ? 0 : clock.elapsedTime;

    figures.forEach((figure, i) => {
      const travel = ((t * figure.speed + figure.phase) % 26) - 13;
      const z = figure.z + travel * figure.dir;
      // Le reflet ondule : la surface le déforme légèrement.
      const wobble = Math.sin(t * 1.3 + i) * 0.06;
      dummy.position.set(figure.x + wobble, FABLE_WATER_Y - 0.02, z);
      dummy.rotation.set(0, figure.dir > 0 ? 0 : Math.PI, wobble * 0.5);
      dummy.scale.setScalar(figure.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, undefined, count]}
      frustumCulled={false}
      renderOrder={3}
    >
      <meshBasicMaterial color="#141a1c" transparent opacity={0.62} depthWrite={false} />
    </instancedMesh>
  );
}

/* ─── Quai ─────────────────────────────────────────────────────────────── */

function QuayEdge() {
  const maps = getDriftMaterialMaps("concrete", 3, 1);
  const bollardsRef = useRef<THREE.InstancedMesh>(null);

  const bollards = useMemo(() => {
    const rng = fableRng(33190);
    const list: THREE.Matrix4[] = [];

    for (let z = FABLE_CANAL_Z0 + 4; z < FABLE_CANAL_Z1 - 2; z += 6.5) {
      if (Math.abs(z - FABLE_BRIDGE_Z) < 4) continue;

      const x = FABLE_QUAY_X + 0.55;
      list.push(
        new THREE.Matrix4().compose(
          new THREE.Vector3(x, fableGroundY(x + 2, z) + 0.24, z + rng()),
          new THREE.Quaternion(),
          new THREE.Vector3(1, 0.9 + rng() * 0.3, 1)
        )
      );
    }

    return list;
  }, []);

  useEffect(() => {
    const mesh = bollardsRef.current;
    if (!mesh) return;

    bollards.forEach((m, i) => mesh.setMatrixAt(i, m));
    mesh.instanceMatrix.needsUpdate = true;
  }, [bollards]);

  const length = FABLE_CANAL_Z1 - FABLE_CANAL_Z0;
  const centerZ = (FABLE_CANAL_Z0 + FABLE_CANAL_Z1) / 2;
  const topY = fableGroundY(FABLE_QUAY_X + 3, centerZ);

  return (
    <group>
      {/* Mur de quai : il descend sous l'eau, il ne flotte pas. */}
      <mesh position={[FABLE_QUAY_X - 0.3, topY - 1.4, centerZ]} receiveShadow castShadow>
        <boxGeometry args={[1.2, 3.4, length]} />
        <meshStandardMaterial
          map={maps.map ?? undefined}
          normalMap={maps.normalMap ?? undefined}
          color="#6e6459"
          roughness={0.96}
        />
      </mesh>
      {/* Margelle claire, usée par les amarres. */}
      <mesh position={[FABLE_QUAY_X + 0.15, topY + 0.06, centerZ]} receiveShadow>
        <boxGeometry args={[1.9, 0.14, length]} />
        <meshStandardMaterial color="#8d8478" roughness={0.92} />
      </mesh>

      <instancedMesh
        ref={bollardsRef}
        args={[undefined, undefined, bollards.length]}
        frustumCulled={false}
        castShadow
      >
        <cylinderGeometry args={[0.16, 0.19, 0.5, 10]} />
        <meshStandardMaterial color="#26241f" roughness={0.72} metalness={0.35} />
      </instancedMesh>

      {/* Garde-corps : la barre où s'appuient les vélos. */}
      {Array.from({ length: Math.floor(length / 2.6) }, (_, i) => {
        const z = FABLE_CANAL_Z0 + 3 + i * 2.6;

        if (Math.abs(z - FABLE_BRIDGE_Z) < 4.5) return null;

        return (
          <mesh key={i} position={[FABLE_QUAY_X + 0.9, topY + 0.5, z]}>
            <cylinderGeometry args={[0.035, 0.035, 1, 6]} />
            <meshStandardMaterial color="#2b2c2e" roughness={0.7} metalness={0.4} />
          </mesh>
        );
      })}
      <mesh position={[FABLE_QUAY_X + 0.9, topY + 0.98, centerZ]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.032, 0.032, length - 2, 6]} />
        <meshStandardMaterial color="#2b2c2e" roughness={0.7} metalness={0.4} />
      </mesh>
    </group>
  );
}

/* ─── Vélos sans cavalier ─────────────────────────────────────────────── */

function Bicycle({ tint }: { tint: string }) {
  return (
    <group>
      {[-0.32, 0.32].map((wz) => (
        <mesh key={wz} position={[0, 0.28, wz]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.27, 0.018, 5, 14]} />
          <meshStandardMaterial color="#1d1e20" roughness={0.85} />
        </mesh>
      ))}
      <mesh position={[0, 0.42, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.62, 5]} />
        <meshStandardMaterial color={tint} roughness={0.6} metalness={0.25} />
      </mesh>
      <mesh position={[0, 0.55, -0.28]}>
        <boxGeometry args={[0.04, 0.26, 0.04]} />
        <meshStandardMaterial color={tint} roughness={0.6} metalness={0.25} />
      </mesh>
      <mesh position={[0, 0.68, -0.28]}>
        <boxGeometry args={[0.34, 0.03, 0.04]} />
        <meshStandardMaterial color="#26262a" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.6, 0.14]}>
        <boxGeometry args={[0.07, 0.04, 0.16]} />
        <meshStandardMaterial color="#3a2f28" roughness={0.85} />
      </mesh>
    </group>
  );
}

/** Ils s'appuient, puis changent de berge — jamais pendant qu'on regarde. */
function RiderlessBikes({ reducedMotion }: { reducedMotion: boolean }) {
  const groupRefs = useRef<Array<THREE.Group | null>>([]);

  const bikes = useMemo(() => {
    const rng = fableRng(51260);
    const tints = ["#5c6a63", "#7a5a4a", "#4c5666", "#6b6455", "#7d6a72"];

    return Array.from({ length: 7 }, (_, i) => ({
      z: FABLE_CANAL_Z0 + 6 + i * 4.6 + rng() * 1.4,
      lean: (rng() - 0.5) * 0.24,
      tint: tints[i % tints.length],
      // Chacun dérive à son propre rythme, très lentement.
      driftSpeed: 0.02 + rng() * 0.05,
      phase: rng() * 40,
    }));
  }, []);

  useFrame(({ clock }) => {
    if (reducedMotion) return;

    const t = clock.elapsedTime;

    bikes.forEach((bike, i) => {
      const group = groupRefs.current[i];
      if (!group) return;

      // Un lent va-et-vient le long du garde-corps, sans personne dessus.
      group.position.z = bike.z + swaySignal(t, i * 17 + 3, 0.01, 0.04) * 3.2;
      group.rotation.z = bike.lean + swaySignal(t, i * 29, 0.05, 0.12) * 0.03;
    });
  });

  return (
    <group>
      {bikes.map((bike, i) => (
        <group
          key={i}
          ref={(g) => {
            groupRefs.current[i] = g;
          }}
          position={[FABLE_QUAY_X + 1.35, fableGroundY(FABLE_QUAY_X + 3, bike.z), bike.z]}
          rotation={[0, 0, bike.lean]}
        >
          <Bicycle tint={bike.tint} />
        </group>
      ))}
    </group>
  );
}

/* ─── Péniche ──────────────────────────────────────────────────────────── */

function Barge({
  reducedMotion,
  groupRef,
}: {
  reducedMotion: boolean;
  groupRef: MutableRefObject<THREE.Group | null>;
}) {
  const glow = getFableGlowTexture();

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group) return;

    const t = reducedMotion ? 0 : clock.elapsedTime;
    const span = FABLE_CANAL_Z1 - FABLE_CANAL_Z0 + 40;
    const progress = (t * 1.5 + 30) % span;
    group.position.set(
      FABLE_QUAY_X - 13,
      FABLE_WATER_Y - 0.12 + Math.sin(t * 0.4) * 0.03,
      FABLE_CANAL_Z0 - 20 + progress
    );
    group.rotation.z = Math.sin(t * 0.31) * 0.008;
  });

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0.28, 0]} castShadow>
        <boxGeometry args={[3.4, 0.75, 15]} />
        <meshStandardMaterial color="#3f4348" roughness={0.85} metalness={0.2} />
      </mesh>
      {/* Bande de coque claire, à la ligne de flottaison. */}
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[3.46, 0.18, 15.05]} />
        <meshStandardMaterial color="#6e4a38" roughness={0.9} />
      </mesh>
      {/* Cargaison bâchée. */}
      <mesh position={[0, 0.85, 1.5]} castShadow>
        <boxGeometry args={[2.7, 0.6, 8]} />
        <meshStandardMaterial color="#4a4237" roughness={0.96} />
      </mesh>
      {/* Timonerie à l'arrière, une seule fenêtre allumée. */}
      <mesh position={[0, 1.15, -5.6]} castShadow>
        <boxGeometry args={[2.2, 1.3, 2.4]} />
        <meshStandardMaterial color="#4d5157" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.35, -4.38]}>
        <planeGeometry args={[1.5, 0.5]} />
        <meshBasicMaterial color="#ffca7e" toneMapped={false} />
      </mesh>
      <pointLight position={[0, 1.4, -4.2]} color="#ffca7e" intensity={5} distance={9} decay={1.8} />
      {/* Feu de mât. */}
      <mesh position={[0, 2.4, -5.6]}>
        <sphereGeometry args={[0.07, 6, 5]} />
        <meshBasicMaterial color="#ffe6b0" toneMapped={false} />
      </mesh>
      <sprite position={[0, 2.4, -5.6]} scale={[1.8, 1.8, 1]}>
        <spriteMaterial
          map={glow}
          color="#ffd79a"
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>
    </group>
  );
}

/* ─── Pont levant ──────────────────────────────────────────────────────── */

/** Il se lève quand il se lève. On n'a pas voix au chapitre. */
function LiftBridge({ reducedMotion }: { reducedMotion: boolean }) {
  const deckRef = useRef<THREE.Group>(null);
  const counterRef = useRef<THREE.Group>(null);
  const lampRef = useRef<THREE.MeshBasicMaterial>(null);
  const baseY = fableGroundY(FABLE_QUAY_X + 3, FABLE_BRIDGE_Z);

  useFrame(({ clock }) => {
    const t = reducedMotion ? 0 : clock.elapsedTime;
    // Cycle long : levée lente, palier, redescente.
    const cycle = 54;
    const phase = (t % cycle) / cycle;
    const lift =
      phase < 0.12
        ? phase / 0.12
        : phase < 0.42
          ? 1
          : phase < 0.56
            ? 1 - (phase - 0.42) / 0.14
            : 0;
    const eased = lift * lift * (3 - 2 * lift);

    if (deckRef.current) deckRef.current.rotation.x = -eased * 1.02;

    if (counterRef.current) counterRef.current.position.y = -eased * 2.1;

    if (lampRef.current) {
      const warning = eased > 0.02 && Math.sin(t * 6) > 0;
      lampRef.current.color.setHex(warning ? 0xff5a3c : 0x2a1a16);
    }
  });

  return (
    <group position={[FABLE_QUAY_X - 8, baseY, FABLE_BRIDGE_Z]}>
      {/* Piles. */}
      {[-7.5, 7.5].map((x) => (
        <mesh key={x} position={[x, -0.9, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.2, 3.4, 4.4]} />
          <meshStandardMaterial color="#5f574d" roughness={0.95} />
        </mesh>
      ))}
      {/* Portique. */}
      {[-6, 6].map((x) => (
        <mesh key={x} position={[x, 3.4, 0]} castShadow>
          <boxGeometry args={[0.55, 8, 0.55]} />
          <meshStandardMaterial color="#3d4348" roughness={0.7} metalness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, 7.2, 0]} castShadow>
        <boxGeometry args={[12.6, 0.6, 0.6]} />
        <meshStandardMaterial color="#3d4348" roughness={0.7} metalness={0.4} />
      </mesh>

      {/* Contrepoids : il descend quand le tablier monte. */}
      <group ref={counterRef} position={[0, 6, 0]}>
        <mesh position={[-6, 0, 0]} castShadow>
          <boxGeometry args={[1.4, 1.4, 1.6]} />
          <meshStandardMaterial color="#33383c" roughness={0.75} metalness={0.35} />
        </mesh>
        <mesh position={[6, 0, 0]} castShadow>
          <boxGeometry args={[1.4, 1.4, 1.6]} />
          <meshStandardMaterial color="#33383c" roughness={0.75} metalness={0.35} />
        </mesh>
      </group>

      {/* Tablier, articulé sur la pile aval. */}
      <group ref={deckRef} position={[0, 0.5, 2]}>
        <mesh position={[0, 0, -2]} castShadow receiveShadow>
          <boxGeometry args={[13, 0.34, 4]} />
          <meshStandardMaterial color="#514c45" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.42, -3.9]}>
          <boxGeometry args={[13, 0.5, 0.08]} />
          <meshStandardMaterial color="#7a3a2c" roughness={0.85} />
        </mesh>
      </group>

      {/* Feu de manœuvre. */}
      <mesh position={[6, 8, 0]}>
        <sphereGeometry args={[0.16, 7, 6]} />
        <meshBasicMaterial ref={lampRef} color="#2a1a16" toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ─── Berge opposée ────────────────────────────────────────────────────── */

/**
 * L'autre rive : un liseré de quai, des hangars, des fenêtres allumées — et
 * surtout leurs traînées sur l'eau. C'est le reflet qui donne la distance.
 */
function FarBank() {
  const bankRef = useRef<THREE.InstancedMesh>(null);
  const glow = getFableGlowTexture();

  const matrices = useMemo(() => {
    const rng = fableRng(662201);
    const list: THREE.Matrix4[] = [];
    let z = FABLE_CANAL_Z0 - 12;

    while (z < FABLE_CANAL_Z1 + 14) {
      const width = 6 + rng() * 11;
      const height = 5 + rng() * rng() * 17;
      const depth = 7 + rng() * 9;
      const x = FABLE_CANAL_FAR_X - 1.5 - depth / 2 - rng() * 5;
      list.push(
        new THREE.Matrix4().compose(
          new THREE.Vector3(x, height / 2 - 0.6, z + width / 2),
          new THREE.Quaternion().setFromEuler(new THREE.Euler(0, (rng() - 0.5) * 0.1, 0)),
          new THREE.Vector3(depth, height, width)
        )
      );
      z += width + 0.5 + rng() * 2.5;
    }

    return list;
  }, []);

  // Les sources sont déclarées une seule fois, plus haut : la géométrie qui
  // les porte et l'eau qui les reflète lisent la même liste.
  const lights = FABLE_CANAL_LIGHTS.filter((l) => l.x < FABLE_QUAY_X - 2);

  useEffect(() => {
    const mesh = bankRef.current;
    if (!mesh) return;

    const color = new THREE.Color();
    const rng = fableRng(19);

    matrices.forEach((m, i) => {
      mesh.setMatrixAt(i, m);
      const v = 0.85 + rng() * 0.3;
      color.setRGB(0.3 * v, 0.285 * v, 0.27 * v);
      mesh.setColorAt(i, color);
    });
    mesh.instanceMatrix.needsUpdate = true;

    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [matrices]);

  return (
    <group>
      <instancedMesh
        ref={bankRef}
        args={[undefined, undefined, matrices.length]}
        frustumCulled={false}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ffffff" roughness={0.97} />
      </instancedMesh>

      {/* Mur de la rive d'en face. */}
      <mesh
        position={[
          FABLE_CANAL_FAR_X - 0.6,
          -1,
          (FABLE_CANAL_Z0 + FABLE_CANAL_Z1) / 2,
        ]}
      >
        <boxGeometry args={[1.4, 3.2, FABLE_CANAL_Z1 - FABLE_CANAL_Z0 + 30]} />
        <meshStandardMaterial color="#544c44" roughness={0.97} />
      </mesh>

      {lights.map((light, i) => (
        <group key={i}>
          <mesh position={[light.x, light.height, light.z]}>
            <sphereGeometry args={[0.11, 6, 5]} />
            <meshBasicMaterial color={light.color} toneMapped={false} />
          </mesh>
          <sprite position={[light.x, light.height, light.z]} scale={[2.6, 2.6, 1]}>
            <spriteMaterial
              map={glow}
              color={light.color}
              transparent
              opacity={0.4}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </sprite>
        </group>
      ))}
    </group>
  );
}

/* ─── L'enseigne d'en face ────────────────────────────────────────────── */

/**
 * La vitrine d'optimisation, en vis-à-vis du bassin — c'est la composition
 * même du masterframe : la voiture entre une façade de verre allumée au
 * néon et l'eau noire.
 *
 * Ce n'est ici que le VOLUME et sa lumière : la coque de verre, le bandeau
 * fluorescent, trois machines en silhouette. Le contenu accepté d'EUX
 * GAINENT — sa dramaturgie, son vocabulaire, son anomalie — n'est pas
 * réinterprété ici et viendra s'y monter tel quel.
 */
function QuaysideShowroom({ reducedMotion }: { reducedMotion: boolean }) {
  const stripRef = useRef<THREE.MeshBasicMaterial>(null);
  const runnersRef = useRef<Array<THREE.Group | null>>([]);
  const z = FABLE_SHOWROOM_Z;
  const x = fableStreetHalfWidth(z) + 2.1;
  const groundY = fableGroundY(x, z);

  useFrame(({ clock }) => {
    const t = reducedMotion ? 0 : clock.elapsedTime;

    // Le tube fatigue : il bat, très légèrement, jamais en rythme.
    if (stripRef.current) {
      stripRef.current.opacity = 0.86 + Math.sin(t * 7.3) * 0.03 + Math.sin(t * 2.1) * 0.05;
    }

    // Les trois corps travaillent, chacun à sa cadence.
    runnersRef.current.forEach((runner, i) => {
      if (!runner) return;

      runner.position.y = Math.abs(Math.sin(t * (2.6 + i * 0.45) + i)) * 0.05;
    });
  });

  return (
    <group position={[x, groundY, z]}>
      {/* Coque : sol, plafond, fond. */}
      <mesh position={[2.6, 1.9, 0]} castShadow receiveShadow>
        <boxGeometry args={[5.4, 3.8, 11]} />
        <meshStandardMaterial color="#6b6157" roughness={0.94} />
      </mesh>
      <mesh position={[0.1, 0.06, 0]} receiveShadow>
        <boxGeometry args={[5, 0.12, 10.4]} />
        <meshStandardMaterial color="#33383c" roughness={0.8} />
      </mesh>

      {/* Bandeau fluorescent, au plafond, sur toute la longueur. */}
      <mesh position={[0.6, 3.42, 0]}>
        <boxGeometry args={[0.36, 0.1, 9.6]} />
        <meshBasicMaterial ref={stripRef} color="#eaf6ff" toneMapped={false} transparent opacity={0.9} />
      </mesh>
      <pointLight position={[0.4, 3.1, -2.6]} color="#dcecfa" intensity={38} distance={16} decay={1.7} />
      <pointLight position={[0.4, 3.1, 2.6]} color="#dcecfa" intensity={38} distance={16} decay={1.7} />

      {/* Trois postes, alignés face à la rue. */}
      {[-3.1, 0, 3.1].map((oz, i) => (
        <group key={oz} position={[1.5, 0, oz]}>
          <mesh position={[0, 0.28, 0]} castShadow>
            <boxGeometry args={[1.5, 0.16, 0.72]} />
            <meshStandardMaterial color="#26282a" roughness={0.6} metalness={0.4} />
          </mesh>
          <mesh position={[-0.62, 0.85, 0]}>
            <boxGeometry args={[0.1, 1.15, 0.6]} />
            <meshStandardMaterial color="#3a3d40" roughness={0.5} metalness={0.5} />
          </mesh>
          <mesh position={[-0.62, 1.42, 0]}>
            <planeGeometry args={[0.42, 0.26]} />
            <meshBasicMaterial color="#8fd8c4" toneMapped={false} />
          </mesh>
          {/* Le corps sur la machine — silhouette, rien de plus. */}
          <group
            ref={(g) => {
              runnersRef.current[i] = g;
            }}
            position={[0, 0, 0]}
          >
            <mesh position={[0, 0.78, 0]} castShadow>
              <boxGeometry args={[0.24, 0.82, 0.2]} />
              <meshStandardMaterial color="#2f3236" roughness={0.9} />
            </mesh>
            <mesh position={[0, 1.28, 0]} castShadow>
              <sphereGeometry args={[0.1, 8, 6]} />
              <meshStandardMaterial color="#2f3236" roughness={0.9} />
            </mesh>
          </group>
        </group>
      ))}

      {/* La glace : c'est elle qu'on voit depuis le quai. */}
      <mesh position={[-0.1, 1.95, 0]}>
        <boxGeometry args={[0.06, 3.5, 10.6]} />
        <meshStandardMaterial
          color="#cfe4f2"
          roughness={0.06}
          metalness={0.05}
          transparent
          opacity={0.24}
          envMapIntensity={2.6}
        />
      </mesh>
      {/* Meneaux verticaux. */}
      {[-4.2, -1.4, 1.4, 4.2].map((oz) => (
        <mesh key={oz} position={[-0.12, 1.95, oz]}>
          <boxGeometry args={[0.14, 3.5, 0.14]} />
          <meshStandardMaterial color="#1f2123" roughness={0.6} metalness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

/* ─── Sources du quai ─────────────────────────────────────────────────── */

/**
 * Lampes de quai : rares et hautes. Elles posent trois flaques froides sur
 * la pierre mouillée et laissent tout le reste au noir — un quai n'est pas
 * une rue, il n'a jamais été éclairé pour qu'on s'y promène.
 */
function QuayLamps() {
  const glow = getFableGlowTexture();
  const lamps = FABLE_CANAL_LIGHTS.filter((l) => l.x > FABLE_QUAY_X - 1);

  return (
    <group>
      {lamps.map((lamp, i) => {
        const groundY = fableGroundY(lamp.x + 2, lamp.z);

        return (
          <group key={i} position={[lamp.x, groundY, lamp.z]}>
            <mesh position={[0, lamp.height / 2, 0]} castShadow>
              <cylinderGeometry args={[0.07, 0.11, lamp.height, 8]} />
              <meshStandardMaterial color="#2b2d2f" roughness={0.8} metalness={0.35} />
            </mesh>
            {/* Crosse tournée vers l'eau. */}
            <mesh position={[-0.42, lamp.height - 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.05, 0.05, 0.9, 6]} />
              <meshStandardMaterial color="#2b2d2f" roughness={0.8} metalness={0.35} />
            </mesh>
            <mesh position={[-0.84, lamp.height - 0.22, 0]}>
              <boxGeometry args={[0.42, 0.16, 0.3]} />
              <meshBasicMaterial color={lamp.color} toneMapped={false} />
            </mesh>
            <sprite position={[-0.84, lamp.height - 0.28, 0]} scale={[3.4, 3.4, 1]}>
              <spriteMaterial
                map={glow}
                color={lamp.color}
                transparent
                opacity={0.4}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </sprite>
            <pointLight
              position={[-0.84, lamp.height - 0.4, 0]}
              color={lamp.color}
              intensity={26}
              distance={13}
              decay={1.9}
            />
          </group>
        );
      })}
    </group>
  );
}

/** Bateau de servitude amarré : feu de pont, coque qui bouge un peu. */
function MooredVessel({ reducedMotion }: { reducedMotion: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const z = FABLE_CANAL_Z0 + 15;

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group || reducedMotion) return;

    const t = clock.elapsedTime;
    group.rotation.z = swaySignal(t, 91, 0.07, 0.16) * 0.022;
    group.position.y = FABLE_WATER_Y - 0.18 + swaySignal(t, 44, 0.05, 0.13) * 0.045;
  });

  return (
    <group ref={groupRef} position={[FABLE_QUAY_X - 3.4, FABLE_WATER_Y - 0.18, z]}>
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[2.4, 0.9, 7.6]} />
        <meshStandardMaterial color="#454b50" roughness={0.82} metalness={0.25} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[2.46, 0.22, 7.66]} />
        <meshStandardMaterial color="#6b3f30" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.15, -2]} castShadow>
        <boxGeometry args={[1.7, 1.1, 2]} />
        <meshStandardMaterial color="#525860" roughness={0.78} />
      </mesh>
      <mesh position={[0, 1.3, -0.98]}>
        <planeGeometry args={[1.2, 0.42]} />
        <meshBasicMaterial color="#ffcf8a" toneMapped={false} />
      </mesh>
      <pointLight position={[0, 1.3, -0.7]} color="#ffcf8a" intensity={7} distance={9} decay={1.9} />
      {/* Amarres tendues vers les bittes. */}
      {[-2.6, 2.6].map((oz) => (
        <mesh key={oz} position={[1.6, 0.42, oz]} rotation={[0, 0, -0.34]}>
          <cylinderGeometry args={[0.028, 0.028, 3.1, 5]} />
          <meshStandardMaterial color="#6c6152" roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * L'autre rive travaille : un hangar ouvert dont l'intérieur brûle, une
 * grue portuaire dont les feux de service balaient lentement. C'est de là
 * que vient la lumière qui traverse le bassin.
 */
function FarBankWorks({ reducedMotion }: { reducedMotion: boolean }) {
  const craneRef = useRef<THREE.Group>(null);
  const glow = getFableGlowTexture();
  const hangarZ = FABLE_CANAL_Z0 + 30;
  const craneZ = FABLE_CANAL_Z0 + 17;

  useFrame(({ clock }) => {
    const crane = craneRef.current;
    if (!crane || reducedMotion) return;

    // Le chariot va et vient sur sa poutre, à son propre rythme.
    crane.position.z = craneZ + swaySignal(clock.elapsedTime, 12, 0.02, 0.05) * 5;
  });

  return (
    <group>
      {/* Hangar ouvert sur l'eau. */}
      <group position={[FABLE_CANAL_FAR_X - 6, -0.6, hangarZ]}>
        <mesh position={[0, 4, 0]} castShadow receiveShadow>
          <boxGeometry args={[13, 8, 17]} />
          <meshStandardMaterial color="#4b4a47" roughness={0.95} />
        </mesh>
        {/* Grande porte : la lumière sort par là. */}
        <mesh position={[6.55, 3, 0]}>
          <planeGeometry args={[11, 5.6]} />
          <meshBasicMaterial color="#ffd9a2" toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
        <pointLight position={[7.6, 3, 0]} color="#ffd9a2" intensity={110} distance={34} decay={1.7} />
        {/* Silhouettes de charge devant la porte : le travail est visible. */}
        {[-3.4, -0.6, 2.6].map((oz, i) => (
          <mesh key={oz} position={[7.2, 0.9 + (i % 2) * 0.4, oz]} castShadow>
            <boxGeometry args={[1.6, 1.8 + (i % 2) * 0.8, 1.9]} />
            <meshStandardMaterial color="#3b3733" roughness={0.95} />
          </mesh>
        ))}
      </group>

      {/* Grue portuaire. */}
      <group position={[FABLE_CANAL_FAR_X + 3, -0.6, craneZ]}>
        {[-1.6, 1.6].map((oz) => (
          <mesh key={oz} position={[0, 5, oz]} castShadow>
            <boxGeometry args={[0.6, 10, 0.6]} />
            <meshStandardMaterial color="#6a5a35" roughness={0.82} metalness={0.3} />
          </mesh>
        ))}
        <mesh position={[0, 10.2, 0]} castShadow>
          <boxGeometry args={[1.1, 0.8, 5]} />
          <meshStandardMaterial color="#6a5a35" roughness={0.82} metalness={0.3} />
        </mesh>
        {/* Flèche au-dessus de l'eau. */}
        <mesh position={[5.4, 11.4, 0]} rotation={[0, 0, -0.16]} castShadow>
          <boxGeometry args={[13, 0.45, 0.5]} />
          <meshStandardMaterial color="#6a5a35" roughness={0.82} metalness={0.3} />
        </mesh>
        {/* Feux de service. */}
        <mesh position={[0.6, 9.6, 0]}>
          <boxGeometry args={[0.3, 0.22, 0.34]} />
          <meshBasicMaterial color="#ffe2a8" toneMapped={false} />
        </mesh>
        <sprite position={[0.6, 9.6, 0]} scale={[4, 4, 1]}>
          <spriteMaterial
            map={glow}
            color="#ffe2a8"
            transparent
            opacity={0.42}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </sprite>
        <pointLight position={[1.2, 9.4, 0]} color="#ffe2a8" intensity={60} distance={26} decay={1.8} />
        {/* Chariot et son crochet. */}
        <group ref={craneRef} position={[0, 0, 0]}>
          <mesh position={[8.4, 10.9, 0]}>
            <boxGeometry args={[1.2, 0.5, 0.7]} />
            <meshStandardMaterial color="#4b4640" roughness={0.85} />
          </mesh>
          <mesh position={[8.4, 8.4, 0]}>
            <boxGeometry args={[0.04, 4.6, 0.04]} />
            <meshStandardMaterial color="#232323" roughness={0.7} />
          </mesh>
          <mesh position={[8.4, 6, 0]} castShadow>
            <boxGeometry args={[0.7, 0.6, 0.7]} />
            <meshStandardMaterial color="#3c3833" roughness={0.85} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

export default function FableCanal({ reducedMotion }: { reducedMotion: boolean }) {
  const bargeRef = useRef<THREE.Group | null>(null);

  return (
    <group>
      <QuayEdge />
      <QuayLamps />
      <QuaysideShowroom reducedMotion={reducedMotion} />
      <FarBank />
      <FarBankWorks reducedMotion={reducedMotion} />
      <AbsentReflections reducedMotion={reducedMotion} />
      <CanalWater bargeRef={bargeRef} />
      <RiderlessBikes reducedMotion={reducedMotion} />
      <Barge reducedMotion={reducedMotion} groupRef={bargeRef} />
      <MooredVessel reducedMotion={reducedMotion} />
      <LiftBridge reducedMotion={reducedMotion} />
    </group>
  );
}
