"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { getDriftMaterialMaps } from "@/components/drift-3d/drift3dTextureFactory";
import { getFableGlowTexture } from "@/components/drift-3d/fable/fableTextures";
import {
  fableFarPathX,
  fableGroundY,
  fableRng,
  fableRouteAltitude,
} from "@/components/drift-3d/fable/fableWorld";
import {
  FABLE_BELVEDERE_ROUTE,
  FABLE_HEADLAND_ROUTE,
  FABLE_SUBURB_LOOP,
  registerFableWorldRoutes,
} from "@/components/drift-3d/fable/fableBranches";
import { fableFarPathX as spineX } from "@/components/drift-3d/fable/fableWorld";
import { fableRouteField } from "@/components/drift-3d/fable/fableRoutes";

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

function EraTerrain({
  z0,
  z1,
  color,
  material,
  segments = 96,
}: {
  z0: number;
  z1: number;
  color: string;
  material: "rock" | "sand" | "concrete";
  segments?: number;
}) {
  const maps = getDriftMaterialMaps(material, 40, 60);
  const geometry = useMemo(() => {
    const width = 220;
    const depth = z1 - z0;
    const geo = new THREE.PlaneGeometry(width, depth, segments, Math.round(segments * 1.4));
    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const base = new THREE.Color(color);
    const shade = new THREE.Color();

    for (let i = 0; i < pos.count; i += 1) {
      const x = pos.getX(i);
      const z = -pos.getY(i) + (z0 + z1) / 2;
      const y = fableGroundY(x, z);
      pos.setZ(i, y);
      // Variation basse fréquence : la matière respire sur la distance.
      const v = 0.82 + Math.sin(x * 0.031 + z * 0.017) * 0.1 + Math.sin(z * 0.09) * 0.06;
      shade.copy(base).multiplyScalar(v);
      colors[i * 3] = shade.r;
      colors[i * 3 + 1] = shade.g;
      colors[i * 3 + 2] = shade.b;
    }

    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();

    return geo;
  }, [z0, z1, color, segments]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, (z0 + z1) / 2]}
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

