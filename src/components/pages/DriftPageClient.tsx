"use client";

import { useState, useLayoutEffect } from "react";
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

const driftTrackPool = featuredTracks.length ? featuredTracks : tracks;

function pickOne<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)];
}

export default function DriftPageClient() {
    const [signal, setSignal] = useState("cold light holding steady");
    const [vector, setVector] = useState("follow the line that bends without breaking");
    const [note, setNote] = useState("Drift is not confusion. It is a more porous way of navigating.");
    const [track, setTrack] = useState(driftTrackPool[0]);

    useLayoutEffect(() => {
        let cancelled = false;

        queueMicrotask(() => {
            if (cancelled) return;

            setSignal(pickOne(signalStates));
            setVector(pickOne(vectors));
            setNote(pickOne(notes));
            setTrack(pickOne(driftTrackPool));
        });

        return () => {
            cancelled = true;
        };
    }, []);

    function reshuffle() {
        setSignal(pickOne(signalStates));
        setVector(pickOne(vectors));
        setNote(pickOne(notes));
        setTrack(pickOne(driftTrackPool));
    }

    function nextChamber() {
        setTrack(pickOne(tracks));
    }

    return (
        <main className="light-theme light-page-bg relative min-h-screen overflow-hidden px-6 pb-36 pt-24 md:px-10">
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(86,184,255,0.04),transparent_24%),radial-gradient(circle_at_82%_18%,rgba(255,138,29,0.05),transparent_24%)]" />
                <div className="absolute left-1/2 top-20 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-50 to-transparent blur-[120px]" />
                <div className="absolute left-[12%] top-[20%] h-32 w-32 rounded-full border border-neutral-200" />
                <div className="absolute bottom-[18%] right-[12%] h-40 w-40 rounded-full border border-neutral-200" />
            </div>

            <div className="relative mx-auto max-w-6xl">
                <section className="mb-14 grid gap-8 md:grid-cols-[1.02fr_0.98fr] md:items-end">
                    <div>
                        <p className="light-text-tertiary font-mono text-[10px] tracking-[0.35em]">
                            / DRIFT MODE / NON-LINEAR ENTRY
                        </p>

                        <h1 className="light-text-primary mt-5 text-4xl font-semibold tracking-tight md:text-6xl">
                            Drift through MISWΛY
                        </h1>

                        <p className="light-text-secondary mt-6 max-w-2xl text-sm leading-7 md:text-base">
                            A softer route into the MISWΛY catalogue. Not the efficient one. The alive one. 
                            Navigate through atmosphere, tension and resonance rather than pure selection.
                        </p>

                        <p className="light-text-secondary mt-5 max-w-xl text-sm leading-7">
                            Drift does not replace the catalogue. It bends it.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={reshuffle}
                                className="light-text-primary light-border hover:light-card-hover inline-flex min-h-[46px] items-center justify-center border px-5 py-3 font-mono text-[11px] tracking-[0.24em] transition"
                            >
                                DRIFT AGAIN
                            </button>

                            <button
                                type="button"
                                onClick={nextChamber}
                                className="light-text-secondary light-border hover:light-text-primary inline-flex min-h-[46px] items-center justify-center border px-5 py-3 font-mono text-[11px] tracking-[0.24em] transition"
                            >
                                NEW CHAMBER
                            </button>

                            <Link
                                href="/tracks"
                                className="light-text-secondary light-border hover:light-text-primary inline-flex min-h-[46px] items-center justify-center border px-5 py-3 font-mono text-[11px] tracking-[0.24em] transition"
                            >
                                FULL TIMELINE
                            </Link>
                        </div>
                    </div>

                    <div className="light-card-bg light-border relative overflow-hidden border p-6 backdrop-blur-sm md:-rotate-1">
                        <p className="light-text-tertiary font-mono text-[10px] tracking-[0.24em]">
                            DRIFT PROTOCOL
                        </p>
                        <ul className="light-text-secondary mt-5 space-y-3 text-sm leading-6">
                            <li>— keep a little room for misdirection</li>
                            <li>— choose by resonance, not by optimization</li>
                            <li>— let the player carry the thread across pages</li>
                            <li>— if one chamber catches, follow it</li>
                        </ul>
                    </div>
                </section>

                <section className="mb-14 grid gap-6 md:grid-cols-[0.84fr_1.16fr]">
                    <div className="space-y-4">
                        <div className="light-card-bg light-border border p-5 backdrop-blur-sm rotate-[-1deg]">
                            <p className="light-text-tertiary font-mono text-[10px] tracking-[0.24em]">
                                SIGNAL STATUS
                            </p>
                            <p className="light-text-primary mt-4 text-sm leading-7">{signal}</p>
                        </div>

                        <div className="light-card-bg light-border border p-5 backdrop-blur-sm rotate-[1deg] md:ml-5">
                            <p className="light-text-tertiary font-mono text-[10px] tracking-[0.24em]">
                                SUGGESTED VECTOR
                            </p>
                            <p className="light-text-primary mt-4 text-sm leading-7">{vector}</p>
                        </div>

                        <div className="light-card-bg light-border border p-5 backdrop-blur-sm rotate-[-2deg] md:ml-2">
                            <p className="light-text-tertiary font-mono text-[10px] tracking-[0.24em]">
                                NOTE
                            </p>
                            <p className="light-text-secondary mt-4 text-sm leading-7">{note}</p>
                        </div>
                    </div>

                    <div className="light-card-bg light-border relative overflow-hidden border backdrop-blur-sm">
                        <div className="grid md:grid-cols-[1fr_0.96fr]">
                            <div className="relative aspect-square md:aspect-auto md:min-h-[500px]">
                                <Image
                                    src={withBasePath(track.coverImage ?? "/images/tracks/fallback.png")}
                                    alt={track.title}
                                    fill
                                    className="object-cover opacity-90"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                            </div>

                            <div className="relative p-6 md:p-8">
                                <p className="light-text-tertiary font-mono text-[10px] tracking-[0.24em]">
                                    CURRENT CHAMBER
                                </p>

                                <h2 className="light-text-primary mt-6 text-3xl font-semibold tracking-tight md:text-4xl">
                                    {track.title}
                                </h2>

                                <p className="light-text-tertiary mt-4 font-mono text-[10px] tracking-[0.24em]">
                                    {track.publishedLabel} · {track.duration ?? track.yearLabel}
                                </p>

                                <p className="light-text-secondary mt-6 text-sm leading-7">
                                    {track.shortText}
                                </p>

                                <div className="mt-6 flex flex-wrap gap-2">
                                    {track.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="light-border light-text-tertiary border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em]"
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

                                <p className="light-text-tertiary mt-6 max-w-sm text-xs leading-6">
                                    Playback routes through the persistent site player, so the thread
                                    keeps moving even when you change page.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 md:grid-cols-3">
                    <Link
                        href="/about"
                        className="light-card-bg light-border group border p-5 transition hover:light-card-hover"
                    >
                        <p className="light-text-tertiary font-mono text-[10px] tracking-[0.24em]">
                            EXIT / CONTEXT
                        </p>
                        <p className="light-text-secondary mt-4 text-sm leading-7">
                            Learn about the artist and the philosophy behind MISWΛY.
                        </p>
                    </Link>

                    <Link
                        href="/tracks"
                        className="light-card-bg light-border group border p-5 transition hover:light-card-hover md:translate-y-4"
                    >
                        <p className="light-text-tertiary font-mono text-[10px] tracking-[0.24em]">
                            EXIT / FULL INDEX
                        </p>
                        <p className="light-text-secondary mt-4 text-sm leading-7">
                            Return to the full visible timeline and choose with direct logic.
                        </p>
                    </Link>

                    <div className="light-card-bg light-border border p-5 md:-translate-y-2">
                        <p className="light-text-tertiary font-mono text-[10px] tracking-[0.24em]">
                            DRIFT IS
                        </p>
                        <p className="light-text-secondary mt-4 text-sm leading-7">
                            not a bug and not a joke page. It is a softer, stranger and more
                            atmospheric route into the same catalogue.
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}
