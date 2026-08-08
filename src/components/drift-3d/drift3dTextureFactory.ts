import * as THREE from "three";
import type { Drift3DMaterialKind } from "@/lib/drift3dLandmarks";

/**
 * Material textures (realism bible rule: no flat untextured color).
 * Photo-sourced CC0 diffuses (Poly Haven, public/textures) cover the natural
 * materials; procedural canvases remain for the man-made grids (windows,
 * plaster, granite, thatch) until the full PBR pass. Cached per kind+repeat
 * so meshes share GPU textures.
 */

const photoTextureFiles: Partial<Record<Drift3DMaterialKind, string>> = {
  rock: "/textures/rock_boulder_dry_diff_1k.jpg",
  brick: "/textures/red_brick_03_diff_1k.jpg",
  concrete: "/textures/concrete_wall_008_diff_1k.jpg",
  wood: "/textures/brown_planks_07_diff_1k.jpg",
  sand: "/textures/aerial_beach_01_diff_1k.jpg",
};

const photoNormalFiles: Partial<Record<Drift3DMaterialKind, string>> = {
  rock: "/textures/rock_boulder_dry_nor_gl_1k.jpg",
  brick: "/textures/red_brick_03_nor_gl_1k.jpg",
  concrete: "/textures/concrete_wall_008_nor_gl_1k.jpg",
  wood: "/textures/brown_planks_07_nor_gl_1k.jpg",
  sand: "/textures/aerial_beach_01_nor_gl_1k.jpg",
};

const textureCache = new Map<string, THREE.Texture>();
const photoLoader = new THREE.TextureLoader();

export type DriftMaterialMaps = {
  map: THREE.Texture | null;
  normalMap: THREE.Texture | null;
};

/** Diffuse + normal map pair for a material kind (normal only for photo kinds). */
export function getDriftMaterialMaps(
  kind: Drift3DMaterialKind,
  repeatX = 1,
  repeatY = 1
): DriftMaterialMaps {
  const map = getDriftMaterialTexture(kind, repeatX, repeatY);
  const normalFile = photoNormalFiles[kind];

  if (!normalFile || typeof document === "undefined") {
    return { map, normalMap: null };
  }

  const cacheKey = `${kind}:nor:${repeatX}:${repeatY}`;
  let normalMap = textureCache.get(cacheKey) ?? null;

  if (!normalMap) {
    normalMap = photoLoader.load(normalFile);
    normalMap.wrapS = THREE.RepeatWrapping;
    normalMap.wrapT = THREE.RepeatWrapping;
    normalMap.repeat.set(repeatX, repeatY);
    normalMap.colorSpace = THREE.NoColorSpace;
    normalMap.anisotropy = 2;
    textureCache.set(cacheKey, normalMap);
  }

  return { map, normalMap };
}

function createCanvas(size: number) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  return canvas;
}

function noise(x: number, y: number) {
  const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;

  return value - Math.floor(value);
}

function paintNoise(
  context: CanvasRenderingContext2D,
  size: number,
  base: string,
  amount: number,
  cellSize = 2
) {
  context.fillStyle = base;
  context.fillRect(0, 0, size, size);

  for (let y = 0; y < size; y += cellSize) {
    for (let x = 0; x < size; x += cellSize) {
      const shade = (noise(x, y) - 0.5) * amount;
      context.fillStyle =
        shade > 0
          ? `rgba(255,255,255,${shade})`
          : `rgba(0,0,0,${-shade})`;
      context.fillRect(x, y, cellSize, cellSize);
    }
  }
}

function drawBrick(context: CanvasRenderingContext2D, size: number) {
  context.fillStyle = "#9a8f80";
  context.fillRect(0, 0, size, size);

  const rows = 12;
  const columns = 6;
  const brickHeight = size / rows;
  const brickWidth = size / columns;

  for (let row = 0; row < rows; row += 1) {
    const offset = row % 2 === 0 ? 0 : brickWidth / 2;

    for (let column = -1; column < columns; column += 1) {
      const jitter = noise(column * 7 + 1, row * 13 + 1);
      const red = 118 + jitter * 42;
      const green = 66 + jitter * 26;
      const blue = 52 + jitter * 18;
      context.fillStyle = `rgb(${red | 0},${green | 0},${blue | 0})`;
      context.fillRect(
        column * brickWidth + offset + 1,
        row * brickHeight + 1,
        brickWidth - 2,
        brickHeight - 2
      );
    }
  }
}

