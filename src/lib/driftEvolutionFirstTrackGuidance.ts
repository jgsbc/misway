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
export const DRIFT_EVOLUTION_FIRST_TRACK_LOOKAHEAD = 4.6;

export type DriftEvolutionTrackGuidance = {
  trackSlug: Track["slug"];
  target: { x: number; z: number };
  distance: number;
  activationRadius: number;
  mode: "first-reveal" | "nearest";
};

type PathProjection = {
  distanceFromPath: number;
  distanceAlongPath: number;
};

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

function projectPointOntoPath(point: { x: number; z: number }): PathProjection {
  const path = getFirstTrackApproachPath();
  let best: PathProjection = {
    distanceFromPath: Number.POSITIVE_INFINITY,
    distanceAlongPath: 0,
  };
  let cumulativeDistance = 0;

  for (let index = 0; index < path.length - 1; index += 1) {
    const start = path[index];
    const end = path[index + 1];
    const dx = end.x - start.x;
    const dz = end.z - start.z;
    const length = Math.hypot(dx, dz);
    const lengthSquared = length * length;
    const t =
      lengthSquared <= 1e-9
        ? 0
        : Math.min(
            1,
            Math.max(
              0,
              ((point.x - start.x) * dx + (point.z - start.z) * dz) /
                lengthSquared
            )
          );
    const projectedX = start.x + dx * t;
    const projectedZ = start.z + dz * t;
    const distanceFromPath = Math.hypot(
      point.x - projectedX,
      point.z - projectedZ
    );

    if (distanceFromPath < best.distanceFromPath) {
      best = {
        distanceFromPath,
        distanceAlongPath: cumulativeDistance + length * t,
      };
    }

    cumulativeDistance += length;
  }

  return best;
}

function getPointAlongFirstTrackPath(distanceAlongPath: number) {
  const path = getFirstTrackApproachPath();
  let remaining = Math.max(0, distanceAlongPath);

  for (let index = 0; index < path.length - 1; index += 1) {
    const start = path[index];
    const end = path[index + 1];
    const dx = end.x - start.x;
    const dz = end.z - start.z;
    const length = Math.hypot(dx, dz);

    if (remaining <= length || index === path.length - 2) {
      const t = length <= 1e-9 ? 0 : Math.min(1, remaining / length);
      return {
        x: start.x + dx * t,
        z: start.z + dz * t,
      };
    }

    remaining -= length;
  }

  return path.at(-1) ?? {
    x: DRIFT_EVOLUTION_ZEELAND_TARGET.x,
    z: DRIFT_EVOLUTION_ZEELAND_TARGET.z,
  };
}

export function getDriftEvolutionFirstTrackNavigationTarget(point: {
  x: number;
  z: number;
}) {
  const projection = projectPointOntoPath(point);
  return getPointAlongFirstTrackPath(
    projection.distanceAlongPath + DRIFT_EVOLUTION_FIRST_TRACK_LOOKAHEAD
  );
}

export function isDriftEvolutionFirstTrackApproach(point: {
  x: number;
  z: number;
}) {
  return (
    projectPointOntoPath(point).distanceFromPath <=
    DRIFT_EVOLUTION_FIRST_TRACK_GUIDANCE_HALF_WIDTH
  );
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
      // The compass must guide the road the player can actually drive, not
      // point through cave walls, quays or water at the final node center.
      target: getDriftEvolutionFirstTrackNavigationTarget(point),
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
