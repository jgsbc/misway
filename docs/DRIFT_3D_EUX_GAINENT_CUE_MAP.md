# DRIFT 3D — EUX GAINENT cue map

**Status:** `OWNER_APPROVED_INITIAL_IMPLEMENTATION_BASELINE` — authoritative musical dramaturgy and cue timing map for EUX GAINENT.
**Evidence level:** `ANALYTICAL — NOT HUMAN-AUDITIONED`.
**HISTORICAL APPROVAL PRESERVED.**
**RECONCILED ON MAIN:** 2026-07-16 (`DRIFT-IV-GOV-10`).

**Cue timing authority:** OWNER_APPROVED_INITIAL_IMPLEMENTATION_BASELINE

The analytical timestamps below are authorized as the baseline for the first implementation of EUX GAINENT's cues. They are not a final musical truth: they were not human-auditioned in the execution environment. A future listening pass and visual QA may only produce **bounded adjustments** to these timestamps within their approved structural windows — they may not introduce a new signature event, a new dominant term, or a second signature text (see the Identity Contract, §21).

**Track:** `eux-gainent`
**Identity authority:** `DRIFT_3D_EUX_GAINENT_IDENTITY_CONTRACT.md`

**Runtime status:**
CUE MAP ACTIVE AS INITIAL TEMPORAL AUTHORITY.
CUES IMPLEMENTATION NOT YET INTEGRATED ON MAIN.
An approved Cue Map does not prove its runtime is delivered — see `docs/DRIFT_3D_LIVING_WORLD_RECONCILIATION.md`.

## 1. Canonical audio source

- **Canonical audio:** `public/audio/eux-gainent.mp3`
- **Runtime mapping:** `src/lib/tracks.ts` declares `audioFile: "eux-gainent.mp3"` and resolves `/audio/eux-gainent.mp3`.
- **Resolved local path:** `C:\Users\jgcen\projets\misway\public\audio\eux-gainent.mp3`
- **Presence:** confirmed in `HEAD` and on disk.
- **File size:** 7,216,482 bytes.
- **Source integrity:** read-only; no transcode or replacement was written to the repository.

## 2. Audio metadata

| Field | Confirmed value |
|---|---:|
| Container/format | MP3 |
| Codec | MP3 |
| Duration | `03:45.455` / `225.455` seconds; probe value `225.454558` seconds |
| Sample rate | 44,100 Hz |
| Channels | 2 — stereo |
| Bitrate | 256,068 bit/s overall; 256,000 bit/s stream |
| Working analysis decode | Temporary mono PCM, 22,050 Hz, 16-bit, outside the repository |

Metadata was read with `ffprobe`; the canonical file itself was never modified.

Metadata evidence keys: canonical audio, duration, codec, sample rate, listening status.

## 3. Listening and analysis status

**Listening status:** NOT HUMAN-AUDITIONED.

The environment can decode, render and measure the source but does not transmit sound to the agent. Starting a local player would not constitute honest audition. Therefore:

- no statement in this document claims that the track was heard;
- musical labels describe measured structure, density, onset and spectral change rather than subjective timbre;
- every cue is capped at `MEDIUM` overall confidence until an owner listening pass;
- the timestamps are authorized as the initial implementation baseline, not as final musical approval;
- `DRIFT-IV-BY-EUX-20` may implement runtime against this baseline; a listening pass may still produce bounded timestamp adjustments before owner acceptance in `DRIFT-IV-BY-EUX-30`.

## 4. Method — four analytical substitute passes

The four required human listening passes could not be executed. Four bounded analytical passes were used instead and must later be repeated by ear.

### Pass 1 — whole-track dynamic observation

- Rendered the complete waveform and logarithmic spectrogram from the canonical MP3.
- Observed a low-density opening, a long mechanically stable central body, a uniquely sparse central rupture, a full return and a staged outro/fade.
- Identified the broad structural arc without assigning visual events first.

### Pass 2 — rhythmic and structural measurement

- Decoded a temporary mono PCM copy outside the repository.
- Measured RMS energy, low/mid/high spectral energy, normalized spectral flux and multi-window change novelty.
- Estimated a stable pulse near **132 BPM**, with a strong half-time reading near **66 BPM**.
- Probable meter: **4/4**. No clear silent pre-roll or technically detectable anacrusis; human confirmation remains required.
- Repeated tempo estimates over the opening body, central body and final drive stayed in the same pulse family.

