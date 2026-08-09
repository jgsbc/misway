"use client";

import { useEffect, useMemo } from "react";
import { ExtrudeGeometry, Shape } from "three";
import { DRIFT_3D_VEHICLE_HERO_PROFILE } from "@/lib/drift3dVehicleHeroStudy";

export type Drift3DVehicleHeroView =
  | "rear-three-quarter"
  | "side"
  | "front-three-quarter";

type VehicleHeroPilotProps = {
  view: Drift3DVehicleHeroView;
};

type ProfilePoint = readonly [x: number, y: number];

const BODY_SAND = DRIFT_3D_VEHICLE_HERO_PROFILE.bodyColor;
const BODY_SHADOW = "#786744";
const ROOF_CREAM = DRIFT_3D_VEHICLE_HERO_PROFILE.roofColor;
const GLASS = "#17242d";
const DARK_METAL = "#2d302f";
const TIRE = "#17191a";
const RIM = "#817d73";
const LAMP = "#f7e6b9";
const REAR_LAMP = "#932d25";

const VIEW_YAW: Record<Drift3DVehicleHeroView, number> = {
  "rear-three-quarter": Math.PI / 2 - 0.58,
  side: 0,
  "front-three-quarter": -Math.PI / 2 + 0.58,
};

function createProfilePrism(
  points: readonly ProfilePoint[],
  width: number,
  bevelSize = 0.035
) {
  const shape = new Shape();
  const first = points[0];
  shape.moveTo(first[0], first[1]);

  for (let index = 1; index < points.length; index += 1) {
    const point = points[index];
    shape.lineTo(point[0], point[1]);
  }

  shape.closePath();

  const geometry = new ExtrudeGeometry(shape, {
    depth: width,
    steps: 1,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize,
    bevelThickness: bevelSize,
    curveSegments: 2,
  });
  geometry.translate(0, 0, -width / 2);
  geometry.computeVertexNormals();
  return geometry;
}

function SafariWheel({ x, z }: { x: number; z: number }) {
  const radius = DRIFT_3D_VEHICLE_HERO_PROFILE.wheelRadiusMeters;

  return (
    <group position={[x, radius + 0.02, z]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius, 0.27, 28, 1]} />
        <meshStandardMaterial color={TIRE} roughness={0.94} metalness={0.02} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, z > 0 ? 0.142 : -0.142]}>
        <cylinderGeometry args={[0.19, 0.19, 0.018, 18]} />
        <meshStandardMaterial color={RIM} roughness={0.46} metalness={0.5} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, z > 0 ? 0.153 : -0.153]}>
        <cylinderGeometry args={[0.065, 0.065, 0.02, 14]} />
        <meshStandardMaterial color={DARK_METAL} roughness={0.4} metalness={0.65} />
      </mesh>
      <mesh position={[0, 0.02, z > 0 ? 0.155 : -0.155]}>
        <torusGeometry args={[radius + 0.025, 0.035, 7, 24, Math.PI]} />
        <meshStandardMaterial color={BODY_SHADOW} roughness={0.72} metalness={0.06} />
      </mesh>
    </group>
  );
}

function RoundLamp({
  x,
  y,
  z,
  color = LAMP,
}: {
  x: number;
  y: number;
  z: number;
  color?: string;
}) {
  return (
    <mesh position={[x, y, z]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.115, 0.115, 0.055, 22]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={color === LAMP ? 0.32 : 0.18}
        roughness={0.28}
        metalness={0.15}
      />
    </mesh>
  );
}

