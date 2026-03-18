"use client";

import { useEffect, useRef, useState } from "react";
import { withBasePath } from "@/lib/basePath";

export default function GlobalIntroAudio() {
  const breakRef = useRef<HTMLAudioElement | null>(null);
  const loopRef = useRef<HTMLAudioElement | null>(null);

  const [needsGesture, setNeedsGesture] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [introReleased, setIntroReleased] = useState(false);

  useEffect(() => {
    const released = sessionStorage.getItem("misway-intro-released") === "true";
    if (released) {
      setIntroReleased(true);
      return;
    }

    async function tryAutoplay() {
      if (!breakRef.current || !loopRef.current) return;

      breakRef.current.volume = 0.9;
      loopRef.current.volume = 0.35;

      try {
        await breakRef.current.play();
        setSoundEnabled(true);

        breakRef.current.onended = async () => {
          if (sessionStorage.getItem("misway-intro-released") === "true") return;

          try {
            await loopRef.current?.play();
            setSoundEnabled(true);
          } catch {
            setNeedsGesture(true);
            setSoundEnabled(false);
          }
        };
      } catch {
        setNeedsGesture(true);
        setSoundEnabled(false);
      }
    }

    tryAutoplay();
  }, []);

  useEffect(() => {
    function releaseOnFirstNavClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const link = target.closest("a");
      if (!link) return;

      sessionStorage.setItem("misway-intro-released", "true");
      setIntroReleased(true);

      if (breakRef.current) {
        breakRef.current.pause();
        breakRef.current.currentTime = 0;
      }

      if (loopRef.current) {
        loopRef.current.pause();
        loopRef.current.currentTime = 0;
      }

      setSoundEnabled(false);
    }

    document.addEventListener("click", releaseOnFirstNavClick);
    return () => document.removeEventListener("click", releaseOnFirstNavClick);
  }, []);

  async function startWithGesture() {
    if (!breakRef.current || !loopRef.current) return;

    setNeedsGesture(false);
    breakRef.current.volume = 0.9;
    loopRef.current.volume = 0.35;

    try {
      await breakRef.current.play();
      setSoundEnabled(true);

      breakRef.current.onended = async () => {
        if (sessionStorage.getItem("misway-intro-released") === "true") return;

        try {
          await loopRef.current?.play();
          setSoundEnabled(true);
        } catch {
          setNeedsGesture(true);
          setSoundEnabled(false);
        }
      };
    } catch {
      setNeedsGesture(true);
      setSoundEnabled(false);
    }
  }

  function toggleSound() {
    if (!breakRef.current || !loopRef.current) return;

    if (soundEnabled) {
      breakRef.current.pause();
      loopRef.current.pause();
      setSoundEnabled(false);
      return;
    }

    if (!introReleased) {
      startWithGesture();
      return;
    }

    loopRef.current.volume = 0.35;
    loopRef.current
      .play()
      .then(() => {
        setSoundEnabled(true);
      })
      .catch(() => {
        setNeedsGesture(true);
      });
  }

  return (
    <>
      <audio ref={breakRef} preload="auto">
        <source src={withBasePath("/audio/entry-break.mp3")} type="audio/mpeg" />
      </audio>

      <audio ref={loopRef} preload="auto" loop>
        <source src={withBasePath("/audio/entry-loop.mp3")} type="audio/mpeg" />
      </audio>

      {needsGesture && !introReleased && (
        <button
          type="button"
          onClick={startWithGesture}
          className="fixed inset-0 z-[100] bg-black/80 text-white font-mono text-sm tracking-[0.28em]"
        >
          ENTER WITH SOUND
        </button>
      )}

      <button
        type="button"
        onClick={toggleSound}
        className="fixed bottom-20 right-6 z-[90] border border-white/10 bg-black/60 px-4 py-2 text-[10px] font-mono tracking-[0.24em] text-white/70 backdrop-blur-md transition hover:border-white/30 hover:text-white"
      >
        {soundEnabled ? "SOUND ON" : "SOUND OFF"}
      </button>
    </>
  );
}