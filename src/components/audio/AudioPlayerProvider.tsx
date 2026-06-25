"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import type { Track } from "@/lib/tracks";
import { tracks } from "@/lib/tracks";
import { withBasePath } from "@/lib/basePath";

type AmbientAudio = {
  kind: "ambient";
  slug: "__ambient__";
  title: "ENTRY AMBIENT";
  audioSrc: "/audio/entry-ambient.mp3";
  coverImage?: string;
  duration?: string;
};

type PlayerTrack = Track & {
  kind: "track";
};

type CurrentAudio = PlayerTrack | AmbientAudio;

type AudioPlayerContextValue = {
  current: CurrentAudio;
  isPlaying: boolean;
  isLooping: boolean;
  currentTime: number;
  duration: number;
  progress: number;
  playTrack: (track: Track) => void;
  toggleTrack: (track: Track) => void;
  togglePlayback: () => void;
  toggleLoop: () => void;
  playNext: () => void;
  playPrevious: () => void;
  seekToRatio: (ratio: number) => void;
  isCurrentTrack: (track: Track) => boolean;
};

const AMBIENT_AUDIO: AmbientAudio = {
  kind: "ambient",
  slug: "__ambient__",
  title: "ENTRY AMBIENT",
  audioSrc: "/audio/entry-ambient.mp3",
};

const AudioPlayerContext = createContext<AudioPlayerContextValue | null>(null);

function toPlayerTrack(track: Track): PlayerTrack {
  return { ...track, kind: "track" };
}

function getTrackIndex(slug: string) {
  return tracks.findIndex((track) => track.slug === slug);
}

function getNextTrack(current: CurrentAudio): Track | null {
  if (!tracks.length) return null;

  if (current.kind === "ambient") {
    return tracks[0];
  }

  const currentIndex = getTrackIndex(current.slug);
  if (currentIndex === -1) {
    return tracks[0];
  }

  return tracks[(currentIndex + 1) % tracks.length];
}

function getPreviousTrack(current: CurrentAudio): Track | null {
  if (!tracks.length) return null;

  if (current.kind === "ambient") {
    return tracks[tracks.length - 1];
  }

  const currentIndex = getTrackIndex(current.slug);
  if (currentIndex === -1) {
    return tracks[tracks.length - 1];
  }

  return tracks[(currentIndex - 1 + tracks.length) % tracks.length];
}

