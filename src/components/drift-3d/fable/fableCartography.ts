import {
  FABLE_BOUNDS,
  FABLE_SPAWN,
  fableGroundY,
} from "@/components/drift-3d/fable/fableWorld";
import {
  FABLE_REGIONS,
  FABLE_SEA_LEVEL,
  fableRegionAt,
  type FableRegion,
} from "@/components/drift-3d/fable/fablePeninsula";
import { FABLE_ROUTES, type FableRoute } from "@/components/drift-3d/fable/fableRoutes";
import {
  FABLE_LANDMARKS,
  FABLE_SIGHTLINES,
} from "@/components/drift-3d/fable/fableLandmarkData";
import { FABLE_TRACKS, type FableEraId } from "@/components/drift-3d/fable/fableTopology";

/**
 * FABLE — état cartographique généré.
 *
 * Une seule source de vérité spatiale : tout ce qui suit est échantillonné
 * depuis les modules que le monde utilise réellement — mêmes routes, même
 * fonction de sol, mêmes régions. Rien n'est redessiné à la main.
 *
 * Ce module ne rend rien. Il produit un instantané sérialisable que la
 * salle des cartes et le script d'export lisent tous les deux.
 */

export type CartographySnapshot = {
  generatedAt: string;
  sourceRevision: string | null;
  sourceModules: string[];
  bounds: typeof FABLE_BOUNDS;
  seaLevel: number;
  coastline: Array<[number, number, number, number]>;
  regions: CartoRegion[];
  routes: CartoRoute[];
  intersections: CartoIntersection[];
  tracks: CartoTrack[];
  landmarks: CartoLandmark[];
  sightlines: CartoSightline[];
  streaming: CartoStreamingRule[];
  recoveryPoints: Array<{ id: string; x: number; z: number; y: number }>;
  pacing: CartoPacing[];
  warnings: CartoWarning[];
};

export type CartoRegion = {
  id: string;
  era: FableEraId;
  x: number;
  z: number;
  radius: number;
  baseY: number;
  relief: FableRegion["relief"];
};

export type CartoRouteSample = {
  /** Distance cumulée depuis le début de la route. */
  s: number;
  x: number;
  z: number;
  /** Altitude déclarée de la chaussée. */
  roadY: number;
  /** Altitude réellement produite par le terrain à cet endroit. */
  terrainY: number;
  /** Pente en pourcentage, positive en montée. */
  grade: number;
};

export type CartoRoute = {
  id: string;
  kind: FableRoute["kind"];
  halfWidth: number;
  length: number;
  samples: CartoRouteSample[];
  maxUphill: number;
  maxDownhill: number;
  minY: number;
  maxY: number;
};

export type CartoIntersection = {
  a: string;
  b: string;
  x: number;
  z: number;
  /** Écart vertical entre les deux chaussées au croisement. */
  deltaY: number;
  kind: "junction" | "overpass" | "near-miss" | "collision";
};

export type CartoTrackForm = "place" | "detour" | "event" | "state" | "unresolved";

export type CartoTrack = {
  slug: string;
  label: string;
  era: FableEraId;
  x: number;
  z: number;
  radius: number;
  form: CartoTrackForm;
  region: string;
  /** Route la plus proche — l'accès physique, s'il existe. */
  accessRoute: string | null;
  accessDistance: number;
  provisional: boolean;
};

export type CartoLandmark = {
  id: string;
  label: string;
  x: number;
  z: number;
  groundY: number;
  height: number;
  hideWithin: number;
};

export type CartoSightline = {
  id: string;
  observerLabel: string;
  observer: { x: number; z: number; y: number };
  landmarkId: string;
  distance: number;
  elevationDelta: number;
  blocked: boolean;
  /** Fraction du trajet où le terrain coupe la ligne. */
  blockedAt: number | null;
  intendedVisible: boolean;
  status: "ok" | "blocked" | "hidden-by-streaming";
};

export type CartoStreamingRule = {
  id: string;
  regionIds: string[];
  mountRadius: number;
};

