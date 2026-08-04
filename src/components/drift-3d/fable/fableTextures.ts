import * as THREE from "three";

/**
 * FABLE SPIKE — procedural surfaces. Tout est peint sur canvas au chargement :
 * façades usées (diffuse + fenêtres allumées en emissive), asphalte fatigué,
 * dalles de la cour, fumée, enseignes en écriture inventée. Aucune dépendance
 * réseau, aucun asset externe.
 */

const cache = new Map<string, THREE.Texture>();

function makeCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  return canvas;
}

function seededRng(seed: number) {
  let s = seed >>> 0;

  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function toTexture(canvas: HTMLCanvasElement, key: string, srgb = true) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  texture.anisotropy = 4;
  cache.set(key, texture);

  return texture;
}

/** Grain multiplicatif générique. */
function grain(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  amount: number,
  rng: () => number,
  cell = 2
) {
  for (let y = 0; y < height; y += cell) {
    for (let x = 0; x < width; x += cell) {
      const v = (rng() - 0.5) * amount;
      ctx.fillStyle = v > 0 ? `rgba(255,255,255,${v})` : `rgba(0,0,0,${-v})`;
      ctx.fillRect(x, y, cell, cell);
    }
  }
}

/** Coulures verticales (crasse sous les appuis, les gouttières). */
function streaks(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  count: number,
  rng: () => number,
  dark = 0.16
) {
  for (let i = 0; i < count; i += 1) {
    const x = rng() * width;
    const y0 = rng() * height * 0.7;
    const len = 20 + rng() * height * 0.5;
    const w = 1 + rng() * 5;
    const g = ctx.createLinearGradient(0, y0, 0, y0 + len);
    g.addColorStop(0, `rgba(20,16,12,${dark})`);
    g.addColorStop(1, "rgba(20,16,12,0)");
    ctx.fillStyle = g;
    ctx.fillRect(x, y0, w, len);
  }
}

export type FableFacadeMaps = {
  map: THREE.Texture;
  emissiveMap: THREE.Texture;
};

/**
 * Façade usée : enduit teinté, grille de fenêtres irrégulière, volets,
 * linteaux, crasse. L'emissive ne contient que les fenêtres allumées.
 */