export function AudioPlayerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDriftLabRoute =
    pathname === "/drift-lab" || pathname.startsWith("/drift-lab/");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const interactionRetryRef = useRef(false);
  const isDriftLabRouteRef = useRef(isDriftLabRoute);
  const shouldResumeRef = useRef(true);

  const [current, setCurrent] = useState<CurrentAudio>(AMBIENT_AUDIO);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    isDriftLabRouteRef.current = isDriftLabRoute;

    if (isDriftLabRoute && current.kind === "ambient") {
      interactionRetryRef.current = false;
      shouldResumeRef.current = false;
    }
  }, [current.kind, isDriftLabRoute]);

  const playCurrent = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      await audio.play();
      interactionRetryRef.current = false;
      setIsPlaying(true);
    } catch {
      interactionRetryRef.current = true;
      setIsPlaying(false);
    }
  }, []);

  const syncSource = useCallback(
    async (audioItem: CurrentAudio) => {
      const audio = audioRef.current;
      if (!audio) return;

      const nextSrc = withBasePath(audioItem.audioSrc);
      const currentSrc = audio.getAttribute("src") ?? "";

      if (currentSrc !== nextSrc) {
        audio.src = nextSrc;
      }

      audio.loop = false;
      audio.volume = audioItem.kind === "ambient" ? 0.34 : 0.92;
      audio.preload = "metadata";
      audio.load();

      if (isDriftLabRouteRef.current && audioItem.kind === "ambient") {
        interactionRetryRef.current = false;
        shouldResumeRef.current = false;
      }

      if (shouldResumeRef.current) {
        await playCurrent();
      }
    },
    [playCurrent]
  );

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (!cancelled) {
        void syncSource(current);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [current, syncSource]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => {
      if (Number.isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const onDurationChange = () => {
      if (Number.isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      if (isLooping) {
        shouldResumeRef.current = true;
        audio.currentTime = 0;
        setCurrentTime(0);
        void playCurrent();
        return;
      }

      const nextTrack = getNextTrack(current);

      if (!nextTrack) {
        setIsPlaying(false);
        setCurrentTime(audio.duration || 0);
        return;
      }

      shouldResumeRef.current = true;
      setCurrentTime(0);
      setDuration(0);
      setCurrent(toPlayerTrack(nextTrack));
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, [current, isLooping, playCurrent]);

  useEffect(() => {
    const retry = () => {
      if (interactionRetryRef.current) {
        if (isDriftLabRouteRef.current && current.kind === "ambient") {
          interactionRetryRef.current = false;
          shouldResumeRef.current = false;
          return;
        }

        shouldResumeRef.current = true;
        void playCurrent();
      }
    };

    window.addEventListener("pointerdown", retry, { passive: true });
    window.addEventListener("keydown", retry);
    window.addEventListener("touchstart", retry, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", retry);
      window.removeEventListener("keydown", retry);
      window.removeEventListener("touchstart", retry);
    };
  }, [current.kind, playCurrent]);

  const togglePlayback = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      shouldResumeRef.current = true;
      void playCurrent();
    } else {
      audio.pause();
      shouldResumeRef.current = false;
    }
  }, [playCurrent]);

  const toggleLoop = useCallback(() => {
    setIsLooping((value) => !value);
  }, []);

  const playNext = useCallback(() => {
    const nextTrack = getNextTrack(current);
    if (!nextTrack) return;

    shouldResumeRef.current = true;
    setCurrentTime(0);
    setDuration(0);
    setCurrent(toPlayerTrack(nextTrack));
  }, [current]);

  const playPrevious = useCallback(() => {
    const audio = audioRef.current;

    if (current.kind === "track" && audio && audio.currentTime > 5) {
      audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    const previousTrack = getPreviousTrack(current);
    if (!previousTrack) return;

    shouldResumeRef.current = true;
    setCurrentTime(0);
    setDuration(0);
    setCurrent(toPlayerTrack(previousTrack));
  }, [current]);

  const playTrack = useCallback(
    (track: Track) => {
      const audio = audioRef.current;

      if (current.kind === "track" && current.slug === track.slug && audio) {
        audio.currentTime = 0;
        shouldResumeRef.current = true;
        void playCurrent();
        return;
      }

      shouldResumeRef.current = true;
      setCurrentTime(0);
      setDuration(0);
      setCurrent(toPlayerTrack(track));
    },
    [current, playCurrent]
  );

  const toggleTrack = useCallback(
    (track: Track) => {
      const audio = audioRef.current;

      if (current.kind === "track" && current.slug === track.slug && audio) {
        if (audio.paused) {
          shouldResumeRef.current = true;
          void playCurrent();
        } else {
          audio.pause();
          shouldResumeRef.current = false;
        }
        return;
      }

      shouldResumeRef.current = true;
      setCurrentTime(0);
      setDuration(0);
      setCurrent(toPlayerTrack(track));
    },
    [current, playCurrent]
  );

  const seekToRatio = useCallback((ratio: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0) {
      return;
    }

    const nextTime = Math.min(Math.max(ratio, 0), 1) * audio.duration;
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  }, []);

  const value = useMemo<AudioPlayerContextValue>(
    () => ({
      current,
      isPlaying,
      isLooping,
      currentTime,
      duration,
      progress: duration > 0 ? currentTime / duration : 0,
      playTrack,
      toggleTrack,
      togglePlayback,
      toggleLoop,
      playNext,
      playPrevious,
      seekToRatio,
      isCurrentTrack: (track) =>
        current.kind === "track" && current.slug === track.slug,
    }),
    [
      current,
      currentTime,
      duration,
      isLooping,
      isPlaying,
      playNext,
      playPrevious,
      playTrack,
      seekToRatio,
      toggleLoop,
      togglePlayback,
      toggleTrack,
    ]
  );

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
      <audio ref={audioRef} hidden aria-hidden="true" />
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);

  if (!context) {
    throw new Error("useAudioPlayer must be used inside AudioPlayerProvider");
  }

  return context;
}
