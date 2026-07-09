"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { DRIFT_3D_FLOOR_Y } from "@/lib/drift3d";
import { getDrift3DGroundY } from "@/lib/drift3dTerrain";

/**
 * DRIFT-3D-20C — profondeur des bords du monde.
 *
 * Couches d'environnement larges et statiques, placées HORS des movement
 * bounds (x ±108.8, z ±72), non-collidantes : océan au nord, falaises à
 * l'ouest, collines à l'est, plaines + rivière au sud. Tout utilise le fog
 * de scène (activé) pour se fondre dans l'horizon teinté par zone — l'idée
 * est la continuité géographique, pas l'inventaire d'objets.
 *
 * Convention cardinale (caméra oblique en +z regardant -z) :
 *   nord = -z (fond) · sud = +z (proche) · est = +x (droite) · ouest = -x.
 */

// Le monde jouable : plan 224 × 144 (x ±112, z ±72). Bord sud utilisé par la
// rivière pour aplatir son ruban dans les plaines hors-bounds.
const SOUTH_EDGE_Z = 72;

function seeded(n: number) {
  const value = Math.sin(n * 127.1 + 311.7) * 43758.5453;

  return value - Math.floor(value);
}

/** Océan nord : plan d'eau sombre + bandes de vagues éparses (non-réfléchissant). */
function NorthOcean() {
  const waves = useMemo(
    () => [-84, -98, -114, -134, -160, -194, -236],
    []
  );

  return (
    <group aria-hidden="true">
      {/* nappe d'eau large, tuckée sous la lèvre de terrain */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[6, DRIFT_3D_FLOOR_Y - 0.5, -176]}
      >
        <planeGeometry args={[360, 220]} />
        <meshStandardMaterial color="#182a33" roughness={0.5} metalness={0.05} />
      </mesh>

      {/* bandes de houle : longues lattes basses, alternance de ton */}
      {waves.map((z, index) => (
        <mesh
          key={`wave-${index}`}
          position={[6 + (seeded(index) - 0.5) * 30, DRIFT_3D_FLOOR_Y - 0.42, z]}
        >
          <boxGeometry args={[300 - index * 10, 0.12, 1.4 + index * 0.25]} />
          <meshStandardMaterial
            color={index % 2 === 0 ? "#26424f" : "#1f3743"}
            roughness={0.55}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Falaises ouest : masses rocheuses larges, mur accidenté, hors bounds. */
function WestCliffs() {
  const blocks = useMemo(() => {
    const list: Array<{
      x: number;
      z: number;
      w: number;
      h: number;
      d: number;
      rot: number;
      tone: string;
    }> = [];

    // deux rangées : front (juste hors bounds, haut) + fond (plus haut/loin).
    // Assez proches et hautes pour percer au-dessus du fog de bord.
    for (let i = 0; i < 10; i += 1) {
      const z = -88 + i * 19;
      list.push({
        x: -116 + seeded(i) * 3,
        z,
        w: 20,
        h: 20 + seeded(i + 10) * 14,
        d: 21,
        rot: (seeded(i + 3) - 0.5) * 0.4,
        tone: i % 2 === 0 ? "#5c554a" : "#655d50",
      });
      list.push({
        x: -140 - seeded(i + 5) * 14,
        z: z + 6,
        w: 30,
        h: 34 + seeded(i + 20) * 16,
        d: 32,
        rot: (seeded(i + 7) - 0.5) * 0.5,
        tone: i % 2 === 0 ? "#4c463c" : "#544c41",
      });
    }

    return list;
  }, []);

  return (
    <group aria-hidden="true">
      {blocks.map((b, index) => (
        <mesh
          key={`cliff-${index}`}
          position={[b.x, DRIFT_3D_FLOOR_Y + b.h / 2 - 1, b.z]}
          rotation={[0, b.rot, 0]}
        >
          <boxGeometry args={[b.w, b.h, b.d]} />
          <meshStandardMaterial color={b.tone} roughness={0.98} />
        </mesh>
      ))}
    </group>
  );
}

/** Collines est : silhouettes douces en couches successives, atmosphériques. */
function EastHills() {
  const hills = useMemo(() => {
    const list: Array<{
      x: number;
      z: number;
      r: number;
      tone: string;
    }> = [];
    // trois bandes qui reculent, teinte de plus en plus « brume ».
    // Front rapproché du bord est (x ~ +116) pour rester lisible.
    const layers = [
      { x: 118, r: 22, tone: "#3f4f45" },
      { x: 148, r: 26, tone: "#45534b" },
      { x: 184, r: 30, tone: "#4c5852" },
    ];

    layers.forEach((layer, li) => {
      for (let i = 0; i < 6; i += 1) {
        const z = -78 + i * 26 + seeded(li * 6 + i) * 8;
        list.push({
          x: layer.x + seeded(li * 9 + i) * 10,
          z,
          r: layer.r + seeded(li * 4 + i) * 8,
          tone: layer.tone,
        });
      }
    });

    return list;
  }, []);

  return (
    <group aria-hidden="true">
      {hills.map((h, index) => (
        <mesh
          key={`hill-${index}`}
          position={[h.x, DRIFT_3D_FLOOR_Y - h.r * 0.55, h.z]}
        >
          <sphereGeometry args={[h.r, 14, 10]} />
          <meshStandardMaterial color={h.tone} roughness={0.99} />
        </mesh>
      ))}
    </group>
  );
}

/** Plaines sud : large sol plat qui prolonge le monde vers le proche. */
function SouthPlains() {
  return (
    <group aria-hidden="true">
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, DRIFT_3D_FLOOR_Y - 0.04, 128]}
      >
        <planeGeometry args={[360, 130]} />
        <meshStandardMaterial color="#6f6f4c" roughness={0.98} />
      </mesh>
      {/* deux rises très douces pour éviter la platitude totale */}
      <mesh position={[-70, DRIFT_3D_FLOOR_Y - 6, 120]}>
        <sphereGeometry args={[22, 14, 10]} />
        <meshStandardMaterial color="#75754f" roughness={0.99} />
      </mesh>
      <mesh position={[64, DRIFT_3D_FLOOR_Y - 7, 138]}>
        <sphereGeometry args={[26, 14, 10]} />
        <meshStandardMaterial color="#6b6b48" roughness={0.99} />
      </mesh>
    </group>
  );
}

/**
 * Rivière : ruban d'eau plat, non-collidant, échantillonné à la hauteur du
 * terrain. Entre par le sud et rejoint l'océan nord près de la plage
 * d'eteeaooete, en filant par des couloirs ouverts (≥ ~8 u des centres de
 * nœuds). Purement visuel : la physique n'est pas touchée.
 */
function River() {
  const geometry = useMemo(() => {
    // couloir sud -> océan nord-est, choisi pour éviter les centres de nœuds
    const path: Array<[number, number]> = [
      [-2, 118],
      [-4, 92],
      [-8, 62],
      [-18, 44],
      [-28, 26],
      [-30, 10],
      [-28, -8],
      [-20, -24],
      [-8, -40],
      [8, -52],
      [26, -62],
      [44, -70],
      [54, -80],
    ];
    const halfWidth = 2.6;
    const positions: number[] = [];
    const indices: number[] = [];

    for (let i = 0; i < path.length; i += 1) {
      const [x, z] = path[i];
      const prev = path[Math.max(0, i - 1)];
      const next = path[Math.min(path.length - 1, i + 1)];
      const tx = next[0] - prev[0];
      const tz = next[1] - prev[1];
      const length = Math.hypot(tx, tz) || 1;
      // normale perpendiculaire au fil, dans le plan xz
      const nx = -tz / length;
      const nz = tx / length;
      const lx = x + nx * halfWidth;
      const lz = z + nz * halfWidth;
      const rx = x - nx * halfWidth;
      const rz = z - nz * halfWidth;
      const yL =
        z > SOUTH_EDGE_Z
          ? DRIFT_3D_FLOOR_Y + 0.02
          : getDrift3DGroundY(lx, lz) + 0.08;
      const yR =
        z > SOUTH_EDGE_Z
          ? DRIFT_3D_FLOOR_Y + 0.02
          : getDrift3DGroundY(rx, rz) + 0.08;
      positions.push(lx, yL, lz, rx, yR, rz);

      if (i < path.length - 1) {
        const a = i * 2;
        indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    geo.setIndex(indices);
    geo.computeVertexNormals();

    return geo;
  }, []);

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  return (
    <mesh geometry={geometry} aria-hidden="true" renderOrder={1}>
      <meshStandardMaterial
        color="#31505c"
        roughness={0.35}
        metalness={0.05}
        transparent
        opacity={0.85}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export default function Drift3DWorldEdges() {
  return (
    <group aria-hidden="true">
      <NorthOcean />
      <WestCliffs />
      <EastHills />
      <SouthPlains />
      <River />
    </group>
  );
}
