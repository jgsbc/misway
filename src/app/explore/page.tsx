"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { featuredTracks } from "@/lib/tracks";
import { withBasePath } from "@/lib/basePath";

export default function ExplorePage() {
  return (
    <main className="relative min-h-screen overflow-hidden px-6 pb-28 pt-24 md:px-10">
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute left-[12%] top-[18%] h-40 w-40 rounded-full border border-white/6"
          animate={{ y: [0, -10, 0], opacity: [0.08, 0.18, 0.08] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-[16%] top-[28%] h-24 w-24 rounded-full bg-white/5 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.08, 0.18, 0.08] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[18%] left-[22%] h-28 w-28 rounded-full border border-white/6"
          animate={{ y: [0, 12, 0], opacity: [0.08, 0.16, 0.08] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-12">
          <p className="font-mono text-[10px] tracking-[0.35em] text-neutral-600">
            / EXPLORE MODE
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-6xl">
            Choose a frequency
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-400 md:text-base">
            A curated entry point into the MISWΛY archive. Five chambers first. The
            full timeline remains available in Tracks.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featuredTracks.map((track, index) => (
            <motion.div
              key={track.slug}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.6 }}
            >
              <Link
                href={`/tracks/${track.slug}`}
                className="group relative block overflow-hidden border border-white/10 bg-white/[0.02] transition duration-500 hover:border-white/25 hover:bg-white/[0.04]"
              >
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={withBasePath(track.coverImage ?? "/images/tracks/fallback.png")}
                    alt={track.title}
                    fill
                    className="object-cover opacity-80 transition duration-700 group-hover:scale-[1.03] group-hover:opacity-100"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_35%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </div>

                <div className="relative p-6">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-[10px] tracking-[0.25em] text-neutral-600">
                      NODE {track.id}
                    </span>
                    <span className="font-mono text-[10px] tracking-[0.2em] text-neutral-600">
                      {track.publishedLabel}
                    </span>
                  </div>

                  <h2 className="mt-5 text-2xl font-medium tracking-tight text-neutral-200 transition group-hover:text-white md:text-3xl">
                    {track.title}
                  </h2>

                  <p className="mt-4 max-w-md text-sm leading-6 text-neutral-400">
                    {track.shortText}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {track.tags.map((tag) => (
                      <span
                        key={tag}
                        className="border border-white/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-8 flex items-center justify-between">
                    <span className="font-mono text-[10px] tracking-[0.2em] text-neutral-600">
                      {track.duration ?? track.yearLabel}
                    </span>
                    <span className="font-mono text-[10px] tracking-[0.24em] text-white/70 transition group-hover:text-white">
                      ENTER →
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-10">
          <Link
            href="/tracks"
            className="inline-flex border border-white/10 px-5 py-3 font-mono text-[11px] tracking-[0.24em] text-white/70 transition hover:border-white/30 hover:text-white"
          >
            OPEN FULL TIMELINE
          </Link>
        </div>
      </div>
    </main>
  );
}