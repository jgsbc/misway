import {
  DRIFT_3D_TOPOLOGY_WORLD_DEPTH,
  DRIFT_3D_TOPOLOGY_WORLD_WIDTH,
} from "@/lib/drift3dTopology";

export const DRIFT_3D_NORTH_EAST_OCEAN = Object.freeze({
  minX: 16,
  maxX: 224,
  coastZ: -DRIFT_3D_TOPOLOGY_WORLD_DEPTH / 2,
  nearZ: -81,
  farZ: -250,
  waterY: -3.25,
  waveAmplitude: 0.18,
  surfaceSegmentsX: 32,
  surfaceSegmentsZ: 24,
  coastSegmentsX: 48,
  coastSegmentsZ: 10,
});

export const DRIFT_3D_SOUTH_VOID = Object.freeze({
  cliffStartZ: DRIFT_3D_TOPOLOGY_WORLD_DEPTH / 2,
  cliffEndZ: 84,
  nearZ: 84,
  farZ: 230,
  floorY: -19.5,
  starCount: 160,
  cliffSegmentsX: 64,
  cliffSegmentsZ: 12,
});

export function getDrift3DWorldEdgeIssues() {
  const issues: string[] = [];
  const ocean = DRIFT_3D_NORTH_EAST_OCEAN;
  const southVoid = DRIFT_3D_SOUTH_VOID;

  if (ocean.minX <= 0 || ocean.maxX <= DRIFT_3D_TOPOLOGY_WORLD_WIDTH / 2) {
    issues.push("north-east ocean must occupy the east side and extend past the world");
  }

  if (
    ocean.coastZ !== -DRIFT_3D_TOPOLOGY_WORLD_DEPTH / 2 ||
    ocean.nearZ >= ocean.coastZ ||
    ocean.farZ >= ocean.nearZ
  ) {
    issues.push("north-east ocean must begin beyond the northern coast");
  }

  if (ocean.waterY >= 0 || ocean.waveAmplitude <= 0 || ocean.waveAmplitude > 0.35) {
    issues.push("ocean surface must stay below land with restrained waves");
  }

  if (
    southVoid.cliffStartZ < 70 ||
    southVoid.cliffStartZ !== DRIFT_3D_TOPOLOGY_WORLD_DEPTH / 2 ||
    southVoid.cliffEndZ <= southVoid.cliffStartZ ||
    southVoid.nearZ < southVoid.cliffEndZ ||
    southVoid.farZ <= southVoid.nearZ
  ) {
    issues.push("south void must begin after the playable world and continue outward");
  }

  if (southVoid.floorY > -16) {
    issues.push("south void needs a readable terrain break and deep backdrop");
  }

  const vertexBudget =
    (ocean.surfaceSegmentsX + 1) * (ocean.surfaceSegmentsZ + 1) +
    (ocean.coastSegmentsX + 1) * (ocean.coastSegmentsZ + 1) +
    (southVoid.cliffSegmentsX + 1) * (southVoid.cliffSegmentsZ + 1) +
    southVoid.starCount;

  if (vertexBudget > 2600) {
    issues.push("world-edge biomes exceed their bounded geometry budget");
  }

  return issues;
}
