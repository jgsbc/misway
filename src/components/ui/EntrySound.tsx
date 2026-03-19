"use client";

import { useEffect, useRef, useState } from "react";
import { withBasePath } from "@/lib/basePath";

export default function EntrySound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [checked, setChecked] = useState(false);

  async function startAudio() {
    if (!audioRef.current) return false;

    try {
      audioRef.current.volume = 0.35;
      audioRef.current.loop = true;
      await audioRef.current.play();
      setEnabled(true);
      sessionStorage.setItem("misway-sound", "on");
      return true;
    } catch (error) {
      setEnabled(false);
      sessionStorage.setItem("misway-sound", "off");
      return false;
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
    async function init() {
      await startAudio();
      setChecked(true);
    }
    init();
  }, []);

  return (
    <>
      <audio
        ref={audioRef}
        src={withBasePath("/audio/entry-ambient.mp3")}
        preload="auto"
      />
      <button
        type="button"
        onClick={toggleAudio}
        className="font-mono text-[10px] tracking-[0.18em] text-neutral-700 transition hover:text-white"
      >
        {!checked ? "NOISE LOADING" : enabled ? "NOISE ACTIVE" : "NOISE INACTIVE"}
      </button>
    </>
  );
}