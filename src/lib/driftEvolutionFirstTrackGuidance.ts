import type { Track } from "./tracks";
import {
  drift3dTrackNodeBySlug,
  drift3dTrackNodes,
  getDrift3DNodeRadius,
  type Drift3DWorldPoint,
} from "./drift3dTopology";
import {
  DRIFT_EVOLUTION_ENTRY_CAVE,
  getDriftEvolutionEntryPathCenterZ,
} from "./driftEvolutionEntryCave";
import {
  DRIFT_EVOLUTION_ZEELAND_ROUTE,
  DRIFT_EVOLUTION_ZEELAND_TARGET,
} from "./driftEvolutionZeelandGeography";

export const DRIFT_EVOLUTION_FIRST_TRACK_SLUG =
  "a-walk-in-zeeland" as const satisfies Track["slug"];

export const DRIFT_EVOLUTION_FIRST_TRACK_GUIDANCE_HALF_WIDTH = 6.4;

export type DriftEvolutionTrackGuidance = {
  trackSlug: Track["slug"];
  target: { x: number; z: number };
  distance: number;
  activationRadius: number;
  mode: "first-reveal" | "nearest";
};

function distanceToSegment(
  point: { x: number; z: number },
  start: { x: number; z: number },
  end: { x: number; z: number }
) {
  const dx = end.x - start.x;
  const dz = end.z - start.z;
  const lengthSquared = dx * dx + dz * dz;
  if (lengthSquared <= 1e-9) {
    return Math.hypot(point.x - start.x, point.z - start.z);
  }

  const t = Math.min(
    1,
    Math.max(
      0,
      ((point.x - start.x) * dx + (point.z - start.z) * dz) /
        lengthSquared
    )
  );
  const x = start.x + dx * t;
  const z = start.z + dz * t;
  return Math.hypot(point.x - x, point.z - z);
}

function getFirstTrackApproachPath() {
  const cave = DRIFT_EVOLUTION_ENTRY_CAVE;
  const caveSamples = Array.from({ length: 6 }, (_, index) => {
    const t = index / 5;
    const x = cave.spawnX + (cave.exitX - cave.spawnX) * t;
    return { x, z: getDriftEvolutionEntryPathCenterZ(x) };
  });

  // The fourth Zeeland route point is already inside the promoted Zeeland
  // playable radius. Stop guidance there so the later harbour circulation is
  // free to hand over naturally to the nearest-track compass policy.
  const entryToZeeland = DRIFT_EVOLUTION_ZEELAND_ROUTE.slice(1, 4).map(
    (point) => ({ x: point.x, z: point.z })
  );

  return [...caveSamples, ...entryToZeeland];
}

export function isDriftEvolutionFirstTrackApproach(point: {
  x: number;
  z: number;
}) {
  const path = getFirstTrackApproachPath();
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (let index = 0; index < path.length - 1; index += 1) {
    nearestDistance = Math.min(
      nearestDistance,
      distanceToSegment(point, path[index], path[index + 1])
    );
  }

  return nearestDistance <= DRIFT_EVOLUTION_FIRST_TRACK_GUIDANCE_HALF_WIDTH;
}

export function getDriftEvolutionNearestTrackGuidance(
  point: Pick<Drift3DWorldPoint, "x" | "z">
): DriftEvolutionTrackGuidance | null {
  let best: DriftEvolutionTrackGuidance | null = null;

  for (const node of drift3dTrackNodes) {
    const distance = Math.hypot(
      point.x - node.position.x,
      point.z - node.position.z
    );
    if (best && distance >= best.distance) continue;

    best = {
      trackSlug: node.trackSlug,
      target: { x: node.position.x, z: node.position.z },
      distance,
      activationRadius: getDrift3DNodeRadius(node),
      mode: "nearest",
    };
  }

  return best;
}

export function getDriftEvolutionTrackGuidance(
  point: Pick<Drift3DWorldPoint, "x" | "z">
): DriftEvolutionTrackGuidance | null {
  if (isDriftEvolutionFirstTrackApproach(point)) {
    const node = drift3dTrackNodeBySlug[DRIFT_EVOLUTION_FIRST_TRACK_SLUG];
    return {
      trackSlug: DRIFT_EVOLUTION_FIRST_TRACK_SLUG,
      target: {
        x: DRIFT_EVOLUTION_ZEELAND_TARGET.x,
        z: DRIFT_EVOLUTION_ZEELAND_TARGET.z,
      },
      distance: Math.hypot(
        point.x - DRIFT_EVOLUTION_ZEELAND_TARGET.x,
        point.z - DRIFT_EVOLUTION_ZEELAND_TARGET.z
      ),
      activationRadius: getDrift3DNodeRadius(node),
      mode: "first-reveal",
    };
  }

  return getDriftEvolutionNearestTrackGuidance(point);
}
