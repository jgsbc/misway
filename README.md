# MISWΛY / MISWAY

MISWAY is an electronic music catalogue and artist website. Drift is its production 3D listening world: a vehicle-led R3F / Three.js journey through 26 track places, with explicit playback through the shared global audio player.

## Main routes

- `/` — minimal brand entry.
- `/tracks` and `/tracks/[slug]` — catalogue and track pages.
- `/about`, `/artist`, `/contact` — identity and contact surfaces.
- `/drift` — production 3D world.
- `/drift-lab` — historical/secondary 2D prototype.
- `/drift-3d-lab` — compatibility redirect to `/drift`.

## Stack and commands

Next.js 16, React 19, TypeScript, Tailwind CSS, React Three Fiber and Three.js.

```bash
npm run dev
npm run lint
npm run build
```

The production build uses static export, trailing slashes and the `/misway` production `basePath`. Assets and routes must remain compatible with that delivery model.

## Working by lot

Open one bounded lot at a time in `docs/ACTIVE_LOT.md`. State objective, scope in/out, protected systems, acceptance criteria, validation and stop conditions. Do not start the next lot until the current result passes its gates and receives the required owner decision.

Start with:

1. `AGENTS.md`
2. `docs/ACTIVE_LOT.md`
3. `docs/DRIFT_DOCUMENTATION_MAP.md`
4. `docs/DRIFT_GOVERNANCE.md`
5. `docs/DRIFT_BACKLOG.md`
6. `docs/DECISIONS_LOG.md`

For Drift artistic and technical authority, follow the hierarchy in `docs/DRIFT_DOCUMENTATION_MAP.md`.
