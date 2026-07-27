/**
 * EUX GAINENT — track-local dramaturgy model (DRIFT-IV-BY-EUX-20).
 *
 * Local to this single track only. It is never a track registry, a shared
 * cue-to-animation engine, a shared dramaturgy engine or a generic residue
 * system — see `docs/DRIFT_3D_EUX_GAINENT_IDENTITY_CONTRACT.md` and
 * `docs/DRIFT_3D_EUX_GAINENT_CUE_MAP.md` for the approved artistic authority
 * this module implements against.
 *
 * Pure and framework-agnostic: no React import, no Three.js import, no
 * `window`/`document`/`navigator` access. Every function is `f(absoluteTime,
 * ...)`, never `f(previousState, delta)` — resolving the same absolute time
 * always yields the same visual state, so pause/seek/loop/re-entry are all
 * simply re-evaluations of the functions below, never a replay.
 *
 * The eight narrative phases and seven cue markers are the
 * `OWNER_APPROVED_INITIAL_IMPLEMENTATION_BASELINE` timestamps from the Cue
 * Map — none of them may be changed by this lot. Timeline validity is
 * proved with the shared, generic `getDrift3DCueTimelineIssues` from
 * `drift3dCueResolver.ts`; absolute-time resolution against the shared
 * audio clock is the caller's responsibility via
 * `resolveDrift3DCueFromAudioClock(EUX_GAINENT_PHASES, snapshot, nowMs)` —
 * this module never reads the audio clock itself.
 */

import type { Drift3DCuePhase } from "@/lib/drift3dCueResolver";

export const EUX_GAINENT_TRACK_SLUG = "eux-gainent";
export const EUX_GAINENT_NODE_ID = "birth-yard-eux-gainent";
export const EUX_GAINENT_LANDMARK_ID = "birth-eux-gainent-glass-gym";
export const EUX_GAINENT_TRACK_DURATION_SECONDS = 225.455;
export const EUX_GAINENT_SIGNATURE_ID = "eux-gainent-reference-inversion";

export type EuxGainentPhaseId =
  | "pre-cadence"
  | "cadence-lock"
  | "measurement"
  | "deviation"
  | "correction-revelation"
  | "reference-inversion"
  | "aftermath-return"
  | "residue";

/**
 * Owner-approved absolute timeline (Cue Map §9/§10). `correction-revelation`
 * deliberately spans both the CUE_04 cue window (80.010-87.260) and its
 * continued revelation (87.260-138.800) — the Cue Map is explicit that no
 * visual gap should appear between the cue's own end and the phase's end.
 */
export const EUX_GAINENT_PHASES: readonly Drift3DCuePhase<EuxGainentPhaseId>[] =
  Object.freeze([
    { id: "pre-cadence", startTimeSeconds: 0, endTimeSeconds: 28.38 },
    { id: "cadence-lock", startTimeSeconds: 28.38, endTimeSeconds: 42.48 },
    { id: "measurement", startTimeSeconds: 42.48, endTimeSeconds: 68.82 },
    { id: "deviation", startTimeSeconds: 68.82, endTimeSeconds: 80.01 },
    {
      id: "correction-revelation",
      startTimeSeconds: 80.01,
      endTimeSeconds: 138.8,
    },
    {
      id: "reference-inversion",
      startTimeSeconds: 138.8,
      endTimeSeconds: 152.73,
    },
    {
      id: "aftermath-return",
      startTimeSeconds: 152.73,
      endTimeSeconds: 203.75,
    },
    { id: "residue", startTimeSeconds: 203.75, endTimeSeconds: 225.455 },
  ]);

export type EuxGainentCueId =
  | "CUE_EUX_01_CADENCE_LOCK"
  | "CUE_EUX_02_MEASUREMENT"
  | "CUE_EUX_03_DEVIATION"
  | "CUE_EUX_04_CORRECTION"
  | "CUE_EUX_05_REFERENCE_INVERSION"
  | "CUE_EUX_06_AFTERMATH_RETURN"
  | "CUE_EUX_07_RESIDUE";

