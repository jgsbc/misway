import type { DriftBiome, DriftZoneConfig } from "@/types/drift";

type DriftZoneProps = {
  zone: DriftZoneConfig;
  mapWidth: number;
  mapHeight: number;
};

const biomeTone: Record<
  DriftBiome,
  {
    ring: string;
    core: string;
    text: string;
    microcopy: string;
  }
> = {
  "entry-signal": {
    ring: "border-sky-200/80 bg-sky-50/22",
    core: "border-sky-300/65 bg-white/70 shadow-[0_0_28px_rgba(125,190,220,0.24)]",
    text: "text-slate-700",
    microcopy: "text-slate-500",
  },
  "zeeland-road": {
    ring: "border-stone-300/75 bg-stone-100/24",
    core: "border-stone-400/50 bg-white/64",
    text: "text-stone-700",
    microcopy: "text-stone-500",
  },
  "midnight-office": {
    ring: "border-slate-300/70 bg-slate-100/22",
    core: "border-slate-400/45 bg-white/68 shadow-[0_0_22px_rgba(99,116,139,0.16)]",
    text: "text-slate-700",
    microcopy: "text-slate-500",
  },
  "here-there": {
    ring: "border-sky-200/80 bg-sky-50/18",
    core: "border-sky-300/55 bg-white/62",
    text: "text-slate-700",
    microcopy: "text-slate-500",
  },
  "plain-signal": {
    ring: "border-neutral-200/90 bg-white/16",
    core: "border-neutral-300/65 bg-white/60",
    text: "text-neutral-700",
    microcopy: "text-neutral-500",
  },
  "neural-loop": {
    ring: "border-indigo-200/60 bg-indigo-50/18",
    core: "border-indigo-300/45 bg-white/66",
    text: "text-slate-700",
    microcopy: "text-slate-500",
  },
  "hold-light": {
    ring: "border-amber-200/80 bg-amber-50/22",
    core: "border-amber-300/60 bg-white/68 shadow-[0_0_30px_rgba(245,180,75,0.24)]",
    text: "text-stone-700",
    microcopy: "text-stone-500",
  },
  "birth-yard": {
    ring: "border-orange-200/65 bg-orange-50/18",
    core: "border-orange-300/45 bg-white/62",
    text: "text-stone-700",
    microcopy: "text-stone-500",
  },
};

function toPercent(value: number, total: number) {
  return `${(value / total) * 100}%`;
}

function renderBiomeCue(biome: DriftBiome) {
  switch (biome) {
    case "entry-signal":
      return (
        <>
          <span className="absolute inset-[18%] rounded-full border border-sky-200/45" />
          <span className="absolute inset-[32%] rounded-full border border-sky-300/45" />
        </>
      );
    case "zeeland-road":
      return (
        <span className="absolute left-[12%] top-1/2 h-px w-[76%] -translate-y-1/2 bg-stone-400/45" />
      );
    case "midnight-office":
      return (
        <>
          <span className="absolute left-[26%] top-[28%] h-[32%] w-[42%] border border-slate-300/45 bg-white/22" />
          <span className="absolute left-[26%] top-[44%] h-px w-[42%] bg-slate-300/40" />
        </>
      );
    case "here-there":
      return (
        <>
          <span className="absolute left-[22%] top-[38%] h-[24%] w-[26%] rounded-full border border-sky-300/40 bg-white/24" />
          <span className="absolute right-[22%] top-[38%] h-[24%] w-[26%] rounded-full border border-sky-300/40 bg-white/24" />
          <span className="absolute left-[45%] top-1/2 h-px w-[10%] bg-slate-400/35" />
        </>
      );
    case "plain-signal":
      return (
        <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-500/45" />
      );
    case "neural-loop":
      return (
        <>
          <span className="absolute inset-[22%] rounded-full border border-indigo-300/35 border-r-transparent" />
          <span className="absolute inset-[34%] rounded-full border border-indigo-300/30 border-l-transparent" />
        </>
      );
    case "hold-light":
      return (
        <span className="absolute left-1/2 top-1/2 h-[46%] w-[46%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-100/40 shadow-[0_0_28px_rgba(245,190,90,0.32)]" />
      );
    case "birth-yard":
      return (
        <>
          <span className="absolute left-[28%] top-[34%] h-2 w-2 rotate-12 border border-orange-300/45 bg-white/28" />
          <span className="absolute right-[30%] bottom-[32%] h-2 w-2 -rotate-12 border border-orange-300/45 bg-white/28" />
        </>
      );
  }
}

export default function DriftZone({
  zone,
  mapWidth,
  mapHeight,
}: DriftZoneProps) {
  const tone = biomeTone[zone.biome];
  const microcopy = zone.microcopy[0] ?? zone.portalLabel;
  const isEntry = zone.trackSlug === null;

  return (
    <div
      className={`pointer-events-none absolute z-0 rounded-full border ${tone.ring}`}
      style={{
        left: toPercent(zone.x, mapWidth),
        top: toPercent(zone.y, mapHeight),
        width: toPercent(zone.radius * 2, mapWidth),
        height: toPercent(zone.radius * 2, mapHeight),
        transform: "translate(-50%, -50%)",
      }}
      aria-hidden="true"
    >
      <div className="absolute inset-0 overflow-hidden rounded-full">
        {renderBiomeCue(zone.biome)}
      </div>

      <div
        className={`absolute left-1/2 top-1/2 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border ${tone.core}`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            isEntry ? "bg-sky-400/65" : "bg-neutral-600/55"
          }`}
        />
      </div>

      <div className="absolute left-1/2 top-[calc(50%+18px)] w-28 -translate-x-1/2 text-center">
        <p
          className={`font-mono text-[7px] uppercase leading-3 tracking-[0.16em] md:text-[8px] ${tone.text}`}
        >
          {zone.label}
        </p>
        <p
          className={`mt-1 max-h-4 overflow-hidden font-mono text-[5px] uppercase leading-[1.25] tracking-[0.12em] md:text-[6px] ${tone.microcopy}`}
        >
          {zone.portalLabel} / {microcopy}
        </p>
      </div>
    </div>
  );
}
