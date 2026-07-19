# ACTIVE_LOT.md

Current lot:
DRIFT-IV-SYS-30 — Signature arbitration

Status:
DONE — PENDING MERGE

Baseline:
main@62e436a (contains DRIFT-IV-SYS-20, merged, PR #24)

Type:
Runtime service (generic signature arbitration) + dev harness + documentation

Completed:
- `src/lib/drift3dSignatureArbitration.ts` created — framework-agnostic, DOM-agnostic, track-agnostic, slug-agnostic, cue-agnostic pure arbiter. `Drift3DSignatureCandidate` (`id`, `ownerKind: "active-track" | "world"`, `eligible`, `priority`) and `Drift3DSignatureArbitrationResult` types. `getDrift3DSignatureCandidateIssues` validates empty/duplicate ids, non-finite priority, and (defensively) an invalid `ownerKind` — a negative priority is explicitly allowed, never flagged. `arbitrateDrift3DMajorSignature` is a pure, single-pass (`O(n)`) selection that never sorts or mutates its input: ineligible candidates are ignored outright; `"active-track"` always beats `"world"` regardless of numeric priority; at equal `ownerKind` the higher `priority` wins; at equal `ownerKind` and `priority` the lexicographically smaller `id` wins (compared by UTF-16 code unit, never `localeCompare`). No module-scope mutable state, no history, no previous-winner memory, no global registry — resolving the same candidate list always yields the same result, and the canonical "cleanup" is simply calling it again with an empty list or with every candidate ineligible. Does not import `drift3dAudioClock.ts`, `drift3dCueResolver.ts`, `drift3dSceneLifecycle.ts` or `tracks.ts`;
- `Drift3DCanvas.tsx` integrated — a dev-only `useEffect` installs `window.__drift3dSignatureArbitration` (`Object.freeze`d: `validate(candidates)`, `arbitrate(candidates)`), available immediately since it lives outside the react-three-fiber tree, using the same simple reference-identity cleanup already established for the `SYS-20` cue-resolver probe (no shared ownership registry, `Drift3DScene.tsx`'s own probe registry from `SYS-10` untouched). No `setTimeout`/`setInterval`/`requestAnimationFrame`/`useFrame` for this probe. This lot is a pure addition to `Drift3DCanvas.tsx` (41 lines, 0 removed) — no new React state for an active signature, no visual change to any scene, and no scene (`Drift3DScene`/`Drift3DZone`/`Drift3DLandmark`/`Drift3DProp`) receives any signature-arbitration wiring in this lot;
- `docs/DRIFT_3D_SIGNATURE_ARBITRATION_CONTRACT.md` created — full runtime contract, `ACTIVE — RUNTIME CONTRACT`, explicitly states `SYS-30` delivers no real signature, does not decide which track is active, does not decide artistic eligibility, does not instantiate/render any signature, and does not suppress ordinary life loops;
- real behavioral evidence captured in a real Chrome session (`docs/evidence/DRIFT-IV-SYS-30/`) on fully synthetic candidates (`probe-*`, no artistic meaning): candidate validation (valid → 0 issues; empty/duplicate id and non-finite priority each detected; negative priority never flagged), absolute `active-track` precedence (wins against an extreme unfavorable numeric priority, in both input orders), intra-`ownerKind` numeric priority (highest wins, both owner kinds), deterministic tie-break (same winner in both input orders, code-unit comparison), eligibility/no-winner behavior (a lower-priority eligible candidate beats a higher-priority ineligible one; all-ineligible and empty-list both yield `null`/`"none"`), single-major-signature guarantee (exactly one `activeSignatureId` among five eligible candidates), life-loop separation (a synthetic life-loop fixture never passed to the arbiter stays byte-for-byte unchanged across an unrelated arbitration call; the probe's API surface is exactly `["arbitrate", "validate"]`), logical cleanup (a real winner immediately clears to `null`/`"none"` on an empty list or an all-ineligible list), probe cleanup/remount (absent while unmounted, a genuinely new object on remount, no autoplay), and both fallbacks (reduced-motion, no-WebGL — each leaving zero residual probe) — all real, all PASS.

A second occurrence of the same class of environment incident already seen in `DRIFT-IV-SYS-20` (a long-lived dev server process became unresponsive, then stopped listening entirely) was diagnosed via `curl`/`netstat`, resolved by restarting the server, and is documented transparently in the evidence — it produced 2 console errors during the incident itself and zero afterward, unrelated to this lot's code.

Correction round (PR #26 review, single commit amended): the module-scope `VALID_OWNER_KINDS` `Set` in `drift3dSignatureArbitration.ts` was replaced by a plain type-guard function (`isDrift3DSignatureOwnerKind`) — no mutable container remains at module scope. The contract §7 and evidence Test D wording were narrowed: only the winner's identity/`ownerKind`/`priority`/`decision` are order-independent — `activeCandidateIndex` intentionally follows the winner's position in the caller's array and changes under permutation. The contract §15 vertical-slice gate wording was corrected: it conditions extraction of a shared abstraction, not the right to implement track-local responsibilities locally in a proof slice. Arbitration behavior itself is unchanged — no A–J browser test was replayed. `npm run lint`/`npm run build` re-verified PASS after this round.

Protected scope:
- no public/** / public/audio/**
- no package.json / package-lock.json
- no next.config.* / tsconfig.json
- no new dependency
- no src/components/audio/AudioPlayerProvider.tsx, no src/lib/drift3dAudioClock.ts, no src/lib/drift3dSceneLifecycle.ts, no src/lib/drift3dCueResolver.ts
- no src/lib/tracks.ts, no src/lib/cues/**
- no track identity contract, no Cue Map, no era contract, no artistic bible touched
- no real signature, no MISWAY signature list, no EUX GAINENT signature, no ÉTÉÉAOOÉTÉ signature, no Cue Map, no phase-to-signature mapping, no track-scene activation, no track-local orchestration, no signature registry, no life-loop system, no residue/memory system, no quality tiers, no era transition engine, no shared population, no new animation, no second player or new audio system

Next lot:
DRIFT-IV-SYS-40 — Quality tiers preserving identity

Next status:
NEXT_AFTER_MERGE
