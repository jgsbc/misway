import {
  registerFableRoute,
} from "@/components/drift-3d/fable/fableRoutes";
import { FABLE_SPINE } from "@/components/drift-3d/fable/fablePeninsula";

/**
 * FABLE — les détours qui donnent son échelle à la péninsule.
 *
 * Chacun s'ancre sur un point réel de l'épine pliée, jamais sur des
 * coordonnées absolues : l'épine se retourne dans le plan, écrire un détour
 * « à x tant » le laisserait pendre dans le vide.
 */

export const FABLE_BELVEDERE_ROUTE: Array<[number, number, number]> = [];
export const FABLE_SUBURB_LOOP: Array<[number, number, number]> = [];
export const FABLE_HEADLAND_ROUTE: Array<[number, number, number]> = [];

let registered = false;

/** Direction unitaire de l'épine au nœud donné, dans le plan. */
function spineHeading(index: number): [number, number] {
  const a = FABLE_SPINE[Math.max(0, index - 1)];
  const b = FABLE_SPINE[Math.min(FABLE_SPINE.length - 1, index + 1)];
  const dx = b[0] - a[0];
  const dz = b[2] - a[2];
  const length = Math.hypot(dx, dz) || 1;

  return [dx / length, dz / length];
}

/**
 * Construit un détour à partir de décalages exprimés dans le repère local
 * de l'épine : `forward` le long de la route, `side` perpendiculairement,
 * `rise` en altitude. Le détour suit donc toujours le pli du monde.
 */
function branchFromSpine(
  index: number,
  legs: Array<{ forward: number; side: number; rise: number }>
): Array<[number, number, number]> {
  const [ox, oy, oz] = FABLE_SPINE[index];
  const [fx, fz] = spineHeading(index);
  // Perpendiculaire à droite du sens de marche.
  const sx = fz;
  const sz = -fx;

  return legs.map(({ forward, side, rise }) => [
    ox + fx * forward + sx * side,
    oy + rise,
    oz + fz * forward + sz * side,
  ]);
}

export function registerFableWorldRoutes() {
  if (registered) return;

  registered = true;

  registerFableRoute({
    id: "spine",
    kind: "spine",
    points: FABLE_SPINE,
    halfWidth: 5,
  });

  /* ── OLDER SHADOWS — la montée au belvédère ─────────────────────────── */

  /**
   * Trois lacets qui quittent le flanc du massif et s'arrêtent net au bord.
   * On y monte pour voir : de là-haut le col, la baie et, par temps clair,
   * les grues de Birth Yard tiennent dans le même regard.
   */
  FABLE_BELVEDERE_ROUTE.push(
    ...branchFromSpine(8, [
      // Le lacet s'écarte d'un seul côté et ne revient jamais croiser
      // l'épine : deux chaussées à quinze mètres d'écart vertical se
      // traversaient au col.
      { forward: 0, side: 0, rise: 0 },
      { forward: 12, side: -16, rise: 5 },
      { forward: 30, side: -26, rise: 11 },
      { forward: 40, side: -46, rise: 17 },
      { forward: 34, side: -68, rise: 23 },
      { forward: 46, side: -88, rise: 29 },
      { forward: 66, side: -102, rise: 34 },
      { forward: 88, side: -110, rise: 38 },
      { forward: 104, side: -114, rise: 41 },
    ])
  );
  registerFableRoute({
    id: "belvedere",
    kind: "branch",
    points: FABLE_BELVEDERE_ROUTE,
    halfWidth: 3.6,
  });

  /* ── VEGETATIVE FIELD — la boucle qui ne se voit pas ────────────────── */

  /**
   * Une desserte qui repart de la rue, tourne, et y revient plus loin.
   * Les maisons y sont les mêmes ; c'est ce qui rend le retour ambigu.
   */
  {
    const inIndex = 19;
    const [ix, iy, iz] = FABLE_SPINE[inIndex];
    const [fx, fz] = spineHeading(inIndex);
    const sx = fz;
    const sz = -fx;
    const cx = ix + sx * 46;
    const cz = iz + sz * 46;
    const rx = 34;
    const rz = 30;

    FABLE_SUBURB_LOOP.push([ix, iy, iz]);
    FABLE_SUBURB_LOOP.push([ix + sx * 10, iy, iz + sz * 10]);

    for (let i = 0; i <= 26; i += 1) {
      const a = Math.PI + (i / 26) * Math.PI * 2;
      FABLE_SUBURB_LOOP.push([
        cx + Math.cos(a) * rx,
        iy,
        cz + Math.sin(a) * rz,
      ]);
    }

    FABLE_SUBURB_LOOP.push([
      ix + fx * 44 + sx * 10,
      iy,
      iz + fz * 44 + sz * 10,
    ]);
    FABLE_SUBURB_LOOP.push([ix + fx * 44, iy, iz + fz * 44]);

    registerFableRoute({
      id: "suburb-loop",
      kind: "loop",
      points: FABLE_SUBURB_LOOP,
      halfWidth: 4.4,
    });
  }

  /* ── NEW SIGNAL — la descente au cap ────────────────────────────────── */

  /**
   * Elle quitte la corniche et descend vers un cap au ras de l'eau. On perd
   * la vue d'ensemble en descendant ; en bas, la mer passe au-dessus de la
   * ligne d'œil et la baie se referme dans le dos.
   */
  FABLE_HEADLAND_ROUTE.push(
    ...branchFromSpine(28, [
      { forward: 0, side: 0, rise: 0 },
      { forward: 10, side: 14, rise: -3 },
      { forward: 22, side: 28, rise: -6.5 },
      { forward: 36, side: 40, rise: -9.5 },
      { forward: 52, side: 48, rise: -11.5 },
      { forward: 68, side: 52, rise: -13 },
      { forward: 82, side: 48, rise: -13.8 },
      { forward: 92, side: 38, rise: -14.2 },
    ])
  );
  registerFableRoute({
    id: "headland",
    kind: "branch",
    points: FABLE_HEADLAND_ROUTE,
    halfWidth: 3.8,
  });
}
