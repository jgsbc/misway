"use client";

import { useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getDriftMaterialMaps } from "@/components/drift-3d/drift3dTextureFactory";
import {
  DRIFT_3D_BIRTH_YARD_CROWD,
  DRIFT_3D_BIRTH_YARD_PAVING_STRIPS,
  getDrift3DBirthYardCrowdFlowForIndex,
  getDrift3DBirthYardCrowdFlowLength,
  sampleDrift3DBirthYardCrowdFlow,
  type Drift3DBirthYardCrowdFlow,
} from "@/lib/drift3dBirthYardHeroCrowd";
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

type CrowdFigure = {
  flow: Drift3DBirthYardCrowdFlow;
  progress: number;
  lateralOffset: number;
  scale: number;
  phase: number;
  pace: number;
};

function setCrowdPartMatrix(
  mesh: THREE.InstancedMesh,
  dummy: THREE.Object3D,
  index: number,
  x: number,
  y: number,
  z: number,
  scale: number,
  rotationX = 0,
  rotationY = 0,
  rotationZ = 0
) {
  dummy.position.set(x, y, z);
  dummy.scale.setScalar(scale);
  dummy.rotation.set(rotationX, rotationY, rotationZ);
  dummy.updateMatrix();
  mesh.setMatrixAt(index, dummy.matrix);
}

