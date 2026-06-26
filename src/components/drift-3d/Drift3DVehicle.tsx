"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

export type Drift3DVehicleHandle = {
  position: {
    set: (x: number, y: number, z: number) => void;
  };
  rotation: {
    setY: (y: number) => void;
  };
};

type Drift3DVehicleProps = {
  position: [number, number, number];
};

const Drift3DVehicle = forwardRef<Drift3DVehicleHandle, Drift3DVehicleProps>(
  function Drift3DVehicle({ position }, ref) {
    const vehicleGroupRef = useRef<{
      position: {
        set: (x: number, y: number, z: number) => void;
      };
      rotation: {
        x: number;
        y: number;
        z: number;
        set: (x: number, y: number, z: number) => void;
      };
    } | null>(null);

    useImperativeHandle(ref, () => ({
      position: {
        set(x: number, y: number, z: number) {
          vehicleGroupRef.current?.position.set(x, y, z);
        },
      },
      rotation: {
        setY(y: number) {
          const vehicleGroup = vehicleGroupRef.current;

          if (!vehicleGroup) {
            return;
          }

          vehicleGroup.rotation.set(
            vehicleGroup.rotation.x,
            y,
            vehicleGroup.rotation.z
          );
        },
      },
    }), []);

    useEffect(() => {
      vehicleGroupRef.current?.rotation.set(0.04, 0, -0.02);
    }, []);

    return (
      <group
        ref={vehicleGroupRef as never}
        position={position}
        scale={1.22}
        aria-hidden="true"
      >
        <mesh position={[0, 0.14, 0]}>
          <capsuleGeometry args={[0.16, 0.64, 6, 10]} />
          <meshStandardMaterial
            color="#cbc2b4"
            roughness={0.8}
            metalness={0.02}
          />
        </mesh>

        <mesh position={[0.08, 0.18, 0.08]} rotation={[0, -0.12, 0]}>
          <boxGeometry args={[0.18, 0.1, 0.16]} />
          <meshStandardMaterial color="#f5f0e8" roughness={0.8} />
        </mesh>

        <mesh position={[-0.03, 0.26, -0.08]}>
          <sphereGeometry args={[0.07, 10, 8]} />
          <meshStandardMaterial color="#d5cec0" roughness={0.68} />
        </mesh>

        <mesh position={[-0.18, 0.04, 0.07]} rotation={[0, 0.14, Math.PI / 2]}>
          <cylinderGeometry args={[0.016, 0.016, 0.26, 6]} />
          <meshStandardMaterial color="#857a6d" roughness={0.82} />
        </mesh>

        <mesh position={[-0.18, 0.26, 0.07]}>
          <sphereGeometry args={[0.036, 10, 8]} />
          <meshStandardMaterial
            color="#fff2c3"
            emissive="#ddd2a7"
            emissiveIntensity={0.18}
            roughness={0.52}
          />
        </mesh>

        <group position={[0, 0.32, -0.03]}>
          <mesh position={[-0.075, 0, 0]} rotation={[0, 0, 0.38]}>
            <boxGeometry args={[0.02, 0.2, 0.02]} />
            <meshStandardMaterial color="#a39989" roughness={0.8} />
          </mesh>
          <mesh position={[0.075, 0, 0]} rotation={[0, 0, -0.38]}>
            <boxGeometry args={[0.02, 0.2, 0.02]} />
            <meshStandardMaterial color="#a39989" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[0.12, 0.02, 0.02]} />
            <meshStandardMaterial color="#efe8d9" roughness={0.72} />
          </mesh>
        </group>

        <mesh position={[0.01, 0.03, -0.18]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.11, 0.01, 8, 22]} />
          <meshStandardMaterial color="#c8beae" roughness={0.86} />
        </mesh>

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
          <ringGeometry args={[0.16, 0.23, 24]} />
          <meshStandardMaterial color="#c6bba8" roughness={0.9} />
        </mesh>
      </group>
    );
  }
);

export default Drift3DVehicle;
