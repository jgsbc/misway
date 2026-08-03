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
import {
  createDrift3DAudioClockSnapshot,
  updateDrift3DAudioClock,
  type Drift3DAudioClockRef,
  type Drift3DAudioClockSnapshot,
  type Drift3DAudioClockSource,
} from "@/lib/drift3dAudioClock";

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

/**
 * Tracks a discontinuity already counted (`timelineRevision` bumped) at its
 * command site (`seekToRatio`, a same-track restart, a loop wrap), so the
 * native `seeking`/`seeked` pair that follows confirms it instead of
 * counting it a second time. Left `null`, a `seeked` event is treated as an
 * externally-originated seek and counted on its own.
 */
type PendingDiscontinuity = "seek" | "restart" | "loop" | null;

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

/**
 * Coarse runtime context for consumers (like Drift 3D) that need player
 * state and the shared audio clock, but must never re-render on the fast
 * `currentTime`/`duration`/`progress` updates that `useAudioPlayer()` emits
 * on every `timeupdate`.
 */
type AudioPlayerRuntimeContextValue = {
  current: CurrentAudio;
  isPlaying: boolean;
  isLooping: boolean;
  playTrack: (track: Track) => void;
  toggleTrack: (track: Track) => void;
  togglePlayback: () => void;
  toggleLoop: () => void;
  playNext: () => void;
  playPrevious: () => void;
  seekToRatio: (ratio: number) => void;
  isCurrentTrack: (track: Track) => boolean;
  audioClockRef: Drift3DAudioClockRef;
};

const AMBIENT_AUDIO: AmbientAudio = {
  kind: "ambient",
  slug: "__ambient__",
  title: "ENTRY AMBIENT",
  audioSrc: "/audio/entry-ambient.mp3",
};

function toAudioClockSource(audioItem: CurrentAudio): Drift3DAudioClockSource {
  return audioItem.kind === "ambient"
    ? { kind: "ambient", slug: audioItem.slug }
    : { kind: "track", slug: audioItem.slug };
}

const AudioPlayerContext = createContext<AudioPlayerContextValue | null>(null);
const AudioPlayerRuntimeContext =
  createContext<AudioPlayerRuntimeContextValue | null>(null);

const DRIFT_LAB_ROUTES = [
  "/drift",
  "/drift-lab",
  "/drift-3d-lab",
  "/drift-kit-lab",
  "/drift-greybox-lab",
] as const;

function toPlayerTrack(track: Track): PlayerTrack {
  return { ...track, kind: "track" };
}

