"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { getDriftMaterialMaps } from "@/components/drift-3d/drift3dTextureFactory";
import { getFableGlowTexture } from "@/components/drift-3d/fable/fableTextures";
import { fableGroundY, fableRng } from "@/components/drift-3d/fable/fableWorld";
import {
  FABLE_BELVEDERE_ROUTE,
  FABLE_HEADLAND_ROUTE,
  FABLE_SUBURB_LOOP,
  registerFableWorldRoutes,
} from "@/components/drift-3d/fable/fableBranches";
import { fableRouteField } from "@/components/drift-3d/fable/fableRoutes";
import {
  FABLE_REGIONS,
  FABLE_SPINE,
  fableBayField,
  fableRegionAt,
  type FableRegion,
} from "@/components/drift-3d/fable/fablePeninsula";

/**
 * Un point de l'épine pliée avec son repère local. Tout le décor lointain
 * se sème dans ce repère : le monde n'a plus d'axe z le long duquel semer.
 */
type SpineFrame = {
  x: number;
  y: number;
  z: number;
  /** Direction de marche. */
  fx: number;
  fz: number;
  /** Perpendiculaire droite. */
  sx: number;
  sz: number;
};

function spineFrame(index: number): SpineFrame {
  const [x, y, z] = FABLE_SPINE[index];
  const a = FABLE_SPINE[Math.max(0, index - 1)];
  const b = FABLE_SPINE[Math.min(FABLE_SPINE.length - 1, index + 1)];
  const dx = b[0] - a[0];
  const dz = b[2] - a[2];
  const len = Math.hypot(dx, dz) || 1;
  const fx = dx / len;
  const fz = dz / len;

  return { x, y, z, fx, fz, sx: fz, sz: -fx };
}

/** Sous-échantillonne l'épine entre deux nœuds, pas régulier. */
function spineFrames(from: number, to: number, steps = 4): SpineFrame[] {
  const frames: SpineFrame[] = [];

  for (let i = from; i < to; i += 1) {
    const a = spineFrame(i);
    const b = spineFrame(Math.min(FABLE_SPINE.length - 1, i + 1));

    for (let s = 0; s < steps; s += 1) {
      const t = s / steps;
      frames.push({
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
        z: a.z + (b.z - a.z) * t,
        fx: a.fx + (b.fx - a.fx) * t,
        fz: a.fz + (b.fz - a.fz) * t,
        sx: a.sx + (b.sx - a.sx) * t,
        sz: a.sz + (b.sz - a.sz) * t,
      });
    }
  }

  return frames;
}

const REGION = Object.fromEntries(FABLE_REGIONS.map((r) => [r.id, r])) as Record<
  string,
  FableRegion
>;

/**
 * Dégagement : aucun décor ne se pose sur une route, quelle qu'elle soit.
 * Sans cette règle les branches se retrouvent semées de rochers et de
 * maisons — le monde élastique exige que le décor connaisse le réseau.
 */
function clearsRoutes(x: number, z: number, margin: number) {
  return fableRouteField(x, z).distance > margin;
}

/**
 * FABLE — blockout immersif des trois ères lointaines.
 *
 * Volontairement grossier en géométrie, jamais en composition : ce sont des
 * proportions, des silhouettes dominantes et des matières qui portent le
 * lieu, pas des boîtes de débogage. Le détail fin reste réservé à la
 * tranche de référence Entry → Birth Yard.
 *
 * Tout est instancié et fusionné ; chaque ère se monte et se démonte selon
 * la distance au joueur.
 */

/* ─── Sol commun ──────────────────────────────────────────────────────── */

/**
 * Terrain de la péninsule : une grille continue de dalles qui échantillonnent
 * toutes le même sol. Des nappes par région se chevauchaient et divergeaient
 * sur leurs bords — d'où les lames de terrain et la caméra sous la surface.
 * Une seule grille, aucune couture possible.
 */
const TERRAIN_TILE = 130;
const TERRAIN_MIN_X = -150;
const TERRAIN_MAX_X = 620;
const TERRAIN_MIN_Z = -260;
const TERRAIN_MAX_Z = 520;

