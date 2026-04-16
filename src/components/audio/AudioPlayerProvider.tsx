"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { type Track, playableTracks } from "@/lib/tracks";
import { withBasePath } from "@/lib/basePath";

type AudioPlayerContextValue = {
  currentTrack: Track | null;
  currentIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  queue: Track[];
  playTrack: (track: Track, options?: { restart?: boolean }) => Promise<void>;
  toggleTrack: (track: Track) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  pause: () => void;
  playNext: () => void;
  playPrevious: () => void;
  seekTo: (time: number) => void;
  setVolume: (value: number) => void;
  isCurrentTrack: (slug: string) => boolean;
};

const AudioPlayerContext = createContext<AudioPlayerContextValue | null>(null);

export default function AudioPlayerProvider({
  children,
}: {
  children: ReactNode;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pendingPlayRef = useRef(false);

  const [currentSlug, setCurrentSlug] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.9);

  const currentIndex = useMemo(
    () => playableTracks.findIndex((track) => track.slug === currentSlug),
    [currentSlug]
  );

  const currentTrack =
    currentIndex >= 0 ? playableTracks[currentIndex] : null;

  useEffect(() => {
    const storedVolume = window.localStorage.getItem("misway-player-volume");
    if (!storedVolume) return;

    const parsed = Number(storedVolume);
    if (Number.isFinite(parsed)) {
      setVolumeState(Math.min(1, Math.max(0, parsed)));
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("misway-player-volume", String(volume));
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const pause = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setIsPlaying(false);
  }, []);

  const playCurrent = useCallback(async () => {
    if (!audioRef.current) return;

    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack?.audioSrc) return;

    if (audio.dataset.trackSlug !== currentTrack.slug) {
      audio.src = withBasePath(currentTrack.audioSrc);
      audio.dataset.trackSlug = currentTrack.slug;
      audio.load();
      setCurrentTime(0);
      setDuration(0);
    }

    if (pendingPlayRef.current) {
      pendingPlayRef.current = false;
      void playCurrent();
    }
  }, [currentTrack, playCurrent]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    };

    const onDurationChange = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    const onEnded = () => {
      if (playableTracks.length === 0) return;
      const nextIndex =
        currentIndex >= 0
          ? (currentIndex + 1) % playableTracks.length
          : 0;
      pendingPlayRef.current = true;
      setCurrentSlug(playableTracks[nextIndex].slug);
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, [currentIndex]);

  const playTrack = useCallback(
    async (track: Track, options?: { restart?: boolean }) => {
      if (!track.audioSrc || !audioRef.current) return;

      const isSameTrack = currentTrack?.slug === track.slug;

      if (!isSameTrack) {
        pendingPlayRef.current = true;
        setCurrentSlug(track.slug);
        return;
      }

      if (options?.restart) {
        audioRef.current.currentTime = 0;
      }

      await playCurrent();
    },
    [currentTrack, playCurrent]
  );

  const toggleTrack = useCallback(
    async (track: Track) => {
      if (!track.audioSrc) return;

      if (currentTrack?.slug === track.slug) {
        if (isPlaying) {
          pause();
        } else {
          await playCurrent();
        }
        return;
      }

      await playTrack(track);
    },
    [currentTrack, isPlaying, pause, playCurrent, playTrack]
  );

  const togglePlayPause = useCallback(async () => {
    if (!currentTrack && playableTracks.length > 0) {
      pendingPlayRef.current = true;
      setCurrentSlug(playableTracks[0].slug);
      return;
    }

    if (isPlaying) {
      pause();
      return;
    }

    await playCurrent();
  }, [currentTrack, isPlaying, pause, playCurrent]);

  const playNext = useCallback(() => {
    if (playableTracks.length === 0) return;
    const nextIndex =
      currentIndex >= 0 ? (currentIndex + 1) % playableTracks.length : 0;
    pendingPlayRef.current = true;
    setCurrentSlug(playableTracks[nextIndex].slug);
  }, [currentIndex]);

  const playPrevious = useCallback(() => {
    if (playableTracks.length === 0) return;
    const previousIndex =
      currentIndex >= 0
        ? (currentIndex - 1 + playableTracks.length) % playableTracks.length
        : 0;
    pendingPlayRef.current = true;
    setCurrentSlug(playableTracks[previousIndex].slug);
  }, [currentIndex]);

  const seekTo = useCallback((time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  }, []);

  const setVolume = useCallback((value: number) => {
    setVolumeState(Math.min(1, Math.max(0, value)));
  }, []);

  const isCurrentTrack = useCallback(
    (slug: string) => currentTrack?.slug === slug,
    [currentTrack]
  );

  const value = useMemo<AudioPlayerContextValue>(
    () => ({
      currentTrack,
      currentIndex,
      isPlaying,
      currentTime,
      duration,
      volume,
      queue: playableTracks,
      playTrack,
      toggleTrack,
      togglePlayPause,
      pause,
      playNext,
      playPrevious,
      seekTo,
      setVolume,
      isCurrentTrack,
    }),
    [
      currentTrack,
      currentIndex,
      isPlaying,
      currentTime,
      duration,
      volume,
      playTrack,
      toggleTrack,
      togglePlayPause,
      pause,
      playNext,
      playPrevious,
      seekTo,
      setVolume,
      isCurrentTrack,
    ]
  );

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
      <audio ref={audioRef} preload="metadata" className="hidden" />
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);

  if (!context) {
    throw new Error("useAudioPlayer must be used inside AudioPlayerProvider.");
  }

  return context;
}
