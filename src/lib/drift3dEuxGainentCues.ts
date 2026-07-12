export const EUX_GAINENT_TRACK_SLUG = "eux-gainent";
export const EUX_GAINENT_TRACK_DURATION_SECONDS = 225.455;

export type EuxGainentCuePhase =
  | "pre-cadence"
  | "cadence-lock"
  | "measurement"
  | "deviation"
  | "correction"
  | "reference-inversion"
  | "aftermath-return"
  | "residue";

export type EuxGainentCue = {
  id:
    | "CUE_EUX_01_CADENCE_LOCK"
    | "CUE_EUX_02_MEASUREMENT"
    | "CUE_EUX_03_DEVIATION"
    | "CUE_EUX_04_CORRECTION"
    | "CUE_EUX_05_REFERENCE_INVERSION"
    | "CUE_EUX_06_AFTERMATH_RETURN"
    | "CUE_EUX_07_RESIDUE";
  startSeconds: number;
  peakSeconds: number;
  endSeconds: number;
  anomalyLevel: 1 | 2 | 3;
  phase: Exclude<EuxGainentCuePhase, "pre-cadence">;
};

export type EuxGainentCueState = {
  readonly phase: EuxGainentCuePhase;
  readonly phaseStartSeconds: number;
  readonly phasePeakSeconds: number;
  readonly phaseEndSeconds: number;
  readonly anomalyLevel: 0 | 1 | 2 | 3;
};

export const euxGainentCues = [
  {
    id: "CUE_EUX_01_CADENCE_LOCK",
    startSeconds: 28.38,
    peakSeconds: 28.955,
    endSeconds: 42.48,
    anomalyLevel: 1,
    phase: "cadence-lock",
  },
  {
    id: "CUE_EUX_02_MEASUREMENT",
    startSeconds: 42.48,
    peakSeconds: 53.17,
    endSeconds: 68.82,
    anomalyLevel: 2,
    phase: "measurement",
  },
  {
    id: "CUE_EUX_03_DEVIATION",
    startSeconds: 68.82,
    peakSeconds: 69.29,
    endSeconds: 80.01,
    anomalyLevel: 2,
    phase: "deviation",
  },
  {
    id: "CUE_EUX_04_CORRECTION",
    startSeconds: 80.01,
    peakSeconds: 80.2,
    endSeconds: 87.26,
    anomalyLevel: 2,
    phase: "correction",
  },
  {
    id: "CUE_EUX_05_REFERENCE_INVERSION",
    startSeconds: 138.8,
    peakSeconds: 147.28,
    endSeconds: 152.73,
    anomalyLevel: 3,
    phase: "reference-inversion",
  },
  {
    id: "CUE_EUX_06_AFTERMATH_RETURN",
    startSeconds: 152.73,
    peakSeconds: 152.73,
    endSeconds: 203.75,
    anomalyLevel: 1,
    phase: "aftermath-return",
  },
  {
    id: "CUE_EUX_07_RESIDUE",
    startSeconds: 203.75,
    peakSeconds: 210.15,
    endSeconds: 225.455,
    anomalyLevel: 1,
    phase: "residue",
  },
] as const satisfies readonly EuxGainentCue[];

const PRE_CADENCE_STATE: EuxGainentCueState = {
  phase: "pre-cadence",
  phaseStartSeconds: 0,
  phasePeakSeconds: 0,
  phaseEndSeconds: euxGainentCues[0].startSeconds,
  anomalyLevel: 0,
};

const CADENCE_LOCK_STATE: EuxGainentCueState = {
  phase: "cadence-lock",
  phaseStartSeconds: euxGainentCues[0].startSeconds,
  phasePeakSeconds: euxGainentCues[0].peakSeconds,
  phaseEndSeconds: euxGainentCues[1].startSeconds,
  anomalyLevel: 1,
};

const MEASUREMENT_STATE: EuxGainentCueState = {
  phase: "measurement",
  phaseStartSeconds: euxGainentCues[1].startSeconds,
  phasePeakSeconds: euxGainentCues[1].peakSeconds,
  phaseEndSeconds: euxGainentCues[2].startSeconds,
  anomalyLevel: 2,
};

const DEVIATION_STATE: EuxGainentCueState = {
  phase: "deviation",
  phaseStartSeconds: euxGainentCues[2].startSeconds,
  phasePeakSeconds: euxGainentCues[2].peakSeconds,
  phaseEndSeconds: euxGainentCues[3].startSeconds,
  anomalyLevel: 2,
};

const CORRECTION_STATE: EuxGainentCueState = {
  phase: "correction",
  phaseStartSeconds: euxGainentCues[3].startSeconds,
  phasePeakSeconds: euxGainentCues[3].peakSeconds,
  phaseEndSeconds: euxGainentCues[4].startSeconds,
  anomalyLevel: 2,
};

const REFERENCE_INVERSION_STATE: EuxGainentCueState = {
  phase: "reference-inversion",
  phaseStartSeconds: euxGainentCues[4].startSeconds,
  phasePeakSeconds: euxGainentCues[4].peakSeconds,
  phaseEndSeconds: euxGainentCues[5].startSeconds,
  anomalyLevel: 3,
};

const AFTERMATH_RETURN_STATE: EuxGainentCueState = {
  phase: "aftermath-return",
  phaseStartSeconds: euxGainentCues[5].startSeconds,
  phasePeakSeconds: euxGainentCues[5].peakSeconds,
  phaseEndSeconds: euxGainentCues[6].startSeconds,
  anomalyLevel: 1,
};

const RESIDUE_STATE: EuxGainentCueState = {
  phase: "residue",
  phaseStartSeconds: euxGainentCues[6].startSeconds,
  phasePeakSeconds: euxGainentCues[6].peakSeconds,
  phaseEndSeconds: EUX_GAINENT_TRACK_DURATION_SECONDS,
  anomalyLevel: 1,
};

function normalizeEuxGainentTime(timeSeconds: number) {
  if (!Number.isFinite(timeSeconds)) {
    return 0;
  }

  return Math.min(
    Math.max(timeSeconds, 0),
    EUX_GAINENT_TRACK_DURATION_SECONDS
  );
}

export function resolveEuxGainentCueState(
  timeSeconds: number
): EuxGainentCueState {
  const time = normalizeEuxGainentTime(timeSeconds);

  if (time < CADENCE_LOCK_STATE.phaseStartSeconds) {
    return PRE_CADENCE_STATE;
  }

  if (time < MEASUREMENT_STATE.phaseStartSeconds) {
    return CADENCE_LOCK_STATE;
  }

  if (time < DEVIATION_STATE.phaseStartSeconds) {
    return MEASUREMENT_STATE;
  }

  if (time < CORRECTION_STATE.phaseStartSeconds) {
    return DEVIATION_STATE;
  }

  if (time < REFERENCE_INVERSION_STATE.phaseStartSeconds) {
    return CORRECTION_STATE;
  }

  if (time < AFTERMATH_RETURN_STATE.phaseStartSeconds) {
    return REFERENCE_INVERSION_STATE;
  }

  if (time < RESIDUE_STATE.phaseStartSeconds) {
    return AFTERMATH_RETURN_STATE;
  }

  return RESIDUE_STATE;
}

export function resolveEuxGainentPhaseProgress(
  timeSeconds: number,
  state: EuxGainentCueState
) {
  const duration = state.phaseEndSeconds - state.phaseStartSeconds;

  if (duration <= 0) {
    return 1;
  }

  return Math.min(
    Math.max((timeSeconds - state.phaseStartSeconds) / duration, 0),
    1
  );
}
