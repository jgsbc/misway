import type {
  Drift3DLandmark,
  Drift3DLandmarkPrimitive,
  Drift3DMaterialKind,
} from "@/lib/drift3dLandmarks";
import { drift3dTrackNodeBySlug } from "@/lib/drift3dTopology";
import { DRIFT_EVOLUTION_ZEELAND_ROUTE } from "@/lib/driftEvolutionZeelandGeography";

export const DRIFT_EVOLUTION_JAZZYPLING_SOURCE_LANDMARK_ID =
  "birth-jazzypling-alley";
export const DRIFT_EVOLUTION_JAZZYPLING_LANDMARK_ID =
  "evolution-jazzypling-district";

const jazzypling = drift3dTrackNodeBySlug.jazzypling.position;
const playIt = drift3dTrackNodeBySlug["play-it"].position;
const zeelandSouthJunction = DRIFT_EVOLUTION_ZEELAND_ROUTE[3];

export const DRIFT_EVOLUTION_JAZZYPLING_CENTER = Object.freeze({
  x: jazzypling.x,
  z: jazzypling.z,
});

export const DRIFT_EVOLUTION_JAZZYPLING_ALLEY_HALF_WIDTH = 1.8;

/**
 * Lab-only ordinary-world proof. Zeeland's south dry junction feeds a crooked
 * cellar street around the canonical Jazzypling node, then the lane opens
 * toward Play It. This is deliberately a district, not a closed arena.
 */
export const DRIFT_EVOLUTION_JAZZYPLING_ROUTE = Object.freeze([
  Object.freeze({ x: zeelandSouthJunction.x, z: zeelandSouthJunction.z }),
  Object.freeze({ x: -71.2, z: 16.4 }),
  Object.freeze({ x: DRIFT_EVOLUTION_JAZZYPLING_CENTER.x, z: DRIFT_EVOLUTION_JAZZYPLING_CENTER.z }),
  Object.freeze({ x: -64.5, z: 12.6 }),
  Object.freeze({ x: -60.7, z: 14.6 }),
  Object.freeze({ x: -57.4, z: 20.8 }),
] as const);

type BuildingSpec = Readonly<{
  x: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  material: Drift3DMaterialKind;
  color: string;
  rotation?: number;
}>;

const BUILDINGS: readonly BuildingSpec[] = Object.freeze([
  Object.freeze({ x: -5.3, z: -5.1, width: 3, height: 4.6, depth: 2.8, material: "brick" as const, color: "#786b64", rotation: 0.04 }),
  Object.freeze({ x: -1.7, z: -5.35, width: 2.7, height: 5.2, depth: 3, material: "brick" as const, color: "#71655f", rotation: -0.035 }),
  Object.freeze({ x: 2.2, z: -5.15, width: 3.2, height: 4.2, depth: 2.8, material: "plaster" as const, color: "#8d8379", rotation: 0.025 }),
  Object.freeze({ x: 6.4, z: -4.9, width: 3.4, height: 5.8, depth: 3.1, material: "brick" as const, color: "#6d625c", rotation: -0.03 }),
  Object.freeze({ x: 9.6, z: -4.6, width: 2.2, height: 3.8, depth: 2.6, material: "concrete" as const, color: "#77736d", rotation: 0.025 }),
  Object.freeze({ x: -5.5, z: 5.2, width: 2.8, height: 3.9, depth: 2.8, material: "plaster" as const, color: "#8a8077", rotation: -0.04 }),
  Object.freeze({ x: -1.8, z: 5.45, width: 2.8, height: 5.5, depth: 3, material: "brick" as const, color: "#74655f", rotation: 0.03 }),
  Object.freeze({ x: 2.25, z: 5.3, width: 3.2, height: 4.5, depth: 2.9, material: "brick" as const, color: "#6c615c", rotation: -0.025 }),
  Object.freeze({ x: 6.45, z: 5.05, width: 3.3, height: 5.1, depth: 3, material: "plaster" as const, color: "#847a72", rotation: 0.03 }),
  Object.freeze({ x: 9.65, z: 4.75, width: 2.2, height: 4.1, depth: 2.6, material: "brick" as const, color: "#70635d", rotation: -0.02 }),
]);

export const DRIFT_EVOLUTION_JAZZYPLING_CELLARS = Object.freeze([
  Object.freeze({ id: "blue-note", x: -5, z: -3.57, side: "north" as const, color: "#d99b54" }),
  Object.freeze({ id: "red-stairs", x: -1.5, z: -3.72, side: "north" as const, color: "#be644e" }),
  Object.freeze({ id: "low-room", x: 2.3, z: -3.62, side: "north" as const, color: "#d7ad67" }),
  Object.freeze({ id: "backbeat", x: -1.8, z: 3.88, side: "south" as const, color: "#c48e58" }),
  Object.freeze({ id: "curtain-room", x: 2.2, z: 3.77, side: "south" as const, color: "#af5f4e" }),
  Object.freeze({ id: "last-door", x: 6.2, z: 3.62, side: "south" as const, color: "#d0a05d" }),
] as const);

function box(
  offset: [number, number, number],
  args: [number, number, number],
  options: Partial<Drift3DLandmarkPrimitive> = {}
): Drift3DLandmarkPrimitive {
  return {
    kind: "box",
    offset,
    args,
    color: "#69635e",
    material: "brick",
    roughness: 0.9,
    ...options,
  } as Drift3DLandmarkPrimitive;
}

