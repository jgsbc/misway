import type { Metadata } from "next";
import FableMapRoom from "@/components/drift-3d/fable/FableMapRoom";

/**
 * FABLE — salle des cartes, route de développement uniquement.
 *
 * Elle ne monte aucune scène 3D : tout est échantillonné depuis les modules
 * de topologie que `/drift-greybox-lab` utilise réellement. Ni indexée, ni
 * liée depuis la navigation publique, ni production Drift.
 */
export const metadata: Metadata = {
  title: "Drift — salle des cartes Fable (interne)",
  description:
    "État cartographique généré depuis la topologie runtime du lab. Outil de développement, pas une carte de jeu.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DriftGreyboxMapPage() {
  return <FableMapRoom />;
}
