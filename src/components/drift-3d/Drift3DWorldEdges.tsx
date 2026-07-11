"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { DRIFT_3D_FLOOR_Y } from "@/lib/drift3d";
import { getDrift3DGroundY } from "@/lib/drift3dTerrain";
import {
  DRIFT_3D_RIVER_PATH,
  drift3dRiverHalfWidth,
} from "@/lib/drift3dRivers";

/**
 * DRIFT-3D-20C-FIX2 — bords du monde : continuité, matière, réalisme stylisé.
 *
 * Approche : plutôt que des blocs posés, des **crêtes low-poly continues** qui
 * montent depuis la bordure du plan vers l'extérieur (jamais dans la zone
 * jouable → le véhicule ne peut ni disparaître dedans ni passer dessous), une
 * **jupe de sol** qui prolonge le terrain et cache la coupure du plan, un
 * **océan plat animé** (rivage + écume, sans barres flottantes), et un
 * **fleuve continu** avec berges, tracé partagé avec le scatter.
 *
 * Cardinal : nord = −z (fond), sud = +z (proche), est = +x, ouest = −x.
 * Monde jouable : plan 224 × 144 (x ±112, z ±72), bounds x ±108.8 / z ±72.
 */

const PLANE_HALF_X = 112;
const PLANE_HALF_Z = 72;
const FAR = 300;

function rnoise(seed: number, i: number) {
  const v = Math.sin(seed * 57.31 + i * 12.9898) * 43758.5453;

  return v - Math.floor(v);
}

// ─── Générateur de crête ──────────────────────────────────────────────────
type RidgeConfig = {
  axis: "x" | "z"; // direction que suit la crête
  fixed: number; // coordonnée perpendiculaire de la base (au bord du monde)
  outward: 1 | -1; // sens vers l'extérieur du monde
  from: number;
  to: number;
  segments: number;
  depth: number; // recul horizontal du sommet
  depthVar: number;
  peakBase: number;
  peakVar: number;
  peaks: number; // nombre de gros pics
  seed: number;
};

/**
 * Bande pliée : ligne de base au sol le long du bord + crête dentelée reculée
 * vers l'extérieur. Vue de la caméra oblique, la pente fait face au monde et
 * la crête irrégulière lit comme un vrai relief (montagne / falaise / colline).
 */
function buildRidgeGeometry(c: RidgeConfig): THREE.BufferGeometry {
  const positions: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= c.segments; i += 1) {
    const t = i / c.segments;
    const along = c.from + (c.to - c.from) * t;
    const big = 0.5 + 0.5 * Math.sin(t * Math.PI * 2 * c.peaks + c.seed);
    const jitter = rnoise(c.seed, i);
    const crestH = c.peakBase + c.peakVar * (0.65 * big + 0.35 * jitter);
    const off = c.depth + c.depthVar * (rnoise(c.seed + 3, i) - 0.5);
    // léger fondu aux extrémités pour éviter un mur qui s'arrête net
    const ends = Math.min(1, Math.min(t, 1 - t) * 6);
    const h = crestH * (0.3 + 0.7 * ends);

    let ix: number;
    let iz: number;
    let cx: number;
    let cz: number;
    if (c.axis === "z") {
      ix = c.fixed;
      iz = along;
      cx = c.fixed + c.outward * off;
      cz = along;
    } else {
      ix = along;
      iz = c.fixed;
      cx = along;
      cz = c.fixed + c.outward * off;
    }

    positions.push(ix, DRIFT_3D_FLOOR_Y - 0.4, iz);
    positions.push(cx, DRIFT_3D_FLOOR_Y + h, cz);

    if (i < c.segments) {
      const a = i * 2;
      indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();

  return geo;
}

function Ridge({
  config,
  color,
  roughness = 0.98,
}: {
  config: RidgeConfig;
  color: string;
  roughness?: number;
}) {
  const geometry = useMemo(() => buildRidgeGeometry(config), [config]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry} aria-hidden="true">
      <meshStandardMaterial
        color={color}
        roughness={roughness}
        side={THREE.DoubleSide}
        flatShading
      />
    </mesh>
  );
}