function TerrainTile({ cx, cz }: { cx: number; cz: number }) {
  const maps = getDriftMaterialMaps("rock", 26, 26);
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(TERRAIN_TILE, TERRAIN_TILE, 40, 40);
    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const shade = new THREE.Color();

    for (let i = 0; i < pos.count; i += 1) {
      const x = pos.getX(i) + cx;
      const z = -pos.getY(i) + cz;
      const y = fableGroundY(x, z);
      pos.setZ(i, y);
      // La couleur suit la région dominante : la matière change avec le lieu.
      const region = fableRegionAt(x, z);
      const base = TERRAIN_COLORS[region.relief] ?? "#7f7a68";
      const v = 0.84 + Math.sin(x * 0.03 + z * 0.017) * 0.1;
      shade.set(base).multiplyScalar(v);
      colors[i * 3] = shade.r;
      colors[i * 3 + 1] = shade.g;
      colors[i * 3 + 2] = shade.b;
    }

    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();

    return geo;
  }, [cx, cz]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[cx, 0, cz]}
      receiveShadow
    >
      <meshStandardMaterial
        map={maps.map ?? undefined}
        normalMap={maps.normalMap ?? undefined}
        vertexColors
        roughness={0.97}
      />
    </mesh>
  );
}

const TERRAIN_COLORS: Record<string, string> = {
  massif: "#8b8b76",
  basin: "#6f7a5e",
  coast: "#6d6551",
  port: "#8a7861",
  gorge: "#7a7268",
  water: "#4a5148",
};

/** Les dalles proches du joueur, et elles seules. */
function PeninsulaTerrain({
  vehicleXRef,
  vehicleZRef,
}: {
  vehicleXRef: React.MutableRefObject<number>;
  vehicleZRef: React.MutableRefObject<number>;
}) {
  const all = useMemo(() => {
    const tiles: Array<{ key: string; cx: number; cz: number }> = [];

    for (let x = TERRAIN_MIN_X; x < TERRAIN_MAX_X; x += TERRAIN_TILE) {
      for (let z = TERRAIN_MIN_Z; z < TERRAIN_MAX_Z; z += TERRAIN_TILE) {
        const cx = x + TERRAIN_TILE / 2;
        const cz = z + TERRAIN_TILE / 2;
        tiles.push({ key: `${cx}:${cz}`, cx, cz });
      }
    }

    return tiles;
  }, []);

  const [visible, setVisible] = useState<string[]>([]);
  const visibleRef = useRef<string[]>([]);

  useEffect(() => {
    visibleRef.current = visible;
  }, [visible]);

  useFrame(() => {
    const x = vehicleXRef.current;
    const z = vehicleZRef.current;
    const next = all
      .filter((t) => Math.hypot(t.cx - x, t.cz - z) < 330)
      .map((t) => t.key);

    if (next.length !== visibleRef.current.length || next.some((k, i) => k !== visibleRef.current[i])) {
      setVisible(next);
    }
  });

  return (
    <group>
      {all
        .filter((t) => visible.includes(t.key))
        .map((t) => (
          <TerrainTile key={t.key} cx={t.cx} cz={t.cz} />
        ))}
    </group>
  );
}

/**
 * Ruban de route le long d'une polyligne quelconque — c'est lui qui rend
 * les détours conduisibles au lieu de rester des lignes dans un fichier.
 */
