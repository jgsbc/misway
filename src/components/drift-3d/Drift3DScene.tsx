"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import Drift3DVehicle from "@/components/drift-3d/Drift3DVehicle";
import Drift3DProp from "@/components/drift-3d/Drift3DProp";
import Drift3DZone from "@/components/drift-3d/Drift3DZone";
import { driftMapConfig } from "@/lib/driftMap";
import { getDrift3DSpawnTransform } from "@/lib/drift3d";

function StaticCameraFrame() {
  const camera = useThree((state) => state.camera);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    camera.position.set(8.8, 8.5, 11);
    camera.lookAt(0, 0, 0.58);
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, invalidate]);

  return null;
}

export default function Drift3DScene() {
  const { width, height, zones } = driftMapConfig;
  const spawnTransform = getDrift3DSpawnTransform({ width, height });

  return (
    <>
      <StaticCameraFrame />
      <color attach="background" args={["#f7f4ed"]} />
      <hemisphereLight args={["#ffffff", "#d6cec1", 1.6]} />
      <directionalLight position={[4, 7, 3]} intensity={1.2} />
      <ambientLight intensity={0.45} />

      <group rotation={[0, -0.32, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]}>
          <planeGeometry args={[15, 9.5]} />
          <meshStandardMaterial color="#f1ede4" roughness={0.92} />
        </mesh>

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.065, 0]}>
          <ringGeometry args={[1.08, 1.12, 72]} />
          <meshStandardMaterial color="#cfd8d9" roughness={0.86} />
        </mesh>

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.055, 0]}>
          <ringGeometry args={[1.72, 1.75, 72]} />
          <meshStandardMaterial color="#e0d4bf" roughness={0.9} />
        </mesh>

        <mesh position={[2.8, 0.02, -1.7]} rotation={[0, 0.28, 0]}>
          <boxGeometry args={[1.6, 0.04, 0.06]} />
          <meshStandardMaterial color="#d7cab6" roughness={0.88} />
        </mesh>

        <mesh position={[-3.2, 0.02, 1.8]} rotation={[0, -0.2, 0]}>
          <boxGeometry args={[1.9, 0.04, 0.06]} />
          <meshStandardMaterial color="#d5d9d7" roughness={0.88} />
        </mesh>

        {zones.map((zone) => (
          <Drift3DZone
            key={zone.id}
            zone={zone}
            mapWidth={width}
            mapHeight={height}
          />
        ))}

        {zones.flatMap((zone) =>
          (zone.props ?? []).map((prop) => (
            <Drift3DProp
              key={prop.id}
              prop={prop}
              mapWidth={width}
              mapHeight={height}
            />
          ))
        )}

        <Drift3DVehicle
          position={[
            spawnTransform.x + 1.08,
            spawnTransform.y,
            spawnTransform.z + 1.08,
          ]}
        />
      </group>
    </>
  );
}
