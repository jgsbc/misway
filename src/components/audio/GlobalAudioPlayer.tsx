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

function isDriftFullscreenPath(pathname: string | null) {
  if (!pathname) return false;

  const normalizedPathname = pathname.replace(/\/+$/, "") || "/";

  return /(^|\/)(drift|drift-evolution|drift-3d-lab)(\/|$)/.test(
    normalizedPathname
  );
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
      return "ENTRY AMBIENT / BACKGROUND";
    }
    return `${current.title} / ${current.publishedLabel}`;
  }, [current]);

  if (pathname === "/" || isDriftFullscreenPath(pathname)) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-neutral-300 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-[42px] max-w-6xl items-center gap-2 px-3 sm:h-[46px] sm:gap-3 sm:px-4">
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={toggleLoop}
            className={`flex h-7 w-7 items-center justify-center rounded-full border transition sm:h-8 sm:w-8 ${
              isLooping
                ? "border-neutral-400 bg-neutral-200 text-neutral-900"
                : "border-neutral-300 bg-neutral-100 text-neutral-600 hover:border-neutral-400 hover:bg-neutral-200 hover:text-neutral-900"
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
            className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-300 bg-neutral-100 text-neutral-600 transition hover:border-neutral-400 hover:bg-neutral-200 hover:text-neutral-900 sm:h-8 sm:w-8"
            aria-label="Previous track"
            title="Previous track"
          >
            <SkipBack className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </button>

          <button
            type="button"
            onClick={togglePlayback}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-400 bg-neutral-200 text-neutral-900 transition hover:border-neutral-500 hover:bg-neutral-300 sm:h-8 sm:w-8"
            aria-label={isPlaying ? "Pause audio" : "Play audio"}
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 translate-x-[1px]" />}
          </button>

          <button
            type="button"
            onClick={playNext}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-300 bg-neutral-100 text-neutral-600 transition hover:border-neutral-400 hover:bg-neutral-200 hover:text-neutral-900 sm:h-8 sm:w-8"
            aria-label="Next track"
            title="Next track"
          >
            <SkipForward className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </button>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p className="truncate font-mono text-[9px] uppercase tracking-[0.22em] text-neutral-600 sm:text-[10px]">
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