// ─── Jupe de sol : prolonge le terrain, cache la coupure du plan ───────────
function GroundApron() {
  return (
    <group aria-hidden="true">
      {/* ouest */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[-PLANE_HALF_X - (FAR - PLANE_HALF_X) / 2, DRIFT_3D_FLOOR_Y - 0.06, 0]}
      >
        <planeGeometry args={[FAR - PLANE_HALF_X, 2 * FAR]} />
        <meshStandardMaterial color="#655f4c" roughness={0.99} />
      </mesh>
      {/* est */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[PLANE_HALF_X + (FAR - PLANE_HALF_X) / 2, DRIFT_3D_FLOOR_Y - 0.06, 0]}
      >
        <planeGeometry args={[FAR - PLANE_HALF_X, 2 * FAR]} />
        <meshStandardMaterial color="#63603f" roughness={0.99} />
      </mesh>
      {/* sud */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, DRIFT_3D_FLOOR_Y - 0.05, PLANE_HALF_Z + (FAR - PLANE_HALF_Z) / 2]}
      >
        <planeGeometry args={[2 * PLANE_HALF_X, FAR - PLANE_HALF_Z]} />
        <meshStandardMaterial color="#6c6c49" roughness={0.99} />
      </mesh>
    </group>
  );
}

// ─── Océan nord vivant (plat, sans barres flottantes) ──────────────────────
function NorthOcean() {
  const foamRef = useRef<THREE.Group>(null);
  const shoreRef = useRef<THREE.Mesh>(null);
  const waterY = DRIFT_3D_FLOOR_Y - 0.35;

  const foam = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        x: -20 + i * 15 + (rnoise(9, i) - 0.5) * 14,
        z: -PLANE_HALF_Z - 4 - rnoise(11, i) * 10,
        r: 2.5 + rnoise(13, i) * 4,
        phase: rnoise(17, i) * Math.PI * 2,
      })),
    []
  );
  const streaks = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        x: -30 + i * 20 + (rnoise(21, i) - 0.5) * 20,
        z: -PLANE_HALF_Z - 14 - i * 9,
        w: 40 + rnoise(23, i) * 40,
        phase: rnoise(27, i) * Math.PI * 2,
      })),
    []
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const foamGroup = foamRef.current;
    if (foamGroup) {
      foamGroup.children.forEach((child, i) => {
        const material = (child as THREE.Mesh)
          .material as THREE.MeshStandardMaterial;
        material.opacity = 0.22 + 0.24 * (0.5 + 0.5 * Math.sin(t * 1.4 + foam[i].phase));
      });
    }
    if (shoreRef.current) {
      const material = shoreRef.current.material as THREE.MeshStandardMaterial;
      material.opacity = 0.42 + 0.16 * Math.sin(t * 1.1);
    }
  });

  return (
    <group aria-hidden="true">
      {/* eau profonde */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[10, waterY - 0.25, -200]}>
        <planeGeometry args={[2 * FAR, 260]} />
        <meshStandardMaterial color="#122430" roughness={0.38} metalness={0.16} />
      </mesh>
      {/* haut-fond près du rivage : plus vert et plus brillant */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[10, waterY - 0.05, -PLANE_HALF_Z - 26]}
      >
        <planeGeometry args={[2 * FAR, 52]} />
        <meshStandardMaterial color="#255059" roughness={0.24} metalness={0.22} />
      </mesh>
      {/* stries d'écume plates (crêtes de vagues), pas de barres */}
      <group>
        {streaks.map((s, i) => (
          <mesh
            key={`streak-${i}`}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[s.x, waterY + 0.02, s.z]}
          >
            <planeGeometry args={[s.w, 1.1]} />
            <meshStandardMaterial
              color="#5c8088"
              roughness={0.6}
              transparent
              opacity={0.5}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>
      {/* liseré d'écume de rivage animé */}
      <mesh
        ref={shoreRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[10, waterY + 0.06, -PLANE_HALF_Z - 1.5]}
      >
        <planeGeometry args={[2 * PLANE_HALF_X + 40, 4.5]} />
        <meshStandardMaterial
          color="#c2d3ce"
          roughness={0.9}
          transparent
          opacity={0.5}
          depthWrite={false}
        />
      </mesh>
      {/* amas d'écume animés */}
      <group ref={foamRef}>
        {foam.map((f, i) => (
          <mesh
            key={`foam-${i}`}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[f.x, waterY + 0.08, f.z]}
          >
            <circleGeometry args={[f.r, 12]} />
            <meshStandardMaterial
              color="#d3e0db"
              roughness={0.92}
              transparent
              opacity={0.35}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// ─── Rivière continue : berges + eau, largeur variable, tracé partagé ──────
function buildRiverGeometry(widthScale: number, yLift: number) {
  const positions: number[] = [];
  const indices: number[] = [];
  const count = DRIFT_3D_RIVER_PATH.length;

  for (let i = 0; i < count; i += 1) {
    const [x, z] = DRIFT_3D_RIVER_PATH[i];
    const prev = DRIFT_3D_RIVER_PATH[Math.max(0, i - 1)];
    const next = DRIFT_3D_RIVER_PATH[Math.min(count - 1, i + 1)];
    const tx = next[0] - prev[0];
    const tz = next[1] - prev[1];
    const length = Math.hypot(tx, tz) || 1;
    const nx = -tz / length;
    const nz = tx / length;
    const half = drift3dRiverHalfWidth(i / (count - 1)) * widthScale;
    const lx = x + nx * half;
    const lz = z + nz * half;
    const rx = x - nx * half;
    const rz = z - nz * half;
    const sampleY = (sx: number, sz: number) =>
      sz > PLANE_HALF_Z || sz < -PLANE_HALF_Z
        ? DRIFT_3D_FLOOR_Y + yLift
        : getDrift3DGroundY(sx, sz) + yLift;
    positions.push(lx, sampleY(lx, lz), lz, rx, sampleY(rx, rz), rz);

    if (i < count - 1) {
      const a = i * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();

  return geo;
}

function River() {
  const bankGeometry = useMemo(() => buildRiverGeometry(1.75, 0.04), []);
  const waterGeometry = useMemo(() => buildRiverGeometry(1, 0.08), []);

  useEffect(
    () => () => {
      bankGeometry.dispose();
      waterGeometry.dispose();
    },
    [bankGeometry, waterGeometry]
  );

  return (
    <group aria-hidden="true">
      <mesh geometry={bankGeometry} renderOrder={1}>
        <meshStandardMaterial
          color="#7a6f4d"
          roughness={0.96}
          transparent
          opacity={0.92}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh geometry={waterGeometry} renderOrder={2}>
        <meshStandardMaterial
          color="#345a63"
          roughness={0.28}
          metalness={0.12}
          transparent
          opacity={0.92}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// ─── Reliefs de bord (crêtes) ──────────────────────────────────────────────
function WorldRanges() {
  return (
    <group aria-hidden="true">
      {/* Falaises ouest : hautes, escarpées, rocheuses, deux couches */}
      <Ridge
        config={{
          axis: "z",
          fixed: -PLANE_HALF_X,
          outward: -1,
          from: -80,
          to: 82,
          segments: 34,
          depth: 20,
          depthVar: 10,
          peakBase: 16,
          peakVar: 20,
          peaks: 6,
          seed: 4,
        }}
        color="#5a5348"
      />
      <Ridge
        config={{
          axis: "z",
          fixed: -PLANE_HALF_X - 18,
          outward: -1,
          from: -90,
          to: 90,
          segments: 30,
          depth: 34,
          depthVar: 16,
          peakBase: 30,
          peakVar: 24,
          peaks: 4,
          seed: 12,
        }}
        color="#4a4438"
      />

      {/* Collines est : basses, douces, vertes, deux couches */}
      <Ridge
        config={{
          axis: "z",
          fixed: PLANE_HALF_X,
          outward: 1,
          from: -74,
          to: 82,
          segments: 30,
          depth: 22,
          depthVar: 12,
          peakBase: 7,
          peakVar: 8,
          peaks: 7,
          seed: 21,
        }}
        color="#3f4c3f"
      />
      <Ridge
        config={{
          axis: "z",
          fixed: PLANE_HALF_X + 24,
          outward: 1,
          from: -84,
          to: 92,
          segments: 26,
          depth: 40,
          depthVar: 18,
          peakBase: 13,
          peakVar: 12,
          peaks: 5,
          seed: 33,
        }}
        color="#47544c"
      />

      {/* Chaîne côtière nord-ouest : prolonge le massif vers la mer */}
      <Ridge
        config={{
          axis: "x",
          fixed: -PLANE_HALF_Z,
          outward: -1,
          from: -102,
          to: -28,
          segments: 24,
          depth: 26,
          depthVar: 14,
          peakBase: 18,
          peakVar: 18,
          peaks: 4,
          seed: 41,
        }}
        color="#544d42"
      />

      {/* Basses ondulations lointaines au sud (prairie qui roule) */}
      <Ridge
        config={{
          axis: "x",
          fixed: PLANE_HALF_Z + 40,
          outward: 1,
          from: -120,
          to: 120,
          segments: 30,
          depth: 30,
          depthVar: 16,
          peakBase: 4,
          peakVar: 5,
          peaks: 6,
          seed: 55,
        }}
        color="#5f6042"
      />
    </group>
  );
}

export default function Drift3DWorldEdges() {
  return (
    <group aria-hidden="true">
      <GroundApron />
      <NorthOcean />
      <WorldRanges />
      <River />
    </group>
  );
}