export default function VehicleHeroPilot({ view }: VehicleHeroPilotProps) {
  const lowerBodyGeometry = useMemo(
    () =>
      createProfilePrism(
        [
          [-2.05, 0.5],
          [-2.05, 0.96],
          [-1.84, 1.1],
          [0.72, 1.1],
          [1.05, 1.05],
          [1.82, 0.91],
          [2.05, 0.72],
          [2.05, 0.5],
        ],
        1.66,
        0.045
      ),
    []
  );

  const cabinGeometry = useMemo(
    () =>
      createProfilePrism(
        [
          [-1.68, 1.08],
          [-1.58, 1.77],
          [-1.3, 1.94],
          [0.55, 1.94],
          [0.86, 1.7],
          [1.02, 1.08],
        ],
        1.56,
        0.035
      ),
    []
  );

  useEffect(
    () => () => {
      lowerBodyGeometry.dispose();
      cabinGeometry.dispose();
    },
    [cabinGeometry, lowerBodyGeometry]
  );

  return (
    <group rotation={[0, VIEW_YAW[view], 0]} position={[0, 0.02, 0]}>
      <mesh geometry={lowerBodyGeometry} castShadow receiveShadow>
        <meshStandardMaterial color={BODY_SAND} roughness={0.5} metalness={0.08} />
      </mesh>
      <mesh geometry={cabinGeometry} castShadow receiveShadow>
        <meshStandardMaterial color={BODY_SAND} roughness={0.52} metalness={0.07} />
      </mesh>

      {/* Lower dirty sill — gives the body mass and used-expedition character. */}
      <mesh position={[-0.05, 0.59, 0]} castShadow>
        <boxGeometry args={[3.72, 0.15, 1.72]} />
        <meshStandardMaterial color={BODY_SHADOW} roughness={0.88} metalness={0.02} />
      </mesh>

      {/* Wheels and rounded fender lips. */}
      <SafariWheel x={1.3} z={0.88} />
      <SafariWheel x={1.3} z={-0.88} />
      <SafariWheel x={-1.3} z={0.88} />
      <SafariWheel x={-1.3} z={-0.88} />

      {/* White safari roof with a slight overhang, as in the accepted Drift vehicle. */}
      <mesh position={[-0.37, 2.0, 0]} castShadow>
        <boxGeometry args={[2.72, 0.09, 1.73]} />
        <meshStandardMaterial color={ROOF_CREAM} roughness={0.68} metalness={0.02} />
      </mesh>

      {/* Windscreen / rear glass. */}
      <mesh position={[0.94, 1.55, 0]} rotation={[0, 0, -0.17]}>
        <boxGeometry args={[0.035, 0.57, 1.44]} />
        <meshStandardMaterial color={GLASS} roughness={0.08} metalness={0.16} />
      </mesh>
      <mesh position={[-1.61, 1.55, 0]} rotation={[0, 0, 0.035]}>
        <boxGeometry args={[0.03, 0.55, 1.42]} />
        <meshStandardMaterial color={GLASS} roughness={0.08} metalness={0.16} />
      </mesh>

      {/* Side glass is divided into real door-sized panes instead of one black slab. */}
      {([-1, 1] as const).map((side) => (
        <group key={side} position={[0, 0, side * 0.792]}>
          <mesh position={[-1.12, 1.56, 0]}>
            <boxGeometry args={[0.72, 0.51, 0.022]} />
            <meshStandardMaterial color={GLASS} roughness={0.08} metalness={0.16} />
          </mesh>
          <mesh position={[-0.28, 1.56, 0]}>
            <boxGeometry args={[0.72, 0.51, 0.022]} />
            <meshStandardMaterial color={GLASS} roughness={0.08} metalness={0.16} />
          </mesh>
          <mesh position={[0.47, 1.54, 0]}>
            <boxGeometry args={[0.54, 0.48, 0.022]} />
            <meshStandardMaterial color={GLASS} roughness={0.08} metalness={0.16} />
          </mesh>
          <mesh position={[-0.7, 1.54, side * 0.018]}>
            <boxGeometry args={[0.045, 0.62, 0.045]} />
            <meshStandardMaterial color={DARK_METAL} roughness={0.58} />
          </mesh>
          <mesh position={[0.13, 1.54, side * 0.018]}>
            <boxGeometry args={[0.04, 0.61, 0.045]} />
            <meshStandardMaterial color={DARK_METAL} roughness={0.58} />
          </mesh>
          <mesh position={[-0.7, 1.2, side * 0.025]}>
            <boxGeometry args={[0.045, 0.05, 0.055]} />
            <meshStandardMaterial color={DARK_METAL} roughness={0.55} metalness={0.28} />
          </mesh>
          <mesh position={[0.14, 1.2, side * 0.025]}>
            <boxGeometry args={[0.045, 0.05, 0.055]} />
            <meshStandardMaterial color={DARK_METAL} roughness={0.55} metalness={0.28} />
          </mesh>
          {/* Side step. */}
          <mesh position={[-0.45, 0.58, side * 0.93]} castShadow>
            <boxGeometry args={[2.45, 0.09, 0.18]} />
            <meshStandardMaterial color={DARK_METAL} roughness={0.78} metalness={0.22} />
          </mesh>
        </group>
      ))}

      {/* Hood crown + grille make the front read as a real off-road nose. */}
      <mesh position={[1.48, 1.03, 0]} castShadow>
        <boxGeometry args={[1.02, 0.075, 1.54]} />
        <meshStandardMaterial color={BODY_SAND} roughness={0.46} metalness={0.08} />
      </mesh>
      <mesh position={[2.045, 0.91, 0]}>
        <boxGeometry args={[0.055, 0.38, 1.18]} />
        <meshStandardMaterial color={DARK_METAL} roughness={0.62} metalness={0.32} />
      </mesh>
      {[ -0.38, -0.19, 0, 0.19, 0.38 ].map((z) => (
        <mesh key={z} position={[2.078, 0.92, z]}>
          <boxGeometry args={[0.035, 0.3, 0.055]} />
          <meshStandardMaterial color="#171a19" roughness={0.74} metalness={0.2} />
        </mesh>
      ))}
      <RoundLamp x={2.09} y={1.03} z={0.58} />
      <RoundLamp x={2.09} y={1.03} z={-0.58} />
      <mesh position={[2.14, 0.57, 0]} castShadow>
        <boxGeometry args={[0.14, 0.17, 1.87]} />
        <meshStandardMaterial color={DARK_METAL} roughness={0.58} metalness={0.42} />
      </mesh>

      {/* Bull bar — deliberately restrained so it reads as equipment, not ornament. */}
      <mesh position={[2.26, 0.84, 0]} castShadow>
        <boxGeometry args={[0.065, 0.055, 1.55]} />
        <meshStandardMaterial color={DARK_METAL} roughness={0.5} metalness={0.54} />
      </mesh>
      <mesh position={[2.25, 0.97, 0.61]} castShadow>
        <boxGeometry args={[0.06, 0.38, 0.055]} />
        <meshStandardMaterial color={DARK_METAL} roughness={0.5} metalness={0.54} />
      </mesh>
      <mesh position={[2.25, 0.97, -0.61]} castShadow>
        <boxGeometry args={[0.06, 0.38, 0.055]} />
        <meshStandardMaterial color={DARK_METAL} roughness={0.5} metalness={0.54} />
      </mesh>

      {/* Rear bumper, tail lights and the masterframe-critical rear spare wheel. */}
      <mesh position={[-2.13, 0.58, 0]} castShadow>
        <boxGeometry args={[0.14, 0.16, 1.82]} />
        <meshStandardMaterial color={DARK_METAL} roughness={0.62} metalness={0.38} />
      </mesh>
      <RoundLamp x={-2.08} y={0.93} z={0.63} color={REAR_LAMP} />
      <RoundLamp x={-2.08} y={0.93} z={-0.63} color={REAR_LAMP} />
      <group position={[-2.23, 1.28, 0]} rotation={[0, 0, Math.PI / 2]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.43, 0.43, 0.25, 28]} />
          <meshStandardMaterial color={TIRE} roughness={0.94} />
        </mesh>
        <mesh position={[0, 0.135, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.022, 18]} />
          <meshStandardMaterial color={RIM} roughness={0.5} metalness={0.45} />
        </mesh>
      </group>

      {/* Roof rack and expedition cargo — silhouette first, no branded props. */}
      <group position={[-0.42, 2.13, 0]}>
        <mesh position={[0, 0, 0.75]} castShadow>
          <boxGeometry args={[2.72, 0.045, 0.045]} />
          <meshStandardMaterial color={DARK_METAL} roughness={0.55} metalness={0.45} />
        </mesh>
        <mesh position={[0, 0, -0.75]} castShadow>
          <boxGeometry args={[2.72, 0.045, 0.045]} />
          <meshStandardMaterial color={DARK_METAL} roughness={0.55} metalness={0.45} />
        </mesh>
        {[-1.18, -0.4, 0.4, 1.18].map((x) => (
          <mesh key={x} position={[x, 0, 0]} castShadow>
            <boxGeometry args={[0.045, 0.045, 1.53]} />
            <meshStandardMaterial color={DARK_METAL} roughness={0.55} metalness={0.45} />
          </mesh>
        ))}
        <mesh position={[-0.45, 0.17, 0.1]} castShadow>
          <boxGeometry args={[0.78, 0.28, 0.68]} />
          <meshStandardMaterial color="#766242" roughness={0.86} metalness={0.02} />
        </mesh>
        <mesh position={[0.43, 0.16, -0.28]} castShadow>
          <boxGeometry args={[0.52, 0.26, 0.42]} />
          <meshStandardMaterial color="#626154" roughness={0.82} metalness={0.08} />
        </mesh>
      </group>

      {/* Snorkel and mirrors reinforce the expedition / safari read. */}
      <mesh position={[0.72, 1.52, 0.87]} castShadow>
        <boxGeometry args={[0.085, 0.86, 0.085]} />
        <meshStandardMaterial color={DARK_METAL} roughness={0.7} metalness={0.16} />
      </mesh>
      <mesh position={[0.67, 1.94, 0.87]} castShadow>
        <boxGeometry args={[0.19, 0.11, 0.13]} />
        <meshStandardMaterial color={DARK_METAL} roughness={0.7} metalness={0.16} />
      </mesh>
      {([-1, 1] as const).map((side) => (
        <group key={side} position={[0.62, 1.57, side * 0.96]}>
          <mesh castShadow>
            <boxGeometry args={[0.24, 0.13, 0.07]} />
            <meshStandardMaterial color={DARK_METAL} roughness={0.52} metalness={0.32} />
          </mesh>
          <mesh position={[-0.15, -0.05, side * -0.02]}>
            <boxGeometry args={[0.17, 0.035, 0.035]} />
            <meshStandardMaterial color={DARK_METAL} roughness={0.56} metalness={0.28} />
          </mesh>
        </group>
      ))}

      {/* Underbody / axles: small details that stop the vehicle reading like a floating toy. */}
      <mesh position={[-0.05, 0.34, 0]} castShadow>
        <boxGeometry args={[2.25, 0.16, 0.55]} />
        <meshStandardMaterial color="#202321" roughness={0.9} metalness={0.15} />
      </mesh>
      <mesh position={[1.3, 0.43, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.07, 1.62, 10]} />
        <meshStandardMaterial color={DARK_METAL} roughness={0.75} metalness={0.35} />
      </mesh>
      <mesh position={[-1.3, 0.43, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.07, 1.62, 10]} />
        <meshStandardMaterial color={DARK_METAL} roughness={0.75} metalness={0.35} />
      </mesh>
    </group>
  );
}
