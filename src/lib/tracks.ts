export type Track = {
  id: string;
  slug: string;
  title: string;
  soundcloudUrl: string;
  embedUrl: string;
  yearLabel: string;
  publishedLabel: string;
  duration?: string;
  shortText: string;
  longText: string;
  tags: string[];
  coverImage?: string;
  coverHint?: string;
  featured?: boolean;
};

export const tracks: Track[] = [
  {
    id: "01",
    slug: "rise",
    title: "RISE",
    soundcloudUrl: "https://soundcloud.com/misway/rise",
    embedUrl:
      "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/misway/rise&color=%23050505&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=true&visual=false",
    yearLabel: "2016",
    publishedLabel: "Older era",
    duration: "3:58",
    shortText: "An early ascent through shadow and momentum.",
    longText:
      "One of the older visible nodes in the MISWΛY timeline, carrying an earlier phase of movement and emergence.",
    tags: ["early", "uplift", "shadow"],
    coverImage: "/images/tracks/rise.png",
    coverHint: "dark ascent",
  },
  {
    id: "02",
    slug: "blossoming",
    title: "BLOSSOMING",
    soundcloudUrl: "https://soundcloud.com/misway/blossoming",
    embedUrl:
      "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/misway/blossoming&color=%23050505&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=true&visual=false",
    yearLabel: "2016",
    publishedLabel: "Older era",
    duration: "7:02",
    shortText: "Organic opening, slow emergence, internal bloom.",
    longText:
      "A long-form older piece, more expansive and open, suggesting growth rather than rupture.",
    tags: ["early", "organic", "longform"],
    coverImage: "/images/tracks/blossoming.png",
    coverHint: "dim bloom",
  },
  {
    id: "03",
    slug: "ethnic-stick",
    title: "ETHNIC STICK",
    soundcloudUrl: "https://soundcloud.com/misway/ethnic-stick",
    embedUrl:
      "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/misway/ethnic-stick&color=%23050505&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=true&visual=false",
    yearLabel: "2016",
    publishedLabel: "Older era",
    duration: "4:39",
    shortText: "Rhythmic matter, roots, texture and ritual residue.",
    longText:
      "An older track that feels more percussive and material, with a more tactile identity in the chronology.",
    tags: ["rhythm", "texture", "ritual"],
    coverImage: "/images/tracks/ethnic-stick.png",
    coverHint: "earth pulse",
  },
  {
    id: "04",
    slug: "minuit-moins-cinq",
    title: "MINUIT MOINS CINQ",
    soundcloudUrl: "https://soundcloud.com/misway/minuit-moins-cinq",
    embedUrl:
      "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/misway/minuit-moins-cinq&color=%23050505&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=true&visual=false",
    yearLabel: "2016",
    publishedLabel: "Older era",
    duration: "5:10",
    shortText: "Threshold music: almost midnight, almost rupture.",
    longText:
      "A liminal title and an older timestamp: this feels like one of the earliest strong narrative markers in the catalog.",
    tags: ["night", "threshold", "liminal"],
    coverImage: "/images/tracks/minuit-moins-cinq.png",
    coverHint: "late midnight",
    featured: true,
  },
  {
    id: "05",
    slug: "misway-perdue",
    title: "PERDUE",
    soundcloudUrl: "https://soundcloud.com/misway/misway-2021-moins-cinq",
    embedUrl:
      "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/misway/misway-2021-moins-cinq&color=%23050505&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=true&visual=false",
    yearLabel: "2021",
    publishedLabel: "Older era",
    duration: "6:33",
    shortText: "A named hinge in the timeline, likely tied to 2021.",
    longText:
      "This track likely belongs to a transitional phase around 2021, but the exact public date was not recoverable from indexed snippets.",
    tags: ["transition", "archive", "to-confirm"],
    coverImage: "/images/tracks/perdue.png",
    coverHint: "archival node",
  },
  {
    id: "06",
    slug: "morne-et-1",
    title: "MORNE, ET ?",
    soundcloudUrl: "https://soundcloud.com/misway/morne-et-1",
    embedUrl:
      "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/misway/morne-et-1&color=%23050505&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=true&visual=false",
    yearLabel: "2023",
    publishedLabel: "Vegetative era",
    duration: "3:29",
    shortText: "Grey weather, suspended thought, unresolved tone.",
    longText:
      "A title with ambiguity and tension, sitting in the mid-period of the visible catalog.",
    tags: ["grey", "question", "mid-era"],
    coverImage: "/images/tracks/morne-et.png",
    coverHint: "fog and doubt",
  },
  {
    id: "07",
    slug: "daymason",
    title: "DAYMASON",
    soundcloudUrl: "https://soundcloud.com/misway/daymason",
    embedUrl:
      "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/misway/daymason&color=%23050505&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=true&visual=false",
    yearLabel: "2023",
    publishedLabel: "Vegetative era",
    duration: "2:41",
    shortText: "A compact fragment with construction energy and daylight strain.",
    longText:
      "One of the first precisely dated nodes we can place in the public chronology.",
    tags: ["fragment", "construction", "2023"],
    coverImage: "/images/tracks/daymason.png",
    coverHint: "cold day build",
    featured: true,
  },
  {
    id: "08",
    slug: "chailk",
    title: "CHAILK",
    soundcloudUrl: "https://soundcloud.com/misway/chailk",
    embedUrl:
      "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/misway/chailk&color=%23050505&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=true&visual=false",
    yearLabel: "2023",
    publishedLabel: "Vegetative era",
    duration: "2:20",
    shortText: "Dust, mark, abrasion, white trace on dark surface.",
    longText:
      "Its title feels tactile and graphic, part of a dense cluster of spring 2023 uploads.",
    tags: ["dust", "mark", "surface"],
    coverImage: "/images/tracks/chailk.png",
    coverHint: "chalk in darkness",
  },
  {
    id: "09",
    slug: "time",
    title: "TIME",
    soundcloudUrl: "https://soundcloud.com/misway/time",
    embedUrl:
      "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/misway/time&color=%23050505&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=true&visual=false",
    yearLabel: "2023",
    publishedLabel: "Vegetative era",
    duration: "3:30",
    shortText: "A direct title, probably one of the cleaner emotional axes.",
    longText:
      "Part of the late-May 2023 cluster, likely carrying a more explicit temporal theme.",
    tags: ["time", "reflection", "2023"],
    coverImage: "/images/tracks/time.png",
    coverHint: "clockless glow",
  },
  {
    id: "10",
    slug: "tantitom",
    title: "TANTITOM",
    soundcloudUrl: "https://soundcloud.com/misway/tantitom",
    embedUrl:
      "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/misway/tantitom&color=%23050505&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=true&visual=false",
    yearLabel: "2023",
    publishedLabel: "Vegetative era",
    duration: "2:59",
    shortText: "A more playful or coded node in the sequence.",
    longText:
      "Uploaded the same day as TIME, this looks like part of the same creative burst.",
    tags: ["coded", "playful", "burst"],
    coverImage: "/images/tracks/tantitom.png",
    coverHint: "quirky pulse",
  },
  {
    id: "11",
    slug: "neektareum-1",
    title: "NEEKTAREUM",
    soundcloudUrl: "https://soundcloud.com/misway/neektareum-1",
    embedUrl:
      "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/misway/neektareum-1&color=%23050505&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=true&visual=false",
    yearLabel: "2025",
    publishedLabel: "New era",
    duration: "2:32",
    shortText: "A return with a denser and stranger naming energy.",
    longText:
      "This marks a later visible phase in the catalog, alongside another 2025 upload on the same date.",
    tags: ["return", "strange", "2025"],
    coverImage: "/images/tracks/neektareum.png",
    coverHint: "nectar glitch",
    featured: true,
  },
  {
    id: "12",
    slug: "asitis",
    title: "ASITIS",
    soundcloudUrl: "https://soundcloud.com/misway/asitis",
    embedUrl:
      "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/misway/asitis&color=%23050505&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=true&visual=false",
    yearLabel: "2025",
    publishedLabel: "New era",
    duration: "2:44",
    shortText: "An acceptance node: direct, restrained, almost bare.",
    longText:
      "One of the clearly dated recent tracks, compact and stark in title and timing.",
    tags: ["recent", "acceptance", "bare"],
    coverImage: "/images/tracks/asitis.png",
    coverHint: "plain signal",
  },
  {
    id: "13",
    slug: "relative",
    title: "RELATIVE",
    soundcloudUrl: "https://soundcloud.com/misway/relative",
    embedUrl:
      "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/misway/relative&color=%23050505&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=true&visual=false",
    yearLabel: "2026",
    publishedLabel: "New era",
    duration: "3:04",
    shortText: "A shifting reference frame, intimate and unstable.",
    longText:
      "A very recent piece in the public snapshot, part of the newest visible MISWΛY wave.",
    tags: ["recent", "relation", "movement"],
    coverImage: "/images/tracks/relative.png",
    coverHint: "orbital drift",
  },
  {
    id: "14",
    slug: "overthink",
    title: "OVERTHINK",
    soundcloudUrl: "https://soundcloud.com/misway/overthink",
    embedUrl:
      "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/misway/overthink&color=%23050505&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=true&visual=false",
    yearLabel: "2026",
    publishedLabel: "New era",
    duration: "2:08",
    shortText: "Fast cognitive looping, pressure and internal noise.",
    longText:
      "A short recent node, likely sharper and more nervous in energy.",
    tags: ["recent", "mental", "loop"],
    coverImage: "/images/tracks/overthink.png",
    coverHint: "neural static",
  },
  {
    id: "15",
    slug: "hold-the-light",
    title: "HOLD THE LIGHT",
    soundcloudUrl: "https://soundcloud.com/misway/hold-the-light",
    embedUrl:
      "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/misway/hold-the-light&color=%23050505&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=true&visual=false",
    yearLabel: "2026",
    publishedLabel: "New era",
    duration: "2:42",
    shortText: "A fragile luminous axis in the newer material.",
    longText:
      "This one stands out as a visible recent popular track and feels like a strong emotional anchor for the V1.",
    tags: ["recent", "light", "anchor"],
    coverImage: "/images/tracks/hold-the-light.png",
    coverHint: "held glow",
    featured: true,
  },
  {
    id: "16",
    slug: "midnight-work",
    title: "MIDNIGHT WORK",
    soundcloudUrl: "https://soundcloud.com/misway/midnight-work",
    embedUrl:
      "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/misway/midnight-work&color=%23050505&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=true&visual=false",
    yearLabel: "2026",
    publishedLabel: "New era",
    duration: "5:27",
    shortText: "Late labour, insomnia, studio residue and inner persistence.",
    longText:
      "A longer recent piece, closing the visible timeline with a stronger nocturnal studio identity.",
    tags: ["recent", "night", "studio"],
    coverImage: "/images/tracks/midnight-work.png",
    coverHint: "midnight console",
    featured: true,
  },
  {
    id: "17",
    slug: "telatelaba",
    title: "TELATELABA",
    soundcloudUrl: "https://soundcloud.com/misway/telatelaba",
    embedUrl:
      "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/misway/telatelaba&color=%23050505&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=true&visual=false",
    yearLabel: "2026",
    publishedLabel: "New era",
    duration: "2:47",
    shortText: "in between",
    longText:
      "Somewhere here somewhere there, for sure somewhere.",
    tags: ["recent", "in progress", "keep on"],
    coverImage: "/images/tracks/telatelaba.png",
    coverHint: "liminal passage",
  },
];

export function getTrackBySlug(slug: string) {
  return tracks.find((track) => track.slug === slug);
}

export const featuredTracks = tracks.filter((track) => track.featured);