"use client";

import { useEffect, useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getDriftMaterialMaps } from "@/components/drift-3d/drift3dTextureFactory";
import { getDrift3DGroundY } from "@/lib/drift3dTerrain";
import {
  createDrift3DVehiclePhysicsState,
  type Drift3DVehiclePhysicsState,
} from "@/lib/drift3dVehiclePhysics";
import {
  DRIFT_EVOLUTION_ENTRY_CAVE,
  DRIFT_EVOLUTION_ENTRY_PORTAL_OUTLINE,
  getDriftEvolutionEntryPathCenterZ,
  getDriftEvolutionEntryPortalBounds,
  getDriftEvolutionEntryStartPosition,
  getDriftEvolutionEntryTunnelMix,
} from "@/lib/driftEvolutionEntryCave";

function noise2(x: number, y: number) {
  const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return value - Math.floor(value);
}

function fbm(x: number, y: number) {
  return (
    noise2(x, y) -
    0.5 +
    (noise2(x * 2.7 + 11, y * 2.7) - 0.5) * 0.5 +
    (noise2(x * 6.1 + 41, y * 6.1) - 0.5) * 0.25
  );
}

function seededRng(seed: number) {
  let state = seed >>> 0;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function localMouth() {
  const cave = DRIFT_EVOLUTION_ENTRY_CAVE;
  return cave.mouthX - cave.startX;
}

function localExit() {
  const cave = DRIFT_EVOLUTION_ENTRY_CAVE;
  return cave.exitX - cave.startX;
}

/** Local +z is world +x after the containing group rotates +90° around Y. */
function localPathX(localZ: number) {
  const cave = DRIFT_EVOLUTION_ENTRY_CAVE;
  const worldX = cave.startX + localZ;
  return -(getDriftEvolutionEntryPathCenterZ(worldX) - cave.centerZ);
}

function localToWorld(localX: number, localZ: number) {
  const cave = DRIFT_EVOLUTION_ENTRY_CAVE;
  return {
    x: cave.startX + localZ,
    z: cave.centerZ - localX,
  };
}

function caveGroundY(localX: number, localZ: number) {
  const world = localToWorld(localX, localZ);
  return getDrift3DGroundY(world.x, world.z);
}

function useEntryCaveGeometry() {
  return useMemo(() => {
    const cave = DRIFT_EVOLUTION_ENTRY_CAVE;
    const positions: number[] = [];
    const uvs: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];
    const z0 = 0;
    const z1 = localMouth() + 1.6;

    for (let ring = 0; ring <= cave.rings; ring += 1) {
      const t = ring / cave.rings;
      const z = z0 + (z1 - z0) * t;
      const centerX = localPathX(z);
      const floorY = caveGroundY(centerX, z) - 0.25;

      for (let around = 0; around <= cave.around; around += 1) {
        const s = around / cave.around;
        const angle = Math.PI * (1 - s);
        const bulge = 1 + fbm(s * 5 + 3, z * 0.35) * 0.34;
        const width = cave.halfWidth * bulge;
        const apex = cave.apexHeight * (1 + fbm(s * 3 + 9, z * 0.22) * 0.22);
        const radial = fbm(s * 9 + 21, z * 0.8) * 0.4;
        const nx = Math.cos(angle);
        const ny = Math.max(0.15, Math.sin(angle));
        const x = centerX + nx * width + nx * radial;
        const y =
          floorY +
          Math.pow(Math.max(0, Math.sin(angle)), 0.72) * apex +
          ny * radial * 0.6;

        positions.push(x, y, z);
        uvs.push(s * 3.4, z * 0.24);

        const cornerDark = 1 - 0.5 * Math.exp(-Math.pow(Math.sin(angle) * 3.4, 2));
        const depthDark = 0.55 + 0.45 * t;
        const shade = THREE.MathUtils.clamp(
          0.55 * cornerDark * (0.7 + 0.3 * depthDark) + fbm(s * 13, z) * 0.08,
          0.2,
          0.92
        );
        colors.push(shade, shade, shade);
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
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  }, []);
}

function useFracturedPortalGeometry() {
  return useMemo(() => {
    const cave = DRIFT_EVOLUTION_ENTRY_CAVE;
    const mouth = localMouth();
    const floorY = caveGroundY(localPathX(mouth), mouth);
    const wall = new THREE.Shape();
    wall.moveTo(-24, 0);
    wall.lineTo(24, 0);
    wall.lineTo(24, 21);
    wall.lineTo(15, 25);
    wall.lineTo(5, 27);
    wall.lineTo(-7, 26);
    wall.lineTo(-16, 23.5);
    wall.lineTo(-24, 20);
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
    geometry.translate(0, floorY - 0.3, mouth - 1);
    geometry.computeVertexNormals();
    return geometry;
  }, []);
}

function useRockGeometry() {
  return useMemo(() => {
    const geometry = new THREE.IcosahedronGeometry(1, 1);
    const positions = geometry.attributes.position;
    const point = new THREE.Vector3();

    for (let index = 0; index < positions.count; index += 1) {
      point.fromBufferAttribute(positions, index);
      const displacement = 1 + fbm(point.x * 1.3 + 5, point.y * 1.3 + point.z) * 0.42;
      positions.setXYZ(
        index,
        point.x * displacement,
        point.y * displacement * 0.82,
        point.z * displacement
      );
    }

    geometry.computeVertexNormals();
    return geometry;
  }, []);
}

function ScatterRocks() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const cave = DRIFT_EVOLUTION_ENTRY_CAVE;
  const geometry = useRockGeometry();
  const maps = getDriftMaterialMaps("rock", 1.6, 1.6);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const rng = seededRng(551177);
    const matrix = new THREE.Matrix4();
    const quaternion = new THREE.Quaternion();
    const euler = new THREE.Euler();
    const mouth = localMouth();
    let index = 0;

    for (; index < Math.min(50, cave.rockCount); index += 1) {
      const z = 0.8 + rng() * Math.max(2, mouth - 4.8);
      const centerX = localPathX(z);
      const side = rng() < 0.5 ? -1 : 1;
      const scale = 1.7 + rng() * 2.4;
      const overhead = rng() < 0.28 && z < mouth - 5;
      const localX = overhead
        ? centerX + (rng() - 0.5) * 4.2
        : centerX + side * (6.3 + scale + rng() * 2.8);
      const groundY = caveGroundY(localX, z);
      const y = overhead
        ? groundY + cave.apexHeight + scale * 0.7 + rng()
        : groundY + rng() * 3.8 - 0.8;
      euler.set(rng() * Math.PI, rng() * Math.PI, rng() * Math.PI);
      quaternion.setFromEuler(euler);
      matrix.compose(
        new THREE.Vector3(localX, y, z),
        quaternion,
        new THREE.Vector3(scale, scale * (0.7 + rng() * 0.5), scale)
      );
      mesh.setMatrixAt(index, matrix);
    }

    for (; index < Math.min(66, cave.rockCount); index += 1) {
      const side = rng() < 0.5 ? -1 : 1;
      const scale = 1.3 + rng() * 1.5;
      const localX = side * (5.5 + rng() * 8);
      const z = mouth - 2.5 - rng() * 2.2;
      const groundY = caveGroundY(localX, z);
      const y = groundY + (rng() < 0.55 ? 9 + rng() * 7 : 4 + rng() * 5);
      euler.set(rng() * Math.PI, rng() * Math.PI, rng() * Math.PI);
      quaternion.setFromEuler(euler);
      matrix.compose(
        new THREE.Vector3(localX, y, z),
        quaternion,
        new THREE.Vector3(scale, scale * 0.8, scale)
      );
      mesh.setMatrixAt(index, matrix);
    }

    for (; index < cave.rockCount; index += 1) {
      const localX = -6.7 + (rng() - 0.5) * 2.2;
      const scale = 0.45 + rng();
      const z = mouth + (rng() - 0.5) * 1.4;
      const groundY = caveGroundY(localX, z);
      euler.set(rng() * Math.PI, rng() * Math.PI, rng() * Math.PI);
      quaternion.setFromEuler(euler);
      matrix.compose(
        new THREE.Vector3(localX, groundY + rng() * 1.1, z),
        quaternion,
        new THREE.Vector3(scale, scale, scale)
      );
      mesh.setMatrixAt(index, matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  }, [cave]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, undefined, cave.rockCount]}
      castShadow
      receiveShadow
      frustumCulled={false}
    >
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
  const cave = DRIFT_EVOLUTION_ENTRY_CAVE;

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const rng = seededRng(88332);
    const matrix = new THREE.Matrix4();
    const quaternion = new THREE.Quaternion();
    quaternion.setFromEuler(new THREE.Euler(Math.PI, 0, 0));
    const mouth = localMouth();

    for (let index = 0; index < cave.stalactiteCount; index += 1) {
      const z = 1.3 + rng() * Math.max(2, mouth - 3);
      const centerX = localPathX(z);
      const localX = centerX + (rng() - 0.5) * 4.2;
      const groundY = caveGroundY(centerX, z);
      const apexY =
        groundY + cave.apexHeight * (0.72 + rng() * 0.2) -
        Math.abs(localX - centerX) * 0.42;
      const length = 0.4 + rng() * rng() * 1.35;
      matrix.compose(
        new THREE.Vector3(localX, apexY - length / 2, z),
        quaternion,
        new THREE.Vector3(0.09 + rng() * 0.13, length, 0.09 + rng() * 0.13)
      );
      mesh.setMatrixAt(index, matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [cave]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, cave.stalactiteCount]}>
      <coneGeometry args={[1, 1, 6]} />
      <meshStandardMaterial color="#4c463e" roughness={0.95} />
    </instancedMesh>
  );
}

