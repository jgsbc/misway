import { driftZones } from "@/lib/driftMap";
import { tracks, type Track } from "@/lib/tracks";

export type Drift3DEraId =
  | "birth-yard"
  | "older-shadows"
  | "vegetative-field"
  | "new-signal";

export type Drift3DNodeRole = "anchor" | "track" | "portal" | "threshold";

export type Drift3DWorldPoint = {
  x: number;
  y: number;
  z: number;
};

export type Drift3DEraTopology = {
  id: Drift3DEraId;
  label: string;
  order: number;
  role: "macro-region";
  center: Drift3DWorldPoint;
  radius: number;
  trackSlugs: readonly Track["slug"][];
  topologyHints: readonly string[];
};

export type Drift3DTrackNode = {
  id: string;
  trackSlug: Track["slug"];
  eraId: Drift3DEraId;
  role: Exclude<Drift3DNodeRole, "threshold">;
  position: Drift3DWorldPoint;
  driftZoneId?: string;
};

export type Drift3DRenderableNode = Drift3DTrackNode | Drift3DThresholdNode;

export type Drift3DThresholdNode = {
  id: "entry-node";
  role: "threshold";
  position: Drift3DWorldPoint;
  driftZoneId: "entry-node";
  label: string;
};

export type Drift3DTopologyValidationResult = {
  ok: boolean;
  issues: string[];
};

export type Drift3DTopologyProximity = {
  nearestNode: Drift3DRenderableNode | null;
  activeNode: Drift3DRenderableNode | null;
  nearestEra: Drift3DEraTopology | null;
  activeEra: Drift3DEraTopology | null;
  distance: number;
  isInside: boolean;
  progress: number;
};

export type Drift3DNodeToneState = "neutral" | "nearest" | "active";

export const DRIFT_3D_TOPOLOGY_WORLD_WIDTH = 224;
export const DRIFT_3D_TOPOLOGY_WORLD_DEPTH = 144;

