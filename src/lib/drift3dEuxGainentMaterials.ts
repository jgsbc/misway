import * as THREE from "three";

/**
 * EUX GAINENT — track-local procedural material/texture factory
 * (DRIFT-IV-BY-EUX-30 realism pass).
 *
 * Strictly local to this track: never imported by `drift3dTextureFactory.ts`
 * or any other landmark, never adds a `Drift3DMaterialKind`. Every texture is
 * a small (128-256px) canvas drawing, cached per kind/size/text so repeated
 * mounts and re-renders share GPU textures — the same pattern already used
 * by `drift3dTextureFactory.ts` and the glass-word texture in
 * `EuxGainentLivingScene.tsx`. No network fetch, no bundled binary asset: the
 * realism upgrade is entirely procedural, avoiding any asset-provenance/
 * licensing question.
 */

const textureCache = new Map<string, THREE.Texture>();

function getCanvasContext(size: number): CanvasRenderingContext2D | null {
  if (typeof document === "undefined") {
    return null;
  }

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  return canvas.getContext("2d");
}

function finalizeTexture(
  context: CanvasRenderingContext2D,
  repeatX: number,
  repeatY: number
): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(context.canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 2;

  return texture;
}

function hashNoise(x: number, y: number): number {
  const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;

  return value - Math.floor(value);
}

/** Dark commercial rubber gym flooring — fine speckle, low sheen. */
export function getEuxGainentRubberFloorTexture(
  repeatX = 3,
  repeatY = 1
): THREE.Texture | null {
  const cacheKey = `rubber:${repeatX}:${repeatY}`;
  const cached = textureCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const size = 128;
  const context = getCanvasContext(size);

  if (!context) {
    return null;
  }

  context.fillStyle = "#26282b";
  context.fillRect(0, 0, size, size);

  for (let y = 0; y < size; y += 2) {
    for (let x = 0; x < size; x += 2) {
      const speck = hashNoise(x, y);

      if (speck > 0.82) {
        const shade = 40 + speck * 30;
        context.fillStyle = `rgba(${shade | 0},${shade | 0},${(shade + 4) | 0},0.6)`;
        context.fillRect(x, y, 2, 2);
      }
    }
  }

  const texture = finalizeTexture(context, repeatX, repeatY);
  textureCache.set(cacheKey, texture);

  return texture;
}

/** Brushed / powder-coated metal — light directional streaks. */
export function getEuxGainentBrushedMetalTexture(
  repeatX = 1,
  repeatY = 1
): THREE.Texture | null {
  const cacheKey = `metal:${repeatX}:${repeatY}`;
  const cached = textureCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const size = 128;
  const context = getCanvasContext(size);

  if (!context) {
    return null;
  }

  context.fillStyle = "#9198a0";
  context.fillRect(0, 0, size, size);

  for (let y = 0; y < size; y += 1) {
    const streak = hashNoise(1, y * 3);
    const shade = 130 + streak * 60;
    context.fillStyle = `rgba(${shade | 0},${(shade + 4) | 0},${(shade + 8) | 0},0.5)`;
    context.fillRect(0, y, size, 1);
  }

  const texture = finalizeTexture(context, repeatX, repeatY);
  textureCache.set(cacheKey, texture);

  return texture;
}

/** Matte black plastic — very subtle noise, near-flat but not a pure solid. */
export function getEuxGainentBlackPlasticTexture(
  repeatX = 1,
  repeatY = 1
): THREE.Texture | null {
  const cacheKey = `plastic:${repeatX}:${repeatY}`;
  const cached = textureCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const size = 64;
  const context = getCanvasContext(size);

  if (!context) {
    return null;
  }

  context.fillStyle = "#17181a";
  context.fillRect(0, 0, size, size);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const speck = hashNoise(x * 2, y * 2);
      const shade = 18 + speck * 10;
      context.fillStyle = `rgba(${shade | 0},${shade | 0},${(shade + 2) | 0},1)`;
      context.fillRect(x, y, 1, 1);
    }
  }

  const texture = finalizeTexture(context, repeatX, repeatY);
  textureCache.set(cacheKey, texture);

  return texture;
}

const EUX_GAINENT_SCREEN_TEXTURE_CACHE_LIMIT = 16;
const EUX_GAINENT_CONSOLE_TEXTURE_CACHE_LIMIT = 48;

function readCachedTexture(
  cache: Map<string, THREE.CanvasTexture>,
  key: string
): THREE.CanvasTexture | null {
  const texture = cache.get(key) ?? null;

  if (texture) {
    // Promote live entries so bounded eviction always removes the oldest
    // state, never one that has just been reused by a material.
    cache.delete(key);
    cache.set(key, texture);
  }

  return texture;
}

