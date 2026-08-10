# DRIFT 3D — Performance Baseline Protocol

**Lot:** `DRIFT-ASSET-GOV-00`  
**Status:** `REQUIRED GATE — BASELINE NOT YET CAPTURED`  
**Parent authority:** `docs/DRIFT_3D_ASSET_PERFORMANCE_BIBLE.md`

## 1. Why this exists

MISWAY already has a functioning world. New asset budgets must therefore be derived from the delivered experience, not from generic “web 3D” numbers.

This protocol defines the evidence required before `DRIFT-ASSET-BY-10` or any broader asset-heavy implementation.

## 2. No fake baseline

This governance lot does **not** claim current values for:
- load time;
- transferred bytes;
- FPS;
- frametime;
- draw calls;
- triangles;
- GPU textures/geometries;
- memory.

Historical measurements may be used as context only. They are not a current baseline because the map, vehicle and runtime have changed.

## 3. Required device profiles

At minimum:

### Desktop reference
Record:
- browser/version;
- OS;
- CPU;
- GPU;
- RAM;
- display resolution;
- device pixel ratio;
- network condition.

### Smartphone reference
Record:
- device/model;
- OS;
- browser/version;
- GPU/SoC if known;
- viewport;
- device pixel ratio;
- battery/power mode;
- thermal state if relevant;
- network condition.

A second lower-capability smartphone is desirable before production promotion but is not required to start the first vertical slice.

## 4. Build condition

Use a production build or deployed production-equivalent build.

Do not use Next.js development mode for accepted performance numbers.

Record:
- git SHA;
- route (`/drift` or `/drift-evolution`);
- build/deploy identifier;
- cache state.

## 5. Scenarios

Capture each scenario at least 3 times where practical.

### S0 — cold start
Clear/disable relevant cache, enter Drift, measure until vehicle is controllable and first world is visually stable.

### S1 — warm start
Reload with normal browser cache.

### S2 — Entry → Zeeland
Drive the accepted threshold into first Birth Yard reveal.

### S3 — Zeeland → Foolfoule
Dense currently promoted Birth Yard path.

### S4 — Birth Yard route lab loop
Use `/drift-evolution` route proof where required:
Zeeland → Foolfoule → Sugared Peach → Play It → Jazzypling → Zeeland.

### S5 — Funky Hoo spur
Zeeland → Funky Hoo → U-turn → Zeeland.

### S6 — Peut-être spur
Jazzypling → Peut-être → U-turn → Jazzypling.

For scenarios not yet production-promoted, record them as Evolution evidence only.

## 6. Loading metrics

Record:
- navigation start;
- first meaningful shell;
- 3D canvas initialized;
- first drivable frame;
- first stable frame after entry reveal;
- total transfer bytes;
- GLB/glTF bytes;
- texture bytes;
- JS bytes;
- request count;
- largest 3D request;
- largest texture request.

## 7. Runtime metrics

At representative checkpoints, capture:

```text
renderer.info.render.calls
renderer.info.render.triangles
renderer.info.memory.geometries
renderer.info.memory.textures
renderer.info.programs.length
```

Also measure:
- FPS average;
- frametime p50;
- frametime p95;
- frametime p99;
- count of frames >33.3ms;
- count of frames >50ms;
- worst frame;
- visible stall notes.

## 8. Repeatability

Do not compare one lucky run to one bad run.

Preferred:
- 3 runs minimum per scenario/device;
- report median;
- report worst p95/p99 where meaningful;
- note thermal/network anomalies.

## 9. Acceptance envelope derivation

After baseline capture, set explicit tolerances for the vertical slice.

The tolerance document must answer:
- maximum acceptable cold-start regression;
- maximum acceptable warm-start regression;
- minimum mobile FPS/frametime envelope;
- maximum p99 frame spike at reveal;
- acceptable GPU resource delta when entering/leaving a capsule;
- acceptable payload delta for the chosen slice.

Until this is filled in, asset integration remains a lab experiment, not production-ready.

## 10. Baseline record format

Store results in:

`docs/DRIFT_3D_PERFORMANCE_BASELINE.json`

Required top-level structure:

```json
{
  "status": "MEASURED",
  "gitSha": "...",
  "capturedAt": "...",
  "devices": [],
  "scenarios": [],
  "acceptanceEnvelope": {}
}
```

The initial governance file may exist with `status: "UNMEASURED"` to make the open gate explicit.

## 11. Regression check

Every future major world-art lot must compare against the last accepted baseline:
- same scenario;
- same device class;
- same metric definitions.

If instrumentation changes, record the schema/version change rather than silently comparing incompatible data.
