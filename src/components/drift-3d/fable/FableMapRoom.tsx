"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CARTO_CRUISE_SPEED,
  buildCartographySnapshot,
  type CartoRoute,
  type CartographySnapshot,
} from "@/components/drift-3d/fable/fableCartography";

/**
 * FABLE — salle des cartes.
 *
 * Vue de développement seulement. Tout ce qui est affiché ici est
 * échantillonné depuis les modules de topologie du monde : si la carte est
 * fausse, le monde l'est aussi. Aucune coordonnée n'est redessinée à la
 * main, aucune scène 3D n'est montée.
 */

const ERA_COLOR: Record<string, string> = {
  entry: "#8a7ad0",
  "birth-yard": "#e0913f",
  "older-shadows": "#4f9bd6",
  "vegetative-field": "#6faa5e",
  "new-signal": "#d2603f",
};

const FORM_COLOR: Record<string, string> = {
  place: "#e0913f",
  detour: "#4f9bd6",
  event: "#c76fd0",
  state: "#6faa5e",
  unresolved: "#7d7d85",
};

type View = "plan" | "elevation" | "streaming" | "tracks" | "sightlines" | "pacing";

export default function FableMapRoom() {
  // L'instantané est daté à la génération : le calculer au rendu serveur
  // puis à l'hydratation produirait deux valeurs différentes. Il est donc
  // construit une seule fois, côté client.
  const [snapshot, setSnapshot] = useState<CartographySnapshot | null>(null);
  const [view, setView] = useState<View>("plan");

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (!cancelled) setSnapshot(buildCartographySnapshot(null));
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!snapshot) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0f1013]">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-neutral-500">
          Échantillonnage de la topologie…
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f1013] px-5 py-6 text-neutral-200">
      <header className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="font-mono text-[11px] uppercase tracking-[0.34em] text-neutral-400">
            MISWΛY · Fable — salle des cartes
          </h1>
          <p className="mt-1 font-mono text-[10px] text-neutral-500">
            État généré depuis {snapshot.sourceModules.join(", ")} ·{" "}
            {snapshot.routes.length} routes · {snapshot.tracks.length} tracks ·{" "}
            {snapshot.warnings.length} signaux
          </p>
        </div>
        <nav className="flex flex-wrap gap-1.5">
          {(
            [
              ["plan", "Plan"],
              ["elevation", "Altitudes"],
              ["streaming", "Régions"],
              ["tracks", "Tracks"],
              ["sightlines", "Vues"],
              ["pacing", "Rythme"],
            ] as Array<[View, string]>
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setView(id)}
              className={`rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] transition ${
                view === id
                  ? "border-neutral-200 bg-neutral-200 text-neutral-900"
                  : "border-neutral-700 text-neutral-400 hover:border-neutral-500"
              }`}
            >
              {label}
            </button>
          ))}
          <Link
            href="/drift-greybox-lab"
            className="rounded-full border border-neutral-700 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-400 transition hover:border-neutral-500"
          >
            ↩ Lab
          </Link>
        </nav>
      </header>

      {view === "plan" ? <PlanView snapshot={snapshot} /> : null}
      {view === "elevation" ? <ElevationView snapshot={snapshot} /> : null}
      {view === "streaming" ? <StreamingView snapshot={snapshot} /> : null}
      {view === "tracks" ? <TrackView snapshot={snapshot} /> : null}
      {view === "sightlines" ? <SightlineView snapshot={snapshot} /> : null}
      {view === "pacing" ? <PacingView snapshot={snapshot} /> : null}

      <WarningList snapshot={snapshot} />
    </main>
  );
}

/* ── A. Plan ──────────────────────────────────────────────────────────── */

