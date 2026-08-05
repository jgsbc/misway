"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getFableGlowTexture } from "@/components/drift-3d/fable/fableTextures";
import { fableRng } from "@/components/drift-3d/fable/fableWorld";
import { FABLE_REGIONS } from "@/components/drift-3d/fable/fablePeninsula";
import { FABLE_LANDMARKS } from "@/components/drift-3d/fable/fableLandmarkData";

/** Les positions viennent de la table partagée avec la carte. */
const LANDMARK = Object.fromEntries(FABLE_LANDMARKS.map((l) => [l.id, l]));

/**
 * FABLE — les repères lointains de la péninsule.
 *
 * Ce sont eux qui font tenir le monde ensemble : depuis le massif on voit
 * les grues du port, depuis la banlieue on voit le massif, depuis la côte on
 * voit Birth Yard de l'autre côté de la baie. Sans ces amers, cinq régions
 * restent cinq décors ; avec eux, c'est une seule géographie.
 *
 * Règle : ils sont TOUJOURS montés, même quand leur région détaillée ne
 * l'est pas — sinon la moitié du monde disparaîtrait de l'horizon. Le coût
 * est donc tenu : quelques maillages fusionnés, aucun détail de près, et le
 * brouillard de l'ère fait le reste.
 */

const BY = FABLE_REGIONS[1];
const MASSIF = FABLE_REGIONS[3];
const BASIN = FABLE_REGIONS[4];

/** Silhouettes du port : grues, cheminées, masse bâtie, halo chaud. */
function PortLandmark() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const craneRef = useRef<THREE.InstancedMesh>(null);
  const glow = getFableGlowTexture();

  const { blocks, cranes } = useMemo(() => {
    const rng = fableRng(9001);
    const blockList: THREE.Matrix4[] = [];
    const craneList: THREE.Matrix4[] = [];

    // Masse bâtie, large et basse : c'est la ville vue de loin.
    for (let i = 0; i < 90; i += 1) {
      const a = rng() * Math.PI * 2;
      const d = 30 + rng() * 130;
      const x = BY.x + Math.cos(a) * d;
      const z = BY.z + Math.sin(a) * d * 0.85;
      const h = 8 + rng() * rng() * 34;
      blockList.push(
        new THREE.Matrix4().compose(
          new THREE.Vector3(x, h / 2, z),
          new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rng() * 0.6, 0)),
          new THREE.Vector3(9 + rng() * 14, h, 9 + rng() * 14)
        )
      );
    }

    // Les grues : la signature du port, reconnaissable à trente kilomètres.
    for (let i = 0; i < 7; i += 1) {
      const x = BY.x - 30 + rng() * 60;
      const z = BY.z + 60 + rng() * 70;
      const h = 42 + rng() * 22;
      // Mât.
      craneList.push(
        new THREE.Matrix4().compose(
          new THREE.Vector3(x, h / 2, z),
          new THREE.Quaternion(),
          new THREE.Vector3(2.2, h, 2.2)
        )
      );
      // Flèche, inclinée — c'est elle qui se lit sur le ciel.
      craneList.push(
        new THREE.Matrix4().compose(
          new THREE.Vector3(x + 14, h - 4, z),
          new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, -0.22)),
          new THREE.Vector3(34, 1.8, 1.8)
        )
      );
    }

    return { blocks: blockList, cranes: craneList };
  }, []);

  useEffect(() => {
    const apply = (mesh: THREE.InstancedMesh | null, list: THREE.Matrix4[]) => {
      if (!mesh) return;

      list.forEach((m, i) => mesh.setMatrixAt(i, m));
      mesh.instanceMatrix.needsUpdate = true;
    };
    apply(meshRef.current, blocks);
    apply(craneRef.current, cranes);
  }, [blocks, cranes]);

  return (
    <group>
      <instancedMesh ref={meshRef} args={[undefined, undefined, blocks.length]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#6f6a63"
          roughness={0.98}
          emissive="#ff9a52"
          emissiveIntensity={0.22}
        />
      </instancedMesh>
      <instancedMesh ref={craneRef} args={[undefined, undefined, cranes.length]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#7a6a42" roughness={0.9} metalness={0.25} />
      </instancedMesh>
      {/* Halo du port : visible de la baie et du massif à la tombée du jour. */}
      <sprite position={[BY.x, 26, BY.z + 40]} scale={[300, 120, 1]}>
        <spriteMaterial
          map={glow}
          color="#ffa860"
          transparent
          opacity={0.2}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>
    </group>
  );
}

/** La masse du massif : le seul objet visible depuis presque partout. */
function MassifLandmark() {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const peaks = useMemo(() => {
    const rng = fableRng(9002);
    const list: THREE.Matrix4[] = [];

    // Couronne de sommets enneigés, très hauts, très espacés : ils tiennent
    // l'horizon nord depuis la banlieue comme depuis la côte.
    for (let i = 0; i < 26; i += 1) {
      const a = rng() * Math.PI * 2;
      const d = 40 + rng() * 150;
      const x = MASSIF.x + Math.cos(a) * d;
      const z = MASSIF.z + Math.sin(a) * d;
      const core = Math.max(0, 1 - d / 200);
      const h = 90 + core * 130 + rng() * 40;
      list.push(
        new THREE.Matrix4().compose(
          new THREE.Vector3(x, MASSIF.baseY + h * 0.34, z),
          new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rng() * Math.PI, 0)),
          new THREE.Vector3(56 + rng() * 60, h, 56 + rng() * 60)
        )
      );
    }

    return list;
  }, []);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    peaks.forEach((m, i) => mesh.setMatrixAt(i, m));
    mesh.instanceMatrix.needsUpdate = true;
  }, [peaks]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, peaks.length]} frustumCulled={false}>
      <coneGeometry args={[0.5, 1, 5]} />
      <meshStandardMaterial color="#b7c2cb" roughness={0.93} flatShading />
    </instancedMesh>
  );
}

