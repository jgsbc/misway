"use client";

import { useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { drift3dTrackNodeBySlug } from "@/lib/drift3dTopology";
import { getDrift3DGroundY } from "@/lib/drift3dTerrain";
import type { Drift3DVehiclePhysicsState } from "@/lib/drift3dVehiclePhysics";

/**
 * Diegetic ambient FX (realism bible, FX pass): localized storm rain, the
 * synchronized rush-hour crowd, golden village dust and fireflies. Every
 * effect is anchored to its scene, fades with distance, and is skipped
 * entirely when the vehicle is far away (mobile fallback rule).
 */

type EffectsProps = {
  vehicleStateRef: MutableRefObject<Drift3DVehiclePhysicsState>;
};

function effectNoise(x: number, y: number) {
  const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;

  return value - Math.floor(value);
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

const RAIN_COUNT = 380;
const RAIN_AREA = 24;
const RAIN_CEILING = 10;

function StormRain({ vehicleStateRef }: EffectsProps) {
  const center = drift3dTrackNodeBySlug["hold-the-light"].position;
  const centerGroundY = getDrift3DGroundY(center.x, center.z);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const dropsRef = useRef<
    Array<{ x: number; z: number; y: number; speed: number }> | null
  >(null);

  if (dropsRef.current === null) {
    dropsRef.current = Array.from({ length: RAIN_COUNT }, (_, index) => ({
      x: (effectNoise(index, 1) - 0.5) * RAIN_AREA,
      z: (effectNoise(index, 2) - 0.5) * RAIN_AREA,
      y: effectNoise(index, 3) * RAIN_CEILING,
      speed: 9 + effectNoise(index, 4) * 4,
    }));
  }

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    const material = materialRef.current;

    if (!mesh || !material) {
      return;
    }

    const position = vehicleStateRef.current.position;
    const distance = Math.hypot(position.x - center.x, position.z - center.z);
    const strength = clamp01(1 - (distance - 5) / 9);

    mesh.visible = strength > 0.02;
    material.opacity = 0.42 * strength;

    if (!mesh.visible) {
      return;
    }

    mesh.position.set(center.x, centerGroundY, center.z);
    const drops = dropsRef.current ?? [];

    for (let index = 0; index < RAIN_COUNT; index += 1) {
      const drop = drops[index];
      drop.y -= drop.speed * delta;

      if (drop.y < 0) {
        drop.y += RAIN_CEILING;
      }

      dummy.position.set(drop.x, drop.y, drop.z);
      dummy.rotation.set(0, 0, 0.14);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, RAIN_COUNT]}
      frustumCulled={false}
    >
      <boxGeometry args={[0.014, 0.5, 0.014]} />
      <meshBasicMaterial
        ref={materialRef}
        color="#9fb2c8"
        transparent
        opacity={0}
        depthWrite={false}
      />
    </instancedMesh>
  );
}

const CROWD_COUNT = 84;
const CROWD_BAND_HALF = 10;
const CROWD_MARCH_SPEED = 0.55;

type CrowdFigure = {
  x: number;
  z: number;
  scale: number;
  phase: number;
};

function setCrowdPartMatrix(
  mesh: THREE.InstancedMesh,
  dummy: THREE.Object3D,
  index: number,
  x: number,
  y: number,
  z: number,
  scale: number,
  rotationX = 0
) {
  dummy.position.set(x, y, z);
  dummy.scale.setScalar(scale);
  dummy.rotation.set(rotationX, 0, 0);
  dummy.updateMatrix();
  mesh.setMatrixAt(index, dummy.matrix);
}

