"use client";

import { useEffect, useRef, useState } from "react";
import { withBasePath } from "@/lib/basePath";

export default function EntrySound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [enabled, setEnabled] = useState(false);

  async function startAudio() {
    if (!audioRef.current) return;

    try {
      audioRef.current.volume = 0.35;
      audioRef.current.loop = true;
      await audioRef.current.play();
      setEnabled(true);
      sessionStorage.setItem("misway-sound", "on");
    } catch (error) {
      console.warn("Audio blocked or missing file:", error);
      setEnabled(false);
      sessionStorage.setItem("misway-sound", "off");
    }
  }

  function stopAudio() {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setEnabled(false);
    sessionStorage.setItem("misway-sound", "off");
  }

  async function toggleAudio() {
    if (enabled) {
      stopAudio();
    } else {
      await startAudio();
    }
  }

  useEffect(() => {
    const saved = sessionStorage.getItem("misway-sound");
    if (saved === "on") {
      startAudio();
    }
  }, []);

  return (
    <>
      <audio ref={audioRef} src={withBasePath("/audio/noise.mp3")} preload="auto" />
      <button
        type="button"
        onClick={toggleAudio}
        className="font-mono text-[10px] tracking-[0.18em] text-neutral-700 transition hover:text-white"
      >
        {enabled ? "NOISE ACTIVE" : "NOISE INACTIVE"}
      </button>
    </>
  );
}