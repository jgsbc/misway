import * as THREE from "three";
import type { FableLot } from "@/components/drift-3d/fable/fableWorld";
import { fableGroundY, fableRng } from "@/components/drift-3d/fable/fableWorld";

/**
 * BIRTH YARD — architecture réelle.
 *
 * Les immeubles ne sont plus des boîtes portant une photo de fenêtres : les
 * ouvertures sont creusées, les appuis débordent, les corniches portent une
 * ombre, les rez-de-chaussée s'enfoncent en devanture. Tout est écrit dans
 * quelques gros maillages fusionnés — un appel de dessin par matière pour
 * la ville entière — parce que le détail doit coûter des triangles, pas des
 * appels.
 */

type MeshWriter = {
  pos: number[];
  nor: number[];
  uv: number[];
  col: number[];
  idx: number[];
};

function createWriter(): MeshWriter {
  return { pos: [], nor: [], uv: [], col: [], idx: [] };
}

function toGeometry(w: MeshWriter) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(w.pos, 3));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(w.nor, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(w.uv, 2));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(w.col, 3));
  geo.setIndex(w.idx);
  geo.computeBoundingSphere();

  return geo;
}

type Vec3 = [number, number, number];

function emitQuad(
  w: MeshWriter,
  a: Vec3,
  b: Vec3,
  c: Vec3,
  d: Vec3,
  normal: Vec3,
  uMax: number,
  vMax: number,
  color: THREE.Color
) {
  const base = w.pos.length / 3;
  const corners = [a, b, c, d];
  const uvs: Array<[number, number]> = [
    [0, 0],
    [uMax, 0],
    [uMax, vMax],
    [0, vMax],
  ];

  for (let i = 0; i < 4; i += 1) {
    w.pos.push(corners[i][0], corners[i][1], corners[i][2]);
    w.nor.push(normal[0], normal[1], normal[2]);
    w.uv.push(uvs[i][0], uvs[i][1]);
    w.col.push(color.r, color.g, color.b);
  }

  w.idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
}

/** Boîte orientée autour de Y, UV proportionnelles au monde. */
function emitBox(
  w: MeshWriter,
  cx: number,
  cy: number,
  cz: number,
  sx: number,
  sy: number,
  sz: number,
  yaw: number,
  color: THREE.Color,
  texScale = 2.4,
  faces = { px: true, nx: true, py: true, ny: true, pz: true, nz: true }
) {
  const cos = Math.cos(yaw);
  const sin = Math.sin(yaw);
  const hx = sx / 2;
  const hy = sy / 2;
  const hz = sz / 2;

  // Repère local -> monde.
  const p = (lx: number, ly: number, lz: number): Vec3 => [
    cx + lx * cos + lz * sin,
    cy + ly,
    cz - lx * sin + lz * cos,
  ];
  const n = (lx: number, lz: number): Vec3 => [
    lx * cos + lz * sin,
    0,
    -lx * sin + lz * cos,
  ];

  const uX = sx / texScale;
  const uY = sy / texScale;
  const uZ = sz / texScale;

  if (faces.pz) {
    emitQuad(w, p(-hx, -hy, hz), p(hx, -hy, hz), p(hx, hy, hz), p(-hx, hy, hz), n(0, 1), uX, uY, color);
  }

  if (faces.nz) {
    emitQuad(w, p(hx, -hy, -hz), p(-hx, -hy, -hz), p(-hx, hy, -hz), p(hx, hy, -hz), n(0, -1), uX, uY, color);
  }

  if (faces.px) {
    emitQuad(w, p(hx, -hy, hz), p(hx, -hy, -hz), p(hx, hy, -hz), p(hx, hy, hz), n(1, 0), uZ, uY, color);
  }

  if (faces.nx) {
    emitQuad(w, p(-hx, -hy, -hz), p(-hx, -hy, hz), p(-hx, hy, hz), p(-hx, hy, -hz), n(-1, 0), uZ, uY, color);
  }

  if (faces.py) {
    emitQuad(w, p(-hx, hy, hz), p(hx, hy, hz), p(hx, hy, -hz), p(-hx, hy, -hz), [0, 1, 0], uX, uZ, color);
  }

  if (faces.ny) {
    emitQuad(w, p(-hx, -hy, -hz), p(hx, -hy, -hz), p(hx, -hy, hz), p(-hx, -hy, hz), [0, -1, 0], uX, uZ, color);
  }
}

