/**
 * FABLE — la péninsule pliée.
 *
 * Le monde cesse d'être cinq intervalles de z consécutifs. Il devient un fer
 * à cheval réel en x/z, ouvert au sud, organisé autour d'un massif central
 * et d'une baie intérieure — exactement la forme du nord de la topologie.
 *
 *        z↑ (nord)
 *                     OLDER SHADOWS
 *                    massif, cols, crêtes
 *                  ╱                     ╲
 *        BIRTH YARD                        VEGETATIVE FIELD
 *        estuaire-port                     bassin pavillonnaire
 *            │            BAIE                     │
 *          ENTRY        intérieure                 ╱
 *                          ╲                      ╱
 *                            NEW SIGNAL ─────────
 *                         côte, caps, océan au sud
 *
 * La tranche de référence Entry → Birth Yard (z −60 → 160, x ≈ 0) ne bouge
 * pas d'un mètre : c'est autour d'elle que le reste se replie.
 */

import type { FableEraId } from "@/components/drift-3d/fable/fableTopology";

/** Fin de la tranche détaillée : au-delà, la péninsule prend la main. */
export const FABLE_HERO_Z_END = 170;
/**
 * Demi-largeur du couloir héroïque. La gorge, la rue et le bassin tiennent
 * dans ±60 ; au-delà c'est la péninsule, sinon la baie centrale hériterait
 * du sol plat du port.
 */
export const FABLE_HERO_HALF_WIDTH = 60;

/* ── L'épine dorsale pliée ────────────────────────────────────────────── */

/**
 * Polyligne [x, altitude, z]. Elle quitte Birth Yard vers le nord, contourne
 * le massif par l'est en montant au col, redescend dans le bassin
 * pavillonnaire, puis file au sud et revient vers l'ouest le long de la
 * côte. On ne peut plus l'écrire comme x = f(z) : elle se retourne.
 */
export const FABLE_SPINE: Array<[number, number, number]> = [
  // Sortie de la ville-port, vers le nord.
  [0, 0.4, 160],
  [6, 1.2, 182],
  [18, 3.5, 204],
  // Franges industrielles, carrière, premières pentes.
  [36, 8, 226],
  [62, 15, 248],
  [96, 25, 268],
  // Montée du massif par le flanc est.
  [134, 38, 288],
  [172, 52, 310],
  [206, 64, 336],
  // Le col.
  [232, 74, 366],
  [258, 78, 396],
  [288, 74, 418],
  // Bascule vers l'est, descente en forêt gérée.
  [326, 62, 428],
  [366, 48, 424],
  [402, 36, 406],
  [430, 27, 378],
  // Entrée du bassin pavillonnaire, rond-point.
  [448, 20, 344],
  [458, 15, 306],
  [462, 13, 266],
  [458, 13, 224],
  [448, 13, 184],
  [434, 14, 146],
  // Descente vers la côte.
  [418, 17, 106],
  [400, 20, 66],
  [378, 22, 26],
  // La corniche, cap à l'ouest, océan au sud.
  [350, 21, -14],
  [312, 19, -52],
  [266, 17, -84],
  [214, 15, -110],
  [158, 13, -130],
  [100, 11, -146],
  [40, 9, -158],
  [-20, 8, -166],
];

/* ── Régions ──────────────────────────────────────────────────────────── */

export type FableRegion = {
  id: string;
  era: FableEraId;
  /** Centre au sol. */
  x: number;
  z: number;
  /** Rayon d'influence : au-delà, une autre région domine. */
  radius: number;
  /** Altitude de référence du plancher régional. */
  baseY: number;
  /** Grammaire de relief. */
  relief: "gorge" | "port" | "massif" | "basin" | "coast" | "water";
  /** Soulèvement au cœur de la région, pour les reliefs de massif. */
  lift?: number;
};