function Drips() {
  const pointsRef = useRef<THREE.Points>(null);
  const cave = DRIFT_EVOLUTION_ENTRY_CAVE;
  const data = useMemo(() => {
    const rng = seededRng(9911);
    const positions = new Float32Array(cave.dripCount * 3);
    const seeds: Array<{
      x: number;
      z: number;
      top: number;
      floor: number;
      speed: number;
      phase: number;
    }> = [];
    const mouth = localMouth();

    for (let index = 0; index < cave.dripCount; index += 1) {
      const z = 1.2 + rng() * Math.max(2, mouth - 2.4);
      const centerX = localPathX(z);
      const x = centerX + (rng() - 0.5) * 4.8;
      const floor = caveGroundY(centerX, z);
      const top = floor + 3.4 + rng() * 1.6;
      seeds.push({ x, z, top, floor, speed: 5 + rng() * 3, phase: rng() * 10 });
      positions[index * 3] = x;
      positions[index * 3 + 1] = top;
      positions[index * 3 + 2] = z;
    }
    return { positions, seeds };
  }, [cave]);

  useFrame(({ clock }) => {
    const points = pointsRef.current;
    if (!points) return;
    const attribute = points.geometry.attributes.position as THREE.BufferAttribute;
    const time = clock.elapsedTime;

    for (let index = 0; index < cave.dripCount; index += 1) {
      const seed = data.seeds[index];
      const span = seed.top - seed.floor;
      const fall = (time * seed.speed + seed.phase * span) % (span + 2);
      attribute.setY(index, seed.top - Math.min(fall, span));
    }
    attribute.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#9db4c4"
        size={0.045}
        sizeAttenuation
        transparent
        opacity={0.72}
        depthWrite={false}
      />
    </points>
  );
}

function DustMotes() {
  const pointsRef = useRef<THREE.Points>(null);
  const cave = DRIFT_EVOLUTION_ENTRY_CAVE;
  const data = useMemo(() => {
    const rng = seededRng(40417);
    const positions = new Float32Array(cave.dustCount * 3);
    const drift = new Float32Array(cave.dustCount * 3);
    const mouth = localMouth();

    for (let index = 0; index < cave.dustCount; index += 1) {
      const z = 0.8 + rng() * (mouth + 1.2);
      const centerX = localPathX(z);
      positions[index * 3] = centerX + (rng() - 0.5) * 5.4;
      positions[index * 3 + 1] = caveGroundY(centerX, z) + 0.2 + rng() * 3.5;
      positions[index * 3 + 2] = z;
      drift[index * 3] = (rng() - 0.5) * 0.08;
      drift[index * 3 + 1] = (rng() - 0.5) * 0.035;
      drift[index * 3 + 2] = (rng() - 0.5) * 0.08;
    }
    return { positions, drift };
  }, [cave]);

  useFrame((_, delta) => {
    const points = pointsRef.current;
    if (!points) return;
    const attribute = points.geometry.attributes.position as THREE.BufferAttribute;

    for (let index = 0; index < cave.dustCount; index += 1) {
      attribute.setXYZ(
        index,
        attribute.getX(index) + data.drift[index * 3] * delta,
        attribute.getY(index) + data.drift[index * 3 + 1] * delta,
        attribute.getZ(index) + data.drift[index * 3 + 2] * delta
      );
    }
    attribute.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#cabb9d"
        size={0.024}
        sizeAttenuation
        transparent
        opacity={0.48}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function CeilingCracks() {
  const cave = DRIFT_EVOLUTION_ENTRY_CAVE;
  const mouth = localMouth();
  const cracks = [
    { z: mouth * 0.34, tilt: 0.35 },
    { z: mouth * 0.66, tilt: -0.25 },
  ];

  return (
    <>
      {cracks.map((crack) => {
        const centerX = localPathX(crack.z);
        const y = caveGroundY(centerX, crack.z) + cave.apexHeight * 0.9;
        return (
          <group
            key={crack.z}
            position={[centerX + 0.6, y, crack.z]}
            rotation={[0, 0, crack.tilt]}
          >
            <mesh rotation={[Math.PI / 2, 0, 0.7]}>
              <planeGeometry args={[0.14, 2]} />
              <meshBasicMaterial color="#fff0cf" toneMapped={false} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0, -1.7, 0]} rotation={[0, 0.7, 0.12]}>
              <planeGeometry args={[0.85, 3.4]} />
              <meshBasicMaterial
                color="#ffdfa8"
                transparent
                opacity={0.05}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                side={THREE.DoubleSide}
              />
            </mesh>
            <pointLight
              color="#cfe0f2"
              intensity={1.1}
              distance={7}
              decay={1.6}
              position={[0, -0.6, 0]}
            />
          </group>
        );
      })}
    </>
  );
}

function usePortalGoboTexture() {
  const texture = useMemo(() => {
    if (typeof document === "undefined") return null;
    const bounds = getDriftEvolutionEntryPortalBounds();
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");
    if (!context) return null;

    context.fillStyle = "black";
    context.fillRect(0, 0, size, size);
    context.fillStyle = "white";
    context.beginPath();
    DRIFT_EVOLUTION_ENTRY_PORTAL_OUTLINE.forEach(([x, y], index) => {
      const px = ((x - bounds.minX) / (bounds.maxX - bounds.minX)) * size * 0.82 + size * 0.09;
      const py = size - (((y - bounds.minY) / (bounds.maxY - bounds.minY)) * size * 0.82 + size * 0.09);
      if (index === 0) context.moveTo(px, py);
      else context.lineTo(px, py);
    });
    context.closePath();
    context.fill();

    const result = new THREE.CanvasTexture(canvas);
    result.colorSpace = THREE.NoColorSpace;
    return result;
  }, []);

  useEffect(() => () => texture?.dispose(), [texture]);
  return texture;
}

function PortalLight() {
  const cave = DRIFT_EVOLUTION_ENTRY_CAVE;
  const spotRef = useRef<THREE.SpotLight>(null);
  const targetRef = useRef<THREE.Object3D>(null);
  const skyCardRef = useRef<THREE.MeshBasicMaterial>(null);
  const gobo = usePortalGoboTexture();
  const mouth = localMouth();
  const exit = localExit();
  const floorY = caveGroundY(localPathX(mouth), mouth);

  useEffect(() => {
    if (spotRef.current && targetRef.current) spotRef.current.target = targetRef.current;
  }, []);

  useFrame(({ camera }) => {
    if (!skyCardRef.current) return;
    const distance = Math.abs(camera.position.x - cave.exitX);
    skyCardRef.current.opacity = THREE.MathUtils.clamp((distance - 3) / 10, 0, 1) * 0.88;
  });

  return (
    <group>
      <spotLight
        ref={spotRef}
        position={[0.4, floorY + 14, exit + 12]}
        color="#ffd39a"
        intensity={1800}
        distance={58}
        angle={0.38}
        penumbra={0.65}
        decay={1.55}
        map={gobo ?? undefined}
      />
      <object3D
        ref={targetRef}
        position={[localPathX(Math.max(1, mouth - 9)), floorY - 2, Math.max(1, mouth - 9)]}
      />

      <spotLight
        position={[0.3, floorY + 7.5, mouth - 0.5]}
        color="#ffcf94"
        intensity={88}
        distance={22}
        angle={0.55}
        penumbra={0.9}
        decay={1.7}
      />

      {[0, 1, 2].map((index) => (
        <mesh
          key={index}
          position={[
            (index - 1) * 1.05,
            floorY + 4.8 - index * 0.45,
            mouth - 2.5 - index * 1.7,
          ]}
          rotation={[0.62, 0.07 * (index - 1), 0]}
        >
          <planeGeometry args={[1.9 - index * 0.22, 10]} />
          <meshBasicMaterial
            color="#ffe6b8"
            transparent
            opacity={0.035}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      <mesh position={[-2.1, floorY + 7.2, exit + 4.5]}>
        <planeGeometry args={[13, 15]} />
        <meshBasicMaterial
          ref={skyCardRef}
          color="#ffc888"
          transparent
          opacity={0.88}
          toneMapped={false}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      <pointLight
        position={[0.4, floorY + 1.2, mouth - 2.5]}
        color="#e8b070"
        intensity={8}
        distance={10}
        decay={1.8}
      />
    </group>
  );
}

function PortalFalls() {
  const pointsRef = useRef<THREE.Points>(null);
  const cave = DRIFT_EVOLUTION_ENTRY_CAVE;
  const mouth = localMouth();
  const floorY = caveGroundY(localPathX(mouth), mouth);
  const data = useMemo(() => {
    const rng = seededRng(770231);
    const count = 160;
    const positions = new Float32Array(count * 3);
    const highEdges = DRIFT_EVOLUTION_ENTRY_PORTAL_OUTLINE.filter((point) => point[1] > 4);
    const seeds: Array<{ x: number; z: number; top: number; speed: number; phase: number }> = [];

    for (let index = 0; index < count; index += 1) {
      const anchor = highEdges[Math.floor(rng() * highEdges.length)] ?? [0, 10];
      const x = anchor[0] + (rng() - 0.5) * 1.1;
      const top = floorY - 0.3 + anchor[1] - rng() * 1.4;
      const z = mouth - 1 + rng() * cave.portalDepth;
      seeds.push({ x, z, top, speed: 2.4 + rng() * 3.6, phase: rng() });
      positions[index * 3] = x;
      positions[index * 3 + 1] = top;
      positions[index * 3 + 2] = z;
    }
    return { count, positions, seeds };
  }, [cave, floorY, mouth]);

  useFrame(({ clock }) => {
    const points = pointsRef.current;
    if (!points) return;
    const attribute = points.geometry.attributes.position as THREE.BufferAttribute;
    const time = clock.elapsedTime;

    for (let index = 0; index < data.count; index += 1) {
      const seed = data.seeds[index];
      const drop = seed.top - floorY + 0.4;
      const fall = (time * seed.speed + seed.phase * drop) % drop;
      attribute.setY(index, seed.top - fall);
      attribute.setX(index, seed.x + (fall / drop) * (seed.phase - 0.5) * 0.8);
    }
    attribute.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#e8c9a0"
        size={0.05}
        sizeAttenuation
        transparent
        opacity={0.5}
        depthWrite={false}
      />
    </points>
  );
}

function EntrySequenceRig({
  vehicleStateRef,
}: {
  vehicleStateRef: MutableRefObject<Drift3DVehiclePhysicsState>;
}) {
  const spawnAppliedRef = useRef(false);
  const dark = useMemo(() => new THREE.Color("#03040a"), []);

  useFrame(() => {
    if (spawnAppliedRef.current) return;
    vehicleStateRef.current = createDrift3DVehiclePhysicsState(
      getDriftEvolutionEntryStartPosition(),
      Math.PI / 2
    );
    spawnAppliedRef.current = true;
  }, -100);

  useFrame(({ gl, scene }) => {
    const mix = getDriftEvolutionEntryTunnelMix(vehicleStateRef.current.position.x);
    if (mix <= 0.001) return;

    const factor = 1 - mix * (1 - DRIFT_EVOLUTION_ENTRY_CAVE.deepExposureFactor);
    gl.toneMappingExposure *= factor;

    if (scene.background instanceof THREE.Color) scene.background.lerp(dark, mix * 0.92);
    if (scene.fog instanceof THREE.FogExp2) {
      scene.fog.color.lerp(dark, mix * 0.9);
      scene.fog.density = Math.max(scene.fog.density, 0.018 + mix * 0.018);
    }
  });

  return null;
}

export default function EntryCaveSalvage({
  vehicleStateRef,
}: {
  vehicleStateRef: MutableRefObject<Drift3DVehiclePhysicsState>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const caveGeometry = useEntryCaveGeometry();
  const portalGeometry = useFracturedPortalGeometry();
  const cave = DRIFT_EVOLUTION_ENTRY_CAVE;
  const caveMaps = getDriftMaterialMaps("rock", 3, 2);
  const wallMaps = getDriftMaterialMaps("rock", 0.14, 0.14);
  const worldMidX = (cave.startX + cave.exitX) * 0.5;

  useEffect(() => {
    return () => {
      caveGeometry.dispose();
      portalGeometry.dispose();
    };
  }, [caveGeometry, portalGeometry]);

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;
    const vehicle = vehicleStateRef.current.position;
    group.visible =
      Math.hypot(vehicle.x - worldMidX, vehicle.z - cave.centerZ) < cave.activationRadius;
  });

  return (
    <>
      <EntrySequenceRig vehicleStateRef={vehicleStateRef} />
      <group
        ref={groupRef}
        position={[cave.startX, 0, cave.centerZ]}
        rotation={[0, Math.PI / 2, 0]}
        aria-hidden="true"
      >
        <mesh geometry={caveGeometry} receiveShadow castShadow>
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

        <mesh geometry={portalGeometry} receiveShadow castShadow>
          <meshStandardMaterial
            map={wallMaps.map ?? undefined}
            normalMap={wallMaps.normalMap ?? undefined}
            normalScale={new THREE.Vector2(1.2, 1.2)}
            color="#6d6459"
            roughness={0.97}
          />
        </mesh>

        <ScatterRocks />
        <Stalactites />
        <Drips />
        <DustMotes />
        <CeilingCracks />
        <PortalLight />
        <PortalFalls />
      </group>
    </>
  );
}
