"use client";

import { Pause, Play } from "lucide-react";
import { type Track } from "@/lib/tracks";
import { useAudioPlayer } from "./AudioPlayerProvider";

type TrackPlayButtonProps = {
  track: Track;
  className?: string;
  label?: string;
};

export default function TrackPlayButton({
  track,
  className = "",
  label,
}: TrackPlayButtonProps) {
  const { isCurrentTrack, isPlaying, toggleTrack } = useAudioPlayer();

  const active = isCurrentTrack(track.slug);
  const playing = active && isPlaying;
  const Icon = playing ? Pause : Play;

  return (
    <button
      type="button"
      onClick={() => void toggleTrack(track)}
      disabled={!track.audioSrc}
      className={`inline-flex min-h-[44px] items-center justify-center gap-2 border border-white/14 bg-white/[0.04] px-4 py-2 text-xs font-mono tracking-[0.18em] text-white transition hover:border-white/28 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      aria-label={label ?? `Play ${track.title}`}
      title={label ?? `Play ${track.title}`}
    >
      <Icon className="h-4 w-4" strokeWidth={1.8} />
      <span>{label ?? (playing ? "PAUSE" : active ? "RESUME" : "PLAY")}</span>
    </button>
  );
}