function drawWindows(
  context: CanvasRenderingContext2D,
  size: number,
  mode: "day" | "night"
) {
  context.fillStyle = mode === "day" ? "#5d636c" : "#151a22";
  context.fillRect(0, 0, size, size);

  const columns = 5;
  // One procedural tile represents two real building levels. Authored
  // textureRepeat.y can add floors deliberately; the previous eight rows per
  // tile made a six-metre Birth Yard block read as a 16-storey tower.
  const rows = 2;
  const cellWidth = size / columns;
  const cellHeight = size / rows;

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const jitter = noise(column * 17 + 3, row * 23 + 5);

      if (mode === "day") {
        const glass = 150 + jitter * 60;
        context.fillStyle = `rgb(${(glass * 0.72) | 0},${(glass * 0.84) | 0},${glass | 0})`;
      } else if (jitter > 0.8) {
        context.fillStyle = "#e5b45e";
      } else {
        context.fillStyle = "#1d2430";
      }

      context.fillRect(
        column * cellWidth + cellWidth * 0.22,
        row * cellHeight + cellHeight * 0.2,
        cellWidth * 0.56,
        cellHeight * 0.55
      );
    }
  }
}

function drawWood(context: CanvasRenderingContext2D, size: number) {
  context.fillStyle = "#7c5c3e";
  context.fillRect(0, 0, size, size);

  for (let y = 0; y < size; y += 3) {
    const jitter = noise(1, y);
    context.fillStyle = `rgba(${40 + jitter * 40},${26 + jitter * 26},${14 + jitter * 16},0.35)`;
    context.fillRect(0, y, size, 1 + (jitter > 0.6 ? 1 : 0));
  }
}

export function getDriftMaterialTexture(
  kind: Drift3DMaterialKind,
  repeatX = 1,
  repeatY = 1
): THREE.Texture | null {
  if (typeof document === "undefined") {
    return null;
  }

  const cacheKey = `${kind}:${repeatX}:${repeatY}`;
  const cached = textureCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const photoFile = photoTextureFiles[kind];

  if (photoFile) {
    const photoTexture = photoLoader.load(photoFile);
    photoTexture.wrapS = THREE.RepeatWrapping;
    photoTexture.wrapT = THREE.RepeatWrapping;
    photoTexture.repeat.set(repeatX, repeatY);
    photoTexture.colorSpace = THREE.SRGBColorSpace;
    photoTexture.anisotropy = 2;
    textureCache.set(cacheKey, photoTexture);

    return photoTexture;
  }

  const size = 128;
  const canvas = createCanvas(size);
  const context = canvas.getContext("2d");

  if (!context) {
    return null;
  }

  switch (kind) {
    case "brick":
      drawBrick(context, size);
      break;
    case "windowsDay":
      drawWindows(context, size, "day");
      break;
    case "windowsNight":
      drawWindows(context, size, "night");
      break;
    case "wood":
      drawWood(context, size);
      break;
    case "concrete":
      paintNoise(context, size, "#98948a", 0.1, 2);
      break;
    case "granite":
      paintNoise(context, size, "#7d7d80", 0.14, 1);
      break;
    case "rock":
      paintNoise(context, size, "#4f4c45", 0.2, 3);
      break;
    case "plaster":
      paintNoise(context, size, "#d8d2c4", 0.05, 2);
      break;
    case "sand":
      paintNoise(context, size, "#ddd0ae", 0.07, 1);
      break;
    case "thatch":
      paintNoise(context, size, "#a9834e", 0.16, 2);
      break;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 2;
  textureCache.set(cacheKey, texture);

  return texture;
}