### Pass 3 — EUX narrative mapping

- Compared only structurally distinct moments against normality, repetition, measurement, correction, reference inversion and aftermath.
- Preserved the identity contract's order rather than assigning every detected onset a visual event.
- Selected the unique large mid-track rupture for the signature instead of an earlier routine energy rise.

### Pass 4 — timestamp verification

- Compared 0.75-second pre/post feature windows around every candidate boundary.
- Checked each proposed point against the complete waveform, full spectrogram and focused spectrogram windows.
- Tested nearby earlier/later analytical boundaries and chose values rounded to 0.05–0.10 second precision.
- Distinguished perceptual start, visual peak and transition end.

Temporary analysis files were stored under the system temp directory and removed after validation.

## 5. Limits

- No human judgement of melody, instrumentation, vocal content, emotional emphasis or mix intention is claimed.
- The BPM and meter are technical estimates, not session metadata.
- Exact labels such as “drop” are avoided where only a rupture or density return is measurable.
- `02:27.280` is the strongest analytical peak inside the signature window, but its artistic dominance must be confirmed by ear against the full return at `02:32.730`.
- Owner approval is recorded for this initial temporal baseline.
  The cues become delivered runtime only after implementation
  in `DRIFT-IV-BY-EUX-20`, QA and acceptance in `DRIFT-IV-BY-EUX-30`.

## 6. Duration, tempo and broad arc

- **Total duration:** `03:45.455` / `225.455` seconds.
- **Estimated tempo:** approximately **132 BPM**, stable; half-time interpretation approximately **66 BPM**.
- **Probable meter:** 4/4.
- **Opening:** layered low-density construction through `00:28.380`.
- **Main mechanical body:** stable repeated pulse and layered variations from `00:28.380` through `02:18.800`.
- **Major rupture/signature window:** `02:18.800` through `02:32.730`.
- **Return and post-signature drive:** `02:32.730` through `03:23.750`.
- **Outro/residue:** `03:23.750` through `03:45.455`.

The track provides one dominant structural inversion rather than several equally strong signature events.

## 7. Complete musical structure

All timestamps below are analytical boundaries from the canonical source.

| Section | Start | End | Duration | Measured music/texture | Energy | Possible narrative function |
|---|---:|---:|---:|---|---|---|
| Opening texture | `00:00.000` | `00:09.090` | 9.090 s | Sparse spectrum and low RMS; no stable full-band drive | Low | Normality; independent human preparation |
| First low-frequency arrival | `00:09.090` | `00:14.540` | 5.450 s | Strong low-band increase and clear energy step | Low–medium | The room wakes but remains plausible |
| Layered construction A | `00:14.540` | `00:23.640` | 9.100 s | Mid/low layers accumulate in distinct steps | Medium | Individual cycles become comparable |
| Pre-lock rise | `00:23.640` | `00:28.380` | 4.740 s | Broad energy rise and preparation for stable flux | Medium | Suspicion prepares; no contamination yet |
| Mechanical groove established | `00:28.380` | `00:42.480` | 14.100 s | Full-band rise; repeatable onsets; strong event at `00:28.955` | Medium–high | Cadence lock |
| Secondary layer change | `00:42.480` | `00:53.170` | 10.690 s | New flux pattern and spectral redistribution | Medium–high | Measurement begins |
| Dense mechanical field | `00:53.170` | `01:08.820` | 15.650 s | Repeated strong onsets and sustained density | High | Measurement stabilizes; system feels authoritative |
| Contraction/instability | `01:08.820` | `01:20.010` | 11.190 s | RMS falls sharply; lower-density repeated pattern persists | Medium | B deviates; asymmetry becomes readable |
| Firm grid return | `01:20.010` | `01:27.260` | 7.250 s | Low/mid/high energy returns together | High | B correction |
| Corrected operation A | `01:27.260` | `01:40.450` | 13.190 s | Stable drive with layer variations | Medium–high | Conformity holds |
| Expanded high-frequency phase | `01:40.450` | `02:03.640` | 23.190 s | Denser high-band flux over stable pulse | High | Machines visually dominate human amplitude |
| Late drive/preparation | `02:03.640` | `02:18.800` | 15.160 s | Renewed density followed by large structural approach | High | Revelation prepares the inversion |
| Major rupture A | `02:18.800` | `02:27.280` | 8.480 s | Strong low-energy removal; sparse harmonic/rhythmic residue remains | Low–medium | Humans freeze; machines continue |
| Major rupture B/reclassification | `02:27.280` | `02:32.730` | 5.450 s | Strong low-band re-entry inside the sparse context | Medium | Reference-frame illusion peaks; signature text window |
| Full return | `02:32.730` | `02:45.920` | 13.190 s | Broad energy and rhythmic flux return firmly | High | Aftermath return; commercial normality rebuilds |
| Post-signature drive | `02:45.920` | `03:03.360` | 17.440 s | High-band density and regular pulse variations | High | System operates again; C residue remains latent |
| Brief thinning | `03:03.360` | `03:09.110` | 5.750 s | Mid/low energy contraction | Medium | Imperfection starts to surface |
| Final drive | `03:09.110` | `03:23.750` | 14.640 s | Final full-band return and repeated impacts | High | Last apparently normal production cycle |
| Outro contraction | `03:23.750` | `03:30.150` | 6.400 s | High and rhythmic layers withdraw | Medium–low | C residue and delayed machine stop become visible |
| Long decay | `03:30.150` | `03:45.455` | 15.305 s | Progressive broadband fade toward silence | Low → silence | Imperfect normality dissolves; reset boundary |