export const FABLE_REGIONS: FableRegion[] = [
  { id: "entry", era: "entry", x: 0, z: -30, radius: 70, baseY: 5, relief: "gorge" },
  { id: "birth-yard", era: "birth-yard", x: 0, z: 80, radius: 120, baseY: 0.4, relief: "port" },
  { id: "os-approach", era: "older-shadows", x: 70, z: 240, radius: 90, baseY: 12, relief: "massif", lift: 22 },
  { id: "os-massif", era: "older-shadows", x: 210, z: 350, radius: 160, baseY: 38, relief: "massif", lift: 96 },
  { id: "vf-basin", era: "vegetative-field", x: 452, z: 250, radius: 150, baseY: 14, relief: "basin" },
  { id: "ns-coast", era: "new-signal", x: 300, z: -40, radius: 150, baseY: 19, relief: "coast" },
  { id: "ns-west", era: "new-signal", x: 60, z: -150, radius: 150, baseY: 10, relief: "coast" },
  // La baie intérieure : c'est elle qui fait la péninsule.
  // La baie tient entre le port, le massif et la côte — elle ne doit pas
  // atteindre le bassin pavillonnaire, qu'elle léchait à huit mètres de la rue.
  // Bordée au sud par la corniche et à l'ouest par le port : la baie tient
  // dans le creux du fer à cheval, elle ne recouvre aucune chaussée.
  { id: "central-bay", era: "new-signal", x: 258, z: 85, radius: 142, baseY: -4, relief: "water" },
];

export const FABLE_SEA_LEVEL = 0;

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));

  return t * t * (3 - 2 * t);
}

function hashNoise(x: number, z: number) {
  const v = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;

  return v - Math.floor(v);
}

/**
 * Bruit de valeur interpolé. La version quantifiée précédente sautait d'une
 * cellule à l'autre : sur un flanc de massif cela produisait des marches de
 * neuf mètres de large et huit de haut — des murs, pas du relief.
 */
function valueNoise(x: number, z: number) {
  const xi = Math.floor(x);
  const zi = Math.floor(z);
  const xf = x - xi;
  const zf = z - zi;
  const u = xf * xf * (3 - 2 * xf);
  const v = zf * zf * (3 - 2 * zf);
  const a = hashNoise(xi, zi);
  const b = hashNoise(xi + 1, zi);
  const c = hashNoise(xi, zi + 1);
  const d = hashNoise(xi + 1, zi + 1);

  return (a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v) - 0.5;
}

function fbm(x: number, z: number) {
  return (
    valueNoise(x * 0.02, z * 0.02) * 1.0 +
    valueNoise(x * 0.06 + 17, z * 0.06) * 0.45 +
    valueNoise(x * 0.15 + 91, z * 0.15) * 0.2
  );
}

/**
 * Poids d'une région en un point : 1 au centre, 0 au-delà du rayon. Les
 * poids se mélangent, ce qui donne des frontières géographiques molles au
 * lieu de coutures.
 */
function regionWeight(region: FableRegion, x: number, z: number) {
  const d = Math.hypot(x - region.x, z - region.z);

  return 1 - smoothstep(region.radius * 0.55, region.radius * 1.25, d);
}

/** Région dominante en un point — sert à l'ère, au streaming, au son. */
export function fableRegionAt(x: number, z: number): FableRegion {
  let best = FABLE_REGIONS[1];
  let bestWeight = -1;

  for (const region of FABLE_REGIONS) {
    const w = regionWeight(region, x, z);

    if (w > bestWeight) {
      bestWeight = w;
      best = region;
    }
  }

  return best;
}

/** Ère en un point du plan — remplace la lecture par intervalle de z. */
export function fablePeninsulaEraAt(x: number, z: number): FableEraId {
  return fableRegionAt(x, z).era;
}

/**
 * Distance signée à la baie : négative dedans. La baie creuse le terrain et
 * porte le plan d'eau ; c'est le vide central qui rend la péninsule lisible.
 */
export function fableBayField(x: number, z: number) {
  const bay = FABLE_REGIONS[FABLE_REGIONS.length - 1];
  // Ellipse plutôt que cercle : la baie s'ouvre vers le sud.
  const dx = (x - bay.x) / 1.0;
  const dz = (z - bay.z) / 1.35;
  const d = Math.hypot(dx, dz);

  return d - bay.radius;
}

