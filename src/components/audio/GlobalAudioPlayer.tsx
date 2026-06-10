"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { Pause, Play, Repeat, SkipBack, SkipForward } from "lucide-react";
import { useAudioPlayer } from "@/components/audio/AudioPlayerProvider";

function formatTime(value: number) {
  if (!Number.isFinite(value) || value < 0) return "0:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export default function GlobalAudioPlayer() {
  const pathname = usePathname();
  const {
    current,
    isPlaying,
    isLooping,
    currentTime,
    duration,
    progress,
    togglePlayback,
    toggleLoop,
    playNext,
    playPrevious,
    seekToRatio,
  } = useAudioPlayer();

  const label = useMemo(() => {
    if (current.kind === "ambient") {
      return "ENTRY AMBIENT / BACKGROUND LOOP";
    }
    return `${current.title} / ${current.publishedLabel}`;
  }, [current]);

  if (pathname === "/") {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/8 bg-black/72 backdrop-blur-xl">
      <div className="mx-auto flex h-[42px] max-w-6xl items-center gap-2 px-3 sm:h-[46px] sm:gap-3 sm:px-4">
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={toggleLoop}
            className={`flex h-7 w-7 items-center justify-center rounded-full border transition sm:h-8 sm:w-8 ${
              isLooping
                ? "border-white/20 bg-white/[0.08] text-white"
                : "border-white/8 bg-white/[0.02] text-white/45 hover:border-white/16 hover:bg-white/[0.06] hover:text-white/80"
            }`}
            aria-label={isLooping ? "Disable track loop" : "Loop current track"}
            aria-pressed={isLooping}
            title={isLooping ? "Loop on" : "Loop off"}
          >
            <Repeat className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </button>

          <button
            type="button"
            onClick={playPrevious}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-white/8 bg-white/[0.02] text-white/50 transition hover:border-white/16 hover:bg-white/[0.06] hover:text-white/85 sm:h-8 sm:w-8"
            aria-label="Previous track"
            title="Previous track"
          >
            <SkipBack className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </button>

          <button
            type="button"
            onClick={togglePlayback}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/85 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white sm:h-8 sm:w-8"
            aria-label={isPlaying ? "Pause audio" : "Play audio"}
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 translate-x-[1px]" />}
          </button>

          <button
            type="button"
            onClick={playNext}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-white/8 bg-white/[0.02] text-white/50 transition hover:border-white/16 hover:bg-white/[0.06] hover:text-white/85 sm:h-8 sm:w-8"
            aria-label="Next track"
            title="Next track"
          >
            <SkipForward className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </button>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p className="truncate font-mono text-[9px] uppercase tracking-[0.22em] text-neutral-400 sm:text-[10px]">
              {label}
            </p>
            <span className="hidden shrink-0 font-mono text-[9px] tracking-[0.16em] text-neutral-500 min-[420px]:inline sm:text-[10px]">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <button
            type="button"
            onClick={(event) => {
              const rect = event.currentTarget.getBoundingClientRect();
              const ratio = (event.clientX - rect.left) / rect.width;
              seekToRatio(ratio);
            }}
            className="mt-1 block h-[2px] w-full overflow-hidden rounded-full bg-white/10"
            aria-label="Seek audio"
          >
            <span
              className="block h-full rounded-full bg-[linear-gradient(90deg,rgba(86,184,255,0.95),rgba(255,255,255,0.95)_45%,rgba(255,170,78,0.95))]"
              style={{ width: `${Math.max(progress * 100, 2)}%` }}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