function roadSegment(
  start: { x: number; z: number },
  end: { x: number; z: number },
  width: number,
  origin: { x: number; z: number }
): Drift3DLandmarkPrimitive {
  const dx = end.x - start.x;
  const dz = end.z - start.z;
  const length = Math.hypot(dx, dz);
  return box(
    [(start.x + end.x) / 2 - origin.x, 0.018, (start.z + end.z) / 2 - origin.z],
    [width, 0.036, length + 0.18],
    {
      color: "#343537",
      material: "granite",
      textureRepeat: [2, Math.max(1, Math.round(length / 2))],
      rotation: [0, Math.atan2(dx, dz), 0],
      roughness: 0.28,
    }
  );
}

function buildingPrimitive(spec: BuildingSpec): Drift3DLandmarkPrimitive {
  return box([spec.x, 0, spec.z], [spec.width, spec.height, spec.depth], {
    color: spec.color,
    material: spec.material,
    textureRepeat: [Math.max(1, Math.round(spec.width / 1.5)), 3],
    rotation: spec.rotation ? [0, spec.rotation, 0] : undefined,
    roughness: 0.9,
    solid: true,
    solidRadius: Math.min(1.45, Math.max(spec.width, spec.depth) * 0.38),
  });
}

function cellarPrimitives(
  cellar: (typeof DRIFT_EVOLUTION_JAZZYPLING_CELLARS)[number]
): Drift3DLandmarkPrimitive[] {
  const streetSign = cellar.side === "north" ? 1 : -1;
  const doorZ = cellar.z + streetSign * 0.045;
  const stairZ = cellar.z + streetSign * 0.55;

  return [
    box([cellar.x, 0.01, stairZ], [1.05, 0.08, 1.05], {
      color: "#67635e",
      material: "concrete",
      roughness: 0.96,
    }),
    box([cellar.x, 0.08, doorZ], [0.72, 1.18, 0.08], {
      color: "#17191b",
      material: "wood",
      roughness: 0.78,
    }),
    box([cellar.x, 0.56, doorZ + streetSign * 0.055], [0.52, 0.46, 0.035], {
      color: cellar.color,
      emissive: cellar.color,
      emissiveIntensity: 0.58,
      roughness: 0.48,
      pointLight: {
        color: cellar.color,
        intensity: 1.25,
        distance: 4.2,
        y: 0.66,
      },
    }),
  ];
}

export function buildDriftEvolutionJazzyplingDistrictLandmark(): Drift3DLandmark {
  const origin = DRIFT_EVOLUTION_JAZZYPLING_CENTER;
  const routePrimitives = DRIFT_EVOLUTION_JAZZYPLING_ROUTE.slice(0, -1).map(
    (point, index) =>
      roadSegment(
        point,
        DRIFT_EVOLUTION_JAZZYPLING_ROUTE[index + 1],
        DRIFT_EVOLUTION_JAZZYPLING_ALLEY_HALF_WIDTH * 2,
        origin
      )
  );

  const crossAlleys = [
    roadSegment(
      { x: origin.x - 0.2, z: origin.z - 6.5 },
      { x: origin.x - 0.2, z: origin.z + 6.5 },
      2.2,
      origin
    ),
    roadSegment(
      { x: origin.x + 4.3, z: origin.z - 6.2 },
      { x: origin.x + 4.3, z: origin.z + 6.2 },
      1.8,
      origin
    ),
  ];

  return {
    id: DRIFT_EVOLUTION_JAZZYPLING_LANDMARK_ID,
    origin: { x: origin.x, z: origin.z },
    primitives: [
      ...routePrimitives,
      ...crossAlleys,
      ...BUILDINGS.map(buildingPrimitive),
      ...DRIFT_EVOLUTION_JAZZYPLING_CELLARS.flatMap(cellarPrimitives),
      box([8.9, 1.8, -3.45], [1.1, 0.24, 0.07], {
        color: "#8f3f38",
        emissive: "#a94a43",
        emissiveIntensity: 0.3,
        roughness: 0.62,
        pointLight: { color: "#a94a43", intensity: 0.55, distance: 2.8, y: 1.9 },
      }),
    ],
  };
}

export function getDriftEvolutionJazzyplingDistrictIssues() {
  const issues: string[] = [];
  const first = DRIFT_EVOLUTION_JAZZYPLING_ROUTE[0];
  const last = DRIFT_EVOLUTION_JAZZYPLING_ROUTE[DRIFT_EVOLUTION_JAZZYPLING_ROUTE.length - 1];
  const centerDistanceToPlayIt = Math.hypot(
    DRIFT_EVOLUTION_JAZZYPLING_CENTER.x - playIt.x,
    DRIFT_EVOLUTION_JAZZYPLING_CENTER.z - playIt.z
  );

  if (Math.hypot(first.x - zeelandSouthJunction.x, first.z - zeelandSouthJunction.z) > 0.01) {
    issues.push("Jazzypling west mouth must start on Zeeland's south dry junction");
  }
  if (Math.hypot(last.x - playIt.x, last.z - playIt.z) >= centerDistanceToPlayIt) {
    issues.push("Jazzypling east mouth must progress toward Play It");
  }
  if (DRIFT_EVOLUTION_JAZZYPLING_CELLARS.length < 5) {
    issues.push("Jazzypling needs several readable cellar entrances");
  }

  const landmark = buildDriftEvolutionJazzyplingDistrictLandmark();
  if (landmark.primitives.some((primitive) => primitive.water)) {
    issues.push("Jazzypling must not create a second water authority");
  }
  if (
    landmark.primitives
      .filter((primitive) => primitive.solid)
      .some((primitive) => (primitive.solidRadius ?? 0) > 1.5)
  ) {
    issues.push("Jazzypling collider circles must stay locally bounded");
  }

  return issues;
}