function point(x: number, y: number, z: number): Drift3DWorldPoint {
  return { x, y, z };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

const drift3dTrackSlugSet = new Set(tracks.map((track) => track.slug));

export const drift3dEras = [
  {
    id: "birth-yard",
    label: "Birth Yard",
    order: 1,
    role: "macro-region",
    center: point(-74, 0, 22),
    radius: 36,
    trackSlugs: [
      "a-walk-in-zeeland",
      "jazzypling",
      "play-it",
      "funky-hoo",
      "peut-etre",
      "sugared-peach",
      "foolfoule",
    ],
    topologyHints: [
      "dense urban compression",
      "left-origin alleys",
      "short local hops through crowd pressure",
    ],
  },
  {
    id: "older-shadows",
    label: "Older Shadows",
    order: 2,
    role: "macro-region",
    center: point(-32, 0, -52),
    radius: 40,
    trackSlugs: [
      "rise",
      "blossoming",
      "ethnic-stick",
      "minuit-moins-cinq",
      "perdue",
    ],
    topologyHints: [
      "open travel ridge",
      "altitude and risk",
      "scenic gaps with room to breathe",
    ],
  },
  {
    id: "vegetative-field",
    label: "Vegetative Field",
    order: 3,
    role: "macro-region",
    center: point(0, 0, 8),
    radius: 42,
    trackSlugs: [
      "morne-et",
      "daymason",
      "chailk",
      "time",
      "tantitom",
      "white-clouds",
    ],
    topologyHints: [
      "flat horizontal spread",
      "low repeated modules",
      "long calm distances",
    ],
  },
  {
    id: "new-signal",
    label: "New Signal",
    order: 4,
    role: "macro-region",
    center: point(66, 0, -12),
    radius: 56,
    trackSlugs: [
      "neektareum",
      "asitis",
      "relative",
      "overthink",
      "hold-the-light",
      "midnight-work",
      "telatelaba",
      "le-monde-s-endort",
      "renee",
      "panthere",
      "eux-gainent",
      "assokam",
      "wo-ha",
      "amidir",
    ],
    topologyHints: [
      "archipelago spacing",
      "night contrast and voids",
      "sub-clusters with corridor breaks",
    ],
  },
] as const satisfies readonly Drift3DEraTopology[];

export const drift3dThresholdNode = {
  id: "entry-node",
  role: "threshold",
  position: point(-88, 0, 12),
  driftZoneId: "entry-node",
  label: "Entry Node",
} as const satisfies Drift3DThresholdNode;

export function getDrift3DNodeRadius(node: Drift3DRenderableNode) {
  if (node.role === "threshold") {
    return 6;
  }

  const era = drift3dEraById[node.eraId];
  const eraBaseRadius = era.radius / 6.2;
  const roleMultiplier = node.role === "anchor" ? 1.18 : 1;
  const roleMin = node.role === "anchor" ? 4.9 : 3.8;
  const roleMax = node.role === "anchor" ? 6.2 : 5;

  return clamp(eraBaseRadius * roleMultiplier, roleMin, roleMax);
}

export function getDrift3DNodeToneState(
  node: Drift3DRenderableNode,
  proximity: Drift3DTopologyProximity | null
): Drift3DNodeToneState {
  if (proximity?.activeNode?.id === node.id) {
    return "active";
  }

  if (proximity?.nearestNode?.id === node.id) {
    return "nearest";
  }

  return "neutral";
}

export function getDrift3DEraToneState(
  era: Drift3DEraTopology,
  proximity: Drift3DTopologyProximity | null
): Drift3DNodeToneState {
  if (proximity?.activeEra?.id === era.id) {
    return "active";
  }

  if (proximity?.nearestEra?.id === era.id) {
    return "nearest";
  }

  return "neutral";
}

export const drift3dTrackNodes = [
  {
    id: "birth-yard-a-walk-in-zeeland",
    trackSlug: "a-walk-in-zeeland",
    eraId: "birth-yard",
    role: "anchor",
    position: point(-88, 0.12, 20),
    driftZoneId: "zeeland-road",
  },
  {
    id: "birth-yard-foolfoule",
    trackSlug: "foolfoule",
    eraId: "birth-yard",
    role: "anchor",
    position: point(-62, 0.14, 42),
    driftZoneId: "birth-yard",
  },
  {
    id: "birth-yard-jazzypling",
    trackSlug: "jazzypling",
    eraId: "birth-yard",
    role: "track",
    position: point(-68, 0.13, 14),
  },
  {
    id: "birth-yard-play-it",
    trackSlug: "play-it",
    eraId: "birth-yard",
    role: "track",
    position: point(-54, 0.11, 26),
  },
  {
    id: "birth-yard-funky-hoo",
    trackSlug: "funky-hoo",
    eraId: "birth-yard",
    role: "track",
    position: point(-96, 0.12, 40),
  },
  {
    id: "birth-yard-peut-etre",
    trackSlug: "peut-etre",
    eraId: "birth-yard",
    role: "track",
    position: point(-96, 0.12, 0),
  },
  {
    id: "birth-yard-sugared-peach",
    trackSlug: "sugared-peach",
    eraId: "birth-yard",
    role: "track",
    position: point(-48, 0.12, 46),
  },
  {
    id: "older-shadows-rise",
    trackSlug: "rise",
    eraId: "older-shadows",
    role: "track",
    position: point(-56, 0.18, -68),
  },
  {
    id: "older-shadows-blossoming",
    trackSlug: "blossoming",
    eraId: "older-shadows",
    role: "track",
    position: point(-38, 0.16, -56),
  },
  {
    id: "older-shadows-ethnic-stick",
    trackSlug: "ethnic-stick",
    eraId: "older-shadows",
    role: "track",
    position: point(-18, 0.14, -72),
  },
  {
    id: "older-shadows-minuit-moins-cinq",
    trackSlug: "minuit-moins-cinq",
    eraId: "older-shadows",
    role: "track",
    position: point(-46, 0.15, -36),
  },
  {
    id: "older-shadows-perdue",
    trackSlug: "perdue",
    eraId: "older-shadows",
    role: "track",
    position: point(-2, 0.13, -28),
  },
  {
    id: "vegetative-field-morne-et",
    trackSlug: "morne-et",
    eraId: "vegetative-field",
    role: "track",
    position: point(-38, 0.1, 4),
  },
  {
    id: "vegetative-field-daymason",
    trackSlug: "daymason",
    eraId: "vegetative-field",
    role: "track",
    position: point(-14, 0.08, -2),
  },
  {
    id: "vegetative-field-chailk",
    trackSlug: "chailk",
    eraId: "vegetative-field",
    role: "track",
    position: point(12, 0.1, 8),
  },
  {
    id: "vegetative-field-time",
    trackSlug: "time",
    eraId: "vegetative-field",
    role: "track",
    position: point(2, 0.12, 24),
  },
  {
    id: "vegetative-field-tantitom",
    trackSlug: "tantitom",
    eraId: "vegetative-field",
    role: "track",
    position: point(36, 0.1, 14),
  },
  {
    id: "vegetative-field-white-clouds",
    trackSlug: "white-clouds",
    eraId: "vegetative-field",
    role: "track",
    position: point(-22, 0.1, 30),
  },
  {
    id: "new-signal-neektareum",
    trackSlug: "neektareum",
    eraId: "new-signal",
    role: "track",
    position: point(24, 0.16, -18),
  },
  {
    id: "new-signal-asitis",
    trackSlug: "asitis",
    eraId: "new-signal",
    role: "anchor",
    position: point(46, 0.12, 12),
    driftZoneId: "plain-signal",
  },
  {
    id: "new-signal-relative",
    trackSlug: "relative",
    eraId: "new-signal",
    role: "track",
    position: point(60, 0.14, -4),
  },
  {
    id: "new-signal-overthink",
    trackSlug: "overthink",
    eraId: "new-signal",
    role: "anchor",
    position: point(78, 0.14, 18),
    driftZoneId: "neural-loop",
  },
  {
    id: "new-signal-hold-the-light",
    trackSlug: "hold-the-light",
    eraId: "new-signal",
    role: "anchor",
    position: point(52, 0.16, -28),
    driftZoneId: "hold-lamp",
  },
  {
    id: "new-signal-midnight-work",
    trackSlug: "midnight-work",
    eraId: "new-signal",
    role: "anchor",
    position: point(84, 0.18, -42),
    driftZoneId: "midnight-office",
  },
  {
    id: "new-signal-telatelaba",
    trackSlug: "telatelaba",
    eraId: "new-signal",
    role: "anchor",
    position: point(90, 0.14, -2),
    driftZoneId: "here-there-islands",
  },
  {
    id: "new-signal-le-monde-s-endort",
    trackSlug: "le-monde-s-endort",
    eraId: "new-signal",
    role: "track",
    position: point(70, 0.12, -56),
  },
  {
    id: "new-signal-renee",
    trackSlug: "renee",
    eraId: "new-signal",
    role: "track",
    position: point(48, 0.12, -48),
  },
  {
    id: "new-signal-panthere",
    trackSlug: "panthere",
    eraId: "new-signal",
    role: "track",
    position: point(90, 0.14, 28),
  },
  {
    // Keep the stable internal id: eraId is the canonical era authority.
    id: "birth-yard-eux-gainent",
    trackSlug: "eux-gainent",
    eraId: "new-signal",
    role: "track",
    position: point(58, 0.13, 38),
  },
  {
    id: "new-signal-assokam",
    trackSlug: "assokam",
    eraId: "new-signal",
    role: "track",
    position: point(102, 0.13, -24),
  },
  {
    id: "new-signal-wo-ha",
    trackSlug: "wo-ha",
    eraId: "new-signal",
    role: "track",
    position: point(22, 0.13, -44),
  },
  {
    id: "new-signal-amidir",
    trackSlug: "amidir",
    eraId: "new-signal",
    role: "track",
    position: point(56, 0.12, -66),
  },
] as const satisfies readonly Drift3DTrackNode[];

export const drift3dRenderableNodes = [
  drift3dThresholdNode,
  ...drift3dTrackNodes,
] as const satisfies readonly Drift3DRenderableNode[];

export const drift3dEraById = drift3dEras.reduce(
  (acc, era) => {
    acc[era.id] = era;
    return acc;
  },
  {} as Record<Drift3DEraId, Drift3DEraTopology>
);

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
  point: Drift3DWorldPoint
): Drift3DTopologyProximity {
  let nearest: { node: Drift3DRenderableNode; distance: number; radius: number } | null =
    null;
  let active: { node: Drift3DRenderableNode; distance: number; radius: number } | null =
    null;

  for (const node of drift3dRenderableNodes) {
    const radius = getDrift3DNodeRadius(node);
    const distance = Math.hypot(point.x - node.position.x, point.z - node.position.z);
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
  const trackSlugs = new Set<string>();
  const nodeIds = new Set<string>();
  const nodeTrackSlugCounts = new Map<string, number>();

  for (const era of drift3dEras) {
    if (eraIds.has(era.id)) {
      issues.push(`duplicate era id: ${era.id}`);
    }
    eraIds.add(era.id);

    if (!Number.isInteger(era.order) || era.order < 1) {
      issues.push(`invalid era order: ${era.id}`);
    }

    for (const slug of era.trackSlugs) {
      if (!drift3dTrackSlugSet.has(slug)) {
        issues.push(`unknown era track slug: ${era.id} -> ${slug}`);
      }
      if (trackSlugs.has(slug)) {
        issues.push(`duplicate era track slug: ${slug}`);
      }
      trackSlugs.add(slug);
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

    if (!drift3dTrackSlugSet.has(node.trackSlug)) {
      issues.push(`unknown node track slug: ${node.id} -> ${node.trackSlug}`);
    }

    nodeTrackSlugCounts.set(
      node.trackSlug,
      (nodeTrackSlugCounts.get(node.trackSlug) ?? 0) + 1
    );
  }

  for (const [slug, count] of nodeTrackSlugCounts) {
    if (count > 1) {
      issues.push(`duplicate track node slug: ${slug}`);
    }
  }

  const nodeSlugSet = new Set<Track["slug"]>(
    drift3dTrackNodes.map((node) => node.trackSlug)
  );
  for (const track of tracks) {
    if (!nodeSlugSet.has(track.slug)) {
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
  } else if (!driftZones.some((zone) => zone.id === drift3dThresholdNode.driftZoneId)) {
    issues.push(
      `unknown threshold drift zone: ${drift3dThresholdNode.driftZoneId}`
    );
  }

  if (
    drift3dThresholdNode.position.x <
      -DRIFT_3D_TOPOLOGY_WORLD_WIDTH / 2 ||
    drift3dThresholdNode.position.x > DRIFT_3D_TOPOLOGY_WORLD_WIDTH / 2 ||
    drift3dThresholdNode.position.z <
      -DRIFT_3D_TOPOLOGY_WORLD_DEPTH / 2 ||
    drift3dThresholdNode.position.z > DRIFT_3D_TOPOLOGY_WORLD_DEPTH / 2
  ) {
    issues.push("entry threshold outside topology bounds");
  }

  if (
    !drift3dTrackNodes.every(
      (node) =>
        node.position.x >= -DRIFT_3D_TOPOLOGY_WORLD_WIDTH / 2 &&
        node.position.x <= DRIFT_3D_TOPOLOGY_WORLD_WIDTH / 2
    )
  ) {
    issues.push(
      `one or more track nodes fall outside the ${DRIFT_3D_TOPOLOGY_WORLD_WIDTH}-unit width`
    );
  }

  if (
    !drift3dTrackNodes.every(
      (node) =>
        node.position.z >= -DRIFT_3D_TOPOLOGY_WORLD_DEPTH / 2 &&
        node.position.z <= DRIFT_3D_TOPOLOGY_WORLD_DEPTH / 2
    )
  ) {
    issues.push(
      `one or more track nodes fall outside the ${DRIFT_3D_TOPOLOGY_WORLD_DEPTH}-unit depth`
    );
  }

  return {
    ok: issues.length === 0,
    issues,
  };
}