export type Drift3DBirthYardCrowdFlow = Readonly<{
  id: string;
  start: readonly [number, number];
  end: readonly [number, number];
  halfWidth: number;
  slots: number;
}>;

export type Drift3DBirthYardPavingStrip = Readonly<{
  id: string;
  centerX: number;
  centerZ: number;
  width: number;
  depth: number;
  textureRepeat: readonly [number, number];
}>;

/**
 * Campaign B / Birth Yard Hero Slice — mass-crowd circulation grammar.
 *
 * Hero Asset Pass 02 promotes six nearest/readable pedestrians to real
 * skinned GLB actors. This procedural layer therefore owns 186 secondary
 * silhouettes only; combined population remains 192 and the established
 * pressure/density does not change while foreground fidelity improves.
 */
export const DRIFT_3D_BIRTH_YARD_CROWD = Object.freeze({
  count: 186,
  scaleMin: 0.52,
  scaleMax: 0.6,
  marchSpeed: 0.44,
  visibilityRadius: 42,
  avoidanceRadius: 1.05,
});

/**
 * Foolfoule is a compressed pedestrian pressure field, not two sidewalk
 * queues. Most people move north/south through the central space between the
 * west and east building rows. Two denser transverse streams use the narrow
 * shared gap between the four blocks and visibly cross the drive route.
 * Coordinates are relative to the Foolfoule node.
 */
export const DRIFT_3D_BIRTH_YARD_CROWD_FLOWS: readonly Drift3DBirthYardCrowdFlow[] =
  Object.freeze([
    Object.freeze({
      id: "interbuilding-northbound",
      start: [-1.35, -18] as const,
      end: [-0.15, 18] as const,
      halfWidth: 0.62,
      slots: 52,
    }),
    Object.freeze({
      id: "interbuilding-southbound",
      start: [1.3, 18] as const,
      end: [0.2, -18] as const,
      halfWidth: 0.62,
      slots: 52,
    }),
    Object.freeze({
      id: "building-gap-eastbound",
      start: [-8, -0.42] as const,
      end: [8, -0.32] as const,
      halfWidth: 0.13,
      slots: 41,
    }),
    Object.freeze({
      id: "building-gap-westbound",
      start: [7.9, -0.16] as const,
      end: [-7.9, -0.24] as const,
      halfWidth: 0.13,
      slots: 41,
    }),
  ]);

/**
 * Only the actual inter-building passage gets an added pedestrian surface.
 * The old long side strips are intentionally gone: the crowd now belongs to
 * the street/courtyard void between buildings, with one narrow cross-passage
 * marking the transverse flow through the block gap.
 */
export const DRIFT_3D_BIRTH_YARD_PAVING_STRIPS: readonly Drift3DBirthYardPavingStrip[] =
  Object.freeze([
    Object.freeze({
      id: "building-gap-crossing",
      centerX: 0,
      centerZ: -0.3,
      width: 16.4,
      depth: 0.82,
      textureRepeat: [12, 1] as const,
    }),
  ]);

/** Top of the current procedural figure before per-instance scale. */
export const DRIFT_3D_BIRTH_YARD_CROWD_REFERENCE_HEIGHT = 1.568;

export function getDrift3DBirthYardCrowdFlowForIndex(
  index: number
): Drift3DBirthYardCrowdFlow {
  const normalized =
    ((Math.trunc(index) % DRIFT_3D_BIRTH_YARD_CROWD.count) +
      DRIFT_3D_BIRTH_YARD_CROWD.count) %
    DRIFT_3D_BIRTH_YARD_CROWD.count;
  let cursor = 0;

  for (const flow of DRIFT_3D_BIRTH_YARD_CROWD_FLOWS) {
    cursor += flow.slots;

    if (normalized < cursor) {
      return flow;
    }
  }

  return DRIFT_3D_BIRTH_YARD_CROWD_FLOWS[0];
}

export function getDrift3DBirthYardCrowdFlowLength(
  flow: Drift3DBirthYardCrowdFlow
) {
  return Math.hypot(flow.end[0] - flow.start[0], flow.end[1] - flow.start[1]);
}

export function sampleDrift3DBirthYardCrowdFlow(
  flow: Drift3DBirthYardCrowdFlow,
  progress: number,
  lateralOffset: number
) {
  const t = ((progress % 1) + 1) % 1;
  const dx = flow.end[0] - flow.start[0];
  const dz = flow.end[1] - flow.start[1];
  const length = Math.hypot(dx, dz) || 1;
  const lateral = Math.max(-flow.halfWidth, Math.min(flow.halfWidth, lateralOffset));
  const rightX = dz / length;
  const rightZ = -dx / length;

  return {
    x: flow.start[0] + dx * t + rightX * lateral,
    z: flow.start[1] + dz * t + rightZ * lateral,
    heading: Math.atan2(dx, dz),
  };
}
