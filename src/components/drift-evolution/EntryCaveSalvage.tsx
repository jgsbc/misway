"use client";

import { useEffect, useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getDriftMaterialMaps } from "@/components/drift-3d/drift3dTextureFactory";
import { getDrift3DGroundY } from "@/lib/drift3dTerrain";
import type { Drift3DVehiclePhysicsState } from "@/lib/drift3dVehiclePhysics";
import {
  DRIFT_EVOLUTION_ENTRY_CAVE,
  DRIFT_EVOLUTION_ENTRY_PORTAL_OUTLINE,
} from "@/lib/driftEvolutionEntryCave";

function noise2(x: number, y: number) {
  const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return value - Math.floor(value);
}

function fbm(x: number, y: number) {
  return (
    (noise2(x, y) - 0.5) +
    (noise2(x * 2.7 + 11, y * 2.7) - 0.5) * 0.5 +
    (noise2(x * 6.1 + 41, y * 6.1) - 0.5) * 0.25
  );
}

function useEntryCaveGeometry() {
  return useMemo(() => {
    const cave = DRIFT_EVOLUTION_ENTRY_CAVE;
    const positions: number[] = [];
    const uvs: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];

    for (let ring = 0; ring <= cave.rings; ring += 1) {
      const t = ring / cave.rings;
      const z = cave.startZ + (cave.mouthZ - cave.startZ) * t;
      const floorY = getDrift3DGroundY(cave.centerX, z) - 0.18;
      const mouthOpen = THREE.MathUtils.smoothstep(t, 0.68, 1);

      for (let around = 0; around <= cave.around; around += 1) {
        const s = around / cave.around;
        const angle = Math.PI * (1 - s);
        const rockNoise = fbm(s * 5.2 + 3, z * 0.37);
        const width =
          cave.halfWidth *
          (1 + rockNoise * 0.18 + mouthOpen * 0.09);
        const apex =
          cave.apexHeight *
          (1 + fbm(s * 3.4 + 9, z * 0.24) * 0.14 + mouthOpen * 0.08);
        const radialNoise = fbm(s * 9 + 21, z * 0.82) * 0.32;
        const nx = Math.cos(angle);
        const ny = Math.max(0.16, Math.sin(angle));
        const localX = nx * width + nx * radialNoise;
        const y =
          floorY +
          Math.pow(Math.max(0, Math.sin(angle)), 0.72) * apex +
          ny * radialNoise * 0.52;

        positions.push(localX, y, z);
        uvs.push(s * 3.5, t * 5.2);

        const corner = 0.48 + Math.pow(Math.sin(angle), 0.7) * 0.42;
        const depth = 0.68 + t * 0.24;
        const variation = fbm(s * 13, z * 0.9) * 0.08;
        const shade = THREE.MathUtils.clamp(corner * depth + variation, 0.24, 0.95);
        colors.push(shade, shade * 0.985, shade * 0.97);
      }
    }

    for (let ring = 0; ring < cave.rings; ring += 1) {
      for (let around = 0; around < cave.around; around += 1) {
        const a = ring * (cave.around + 1) + around;
        const b = a + 1;
        const c = a + cave.around + 1;
        const d = c + 1;
        indices.push(a, c, b, b, c, d);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(colors, 3)
    );
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    return geometry;
  }, []);
}

function useFracturedPortalGeometry() {
  return useMemo(() => {
    const cave = DRIFT_EVOLUTION_ENTRY_CAVE;
    const floorY = getDrift3DGroundY(cave.centerX, cave.mouthZ);
    const wall = new THREE.Shape();
    wall.moveTo(-9.2, -0.55);
    wall.lineTo(9.2, -0.55);
    wall.lineTo(9.2, 8.5);
    wall.lineTo(6.8, 9.2);
    wall.lineTo(3.9, 9.65);
    wall.lineTo(0.9, 9.35);
    wall.lineTo(-2.4, 9.72);
    wall.lineTo(-5.8, 9.15);
    wall.lineTo(-9.2, 8.15);
    wall.closePath();

    const hole = new THREE.Path();
    const first = DRIFT_EVOLUTION_ENTRY_PORTAL_OUTLINE[0];
    hole.moveTo(first[0], first[1]);
    for (let index = 1; index < DRIFT_EVOLUTION_ENTRY_PORTAL_OUTLINE.length; index += 1) {
      const [x, y] = DRIFT_EVOLUTION_ENTRY_PORTAL_OUTLINE[index];
      hole.lineTo(x, y);
    }
    hole.closePath();
    wall.holes.push(hole);

    const geometry = new THREE.ExtrudeGeometry(wall, {
      depth: cave.portalDepth,
      bevelEnabled: false,
      curveSegments: 1,
      steps: 1,
    });
    geometry.translate(
      0,
      floorY + 0.02,
      cave.mouthZ - cave.portalDepth * 0.5
    );
    geometry.computeVertexNormals();

    return geometry;
  }, []);
}