function isDriftLabPath(pathname: string | null) {
  if (!pathname) return false;

  const normalizedPathname = pathname.replace(/\/+$/, "") || "/";

  return DRIFT_LAB_ROUTES.some(
    (route) =>
      normalizedPathname === route ||
      normalizedPathname.startsWith(`${route}/`)
  );
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
  const isDriftLabRoute = isDriftLabPath(pathname);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const interactionRetryRef = useRef(false);
  const isDriftLabRouteRef = useRef(isDriftLabRoute);
  const shouldResumeRef = useRef(true);
  // `capturedAtMs: 0` is a pure, deterministic initial value (no `performance.now()`
  // call during render) — harmless, since extrapolation only reads `capturedAtMs`
  // once `playbackState` becomes "playing", by which point the `play` event
  // handler has already stamped it with a real timestamp.
  const audioClockRef = useRef<Drift3DAudioClockSnapshot>(
    createDrift3DAudioClockSnapshot(toAudioClockSource(AMBIENT_AUDIO), 0)
  );
  const pendingDiscontinuityRef = useRef<PendingDiscontinuity>(null);

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

  const applyClockSourceChange = useCallback((audioItem: CurrentAudio) => {
    audioClockRef.current = updateDrift3DAudioClock(
      audioClockRef.current,
      {
        source: toAudioClockSource(audioItem),
        playbackState: "idle",
        anchorTimeSeconds: 0,
        durationSeconds: 0,
      },
      "source-change",
      performance.now()
    );
  }, []);

  const applyClockRestart = useCallback(() => {
    // Marked *before* the caller mutates `audio.currentTime`, so the native
    // `seeking`/`seeked` pair that follows confirms this single discontinuity
    // instead of bumping `timelineRevision` a second time. `playbackState` is
    // set to "seeking" immediately, so no extrapolation is possible between
    // this command and the native `seeking` event that follows it.
    pendingDiscontinuityRef.current = "restart";
    audioClockRef.current = updateDrift3DAudioClock(
      audioClockRef.current,
      { anchorTimeSeconds: 0, playbackState: "seeking" },
      "restart",
      performance.now()
    );
  }, []);

  const playCurrent = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      await audio.play();
      interactionRetryRef.current = false;
      setIsPlaying(true);
      // `audioClockRef`'s `playbackState` is deliberately NOT set to "playing"
      // here: it only becomes "playing" via the native `play` event handler
      // below, which the browser fires only once playback genuinely starts.
      // A rejected `audio.play()` (the `catch` branch) therefore never leaves
      // the clock in a "playing" state it didn't actually reach.
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

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      audioClockRef.current = updateDrift3DAudioClock(
        audioClockRef.current,
        { anchorTimeSeconds: audio.currentTime },
        "timeupdate",
        performance.now()
      );
    };
    const onLoadedMetadata = () => {
      if (Number.isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
      // Anchor to the actual current position: this event can in principle
      // fire while already playing (e.g. a metadata re-fetch), and
      // `updateDrift3DAudioClock` always stamps a fresh `capturedAtMs` — an
      // update that resets `capturedAtMs` while playing must re-anchor to
      // `audio.currentTime`, or extrapolation would jump from a stale anchor.
      audioClockRef.current = updateDrift3DAudioClock(
        audioClockRef.current,
        {
          durationSeconds: Number.isFinite(audio.duration)
            ? audio.duration
            : audioClockRef.current.durationSeconds,
          anchorTimeSeconds: audio.currentTime,
        },
        "metadata",
        performance.now()
      );
    };
    const onDurationChange = () => {
      if (Number.isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
      audioClockRef.current = updateDrift3DAudioClock(
        audioClockRef.current,
        {
          durationSeconds: Number.isFinite(audio.duration)
            ? audio.duration
            : audioClockRef.current.durationSeconds,
          anchorTimeSeconds: audio.currentTime,
        },
        "metadata",
        performance.now()
      );
    };
    const onPlay = () => {
      setIsPlaying(true);
      audioClockRef.current = updateDrift3DAudioClock(
        audioClockRef.current,
        {
          playbackState: "playing",
          anchorTimeSeconds: audio.currentTime,
          playbackRate: audio.playbackRate,
        },
        "play",
        performance.now()
      );
    };
    const onPause = () => {
      setIsPlaying(false);
      audioClockRef.current = updateDrift3DAudioClock(
        audioClockRef.current,
        { playbackState: "paused", anchorTimeSeconds: audio.currentTime },
        "pause",
        performance.now()
      );
    };
    const onSeeking = () => {
      // "seeking" never bumps `timelineRevision` — the discontinuity itself
      // was already counted at the command site (or, for an externally
      // originated seek, will be counted once on `seeked` below). While in
      // this state, `readDrift3DAudioClockTime` never extrapolates (it only
      // extrapolates when `playbackState === "playing"`).
      audioClockRef.current = updateDrift3DAudioClock(
        audioClockRef.current,
        { playbackState: "seeking", anchorTimeSeconds: audio.currentTime },
        "seeking",
        performance.now()
      );
    };
    const onSeeked = () => {
      const resolvedPlaybackState = audio.paused ? "paused" : "playing";

      if (pendingDiscontinuityRef.current) {
        // Confirms a discontinuity already counted at its command site
        // (seekToRatio / same-track restart / loop wrap) — do not bump
        // `timelineRevision` again.
        pendingDiscontinuityRef.current = null;
        audioClockRef.current = updateDrift3DAudioClock(
          audioClockRef.current,
          { playbackState: resolvedPlaybackState, anchorTimeSeconds: audio.currentTime },
          "seeking",
          performance.now()
        );
        return;
      }

      // No pending command-path discontinuity: this seek did not originate
      // from seekToRatio/restart/loop, so it is counted here.
      audioClockRef.current = updateDrift3DAudioClock(
        audioClockRef.current,
        { playbackState: resolvedPlaybackState, anchorTimeSeconds: audio.currentTime },
        "seek",
        performance.now()
      );
    };
    const onRateChange = () => {
      // Re-anchor to the current position together with the new rate: an
      // update that resets `capturedAtMs` while playing must anchor to
      // `audio.currentTime`, or extrapolation would jump using the new rate
      // from a stale anchor.
      audioClockRef.current = updateDrift3DAudioClock(
        audioClockRef.current,
        { anchorTimeSeconds: audio.currentTime, playbackRate: audio.playbackRate },
        "rate-change",
        performance.now()
      );
    };
    const onEnded = () => {
      if (isLooping) {
        shouldResumeRef.current = true;
        pendingDiscontinuityRef.current = "loop";
        audio.currentTime = 0;
        setCurrentTime(0);
        audioClockRef.current = updateDrift3DAudioClock(
          audioClockRef.current,
          { anchorTimeSeconds: 0, playbackState: "idle" },
          "loop",
          performance.now()
        );
        void playCurrent();
        return;
      }

      const nextTrack = getNextTrack(current);

      if (!nextTrack) {
        setIsPlaying(false);
        setCurrentTime(audio.duration || 0);
        audioClockRef.current = updateDrift3DAudioClock(
          audioClockRef.current,
          {
            playbackState: "ended",
            anchorTimeSeconds: audio.duration || audioClockRef.current.anchorTimeSeconds,
          },
          "ended",
          performance.now()
        );
        return;
      }

      shouldResumeRef.current = true;
      setCurrentTime(0);
      setDuration(0);
      applyClockSourceChange(toPlayerTrack(nextTrack));
      setCurrent(toPlayerTrack(nextTrack));
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("seeking", onSeeking);
    audio.addEventListener("seeked", onSeeked);
    audio.addEventListener("ratechange", onRateChange);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("seeking", onSeeking);
      audio.removeEventListener("seeked", onSeeked);
      audio.removeEventListener("ratechange", onRateChange);
      audio.removeEventListener("ended", onEnded);
    };
  }, [applyClockSourceChange, current, isLooping, playCurrent]);

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
    setIsLooping((value) => {
      const next = !value;
      audioClockRef.current = { ...audioClockRef.current, loopEnabled: next };
      return next;
    });
  }, []);

  const playNext = useCallback(() => {
    const nextTrack = getNextTrack(current);
    if (!nextTrack) return;

    shouldResumeRef.current = true;
    setCurrentTime(0);
    setDuration(0);
    applyClockSourceChange(toPlayerTrack(nextTrack));
    setCurrent(toPlayerTrack(nextTrack));
  }, [applyClockSourceChange, current]);

  const playPrevious = useCallback(() => {
    const audio = audioRef.current;

    if (current.kind === "track" && audio && audio.currentTime > 5) {
      applyClockRestart();
      audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    const previousTrack = getPreviousTrack(current);
    if (!previousTrack) return;

    shouldResumeRef.current = true;
    setCurrentTime(0);
    setDuration(0);
    applyClockSourceChange(toPlayerTrack(previousTrack));
    setCurrent(toPlayerTrack(previousTrack));
  }, [applyClockRestart, applyClockSourceChange, current]);

  const playTrack = useCallback(
    (track: Track) => {
      const audio = audioRef.current;

      if (current.kind === "track" && current.slug === track.slug && audio) {
        applyClockRestart();
        audio.currentTime = 0;
        setCurrentTime(0);
        shouldResumeRef.current = true;
        void playCurrent();
        return;
      }

      shouldResumeRef.current = true;
      setCurrentTime(0);
      setDuration(0);
      applyClockSourceChange(toPlayerTrack(track));
      setCurrent(toPlayerTrack(track));
    },
    [applyClockRestart, applyClockSourceChange, current, playCurrent]
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
      applyClockSourceChange(toPlayerTrack(track));
      setCurrent(toPlayerTrack(track));
    },
    [applyClockSourceChange, current, playCurrent]
  );

  const seekToRatio = useCallback((ratio: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0) {
      return;
    }

    const nextTime = Math.min(Math.max(ratio, 0), 1) * audio.duration;
    // Marked *before* mutating `audio.currentTime`, so the native
    // `seeking`/`seeked` pair this triggers confirms this single
    // discontinuity instead of bumping `timelineRevision` a second time.
    pendingDiscontinuityRef.current = "seek";
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
    audioClockRef.current = updateDrift3DAudioClock(
      audioClockRef.current,
      { anchorTimeSeconds: nextTime, playbackState: "seeking" },
      "seek",
      performance.now()
    );
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

  // Coarse runtime value — deliberately excludes currentTime/duration/progress
  // so a fast `timeupdate` never invalidates this memo. Drift 3D reads the
  // shared clock through `audioClockRef` instead.
  const runtimeValue = useMemo<AudioPlayerRuntimeContextValue>(
    () => ({
      current,
      isPlaying,
      isLooping,
      playTrack,
      toggleTrack,
      togglePlayback,
      toggleLoop,
      playNext,
      playPrevious,
      seekToRatio,
      isCurrentTrack: (track) =>
        current.kind === "track" && current.slug === track.slug,
      audioClockRef,
    }),
    [
      audioClockRef,
      current,
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
      <AudioPlayerRuntimeContext.Provider value={runtimeValue}>
        {children}
      </AudioPlayerRuntimeContext.Provider>
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

export function useAudioPlayerRuntime() {
  const context = useContext(AudioPlayerRuntimeContext);

  if (!context) {
    throw new Error(
      "useAudioPlayerRuntime must be used inside AudioPlayerProvider"
    );
  }

  return context;
}
