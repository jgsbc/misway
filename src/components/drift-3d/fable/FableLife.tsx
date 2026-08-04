"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import {
  FABLE_CITY_Z0,
  FABLE_CITY_Z1,
  FABLE_YARD_Z0,
  FABLE_YARD_Z1,
  fableDistrictAt,
  fableGroundY,
  fableRng,
  fableStreetHalfWidth,
} from "@/components/drift-3d/fable/fableWorld";
import { getFableContactShadowTexture } from "@/components/drift-3d/fable/fableTextures";

/**
 * FABLE SPIKE — la vie secondaire. Des silhouettes qui marchent, un groupe
 * immobile qui fixe les câbles, deux qui discutent, un balayeur, un pousseur
 * de charrette ; des fourgons lents ; des oiseaux qui tournent autour du
 * point d'amarrage.
 */

type FigureKind = "walker" | "starer" | "talker" | "sweeper" | "pusher";

type Figure = {
  kind: FigureKind;
  x: number;
  z: number;
  side: number;
  scale: number;
  /** Corpulence : multiplicateur x/z de la silhouette. */
  girth: number;
  speed: number;
  phase: number;
  range: number;
  yaw: number;
  color: THREE.Color;
};

const CLOTHES = [
  "#4a4238",
  "#5a5a52",
  "#6b5544",
  "#3c4148",
  "#705f48",
  "#544a56",
  "#61554a",
  "#494f42",
  "#7a6a52",
  "#3f3a34",
];

function triWave(t: number) {
  const p = t % 2;

  return p < 1 ? p : 2 - p;
}

function useFigureGeometry() {
  return useMemo(() => {
    // Silhouette v2 : deux jambes, bassin, torse épaulé, bras le long du
    // corps, cou, tête plus petite — les proportions font l'humain.
    const parts: THREE.BufferGeometry[] = [];
    const legL = new THREE.BoxGeometry(0.075, 0.44, 0.11);
    legL.translate(-0.055, 0.22, 0);
    const legR = new THREE.BoxGeometry(0.075, 0.44, 0.11);
    legR.translate(0.055, 0.22, 0);
    const hips = new THREE.BoxGeometry(0.21, 0.1, 0.13);
    hips.translate(0, 0.47, 0);
    const torso = new THREE.BoxGeometry(0.24, 0.34, 0.14);
    torso.translate(0, 0.685, 0);
    const shoulders = new THREE.BoxGeometry(0.3, 0.07, 0.13);
    shoulders.translate(0, 0.845, 0);
    const armL = new THREE.BoxGeometry(0.055, 0.36, 0.08);
    armL.rotateZ(0.06);
    armL.translate(-0.175, 0.66, -0.01);
    const armR = new THREE.BoxGeometry(0.055, 0.36, 0.08);
    armR.rotateZ(-0.06);
    armR.translate(0.175, 0.66, -0.01);
    const neck = new THREE.BoxGeometry(0.055, 0.06, 0.055);
    neck.translate(0, 0.9, 0);
    const head = new THREE.SphereGeometry(0.072, 8, 6);
    head.scale(1, 1.12, 1);
    head.translate(0, 0.985, 0.01);
    parts.push(legL, legR, hips, torso, shoulders, armL, armR, neck, head);
    const merged = mergeGeometries(parts)!;

    for (const part of parts) part.dispose();

    return merged;
  }, []);
}

function useSitterGeometry() {
  return useMemo(() => {
    const parts: THREE.BufferGeometry[] = [];
    const thighs = new THREE.BoxGeometry(0.2, 0.1, 0.3);
    thighs.translate(0, 0.3, 0.1);
    const shins = new THREE.BoxGeometry(0.18, 0.28, 0.1);
    shins.translate(0, 0.14, 0.22);
    const torso = new THREE.BoxGeometry(0.24, 0.36, 0.14);
    torso.rotateX(-0.18);
    torso.translate(0, 0.5, -0.02);
    const head = new THREE.SphereGeometry(0.07, 8, 6);
    head.translate(0, 0.74, 0.03);
    parts.push(thighs, shins, torso, head);
    const merged = mergeGeometries(parts)!;

    for (const part of parts) part.dispose();

    return merged;
  }, []);
}

