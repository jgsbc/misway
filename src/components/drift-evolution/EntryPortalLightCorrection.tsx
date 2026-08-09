"use client";

import { useEffect, useRef } from "react";
import type { MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { DRIFT_EVOLUTION_ENTRY_CAVE } from "@/lib/driftEvolutionEntryCave";
import { getDrift3DGroundY } from "@/lib/drift3dTerrain";
import type { Drift3DVehiclePhysicsState } from "@/lib/drift3dVehiclePhysics";

export default function EntryPortalLightCorrection({
  vehicleStateRef,
}: {
  vehicleStateRef: MutableRefObject<Drift3DVehiclePhysicsState>;
}) {
  const scene = useThree((state) => state.scene);
  const spotRef = useRef<THREE.SpotLight>(null);
  const targetRef = useRef<THREE.Object3D>(null);
  const skyCardRef = useRef<THREE.MeshBasicMaterial>(null);
  const cave = DRIFT_EVOLUTION_ENTRY_CAVE;
  const floorY = getDrift3DGroundY(cave.exitX, cave.centerZ);

  // EVO-25 inherited a Fable light source staged twelve metres beyond the
  // new west-facing exit. Hide only that evolution light/card and replace it
  // below with a threshold-bound source. Production lighting is untouched.
  useEffect(() => {
    const hidden: THREE.Object3D[] = [];

    scene.traverse((object) => {
      if (
        object instanceof THREE.SpotLight &&
        object.color.getHex() === 0xffd39a &&
        object.intensity >= 1700
      ) {
        object.visible = false;
        hidden.push(object);
        return;
      }

      if (!(object instanceof THREE.Mesh)) return;
      if (!(object.geometry instanceof THREE.PlaneGeometry)) return;
      const material = Array.isArray(object.material) ? null : object.material;
      if (!(material instanceof THREE.MeshBasicMaterial)) return;
      const { width, height } = object.geometry.parameters;
      if (
        Math.abs(width - 13) < 0.01 &&
        Math.abs(height - 15) < 0.01 &&
        material.color.getHex() === 0xffc888
      ) {
        object.visible = false;
        hidden.push(object);
      }
    });

    return () => {
      for (const object of hidden) object.visible = true;
    };
  }, [scene]);

  useEffect(() => {
    if (spotRef.current && targetRef.current) {
      spotRef.current.target = targetRef.current;
    }
  }, []);

  useFrame(() => {
    const material = skyCardRef.current;
    if (!material) return;
    const insideDistance = cave.exitX - vehicleStateRef.current.position.x;
    material.opacity = THREE.MathUtils.clamp((insideDistance - 0.6) / 5, 0, 1) * 0.58;
  });

  return (
    <>
      <spotLight
        ref={spotRef}
        position={[cave.exitX + 1.35, floorY + 9.2, cave.centerZ]}
        color="#ffd39a"
        intensity={1450}
        distance={32}
        angle={0.5}
        penumbra={0.78}
        decay={1.6}
      />
      <object3D
        ref={targetRef}
        position={[cave.exitX - 5.8, floorY + 0.8, cave.centerZ]}
      />

      <pointLight
        position={[cave.exitX + 0.35, floorY + 1.45, cave.centerZ]}
        color="#e8b070"
        intensity={8}
        distance={10}
        decay={1.8}
      />

      <mesh
        position={[cave.exitX + 0.9, floorY + 5.9, cave.centerZ]}
        rotation={[0, Math.PI / 2, 0]}
        aria-hidden="true"
      >
        <planeGeometry args={[10, 12]} />
        <meshBasicMaterial
          ref={skyCardRef}
          color="#ffc888"
          transparent
          opacity={0.58}
          toneMapped={false}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}