export type CartoPacing = {
  routeId: string;
  length: number;
  /** Secondes à l'allure de croisière retenue. */
  seconds: number;
  gain: number;
  loss: number;
  maxGrade: number;
  mandatory: boolean;
  hasReturn: boolean;
  /** Plus longue portion sans changement notable de pente ni de cap. */
  longestFlatStretch: number;
};

export type CartoWarning = {
  code: string;
  severity: "info" | "warn" | "error";
  message: string;
  x?: number;
  z?: number;
  routeId?: string;
};

/** Allure de référence pour les estimations de durée, en m/s. */
export const CARTO_CRUISE_SPEED = 5.2;

const SOURCE_MODULES = [
  "fableWorld.ts",
  "fablePeninsula.ts",
  "fableRoutes.ts",
  "fableBranches.ts",
  "fableTopology.ts",
  "fableLandmarkData.ts",
];

/**
 * Forme actuelle de chaque track. Volontairement honnête : « unresolved »
 * partout où le monde n'a encore rien qui la porte. C'est précisément ce
 * que la revue doit voir.
 */
const TRACK_FORMS: Record<string, CartoTrackForm> = {
  entry: "place",
  "a-walk-in-zeeland": "place",
  "eux-gainent": "place",
  foolfoule: "place",
  rise: "detour",
};

/* ── Échantillonnage ──────────────────────────────────────────────────── */

function sampleRoute(route: FableRoute, step = 4): CartoRoute {
  const samples: CartoRouteSample[] = [];
  let s = 0;
  let maxUphill = 0;
  let maxDownhill = 0;
  let minY = Infinity;
  let maxY = -Infinity;

  for (let i = 0; i < route.points.length - 1; i += 1) {
    const [ax, ay, az] = route.points[i];
    const [bx, by, bz] = route.points[i + 1];
    const segLength = Math.hypot(bx - ax, bz - az);
    const steps = Math.max(1, Math.round(segLength / step));

    for (let k = 0; k < steps; k += 1) {
      const t = k / steps;
      const x = ax + (bx - ax) * t;
      const z = az + (bz - az) * t;
      const roadY = ay + (by - ay) * t;
      const grade = segLength > 0 ? ((by - ay) / segLength) * 100 : 0;
      samples.push({
        s: s + segLength * t,
        x,
        z,
        roadY,
        terrainY: fableGroundY(x, z),
        grade,
      });
      maxUphill = Math.max(maxUphill, grade);
      maxDownhill = Math.min(maxDownhill, grade);
      minY = Math.min(minY, roadY);
      maxY = Math.max(maxY, roadY);
    }

    s += segLength;
  }

  const last = route.points[route.points.length - 1];
  samples.push({
    s,
    x: last[0],
    z: last[2],
    roadY: last[1],
    terrainY: fableGroundY(last[0], last[2]),
    grade: 0,
  });

  return {
    id: route.id,
    kind: route.kind,
    halfWidth: route.halfWidth,
    length: s,
    samples,
    maxUphill,
    maxDownhill,
    minY,
    maxY,
  };
}

/**
 * Trait de côte par marching squares sur le niveau de la mer. Le contour
 * sort du même champ de hauteur que la conduite : si le rivage est faux sur
 * la carte, il est faux dans le monde.
 */
function buildCoastline(step = 9): Array<[number, number, number, number]> {
  const segments: Array<[number, number, number, number]> = [];
  const { minX, maxX, minZ, maxZ } = FABLE_BOUNDS;

  for (let x = minX; x < maxX; x += step) {
    for (let z = minZ; z < maxZ; z += step) {
      const h = [
        fableGroundY(x, z) - FABLE_SEA_LEVEL,
        fableGroundY(x + step, z) - FABLE_SEA_LEVEL,
        fableGroundY(x + step, z + step) - FABLE_SEA_LEVEL,
        fableGroundY(x, z + step) - FABLE_SEA_LEVEL,
      ];
      const corners: Array<[number, number]> = [
        [x, z],
        [x + step, z],
        [x + step, z + step],
        [x, z + step],
      ];
      const crossings: Array<[number, number]> = [];

      for (let e = 0; e < 4; e += 1) {
        const a = h[e];
        const b = h[(e + 1) % 4];

        if (a === b || a * b > 0) continue;

        const t = a / (a - b);
        const [ax, az] = corners[e];
        const [bx, bz] = corners[(e + 1) % 4];
        crossings.push([ax + (bx - ax) * t, az + (bz - az) * t]);
      }

      if (crossings.length >= 2) {
        segments.push([
          crossings[0][0],
          crossings[0][1],
          crossings[1][0],
          crossings[1][1],
        ]);
      }
    }
  }

  return segments;
}

