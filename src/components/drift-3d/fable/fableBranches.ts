import {
  registerFableRoute,
  sampleSpine,
} from "@/components/drift-3d/fable/fableRoutes";

/**
 * FABLE — les détours qui donnent son échelle au monde.
 *
 * Un par ère, chacun selon l'identité spatiale de son ère : la montagne
 * grimpe en lacets vers un belvédère, la banlieue tourne en rond sans qu'on
 * s'en aperçoive, le littoral descend vers une pointe. Ils quittent l'épine
 * dorsale et y reviennent — jamais des scènes séparées.
 *
 * Règle apprise à la dure : un détour n'est JAMAIS écrit en coordonnées
 * absolues. L'épine dérive latéralement (jusqu'à x≈31 en montagne), donc
 * chaque branche est ancrée sur le tracé réel au z de son embranchement.
 * Sinon elle démarre dans le vide et ne rejoint rien.
 */

export const FABLE_BELVEDERE_ROUTE: Array<[number, number, number]> = [];
export const FABLE_SUBURB_LOOP: Array<[number, number, number]> = [];
export const FABLE_HEADLAND_ROUTE: Array<[number, number, number]> = [];

let registered = false;

export function registerFableWorldRoutes(
  spinePathX: (z: number) => number,
  spineAltitude: (z: number) => number
) {
  if (registered) return;

  registered = true;

  registerFableRoute({
    id: "spine",
    kind: "spine",
    points: sampleSpine(168, 1010, 6, spinePathX, spineAltitude),
    halfWidth: 5,
  });

  /* ── OLDER SHADOWS — la montée au belvédère ─────────────────────────── */

  /**
   * Elle se détache du plateau, grimpe trois lacets serrés et s'arrête net
   * au bord. On y monte pour voir, pas pour passer ; le retour est le même
   * chemin, dans l'autre sens et avec le vide devant.
   */
  {
    const branchZ = 258;
    const ax = spinePathX(branchZ);
    const ay = spineAltitude(branchZ);
    // Décalages relatifs à l'embranchement : lacets vers l'intérieur du
    // massif, puis retour vers le bord du plateau.
    const legs: Array<[number, number, number]> = [
      [0, 0, 0],
      [-16, 3.5, 9],
      [-30, 8, 20],
      [-16, 13, 31],
      [2, 18, 39],
      [-12, 23, 49],
      [-30, 28, 58],
      [-44, 32, 66],
      [-52, 35, 76],
    ];

    for (const [dx, dy, dz] of legs) {
      FABLE_BELVEDERE_ROUTE.push([ax + dx, ay + dy, branchZ + dz]);
    }

    registerFableRoute({
      id: "belvedere",
      kind: "branch",
      points: FABLE_BELVEDERE_ROUTE,
      halfWidth: 3.6,
    });
  }

  /* ── VEGETATIVE FIELD — la boucle qui ne se voit pas ────────────────── */

  /**
   * Une desserte résidentielle qui repart de la rue principale, tourne, et
   * y revient quarante mètres plus loin. Les maisons y sont les mêmes ;
   * c'est précisément ce qui rend le retour ambigu.
   */
  {
    const inZ = 566;
    const outZ = 614;
    const altitude = spineAltitude(inZ);
    const inX = spinePathX(inZ);
    const outX = spinePathX(outZ);
    const cx = inX - 30;
    const cz = (inZ + outZ) / 2;
    const rx = 24;
    const rz = 26;

    FABLE_SUBURB_LOOP.push([inX, altitude, inZ]);
    FABLE_SUBURB_LOOP.push([inX - 7, altitude, inZ + 2]);

    for (let i = 0; i <= 24; i += 1) {
      const a = -Math.PI / 2 + (i / 24) * Math.PI * 2;
      FABLE_SUBURB_LOOP.push([
        cx + Math.cos(a) * rx,
        altitude,
        cz + Math.sin(a) * rz,
      ]);
    }

    FABLE_SUBURB_LOOP.push([outX - 7, altitude, outZ - 2]);
    FABLE_SUBURB_LOOP.push([outX, altitude, outZ]);

    registerFableRoute({
      id: "suburb-loop",
      kind: "loop",
      points: FABLE_SUBURB_LOOP,
      halfWidth: 4.4,
    });
  }

  /* ── NEW SIGNAL — la descente à la pointe ───────────────────────────── */

  /**
   * Un embranchement qui quitte la corniche et descend vers une pointe
   * rocheuse au ras de l'eau. On perd la vue d'ensemble en descendant, on
   * la retrouve autrement en bas : la mer passe au-dessus de la ligne d'œil.
   */
  {
    const branchZ = 856;
    const ax = spinePathX(branchZ);
    const ay = spineAltitude(branchZ);
    const legs: Array<[number, number, number]> = [
      [0, 0, 0],
      [12, -3.5, 8],
      [24, -7.5, 18],
      [34, -11.5, 30],
      [40, -14.5, 42],
      [42, -16.5, 54],
      [38, -17.5, 64],
      [28, -18, 72],
    ];

    for (const [dx, dy, dz] of legs) {
      FABLE_HEADLAND_ROUTE.push([ax + dx, ay + dy, branchZ + dz]);
    }

    registerFableRoute({
      id: "headland",
      kind: "branch",
      points: FABLE_HEADLAND_ROUTE,
      halfWidth: 3.8,
    });
  }
}

/** Point d'arrivée de chaque détour — sert au repérage et aux captures. */
export function fableBranchEnds() {
  return {
    belvedere: FABLE_BELVEDERE_ROUTE[FABLE_BELVEDERE_ROUTE.length - 1],
    headland: FABLE_HEADLAND_ROUTE[FABLE_HEADLAND_ROUTE.length - 1],
  };
}
