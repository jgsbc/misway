"use client";

import {
  forwardRef,
  useLayoutEffect,
  useImperativeHandle,
  useRef,
} from "react";
import type { Group, Object3D, SpotLight } from "three";

export type Drift3DVehicleHandle = {
  position: {
    set: (x: number, y: number, z: number) => void;
  };
  rotation: {
    setY: (y: number) => void;
    setLean: (lean: number) => void;
    /** Assiette avant/arrière : pente du terrain ou piqué en vol. */
    setPitch: (pitch: number) => void;
  };
  /** Fait rouler les quatre roues (angle en radians). */
  setWheelRoll: (deltaAngle: number) => void;
};

type Drift3DVehicleProps = {
  initialPosition: [number, number, number];
};

const BASE_TILT_X = 0.04;
const BASE_TILT_Z = -0.02;

/** Rayon local des roues — sert au calcul du roulage dans la scène. */
export const DRIFT_3D_VEHICLE_WHEEL_RADIUS = 0.11 * 1.34;

const BODY_SAND = "#ab9464";
const ROOF_WHITE = "#d8d2c2";
const GLASS = "#22303c";
const DARK_METAL = "#3a3833";
const TIRE = "#17181a";

function Wheel({
  x,
  z,
  groupRef,
}: {
  x: number;
  z: number;
  groupRef: (group: Group | null) => void;
}) {
  return (
    <group ref={groupRef} position={[x, 0.11, z]}>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.11, 0.11, 0.09, 14]} />
        <meshStandardMaterial color={TIRE} roughness={0.95} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.048, 0.048, 0.092, 10]} />
        <meshStandardMaterial color="#8f8a80" roughness={0.5} metalness={0.4} />
      </mesh>
    </group>
  );
}

/**
 * 4x4 safari procédural type Defender : carrosserie anguleuse sable, toit
 * blanc, galerie chargée (malle, jerrycan, roue de secours), snorkel,
 * pare-buffle, phares ronds qui éclairent réellement la nuit.
 * L'avant du véhicule regarde +z (cap 0 de la physique).
 */
