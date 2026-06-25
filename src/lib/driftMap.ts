import { tracks } from "@/lib/tracks";
import type { Track } from "@/lib/tracks";
import type { DriftMapConfig, DriftZoneConfig } from "@/types/drift";

export const driftMapConfig: DriftMapConfig = {
  width: 1600,
  height: 1000,
  spawn: { x: 180, y: 500 },
  zones: [
    {
      id: "entry-node",
      trackSlug: null,
      label: "Entry Node",
      x: 180,
      y: 500,
      radius: 140,
      biome: "entry-signal",
      portalLabel: "Weak Signal",
      microcopy: [
        "NO GPS FOR INNER WEATHER",
        "START SOMEWHERE. NOT NECESSARILY HERE.",
      ],
      accentMood: "signal",
      props: [
        {
          id: "entry-sign",
          type: "sign",
          x: 150,
          y: 455,
          rotation: -4,
          label: "YOU ARE NOT HERE",
        },
        {
          id: "entry-marker",
          type: "marker",
          x: 220,
          y: 545,
        },
      ],
    },
    {
      id: "zeeland-road",
      trackSlug: "a-walk-in-zeeland",
      label: "Zeeland Road",
      x: 420,
      y: 250,
      radius: 150,
      biome: "zeeland-road",
      portalLabel: "Open Road",
      microcopy: [
        "THE ROAD IS FLAT. THE SIGNAL IS NOT.",
        "FIRST STEPS, SIDEWAYS.",
      ],
      accentMood: "dust",
      props: [
        {
          id: "zeeland-sign",
          type: "sign",
          x: 360,
          y: 230,
          rotation: -8,
        },
        {
          id: "zeeland-stone",
          type: "stone",
          x: 485,
          y: 285,
        },
      ],
    },
    {
      id: "midnight-office",
      trackSlug: "midnight-work",
      label: "Midnight Office",
      x: 760,
      y: 210,
      radius: 145,
      biome: "midnight-office",
      portalLabel: "Desk Light",
      microcopy: [
        "PLEASE DO NOT OPTIMIZE THE DRIFT",
        "THE DESK IS A WEATHER STATION.",
      ],
      accentMood: "night",
      props: [
        {
          id: "midnight-desk",
          type: "desk",
          x: 725,
          y: 220,
        },
        {
          id: "midnight-lamp",
          type: "lamp",
          x: 790,
          y: 180,
          rotation: 7,
        },
        {
          id: "midnight-cable",
          type: "cable",
          x: 810,
          y: 250,
          rotation: 18,
        },
      ],
    },
    {
      id: "here-there-islands",
      trackSlug: "telatelaba",
      label: "Here-There Islands",
      x: 1180,
      y: 290,
      radius: 160,
      biome: "here-there",
      portalLabel: "Broken Bridge",
      microcopy: [
        "YOU ARE HERE. YOU ARE ALSO THERE.",
        "BRIDGE STATUS: EMOTIONALLY UNCLEAR.",
      ],
      accentMood: "cold",
      props: [
        {
          id: "here-bridge",
          type: "bridge",
          x: 1175,
          y: 310,
          rotation: 4,
        },
        {
          id: "there-sign",
          type: "sign",
          x: 1245,
          y: 255,
          rotation: 11,
          label: "THERE",
        },
      ],
    },
    {
      id: "plain-signal",
      trackSlug: "asitis",
      label: "Plain Signal",
      x: 1320,
      y: 650,
      radius: 135,
      biome: "plain-signal",
      portalLabel: "As It Is",
      microcopy: ["AS IT IS. RUDE BUT USEFUL.", "NOTHING TO DECORATE."],
      accentMood: "neutral",
      props: [
        {
          id: "plain-marker",
          type: "marker",
          x: 1315,
          y: 630,
        },
        {
          id: "plain-stone",
          type: "stone",
          x: 1365,
          y: 695,
        },
      ],
    },
    {
      id: "neural-loop",
      trackSlug: "overthink",
      label: "Neural Loop",
      x: 880,
      y: 720,
      radius: 165,
      biome: "neural-loop",
      portalLabel: "Loop Entry",
      microcopy: ["MIND THE LOOP", "EXIT FOUND. EXIT DOUBTED."],
      accentMood: "signal",
      props: [
        {
          id: "loop-arrow-a",
          type: "loop-arrow",
          x: 840,
          y: 690,
          rotation: 34,
        },
        {
          id: "loop-arrow-b",
          type: "loop-arrow",
          x: 925,
          y: 750,
          rotation: 196,
        },
      ],
    },
    {
      id: "hold-lamp",
      trackSlug: "hold-the-light",
      label: "Hold Lamp",
      x: 560,
      y: 760,
      radius: 140,
      biome: "hold-light",
      portalLabel: "Small Light",
      microcopy: [
        "SLOW DOWN, YOU ARE IN A SONG",
        "THE LIGHT IS SMALL. KEEP IT ANYWAY.",
      ],
      accentMood: "warm",
      props: [
        {
          id: "hold-lamp-prop",
          type: "lamp",
          x: 560,
          y: 730,
        },
        {
          id: "hold-chair",
          type: "chair",
          x: 610,
          y: 795,
          rotation: -12,
        },
      ],
    },
    {
      id: "birth-yard",
      trackSlug: "foolfoule",
      label: "Birth Yard",
      x: 270,
      y: 760,
      radius: 150,
      biome: "birth-yard",
      portalLabel: "Crooked Yard",
      microcopy: ["ZONE À PEU PRÈS MASTERISÉE", "FIRST IDEAS PARKED BADLY."],
      accentMood: "dust",
      props: [
        {
          id: "birth-synth",
          type: "synth",
          x: 245,
          y: 735,
          rotation: -5,
        },
        {
          id: "birth-speaker",
          type: "speaker",
          x: 315,
          y: 790,
          rotation: 8,
        },
      ],
    },
  ],
};

export const driftZones = driftMapConfig.zones;

export function getDriftZoneById(id: string) {
  return driftZones.find((zone) => zone.id === id) ?? null;
}

export function getTrackForDriftZone(zone: DriftZoneConfig): Track | null {
  if (!zone.trackSlug) {
    return null;
  }

  return tracks.find((track) => track.slug === zone.trackSlug) ?? null;
}

export function getPlayableDriftZones() {
  return driftZones.filter((zone) => getTrackForDriftZone(zone) !== null);
}

export function getInvalidDriftZoneTrackSlugs() {
  const validSlugs = new Set(tracks.map((track) => track.slug));

  return driftZones
    .map((zone) => zone.trackSlug)
    .filter(
      (trackSlug): trackSlug is string =>
        trackSlug !== null && !validSlugs.has(trackSlug)
    );
}
