"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { getDriftMaterialMaps } from "@/components/drift-3d/drift3dTextureFactory";
import {
  getFableAsphaltTexture,
  getFableBackdropGlowTexture,
  getFableClothTexture,
  getFableFacadeMaps,
  getFableGlowTexture,
  getFablePlazaTexture,
  getFableSignTexture,
  getFableSmokeTexture,
} from "@/components/drift-3d/fable/fableTextures";
import {
  FABLE_CANAL_Z0,
  FABLE_CANAL_Z1,
  FABLE_CITY_Z0,
  FABLE_CITY_Z1,
  FABLE_VENTS,
  FABLE_YARD_Z0,
  FABLE_YARD_Z1,
  fableGroundY,
  fablePathX,
  fableRng,
  fableStreetHalfWidth,
  type FableLot,
} from "@/components/drift-3d/fable/fableWorld";
import {
  FABLE_FOG_CITY,
  FABLE_SKY_HORIZON,
  FABLE_SKY_ZENITH,
  FABLE_SUN_COLOR,
  FABLE_SUN_DIR,
} from "@/components/drift-3d/fable/FableSky";
import { buildFableArchitecture } from "@/components/drift-3d/fable/fableArchitecture";
import { immersionBackdropRing } from "@/components/drift-3d/fable/core/immersionLayers";
import { fableRegionAt } from "@/components/drift-3d/fable/fablePeninsula";
import {
  desyncFrequency,
  desyncPhase,
  eventPulse,
  flickerSignal,
  swaySignal,
} from "@/components/drift-3d/fable/core/immersionSecondary";

/**
 * FABLE SPIKE — le Chantier de Naissance. Une seule rue vraie, épaisse de
 * trois plans : façades au premier plan, toits encombrés au second, silhouettes
 * noyées de brume au fond. Câbles, enseignes en écriture inventée, vapeur à
 * contre-jour, et la cour d'amarrage — des câbles tendus qui montent dans la
 * brume et ne redescendent jamais.
 */

const ROOF_COLORS = ["#4e463c", "#564a3a", "#474441", "#5a4e42", "#42403b"];

function isFirstRow(lot: FableLot) {
  return Math.abs(lot.x) - lot.width / 2 < fableStreetHalfWidth(lot.z) + 4.2;
}

/* ─── Sol ──────────────────────────────────────────────────────────────── */

function terrainMacroShade(x: number, z: number) {
  // Variation basse fréquence qui casse la répétition de la texture.
  const a = Math.sin(x * 0.043 + z * 0.031) * 0.5 + Math.sin(x * 0.011 - z * 0.017) * 0.5;
  const b = Math.sin(x * 0.13 + 40) * Math.sin(z * 0.09 + 9);

  return 0.82 + a * 0.13 + b * 0.06;
}

function FableTerrain() {
  const maps = getDriftMaterialMaps("rock", 30, 46);
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(150, 240, 96, 150);
    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);

    for (let i = 0; i < pos.count; i += 1) {
      const x = pos.getX(i);
      const z = -pos.getY(i) + 50;
      pos.setZ(i, fableGroundY(x, z));
      const shade = terrainMacroShade(x, z);
      colors[i * 3] = shade;
      colors[i * 3 + 1] = shade * (0.97 + Math.sin(x * 0.07) * 0.02);
      colors[i * 3 + 2] = shade * 0.95;
    }

    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();

    return geo;
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 50]} receiveShadow>
      <meshStandardMaterial
        map={maps.map ?? undefined}
        normalMap={maps.normalMap ?? undefined}
        color="#8a7861"
        roughness={0.97}
        vertexColors
      />
    </mesh>
  );
}

