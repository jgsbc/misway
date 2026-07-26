"use client";

import { useAudioPlayer } from "@/components/audio/AudioPlayerProvider";
import { resolveDrift3DCueAtTime } from "@/lib/drift3dCueResolver";
import {
  EUX_GAINENT_ATHLETE_IDS,
  EUX_GAINENT_PHASES,
  EUX_GAINENT_TRACK_DURATION_SECONDS,
  EUX_GAINENT_TRACK_SLUG,
  isEuxGainentSignatureWindow,
  resolveEuxGainentDominantText,
  type EuxGainentAthleteId,
  type EuxGainentPhaseId,
} from "@/lib/drift3dEuxGainent";

type EuxGainentFallbackPose = Readonly<{
  /** Fixed horizontal lean for this phase — never derived from time/cycle. */
  offset: number;
  /** Whether this athlete's station reads as visually active in this phase. */
  stationActive: boolean;
}>;

const PX_PER_OFFSET_UNIT = 6;

/**
 * One fixed pose per phase per athlete. Deliberately a lookup table keyed
 * only by `phaseId` — never by `currentTime`, `cycleValue` or
 * `phaseProgress` — so the fallback's visual representation is provably
 * identical between any two `timeupdate` events that land in the same
 * phase. No role is named here or anywhere in this file: the three
 * positions are legible only through relative offset and station-activity
 * state, matching the Identity Contract's requirement that A/B/C are never
 * identified by label/color/costume/text.
 */
const EUX_FALLBACK_POSES: Readonly<
  Record<
    EuxGainentPhaseId,
    Readonly<Record<EuxGainentAthleteId, EuxGainentFallbackPose>>
  >
> = Object.freeze({
  "pre-cadence": {
    A: { offset: -1, stationActive: false },
    B: { offset: 0, stationActive: false },
    C: { offset: 1, stationActive: false },
  },
  "cadence-lock": {
    A: { offset: 0, stationActive: true },
    B: { offset: 0.3, stationActive: true },
    C: { offset: 0.1, stationActive: true },
  },
  measurement: {
    A: { offset: 0, stationActive: true },
    B: { offset: 0.3, stationActive: true },
    C: { offset: 0.1, stationActive: true },
  },
  deviation: {
    A: { offset: 0, stationActive: true },
    B: { offset: 1.4, stationActive: true },
    C: { offset: 0.4, stationActive: true },
  },
  "correction-revelation": {
    A: { offset: 0, stationActive: true },
    B: { offset: 0.15, stationActive: true },
    C: { offset: 0.4, stationActive: true },
  },
  "reference-inversion": {
    A: { offset: 0, stationActive: true },
    B: { offset: 0.15, stationActive: true },
    C: { offset: 0.4, stationActive: true },
  },
  "aftermath-return": {
    A: { offset: 0, stationActive: true },
    B: { offset: 0.1, stationActive: true },
    C: { offset: 0.35, stationActive: true },
  },
  residue: {
    A: { offset: 0, stationActive: false },
    B: { offset: 0.1, stationActive: false },
    C: { offset: 0.7, stationActive: true },
  },
});

/**
 * Static/discrete reduced-motion (and no-WebGL enrichment) representation of
 * EUX GAINENT (DRIFT-IV-BY-EUX-20). No `<canvas>`, no continuous CSS
 * transition/animation, no belt-travel visual, no shake, no rapid pulse.
 * Every athlete/station position is a fixed pose looked up by `phaseId`
 * alone (`EUX_FALLBACK_POSES` above) — it never advances with
 * `currentTime` within a phase, only the discrete `dominantText` word (and
 * its one approved `RENDEMENT` → `OBJECTIF DÉPLACÉ` transition at the
 * signature's own analytical peak) is read continuously. No new timer is
 * introduced here, and this hook is read locally so a fast `timeupdate`
 * never re-renders `Drift3DClient`.
 *
 * Renders nothing when EUX GAINENT is not the current track — callers are
 * expected to mount this component unconditionally alongside the existing
 * SYS-50/SYS-60 fallback panel and let it decide for itself.
 */
export default function EuxGainentFallbackScene() {
  const { current, currentTime } = useAudioPlayer();
  const isEuxCurrent =
    current.kind === "track" && current.slug === EUX_GAINENT_TRACK_SLUG;

  if (!isEuxCurrent) {
    return null;
  }

  const resolution = resolveDrift3DCueAtTime(
    EUX_GAINENT_PHASES,
    currentTime,
    EUX_GAINENT_TRACK_DURATION_SECONDS
  );
  const phaseId: EuxGainentPhaseId = resolution.phaseId ?? "pre-cadence";
  const dominantText = resolveEuxGainentDominantText(currentTime);
  const humansFrozen = isEuxGainentSignatureWindow(phaseId);
  const poses = EUX_FALLBACK_POSES[phaseId];

  return (
    <section className="light-border light-card-bg mt-4 border p-4 md:p-5">
      <p className="light-text-tertiary font-mono text-[10px] uppercase tracking-[0.28em]">
        Eux Gainent — glass gym
      </p>
      <p className="light-text-secondary mt-2 max-w-xl text-xs leading-5">
        A credible gym behind glass. Three ordinary bodies, three ordinary
        machines — held here as still positions, not motion.
      </p>

      {dominantText ? (
        <p className="light-border light-card-bg mt-3 inline-block border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.3em]">
          {dominantText}
        </p>
      ) : null}

      <div className="light-border mt-4 border-t pt-4">
        <div className="relative flex h-16 items-end justify-center gap-10">
          {EUX_GAINENT_ATHLETE_IDS.map((athleteId) => {
            const pose = poses[athleteId];
            const offsetPx = pose.offset * PX_PER_OFFSET_UNIT;

            return (
              <span
                key={athleteId}
                className={
                  "block h-8 w-3 rounded-full " +
                  (humansFrozen ? "bg-neutral-400" : "bg-neutral-700")
                }
                style={{ transform: `translateX(${offsetPx}px)` }}
                aria-hidden="true"
              />
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-center gap-3">
          {EUX_GAINENT_ATHLETE_IDS.map((athleteId) => (
            <span
              key={`station-${athleteId}`}
              className={
                "h-1.5 w-10 rounded-full " +
                (poses[athleteId].stationActive
                  ? "bg-sky-400"
                  : "bg-neutral-300")
              }
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