function FoolfouleCrowd({ vehicleStateRef }: EffectsProps) {
  const center = drift3dTrackNodeBySlug.foolfoule.position;
  const centerGroundY = getDrift3DGroundY(center.x, center.z);
  const torsoRef = useRef<THREE.InstancedMesh>(null);
  const headRef = useRef<THREE.InstancedMesh>(null);
  const leftLegRef = useRef<THREE.InstancedMesh>(null);
  const rightLegRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const figures = useMemo<CrowdFigure[]>(
    () =>
      Array.from({ length: CROWD_COUNT }, (_, index) => {
        const westSide = index % 2 === 0;
        const lateralNoise = effectNoise(index, 5);

        // The recovered hero road runs just east of Foolfoule. Keep the crowd
        // on two sidewalk bands instead of filling the carriageway with the
        // old capsule placeholder field.
        const x = westSide
          ? -4.2 - lateralNoise * 2.1
          : 7.9 + lateralNoise * 2.1;

        return {
          x,
          z: (effectNoise(index, 6) - 0.5) * CROWD_BAND_HALF * 2,
          scale: 0.92 + effectNoise(index, 7) * 0.16,
          phase: index % 2 === 0 ? 0 : Math.PI,
        };
      }),
    []
  );

  useFrame(({ clock }) => {
    const torso = torsoRef.current;
    const head = headRef.current;
    const leftLeg = leftLegRef.current;
    const rightLeg = rightLegRef.current;

    if (!torso || !head || !leftLeg || !rightLeg) {
      return;
    }

    const position = vehicleStateRef.current.position;
    const vehicleDistance = Math.hypot(
      position.x - center.x,
      position.z - center.z
    );
    const visible = vehicleDistance < 32;

    torso.visible = visible;
    head.visible = visible;
    leftLeg.visible = visible;
    rightLeg.visible = visible;

    if (!visible) {
      return;
    }

    const time = clock.elapsedTime;
    const march = (time * CROWD_MARCH_SPEED) % (CROWD_BAND_HALF * 2);

    for (let index = 0; index < CROWD_COUNT; index += 1) {
      const figure = figures[index];
      let worldX = center.x + figure.x;
      let worldZ =
        center.z +
        ((figure.z + march + CROWD_BAND_HALF) % (CROWD_BAND_HALF * 2)) -
        CROWD_BAND_HALF;

      // People yield locally to the 4x4 but keep their collective direction.
      const dx = worldX - position.x;
      const dz = worldZ - position.z;
      const distance = Math.hypot(dx, dz);

      if (distance > 0 && distance < 1.35) {
        const push = (1.35 - distance) / distance;
        worldX += dx * push;
        worldZ += dz * push;
      }

      const stride = Math.sin(time * 4.4 + figure.phase) * 0.24;
      const bob = Math.abs(Math.sin(time * 4.4 + figure.phase)) * 0.025;
      const ground = centerGroundY;
      const scale = figure.scale;

      setCrowdPartMatrix(
        torso,
        dummy,
        index,
        worldX,
        ground + (1.08 + bob) * scale,
        worldZ,
        scale
      );
      setCrowdPartMatrix(
        head,
        dummy,
        index,
        worldX,
        ground + (1.62 + bob) * scale,
        worldZ,
        scale
      );
      setCrowdPartMatrix(
        leftLeg,
        dummy,
        index,
        worldX - 0.1 * scale,
        ground + 0.39 * scale,
        worldZ,
        scale,
        stride
      );
      setCrowdPartMatrix(
        rightLeg,
        dummy,
        index,
        worldX + 0.1 * scale,
        ground + 0.39 * scale,
        worldZ,
        scale,
        -stride
      );
    }

    torso.instanceMatrix.needsUpdate = true;
    head.instanceMatrix.needsUpdate = true;
    leftLeg.instanceMatrix.needsUpdate = true;
    rightLeg.instanceMatrix.needsUpdate = true;
  });

  return (
    <group aria-hidden="true">
      <instancedMesh
        ref={torsoRef}
        args={[undefined, undefined, CROWD_COUNT]}
        frustumCulled={false}
        castShadow
      >
        <boxGeometry args={[0.38, 0.72, 0.24]} />
        <meshStandardMaterial color="#4a4748" roughness={0.92} />
      </instancedMesh>
      <instancedMesh
        ref={headRef}
        args={[undefined, undefined, CROWD_COUNT]}
        frustumCulled={false}
        castShadow
      >
        <sphereGeometry args={[0.13, 7, 6]} />
        <meshStandardMaterial color="#a9927f" roughness={0.9} />
      </instancedMesh>
      <instancedMesh
        ref={leftLegRef}
        args={[undefined, undefined, CROWD_COUNT]}
        frustumCulled={false}
        castShadow
      >
        <boxGeometry args={[0.14, 0.72, 0.16]} />
        <meshStandardMaterial color="#2e3034" roughness={0.94} />
      </instancedMesh>
      <instancedMesh
        ref={rightLegRef}
        args={[undefined, undefined, CROWD_COUNT]}
        frustumCulled={false}
        castShadow
      >
        <boxGeometry args={[0.14, 0.72, 0.16]} />
        <meshStandardMaterial color="#2e3034" roughness={0.94} />
      </instancedMesh>
    </group>
  );
}

