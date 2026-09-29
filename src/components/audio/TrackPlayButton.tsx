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
      className={`inline-flex h-10 min-w-[84px] items-center justify-center gap-2 border border-white/25 bg-[linear-gradient(115deg,#57f2ff_0%,#8b5cf6_24%,#ff4fd8_48%,#ffb84a_72%,#c8ff57_100%)] px-3 font-mono text-[10px] uppercase tracking-[0.2em] text-black shadow-[0_0_22px_rgba(255,79,216,0.24)] transition hover:border-white/50 hover:brightness-105 hover:shadow-[0_0_30px_rgba(87,242,255,0.32)] ${className}`}
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
