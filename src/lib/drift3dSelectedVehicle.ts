export const DRIFT_3D_SELECTED_VEHICLE = Object.freeze({
  id: "roh3d-defender-d110",
  label: "Defender D110 · ROH3D",
  sketchfabModelUid: "35b435313f2048bba76c74be07388a43",
  sourceUrl:
    "https://sketchfab.com/3d-models/low-poly-car-rand-rover-defender-d110-35b435313f2048bba76c74be07388a43",
  triangleCount: 29_223,
  targetBodyHex: "#ab9464",
  targetBodyRgb: Object.freeze([171 / 255, 148 / 255, 100 / 255] as const),
  acquisition: "commercial",
  role: "Selected visual target",
});

type MaterialChannel = {
  color?: number[];
};

export type Drift3DSketchfabMaterial = {
  name?: string;
  channels?: {
    AlbedoPBR?: MaterialChannel;
    DiffusePBR?: MaterialChannel;
    DiffuseColor?: MaterialChannel;
  };
};

function getMaterialBaseColor(
  material: Drift3DSketchfabMaterial
): readonly number[] | null {
  return (
    material.channels?.AlbedoPBR?.color ??
    material.channels?.DiffusePBR?.color ??
    material.channels?.DiffuseColor?.color ??
    null
  );
}

/**
 * ROH3D's selected D110 is olive green in the source viewer. The Kit Lab may
 * tint only olive-painted materials so tyres, glass, roof rack and black trim
 * remain visually untouched. This is deliberately a colour-space heuristic,
 * not a material-name contract: we have not acquired the commercial source
 * file yet and therefore do not pretend to know its authoring names.
 */
export function isDrift3DSelectedVehicleBodyMaterial(
  material: Drift3DSketchfabMaterial
): boolean {
  const color = getMaterialBaseColor(material);

  if (!color || color.length < 3) {
    return false;
  }

  const [r, g, b] = color;

  if (![r, g, b].every(Number.isFinite)) {
    return false;
  }

  const brightness = Math.max(r, g, b);
  const greenDominance = g - Math.max(r, b);

  return (
    brightness > 0.16 &&
    brightness < 0.82 &&
    greenDominance > 0.035 &&
    g > r * 1.06 &&
    g > b * 1.08
  );
}

export function tintDrift3DSelectedVehicleBodyMaterial(
  material: Drift3DSketchfabMaterial,
  targetRgb: readonly [number, number, number] =
    DRIFT_3D_SELECTED_VEHICLE.targetBodyRgb
): boolean {
  if (!isDrift3DSelectedVehicleBodyMaterial(material)) {
    return false;
  }

  const channels = material.channels;

  if (!channels) {
    return false;
  }

  let changed = false;

  for (const channel of [
    channels.AlbedoPBR,
    channels.DiffusePBR,
    channels.DiffuseColor,
  ]) {
    if (channel?.color) {
      channel.color = [...targetRgb];
      changed = true;
    }
  }

  return changed;
}
