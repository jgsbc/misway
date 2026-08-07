export * from "./drift3dTopologyBase";

import { driftZones } from "@/lib/driftMap";
import { tracks, type Track } from "@/lib/tracks";
import * as base from "./drift3dTopologyBase";
import {
  DRIFT_3D_PENINSULA_DEPTH,
  DRIFT_3D_PENINSULA_ENTRY_SPAWN,
  DRIFT_3D_PENINSULA_ERA_CENTERS,
  DRIFT_3D_PENINSULA_WIDTH,
} from "./drift3dPeninsula";
import type {
  Drift3DEraId,
  Drift3DEraTopology,
  Drift3DRenderableNode,
  Drift3DThresholdNode,
  Drift3DTopologyProximity,
  Drift3DTopologyValidationResult,
  Drift3DTrackNode,
  Drift3DWorldPoint,
} from "./drift3dTopologyBase";

export const DRIFT_3D_TOPOLOGY_WORLD_WIDTH = DRIFT_3D_PENINSULA_WIDTH;
export const DRIFT_3D_TOPOLOGY_WORLD_DEPTH = DRIFT_3D_PENINSULA_DEPTH;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function point(x: number, y: number, z: number): Drift3DWorldPoint {
  return { x, y, z };
}

/**
 * Campaign A2 relocates complete era clusters without scaling them.
 * Relative coordinates inside each era therefore stay exactly as authored on
 * production main; only the macro geography changes.
 */
export const drift3dEras: readonly Drift3DEraTopology[] = base.drift3dEras.map(
  (era) => {
    const center = DRIFT_3D_PENINSULA_ERA_CENTERS[era.id];

    return {
      ...era,
      center: point(center.x, era.center.y, center.z),
    };
  }
);

export const drift3dEraById = drift3dEras.reduce(
  (acc, era) => {
    acc[era.id] = era;
    return acc;
  },
  {} as Record<Drift3DEraId, Drift3DEraTopology>
);

export const drift3dThresholdNode: Drift3DThresholdNode = {
  ...base.drift3dThresholdNode,
  position: point(
    DRIFT_3D_PENINSULA_ENTRY_SPAWN.x,
    base.drift3dThresholdNode.position.y,
    DRIFT_3D_PENINSULA_ENTRY_SPAWN.z
  ),
};

function relocateTrackNode(node: (typeof base.drift3dTrackNodes)[number]) {
  const oldEra = base.drift3dEraById[node.eraId];
  const newEra = drift3dEraById[node.eraId];

  return {
    ...node,
    position: point(
      newEra.center.x + (node.position.x - oldEra.center.x),
      node.position.y,
      newEra.center.z + (node.position.z - oldEra.center.z)
    ),
  } satisfies Drift3DTrackNode;
}

export const drift3dTrackNodes: readonly Drift3DTrackNode[] =
  base.drift3dTrackNodes.map(relocateTrackNode);

export const drift3dRenderableNodes: readonly Drift3DRenderableNode[] = [
  drift3dThresholdNode,
  ...drift3dTrackNodes,
];

export const drift3dTrackNodeBySlug = drift3dTrackNodes.reduce(
  (acc, node) => {
    acc[node.trackSlug] = node;
    return acc;
  },
  {} as Record<Track["slug"], Drift3DTrackNode>
);

export function getDrift3DEraById(id: Drift3DEraId) {
  return drift3dEraById[id] ?? null;
}

export function getDrift3DTrackNodeBySlug(slug: Track["slug"]) {
  return drift3dTrackNodeBySlug[slug] ?? null;
}

export function getDrift3DTrackNodesByEra(eraId: Drift3DEraId) {
  return drift3dTrackNodes.filter((node) => node.eraId === eraId);
}

export function getDrift3DTopologyProximity(
  position: Drift3DWorldPoint
): Drift3DTopologyProximity {
  let nearest: {
    node: Drift3DRenderableNode;
    distance: number;
    radius: number;
  } | null = null;
  let active: {
    node: Drift3DRenderableNode;
    distance: number;
    radius: number;
  } | null = null;

  for (const node of drift3dRenderableNodes) {
    // Node radii intentionally remain the already-validated production radii.
    const radius = base.getDrift3DNodeRadius(node);
    const distance = Math.hypot(
      position.x - node.position.x,
      position.z - node.position.z
    );
    const sample = { node, distance, radius };

    if (!nearest || distance < nearest.distance) {
      nearest = sample;
    }

    if (distance <= radius && (!active || distance < active.distance)) {
      active = sample;
    }
  }

  const selected = active ?? nearest;
  const selectedEra =
    selected && selected.node.role !== "threshold"
      ? drift3dEraById[selected.node.eraId]
      : null;
  const nearestEra =
    nearest && nearest.node.role !== "threshold"
      ? drift3dEraById[nearest.node.eraId]
      : selectedEra;
  const distance = selected?.distance ?? 0;
  const radius = selected?.radius ?? 1;
  const isInside = active !== null;
  const falloff = isInside ? radius : radius * 1.45;

  return {
    nearestNode: nearest?.node ?? null,
    activeNode: active?.node ?? null,
    nearestEra,
    activeEra: selectedEra,
    distance,
    isInside,
    progress: selected ? clamp(1 - distance / falloff, 0, 1) : 0,
  };
}

