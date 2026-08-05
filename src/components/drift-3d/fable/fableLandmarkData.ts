import { FABLE_REGIONS } from "@/components/drift-3d/fable/fablePeninsula";

/**
 * FABLE — définition des amers lointains.
 *
 * Extraits du composant qui les dessine pour qu'une seule source décrive
 * où ils sont, à quelle hauteur et jusqu'où ils doivent porter. La carte et
 * la scène lisent la même table ; sinon la carte mentirait.
 */

export type FableLandmark = {
  id: string;
  label: string;
  x: number;
  z: number;
  /** Hauteur du sommet visible au-dessus du sol local. */
  height: number;
  /** En deçà de cette distance, la région détaillée prend le relais. */
  hideWithin: number;
};

const BY = FABLE_REGIONS[1];
const MASSIF = FABLE_REGIONS[3];
const BASIN = FABLE_REGIONS[4];

export const FABLE_LANDMARKS: FableLandmark[] = [
  {
    id: "port",
    label: "Grues et halo du port",
    x: BY.x,
    z: BY.z + 40,
    height: 64,
    hideWithin: 210,
  },
  {
    id: "massif",
    label: "Couronne du massif",
    x: MASSIF.x,
    z: MASSIF.z,
    height: 220,
    hideWithin: 280,
  },
  {
    id: "suburb",
    label: "Nappe de toits pavillonnaires",
    x: BASIN.x,
    z: BASIN.z,
    height: 10,
    hideWithin: 250,
  },
  {
    id: "cape",
    label: "Phare du cap sud",
    x: 92,
    z: -196,
    height: 36,
    hideWithin: 120,
  },
];

/** Relations de vue voulues entre les ères — ce qui doit se voir de où. */
export type FableSightlineIntent = {
  id: string;
  observerLabel: string;
  observer: { x: number; z: number };
  landmarkId: string;
  /** L'atmosphère doit-elle laisser passer la vue à cette distance ? */
  intendedVisible: boolean;
};

export const FABLE_SIGHTLINES: FableSightlineIntent[] = [
  {
    id: "col-sees-port",
    observerLabel: "Col d'Older Shadows",
    observer: { x: 258, z: 396 },
    landmarkId: "port",
    intendedVisible: true,
  },
  {
    id: "belvedere-sees-port",
    observerLabel: "Belvédère",
    observer: { x: 150, z: 380 },
    landmarkId: "port",
    intendedVisible: true,
  },
  {
    id: "suburb-sees-massif",
    observerLabel: "Bassin pavillonnaire",
    observer: { x: 458, z: 266 },
    landmarkId: "massif",
    intendedVisible: true,
  },
  {
    id: "coast-sees-suburb",
    observerLabel: "Corniche est",
    observer: { x: 400, z: 66 },
    landmarkId: "suburb",
    intendedVisible: true,
  },
  {
    id: "coast-sees-port",
    observerLabel: "Corniche, à travers la baie",
    observer: { x: 266, z: -84 },
    landmarkId: "port",
    intendedVisible: true,
  },
  {
    id: "massif-sees-cape",
    observerLabel: "Massif",
    observer: { x: 232, z: 366 },
    landmarkId: "cape",
    intendedVisible: true,
  },
];
