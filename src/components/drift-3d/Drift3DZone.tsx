"use client";

import type { DriftBiome, DriftZoneConfig } from "@/types/drift";
import { getDrift3DZoneTransform } from "@/lib/drift3d";
import type { Drift3DZoneToneState } from "@/lib/drift3d";

type Drift3DZoneProps = {
  zone: DriftZoneConfig;
  mapWidth: number;
  mapHeight: number;
  toneState: Drift3DZoneToneState;
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
    platform: "#ecf5f4",
    ring: "#93c1c4",
    core: "#d9ecee",
    emissive: "#b4e1e5",
  },
  "zeeland-road": {
    platform: "#ece4d4",
    ring: "#beaf97",
    core: "#d2c1a6",
  },
  "midnight-office": {
    platform: "#e7eaec",
    ring: "#9aa3aa",
    core: "#bcc3c8",
  },
  "here-there": {
    platform: "#edf4f5",
    ring: "#99c0c7",
    core: "#d4e5e7",
  },
  "plain-signal": {
    platform: "#f3efe8",
    ring: "#c8c0b2",
    core: "#e8e2d7",
  },
  "neural-loop": {
    platform: "#ececf2",
    ring: "#adaacd",
    core: "#d3d2e7",
  },
  "hold-light": {
    platform: "#f3ead4",
    ring: "#cfad62",
    core: "#fff1c7",
    emissive: "#ffd27b",
  },
  "birth-yard": {
    platform: "#f0e4d7",
    ring: "#c29761",
    core: "#dec09a",
  },
};

