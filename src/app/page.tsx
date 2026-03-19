"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import EntrySound from "@/components/ui/EntrySound";
import { withBasePath } from "@/lib/basePath";

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

export default function Landing() {
  return (
    <main className="relative min-h-[100svh] overflow-clip bg-black px-5 sm:px-8">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute inset-0 hidden bg-cover bg-center bg-no-repeat opacity-55 md:block"
          style={{
            backgroundImage: `url(${withBasePath("/images/tracks-hero-1920x1080-v3.webp")})`,
          }}
        />

        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60 md:hidden"
          style={{
            backgroundImage: `url(${withBasePath("/images/tracks-hero-mobile-1080x1920.webp")})`,
          }}
        />

        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.38),rgba(0,0,0,0.56)_35%,rgba(0,0,0,0.84)_100%)]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04)_0%,rgba(0,0,0,0.12)_32%,rgba(0,0,0,0.52)_100%)]" />
      </div>

      <section className="relative z-10 mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-between py-8 sm:py-10">
        <div className="flex flex-1 items-center">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="mx-auto w-full max-w-4xl text-center"
          >
            <motion.p
              variants={item}
              className="mb-5 font-mono text-[10px] uppercase tracking-[0.35em] text-neutral-500 sm:text-xs"
            >
              signal / drift / memory / fracture
            </motion.p>

            <motion.h1
              variants={item}
              className="text-5xl font-semibold tracking-[0.12em] text-white sm:text-7xl md:text-8xl lg:text-[8.5rem]"
            >
              MISWΛY
            </motion.h1>

            <motion.div
              variants={item}
              className="mx-auto mt-6 max-w-2xl space-y-4"
            >
              <p className="text-base leading-7 text-neutral-300 sm:text-lg sm:leading-8">
                Sound, image and fragments of inner weather.
              </p>
              <p className="mx-auto max-w-xl text-sm leading-7 text-neutral-500 sm:text-base">
                A dark, sensitive and synthetic territory shaped by tension,
                softness, rhythm and residue.
              </p>
            </motion.div>

            <motion.div
              variants={item}
              className="mx-auto mt-10 flex w-full max-w-2xl flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center"
            >
              <Link
                href="/explore"
                className="group relative flex min-h-[50px] items-center justify-center overflow-hidden border border-white/20 px-7 py-3 font-mono text-[11px] tracking-[0.24em] text-white transition"
              >
                <span className="relative z-10 group-hover:text-black">ENTER</span>
                <span className="absolute inset-0 origin-left scale-x-0 bg-white transition-transform duration-500 group-hover:scale-x-100" />
              </Link>

              <Link
                href="/tracks"
                className="flex min-h-[50px] items-center justify-center border border-white/10 px-7 py-3 font-mono text-[11px] tracking-[0.24em] text-white/75 transition hover:border-white/30 hover:text-white"
              >
                LISTEN
              </Link>

              <Link
                href="/drift"
                className="flex min-h-[50px] items-center justify-center border border-white/10 px-7 py-3 font-mono text-[11px] tracking-[0.24em] text-white/75 transition hover:border-white/30 hover:text-white"
              >
                DRIFT
              </Link>
            </motion.div>
          </motion.div>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-white/8 pt-4 font-mono text-[10px] tracking-[0.18em] text-neutral-700">
          <span>ENTRY NODE / V1</span>
          <EntrySound />
        </div>
      </section>
    </main>
  );
}