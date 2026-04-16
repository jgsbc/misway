"use client";

import { Pause, Play } from "lucide-react";
import type { Track } from "@/lib/tracks";
import { useAudioPlayer } from "@/components/audio/AudioPlayerProvider";

type Props = {
  track: Track;
  className?: string;
};

export default function TrackPlayButton({ track, className = "" }: Props) {
  const { isCurrentTrack, isPlaying, toggleTrack } = useAudioPlayer();
  const active = isCurrentTrack(track);

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleTrack(track);
      }}
      className={`inline-flex h-10 min-w-[84px] items-center justify-center gap-2 border border-white/12 bg-black/45 px-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white/85 shadow-[0_0_20px_rgba(0,0,0,0.25)] backdrop-blur-md transition hover:border-white/24 hover:bg-black/65 hover:text-white ${className}`}
      aria-label={active && isPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
    >
      {active && isPlaying ? (
        <Pause className="h-3.5 w-3.5" />
      ) : (
        <Play className="h-3.5 w-3.5 translate-x-[1px]" />
      )}
      <span>{active && isPlaying ? "Pause" : "Play"}</span>
    </button>
  );
}
