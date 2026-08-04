/**
 * FABLE — réseau de routes élastique.
 *
 * L'épine dorsale reste la traversée rapide du monde ; tout le reste s'en
 * détache. Une route est une polyligne en 3D avec sa largeur : le terrain
 * s'aplanit le long de N'IMPORTE QUELLE route, ce qui rend possibles les
 * branches, les lacets, les boucles et les descentes sans toucher au relief
 * global.
 *
 * L'échelle ne vient pas de la longueur : elle vient des détours, du
 * dénivelé, des retours et de ce qu'on aperçoit sans pouvoir y aller tout
 * de suite.
 */

export type FableRouteKind = "spine" | "branch" | "loop";

export type FableRoute = {
  id: string;
  kind: FableRouteKind;
  /** Points [x, y, z] — l'altitude est portée par la route elle-même. */
  points: Array<[number, number, number]>;
  /** Demi-largeur de la plateforme aplanie. */
  halfWidth: number;
};

type Segment = {
  ax: number;
  ay: number;
  az: number;
  bx: number;
  by: number;
  bz: number;
  halfWidth: number;
  /** Longueur au carré, précalculée. */
  lengthSq: number;
};

const segments: Segment[] = [];
/** Index par tranche de z : évite de tester tout le réseau à chaque appel. */
const buckets = new Map<number, number[]>();
const BUCKET = 16;

function addRoute(route: FableRoute) {
  for (let i = 0; i < route.points.length - 1; i += 1) {
    const [ax, ay, az] = route.points[i];
    const [bx, by, bz] = route.points[i + 1];
    const dx = bx - ax;
    const dz = bz - az;
    const index = segments.length;
    segments.push({
      ax,
      ay,
      az,
      bx,
      by,
      bz,
      halfWidth: route.halfWidth,
      lengthSq: dx * dx + dz * dz || 1e-6,
    });

    // Le segment est inscrit dans toutes les tranches qu'il traverse,
    // élargies de sa portée d'influence.
    const reach = route.halfWidth + 26;
    const z0 = Math.floor((Math.min(az, bz) - reach) / BUCKET);
    const z1 = Math.floor((Math.max(az, bz) + reach) / BUCKET);

    for (let b = z0; b <= z1; b += 1) {
      const list = buckets.get(b);

      if (list) list.push(index);
      else buckets.set(b, [index]);
    }
  }
}

export type FableRouteSample = {
  /** Distance latérale au bord de la plateforme (0 = sur la route). */
  distance: number;
  /** Altitude de la route au point le plus proche. */
  altitude: number;
};

const emptySample: FableRouteSample = { distance: Infinity, altitude: 0 };

/** Point du réseau le plus proche — c'est lui qui aplanit le terrain. */
export function fableRouteField(x: number, z: number): FableRouteSample {
  const list = buckets.get(Math.floor(z / BUCKET));

  if (!list) return emptySample;

  let bestDistance = Infinity;
  let bestAltitude = 0;

  for (const index of list) {
    const s = segments[index];
    const t = Math.max(
      0,
      Math.min(1, ((x - s.ax) * (s.bx - s.ax) + (z - s.az) * (s.bz - s.az)) / s.lengthSq)
    );
    const px = s.ax + (s.bx - s.ax) * t;
    const pz = s.az + (s.bz - s.az) * t;
    const distance = Math.hypot(x - px, z - pz) - s.halfWidth;

    if (distance < bestDistance) {
      bestDistance = distance;
      bestAltitude = s.ay + (s.by - s.ay) * t;
    }
  }

  return { distance: Math.max(0, bestDistance), altitude: bestAltitude };
}

/* ── Le réseau ────────────────────────────────────────────────────────── */

export const FABLE_ROUTES: FableRoute[] = [];

export function registerFableRoute(route: FableRoute) {
  FABLE_ROUTES.push(route);
  addRoute(route);
}

/** Échantillonne une fonction de tracé pour en faire une polyligne. */
export function sampleSpine(
  z0: number,
  z1: number,
  step: number,
  pathX: (z: number) => number,
  altitude: (z: number) => number
): Array<[number, number, number]> {
  const points: Array<[number, number, number]> = [];

  for (let z = z0; z <= z1; z += step) {
    points.push([pathX(z), altitude(z), z]);
  }

  return points;
}

/** Interpole une polyligne — sert à construire les rubans de branche. */
export function routePointAt(
  points: Array<[number, number, number]>,
  t: number
): [number, number, number] {
  const clamped = Math.max(0, Math.min(0.9999, t)) * (points.length - 1);
  const i = Math.floor(clamped);
  const f = clamped - i;
  const a = points[i];
  const b = points[Math.min(points.length - 1, i + 1)];

  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
}
