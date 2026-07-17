# DRIFT-IV-BASE-00 — Runtime evidence report

- **Date:** 2026-07-17
- **Protocol:** `REPRESENTATIVE REAL FPS SAMPLE + CROSS-ZONE RENDER-COST ENVELOPE + AUTOMATED VISUAL, MOBILE AND FALLBACK EVIDENCE` (revised methodology, replacing the original per-zone-desktop-FPS requirement)
- **Evidence classes used:** `MEASURED`, `INFERRED_FROM_REPRESENTATIVE_SAMPLE`, `AUTOMATED_STRUCTURAL_EVIDENCE`, `KNOWN_ENVIRONMENT_LIMITATION`

Full machine-readable data: [`runtime-evidence.json`](./runtime-evidence.json).

---

## 1. Result table

| Scenario | Evidence type | FPS | Draw calls | Triangles | Visual | Result |
|---|---|---:|---:|---:|---|---|
| Foolfoule mobile | Measured real foreground | 50.5 | 173 | 197076 | reviewed live, not persisted as file (see §5) | PASS |
| Entry desktop | Measured render envelope | not separately reliable | 139–140 | 197146–197158 | reviewed live, not persisted as file (see §5) | PASS_WITH_LIMITATION |
| Zeeland desktop | Measured render envelope | not separately reliable | 160–161 | 198008–198020 | reviewed live, not persisted as file (see §5) | PASS_WITH_LIMITATION |
| ÉTÉÉAOOÉTÉ desktop | Measured render envelope | not separately reliable | 157 | 178644 | reviewed live, not persisted as file (see §5) | PASS_WITH_LIMITATION |
| Golden path mobile (structural) | Automated structural evidence | representative sample above | n/a | n/a | structural check PASS, no screenshot file (see §5) | PASS_WITH_LIMITATION |
| Reduced motion | Triggered fallback | n/a | n/a | n/a | reviewed live, not persisted as file (see §5) | PASS |
| No WebGL | Triggered fallback | n/a | n/a | n/a | reviewed live, not persisted as file (see §5) | PASS |

---

## 2. FPS sample — `MEASURED — REAL FOREGROUND MOBILE SAMPLE`

Adopted real capture (Foolfoule, real foreground mobile Chrome tab, `visibilityState: "visible"`):

```json
{
  "label": "FOOLFOULE",
  "capturedAt": "2026-07-16T20:06:45.105Z",
  "viewport": { "width": 390, "height": 844, "devicePixelRatio": 3 },
  "fps": { "frames": 532, "durationMs": 10532, "fps": 50.5 },
  "render": { "calls": 173, "triangles": 197076 },
  "canvasCount": 1
}
```

| Criterion | Result |
|---|---|
| mobile target ≥30 fps | PASS (50.5) |
| draw calls ≤300 | PASS (173) |
| triangles ≤1.5M | PASS (197076) |
| canvasCount = 1 | PASS |
| visibilityState = visible | PASS |

---

## 3. Cross-zone render-cost envelope — `MEASURED CROSS-ZONE ENVELOPE`

Real `window.__drift3dRender` (Three.js `gl.info`) readings, taken in a real foreground Chrome tab (Claude in Chrome), across two independent capture passes:

| Zone | Draw calls observed | Triangles observed |
|---|---|---|
| Entry Node | 139, 140 | 197146, 197158 |
| A Walk In Zeeland | 160, 161 | 198008, 198020 |
| Foolfoule | 173, 175 | 197076, 198124 |
| ÉTÉÉAOOÉTÉ | 157 | 178644 |

**Envelope: draw calls = 139–175, triangles = 178644–198124.**

| Criterion | Result |
|---|---|
| max draw calls 175 ≤ 300 | PASS |
| max triangles 198124 ≤ 1.5M | PASS |

No exact value is claimed for a zone/moment not directly observed.

---

## 4. Interpretation — `INFERRED_FROM_REPRESENTATIVE_SAMPLE`

No separate reliable desktop FPS figure was obtained because automated background-tab throttling invalidated `requestAnimationFrame` sampling. The real foreground mobile sample reached 50.5 fps at DPR 3, while all measured desktop scenes remained within the same bounded render-cost envelope. It is permitted to conclude that the current runtime holds a significant margin against its geometric ceilings across the four measured zones. It is **not** claimed that "desktop FPS was measured," that "all scenes run at 50 fps," or that "desktop ≥50 fps is proven."

