import { getDrift3DVehicleStartPosition } from "@/lib/drift3d";
import {
  DRIFT_3D_TOPOLOGY_WORLD_DEPTH,
  DRIFT_3D_TOPOLOGY_WORLD_WIDTH,
  drift3dThresholdNode,
} from "@/lib/drift3dTopology";

const start = getDrift3DVehicleStartPosition();

/**
 * DRIFT-EVO-20 — presentation-only cave authority for `/drift-evolution`.
 *
 * It is deliberately expressed in the restored production coordinate system.
 * No Fable world, route, vehicle, camera or topology constant is imported.
 */
export const DRIFT_EVOLUTION_ENTRY_CAVE = Object.freeze({
  centerX: start.x,
  startZ: drift3dThresholdNode.position.z - 9.5,
  mouthZ: drift3dThresholdNode.position.z + 11.2,
  halfWidth: 4.65,
  apexHeight: 5.7,
  rings: 46,
  around: 24,
  portalDepth: 2.4,
  activationRadius: 34,
  dustCount: 92,
});

/**
 * Fractured Λ-like mouth. Coordinates are local x/y around the tunnel axis.
 * The broad base stays physically driveable while the irregular apex carries
 * the existing Entry symbol as geology rather than as a vector logo.
 */
export const DRIFT_EVOLUTION_ENTRY_PORTAL_OUTLINE = Object.freeze([
  [-4.15, 0] as const,
  [-3.72, 0.72] as const,
  [-2.92, 2.05] as const,
  [-1.95, 3.48] as const,
  [-0.82, 5.62] as const,
  [-0.12, 6.38] as const,
  [0.48, 5.88] as const,
  [1.48, 4.08] as const,
  [2.58, 2.58] as const,
  [3.52, 1.08] as const,
  [4.18, 0] as const,
]);

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

export function getDriftEvolutionEntryCaveIssues() {
  const issues: string[] = [];
  const cave = DRIFT_EVOLUTION_ENTRY_CAVE;
  const bounds = getDriftEvolutionEntryPortalBounds();
  const worldMinX = -DRIFT_3D_TOPOLOGY_WORLD_WIDTH / 2;
  const worldMaxX = DRIFT_3D_TOPOLOGY_WORLD_WIDTH / 2;
  const worldMinZ = -DRIFT_3D_TOPOLOGY_WORLD_DEPTH / 2;
  const worldMaxZ = DRIFT_3D_TOPOLOGY_WORLD_DEPTH / 2;

  if (Math.abs(cave.centerX - start.x) > 0.001) {
    issues.push("cave axis must remain aligned to the production vehicle spawn");
  }

  if (!(start.z > cave.startZ && start.z < cave.mouthZ)) {
    issues.push("production spawn must sit inside the evolution tunnel");
  }

  if (cave.mouthZ - start.z < 7) {
    issues.push("cave must provide a meaningful forward emergence run");
  }

  if (bounds.maxX - bounds.minX < 7.5 || bounds.maxY < 5.5) {
    issues.push("portal opening is too small to read as a driveable fractured threshold");
  }

  if (
    cave.centerX - cave.halfWidth < worldMinX ||
    cave.centerX + cave.halfWidth > worldMaxX ||
    cave.startZ < worldMinZ ||
    cave.mouthZ + cave.portalDepth > worldMaxZ
  ) {
    issues.push("evolution cave must stay inside the restored production world bounds");
  }

  return issues;
}
