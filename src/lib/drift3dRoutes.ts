import {
  DRIFT_3D_PENINSULA_BOUNDS,
  DRIFT_3D_PENINSULA_ENTRY_SPAWN,
  DRIFT_3D_PENINSULA_SPINE,
  drift3dPeninsulaPoint,
} from "./drift3dPeninsula";

export type Drift3DRouteKind = "spine" | "branch" | "loop";
export type Drift3DRoutePoint = readonly [number, number, number];
export type Drift3DRoute = Readonly<{
  id: string;
  kind: Drift3DRouteKind;
  points: readonly Drift3DRoutePoint[];
  halfWidth: number;
}>;

export type Drift3DRouteField = Readonly<{
  distance: number;
  altitude: number;
  routeId: string | null;
}>;

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const t = clamp01((value - edge0) / (edge1 - edge0));

  return t * t * (3 - 2 * t);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** Fable's authored Entry → Birth Yard centerline, retained in metre scale. */
function heroPathX(sourceZ: number) {
  if (sourceZ <= -6) {
    return 4 * Math.sin((sourceZ + 60) * 0.055);
  }

  if (sourceZ <= 8) {
    const start = 4 * Math.sin(54 * 0.055);

    return start * (1 - smoothstep(-6, 8, sourceZ));
  }

  if (sourceZ <= 40) {
    return (
      -4.5 * Math.sin((sourceZ - 8) * 0.1) *
      (1 - smoothstep(34, 40, sourceZ))
    );
  }

  return 0;
}

function heroAltitude(sourceZ: number) {
  if (sourceZ <= -6) {
    return lerp(4.1, 6, smoothstep(-60, -6, sourceZ));
  }

  if (sourceZ <= 8) {
    return 6;
  }

  if (sourceZ <= 40) {
    return lerp(6, 0.4, smoothstep(8, 40, sourceZ));
  }

  return 0.4;
}

function buildHeroRoute(): readonly Drift3DRoutePoint[] {
  const points: Drift3DRoutePoint[] = [
    [
      DRIFT_3D_PENINSULA_ENTRY_SPAWN.x,
      heroAltitude(-56.5),
      DRIFT_3D_PENINSULA_ENTRY_SPAWN.z,
    ],
  ];

  for (let sourceZ = -50; sourceZ < 160; sourceZ += 5) {
    const world = drift3dPeninsulaPoint(heroPathX(sourceZ), sourceZ);
    points.push([world.x, heroAltitude(sourceZ), world.z]);
  }

  points.push(DRIFT_3D_PENINSULA_SPINE[0]);

  return Object.freeze(points);
}

function spineHeading(index: number): readonly [number, number] {
  const a = DRIFT_3D_PENINSULA_SPINE[Math.max(0, index - 1)];
  const b = DRIFT_3D_PENINSULA_SPINE[
    Math.min(DRIFT_3D_PENINSULA_SPINE.length - 1, index + 1)
  ];
  const dx = b[0] - a[0];
  const dz = b[2] - a[2];
  const length = Math.hypot(dx, dz) || 1;

  return [dx / length, dz / length];
}

function isInsideWorld(point: Drift3DRoutePoint) {
  return (
    point[0] >= DRIFT_3D_PENINSULA_BOUNDS.minX &&
    point[0] <= DRIFT_3D_PENINSULA_BOUNDS.maxX &&
    point[2] >= DRIFT_3D_PENINSULA_BOUNDS.minZ &&
    point[2] <= DRIFT_3D_PENINSULA_BOUNDS.maxZ
  );
}

function branchFromSpine(
  index: number,
  legs: readonly Readonly<{ forward: number; side: number; rise: number }>[]
): readonly Drift3DRoutePoint[] {
  const [ox, oy, oz] = DRIFT_3D_PENINSULA_SPINE[index];
  const [fx, fz] = spineHeading(index);
  const sx = fz;
  const sz = -fx;
  const points = legs.map(({ forward, side, rise }) =>
    Object.freeze([
      ox + fx * forward + sx * side,
      oy + rise,
      oz + fz * forward + sz * side,
    ] as const)
  );

  // Fable's last belvedere experiment overshot its own movement bounds by
  // ~10m. Extraction keeps the authored route up to the last physically
  // reachable point instead of enlarging/scaling the production world.
  return Object.freeze(points.filter(isInsideWorld));
}

function buildSuburbLoop(): readonly Drift3DRoutePoint[] {
  const index = 19;
  const [ix, iy, iz] = DRIFT_3D_PENINSULA_SPINE[index];
  const [fx, fz] = spineHeading(index);
  const sx = fz;
  const sz = -fx;
  const cx = ix + sx * 46;
  const cz = iz + sz * 46;
  const rx = 34;
  const rz = 30;
  const points: Drift3DRoutePoint[] = [
    [ix, iy, iz],
    [ix + sx * 10, iy, iz + sz * 10],
  ];

  for (let i = 0; i <= 26; i += 1) {
    const angle = Math.PI + (i / 26) * Math.PI * 2;
    points.push([
      cx + Math.cos(angle) * rx,
      iy,
      cz + Math.sin(angle) * rz,
    ]);
  }

  points.push([
    ix + fx * 44 + sx * 10,
    iy,
    iz + fz * 44 + sz * 10,
  ]);
  points.push([ix + fx * 44, iy, iz + fz * 44]);

  return Object.freeze(points.filter(isInsideWorld));
}

