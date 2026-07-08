export type DriftBiome =
  | "entry-signal"
  | "zeeland-road"
  | "midnight-office"
  | "here-there"
  | "plain-signal"
  | "neural-loop"
  | "hold-light"
  | "birth-yard";

export type DriftPropType =
  | "sign"
  | "lamp"
  | "speaker"
  | "cable"
  | "chair"
  | "stone"
  | "synth"
  | "marker"
  | "bridge"
  | "desk"
  | "loop-arrow";

export type DriftAccentMood =
  | "cold"
  | "warm"
  | "neutral"
  | "night"
  | "dust"
  | "signal";

export type DriftProp = {
  id: string;
  type: DriftPropType;
  x: number;
  y: number;
  rotation?: number;
  label?: string;
};

export type DriftZoneConfig = {
  id: string;
  trackSlug: string | null;
  label: string;
  x: number;
  y: number;
  radius: number;
  biome: DriftBiome;
  portalLabel: string;
  microcopy: string[];
  props?: DriftProp[];
  accentMood?: DriftAccentMood;
};

export type DriftMapConfig = {
  width: number;
  height: number;
  spawn: { x: number; y: number };
  zones: DriftZoneConfig[];
};
