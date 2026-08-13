"use client";

import Link from "next/link";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import type { Track } from "@/lib/tracks";

type DriftEvolutionFooterProps = {
  currentTrack: Track | null;
  isPlaying: boolean;
  isAmbienceOn: boolean;
  onTogglePlayback: () => void;
  onToggleAmbience: () => void;
};

const controlClassName =
  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:border-white/30 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30";

export default function DriftEvolutionFooter({
  currentTrack,
  isPlaying,
  isAmbienceOn,
  onTogglePlayback,
  onToggleAmbience,
}: DriftEvolutionFooterProps) {
  return (
    <footer className="pointer-events-none absolute inset-x-2 bottom-[calc(0.5rem+env(safe-area-inset-bottom))] z-30 sm:inset-x-4 md:bottom-4">
      <div className="pointer-events-auto mx-auto grid min-h-12 w-full max-w-[58rem] grid-cols-[auto_minmax(0,1fr)_auto] items-center overflow-hidden rounded-2xl border border-white/15 bg-neutral-950/78 text-white shadow-[0_14px_40px_rgba(0,0,0,0.34)] backdrop-blur-xl md:min-h-14 md:rounded-[1.15rem]">
        <nav
          className="flex h-full items-center border-r border-white/10 px-1.5 sm:px-2"
          aria-label="Drift navigation"
        >
          <Link
            href="/"
            className="inline-flex min-h-9 items-center px-1.5 font-mono text-[8px] uppercase tracking-[0.14em] text-white/72 transition hover:text-white sm:px-2 sm:text-[9px] sm:tracking-[0.2em]"
          >
            MISWΛY
          </Link>
          <Link
            href="/tracks"
            className="inline-flex min-h-9 items-center px-1.5 font-mono text-[8px] uppercase tracking-[0.14em] text-white/72 transition hover:text-white sm:px-2 sm:text-[9px] sm:tracking-[0.2em]"
          >
            TRACKS
          </Link>
        </nav>

        <div className="flex min-w-0 items-center gap-2 px-2.5 sm:gap-3 sm:px-4">
          <span
            aria-hidden="true"
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${
              isPlaying ? "bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.8)]" : "bg-white/30"
            }`}
          />

          <div className="min-w-0 flex-1">
            <p className="font-mono text-[7px] uppercase tracking-[0.18em] text-white/42 sm:text-[8px] sm:tracking-[0.22em]">
              {currentTrack ? (isPlaying ? "PLAYING" : "PAUSED") : "NO TRACK"}
            </p>
            <p className="truncate font-mono text-[9px] uppercase tracking-[0.12em] text-white/90 sm:text-[10px] sm:tracking-[0.16em]">
              {currentTrack?.title ?? "FIND A SIGNAL"}
            </p>
          </div>

          {currentTrack ? (
            <button
              type="button"
              onClick={onTogglePlayback}
              className={controlClassName}
              aria-label={isPlaying ? "Pause current track" : "Resume current track"}
              title={isPlaying ? "Pause" : "Resume"}
            >
              {isPlaying ? (
                <Pause aria-hidden="true" className="h-3.5 w-3.5" fill="currentColor" />
              ) : (
                <Play
                  aria-hidden="true"
                  className="h-3.5 w-3.5 translate-x-px"
                  fill="currentColor"
                />
              )}
            </button>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onToggleAmbience}
          className="flex h-full min-h-12 items-center gap-2 border-l border-white/10 px-2.5 text-white/72 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white/25 sm:px-3.5 md:min-h-14"
          aria-pressed={isAmbienceOn}
          aria-label={
            isAmbienceOn
              ? "Turn off vehicle and world sound"
              : "Turn on vehicle and world sound"
          }
        >
          {isAmbienceOn ? (
            <Volume2 aria-hidden="true" className="h-4 w-4" strokeWidth={1.7} />
          ) : (
            <VolumeX aria-hidden="true" className="h-4 w-4" strokeWidth={1.7} />
          )}
          <span className="hidden text-left font-mono text-[8px] uppercase leading-3 tracking-[0.16em] sm:block">
            AMBIENT
            <br />
            {isAmbienceOn ? "ON" : "OFF"}
          </span>
        </button>
      </div>
    </footer>
  );
}