/** Croisements réels entre routes, avec leur écart vertical. */
function findIntersections(routes: CartoRoute[]): CartoIntersection[] {
  const found: CartoIntersection[] = [];

  for (let i = 0; i < routes.length; i += 1) {
    for (let j = i + 1; j < routes.length; j += 1) {
      const a = routes[i];
      const b = routes[j];
      let best: CartoIntersection | null = null;

      for (const sa of a.samples) {
        for (const sb of b.samples) {
          const d = Math.hypot(sa.x - sb.x, sa.z - sb.z);

          if (d > a.halfWidth + b.halfWidth + 2) continue;

          const deltaY = Math.abs(sa.roadY - sb.roadY);

          if (!best || deltaY < best.deltaY) {
            best = {
              a: a.id,
              b: b.id,
              x: (sa.x + sb.x) / 2,
              z: (sa.z + sb.z) / 2,
              deltaY,
              kind:
                deltaY < 1.5
                  ? "junction"
                  : deltaY < 6
                    ? "collision"
                    : "overpass",
            };
          }
        }
      }

      if (best) found.push(best);
    }
  }

  return found;
}

/** Test de visibilité : on marche le long du rayon et on regarde le sol. */
function testSightline(
  observer: { x: number; z: number },
  target: CartoLandmark
): { blocked: boolean; blockedAt: number | null; distance: number } {
  const eyeY = fableGroundY(observer.x, observer.z) + 2;
  const targetY = target.groundY + target.height;
  const distance = Math.hypot(target.x - observer.x, target.z - observer.z);
  const steps = Math.max(24, Math.round(distance / 6));

  for (let i = 1; i < steps; i += 1) {
    const t = i / steps;
    const x = observer.x + (target.x - observer.x) * t;
    const z = observer.z + (target.z - observer.z) * t;
    const rayY = eyeY + (targetY - eyeY) * t;

    if (fableGroundY(x, z) > rayY + 1) {
      return { blocked: true, blockedAt: t, distance };
    }
  }

  return { blocked: false, blockedAt: null, distance };
}

/* ── Instantané ───────────────────────────────────────────────────────── */