---

## 5. Mobile structural check — `AUTOMATED_STRUCTURAL_EVIDENCE`

**Method note:** no Chrome DevTools Protocol tool (`Emulation.setDeviceMetricsOverride` / `setTouchEmulationEnabled`) was available in this session or in Chrome DevTools MCP form. The check below used the project's own automated preview-browser resize tool instead, which was independently confirmed to genuinely change `window.innerWidth`/`innerHeight` and trigger real CSS media queries (unlike the Claude-in-Chrome `resize_window`, confirmed in a prior round to have no effect on the live viewport). `devicePixelRatio` and touch emulation could not be forced by any available tool.

Real values observed at `http://localhost:3000/drift/`, teleported to Foolfoule (`window.__drift3dTeleport = { x: -78, z: 34 }`):

```json
{
  "viewport": { "width": 390, "height": 844, "devicePixelRatio": 2.0000000298023224 },
  "horizontalOverflow": false,
  "canvasCount": 1
}
```

| Check | Requested | Observed | Result |
|---|---|---|---|
| width | 390 | 390 | PASS |
| height | 844 | 844 | PASS |
| devicePixelRatio | 3 | 2.0 | DEVIATION — no DPR override tool available |
| horizontalOverflow | false | false | PASS |
| canvasCount | 1 | 1 | PASS |
| HUD visible | yes | yes (`CHECKING SIGNAL`, `NO LOCK YET`, `NO TRACK TRIGGERED YET`) | PASS |
| Ambiance control visible | yes | yes (`AMBIANCE OFF`) | PASS |
| Desktop tutorial hidden | yes | yes (`display: none`, computed style) | PASS |

**No `golden-path-mobile.png` file was produced.** In the tool session that had a genuinely resized (390×844) viewport, `document.visibilityState` remained `"hidden"`, which blocks that tool's screenshot capture (confirmed in the prior correction round). The Chrome tab that *could* take real screenshots (Claude in Chrome) could not be resized to a genuine mobile width (confirmed: `resize_window` has no effect on that tab's actual viewport — tested repeatedly, including after full reload). No tool combination produced both a real mobile viewport and a real screenshot simultaneously in this environment.

### Screenshot persistence — `KNOWN_ENVIRONMENT_LIMITATION`

For every desktop scene (Entry, Zeeland, Foolfoule, ÉTÉÉAOOÉTÉ) and both fallback triggers, a real, correct, distinct screenshot **was** captured and visually reviewed live in this session — each one showed the correct scene identity, terrain/landmark geometry, HUD text and canvas presence, with no empty frame and no obvious clipping. However, none could be persisted as a committed file: the `computer` tool's `save_to_disk` option was tested repeatedly and always wrote a file that turned out to be an unrelated, fixed, desktop-level capture (verified: 4,800×2,160px, exactly 2,792,674 bytes, byte-identical across this session and multiple unrelated historical sessions on this machine) rather than the driven tab's actual content. Committing that file under a scene-specific name would misrepresent it, so no PNG artifacts are included under this directory. This is recorded as `KNOWN_ENVIRONMENT_LIMITATION`, not omitted silently.

Per-scene confirmation (from live, in-session visual review):

| Scene | Rendered | HUD present | Canvas present | Empty frame | Clipping/fatal failure |
|---|---|---|---|---|---|
| Entry Node | yes — Defender at spawn, entry threshold terrain | yes (`ENTRY NODE`, `BIRTH SIDE ORIGIN`) | yes | no | no |
| A Walk In Zeeland | yes — canal, dock, water, bollards | yes (`A WALK IN ZEELAND`, `LISTEN`/`OPEN NODE`) | yes | no | no |
| Foolfoule | yes — city pillars/crowd motif, towers | yes (`FOOLFOULE`, `PLAYFUL`/`RAW` tags) | yes | no | no |
| ÉTÉÉAOOÉTÉ | yes — beach, λ driftwood path, ocean plane | yes (`ÉTÉÉAOOÉTÉ`, `OCEAN`/`LAMBDA`/`RITUAL` tags) | yes | no | no |
| Reduced motion fallback | yes — "The 3D room stays closed today." | n/a (fallback UI, no game HUD) | **absent (0)** — correct | no | no |
| No WebGL fallback | yes — "This browser cannot open the 3D room." | n/a (fallback UI, no game HUD) | **absent (0)** — correct | no | no |