export function validateDrift3DTopology(): Drift3DTopologyValidationResult {
  const issues: string[] = [];
  const eraIds = new Set<string>();
  const eraTrackSlugs = new Set<string>();
  const nodeIds = new Set<string>();
  const nodeTrackSlugCounts = new Map<string, number>();
  const validTrackSlugs = new Set(tracks.map((track) => track.slug));

  for (const era of drift3dEras) {
    if (eraIds.has(era.id)) {
      issues.push(`duplicate era id: ${era.id}`);
    }
    eraIds.add(era.id);

    if (!Number.isInteger(era.order) || era.order < 1) {
      issues.push(`invalid era order: ${era.id}`);
    }

    for (const slug of era.trackSlugs) {
      if (!validTrackSlugs.has(slug)) {
        issues.push(`unknown era track slug: ${era.id} -> ${slug}`);
      }
      if (eraTrackSlugs.has(slug)) {
        issues.push(`duplicate era track slug: ${slug}`);
      }
      eraTrackSlugs.add(slug);
    }

    if (
      era.center.x < -DRIFT_3D_TOPOLOGY_WORLD_WIDTH / 2 ||
      era.center.x > DRIFT_3D_TOPOLOGY_WORLD_WIDTH / 2 ||
      era.center.z < -DRIFT_3D_TOPOLOGY_WORLD_DEPTH / 2 ||
      era.center.z > DRIFT_3D_TOPOLOGY_WORLD_DEPTH / 2
    ) {
      issues.push(`era center outside topology bounds: ${era.id}`);
    }
  }

  for (const node of drift3dTrackNodes) {
    if (nodeIds.has(node.id)) {
      issues.push(`duplicate node id: ${node.id}`);
    }
    nodeIds.add(node.id);

    if (!eraIds.has(node.eraId)) {
      issues.push(`unknown node era id: ${node.id} -> ${node.eraId}`);
    }

    if (!validTrackSlugs.has(node.trackSlug)) {
      issues.push(`unknown node track slug: ${node.id} -> ${node.trackSlug}`);
    }

    nodeTrackSlugCounts.set(
      node.trackSlug,
      (nodeTrackSlugCounts.get(node.trackSlug) ?? 0) + 1
    );

    if (
      node.position.x < -DRIFT_3D_TOPOLOGY_WORLD_WIDTH / 2 ||
      node.position.x > DRIFT_3D_TOPOLOGY_WORLD_WIDTH / 2 ||
      node.position.z < -DRIFT_3D_TOPOLOGY_WORLD_DEPTH / 2 ||
      node.position.z > DRIFT_3D_TOPOLOGY_WORLD_DEPTH / 2
    ) {
      issues.push(`track node outside topology bounds: ${node.id}`);
    }
  }

  for (const [slug, count] of nodeTrackSlugCounts) {
    if (count > 1) {
      issues.push(`duplicate track node slug: ${slug}`);
    }
  }

  for (const track of tracks) {
    if (!nodeTrackSlugCounts.has(track.slug)) {
      issues.push(`missing track node: ${track.slug}`);
    }
  }

  if (drift3dTrackNodes.length !== tracks.length) {
    issues.push(
      `unexpected track node count: ${drift3dTrackNodes.length} (expected ${tracks.length})`
    );
  }

  if (!drift3dThresholdNode.driftZoneId) {
    issues.push("missing threshold zone link: entry-node");
  } else if (
    !driftZones.some((zone) => zone.id === drift3dThresholdNode.driftZoneId)
  ) {
    issues.push(
      `unknown threshold drift zone: ${drift3dThresholdNode.driftZoneId}`
    );
  }

  if (
    drift3dThresholdNode.position.x < -DRIFT_3D_TOPOLOGY_WORLD_WIDTH / 2 ||
    drift3dThresholdNode.position.x > DRIFT_3D_TOPOLOGY_WORLD_WIDTH / 2 ||
    drift3dThresholdNode.position.z < -DRIFT_3D_TOPOLOGY_WORLD_DEPTH / 2 ||
    drift3dThresholdNode.position.z > DRIFT_3D_TOPOLOGY_WORLD_DEPTH / 2
  ) {
    issues.push("entry threshold outside topology bounds");
  }

  return { ok: issues.length === 0, issues };
}
