import * as THREE from "three";
import { fableEraMixAt } from "@/components/drift-3d/fable/fablePeninsula";

/**
 * FABLE — topologie du monde complet.
 *
 * Une seule route continue, cinq ères qui choisissent chacune leur forme.
 * Le tronçon Entry → Birth Yard (z −60 → 160) est la TRANCHE DE RÉFÉRENCE :
 * elle reste détaillée, tout le reste est construit en blockout immersif.
 *
 *   Entry            z −60 →   0   gorge minérale, brèche en Λ
 *   Birth Yard       z   0 → 160   ville-port continue, quartiers distincts
 *   Older Shadows    z 160 → 470   montagne : vallée, forêt, plateau, col
 *   Vegetative Field z 470 → 700   lotissement pavillonnaire trempé, plat
 *   New Signal       z 700 → 1010  corniche littorale au couchant, océan
 *
 * Chaque ère lit son atmosphère ici ; personne n'impose sa forme aux autres.
 */

export type FableEraId =
  | "entry"
  | "birth-yard"
  | "older-shadows"
  | "vegetative-field"
  | "new-signal";

export type FableEra = {
  id: FableEraId;
  label: string;
  z0: number;
  z1: number;
  /** Couleurs du dôme et de la brume. */
  zenith: THREE.Color;
  horizon: THREE.Color;
  fog: THREE.Color;
  fogDensity: number;
  sunColor: THREE.Color;
  sunIntensity: number;
  /** Direction du soleil — chaque ère a son heure. */
  sunDir: THREE.Vector3;
  hemiSky: THREE.Color;
  hemiGround: THREE.Color;
  hemiIntensity: number;
  exposure: number;
};

export const FABLE_ERAS: FableEra[] = [
  {
    id: "entry",
    label: "Entry",
    z0: -60,
    z1: 0,
    zenith: new THREE.Color("#22374a"),
    horizon: new THREE.Color("#d9995a"),
    fog: new THREE.Color("#05060a"),
    fogDensity: 0.05,
    sunColor: new THREE.Color("#ffd9a0"),
    sunIntensity: 0.2,
    sunDir: new THREE.Vector3(-0.55, 0.34, 0.62).normalize(),
    hemiSky: new THREE.Color("#9a8c96"),
    hemiGround: new THREE.Color("#5c4a35"),
    hemiIntensity: 0.06,
    exposure: 1.9,
  },
  {
    id: "birth-yard",
    label: "Birth Yard",
    z0: 0,
    z1: 160,
    zenith: new THREE.Color("#22374a"),
    horizon: new THREE.Color("#d9995a"),
    fog: new THREE.Color("#7d7391"),
    // Portée longue : la baie fait ~300 m, l'ancienne densité saturait à
    // 165 m et écrasait la rive d'en face. La densité du port revient
    // localement par les coques de FableGroundHaze, pas par le brouillard.
    fogDensity: 0.0042,
    sunColor: new THREE.Color("#ffd9a0"),
    sunIntensity: 4.4,
    sunDir: new THREE.Vector3(-0.55, 0.34, 0.62).normalize(),
    hemiSky: new THREE.Color("#9a8c96"),
    hemiGround: new THREE.Color("#5c4a35"),
    hemiIntensity: 1.1,
    exposure: 1.34,
  },
  {
    // Plein jour d'altitude : bleu franc, neige, air mince et net.
    id: "older-shadows",
    label: "Older Shadows",
    z0: 160,
    z1: 470,
    zenith: new THREE.Color("#2f6ea8"),
    horizon: new THREE.Color("#cfe0ec"),
    fog: new THREE.Color("#b9cddc"),
    fogDensity: 0.0042,
    sunColor: new THREE.Color("#fff4de"),
    sunIntensity: 6.2,
    sunDir: new THREE.Vector3(0.42, 0.66, -0.3).normalize(),
    hemiSky: new THREE.Color("#a8c8e4"),
    hemiGround: new THREE.Color("#6b6552"),
    hemiIntensity: 1.5,
    exposure: 1.05,
  },
  {
    // Couvert de banlieue : gris plat, tout est mouillé, rien ne brille.
    id: "vegetative-field",
    label: "Vegetative Field",
    z0: 470,
    z1: 700,
    zenith: new THREE.Color("#8d949c"),
    horizon: new THREE.Color("#b4b8bc"),
    fog: new THREE.Color("#a9aeb4"),
    // Le bassin borde la baie à l'est : il doit voir l'autre rive.
    fogDensity: 0.0046,
    sunColor: new THREE.Color("#c9cdd2"),
    sunIntensity: 1.5,
    sunDir: new THREE.Vector3(-0.2, 0.8, -0.4).normalize(),
    hemiSky: new THREE.Color("#b6bcc2"),
    hemiGround: new THREE.Color("#5e6157"),
    hemiIntensity: 2.1,
    exposure: 1.18,
  },
  {
    // Couchant d'orage sur la mer : or bas, nuages lourds, sol trempé.
    id: "new-signal",
    label: "New Signal",
    z0: 700,
    z1: 1010,
    zenith: new THREE.Color("#4a5570"),
    horizon: new THREE.Color("#f0a45e"),
    fog: new THREE.Color("#9a8378"),
    // La corniche regarde Birth Yard à travers la baie.
    fogDensity: 0.004,
    sunColor: new THREE.Color("#ffcf87"),
    sunIntensity: 5.4,
    sunDir: new THREE.Vector3(0.72, 0.3, 0.68).normalize(),
    hemiSky: new THREE.Color("#8d94a4"),
    hemiGround: new THREE.Color("#5a5044"),
    hemiIntensity: 1.7,
    exposure: 1.22,
  },
];