export type FableCityGeometries = {
  /** Maçonnerie : murs, appuis, corniches, socles. */
  solid: THREE.BufferGeometry;
  /** Vitrages sombres — reflets froids, non émissifs. */
  glass: THREE.BufferGeometry;
  /** Intérieurs allumés — émissifs, couleur portée par les sommets. */
  lit: THREE.BufferGeometry;
  /** Ferronnerie : garde-corps, escaliers de secours, potences. */
  metal: THREE.BufferGeometry;
  /** Toiles : stores et bâches de devanture. */
  fabric: THREE.BufferGeometry;
};

const WARM_LIGHTS = ["#ffb765", "#ffcf94", "#ff9d52", "#ffe0ae", "#e8a86a"];
const SHOP_LIGHTS = ["#fff0c9", "#c9e6df", "#ffd08a", "#e9dcff"];
const AWNING_COLORS = ["#7d3f34", "#3f5148", "#6a5a34", "#57405a", "#7a6a4c"];

/**
 * Construit toute la ville. Une passe, quelques maillages, beaucoup de
 * relief. Le coût est en triangles — la marge y est large.
 *
 * Règle centrale : la façade rue n'est jamais un mur plein sur lequel on
 * colle du relief. Elle est assemblée AUTOUR des vides — allèges, linteaux,
 * trumeaux — pour que les baies soient de vrais trous, avec de vraies
 * ombres et une vraie profondeur.
 */
