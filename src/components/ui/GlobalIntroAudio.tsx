"use client";

import { useEffect, useRef, useState } from "react";
import { withBasePath } from "@/lib/basePath";

export default function GlobalIntroAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  async function playLoop() {
    if (!audioRef.current) return false;

    try {
      audioRef.current.volume = 0.35;
      audioRef.current.loop = true;
      await audioRef.current.play();
      setEnabled(true);
      setAutoplayBlocked(false);
      sessionStorage.setItem("misway-sound", "on");
      return true;
    } catch (error) {
      console.warn("MISWΛY audio blocked or failed:", error);
      setEnabled(false);
      setAutoplayBlocked(true);
      sessionStorage.setItem("misway-sound", "off");
      return false;
    }
  }

  function stopLoop() {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setEnabled(false);
    sessionStorage.setItem("misway-sound", "off");
  }

  async function toggleSound() {
    if (enabled) {
      stopLoop();
      return;
    }

    await playLoop();
  }

  useEffect(() => {
    const saved = sessionStorage.getItem("misway-sound");

    if (saved === "off") {
      setEnabled(false);
      return;
    }

    playLoop();
  }, []);

  return (
    <>
      <audio
        ref={audioRef}
        src={withBasePath("/audio/noise.mp3")}
        preload="auto"
      />

      <button
        type="button"
        onClick={toggleSound}
        className="fixed bottom-6 right-4 z-[70] font-mono text-[10px] tracking-[0.18em] text-neutral-700 transition hover:text-white sm:right-6"
        aria-label={enabled ? "Disable ambient noise" : "Enable ambient noise"}
      >
        {enabled ? "NOISE ACTIVE" : autoplayBlocked ? "NOISE INACTIVE" : "NOISE INACTIVE"}
      </button>
    </>
  );
}
