"use client";

import { SkipBack, SkipForward } from "lucide-react";
import { type Track } from "@/lib/tracks";
import { useAudioPlayer } from "./AudioPlayerProvider";
import TrackPlayButton from "./TrackPlayButton";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";

  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);

  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

export default function TrackInlinePlayer({ track }: { track: Track }) {
  const {
    currentTrack,
    currentTime,
    duration,
    isPlaying,
    isCurrentTrack,
    playNext,
    playPrevious,
    seekTo,
  } = useAudioPlayer();

  const active = isCurrentTrack(track.slug);
  const sliderMax = active && duration > 0 ? duration : 100;
  const sliderValue = active ? currentTime : 0;

  return (
    <div className="border border-white/10 bg-white/[0.03] p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <TrackPlayButton track={track} />
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] text-neutral-500">
              LOCAL PLAYER
            </p>
            <p className="mt-1 text-sm text-neutral-300">
              {active
                ? isPlaying
                  ? "Now playing in the global player."
                  : "Loaded in the global player."
                : "Load this track into the global player."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={playPrevious}
            disabled={!currentTrack}
            className="inline-flex h-10 w-10 items-center justify-center border border-white/10 text-neutral-300 transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Previous track"
          >
            <SkipBack className="h-4 w-4" strokeWidth={1.8} />
          </button>
          <button
            type="button"
            onClick={playNext}
            disabled={!currentTrack}
            className="inline-flex h-10 w-10 items-center justify-center border border-white/10 text-neutral-300 transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Next track"
          >
            <SkipForward className="h-4 w-4" strokeWidth={1.8} />
          </button>
        </div>
      </div>

      <div className="mt-5">
        <input
          type="range"
          min={0}
          max={sliderMax}
          step={0.1}
          value={sliderValue}
          onChange={(event) => seekTo(Number(event.target.value))}
          disabled={!active}
          className="h-2 w-full cursor-pointer accent-white disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={`Seek in ${track.title}`}
        />
        <div className="mt-2 flex items-center justify-between font-mono text-[10px] tracking-[0.18em] text-neutral-500">
          <span>{active ? formatTime(currentTime) : "READY"}</span>
          <span>{active ? formatTime(duration) : track.duration ?? track.yearLabel}</span>
        </div>
      </div>
    </div>
  );
}
