import type { Drift3DVehicleCollider } from "@/lib/drift3dVehiclePhysics";
import { fableRouteField } from "@/components/drift-3d/fable/fableRoutes";
import { registerFableWorldRoutes } from "@/components/drift-3d/fable/fableBranches";

/**
 * FABLE SPIKE — analytic spine of the Entry → Birth Yard slice.
 * One continuous route along +z :
 *   z −60 → −6   gorge minérale (tunnel) qui monte doucement vers la lumière
 *   z  −6 →  8   corniche — la ville se révèle en contrebas
 *   z   8 → 40   descente en lacet vers le sol urbain
 *   z  40 → 150  rue principale du Chantier de Naissance, cour à z 88–116
 */

export const FABLE_TUNNEL_Z0 = -60;
export const FABLE_MOUTH_Z = -6;
export const FABLE_LEDGE_Z1 = 8;
export const FABLE_DESCENT_Z1 = 40;
export const FABLE_CITY_Z0 = 40;
export const FABLE_CITY_Z1 = 150;
export const FABLE_YARD_Z0 = 88;
export const FABLE_YARD_Z1 = 116;

export const FABLE_SPAWN = { x: 0.66, z: -56.5 };

export const FABLE_BOUNDS = {
  minX: -110,
  maxX: 110,
  minZ: -59,
  maxZ: 1008,
};

export const FABLE_TUNNEL_HALF_WIDTH = 3.7;
export const FABLE_TUNNEL_APEX = 5.4;

/** Portal wall (cliff face) center plane. */
export const FABLE_PORTAL_Z = -5;
/** Lateral offset applied to the λ opening so the right leg sits on the road. */
export const FABLE_PORTAL_HOLE_OFFSET_X = -0.94;

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));

  return t * t * (3 - 2 * t);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** Deterministic PRNG — same world on every load. */
