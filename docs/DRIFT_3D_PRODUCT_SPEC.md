# DRIFT 3D — Product specification

**Status:** ACTIVE — authoritative description of the delivered Drift product.

## Product truth

Drift is MISWAY's production 3D listening world. It turns the catalogue into a drivable territory while keeping music, explicit user intent and the shared site audio system central.

## Routes

- `/drift` is the production R3F / Three.js world.
- `/drift-lab` remains a historical and secondary 2D prototype.
- `/drift-3d-lab` is a compatibility route that redirects to `/drift`.

## Delivered runtime

- React Three Fiber and Three.js rendering.
- 26 catalogue tracks represented by 26 track nodes across four eras, plus the non-track entry threshold.
- Drivable vehicle, terrain sampling, vehicle physics and collisions.
- Track landmarks, atmospheric regions and scatter systems.
- Explicit track playback: approaching a node does not start music.
- The global `AudioPlayerProvider` remains the protected source of track playback truth.
- Diegetic/world ambience is opt-in and distinct from track playback.
- WebGL capability fallback with a quieter navigation/listening path.
- Reduced-motion users receive the fallback path rather than forced 3D motion.
- Static export, trailing slashes and production `basePath` support.

## Permanent product constraints

- Music remains the primary purpose of the world.
- Track audio requires explicit user action and continues through the global provider.
- Mobile interaction, safe control placement and usable fallbacks are release gates.
- Reduced motion and non-WebGL access are product requirements.
- Performance budgets must be checked before world density grows.
- Static-export and `basePath` compatibility must remain intact.
- Track meaning comes from owner-approved artistic contracts, never runtime invention.

## Current boundaries

The delivered product contains scene landmarks, atmospheres, scatter and interaction needed by the current 3D world. It does **not** yet claim the Living World object's behavioral model, directed musical cue sheets or bounded session memory described by the new artistic authorities.

Those capabilities are the next governed evolution. They begin with the read-only `DRIFT-LW-AUDIT-00`; their existence must not be claimed until implemented, validated and accepted lot by lot.

## Sources of delivered truth

The code is authoritative for what is currently shipped, notably the `/drift` route, `src/components/drift-3d/`, `src/lib/drift3d*.ts`, `src/lib/tracks.ts`, the global audio provider, `package.json` and `next.config.ts`.
