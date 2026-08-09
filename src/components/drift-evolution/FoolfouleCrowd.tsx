"use client";

import { useEffect, useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getDrift3DGroundY } from "@/lib/drift3dTerrain";
import type { Drift3DVehiclePhysicsState } from "@/lib/drift3dVehiclePhysics";
import {
  DRIFT_EVOLUTION_FOOLFOULE_CENTER,
  DRIFT_EVOLUTION_FOOLFOULE_CROWD,
  getDriftEvolutionFoolfouleCrowdFlowForIndex,
  getDriftEvolutionFoolfouleCrowdFlowLength,
  sampleDriftEvolutionFoolfouleCrowdFlow,
} from "@/lib/driftEvolutionFoolfoule";

const BODY_COLORS = [
  "#3d4247",
  "#655e58",
  "#4e5960",
  "#6f685b",
  "#30343a",
] as const;
const HEAD_COLORS = ["#b99478", "#c7a487", "#8f6f5c", "#d0b092"] as const;

function hash01(seed: number) {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
}

/**
 * Activity proof only: 100 low-cost figures move through four deterministic
 * streams. They are not physics colliders; close to the 4x4 they part locally
 * so the street stays driveable instead of becoming an invisible wall.
 */
export default function FoolfouleCrowd({
  vehicleStateRef,
}: {
  vehicleStateRef: MutableRefObject<Drift3DVehiclePhysicsState>;
}) {
  const bodyRef = useRef<THREE.InstancedMesh>(null);
  const headRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const seeds = useMemo(
    () =>
      Array.from({ length: DRIFT_EVOLUTION_FOOLFOULE_CROWD.count }, (_, index) => {
        const flow = getDriftEvolutionFoolfouleCrowdFlowForIndex(index);
        return Object.freeze({
          flow,
          phase: hash01(index * 7 + 1),
          lateralOffset: (hash01(index * 7 + 2) * 2 - 1) * flow.halfWidth,
          pace: 0.82 + hash01(index * 7 + 3) * 0.34,
          scale: 0.9 + hash01(index * 7 + 4) * 0.18,
          bodyColorIndex: Math.floor(hash01(index * 7 + 5) * BODY_COLORS.length),
          headColorIndex: Math.floor(hash01(index * 7 + 6) * HEAD_COLORS.length),
          fallbackAngle: hash01(index * 7 + 7) * Math.PI * 2,
        });
      }),
    []
  );

  useEffect(() => {
    const body = bodyRef.current;
    const head = headRef.current;
    if (!body || !head) return;

    body.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    head.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    seeds.forEach((seed, index) => {
      body.setColorAt(index, new THREE.Color(BODY_COLORS[seed.bodyColorIndex]));
      head.setColorAt(index, new THREE.Color(HEAD_COLORS[seed.headColorIndex]));
    });
    if (body.instanceColor) body.instanceColor.needsUpdate = true;
    if (head.instanceColor) head.instanceColor.needsUpdate = true;
  }, [seeds]);

  useFrame(({ camera, clock }) => {
    const body = bodyRef.current;
    const head = headRef.current;
    if (!body || !head) return;

    const center = DRIFT_EVOLUTION_FOOLFOULE_CENTER;
    const visible =
      Math.hypot(camera.position.x - center.x, camera.position.z - center.z) <
      DRIFT_EVOLUTION_FOOLFOULE_CROWD.visibilityRadius;
    body.visible = visible;
    head.visible = visible;
    if (!visible) return;

    const vehicle = vehicleStateRef.current.position;

    seeds.forEach((seed, index) => {
      const flowLength = getDriftEvolutionFoolfouleCrowdFlowLength(seed.flow);
      const progress =
        seed.phase +
        (clock.elapsedTime * DRIFT_EVOLUTION_FOOLFOULE_CROWD.speed * seed.pace) /
          Math.max(1, flowLength);
      const sample = sampleDriftEvolutionFoolfouleCrowdFlow(
        seed.flow,
        progress,
        seed.lateralOffset
      );
      let worldX = center.x + sample.x;
      let worldZ = center.z + sample.z;
      let dx = worldX - vehicle.x;
      let dz = worldZ - vehicle.z;
      let distance = Math.hypot(dx, dz);

      if (distance < DRIFT_EVOLUTION_FOOLFOULE_CROWD.avoidanceRadius) {
        if (distance < 0.001) {
          dx = Math.cos(seed.fallbackAngle);
          dz = Math.sin(seed.fallbackAngle);
          distance = 1;
        }
        const push =
          (DRIFT_EVOLUTION_FOOLFOULE_CROWD.avoidanceRadius - distance) * 0.72;
        worldX += (dx / distance) * push;
        worldZ += (dz / distance) * push;
      }

      const groundY = getDrift3DGroundY(worldX, worldZ) + 0.025;
      const scale = seed.scale;

      dummy.position.set(worldX, groundY + 0.56 * scale, worldZ);
      dummy.rotation.set(0, sample.heading, 0);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      body.setMatrixAt(index, dummy.matrix);

      dummy.position.set(worldX, groundY + 1.27 * scale, worldZ);
      dummy.rotation.set(0, sample.heading, 0);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      head.setMatrixAt(index, dummy.matrix);
    });

    body.instanceMatrix.needsUpdate = true;
    head.instanceMatrix.needsUpdate = true;
  });

  return (
    <group aria-hidden="true">
      <instancedMesh
        ref={bodyRef}
        args={[undefined, undefined, DRIFT_EVOLUTION_FOOLFOULE_CROWD.count]}
        castShadow
        receiveShadow
        frustumCulled={false}
      >
        <cylinderGeometry args={[0.17, 0.2, 1.12, 6]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </instancedMesh>
      <instancedMesh
        ref={headRef}
        args={[undefined, undefined, DRIFT_EVOLUTION_FOOLFOULE_CROWD.count]}
        castShadow
        frustumCulled={false}
      >
        <sphereGeometry args={[0.17, 7, 6]} />
        <meshStandardMaterial color="#ffffff" roughness={0.92} />
      </instancedMesh>
    </group>
  );
}
