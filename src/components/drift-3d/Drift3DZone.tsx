"use client";

import type { Track } from "@/lib/tracks";
import type {
  Drift3DEraTopology,
  Drift3DNodeToneState,
  Drift3DRenderableNode,
} from "@/lib/drift3dTopology";
import { getDrift3DNodeRadius } from "@/lib/drift3dTopology";
import {
  DRIFT_3D_ZONE_CORE_HEIGHT,
  DRIFT_3D_ZONE_MARKER_HEIGHT,
  DRIFT_3D_ZONE_MARKER_Y,
  DRIFT_3D_ZONE_RING_THICKNESS,
} from "@/lib/drift3d";

type Drift3DEraRegionProps = {
  era: Drift3DEraTopology;
  toneState: Drift3DNodeToneState;
};

type Drift3DZoneProps = {
  node: Drift3DRenderableNode;
  era: Drift3DEraTopology;
  track: Track | null;
  toneState: Drift3DNodeToneState;
};

const eraMaterial: Record<
  Drift3DEraTopology["id"],
  {
    region: string;
    ring: string;
    core: string;
    node: string;
    highlight: string;
  }
> = {
  "birth-yard": {
    region: "#e8ddcf",
    ring: "#be965a",
    core: "#d7b98f",
    node: "#f2e7d8",
    highlight: "#c79d69",
  },
  "older-shadows": {
    region: "#e4e5e8",
    ring: "#aeb6bf",
    core: "#c1c7cf",
    node: "#eef0f2",
    highlight: "#9ca7b1",
  },
  "vegetative-field": {
    region: "#e7efde",
    ring: "#a6b98d",
    core: "#cdddb7",
    node: "#f0f4e7",
    highlight: "#b7c79c",
  },
  "new-signal": {
    region: "#e7ebef",
    ring: "#b2bdc9",
    core: "#c7d1db",
    node: "#f0f3f7",
    highlight: "#9eaab8",
  },
};

function NodeCore({
  node,
  radius,
  toneState,
  track,
  era,
}: {
  node: Drift3DRenderableNode;
  radius: number;
  toneState: Drift3DNodeToneState;
  track: Track | null;
  era: Drift3DEraTopology;
}) {
  const tone = eraMaterial[era.id];
  const emphasis =
    toneState === "active" ? 1.14 : toneState === "nearest" ? 1.06 : 1;
  const anchorBoost = node.role === "anchor" ? 1.16 : 1;
  const featuredBoost = track?.featured ? 1.05 : 1;
  const scale = emphasis * anchorBoost * featuredBoost;
  const platformRadius = radius * (node.role === "threshold" ? 0.58 : 0.68);
  const ringRadius = radius * (node.role === "threshold" ? 0.76 : 0.88);

  switch (node.role) {
    case "threshold":
      return (
        <group>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0015, 0]}>
            <circleGeometry args={[ringRadius * 0.18, 20]} />
            <meshStandardMaterial
              color="#6f756f"
              roughness={0.76}
              transparent
              opacity={0.9}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[0, 0.004, 0]}>
            <boxGeometry args={[0.12, DRIFT_3D_ZONE_CORE_HEIGHT, 0.12]} />
            <meshStandardMaterial
              color={tone.node}
              emissive={tone.highlight}
              emissiveIntensity={0.08 * scale}
              roughness={0.58}
              transparent
              opacity={0.94}
              depthWrite={false}
            />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
            <torusGeometry
              args={[ringRadius * 0.18, DRIFT_3D_ZONE_RING_THICKNESS, 8, 28]}
            />
            <meshStandardMaterial
              color={tone.ring}
              roughness={0.84}
              transparent
              opacity={0.9}
              depthWrite={false}
            />
          </mesh>
        </group>
      );
    case "anchor":
      return (
        <group>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0015, 0]}>
            <circleGeometry args={[platformRadius * 0.52, 24]} />
            <meshStandardMaterial
              color={tone.node}
              roughness={0.88}
              transparent
              opacity={0.9}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[0, 0.004, 0]}>
            <boxGeometry args={[0.18, DRIFT_3D_ZONE_CORE_HEIGHT, 0.14]} />
            <meshStandardMaterial
              color={tone.core}
              emissive={tone.highlight}
              emissiveIntensity={0.05 * scale}
              roughness={0.78}
              transparent
              opacity={0.94}
              depthWrite={false}
            />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
            <torusGeometry
              args={[
                ringRadius * 0.42,
                DRIFT_3D_ZONE_RING_THICKNESS + 0.001,
                8,
                32,
              ]}
            />
            <meshStandardMaterial
              color={tone.ring}
              roughness={0.82}
              transparent
              opacity={0.94}
              depthWrite={false}
            />
          </mesh>
        </group>
      );
    default:
      return (
        <group>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0015, 0]}>
            <circleGeometry args={[platformRadius * 0.38, 20]} />
            <meshStandardMaterial
              color={tone.node}
              roughness={0.9}
              transparent
              opacity={0.88}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[0, 0.004, 0]}>
            <boxGeometry args={[0.1, DRIFT_3D_ZONE_CORE_HEIGHT, 0.1]} />
            <meshStandardMaterial
              color={tone.core}
              emissive={tone.highlight}
              emissiveIntensity={0.04 * scale}
              roughness={0.72}
              transparent
              opacity={0.94}
              depthWrite={false}
            />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
            <torusGeometry
              args={[ringRadius * 0.34, DRIFT_3D_ZONE_RING_THICKNESS, 8, 28]}
            />
            <meshStandardMaterial
              color={tone.ring}
              roughness={0.84}
              transparent
              opacity={0.92}
              depthWrite={false}
            />
          </mesh>
        </group>
      );
  }
}

