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
    <div className="border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-neutral-500">
            AUDIO_PORT
          </p>
          <p className="mt-2 text-sm text-neutral-300">
            Native playback routed through the persistent site player.
          </p>
        </div>

        <button
          type="button"
          onClick={() => toggleTrack(track)}
          className="inline-flex h-10 min-w-[92px] items-center justify-center gap-2 border border-white/12 bg-black/45 px-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white/85 transition hover:border-white/24 hover:bg-black/65 hover:text-white"
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
        <div className="flex items-center justify-between gap-3 font-mono text-[10px] tracking-[0.18em] text-neutral-500">
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
          className="mt-3 block h-[3px] w-full overflow-hidden rounded-full bg-white/10"
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