/**
 * Relief régional hors route. Chaque grammaire produit sa propre montée ;
 * les poids de région les mélangent, si bien qu'un flanc de massif devient
 * un bassin sans marche.
 */
export function fablePeninsulaGroundY(x: number, z: number, routeDistance: number) {
  let totalWeight = 0;
  let height = 0;
  // Le relief s'apaise au bord des routes : sans cela le bruit dresse un
  // mur juste à côté de la chaussée.
  const calm = smoothstep(4, 40, routeDistance);

  for (const region of FABLE_REGIONS) {
    const w = regionWeight(region, x, z);

    if (w <= 0.001) continue;

    const d = Math.hypot(x - region.x, z - region.z);
    let local = region.baseY;

    switch (region.relief) {
      case "massif": {
        // Le massif se soulève vers son cœur : hauteur et horizon.
        const core = 1 - Math.min(1, d / region.radius);
        local =
          region.baseY +
          Math.pow(core, 1.7) * (region.lift ?? 90) +
          fbm(x, z) * (3 + core * 12) * calm;
        break;
      }
      case "basin": {
        // Bassin : plat, à peine bombé, drainé vers le centre.
        local = region.baseY + Math.min(6, d * 0.02) + fbm(x, z) * 0.8 * calm;
        break;
      }
      case "coast": {
        // Côte : plateau littoral qui s'incline vers le sud, océan au-delà.
        const seaward = smoothstep(-120, -260, z);
        local =
          region.baseY - seaward * 46 + Math.max(0, d - region.radius * 0.5) * 0.16 +
          fbm(x, z) * 2.4 * calm;
        break;
      }
      case "water": {
        local = region.baseY - 6;
        break;
      }
      case "port":
      case "gorge":
      default:
        local = region.baseY + fbm(x, z) * 0.4 * calm;
        break;
    }

    height += local * w;
    totalWeight += w;
  }

  if (totalWeight < 0.001) {
    // Hors de toute région : arrière-pays qui monte doucement.
    return 26 + fbm(x, z) * 6;
  }

  let ground = height / totalWeight;

  // La baie creuse tout ce qu'elle recouvre.
  const bay = fableBayField(x, z);

  if (bay < 30) {
    const submerge = 1 - smoothstep(-40, 30, bay);
    ground = ground * (1 - submerge) + (FABLE_SEA_LEVEL - 9) * submerge;
  }

  // …sauf sous une route : une chaussée ne passe jamais sous l'eau.
  if (routeDistance < 24) {
    const grip = 1 - smoothstep(2, 24, routeDistance);
    ground = Math.max(ground, FABLE_SEA_LEVEL + 1.2 * grip);
  }

  return ground;
}

/**
 * Mélange d'ères en un point : les deux régions les plus influentes et leur
 * proportion. C'est ce qui remplace la lecture par intervalle de z — sur la
 * péninsule pliée, deux ères peuvent se toucher n'importe où dans le plan.
 */
export function fableEraMixAt(x: number, z: number) {
  let first: FableRegion | null = null;
  let firstW = -1;
  let second: FableRegion | null = null;
  let secondW = -1;

  for (const region of FABLE_REGIONS) {
    const w = regionWeight(region, x, z);

    if (w > firstW) {
      second = first;
      secondW = firstW;
      first = region;
      firstW = w;
    } else if (w > secondW) {
      second = region;
      secondW = w;
    }
  }

  const dominant = first ?? FABLE_REGIONS[1];
  const other = second ?? dominant;

  if (other.era === dominant.era || secondW <= 0) {
    return { from: dominant.era, to: dominant.era, t: 0 };
  }

  // La couture est une frontière géographique, pas une coupure : la
  // proportion suit la distance relative aux deux centres.
  const total = firstW + secondW;

  return {
    from: dominant.era,
    to: other.era,
    t: Math.min(0.5, total > 0 ? secondW / total : 0),
  };
}

/** Distance au centre d'une région — sert au streaming par voisinage. */
export function fableRegionDistance(region: FableRegion, x: number, z: number) {
  return Math.hypot(x - region.x, z - region.z);
}
