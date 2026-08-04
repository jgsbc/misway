"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { getDriftMaterialMaps } from "@/components/drift-3d/drift3dTextureFactory";
import {
  getFableGlowTexture,
  getFableGoboTexture,
} from "@/components/drift-3d/fable/fableTextures";
import { FABLE_SUN_DIR } from "@/components/drift-3d/fable/FableSky";
import {
  FABLE_MOUTH_Z,
  FABLE_PORTAL_HOLE_OFFSET_X,
  FABLE_PORTAL_Z,
  FABLE_TUNNEL_APEX,
  FABLE_TUNNEL_HALF_WIDTH,
  FABLE_TUNNEL_Z0,
  fableGroundY,
  fablePathX,
  fableRng,
} from "@/components/drift-3d/fable/fableWorld";

/**
 * FABLE SPIKE — la gorge minérale. Un tube de caverne creusé par bruit
 * multi-octave, un massif de blocs par-dessus, une paroi-falaise percée
 * d'une brèche en λ, des gouttes, des poussières dans les phares, et la
 * lumière du dehors qui coule par l'ouverture.
 */

function noise2(x: number, y: number) {
  const v = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;

  return v - Math.floor(v);
}

function fbm(x: number, y: number) {
  return (
    (noise2(x, y) - 0.5) +
    (noise2(x * 2.7 + 11, y * 2.7) - 0.5) * 0.5 +
    (noise2(x * 6.1 + 41, y * 6.1) - 0.5) * 0.25
  );
}

/** Tube de caverne : anneaux le long du chemin, section en arche déformée. */
function useCaveGeometry() {
  return useMemo(() => {
    const rings = 64;
    const around = 26;
    const z0 = FABLE_TUNNEL_Z0 - 3;
    const z1 = FABLE_MOUTH_Z + 1.6;
    const positions: number[] = [];
    const uvs: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];

    for (let r = 0; r <= rings; r += 1) {
      const t = r / rings;
      const z = z0 + (z1 - z0) * t;
      const cx = fablePathX(z);
      const floorY = fableGroundY(cx, z) - 0.25;

      for (let a = 0; a <= around; a += 1) {
        const s = a / around;
        const angle = Math.PI * (1 - s);
        // Arche : murs évasés, plafond en voûte.
        const bulge = 1 + fbm(s * 5 + 3, z * 0.35) * 0.34;
        const wallW = FABLE_TUNNEL_HALF_WIDTH * bulge * (1 + 0.16 * Math.pow(Math.sin(angle), 0.5) * 0);
        const apex = FABLE_TUNNEL_APEX * (1 + fbm(s * 3 + 9, z * 0.22) * 0.22);
        const x = cx + Math.cos(angle) * wallW;
        const y = floorY + Math.pow(Math.max(0, Math.sin(angle)), 0.72) * apex;

        // Déplacement radial rocheux supplémentaire.
        const d = fbm(s * 9 + 21, z * 0.8) * 0.4;
        const nx = Math.cos(angle);
        const ny = Math.max(0.15, Math.sin(angle));
        positions.push(x + nx * d, y + ny * d * 0.6, z);
        uvs.push(s * 3.4, z * 0.24);

        // AO peinte : sombre dans les angles bas et la voûte profonde.
        const cornerDark = 1 - 0.5 * Math.exp(-Math.pow(Math.sin(angle) * 3.4, 2));
        const depthDark = 0.55 + 0.45 * t;
        const shade = 0.55 * cornerDark * (0.7 + 0.3 * depthDark) + fbm(s * 13, z) * 0.08;
        colors.push(shade, shade, shade);
      }
    }

    for (let r = 0; r < rings; r += 1) {
      for (let a = 0; a < around; a += 1) {
        const i0 = r * (around + 1) + a;
        const i1 = i0 + 1;
        const i2 = i0 + (around + 1);
        const i3 = i2 + 1;
        // Faces tournées vers l'intérieur.
        indices.push(i0, i2, i1, i1, i2, i3);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    return geometry;
  }, []);
}

/**
 * Contour de la brèche. Un Λ, mais fracturé : chaque sommet est décalé et
 * chaque arête subdivisée avec du bruit, pour que la forme soit une cassure
 * de la roche qui se trouve avoir cette allure — jamais un tracé vectoriel.
 */
const PORTAL_APEX_Y = 15.4;

export const FABLE_PORTAL_OUTLINE: Array<[number, number]> = (() => {
  const o = FABLE_PORTAL_HOLE_OFFSET_X - 0.7;
  const sx = 1.5;
  const sy = 2.15;
  const anchors: Array<[number, number]> = [
    [-4.6 * sx + o, 0],
    [-3.0 * sx + o, 0],
    [-0.55 * sx + o, 3.1 * sy],
    [0.4 * sx + o, 0],
    [2.4 * sx + o, 0],
    [-0.2 * sx + o, 7.2 * sy],
    [-1.6 * sx + o, 7.2 * sy],
  ];

  // Subdivision bruitée : la roche s'est rompue, elle n'a pas été découpée.
  const rng = fableRng(2026080401);
  const points: Array<[number, number]> = [];

  for (let i = 0; i < anchors.length; i += 1) {
    const a = anchors[i];
    const b = anchors[(i + 1) % anchors.length];
    const segments = 5;
    points.push([a[0] + (rng() - 0.5) * 0.5, a[1] + (rng() - 0.5) * (a[1] < 0.01 ? 0 : 0.7)]);

    for (let s = 1; s < segments; s += 1) {
      const t = s / segments;
      const x = a[0] + (b[0] - a[0]) * t;
      const y = a[1] + (b[1] - a[1]) * t;
      const amp = y < 0.4 ? 0 : 0.75;
      points.push([x + (rng() - 0.5) * amp, Math.max(0, y + (rng() - 0.5) * amp)]);
    }
  }

  return points;
})();

export const FABLE_PORTAL_OUTLINE_BOUNDS = (() => {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const [x, y] of FABLE_PORTAL_OUTLINE) {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }

  return { minX, maxX, minY, maxY };
})();