function cacheTexture(
  cache: Map<string, THREE.CanvasTexture>,
  key: string,
  texture: THREE.CanvasTexture,
  limit: number
): THREE.CanvasTexture {
  cache.set(key, texture);

  while (cache.size > limit) {
    const oldestKey = cache.keys().next().value as string | undefined;
    if (oldestKey === undefined) break;
    const oldestTexture = cache.get(oldestKey);
    cache.delete(oldestKey);
    oldestTexture?.dispose();
  }

  return texture;
}

const screenTextureCache = new Map<string, THREE.CanvasTexture>();

function drawGlowTrackedLine(
  context: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  centerY: number,
  fontPx: number,
  letterSpacing: number
): void {
  context.font = `700 ${fontPx}px "Courier New", monospace`;
  context.textBaseline = "middle";
  const letters = text.split("");
  const letterWidths = letters.map((letter) => context.measureText(letter).width);
  const totalWidth =
    letterWidths.reduce((sum, w) => sum + w, 0) +
    letterSpacing * Math.max(0, letters.length - 1);
  let cursorX = centerX - totalWidth / 2;

  for (let index = 0; index < letters.length; index += 1) {
    const letter = letters[index];
    const letterWidth = letterWidths[index];
    const glyphCenterX = cursorX + letterWidth / 2;

    context.save();
    context.shadowColor = "rgba(160,210,255,0.85)";
    context.shadowBlur = fontPx * 0.27;
    context.fillStyle = "rgba(210,235,255,0.9)";
    context.textAlign = "center";
    context.fillText(letter, glyphCenterX, centerY);
    context.restore();

    context.fillStyle = "#eef8ff";
    context.textAlign = "center";
    context.fillText(letter, glyphCenterX, centerY);

    cursorX += letterWidth + letterSpacing;
  }
}

/**
 * The storefront "commercial display" — a dark measurement-apparatus panel
 * (bezel, grid, alignment marks, faint scan lines, deterministic grime)
 * combining the one dominant headline word with two to five small secondary
 * operational fragments (DRIFT-IV-BY-EUX-30 rework V3, owner review #2 —
 * "il manque du fond"). Reference language: commercial gym equipment /
 * airport-transit typography / measurement apparatus — never cyberpunk/
 * terminal-hacker/sci-fi HUD. One texture per distinct `(headline,
 * secondaryLines)` state, built once and cached; the caller swaps the
 * texture reference only when the resolved screen state actually changes
 * (§23's own performance rule — never once per frame, never one mesh per
 * text line).
 */