export function buildFableArchitecture(lots: FableLot[]): FableCityGeometries {
  const rng = fableRng(76119);
  const solid = createWriter();
  const glass = createWriter();
  const lit = createWriter();
  const metal = createWriter();
  const fabric = createWriter();

  const wallColor = new THREE.Color();
  const trimColor = new THREE.Color();
  const plinthColor = new THREE.Color();
  const glassColor = new THREE.Color("#39434d");
  const litColor = new THREE.Color();
  const metalColor = new THREE.Color("#2c2e30");
  const awningColor = new THREE.Color();
  const roofColor = new THREE.Color();
  const shutterColor = new THREE.Color();

  const WALL_T = 0.3;

  for (const lot of lots) {
    const baseY = fableGroundY(lot.x, lot.z) - 0.15;
    const yaw = lot.yaw;
    const cos = Math.cos(yaw);
    const sin = Math.sin(yaw);
    wallColor.setRGB(lot.tint.r, lot.tint.g, lot.tint.b);
    trimColor.copy(wallColor).multiplyScalar(1.16);
    plinthColor.copy(wallColor).multiplyScalar(0.5);
    roofColor.copy(wallColor).multiplyScalar(0.42);

    const facing: 1 | -1 = lot.x >= 0 ? -1 : 1;
    const faceX = (facing * lot.width) / 2;

    /**
     * Pièce de façade : `d` est la saillie vers la rue (négatif = en
     * retrait), `lz0..lz1` la portée le long du mur, `ly0..ly1` la hauteur.
     */
    const piece = (
      w: MeshWriter,
      d: number,
      thick: number,
      lz0: number,
      lz1: number,
      ly0: number,
      ly1: number,
      color: THREE.Color,
      texScale = 2.2,
      onlyFace = false
    ) => {
      if (lz1 - lz0 < 0.02 || ly1 - ly0 < 0.02) return;

      const lzc = (lz0 + lz1) / 2;
      const cx = lot.x + (faceX + facing * d) * cos + lzc * sin;
      const cz = lot.z - (faceX + facing * d) * sin + lzc * cos;
      emitBox(
        w,
        cx,
        baseY + (ly0 + ly1) / 2,
        cz,
        thick,
        ly1 - ly0,
        lz1 - lz0,
        yaw,
        color,
        texScale,
        onlyFace
          ? { px: facing === 1, nx: facing === -1, pz: false, nz: false, py: false, ny: false }
          : { px: true, nx: true, pz: true, nz: true, py: true, ny: true }
      );
    };

    /** Remplit une bande horizontale en contournant les baies. */
    const spans = (
      openings: Array<[number, number]>,
      ly0: number,
      ly1: number,
      color: THREE.Color
    ) => {
      let cursor = -lot.depth / 2;

      for (const [o0, o1] of openings) {
        piece(solid, 0, WALL_T, cursor, o0, ly0, ly1, color);
        cursor = o1;
      }

      piece(solid, 0, WALL_T, cursor, lot.depth / 2, ly0, ly1, color);
    };

    // Volume : les trois murs aveugles + la dalle de toiture.
    emitBox(
      solid,
      lot.x,
      baseY + lot.height / 2,
      lot.z,
      lot.width,
      lot.height,
      lot.depth,
      yaw,
      wallColor,
      2.4,
      { px: facing !== 1, nx: facing !== -1, pz: true, nz: true, py: false, ny: false }
    );
    emitBox(
      solid,
      lot.x,
      baseY + lot.height + 0.12,
      lot.z,
      lot.width + 0.12,
      0.24,
      lot.depth + 0.12,
      yaw,
      roofColor,
      3
    );

    const groundH = Math.min(3.5, Math.max(2.6, lot.height * 0.3));
    const upperH = lot.height - groundH;
    const floors = Math.max(1, Math.round(upperH / 3.05));
    const floorH = upperH / floors;
    const bays = Math.max(1, Math.round(lot.depth / 2.6));
    const bayW = lot.depth / bays;

    /* ── Rez-de-chaussée : devantures réellement ouvertes ─────────────── */

    const shopBays = Math.max(1, Math.round(bays / 1.5));
    const shopW = lot.depth / shopBays;
    const shopOpenings: Array<[number, number]> = [];
    const plinthH = 0.22;
    const shopTop = groundH - 0.62;

    for (let s = 0; s < shopBays; s += 1) {
      const lzc = -lot.depth / 2 + shopW * (s + 0.5);
      const openW = shopW * (0.66 + rng() * 0.16);
      const lz0 = lzc - openW / 2;
      const lz1 = lzc + openW / 2;
      shopOpenings.push([lz0, lz1]);

      if (rng() < 0.32) {
        // Rideau de fer : la ville ferme aussi, et ça se voit.
        shutterColor.copy(wallColor).multiplyScalar(0.42);
        piece(solid, 0.06, 0.09, lz0, lz1, plinthH, shopTop, shutterColor, 0.42);
        continue;
      }

      // Fond de boutique allumé, très en retrait — la profondeur se lit.
      litColor.set(SHOP_LIGHTS[Math.floor(rng() * SHOP_LIGHTS.length)]);
      litColor.multiplyScalar(0.6 + rng() * 0.55);
      piece(lit, -0.62, 0.05, lz0 + 0.05, lz1 - 0.05, plinthH, shopTop - 0.05, litColor, 1, true);
      // Vitrine, à peine en retrait du nu.
      piece(glass, -0.12, 0.05, lz0 + 0.04, lz1 - 0.04, plinthH + 0.35, shopTop, glassColor, 1, true);
      // Tableaux latéraux : ils cadrent l'ombre.
      piece(solid, -0.55, 1.1, lz0 - 0.06, lz0 + 0.06, plinthH, shopTop, plinthColor, 1);
      piece(solid, -0.55, 1.1, lz1 - 0.06, lz1 + 0.06, plinthH, shopTop, plinthColor, 1);
      // Seuil.
      piece(solid, -0.5, 1.2, lz0, lz1, 0, plinthH, plinthColor, 1);

      if (rng() < 0.5) {
        awningColor.set(AWNING_COLORS[Math.floor(rng() * AWNING_COLORS.length)]);
        const reach = 0.9 + rng() * 0.55;
        piece(fabric, reach / 2, reach, lz0 - 0.16, lz1 + 0.16, shopTop + 0.1, shopTop + 0.2, awningColor, 1);
        piece(fabric, reach, 0.07, lz0 - 0.16, lz1 + 0.16, shopTop - 0.18, shopTop + 0.15, awningColor, 1);
      }
    }

    // Trumeaux entre devantures + linteau + soubassement.
    spans(shopOpenings, plinthH, shopTop, wallColor);
    piece(solid, 0.02, WALL_T + 0.06, -lot.depth / 2, lot.depth / 2, 0, plinthH, plinthColor, 1.1);
    piece(solid, 0.09, WALL_T + 0.2, -lot.depth / 2, lot.depth / 2, shopTop, groundH, trimColor, 2);

    /* ── Étages : baies réellement percées ────────────────────────────── */

    for (let f = 0; f < floors; f += 1) {
      const floorBottom = groundH + floorH * f;
      const cy = floorBottom + floorH * 0.52;
      const winH = Math.min(floorH * 0.58, 1.75);
      const y0 = cy - winH / 2;
      const y1 = cy + winH / 2;
      const balconyRow = rng() < 0.2;
      const openings: Array<[number, number]> = [];

      for (let b = 0; b < bays; b += 1) {
        const lzc = -lot.depth / 2 + bayW * (b + 0.5);
        const winW = bayW * (0.44 + rng() * 0.12);

        if (rng() < 0.06) continue; // travée murée

        const lz0 = lzc - winW / 2;
        const lz1 = lzc + winW / 2;
        openings.push([lz0, lz1]);

        if (rng() < 0.14) {
          shutterColor.setHSL(0.09, 0.2, 0.3 + rng() * 0.12);
          piece(solid, 0.03, 0.07, lz0, lz1, y0, y1, shutterColor, 0.42);
        } else {
          if (rng() < 0.44) {
            litColor.set(WARM_LIGHTS[Math.floor(rng() * WARM_LIGHTS.length)]);
            litColor.multiplyScalar(0.55 + rng() * 0.75);
            // La pièce éclairée est au fond, pas dans le plan du mur.
            piece(lit, -0.3, 0.05, lz0, lz1, y0, y1, litColor, 1, true);
          } else {
            piece(glass, -0.18, 0.05, lz0, lz1, y0, y1, glassColor, 1, true);
          }

          // Ébrasement : les retours qui donnent l'épaisseur du mur.
          piece(solid, -0.3, 0.6, lz0 - 0.05, lz0, y0, y1, wallColor, 0.8);
          piece(solid, -0.3, 0.6, lz1, lz1 + 0.05, y0, y1, wallColor, 0.8);
          piece(solid, -0.3, 0.6, lz0, lz1, y1, y1 + 0.05, wallColor, 0.8);
          // Meneau.
          piece(solid, -0.14, 0.06, lzc - 0.025, lzc + 0.025, y0, y1, trimColor, 0.4);
        }

        // Appui débordant + son ombre portée.
        piece(solid, 0.12, 0.34, lz0 - 0.14, lz1 + 0.14, y0 - 0.11, y0, trimColor, 1.2);

        if (balconyRow && rng() < 0.7) {
          const bd = 0.62 + rng() * 0.22;
          piece(solid, bd / 2, bd, lz0 - 0.3, lz1 + 0.3, y0 - 0.2, y0 - 0.1, trimColor, 1.2);
          const railSpan = lz1 - lz0 + 0.6;
          const bars = Math.max(4, Math.round(railSpan / 0.15));

          for (let r = 0; r < bars; r += 1) {
            const off = lz0 - 0.3 + (railSpan * (r + 0.5)) / bars;
            piece(metal, bd, 0.028, off - 0.014, off + 0.014, y0 - 0.1, y0 + 0.52, metalColor, 0.4);
          }

          piece(metal, bd, 0.05, lz0 - 0.3, lz1 + 0.3, y0 + 0.5, y0 + 0.55, metalColor, 0.4);
        }
      }

      // Allèges et linteaux : le mur plein autour de la rangée de baies.
      spans(openings, floorBottom, y0, wallColor);
      spans(openings, y1, floorBottom + floorH, wallColor);
    }

    // Corniche : le débord qui pose une ombre franche sous le ciel.
    piece(
      solid,
      0.24,
      0.72,
      -lot.depth / 2 - 0.15,
      lot.depth / 2 + 0.15,
      lot.height - 0.5,
      lot.height - 0.05,
      trimColor,
      2.2
    );

    // Escalier de secours — rare, mais il change la lecture de la façade.
    if (lot.height > 11 && rng() < 0.3) {
      const lzc = -lot.depth / 2 + lot.depth * (0.25 + rng() * 0.5);
      const landings = Math.max(2, Math.floor(upperH / 3.05));

      for (let l = 0; l < landings; l += 1) {
        const y = groundH + 3.05 * l + 1.1;

        if (y > lot.height - 1.2) break;

        piece(metal, 0.62, 1.15, lzc - 0.75, lzc + 0.75, y, y + 0.06, metalColor, 1);
        piece(metal, 1.16, 0.05, lzc - 0.75, lzc + 0.75, y + 0.06, y + 0.95, metalColor, 0.6);
        piece(metal, 0.62, 1.05, lzc + 0.75, lzc + 1.45, y + 0.9, y + 0.96, metalColor, 1);
      }
    }
  }

  return {
    solid: toGeometry(solid),
    glass: toGeometry(glass),
    lit: toGeometry(lit),
    metal: toGeometry(metal),
    fabric: toGeometry(fabric),
  };
}
