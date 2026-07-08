import {
  drift3dThresholdNode,
  drift3dTrackNodeBySlug,
} from "@/lib/drift3dTopology";
import type { Drift3DVehicleCollider } from "@/lib/drift3dVehiclePhysics";

/**
 * DRIFT-3D-19 — figurative scene extrusion (realism bible).
 *
 * Every landmark is a lived real-world scene anchored to a topology node:
 * brick canal houses, a glass tower canyon, snowed peaks, an earth village,
 * a lantern keeper in the storm. Primitives carry procedural material kinds
 * (rendered by drift3dTextureFactory) so no surface is a flat untextured
 * color. Gameplay rules are inherited from the superseded blueprint docs:
 * corridors stay open, node centers stay clear, and any piece taller than
 * ~1.6 units stays north of travel lanes or >2.5 units off the camera axis
 * (fourth-wall rule for the fixed north-looking oblique camera).
 * Primitives marked `solid` become circle colliders for the arcade physics.
 */

export type Drift3DMaterialKind =
  | "brick"
  | "concrete"
  | "granite"
  | "rock"
  | "plaster"
  | "wood"
  | "windowsDay"
  | "windowsNight"
  | "sand"
  | "thatch";

export type Drift3DLandmarkPrimitiveKind =
  | "box"
  | "cylinder"
  | "cone"
  | "sphere";

export type Drift3DLandmarkPrimitive = {
  kind: Drift3DLandmarkPrimitiveKind;
  /** x/z relative to the landmark origin; y is base lift above the floor. */
  offset: [number, number, number];
  /** box: [w, h, d] — cylinder: [rTop, rBottom, h] — cone: [r, h, radialSegments?] — sphere: [r] */
  args: number[];
  color: string;
  material?: Drift3DMaterialKind;
  textureRepeat?: [number, number];
  rotation?: [number, number, number];
  emissive?: string;
  emissiveIntensity?: number;
  roughness?: number;
  opacity?: number;
  solid?: boolean;
  solidRadius?: number;
  /** Rendered as a real planar reflector (canal water). Box args: [w, h, d]. */
  water?: boolean;
  /** Exempt from the camera occlusion fade (signature pieces like the λ). */
  noFade?: boolean;
  /**
   * Diegetic light source attached to this primitive (lantern, window,
   * cellar glow, fire). Realism bible rule: every emissive surface must be
   * paired with a believable source — no decorative glow.
   */
  pointLight?: {
    color: string;
    intensity: number;
    distance: number;
    y: number;
  };
};

export type Drift3DLandmark = {
  id: string;
  origin: { x: number; z: number };
  primitives: Drift3DLandmarkPrimitive[];
};

function nodeOrigin(slug: keyof typeof drift3dTrackNodeBySlug) {
  const node = drift3dTrackNodeBySlug[slug];

  return { x: node.position.x, z: node.position.z };
}

const entryOrigin = {
  x: drift3dThresholdNode.position.x,
  z: drift3dThresholdNode.position.z,
};

