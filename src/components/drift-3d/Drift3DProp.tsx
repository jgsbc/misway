"use client";

import type { DriftProp } from "@/types/drift";
import { getDrift3DPropTransform } from "@/lib/drift3d";

type Drift3DPropProps = {
  prop: DriftProp;
  mapWidth: number;
  mapHeight: number;
};

function PropShape({ prop }: { prop: DriftProp }) {
  switch (prop.type) {
    case "sign":
      return (
        <group>
          <mesh position={[0, 0.11, 0]}>
            <cylinderGeometry args={[0.012, 0.014, 0.22, 6]} />
            <meshStandardMaterial color="#777064" roughness={0.82} />
          </mesh>
          <mesh position={[0, 0.24, 0]}>
            <boxGeometry args={[0.22, 0.1, 0.025]} />
            <meshStandardMaterial color="#f6f1e8" roughness={0.84} />
          </mesh>
        </group>
      );
    case "lamp":
      return (
        <group>
          <mesh position={[0, 0.13, 0]}>
            <cylinderGeometry args={[0.012, 0.015, 0.26, 7]} />
            <meshStandardMaterial color="#746b5d" roughness={0.78} />
          </mesh>
          <mesh position={[0, 0.31, 0]}>
            <sphereGeometry args={[0.055, 10, 8]} />
            <meshStandardMaterial
              color="#fff0bf"
              emissive="#f3c66b"
              emissiveIntensity={0.16}
              roughness={0.54}
            />
          </mesh>
        </group>
      );
    case "speaker":
      return (
        <group>
          <mesh position={[0, 0.08, 0]}>
            <boxGeometry args={[0.18, 0.16, 0.11]} />
            <meshStandardMaterial color="#6c6861" roughness={0.82} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.09, -0.06]}>
            <cylinderGeometry args={[0.045, 0.045, 0.012, 14]} />
            <meshStandardMaterial color="#d7d1c5" roughness={0.82} />
          </mesh>
        </group>
      );
    case "cable":
      return (
        <mesh position={[0, 0.02, 0]}>
          <boxGeometry args={[0.42, 0.018, 0.025]} />
          <meshStandardMaterial color="#8a8277" roughness={0.9} />
        </mesh>
      );
    case "chair":
      return (
        <group>
          <mesh position={[0, 0.08, 0]}>
            <boxGeometry args={[0.16, 0.04, 0.14]} />
            <meshStandardMaterial color="#d7cec0" roughness={0.86} />
          </mesh>
          <mesh position={[0, 0.16, 0.065]}>
            <boxGeometry args={[0.16, 0.14, 0.025]} />
            <meshStandardMaterial color="#c6bbaa" roughness={0.86} />
          </mesh>
        </group>
      );
    case "stone":
      return (
        <mesh position={[0, 0.045, 0]} rotation={[0.1, 0.2, 0]}>
          <dodecahedronGeometry args={[0.08, 0]} />
          <meshStandardMaterial color="#cfc8bb" roughness={0.95} />
        </mesh>
      );
    case "synth":
      return (
        <group>
          <mesh position={[0, 0.055, 0]}>
            <boxGeometry args={[0.28, 0.05, 0.15]} />
            <meshStandardMaterial color="#e8e1d5" roughness={0.84} />
          </mesh>
          <mesh position={[-0.06, 0.09, -0.05]}>
            <boxGeometry args={[0.025, 0.018, 0.08]} />
            <meshStandardMaterial color="#615c55" roughness={0.84} />
          </mesh>
          <mesh position={[0.01, 0.09, -0.05]}>
            <boxGeometry args={[0.025, 0.018, 0.08]} />
            <meshStandardMaterial color="#615c55" roughness={0.84} />
          </mesh>
        </group>
      );
    case "marker":
      return (
        <group>
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.052, 0.064, 0.1, 9]} />
            <meshStandardMaterial color="#eee9df" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.12, 0]}>
            <sphereGeometry args={[0.032, 8, 6]} />
            <meshStandardMaterial color="#777269" roughness={0.86} />
          </mesh>
        </group>
      );
    case "bridge":
      return (
        <group>
          <mesh position={[-0.13, 0.04, 0]}>
            <boxGeometry args={[0.2, 0.025, 0.035]} />
            <meshStandardMaterial color="#bdb5a8" roughness={0.86} />
          </mesh>
          <mesh position={[0.13, 0.04, 0]}>
            <boxGeometry args={[0.2, 0.025, 0.035]} />
            <meshStandardMaterial color="#bdb5a8" roughness={0.86} />
          </mesh>
        </group>
      );
    case "desk":
      return (
        <group>
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[0.28, 0.055, 0.16]} />
            <meshStandardMaterial color="#d6d2c9" roughness={0.85} />
          </mesh>
          <mesh position={[-0.1, 0.035, -0.05]}>
            <boxGeometry args={[0.025, 0.08, 0.025]} />
            <meshStandardMaterial color="#8c857a" roughness={0.88} />
          </mesh>
          <mesh position={[0.1, 0.035, 0.05]}>
            <boxGeometry args={[0.025, 0.08, 0.025]} />
            <meshStandardMaterial color="#8c857a" roughness={0.88} />
          </mesh>
        </group>
      );
    case "loop-arrow":
      return (
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.055, 0]}>
          <torusGeometry args={[0.11, 0.012, 7, 24]} />
          <meshStandardMaterial color="#aaa5bd" roughness={0.86} />
        </mesh>
      );
  }
}

export default function Drift3DProp({
  prop,
  mapWidth,
  mapHeight,
}: Drift3DPropProps) {
  const transform = getDrift3DPropTransform(prop, {
    width: mapWidth,
    height: mapHeight,
  });

  return (
    <group
      position={[
        transform.position.x,
        transform.position.y,
        transform.position.z,
      ]}
      rotation={[0, transform.rotationY, 0]}
      aria-hidden="true"
    >
      <PropShape prop={prop} />
    </group>
  );
}