function ZoneCore({
  zone,
  radius,
  toneState,
}: {
  zone: DriftZoneConfig;
  radius: number;
  toneState: Drift3DZoneToneState;
}) {
  const tone = biomeMaterial[zone.biome];
  const emissive = tone.emissive ?? "#000000";
  const stateBoost =
    toneState === "active" ? 1.36 : toneState === "nearest" ? 1.14 : 1;
  const emissiveIntensity = tone.emissive ? 0.2 * stateBoost : 0;

  switch (zone.biome) {
    case "entry-signal":
      return (
        <group>
          <mesh position={[0, 0.24, 0]}>
            <cylinderGeometry args={[0.028, 0.038, 0.52, 8]} />
            <meshStandardMaterial color="#6a756f" roughness={0.72} />
          </mesh>
          <mesh position={[0, 0.57, 0]}>
            <sphereGeometry args={[0.1, 12, 8]} />
            <meshStandardMaterial
              color={tone.core}
              emissive={emissive}
              emissiveIntensity={emissiveIntensity}
              roughness={0.54}
            />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.58, 0]}>
            <torusGeometry args={[radius * 0.24, 0.012, 8, 28]} />
            <meshStandardMaterial color={tone.ring} roughness={0.8} />
          </mesh>
        </group>
      );
    case "zeeland-road":
      return (
        <group rotation={[0, -0.28, 0]}>
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[radius * 1.72, 0.05, 0.12]} />
            <meshStandardMaterial color={tone.core} roughness={0.88} />
          </mesh>
          <mesh position={[0, 0.136, 0]}>
            <boxGeometry args={[radius * 1.34, 0.022, 0.018]} />
            <meshStandardMaterial color="#faf7f0" roughness={0.82} />
          </mesh>
        </group>
      );
    case "midnight-office":
      return (
        <group>
          <mesh position={[0, 0.14, 0]}>
            <boxGeometry args={[radius * 0.58, 0.22, radius * 0.38]} />
            <meshStandardMaterial color={tone.core} roughness={0.8} />
          </mesh>
          <mesh position={[radius * 0.16, 0.35, -radius * 0.1]}>
            <boxGeometry args={[0.05, 0.36, 0.05]} />
            <meshStandardMaterial color={tone.ring} roughness={0.76} />
          </mesh>
        </group>
      );
    case "here-there":
      return (
        <group>
          <mesh position={[-radius * 0.24, 0.095, 0]}>
            <cylinderGeometry args={[radius * 0.2, radius * 0.26, 0.1, 10]} />
            <meshStandardMaterial color={tone.core} roughness={0.86} />
          </mesh>
          <mesh position={[radius * 0.25, 0.085, radius * 0.05]}>
            <cylinderGeometry args={[radius * 0.18, radius * 0.24, 0.09, 10]} />
            <meshStandardMaterial color={tone.platform} roughness={0.88} />
          </mesh>
          <mesh position={[0.01, 0.14, radius * 0.02]}>
            <boxGeometry args={[radius * 0.42, 0.025, 0.035]} />
            <meshStandardMaterial color={tone.ring} roughness={0.82} />
          </mesh>
        </group>
      );
    case "plain-signal":
      return (
        <group>
          <mesh position={[0, 0.05, 0]}>
            <boxGeometry args={[0.08, 0.08, 0.08]} />
            <meshStandardMaterial color={tone.core} roughness={0.94} />
          </mesh>
          <mesh position={[0, 0.13, 0]}>
            <cylinderGeometry args={[0.016, 0.016, 0.1, 6]} />
            <meshStandardMaterial color={tone.ring} roughness={0.92} />
          </mesh>
        </group>
      );
    case "neural-loop":
      return (
        <group>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.14, 0]}>
            <torusGeometry args={[radius * 0.37, 0.018, 8, 34]} />
            <meshStandardMaterial color={tone.ring} roughness={0.86} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.17, 0]}>
            <torusGeometry args={[radius * 0.23, 0.014, 8, 30]} />
            <meshStandardMaterial color={tone.core} roughness={0.86} />
          </mesh>
        </group>
      );
    case "hold-light":
      return (
        <group>
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.028, 0.038, 0.46, 8]} />
            <meshStandardMaterial color="#7b7061" roughness={0.74} />
          </mesh>
          <mesh position={[0, 0.55, 0]}>
            <sphereGeometry args={[0.13, 14, 10]} />
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
          <mesh position={[-radius * 0.16, 0.14, 0]} rotation={[0, 0, 0.08]}>
            <coneGeometry args={[0.12, 0.3, 5]} />
            <meshStandardMaterial color={tone.core} roughness={0.82} />
          </mesh>
          <mesh position={[radius * 0.15, 0.1, radius * 0.1]} rotation={[0, 0, -0.12]}>
            <boxGeometry args={[0.22, 0.16, 0.18]} />
            <meshStandardMaterial color={tone.ring} roughness={0.84} />
          </mesh>
          <mesh position={[radius * 0.03, 0.06, -radius * 0.11]}>
            <coneGeometry args={[0.06, 0.14, 4]} />
            <meshStandardMaterial color="#d6ba98" roughness={0.86} />
          </mesh>
        </group>
      );
  }
}

export default function Drift3DZone({
  zone,
  mapWidth,
  mapHeight,
  toneState,
}: Drift3DZoneProps) {
  const transform = getDrift3DZoneTransform(zone, {
    width: mapWidth,
    height: mapHeight,
  });
  const tone = biomeMaterial[zone.biome];
  const isEntry = zone.trackSlug === null;
  const scale = toneState === "active" ? 1.08 : toneState === "nearest" ? 1.04 : 1;

  return (
    <group
      position={[
        transform.position.x,
        transform.position.y,
        transform.position.z,
      ]}
      scale={scale}
      aria-hidden="true"
    >
      <mesh>
        <cylinderGeometry
          args={[
            transform.radius * (isEntry ? 0.8 : 0.69),
            transform.radius * (isEntry ? 0.86 : 0.74),
            transform.height,
            isEntry ? 18 : 16,
          ]}
        />
        <meshStandardMaterial color={tone.platform} roughness={0.9} />
      </mesh>

      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, transform.height / 2 + 0.016, 0]}
      >
        <torusGeometry
          args={[
            transform.radius * (isEntry ? 0.92 : 0.8),
            isEntry ? 0.02 : 0.016,
            8,
            42,
          ]}
        />
        <meshStandardMaterial color={tone.ring} roughness={0.84} />
      </mesh>

      <ZoneCore zone={zone} radius={transform.radius} toneState={toneState} />
    </group>
  );
}