export const drift3dLandmarks: Drift3DLandmark[] = [
  // ─── Entrée — la grotte au λ sculpté ────────────────────────────────────
  {
    id: "entry-lambda-cave",
    origin: entryOrigin,
    primitives: [
      // masse rocheuse nord (haute — jamais côté caméra)
      {
        kind: "box",
        offset: [-7.5, 0, -4.8],
        args: [7, 5, 5],
        color: "#6b6660",
        material: "rock",
        textureRepeat: [3, 2],
        roughness: 0.97,
        solid: true,
      },
      // fond de grotte ouest
      {
        kind: "cone",
        offset: [-11, 0, 0],
        args: [3.6, 6],
        color: "#75706a",
        material: "rock",
        textureRepeat: [2, 2],
        roughness: 0.97,
        solid: true,
      },
      // jambes du λ, taillées dans la roche, penchées l'une vers l'autre
      {
        kind: "box",
        offset: [-4.2, 0, -1.9],
        args: [0.9, 4.6, 0.7],
        color: "#a8a4a0",
        material: "rock",
        textureRepeat: [1, 3],
        rotation: [0.42, 0, 0],
        roughness: 0.95,
        solid: true,
        solidRadius: 0.8,
        noFade: true,
      },
      {
        kind: "box",
        offset: [-4.2, 0, 1.9],
        args: [0.9, 4.6, 0.7],
        color: "#a8a4a0",
        material: "rock",
        textureRepeat: [1, 3],
        rotation: [-0.42, 0, 0],
        roughness: 0.95,
        solid: true,
        solidRadius: 0.8,
        noFade: true,
      },
      // contre-jour d'aube visible à travers l'ouverture
      {
        kind: "box",
        offset: [-6.6, 0.2, 0],
        args: [0.2, 3.8, 3],
        color: "#cfe3ee",
        emissive: "#cfe3ee",
        emissiveIntensity: 0.4,
        roughness: 0.4,
      },
      // lèvre rocheuse sud, volontairement basse (quatrième mur caméra)
      {
        kind: "box",
        offset: [-7.5, 0, 5.3],
        args: [5, 0.8, 2.2],
        color: "#75706a",
        material: "rock",
        textureRepeat: [2, 1],
        roughness: 0.97,
        solid: true,
      },
      // pénombre du sol de la grotte
      {
        kind: "box",
        offset: [-6, 0, 0.5],
        args: [10, 0.03, 9],
        color: "#211d2b",
        roughness: 0.98,
        opacity: 0.85,
      },
      // éboulis à la bouche
      {
        kind: "cone",
        offset: [-3, 0, -3.4],
        args: [0.5, 0.6],
        color: "#98948e",
        material: "rock",
        roughness: 0.96,
        solid: true,
      },
    ],
  },

  // ─── Birth Yard ─────────────────────────────────────────────────────────
  {
    // canaux hollandais au coucher du soleil : eau, quai, maisons de brique
    id: "birth-zeeland-canal",
    origin: nodeOrigin("a-walk-in-zeeland"),
    primitives: [
      // l'eau vit au fond de la tranchée creusée par le terrain (h -1.1),
      // légèrement au-dessus du lit du canal
      {
        kind: "box",
        offset: [-4, 0.25, -2],
        args: [6.6, 0.05, 1.5],
        color: "#33586e",
        roughness: 0.08,
        water: true,
      },
      {
        kind: "box",
        offset: [-4, 0.25, 2.6],
        args: [6.6, 0.05, 1.5],
        color: "#33586e",
        roughness: 0.08,
        water: true,
      },
      {
        kind: "box",
        offset: [-4, 0, 0.3],
        args: [6.6, 0.12, 1.2],
        color: "#b8b2a6",
        material: "concrete",
        textureRepeat: [4, 1],
        roughness: 0.92,
      },
      // maisons étroites en brique, pignons sur le canal
      {
        kind: "box",
        offset: [-8.6, 0, -2.4],
        args: [1.4, 2.6, 1.3],
        color: "#ffffff",
        material: "brick",
        textureRepeat: [1, 1],
        roughness: 0.9,
        solid: true,
      },
      {
        kind: "cone",
        offset: [-8.6, 2.6, -2.4],
        args: [1.15, 1.1, 4],
        color: "#6e4438",
        roughness: 0.88,
      },
      {
        kind: "box",
        offset: [-8.6, 0, 0.2],
        args: [1.4, 3, 1.3],
        color: "#ffffff",
        material: "brick",
        textureRepeat: [1, 1],
        roughness: 0.9,
        solid: true,
      },
      {
        kind: "cone",
        offset: [-8.6, 3, 0.2],
        args: [1.15, 1.2, 4],
        color: "#5e3a30",
        roughness: 0.88,
      },
      {
        kind: "box",
        offset: [-8.6, 0, 2.8],
        args: [1.4, 2.4, 1.3],
        color: "#ffffff",
        material: "brick",
        textureRepeat: [1, 1],
        roughness: 0.9,
        solid: true,
      },
      {
        kind: "cone",
        offset: [-8.6, 2.4, 2.8],
        args: [1.15, 1, 4],
        color: "#77473b",
        roughness: 0.88,
      },
      // pont de bois sur le canal sud — le tablier remonte au niveau du quai
      {
        kind: "box",
        offset: [-4.4, 1.12, 2.6],
        args: [1.9, 0.18, 1.1],
        color: "#ffffff",
        material: "wood",
        textureRepeat: [2, 1],
        roughness: 0.85,
        solid: true,
        solidRadius: 1,
      },
      {
        kind: "box",
        offset: [-4.4, 1.3, 2.12],
        args: [1.9, 0.3, 0.06],
        color: "#5a432e",
        material: "wood",
        roughness: 0.85,
      },
      {
        kind: "box",
        offset: [-4.4, 1.3, 3.08],
        args: [1.9, 0.3, 0.06],
        color: "#5a432e",
        material: "wood",
        roughness: 0.85,
      },
      // bollards de quai
      {
        kind: "cylinder",
        offset: [-1.6, 0, 0],
        args: [0.07, 0.08, 0.4],
        color: "#3c3f44",
        roughness: 0.7,
        solid: true,
        solidRadius: 0.14,
      },
      {
        kind: "cylinder",
        offset: [-2.8, 0, 0.6],
        args: [0.07, 0.08, 0.4],
        color: "#3c3f44",
        roughness: 0.7,
        solid: true,
        solidRadius: 0.14,
      },
    ],
  },
  {
    // canyon de tours verre/granit à l'heure de pointe
    id: "birth-foolfoule-canyon",
    origin: nodeOrigin("foolfoule"),
    primitives: [
      {
        kind: "box",
        offset: [-3.8, 0, -1.6],
        args: [1.9, 6, 1.9],
        color: "#ffffff",
        material: "windowsDay",
        textureRepeat: [1, 2],
        rotation: [0, 0.2, 0],
        roughness: 0.55,
        solid: true,
      },
      {
        kind: "box",
        offset: [-5.3, 0, 1],
        args: [1.6, 4.6, 1.6],
        color: "#ffffff",
        material: "granite",
        textureRepeat: [2, 3],
        rotation: [0, -0.12, 0],
        roughness: 0.8,
        solid: true,
      },
      {
        kind: "box",
        offset: [3.5, 0, -2],
        args: [1.8, 5.2, 1.6],
        color: "#ffffff",
        material: "windowsDay",
        textureRepeat: [1, 2],
        rotation: [0, 0.3, 0],
        roughness: 0.55,
        solid: true,
      },
      {
        kind: "box",
        offset: [4.9, 0, 0.7],
        args: [1.5, 4, 1.5],
        color: "#ffffff",
        material: "concrete",
        textureRepeat: [2, 3],
        roughness: 0.85,
        solid: true,
      },
    ],
  },
  {
    // ruelle de jazz la nuit : murs de brique, cave chaude, néon fatigué
    id: "birth-jazzypling-alley",
    origin: nodeOrigin("jazzypling"),
    primitives: [
      {
        kind: "box",
        offset: [-2.8, 0, -2.6],
        args: [4, 2.8, 0.5],
        color: "#8a7f78",
        material: "brick",
        textureRepeat: [3, 2],
        rotation: [0, 0.3, 0],
        roughness: 0.92,
        solid: true,
      },
      {
        kind: "box",
        offset: [-1, 0, -4.5],
        args: [3.4, 2.4, 0.5],
        color: "#7d726c",
        material: "brick",
        textureRepeat: [3, 2],
        rotation: [0, -0.2, 0],
        roughness: 0.92,
        solid: true,
      },
      // descente de cave et lumière tungstène qui s'en échappe
      {
        kind: "box",
        offset: [-2.2, 0, -3.3],
        args: [0.9, 0.5, 0.9],
        color: "#a5a09a",
        material: "concrete",
        roughness: 0.9,
      },
      {
        kind: "box",
        offset: [-2.2, 0.1, -2.82],
        args: [0.5, 0.6, 0.05],
        color: "#f2b04a",
        emissive: "#e8a34a",
        emissiveIntensity: 0.7,
        roughness: 0.5,
        pointLight: { color: "#e8a34a", intensity: 2, distance: 6, y: 0.6 },
      },
      // enseigne néon qui grésille
      {
        kind: "box",
        offset: [-2.9, 1.7, -2.35],
        args: [0.7, 0.26, 0.08],
        color: "#b03838",
        emissive: "#d94b4b",
        emissiveIntensity: 0.55,
        roughness: 0.6,
        pointLight: { color: "#d94b4b", intensity: 0.9, distance: 3.5, y: 1.8 },
      },
      // pavés mouillés réfléchissants
      {
        kind: "box",
        offset: [-1.6, 0, -1.4],
        args: [3.5, 0.02, 2],
        color: "#3a3f45",
        roughness: 0.15,
        opacity: 0.85,
      },
    ],
  },
  {
    // quartier d'affaires au petit matin : blocs de bureaux, métro, horloge
    id: "birth-play-it-district",
    origin: nodeOrigin("play-it"),
    primitives: [
      {
        kind: "box",
        offset: [3.6, 0, -2.6],
        args: [2.6, 4.4, 1.8],
        color: "#ffffff",
        material: "windowsDay",
        textureRepeat: [1, 2],
        roughness: 0.6,
        solid: true,
      },
      {
        kind: "box",
        offset: [5.6, 0, -0.2],
        args: [2, 3.2, 1.4],
        color: "#ffffff",
        material: "concrete",
        textureRepeat: [2, 2],
        roughness: 0.85,
        solid: true,
      },
      // bouche de métro
      {
        kind: "box",
        offset: [2.6, 0, 1.8],
        args: [1.2, 0.9, 1],
        color: "#9c988f",
        material: "concrete",
        roughness: 0.9,
        solid: true,
        solidRadius: 0.7,
      },
      {
        kind: "box",
        offset: [2.6, 0.9, 1.8],
        args: [1.4, 0.1, 1.2],
        color: "#2e4438",
        roughness: 0.7,
      },
      // horloge de rue
      {
        kind: "cylinder",
        offset: [4.3, 0, 1.4],
        args: [0.05, 0.06, 1.7],
        color: "#2f3238",
        roughness: 0.7,
        solid: true,
        solidRadius: 0.15,
      },
      {
        kind: "cylinder",
        offset: [4.3, 1.7, 1.4],
        args: [0.32, 0.32, 0.07],
        color: "#e8e4da",
        material: "plaster",
        rotation: [0, 0, Math.PI / 2],
        roughness: 0.6,
      },
    ],
  },

  // ─── Older Shadows ──────────────────────────────────────────────────────
  {
    // massif enneigé, refuge, cairn — l'ascension de rise
    id: "shadows-rise-massif",
    origin: nodeOrigin("rise"),
    primitives: [
      {
        kind: "cone",
        offset: [-4.6, 0, -3.4],
        args: [3.6, 9],
        color: "#ffffff",
        material: "rock",
        textureRepeat: [3, 3],
        roughness: 0.96,
        solid: true,
      },
      {
        kind: "cone",
        offset: [-4.6, 6.4, -3.4],
        args: [1.15, 2.4],
        color: "#eef2f5",
        roughness: 0.6,
      },
      {
        kind: "cone",
        offset: [-1, 0, -5.2],
        args: [2.6, 6.6],
        color: "#ffffff",
        material: "rock",
        textureRepeat: [2, 2],
        roughness: 0.96,
        solid: true,
      },
      {
        kind: "cone",
        offset: [-1, 4.8, -5.2],
        args: [0.85, 1.6],
        color: "#e8edf2",
        roughness: 0.6,
      },
      {
        kind: "cone",
        offset: [-7.6, 0, -0.6],
        args: [2, 4.6],
        color: "#ffffff",
        material: "rock",
        textureRepeat: [2, 2],
        roughness: 0.96,
        solid: true,
      },
      // refuge de bois
      {
        kind: "box",
        offset: [-2.4, 0, -1.8],
        args: [0.9, 0.6, 0.7],
        color: "#ffffff",
        material: "wood",
        roughness: 0.9,
        solid: true,
        solidRadius: 0.5,
      },
      {
        kind: "cone",
        offset: [-2.4, 0.6, -1.8],
        args: [0.7, 0.5, 4],
        color: "#5a4632",
        roughness: 0.88,
      },
      // cairn
      {
        kind: "sphere",
        offset: [-3.4, 0, -0.7],
        args: [0.18],
        color: "#8f8b84",
        material: "rock",
        roughness: 0.95,
      },
    ],
  },
  {
    // versant d'adrénaline : rampe de lancement, fanions vifs sur roche neutre
    id: "shadows-blossoming-adrenaline",
    origin: nodeOrigin("blossoming"),
    primitives: [
      {
        kind: "box",
        offset: [2.9, 0, -2.9],
        args: [3, 1, 1.5],
        color: "#ffffff",
        material: "rock",
        textureRepeat: [2, 1],
        rotation: [0, 0, 0.26],
        roughness: 0.92,
        solid: true,
      },
      {
        kind: "box",
        offset: [5.2, 0, -3.3],
        args: [1.3, 1.9, 1.3],
        color: "#ffffff",
        material: "rock",
        textureRepeat: [1, 1],
        roughness: 0.92,
        solid: true,
      },
      {
        kind: "cylinder",
        offset: [2.2, 0, -1.7],
        args: [0.04, 0.05, 1.5],
        color: "#8f8a80",
        roughness: 0.7,
        solid: true,
        solidRadius: 0.12,
      },
      {
        kind: "box",
        offset: [2.44, 1.28, -1.7],
        args: [0.42, 0.26, 0.04],
        color: "#c9302e",
        roughness: 0.75,
      },
      {
        kind: "cylinder",
        offset: [4.4, 0, -2.1],
        args: [0.04, 0.05, 1.4],
        color: "#8f8a80",
        roughness: 0.7,
        solid: true,
        solidRadius: 0.12,
      },
      {
        kind: "box",
        offset: [4.64, 1.2, -2.1],
        args: [0.42, 0.26, 0.04],
        color: "#e8b23a",
        roughness: 0.75,
      },
    ],
  },
  {
    // village de terre : cases, toits de chaume, feu central, bâtons de route
    id: "shadows-ethnic-village",
    origin: nodeOrigin("ethnic-stick"),
    primitives: [
      {
        kind: "cylinder",
        offset: [-2.8, 0, -2.6],
        args: [0.95, 1, 1.2],
        color: "#9a6b42",
        material: "plaster",
        roughness: 0.95,
        solid: true,
      },
      {
        kind: "cone",
        offset: [-2.8, 1.2, -2.6],
        args: [1.25, 1],
        color: "#ffffff",
        material: "thatch",
        textureRepeat: [3, 1],
        roughness: 0.95,
      },
      {
        kind: "cylinder",
        offset: [-1, 0, -4.2],
        args: [0.8, 0.85, 1.05],
        color: "#8d5f3a",
        material: "plaster",
        roughness: 0.95,
        solid: true,
      },
      {
        kind: "cone",
        offset: [-1, 1.05, -4.2],
        args: [1.05, 0.9],
        color: "#ffffff",
        material: "thatch",
        textureRepeat: [3, 1],
        roughness: 0.95,
      },
      // feu central (source diégétique)
      {
        kind: "cylinder",
        offset: [-3.6, 0, -0.8],
        args: [0.5, 0.55, 0.2],
        color: "#6b665e",
        material: "rock",
        roughness: 0.96,
        solid: true,
        solidRadius: 0.6,
      },
      {
        kind: "sphere",
        offset: [-3.6, 0.16, -0.8],
        args: [0.13],
        color: "#e07038",
        emissive: "#e07038",
        emissiveIntensity: 0.8,
        pointLight: { color: "#e07038", intensity: 1.5, distance: 5, y: 0.45 },
      },
      // bâtons de voyage plantés
      {
        kind: "cylinder",
        offset: [-2.2, 0, -1.3],
        args: [0.05, 0.07, 1.8],
        color: "#7a4a26",
        material: "wood",
        roughness: 0.9,
        solid: true,
        solidRadius: 0.14,
      },
      {
        kind: "cylinder",
        offset: [-4.6, 0, -2.2],
        args: [0.05, 0.07, 1.6],
        color: "#8a5a2e",
        material: "wood",
        roughness: 0.9,
        solid: true,
        solidRadius: 0.14,
      },
    ],
  },
  {
    // col au crépuscule : bifurcation λ taillée dans la roche, horloge figée
    id: "shadows-minuit-fork",
    origin: nodeOrigin("minuit-moins-cinq"),
    primitives: [
      {
        kind: "box",
        offset: [-3, 0, -1.3],
        args: [0.55, 3, 0.6],
        color: "#ffffff",
        material: "rock",
        textureRepeat: [1, 2],
        rotation: [0.4, 0, 0],
        roughness: 0.95,
        solid: true,
        solidRadius: 0.5,
      },
      {
        kind: "box",
        offset: [-3, 0, 1.3],
        args: [0.55, 3, 0.6],
        color: "#ffffff",
        material: "rock",
        textureRepeat: [1, 2],
        rotation: [-0.4, 0, 0],
        roughness: 0.95,
        solid: true,
        solidRadius: 0.5,
      },
      // horloge de gare figée à 23 h 55, montée à l'apex
      {
        kind: "cylinder",
        offset: [-3, 2.75, 0],
        args: [0.42, 0.42, 0.09],
        color: "#e8e4da",
        material: "plaster",
        rotation: [0, 0, Math.PI / 2],
        roughness: 0.6,
      },
      // lampes de col (diégétiques)
      {
        kind: "sphere",
        offset: [-3.5, 2.2, -1],
        args: [0.11],
        color: "#e8c76a",
        emissive: "#d9a53f",
        emissiveIntensity: 0.4,
        pointLight: { color: "#d9a53f", intensity: 0.8, distance: 4, y: 2.2 },
      },
      {
        kind: "sphere",
        offset: [-3.5, 2.1, 1],
        args: [0.11],
        color: "#c9302e",
        emissive: "#b02020",
        emissiveIntensity: 0.45,
      },
    ],
  },
  {
    // ligne qui s'éteint : poteaux qui déclinent, panneau qui s'effondre
    id: "shadows-perdue-fade",
    origin: nodeOrigin("perdue"),
    primitives: [
      {
        kind: "cylinder",
        offset: [-2.4, 0, -2.2],
        args: [0.1, 0.12, 1.7],
        color: "#5d6470",
        material: "wood",
        roughness: 0.9,
        solid: true,
        solidRadius: 0.2,
      },
      {
        kind: "cylinder",
        offset: [-3.8, 0, -3.4],
        args: [0.09, 0.11, 1.3],
        color: "#6f7580",
        roughness: 0.92,
        opacity: 0.8,
        solid: true,
        solidRadius: 0.18,
      },
      {
        kind: "cylinder",
        offset: [-5.2, 0, -4.6],
        args: [0.08, 0.1, 0.9],
        color: "#868b94",
        roughness: 0.94,
        opacity: 0.55,
      },
      {
        kind: "cylinder",
        offset: [-6.6, 0, -5.8],
        args: [0.07, 0.09, 0.6],
        color: "#9da1a8",
        roughness: 0.96,
        opacity: 0.3,
      },
      // panneau qui bascule
      {
        kind: "cylinder",
        offset: [-2, 0, -1.2],
        args: [0.04, 0.05, 1],
        color: "#7a6f5e",
        material: "wood",
        rotation: [0, 0, 0.28],
        roughness: 0.92,
        solid: true,
        solidRadius: 0.12,
      },
      {
        kind: "box",
        offset: [-2.24, 0.86, -1.2],
        args: [0.8, 0.45, 0.05],
        color: "#ffffff",
        material: "wood",
        rotation: [0.12, 0.5, 0.3],
        roughness: 0.92,
      },
    ],
  },

  // ─── Vegetative Field ───────────────────────────────────────────────────
  {
    // lotissement parfait : trois pavillons identiques, pelouses, gonflable
    id: "field-morne-et-suburb",
    origin: nodeOrigin("morne-et"),
    primitives: [
      {
        kind: "box",
        offset: [-3.8, 0, -3.2],
        args: [1.3, 1.5, 1.1],
        color: "#ffffff",
        material: "plaster",
        roughness: 0.92,
        solid: true,
      },
      {
        kind: "cone",
        offset: [-3.8, 1.5, -3.2],
        args: [1, 0.8, 4],
        color: "#b8776a",
        roughness: 0.88,
      },
      {
        kind: "box",
        offset: [-1.6, 0, -3.2],
        args: [1.3, 1.5, 1.1],
        color: "#ffffff",
        material: "plaster",
        roughness: 0.92,
        solid: true,
      },
      {
        kind: "cone",
        offset: [-1.6, 1.5, -3.2],
        args: [1, 0.8, 4],
        color: "#b8776a",
        roughness: 0.88,
      },
      {
        kind: "box",
        offset: [0.6, 0, -3.2],
        args: [1.3, 1.5, 1.1],
        color: "#ffffff",
        material: "plaster",
        roughness: 0.92,
        solid: true,
      },
      {
        kind: "cone",
        offset: [0.6, 1.5, -3.2],
        args: [1, 0.8, 4],
        color: "#b8776a",
        roughness: 0.88,
      },
      // pelouses trop parfaites
      {
        kind: "cylinder",
        offset: [-2.8, 0, -1.6],
        args: [1.1, 1.2, 0.08],
        color: "#9db27e",
        roughness: 0.95,
      },
      {
        kind: "cylinder",
        offset: [-0.4, 0, -1.7],
        args: [1, 1.1, 0.08],
        color: "#a3b884",
        roughness: 0.95,
      },
      // décoration gonflable esseulée
      {
        kind: "sphere",
        offset: [1.6, 0, -1.9],
        args: [0.35],
        color: "#d95f9a",
        roughness: 0.55,
        solid: true,
        solidRadius: 0.35,
      },
    ],
  },
  {
    // bâtisse de pierre sans fenêtres, brume basse qui ne se lève jamais
    id: "field-daymason-house",
    origin: nodeOrigin("daymason"),
    primitives: [
      {
        kind: "box",
        offset: [-2.8, 0, -3.2],
        args: [2.8, 2.4, 2.1],
        color: "#a09c94",
        material: "rock",
        textureRepeat: [2, 2],
        roughness: 0.96,
        solid: true,
      },
      {
        kind: "cylinder",
        offset: [-2.8, 0.06, -3.2],
        args: [3.6, 3.6, 0.07],
        color: "#cfd0c8",
        opacity: 0.45,
        roughness: 0.98,
      },
      {
        kind: "box",
        offset: [-1.2, 0, -2.1],
        args: [0.5, 0.08, 1.4],
        color: "#3c4038",
        roughness: 0.95,
      },
    ],
  },
  {
    // carrière de craie : plan blanc, traits, piquets — presque rien
    id: "field-chailk-quarry",
    origin: nodeOrigin("chailk"),
    primitives: [
      {
        kind: "box",
        offset: [3, 0, -2.6],
        args: [3.4, 0.05, 2.4],
        color: "#f4f2ea",
        roughness: 0.98,
      },
      {
        kind: "box",
        offset: [3, 0.05, -2.6],
        args: [2.2, 0.03, 0.14],
        color: "#d9d4c4",
        roughness: 0.98,
      },
      {
        kind: "cylinder",
        offset: [3.6, 0, -3.4],
        args: [0.03, 0.04, 0.5],
        color: "#c9c4b4",
        roughness: 0.9,
      },
      {
        kind: "cylinder",
        offset: [4.6, 0, -1.6],
        args: [0.03, 0.04, 0.5],
        color: "#c9c4b4",
        roughness: 0.9,
      },
      {
        kind: "cylinder",
        offset: [2.2, 0, -1.2],
        args: [0.03, 0.04, 0.5],
        color: "#c9c4b4",
        roughness: 0.9,
      },
    ],
  },
  {
    // effondrement suspendu : dalles basculées, horloge brisée au sol
    id: "field-time-fracture",
    origin: nodeOrigin("time"),
    primitives: [
      {
        kind: "box",
        offset: [-2.6, 0, 2.8],
        args: [1.9, 0.24, 0.9],
        color: "#ffffff",
        material: "concrete",
        textureRepeat: [2, 1],
        rotation: [0.18, 0.4, 0.14],
        roughness: 0.92,
        solid: true,
      },
      {
        kind: "box",
        offset: [2.8, 0, 3],
        args: [1.6, 0.2, 0.8],
        color: "#ffffff",
        material: "concrete",
        textureRepeat: [2, 1],
        rotation: [-0.14, -0.3, 0.1],
        roughness: 0.92,
        solid: true,
      },
      {
        kind: "box",
        offset: [0.2, 0, 4.4],
        args: [1.4, 0.18, 0.7],
        color: "#ffffff",
        material: "concrete",
        rotation: [0.1, 0.9, -0.12],
        roughness: 0.92,
        solid: true,
      },
      // horloge tombée, aiguille figée
      {
        kind: "cylinder",
        offset: [0.4, 0, 2.9],
        args: [1, 1, 0.07],
        color: "#e8e4da",
        material: "plaster",
        roughness: 0.7,
      },
      {
        kind: "box",
        offset: [0.4, 0.08, 2.9],
        args: [0.75, 0.03, 0.09],
        color: "#2f3238",
        rotation: [0, 0.8, 0],
        roughness: 0.7,
      },
    ],
  },
  {
    // la couleur revient : lanternes chaudes le long du chemin qui remonte
    id: "field-tantitom-lanterns",
    origin: nodeOrigin("tantitom"),
    primitives: [
      {
        kind: "cylinder",
        offset: [2.6, 0, 2.2],
        args: [0.07, 0.09, 1.1],
        color: "#8f8a7c",
        material: "wood",
        roughness: 0.88,
        solid: true,
        solidRadius: 0.16,
      },
      {
        kind: "sphere",
        offset: [2.6, 1.1, 2.2],
        args: [0.16],
        color: "#f5d98b",
        emissive: "#eec25e",
        emissiveIntensity: 0.4,
        pointLight: { color: "#eec25e", intensity: 1.1, distance: 4.5, y: 1.2 },
      },
      {
        kind: "cylinder",
        offset: [4.2, 0, 3.4],
        args: [0.07, 0.09, 1.3],
        color: "#8f8a7c",
        material: "wood",
        roughness: 0.88,
        solid: true,
        solidRadius: 0.16,
      },
      {
        kind: "sphere",
        offset: [4.2, 1.3, 3.4],
        args: [0.16],
        color: "#f2a9a2",
        emissive: "#e0837a",
        emissiveIntensity: 0.35,
        pointLight: { color: "#e0837a", intensity: 1, distance: 4.5, y: 1.4 },
      },
      {
        kind: "cylinder",
        offset: [5.8, 0, 4.6],
        args: [0.07, 0.09, 1.5],
        color: "#8f8a7c",
        material: "wood",
        roughness: 0.88,
        solid: true,
        solidRadius: 0.16,
      },
      {
        kind: "sphere",
        offset: [5.8, 1.5, 4.6],
        args: [0.16],
        color: "#a9d4f2",
        emissive: "#7ab4dd",
        emissiveIntensity: 0.35,
        pointLight: { color: "#7ab4dd", intensity: 1, distance: 4.5, y: 1.6 },
      },
    ],
  },
  {
    // champ céréalier : rangées de blé qui ondulent (bandes basses)
    id: "field-crop-rows",
    origin: { x: 0, z: 8 },
    primitives: [
      {
        kind: "box",
        offset: [-26, 0, 6],
        args: [11, 0.18, 0.5],
        color: "#b3a86e",
        material: "thatch",
        textureRepeat: [8, 1],
        roughness: 0.95,
      },
      {
        kind: "box",
        offset: [-24, 0, 8.4],
        args: [9, 0.16, 0.5],
        color: "#a8a06a",
        material: "thatch",
        textureRepeat: [7, 1],
        roughness: 0.95,
      },
      {
        kind: "box",
        offset: [20, 0, -4],
        args: [10, 0.17, 0.5],
        color: "#aca575",
        material: "thatch",
        textureRepeat: [7, 1],
        roughness: 0.95,
      },
      {
        kind: "box",
        offset: [22, 0, -6.4],
        args: [8, 0.15, 0.5],
        color: "#b0a566",
        material: "thatch",
        textureRepeat: [6, 1],
        roughness: 0.95,
      },
    ],
  },

  // ─── New Signal ─────────────────────────────────────────────────────────
  {
    // la route s'enfonce dans une forêt sombre : troncs argentés sous la lune
    id: "signal-neektareum-forest",
    origin: nodeOrigin("neektareum"),
    primitives: [
      {
        kind: "box",
        offset: [-2.8, 0, -2.6],
        args: [2.4, 1.4, 2.2],
        color: "#565e6c",
        material: "rock",
        textureRepeat: [2, 1],
        rotation: [0, 0.5, 0],
        roughness: 0.94,
        solid: true,
      },
      {
        kind: "cylinder",
        offset: [-1, 0, -4.6],
        args: [0.1, 0.13, 2.8],
        color: "#8a93a3",
        material: "wood",
        roughness: 0.85,
        solid: true,
        solidRadius: 0.2,
      },
      {
        kind: "cylinder",
        offset: [0.8, 0, -5.4],
        args: [0.09, 0.12, 3.1],
        color: "#7e8798",
        material: "wood",
        roughness: 0.85,
        solid: true,
        solidRadius: 0.2,
      },
      {
        kind: "cylinder",
        offset: [-2.6, 0, -5.8],
        args: [0.11, 0.14, 2.6],
        color: "#949daa",
        material: "wood",
        roughness: 0.85,
        solid: true,
        solidRadius: 0.2,
      },
      {
        kind: "box",
        offset: [0.4, 0.05, -1.8],
        args: [1.6, 0.08, 0.4],
        color: "#c9a84c",
        rotation: [0, -0.5, 0],
        roughness: 0.7,
      },
    ],
  },
  {
    // gorge gelée : parois de glace bleue-argent, plan gelé
    id: "signal-asitis-gorge",
    origin: nodeOrigin("asitis"),
    primitives: [
      {
        kind: "box",
        offset: [3.2, 0, -2.4],
        args: [3, 2.6, 0.8],
        color: "#bcd9e8",
        rotation: [0, 0.3, 0],
        roughness: 0.15,
        solid: true,
      },
      {
        kind: "box",
        offset: [3.8, 0, 2.4],
        args: [2.6, 2.2, 0.7],
        color: "#c8e2ee",
        rotation: [0, -0.2, 0],
        roughness: 0.15,
        solid: true,
      },
      {
        kind: "box",
        offset: [2.6, 0, 0.1],
        args: [3.4, 0.05, 2.4],
        color: "#dceef5",
        roughness: 0.1,
      },
    ],
  },
  {
    // le puits : margelle, marches de remontée en spirale
    id: "signal-relative-well",
    origin: nodeOrigin("relative"),
    primitives: [
      {
        kind: "cylinder",
        offset: [2.8, 0, -2.6],
        args: [1.5, 1.6, 0.5],
        color: "#77706a",
        material: "rock",
        textureRepeat: [3, 1],
        roughness: 0.9,
        solid: true,
      },
      {
        kind: "box",
        offset: [4.3, 0, -1.4],
        args: [0.9, 0.4, 0.7],
        color: "#ffffff",
        material: "granite",
        roughness: 0.88,
        solid: true,
      },
      {
        kind: "box",
        offset: [5.2, 0, -0.4],
        args: [0.9, 0.8, 0.7],
        color: "#ffffff",
        material: "granite",
        roughness: 0.88,
        solid: true,
      },
      {
        kind: "box",
        offset: [6.1, 0, 0.6],
        args: [0.9, 1.2, 0.7],
        color: "#ffffff",
        material: "granite",
        roughness: 0.88,
        solid: true,
      },
    ],
  },
  {
    // échangeurs inachevés : dalles empilées, panneaux contradictoires
    id: "signal-overthink-interchange",
    origin: nodeOrigin("overthink"),
    primitives: [
      {
        kind: "box",
        offset: [2.8, 0, 2.6],
        args: [2.2, 0.35, 1.4],
        color: "#ffffff",
        material: "concrete",
        textureRepeat: [2, 1],
        rotation: [0, 0.3, 0.08],
        roughness: 0.92,
        solid: true,
      },
      {
        kind: "box",
        offset: [3, 0.4, 2.7],
        args: [1.8, 0.32, 1.2],
        color: "#ffffff",
        material: "concrete",
        textureRepeat: [2, 1],
        rotation: [0.06, -0.4, -0.1],
        roughness: 0.92,
      },
      {
        kind: "box",
        offset: [2.7, 0.78, 2.5],
        args: [1.4, 0.3, 1],
        color: "#ffffff",
        material: "concrete",
        rotation: [-0.08, 0.7, 0.12],
        roughness: 0.92,
      },
      {
        kind: "box",
        offset: [0.6, 0, 4.2],
        args: [1.5, 0.12, 0.6],
        color: "#ffffff",
        material: "concrete",
        rotation: [0, 0.9, 0.3],
        roughness: 0.92,
        solid: true,
        solidRadius: 0.7,
      },
      // panneaux qui se contredisent
      {
        kind: "cylinder",
        offset: [0.9, 0, 3.2],
        args: [0.04, 0.05, 1.1],
        color: "#6b6f77",
        rotation: [0, 0, 0.12],
        roughness: 0.7,
        solid: true,
        solidRadius: 0.12,
      },
      {
        kind: "box",
        offset: [0.95, 1, 3.2],
        args: [0.5, 0.3, 0.04],
        color: "#3457a8",
        rotation: [0, 0.6, 0],
        roughness: 0.7,
      },
      {
        kind: "cylinder",
        offset: [1.7, 0, 4.6],
        args: [0.04, 0.05, 1.2],
        color: "#6b6f77",
        rotation: [0, 0, -0.1],
        roughness: 0.7,
        solid: true,
        solidRadius: 0.12,
      },
      {
        kind: "box",
        offset: [1.64, 1.08, 4.6],
        args: [0.5, 0.3, 0.04],
        color: "#a83434",
        rotation: [0, -0.9, 0],
        roughness: 0.7,
      },
    ],
  },
  {
    // la lande sous tempête : le passeur debout, lanterne tenue, pont
    id: "signal-hold-the-light-keeper",
    origin: nodeOrigin("hold-the-light"),
    primitives: [
      // le passeur — silhouette humaine immobile
      {
        kind: "cylinder",
        offset: [-2.15, 0, -2.15],
        args: [0.14, 0.18, 0.62],
        color: "#16161c",
        roughness: 0.9,
        solid: true,
        solidRadius: 0.25,
      },
      {
        kind: "sphere",
        offset: [-2.15, 0.66, -2.15],
        args: [0.12],
        color: "#16161c",
        roughness: 0.9,
      },
      // sa lanterne, tenue à bout de bras
      {
        kind: "sphere",
        offset: [-1.85, 0.42, -2],
        args: [0.09],
        color: "#ffe9a8",
        emissive: "#f5c860",
        emissiveIntensity: 0.85,
        pointLight: { color: "#f5c860", intensity: 2.4, distance: 8, y: 0.5 },
      },
      // le pont de l'entre-deux
      {
        kind: "box",
        offset: [-0.6, 0.1, -4],
        args: [2.6, 0.14, 0.7],
        color: "#ffffff",
        material: "wood",
        textureRepeat: [3, 1],
        rotation: [0, 0.5, 0],
        roughness: 0.88,
        solid: true,
        solidRadius: 1,
      },
    ],
  },
  {
    // maison isolée après la tempête : une seule fenêtre éclairée
    id: "signal-midnight-house",
    origin: nodeOrigin("midnight-work"),
    primitives: [
      {
        kind: "box",
        offset: [-2.8, 0, -2.6],
        args: [2, 1.7, 1.7],
        color: "#3a4150",
        material: "brick",
        textureRepeat: [2, 1],
        rotation: [0, 0.35, 0],
        roughness: 0.92,
        solid: true,
      },
      {
        kind: "cone",
        offset: [-2.8, 1.7, -2.6],
        args: [1.6, 1, 4],
        color: "#10151f",
        rotation: [0, 0.35 + Math.PI / 4, 0],
        roughness: 0.9,
      },
      {
        kind: "box",
        offset: [-3.3, 2.2, -2.9],
        args: [0.18, 0.55, 0.18],
        color: "#1a1f2a",
        roughness: 0.92,
      },
      {
        kind: "box",
        offset: [-1.9, 0.55, -2],
        args: [0.06, 0.7, 0.9],
        color: "#ffcf7a",
        emissive: "#f2b04a",
        emissiveIntensity: 0.8,
        rotation: [0, 0.35, 0],
        pointLight: { color: "#f2b04a", intensity: 2.2, distance: 8, y: 1 },
      },
    ],
  },
  {
    // labyrinthe de haies et de miroirs sur pied, brume au sol
    id: "signal-telatelaba-maze",
    origin: nodeOrigin("telatelaba"),
    primitives: [
      {
        kind: "box",
        offset: [2.8, 0, -4],
        args: [2.6, 1.1, 0.6],
        color: "#2c3a2c",
        material: "thatch",
        textureRepeat: [3, 1],
        rotation: [0, 0.3, 0],
        roughness: 0.96,
        solid: true,
      },
      {
        kind: "box",
        offset: [4.8, 0, -1.6],
        args: [2.2, 1.2, 0.6],
        color: "#31402f",
        material: "thatch",
        textureRepeat: [3, 1],
        rotation: [0, -0.3, 0],
        roughness: 0.96,
        solid: true,
      },
      {
        kind: "box",
        offset: [2.6, 0, -2.2],
        args: [0.16, 1.6, 2.4],
        color: "#c3ccd9",
        roughness: 0.1,
        solid: true,
        solidRadius: 1.1,
      },
      {
        kind: "box",
        offset: [4, 0, 0.4],
        args: [0.16, 1.4, 2.2],
        color: "#cdd5e2",
        rotation: [0, 0.35, 0],
        roughness: 0.1,
        solid: true,
        solidRadius: 1,
      },
      {
        kind: "box",
        offset: [2.2, 0, 2.8],
        args: [0.16, 1.5, 2],
        color: "#b9c3d3",
        rotation: [0, -0.3, 0],
        roughness: 0.1,
        solid: true,
        solidRadius: 0.95,
      },
      {
        kind: "cylinder",
        offset: [3.2, 0.05, -0.6],
        args: [3.4, 3.4, 0.06],
        color: "#c8ccd4",
        opacity: 0.3,
        roughness: 0.98,
      },
    ],
  },
  {
    // la ville qui s'endort : petit skyline aux fenêtres qui s'éteignent
    id: "signal-lemonde-skyline",
    origin: nodeOrigin("le-monde-s-endort"),
    primitives: [
      {
        kind: "box",
        offset: [-1.6, 0, -3.6],
        args: [1.1, 1.9, 0.9],
        color: "#ffffff",
        material: "windowsNight",
        textureRepeat: [1, 1],
        roughness: 0.9,
        solid: true,
      },
      {
        kind: "box",
        offset: [-3, 0, -3.8],
        args: [0.9, 1.4, 0.8],
        color: "#ffffff",
        material: "windowsNight",
        textureRepeat: [1, 1],
        roughness: 0.9,
        solid: true,
      },
      {
        kind: "box",
        offset: [-4.3, 0, -4],
        args: [0.8, 1, 0.7],
        color: "#ffffff",
        material: "windowsNight",
        textureRepeat: [1, 1],
        roughness: 0.9,
        solid: true,
      },
    ],
  },
  {
    // plage à l'aube : sable, galets, bois flotté, la pierre à face polie
    id: "signal-renee-shore",
    origin: nodeOrigin("renee"),
    primitives: [
      {
        kind: "box",
        offset: [-2.8, 0, 2.4],
        args: [3.6, 0.07, 2.6],
        color: "#ffffff",
        material: "sand",
        textureRepeat: [3, 2],
        roughness: 0.95,
      },
      {
        kind: "sphere",
        offset: [-3.4, 0, 2],
        args: [0.55],
        color: "#a89a88",
        material: "rock",
        roughness: 0.7,
        solid: true,
        solidRadius: 0.55,
      },
      {
        kind: "sphere",
        offset: [-2.2, 0, 3],
        args: [0.4],
        color: "#c4b6a2",
        material: "rock",
        roughness: 0.55,
        solid: true,
        solidRadius: 0.4,
      },
      // bois flotté
      {
        kind: "box",
        offset: [-1.4, 0, 1.6],
        args: [1.1, 0.12, 0.16],
        color: "#ffffff",
        material: "wood",
        textureRepeat: [2, 1],
        rotation: [0, 0.7, 0],
        roughness: 0.9,
      },
      // la pierre brute dont une face polie accroche l'aube
      {
        kind: "box",
        offset: [-3, 0, 3.4],
        args: [0.5, 0.35, 0.4],
        color: "#d8c9a8",
        rotation: [0, 0.4, 0],
        roughness: 0.25,
        solid: true,
        solidRadius: 0.35,
      },
    ],
  },
  {
    // placeholder prudent : ombre féline basse, discrète
    id: "signal-panthere-shadow",
    origin: nodeOrigin("Panthere"),
    primitives: [
      {
        kind: "box",
        offset: [2.4, 0, 2.2],
        args: [2.6, 0.09, 1.1],
        color: "#191722",
        rotation: [0, 0.4, 0],
        roughness: 0.96,
        opacity: 0.85,
      },
      {
        kind: "box",
        offset: [3.6, 0, 1.4],
        args: [0.1, 0.9, 0.14],
        color: "#2e2a3d",
        rotation: [0.3, 0.4, 0],
        roughness: 0.85,
      },
      {
        kind: "box",
        offset: [3.6, 0, 2.2],
        args: [0.1, 0.9, 0.14],
        color: "#2e2a3d",
        rotation: [-0.3, 0.4, 0],
        roughness: 0.85,
      },
    ],
  },
];

export function getDrift3DLandmarkColliders(): Drift3DVehicleCollider[] {
  const colliders: Drift3DVehicleCollider[] = [];

  for (const landmark of drift3dLandmarks) {
    for (const primitive of landmark.primitives) {
      if (!primitive.solid) {
        continue;
      }

      let radius = primitive.solidRadius;

      if (radius === undefined) {
        switch (primitive.kind) {
          case "box":
            radius = (Math.max(primitive.args[0], primitive.args[2]) / 2) * 0.9;
            break;
          case "cylinder":
            radius = Math.max(primitive.args[0], primitive.args[1]);
            break;
          case "cone":
            radius = primitive.args[0] * 0.85;
            break;
          case "sphere":
            radius = primitive.args[0];
            break;
        }
      }

      colliders.push({
        x: landmark.origin.x + primitive.offset[0],
        z: landmark.origin.z + primitive.offset[2],
        radius,
      });
    }
  }

  return colliders;
}