function PlanView({ snapshot }: { snapshot: CartographySnapshot }) {
  const { minX, maxX, minZ, maxZ } = snapshot.bounds;
  const pad = 20;
  const w = maxX - minX + pad * 2;
  const h = maxZ - minZ + pad * 2;
  // Nord en haut : on inverse z, sinon la carte contredit le monde.
  const px = (x: number) => x - minX + pad;
  const py = (z: number) => maxZ - z + pad;

  return (
    <section>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full rounded border border-neutral-800 bg-[#141519]"
        style={{ maxHeight: "76vh" }}
      >
        <defs>
          <pattern id="sea" width="12" height="12" patternUnits="userSpaceOnUse">
            <rect width="12" height="12" fill="#16242e" />
            <path d="M0 6h12" stroke="#1d3040" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width={w} height={h} fill="url(#sea)" />

        {/* Régions : disques d'influence, la géographie molle du monde. */}
        {snapshot.regions.map((region) => (
          <circle
            key={region.id}
            cx={px(region.x)}
            cy={py(region.z)}
            r={region.radius}
            fill={region.relief === "water" ? "#12202a" : ERA_COLOR[region.era]}
            fillOpacity={region.relief === "water" ? 0.55 : 0.1}
            stroke={ERA_COLOR[region.era]}
            strokeOpacity={0.5}
            strokeWidth={1.2}
            strokeDasharray="6 5"
          />
        ))}

        {/* Trait de côte échantillonné au niveau de la mer. */}
        <g stroke="#8fd0e8" strokeWidth={1.4} strokeOpacity={0.85}>
          {snapshot.coastline.map((s, i) => (
            <line key={i} x1={px(s[0])} y1={py(s[1])} x2={px(s[2])} y2={py(s[3])} />
          ))}
        </g>

        {/* Routes. */}
        {snapshot.routes.map((route) => (
          <polyline
            key={route.id}
            points={route.samples.map((s) => `${px(s.x)},${py(s.z)}`).join(" ")}
            fill="none"
            stroke={route.kind === "spine" ? "#f2f2f2" : "#f0b45e"}
            strokeWidth={route.kind === "spine" ? 3.4 : 2.4}
            strokeOpacity={0.95}
            strokeLinejoin="round"
          />
        ))}

        {/* Nœuds de route. */}
        {snapshot.routes.flatMap((route) =>
          route.samples
            .filter((_, i) => i % 12 === 0)
            .map((s, i) => (
              <circle
                key={`${route.id}-${i}`}
                cx={px(s.x)}
                cy={py(s.z)}
                r={1.4}
                fill="#ffffff"
                fillOpacity={0.35}
              />
            ))
        )}

        {/* Croisements. */}
        {snapshot.intersections.map((c, i) => (
          <g key={i}>
            <circle
              cx={px(c.x)}
              cy={py(c.z)}
              r={5}
              fill="none"
              stroke={c.kind === "collision" ? "#ff5a4a" : "#8fd0e8"}
              strokeWidth={1.6}
            />
            <text x={px(c.x) + 7} y={py(c.z)} fill="#8fd0e8" fontSize={7}>
              {c.kind} {c.deltaY.toFixed(1)}m
            </text>
          </g>
        ))}

        {/* Amers. */}
        {snapshot.landmarks.map((l) => (
          <g key={l.id}>
            <path
              d={`M${px(l.x)},${py(l.z) - 6} L${px(l.x) + 5},${py(l.z) + 4} L${px(l.x) - 5},${py(l.z) + 4} Z`}
              fill="#ffd9a0"
              fillOpacity={0.9}
            />
            <text x={px(l.x) + 8} y={py(l.z) + 4} fill="#ffd9a0" fontSize={8}>
              {l.label}
            </text>
          </g>
        ))}

        {/* Ancres de tracks. */}
        {snapshot.tracks.map((t) => (
          <g key={t.slug}>
            <circle
              cx={px(t.x)}
              cy={py(t.z)}
              r={t.radius}
              fill={FORM_COLOR[t.form]}
              fillOpacity={0.14}
              stroke={FORM_COLOR[t.form]}
              strokeOpacity={0.7}
              strokeWidth={1}
            />
            <text
              x={px(t.x)}
              y={py(t.z) - t.radius - 3}
              fill={FORM_COLOR[t.form]}
              fontSize={7.5}
              textAnchor="middle"
            >
              {t.label}
            </text>
          </g>
        ))}

        {/* Spawn et points de reprise. */}
        {snapshot.recoveryPoints.map((r) => (
          <g key={r.id}>
            <circle cx={px(r.x)} cy={py(r.z)} r={4} fill="#7cf2a0" />
            <text x={px(r.x) + 7} y={py(r.z) + 3} fill="#7cf2a0" fontSize={8}>
              {r.id}
            </text>
          </g>
        ))}

        {/* Direction du large. */}
        <text x={px(120)} y={py(minZ + 30)} fill="#8fd0e8" fontSize={11} textAnchor="middle">
          ↓ océan
        </text>
      </svg>

      <Legend
        items={[
          ["#f2f2f2", "épine dorsale"],
          ["#f0b45e", "branche / boucle"],
          ["#8fd0e8", "trait de côte"],
          ["#ffd9a0", "amer lointain"],
          ["#7cf2a0", "reprise"],
          ["#e0913f", "forme : lieu"],
          ["#4f9bd6", "forme : détour"],
          ["#7d7d85", "forme : non résolue"],
        ]}
      />
    </section>
  );
}

/* ── B. Altitudes ─────────────────────────────────────────────────────── */

function ElevationView({ snapshot }: { snapshot: CartographySnapshot }) {
  return (
    <section className="space-y-5">
      {snapshot.routes.map((route) => (
        <ElevationProfile key={route.id} route={route} seaLevel={snapshot.seaLevel} />
      ))}
    </section>
  );
}

function ElevationProfile({ route, seaLevel }: { route: CartoRoute; seaLevel: number }) {
  const w = 1000;
  const h = 190;
  const minY = Math.min(route.minY, seaLevel, ...route.samples.map((s) => s.terrainY));
  const maxY = Math.max(route.maxY, ...route.samples.map((s) => s.terrainY));
  const span = Math.max(1, maxY - minY);
  const px = (s: number) => (s / Math.max(1, route.length)) * w;
  const py = (y: number) => h - ((y - minY) / span) * (h - 24) - 12;

  return (
    <div className="rounded border border-neutral-800 bg-[#141519] p-3">
      <div className="mb-1 flex flex-wrap gap-4 font-mono text-[10px] text-neutral-400">
        <span className="text-neutral-200">{route.id}</span>
        <span>{route.length.toFixed(0)} m</span>
        <span>
          {route.minY.toFixed(1)} → {route.maxY.toFixed(1)} m
        </span>
        <span>montée max {route.maxUphill.toFixed(0)} %</span>
        <span>descente max {route.maxDownhill.toFixed(0)} %</span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
        {/* Niveau de la mer. */}
        <line
          x1={0}
          y1={py(seaLevel)}
          x2={w}
          y2={py(seaLevel)}
          stroke="#3a6b82"
          strokeWidth={1}
          strokeDasharray="5 4"
        />
        <text x={4} y={py(seaLevel) - 3} fill="#3a6b82" fontSize={9}>
          niveau de la mer
        </text>

        {/* Terrain réellement produit. */}
        <polyline
          points={route.samples.map((s) => `${px(s.s)},${py(s.terrainY)}`).join(" ")}
          fill="none"
          stroke="#6d6a5e"
          strokeWidth={1.6}
        />
        {/* Chaussée déclarée. */}
        <polyline
          points={route.samples.map((s) => `${px(s.s)},${py(s.roadY)}`).join(" ")}
          fill="none"
          stroke="#f0b45e"
          strokeWidth={2}
        />

        {/* Pentes fortes. */}
        {route.samples
          .filter((s) => Math.abs(s.grade) > 18)
          .map((s, i) => (
            <circle key={i} cx={px(s.s)} cy={py(s.roadY)} r={2.4} fill="#ff5a4a" />
          ))}
      </svg>
      <p className="mt-1 font-mono text-[9px] text-neutral-500">
        orange : chaussée déclarée · gris : terrain échantillonné · rouge : pente &gt; 18 %
      </p>
    </div>
  );
}

/* ── C. Régions et streaming ──────────────────────────────────────────── */

function StreamingView({ snapshot }: { snapshot: CartographySnapshot }) {
  return (
    <section className="space-y-3">
      {snapshot.streaming.map((rule) => (
        <div key={rule.id} className="rounded border border-neutral-800 bg-[#141519] p-3">
          <p className="font-mono text-[11px] text-neutral-200">{rule.id}</p>
          <p className="mt-1 font-mono text-[10px] text-neutral-400">
            monte à {rule.mountRadius} m au-delà du rayon de région · régions :{" "}
            {rule.regionIds.join(", ")}
          </p>
        </div>
      ))}
      <div className="rounded border border-neutral-800 bg-[#141519] p-3">
        <p className="font-mono text-[11px] text-neutral-200">
          Amers persistants (jamais démontés)
        </p>
        <ul className="mt-1 space-y-0.5 font-mono text-[10px] text-neutral-400">
          {snapshot.landmarks.map((l) => (
            <li key={l.id}>
              {l.label} — sommet à {(l.groundY + l.height).toFixed(0)} m, masqué en deçà de{" "}
              {l.hideWithin} m
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ── D. Distribution des tracks ───────────────────────────────────────── */

function TrackView({ snapshot }: { snapshot: CartographySnapshot }) {
  const counts = snapshot.tracks.reduce<Record<string, number>>((acc, t) => {
    acc[t.form] = (acc[t.form] ?? 0) + 1;

    return acc;
  }, {});

  return (
    <section>
      <div className="mb-3 flex flex-wrap gap-3 font-mono text-[10px]">
        {Object.entries(counts).map(([form, n]) => (
          <span key={form} style={{ color: FORM_COLOR[form] }}>
            {form} : {n}
          </span>
        ))}
      </div>
      <div className="overflow-x-auto rounded border border-neutral-800">
        <table className="w-full border-collapse font-mono text-[10px]">
          <thead className="bg-[#191a1f] text-neutral-400">
            <tr>
              {["track", "ère", "région", "forme", "accès", "distance", "provisoire"].map((c) => (
                <th key={c} className="px-2 py-1.5 text-left font-normal">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {snapshot.tracks.map((t) => (
              <tr key={t.slug} className="border-t border-neutral-800/70">
                <td className="px-2 py-1 text-neutral-200">{t.label}</td>
                <td className="px-2 py-1 text-neutral-400">{t.era}</td>
                <td className="px-2 py-1 text-neutral-400">{t.region}</td>
                <td className="px-2 py-1" style={{ color: FORM_COLOR[t.form] }}>
                  {t.form}
                </td>
                <td className="px-2 py-1 text-neutral-400">{t.accessRoute ?? "—"}</td>
                <td className="px-2 py-1 text-neutral-400">
                  {t.accessDistance.toFixed(0)} m
                </td>
                <td className="px-2 py-1 text-neutral-500">{t.provisional ? "oui" : "non"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ── E. Vues lointaines ───────────────────────────────────────────────── */

function SightlineView({ snapshot }: { snapshot: CartographySnapshot }) {
  return (
    <div className="overflow-x-auto rounded border border-neutral-800">
      <table className="w-full border-collapse font-mono text-[10px]">
        <thead className="bg-[#191a1f] text-neutral-400">
          <tr>
            {["observateur", "amer", "distance", "Δ altitude", "terrain", "état"].map((c) => (
              <th key={c} className="px-2 py-1.5 text-left font-normal">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {snapshot.sightlines.map((s) => (
            <tr key={s.id} className="border-t border-neutral-800/70">
              <td className="px-2 py-1 text-neutral-200">{s.observerLabel}</td>
              <td className="px-2 py-1 text-neutral-400">{s.landmarkId}</td>
              <td className="px-2 py-1 text-neutral-400">{s.distance.toFixed(0)} m</td>
              <td className="px-2 py-1 text-neutral-400">
                {s.elevationDelta > 0 ? "+" : ""}
                {s.elevationDelta.toFixed(0)} m
              </td>
              <td className="px-2 py-1 text-neutral-400">
                {s.blocked
                  ? `coupé à ${Math.round((s.blockedAt ?? 0) * 100)} %`
                  : "dégagé"}
              </td>
              <td
                className="px-2 py-1"
                style={{ color: s.status === "ok" ? "#7cf2a0" : "#ff9a4a" }}
              >
                {s.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── F. Rythme ────────────────────────────────────────────────────────── */

function PacingView({ snapshot }: { snapshot: CartographySnapshot }) {
  return (
    <div>
      <p className="mb-2 font-mono text-[10px] text-neutral-500">
        Durées estimées à {CARTO_CRUISE_SPEED} m/s — allure de conduite représentative,
        sans arrêt ni détour. Hypothèse explicite, pas une mesure.
      </p>
      <div className="overflow-x-auto rounded border border-neutral-800">
        <table className="w-full border-collapse font-mono text-[10px]">
          <thead className="bg-[#191a1f] text-neutral-400">
            <tr>
              {[
                "route",
                "longueur",
                "durée",
                "dénivelé +",
                "dénivelé −",
                "pente max",
                "obligatoire",
                "retour",
                "plus long plat",
              ].map((c) => (
                <th key={c} className="px-2 py-1.5 text-left font-normal">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {snapshot.pacing.map((p) => (
              <tr key={p.routeId} className="border-t border-neutral-800/70">
                <td className="px-2 py-1 text-neutral-200">{p.routeId}</td>
                <td className="px-2 py-1 text-neutral-400">{p.length.toFixed(0)} m</td>
                <td className="px-2 py-1 text-neutral-400">{p.seconds.toFixed(0)} s</td>
                <td className="px-2 py-1 text-neutral-400">{p.gain.toFixed(0)} m</td>
                <td className="px-2 py-1 text-neutral-400">{p.loss.toFixed(0)} m</td>
                <td className="px-2 py-1 text-neutral-400">{p.maxGrade.toFixed(0)} %</td>
                <td className="px-2 py-1 text-neutral-500">{p.mandatory ? "oui" : "non"}</td>
                <td className="px-2 py-1 text-neutral-500">{p.hasReturn ? "oui" : "non"}</td>
                <td className="px-2 py-1 text-neutral-400">
                  {p.longestFlatStretch.toFixed(0)} m
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Signaux ──────────────────────────────────────────────────────────── */

function WarningList({ snapshot }: { snapshot: CartographySnapshot }) {
  const color = { error: "#ff5a4a", warn: "#ff9a4a", info: "#7d9dd0" };

  return (
    <section className="mt-5 rounded border border-neutral-800 bg-[#141519] p-3">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-400">
        Signaux détectés — diagnostics, pas des ordres de refonte
      </p>
      <ul className="mt-2 space-y-1">
        {snapshot.warnings.map((warning, i) => (
          <li key={i} className="font-mono text-[10px] leading-4">
            <span style={{ color: color[warning.severity] }}>[{warning.code}]</span>{" "}
            <span className="text-neutral-300">{warning.message}</span>
            {warning.x !== undefined ? (
              <span className="text-neutral-600">
                {" "}
                ({warning.x.toFixed(0)}, {warning.z?.toFixed(0)})
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Legend({ items }: { items: Array<[string, string]> }) {
  return (
    <div className="mt-2 flex flex-wrap gap-3 font-mono text-[9px] text-neutral-400">
      {items.map(([color, label]) => (
        <span key={label} className="flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-3.5 rounded-sm"
            style={{ backgroundColor: color }}
          />
          {label}
        </span>
      ))}
    </div>
  );
}