export function buildCartographySnapshot(
  sourceRevision: string | null = null
): CartographySnapshot {
  const routes = FABLE_ROUTES.map((route) => sampleRoute(route));
  const coastline = buildCoastline();
  const intersections = findIntersections(routes);

  const landmarks: CartoLandmark[] = FABLE_LANDMARKS.map((l) => ({
    id: l.id,
    label: l.label,
    x: l.x,
    z: l.z,
    groundY: fableGroundY(l.x, l.z),
    height: l.height,
    hideWithin: l.hideWithin,
  }));

  const landmarkById = new Map(landmarks.map((l) => [l.id, l]));

  const sightlines: CartoSightline[] = FABLE_SIGHTLINES.map((intent) => {
    const target = landmarkById.get(intent.landmarkId)!;
    const { blocked, blockedAt, distance } = testSightline(intent.observer, target);
    const observerY = fableGroundY(intent.observer.x, intent.observer.z);

    return {
      id: intent.id,
      observerLabel: intent.observerLabel,
      observer: { ...intent.observer, y: observerY },
      landmarkId: intent.landmarkId,
      distance,
      elevationDelta: target.groundY + target.height - observerY,
      blocked,
      blockedAt,
      intendedVisible: intent.intendedVisible,
      status: blocked
        ? "blocked"
        : distance < target.hideWithin
          ? "hidden-by-streaming"
          : "ok",
    };
  });

  const tracks: CartoTrack[] = FABLE_TRACKS.map((track) => {
    let accessRoute: string | null = null;
    let accessDistance = Infinity;

    for (const route of routes) {
      for (const sample of route.samples) {
        const d = Math.hypot(sample.x - track.x, sample.z - track.z);

        if (d < accessDistance) {
          accessDistance = d;
          accessRoute = route.id;
        }
      }
    }

    return {
      slug: track.slug,
      label: track.label,
      era: track.era,
      x: track.x,
      z: track.z,
      radius: track.radius,
      form: TRACK_FORMS[track.slug] ?? "unresolved",
      region: fableRegionAt(track.x, track.z).id,
      accessRoute,
      accessDistance,
      provisional: !TRACK_FORMS[track.slug],
    };
  });

  const pacing: CartoPacing[] = routes.map((route) => {
    let gain = 0;
    let loss = 0;
    let longestFlat = 0;
    let flatRun = 0;

    for (let i = 1; i < route.samples.length; i += 1) {
      const dy = route.samples[i].roadY - route.samples[i - 1].roadY;
      const ds = route.samples[i].s - route.samples[i - 1].s;

      if (dy > 0) gain += dy;
      else loss -= dy;

      if (Math.abs(route.samples[i].grade) < 1.5) {
        flatRun += ds;
        longestFlat = Math.max(longestFlat, flatRun);
      } else {
        flatRun = 0;
      }
    }

    return {
      routeId: route.id,
      length: route.length,
      seconds: route.length / CARTO_CRUISE_SPEED,
      gain,
      loss,
      maxGrade: Math.max(route.maxUphill, -route.maxDownhill),
      mandatory: route.kind === "spine",
      // Une boucle revient par construction ; une branche en cul-de-sac se
      // reparcourt en sens inverse.
      hasReturn: true,
      longestFlatStretch: longestFlat,
    };
  });

  const snapshot: CartographySnapshot = {
    generatedAt: new Date().toISOString(),
    sourceRevision,
    sourceModules: SOURCE_MODULES,
    bounds: FABLE_BOUNDS,
    seaLevel: FABLE_SEA_LEVEL,
    coastline,
    regions: FABLE_REGIONS.map((r) => ({
      id: r.id,
      era: r.era,
      x: r.x,
      z: r.z,
      radius: r.radius,
      baseY: r.baseY,
      relief: r.relief,
    })),
    routes,
    intersections,
    tracks,
    landmarks,
    sightlines,
    streaming: [
      { id: "mountain", regionIds: ["os-approach", "os-massif"], mountRadius: 220 },
      { id: "suburb", regionIds: ["vf-basin"], mountRadius: 240 },
      { id: "coast", regionIds: ["ns-coast", "ns-west", "central-bay"], mountRadius: 260 },
    ],
    recoveryPoints: [
      {
        id: "spawn",
        x: FABLE_SPAWN.x,
        z: FABLE_SPAWN.z,
        y: fableGroundY(FABLE_SPAWN.x, FABLE_SPAWN.z),
      },
    ],
    pacing,
    warnings: [],
  };

  snapshot.warnings = detectWarnings(snapshot);

  return snapshot;
}

/* ── Avertissements ───────────────────────────────────────────────────── */