## 8. Decisions on initial cue candidates

| Initial candidate | Decision | Final result | Reason |
|---|---|---|---|
| `CUE_EUX_01_CADENCE_LOCK` | KEEP | Same ID | Stable mechanical body begins at a strong, repeatable boundary |
| `CUE_EUX_02_MEASUREMENT` | KEEP | Same ID | A distinct secondary layer change precedes sustained density |
| `CUE_EUX_03_DEVIATION` | KEEP | Same ID | The contraction at `01:08.820` is separate from the return at `01:20.010` |
| `CUE_EUX_04_CORRECTION` | KEEP | Same ID | Firm multi-band return provides a deterministic correction point |
| `CUE_EUX_05_INVERSION` | RENAME | `CUE_EUX_05_REFERENCE_INVERSION` | The approved event is an interior reference-frame illusion, never building movement |
| `CUE_EUX_06_RESIDUE` | SPLIT | `CUE_EUX_06_AFTERMATH_RETURN` and `CUE_EUX_07_RESIDUE` | The full return at `02:32.730` and final contraction at `03:23.750` are separate structural events |

Final recommendation: **7 primary cues**. None is `LOW`; no weak candidate is retained merely to preserve the original count.

## 9. Final cue map

Format: `MM:SS.mmm / seconds`.

| Cue ID | Decision | Start | Peak | End | Measured musical signal | Anomaly | Transformation | Confidence |
|---|---|---:|---:|---:|---|---:|---|---|
| `CUE_EUX_01_CADENCE_LOCK` | KEEP | `00:28.380 / 28.380` | `00:28.955 / 28.955` | `00:42.480 / 42.480` | Full-band rise and first stable high-flux mechanical body | 1 | Three cycles converge into one governed cadence | MEDIUM |
| `CUE_EUX_02_MEASUREMENT` | KEEP | `00:42.480 / 42.480` | `00:53.170 / 53.170` | `01:08.820 / 68.820` | Secondary flux/layer change followed by sustained density | 2 | Strip and conformity window begin measuring the bodies | MEDIUM |
| `CUE_EUX_03_DEVIATION` | KEEP | `01:08.820 / 68.820` | `01:09.290 / 69.290` | `01:20.010 / 80.010` | Sharp RMS and band-energy contraction while a repeated structure remains | 2 | B falls outside cadence; `ÉCART` replaces `CADENCE` | MEDIUM |
| `CUE_EUX_04_CORRECTION` | KEEP | `01:20.010 / 80.010` | `01:20.200 / 80.200` | `01:27.260 / 87.260` | Firm simultaneous low/mid/high return | 2 | B is stopped, recentered and relaunched under `CONFORMITÉ` | MEDIUM |
| `CUE_EUX_05_REFERENCE_INVERSION` | RENAME | `02:18.800 / 138.800` | `02:27.280 / 147.280` | `02:32.730 / 152.730` | Unique major rupture, sparse machine residue, then low-band reclassification before full return | 3 | Humans freeze, machines continue, interior reference frame shifts; `RENDEMENT` then `OBJECTIF DÉPLACÉ` | MEDIUM |
| `CUE_EUX_06_AFTERMATH_RETURN` | SPLIT | `02:32.730 / 152.730` | `02:32.730 / 152.730` | `03:23.750 / 203.750` | Full-band rhythmic return and long post-signature drive | 1 | Commercial normality rebuilds; B stays corrected and C's residue becomes latent | MEDIUM |
| `CUE_EUX_07_RESIDUE` | SPLIT | `03:23.750 / 203.750` | `03:30.150 / 210.150` | `03:45.455 / 225.455` | Layer withdrawal followed by long decay | 1 | C remains offset, one machine stops late, one low indicator persists until reset | MEDIUM |