export function getFableFacadeMaps(variant: number, repeatY = 1): FableFacadeMaps {
  const key = `facade:${variant}:${repeatY}`;
  const emissiveKey = `facade-emissive:${variant}:${repeatY}`;
  const cachedMap = cache.get(key);
  const cachedEmissive = cache.get(emissiveKey);

  if (cachedMap && cachedEmissive) {
    return { map: cachedMap, emissiveMap: cachedEmissive };
  }

  if (repeatY !== 1) {
    // Réutilise l'image du variant de base, ne change que la répétition
    // verticale — les étages gardent une hauteur crédible sur les tours.
    const base = getFableFacadeMaps(variant, 1);
    const map = base.map.clone();
    map.repeat.set(1, repeatY);
    map.needsUpdate = true;
    const emissiveMap = base.emissiveMap.clone();
    emissiveMap.repeat.set(1, repeatY);
    emissiveMap.needsUpdate = true;
    cache.set(key, map);
    cache.set(emissiveKey, emissiveMap);

    return { map, emissiveMap };
  }

  const width = 256;
  const height = 512;
  const rng = seededRng(9100 + variant * 77);
  const canvas = makeCanvas(width, height);
  const ctx = canvas.getContext("2d")!;
  const emissiveCanvas = makeCanvas(width, height);
  const ectx = emissiveCanvas.getContext("2d")!;

  const bases = ["#b8a88d", "#a3968a", "#96897c", "#ad9878", "#8e8880"];
  ctx.fillStyle = bases[variant % bases.length];
  ctx.fillRect(0, 0, width, height);
  grain(ctx, width, height, 0.07, rng, 2);

  // Bandeaux d'étage légèrement plus sombres.
  const floors = 6 + Math.floor(rng() * 3);
  const floorH = height / floors;

  for (let f = 0; f < floors; f += 1) {
    ctx.fillStyle = `rgba(40,32,24,${0.05 + rng() * 0.05})`;
    ctx.fillRect(0, f * floorH, width, 2);
  }

  ectx.fillStyle = "#000000";
  ectx.fillRect(0, 0, width, height);

  const cols = 3 + Math.floor(rng() * 3);
  const cellW = width / cols;

  for (let f = 0; f < floors; f += 1) {
    for (let c = 0; c < cols; c += 1) {
      if (rng() < 0.08) continue; // fenêtre murée / absente

      const wx = c * cellW + cellW * (0.22 + rng() * 0.06);
      const wy = f * floorH + floorH * (0.24 + rng() * 0.05);
      const ww = cellW * 0.52;
      const wh = floorH * 0.52;

      // Linteau + appui.
      ctx.fillStyle = "rgba(60,50,40,0.5)";
      ctx.fillRect(wx - 3, wy - 3, ww + 6, 3);
      ctx.fillStyle = "rgba(230,222,206,0.5)";
      ctx.fillRect(wx - 4, wy + wh, ww + 8, 3);

      const state = rng();

      if (state < 0.14) {
        // Volet fermé.
        ctx.fillStyle = `rgb(${90 + rng() * 30},${70 + rng() * 20},${52 + rng() * 16})`;
        ctx.fillRect(wx, wy, ww, wh);
        ctx.fillStyle = "rgba(0,0,0,0.25)";

        for (let s = 0; s < 5; s += 1) {
          ctx.fillRect(wx, wy + (s / 5) * wh, ww, 1);
        }
      } else {
        // Vitre sombre teintée ciel.
        const glass = 26 + rng() * 26;
        ctx.fillStyle = `rgb(${glass * 1.1 | 0},${glass * 1.0 | 0},${glass * 0.94 | 0})`;
        ctx.fillRect(wx, wy, ww, wh);
        ctx.fillStyle = "rgba(255,240,210,0.08)";
        ctx.fillRect(wx, wy, ww, wh * 0.3);
        ctx.fillStyle = "rgba(20,16,12,0.6)";
        ctx.fillRect(wx + ww * 0.47, wy, 2, wh);

        if (state > 0.875) {
          // Fenêtre allumée : chaude, un rideau parfois.
          const warm = 0.72 + rng() * 0.28;
          ectx.fillStyle = `rgba(${255 * warm | 0},${176 * warm | 0},${86 * warm | 0},1)`;
          ectx.fillRect(wx, wy, ww, wh);

          if (rng() < 0.4) {
            ectx.fillStyle = "rgba(0,0,0,0.55)";
            ectx.fillRect(wx + ww * (0.1 + rng() * 0.3), wy, ww * 0.28, wh);
          }
        }
      }

      // Coulure sous l'appui.
      if (rng() < 0.6) {
        const g = ctx.createLinearGradient(0, wy + wh, 0, wy + wh + 26);
        g.addColorStop(0, "rgba(30,24,18,0.28)");
        g.addColorStop(1, "rgba(30,24,18,0)");
        ctx.fillStyle = g;
        ctx.fillRect(wx - 2, wy + wh + 3, ww + 4, 26);
      }
    }
  }

  streaks(ctx, width, height, 10, rng);

  // Soubassement sali.
  const baseG = ctx.createLinearGradient(0, height - 70, 0, height);
  baseG.addColorStop(0, "rgba(28,22,16,0)");
  baseG.addColorStop(1, "rgba(28,22,16,0.4)");
  ctx.fillStyle = baseG;
  ctx.fillRect(0, height - 70, width, 70);

  return {
    map: toTexture(canvas, key),
    emissiveMap: toTexture(emissiveCanvas, emissiveKey),
  };
}

/** Asphalte fatigué : rapiéçages, fissures, ligne axiale effacée. */
export function getFableAsphaltTexture(): THREE.Texture {
  const key = "asphalt";
  const cached = cache.get(key);

  if (cached) return cached;

  const size = 512;
  const rng = seededRng(4451);
  const canvas = makeCanvas(size, size);
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#4a463f";
  ctx.fillRect(0, 0, size, size);
  grain(ctx, size, size, 0.09, rng, 2);

  // Rapiéçages plus sombres.
  for (let i = 0; i < 9; i += 1) {
    ctx.fillStyle = `rgba(24,22,20,${0.18 + rng() * 0.2})`;
    const x = rng() * size;
    const y = rng() * size;
    ctx.fillRect(x, y, 40 + rng() * 130, 30 + rng() * 90);
  }

  // Fissures.
  ctx.strokeStyle = "rgba(18,16,14,0.5)";

  for (let i = 0; i < 14; i += 1) {
    ctx.lineWidth = 1 + rng();
    ctx.beginPath();
    let x = rng() * size;
    let y = rng() * size;
    ctx.moveTo(x, y);

    for (let s = 0; s < 8; s += 1) {
      x += (rng() - 0.5) * 60;
      y += (rng() - 0.3) * 60;
      ctx.lineTo(x, y);
    }

    ctx.stroke();
  }

  // Ligne axiale à moitié effacée (le long de V = axe z).
  ctx.fillStyle = "rgba(214,200,160,0.5)";

  for (let y = 0; y < size; y += 34) {
    if (rng() < 0.75) {
      ctx.fillRect(size / 2 - 3, y, 6, 18 + rng() * 8);
    }
  }

  grain(ctx, size, size, 0.05, rng, 3);

  return toTexture(canvas, key);
}