/** La masse des toits pavillonnaires, lue depuis la côte et le col. */
function SuburbLandmark() {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const roofs = useMemo(() => {
    const rng = fableRng(9003);
    const list: THREE.Matrix4[] = [];

    for (let i = 0; i < 150; i += 1) {
      const a = rng() * Math.PI * 2;
      const d = 20 + rng() * 140;
      const x = BASIN.x + Math.cos(a) * d;
      const z = BASIN.z + Math.sin(a) * d;
      list.push(
        new THREE.Matrix4().compose(
          new THREE.Vector3(x, BASIN.baseY + 3.4, z),
          new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rng() * Math.PI, 0)),
          new THREE.Vector3(11, 6.4, 13)
        )
      );
    }

    return list;
  }, []);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    roofs.forEach((m, i) => mesh.setMatrixAt(i, m));
    mesh.instanceMatrix.needsUpdate = true;
  }, [roofs]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, roofs.length]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#5d5a55" roughness={0.95} />
    </instancedMesh>
  );
}

/**
 * Le phare du cap sud : depuis le col comme depuis la baie, c'est le seul
 * point fixe du sud. Il ferme la lecture de la péninsule.
 */
function CoastLandmark() {
  const glow = getFableGlowTexture();

  return (
    <group position={[LANDMARK.cape.x, 2, LANDMARK.cape.z]}>
      <mesh position={[0, 16, 0]}>
        <cylinderGeometry args={[2.4, 4, 32, 10]} />
        <meshStandardMaterial color="#b3ada1" roughness={0.92} />
      </mesh>
      <mesh position={[0, 33.5, 0]}>
        <sphereGeometry args={[2, 8, 6]} />
        <meshBasicMaterial color="#ffe9be" toneMapped={false} />
      </mesh>
      <sprite position={[0, 33.5, 0]} scale={[60, 60, 1]}>
        <spriteMaterial
          map={glow}
          color="#ffd9a0"
          transparent
          opacity={0.42}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>
    </group>
  );
}

/**
 * Un amer s'efface quand on entre chez lui : de près, c'est la région
 * détaillée qui prend le relais. De loin il est toujours là — c'est tout
 * l'intérêt.
 */
function DistantOnly({
  x,
  z,
  hideWithin,
  vehicleXRef,
  vehicleZRef,
  children,
}: {
  x: number;
  z: number;
  hideWithin: number;
  vehicleXRef: React.MutableRefObject<number>;
  vehicleZRef: React.MutableRefObject<number>;
  children: React.ReactNode;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;

    group.visible =
      Math.hypot(vehicleXRef.current - x, vehicleZRef.current - z) > hideWithin;
  });

  return <group ref={groupRef}>{children}</group>;
}

export default function FableLandmarks({
  vehicleXRef,
  vehicleZRef,
}: {
  vehicleXRef: React.MutableRefObject<number>;
  vehicleZRef: React.MutableRefObject<number>;
}) {
  return (
    <group>
      <DistantOnly x={LANDMARK.port.x} z={LANDMARK.port.z} hideWithin={LANDMARK.port.hideWithin} vehicleXRef={vehicleXRef} vehicleZRef={vehicleZRef}>
        <PortLandmark />
      </DistantOnly>
      <DistantOnly x={LANDMARK.massif.x} z={LANDMARK.massif.z} hideWithin={LANDMARK.massif.hideWithin} vehicleXRef={vehicleXRef} vehicleZRef={vehicleZRef}>
        <MassifLandmark />
      </DistantOnly>
      <DistantOnly x={LANDMARK.suburb.x} z={LANDMARK.suburb.z} hideWithin={LANDMARK.suburb.hideWithin} vehicleXRef={vehicleXRef} vehicleZRef={vehicleZRef}>
        <SuburbLandmark />
      </DistantOnly>
      <DistantOnly x={LANDMARK.cape.x} z={LANDMARK.cape.z} hideWithin={LANDMARK.cape.hideWithin} vehicleXRef={vehicleXRef} vehicleZRef={vehicleZRef}>
        <CoastLandmark />
      </DistantOnly>
    </group>
  );
}
