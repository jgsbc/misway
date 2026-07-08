import type { DriftProp as DriftPropConfig } from "@/types/drift";

type DriftPropProps = {
  prop: DriftPropConfig;
  mapWidth: number;
  mapHeight: number;
};

function toPercent(value: number, total: number) {
  return `${(value / total) * 100}%`;
}

function renderPropShape(prop: DriftPropConfig) {
  switch (prop.type) {
    case "sign":
      return (
        <span className="flex h-7 min-w-10 items-center justify-center border border-neutral-500/45 bg-white/70 px-1.5 font-mono text-[6px] uppercase tracking-[0.14em] text-neutral-700 shadow-[0_6px_14px_rgba(80,72,62,0.12)]">
          {prop.label ?? "SIGN"}
        </span>
      );
    case "lamp":
      return (
        <span className="relative block h-9 w-7">
          <span className="absolute left-1/2 top-0 h-5 w-5 -translate-x-1/2 rounded-full border border-amber-300/55 bg-amber-100/60 shadow-[0_0_24px_rgba(245,185,92,0.34)]" />
          <span className="absolute bottom-1 left-1/2 h-5 w-px -translate-x-1/2 bg-neutral-500/45" />
          <span className="absolute bottom-0 left-1/2 h-px w-5 -translate-x-1/2 bg-neutral-500/40" />
        </span>
      );
    case "speaker":
      return (
        <span className="relative flex h-7 w-7 items-center justify-center border border-neutral-500/40 bg-neutral-100/70">
          <span className="h-2.5 w-2.5 rounded-full border border-neutral-600/50" />
          <span className="absolute right-1 top-1 h-1 w-1 rounded-full bg-neutral-500/60" />
        </span>
      );
    case "cable":
      return (
        <span className="block h-1 w-12 rounded-full border-t border-dashed border-neutral-500/45" />
      );
    case "chair":
      return (
        <span className="relative block h-7 w-7">
          <span className="absolute left-1 top-2 h-3 w-4 border border-neutral-500/45 bg-white/55" />
          <span className="absolute left-1 bottom-1 h-3 w-px bg-neutral-500/45" />
          <span className="absolute right-2 bottom-1 h-3 w-px bg-neutral-500/45" />
        </span>
      );
    case "stone":
      return (
        <span className="block h-5 w-6 rounded-[48%_52%_44%_56%] border border-stone-400/45 bg-stone-200/55 shadow-[0_4px_10px_rgba(90,82,70,0.1)]" />
      );
    case "synth":
      return (
        <span className="flex h-7 w-12 items-center gap-px border border-neutral-500/45 bg-white/65 px-1">
          <span className="h-3 w-1 bg-neutral-500/55" />
          <span className="h-3 w-1 bg-neutral-300/80" />
          <span className="h-3 w-1 bg-neutral-500/55" />
          <span className="ml-auto h-2.5 w-2.5 rounded-full border border-neutral-500/45" />
        </span>
      );
    case "marker":
      return (
        <span className="block h-5 w-5 rounded-full border border-neutral-500/50 bg-white/70">
          <span className="m-auto mt-[7px] block h-1.5 w-1.5 rounded-full bg-neutral-600/65" />
        </span>
      );
    case "bridge":
      return (
        <span className="flex h-4 w-16 items-center justify-between">
          <span className="h-px w-6 bg-neutral-500/45" />
          <span className="h-px w-2 bg-neutral-500/25" />
          <span className="h-px w-6 bg-neutral-500/45" />
        </span>
      );
    case "desk":
      return (
        <span className="relative block h-8 w-12">
          <span className="absolute left-0 top-2 h-3 w-12 border border-neutral-500/40 bg-white/60" />
          <span className="absolute bottom-0 left-1 h-4 w-px bg-neutral-500/40" />
          <span className="absolute bottom-0 right-1 h-4 w-px bg-neutral-500/40" />
        </span>
      );
    case "loop-arrow":
      return (
        <span className="relative block h-8 w-8 rounded-full border border-neutral-500/45 border-r-transparent">
          <span className="absolute right-0 top-1 h-2 w-2 rotate-45 border-r border-t border-neutral-500/55" />
        </span>
      );
  }
}

export default function DriftProp({
  prop,
  mapWidth,
  mapHeight,
}: DriftPropProps) {
  return (
    <div
      className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2 text-neutral-700"
      style={{
        left: toPercent(prop.x, mapWidth),
        top: toPercent(prop.y, mapHeight),
        transform: `translate(-50%, -50%) rotate(${prop.rotation ?? 0}deg)`,
      }}
      aria-hidden="true"
    >
      {renderPropShape(prop)}
    </div>
  );
}
