import { getDrift3DVehicleStartPosition } from "@/lib/drift3dBase";
import { getDrift3DGroundY } from "@/lib/drift3dTerrain";
import {
  DRIFT_3D_TOPOLOGY_WORLD_DEPTH,
  DRIFT_3D_TOPOLOGY_WORLD_WIDTH,
  drift3dTrackNodeBySlug,
} from "@/lib/drift3dTopology";
import { DRIFT_3D_VEHICLE_GROUND_CLEARANCE } from "@/lib/drift3dVehiclePhysics";

const zeeland = drift3dTrackNodeBySlug["a-walk-in-zeeland"].position;
const legacyVehicleStart = getDrift3DVehicleStartPosition();
const worldMinZ = -DRIFT_3D_TOPOLOGY_WORLD_DEPTH / 2;

// Exact spatial dimensions from the EVO-21 state the owner validated visually.
const VALIDATED_TOTAL_CAVE_LENGTH = 45.2;
const VALIDATED_PORTAL_DEPTH = 11;
const VALIDATED_SPAWN_INSET = 2.7;
const caveStartZ = legacyVehicleStart.z - VALIDATED_TOTAL_CAVE_LENGTH;
const portalInnerZ =
  legacyVehicleStart.z - VALIDATED_PORTAL_DEPTH + 1;

/**
 * DRIFT-EVO-24 — restore the validated cave scale and stage it correctly.
 *
 * The south edge remains open terrain. Roughly forty metres of the existing
 * descent lead from the map edge to the cave mass. The cave itself keeps the
 * exact total depth of the EVO-21 composition the owner had validated, and
 * its exterior opening lands on the old production 4x4 spawn: the point from
 * which Birth Yard used to be discovered before the cave salvage existed.
 */
export const DRIFT_EVOLUTION_ENTRY_CAVE = Object.freeze({
  centerX: legacyVehicleStart.x,
  startZ: caveStartZ,
  spawnZ: caveStartZ + VALIDATED_SPAWN_INSET,
  // Inner face of the thick fractured portal. EntryCaveSalvage extrudes from
  // mouthZ - 1 through portalDepth, so its exterior face is exactly exitZ.
  mouthZ: portalInnerZ,
  exitZ: legacyVehicleStart.z,
  halfWidth: 3.7,
  apexHeight: 5.4,
  rings: 64,
  around: 26,
  portalDepth: VALIDATED_PORTAL_DEPTH,
  activationRadius: 70,
  dustCount: 220,
  dripCount: 44,
  stalactiteCount: 44,
  rockCount: 96,
  deepExposureFactor: 0.28,
  revealFadeStartZ: legacyVehicleStart.z - 14,
  revealFadeEndZ: legacyVehicleStart.z + 10,
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
  const worldMaxZ = DRIFT_3D_TOPOLOGY_WORLD_DEPTH / 2;
  const descentLength = cave.startZ - worldMinZ;
  const totalCaveLength = cave.exitZ - cave.startZ;
  const portalExteriorZ = cave.mouthZ - 1 + cave.portalDepth;

  if (
    Math.abs(cave.centerX - legacyVehicleStart.x) > 0.001 ||
    Math.abs(cave.exitZ - legacyVehicleStart.z) > 0.001
  ) {
    issues.push("cave opening must equal the former production vehicle spawn");
  }

  if (descentLength < 35 || descentLength > 45) {
    issues.push("south world edge must remain an open descent before the cave");
  }

  if (Math.abs(totalCaveLength - VALIDATED_TOTAL_CAVE_LENGTH) > 0.001) {
    issues.push("cave must keep the owner-validated EVO-21 total length");
  }

  if (!(start.z > cave.startZ && start.z < cave.mouthZ)) {
    issues.push("evolution spawn must sit at the back of the recovered tunnel");
  }

  if (cave.exitZ - start.z < 40) {
    issues.push("spawn must preserve the validated deep-cave reveal run");
  }

  if (Math.abs(portalExteriorZ - cave.exitZ) > 0.001) {
    issues.push("fractured portal exterior must terminate at the old 4x4 spawn");
  }

  const exitToBirthYard = zeeland.z - cave.exitZ;
  if (exitToBirthYard < 6 || exitToBirthYard > 10) {
    issues.push("cave exit must reveal Birth Yard from the former vehicle start");
  }

  if (bounds.maxX - bounds.minX < 9 || bounds.maxY < 14) {
    issues.push("fractured portal lost its historical monumental scale");
  }

  if (cave.portalDepth < 8 || cave.portalDepth > 12) {
    issues.push("portal thickness must preserve the validated traversal parallax");
  }

  if (
    cave.centerX - 12 < worldMinX ||
    cave.centerX + 12 > worldMaxX ||
    cave.startZ < worldMinZ ||
    cave.exitZ > worldMaxZ
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