const Drift3DVehicle = forwardRef<Drift3DVehicleHandle, Drift3DVehicleProps>(
  function Drift3DVehicle({ initialPosition }, ref) {
    const vehicleGroupRef = useRef<Group | null>(null);
    const wheelGroupsRef = useRef<Array<Group | null>>([null, null, null, null]);
    const headlightRef = useRef<SpotLight | null>(null);
    const headlightTargetRef = useRef<Object3D | null>(null);

    useImperativeHandle(
      ref,
      () => ({
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
          setLean(lean: number) {
            const vehicleGroup = vehicleGroupRef.current;

            if (!vehicleGroup) {
              return;
            }

            vehicleGroup.rotation.set(
              vehicleGroup.rotation.x,
              vehicleGroup.rotation.y,
              BASE_TILT_Z + lean
            );
          },
          setPitch(pitch: number) {
            const vehicleGroup = vehicleGroupRef.current;

            if (!vehicleGroup) {
              return;
            }

            vehicleGroup.rotation.set(
              BASE_TILT_X + pitch,
              vehicleGroup.rotation.y,
              vehicleGroup.rotation.z
            );
          },
        },
        setWheelRoll(deltaAngle: number) {
          for (const wheel of wheelGroupsRef.current) {
            if (wheel) {
              wheel.rotation.x += deltaAngle;
            }
          }
        },
      }),
      []
    );

    useLayoutEffect(() => {
      const vehicleGroup = vehicleGroupRef.current;

      if (!vehicleGroup) {
        return;
      }

      vehicleGroup.position.set(
        initialPosition[0],
        initialPosition[1],
        initialPosition[2]
      );
      // lacet appliqué en monde, tangage/roulis en repère véhicule
      vehicleGroup.rotation.order = "YXZ";
      vehicleGroup.rotation.set(BASE_TILT_X, 0, BASE_TILT_Z);

      if (headlightRef.current && headlightTargetRef.current) {
        headlightRef.current.target = headlightTargetRef.current;
      }
    }, [initialPosition]);

    return (
      <group
        ref={vehicleGroupRef}
        scale={1.34}
        renderOrder={10}
        aria-hidden="true"
        onUpdate={(group) => {
          group.traverse((child) => {
            if ("isMesh" in child && child.isMesh) {
              child.castShadow = true;
            }
          });
        }}
      >
        {/* roues */}
        <Wheel
          x={-0.24}
          z={0.3}
          groupRef={(group) => {
            wheelGroupsRef.current[0] = group;
          }}
        />
        <Wheel
          x={0.24}
          z={0.3}
          groupRef={(group) => {
            wheelGroupsRef.current[1] = group;
          }}
        />
        <Wheel
          x={-0.24}
          z={-0.28}
          groupRef={(group) => {
            wheelGroupsRef.current[2] = group;
          }}
        />
        <Wheel
          x={0.24}
          z={-0.28}
          groupRef={(group) => {
            wheelGroupsRef.current[3] = group;
          }}
        />

        {/* caisse */}
        <mesh position={[0, 0.27, 0]}>
          <boxGeometry args={[0.5, 0.18, 0.98]} />
          <meshStandardMaterial
            color={BODY_SAND}
            roughness={0.55}
            metalness={0.12}
          />
        </mesh>
        {/* capot plat */}
        <mesh position={[0, 0.4, 0.32]}>
          <boxGeometry args={[0.46, 0.09, 0.3]} />
          <meshStandardMaterial
            color={BODY_SAND}
            roughness={0.55}
            metalness={0.12}
          />
        </mesh>
        {/* cabine */}
        <mesh position={[0, 0.47, -0.1]}>
          <boxGeometry args={[0.46, 0.22, 0.55]} />
          <meshStandardMaterial
            color={BODY_SAND}
            roughness={0.58}
            metalness={0.1}
          />
        </mesh>
        {/* vitrage */}
        <mesh position={[0, 0.5, 0.185]} rotation={[-0.08, 0, 0]}>
          <boxGeometry args={[0.4, 0.15, 0.025]} />
          <meshStandardMaterial
            color={GLASS}
            roughness={0.12}
            metalness={0.4}
          />
        </mesh>
        <mesh position={[-0.235, 0.5, -0.12]}>
          <boxGeometry args={[0.015, 0.13, 0.4]} />
          <meshStandardMaterial
            color={GLASS}
            roughness={0.12}
            metalness={0.4}
          />
        </mesh>
        <mesh position={[0.235, 0.5, -0.12]}>
          <boxGeometry args={[0.015, 0.13, 0.4]} />
          <meshStandardMaterial
            color={GLASS}
            roughness={0.12}
            metalness={0.4}
          />
        </mesh>
        <mesh position={[0, 0.5, -0.375]}>
          <boxGeometry args={[0.34, 0.12, 0.015]} />
          <meshStandardMaterial
            color={GLASS}
            roughness={0.12}
            metalness={0.4}
          />
        </mesh>
        {/* toit blanc safari */}
        <mesh position={[0, 0.6, -0.1]}>
          <boxGeometry args={[0.48, 0.035, 0.6]} />
          <meshStandardMaterial color={ROOF_WHITE} roughness={0.6} />
        </mesh>

        {/* galerie de toit */}
        <mesh position={[0, 0.655, 0.14]}>
          <boxGeometry args={[0.5, 0.03, 0.03]} />
          <meshStandardMaterial color={DARK_METAL} roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.655, -0.38]}>
          <boxGeometry args={[0.5, 0.03, 0.03]} />
          <meshStandardMaterial color={DARK_METAL} roughness={0.6} />
        </mesh>
        <mesh position={[-0.235, 0.655, -0.12]}>
          <boxGeometry args={[0.03, 0.03, 0.55]} />
          <meshStandardMaterial color={DARK_METAL} roughness={0.6} />
        </mesh>
        <mesh position={[0.235, 0.655, -0.12]}>
          <boxGeometry args={[0.03, 0.03, 0.55]} />
          <meshStandardMaterial color={DARK_METAL} roughness={0.6} />
        </mesh>
        {/* chargement : malle, jerrycan, roue de secours */}
        <mesh position={[-0.09, 0.71, -0.2]}>
          <boxGeometry args={[0.2, 0.09, 0.28]} />
          <meshStandardMaterial color="#6e5c40" roughness={0.85} />
        </mesh>
        <mesh position={[0.13, 0.72, -0.3]}>
          <boxGeometry args={[0.07, 0.11, 0.12]} />
          <meshStandardMaterial color="#7a3a2c" roughness={0.7} />
        </mesh>
        <mesh position={[0.1, 0.7, 0.02]}>
          <cylinderGeometry args={[0.1, 0.1, 0.055, 14]} />
          <meshStandardMaterial color={TIRE} roughness={0.95} />
        </mesh>

        {/* snorkel */}
        <mesh position={[0.245, 0.45, 0.14]}>
          <boxGeometry args={[0.035, 0.34, 0.05]} />
          <meshStandardMaterial color="#2c2b28" roughness={0.7} />
        </mesh>
        <mesh position={[0.245, 0.64, 0.11]}>
          <boxGeometry args={[0.05, 0.06, 0.09]} />
          <meshStandardMaterial color="#2c2b28" roughness={0.7} />
        </mesh>

        {/* pare-buffle */}
        <mesh position={[0, 0.28, 0.52]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.018, 0.018, 0.42, 8]} />
          <meshStandardMaterial
            color="#4a4844"
            roughness={0.5}
            metalness={0.5}
          />
        </mesh>
        <mesh position={[-0.13, 0.24, 0.52]}>
          <cylinderGeometry args={[0.015, 0.015, 0.16, 8]} />
          <meshStandardMaterial
            color="#4a4844"
            roughness={0.5}
            metalness={0.5}
          />
        </mesh>
        <mesh position={[0.13, 0.24, 0.52]}>
          <cylinderGeometry args={[0.015, 0.015, 0.16, 8]} />
          <meshStandardMaterial
            color="#4a4844"
            roughness={0.5}
            metalness={0.5}
          />
        </mesh>

        {/* phares ronds + feux arrière */}
        <mesh position={[-0.15, 0.36, 0.505]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.02, 12]} />
          <meshStandardMaterial
            color="#fff2cc"
            emissive="#ffe9a8"
            emissiveIntensity={0.6}
            roughness={0.3}
          />
        </mesh>
        <mesh position={[0.15, 0.36, 0.505]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.02, 12]} />
          <meshStandardMaterial
            color="#fff2cc"
            emissive="#ffe9a8"
            emissiveIntensity={0.6}
            roughness={0.3}
          />
        </mesh>
        <mesh position={[-0.17, 0.33, -0.495]}>
          <boxGeometry args={[0.035, 0.035, 0.012]} />
          <meshStandardMaterial
            color="#8f2020"
            emissive="#c92c2c"
            emissiveIntensity={0.4}
            roughness={0.5}
          />
        </mesh>
        <mesh position={[0.17, 0.33, -0.495]}>
          <boxGeometry args={[0.035, 0.035, 0.012]} />
          <meshStandardMaterial
            color="#8f2020"
            emissive="#c92c2c"
            emissiveIntensity={0.4}
            roughness={0.5}
          />
        </mesh>

        {/* faisceau des phares — diégétique, porte la nuit */}
        <spotLight
          ref={headlightRef}
          position={[0, 0.4, 0.5]}
          color="#ffe6b0"
          intensity={1200}
          distance={22}
          angle={0.55}
          penumbra={0.6}
          decay={2}
        />
        <object3D ref={headlightTargetRef} position={[0, 0.08, 4]} />
      </group>
    );
  }
);

export default Drift3DVehicle;