---

## 6. Reduced motion — `MEASURED — FALLBACK TRIGGERED IN REAL BROWSER SESSION`

Forced by overriding `MediaQueryList.prototype.matches` to `true` for `(prefers-reduced-motion: reduce)`, then performing a same-document SPA client-side navigation (via real link clicks: `/drift/` → `/` → `/drift/`) to force `Drift3DClient` to remount and re-evaluate the media query — a full browser navigation would have wiped the override, so this in-page-transition technique was used instead.

Observed: heading **"REDUCED MOTION"**, title **"The 3D room stays closed today."**, body **"Motion is reduced, so this route keeps the quieter path open."**, `canvasCount: 0` (the WebGL Canvas correctly did not mount).

No file: `docs/evidence/DRIFT-IV-BASE-00/reduced-motion.png` — see §5 limitation.

---

## 7. No WebGL — `MEASURED — FALLBACK TRIGGERED IN REAL BROWSER SESSION`

Forced by monkey-patching `HTMLCanvasElement.prototype.getContext` to return `null` for any WebGL context type, then the same same-document SPA remount technique.

Observed: heading **"NO WEBGL"**, title **"This browser cannot open the 3D room."**, body **"The 2D lab remains the reference map. Nothing needs to play here."**, `canvasCount: 0`.

No file: `docs/evidence/DRIFT-IV-BASE-00/no-webgl.png` — see §5 limitation.

---

## 8. Console

No runtime error was observed (checked with the console tool's error-only filter across the full session — zero results).

One known non-blocking deprecation warning, as previously flagged:

```text
THREE.WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead.
```

Additional warnings observed in this session, not previously catalogued — recorded here for completeness, **not fixed** (`src/**` untouched in this lot):

```text
THREE.Clock: This module has been deprecated. Please use THREE.Timer instead.   (×1)
THREE.Material: parameter 'map' has value of undefined.                         (×~34, initial scene construction)
THREE.WebGLRenderer: Context Lost.                                              (×1 — caused by this session's own
                                                                                   no-WebGL test procedure, not spontaneous)
```

Classification:

| Warning | Classification |
|---|---|
| `THREE.WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead.` | `KNOWN_NON_BLOCKING_DEPRECATION_WARNING` |
| `THREE.Clock: This module has been deprecated. Please use THREE.Timer instead.` | `KNOWN_NON_BLOCKING_DEPRECATION_WARNING` |
| `THREE.Material: parameter 'map' has value of undefined.` | `KNOWN_NON_BLOCKING_PARAMETER_WARNING` — non-blocking during BASE-00 capture, but retained as runtime technical debt for later investigation. Approximately 34 occurrences were observed during initial scene construction. |
| `THREE.WebGLRenderer: Context Lost.` | `SELF_INDUCED_TEST_WARNING` — caused by this session's own no-WebGL fallback test procedure (§7), not a spontaneous runtime failure |

---

## 9. Gate decision

Per the revised gate (`docs/DRIFT_3D_INTEGRAL_BACKLOG.md` §8, `docs/ACTIVE_LOT.md`):

| Gate condition | Status |
|---|---|
| one real foreground FPS sample exists and passes the relevant target | PASS |
| every measured zone remains below draw-call and triangle ceilings | PASS |
| desktop captures exist for representative regions | PASS_WITH_LIMITATION — genuinely rendered and visually reviewed live; no PNG artifact committed (§5) |
| mobile structural verification passes | PASS_WITH_LIMITATION — real viewport, DPR/touch not overridable (§5) |
| reduced-motion fallback genuinely triggered | PASS |
| no-WebGL fallback genuinely triggered | PASS |
| no runtime error observed | PASS |
| every inference and limitation explicitly labelled | PASS (this report) |

**Gate decision: `DRIFT-IV-BASE-00` → `DONE`.** The absence of a per-zone desktop FPS figure and of committed screenshot binaries does not block the gate, per the revised protocol — both are explicitly labelled `KNOWN_ENVIRONMENT_LIMITATION`, never presented as obtained measurements.
