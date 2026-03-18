"use client";

import { useEffect, useRef, useState } from "react";
import { withBasePath } from "@/lib/basePath";

export default function EntrySound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);

  async function startAudio() {
    if (!audioRef.current) return false;

    try {
      audioRef.current.volume = 0.35;
      audioRef.current.loop = true;
      await audioRef.current.play();
      sessionStorage.setItem("misway-sound", "on");
      setEnabled(true);
      return true;
    } catch (error) {
      console.warn("Autoplay audio blocked or failed:", error);
      sessionStorage.setItem("misway-sound", "off");
      setEnabled(false);
      return false;
    }
  }

  function stopAudio() {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    sessionStorage.setItem("misway-sound", "off");
    setEnabled(false);
  }

  async function toggleAudio() {
    if (enabled) {
      stopAudio();
      return;
    }
    await startAudio();
  }

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;

    const saved = sessionStorage.getItem("misway-sound");

    // Tentative au chargement uniquement si pas explicitement désactivé.
    if (saved !== "off") {
      startAudio();
    }
  }, [ready]);

  return (
    <>
      <audio
        ref={audioRef}
        src={withBasePath("/audio/noise.mp3")}
        preload="auto"
      />

      <button
        type="button"
        onClick={toggleAudio}
        className="font-mono text-[10px] tracking-[0.18em] text-neutral-700 transition hover:text-white"
        aria-label={enabled ? "Disable ambient noise" : "Enable ambient noise"}
      >
        {enabled ? "NOISE ACTIVE" : "NOISE INACTIVE"}
      </button>
    </>
  );
}