function useDustPositions() {
  return useMemo(() => {
    const cave = DRIFT_EVOLUTION_ENTRY_CAVE;
    const positions = new Float32Array(cave.dustCount * 3);

    for (let index = 0; index < cave.dustCount; index += 1) {
      const zT = noise2(index + 17, 4);
      const z = cave.startZ + 1 + zT * (cave.mouthZ - cave.startZ - 2);
      const floorY = getDrift3DGroundY(cave.centerX, z);
      positions[index * 3] =
        (noise2(index + 31, 7) - 0.5) * cave.halfWidth * 1.45;
      positions[index * 3 + 1] =
        floorY + 0.35 + noise2(index + 71, 9) * (cave.apexHeight * 0.7);
      positions[index * 3 + 2] = z;
    }

    return positions;
  }, []);
}

export default function EntryCaveSalvage({
  vehicleStateRef,
}: {
  vehicleStateRef: MutableRefObject<Drift3DVehiclePhysicsState>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const dustRef = useRef<THREE.Points>(null);
  const caveGeometry = useEntryCaveGeometry();
  const portalGeometry = useFracturedPortalGeometry();
  const dustPositions = useDustPositions();
  const rockMaps = getDriftMaterialMaps("rock", 4.2, 3.2);
  const cave = DRIFT_EVOLUTION_ENTRY_CAVE;
  const mouthFloor = getDrift3DGroundY(cave.centerX, cave.mouthZ);

  useEffect(() => {
    return () => {
      caveGeometry.dispose();
      portalGeometry.dispose();
    };
  }, [caveGeometry, portalGeometry]);

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group) return;

    const vehicle = vehicleStateRef.current.position;
    const centerZ = (cave.startZ + cave.mouthZ) * 0.5;
    group.visible =
      Math.hypot(vehicle.x - cave.centerX, vehicle.z - centerZ) <
      cave.activationRadius;

    if (dustRef.current) {
      dustRef.current.position.y = Math.sin(clock.elapsedTime * 0.22) * 0.035;
    }
  });

  return (
    <group ref={groupRef} position={[cave.centerX, 0, 0]} aria-hidden="true">
      <mesh geometry={caveGeometry} receiveShadow castShadow>
        <meshStandardMaterial
          color="#5c5852"
          map={rockMaps.map}
          normalMap={rockMaps.normalMap}
          normalScale={new THREE.Vector2(0.72, 0.72)}
          vertexColors
          roughness={0.98}
          metalness={0}
          side={THREE.BackSide}
        />
      </mesh>

      <mesh geometry={portalGeometry} receiveShadow castShadow>
        <meshStandardMaterial
          color="#5b5751"
          map={rockMaps.map}
          normalMap={rockMaps.normalMap}
          normalScale={new THREE.Vector2(0.8, 0.8)}
          roughness={0.99}
          metalness={0}
        />
      </mesh>

      <mesh
        position={[0, mouthFloor + 3.05, cave.mouthZ + cave.portalDepth * 0.75]}
        renderOrder={-2}
      >
        <planeGeometry args={[9.4, 6.6]} />
        <meshBasicMaterial
          color="#d7e6ec"
          transparent
          opacity={0.24}
          depthWrite={false}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>

      <points ref={dustRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dustPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color="#d6d0c7"
          size={0.055}
          sizeAttenuation
          transparent
          opacity={0.32}
          depthWrite={false}
        />
      </points>
    </group>
  );
}