/** Paroi-falaise percée de la brèche — épaisse, pour qu'on la traverse. */
function usePortalGeometry() {
  return useMemo(() => {
    const wall = new THREE.Shape();
    wall.moveTo(-56, 0);
    wall.lineTo(56, 0);
    wall.lineTo(56, 40);
    wall.lineTo(34, 47);
    wall.lineTo(14, 52);
    wall.lineTo(-12, 49);
    wall.lineTo(-33, 43);
    wall.lineTo(-56, 38);
    wall.closePath();

    const hole = new THREE.Path();
    hole.moveTo(FABLE_PORTAL_OUTLINE[0][0], FABLE_PORTAL_OUTLINE[0][1]);

    for (let i = 1; i < FABLE_PORTAL_OUTLINE.length; i += 1) {
      hole.lineTo(FABLE_PORTAL_OUTLINE[i][0], FABLE_PORTAL_OUTLINE[i][1]);
    }

    hole.closePath();
    wall.holes.push(hole);

    // Épaisseur : on traverse un défilé, pas une découpe de carton. Les
    // parois du percement défilent en parallaxe forte à la traversée.
    return new THREE.ExtrudeGeometry(wall, { depth: 11, bevelEnabled: false });
  }, []);
}

function ScatterRocks() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 96;
  const maps = getDriftMaterialMaps("rock", 1.6, 1.6);

  const geometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1, 1);
    const pos = geo.attributes.position;
    const v = new THREE.Vector3();

    for (let i = 0; i < pos.count; i += 1) {
      v.fromBufferAttribute(pos, i);
      const d = 1 + fbm(v.x * 1.3 + 5, v.y * 1.3 + v.z) * 0.42;
      pos.setXYZ(i, v.x * d, v.y * d * 0.82, v.z * d);
    }

    geo.computeVertexNormals();

    return geo;
  }, []);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const rng = fableRng(551177);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    let i = 0;

    // Massif au-dessus / autour du tube — toujours hors du gabarit intérieur.
    for (; i < 62; i += 1) {
      const z = FABLE_TUNNEL_Z0 - 2 + rng() * (FABLE_MOUTH_Z - FABLE_TUNNEL_Z0 - 6);
      const cx = fablePathX(z);
      const side = rng() < 0.5 ? -1 : 1;
      const s = 2.2 + rng() * 3.2;
      const overhead = rng() < 0.3 && z < -16;
      const lateral = overhead ? (rng() - 0.5) * 5 : side * (7.6 + s + rng() * 4);
      const x = cx + lateral;
      const y = overhead
        ? fableGroundY(cx, z) + FABLE_TUNNEL_APEX + s * 0.8 + rng() * 2
        : fableGroundY(cx, z) + rng() * 6 - 1;
      e.set(rng() * Math.PI, rng() * Math.PI, rng() * Math.PI);
      q.setFromEuler(e);
      m.compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(s, s * (0.7 + rng() * 0.5), s));
      mesh.setMatrixAt(i, m);
    }

    // Couronne du portail — posée sur le mur, jamais devant la brèche.
    for (; i < 84; i += 1) {
      const side = rng() < 0.5 ? -1 : 1;
      const s = 1.8 + rng() * 1.9;
      const x = side * (6 + rng() * 12);
      const high = rng() < 0.55;
      const y = high ? 20 + rng() * 6 : 10 + rng() * 7;
      e.set(rng() * Math.PI, rng() * Math.PI, rng() * Math.PI);
      q.setFromEuler(e);
      m.compose(
        new THREE.Vector3(
          x,
          fableGroundY(0, FABLE_PORTAL_Z) + y - 6,
          FABLE_PORTAL_Z - 4.2 - rng() * 2.5
        ),
        q,
        new THREE.Vector3(s, s * 0.8, s)
      );
      mesh.setMatrixAt(i, m);
    }

    for (; i < count; i += 1) {
      // Éboulis qui comble la jambe gauche : la brèche n'est praticable
      // que d'un côté, parce que l'autre s'est effondré.
      const x = -7.3 + (rng() - 0.5) * 2.6;
      const y = fableGroundY(x, FABLE_PORTAL_Z) + rng() * 1.5;
      const s = 0.5 + rng() * 1.3;
      e.set(rng() * Math.PI, rng() * Math.PI, rng() * Math.PI);
      q.setFromEuler(e);
      m.compose(new THREE.Vector3(x, y, FABLE_PORTAL_Z + (rng() - 0.5) * 1.6), q, new THREE.Vector3(s, s, s));
      mesh.setMatrixAt(i, m);
    }

    mesh.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <instancedMesh frustumCulled={false} ref={meshRef} args={[geometry, undefined, count]} castShadow receiveShadow>
      <meshStandardMaterial
        map={maps.map ?? undefined}
        normalMap={maps.normalMap ?? undefined}
        color="#6b6156"
        roughness={0.97}
      />
    </instancedMesh>
  );
}

