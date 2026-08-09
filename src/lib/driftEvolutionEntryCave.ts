import { getDrift3DGroundY } from "@/lib/drift3dTerrain";
import {
  DRIFT_3D_TOPOLOGY_WORLD_DEPTH,
  DRIFT_3D_TOPOLOGY_WORLD_WIDTH,
  drift3dThresholdNode,
  drift3dTrackNodeBySlug,
} from "@/lib/drift3dTopology";
import { DRIFT_3D_VEHICLE_GROUND_CLEARANCE } from "@/lib/drift3dVehiclePhysics";

const zeeland = drift3dTrackNodeBySlug["a-walk-in-zeeland"].position;

/**
 * DRIFT-EVO-20R — recovered Entry dramaturgy for `/drift-evolution`.
 *
 * The first salvage recovered Fable's mesh idea but compressed the sequence
 * to roughly twenty metres. The historical Fable slice was much more
 * deliberate: ~54 m of mineral gorge, then ~46 m from the mouth to the first
 * Birth Yard street. These values restore that spatial rhythm inside the
 * protected DRIFT bounds without moving production topology.
 *
 * EVO-22 keeps that setback but puts the recovered cave on the exact
 * production Entry → Zeeland axis. The old +2.15 spawn offset was a vehicle
 * convenience, not a world-design authority.
 */
export const DRIFT_EVOLUTION_ENTRY_CAVE = Object.freeze({
  centerX: zeeland.x,
  startZ: -71.2,
  spawnZ: -68.5,
  mouthZ: zeeland.z - 46,
  halfWidth: 3.7,
  apexHeight: 5.4,
  rings: 64,
  around: 26,
  portalDepth: 11,
  activationRadius: 70,
  dustCount: 220,
  dripCount: 44,
  stalactiteCount: 44,
  rockCount: 96,
  deepExposureFactor: 0.28,
  revealFadeStartZ: zeeland.z - 60,
  revealFadeEndZ: zeeland.z - 36,
});

/**
 * The historical Fable portal was not a symmetric logo-shaped arch. Its
 * outline was a noisy geological fracture that happened to read as Λ. The
 * anchors below preserve that asymmetry and monumental height while keeping
 * the right-hand leg driveable.
 */
const PORTAL_ANCHORS = [
  [-8.45, 0],
  [-6.05, 0],
  [-2.42, 6.6],
  [-1.02, 0],
  [1.96, 0],
  [-1.92, 15.4],
  [-4.02, 15.4],
] as const;

function portalNoise(seed: number) {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
}

export const DRIFT_EVOLUTION_ENTRY_PORTAL_OUTLINE = Object.freeze(
  PORTAL_ANCHORS.flatMap((anchor, index) => {
    const next = PORTAL_ANCHORS[(index + 1) % PORTAL_ANCHORS.length];
    const points: Array<readonly [number, number]> = [];
    const segments = 5;

    for (let segment = 0; segment < segments; segment += 1) {
      const t = segment / segments;
      const x = anchor[0] + (next[0] - anchor[0]) * t;
      const y = anchor[1] + (next[1] - anchor[1]) * t;
      const amplitude = y < 0.35 ? 0 : 0.7;
      const n = index * 17 + segment * 5 + 11;
      points.push([
        x + (portalNoise(n) - 0.5) * amplitude,
        Math.max(0, y + (portalNoise(n + 3) - 0.5) * amplitude),
      ] as const);
    }

    return points;
  })
);

export function getDriftEvolutionEntryPortalBounds() {
  const xs = DRIFT_EVOLUTION_ENTRY_PORTAL_OUTLINE.map(([x]) => x);
  const ys = DRIFT_EVOLUTION_ENTRY_PORTAL_OUTLINE.map(([, y]) => y);

  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
}

export function getDriftEvolutionEntryStartPosition() {
  const cave = DRIFT_EVOLUTION_ENTRY_CAVE;

  return {
    x: cave.centerX,
    y:
      getDrift3DGroundY(cave.centerX, cave.spawnZ) +
      DRIFT_3D_VEHICLE_GROUND_CLEARANCE,
    z: cave.spawnZ,
  };
}

export function getDriftEvolutionEntryTunnelMix(z: number) {
  const cave = DRIFT_EVOLUTION_ENTRY_CAVE;
  const t = Math.min(
    1,
    Math.max(
      0,
      (z - cave.revealFadeStartZ) /
        (cave.revealFadeEndZ - cave.revealFadeStartZ)
    )
  );
  const smooth = t * t * (3 - 2 * t);

  return 1 - smooth;
}

export function getDriftEvolutionEntryCaveIssues() {
  const issues: string[] = [];
  const cave = DRIFT_EVOLUTION_ENTRY_CAVE;
  const start = getDriftEvolutionEntryStartPosition();
  const bounds = getDriftEvolutionEntryPortalBounds();
  const worldMinX = -DRIFT_3D_TOPOLOGY_WORLD_WIDTH / 2;
  const worldMaxX = DRIFT_3D_TOPOLOGY_WORLD_WIDTH / 2;
  const worldMinZ = -DRIFT_3D_TOPOLOGY_WORLD_DEPTH / 2;
  const worldMaxZ = DRIFT_3D_TOPOLOGY_WORLD_DEPTH / 2;

  if (
    Math.abs(cave.centerX - zeeland.x) > 0.001 ||
    Math.abs(cave.centerX - drift3dThresholdNode.position.x) > 0.001
  ) {
    issues.push("recovered cave must stay on the canonical Entry to Birth Yard axis");
  }

  if (!(start.z > cave.startZ && start.z < cave.mouthZ)) {
    issues.push("evolution spawn must sit inside the recovered tunnel");
  }

  if (cave.mouthZ - start.z < 40) {
    issues.push("recovered tunnel must preserve a long penumbra run");
  }

  const mouthToBirthYard = zeeland.z - cave.mouthZ;
  if (mouthToBirthYard < 42 || mouthToBirthYard > 50) {
    issues.push("cave mouth must remain roughly 46 m before Birth Yard");
  }

  if (bounds.maxX - bounds.minX < 9 || bounds.maxY < 14) {
    issues.push("fractured portal lost its historical monumental scale");
  }

  if (cave.portalDepth < 8) {
    issues.push("portal wall must be thick enough to create traversal parallax");
  }

  if (
    cave.centerX - 12 < worldMinX ||
    cave.centerX + 12 > worldMaxX ||
    cave.startZ < worldMinZ ||
    cave.mouthZ + cave.portalDepth > worldMaxZ
  ) {
    issues.push("recovered Entry sequence must stay inside DRIFT world bounds");
  }

  if (
    cave.deepExposureFactor <= 0.15 ||
    cave.deepExposureFactor >= 0.5 ||
    cave.revealFadeStartZ >= cave.revealFadeEndZ
  ) {
    issues.push("penumbra-to-daylight exposure staging is invalid");
  }

  return issues;
}