function FoolfoulePaving() {
  const center = drift3dTrackNodeBySlug.foolfoule.position;
  const materialMaps = useMemo(
    () =>
      DRIFT_3D_BIRTH_YARD_PAVING_STRIPS.map((strip) =>
        getDriftMaterialMaps(
          "concrete",
          strip.textureRepeat[0],
          strip.textureRepeat[1]
        )
      ),
    []
  );

  return (
    <group aria-hidden="true">
      {DRIFT_3D_BIRTH_YARD_PAVING_STRIPS.map((strip, index) => {
        const worldX = center.x + strip.centerX;
        const worldZ = center.z + strip.centerZ;
        const groundY = getDrift3DGroundY(worldX, worldZ);

        return (
          <mesh
            key={strip.id}
            position={[worldX, groundY + 0.03, worldZ]}
            receiveShadow
          >
            <boxGeometry args={[strip.width, 0.06, strip.depth]} />
            <meshStandardMaterial
              map={materialMaps[index]?.map ?? undefined}
              normalMap={materialMaps[index]?.normalMap ?? undefined}
              normalScale={new THREE.Vector2(0.5, 0.5)}
              color="#8f8a80"
              roughness={0.92}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function FoolfouleCrowd({ vehicleStateRef }: EffectsProps) {
  const center = drift3dTrackNodeBySlug.foolfoule.position;
  const torsoRef = useRef<THREE.InstancedMesh>(null);
  const headRef = useRef<THREE.InstancedMesh>(null);
  const leftLegRef = useRef<THREE.InstancedMesh>(null);
  const rightLegRef = useRef<THREE.InstancedMesh>(null);
  const leftArmRef = useRef<THREE.InstancedMesh>(null);
  const rightArmRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const figures = useMemo<CrowdFigure[]>(
    () =>
      Array.from({ length: DRIFT_3D_BIRTH_YARD_CROWD.count }, (_, index) => {
        const flow = getDrift3DBirthYardCrowdFlowForIndex(index);

        return {
          flow,
          progress: effectNoise(index, 6),
          lateralOffset:
            (effectNoise(index, 5) - 0.5) * flow.halfWidth * 2,
          scale:
            DRIFT_3D_BIRTH_YARD_CROWD.scaleMin +
            effectNoise(index, 7) *
              (DRIFT_3D_BIRTH_YARD_CROWD.scaleMax -
                DRIFT_3D_BIRTH_YARD_CROWD.scaleMin),
          phase: effectNoise(index, 8) * Math.PI * 2,
          pace: 0.82 + effectNoise(index, 10) * 0.32,
        };
      }),
    []
  );

  useFrame(({ clock }) => {
    const torso = torsoRef.current;
    const head = headRef.current;
    const leftLeg = leftLegRef.current;
    const rightLeg = rightLegRef.current;
    const leftArm = leftArmRef.current;
    const rightArm = rightArmRef.current;

    if (!torso || !head || !leftLeg || !rightLeg || !leftArm || !rightArm) {
      return;
    }

    const position = vehicleStateRef.current.position;
    const vehicleDistance = Math.hypot(
      position.x - center.x,
      position.z - center.z
    );
    const visible =
      vehicleDistance < DRIFT_3D_BIRTH_YARD_CROWD.visibilityRadius;

    torso.visible = visible;
    head.visible = visible;
    leftLeg.visible = visible;
    rightLeg.visible = visible;
    leftArm.visible = visible;
    rightArm.visible = visible;

    if (!visible) {
      return;
    }

    const time = clock.elapsedTime;

    for (
      let index = 0;
      index < DRIFT_3D_BIRTH_YARD_CROWD.count;
      index += 1
    ) {
      const figure = figures[index];
      const flowLength = getDrift3DBirthYardCrowdFlowLength(figure.flow);
      const progress =
        figure.progress +
        (time * DRIFT_3D_BIRTH_YARD_CROWD.marchSpeed * figure.pace) /
          Math.max(1, flowLength);
      const sample = sampleDrift3DBirthYardCrowdFlow(
        figure.flow,
        progress,
        figure.lateralOffset
      );
      let worldX = center.x + sample.x;
      let worldZ = center.z + sample.z;

      // Crossings are intentional now: pedestrians move through the block and
      // may cross the carriageway. Local yielding protects the 4x4 without
      // forcing the crowd back into two roadside bands.
      const dx = worldX - position.x;
      const dz = worldZ - position.z;
      const distance = Math.hypot(dx, dz);
      const avoidanceRadius = DRIFT_3D_BIRTH_YARD_CROWD.avoidanceRadius;

      if (distance > 0 && distance < avoidanceRadius) {
        const push = (avoidanceRadius - distance) / distance;
        worldX += dx * push;
        worldZ += dz * push;
      }

      const pedestrianGroundY = getDrift3DGroundY(worldX, worldZ) + 0.06;
      const gait = time * 4.1 * figure.pace + figure.phase;
      const stride = Math.sin(gait) * 0.15;
      const bob = Math.abs(Math.sin(gait)) * 0.012;
      const scale = figure.scale;
      const facing = sample.heading;
      const rightX = Math.cos(facing);
      const rightZ = -Math.sin(facing);
      const legOffset = 0.075 * scale;
      const armOffset = 0.205 * scale;

      setCrowdPartMatrix(
        torso,
        dummy,
        index,
        worldX,
        pedestrianGroundY + (1.02 + bob) * scale,
        worldZ,
        scale,
        0,
        facing
      );
      setCrowdPartMatrix(
        head,
        dummy,
        index,
        worldX,
        pedestrianGroundY + (1.47 + bob) * scale,
        worldZ,
        scale,
        0,
        facing
      );
      setCrowdPartMatrix(
        leftLeg,
        dummy,
        index,
        worldX - rightX * legOffset,
        pedestrianGroundY + 0.36 * scale,
        worldZ - rightZ * legOffset,
        scale,
        stride,
        facing
      );
      setCrowdPartMatrix(
        rightLeg,
        dummy,
        index,
        worldX + rightX * legOffset,
        pedestrianGroundY + 0.36 * scale,
        worldZ + rightZ * legOffset,
        scale,
        -stride,
        facing
      );
      setCrowdPartMatrix(
        leftArm,
        dummy,
        index,
        worldX - rightX * armOffset,
        pedestrianGroundY + (1.03 + bob) * scale,
        worldZ - rightZ * armOffset,
        scale,
        -stride * 0.8,
        facing,
        0.04
      );
      setCrowdPartMatrix(
        rightArm,
        dummy,
        index,
        worldX + rightX * armOffset,
        pedestrianGroundY + (1.03 + bob) * scale,
        worldZ + rightZ * armOffset,
        scale,
        stride * 0.8,
        facing,
        -0.04
      );
    }

    torso.instanceMatrix.needsUpdate = true;
    head.instanceMatrix.needsUpdate = true;
    leftLeg.instanceMatrix.needsUpdate = true;
    rightLeg.instanceMatrix.needsUpdate = true;
    leftArm.instanceMatrix.needsUpdate = true;
    rightArm.instanceMatrix.needsUpdate = true;
  });

  return (
    <group aria-hidden="true">
      <instancedMesh
        ref={torsoRef}
        args={[undefined, undefined, DRIFT_3D_BIRTH_YARD_CROWD.count]}
        frustumCulled={false}
        castShadow
      >
        <cylinderGeometry args={[0.16, 0.22, 0.66, 5]} />
        <meshStandardMaterial color="#454448" roughness={0.94} />
      </instancedMesh>
      <instancedMesh
        ref={headRef}
        args={[undefined, undefined, DRIFT_3D_BIRTH_YARD_CROWD.count]}
        frustumCulled={false}
      >
        <sphereGeometry args={[0.098, 6, 5]} />
        <meshStandardMaterial color="#8c7664" roughness={0.94} />
      </instancedMesh>
      <instancedMesh
        ref={leftLegRef}
        args={[undefined, undefined, DRIFT_3D_BIRTH_YARD_CROWD.count]}
        frustumCulled={false}
      >
        <cylinderGeometry args={[0.052, 0.062, 0.7, 4]} />
        <meshStandardMaterial color="#2d3034" roughness={0.96} />
      </instancedMesh>
      <instancedMesh
        ref={rightLegRef}
        args={[undefined, undefined, DRIFT_3D_BIRTH_YARD_CROWD.count]}
        frustumCulled={false}
      >
        <cylinderGeometry args={[0.052, 0.062, 0.7, 4]} />
        <meshStandardMaterial color="#2d3034" roughness={0.96} />
      </instancedMesh>
      <instancedMesh
        ref={leftArmRef}
        args={[undefined, undefined, DRIFT_3D_BIRTH_YARD_CROWD.count]}
        frustumCulled={false}
      >
        <cylinderGeometry args={[0.042, 0.048, 0.56, 4]} />
        <meshStandardMaterial color="#454448" roughness={0.94} />
      </instancedMesh>
      <instancedMesh
        ref={rightArmRef}
        args={[undefined, undefined, DRIFT_3D_BIRTH_YARD_CROWD.count]}
        frustumCulled={false}
      >
        <cylinderGeometry args={[0.042, 0.048, 0.56, 4]} />
        <meshStandardMaterial color="#454448" roughness={0.94} />
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
      <FoolfoulePaving />
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
