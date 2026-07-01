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

function point(x: number, y: number, z: number): Drift3DWorldPoint {
  return { x, y, z };
}

const drift3dTrackSlugSet = new Set(tracks.map((track) => track.slug));

export const drift3dEras = [
  {
    id: "birth-yard",
    label: "Birth Yard",
    order: 1,
    role: "macro-region",
    center: point(-60, 0, 20),
    radius: 28,
    trackSlugs: ["a-walk-in-zeeland", "foolfoule", "jazzypling", "play-it"],
    topologyHints: [
      "dense early cluster",
      "left-origin bias",
      "short local hops",
    ],
  },
  {
    id: "older-shadows",
    label: "Older Shadows",
    order: 2,
    role: "macro-region",
    center: point(-18, 0, -26),
    radius: 32,
    trackSlugs: [
      "rise",
      "blossoming",
      "ethnic-stick",
      "minuit-moins-cinq",
      "perdue",
    ],
    topologyHints: [
      "open travel ridge",
      "more negative-z depth",
      "slower symbolic ascent",
    ],
  },
  {
    id: "vegetative-field",
    label: "Vegetative Field",
    order: 3,
    role: "macro-region",
    center: point(0, 0, 12),
    radius: 30,
    trackSlugs: ["morne-et", "daymason", "chailk", "time", "tantitom"],
    topologyHints: [
      "flatter horizontal spread",
      "central routine field",
      "low vertical clutter",
    ],
  },
  {
    id: "new-signal",
    label: "New Signal",
    order: 4,
    role: "macro-region",
    center: point(58, 0, -6),
    radius: 40,
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
      "Panthere",
    ],
    topologyHints: [
      "larger mixed region",
      "archipelago spacing",
      "later-world contrast",
    ],
  },
] as const satisfies readonly Drift3DEraTopology[];

export const drift3dThresholdNode = {
  id: "entry-node",
  role: "threshold",
  position: point(-76, 0, 10),
  driftZoneId: "entry-node",
  label: "Entry Node",
} as const satisfies Drift3DThresholdNode;

export const drift3dTrackNodes = [
  {
    id: "birth-yard-a-walk-in-zeeland",
    trackSlug: "a-walk-in-zeeland",
    eraId: "birth-yard",
    role: "anchor",
    position: point(-72, 0.12, 10),
    driftZoneId: "zeeland-road",
  },
  {
    id: "birth-yard-foolfoule",
    trackSlug: "foolfoule",
    eraId: "birth-yard",
    role: "anchor",
    position: point(-82, 0.14, 22),
    driftZoneId: "birth-yard",
  },
  {
    id: "birth-yard-jazzypling",
    trackSlug: "jazzypling",
    eraId: "birth-yard",
    role: "track",
    position: point(-68, 0.13, 32),
  },
  {
    id: "birth-yard-play-it",
    trackSlug: "play-it",
    eraId: "birth-yard",
    role: "track",
    position: point(-48, 0.11, 28),
  },
  {
    id: "older-shadows-rise",
    trackSlug: "rise",
    eraId: "older-shadows",
    role: "track",
    position: point(-34, 0.18, -42),
  },
  {
    id: "older-shadows-blossoming",
    trackSlug: "blossoming",
    eraId: "older-shadows",
    role: "track",
    position: point(-12, 0.16, -46),
  },
  {
    id: "older-shadows-ethnic-stick",
    trackSlug: "ethnic-stick",
    eraId: "older-shadows",
    role: "track",
    position: point(10, 0.14, -38),
  },
  {
    id: "older-shadows-minuit-moins-cinq",
    trackSlug: "minuit-moins-cinq",
    eraId: "older-shadows",
    role: "track",
    position: point(-28, 0.15, -24),
  },
  {
    id: "older-shadows-perdue",
    trackSlug: "perdue",
    eraId: "older-shadows",
    role: "track",
    position: point(2, 0.13, -18),
  },
  {
    id: "vegetative-field-morne-et",
    trackSlug: "morne-et",
    eraId: "vegetative-field",
    role: "track",
    position: point(-28, 0.1, 4),
  },
  {
    id: "vegetative-field-daymason",
    trackSlug: "daymason",
    eraId: "vegetative-field",
    role: "track",
    position: point(-10, 0.08, -2),
  },
  {
    id: "vegetative-field-chailk",
    trackSlug: "chailk",
    eraId: "vegetative-field",
    role: "track",
    position: point(12, 0.1, 6),
  },
  {
    id: "vegetative-field-time",
    trackSlug: "time",
    eraId: "vegetative-field",
    role: "track",
    position: point(0, 0.12, 20),
  },
  {
    id: "vegetative-field-tantitom",
    trackSlug: "tantitom",
    eraId: "vegetative-field",
    role: "track",
    position: point(24, 0.1, 14),
  },
  {
    id: "new-signal-neektareum",
    trackSlug: "neektareum",
    eraId: "new-signal",
    role: "track",
    position: point(34, 0.16, -18),
  },
  {
    id: "new-signal-asitis",
    trackSlug: "asitis",
    eraId: "new-signal",
    role: "anchor",
    position: point(42, 0.12, 10),
    driftZoneId: "plain-signal",
  },
  {
    id: "new-signal-relative",
    trackSlug: "relative",
    eraId: "new-signal",
    role: "track",
    position: point(56, 0.14, -4),
  },
  {
    id: "new-signal-overthink",
    trackSlug: "overthink",
    eraId: "new-signal",
    role: "anchor",
    position: point(68, 0.14, 16),
    driftZoneId: "neural-loop",
  },
  {
    id: "new-signal-hold-the-light",
    trackSlug: "hold-the-light",
    eraId: "new-signal",
    role: "anchor",
    position: point(46, 0.16, -24),
    driftZoneId: "hold-lamp",
  },
  {
    id: "new-signal-midnight-work",
    trackSlug: "midnight-work",
    eraId: "new-signal",
    role: "anchor",
    position: point(74, 0.18, -28),
    driftZoneId: "midnight-office",
  },
  {
    id: "new-signal-telatelaba",
    trackSlug: "telatelaba",
    eraId: "new-signal",
    role: "anchor",
    position: point(78, 0.14, -2),
    driftZoneId: "here-there-islands",
  },
  {
    id: "new-signal-le-monde-s-endort",
    trackSlug: "le-monde-s-endort",
    eraId: "new-signal",
    role: "track",
    position: point(62, 0.12, -38),
  },
  {
    id: "new-signal-renee",
    trackSlug: "renee",
    eraId: "new-signal",
    role: "track",
    position: point(50, 0.12, -46),
  },
  {
    id: "new-signal-Panthere",
    trackSlug: "Panthere",
    eraId: "new-signal",
    role: "track",
    position: point(72, 0.14, 20),
  },
] as const satisfies readonly Drift3DTrackNode[];

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

  if (!drift3dTrackNodes.every((node) => node.position.x >= -80 && node.position.x <= 80)) {
    issues.push("one or more track nodes fall outside the 160-unit width");
  }

  if (!drift3dTrackNodes.every((node) => node.position.z >= -50 && node.position.z <= 50)) {
    issues.push("one or more track nodes fall outside the 100-unit depth");
  }

  return {
    ok: issues.length === 0,
    issues,
  };
}