### Owner-approved initial timing data for implementation

| Cue ID | startSeconds | peakSeconds | endSeconds |
|---|---:|---:|---:|
| `CUE_EUX_01_CADENCE_LOCK` | 28.380 | 28.955 | 42.480 |
| `CUE_EUX_02_MEASUREMENT` | 42.480 | 53.170 | 68.820 |
| `CUE_EUX_03_DEVIATION` | 68.820 | 69.290 | 80.010 |
| `CUE_EUX_04_CORRECTION` | 80.010 | 80.200 | 87.260 |
| `CUE_EUX_05_REFERENCE_INVERSION` | 138.800 | 147.280 | 152.730 |
| `CUE_EUX_06_AFTERMATH_RETURN` | 152.730 | 152.730 | 203.750 |
| `CUE_EUX_07_RESIDUE` | 203.750 | 210.150 | 225.455 |

## 10. Narrative progression across the track

| Musical range | Core + cue phase | Narrative state |
|---|---|---|
| `00:00.000–00:28.380` | `listening / pre-cadence` | Normal: three plausible independent workouts |
| `00:28.380–00:42.480` | `listening / cadence-lock` | Suspicious: individual movement enters one shared grid |
| `00:42.480–01:08.820` | `listening / measurement` | Measured: the room observes cadence and conformity |
| `01:08.820–01:20.010` | `listening / deviation` | B diverges; the system exposes `ÉCART` |
| `01:20.010–02:18.800` | `listening / correction-revelation` | B is corrected; machines become the reference |
| `02:18.800–02:32.730` | `listening / reference-inversion` | Humans freeze; machines and interior reference continue |
| `02:32.730–03:23.750` | `listening / aftermath-return` | Plausible operation returns with latent imperfection |
| `03:23.750–03:45.455` | `listening / residue` | C and one machine preserve the doubt during decay |

This is track-local dramaturgy, not a generic state machine.

## 11. Detailed visual behavior

| Cue ID | Athlete A | Athlete B | Athlete C | Cadence stations | Recalibration strip | Conformity window | Text/KPI |
|---|---|---|---|---|---|---|---|
| `CADENCE_LOCK` | Locks exactly to reference | Settles slightly late | Keeps a small authored offset | Converge to shared regularity | One restrained response per common cycle | Still mostly commercial | `CADENCE` |
| `MEASUREMENT` | Becomes the tolerated reference | Amplitude begins normalization | Offset remains below correction threshold | Regularity becomes visually dominant | Calm scanning state | Sparse measurement layer appears | `CADENCE` only; no dashboard |
| `DEVIATION` | Holds the grid | Falls behind and widens one motion | Reveals a smaller contrary phase | B station continues without accommodating the body | Isolates B's position | Marks one out-of-range unit | `ÉCART` |
| `CORRECTION` | Unchanged | Stops, recenters and restarts under imposed phase | Observes through one delayed cycle | B station performs one compensating action | Short local sweep across B | Reclassifies B as aligned | `CONFORMITÉ` |
| `REFERENCE_INVERSION` | Freezes on exact phase | Freezes at corrected position | Freezes fractionally off-axis | Continue without human contribution | Becomes a fixed control axis | Existing glass becomes the control plane | `RENDEMENT`, then unique signature `OBJECTIF DÉPLACÉ` |
| `AFTERMATH_RETURN` | Returns to plausible movement | Remains unnaturally well centered | Residue hidden within resumed cycle | Return to apparently subordinate use | Commercial light returns | Signature text clears immediately | No new message; quiet normal values only |
| `RESIDUE` | Ends normally | Ends in corrected alignment | Remains in visibly different final pose | One station ends late | Fixed low state, no pulse | One displaced alignment mark may persist | No narrative sentence |

The exterior shell, footprint, node and collider never move. Only floor cues, stations, position marks, shadows, reflections and interior reference elements may create the signature illusion.

## 12. KPI and text progression

The approved order is tied to four distinct musical phases:

