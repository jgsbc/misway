export type Drift3DBirthYardCrowdLane = Readonly<{
  id: string;
  minX: number;
  maxX: number;
  direction: 1 | -1;
}>;

export type Drift3DBirthYardPavingStrip = Readonly<{
  id: string;
  centerX: number;
  width: number;
  depth: number;
  textureRepeat: readonly [number, number];
}>;

/**
 * Campaign B / Birth Yard Hero Slice — professional scale and density grammar.
 *
 * The safari vehicle is intentionally compact in the established runtime, so
 * secondary crowd silhouettes must read smaller than real-world adults to stay
 * visually proportional to the car, the low-rise Foolfoule blocks and the
 * existing camera. Density is then recovered through instancing and spatial
 * coverage, not by enlarging the figures.
 */
export const DRIFT_3D_BIRTH_YARD_CROWD = Object.freeze({
  count: 176,
  zoneHalfZ: 18,
  scaleMin: 0.78,
  scaleMax: 0.87,
  marchSpeed: 0.42,
  visibilityRadius: 42,
  avoidanceRadius: 1.15,
});

/**
 * Four pedestrian flows cover the full Foolfoule song area while keeping the
 * recovered carriageway clear. Coordinates are relative to the Foolfoule node.
 */
export const DRIFT_3D_BIRTH_YARD_CROWD_LANES: readonly Drift3DBirthYardCrowdLane[] =
  Object.freeze([
    Object.freeze({ id: "west-sidewalk", minX: -5.4, maxX: -1.9, direction: 1 as const }),
    Object.freeze({ id: "quay-promenade", minX: -10.2, maxX: -8.4, direction: -1 as const }),
    Object.freeze({ id: "east-sidewalk-in", minX: 9.2, maxX: 11, direction: -1 as const }),
    Object.freeze({ id: "east-sidewalk-out", minX: 11.1, maxX: 13, direction: 1 as const }),
  ]);

/**
 * Paved pedestrian surfaces make the crowd belong to the same urban grammar
 * as the road, canal and low-rise blocks. They are presentation surfaces only;
 * terrain and vehicle physics remain authoritative.
 */
export const DRIFT_3D_BIRTH_YARD_PAVING_STRIPS: readonly Drift3DBirthYardPavingStrip[] =
  Object.freeze([
    Object.freeze({
      id: "west-sidewalk",
      centerX: -3.65,
      width: 4.2,
      depth: 36,
      textureRepeat: [4, 12] as const,
    }),
    Object.freeze({
      id: "quay-promenade",
      centerX: -9.3,
      width: 2.6,
      depth: 32,
      textureRepeat: [3, 10] as const,
    }),
    Object.freeze({
      id: "east-sidewalk",
      centerX: 11.1,
      width: 4.4,
      depth: 36,
      textureRepeat: [4, 12] as const,
    }),
  ]);

/** Top of the current procedural figure before per-instance scale. */
export const DRIFT_3D_BIRTH_YARD_CROWD_REFERENCE_HEIGHT = 1.568;