/** Dalles usées de la cour d'amarrage. */
export function getFablePlazaTexture(): THREE.Texture {
  const key = "plaza";
  const cached = cache.get(key);

  if (cached) return cached;

  const size = 512;
  const rng = seededRng(7708);
  const canvas = makeCanvas(size, size);
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#8a8177";
  ctx.fillRect(0, 0, size, size);

  const cells = 8;
  const cell = size / cells;

  for (let y = 0; y < cells; y += 1) {
    for (let x = 0; x < cells; x += 1) {
      const v = 0.75 + rng() * 0.4;
      ctx.fillStyle = `rgb(${128 * v | 0},${120 * v | 0},${110 * v | 0})`;
      ctx.fillRect(x * cell + 1, y * cell + 1, cell - 2, cell - 2);

      if (rng() < 0.16) {
        ctx.fillStyle = "rgba(40,34,26,0.3)";
        ctx.fillRect(x * cell + rng() * cell * 0.5, y * cell + rng() * cell * 0.5, cell * 0.4, cell * 0.35);
      }
    }
  }

  grain(ctx, size, size, 0.07, rng, 2);
  streaks(ctx, size, size, 6, rng, 0.1);

  return toTexture(canvas, key);
}

/** Volute de fumée / vapeur douce pour sprites. */
export function getFableSmokeTexture(): THREE.Texture {
  const key = "smoke";
  const cached = cache.get(key);

  if (cached) return cached;

  const size = 128;
  const rng = seededRng(1213);
  const canvas = makeCanvas(size, size);
  const ctx = canvas.getContext("2d")!;

  ctx.clearRect(0, 0, size, size);

  for (let i = 0; i < 26; i += 1) {
    const x = size / 2 + (rng() - 0.5) * size * 0.5;
    const y = size / 2 + (rng() - 0.5) * size * 0.5;
    const r = 10 + rng() * 26;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(255,255,255,${0.10 + rng() * 0.08})`);
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = toTexture(canvas, key);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  return texture;
}

/** Halo doux pour lampes et lueurs. */
export function getFableGlowTexture(): THREE.Texture {
  const key = "glow";
  const cached = cache.get(key);

  if (cached) return cached;

  const size = 64;
  const canvas = makeCanvas(size, size);
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,0.9)");
  g.addColorStop(0.35, "rgba(255,255,255,0.28)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);

  const texture = toTexture(canvas, key);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  return texture;
}

/**
 * Enseigne en écriture inventée — glyphes anguleux tracés au hasard,
 * jamais une langue réelle. `lit` colore les glyphes façon néon fatigué.
 */
export function getFableSignTexture(seed: number, lit: boolean): THREE.Texture {
  const key = `sign:${seed}:${lit}`;
  const cached = cache.get(key);

  if (cached) return cached;

  const width = 128;
  const height = 256;
  const rng = seededRng(3000 + seed * 131);
  const canvas = makeCanvas(width, height);
  const ctx = canvas.getContext("2d")!;

  const boards = ["#2e2a26", "#3a2c22", "#26302c", "#332430"];
  ctx.fillStyle = boards[seed % boards.length];
  ctx.fillRect(0, 0, width, height);
  grain(ctx, width, height, 0.08, rng, 2);
  ctx.strokeStyle = "rgba(200,190,170,0.35)";
  ctx.lineWidth = 3;
  ctx.strokeRect(4, 4, width - 8, height - 8);

  const litColors = ["#ffb15e", "#7fd4c1", "#f2788a", "#ffd97a"];
  const glyphColor = lit ? litColors[seed % litColors.length] : "#cfc5ae";
  ctx.strokeStyle = glyphColor;
  ctx.lineCap = "round";

  const rows = 3 + Math.floor(rng() * 2);

  for (let r = 0; r < rows; r += 1) {
    const cy = 34 + r * ((height - 60) / rows);
    const glyphs = 2 + Math.floor(rng() * 2);

    for (let gI = 0; gI < glyphs; gI += 1) {
      const cx = 30 + gI * 52 + rng() * 10;
      const s = 14 + rng() * 8;
      ctx.lineWidth = 4 + rng() * 3;
      ctx.beginPath();
      ctx.moveTo(cx - s / 2, cy + s / 2);
      const strokes = 2 + Math.floor(rng() * 3);
      let px = cx - s / 2;
      let py = cy + s / 2;

      for (let st = 0; st < strokes; st += 1) {
        px = cx + (rng() - 0.5) * s * 1.6;
        py = cy + (rng() - 0.5) * s * 1.6;
        ctx.lineTo(px, py);
      }

      ctx.stroke();

      if (rng() < 0.5) {
        ctx.beginPath();
        ctx.arc(cx + (rng() - 0.5) * s, cy + (rng() - 0.5) * s, 2.4, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }

  if (lit) {
    // Halo léger autour des glyphes.
    ctx.globalCompositeOperation = "lighter";
    ctx.filter = "blur(6px)";
    ctx.drawImage(canvas, 0, 0);
    ctx.filter = "none";
    ctx.globalCompositeOperation = "source-over";
  }

  const texture = toTexture(canvas, key);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  return texture;
}

/**
 * Gobo : un polygone blanc sur noir, adouci — sert de masque de projection
 * à un projecteur pour que l'ouverture dessine sa propre lumière au sol.
 */
export function getFableGoboTexture(
  key: string,
  points: Array<[number, number]>,
  bounds: { minX: number; maxX: number; minY: number; maxY: number },
  blurPx = 5
): THREE.Texture {
  const cacheKey = `gobo:${key}`;
  const cached = cache.get(cacheKey);

  if (cached) return cached;

  const size = 256;
  const canvas = makeCanvas(size, size);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, size, size);

  const spanX = bounds.maxX - bounds.minX;
  const spanY = bounds.maxY - bounds.minY;
  const pad = 0.16;
  const toPx = (p: [number, number]): [number, number] => [
    (pad + ((p[0] - bounds.minX) / spanX) * (1 - pad * 2)) * size,
    // Le canvas est en Y descendant : on retourne pour rester en repère monde.
    (1 - (pad + ((p[1] - bounds.minY) / spanY) * (1 - pad * 2))) * size,
  ];

  ctx.filter = `blur(${blurPx}px)`;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  const first = toPx(points[0]);
  ctx.moveTo(first[0], first[1]);

  for (let i = 1; i < points.length; i += 1) {
    const p = toPx(points[i]);
    ctx.lineTo(p[0], p[1]);
  }

  ctx.closePath();
  ctx.fill();
  ctx.filter = "none";

  const texture = toTexture(canvas, cacheKey);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  return texture;
}

/** Ombre de contact — disque sombre à bord doux, posé sous les véhicules. */
export function getFableContactShadowTexture(): THREE.Texture {
  const key = "contact-shadow";
  const cached = cache.get(key);

  if (cached) return cached;

  const size = 64;
  const canvas = makeCanvas(size, size);
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(0,0,0,0.85)");
  g.addColorStop(0.55, "rgba(0,0,0,0.5)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);

  const texture = toTexture(canvas, key);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  return texture;
}

/** Fenêtres éparses pour les silhouettes de fond — points chauds sur noir. */
export function getFableBackdropGlowTexture(): THREE.Texture {
  const key = "backdrop-glow";
  const cached = cache.get(key);

  if (cached) return cached;

  const size = 128;
  const rng = seededRng(5150);
  const canvas = makeCanvas(size, size);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, size, size);

  const cols = 9;
  const rows = 14;

  for (let r = 1; r < rows - 1; r += 1) {
    for (let c = 1; c < cols - 1; c += 1) {
      if (rng() > 0.09) continue;

      const warm = 0.5 + rng() * 0.5;
      ctx.fillStyle = `rgba(${255 * warm | 0},${170 * warm | 0},${80 * warm | 0},0.9)`;
      ctx.fillRect(
        (c / cols) * size + rng() * 2,
        (r / rows) * size + rng() * 2,
        3 + rng() * 3,
        4 + rng() * 3
      );
    }
  }

  return toTexture(canvas, key);
}

/** Tissus étendus (linge) — petites bandes colorées délavées. */
export function getFableClothTexture(): THREE.Texture {
  const key = "cloth";
  const cached = cache.get(key);

  if (cached) return cached;

  const size = 64;
  const rng = seededRng(6621);
  const canvas = makeCanvas(size, size);
  const ctx = canvas.getContext("2d")!;
  const colors = ["#b7745e", "#8fa3b0", "#c7b98a", "#7e8f6e", "#b0a0b8", "#d9cbb2"];
  ctx.fillStyle = colors[Math.floor(rng() * colors.length)];
  ctx.fillRect(0, 0, size, size);
  grain(ctx, size, size, 0.12, rng, 2);

  return toTexture(canvas, key);
}