export type EuxGainentCueMarker = Readonly<{
  id: EuxGainentCueId;
  startSeconds: number;
  peakSeconds: number;
  endSeconds: number;
}>;

/** The seven owner-approved cues (Cue Map §9). Not to be modified by this lot. */
export const EUX_GAINENT_CUES: readonly EuxGainentCueMarker[] = Object.freeze([
  {
    id: "CUE_EUX_01_CADENCE_LOCK",
    startSeconds: 28.38,
    peakSeconds: 28.955,
    endSeconds: 42.48,
  },
  {
    id: "CUE_EUX_02_MEASUREMENT",
    startSeconds: 42.48,
    peakSeconds: 53.17,
    endSeconds: 68.82,
  },
  {
    id: "CUE_EUX_03_DEVIATION",
    startSeconds: 68.82,
    peakSeconds: 69.29,
    endSeconds: 80.01,
  },
  {
    id: "CUE_EUX_04_CORRECTION",
    startSeconds: 80.01,
    peakSeconds: 80.2,
    endSeconds: 87.26,
  },
  {
    id: "CUE_EUX_05_REFERENCE_INVERSION",
    startSeconds: 138.8,
    peakSeconds: 147.28,
    endSeconds: 152.73,
  },
  {
    id: "CUE_EUX_06_AFTERMATH_RETURN",
    startSeconds: 152.73,
    peakSeconds: 152.73,
    endSeconds: 203.75,
  },
  {
    id: "CUE_EUX_07_RESIDUE",
    startSeconds: 203.75,
    peakSeconds: 210.15,
    endSeconds: 225.455,
  },
]);

export type EuxGainentAthleteId = "A" | "B" | "C";

export const EUX_GAINENT_ATHLETE_IDS: readonly EuxGainentAthleteId[] =
  Object.freeze(["A", "B", "C"]);

function clamp01(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(1, Math.max(0, value));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp01(t);
}

/** Shared oscillation rate for the idle athlete/station gesture cycle. */
const IDLE_FREQUENCY = 2.65;

/** Radian phase offsets — asynchronous on purpose (§12: no perfect sync). */
const IDLE_PHASE_OFFSET: Readonly<Record<EuxGainentAthleteId, number>> = {
  A: 0,
  B: 1.55,
  C: 3.05,
};

/** Small residual offsets once cadence-lock completes (A exact, B late, C tiny residue). */
const LOCKED_PHASE_OFFSET: Readonly<Record<EuxGainentAthleteId, number>> = {
  A: 0,
  B: 0.32,
  C: 0.11,
};

/** Offsets once B has clearly diverged (deviation) — C reveals a smaller, distinct error. */
const DEVIATION_PHASE_OFFSET: Readonly<Record<EuxGainentAthleteId, number>> = {
  A: 0,
  B: 2.15,
  C: 0.55,
};

/** Offsets once B is mechanically recentered — never identical to A (still human). */
const CORRECTED_PHASE_OFFSET: Readonly<Record<EuxGainentAthleteId, number>> = {
  A: 0,
  B: 0.05,
  C: 0.55,
};

/** Residue window — C's error grows one final time; A/B stay as corrected. */
const RESIDUE_PHASE_OFFSET: Readonly<Record<EuxGainentAthleteId, number>> = {
  A: 0,
  B: 0.05,
  C: 0.86,
};

/**
 * Fixed resting cycle value each athlete freezes to during the signature —
 * A exact/neutral, B at its corrected position, C a fraction off-axis.
 * These are literal target values (not re-derived from `Math.sin`) so the
 * frozen posture reads as a deliberate, stable rest rather than an arbitrary
 * mid-gesture snapshot.
 */
const FREEZE_CYCLE_VALUE: Readonly<Record<EuxGainentAthleteId, number>> = {
  A: 0,
  B: 0.05,
  C: 0.42,
};

function idleCycle(athleteId: EuxGainentAthleteId, phaseOffset: number, absoluteTimeSeconds: number): number {
  return Math.sin(absoluteTimeSeconds * IDLE_FREQUENCY + phaseOffset);
}