function Stalactites() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 44;

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const rng = fableRng(88332);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    q.setFromEuler(new THREE.Euler(Math.PI, 0, 0));

    for (let i = 0; i < count; i += 1) {
      const z = FABLE_TUNNEL_Z0 + rng() * (FABLE_MOUTH_Z - FABLE_TUNNEL_Z0 - 3);
      const cx = fablePathX(z);
      const x = cx + (rng() - 0.5) * 4.6;
      const apexY = fableGroundY(cx, z) + FABLE_TUNNEL_APEX * (0.72 + rng() * 0.2) -
        Math.abs(x - cx) * 0.45;
      const len = 0.4 + rng() * rng() * 1.5;
      m.compose(
        new THREE.Vector3(x, apexY - len / 2, z),
        q,
        new THREE.Vector3(0.09 + rng() * 0.14, len, 0.09 + rng() * 0.14)
      );
      mesh.setMatrixAt(i, m);
    }

    mesh.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <instancedMesh frustumCulled={false} ref={meshRef} args={[undefined, undefined, count]}>
      <coneGeometry args={[1, 1, 6]} />
      <meshStandardMaterial color="#4c463e" roughness={0.95} />
    </instancedMesh>
  );
}

/** Gouttes qui tombent de la voûte, visibles dans les phares. */
function Drips({ reducedMotion }: { reducedMotion: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 44;

  const { positions, seeds } = useMemo(() => {
    const rng = fableRng(9911);
    const positionsArray = new Float32Array(count * 3);
    const seedsArray: Array<{ x: number; z: number; top: number; floor: number; speed: number; phase: number }> = [];

    for (let i = 0; i < count; i += 1) {
      const z = FABLE_TUNNEL_Z0 + rng() * (FABLE_MOUTH_Z - FABLE_TUNNEL_Z0);
      const cx = fablePathX(z);
      const x = cx + (rng() - 0.5) * 5;
      const floor = fableGroundY(cx, z);
      const top = floor + 3.4 + rng() * 1.6;
      seedsArray.push({ x, z, top, floor, speed: 5 + rng() * 3, phase: rng() * 10 });
      positionsArray[i * 3] = x;
      positionsArray[i * 3 + 1] = top;
      positionsArray[i * 3 + 2] = z;
    }

    return { positions: positionsArray, seeds: seedsArray };
  }, []);

  useFrame(({ clock }) => {
    const points = pointsRef.current;
    if (!points || reducedMotion) return;

    const attr = points.geometry.attributes.position as THREE.BufferAttribute;
    const t = clock.elapsedTime;

    for (let i = 0; i < count; i += 1) {
      const s = seeds[i];
      const span = s.top - s.floor;
      const fall = ((t * s.speed + s.phase * span) % (span + 2));
      attr.setY(i, s.top - Math.min(fall, span));
    }

    attr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#9db4c4"
        size={0.045}
        sizeAttenuation
        transparent
        opacity={0.75}
        depthWrite={false}
      />
    </points>
  );
}

/** Poussière en suspension — ne vit que dans le faisceau des phares. */
function DustMotes({ reducedMotion }: { reducedMotion: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 240;

  const { positions, drift } = useMemo(() => {
    const rng = fableRng(40417);
    const positionsArray = new Float32Array(count * 3);
    const driftArray = new Float32Array(count * 3);

    for (let i = 0; i < count; i += 1) {
      const z = FABLE_TUNNEL_Z0 + rng() * (FABLE_MOUTH_Z - FABLE_TUNNEL_Z0 + 4);
      const cx = fablePathX(z);
      positionsArray[i * 3] = cx + (rng() - 0.5) * 5.6;
      positionsArray[i * 3 + 1] = fableGroundY(cx, z) + 0.2 + rng() * 3.6;
      positionsArray[i * 3 + 2] = z;
      driftArray[i * 3] = (rng() - 0.5) * 0.12;
      driftArray[i * 3 + 1] = (rng() - 0.5) * 0.05;
      driftArray[i * 3 + 2] = (rng() - 0.5) * 0.12;
    }

    return { positions: positionsArray, drift: driftArray };
  }, []);

  useFrame((_, delta) => {
    const points = pointsRef.current;
    if (!points || reducedMotion) return;

    const attr = points.geometry.attributes.position as THREE.BufferAttribute;

    for (let i = 0; i < count; i += 1) {
      attr.setXYZ(
        i,
        attr.getX(i) + drift[i * 3] * delta,
        attr.getY(i) + drift[i * 3 + 1] * delta,
        attr.getZ(i) + drift[i * 3 + 2] * delta
      );
    }

    attr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#cabb9d"
        size={0.022}
        sizeAttenuation
        transparent
        opacity={0.5}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/** Relai administratif sans personnel — écran vert qui cligne, seul repère du noir. */
function Relay() {
  const lightRef = useRef<THREE.PointLight>(null);
  const screenRef = useRef<THREE.MeshStandardMaterial>(null);
  const z = -40;
  const x = fablePathX(z) + 3.1;
  const y = fableGroundY(fablePathX(z), z);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const blink = 0.55 + 0.45 * Math.max(0, Math.sin(t * 0.9)) * (noise2(Math.floor(t * 6), 3) > 0.2 ? 1 : 0.2);

    if (lightRef.current) lightRef.current.intensity = 1.4 * blink;
    if (screenRef.current) screenRef.current.emissiveIntensity = 1.6 * blink;
  });

  return (
    <group position={[x, y, z]} rotation={[0, -0.5, 0]}>
      <mesh position={[0, 1.05, 0]} castShadow>
        <boxGeometry args={[0.5, 0.68, 0.34]} />
        <meshStandardMaterial color="#2c2f2b" roughness={0.6} metalness={0.35} />
      </mesh>
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[0.34, 0.72, 0.26]} />
        <meshStandardMaterial color="#242622" roughness={0.8} />
      </mesh>
      <mesh position={[-0.18, 1.5, 0.05]} rotation={[0, 0, 0.5]}>
        <cylinderGeometry args={[0.018, 0.018, 0.5, 6]} />
        <meshStandardMaterial color="#88816f" roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[-0.05, 1.12, 0.178]}>
        <planeGeometry args={[0.3, 0.17]} />
        <meshStandardMaterial
          ref={screenRef}
          color="#0c1810"
          emissive="#3fae5c"
          emissiveIntensity={1.2}
          roughness={0.4}
        />
      </mesh>
      <pointLight ref={lightRef} position={[0, 1.2, 0.5]} color="#4fce74" intensity={1.2} distance={4.5} decay={1.8} />
    </group>
  );
}

/** Fentes du plafond : premiers aperçus du dehors avant l'émergence. */
function CeilingCracks() {
  const glow = getFableGlowTexture();
  const cracks = [
    { z: -26, tilt: 0.35 },
    { z: -15, tilt: -0.25 },
  ];

  return (
    <>
      {cracks.map((crack) => {
        const cx = fablePathX(crack.z);
        const y = fableGroundY(cx, crack.z) + FABLE_TUNNEL_APEX * 0.9;

        return (
          <group key={crack.z} position={[cx + 0.6, y, crack.z]} rotation={[0, 0, crack.tilt]}>
            <mesh rotation={[Math.PI / 2, 0, 0.7]}>
              <planeGeometry args={[0.14, 2.2]} />
              <meshBasicMaterial color="#ffe9c4" toneMapped={false} side={THREE.DoubleSide} />
            </mesh>
            {/* Rai de lumière qui tombe de la fente. */}
            <mesh position={[0, -1.9, 0]} rotation={[0, 0.7, 0.12]}>
              <planeGeometry args={[0.9, 4]} />
              <meshBasicMaterial
                color="#ffdfa8"
                transparent
                opacity={0.05}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                side={THREE.DoubleSide}
              />
            </mesh>
            <sprite position={[0, 0, 0]} scale={[1.4, 1.4, 1]}>
              <spriteMaterial
                map={glow}
                color="#ffe9c4"
                transparent
                opacity={0.35}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </sprite>
            <pointLight color="#cfe0f2" intensity={1.1} distance={7} decay={1.6} position={[0, -0.6, 0]} />
          </group>
        );
      })}
    </>
  );
}

/** Lumière et rais qui coulent de la brèche λ vers l'intérieur. */
function PortalLight() {
  const glow = getFableGlowTexture();
  const targetRef = useRef<THREE.Object3D>(null);
  const spotRef = useRef<THREE.SpotLight>(null);
  const skyCardRef = useRef<THREE.MeshBasicMaterial>(null);
  const floorY = fableGroundY(0.5, FABLE_PORTAL_Z);
  const gobo = useMemo(
    () =>
      getFableGoboTexture(
        "portal",
        FABLE_PORTAL_OUTLINE,
        FABLE_PORTAL_OUTLINE_BOUNDS,
        7
      ),
    []
  );

  useEffect(() => {
    if (spotRef.current && targetRef.current) {
      spotRef.current.target = targetRef.current;
    }
  }, []);

  useFrame(({ camera }) => {
    // La carte de ciel remplit la brèche vue de loin (le λ brûle dans le
    // noir), puis s'efface à l'approche pour laisser la vraie lumière.
    if (skyCardRef.current) {
      const distance = Math.abs(camera.position.z - FABLE_PORTAL_Z);
      skyCardRef.current.opacity = Math.min(1, Math.max(0, (distance - 5) / 9)) * 0.92;
    }
  });

  return (
    <group>
      {/*
        Le jour entre par la brèche et emporte sa forme avec lui : le
        projecteur est masqué par le contour réel du percement, si bien que
        la tache de lumière au sol est dessinée par la roche elle-même.
      */}
      <spotLight
        ref={spotRef}
        position={[
          0.5 + FABLE_SUN_DIR.x * 30,
          floorY + 7 + FABLE_SUN_DIR.y * 30,
          FABLE_PORTAL_Z + FABLE_SUN_DIR.z * 30,
        ]}
        color="#ffd39a"
        intensity={2600}
        distance={78}
        angle={0.34}
        penumbra={0.6}
        decay={1.55}
        map={gobo}
      />
      <object3D ref={targetRef} position={[fablePathX(-22), floorY - 2.6, -24]} />

      {/* Nappe d'appoint : le sol juste devant la brèche reste lisible. */}
      <spotLight
        position={[0.5, floorY + 8.5, FABLE_PORTAL_Z - 1]}
        color="#ffcf94"
        intensity={90}
        distance={26}
        angle={0.5}
        penumbra={0.9}
        decay={1.7}
      />

      {/* Rais volumétriques feints, à l'échelle du nouveau percement. */}
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          position={[
            0.2 + (i - 1.5) * 1.15,
            floorY + 5.4 - i * 0.5,
            FABLE_PORTAL_Z - 4.5 - i * 2.4,
          ]}
          rotation={[0.62, 0.08 * (i - 1.5), 0]}
        >
          <planeGeometry args={[2.1 - i * 0.28, 15]} />
          <meshBasicMaterial
            color="#ffe6b8"
            transparent
            opacity={0.03}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* Carte de ciel au fond du percement — la brèche brûle vue du noir. */}
      <mesh
        position={[
          (FABLE_PORTAL_OUTLINE_BOUNDS.minX + FABLE_PORTAL_OUTLINE_BOUNDS.maxX) / 2,
          floorY + PORTAL_APEX_Y / 2,
          FABLE_PORTAL_Z + 9.6,
        ]}
      >
        <planeGeometry args={[15, PORTAL_APEX_Y + 3]} />
        <meshBasicMaterial
          ref={skyCardRef}
          color="#ffc888"
          transparent
          opacity={0.92}
          toneMapped={false}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Rebond chaud du bassin de soleil sur la face interne de la paroi. */}
      <pointLight
        position={[0.5, floorY + 1.2, FABLE_PORTAL_Z - 4.5]}
        color="#e8b070"
        intensity={9}
        distance={12}
        decay={1.8}
      />

      {/* Halo brûlé vu depuis le fond du noir. */}
      <sprite position={[0.4, floorY + 3.4, FABLE_PORTAL_Z - 1.2]} scale={[6, 6, 1]}>
        <spriteMaterial
          map={glow}
          color="#ffe2ae"
          transparent
          opacity={0.34}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>
    </group>
  );
}

