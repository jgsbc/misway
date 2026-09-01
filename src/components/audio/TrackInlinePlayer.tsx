"use client";

import { Pause, Play } from "lucide-react";
import type { Track } from "@/lib/tracks";
import { useAudioPlayer } from "@/components/audio/AudioPlayerProvider";

function formatTime(value: number) {
  if (!Number.isFinite(value) || value < 0) return "0:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export default function TrackInlinePlayer({ track }: { track: Track }) {
  const {
    current,
    isPlaying,
    currentTime,
    duration,
    progress,
    toggleTrack,
    seekToRatio,
  } = useAudioPlayer();

  const active = current.kind !== "ambient" && current.slug === track.slug;

  return (
    <div className="light-card-bg light-border border p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="light-text-tertiary font-mono text-[10px] tracking-[0.2em]">
            LISTEN HERE
          </p>
          <p className="light-text-secondary mt-2 text-sm">
            Play this track here. It will keep playing while you move through the site.
          </p>
        </div>

        <button
          type="button"
          onClick={() => toggleTrack(track)}
          className="inline-flex h-10 min-w-[92px] items-center justify-center gap-2 border border-white/25 bg-[linear-gradient(115deg,#57f2ff_0%,#8b5cf6_24%,#ff4fd8_48%,#ffb84a_72%,#c8ff57_100%)] px-3 font-mono text-[10px] uppercase tracking-[0.2em] text-black shadow-[0_0_28px_rgba(255,79,216,0.28)] transition duration-500 hover:scale-[1.015] hover:border-white/50 hover:shadow-[0_0_42px_rgba(87,242,255,0.34)] focus:outline-none focus:ring-2 focus:ring-white/40"
        >
          {active && isPlaying ? (
            <Pause className="h-3.5 w-3.5" />
          ) : (
            <Play className="h-3.5 w-3.5 translate-x-[1px]" />
          )}
          <span>{active && isPlaying ? "Pause" : "Play"}</span>
        </button>
      </div>

      <div className="mt-4">
        <div className="light-text-tertiary flex items-center justify-between gap-3 font-mono text-[10px] tracking-[0.18em]">
          <span className="truncate">{track.title}</span>
          <span>
            {active ? formatTime(currentTime) : "0:00"} /{" "}
            {active ? formatTime(duration) : track.duration ?? track.yearLabel}
          </span>
        </div>

        <button
          type="button"
          onClick={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const ratio = (event.clientX - rect.left) / rect.width;
            seekToRatio(ratio);
          }}
          className="mt-3 block h-[3px] w-full overflow-hidden rounded-full bg-neutral-200"
          aria-label={`Seek ${track.title}`}
        >
          <span
            className="block h-full rounded-full bg-[linear-gradient(90deg,rgba(86,184,255,0.95),rgba(255,255,255,0.95)_45%,rgba(255,170,78,0.95))]"
            style={{ width: `${active ? Math.max(progress * 100, 2) : 2}%` }}
          />
        </button>
      </div>
    </div>
  );
}