export type EuxGainentAthleteVisualState = Readonly<{
  /** Deterministic gesture value in `[-1, 1]`, direct function of time. */
  cycleValue: number;
  /** Gesture amplitude scale in `[0, 1]` — reduces as the room "measures". */
  amplitude: number;
  /** `true` only during the signature window, once the freeze blend completes. */
  frozen: boolean;
}>;

export type EuxGainentStationVisualState = Readonly<{
  /** Deterministic machine cycle value in `[-1, 1]` — never freezes. */
  cycleValue: number;
}>;

export type EuxGainentVisualState = Readonly<{
  phaseId: EuxGainentPhaseId;
  phaseProgress: number;
  absoluteTimeSeconds: number;
  /** One of `CADENCE`/`ÉCART`/`CONFORMITÉ`/`RENDEMENT`/`OBJECTIF DÉPLACÉ`, or `null`. */
  dominantText: string | null;
  /** `true` only inside the reference-inversion window. */
  signatureEligible: boolean;
  humansFrozen: boolean;
  /** Interior reference-frame illusion progress in `[0, 1]`. Shell/collider/node never move. */
  interiorShift: number;
  athletes: Readonly<Record<EuxGainentAthleteId, EuxGainentAthleteVisualState>>;
  stations: Readonly<Record<EuxGainentAthleteId, EuxGainentStationVisualState>>;
}>;

/**
 * Vocabulary order (Identity Contract, resolved owner decision): `CADENCE →
 * ÉCART → CONFORMITÉ → RENDEMENT`, then the single reserved signature
 * sentence `OBJECTIF DÉPLACÉ`, clearing exactly at the start of aftermath.
 * The `RENDEMENT` → `OBJECTIF DÉPLACÉ` boundary is the cue's own analytical
 * peak (`CUE_EUX_05_REFERENCE_INVERSION.peakSeconds`), never a new timestamp.
 */
export function resolveEuxGainentDominantText(
  absoluteTimeSeconds: number
): string | null {
  const cadenceLock = EUX_GAINENT_CUES[0];
  const deviation = EUX_GAINENT_CUES[2];
  const correction = EUX_GAINENT_CUES[3];
  const inversion = EUX_GAINENT_CUES[4];

  if (absoluteTimeSeconds < cadenceLock.startSeconds) {
    return null;
  }

  if (absoluteTimeSeconds < deviation.startSeconds) {
    return "CADENCE";
  }

  if (absoluteTimeSeconds < correction.startSeconds) {
    return "ÉCART";
  }

  if (absoluteTimeSeconds < inversion.startSeconds) {
    return "CONFORMITÉ";
  }

  if (absoluteTimeSeconds < inversion.peakSeconds) {
    return "RENDEMENT";
  }

  if (absoluteTimeSeconds < inversion.endSeconds) {
    return "OBJECTIF DÉPLACÉ";
  }

  return null;
}

export type EuxGainentScreenState = Readonly<{
  /** Same value `resolveEuxGainentDominantText` would return — the one
   * dominant message, never duplicated by a secondary line. */
  headline: string | null;
  /** Two to five short operational fragments, never a second sentence. */
  secondaryLines: readonly string[];
}>;

const SCREEN_PEAK_BLANK_HALF_WINDOW_SECONDS = 0.6;

/**
 * The screen's secondary "operational fragment" grammar (owner review #2 —
 * DRIFT-IV-BY-EUX-30 rework V3: "il manque du fond"). A pure function of
 * absolute time and the already-resolved phase, exactly like
 * `resolveEuxGainentDominantText` — never a second engine, never a second
 * signature sentence. Content drifts deliberately from ordinary sport data
 * (pre-cadence, ticking) to fixed classification readings that no longer
 * clearly describe sport (from `cadence-lock` onward, static per phase) —
 * the quantization itself is part of the reveal: real training metrics
 * tick, a classification reading does not. Values are illustrative
 * fragments (`GAIN`/`PERTE`/`RESTE`/`DESTINATION`...), never explained.
 */