/*
  Ici vivait `fableEraAt(z)`, qui rendait une ère à partir du seul z. Plus
  aucun appelant depuis le pliage, et pour cause : sur la péninsule, z=250
  tombe dans le massif à l'ouest et dans le bassin pavillonnaire à l'est.
  Elle est retirée plutôt que laissée en réserve — un classificateur d'ère
  faux mais disponible finit toujours par être rappelé. L'autorité est
  `fableEraBlendAt(x, z)`, et `fableRegionAt(x, z)` pour les régions.
*/

const ERA_BY_ID = Object.fromEntries(FABLE_ERAS.map((e) => [e.id, e])) as Record<
  FableEraId,
  FableEra
>;

/**
 * Fondu d'atmosphère en un point du plan. Sur la péninsule pliée, l'ère ne
 * se lit plus sur un intervalle de z : elle se lit sur les régions.
 */
export function fableEraBlendAt(
  x: number,
  z: number
): { from: FableEra; to: FableEra; t: number } {
  const mix = fableEraMixAt(x, z);

  return { from: ERA_BY_ID[mix.from], to: ERA_BY_ID[mix.to], t: mix.t };
}

/* ── Territoires de tracks ────────────────────────────────────────────── */

export type FableTrackTerritory = {
  slug: string;
  label: string;
  era: FableEraId;
  /** Centre du territoire sur la route. */
  z: number;
  /** Décalage latéral : le territoire n'est pas toujours sur l'axe. */
  x: number;
  radius: number;
};

/**
 * Les 27 tracks canoniques trouvent chacune une place réelle dans le monde.
 * À ce stade elles n'ont qu'un territoire, un accès et une silhouette — pas
 * encore leur événement.
 */
export const FABLE_TRACKS: FableTrackTerritory[] = [
  { slug: "entry", label: "ENTRY", era: "entry", z: -40, x: 0, radius: 16 },

  { slug: "play-it", label: "PLAY IT", era: "birth-yard", z: 50, x: -14, radius: 11 },
  { slug: "foolfoule", label: "FOOLFOULE", era: "birth-yard", z: 68, x: 0, radius: 16 },
  { slug: "jazzypling", label: "JAZZYPLING", era: "birth-yard", z: 84, x: 16, radius: 10 },
  { slug: "eux-gainent", label: "EUX GAINENT", era: "birth-yard", z: 121, x: 8, radius: 8 },
  { slug: "a-walk-in-zeeland", label: "A WALK IN ZEELAND", era: "birth-yard", z: 132, x: -20, radius: 22 },

  { slug: "rise", label: "RISE", era: "older-shadows", z: 244, x: 0, radius: 30 },
  { slug: "blossoming", label: "BLOSSOMING", era: "older-shadows", z: 302, x: -36, radius: 28 },
  { slug: "ethnic-stick", label: "ETHNIC STICK", era: "older-shadows", z: 356, x: 32, radius: 24 },
  { slug: "minuit-moins-cinq", label: "MINUIT MOINS CINQ", era: "older-shadows", z: 410, x: 0, radius: 20 },
  { slug: "perdue", label: "PERDUE", era: "older-shadows", z: 452, x: -26, radius: 22 },

  { slug: "morne-et", label: "MORNE, ET ?", era: "vegetative-field", z: 512, x: 24, radius: 20 },
  { slug: "daymason", label: "DAYMASON", era: "vegetative-field", z: 556, x: -26, radius: 18 },
  { slug: "chailk", label: "CHAILK", era: "vegetative-field", z: 600, x: 0, radius: 20 },
  { slug: "time", label: "TIME", era: "vegetative-field", z: 644, x: 26, radius: 18 },
  { slug: "tantitom", label: "TANTITOM", era: "vegetative-field", z: 682, x: -22, radius: 18 },

  { slug: "neektareum", label: "NEEKTAREUM", era: "new-signal", z: 730, x: -26, radius: 18 },
  { slug: "asitis", label: "ASITIS", era: "new-signal", z: 762, x: 20, radius: 16 },
  { slug: "relative", label: "RELATIVE", era: "new-signal", z: 792, x: -18, radius: 15 },
  { slug: "overthink", label: "OVERTHINK", era: "new-signal", z: 820, x: 22, radius: 15 },
  { slug: "hold-the-light", label: "HOLD THE LIGHT", era: "new-signal", z: 850, x: -24, radius: 16 },
  { slug: "midnight-work", label: "MIDNIGHT WORK", era: "new-signal", z: 878, x: 18, radius: 15 },
  { slug: "telatelaba", label: "TELATELABA", era: "new-signal", z: 906, x: -22, radius: 16 },
  { slug: "le-monde-s-endort", label: "LE MONDE S'ENDORT", era: "new-signal", z: 932, x: 24, radius: 16 },
  { slug: "renee", label: "RENEE", era: "new-signal", z: 956, x: -20, radius: 15 },
  { slug: "panthere", label: "PANTHERE", era: "new-signal", z: 978, x: 20, radius: 15 },
  { slug: "eteeaooete", label: "ÉTÉÉAOOÉTÉ", era: "new-signal", z: 1000, x: 0, radius: 24 },
];

export function fableNearestTrack(z: number, x: number): FableTrackTerritory | null {
  let best: FableTrackTerritory | null = null;
  let bestDistance = Infinity;

  for (const track of FABLE_TRACKS) {
    const distance = Math.hypot(track.z - z, track.x - x);

    if (distance < track.radius && distance < bestDistance) {
      best = track;
      bestDistance = distance;
    }
  }

  return best;
}