/** Ruban de route qui suit le tracé lointain. */
function EraRoad({
  z0,
  z1,
  width,
  color,
  lift = 0.07,
}: {
  z0: number;
  z1: number;
  width: number;
  color: string;
  lift?: number;
}) {
  const geometry = useMemo(() => {
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    let row = 0;

    for (let z = z0; z <= z1; z += 2.4, row += 1) {
      const cx = fableFarPathX(z);
      const half = width / 2;
      const y = fableGroundY(cx, z) + lift;
      positions.push(cx - half, y, z, cx + half, y, z);
      uvs.push(0, z / 8, 1, z / 8);

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
  }, [z0, z1, width, lift]);

  useEffect(() => () => geometry.dispose(), [geometry]);
  const maps = getDriftMaterialMaps("concrete", 2, 40);

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial map={maps.map ?? undefined} color={color} roughness={0.95} />
    </mesh>
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
    registerFableWorldRoutes(spineX, fableRouteAltitude);
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

    // Pics : la ligne d'horizon de l'ère, très loin, très hauts.
    for (let i = 0; i < 34; i += 1) {
      const z = 200 + rng() * 320;
      const side = rng() < 0.5 ? -1 : 1;
      const x = fableFarPathX(z) + side * (70 + rng() * 90);
      const h = 60 + rng() * rng() * 130;
      e.set(0, rng() * Math.PI, 0);
      q.setFromEuler(e);
      peaks.push(
        new THREE.Matrix4().compose(
          new THREE.Vector3(x, fableRouteAltitude(z) + h * 0.28, z),
          q,
          new THREE.Vector3(38 + rng() * 46, h, 38 + rng() * 46)
        )
      );
    }

    // Conifères : denses en contrebas, ils s'arrêtent net à la limite des arbres.
    for (let i = 0; i < 900; i += 1) {
      const z = 175 + rng() * 300;
      const treeLine = 1 - Math.min(1, Math.max(0, (fableRouteAltitude(z) - 34) / 30));

      if (rng() > treeLine) continue;

      const side = rng() < 0.5 ? -1 : 1;
      const x = fableFarPathX(z) + side * (10 + rng() * rng() * 62);

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

    // Blocs erratiques le long de la piste.
    for (let i = 0; i < 220; i += 1) {
      const z = 175 + rng() * 300;
      const side = rng() < 0.5 ? -1 : 1;
      const x = fableFarPathX(z) + side * (5 + rng() * rng() * 34);

      if (!clearsRoutes(x, z, 3.2)) continue;

      const y = fableGroundY(x, z);
      const s = 0.7 + rng() * rng() * 5;
      e.set(rng() * Math.PI, rng() * Math.PI, rng() * Math.PI);
      q.setFromEuler(e);
      rocks.push(
        new THREE.Matrix4().compose(
          new THREE.Vector3(x, y + s * 0.25, z),
          q,
          new THREE.Vector3(s, s * 0.8, s)
        )
      );
    }

    // Cairns : ils jalonnent le chemin — l'anomalie de RISE viendra d'eux.
    for (let i = 0; i < 26; i += 1) {
      const z = 200 + i * 9 + rng() * 4;
      const side = rng() < 0.5 ? -1 : 1;
      const x = fableFarPathX(z) + side * (5.5 + rng() * 2.5);

      if (!clearsRoutes(x, z, 2.2)) continue;

      const y = fableGroundY(x, z);

      for (let s = 0; s < 4; s += 1) {
        const r = 0.42 - s * 0.07;
        cairns.push(
          new THREE.Matrix4().compose(
            new THREE.Vector3(x + (rng() - 0.5) * 0.08, y + 0.14 + s * 0.24, z),
            new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rng() * 3, 0)),
            new THREE.Vector3(r, 0.22, r)
          )
        );
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

  return (
    <group>
      <EraTerrain z0={170} z1={480} color="#8b8b76" material="rock" />
      <EraRoad z0={172} z1={478} width={7.4} color="#9c9184" />
      {/* La montée au belvédère : trois lacets, un cul-de-sac, une vue. */}
      <RouteRibbon points={FABLE_BELVEDERE_ROUTE} width={6.4} color="#94897b" />

      {/* Pics : cônes larges, sommets clairs — la neige se lit à la couleur. */}
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

      {/* Le refuge sur la crête — le seul bâti de l'ère, donc il compte. */}
      <group
        position={[
          fableFarPathX(356) + 30,
          fableGroundY(fableFarPathX(356) + 30, 356),
          356,
        ]}
        rotation={[0, -0.5, 0]}
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
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();

    // Parcelles identiques des deux côtés, alignées au cordeau.
    for (let z = 480; z < 700; z += 13) {
      for (const side of [-1, 1] as const) {
        const cx = fableFarPathX(z);
        const front = cx + side * 11;

        if (!clearsRoutes(front + side * 5, z, 5.5)) continue;

        const y = fableGroundY(front, z);
        const yaw = side < 0 ? Math.PI / 2 : -Math.PI / 2;
        e.set(0, yaw, 0);
        q.setFromEuler(e);
        const depth = 9 + rng() * 2;
        const houseX = front + side * (depth / 2 + 1.5);

        houses.push(
          new THREE.Matrix4().compose(
            new THREE.Vector3(houseX, y + 3, z),
            q,
            new THREE.Vector3(depth, 6, 10 + rng() * 2)
          )
        );
        // Toit à deux pentes, tuile sombre.
        roofs.push(
          new THREE.Matrix4().compose(
            new THREE.Vector3(houseX, y + 7, z),
            new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw, 0)),
            new THREE.Vector3(depth + 1.4, 2.4, 11.6)
          )
        );
        // Garage avancé vers la rue.
        garages.push(
          new THREE.Matrix4().compose(
            new THREE.Vector3(front + side * 3, y + 1.6, z + 4.4),
            q,
            new THREE.Vector3(5.4, 3.2, 5)
          )
        );
        // Pelouse et haie taillée.
        lawns.push(
          new THREE.Matrix4().compose(
            new THREE.Vector3(front + side * 2.6, y + 0.03, z - 2),
            q,
            new THREE.Vector3(5, 0.06, 7)
          )
        );
        hedges.push(
          new THREE.Matrix4().compose(
            new THREE.Vector3(front + side * 5.6, y + 0.55, z - 5.6),
            q,
            new THREE.Vector3(0.9, 1.1, 6)
          )
        );

        if (rng() < 0.55) {
          const th = 4 + rng() * 2.5;
          trees.push(
            new THREE.Matrix4().compose(
              new THREE.Vector3(front + side * 1.6, y + th / 2, z - 3.5),
              new THREE.Quaternion(),
              new THREE.Vector3(2.2, th, 2.2)
            )
          );
        }
      }

      // Candélabres, un côté sur deux.
      const lx = fableFarPathX(z) - 10;
      lamps.push(
        new THREE.Matrix4().compose(
          new THREE.Vector3(lx, fableGroundY(lx, z) + 3.4, z),
          new THREE.Quaternion(),
          new THREE.Vector3(1, 6.8, 1)
        )
      );
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
      <EraTerrain z0={470} z1={710} color="#6f7a5e" material="sand" segments={72} />
      {/* Asphalte mouillé : plus clair et plus lisse que partout ailleurs. */}
      <EraRoad z0={472} z1={708} width={9} color="#6a6d70" lift={0.06} />
      {/* La desserte qui tourne et revient — sans qu'on s'en aperçoive. */}
      <RouteRibbon points={FABLE_SUBURB_LOOP} width={7.6} color="#6a6d70" lift={0.06} />

      <instancedMesh
        ref={housesRef}
        args={[undefined, undefined, placements.houses.length]}
        frustumCulled={false}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#cfc9bb" roughness={0.93} />
      </instancedMesh>

      <instancedMesh
        ref={roofsRef}
        args={[undefined, undefined, placements.roofs.length]}
        frustumCulled={false}
        castShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#4c4a49" roughness={0.9} />
      </instancedMesh>

      <instancedMesh
        ref={garagesRef}
        args={[undefined, undefined, placements.garages.length]}
        frustumCulled={false}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#b9b3a6" roughness={0.92} />
      </instancedMesh>

      <instancedMesh
        ref={lawnsRef}
        args={[undefined, undefined, placements.lawns.length]}
        frustumCulled={false}
        receiveShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#4e6b39" roughness={0.96} />
      </instancedMesh>

      <instancedMesh
        ref={hedgesRef}
        args={[undefined, undefined, placements.hedges.length]}
        frustumCulled={false}
        castShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#38502f" roughness={0.97} />
      </instancedMesh>

      <instancedMesh
        ref={treesRef}
        args={[undefined, undefined, placements.trees.length]}
        frustumCulled={false}
        castShadow
      >
        <sphereGeometry args={[0.5, 7, 6]} />
        <meshStandardMaterial color="#435a34" roughness={0.96} flatShading />
      </instancedMesh>

      <instancedMesh
        ref={lampsRef}
        args={[undefined, undefined, placements.lamps.length]}
        frustumCulled={false}
      >
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
    <mesh material={material} position={[190, 0, 860]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[420, 640, 40, 60]} />
    </mesh>
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

    // Garde-corps côté mer, poteau tous les 3 m.
    for (let z = 706; z < 1006; z += 3) {
      const cx = fableFarPathX(z);
      const x = cx + 5.4;
      const y = fableGroundY(x, z);
      rail.push(
        new THREE.Matrix4().compose(
          new THREE.Vector3(x, y + 0.5, z),
          new THREE.Quaternion(),
          new THREE.Vector3(0.12, 1, 0.12)
        )
      );
    }

    // Maquis méditerranéen sur le talus amont.
    for (let i = 0; i < 620; i += 1) {
      const z = 700 + rng() * 310;
      const cx = fableFarPathX(z);
      const side = rng() < 0.62 ? -1 : 1;
      const x = cx + side * (7 + rng() * rng() * 40);

      if (!clearsRoutes(x, z, 3.4)) continue;

      const y = fableGroundY(x, z);
      const s = 0.7 + rng() * 1.9;
      scrub.push(
        new THREE.Matrix4().compose(
          new THREE.Vector3(x, y + s * 0.35, z),
          new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rng() * 3, 0)),
          new THREE.Vector3(s, s * 0.75, s)
        )
      );
    }

    // La ville au fond de la baie : masses basses, très loin.
    for (let i = 0; i < 90; i += 1) {
      const z = 780 + rng() * 240;
      const x = fableFarPathX(z) + 150 + rng() * 90;
      const h = 4 + rng() * rng() * 22;
      town.push(
        new THREE.Matrix4().compose(
          new THREE.Vector3(x, 1 + h / 2, z),
          new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rng() * 0.4, 0)),
          new THREE.Vector3(6 + rng() * 10, h, 6 + rng() * 10)
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

  return (
    <group>
      <EraTerrain z0={700} z1={1010} color="#6d6551" material="rock" segments={80} />
      <EraRoad z0={702} z1={1006} width={8} color="#8e8880" />
      {/* La descente à la pointe : on perd la vue pour la retrouver au ras. */}
      <RouteRibbon points={FABLE_HEADLAND_ROUTE} width={6.6} color="#8e8880" />
      <Ocean sunDir={sunDir} sunColor={sunColor} />

      <instancedMesh
        ref={railRef}
        args={[undefined, undefined, placements.rail.length]}
        frustumCulled={false}
        castShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#9aa0a4" roughness={0.6} metalness={0.5} />
      </instancedMesh>

      <instancedMesh
        ref={scrubRef}
        args={[undefined, undefined, placements.scrub.length]}
        frustumCulled={false}
        castShadow
      >
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#57603f" roughness={0.97} flatShading />
      </instancedMesh>

      <instancedMesh
        ref={townRef}
        args={[undefined, undefined, placements.town.length]}
        frustumCulled={false}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#7d7468"
          roughness={0.95}
          emissive="#ffb066"
          emissiveIntensity={0.35}
        />
      </instancedMesh>

      {/* La borne du registre — le Λ redevenu objet ordinaire du monde. */}
      <group
        position={[
          fableFarPathX(1000) + 6.6,
          fableGroundY(fableFarPathX(1000) + 6.6, 1000),
          1000,
        ]}
      >
        <mesh position={[0, 0.85, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.5, 1.7, 1.1]} />
          <meshStandardMaterial color="#8d8579" roughness={0.96} flatShading />
        </mesh>
        <mesh position={[-0.78, 1.0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[0.85, 0.95]} />
          <meshStandardMaterial color="#cfd4d6" roughness={0.5} metalness={0.3} />
        </mesh>
      </group>

      {/* Phare de la pointe : le seul point fixe dans tout le couchant. */}
      <group position={[fableFarPathX(940) + 78, 0.5, 940]}>
        <mesh position={[0, 9, 0]} castShadow>
          <cylinderGeometry args={[1.4, 2.2, 18, 10]} />
          <meshStandardMaterial color="#ada79b" roughness={0.92} />
        </mesh>
        <mesh position={[0, 18.6, 0]}>
          <sphereGeometry args={[1.1, 8, 6]} />
          <meshBasicMaterial color="#ffe9be" toneMapped={false} />
        </mesh>
        <sprite position={[0, 18.6, 0]} scale={[16, 16, 1]}>
          <spriteMaterial
            map={glow}
            color="#ffd9a0"
            transparent
            opacity={0.5}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
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
  sunDir,
  sunColor,
}: {
  vehicleZRef: React.MutableRefObject<number>;
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
    const z = vehicleZRef.current;
    // Marge large : l'ère suivante existe avant qu'on la voie arriver.
    const next = {
      mountain: z > 40 && z < 620,
      suburb: z > 340 && z < 850,
      coast: z > 560,
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
      {mounted.mountain ? <EraOlderShadows /> : null}
      {mounted.suburb ? <EraVegetativeField /> : null}
      {mounted.coast ? <EraNewSignal sunDir={sunDir} sunColor={sunColor} /> : null}
    </group>
  );
}
