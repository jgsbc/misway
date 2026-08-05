import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

/**
 * Génère l'état cartographique de Fable depuis la topologie runtime.
 *
 *   npm run cartography
 *
 * Rien n'est redessiné ici : le script importe les mêmes modules que le lab
 * et sérialise ce qu'ils produisent. Les SVG sont écrits à la main en texte
 * pour éviter toute dépendance cartographique lourde.
 */

const OUT_DIR = path.join("docs", "evidence", "fable-cartography-current");

function revision() {
  try {
    const hash = execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
    const dirty = execSync("git status --porcelain", { encoding: "utf8" }).trim().length > 0;

    return dirty ? `${hash}+local` : hash;
  } catch {
    return null;
  }
}

const { buildCartographySnapshot, CARTO_CRUISE_SPEED } = await import(
  pathToFileURL(
    path.resolve("src/components/drift-3d/fable/fableCartography.ts")
  ).href
);

const snapshot = buildCartographySnapshot(revision());

fs.mkdirSync(OUT_DIR, { recursive: true });

/* ── Sérialisation ────────────────────────────────────────────────────── */

const write = (name, data) =>
  fs.writeFileSync(path.join(OUT_DIR, name), data, "utf8");

write("cartography-snapshot.json", JSON.stringify(snapshot, null, 1));
write(
  "route-profiles.json",
  JSON.stringify(
    snapshot.routes.map((r) => ({
      id: r.id,
      kind: r.kind,
      length: r.length,
      maxUphill: r.maxUphill,
      maxDownhill: r.maxDownhill,
      minY: r.minY,
      maxY: r.maxY,
      samples: r.samples,
    })),
    null,
    1
  )
);
write("track-distribution.json", JSON.stringify(snapshot.tracks, null, 1));
write("sightlines.json", JSON.stringify(snapshot.sightlines, null, 1));
write("pacing.json", JSON.stringify(snapshot.pacing, null, 1));

// Relecture : un instantané qui ne se recharge pas ne vaut rien.
const roundTrip = JSON.parse(
  fs.readFileSync(path.join(OUT_DIR, "cartography-snapshot.json"), "utf8")
);

if (roundTrip.routes.length !== snapshot.routes.length) {
  throw new Error("cartography snapshot failed to round-trip");
}

/* ── Rendus SVG ───────────────────────────────────────────────────────── */

const ERA_COLOR = {
  entry: "#8a7ad0",
  "birth-yard": "#e0913f",
  "older-shadows": "#4f9bd6",
  "vegetative-field": "#6faa5e",
  "new-signal": "#d2603f",
};
const FORM_COLOR = {
  place: "#e0913f",
  detour: "#4f9bd6",
  event: "#c76fd0",
  state: "#6faa5e",
  unresolved: "#7d7d85",
};

function planSvg() {
  const { minX, maxX, minZ, maxZ } = snapshot.bounds;
  const pad = 20;
  const w = maxX - minX + pad * 2;
  const h = maxZ - minZ + pad * 2;
  const px = (x) => (x - minX + pad).toFixed(1);
  const py = (z) => (maxZ - z + pad).toFixed(1);
  const parts = [];

  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">`,
    `<rect width="${w}" height="${h}" fill="#16242e"/>`
  );

  for (const region of snapshot.regions) {
    const color = ERA_COLOR[region.era] ?? "#888";
    parts.push(
      `<circle cx="${px(region.x)}" cy="${py(region.z)}" r="${region.radius}" fill="${
        region.relief === "water" ? "#12202a" : color
      }" fill-opacity="${region.relief === "water" ? 0.55 : 0.1}" stroke="${color}" stroke-opacity="0.5" stroke-dasharray="6 5"/>`
    );
  }

  parts.push('<g stroke="#8fd0e8" stroke-width="1.4" stroke-opacity="0.85">');

  for (const s of snapshot.coastline) {
    parts.push(
      `<line x1="${px(s[0])}" y1="${py(s[1])}" x2="${px(s[2])}" y2="${py(s[3])}"/>`
    );
  }

  parts.push("</g>");

  for (const route of snapshot.routes) {
    const pts = route.samples.map((s) => `${px(s.x)},${py(s.z)}`).join(" ");
    parts.push(
      `<polyline points="${pts}" fill="none" stroke="${
        route.kind === "spine" ? "#f2f2f2" : "#f0b45e"
      }" stroke-width="${route.kind === "spine" ? 3.4 : 2.4}" stroke-linejoin="round"/>`
    );
  }

  for (const t of snapshot.tracks) {
    const color = FORM_COLOR[t.form];
    parts.push(
      `<circle cx="${px(t.x)}" cy="${py(t.z)}" r="${t.radius}" fill="${color}" fill-opacity="0.14" stroke="${color}" stroke-opacity="0.7"/>`,
      `<text x="${px(t.x)}" y="${py(t.z) - t.radius - 3}" fill="${color}" font-size="7.5" text-anchor="middle" font-family="monospace">${t.label}</text>`
    );
  }

  for (const l of snapshot.landmarks) {
    parts.push(
      `<path d="M${px(l.x)},${py(l.z) - 6} L${Number(px(l.x)) + 5},${Number(py(l.z)) + 4} L${Number(px(l.x)) - 5},${Number(py(l.z)) + 4} Z" fill="#ffd9a0"/>`,
      `<text x="${Number(px(l.x)) + 8}" y="${Number(py(l.z)) + 4}" fill="#ffd9a0" font-size="8" font-family="monospace">${l.label}</text>`
    );
  }

  for (const c of snapshot.intersections) {
    parts.push(
      `<circle cx="${px(c.x)}" cy="${py(c.z)}" r="5" fill="none" stroke="${
        c.kind === "collision" ? "#ff5a4a" : "#8fd0e8"
      }" stroke-width="1.6"/>`
    );
  }

  for (const r of snapshot.recoveryPoints) {
    parts.push(`<circle cx="${px(r.x)}" cy="${py(r.z)}" r="4" fill="#7cf2a0"/>`);
  }

  parts.push("</svg>");

  return parts.join("\n");
}