function buildFigures(): Figure[] {
  const rng = fableRng(19770);
  const figures: Figure[] = [];

  // Marcheurs des trottoirs — la densité suit le quartier, pas une moyenne.
  for (let i = 0; i < 150; i += 1) {
    const z = FABLE_CITY_Z0 + 5 + rng() * (FABLE_CITY_Z1 - FABLE_CITY_Z0 - 12);

    // Rejet proportionnel : le canyon avale la foule, le port la relâche.
    if (rng() > fableDistrictAt(z).crowd / 3.4) continue;

    const side = rng() < 0.5 ? -1 : 1;
    const inYard = z > FABLE_YARD_Z0 && z < FABLE_YARD_Z1;
    const lateral = inYard
      ? 5 + rng() * 13
      : fableStreetHalfWidth(z) + 0.6 + rng() * 1.1;
    figures.push({
      kind: "walker",
      x: side * lateral,
      z,
      side,
      scale: 0.68 + rng() * 0.14,
      girth: 0.82 + rng() * 0.38,
      speed: 0.28 + rng() * 0.35,
      phase: rng() * 20,
      range: 4 + rng() * 9,
      yaw: 0,
      color: new THREE.Color(CLOTHES[Math.floor(rng() * CLOTHES.length)]),
    });
  }

  // Le cercle des regardeurs — immobiles, tête levée vers les câbles.
  for (let i = 0; i < 9; i += 1) {
    const a = (i / 9) * Math.PI * 2 + rng() * 0.3;
    const r = 4.6 + rng() * 2.2;
    figures.push({
      kind: "starer",
      x: Math.sin(a) * r,
      z: 102 + Math.cos(a) * r,
      side: 1,
      scale: 0.7 + rng() * 0.12,
      girth: 0.85 + rng() * 0.3,
      speed: 0,
      phase: rng() * 10,
      range: 0,
      yaw: Math.atan2(-Math.sin(a), -Math.cos(a)),
      color: new THREE.Color(CLOTHES[Math.floor(rng() * CLOTHES.length)]),
    });
  }

  // Deux paires en pleine discussion.
  for (const spot of [
    { x: 5.1, z: 58.5 },
    { x: -5.4, z: 122.5 },
  ]) {
    for (const offset of [-0.26, 0.26]) {
      figures.push({
        kind: "talker",
        x: spot.x + offset,
        z: spot.z + (offset > 0 ? 0.1 : -0.1),
        side: offset > 0 ? 1 : -1,
        scale: 0.7 + rng() * 0.1,
        girth: 0.85 + rng() * 0.3,
        speed: 0,
        phase: rng() * 10,
        range: 0,
        yaw: offset > 0 ? -Math.PI / 2 - 0.2 : Math.PI / 2 + 0.15,
        color: new THREE.Color(CLOTHES[Math.floor(rng() * CLOTHES.length)]),
      });
    }
  }

  // Le balayeur du goulet.
  figures.push({
    kind: "sweeper",
    x: -3.4,
    z: 80.5,
    side: -1,
    scale: 0.74,
    girth: 1.05,
    speed: 0,
    phase: 2,
    range: 0,
    yaw: 0.7,
    color: new THREE.Color("#5f584c"),
  });

  // Le pousseur de charrette (la charrette est un mesh séparé).
  figures.push({
    kind: "pusher",
    x: 4.9,
    z: 128,
    side: 1,
    scale: 0.73,
    girth: 0.95,
    speed: 0.16,
    phase: 0,
    range: 9,
    yaw: 0,
    color: new THREE.Color("#6b5544"),
  });

  return figures;
}

