import {
  getDrift3DMovementBounds,
  getDrift3DVehicleStartPosition,
} from "@/lib/drift3dBase";
import { getDrift3DGroundY } from "@/lib/drift3dTerrain";
import {
  DRIFT_3D_TOPOLOGY_WORLD_DEPTH,
  DRIFT_3D_TOPOLOGY_WORLD_WIDTH,
  drift3dTrackNodeBySlug,
} from "@/lib/drift3dTopology";
import { DRIFT_3D_VEHICLE_GROUND_CLEARANCE } from "@/lib/drift3dVehiclePhysics";

const zeeland = drift3dTrackNodeBySlug["a-walk-in-zeeland"].position;
const legacyVehicleStart = getDrift3DVehicleStartPosition();
const movementBounds = getDrift3DMovementBounds();
const worldMinX = -DRIFT_3D_TOPOLOGY_WORLD_WIDTH / 2;
const worldMinZ = -DRIFT_3D_TOPOLOGY_WORLD_DEPTH / 2;
const worldMaxZ = DRIFT_3D_TOPOLOGY_WORLD_DEPTH / 2;

/**
 * DRIFT-EVO-25 — spatial contract derived from the restored map itself.
 *
 * The west border is already a high natural ridge. Its ground falls from
 * roughly seven metres at x≈-112 to the flat Entry/Birth Yard apron around
 * x≈-88. The recovered cave is bored through that existing west ridge instead
 * of being stretched north/south across the map.
 *
 * Contract:
 * - visual rock mass begins just inside the west world edge;
 * - 4x4 starts at the back of the cave, inside movement bounds;
 * - travel direction is west -> east;
 * - exterior opening is exactly the former production 4x4 start;
 * - Birth Yard, topology and production `/drift` never move.
 */
const WEST_RIDGE_VISUAL_INSET = 0.8;
const SPAWN_INSET_FROM_WORLD_EDGE = 4.5;
const PORTAL_DEPTH = 4.2;
const PORTAL_GEOMETRY_LEAD = 1;

export const DRIFT_EVOLUTION_ENTRY_CAVE = Object.freeze({
  startX: worldMinX + WEST_RIDGE_VISUAL_INSET,
  spawnX: Math.max(worldMinX + SPAWN_INSET_FROM_WORLD_EDGE, movementBounds.minX + 1.1),
  mouthX: legacyVehicleStart.x - PORTAL_DEPTH + PORTAL_GEOMETRY_LEAD,
  exitX: legacyVehicleStart.x,
  centerZ: legacyVehicleStart.z,
  halfWidth: 3.7,
  apexHeight: 5.4,
  rings: 56,
  around: 26,
  portalDepth: PORTAL_DEPTH,
  activationRadius: 52,
  dustCount: 180,
  dripCount: 36,
  stalactiteCount: 34,
  rockCount: 84,
  deepExposureFactor: 0.28,
  revealFadeStartX: legacyVehicleStart.x - 10,
  revealFadeEndX: legacyVehicleStart.x + 6,
});

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

export function getDriftEvolutionEntryProgress(x: number) {
  const cave = DRIFT_EVOLUTION_ENTRY_CAVE;
  return Math.min(1, Math.max(0, (x - cave.startX) / (cave.exitX - cave.startX)));
}

export function getDriftEvolutionEntryPathCenterZ(x: number) {
  const progress = getDriftEvolutionEntryProgress(x);
  return (
    DRIFT_EVOLUTION_ENTRY_CAVE.centerZ +
    Math.sin(progress * Math.PI * 1.08) * 0.55
  );
}

export function getDriftEvolutionEntryStartPosition() {
  const cave = DRIFT_EVOLUTION_ENTRY_CAVE;
  const z = getDriftEvolutionEntryPathCenterZ(cave.spawnX);

  return {
    x: cave.spawnX,
    y: getDrift3DGroundY(cave.spawnX, z) + DRIFT_3D_VEHICLE_GROUND_CLEARANCE,
    z,
  };
}

export function getDriftEvolutionEntryTunnelMix(x: number) {
  const cave = DRIFT_EVOLUTION_ENTRY_CAVE;
  const t = Math.min(
    1,
    Math.max(
      0,
      (x - cave.revealFadeStartX) /
        (cave.revealFadeEndX - cave.revealFadeStartX)
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
  const visualLength = cave.exitX - cave.startX;
  const portalExteriorX = cave.mouthX - PORTAL_GEOMETRY_LEAD + cave.portalDepth;
  const exitToBirthYard = Math.hypot(
    zeeland.x - cave.exitX,
    zeeland.z - cave.centerZ
  );
  const ridgeFloor = getDrift3DGroundY(cave.spawnX, start.z);
  const exitFloor = getDrift3DGroundY(cave.exitX, cave.centerZ);

  if (
    Math.abs(cave.exitX - legacyVehicleStart.x) > 0.001 ||
    Math.abs(cave.centerZ - legacyVehicleStart.z) > 0.001
  ) {
    issues.push("cave exterior opening must equal the former production vehicle spawn");
  }

  if (cave.startX - worldMinX < 0.4 || cave.startX - worldMinX > 1.5) {
    issues.push("cave rock mass must begin at the existing west ridge");
  }

  if (visualLength < 22 || visualLength > 28) {
    issues.push("west-ridge cave must stay compact rather than crossing the map");
  }

  if (!(start.x > cave.startX && start.x < cave.mouthX)) {
    issues.push("4x4 must start at the back of the west-ridge cave");
  }

  if (start.x < movementBounds.minX || start.x > movementBounds.maxX) {
    issues.push("evolution spawn must remain inside production movement bounds");
  }

  if (Math.abs(portalExteriorX - cave.exitX) > 0.001) {
    issues.push("fractured portal exterior must terminate at the old 4x4 spawn");
  }

  if (exitToBirthYard < 6 || exitToBirthYard > 10) {
    issues.push("cave exit must reveal Birth Yard from the former vehicle start");
  }

  if (ridgeFloor - exitFloor < 2.5) {
    issues.push("west-ridge tunnel must use the map's existing downhill terrain");
  }

  if (bounds.maxX - bounds.minX < 9 || bounds.maxY < 14) {
    issues.push("fractured portal lost its historical monumental scale");
  }

  if (cave.portalDepth < 3 || cave.portalDepth > 6) {
    issues.push("portal thickness must create parallax without becoming a second tunnel");
  }

  if (
    cave.centerZ - 12 < worldMinZ ||
    cave.centerZ + 12 > worldMaxZ ||
    cave.startX < worldMinX ||
    cave.exitX > DRIFT_3D_TOPOLOGY_WORLD_WIDTH / 2
  ) {
    issues.push("west-ridge Entry must remain inside DRIFT world bounds");
  }

  if (
    cave.deepExposureFactor <= 0.15 ||
    cave.deepExposureFactor >= 0.5 ||
    cave.revealFadeStartX >= cave.revealFadeEndX
  ) {
    issues.push("penumbra-to-daylight exposure staging is invalid");
  }

  return issues;
}