1. `CADENCE` — from `00:28.380`;
2. `ÉCART` — from `01:08.820`;
3. `CONFORMITÉ` — from `01:20.010`;
4. `RENDEMENT` — during the signature window from `02:18.800`.

`OBJECTIF DÉPLACÉ` may appear only inside `02:18.800–02:32.730`, with the analytical peak at `02:27.280`. It is the only signature sentence. It must clear at `02:32.730`.

## 13. Deterministic playback policy

The future local resolver needs only `insideZone`, `currentTrackSlug`, `isPlaying` and `currentTime`.

### Pause

- Freeze the current appearance and local interpolation exactly.
- Do not advance phase or fire a silence cue.
- Resume from the same cue-derived state.

### Seek before a cue

- Recompute the visual phase directly from the new timestamp.
- Restore earlier state without replaying intermediate animations backward.
- Remove later text, correction and residue immediately, with only a short readability blend if required.

### Seek after a cue

- Resolve the state already reached at the destination timestamp.
- Do not simulate missed correction or inversion events.
- Use bounded interpolation only for visual legibility, never to delay state truth.

### Loop

- Detect the return from the outro/end range to the opening range.
- Reset every athlete, station, strip, glass state and interior offset.
- Rearm all seven cues.
- Begin again in `listening / pre-cadence` if playback continues.

### Zone exit and re-entry

- Exit performs the existing complete visual reset; global music continues unchanged.
- Re-entry while EUX is playing resolves the phase from the **current audio timestamp immediately**, then blends into that phase over one short bounded transition.
- Re-entry does not restart local dramaturgy from zero and does not replay past events.
- Re-entry while another track plays or EUX is paused before engagement remains idle.

## 14. Behavioral matrix

| Cue ID | Pause | Seek before | Seek after | Loop | Zone exit |
|---|---|---|---|---|---|
| `CADENCE_LOCK` | Freeze current convergence | Return to independent normal poses | Resolve locked cadence | Rearm | Reset all motion |
| `MEASUREMENT` | Freeze strip/window state | Remove measurement layer | Resolve current KPI state | Rearm | Clear glass and strip |
| `DEVIATION` | Freeze B's exact offset | Restore measured alignment | Resolve B divergent until correction boundary | Rearm | Restore B's initial pose |
| `CORRECTION` | Freeze correction pose | Restore deviation or earlier phase | Resolve B as corrected; do not replay snap | Rearm | Restore authored offset |
| `REFERENCE_INVERSION` | Freeze humans and interior illusion | Restore correction/revelation state | Resolve signature or aftermath according to destination | Full reset before new cycle | Clear signature immediately |
| `AFTERMATH_RETURN` | Freeze resumed state | Resolve signature if destination is inside it | Resolve post-signature normality | Rearm | Full reset |
| `RESIDUE` | Freeze final asymmetry | Restore appropriate earlier phase | Resolve residue directly | Full reset | Full reset |

## 15. Reduced-motion cue map

| Cue | Normal version | Reduced-motion equivalent |
|---|---|---|
| `CADENCE_LOCK` | Cycles converge over the cue window | Three poses change to a visibly shared alignment |
| `MEASUREMENT` | Strip and glass layer wake progressively | One calm strip state and one static `CADENCE` mark appear |
| `DEVIATION` | B gradually falls behind | B switches once to a clearly offset pose; `ÉCART` appears |
| `CORRECTION` | B is mechanically recentered | B changes discretely to the corrected position; no snap |
| `REFERENCE_INVERSION` | Humans freeze, machines continue and interior frame shifts | Humans switch to frozen poses; machines show an active status; window changes to control state; no spatial movement |
| `AFTERMATH_RETURN` | Motion resumes and commercial state rebuilds | Static normal poses return, with C's residual state still latent |
| `RESIDUE` | C and one machine end fractionally late | C remains in a distinct fixed pose and one machine indicator remains active |

No building motion, rapid pulse, forced camera, fast correction or continuous belt travel is required.

## 16. Mobile and readability contract

| Cue | Gameplay-distance signal | Small-screen read | Main idea only |
|---|---|---|---|
| `CADENCE_LOCK` | Three silhouettes visibly align | Pose and rhythm, not text | Shared cadence |
| `MEASUREMENT` | Full-width strip changes state | One large word maximum | The room observes |
| `DEVIATION` | B occupies a clearly different position | `ÉCART` supplements silhouette | One body is outside tolerance |
| `CORRECTION` | B moves to the common alignment line | Position change remains readable | The system corrects |
| `REFERENCE_INVERSION` | Human silhouettes stop while station status persists | Window uses one large signature message | Machines are in charge |
| `AFTERMATH_RETURN` | Familiar three-body composition returns | No small residual text | Normality rebuilds |
| `RESIDUE` | C's final silhouette differs and one station remains active | Position and status light carry meaning | Normality is imperfect |