function FableCrowd({ reducedMotion }: { reducedMotion: boolean }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const cartRef = useRef<THREE.Group>(null);
  const geometry = useFigureGeometry();
  const figures = useMemo(() => buildFigures(), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    figures.forEach((figure, i) => mesh.setColorAt(i, figure.color));

    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [figures]);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const t = reducedMotion ? 0 : clock.elapsedTime;

    figures.forEach((figure, i) => {
      const { x } = figure;
      let { z, yaw } = figure;
      let bob = 0;
      let lean = 0;

      if (figure.kind === "walker" || figure.kind === "pusher") {
        const w = triWave(t * figure.speed + figure.phase);
        const prev = triWave(t * figure.speed + figure.phase - 0.01);
        z = figure.z - figure.range / 2 + w * figure.range;
        yaw = w >= prev ? 0 : Math.PI;
        bob = Math.abs(Math.sin(t * 7 * (figure.speed + 0.5) + figure.phase)) * 0.028;
        lean = 0.06;
      } else if (figure.kind === "starer") {
        // Immobile, tête levée : léger balancement, penché en arrière.
        bob = Math.sin(t * 0.6 + figure.phase) * 0.008;
        lean = -0.16;
      } else if (figure.kind === "talker") {
        bob = Math.max(0, Math.sin(t * 2.4 + figure.phase)) * 0.02;
      } else if (figure.kind === "sweeper") {
        yaw = figure.yaw + Math.sin(t * 1.7) * 0.5;
        bob = Math.abs(Math.sin(t * 1.7)) * 0.012;
        lean = 0.22;
      }

      dummy.position.set(x, fableGroundY(x, z) + 0.1 + bob, z);
      dummy.rotation.set(lean, yaw, 0);
      dummy.scale.set(
        figure.scale * figure.girth,
        figure.scale,
        figure.scale * figure.girth
      );
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      if (figure.kind === "pusher" && cartRef.current) {
        const forward = yaw === 0 ? 1 : -1;
        cartRef.current.position.set(x, fableGroundY(x, z) + 0.1, z + forward * 0.62);
        cartRef.current.rotation.y = yaw;
      }
    });

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh
        ref={meshRef}
        args={[geometry, undefined, figures.length]}
        frustumCulled={false}
        castShadow
      >
        <meshStandardMaterial roughness={0.96} />
      </instancedMesh>
      {/* La charrette du pousseur. */}
      <group ref={cartRef}>
        <mesh position={[0, 0.34, 0]} castShadow>
          <boxGeometry args={[0.5, 0.3, 0.72]} />
          <meshStandardMaterial color="#7a6448" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[0.42, 0.18, 0.5]} />
          <meshStandardMaterial color="#8f815e" roughness={0.95} />
        </mesh>
        {[-0.26, 0.26].map((wx) => (
          <mesh key={wx} position={[wx, 0.16, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.16, 0.16, 0.05, 10]} />
            <meshStandardMaterial color="#221f1c" roughness={0.9} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/** Assis sur les caisses, au bord du soir. */
function FableSitters() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const geometry = useSitterGeometry();

  const sitters = useMemo(() => {
    const rng = fableRng(60443);

    return [
      { x: 5.6, z: 50.5, yaw: -1.9 },
      { x: -5.8, z: 87.5, yaw: 1.4 },
      { x: 6.1, z: 112.5, yaw: -1.6 },
      { x: -5.5, z: 141, yaw: 1.8 },
      { x: 8.2, z: 97.5, yaw: -2.4 },
    ].map((s) => ({
      ...s,
      scale: 0.68 + rng() * 0.1,
      phase: rng() * 10,
      color: new THREE.Color(CLOTHES[Math.floor(rng() * CLOTHES.length)]),
    }));
  }, []);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const dummy = new THREE.Object3D();

    sitters.forEach((sitter, i) => {
      // Un cageot sous chacun — posé, pas flottant.
      dummy.position.set(sitter.x, fableGroundY(sitter.x, sitter.z) + 0.32, sitter.z);
      dummy.rotation.set(0, sitter.yaw, 0);
      dummy.scale.setScalar(sitter.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, sitter.color);
    });
    mesh.instanceMatrix.needsUpdate = true;

    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [sitters]);

  return (
    <group>
      <instancedMesh
        ref={meshRef}
        args={[geometry, undefined, sitters.length]}
        frustumCulled={false}
        castShadow
      >
        <meshStandardMaterial roughness={0.96} />
      </instancedMesh>
      {sitters.map((sitter, i) => (
        <mesh
          key={i}
          position={[sitter.x, fableGroundY(sitter.x, sitter.z) + 0.16, sitter.z]}
          rotation={[0, sitter.yaw, 0]}
          castShadow
        >
          <boxGeometry args={[0.34, 0.3, 0.3]} />
          <meshStandardMaterial color="#6a583f" roughness={0.92} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * La figure qui pointe — seule, bras tendu vers le point où les câbles
 * disparaissent. Personne ne la regarde, elle.
 */
function FablePointingFigure({ reducedMotion }: { reducedMotion: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const x = 4.4;
  const z = 96.5;

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group || reducedMotion) return;

    const t = clock.elapsedTime;
    group.rotation.x = -0.06 + Math.sin(t * 0.4 + 2) * 0.012;
  });

  const yaw = Math.atan2(-x, 102 - z);

  return (
    <group
      ref={groupRef}
      position={[x, fableGroundY(x, z) + 0.1, z]}
      rotation={[-0.06, yaw, 0]}
      scale={0.76}
    >
      {[
        { args: [0.075, 0.44, 0.11] as const, p: [-0.055, 0.22, 0] as const },
        { args: [0.075, 0.44, 0.11] as const, p: [0.055, 0.22, 0] as const },
        { args: [0.22, 0.1, 0.13] as const, p: [0, 0.47, 0] as const },
        { args: [0.24, 0.34, 0.14] as const, p: [0, 0.685, 0] as const },
        { args: [0.3, 0.07, 0.13] as const, p: [0, 0.845, 0] as const },
        { args: [0.055, 0.36, 0.08] as const, p: [-0.175, 0.66, -0.01] as const },
      ].map((part, i) => (
        <mesh key={i} position={[...part.p]} castShadow>
          <boxGeometry args={[...part.args]} />
          <meshStandardMaterial color="#41403c" roughness={0.96} />
        </mesh>
      ))}
      {/* Bras droit levé, tendu vers le ciel. */}
      <mesh position={[0.2, 0.94, 0.08]} rotation={[0.7, 0, -0.5]} castShadow>
        <boxGeometry args={[0.055, 0.4, 0.08]} />
        <meshStandardMaterial color="#41403c" roughness={0.96} />
      </mesh>
      <mesh position={[0, 0.985, 0.01]} castShadow>
        <sphereGeometry args={[0.072, 8, 6]} />
        <meshStandardMaterial color="#41403c" roughness={0.96} />
      </mesh>
    </group>
  );
}

/* ─── FOOLFOULE — les panneaux qui vous suivent ───────────────────────── */

/**
 * Anomalie canonique du canyon : les panneaux publicitaires pivotent pour
 * rester face au flux. Jamais d'un coup — ils rattrapent, avec un retard
 * juste assez long pour qu'on doute d'avoir vu bouger.
 *
 * Le compteur qui grimpe sur chacun ne compte rien.
 */
function FoolfouleAdPanels({ reducedMotion }: { reducedMotion: boolean }) {
  const pivotRefs = useRef<Array<THREE.Group | null>>([]);
  const counterRefs = useRef<Array<THREE.MeshBasicMaterial | null>>([]);
  const yawRef = useRef<number[]>([]);

  const panels = useMemo(() => {
    const rng = fableRng(70450);

    return Array.from({ length: 9 }, (_, i) => {
      const z = 53 + i * 3.4 + rng() * 1.2;
      const side = i % 2 === 0 ? 1 : -1;

      return {
        z,
        side,
        x: side * (fableStreetHalfWidth(z) + 0.75),
        y: 3.1 + rng() * 3.4,
        w: 1.5 + rng() * 0.5,
        h: 2.1 + rng() * 0.7,
        tint: ["#c8d8e6", "#e6c9a8", "#d6bde0", "#bcd8c8"][i % 4],
        lag: 0.5 + rng() * 1.5,
      };
    });
  }, []);

  useFrame(({ camera, clock }, delta) => {
    if (yawRef.current.length !== panels.length) {
      yawRef.current = panels.map(() => 0);
    }

    panels.forEach((panel, i) => {
      const pivot = pivotRefs.current[i];
      if (!pivot) return;

      if (!reducedMotion) {
        // Chacun cherche l'observateur, à sa propre lenteur.
        const target = Math.atan2(
          camera.position.x - panel.x,
          camera.position.z - panel.z
        );
        const current = yawRef.current[i];
        let diff = target - current;
        diff = Math.atan2(Math.sin(diff), Math.cos(diff));
        yawRef.current[i] = current + diff * Math.min(1, delta / panel.lag);
      }

      pivot.rotation.y = yawRef.current[i];

      const material = counterRefs.current[i];

      if (material) {
        // Le compteur monte, sans jamais rien totaliser.
        const v = (clock.elapsedTime * (0.7 + i * 0.13)) % 1;
        material.opacity = 0.55 + v * 0.45;
      }
    });
  });

  return (
    <group>
      {panels.map((panel, i) => (
        <group key={i} position={[panel.x, fableGroundY(panel.x, panel.z), panel.z]}>
          <mesh position={[0, panel.y / 2, 0]} castShadow>
            <cylinderGeometry args={[0.055, 0.075, panel.y, 7]} />
            <meshStandardMaterial color="#2a2c2e" roughness={0.75} metalness={0.4} />
          </mesh>
          <group
            ref={(g) => {
              pivotRefs.current[i] = g;
            }}
            position={[0, panel.y + panel.h / 2, 0]}
          >
            <mesh castShadow>
              <boxGeometry args={[panel.w, panel.h, 0.1]} />
              <meshStandardMaterial color="#1c1d1f" roughness={0.7} />
            </mesh>
            <mesh position={[0, 0, 0.055]}>
              <planeGeometry args={[panel.w - 0.12, panel.h - 0.12]} />
              <meshBasicMaterial
                ref={(m) => {
                  counterRefs.current[i] = m;
                }}
                color={panel.tint}
                toneMapped={false}
                transparent
                opacity={0.8}
              />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  );
}

/* ─── Trafic ───────────────────────────────────────────────────────────── */

type TrafficUnit = {
  lane: number;
  dir: 1 | -1;
  speed: number;
  offset: number;
  kind: "van" | "flatbed" | "trike";
  tint: string;
};

const TRAFFIC: TrafficUnit[] = [
  { lane: 1.75, dir: 1, speed: 2.4, offset: 0, kind: "van", tint: "#7d7466" },
  { lane: 1.65, dir: 1, speed: 2.1, offset: 46, kind: "flatbed", tint: "#5d6668" },
  { lane: 1.85, dir: 1, speed: 2.6, offset: 78, kind: "trike", tint: "#8a5f3e" },
  { lane: -1.7, dir: -1, speed: 2.3, offset: 22, kind: "van", tint: "#6b6d75" },
  { lane: -1.8, dir: -1, speed: 2.0, offset: 60, kind: "trike", tint: "#77694f" },
  { lane: -1.65, dir: -1, speed: 2.7, offset: 92, kind: "flatbed", tint: "#70645a" },
];

function TrafficBody({ kind, tint }: { kind: TrafficUnit["kind"]; tint: string }) {
  const shadow = (
    <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={2}>
      <planeGeometry args={[kind === "trike" ? 0.9 : 1.1, kind === "trike" ? 1.3 : 2.1]} />
      <meshBasicMaterial
        map={getFableContactShadowTexture()}
        transparent
        opacity={0.38}
        depthWrite={false}
      />
    </mesh>
  );

  if (kind === "trike") {
    return (
      <group>
        {shadow}
        <mesh position={[0, 0.3, 0.1]} castShadow>
          <boxGeometry args={[0.5, 0.42, 0.7]} />
          <meshStandardMaterial color={tint} roughness={0.75} />
        </mesh>
        <mesh position={[0, 0.42, -0.42]} castShadow>
          <boxGeometry args={[0.56, 0.34, 0.5]} />
          <meshStandardMaterial color="#4a443c" roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.28, 0.5]}>
          <cylinderGeometry args={[0.11, 0.11, 0.06, 8]} />
          <meshStandardMaterial color="#1a1b1d" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.34, 0.46]}>
          <planeGeometry args={[0.1, 0.08]} />
          <meshBasicMaterial color="#ffe2a8" toneMapped={false} />
        </mesh>
      </group>
    );
  }

  const length = kind === "van" ? 1.75 : 1.95;

  return (
    <group>
      {shadow}
      {/* Galerie de toit encombrée — plus personne ne roule à vide. */}
      {kind === "van" ? (
        <group position={[0, 0.78, -0.1]}>
          <mesh castShadow>
            <boxGeometry args={[0.6, 0.05, 0.9]} />
            <meshStandardMaterial color="#3a3833" roughness={0.8} />
          </mesh>
          <mesh position={[0.1, 0.12, -0.15]} rotation={[0, 0.3, 0]} castShadow>
            <boxGeometry args={[0.3, 0.2, 0.4]} />
            <meshStandardMaterial color="#68583e" roughness={0.95} />
          </mesh>
        </group>
      ) : null}
      <mesh position={[0, 0.42, -0.15]} castShadow>
        <boxGeometry args={[0.72, kind === "van" ? 0.62 : 0.3, length * 0.62]} />
        <meshStandardMaterial color={tint} roughness={0.7} metalness={0.12} />
      </mesh>
      <mesh position={[0, 0.4, length * 0.31]} castShadow>
        <boxGeometry args={[0.7, 0.5, length * 0.3]} />
        <meshStandardMaterial color={tint} roughness={0.66} metalness={0.15} />
      </mesh>
      <mesh position={[0, 0.5, length * 0.46]}>
        <planeGeometry args={[0.56, 0.2]} />
        <meshStandardMaterial color="#1f2830" roughness={0.2} metalness={0.4} />
      </mesh>
      {kind === "flatbed" ? (
        <mesh position={[0.05, 0.42, -0.3]} rotation={[0, 0.2, 0]} castShadow>
          <boxGeometry args={[0.44, 0.4, 0.5]} />
          <meshStandardMaterial color="#7a6a4e" roughness={0.95} />
        </mesh>
      ) : null}
      {[-0.24, 0.24].map((x, i) => (
        <mesh key={i} position={[x, 0.36, length * 0.5 - 0.06]}>
          <planeGeometry args={[0.09, 0.07]} />
          <meshBasicMaterial color="#ffe2a8" toneMapped={false} />
        </mesh>
      ))}
      {[-0.24, 0.24].map((x, i) => (
        <mesh key={i} position={[x, 0.4, -length * 0.47]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[0.08, 0.06]} />
          <meshBasicMaterial color="#e04a35" toneMapped={false} />
        </mesh>
      ))}
      {[[-0.32, 0.42], [0.32, 0.42], [-0.32, -0.5], [0.32, -0.5]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.16, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.15, 0.15, 0.08, 10]} />
          <meshStandardMaterial color="#17181a" roughness={0.92} />
        </mesh>
      ))}
    </group>
  );
}