function RouteRibbon({
  points,
  width,
  color,
  lift = 0.08,
}: {
  points: Array<[number, number, number]>;
  width: number;
  color: string;
  lift?: number;
}) {
  const geometry = useMemo(() => {
    registerFableWorldRoutes();
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    const half = width / 2;
    let travelled = 0;

    for (let i = 0; i < points.length; i += 1) {
      const [x, y, z] = points[i];
      const prev = points[Math.max(0, i - 1)];
      const next = points[Math.min(points.length - 1, i + 1)];
      // Normale horizontale au tracé : elle donne la largeur de la chaussée.
      const dx = next[0] - prev[0];
      const dz = next[2] - prev[2];
      const length = Math.hypot(dx, dz) || 1;
      const nx = -dz / length;
      const nz = dx / length;

      if (i > 0) {
        travelled += Math.hypot(x - points[i - 1][0], z - points[i - 1][2]);
      }

      positions.push(x - nx * half, y + lift, z - nz * half);
      positions.push(x + nx * half, y + lift, z + nz * half);
      uvs.push(0, travelled / 8, 1, travelled / 8);

      if (i > 0) {
        const a = (i - 1) * 2;
        indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    return geo;
  }, [points, width, lift]);

  useEffect(() => () => geometry.dispose(), [geometry]);
  const maps = getDriftMaterialMaps("concrete", 2, 30);

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial map={maps.map ?? undefined} color={color} roughness={0.95} />
    </mesh>
  );
}

/* ─── OLDER SHADOWS — montagne ────────────────────────────────────────── */

/**
 * Le masterframe : pics enneigés au fond, forêt de conifères sur les
 * flancs, plateau rocheux, cairns, un refuge sur la crête. Grand jour.
 */
function EraOlderShadows() {
  const peaksRef = useRef<THREE.InstancedMesh>(null);
  const treesRef = useRef<THREE.InstancedMesh>(null);
  const rocksRef = useRef<THREE.InstancedMesh>(null);
  const cairnsRef = useRef<THREE.InstancedMesh>(null);
  const rockMaps = getDriftMaterialMaps("rock", 2, 2);

  const placements = useMemo(() => {
    const rng = fableRng(310277);
    const peaks: THREE.Matrix4[] = [];
    const trees: THREE.Matrix4[] = [];
    const rocks: THREE.Matrix4[] = [];
    const cairns: THREE.Matrix4[] = [];
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    const frames = spineFrames(2, 15, 5);
    const massif = REGION["os-massif"];

    // Les pics couronnent le massif : c'est la silhouette que tout le monde
    // voit, depuis la baie comme depuis la banlieue.
    for (let i = 0; i < 60; i += 1) {
      const a = rng() * Math.PI * 2;
      const d = 60 + rng() * 200;
      const x = massif.x + Math.cos(a) * d;
      const z = massif.z + Math.sin(a) * d;

      // Un pic ne se pose jamais sur une route : il en écraserait le col.
      if (!clearsRoutes(x, z, 78)) continue;

      // Ni dans la baie. Le rayon de semis porte à 260 m et redescendait
      // jusqu'à z≈245 : des sommets de 144 m se plantaient dans l'eau et
      // fermaient le vide central, qui est ce qui rend la péninsule lisible.
      if (fableBayField(x, z) < 14) continue;

      // Ni hors de son ère : un pic de 98 m s'était planté en (109, 155),
      // à cent mètres du port. C'est la carte des régions qui dit où le
      // massif a le droit de se dresser.
      if (fableRegionAt(x, z).era !== "older-shadows") continue;

      const core = Math.max(0, 1 - d / 260);
      const h = 40 + core * 140 + rng() * 40;
      e.set(0, rng() * Math.PI, 0);
      q.setFromEuler(e);
      peaks.push(
        new THREE.Matrix4().compose(
          // Assis sur le sol réel, pas sur une altitude inventée.
          new THREE.Vector3(x, fableGroundY(x, z) + h * 0.32, z),
          q,
          new THREE.Vector3(36 + rng() * 52, h, 36 + rng() * 52)
        )
      );
    }

    for (const frame of frames) {
      // Conifères : denses en bas, ils s'arrêtent à la limite des arbres.
      const treeLine = 1 - Math.min(1, Math.max(0, (frame.y - 34) / 34));

      for (let i = 0; i < 26; i += 1) {
        if (rng() > treeLine) continue;

        const side = rng() < 0.5 ? -1 : 1;
        const lateral = side * (12 + rng() * rng() * 70);
        const x = frame.x + frame.sx * lateral;
        const z = frame.z + frame.sz * lateral;

        if (!clearsRoutes(x, z, 4.5)) continue;

        const y = fableGroundY(x, z);
        const h = 5 + rng() * 8;
        e.set(0, rng() * Math.PI, (rng() - 0.5) * 0.08);
        q.setFromEuler(e);
        trees.push(
          new THREE.Matrix4().compose(
            new THREE.Vector3(x, y + h / 2, z),
            q,
            new THREE.Vector3(1.5 + rng() * 0.9, h, 1.5 + rng() * 0.9)
          )
        );
      }

      // Blocs erratiques au bord de la piste.
      for (let i = 0; i < 7; i += 1) {
        const side = rng() < 0.5 ? -1 : 1;
        const lateral = side * (6 + rng() * rng() * 38);
        const x = frame.x + frame.sx * lateral;
        const z = frame.z + frame.sz * lateral;

        if (!clearsRoutes(x, z, 3.2)) continue;

        const y = fableGroundY(x, z);
        const sc = 0.7 + rng() * rng() * 5;
        e.set(rng() * Math.PI, rng() * Math.PI, rng() * Math.PI);
        q.setFromEuler(e);
        rocks.push(
          new THREE.Matrix4().compose(
            new THREE.Vector3(x, y + sc * 0.25, z),
            q,
            new THREE.Vector3(sc, sc * 0.8, sc)
          )
        );
      }

      // Cairns : ils jalonnent la montée, un sur quatre repères.
      if (rng() < 0.28) {
        const side = rng() < 0.5 ? -1 : 1;
        const lateral = side * (6 + rng() * 3);
        const x = frame.x + frame.sx * lateral;
        const z = frame.z + frame.sz * lateral;

        if (clearsRoutes(x, z, 2.2)) {
          const y = fableGroundY(x, z);

          for (let k = 0; k < 4; k += 1) {
            const r = 0.42 - k * 0.07;
            cairns.push(
              new THREE.Matrix4().compose(
                new THREE.Vector3(x + (rng() - 0.5) * 0.08, y + 0.14 + k * 0.24, z),
                new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rng() * 3, 0)),
                new THREE.Vector3(r, 0.22, r)
              )
            );
          }
        }
      }
    }

    return { peaks, trees, rocks, cairns };
  }, []);

  useEffect(() => {
    const apply = (mesh: THREE.InstancedMesh | null, list: THREE.Matrix4[]) => {
      if (!mesh) return;

      list.forEach((m, i) => mesh.setMatrixAt(i, m));
      mesh.instanceMatrix.needsUpdate = true;
    };
    apply(peaksRef.current, placements.peaks);
    apply(treesRef.current, placements.trees);
    apply(rocksRef.current, placements.rocks);
    apply(cairnsRef.current, placements.cairns);
  }, [placements]);

  const refuge = spineFrame(11);

  return (
    <group>
      {/* L'épine pliée, d'un seul tenant : c'est la route qu'on suit. */}
      <RouteRibbon points={FABLE_SPINE} width={8.6} color="#9c9184" />
      {/* La montée au belvédère : trois lacets, un cul-de-sac, une vue. */}
      <RouteRibbon points={FABLE_BELVEDERE_ROUTE} width={6.4} color="#94897b" />

      <instancedMesh
        ref={peaksRef}
        args={[undefined, undefined, placements.peaks.length]}
        frustumCulled={false}
      >
        <coneGeometry args={[0.5, 1, 5]} />
        <meshStandardMaterial color="#b9c4cc" roughness={0.92} flatShading />
      </instancedMesh>

      <instancedMesh
        ref={treesRef}
        args={[undefined, undefined, placements.trees.length]}
        frustumCulled={false}
        castShadow
      >
        <coneGeometry args={[0.5, 1, 6]} />
        <meshStandardMaterial color="#2f4032" roughness={0.96} flatShading />
      </instancedMesh>

      <instancedMesh
        ref={rocksRef}
        args={[undefined, undefined, placements.rocks.length]}
        frustumCulled={false}
        castShadow
        receiveShadow
      >
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          map={rockMaps.map ?? undefined}
          color="#8d8778"
          roughness={0.97}
          flatShading
        />
      </instancedMesh>

      <instancedMesh
        ref={cairnsRef}
        args={[undefined, undefined, placements.cairns.length]}
        frustumCulled={false}
        castShadow
      >
        <cylinderGeometry args={[1, 1, 1, 6]} />
        <meshStandardMaterial color="#9a9484" roughness={0.95} flatShading />
      </instancedMesh>

      {/* Le refuge : seul bâti de l'ère, posé au bord du col. */}
      <group
        position={[
          refuge.x + refuge.sx * 26,
          fableGroundY(refuge.x + refuge.sx * 26, refuge.z + refuge.sz * 26),
          refuge.z + refuge.sz * 26,
        ]}
        rotation={[0, Math.atan2(refuge.fx, refuge.fz), 0]}
      >
        <mesh position={[0, 2.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[9, 4.4, 6.5]} />
          <meshStandardMaterial color="#8a6f4e" roughness={0.94} />
        </mesh>
        <mesh position={[0, 5.1, 0]} castShadow>
          <boxGeometry args={[10.4, 1.6, 7.6]} />
          <meshStandardMaterial color="#4a4038" roughness={0.95} />
        </mesh>
        <mesh position={[-4.55, 2.4, 1.6]}>
          <planeGeometry args={[1.1, 1.1]} />
          <meshBasicMaterial color="#ffd79a" toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

/* ─── VEGETATIVE FIELD — lotissement trempé ───────────────────────────── */

/**
 * Le masterframe ne montre aucune jungle : c'est un lotissement pavillonnaire
 * sous un ciel couvert, l'asphalte luisant, les pelouses vertes, les mêmes
 * maisons répétées. La végétation y est domestique — c'est la vie qui
 * végète, pas la nature qui gagne.
 */
function EraVegetativeField() {
  const housesRef = useRef<THREE.InstancedMesh>(null);
  const roofsRef = useRef<THREE.InstancedMesh>(null);
  const garagesRef = useRef<THREE.InstancedMesh>(null);
  const hedgesRef = useRef<THREE.InstancedMesh>(null);
  const lawnsRef = useRef<THREE.InstancedMesh>(null);
  const treesRef = useRef<THREE.InstancedMesh>(null);
  const lampsRef = useRef<THREE.InstancedMesh>(null);

  const placements = useMemo(() => {
    const rng = fableRng(500912);
    const houses: THREE.Matrix4[] = [];
    const roofs: THREE.Matrix4[] = [];
    const garages: THREE.Matrix4[] = [];
    const hedges: THREE.Matrix4[] = [];
    const lawns: THREE.Matrix4[] = [];
    const trees: THREE.Matrix4[] = [];
    const lamps: THREE.Matrix4[] = [];

    // Les parcelles bordent la rue ET la boucle : c'est la répétition des
    // mêmes maisons sur deux rues différentes qui rend le retour ambigu.
    const streets: Array<Array<[number, number, number]>> = [
      spineFrames(15, 23, 3).map((f) => [f.x, f.y, f.z] as [number, number, number]),
      FABLE_SUBURB_LOOP,
    ];

    for (const street of streets) {
      for (let i = 1; i < street.length - 1; i += 1) {
        const [x, , z] = street[i];
        const [px, , pz] = street[i - 1];
        const [nx2, , nz2] = street[i + 1];
        const dx = nx2 - px;
        const dz = nz2 - pz;
        const len = Math.hypot(dx, dz) || 1;
        const sx = dz / len;
        const sz = -dx / len;
        const step = Math.hypot(x - px, z - pz);

        // Une parcelle tous les treize mètres environ, des deux côtés.
        if (step < 6) continue;

        for (const side of [-1, 1] as const) {
          const frontX = x + sx * side * 11;
          const frontZ = z + sz * side * 11;

          if (!clearsRoutes(frontX + sx * side * 5, frontZ + sz * side * 5, 5.5)) continue;

          const yaw = Math.atan2(sx * side, sz * side);
          const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw, 0));
          const depth = 9 + rng() * 2;
          const houseX = frontX + sx * side * (depth / 2 + 1.5);
          const houseZ = frontZ + sz * side * (depth / 2 + 1.5);
          const ground = fableGroundY(houseX, houseZ);

          houses.push(
            new THREE.Matrix4().compose(
              new THREE.Vector3(houseX, ground + 3, houseZ),
              q,
              new THREE.Vector3(depth, 6, 10 + rng() * 2)
            )
          );
          roofs.push(
            new THREE.Matrix4().compose(
              new THREE.Vector3(houseX, ground + 7, houseZ),
              q,
              new THREE.Vector3(depth + 1.4, 2.4, 11.6)
            )
          );
          garages.push(
            new THREE.Matrix4().compose(
              new THREE.Vector3(
                frontX + sx * side * 3 + dx / len * 4.4,
                ground + 1.6,
                frontZ + sz * side * 3 + dz / len * 4.4
              ),
              q,
              new THREE.Vector3(5.4, 3.2, 5)
            )
          );
          lawns.push(
            new THREE.Matrix4().compose(
              new THREE.Vector3(frontX + sx * side * 2.6, ground + 0.03, frontZ + sz * side * 2.6),
              q,
              new THREE.Vector3(5, 0.06, 7)
            )
          );
          hedges.push(
            new THREE.Matrix4().compose(
              new THREE.Vector3(frontX + sx * side * 5.6, ground + 0.55, frontZ + sz * side * 5.6),
              q,
              new THREE.Vector3(0.9, 1.1, 6)
            )
          );

          if (rng() < 0.5) {
            const th = 4 + rng() * 2.5;
            trees.push(
              new THREE.Matrix4().compose(
                new THREE.Vector3(frontX + sx * side * 1.6, ground + th / 2, frontZ + sz * side * 1.6),
                new THREE.Quaternion(),
                new THREE.Vector3(2.2, th, 2.2)
              )
            );
          }
        }

        if (i % 3 === 0) {
          const lx = x + sx * 10;
          const lz = z + sz * 10;
          lamps.push(
            new THREE.Matrix4().compose(
              new THREE.Vector3(lx, fableGroundY(lx, lz) + 3.4, lz),
              new THREE.Quaternion(),
              new THREE.Vector3(1, 6.8, 1)
            )
          );
        }
      }
    }

    return { houses, roofs, garages, hedges, lawns, trees, lamps };
  }, []);

  useEffect(() => {
    const apply = (mesh: THREE.InstancedMesh | null, list: THREE.Matrix4[]) => {
      if (!mesh) return;

      list.forEach((m, i) => mesh.setMatrixAt(i, m));
      mesh.instanceMatrix.needsUpdate = true;
    };
    apply(housesRef.current, placements.houses);
    apply(roofsRef.current, placements.roofs);
    apply(garagesRef.current, placements.garages);
    apply(hedgesRef.current, placements.hedges);
    apply(lawnsRef.current, placements.lawns);
    apply(treesRef.current, placements.trees);
    apply(lampsRef.current, placements.lamps);
  }, [placements]);

  return (
    <group>
      {/* La desserte qui tourne et revient — sans qu'on s'en aperçoive. */}
      <RouteRibbon points={FABLE_SUBURB_LOOP} width={7.6} color="#6a6d70" lift={0.06} />

      <instancedMesh ref={housesRef} args={[undefined, undefined, placements.houses.length]} frustumCulled={false} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#cfc9bb" roughness={0.93} />
      </instancedMesh>
      <instancedMesh ref={roofsRef} args={[undefined, undefined, placements.roofs.length]} frustumCulled={false} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#4c4a49" roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={garagesRef} args={[undefined, undefined, placements.garages.length]} frustumCulled={false} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#b9b3a6" roughness={0.92} />
      </instancedMesh>
      <instancedMesh ref={lawnsRef} args={[undefined, undefined, placements.lawns.length]} frustumCulled={false} receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#4e6b39" roughness={0.96} />
      </instancedMesh>
      <instancedMesh ref={hedgesRef} args={[undefined, undefined, placements.hedges.length]} frustumCulled={false} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#38502f" roughness={0.97} />
      </instancedMesh>
      <instancedMesh ref={treesRef} args={[undefined, undefined, placements.trees.length]} frustumCulled={false} castShadow>
        <sphereGeometry args={[0.5, 7, 6]} />
        <meshStandardMaterial color="#435a34" roughness={0.96} flatShading />
      </instancedMesh>
      <instancedMesh ref={lampsRef} args={[undefined, undefined, placements.lamps.length]} frustumCulled={false}>
        <cylinderGeometry args={[0.06, 0.09, 1, 6]} />
        <meshStandardMaterial color="#8d9094" roughness={0.7} metalness={0.35} />
      </instancedMesh>
    </group>
  );
}

