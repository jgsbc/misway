"use client";

import type { DriftBiome, DriftZoneConfig } from "@/types/drift";
import { getDrift3DZoneTransform } from "@/lib/drift3d";

type Drift3DZoneProps = {
  zone: DriftZoneConfig;
  mapWidth: number;
  mapHeight: number;
};

const biomeMaterial: Record<
  DriftBiome,
  {
    platform: string;
    ring: string;
    core: string;
    emissive?: string;
  }
> = {
  "entry-signal": {
    platform: "#eef6f5",
    ring: "#a8cfd0",
    core: "#dfeff0",
    emissive: "#b8e4e6",
  },
  "zeeland-road": {
    platform: "#eee7da",
    ring: "#c7bda8",
    core: "#d6c9b1",
  },
  "midnight-office": {
    platform: "#e8ebec",
    ring: "#a9b2b8",
    core: "#c2c8cb",
  },
  "here-there": {
    platform: "#edf5f6",
    ring: "#a9c9d0",
    core: "#d8e8ea",
  },
  "plain-signal": {
    platform: "#f4f1eb",
    ring: "#cfc8bc",
    core: "#ece8df",
  },
  "neural-loop": {
    platform: "#ececf3",
    ring: "#b7b5cf",
    core: "#d7d6e7",
  },
  "hold-light": {
    platform: "#f3ead6",
    ring: "#d7ba76",
    core: "#fff1c7",
    emissive: "#ffd37a",
  },
  "birth-yard": {
    platform: "#f1e6d8",
    ring: "#caa575",
    core: "#e2c5a2",
  },
};

function ZoneCore({ zone, radius }: { zone: DriftZoneConfig; radius: number }) {
  const tone = biomeMaterial[zone.biome];
  const emissive = tone.emissive ?? "#000000";
  const emissiveIntensity = tone.emissive ? 0.18 : 0;

  switch (zone.biome) {
    case "entry-signal":
      return (
        <group>
          <mesh position={[0, 0.24, 0]}>
            <cylinderGeometry args={[0.025, 0.035, 0.46, 8]} />
            <meshStandardMaterial color="#6d7774" roughness={0.74} />
          </mesh>
          <mesh position={[0, 0.52, 0]}>
            <sphereGeometry args={[0.09, 12, 8]} />
            <meshStandardMaterial
              color={tone.core}
              emissive={emissive}
              emissiveIntensity={emissiveIntensity}
              roughness={0.54}
            />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.53, 0]}>
            <torusGeometry args={[radius * 0.22, 0.01, 8, 28]} />
            <meshStandardMaterial color={tone.ring} roughness={0.8} />
          </mesh>
        </group>
      );
    case "zeeland-road":
      return (
        <group rotation={[0, -0.28, 0]}>
          <mesh position={[0, 0.08, 0]}>
            <boxGeometry args={[radius * 1.55, 0.045, 0.12]} />
            <meshStandardMaterial color={tone.core} roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.112, 0]}>
            <boxGeometry args={[radius * 1.2, 0.02, 0.018]} />
            <meshStandardMaterial color="#f9f6ee" roughness={0.82} />
          </mesh>
        </group>
      );
    case "midnight-office":
      return (
        <group>
          <mesh position={[0, 0.13, 0]}>
            <boxGeometry args={[radius * 0.54, 0.2, radius * 0.36]} />
            <meshStandardMaterial color={tone.core} roughness={0.82} />
          </mesh>
          <mesh position={[radius * 0.16, 0.32, -radius * 0.1]}>
            <boxGeometry args={[0.05, 0.34, 0.05]} />
            <meshStandardMaterial color={tone.ring} roughness={0.76} />
          </mesh>
        </group>
      );
    case "here-there":
      return (
        <group>
          <mesh position={[-radius * 0.22, 0.09, 0]}>
            <cylinderGeometry args={[radius * 0.2, radius * 0.26, 0.09, 10]} />
            <meshStandardMaterial color={tone.core} roughness={0.88} />
          </mesh>
          <mesh position={[radius * 0.24, 0.08, radius * 0.05]}>
            <cylinderGeometry args={[radius * 0.18, radius * 0.24, 0.08, 10]} />
            <meshStandardMaterial color={tone.platform} roughness={0.88} />
          </mesh>
          <mesh position={[0.01, 0.13, radius * 0.02]}>
            <boxGeometry args={[radius * 0.38, 0.025, 0.035]} />
            <meshStandardMaterial color={tone.ring} roughness={0.82} />
          </mesh>
        </group>
      );
    case "plain-signal":
      return (
        <mesh position={[0, 0.11, 0]}>
          <boxGeometry args={[0.11, 0.11, 0.11]} />
          <meshStandardMaterial color={tone.core} roughness={0.9} />
        </mesh>
      );
    case "neural-loop":
      return (
        <group>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.13, 0]}>
            <torusGeometry args={[radius * 0.34, 0.018, 8, 34]} />
            <meshStandardMaterial color={tone.ring} roughness={0.86} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.16, 0]}>
            <torusGeometry args={[radius * 0.21, 0.014, 8, 30]} />
            <meshStandardMaterial color={tone.core} roughness={0.86} />
          </mesh>
        </group>
      );
    case "hold-light":
      return (
        <group>
          <mesh position={[0, 0.23, 0]}>
            <cylinderGeometry args={[0.026, 0.035, 0.42, 8]} />
            <meshStandardMaterial color="#7f7564" roughness={0.76} />
          </mesh>
          <mesh position={[0, 0.49, 0]}>
            <sphereGeometry args={[0.12, 14, 10]} />
            <meshStandardMaterial
              color={tone.core}
              emissive={emissive}
              emissiveIntensity={emissiveIntensity}
              roughness={0.5}
            />
          </mesh>
        </group>
      );
    case "birth-yard":
      return (
        <group>
          <mesh position={[-radius * 0.14, 0.14, 0]} rotation={[0, 0, 0.08]}>
            <coneGeometry args={[0.11, 0.28, 5]} />
            <meshStandardMaterial color={tone.core} roughness={0.82} />
          </mesh>
          <mesh position={[radius * 0.14, 0.1, radius * 0.1]} rotation={[0, 0, -0.12]}>
            <boxGeometry args={[0.2, 0.16, 0.18]} />
            <meshStandardMaterial color={tone.ring} roughness={0.84} />
          </mesh>
        </group>
      );
  }
}

export default function Drift3DZone({
  zone,
  mapWidth,
  mapHeight,
}: Drift3DZoneProps) {
  const transform = getDrift3DZoneTransform(zone, {
    width: mapWidth,
    height: mapHeight,
  });
  const tone = biomeMaterial[zone.biome];
  const isEntry = zone.trackSlug === null;

  return (
    <group
      position={[
        transform.position.x,
        transform.position.y,
        transform.position.z,
      ]}
      aria-hidden="true"
    >
      <mesh>
        <cylinderGeometry
          args={[
            transform.radius * (isEntry ? 0.72 : 0.62),
            transform.radius * (isEntry ? 0.78 : 0.68),
            transform.height,
            isEntry ? 18 : 14,
          ]}
        />
        <meshStandardMaterial color={tone.platform} roughness={0.92} />
      </mesh>

      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, transform.height / 2 + 0.014, 0]}
      >
        <torusGeometry
          args={[
            transform.radius * (isEntry ? 0.84 : 0.72),
            isEntry ? 0.018 : 0.014,
            8,
            42,
          ]}
        />
        <meshStandardMaterial color={tone.ring} roughness={0.86} />
      </mesh>

      <ZoneCore zone={zone} radius={transform.radius} />
    </group>
  );
}