function FableTraffic({ reducedMotion }: { reducedMotion: boolean }) {
  const refs = useRef<Array<THREE.Group | null>>([]);

  useFrame(({ clock }) => {
    const t = reducedMotion ? 0 : clock.elapsedTime;
    const span = FABLE_CITY_Z1 - FABLE_CITY_Z0 - 4;

    TRAFFIC.forEach((unit, i) => {
      const group = refs.current[i];
      if (!group) return;

      const progress = (t * unit.speed + unit.offset) % span;
      const z = unit.dir > 0 ? FABLE_CITY_Z0 + 2 + progress : FABLE_CITY_Z1 - 2 - progress;
      const x = unit.lane + Math.sin(z * 0.4 + i) * 0.06;
      group.position.set(x, fableGroundY(x, z) + 0.05, z);
      group.rotation.y = unit.dir > 0 ? 0 : Math.PI;
    });
  });

  return (
    <group>
      {TRAFFIC.map((unit, i) => (
        <group
          key={i}
          ref={(group) => {
            refs.current[i] = group;
          }}
        >
          <TrafficBody kind={unit.kind} tint={unit.tint} />
        </group>
      ))}
    </group>
  );
}

/* ─── Oiseaux ──────────────────────────────────────────────────────────── */

function FableBirds({ reducedMotion }: { reducedMotion: boolean }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 11;
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const birds = useMemo(() => {
    const rng = fableRng(31337);

    return Array.from({ length: count }, () => ({
      radius: 7 + rng() * 7,
      height: 24 + rng() * 9,
      speed: (0.22 + rng() * 0.2) * (rng() < 0.5 ? 1 : -1),
      phase: rng() * Math.PI * 2,
      flap: 5 + rng() * 3,
    }));
  }, []);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const t = reducedMotion ? 0 : clock.elapsedTime;

    birds.forEach((bird, i) => {
      const a = bird.phase + t * bird.speed;
      const x = Math.sin(a) * bird.radius;
      const z = 102 + Math.cos(a) * bird.radius;
      const y = bird.height + Math.sin(t * 0.7 + bird.phase) * 1.2;
      dummy.position.set(x, y, z);
      dummy.rotation.set(0, a + (bird.speed > 0 ? Math.PI / 2 : -Math.PI / 2), 0);
      const flap = 0.6 + Math.abs(Math.sin(t * bird.flap + bird.phase)) * 0.8;
      dummy.scale.set(flap, 0.5, 0.9);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh frustumCulled={false} ref={meshRef} args={[undefined, undefined, count]}>
      <coneGeometry args={[0.22, 0.1, 3]} />
      <meshBasicMaterial color="#1f2226" />
    </instancedMesh>
  );
}

export default function FableLife({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <group>
      <FableCrowd reducedMotion={reducedMotion} />
      <FoolfouleAdPanels reducedMotion={reducedMotion} />
      <FableSitters />
      <FablePointingFigure reducedMotion={reducedMotion} />
      <FableTraffic reducedMotion={reducedMotion} />
      <FableBirds reducedMotion={reducedMotion} />
    </group>
  );
}