export function getEuxGainentScreenTexture(
  headline: string | null,
  secondaryLines: readonly string[]
): THREE.CanvasTexture {
  const cacheKey = `${headline ?? "∅"}|${secondaryLines.join("")}`;
  const cached = readCachedTexture(screenTextureCache, cacheKey);

  if (cached) {
    return cached;
  }

  const width = 640;
  const height = 360;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (context) {
    context.clearRect(0, 0, width, height);

    const bezelInset = 8;
    const innerX = bezelInset;
    const innerY = bezelInset;
    const innerW = width - bezelInset * 2;
    const innerH = height - bezelInset * 2;

    // Panel bezel.
    context.fillStyle = "rgba(8,12,16,0.78)";
    context.fillRect(innerX, innerY, innerW, innerH);
    context.strokeStyle = "rgba(180,196,214,0.4)";
    context.lineWidth = 2;
    context.strokeRect(innerX, innerY, innerW, innerH);

    // Corner alignment marks — measurement-apparatus reference, not sci-fi HUD.
    const markLength = 14;
    context.strokeStyle = "rgba(180,196,214,0.55)";
    context.lineWidth = 1.5;
    for (const [cx, cy, dx, dy] of [
      [innerX, innerY, 1, 1],
      [innerX + innerW, innerY, -1, 1],
      [innerX, innerY + innerH, 1, -1],
      [innerX + innerW, innerY + innerH, -1, -1],
    ] as const) {
      context.beginPath();
      context.moveTo(cx, cy + dy * markLength);
      context.lineTo(cx, cy);
      context.lineTo(cx + dx * markLength, cy);
      context.stroke();
    }

    // Faint dot-matrix ground.
    context.fillStyle = "rgba(140,170,200,0.08)";
    const dotStep = 10;
    for (let y = innerY + 12; y < innerY + innerH - 12; y += dotStep) {
      for (let x = innerX + 12; x < innerX + innerW - 12; x += dotStep) {
        context.beginPath();
        context.arc(x, y, 1, 0, Math.PI * 2);
        context.fill();
      }
    }

    // Faint horizontal refresh/scan artifacts — subtle, never a strobe.
    context.strokeStyle = "rgba(200,220,240,0.05)";
    context.lineWidth = 1;
    for (let y = innerY + 6; y < innerY + innerH; y += 5) {
      context.beginPath();
      context.moveTo(innerX, y);
      context.lineTo(innerX + innerW, y);
      context.stroke();
    }

    const hasSecondary = secondaryLines.length > 0;
    const headlineCenterY = hasSecondary
      ? innerY + innerH * 0.32
      : innerY + innerH * 0.5;

    if (headline) {
      drawGlowTrackedLine(context, headline, width / 2, headlineCenterY, 50, 6);
    }

    if (hasSecondary) {
      // Separator between the headline zone and the metadata grid.
      const sepY = innerY + innerH * 0.5;
      context.strokeStyle = "rgba(180,196,214,0.25)";
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(innerX + 24, sepY);
      context.lineTo(innerX + innerW - 24, sepY);
      context.stroke();

      const rowStartY = sepY + 26;
      const rowStep = (innerY + innerH - 20 - rowStartY) / Math.max(1, secondaryLines.length - 1 || 1);
      context.font = "600 20px \"Courier New\", monospace";
      context.textAlign = "left";
      context.textBaseline = "middle";

      secondaryLines.forEach((line, index) => {
        const y =
          secondaryLines.length === 1
            ? rowStartY
            : rowStartY + rowStep * index;
        context.fillStyle = "rgba(200,224,244,0.82)";
        context.fillText(line, innerX + 30, y);

        if (index < secondaryLines.length - 1) {
          context.strokeStyle = "rgba(180,196,214,0.12)";
          context.beginPath();
          context.moveTo(innerX + 24, y + rowStep / 2);
          context.lineTo(innerX + innerW - 24, y + rowStep / 2);
          context.stroke();
        }
      });
    }

    // Deterministic grime — same authored smudge/scratch pattern baked
    // directly into every state's texture (no separate overlay mesh).
    const blobs: ReadonlyArray<readonly [number, number, number, number]> = [
      [60, 70, 34, 0.045],
      [500, 50, 26, 0.035],
      [180, 300, 40, 0.04],
      [560, 260, 28, 0.03],
      [320, 40, 20, 0.035],
    ];

    for (const [bx, by, radius, alpha] of blobs) {
      const gradient = context.createRadialGradient(bx, by, 0, bx, by, radius);
      gradient.addColorStop(0, `rgba(180,190,200,${alpha})`);
      gradient.addColorStop(1, "rgba(180,190,200,0)");
      context.fillStyle = gradient;
      context.fillRect(bx - radius, by - radius, radius * 2, radius * 2);
    }

    context.strokeStyle = "rgba(255,255,255,0.05)";
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(30, height - 30);
    context.lineTo(160, height - 90);
    context.moveTo(420, height - 300);
    context.lineTo(520, height - 260);
    context.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return cacheTexture(
    screenTextureCache,
    cacheKey,
    texture,
    EUX_GAINENT_SCREEN_TEXTURE_CACHE_LIMIT
  );
}

/** Disposes every cached screen-state texture (call once on final unmount). */
export function disposeEuxGainentScreenTextures(): void {
  screenTextureCache.forEach((texture) => texture.dispose());
  screenTextureCache.clear();
}

const consoleReadoutCache = new Map<string, THREE.CanvasTexture>();

/**
 * Small per-station console readout — plausible ordinary sports data
 * (`TIME`/`DIST`/`RPM`/`LEVEL`, up to four lines) rendered once per distinct
 * combination and cached; the caller regenerates only when the displayed
 * lines actually change (same discipline as the main screen texture). The
 * three stations' consoles are designed to converge toward near-identical
 * values despite different exercises (rework V3, §24) — that convergence is
 * computed by the caller, this function only renders whatever lines it is
 * given.
 */
export function getEuxGainentConsoleReadoutTexture(
  ...lines: readonly string[]
): THREE.CanvasTexture {
  const cacheKey = lines.join("|");
  const cached = readCachedTexture(consoleReadoutCache, cacheKey);

  if (cached) {
    return cached;
  }

  const width = 180;
  const height = 110;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (context) {
    context.fillStyle = "#0c1013";
    context.fillRect(0, 0, width, height);
    context.strokeStyle = "rgba(150,170,190,0.4)";
    context.lineWidth = 2;
    context.strokeRect(2, 2, width - 4, height - 4);

    const rowHeight = height / Math.max(1, lines.length);

    lines.forEach((line, index) => {
      context.font =
        index === 0
          ? "700 22px \"Courier New\", monospace"
          : "600 16px \"Courier New\", monospace";
      context.fillStyle = index === 0 ? "#8fe0a8" : "#6fb98c";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(line, width / 2, rowHeight * (index + 0.5));
    });
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return cacheTexture(
    consoleReadoutCache,
    cacheKey,
    texture,
    EUX_GAINENT_CONSOLE_TEXTURE_CACHE_LIMIT
  );
}

/** Disposes every cached console-readout texture (call once on final unmount). */
export function disposeEuxGainentConsoleReadoutTextures(): void {
  consoleReadoutCache.forEach((texture) => texture.dispose());
  consoleReadoutCache.clear();
}