export function Drift3DEraRegion({ era, toneState }: Drift3DEraRegionProps) {
  const tone = eraMaterial[era.id];
  const emphasis =
    toneState === "active" ? 1.08 : toneState === "nearest" ? 1.04 : 1;

  return (
    <group
      position={[era.center.x, DRIFT_3D_ZONE_MARKER_Y - 0.004, era.center.z]}
      renderOrder={1}
      aria-hidden="true"
    >
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]}>
        <circleGeometry args={[era.radius * 0.74 * emphasis, 48]} />
        <meshStandardMaterial
          color={tone.region}
          transparent
          opacity={0.13 * emphasis}
          roughness={0.96}
          depthWrite={false}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 0]}>
        <ringGeometry args={[era.radius * 0.62, era.radius * 0.82, 48]} />
        <meshStandardMaterial
          color={tone.ring}
          transparent
          opacity={0.18 * emphasis}
          roughness={0.86}
          depthWrite={false}
        />
      </mesh>

      <mesh position={[0, DRIFT_3D_ZONE_CORE_HEIGHT, 0]}>
        <boxGeometry args={[0.18, DRIFT_3D_ZONE_CORE_HEIGHT, 0.18]} />
        <meshStandardMaterial
          color={tone.core}
          transparent
          opacity={0.8}
          roughness={0.84}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

export default function Drift3DZone({
  node,
  era,
  track,
  toneState,
}: Drift3DZoneProps) {
  const radius = getDrift3DNodeRadius(node);
  const emphasis =
    toneState === "active" ? 1.12 : toneState === "nearest" ? 1.05 : 1;

  return (
    <group
      position={[node.position.x, DRIFT_3D_ZONE_MARKER_Y, node.position.z]}
      scale={[emphasis, 1, emphasis]}
      renderOrder={2}
      aria-hidden="true"
    >
      <mesh position={[0, 0.003, 0]}>
        <cylinderGeometry
          args={[
            radius * (node.role === "anchor" ? 0.86 : 0.72),
            radius * (node.role === "anchor" ? 0.92 : 0.8),
            node.role === "threshold"
              ? DRIFT_3D_ZONE_MARKER_HEIGHT + 0.006
              : DRIFT_3D_ZONE_MARKER_HEIGHT,
            node.role === "threshold" ? 16 : 14,
          ]}
        />
        <meshStandardMaterial
          color={eraMaterial[era.id].region}
          roughness={0.92}
          transparent
          opacity={0.9}
          depthWrite={false}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 0]}>
        <torusGeometry
          args={[
            radius * (node.role === "anchor" ? 0.82 : 0.7),
            node.role === "threshold"
              ? DRIFT_3D_ZONE_RING_THICKNESS + 0.002
              : DRIFT_3D_ZONE_RING_THICKNESS,
            8,
            node.role === "threshold" ? 32 : 30,
          ]}
        />
        <meshStandardMaterial
          color={eraMaterial[era.id].ring}
          roughness={0.84}
          depthWrite={false}
        />
      </mesh>

      <NodeCore
        node={node}
        radius={radius}
        toneState={toneState}
        track={track}
        era={era}
      />
    </group>
  );
}