export function resolveEuxGainentScreenState(
  absoluteTimeSeconds: number,
  phaseId: EuxGainentPhaseId
): EuxGainentScreenState {
  const headline = resolveEuxGainentDominantText(absoluteTimeSeconds);

  if (phaseId === "pre-cadence") {
    const t = Math.max(0, Math.floor(absoluteTimeSeconds));
    const minutes = String(Math.floor(t / 60) % 100).padStart(2, "0");
    const seconds = String(t % 60).padStart(2, "0");
    const distanceKm = (t * 0.0032).toFixed(2);
    const cadence = Math.round(72 + Math.sin(t * 0.31) * 4);
    const serie = String(1 + (Math.floor(t / 40) % 3)).padStart(2, "0");
    const gain = (0.5 + t * 0.006).toFixed(1);

    return {
      headline,
      secondaryLines: [
        `TEMPS       ${minutes}:${seconds}`,
        `DIST.        ${distanceKm}`,
        `CAD.           ${cadence}`,
        `SÉRIE          ${serie}`,
        `GAIN          +${gain}`,
      ],
    };
  }

  if (phaseId === "cadence-lock") {
    return {
      headline,
      secondaryLines: [
        "SÉRIE        03/03",
        "TOLÉRANCE    ±0.3",
        "GAIN           +1",
        "VARIATION     0.2",
      ],
    };
  }

  if (phaseId === "measurement") {
    return {
      headline,
      secondaryLines: [
        "MESURE          03",
        "VARIATION     0.08",
        "FORME        03/03",
        "GAIN          +1.4",
        "RESTE            03",
      ],
    };
  }

  if (phaseId === "deviation") {
    return {
      headline,
      secondaryLines: [
        "VARIATION      +1",
        "PLAGE         HORS",
        "TOLÉRANCE      0.3",
        "RECALAGE        --",
        "RESTE            03",
      ],
    };
  }

  if (phaseId === "correction-revelation") {
    return {
      headline,
      secondaryLines: [
        "RECALAGE        01",
        "FORME        03/03",
        "GAIN            +2",
        "VARIATION      0.0",
        "RESTE            03",
      ],
    };
  }

  if (phaseId === "reference-inversion") {
    const inversion = EUX_GAINENT_CUES[4];
    const nearPeak =
      Math.abs(absoluteTimeSeconds - inversion.peakSeconds) <=
      SCREEN_PEAK_BLANK_HALF_WINDOW_SECONDS;

    if (nearPeak) {
      // The exact peak instant: everything fades except the headline
      // itself — the single most graphically powerful moment, never
      // competing with a secondary line.
      return { headline, secondaryLines: [] };
    }

    if (absoluteTimeSeconds < inversion.peakSeconds) {
      return {
        headline,
        secondaryLines: [
          "EFFORT          100",
          "GAIN            +3",
          "PERTE            --",
          "DÉPLACEMENT       0",
          "RESTE            03",
        ],
      };
    }

    return {
      headline,
      secondaryLines: [
        "GAIN            +3",
        "DÉPLACEMENT       0",
        "DESTINATION      --",
        "RESTE            03",
      ],
    };
  }

  if (phaseId === "aftermath-return") {
    const t = Math.max(0, Math.floor(absoluteTimeSeconds));
    const minutes = String(Math.floor(t / 60) % 100).padStart(2, "0");
    const seconds = String(t % 60).padStart(2, "0");
    const distanceKm = (t * 0.0032).toFixed(2);
    const cadence = Math.round(72 + Math.sin(t * 0.31) * 4);
    const serie = String(1 + (Math.floor(t / 40) % 3)).padStart(2, "0");

    return {
      headline,
      secondaryLines: [
        `TEMPS       ${minutes}:${seconds}`,
        `DIST.        ${distanceKm}`,
        `CAD.           ${cadence}`,
        `SÉRIE          ${serie}`,
        "RESTE            01",
      ],
    };
  }

  // residue
  return {
    headline,
    secondaryLines: ["SÉRIE     TERMINÉE", "GAIN             --", "RESTE            01"],
  };
}

/** `true` only for the exact reference-inversion window — the sole Level 3 situation. */
export function isEuxGainentSignatureWindow(
  phaseId: EuxGainentPhaseId
): boolean {
  return phaseId === "reference-inversion";
}

const FREEZE_BLEND_PHASE_PROGRESS = 0.08;