export function fableRng(seed: number) {
  let s = seed >>> 0;

  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashNoise(x: number, z: number) {
  const v = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;

  return v - Math.floor(v);
}

/** Centerline of the drivable route. */
export function fablePathX(z: number): number {
  if (z <= FABLE_MOUTH_Z) {
    return 4 * Math.sin((z + 60) * 0.055);
  }

  if (z <= FABLE_LEDGE_Z1) {
    const start = 4 * Math.sin(54 * 0.055);

    return start * (1 - smoothstep(FABLE_MOUTH_Z, FABLE_LEDGE_Z1, z));
  }

  if (z <= FABLE_DESCENT_Z1) {
    return -4.5 * Math.sin((z - FABLE_LEDGE_Z1) * 0.1) *
      (1 - smoothstep(34, FABLE_DESCENT_Z1, z));
  }

  // Au-delà de la ville-port, le tracé appartient aux ères lointaines.
  if (z > 170) return fableFarPathX(z);

  return 0;
}

/**
 * Street half-width along the main axis — irregular on purpose : la rue
 * respire, se pince à ~z 62, s'ouvre en cour à z 88–116.
 */
export function fableStreetHalfWidth(z: number): number {
  const base = 4.1;
  const pinch = -1.1 * Math.exp(-((z - 62) * (z - 62)) / 60);
  const yard = 17 * smoothstep(FABLE_YARD_Z0 - 4, FABLE_YARD_Z0 + 6, z) *
    (1 - smoothstep(FABLE_YARD_Z1 - 6, FABLE_YARD_Z1 + 4, z));
  const drift = 0.5 * Math.sin(z * 0.16);
  const canyon = smoothstep(48, 58, z) * (1 - smoothstep(78, 88, z));

  return base + pinch + drift + yard - canyon * 1.35;
}

/* ── A WALK IN ZEELAND — le bassin, ouvert sur la gauche de la rue ────── */

export const FABLE_CANAL_Z0 = 112;
export const FABLE_CANAL_Z1 = 152;
/** Bord du quai : au-delà (vers −x), c'est l'eau, jusqu'à la rive d'en face. */
export const FABLE_QUAY_X = -6.6;
export const FABLE_CANAL_FAR_X = -44;
export const FABLE_WATER_Y = -0.2;
export const FABLE_BRIDGE_Z = 141;
/** Parcelle réservée à la vitrine d'en face, côté rue. */
export const FABLE_SHOWROOM_Z = 121;

/** 1 à l'intérieur du bassin, 0 sur la rue — bord adouci. */
export function fableCanalMix(x: number, z: number): number {
  const along =
    smoothstep(FABLE_CANAL_Z0 - 3, FABLE_CANAL_Z0 + 5, z) *
    (1 - smoothstep(FABLE_CANAL_Z1 - 4, FABLE_CANAL_Z1 + 2, z));
  // Le bassin est borné des DEUX côtés : sans rive opposée, la découpe
  // filerait en plaine sèche jusqu'à l'horizon.
  const nearSide = 1 - smoothstep(FABLE_QUAY_X - 2.2, FABLE_QUAY_X + 0.2, x);
  const farSide = smoothstep(FABLE_CANAL_FAR_X - 1.5, FABLE_CANAL_FAR_X + 2.5, x);

  return along * nearSide * farSide;
}

/** Ground elevation — continuous across every regime. */
export function fableGroundY(x: number, z: number): number {
  let base: number;

  if (z <= FABLE_MOUTH_Z) {
    const t = smoothstep(FABLE_TUNNEL_Z0, FABLE_MOUTH_Z, z);
    base = lerp(4.1, 6.0, t);
    base += (hashNoise(Math.floor(x * 2) * 0.5, Math.floor(z * 2) * 0.5) - 0.5) * 0.05;
  } else if (z <= FABLE_LEDGE_Z1) {
    base = 6.0;
  } else if (z <= FABLE_DESCENT_Z1) {
    base = lerp(6.0, 0.4, smoothstep(FABLE_LEDGE_Z1, FABLE_DESCENT_Z1, z));
  } else if (z <= 170) {
    base = 0.4 + (hashNoise(Math.floor(x * 0.7), Math.floor(z * 0.7)) - 0.5) * 0.06;
  } else {
    // Au-delà de la ville-port, le monde continue : montagne, banlieue, mer.
    base = fableFarGroundY(x, z);
  }

  // Le bassin creuse le sol : le quai tombe droit, le fond reste sous l'eau.
  const canal = fableCanalMix(x, z);

  if (canal > 0) base = lerp(base, -2.4, canal);

  return base;
}

/* ── Relief du monde lointain ─────────────────────────────────────────── */

/** Bruit fractal léger — assez pour que rien ne soit plat, pas plus. */
function fbm(x: number, z: number) {
  return (
    (hashNoise(Math.floor(x * 0.11), Math.floor(z * 0.11)) - 0.5) * 1.0 +
    (hashNoise(Math.floor(x * 0.31) + 17, Math.floor(z * 0.31)) - 0.5) * 0.45 +
    (hashNoise(Math.floor(x * 0.8) + 91, Math.floor(z * 0.8)) - 0.5) * 0.2
  );
}

/** Altitude de la route au-delà de Birth Yard : elle monte puis redescend. */
export function fableRouteAltitude(z: number): number {
  if (z <= 170) return 0.4;

  // Older Shadows : longue montée jusqu'au col, puis bascule.
  const climb = smoothstep(170, 300, z) * 46;
  const plateau = smoothstep(300, 400, z) * 22;
  const col = smoothstep(400, 440, z) * 8;
  const dropToSuburb = smoothstep(440, 500, z) * 62;
  // Vegetative Field : plat, bas, mouillé.
  const suburb = smoothstep(500, 700, z) * 0;
  // New Signal : la corniche redescend vers la mer.
  const coast = smoothstep(700, 1010, z) * 10;

  return 0.4 + climb + plateau + col - dropToSuburb + suburb + 14 - coast;
}

/**
 * Sol hors de la tranche de référence. La route reste une bande à peu près
 * plane ; le relief se creuse dès qu'on s'en écarte, ce qui suffit à
 * enfermer le joueur sans mur invisible.
 */
export function fableFarGroundY(x: number, z: number): number {
  // Le terrain s'aplanit le long de TOUTE route du réseau — épine dorsale,
  // branche, lacet ou boucle. C'est ce qui rend le monde élastique : on
  // greffe un détour et le relief le suit, sans toucher aux règles d'ère.
  const route = fableRouteField(x, z);
  const onRoute = route.distance < 40;
  const road = onRoute ? route.altitude : fableRouteAltitude(z);
  const lateral = onRoute ? route.distance : Math.abs(x - fableFarPathX(z));

  if (z < 470) {
    // Montagne : un plateau largement ouvert, les versants ne se referment
    // qu'au loin. Le masterframe montre du ciel, pas un couloir.
    const flank = Math.max(0, lateral - (onRoute ? 1 : 17));
    const rise = Math.pow(flank, 1.24) * 0.1;
    const ridges = fbm(x, z) * Math.min(9, 1.2 + flank * 0.18);

    return road + rise + ridges;
  }

  if (z < 700) {
    // Banlieue : plat, à peine bombé, trottoirs et pelouses.
    const flank = Math.max(0, lateral - (onRoute ? 1 : 9));

    return road + flank * 0.035 + fbm(x, z) * 0.5;
  }

  // Littoral. Toute route y porte sa banquette : c'est la distance AU
  // RÉSEAU qui commande, jamais un décalage mesuré depuis l'épine — mélanger
  // les deux repères faisait éclater le terrain sur la descente à la pointe.
  // Banquette portée par la route…
  const shelf = road + Math.pow(Math.max(0, route.distance - 1.5), 1.2) * 0.24;
  // …et relief général de la côte, falaise vers la mer, colline vers la terre.
  const offset = x - fableFarPathX(z);
  const wild =
    offset > 9
      ? road - Math.pow(offset - 9, 1.3) * 0.5
      : road + Math.pow(Math.max(0, -offset - 8), 1.28) * 0.42;

  // Les deux se fondent : une marche franche entre eux fait éclater le
  // terrain en lames au bord de chaque route.
  const k = smoothstep(12, 34, route.distance);

  return lerp(shelf, wild, k) + fbm(x, z) * (0.5 + k * 0.7);
}

/** Tracé de la route au-delà de Birth Yard : lacets, cols, corniche. */
export function fableFarPathX(z: number): number {
  if (z <= 170) return 0;

  // Montagne : deux grands lacets puis un col.
  const mountain =
    smoothstep(170, 200, z) *
    (Math.sin((z - 170) * 0.026) * 26 + Math.sin((z - 170) * 0.011) * 14);
  const mountainFade = 1 - smoothstep(430, 480, z);
  // Banlieue : rues droites, légers décrochements.
  // Rues de lotissement : longues, presque droites, un très léger dévers.
  const suburb =
    smoothstep(470, 510, z) * (1 - smoothstep(660, 700, z)) *
    Math.sin(z * 0.021) * 7;
  // Corniche : longue courbe qui suit la baie.
  const coast = smoothstep(690, 740, z) * (Math.sin((z - 700) * 0.0135) * 34);

  return mountain * mountainFade + suburb + coast;
}

/** 0 = plein air, 1 = au fond du tunnel. Pilote l'exposition, le brouillard, le son. */
export function fableTunnelMix(z: number): number {
  return 1 - smoothstep(-10, -2.5, z);
}

/** 0 hors ville, 1 dans la rue. */
export function fableCityMix(z: number): number {
  return smoothstep(14, 42, z);
}

/**
 * Régie d'allure : à quelle fraction de la vitesse maximale le monde
 * emporte le véhicule, selon l'endroit. La gorge est lente et tactile, la
 * rue respire, la cour d'amarrage ralentit d'elle-même pour qu'on regarde.
 */
export function fableCruiseScale(z: number): number {
  const tunnel = fableTunnelMix(z);
  const yard = fableYardMix(z);
  const pinch = Math.exp(-((z - 62) * (z - 62)) / 120);
  const ledge = immersionBandLocal(z, -2, 4, 10, 20);

  return Math.max(
    0.22,
    0.86 - tunnel * 0.34 - yard * 0.3 - pinch * 0.16 - ledge * 0.22
  );
}

function immersionBandLocal(
  x: number,
  in0: number,
  in1: number,
  out0: number,
  out1: number
) {
  return smoothstep(in0, in1, x) * (1 - smoothstep(out0, out1, x));
}

/** Proximité de la cour d'amarrage (anomalie). */
export function fableYardMix(z: number): number {
  return smoothstep(FABLE_YARD_Z0 - 10, FABLE_YARD_Z0 + 6, z) *
    (1 - smoothstep(FABLE_YARD_Z1 - 6, FABLE_YARD_Z1 + 10, z));
}

/* ── Territoires : une seule ville, des quartiers reconnaissables ─────── */

/**
 * Birth Yard est un organisme continu, pas une suite d'arènes. Chaque track
 * occupe une part de la même ville et s'annonce par la MORPHOLOGIE — la rue
 * se pince ou s'ouvre, les immeubles montent ou s'écrasent, la foule enfle,
 * la matière change — jamais par une coupure de scène.
 *
 *   z 40 – 52   arrivée : la ville basse, encore lâche
 *   z 52 – 84   FOOLFOULE : le canyon commercial, vertical et pressé
 *   z 84 – 116  la cour d'amarrage : ça s'ouvre, ça respire, ça regarde
 *   z 112 – 152 A WALK IN ZEELAND : le port, l'eau, le ciel qui revient
 */
export type FableDistrict = {
  /** Multiplie la hauteur bâtie. */
  heightScale: number;
  /** Hauteur minimale imposée — c'est elle qui fait le canyon. */
  heightFloor: number;
  /** Recul des façades : petit = rue étroite et oppressante. */
  setback: number;
  /** Densité de foule relative. */
  crowd: number;
  /** Resserrement de la chaussée, en mètres retirés de la demi-largeur. */
  narrow: number;
};

export function fableDistrictAt(z: number): FableDistrict {
  // Le canyon monte et redescend progressivement : on y entre sans porte.
  const canyon = smoothstep(48, 58, z) * (1 - smoothstep(78, 88, z));
  const port = smoothstep(104, 116, z);

  return {
    heightScale: 1 + canyon * 1.5 - port * 0.28,
    heightFloor: 8 + canyon * 15,
    setback: 1.9 - canyon * 0.75 + port * 0.5,
    crowd: 1 + canyon * 2.4 - port * 0.35,
    narrow: canyon * 1.35,
  };
}

/** Bouches de vapeur — partagées entre la scène (sprites) et l'audio (sifflement localisé). */
export const FABLE_VENTS = [
  { x: 3.4, z: 57 },
  { x: -4.1, z: 79 },
  { x: 5.5, z: 95 },
  { x: -4.4, z: 121 },
  { x: 4.2, z: 138 },
];

export type FableLot = {
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  yaw: number;
  variant: number;
  tint: { r: number; g: number; b: number };
  side: -1 | 1;
};

export type FableWorldLayout = {
  lots: FableLot[];
  colliders: Drift3DVehicleCollider[];
};

const FACADE_VARIANTS = 5;

const TINTS = [
  { r: 0.82, g: 0.74, b: 0.62 },
  { r: 0.72, g: 0.64, b: 0.55 },
  { r: 0.66, g: 0.6, b: 0.58 },
  { r: 0.78, g: 0.68, b: 0.52 },
  { r: 0.6, g: 0.58, b: 0.52 },
  { r: 0.74, g: 0.62, b: 0.5 },
  { r: 0.57, g: 0.55, b: 0.56 },
  { r: 0.8, g: 0.72, b: 0.66 },
];

function isInCrossStreet(z: number) {
  return (z > 66 && z < 76) || (z > 124 && z < 134);
}

/** Deterministic building lots + physics colliders for the whole slice. */
export function buildFableWorldLayout(): FableWorldLayout {
  const rng = fableRng(20260803);
  const lots: FableLot[] = [];
  const colliders: Drift3DVehicleCollider[] = [];

  // Rangées le long de la rue principale, en respectant la largeur variable.
  for (const side of [-1, 1] as const) {
    let z = FABLE_CITY_Z0 + 3;

    while (z < FABLE_CITY_Z1 - 4) {
      const width = 5 + rng() * 4.5;
      const zc = z + width / 2;

      if (isInCrossStreet(zc - width / 2) || isInCrossStreet(zc + width / 2)) {
        z += width * 0.6;
        continue;
      }

      // Le quai remplace la rangée gauche : la ville s'ouvre sur l'eau.
      if (side === -1 && zc > FABLE_CANAL_Z0 + 2) {
        z += width * 0.7;
        continue;
      }

      // Parcelle de la vitrine : rien d'autre ne s'y construit.
      if (side === 1 && Math.abs(zc - FABLE_SHOWROOM_Z) < 7) {
        z += width * 0.7;
        continue;
      }

      const district = fableDistrictAt(zc);
      const half = fableStreetHalfWidth(zc);
      const depth = 6 + rng() * 6;
      const setback = district.setback + rng() * 0.4;
      const x = side * (half + setback + depth / 2);
      const height = Math.max(
        district.heightFloor,
        (8 + rng() * rng() * 19) * district.heightScale
      );
      const yaw = (rng() - 0.5) * 0.05;
      const variant = Math.floor(rng() * FACADE_VARIANTS);
      const tint = TINTS[Math.floor(rng() * TINTS.length)];

      lots.push({ x, z: zc, width: depth, depth: width, height, yaw, variant, tint, side });

      // Colliders : cercles le long de la façade côté rue.
      const faceX = side * (half + setback);
      const count = Math.max(1, Math.round(width / 3));

      for (let i = 0; i < count; i += 1) {
        const cz = z + (width * (i + 0.5)) / count;
        colliders.push({ x: faceX + side * 1.4, z: cz, radius: 1.7 });
      }

      z += width + 0.15 + rng() * 0.5;
    }
  }

  // Deuxième rangée (fond) : toits visibles au-dessus de la première.
  for (const side of [-1, 1] as const) {
    let z = FABLE_CITY_Z0 - 2;

    while (z < FABLE_CITY_Z1 + 6) {
      const width = 7 + rng() * 7;
      const zc = z + width / 2;

      if (side === -1 && zc > FABLE_CANAL_Z0 && zc < FABLE_CANAL_Z1) {
        z += width;
        continue;
      }

      const district = fableDistrictAt(zc);
      const half = fableStreetHalfWidth(zc);
      const depth = 8 + rng() * 8;
      const x = side * (half + 7 + rng() * 8 + depth / 2);
      const height = Math.max(
        district.heightFloor + 3,
        (11 + rng() * rng() * 26) * district.heightScale
      );

      lots.push({
        x,
        z: zc,
        width: depth,
        depth: width,
        height,
        yaw: (rng() - 0.5) * 0.08,
        variant: Math.floor(rng() * FACADE_VARIANTS),
        tint: TINTS[Math.floor(rng() * TINTS.length)],
        side,
      });
      z += width + rng() * 1.2;
    }
  }

  // Rues transversales : quelques bâtiments qui fuient dans la brume.
  for (const crossZ of [71, 129]) {
    for (const side of [-1, 1] as const) {
      // Côté bassin, la rue transversale n'existe pas : il y a l'eau.
      if (side === -1 && crossZ > FABLE_CANAL_Z0) continue;

      for (let i = 0; i < 4; i += 1) {
        const x = side * (9 + i * 9 + rng() * 3);
        const z = crossZ + (rng() - 0.5) * 1.5 + (i % 2 === 0 ? -6.5 : 6.5);
        const depth = 5 + rng() * 4;
        const height = 6 + rng() * rng() * 14;

        lots.push({
          x,
          z,
          width: 5 + rng() * 4,
          depth,
          height,
          yaw: (rng() - 0.5) * 0.06,
          variant: Math.floor(rng() * FACADE_VARIANTS),
          tint: TINTS[Math.floor(rng() * TINTS.length)],
          side,
        });
      }
    }
  }

  // Mur de fond de la ville (z max) : rangée serrée qui ferme la perspective.
  for (let x = -46; x < 48; x += 0) {
    const width = 6 + rng() * 6;
    const height = 10 + rng() * 20;

    lots.push({
      x: x + width / 2,
      z: FABLE_CITY_Z1 + 6 + rng() * 5,
      width,
      depth: 7 + rng() * 5,
      height,
      yaw: (rng() - 0.5) * 0.05,
      variant: Math.floor(rng() * FACADE_VARIANTS),
      tint: TINTS[Math.floor(rng() * TINTS.length)],
      side: 1,
    });
    x += width + 0.6;
  }

  // Jambages de la brèche : le percement est épais, on le longe sur ~11 m.
  for (let z = FABLE_PORTAL_Z - 6; z <= FABLE_PORTAL_Z + 5.5; z += 1.6) {
    colliders.push({ x: 2.55, z, radius: 0.62 });
    colliders.push({ x: -1.62, z, radius: 0.62 });
  }

  // Bord de quai : le bassin ne s'atteint pas en voiture.
  for (let z = FABLE_CANAL_Z0 + 2; z < FABLE_CANAL_Z1; z += 1.8) {
    if (Math.abs(z - FABLE_BRIDGE_Z) < 3.4) continue;

    colliders.push({ x: FABLE_QUAY_X + 0.35, z, radius: 0.85 });
  }

  colliders.push({ x: -7.3, z: FABLE_PORTAL_Z, radius: 2.4 });
  colliders.push({ x: 8.5, z: FABLE_PORTAL_Z, radius: 4.5 });
  colliders.push({ x: -12.5, z: FABLE_PORTAL_Z, radius: 4.5 });

  // Bloc d'amarrage au centre de la cour (anomalie).
  colliders.push({ x: 0, z: 102, radius: 2.6 });

  return { lots, colliders };
}

export { smoothstep as fableSmoothstep, lerp as fableLerp };

// Le réseau de routes existe dès le chargement : les branches doivent être
// connues avant le premier calcul de terrain comme avant le premier ruban.
registerFableWorldRoutes(fableFarPathX, fableRouteAltitude);