/** Ruban de route qui suit le tracé, largeur variable. */
function makeRibbonGeometry(
  z0: number,
  z1: number,
  widthAt: (z: number) => number,
  lift: number
) {
  const step = 1.4;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  let row = 0;

  for (let z = z0; z <= z1 + 0.01; z += step, row += 1) {
    const cx = fablePathX(z);
    const half = widthAt(z) / 2;
    const yL = fableGroundY(cx - half, z) + lift;
    const yR = fableGroundY(cx + half, z) + lift;
    positions.push(cx - half, yL, z, cx + half, yR, z);
    uvs.push(0, z / 6, 1, z / 6);

    if (row > 0) {
      const a = (row - 1) * 2;
      indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();

  return geo;
}

function FableRoads() {
  const asphalt = getFableAsphaltTexture();
  const dirtMaps = getDriftMaterialMaps("rock", 2, 3);

  const cityRoad = useMemo(
    () =>
      makeRibbonGeometry(36, 148, (z) => Math.min(fableStreetHalfWidth(z), 4.4) * 2, 0.05),
    []
  );
  const shoulder = useMemo(
    () =>
      makeRibbonGeometry(34, 149, (z) => Math.min(fableStreetHalfWidth(z), 4.4) * 2 + 2.6, 0.028),
    []
  );
  const dirtTrack = useMemo(() => makeRibbonGeometry(-58, 38, () => 5.2, 0.04), []);

  useEffect(
    () => () => {
      cityRoad.dispose();
      shoulder.dispose();
      dirtTrack.dispose();
    },
    [cityRoad, shoulder, dirtTrack]
  );

  return (
    <group>
      <mesh geometry={cityRoad} receiveShadow>
        <meshStandardMaterial map={asphalt} color="#a89e91" roughness={0.94} />
      </mesh>
      {/* Épaulement de gravier qui fond la route dans le sol. */}
      <mesh geometry={shoulder} receiveShadow>
        <meshStandardMaterial
          map={dirtMaps.map ?? undefined}
          color="#8d7d68"
          roughness={0.97}
        />
      </mesh>
      <mesh geometry={dirtTrack} receiveShadow>
        <meshStandardMaterial
          map={dirtMaps.map ?? undefined}
          normalMap={dirtMaps.normalMap ?? undefined}
          color="#78685a"
          roughness={0.98}
        />
      </mesh>
      {/* Rues transversales qui fuient dans la brume. */}
      {[71, 129].map((z) => (
        <mesh key={z} position={[0, 0.43, z]} rotation={[-Math.PI / 2, 0, Math.PI / 2]} receiveShadow>
          <planeGeometry args={[5.4, 76]} />
          <meshStandardMaterial map={asphalt} color="#877e74" roughness={0.94} />
        </mesh>
      ))}
    </group>
  );
}

function FableSidewalks() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const maps = getDriftMaterialMaps("concrete", 1.4, 1.4);

  const transforms = useMemo(() => {
    const rng = fableRng(20811);
    const list: Array<{ x: number; y: number; z: number; yaw: number }> = [];

    for (let z = FABLE_CITY_Z0 + 4; z < FABLE_CITY_Z1 - 2; z += 3.1) {
      if ((z > 66 && z < 76) || (z > 124 && z < 134)) continue;

      for (const side of [-1, 1]) {
        if (z > FABLE_YARD_Z0 && z < FABLE_YARD_Z1) continue;

        const half = fableStreetHalfWidth(z);
        // Dalles jamais parfaitement alignées : lacet et assise varient.
        list.push({
          x: side * (half + 0.92) + (rng() - 0.5) * 0.08,
          y: fableGroundY(0, z) + 0.062 + rng() * 0.014,
          z,
          yaw: (rng() - 0.5) * 0.03,
        });
      }
    }

    return list;
  }, []);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();

    transforms.forEach((t, i) => {
      e.set(0, t.yaw, 0);
      q.setFromEuler(e);
      m.compose(new THREE.Vector3(t.x, t.y, t.z), q, new THREE.Vector3(1, 1, 1));
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [transforms]);

  return (
    <instancedMesh frustumCulled={false} ref={meshRef} args={[undefined, undefined, transforms.length]} receiveShadow>
      <boxGeometry args={[1.75, 0.14, 3.05]} />
      <meshStandardMaterial map={maps.map ?? undefined} color="#9a9187" roughness={0.95} />
    </instancedMesh>
  );
}

/* ─── Bâtiments ────────────────────────────────────────────────────────── */

function FableBlocks({ lots }: { lots: FableLot[] }) {
  const geometries = useMemo(() => buildFableArchitecture(lots), [lots]);
  const plasterMaps = getDriftMaterialMaps("concrete", 1, 1);
  const brickMaps = getDriftMaterialMaps("brick", 1, 1);

  useEffect(() => {
    return () => {
      for (const geo of Object.values(geometries)) geo.dispose();
    };
  }, [geometries]);

  return (
    <group>
      {/* Maçonnerie : un seul appel de dessin pour toute la ville. */}
      <mesh geometry={geometries.solid} castShadow receiveShadow frustumCulled={false}>
        <meshStandardMaterial
          map={plasterMaps.map ?? undefined}
          normalMap={plasterMaps.normalMap ?? undefined}
          normalScale={new THREE.Vector2(0.6, 0.6)}
          vertexColors
          roughness={0.95}
        />
      </mesh>
      {/* Vitrages éteints : sombres, un peu spéculaires, jamais noirs. */}
      <mesh geometry={geometries.glass} frustumCulled={false}>
        <meshStandardMaterial vertexColors roughness={0.12} metalness={0.15} envMapIntensity={2.4} />
      </mesh>
      {/* Intérieurs allumés : la couleur EST la lumière, sans éclairage. */}
      <mesh geometry={geometries.lit} frustumCulled={false}>
        <meshBasicMaterial vertexColors toneMapped={false} />
      </mesh>
      {/* Ferronnerie : garde-corps, escaliers de secours. */}
      <mesh geometry={geometries.metal} castShadow frustumCulled={false}>
        <meshStandardMaterial vertexColors roughness={0.55} metalness={0.55} envMapIntensity={1.3} />
      </mesh>
      {/* Toiles de devanture. */}
      <mesh geometry={geometries.fabric} castShadow frustumCulled={false}>
        <meshStandardMaterial
          map={brickMaps.map ?? undefined}
          vertexColors
          roughness={0.95}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

/** L'immeuble qui respire — imperceptible d'abord, indéniable ensuite. */
function BreathingBuilding({ reducedMotion }: { reducedMotion: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const { map, emissiveMap } = getFableFacadeMaps(2, 2);
  const x = -27;
  const z = 108;
  const height = 17;

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group || reducedMotion) return;

    const t = clock.elapsedTime;
    const breath = 1 + Math.sin(t * 0.55) * 0.008 + Math.sin(t * 0.23) * 0.004;
    group.scale.set(1, breath, 1);
  });

  return (
    <group ref={groupRef} position={[x, fableGroundY(x, z) - 0.15, z]}>
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[9, height, 10]} />
        <meshStandardMaterial
          map={map}
          emissiveMap={emissiveMap}
          emissive="#ffc27a"
          emissiveIntensity={0.8}
          color="#b7a184"
          roughness={0.92}
        />
      </mesh>
      <mesh position={[0, height + 0.35, 0]}>
        <boxGeometry args={[9.3, 0.7, 10.3]} />
        <meshStandardMaterial color={ROOF_COLORS[2]} roughness={0.96} />
      </mesh>
    </group>
  );
}

/* ─── Encombrement des toits & du sol ─────────────────────────────────── */

function FableRoofProps({ lots }: { lots: FableLot[] }) {
  const tanksRef = useRef<THREE.InstancedMesh>(null);
  const acRef = useRef<THREE.InstancedMesh>(null);
  const antennaRef = useRef<THREE.InstancedMesh>(null);
  const woodMaps = getDriftMaterialMaps("wood", 1, 1);

  const placements = useMemo(() => {
    const rng = fableRng(30311);
    const tanks: THREE.Matrix4[] = [];
    const acs: THREE.Matrix4[] = [];
    const antennas: THREE.Matrix4[] = [];
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();

    for (const lot of lots) {
      const roofY = fableGroundY(lot.x, lot.z) - 0.15 + lot.height;

      if (lot.height > 9 && rng() < 0.45) {
        const s = 0.9 + rng() * 0.7;
        e.set(0, rng() * Math.PI, 0);
        q.setFromEuler(e);
        tanks.push(
          new THREE.Matrix4().compose(
            new THREE.Vector3(
              lot.x + (rng() - 0.5) * lot.width * 0.4,
              roofY + s * 0.75,
              lot.z + (rng() - 0.5) * lot.depth * 0.4
            ),
            q,
            new THREE.Vector3(s * 0.62, s * 1.4, s * 0.62)
          )
        );
      }

      if (rng() < 0.6) {
        const n = 1 + Math.floor(rng() * 3);

        for (let i = 0; i < n; i += 1) {
          e.set(0, rng() * Math.PI, 0);
          q.setFromEuler(e);
          acs.push(
            new THREE.Matrix4().compose(
              new THREE.Vector3(
                lot.x + (rng() - 0.5) * lot.width * 0.6,
                roofY + 0.22,
                lot.z + (rng() - 0.5) * lot.depth * 0.6
              ),
              q,
              new THREE.Vector3(0.55 + rng() * 0.4, 0.45, 0.5)
            )
          );
        }
      }

      if (rng() < 0.5) {
        const h = 1.4 + rng() * 2.6;
        e.set((rng() - 0.5) * 0.12, 0, (rng() - 0.5) * 0.12);
        q.setFromEuler(e);
        antennas.push(
          new THREE.Matrix4().compose(
            new THREE.Vector3(
              lot.x + (rng() - 0.5) * lot.width * 0.5,
              roofY + h / 2,
              lot.z + (rng() - 0.5) * lot.depth * 0.5
            ),
            q,
            new THREE.Vector3(1, h, 1)
          )
        );
      }
    }

    return { tanks, acs, antennas };
  }, [lots]);

  useEffect(() => {
    const apply = (mesh: THREE.InstancedMesh | null, list: THREE.Matrix4[]) => {
      if (!mesh) return;

      list.forEach((m, i) => mesh.setMatrixAt(i, m));
      mesh.instanceMatrix.needsUpdate = true;
    };
    apply(tanksRef.current, placements.tanks);
    apply(acRef.current, placements.acs);
    apply(antennaRef.current, placements.antennas);
  }, [placements]);

  return (
    <group>
      <instancedMesh frustumCulled={false} ref={tanksRef} args={[undefined, undefined, placements.tanks.length]} castShadow>
        <cylinderGeometry args={[1, 1, 1, 10]} />
        <meshStandardMaterial map={woodMaps.map ?? undefined} color="#7a6248" roughness={0.9} />
      </instancedMesh>
      <instancedMesh frustumCulled={false} ref={acRef} args={[undefined, undefined, placements.acs.length]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#8e8d86" roughness={0.7} metalness={0.3} />
      </instancedMesh>
      <instancedMesh frustumCulled={false} ref={antennaRef} args={[undefined, undefined, placements.antennas.length]}>
        <cylinderGeometry args={[0.02, 0.03, 1, 5]} />
        <meshStandardMaterial color="#3c3a36" roughness={0.6} metalness={0.5} />
      </instancedMesh>
    </group>
  );
}

/** Caisses, bidons, sacs — le sol vécu au pied des façades. */
function FableStreetClutter() {
  const cratesRef = useRef<THREE.InstancedMesh>(null);
  const woodMaps = getDriftMaterialMaps("wood", 1, 1);

  const matrices = useMemo(() => {
    const rng = fableRng(66020);
    const list: THREE.Matrix4[] = [];
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();

    for (let i = 0; i < 44; i += 1) {
      const z = FABLE_CITY_Z0 + 4 + rng() * (FABLE_CITY_Z1 - FABLE_CITY_Z0 - 10);

      if ((z > 66 && z < 76) || (z > 124 && z < 134)) continue;

      const side = rng() < 0.5 ? -1 : 1;
      const inYard = z > FABLE_YARD_Z0 && z < FABLE_YARD_Z1;
      const half = fableStreetHalfWidth(z);
      const x = side * (inYard ? 6 + rng() * 12 : half + 0.5 + rng() * 0.9);
      const s = 0.28 + rng() * 0.4;
      e.set(0, rng() * Math.PI, 0);
      q.setFromEuler(e);
      list.push(
        new THREE.Matrix4().compose(
          new THREE.Vector3(x, fableGroundY(x, z) + s / 2 + 0.05, z),
          q,
          new THREE.Vector3(s, s, s)
        )
      );
    }

    return list;
  }, []);

  useEffect(() => {
    const mesh = cratesRef.current;
    if (!mesh) return;

    matrices.forEach((m, i) => mesh.setMatrixAt(i, m));
    mesh.instanceMatrix.needsUpdate = true;
  }, [matrices]);

  return (
    <instancedMesh frustumCulled={false} ref={cratesRef} args={[undefined, undefined, matrices.length]} castShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial map={woodMaps.map ?? undefined} color="#6f5b42" roughness={0.92} />
    </instancedMesh>
  );
}

/**
 * Détail proche caméra : taches d'huile, papiers, herbes des fissures,
 * plaques d'égout, traces de roulement. Le sol n'est jamais nu à moins de
 * quinze mètres.
 */
function FableGroundDetail() {
  const stainsRef = useRef<THREE.InstancedMesh>(null);
  const papersRef = useRef<THREE.InstancedMesh>(null);
  const weedsRef = useRef<THREE.InstancedMesh>(null);

  const placements = useMemo(() => {
    const rng = fableRng(90731);
    const stains: THREE.Matrix4[] = [];
    const papers: THREE.Matrix4[] = [];
    const weeds: THREE.Matrix4[] = [];
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();

    // Taches sombres sur la chaussée et la piste.
    for (let i = 0; i < 150; i += 1) {
      const z = -54 + rng() * 200;
      const cx = fablePathX(z);
      const x = cx + (rng() - 0.5) * (z > 40 ? 7.5 : 4.4);
      e.set(-Math.PI / 2, 0, rng() * Math.PI);
      q.setFromEuler(e);
      const s = 0.25 + rng() * rng() * 1.3;
      stains.push(
        new THREE.Matrix4().compose(
          new THREE.Vector3(x, fableGroundY(x, z) + 0.062 + rng() * 0.01, z),
          q,
          new THREE.Vector3(s, s * (0.5 + rng() * 0.8), 1)
        )
      );
    }

    // Papiers et cartons ternes, collés aux bordures — jamais en pleine voie.
    for (let i = 0; i < 34; i += 1) {
      const z = 42 + rng() * 104;
      const side = rng() < 0.5 ? -1 : 1;
      const x = side * (fableStreetHalfWidth(z) * (0.82 + rng() * 0.3)) + (rng() - 0.5) * 0.4;
      e.set(-Math.PI / 2, 0, rng() * Math.PI);
      q.setFromEuler(e);
      papers.push(
        new THREE.Matrix4().compose(
          new THREE.Vector3(x, fableGroundY(x, z) + 0.075, z),
          q,
          new THREE.Vector3(0.08 + rng() * 0.1, 0.1 + rng() * 0.12, 1)
        )
      );
    }

    // Herbes dans les fissures, contre les bordures.
    for (let i = 0; i < 90; i += 1) {
      const z = 40 + rng() * 108;

      if ((z > 66 && z < 76) || (z > 124 && z < 134)) continue;

      const side = rng() < 0.5 ? -1 : 1;
      const x = side * (fableStreetHalfWidth(z) + 0.25 + rng() * 1.6);
      e.set(0, rng() * Math.PI, (rng() - 0.5) * 0.3);
      q.setFromEuler(e);
      const s = 0.1 + rng() * 0.16;
      weeds.push(
        new THREE.Matrix4().compose(
          new THREE.Vector3(x, fableGroundY(x, z) + 0.1 + s / 2, z),
          q,
          new THREE.Vector3(s * 0.5, s, s * 0.5)
        )
      );
    }

    return { stains, papers, weeds };
  }, []);

  useEffect(() => {
    const apply = (mesh: THREE.InstancedMesh | null, list: THREE.Matrix4[]) => {
      if (!mesh) return;

      list.forEach((m, i) => mesh.setMatrixAt(i, m));
      mesh.instanceMatrix.needsUpdate = true;
    };
    apply(stainsRef.current, placements.stains);
    apply(papersRef.current, placements.papers);
    apply(weedsRef.current, placements.weeds);
  }, [placements]);

  const wearGeometry = useMemo(() => makeRibbonGeometry(40, 146, () => 0.85, 0.058), []);

  useEffect(() => () => wearGeometry.dispose(), [wearGeometry]);

  return (
    <group>
      <instancedMesh
        ref={stainsRef}
        args={[undefined, undefined, placements.stains.length]}
        frustumCulled={false}
      >
        <circleGeometry args={[0.5, 10]} />
        <meshBasicMaterial color="#070605" transparent opacity={0.4} depthWrite={false} />
      </instancedMesh>
      <instancedMesh
        ref={papersRef}
        args={[undefined, undefined, placements.papers.length]}
        frustumCulled={false}
      >
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial color="#7d7666" roughness={0.95} side={THREE.DoubleSide} />
      </instancedMesh>
      <instancedMesh
        ref={weedsRef}
        args={[undefined, undefined, placements.weeds.length]}
        frustumCulled={false}
      >
        <coneGeometry args={[0.5, 1, 5]} />
        <meshStandardMaterial color="#5a5c3a" roughness={0.98} />
      </instancedMesh>

      {/* Plaques d'égout. */}
      {[
        { x: 1.2, z: 52 },
        { x: -1.8, z: 76.5 },
        { x: 0.6, z: 108 },
        { x: -1.1, z: 136 },
      ].map((p, i) => (
        <mesh
          key={i}
          position={[p.x, fableGroundY(p.x, p.z) + 0.068, p.z]}
          rotation={[-Math.PI / 2, 0, i]}
        >
          <circleGeometry args={[0.32, 14]} />
          <meshStandardMaterial color="#2b2926" roughness={0.55} metalness={0.5} />
        </mesh>
      ))}

      {/* Traces de roulement : deux bandes assombries dans les voies. */}
      {[-1.7, 1.7].map((lane) => (
        <mesh key={lane} position={[lane, 0, 0]} geometry={wearGeometry}>
          <meshBasicMaterial
            color="#0b0a09"
            transparent
            opacity={0.16}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ─── Enseignes ────────────────────────────────────────────────────────── */

function FableSigns({ lots }: { lots: FableLot[] }) {
  const flickerRef = useRef<Array<{ material: THREE.MeshBasicMaterial; seed: number }>>([]);

  const signs = useMemo(() => {
    const rng = fableRng(120607);
    const firstRow = lots.filter(isFirstRow);
    const picked: Array<{
      x: number;
      y: number;
      z: number;
      side: number;
      seed: number;
      lit: boolean;
      flickers: boolean;
    }> = [];

    firstRow.forEach((lot, i) => {
      if (i % 2 !== 0 || picked.length >= 16) return;

      const side = lot.x > 0 ? 1 : -1;
      const faceX = Math.abs(lot.x) - lot.width / 2;
      picked.push({
        x: side * faceX,
        y: fableGroundY(lot.x, lot.z) + 2.4 + rng() * 2.2,
        z: lot.z + (rng() - 0.5) * lot.depth * 0.5,
        side,
        seed: Math.floor(rng() * 40),
        lit: rng() < 0.6,
        flickers: picked.length === 3 || picked.length === 9,
      });
    });

    return picked;
  }, [lots]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;

    for (const entry of flickerRef.current) {
      entry.material.opacity = flickerSignal(t, entry.seed);
    }
  });

  return (
    <group>
      {signs.map((sign, i) => (
        <group key={i} position={[sign.x - sign.side * 0.5, sign.y, sign.z]}>
          {/* Potence. */}
          <mesh position={[sign.side * 0.28, 0.9, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.025, 0.025, 0.6, 6]} />
            <meshStandardMaterial color="#3a3835" roughness={0.6} metalness={0.5} />
          </mesh>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[0.85, 1.7]} />
            {sign.lit ? (
              <meshBasicMaterial
                ref={(material) => {
                  if (
                    material &&
                    sign.flickers &&
                    !flickerRef.current.some((entry) => entry.material === material)
                  ) {
                    flickerRef.current.push({ material, seed: sign.seed * 13.7 + i });
                  }
                }}
                map={getFableSignTexture(sign.seed, true)}
                transparent
                side={THREE.DoubleSide}
              />
            ) : (
              <meshStandardMaterial
                map={getFableSignTexture(sign.seed, false)}
                roughness={0.85}
                side={THREE.DoubleSide}
              />
            )}
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ─── Câbles aériens + lampes ─────────────────────────────────────────── */

function FableOverheadCables() {
  const glow = getFableGlowTexture();
  const lampRefs = useRef<Array<THREE.Group | null>>([]);
  const glowRefs = useRef<Array<THREE.SpriteMaterial | null>>([]);

  const spans = useMemo(() => {
    const rng = fableRng(55210);
    const list: Array<{
      z: number;
      geometry: THREE.TubeGeometry;
      lamp: THREE.Vector3;
      poleL: THREE.Vector3;
      poleR: THREE.Vector3;
    }> = [];

    for (let z = 47; z < 147; z += 11.5) {
      if (z > FABLE_YARD_Z0 - 2 && z < FABLE_YARD_Z1 + 2) continue;

      const half = fableStreetHalfWidth(z) + 1.0;
      const ground = fableGroundY(0, z);
      const hL = ground + 4.6 + rng() * 0.8;
      const hR = ground + 4.4 + rng() * 0.9;
      const sag = 0.55 + rng() * 0.3;
      const mid = new THREE.Vector3(0, Math.min(hL, hR) - sag, z + (rng() - 0.5));
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-half, hL, z),
        mid,
        new THREE.Vector3(half, hR, z),
      ]);
      list.push({
        z,
        geometry: new THREE.TubeGeometry(curve, 16, 0.016, 4, false),
        lamp: mid.clone().add(new THREE.Vector3(0, -0.22, 0)),
        poleL: new THREE.Vector3(-half, ground, z),
        poleR: new THREE.Vector3(half, ground, z),
      });
    }

    return list;
  }, []);

  useEffect(
    () => () => {
      for (const span of spans) span.geometry.dispose();
    },
    [spans]
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;

    spans.forEach((span, i) => {
      const lamp = lampRefs.current[i];

      if (lamp) {
        lamp.rotation.z = swaySignal(t, span.z * 3.7, 0.08, 0.2) * 0.05;
        lamp.rotation.x = swaySignal(t, span.z * 7.1 + 5, 0.06, 0.16) * 0.03;
      }

      const glowMaterial = glowRefs.current[i];

      if (glowMaterial) {
        glowMaterial.opacity =
          0.42 + Math.sin(t * desyncFrequency(span.z, 1.2, 3.4) + desyncPhase(span.z)) * 0.05;
      }
    });
  });

  return (
    <group>
      {spans.map((span, i) => (
        <group key={i}>
          <mesh geometry={span.geometry}>
            <meshStandardMaterial color="#191a1c" roughness={0.7} />
          </mesh>
          {/* Suspente + lampe chaude — balancement propre à chaque lampe. */}
          <group
            ref={(g) => {
              lampRefs.current[i] = g;
            }}
            position={[span.lamp.x, span.lamp.y + 0.24, span.lamp.z]}
          >
            <mesh position={[0, -0.12, 0]}>
              <cylinderGeometry args={[0.01, 0.01, 0.24, 4]} />
              <meshStandardMaterial color="#191a1c" roughness={0.7} />
            </mesh>
            <mesh position={[0, -0.24, 0]}>
              <sphereGeometry args={[0.075, 8, 6]} />
              <meshBasicMaterial color="#ffd9a0" toneMapped={false} />
            </mesh>
            <sprite position={[0, -0.24, 0]} scale={[1.5, 1.5, 1]}>
              <spriteMaterial
                ref={(m) => {
                  glowRefs.current[i] = m;
                }}
                map={glow}
                color="#ffbe72"
                transparent
                opacity={0.45}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </sprite>
          </group>
          {[span.poleL, span.poleR].map((pole, j) => (
            <mesh key={j} position={[pole.x, pole.y + 2.5, pole.z]} rotation={[0, 0, (j ? -1 : 1) * 0.03]}>
              <cylinderGeometry args={[0.05, 0.07, 5, 7]} />
              <meshStandardMaterial color="#33302b" roughness={0.85} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/** Linge tendu entre façades des rues transversales. */
function FableLaundry() {
  const cloth = getFableClothTexture();
  const lineRefs = useRef<Array<THREE.Group | null>>([]);

  const lines = useMemo(() => {
    const rng = fableRng(77441);
    const list: Array<{
      from: THREE.Vector3;
      to: THREE.Vector3;
      pieces: Array<{ t: number; w: number; h: number; tint: string }>;
    }> = [];
    const tints = ["#c08a70", "#94a7b5", "#cfc09a", "#8a9b7a", "#b8a8c2", "#e0d2ba"];

    for (const spot of [
      { z: 69.4, x0: -8.6, x1: -3.2, y: 4.1 },
      { z: 72.8, x0: 3.4, x1: 8.8, y: 5.2 },
      { z: 127.4, x0: -9, x1: -3.6, y: 4.6 },
      { z: 131.2, x0: 3.2, x1: 8.4, y: 3.8 },
    ]) {
      const pieces: Array<{ t: number; w: number; h: number; tint: string }> = [];
      const n = 4 + Math.floor(rng() * 3);

      for (let i = 0; i < n; i += 1) {
        pieces.push({
          t: 0.15 + (i / n) * 0.75 + rng() * 0.04,
          w: 0.2 + rng() * 0.16,
          h: 0.26 + rng() * 0.2,
          tint: tints[Math.floor(rng() * tints.length)],
        });
      }

      list.push({
        from: new THREE.Vector3(spot.x0, fableGroundY(spot.x0, spot.z) + spot.y, spot.z),
        to: new THREE.Vector3(spot.x1, fableGroundY(spot.x1, spot.z) + spot.y - 0.3, spot.z),
        pieces,
      });
    }

    return list;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;

    lineRefs.current.forEach((group, i) => {
      if (!group) return;

      group.rotation.x = swaySignal(t, i * 31 + 4, 0.07, 0.19) * 0.07;
    });
  });

  return (
    <group>
      {lines.map((line, i) => {
        const dir = line.to.clone().sub(line.from);

        return (
          <group
            key={i}
            ref={(g) => {
              lineRefs.current[i] = g;
            }}
          >
            <mesh
              position={line.from.clone().add(dir.clone().multiplyScalar(0.5)).toArray()}
              rotation={[0, 0, Math.atan2(dir.y, dir.x)]}
            >
              <boxGeometry args={[dir.length(), 0.012, 0.012]} />
              <meshStandardMaterial color="#26272a" roughness={0.7} />
            </mesh>
            {line.pieces.map((piece, j) => {
              const p = line.from.clone().add(dir.clone().multiplyScalar(piece.t));

              return (
                <mesh key={j} position={[p.x, p.y - piece.h / 2 - 0.02, p.z]}>
                  <planeGeometry args={[piece.w, piece.h]} />
                  <meshStandardMaterial
                    map={cloth}
                    color={piece.tint}
                    roughness={0.95}
                    side={THREE.DoubleSide}
                  />
                </mesh>
              );
            })}
          </group>
        );
      })}
    </group>
  );
}

/* ─── Vapeur ───────────────────────────────────────────────────────────── */

const VENT_POSITIONS = FABLE_VENTS;

function FableSteam({ reducedMotion }: { reducedMotion: boolean }) {
  const smoke = getFableSmokeTexture();
  const spritesRef = useRef<THREE.Sprite[]>([]);
  const states = useMemo(() => {
    const rng = fableRng(88117);

    return VENT_POSITIONS.flatMap((vent) =>
      Array.from({ length: 6 }, () => ({
        vent,
        offset: rng() * 5,
        speed: 0.55 + rng() * 0.35,
        driftX: (rng() - 0.5) * 0.4,
        baseY: fableGroundY(vent.x, vent.z) + 0.15,
      }))
    );
  }, []);

  useFrame(({ clock }) => {
    if (reducedMotion) return;

    const t = clock.elapsedTime;

    states.forEach((state, i) => {
      const sprite = spritesRef.current[i];
      if (!sprite) return;

      const life = 5.2;
      const age = ((t * state.speed + state.offset) % life) / life;
      sprite.position.set(
        state.vent.x + state.driftX * age * 3 + Math.sin(t * 0.6 + i) * 0.2 * age,
        state.baseY + age * 4.4,
        state.vent.z + age * 0.7
      );
      const s = 0.5 + age * 2.6;
      sprite.scale.set(s, s, 1);
      const material = sprite.material as THREE.SpriteMaterial;
      material.opacity = Math.min(age * 6, 1) * (1 - age) * 0.62;
    });
  });

  return (
    <group>
      {states.map((state, i) => (
        <sprite
          key={i}
          ref={(sprite) => {
            if (sprite) spritesRef.current[i] = sprite;
          }}
          position={[state.vent.x, state.baseY, state.vent.z]}
        >
          <spriteMaterial
            map={smoke}
            color="#f2ddbe"
            transparent
            opacity={0.4}
            depthWrite={false}
          />
        </sprite>
      ))}
      {/* Grilles d'où sort la vapeur. */}
      {VENT_POSITIONS.map((vent, i) => (
        <mesh
          key={i}
          position={[vent.x, fableGroundY(vent.x, vent.z) + 0.06, vent.z]}
          rotation={[-Math.PI / 2, 0, 0.3]}
        >
          <planeGeometry args={[0.8, 0.5]} />
          <meshStandardMaterial color="#1e1e1f" roughness={0.6} metalness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

/* ─── Flaques (reflet de ciel feint) ──────────────────────────────────── */

const puddleVertex = /* glsl */ `
  varying vec3 vWorldPos;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const puddleFragment = /* glsl */ `
  uniform vec3 uZenith;
  uniform vec3 uHorizon;
  uniform vec3 uSunDir;
  uniform vec3 uSunColor;
  uniform vec3 uCameraPos;
  varying vec3 vWorldPos;
  varying vec2 vUv;

  void main() {
    vec3 viewDir = normalize(vWorldPos - uCameraPos);
    vec3 r = reflect(viewDir, vec3(0.0, 1.0, 0.0));
    float t = pow(clamp(r.y, 0.0, 1.0), 0.6);
    vec3 sky = mix(uHorizon, uZenith, t);
    float glare = pow(clamp(dot(r, uSunDir), 0.0, 1.0), 60.0);
    sky += uSunColor * glare * 0.8;

    float edge = smoothstep(0.5, 0.3, distance(vUv, vec2(0.5)));
    vec3 color = mix(vec3(0.06, 0.055, 0.05), sky, 0.55);
    gl_FragColor = vec4(color, edge * 0.6);
  }
`;

function FablePuddles() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uZenith: { value: FABLE_SKY_ZENITH },
      uHorizon: { value: FABLE_SKY_HORIZON },
      uSunDir: { value: FABLE_SUN_DIR },
      uSunColor: { value: FABLE_SUN_COLOR },
      uCameraPos: { value: new THREE.Vector3() },
    }),
    []
  );

  useFrame(({ camera }) => {
    uniforms.uCameraPos.value.copy(camera.position);
  });

  const puddles = useMemo(() => {
    const rng = fableRng(99120);

    return [
      { x: 1.6, z: 49 },
      { x: -2.3, z: 63 },
      { x: 2.8, z: 84 },
      { x: -3.6, z: 99 },
      { x: 0.8, z: 118 },
      { x: -1.9, z: 141 },
    ].map((p) => ({
      ...p,
      sx: 0.8 + rng() * 0.9,
      sz: 0.5 + rng() * 0.6,
      rot: rng() * Math.PI,
    }));
  }, []);

  return (
    <group>
      {puddles.map((p, i) => (
        <mesh
          key={i}
          position={[p.x, fableGroundY(p.x, p.z) + 0.085, p.z]}
          rotation={[-Math.PI / 2, 0, p.rot]}
          scale={[p.sx, p.sz, 1]}
        >
          <circleGeometry args={[1, 22]} />
          <shaderMaterial
            ref={materialRef}
            vertexShader={puddleVertex}
            fragmentShader={puddleFragment}
            uniforms={uniforms}
            transparent
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ─── Fond de ville & mégastructure ───────────────────────────────────── */

function FableBackdrop() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 84;
  const glowMap = getFableBackdropGlowTexture();

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const rng = fableRng(41999);
    // Le fond de ville ne se pose pas dans le bassin : le port s'ouvre.
    const clearsCanal = (m: THREE.Matrix4) => {
      const x = m.elements[12];
      const z = m.elements[14];

      return !(x < -4 && z > FABLE_CANAL_Z0 - 8 && z < FABLE_CANAL_Z1 + 6);
    };
    // On tire large et on laisse la carte des régions trancher : trois fois
    // plus de candidats que de places, pour que le fond reste dense après tri.
    const matrices = immersionBackdropRing({
      seed: rng,
      count: count * 3,
      center: { x: 0, z: 95 },
      radiusMin: 70,
      radiusMax: 148,
      angleMin: -1.65,
      angleMax: 1.65,
      heightMin: 16,
      heightMax: 54,
      widthMin: 8,
      widthMax: 20,
    });
    const color = new THREE.Color();
    // Le fond de ville appartient à Birth Yard. C'est la carte des régions
    // qui le dit — pas un rayon écrit à la main du temps où le monde était
    // un couloir et où l'anneau montait jusqu'à z=243, en plein sur
    // l'approche du massif.
    const kept = matrices.filter((m) => {
      const x = m.elements[12];
      const z = m.elements[14];

      // Et rien ne se tient dans l'eau : une tour posée sur la rive ou sur
      // la baie ferme le vide central, qui est ce qui rend la péninsule
      // lisible depuis les cinq ères.
      return (
        fableRegionAt(x, z).id === "birth-yard" &&
        fableGroundY(x, z) > 0.6 &&
        clearsCanal(m)
      );
    });
    const hidden = new THREE.Matrix4().makeScale(0, 0, 0);

    for (let i = 0; i < count; i += 1) {
      const m = kept[i];
      mesh.setMatrixAt(i, m ?? hidden);
      const v = 0.9 + rng() * 0.25;
      color.setRGB(0.34 * v, 0.325 * v, 0.31 * v);
      mesh.setColorAt(i, color);
    }

    mesh.instanceMatrix.needsUpdate = true;

    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, []);

  return (
    <group>
      <instancedMesh frustumCulled={false} ref={meshRef} args={[undefined, undefined, count]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#ffffff"
          roughness={1}
          emissiveMap={glowMap}
          emissive="#ffb066"
          emissiveIntensity={0.5}
        />
      </instancedMesh>
      {/*
        Ici se tenaient deux « mégastructures » : un pan de 64×96×18 en
        (42, 236) et un autre de 34×64×14 en (−58, 218). Elles dataient du
        monde en couloir, où z=220 était le fond d'horizon de Birth Yard.
        Le pliage de la péninsule a mis l'approche d'Older Shadows exactement
        sous elles : deux blocs opaques posés sur le versant d'une ère dont
        tout le propos est l'altitude et l'horizon ouvert. Retirées.
      */}
    </group>
  );
}

/* ─── La cour d'amarrage (anomalie) ───────────────────────────────────── */

const cableVertex = /* glsl */ `
  varying float vY;

  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vY = worldPos.y;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const cableFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uFogColor;
  varying float vY;

  void main() {
    // Le câble se dissout dans la brume avec l'altitude — on ne voit jamais le haut.
    float fade = 1.0 - smoothstep(22.0, 58.0, vY);
    vec3 color = mix(uFogColor, uColor, clamp(fade + 0.15, 0.0, 1.0));
    gl_FragColor = vec4(color, fade);
  }
`;

function MooringCable({
  base,
  top,
  radius = 0.05,
}: {
  base: [number, number, number];
  top: [number, number, number];
  radius?: number;
}) {
  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color("#1f2023") },
      uFogColor: { value: FABLE_FOG_CITY },
    }),
    []
  );

  const geometry = useMemo(() => {
    const from = new THREE.Vector3(...base);
    const to = new THREE.Vector3(...top);
    const mid = from.clone().lerp(to, 0.5);
    const curve = new THREE.CatmullRomCurve3([from, mid, to]);

    return new THREE.TubeGeometry(curve, 12, radius, 5, false);
  }, [base, top, radius]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry}>
      <shaderMaterial
        vertexShader={cableVertex}
        fragmentShader={cableFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

function FableMooringYard({ reducedMotion }: { reducedMotion: boolean }) {
  const plaza = getFablePlazaTexture();
  const concreteMaps = getDriftMaterialMaps("concrete", 2, 1);
  const swayRef = useRef<THREE.Group>(null);
  const drumRef = useRef<THREE.Group>(null);
  const shimmerRef = useRef<THREE.SpriteMaterial>(null);
  const yardY = fableGroundY(0, 102);

  useFrame(({ clock }) => {
    if (reducedMotion) return;

    const t = clock.elapsedTime;
    // Toutes les ~38 s, la tension monte : les câbles se raidissent, le
    // tambour s'écrase d'un souffle, le gémissement suit (même horloge que
    // l'impulsion audio du metteur en scène).
    const pulse = eventPulse(t, 77, 38, 2.6);
    const sway = swayRef.current;

    if (sway) {
      const slack = 1 - pulse * 0.85;
      sway.rotation.z = Math.sin(t * 0.11) * 0.006 * slack;
      sway.rotation.x = Math.sin(t * 0.07 + 1.4) * 0.005 * slack;
      sway.scale.y = 1 + pulse * 0.008;
    }

    if (drumRef.current) {
      drumRef.current.scale.set(1 + pulse * 0.006, 1 - pulse * 0.014, 1 + pulse * 0.006);
    }

    if (shimmerRef.current) {
      shimmerRef.current.opacity =
        0.05 + Math.abs(Math.sin(t * 1.9)) * 0.03 + pulse * 0.06;
    }
  });

  plaza.repeat.set(7, 5);

  return (
    <group>
      {/* Dalles de la cour. */}
      <mesh position={[0, yardY + 0.045, 102]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[44, 29]} />
        <meshStandardMaterial map={plaza} color="#98908a" roughness={0.95} />
      </mesh>

      {/* Anneau de peinture usée autour du bloc — on ne s'approche pas. */}
      <mesh position={[0, yardY + 0.052, 102]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.1, 3.5, 40]} />
        <meshStandardMaterial
          color="#8a3a2c"
          roughness={0.95}
          transparent
          opacity={0.42}
          depthWrite={false}
        />
      </mesh>

      {/* Bloc d'amarrage : tambour de béton, bande rouge mangée, treuils. */}
      <group ref={drumRef} position={[0, yardY, 102]}>
        <mesh position={[0, 0.85, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[2.25, 2.45, 1.7, 22]} />
          <meshStandardMaterial
            map={concreteMaps.map ?? undefined}
            normalMap={concreteMaps.normalMap ?? undefined}
            color="#9a9186"
            roughness={0.95}
          />
        </mesh>
        <mesh position={[0, 1.28, 0]}>
          <cylinderGeometry args={[2.27, 2.27, 0.34, 22]} />
          <meshStandardMaterial color="#7e3226" roughness={0.92} />
        </mesh>
        <mesh position={[0, 1.86, 0]} castShadow>
          <cylinderGeometry args={[1.65, 1.75, 0.34, 18]} />
          <meshStandardMaterial color="#37393c" roughness={0.5} metalness={0.6} />
        </mesh>
        {[0, 2.1, 4.2].map((a) => (
          <group key={a} rotation={[0, a, 0]}>
            <mesh position={[1.05, 2.2, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.22, 0.22, 0.5, 10]} />
              <meshStandardMaterial color="#2c2e30" roughness={0.45} metalness={0.7} />
            </mesh>
          </group>
        ))}

        {/* Les trois câbles tendus — droits, verticaux, avalés par la brume. */}
        <group ref={swayRef}>
          <MooringCable base={[0.9, 2.1, 0.2]} top={[0.4, 66, 0.1]} />
          <MooringCable base={[-0.7, 2.1, 0.7]} top={[-0.3, 63, 0.4]} />
          <MooringCable base={[-0.2, 2.1, -0.9]} top={[-0.1, 68, -0.4]} />
        </group>

        {/* Tremblement d'air au-dessus du tambour. */}
        <sprite position={[0, 5.4, 0]} scale={[1.6, 6.5, 1]}>
          <spriteMaterial
            ref={shimmerRef}
            map={getFableSmokeTexture()}
            color="#ffe9c8"
            transparent
            opacity={0.06}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </sprite>

        {/* Dépôts au pied du bloc : caisses, bouteilles, choses laissées là. */}
        {[0.6, 1.7, 2.9, 3.9, 5.1].map((a, i) => (
          <group key={i} rotation={[0, a, 0]}>
            <mesh position={[2.75, 0.14, 0]} rotation={[0, a * 2, 0]} castShadow>
              <boxGeometry args={[0.24 + (i % 3) * 0.08, 0.24, 0.2]} />
              <meshStandardMaterial color={["#6f5b42", "#59585a", "#71624a"][i % 3]} roughness={0.92} />
            </mesh>
            {i % 2 === 0 ? (
              <mesh position={[2.55, 0.1, 0.3]}>
                <cylinderGeometry args={[0.045, 0.045, 0.2, 7]} />
                <meshStandardMaterial color="#3f4a3e" roughness={0.4} />
              </mesh>
            ) : null}
          </group>
        ))}
      </group>

      {/* Deux amarres de toit supplémentaires autour de la cour. */}
      <MooringCable base={[-22.5, yardY + 13.5, 95]} top={[-14, 64, 99]} radius={0.04} />
      <MooringCable base={[21, yardY + 11, 109]} top={[13, 62, 105]} radius={0.04} />
    </group>
  );
}

/* ─── Machines : ventilateur mural, grue lente ────────────────────────── */

function FableMachines({ reducedMotion }: { reducedMotion: boolean }) {
  const fanRef = useRef<THREE.Group>(null);
  const craneRef = useRef<THREE.Group>(null);

  useFrame(({ clock }, delta) => {
    if (reducedMotion) return;

    if (fanRef.current) fanRef.current.rotation.x += delta * 1.1;

    if (craneRef.current) {
      craneRef.current.rotation.y = 0.6 + Math.sin(clock.elapsedTime * 0.07) * 0.5;
    }
  });

  const fanZ = 61.5;
  const fanX = -(fableStreetHalfWidth(fanZ) + 1.68);
  const fanY = fableGroundY(fanX, fanZ) + 3.6;

  return (
    <group>
      {/* Ventilateur industriel encastré dans la façade du goulet. */}
      <group position={[fanX, fanY, fanZ]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[1.16, 1.16, 0.28, 18]} />
          <meshStandardMaterial color="#232425" roughness={0.6} metalness={0.4} />
        </mesh>
        <group ref={fanRef}>
          {[0, 1, 2, 3].map((i) => (
            <mesh key={i} rotation={[(i * Math.PI) / 2, 0, 0]} position={[0.16, 0, 0]}>
              <boxGeometry args={[0.05, 0.3, 1.9]} />
              <meshStandardMaterial color="#3c3e40" roughness={0.55} metalness={0.5} />
            </mesh>
          ))}
        </group>
      </group>

      {/* Grue lente au fond de la rue. */}
      <group position={[13, fableGroundY(13, 143), 143]}>
        <mesh position={[0, 11, 0]} castShadow>
          <boxGeometry args={[0.9, 22, 0.9]} />
          <meshStandardMaterial color="#6e5a30" roughness={0.8} />
        </mesh>
        <group ref={craneRef} position={[0, 21.6, 0]}>
          <mesh position={[4.4, 0, 0]} castShadow>
            <boxGeometry args={[10.5, 0.5, 0.55]} />
            <meshStandardMaterial color="#6e5a30" roughness={0.8} />
          </mesh>
          <mesh position={[-2.6, -0.1, 0]}>
            <boxGeometry args={[2.6, 0.8, 0.7]} />
            <meshStandardMaterial color="#4a4a48" roughness={0.85} />
          </mesh>
          <mesh position={[7.6, -3.2, 0]}>
            <boxGeometry args={[0.03, 6.4, 0.03]} />
            <meshStandardMaterial color="#1c1d1e" roughness={0.6} />
          </mesh>
          <mesh position={[7.6, -6.5, 0]}>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color="#4a4a48" roughness={0.8} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/* ─── Rochers de la descente ──────────────────────────────────────────── */

function FableDescentRocks() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 22;
  const maps = getDriftMaterialMaps("rock", 1.4, 1.4);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const rng = fableRng(74102);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();

    for (let i = 0; i < count; i += 1) {
      const z = 6 + rng() * 32;
      const side = rng() < 0.5 ? -1 : 1;
      const x = fablePathX(z) + side * (3.6 + rng() * 4);
      const s = 0.5 + rng() * 1.5;
      e.set(rng() * Math.PI, rng() * Math.PI, rng() * Math.PI);
      q.setFromEuler(e);
      m.compose(
        new THREE.Vector3(x, fableGroundY(x, z) + s * 0.2, z),
        q,
        new THREE.Vector3(s, s * 0.75, s)
      );
      mesh.setMatrixAt(i, m);
    }

    mesh.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <instancedMesh frustumCulled={false} ref={meshRef} args={[undefined, undefined, count]} castShadow receiveShadow>
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial map={maps.map ?? undefined} color="#6f6558" roughness={0.97} />
    </instancedMesh>
  );
}

export default function FableCity({
  lots,
  reducedMotion,
}: {
  lots: FableLot[];
  reducedMotion: boolean;
}) {
  return (
    <group>
      <FableTerrain />
      <FableRoads />
      <FableSidewalks />
      <FableBlocks lots={lots} />
      <BreathingBuilding reducedMotion={reducedMotion} />
      <FableRoofProps lots={lots} />
      <FableGroundDetail />
      <FableStreetClutter />
      <FableSigns lots={lots} />
      <FableOverheadCables />
      <FableLaundry />
      <FableSteam reducedMotion={reducedMotion} />
      <FablePuddles />
      <FableBackdrop />
      <FableMooringYard reducedMotion={reducedMotion} />
      <FableMachines reducedMotion={reducedMotion} />
      <FableDescentRocks />
    </group>
  );
}