/**
 * The single pure entry point: given the absolute audio time and the phase
 * already resolved from it (via the shared, generic cue resolver against
 * `EUX_GAINENT_PHASES`), returns everything the living scene needs to set
 * transforms this frame. Never mutates, never remembers a previous frame.
 */
export function resolveEuxGainentVisualState(
  absoluteTimeSeconds: number,
  phaseId: EuxGainentPhaseId,
  phaseProgress: number
): EuxGainentVisualState {
  const dominantText = resolveEuxGainentDominantText(absoluteTimeSeconds);
  const signatureEligible = phaseId === "reference-inversion";

  let humansFrozen = false;
  let interiorShift = 0;
  const athletes: Record<EuxGainentAthleteId, EuxGainentAthleteVisualState> =
    {} as Record<EuxGainentAthleteId, EuxGainentAthleteVisualState>;
  const stations: Record<EuxGainentAthleteId, EuxGainentStationVisualState> =
    {} as Record<EuxGainentAthleteId, EuxGainentStationVisualState>;

  for (const athleteId of EUX_GAINENT_ATHLETE_IDS) {
    let phaseOffset = 0;
    let amplitude = 1;
    let frozen = false;

    switch (phaseId) {
      case "pre-cadence": {
        phaseOffset = IDLE_PHASE_OFFSET[athleteId];
        break;
      }
      case "cadence-lock": {
        phaseOffset = lerp(
          IDLE_PHASE_OFFSET[athleteId],
          LOCKED_PHASE_OFFSET[athleteId],
          phaseProgress
        );
        break;
      }
      case "measurement": {
        phaseOffset = LOCKED_PHASE_OFFSET[athleteId];
        amplitude = lerp(1, 0.85, phaseProgress);
        break;
      }
      case "deviation": {
        phaseOffset = lerp(
          LOCKED_PHASE_OFFSET[athleteId],
          DEVIATION_PHASE_OFFSET[athleteId],
          phaseProgress
        );
        amplitude = 0.85;
        break;
      }
      case "correction-revelation": {
        // The correction cue itself only covers the first slice of this
        // phase (80.010-87.260); the rest is the long revelation hold.
        const correctionCue = EUX_GAINENT_CUES[3];
        const correctionWindowSeconds =
          correctionCue.endSeconds - correctionCue.startSeconds;
        const correctionLocalProgress = clamp01(
          (absoluteTimeSeconds - correctionCue.startSeconds) /
            correctionWindowSeconds
        );
        const inCorrectionWindow =
          absoluteTimeSeconds < correctionCue.endSeconds;

        if (athleteId === "B" && inCorrectionWindow) {
          // Stop -> recenter -> resume, all within the cue's own window.
          const stopProgress = clamp01(correctionLocalProgress / 0.35);
          const recenterProgress = clamp01(
            (correctionLocalProgress - 0.35) / 0.4
          );
          phaseOffset = lerp(
            DEVIATION_PHASE_OFFSET.B,
            CORRECTED_PHASE_OFFSET.B,
            recenterProgress
          );
          amplitude = lerp(0.85, 0, stopProgress) * (1 - recenterProgress) +
            0.85 * recenterProgress;
        } else if (athleteId === "B") {
          phaseOffset = CORRECTED_PHASE_OFFSET.B;
          const revelationProgress = clamp01(
            (absoluteTimeSeconds - correctionCue.endSeconds) /
              (EUX_GAINENT_PHASES[4].endTimeSeconds - correctionCue.endSeconds)
          );
          amplitude = lerp(0.85, 0.6, revelationProgress);
        } else {
          phaseOffset =
            athleteId === "A"
              ? LOCKED_PHASE_OFFSET.A
              : CORRECTED_PHASE_OFFSET.C;
          const revelationProgress = clamp01(
            (absoluteTimeSeconds - correctionCue.startSeconds) /
              (EUX_GAINENT_PHASES[4].endTimeSeconds - correctionCue.startSeconds)
          );
          amplitude = lerp(0.85, 0.6, revelationProgress);
        }

        break;
      }
      case "reference-inversion": {
        phaseOffset = CORRECTED_PHASE_OFFSET[athleteId];
        amplitude = 0.6;
        humansFrozen = true;

        const blend = clamp01(phaseProgress / FREEZE_BLEND_PHASE_PROGRESS);
        const live = idleCycle(
          athleteId,
          phaseOffset,
          absoluteTimeSeconds
        );
        const value = lerp(live, FREEZE_CYCLE_VALUE[athleteId], blend);
        frozen = blend >= 1;

        athletes[athleteId] = { cycleValue: value, amplitude, frozen };

        // Interior shift ramps to its maximum near the cue's own analytical
        // peak, then eases back so no lasting building movement remains —
        // the shell/collider/node stay immobile regardless (owned by the
        // caller, never by this pure module).
        const peakProgress = clamp01(
          (EUX_GAINENT_CUES[4].peakSeconds - EUX_GAINENT_PHASES[5].startTimeSeconds) /
            (EUX_GAINENT_PHASES[5].endTimeSeconds - EUX_GAINENT_PHASES[5].startTimeSeconds)
        );
        interiorShift =
          phaseProgress <= peakProgress
            ? lerp(0, 1, phaseProgress / peakProgress)
            : lerp(
                1,
                0,
                (phaseProgress - peakProgress) / (1 - peakProgress)
              );

        continue;
      }
      case "aftermath-return": {
        phaseOffset = CORRECTED_PHASE_OFFSET[athleteId];
        amplitude =
          athleteId === "A"
            ? lerp(0.6, 1, phaseProgress)
            : athleteId === "B"
              ? lerp(0.6, 0.75, phaseProgress)
              : lerp(0.6, 0.95, phaseProgress);
        break;
      }
      case "residue": {
        phaseOffset = RESIDUE_PHASE_OFFSET[athleteId];
        amplitude = athleteId === "C" ? 1 : 0.85;
        break;
      }
    }

    const cycleValue = idleCycle(athleteId, phaseOffset, absoluteTimeSeconds);

    athletes[athleteId] = { cycleValue, amplitude, frozen };
  }

  for (const athleteId of EUX_GAINENT_ATHLETE_IDS) {
    // Stations never freeze — during the signature they visibly continue
    // "for themselves" while the athletes above hold still.
    const stationOffset =
      phaseId === "residue" && athleteId === "C"
        ? RESIDUE_PHASE_OFFSET.C * 0.6
        : phaseId === "cadence-lock"
          ? lerp(IDLE_PHASE_OFFSET[athleteId], 0, phaseProgress)
          : 0;

    stations[athleteId] = {
      cycleValue: idleCycle(athleteId, stationOffset, absoluteTimeSeconds),
    };
  }

  return {
    phaseId,
    phaseProgress,
    absoluteTimeSeconds,
    dominantText,
    signatureEligible,
    humansFrozen,
    interiorShift,
    athletes,
    stations,
  };
}

/**
 * Builds this track's single Level-3 signature candidate for
 * `arbitrateDrift3DMajorSignature` (SYS-30) — never a second candidate, never
 * a shared registry. `eligible` should be `insideZone && eux source active &&
 * phaseId === "reference-inversion"`, computed by the caller.
 */
export function buildEuxGainentSignatureCandidate(eligible: boolean) {
  return {
    id: EUX_GAINENT_SIGNATURE_ID,
    ownerKind: "active-track" as const,
    eligible,
    priority: 1,
  };
}

/**
 * `true` only when all three hold: the vehicle is inside the EUX zone, the
 * current global source kind is `"track"`, and its slug is
 * `EUX_GAINENT_TRACK_SLUG` — the caller supplies all three facts; this
 * module never reads the audio clock or the topology itself, and does not
 * receive (or branch on) `playbackState`. The global player remains the
 * sole owner of its own `ended`/next-track/loop transitions; this function
 * introduces no local lifecycle state machine of its own.
 */
export function resolveEuxGainentNarrativeActive(
  insideZone: boolean,
  sourceKind: "ambient" | "track",
  sourceSlug: string
): boolean {
  return insideZone && sourceKind === "track" && sourceSlug === EUX_GAINENT_TRACK_SLUG;
}