function elevationSvg(route) {
  const w = 1000;
  const h = 190;
  const minY = Math.min(route.minY, snapshot.seaLevel, ...route.samples.map((s) => s.terrainY));
  const maxY = Math.max(route.maxY, ...route.samples.map((s) => s.terrainY));
  const span = Math.max(1, maxY - minY);
  const px = (s) => ((s / Math.max(1, route.length)) * w).toFixed(1);
  const py = (y) => (h - ((y - minY) / span) * (h - 24) - 12).toFixed(1);

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">`,
    `<rect width="${w}" height="${h}" fill="#141519"/>`,
    `<line x1="0" y1="${py(snapshot.seaLevel)}" x2="${w}" y2="${py(snapshot.seaLevel)}" stroke="#3a6b82" stroke-dasharray="5 4"/>`,
    `<polyline points="${route.samples.map((s) => `${px(s.s)},${py(s.terrainY)}`).join(" ")}" fill="none" stroke="#6d6a5e" stroke-width="1.6"/>`,
    `<polyline points="${route.samples.map((s) => `${px(s.s)},${py(s.roadY)}`).join(" ")}" fill="none" stroke="#f0b45e" stroke-width="2"/>`,
    `<text x="6" y="14" fill="#d8d8d8" font-size="11" font-family="monospace">${route.id} — ${route.length.toFixed(0)} m, ${route.minY.toFixed(1)} to ${route.maxY.toFixed(1)} m</text>`,
    "</svg>",
  ].join("\n");
}

function streamingSvg() {
  const lines = [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 320" width="900" height="320">',
    '<rect width="900" height="320" fill="#141519"/>',
  ];
  let y = 30;

  for (const rule of snapshot.streaming) {
    lines.push(
      `<text x="16" y="${y}" fill="#e8e8e8" font-size="13" font-family="monospace">${rule.id} — mount +${rule.mountRadius} m — ${rule.regionIds.join(", ")}</text>`
    );
    y += 26;
  }

  y += 14;
  lines.push(
    `<text x="16" y="${y}" fill="#ffd9a0" font-size="13" font-family="monospace">Amers persistants</text>`
  );
  y += 24;

  for (const l of snapshot.landmarks) {
    lines.push(
      `<text x="16" y="${y}" fill="#c9c9c9" font-size="12" font-family="monospace">${l.label} — sommet ${(l.groundY + l.height).toFixed(0)} m, masqué &lt; ${l.hideWithin} m</text>`
    );
    y += 22;
  }

  lines.push("</svg>");

  return lines.join("\n");
}

write("peninsula-plan.svg", planSvg());
write("regions-and-streaming.svg", streamingSvg());

const spine = snapshot.routes.find((r) => r.id === "spine") ?? snapshot.routes[0];
write("spine-elevation.svg", elevationSvg(spine));

for (const route of snapshot.routes) {
  if (route.id === spine.id) continue;

  write(`elevation-${route.id}.svg`, elevationSvg(route));
}

/* ── PNG ──────────────────────────────────────────────────────────────── */

let pngNote = "peninsula-plan.png : non généré (rendu PNG optionnel, non installé).";

try {
  const { default: sharp } = await import("sharp");
  await sharp(Buffer.from(planSvg())).png().toFile(path.join(OUT_DIR, "peninsula-plan.png"));
  pngNote = "peninsula-plan.png : généré via sharp.";
} catch {
  // Aucune dépendance graphique n'est ajoutée pour cela : le SVG fait foi.
}

/* ── README ───────────────────────────────────────────────────────────── */

write(
  "README.md",
  [
    "# Fable — état cartographique généré",
    "",
    `- Commande : \`npm run cartography\``,
    `- Révision source : ${snapshot.sourceRevision ?? "inconnue"}`,
    `- Généré le : ${snapshot.generatedAt}`,
    `- Modules source : ${snapshot.sourceModules.join(", ")}`,
    "",
    "## Limites connues",
    "",
    "- Le trait de côte est un contour par marching squares au pas de 9 m : il approxime le rivage, il ne le lisse pas.",
    `- Les durées supposent une allure constante de ${CARTO_CRUISE_SPEED} m/s, sans arrêt ni détour.`,
    "- Les formes de tracks non renseignées sont marquées `unresolved` : c'est l'état réel, pas une omission.",
    "- Les tests de visibilité échantillonnent le terrain seul ; ni le bâti, ni la végétation, ni la brume ne sont pris en compte.",
    "- " + pngNote,
    "",
  ].join("\n")
);

console.log(`cartography written to ${OUT_DIR}`);
console.log(
  `routes ${snapshot.routes.length} · tracks ${snapshot.tracks.length} · coastline segments ${snapshot.coastline.length} · warnings ${snapshot.warnings.length}`
);