/* ─── NEW SIGNAL — corniche et océan ──────────────────────────────────── */

const oceanVertex = /* glsl */ `
  varying vec3 vWorldPos;

  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const oceanFragment = /* glsl */ `
  uniform vec3 uSunDir;
  uniform vec3 uSunColor;
  uniform vec3 uDeep;
  uniform vec3 uSky;
  uniform vec3 uCameraPos;
  uniform float uTime;
  varying vec3 vWorldPos;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1,0)), f.x),
               mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
  }

  void main() {
    vec2 p = vWorldPos.xz;
    float swell = noise(p * 0.045 + vec2(uTime * 0.03, uTime * 0.02));
    float chop = noise(p * 0.22 - vec2(uTime * 0.09, 0.0));
    vec3 normal = normalize(vec3((swell - chop) * 0.35, 1.0, (chop - swell) * 0.3));
    vec3 viewDir = normalize(vWorldPos - uCameraPos);
    vec3 r = reflect(viewDir, normal);
    float fresnel = pow(1.0 - clamp(dot(-viewDir, normal), 0.0, 1.0), 2.6);
    vec3 color = mix(uDeep, uSky, clamp(fresnel * 1.5 + 0.16, 0.0, 1.0));

    // Le chemin du soleil sur la mer : c'est lui qui fait l'image.
    float glare = pow(clamp(dot(r, uSunDir), 0.0, 1.0), 16.0);
    color += uSunColor * glare * (0.4 + chop * 1.6);

    // Écume sur les crêtes, plus dense près du rivage.
    float shore = smoothstep(70.0, 26.0, vWorldPos.x);
    float foam = smoothstep(0.62, 0.9, chop + swell * 0.5) * shore;
    color = mix(color, vec3(0.86, 0.88, 0.9), foam * 0.55);

    gl_FragColor = vec4(color, 1.0);
  }
