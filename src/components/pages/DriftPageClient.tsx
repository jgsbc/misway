"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { featuredTracks, tracks } from "@/lib/tracks";
import { withBasePath } from "@/lib/basePath";
import TrackPlayButton from "@/components/audio/TrackPlayButton";

const signalStates = [
    "cold light holding steady",
    "inner weather slightly unstable",
    "soft interference still beautiful",
    "night pulse detected in the walls",
    "residual echo remains active",
    "drift corridor open",
];

const vectors = [
    "follow the line that bends without breaking",
    "enter through softness, not force",
    "choose the chamber that feels a little too true",
    "keep the doubt, lose the stiffness",
    "move toward the clearest tension",
    "let the wrong turn become the right entrance",
];

const notes = [
    "Drift is not confusion. It is a more porous way of navigating.",
    "Some tracks are better approached sideways.",
    "This page exists for the moments when selection becomes too rational.",
    "You do not need a straight line to enter an honest atmosphere.",
    "A little misdirection can be more faithful than a menu.",
    "MISWΛY works best when the signal is felt before it is explained.",
];

function pickOne<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)];
}

export default function DriftPageClient() {
    const [signal, setSignal] = useState(() => pickOne(signalStates));
    const [vector, setVector] = useState(() => pickOne(vectors));
    const [note, setNote] = useState(() => pickOne(notes));
    const [track, setTrack] = useState(() =>
        pickOne(featuredTracks.length ? featuredTracks : tracks)
    );

    function reshuffle() {
        setSignal(pickOne(signalStates));
        setVector(pickOne(vectors));
        setNote(pickOne(notes));
        setTrack(pickOne(featuredTracks.length ? featuredTracks : tracks));
    }

    function nextChamber() {
        setTrack(pickOne(tracks));
    }

    return (
        <main className="relative min-h-screen overflow-hidden px-6 pb-36 pt-24 md:px-10">
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(86,184,255,0.12),transparent_24%),radial-gradient(circle_at_82%_18%,rgba(255,138,29,0.14),transparent_24%),linear-gradient(180deg,#03050a_0%,#060913_48%,#04060c_100%)]" />
                <div className="absolute left-1/2 top-20 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-white/5 blur-[120px]" />
                <div className="absolute left-[12%] top-[20%] h-32 w-32 rounded-full border border-white/6" />
                <div className="absolute bottom-[18%] right-[12%] h-40 w-40 rounded-full border border-white/6" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.16),rgba(0,0,0,0.58)_55%,rgba(0,0,0,0.86)_100%)]" />
            </div>

            <div className="relative mx-auto max-w-6xl">
                <section className="mb-14 grid gap-8 md:grid-cols-[1.02fr_0.98fr] md:items-end">
                    <div>
                        <p className="font-mono text-[10px] tracking-[0.35em] text-neutral-600">
                            / DRIFT MODE / NON-LINEAR ENTRY
                        </p>

                        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white md:text-6xl">
                            Drift through MISWΛY
                        </h1>

                        <p className="mt-6 max-w-2xl text-sm leading-7 text-neutral-300 md:text-base">
                            A softer route into the MISWΛY catalogue. Not the efficient one. The
                            alive one. Use this page when you want to enter the music through
                            atmosphere, tension and unstable attraction rather than pure selection.
                        </p>

                        <p className="mt-5 max-w-xl text-sm leading-7 text-neutral-400">
                            Drift does not replace the catalogue. It bends it.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={reshuffle}
                                className="inline-flex min-h-[46px] items-center justify-center border border-white/20 px-5 py-3 font-mono text-[11px] tracking-[0.24em] text-white transition hover:bg-white hover:text-black"
                            >
                                DRIFT AGAIN
                            </button>

                            <button
                                type="button"
                                onClick={nextChamber}
                                className="inline-flex min-h-[46px] items-center justify-center border border-white/10 px-5 py-3 font-mono text-[11px] tracking-[0.24em] text-white/75 transition hover:border-white/30 hover:text-white"
                            >
                                NEW CHAMBER
                            </button>

                            <Link
                                href="/tracks"
                                className="inline-flex min-h-[46px] items-center justify-center border border-white/10 px-5 py-3 font-mono text-[11px] tracking-[0.24em] text-white/75 transition hover:border-white/30 hover:text-white"
                            >
                                FULL TIMELINE
                            </Link>
                        </div>
                    </div>

                    <div className="relative overflow-hidden border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm md:-rotate-1">
                        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,rgba(86,184,255,0.0),rgba(86,184,255,0.95),rgba(255,255,255,0.9),rgba(255,170,78,0.95),rgba(255,170,78,0.0))]" />
                        <p className="font-mono text-[10px] tracking-[0.24em] text-neutral-500">
                            DRIFT PROTOCOL
                        </p>
                        <ul className="mt-5 space-y-3 text-sm leading-6 text-neutral-300">
                            <li>— keep a little room for misdirection</li>
                            <li>— choose by resonance, not by optimization</li>
                            <li>— let the player carry the thread across pages</li>
                            <li>— if one chamber catches, follow it</li>
                        </ul>
                    </div>
                </section>

                <section className="mb-14 grid gap-6 md:grid-cols-[0.84fr_1.16fr]">
                    <div className="space-y-4">
                        <div className="border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm rotate-[-1deg]">
                            <p className="font-mono text-[10px] tracking-[0.24em] text-neutral-500">
                                SIGNAL STATUS
                            </p>
                            <p className="mt-4 text-sm leading-7 text-neutral-200">{signal}</p>
                        </div>

                        <div className="border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm rotate-[1deg] md:ml-5">
                            <p className="font-mono text-[10px] tracking-[0.24em] text-neutral-500">
                                SUGGESTED VECTOR
                            </p>
                            <p className="mt-4 text-sm leading-7 text-neutral-200">{vector}</p>
                        </div>

                        <div className="border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm rotate-[-2deg] md:ml-2">
                            <p className="font-mono text-[10px] tracking-[0.24em] text-neutral-500">
                                NOTE
                            </p>
                            <p className="mt-4 text-sm leading-7 text-neutral-300">{note}</p>
                        </div>
                    </div>

                    <div className="relative overflow-hidden border border-white/10 bg-white/[0.04] backdrop-blur-sm">
                        <div className="grid md:grid-cols-[1fr_0.96fr]">
                            <div className="relative aspect-square md:aspect-auto md:min-h-[500px]">
                                <Image
                                    src={withBasePath(track.coverImage ?? "/images/tracks/fallback.png")}
                                    alt={track.title}
                                    fill
                                    className="object-cover opacity-90"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent md:bg-gradient-to-r md:from-black/20 md:via-transparent md:to-black/55" />
                            </div>

                            <div className="relative p-6 md:p-8">
                                <p className="font-mono text-[10px] tracking-[0.24em] text-neutral-500">
                                    CURRENT CHAMBER
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

                                <div className="mt-8 flex flex-wrap gap-3">
                                    <TrackPlayButton track={track} />

                                    <Link
                                        href={`/tracks/${track.slug}`}
                                        className="inline-flex h-10 items-center justify-center border border-white/20 px-4 font-mono text-[10px] uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-black"
                                    >
                                        OPEN NODE
                                    </Link>
                                </div>

                                <p className="mt-6 max-w-sm text-xs leading-6 text-neutral-500">
                                    Playback routes through the persistent site player, so the thread
                                    keeps moving even when you change page.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 md:grid-cols-3">
                    <Link
                        href="/explore"
                        className="group border border-white/10 bg-white/[0.04] p-5 transition hover:border-white/25 hover:bg-white/[0.06]"
                    >
                        <p className="font-mono text-[10px] tracking-[0.24em] text-neutral-500">
                            EXIT / CURATED
                        </p>
                        <p className="mt-4 text-sm leading-7 text-neutral-300">
                            Go back to a more curated entry point built around selected chambers.
                        </p>
                    </Link>

                    <Link
                        href="/tracks"
                        className="group border border-white/10 bg-white/[0.04] p-5 transition hover:border-white/25 hover:bg-white/[0.06] md:translate-y-4"
                    >
                        <p className="font-mono text-[10px] tracking-[0.24em] text-neutral-500">
                            EXIT / FULL INDEX
                        </p>
                        <p className="mt-4 text-sm leading-7 text-neutral-300">
                            Return to the full visible timeline and choose with a more direct logic.
                        </p>
                    </Link>

                    <div className="border border-white/10 bg-white/[0.04] p-5 md:-translate-y-2">
                        <p className="font-mono text-[10px] tracking-[0.24em] text-neutral-500">
                            DRIFT IS
                        </p>
                        <p className="mt-4 text-sm leading-7 text-neutral-300">
                            not a bug and not a joke page. It is a softer, stranger and more
                            atmospheric route into the same catalogue.
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}