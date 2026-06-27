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
        scale={1.34}
        aria-hidden="true"
      >
        <mesh position={[0, 0.15, 0]}>
          <capsuleGeometry args={[0.18, 0.74, 6, 10]} />
          <meshStandardMaterial
            color="#bdb0a1"
            roughness={0.76}
            metalness={0.03}
          />
        </mesh>

        <mesh position={[0.09, 0.2, 0.08]} rotation={[0, -0.12, 0]}>
          <boxGeometry args={[0.21, 0.11, 0.18]} />
          <meshStandardMaterial color="#f6f0e7" roughness={0.78} />
        </mesh>

        <mesh position={[-0.03, 0.29, -0.08]}>
          <sphereGeometry args={[0.078, 10, 8]} />
          <meshStandardMaterial color="#d7d0c4" roughness={0.66} />
        </mesh>

        <mesh position={[-0.18, 0.04, 0.07]} rotation={[0, 0.14, Math.PI / 2]}>
          <cylinderGeometry args={[0.016, 0.016, 0.3, 6]} />
          <meshStandardMaterial color="#786e61" roughness={0.82} />
        </mesh>

        <mesh position={[-0.18, 0.3, 0.07]}>
          <sphereGeometry args={[0.042, 10, 8]} />
          <meshStandardMaterial
            color="#fff3c8"
            emissive="#e4d5a5"
            emissiveIntensity={0.22}
            roughness={0.5}
          />
        </mesh>

        <group position={[0, 0.34, -0.03]}>
          <mesh position={[-0.072, 0, 0]} rotation={[0, 0, 0.38]}>
            <boxGeometry args={[0.02, 0.22, 0.02]} />
            <meshStandardMaterial color="#9d9486" roughness={0.8} />
          </mesh>
          <mesh position={[0.072, 0, 0]} rotation={[0, 0, -0.38]}>
            <boxGeometry args={[0.02, 0.22, 0.02]} />
            <meshStandardMaterial color="#9d9486" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[0.14, 0.022, 0.02]} />
            <meshStandardMaterial color="#efe6d6" roughness={0.72} />
          </mesh>
        </group>

        <mesh position={[0.01, 0.03, -0.19]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.12, 0.011, 8, 22]} />
          <meshStandardMaterial color="#c4b8a7" roughness={0.86} />
        </mesh>

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
          <ringGeometry args={[0.18, 0.26, 24]} />
          <meshStandardMaterial color="#c2b59f" roughness={0.9} />
        </mesh>
      </group>
    );
  }
);

export default Drift3DVehicle;
