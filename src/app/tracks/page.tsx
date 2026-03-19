"use client";

import Link from "next/link";
import { motion } from "framer-motion";

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
  return (
    <main className="relative min-h-[100svh] w-full overflow-clip px-4 sm:px-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_28%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02),transparent_20%,transparent_80%,rgba(255,255,255,0.02))]" />

        <motion.div
          className="absolute left-1/2 top-[42%] h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/6 blur-[90px] sm:h-[520px] sm:w-[520px] md:h-[720px] md:w-[720px] md:blur-[130px]"
          animate={{
            scale: [1, 1.08, 0.98, 1],
            opacity: [0.08, 0.16, 0.1, 0.08],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          className="absolute left-1/2 top-[42%] hidden h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 sm:block md:h-[560px] md:w-[560px]"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 36, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute inset-0 rounded-full border border-white/6" />
          <div className="absolute inset-[12%] rounded-full border border-white/5" />
          <div className="absolute inset-[24%] rounded-full border border-white/4" />
        </motion.div>

        <motion.div
          className="absolute left-1/2 top-[42%] h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 sm:h-[360px] sm:w-[360px] md:h-[520px] md:w-[520px]"
          animate={{ opacity: [0.35, 0.75, 0.35] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg viewBox="0 0 200 200" className="h-full w-full">
            <path
              d="M55 150 L100 28 L145 150 M24 150 H82 M118 150 H176"
              fill="none"
              stroke="rgba(255,255,255,0.92)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>

        <motion.div
          className="absolute left-[10%] top-[16%] hidden h-20 w-20 rounded-full border border-white/8 md:block"
          animate={{ y: [0, -10, 0], opacity: [0.12, 0.24, 0.12] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          className="absolute bottom-[14%] right-[10%] hidden h-24 w-24 rounded-full border border-white/8 md:block"
          animate={{ y: [0, 12, 0], opacity: [0.08, 0.2, 0.08] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.22)_55%,rgba(0,0,0,0.78)_100%)]" />
      </div>

      <section className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-5xl flex-col justify-between py-8 sm:py-10">
        <div className="flex flex-1 items-center">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="w-full text-center"
          >
            <motion.p
              variants={item}
              className="mb-4 font-mono text-[10px] uppercase tracking-[0.32em] text-neutral-500 sm:text-xs"
            >
              signal / drift / memory / fracture
            </motion.p>

            <motion.h1
              variants={item}
              className="text-4xl font-semibold tracking-[0.08em] text-white sm:text-6xl md:text-8xl lg:text-[8rem]"
            >
              MISWΛY
            </motion.h1>

            <motion.p
              variants={item}
              className="mx-auto mt-5 max-w-2xl px-2 text-sm leading-7 text-neutral-400 sm:text-base"
            >
              An audio-visual territory of fragments, tension, softness and machine residue.
            </motion.p>

            <motion.div
              variants={item}
              className="mx-auto mt-8 flex w-full max-w-xl flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center"
            >
              <Link
                href="/explore"
                className="group relative flex min-h-[48px] items-center justify-center overflow-hidden border border-white/20 px-6 py-3 font-mono text-[11px] tracking-[0.24em] text-white transition sm:w-auto"
              >
                <span className="relative z-10 group-hover:text-black">ENTER</span>
                <span className="absolute inset-0 origin-left scale-x-0 bg-white transition-transform duration-500 group-hover:scale-x-100" />
              </Link>

              <Link
                href="/tracks"
                className="flex min-h-[48px] items-center justify-center border border-white/10 px-6 py-3 font-mono text-[11px] tracking-[0.24em] text-white/70 transition hover:border-white/30 hover:text-white"
              >
                LISTEN
              </Link>

              <Link
                href="/drift"
                className="flex min-h-[48px] items-center justify-center border border-white/10 px-6 py-3 font-mono text-[11px] tracking-[0.24em] text-white/70 transition hover:border-white/30 hover:text-white"
              >
                DRIFT
              </Link>
            </motion.div>
          </motion.div>
        </div>

        <div className="mt-8 flex items-center justify-between font-mono text-[10px] tracking-[0.18em] text-neutral-700">
          <span>ENTRY NODE / V1</span>
          <span className="opacity-0">.</span>
        </div>
      </section>
    </main>
  );
}
