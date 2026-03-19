"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { featuredTracks, tracks } from "@/lib/tracks";
import { withBasePath } from "@/lib/basePath";

const signals = [
  "soft interference detected",
  "emotional static increasing",
  "clean insomnia remains stable",
  "minor reality slippage confirmed",
  "luminous residue still active",
  "architectural tenderness unlikely but possible",
];

const vectors = [
  "go left, but internally",
  "stay still and move anyway",
  "follow the coldest light",
  "trust the faulty signal",
  "enter the room that looks slightly wrong",
  "continue until the atmosphere changes texture",
];

const oddNotes = [
  "You are not lost. The map is simply embarrassed.",
  "Some frequencies only reveal themselves to mildly unreasonable people.",
  "The lambda has been seen behaving suspiciously near midnight.",
  "Clarity may occur, but no promise is made.",
  "If this page starts making too much sense, leave immediately.",
  "A detour is sometimes just a more honest line.",
];

function pickOne<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export default function DriftPage() {
  const [signal, setSignal] = useState(() => pickOne(signals));
  const [vector, setVector] = useState(() => pickOne(vectors));
  const [note, setNote] = useState(() => pickOne(oddNotes));
  const [track, setTrack] = useState(() => pickOne(featuredTracks.length ? featuredTracks : tracks));

  function reshuffle() {
    setSignal(pickOne(signals));
    setVector(pickOne(vectors));
    setNote(pickOne(oddNotes));
    setTrack(pickOne(featuredTracks.length ? featuredTracks : tracks));
  }

  function newTrack() {
    setTrack(pickOne(tracks));
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-6 pb-28 pt-24 md:px-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-24 h-[460px] w-[460px] -translate-x-1/2 rounded-full bg-white/5 blur-[130px]" />
        <div className="absolute left-[12%] top-[18%] h-24 w-24 rounded-full border border-white/6" />
        <div className="absolute bottom-[16%] right-[12%] h-36 w-36 rounded-full border border-white/6" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.25)_55%,rgba(0,0,0,0.82)_100%)]" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <section className="mb-14">
          <p className="font-mono text-[10px] tracking-[0.35em] text-neutral-600">
            / DRIFT / ENTER AT OWN RISK
          </p>

          <div className="mt-6 grid gap-8 md:grid-cols-[1.05fr_0.95fr] md:items-start">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-white md:text-6xl">
                Drift
              </h1>

              <p className="mt-6 max-w-2xl text-sm leading-7 text-neutral-300 md:text-base">
                This page is a mild navigational accident. It does not optimize
                anything. It offers fragments, unstable directions and one possible
                chamber at a time.
              </p>

              <p className="mt-5 max-w-xl text-sm leading-7 text-neutral-400">
                Use it when you do not want to choose too rationally.
              </p>
            </div>

            <div className="relative border border-white/10 bg-white/[0.03] p-6 -rotate-1">
              <p className="font-mono text-[10px] tracking-[0.24em] text-neutral-500">
                USELESS INSTRUCTIONS
              </p>

              <ul className="mt-4 space-y-3 text-sm leading-6 text-neutral-300">
                <li>— breathe once</li>
                <li>— do not over-explain your click</li>
                <li>— accept a little misdirection</li>
                <li>— if confused, excellent</li>
              </ul>

              <div className="absolute -right-3 -top-3 border border-white/10 bg-black px-3 py-2 font-mono text-[10px] tracking-[0.18em] text-neutral-500 rotate-2">
                LOOSELY CALIBRATED
              </div>
            </div>
          </div>
        </section>

        <section className="mb-14 grid gap-6 md:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-4">
            <div className="border border-white/10 bg-white/[0.03] p-5 rotate-[-1deg]">
              <p className="font-mono text-[10px] tracking-[0.24em] text-neutral-500">
                SIGNAL STATUS
              </p>
              <p className="mt-4 text-sm leading-7 text-neutral-200">{signal}</p>
            </div>

            <div className="border border-white/10 bg-white/[0.03] p-5 rotate-[1deg] md:ml-6">
              <p className="font-mono text-[10px] tracking-[0.24em] text-neutral-500">
                SUGGESTED VECTOR
              </p>
              <p className="mt-4 text-sm leading-7 text-neutral-200">{vector}</p>
            </div>

            <div className="border border-white/10 bg-white/[0.03] p-5 rotate-[-2deg] md:ml-2">
              <p className="font-mono text-[10px] tracking-[0.24em] text-neutral-500">
                UNRELIABLE NOTE
              </p>
              <p className="mt-4 text-sm leading-7 text-neutral-300">{note}</p>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={reshuffle}
                className="border border-white/20 px-5 py-3 font-mono text-[11px] tracking-[0.26em] text-white transition hover:bg-white hover:text-black"
              >
                DRIFT AGAIN
              </button>

              <button
                type="button"
                onClick={newTrack}
                className="border border-white/10 px-5 py-3 font-mono text-[11px] tracking-[0.26em] text-white/70 transition hover:border-white/30 hover:text-white"
              >
                NEW CHAMBER
              </button>
            </div>
          </div>

          <div className="relative overflow-hidden border border-white/10 bg-white/[0.03]">
            <div className="grid md:grid-cols-[1fr_0.95fr]">
              <div className="relative aspect-square md:aspect-auto md:min-h-[460px]">
                <Image
                  src={withBasePath(track.coverImage ?? "/images/tracks/fallback.png")}
                  alt={track.title}
                  fill
                  className="object-cover opacity-85"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent md:bg-gradient-to-r md:from-black/15 md:via-transparent md:to-black/45" />
              </div>

              <div className="relative p-6 md:p-8">
                <p className="font-mono text-[10px] tracking-[0.24em] text-neutral-500">
                  DRIFT CHAMBER
                </p>

                <h2 className="mt-6 text-3xl font-semibold tracking-tight text-white md:text-4xl">
                  {track.title}
                </h2>

                <p className="mt-4 font-mono text-[10px] tracking-[0.24em] text-neutral-500">
                  {track.publishedLabel} · {track.duration ?? track.yearLabel}
                </p>

                <p className="mt-6 text-sm leading-7 text-neutral-300">
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

                <div className="mt-10 flex flex-wrap gap-3">
                  <Link
                    href={`/tracks/${track.slug}`}
                    className="border border-white/20 px-5 py-3 font-mono text-[11px] tracking-[0.24em] text-white transition hover:bg-white hover:text-black"
                  >
                    ENTER THIS ONE
                  </Link>

                  <a
                    href={track.soundcloudUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="border border-white/10 px-5 py-3 font-mono text-[11px] tracking-[0.24em] text-white/70 transition hover:border-white/30 hover:text-white"
                  >
                    SOUNDCLOUD ↗
                  </a>
                </div>

                <div className="absolute -bottom-3 right-5 border border-white/10 bg-black px-3 py-2 font-mono text-[10px] tracking-[0.18em] text-neutral-500 -rotate-2">
                  NO STRAIGHT LINES TODAY
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="border border-white/10 bg-white/[0.03] p-5">
            <p className="font-mono text-[10px] tracking-[0.24em] text-neutral-500">
              DRIFT IS
            </p>
            <p className="mt-4 text-sm leading-7 text-neutral-300">
              a soft deviation from efficient navigation.
            </p>
          </div>

          <div className="border border-white/10 bg-white/[0.03] p-5 md:translate-y-5">
            <p className="font-mono text-[10px] tracking-[0.24em] text-neutral-500">
              DRIFT IS NOT
            </p>
            <p className="mt-4 text-sm leading-7 text-neutral-300">
              a bug, unless the bug turns out to be more poetic than the plan.
            </p>
          </div>

          <div className="border border-white/10 bg-white/[0.03] p-5 md:-translate-y-2">
            <p className="font-mono text-[10px] tracking-[0.24em] text-neutral-500">
              RECOMMENDED USE
            </p>
            <p className="mt-4 text-sm leading-7 text-neutral-300">
              late evening, mild fog, unresolved thoughts, acceptable instability.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}