type FloatingParticlesProps = EffectsProps & {
  anchor: { x: number; z: number };
  color: string;
  count: number;
  radius: number;
  minY: number;
  maxY: number;
  size: number;
  maxOpacity: number;
  /** >0 makes the cloud pulse (fireflies); 0 keeps a steady haze (dust). */
  blinkSpeed: number;
  seed: number;
};

function FloatingParticles({
  vehicleStateRef,
  anchor,
  color,
  count,
  radius,
  minY,
  maxY,
  size,
  maxOpacity,
  blinkSpeed,
  seed,
}: FloatingParticlesProps) {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);
  const positions = useMemo(() => {
    const array = new Float32Array(count * 3);

    for (let index = 0; index < count; index += 1) {
      const angle = effectNoise(index, seed) * Math.PI * 2;
      const distance = Math.sqrt(effectNoise(index, seed + 1)) * radius;
      array[index * 3] = Math.cos(angle) * distance;
      array[index * 3 + 1] =
        minY + effectNoise(index, seed + 2) * (maxY - minY);
      array[index * 3 + 2] = Math.sin(angle) * distance;
    }

    return array;
  }, [count, maxY, minY, radius, seed]);

  useFrame(({ clock }) => {
    const group = groupRef.current;
    const material = materialRef.current;

    if (!group || !material) {
      return;
    }

    const position = vehicleStateRef.current.position;
    const distance = Math.hypot(position.x - anchor.x, position.z - anchor.z);
    const strength = clamp01(1 - (distance - radius) / 12);

    group.visible = strength > 0.02;

    if (!group.visible) {
      return;
    }

    // dérive lente de la nappe entière — poussière portée par l'air
    group.rotation.y = clock.elapsedTime * 0.03;
    const blink =
      blinkSpeed > 0
        ? 0.55 + 0.45 * Math.sin(clock.elapsedTime * blinkSpeed)
        : 1;
    material.opacity = maxOpacity * strength * blink;
  });

  return (
    <group
      ref={groupRef}
      position={[anchor.x, getDrift3DGroundY(anchor.x, anchor.z), anchor.z]}
    >
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          ref={materialRef}
          size={size}
          sizeAttenuation
          color={color}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

export default function Drift3DAmbientEffects({
  vehicleStateRef,
}: EffectsProps) {
  const ethnicStick = drift3dTrackNodeBySlug["ethnic-stick"].position;
  const midnightWork = drift3dTrackNodeBySlug["midnight-work"].position;

  return (
    <>
      <StormRain vehicleStateRef={vehicleStateRef} />
      <FoolfouleCrowd vehicleStateRef={vehicleStateRef} />
      <FloatingParticles
        vehicleStateRef={vehicleStateRef}
        anchor={{ x: ethnicStick.x, z: ethnicStick.z }}
        color="#e8c27a"
        count={80}
        radius={8}
        minY={0.2}
        maxY={2}
        size={0.07}
        maxOpacity={0.34}
        blinkSpeed={0}
        seed={21}
      />
      <FloatingParticles
        vehicleStateRef={vehicleStateRef}
        anchor={{ x: midnightWork.x, z: midnightWork.z }}
        color="#d9e8a0"
        count={26}
        radius={6}
        minY={0.3}
        maxY={1.6}
        size={0.09}
        maxOpacity={0.8}
        blinkSpeed={2.3}
        seed={53}
      />
    </>
  );
}
