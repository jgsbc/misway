"use client";

import { useRef, useState } from "react";

export default function EntrySound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [enabled, setEnabled] = useState(false);

  async function toggleSound() {
    if (!audioRef.current) return;

    if (enabled) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      sessionStorage.setItem("misway-sound", "off");
      setEnabled(false);
      return;
    }

    try {
      audioRef.current.volume = 0.35;
      await audioRef.current.play();
      sessionStorage.setItem("misway-sound", "on");
      setEnabled(true);
    } catch (error) {
      console.error("Audio play blocked or failed:", error);
      alert("Le son ne peut pas démarrer. Vérifie le fichier audio et clique une fois dans la page.");
    }
  }

  return (
    <>
      <audio ref={audioRef} src="/audio/entry-ambient.mp3" loop preload="auto" />
      <button
        type="button"
        onClick={toggleSound}
        className="border border-white/10 px-4 py-2 text-[10px] font-mono tracking-[0.24em] text-white/70 transition hover:border-white/30 hover:text-white"
      >
        {enabled ? "SOUND ON" : "START SOUND"}
      </button>
    </>
  );
}