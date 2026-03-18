"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import EntrySound from "@/components/ui/EntrySound";

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

export default function Landing() {
  function handleEnter() {
    sessionStorage.setItem("misway-sound", "on");
  }

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-6">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_28%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02),transparent_20%,transparent_80%,rgba(255,255,255,0.02))]" />

        <motion.div
          className="absolute left-1/2 top-1/2 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/6 blur-[140px]"
          animate={{
            scale: [1, 1.08, 0.98, 1],
            opacity: [0.08, 0.16, 0.1, 0.08],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 36, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute inset-0 rounded-full border border-white/6" />
          <div className="absolute inset-[12%] rounded-full border border-white/5" />
          <div className="absolute inset-[24%] rounded-full border border-white/4" />
        </motion.div>

        <motion.div
          className="absolute left-1/2 top-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2"
          animate={{ opacity: [0.35, 0.7, 0.35] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg viewBox="0 0 200 200" className="h-full w-full">
            <path
              d="M55 150 L100 48 L145 150 M38 150 H72 M128 150 H162"
              fill="none"
              stroke="rgba(255,255,255,0.9)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>

        <motion.div
          className="absolute left-[18%] top-[20%] h-28 w-28 rounded-full border border-white/8"
          animate={{ y: [0, -10, 0], opacity: [0.12, 0.24, 0.12] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[18%] right-[16%] h-36 w-36 rounded-full border border-white/8"
          animate={{ y: [0, 12, 0], opacity: [0.08, 0.2, 0.08] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.25)_55%,rgba(0,0,0,0.76)_100%)]" />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex max-w-4xl flex-col items-center text-center"
      >
        <motion.p
          variants={item}
          className="mb-5 font-mono text-[10px] uppercase tracking-[0.38em] text-neutral-500 md:text-xs"
        >
          signal / drift / memory / fracture
        </motion.p>

        <motion.h1
          variants={item}
          className="text-6xl font-semibold tracking-[0.08em] text-white md:text-8xl lg:text-[9rem]"
        >
          MISWΛY
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-6 max-w-xl text-sm leading-7 text-neutral-400 md:text-base"
        >
          An audio-visual territory of fragments, tension, softness and machine residue.
        </motion.p>

        <motion.div
          variants={item}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            href="/explore"
            onClick={handleEnter}
            className="group relative overflow-hidden border border-white/20 px-6 py-3 font-mono text-[11px] tracking-[0.28em] text-white transition"
          >
            <span className="relative z-10 group-hover:text-black">ENTER</span>
            <span className="absolute inset-0 origin-left scale-x-0 bg-white transition-transform duration-500 group-hover:scale-x-100" />
          </Link>

          <Link
            href="/tracks"
            className="border border-white/10 px-6 py-3 font-mono text-[11px] tracking-[0.28em] text-white/70 transition hover:border-white/30 hover:text-white"
          >
            LISTEN
          </Link>

          <Link
            href="/drift"
            className="border border-white/10 px-6 py-3 font-mono text-[11px] tracking-[0.28em] text-white/70 transition hover:border-white/30 hover:text-white"
          >
            DRIFT
          </Link>

          <EntrySound />
        </motion.div>
      </motion.div>

      <div className="absolute bottom-6 left-6 right-6 flex justify-between font-mono text-[10px] tracking-[0.22em] text-neutral-700">
        <span>ENTRY NODE / V1</span>
        <span>NOISE ACTIVE</span>
      </div>
    </main>
  );
}