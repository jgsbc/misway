import { drift3dTrackNodeBySlug } from "@/lib/drift3dTopology";
import { DRIFT_3D_BIRTH_YARD_CANAL } from "@/lib/drift3dTerrain";

const foolfoule = drift3dTrackNodeBySlug.foolfoule.position;
const euxGainent = drift3dTrackNodeBySlug["eux-gainent"].position;

export const DRIFT_3D_BIRTH_YARD_HERO_URBAN = Object.freeze({
  duskCenter: Object.freeze({
    x: (foolfoule.x + euxGainent.x) / 2,
    z: (foolfoule.z + euxGainent.z) / 2,
    radius: 19,
  }),
  quay: Object.freeze({
    x: DRIFT_3D_BIRTH_YARD_CANAL.centerX +
      DRIFT_3D_BIRTH_YARD_CANAL.outerHalfWidth + 0.32,
    minZ: DRIFT_3D_BIRTH_YARD_CANAL.minZ + 3,
    maxZ: DRIFT_3D_BIRTH_YARD_CANAL.maxZ - 1.4,
    wallWidth: 0.46,
    wallHeight: 0.56,
    promenadeWidth: 2.15,
  }),
  euxForecourt: Object.freeze({
    centerX: euxGainent.x - 6.35,
    centerZ: euxGainent.z - 4.1,
    width: 7.2,
    depth: 4.3,
  }),
  euxMarker: Object.freeze({
    x: euxGainent.x - 7.7,
    z: euxGainent.z - 3.75,
    height: 2.25,
  }),
  crane: Object.freeze({
    x: DRIFT_3D_BIRTH_YARD_CANAL.centerX +
      DRIFT_3D_BIRTH_YARD_CANAL.outerHalfWidth + 1.9,
    z: euxGainent.z - 1.8,
    mastHeight: 3.4,
    boomLength: 3.2,
  }),
});

export const DRIFT_3D_BIRTH_YARD_QUAY_BOLLARDS = Object.freeze(
  Array.from({ length: 8 }, (_, index) => {
    const quay = DRIFT_3D_BIRTH_YARD_HERO_URBAN.quay;
    const t = index / 7;

    return Object.freeze({
      x: quay.x + 0.58,
      z: quay.minZ + (quay.maxZ - quay.minZ) * t,
    });
  })
);

export const DRIFT_3D_BIRTH_YARD_QUAY_LIGHTS = Object.freeze(
  Array.from({ length: 4 }, (_, index) => {
    const quay = DRIFT_3D_BIRTH_YARD_HERO_URBAN.quay;
    const t = (index + 0.5) / 4;

    return Object.freeze({
      x: quay.x + 1.45,
      z: quay.minZ + (quay.maxZ - quay.minZ) * t,
    });
  })
);
