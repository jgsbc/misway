"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ExternalLink,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
} from "lucide-react";
import { withBasePath } from "@/lib/basePath";
import { useAudioPlayer } from "./AudioPlayerProvider";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";

  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);

  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

export default function GlobalAudioPlayer() {
  const pathname = usePathname();
  const {
    currentTrack,
    currentTime,
    duration,
    isPlaying,
    playNext,
    playPrevious,
    seekTo,
    togglePlayPause,
    volume,
    setVolume,
  } = useAudioPlayer();

  if (!currentTrack) {
    return null;
  }

  const bottomClass =
    pathname === "/"
      ? "bottom-4 sm:bottom-6"
      : "bottom-[76px] sm:bottom-[102px]";

  return (
    <div
      className={`fixed left-1/2 z-40 w-[min(calc(100%-24px),980px)] -translate-x-1/2 ${bottomClass}`}
      aria-label="Global audio player"
    >
      <div className="overflow-hidden border border-white/12 bg-black/75 shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <div className="h-px w-full bg-[linear-gradient(90deg,rgba(86,184,255,0.5),rgba(255,255,255,0.8),rgba(255,138,29,0.5))]" />

        <div className="grid gap-4 px-4 py-4 md:grid-cols-[auto_1fr_auto] md:items-center">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 overflow-hidden border border-white/10 bg-white/[0.03]">
              <img
                src={withBasePath(
                  currentTrack.coverImage ?? "/images/tracks/fallback.png"
                )}
                alt={currentTrack.title}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="min-w-0">
              <p className="font-mono text-[10px] tracking-[0.22em] text-neutral-500">
                NOW PLAYING
              </p>
              <Link
                href={`/tracks/${currentTrack.slug}`}
                className="mt-1 block truncate text-sm font-medium tracking-[0.04em] text-white transition hover:text-neutral-200 sm:text-base"
              >
                {currentTrack.title}
              </Link>
              <div className="mt-1 flex items-center gap-3">
                <span className="font-mono text-[10px] tracking-[0.18em] text-neutral-500">
                  {currentTrack.publishedLabel}
                </span>
                <a
                  href={currentTrack.soundcloudUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-[10px] tracking-[0.18em] text-neutral-400 transition hover:text-white"
                >
                  SC
                  <ExternalLink className="h-3 w-3" strokeWidth={1.8} />
                </a>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={playPrevious}
                className="inline-flex h-10 w-10 items-center justify-center border border-white/10 text-neutral-300 transition hover:border-white/30 hover:text-white"
                aria-label="Previous track"
              >
                <SkipBack className="h-4 w-4" strokeWidth={1.8} />
              </button>
              <button
                type="button"
                onClick={() => void togglePlayPause()}
                className="inline-flex h-11 min-w-[112px] items-center justify-center gap-2 border border-white/14 bg-white/[0.06] px-5 font-mono text-[11px] tracking-[0.18em] text-white transition hover:border-white/30 hover:bg-white/[0.1]"
                aria-label={isPlaying ? "Pause current track" : "Play current track"}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" strokeWidth={1.8} />
                ) : (
                  <Play className="h-4 w-4" strokeWidth={1.8} />
                )}
                <span>{isPlaying ? "PAUSE" : "PLAY"}</span>
              </button>
              <button
                type="button"
                onClick={playNext}
                className="inline-flex h-10 w-10 items-center justify-center border border-white/10 text-neutral-300 transition hover:border-white/30 hover:text-white"
                aria-label="Next track"
              >
                <SkipForward className="h-4 w-4" strokeWidth={1.8} />
              </button>
            </div>

            <div>
              <input
                type="range"
                min={0}
                max={duration > 0 ? duration : 100}
                step={0.1}
                value={duration > 0 ? currentTime : 0}
                onChange={(event) => seekTo(Number(event.target.value))}
                className="h-2 w-full cursor-pointer accent-white"
                aria-label="Seek within current track"
              />
              <div className="mt-1 flex items-center justify-between font-mono text-[10px] tracking-[0.18em] text-neutral-500">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Volume2 className="h-4 w-4 text-neutral-400" strokeWidth={1.8} />
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(event) => setVolume(Number(event.target.value))}
              className="w-28 cursor-pointer accent-white"
              aria-label="Volume"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