function detectWarnings(snapshot: CartographySnapshot): CartoWarning[] {
  const warnings: CartoWarning[] = [];

  for (const route of snapshot.routes) {
    for (let i = 0; i < route.samples.length; i += 1) {
      const sample = route.samples[i];

      // Chaussée sous le niveau de la mer sans franchissement déclaré.
      if (sample.roadY < snapshot.seaLevel) {
        warnings.push({
          code: "road-below-sea-level",
          severity: "error",
          message: `${route.id} passe sous le niveau de la mer (${sample.roadY.toFixed(1)} m) sans pont ni tunnel déclaré.`,
          x: sample.x,
          z: sample.z,
          routeId: route.id,
        });
        break;
      }
    }

    // Écart entre la chaussée déclarée et le terrain réellement produit.
    let worstDrift = 0;
    let worstAt: CartoRouteSample | null = null;

    for (const sample of route.samples) {
      const drift = Math.abs(sample.roadY - sample.terrainY);

      if (drift > worstDrift) {
        worstDrift = drift;
        worstAt = sample;
      }
    }

    if (worstAt && worstDrift > 3) {
      warnings.push({
        code: "road-terrain-drift",
        severity: worstDrift > 8 ? "error" : "warn",
        message: `${route.id} : la chaussée déclarée et le terrain divergent de ${worstDrift.toFixed(1)} m — le sol ne suit pas la route.`,
        x: worstAt.x,
        z: worstAt.z,
        routeId: route.id,
      });
    }

    // Pente extrême.
    const maxGrade = Math.max(route.maxUphill, -route.maxDownhill);

    if (maxGrade > 45) {
      warnings.push({
        code: "extreme-slope",
        severity: "warn",
        message: `${route.id} atteint ${maxGrade.toFixed(0)} % de pente.`,
        routeId: route.id,
      });
    }
  }

  for (const crossing of snapshot.intersections) {
    if (crossing.kind === "collision") {
      warnings.push({
        code: "route-collision",
        severity: "error",
        message: `${crossing.a} et ${crossing.b} se croisent avec ${crossing.deltaY.toFixed(1)} m d'écart — ni jonction ni ouvrage déclaré.`,
        x: crossing.x,
        z: crossing.z,
      });
    }
  }

  for (const track of snapshot.tracks) {
    const region = snapshot.regions.find((r) => r.id === track.region);

    if (region && region.era !== track.era) {
      warnings.push({
        code: "track-outside-era",
        severity: "warn",
        message: `${track.label} est ancrée dans ${track.region} (${region.era}) alors qu'elle appartient à ${track.era}.`,
        x: track.x,
        z: track.z,
      });
    }

    if (track.accessDistance > 60) {
      warnings.push({
        code: "track-without-access",
        severity: "warn",
        message: `${track.label} est à ${track.accessDistance.toFixed(0)} m de la route la plus proche — aucun accès physique.`,
        x: track.x,
        z: track.z,
      });
    }
  }

  for (const sightline of snapshot.sightlines) {
    if (sightline.intendedVisible && sightline.status !== "ok") {
      warnings.push({
        code: "sightline-broken",
        severity: "warn",
        message:
          sightline.status === "blocked"
            ? `${sightline.observerLabel} → ${sightline.landmarkId} : le terrain coupe la vue à ${Math.round((sightline.blockedAt ?? 0) * 100)} % du trajet.`
            : `${sightline.observerLabel} → ${sightline.landmarkId} : l'amer est masqué par le streaming à cette distance.`,
        x: sightline.observer.x,
        z: sightline.observer.z,
      });
    }
  }

  // Héritage longitudinal : les ancres de tracks ont été écrites quand le
  // monde était un axe z. La péninsule pliée les a laissées sur place.
  const stranded = snapshot.tracks.filter(
    (t) => t.accessDistance > 120 || snapshot.regions.find((r) => r.id === t.region)?.era !== t.era
  );

  if (stranded.length > 0) {
    warnings.push({
      code: "legacy-longitudinal-anchor",
      severity: "error",
      message: `${stranded.length} ancres de tracks datent du monde longitudinal : elles ont été écrites en z croissant et n'ont pas suivi le pliage de la péninsule. Elles doivent être replacées dans le plan avant toute production de track.`,
    });
  }

  const unresolved = snapshot.tracks.filter((t) => t.form === "unresolved").length;

  if (unresolved > 0) {
    warnings.push({
      code: "tracks-unresolved",
      severity: "info",
      message: `${unresolved} tracks sur ${snapshot.tracks.length} n'ont pas encore de forme spatiale décidée.`,
    });
  }

  const places = snapshot.tracks.filter((t) => t.form === "place").length;

  if (places > 8) {
    warnings.push({
      code: "too-many-roadside-places",
      severity: "warn",
      message: `${places} tracks sont traitées comme des lieux physiques — le document de topologie met en garde contre vingt-six mini-niveaux.`,
    });
  }

  // Défaut runtime connu, gardé visible tant qu'il n'est pas clos.
  warnings.push({
    code: "known-runtime-col-camera",
    severity: "info",
    message:
      "Caméra du col : le défaut de traversée de terrain n'apparaissait qu'à la relocalisation (−5,30 m). Corrigé par un repositionnement instantané (+1,73 m), à revérifier avec de meilleures preuves spatiales.",
  });

  return warnings;
}