`;

function Ocean({ sunDir, sunColor }: { sunDir: THREE.Vector3; sunColor: THREE.Color }) {
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: oceanVertex,
        fragmentShader: oceanFragment,
        uniforms: {
          uSunDir: { value: sunDir },
          uSunColor: { value: sunColor },
          uDeep: { value: new THREE.Color("#1b2836") },
          uSky: { value: new THREE.Color("#c69a72") },
          uCameraPos: { value: new THREE.Vector3() },
          uTime: { value: 0 },
        },
      }),
    [sunDir, sunColor]
  );

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
  });

  return (
    <group>
      {/* Océan au sud de la péninsule. */}
      <mesh material={material} position={[120, 0, -320]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[900, 460, 48, 32]} />
      </mesh>
      {/* Baie intérieure : c'est elle qui creuse le fer à cheval. */}
      <mesh material={material} position={[258, 0, 85]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[310, 400, 30, 38]} />
      </mesh>
    </group>
  );
}

/**
 * Le masterframe : route de corniche mouillée, glissière, falaise, la baie
 * en contrebas avec ses lumières, l'océan qui prend tout le couchant.
 */
function EraNewSignal({
  sunDir,
  sunColor,
}: {
  sunDir: THREE.Vector3;
  sunColor: THREE.Color;
}) {
  const scrubRef = useRef<THREE.InstancedMesh>(null);
  const railRef = useRef<THREE.InstancedMesh>(null);
  const townRef = useRef<THREE.InstancedMesh>(null);
  const glow = getFableGlowTexture();

  const placements = useMemo(() => {
    const rng = fableRng(770194);
    const scrub: THREE.Matrix4[] = [];
    const rail: THREE.Matrix4[] = [];
    const town: THREE.Matrix4[] = [];
    const frames = spineFrames(23, 32, 8);

    for (const frame of frames) {
      // Glissière côté mer, poteau tous les trois mètres environ.
      const rx = frame.x + frame.sx * 5.4;
      const rz = frame.z + frame.sz * 5.4;
      rail.push(
        new THREE.Matrix4().compose(
          new THREE.Vector3(rx, fableGroundY(rx, rz) + 0.5, rz),
          new THREE.Quaternion(),
          new THREE.Vector3(0.12, 1, 0.12)
        )
      );

      // Maquis sur le talus amont, rare côté mer.
      for (let i = 0; i < 9; i += 1) {
        const side = rng() < 0.68 ? -1 : 1;
        const lateral = side * (7 + rng() * rng() * 44);
        const x = frame.x + frame.sx * lateral;
        const z = frame.z + frame.sz * lateral;

        if (!clearsRoutes(x, z, 3.4)) continue;

        const y = fableGroundY(x, z);

        if (y < 1) continue;

        const sc = 0.7 + rng() * 1.9;
        scrub.push(
          new THREE.Matrix4().compose(
            new THREE.Vector3(x, y + sc * 0.35, z),
            new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rng() * 3, 0)),
            new THREE.Vector3(sc, sc * 0.75, sc)
          )
        );
      }
    }

    // La ville au fond de la baie : c'est Birth Yard qu'on aperçoit de la
    // côte, de l'autre côté de l'eau. Le monde se referme visuellement.
    for (let i = 0; i < 110; i += 1) {
      const a = rng() * Math.PI * 2;
      const d = 40 + rng() * 120;
      const x = 30 + Math.cos(a) * d;
      const z = 150 + Math.sin(a) * d * 0.7;
      const h = 5 + rng() * rng() * 26;
      town.push(
        new THREE.Matrix4().compose(
          new THREE.Vector3(x, 1 + h / 2, z),
          new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rng() * 0.5, 0)),
          new THREE.Vector3(7 + rng() * 11, h, 7 + rng() * 11)
        )
      );
    }

    return { scrub, rail, town };
  }, []);

  useEffect(() => {
    const apply = (mesh: THREE.InstancedMesh | null, list: THREE.Matrix4[]) => {
      if (!mesh) return;

      list.forEach((m, i) => mesh.setMatrixAt(i, m));
      mesh.instanceMatrix.needsUpdate = true;
    };
    apply(scrubRef.current, placements.scrub);
    apply(railRef.current, placements.rail);
    apply(townRef.current, placements.town);
  }, [placements]);

  const marker = spineFrame(31);
  const lighthouse = spineFrame(27);

  return (
    <group>
      {/* La descente au cap : on perd la vue pour la retrouver au ras. */}
      <RouteRibbon points={FABLE_HEADLAND_ROUTE} width={6.6} color="#8e8880" />
      <Ocean sunDir={sunDir} sunColor={sunColor} />

      <instancedMesh ref={railRef} args={[undefined, undefined, placements.rail.length]} frustumCulled={false} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#9aa0a4" roughness={0.6} metalness={0.5} />
      </instancedMesh>
      <instancedMesh ref={scrubRef} args={[undefined, undefined, placements.scrub.length]} frustumCulled={false} castShadow>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#57603f" roughness={0.97} flatShading />
      </instancedMesh>
      <instancedMesh ref={townRef} args={[undefined, undefined, placements.town.length]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#7d7468" roughness={0.95} emissive="#ffb066" emissiveIntensity={0.4} />
      </instancedMesh>

      {/* La borne du registre — le Λ redevenu objet ordinaire du monde. */}
      <group
        position={[
          marker.x + marker.sx * 6.6,
          fableGroundY(marker.x + marker.sx * 6.6, marker.z + marker.sz * 6.6),
          marker.z + marker.sz * 6.6,
        ]}
      >
        <mesh position={[0, 0.85, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.5, 1.7, 1.1]} />
          <meshStandardMaterial color="#8d8579" roughness={0.96} flatShading />
        </mesh>
      </group>

      {/* Phare de la pointe : point fixe dans tout le couchant. */}
      <group
        position={[
          lighthouse.x + lighthouse.sx * 62,
          0.5,
          lighthouse.z + lighthouse.sz * 62,
        ]}
      >
        <mesh position={[0, 9, 0]} castShadow>
          <cylinderGeometry args={[1.4, 2.2, 18, 10]} />
          <meshStandardMaterial color="#ada79b" roughness={0.92} />
        </mesh>
        <mesh position={[0, 18.6, 0]}>
          <sphereGeometry args={[1.1, 8, 6]} />
          <meshBasicMaterial color="#ffe9be" toneMapped={false} />
        </mesh>
        <sprite position={[0, 18.6, 0]} scale={[16, 16, 1]}>
          <spriteMaterial map={glow} color="#ffd9a0" transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
        </sprite>
      </group>
    </group>
  );
}

/* ─── Streamer ────────────────────────────────────────────────────────── */

/**
 * Chaque ère lointaine se monte quand le joueur s'en approche et se démonte
 * derrière lui. Rien ne se construit tant qu'on ne s'en approche pas :
 * c'est ce qui rend le monde complet abordable.
 */
export default function FableFarEras({
  vehicleZRef,
  vehicleXRef,
  sunDir,
  sunColor,
}: {
  vehicleZRef: React.MutableRefObject<number>;
  vehicleXRef: React.MutableRefObject<number>;
  sunDir: THREE.Vector3;
  sunColor: THREE.Color;
}) {
  const [mounted, setMounted] = useState<Record<string, boolean>>({
    mountain: false,
    suburb: false,
    coast: false,
  });
  const mountedRef = useRef(mounted);

  useEffect(() => {
    mountedRef.current = mounted;
  }, [mounted]);

  useFrame(() => {
    const x = vehicleXRef.current;
    const z = vehicleZRef.current;
    // Streaming par voisinage de région : sur une péninsule pliée, la
    // distance en z ne veut plus rien dire — la côte peut être juste
    // derrière le massif.
    const near = (region: FableRegion, margin: number) =>
      Math.hypot(x - region.x, z - region.z) < region.radius + margin;

    const next = {
      mountain: near(REGION["os-approach"], 220) || near(REGION["os-massif"], 220),
      suburb: near(REGION["vf-basin"], 240),
      coast:
        near(REGION["ns-coast"], 260) ||
        near(REGION["ns-west"], 260) ||
        near(REGION["central-bay"], 120),
    };
    const current = mountedRef.current;

    if (
      next.mountain !== current.mountain ||
      next.suburb !== current.suburb ||
      next.coast !== current.coast
    ) {
      setMounted(next);
    }
  });

  return (
    <group>
      <PeninsulaTerrain vehicleXRef={vehicleXRef} vehicleZRef={vehicleZRef} />
      {mounted.mountain ? <EraOlderShadows /> : null}
      {mounted.suburb ? <EraVegetativeField /> : null}
      {mounted.coast ? <EraNewSignal sunDir={sunDir} sunColor={sunColor} /> : null}
    </group>
  );
}