/**
 * Rideaux de matière : du sable coule sans fin des arêtes hautes de la
 * brèche, pris à contre-jour. C'est ce filet qui donne l'échelle — on
 * mesure le percement à la hauteur de chute.
 */
function PortalFalls({ reducedMotion }: { reducedMotion: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 320;
  const floorY = fableGroundY(0.5, FABLE_PORTAL_Z);

  const { positions, seeds } = useMemo(() => {
    const rng = fableRng(770231);
    const positionsArray = new Float32Array(count * 3);
    const seedsArray: Array<{ x: number; z: number; top: number; speed: number; phase: number }> =
      [];

    // Les sources se répartissent le long des arêtes hautes du contour.
    const highEdges = FABLE_PORTAL_OUTLINE.filter((p) => p[1] > 4);

    for (let i = 0; i < count; i += 1) {
      const anchor = highEdges[Math.floor(rng() * highEdges.length)] ?? [0, 10];
      const x = anchor[0] + (rng() - 0.5) * 1.2;
      const top = floorY - 0.3 + anchor[1] - rng() * 1.5;
      const z = FABLE_PORTAL_Z - 1 + rng() * 10;
      seedsArray.push({ x, z, top, speed: 2.4 + rng() * 3.6, phase: rng() });
      positionsArray[i * 3] = x;
      positionsArray[i * 3 + 1] = top;
      positionsArray[i * 3 + 2] = z;
    }

    return { positions: positionsArray, seeds: seedsArray };
  }, [floorY]);

  useFrame(({ clock }) => {
    const points = pointsRef.current;
    if (!points || reducedMotion) return;

    const attr = points.geometry.attributes.position as THREE.BufferAttribute;
    const t = clock.elapsedTime;

    for (let i = 0; i < count; i += 1) {
      const s = seeds[i];
      const drop = s.top - floorY + 0.4;
      const fall = (t * s.speed + s.phase * drop) % drop;
      attr.setY(i, s.top - fall);
      // Léger éventail : le filet s'écarte en tombant.
      attr.setX(i, s.x + (fall / drop) * (s.phase - 0.5) * 0.9);
    }

    attr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#e8c9a0"
        size={0.05}
        sizeAttenuation
        transparent
        opacity={0.55}
        depthWrite={false}
      />
    </points>
  );
}

export default function FableTunnel({ reducedMotion }: { reducedMotion: boolean }) {
  const caveGeometry = useCaveGeometry();
  const portalGeometry = usePortalGeometry();
  const caveMaps = getDriftMaterialMaps("rock", 3, 2);
  const wallMaps = getDriftMaterialMaps("rock", 0.14, 0.14);

  useEffect(() => {
    return () => {
      caveGeometry.dispose();
      portalGeometry.dispose();
    };
  }, [caveGeometry, portalGeometry]);

  return (
    <group>
      <mesh geometry={caveGeometry} receiveShadow>
        <meshStandardMaterial
          map={caveMaps.map ?? undefined}
          normalMap={caveMaps.normalMap ?? undefined}
          normalScale={new THREE.Vector2(1.5, 1.5)}
          color="#7a7268"
          roughness={0.98}
          vertexColors
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh
        geometry={portalGeometry}
        position={[0, fableGroundY(0.5, FABLE_PORTAL_Z) - 0.3, FABLE_PORTAL_Z - 1]}
        receiveShadow
        castShadow
      >
        <meshStandardMaterial
          map={wallMaps.map ?? undefined}
          normalMap={wallMaps.normalMap ?? undefined}
          color="#6d6459"
          roughness={0.97}
        />
      </mesh>

      <ScatterRocks />
      <Stalactites />
      <Drips reducedMotion={reducedMotion} />
      <DustMotes reducedMotion={reducedMotion} />
      <Relay />
      <CeilingCracks />
      <PortalLight />
      <PortalFalls reducedMotion={reducedMotion} />
    </group>
  );
}