const HERO_ROUTE = buildHeroRoute();
const BELVEDERE_ROUTE = branchFromSpine(8, [
  { forward: 0, side: 0, rise: 0 },
  { forward: 12, side: -16, rise: 5 },
  { forward: 30, side: -26, rise: 11 },
  { forward: 40, side: -46, rise: 17 },
  { forward: 34, side: -68, rise: 23 },
  { forward: 46, side: -88, rise: 29 },
  { forward: 66, side: -102, rise: 34 },
  { forward: 88, side: -110, rise: 38 },
  { forward: 104, side: -114, rise: 41 },
]);
const SUBURB_LOOP = buildSuburbLoop();
const HEADLAND_ROUTE = branchFromSpine(28, [
  { forward: 0, side: 0, rise: 0 },
  { forward: 10, side: 14, rise: -3 },
  { forward: 22, side: 28, rise: -6.5 },
  { forward: 36, side: 40, rise: -9.5 },
  { forward: 52, side: 48, rise: -11.5 },
  { forward: 68, side: 52, rise: -13 },
  { forward: 82, side: 48, rise: -13.8 },
  { forward: 92, side: 38, rise: -14.2 },
]);

export const DRIFT_3D_ROUTES: readonly Drift3DRoute[] = Object.freeze([
  Object.freeze({
    id: "entry-birth-yard",
    kind: "spine" as const,
    points: HERO_ROUTE,
    halfWidth: 4.2,
  }),
  Object.freeze({
    id: "peninsula-spine",
    kind: "spine" as const,
    points: DRIFT_3D_PENINSULA_SPINE,
    halfWidth: 5,
  }),
  Object.freeze({
    id: "older-shadows-belvedere",
    kind: "branch" as const,
    points: BELVEDERE_ROUTE,
    halfWidth: 3.6,
  }),
  Object.freeze({
    id: "vegetative-field-loop",
    kind: "loop" as const,
    points: SUBURB_LOOP,
    halfWidth: 4.4,
  }),
  Object.freeze({
    id: "new-signal-headland",
    kind: "branch" as const,
    points: HEADLAND_ROUTE,
    halfWidth: 3.8,
  }),
]);

type RouteSegment = Readonly<{
  routeId: string;
  ax: number;
  ay: number;
  az: number;
  bx: number;
  by: number;
  bz: number;
  halfWidth: number;
}>;

const ROUTE_BUCKET_SIZE = 32;
const routeBuckets = new Map<number, RouteSegment[]>();
const routeSegments: RouteSegment[] = [];

function bucketFor(z: number) {
  return Math.floor(z / ROUTE_BUCKET_SIZE);
}

function registerSegment(segment: RouteSegment) {
  routeSegments.push(segment);
  const reach = segment.halfWidth + 36;
  const minBucket = bucketFor(Math.min(segment.az, segment.bz) - reach);
  const maxBucket = bucketFor(Math.max(segment.az, segment.bz) + reach);

  for (let bucket = minBucket; bucket <= maxBucket; bucket += 1) {
    const segments = routeBuckets.get(bucket) ?? [];
    segments.push(segment);
    routeBuckets.set(bucket, segments);
  }
}

for (const route of DRIFT_3D_ROUTES) {
  for (let index = 1; index < route.points.length; index += 1) {
    const a = route.points[index - 1];
    const b = route.points[index];
    registerSegment({
      routeId: route.id,
      ax: a[0],
      ay: a[1],
      az: a[2],
      bx: b[0],
      by: b[1],
      bz: b[2],
      halfWidth: route.halfWidth,
    });
  }
}

function sampleSegment(segment: RouteSegment, x: number, z: number) {
  const dx = segment.bx - segment.ax;
  const dz = segment.bz - segment.az;
  const lengthSquared = dx * dx + dz * dz;
  const t =
    lengthSquared <= 0
      ? 0
      : clamp01(
          ((x - segment.ax) * dx + (z - segment.az) * dz) / lengthSquared
        );
  const px = segment.ax + dx * t;
  const pz = segment.az + dz * t;
  const centerDistance = Math.hypot(x - px, z - pz);

  return {
    distance: Math.max(0, centerDistance - segment.halfWidth),
    altitude: lerp(segment.ay, segment.by, t),
    t,
    x: px,
    z: pz,
  };
}

export function getDrift3DRouteField(x: number, z: number): Drift3DRouteField {
  const candidates = routeBuckets.get(bucketFor(z)) ?? routeSegments;
  let bestDistance = Number.POSITIVE_INFINITY;
  let bestAltitude = 0;
  let bestRouteId: string | null = null;

  for (const segment of candidates) {
    const sample = sampleSegment(segment, x, z);

    if (sample.distance < bestDistance) {
      bestDistance = sample.distance;
      bestAltitude = sample.altitude;
      bestRouteId = segment.routeId;
    }
  }

  return {
    distance: bestDistance,
    altitude: bestAltitude,
    routeId: bestRouteId,
  };
}

export function getDrift3DNearestRoutePoint(x: number, z: number) {
  let bestDistance = Number.POSITIVE_INFINITY;
  let best = {
    x,
    y: 0,
    z,
    routeId: null as string | null,
    heading: 0,
  };

  for (const segment of routeSegments) {
    const sample = sampleSegment(segment, x, z);
    const centerDistance = sample.distance + segment.halfWidth;

    if (centerDistance < bestDistance) {
      bestDistance = centerDistance;
      best = {
        x: sample.x,
        y: sample.altitude,
        z: sample.z,
        routeId: segment.routeId,
        heading: Math.atan2(segment.bx - segment.ax, segment.bz - segment.az),
      };
    }
  }

  return { ...best, distance: bestDistance };
}