No cue depends on a cinematic camera, precise stop, secondary audio, tiny counter, hidden headlight state or more than one dominant visual idea.

## 17. Confidence and evidence

Because the source was not human-auditioned, `HIGH` is unavailable as an overall artistic confidence rating.

| Cue | Structural evidence | Boundary reproducibility | Narrative fit | Overall confidence |
|---|---|---|---|---|
| `CADENCE_LOCK` | Strong full-band rise and high-flux onset | High | Strong but not heard | MEDIUM |
| `MEASUREMENT` | Distinct layer/flux change followed by sustained density | Medium | Plausible but not heard | MEDIUM |
| `DEVIATION` | Sharp energy contraction separate from later return | High | Strong inversion of stability | MEDIUM |
| `CORRECTION` | Firm simultaneous multi-band return | High | Clear authority gesture | MEDIUM |
| `REFERENCE_INVERSION` | Unique largest mid-track structural rupture | High | Exact identity-contract signature | MEDIUM |
| `AFTERMATH_RETURN` | Clear full-band return after rupture | High | Required recovery state | MEDIUM |
| `RESIDUE` | Distinct outro contraction and long decay | High | Strong aftermath placement | MEDIUM |

## 18. Rejected or deferred cue candidates

- Earlier routine onsets at `00:09.090`, `00:14.540` and `00:23.640` remain section boundaries, not primary visual cues; activating identity events there would make the anomaly arrive too early.
- Variations at `01:40.450`, `02:03.640`, `02:45.920`, `03:03.360` and `03:09.110` remain musical section changes only; no additional primary visual idea is justified.
- Headlight interaction remains deferred and has no cue dependency.
- No memory cue is defined.

## 19. Narrative coherence check

The recommended map preserves:

`normal → suspicious → measured → corrected → inverted → imperfectly normal`

- Maximum anomaly waits until the unique major rupture at `02:18.800`.
- Athlete, machine, strip and window layers do not all activate at once.
- Deviation and correction are separated by a measurable contraction/return pair.
- The signature owns the most distinctive structural window.
- Recovery begins at the full return; final residue waits until the outro contraction.
- No visual event is attached to a routine onset merely because it is metrically convenient.

## 20. Contract ready for initial implementation

`DRIFT-IV-BY-EUX-20` may implement, against this approved initial baseline:

- seven track-local cue boundaries listed in this document;
- deterministic phase resolution from zone, current track, playback state and current time;
- pause freeze, direct seek resolution, loop rearm and timestamp-aware zone re-entry;
- the approved interior reference-frame illusion with stationary shell/collider/node;
- the approved KPI order and unique signature text;
- the reduced-motion and mobile equivalents above.

It may not infer additional cues, move the building, add headlights or memory, bypass the global audio provider or create a generic 26-track state machine. A subsequent owner listening pass may still produce bounded timestamp adjustments within the approved windows before that lot's final acceptance.

## 21. Required listening and calibration follow-up

This is a listening and calibration checklist, not a precondition blocking initial implementation. `DRIFT-IV-BY-EUX-20` may proceed against the baseline in §9 while this checklist is worked through during `DRIFT-IV-BY-EUX-30`'s owner QA:

1. Audition the canonical source and accept or adjust each cue start/peak/end within its approved structural window.
2. Confirm whether `02:27.280` is the perceived signature peak, or whether the full return at `02:32.730` should own the visual peak while preserving the same window.
3. Confirm that the `00:42.480` layer change audibly justifies a separate `MEASUREMENT` cue.
4. Confirm that `01:08.820` and `01:20.010` read as distinct deviation and correction events rather than one combined passage.
5. Confirm the split between `AFTERMATH_RETURN` at `02:32.730` and final `RESIDUE` at `03:23.750`.

Any adjustment resulting from this checklist is bounded per §20 above and per the Identity Contract's `Required implementation follow-up` (§21) — it may refine timing, not reopen the approved signature mechanism, vocabulary or text.

> **Do not place visual events where the concept wants them. Place them where the track makes them inevitable.**
