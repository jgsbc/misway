import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { featuredTracks } from "@/lib/tracks";
import { withBasePath } from "@/lib/basePath";

const siteUrl = "https://jgsbc.github.io/misway";

export const metadata: Metadata = {
  title: "About MISWΛY (MISWAY) — artist bio, vision & collaborations",
  description:
    "Learn about MISWΛY (MISWAY), an electronic music project exploring atmospheric electronica, ambient textures, trip-hop pressure and cinematic sound design.",
  alternates: {
    canonical: `${siteUrl}/about/`,
  },
  openGraph: {
    title: "About MISWΛY (MISWAY)",
    description:
      "Artist bio, sonic direction, selected tracks and collaboration entry points.",
    url: `${siteUrl}/about/`,
    type: "profile",
    images: [
      {
        url: `${siteUrl}/images/about/misway-portrait.jpg`,
        width: 1200,
        height: 1600,
        alt: "Portrait of MISWΛY",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About MISWΛY (MISWAY)",
    description:
      "Artist bio, sonic direction, selected tracks and collaboration entry points.",
    images: [`${siteUrl}/images/about/misway-portrait.jpg`],
  },
};

export default function AboutPage() {
  return (
    <main className="light-theme light-page-bg relative min-h-screen overflow-hidden px-6 pb-28 pt-24 md:px-10">
      <div className="relative mx-auto max-w-6xl">
        {/* Main Section */}
        <section className="mb-20 grid gap-12 md:grid-cols-[1fr_380px] md:items-start">
          <div>
            <p className="light-text-tertiary font-mono text-[10px] tracking-[0.35em]">
              / ABOUT / ARTIST PROFILE
            </p>

            <h1 className="light-text-primary mt-6 text-4xl font-semibold tracking-tight md:text-6xl">
              MISWΛY
            </h1>

            <p className="light-text-secondary mt-3 font-mono text-[10px] uppercase tracking-[0.32em]">
              MISWAY / electronic music project
            </p>

            <p className="light-text-primary mt-6 max-w-3xl text-sm leading-7 md:text-base">
              MISWΛY is an electronic music project shaped by atmospheric tension, nocturnal textures, 
              ambient electronics, trip-hop weight and cinematic contrast. Serious sounds. Mildly suspicious 
              inner weather.
            </p>

            <p className="light-text-secondary mt-5 max-w-3xl text-sm leading-7 md:text-base">
              This site is the central archive: tracks, context, entry points and a visual language built 
              around drift, signal, memory and controlled fracture. Not a robot. Mostly a human with machines.
            </p>

            <p className="light-text-secondary mt-5 max-w-3xl text-sm leading-7 md:text-base">
              Behind the project: personal intensity, visual taste, unfinished inner movement turned into form, 
              pulse and atmosphere. No guru. No content farm. Just work, signals and pressure.
            </p>

            {/* Info Cards */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="light-border light-card-bg border p-5">
                <p className="light-text-tertiary font-mono text-[10px] tracking-[0.24em]">
                  GENRES / TERRITORIES
                </p>
                <p className="light-text-secondary mt-4 text-sm leading-7">
                  Atmospheric electronica, ambient, trip-hop, cinematic electronics, dark synthetic textures.
                </p>
              </div>

              <div className="light-border light-card-bg border p-5">
                <p className="light-text-tertiary font-mono text-[10px] tracking-[0.24em]">
                  AVAILABLE FOR
                </p>
                <p className="light-text-secondary mt-4 text-sm leading-7">
                  Sync, licensing, visuals, remix work, artist inquiry, music projects. Direct contact for serious offers.
                </p>
              </div>
            </div>
          </div>

          {/* Portrait Sidebar */}
          <div className="space-y-4 md:sticky md:top-24">
            <div className="portrait-fade-to-light light-border relative overflow-hidden border">
              <div className="relative aspect-[3/4]">
                <Image
                  src={withBasePath("/images/about/misway-portrait.jpg")}
                  alt="Portrait of MISWΛY"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            <div className="light-card-bg light-border space-y-4 border p-5">
              <div>
                <p className="light-text-tertiary font-mono text-[10px] tracking-[0.24em]">
                  SOUNDCLOUD
                </p>
                <a
                  href="https://soundcloud.com/misway"
                  target="_blank"
                  rel="noreferrer"
                  className="light-text-primary light-border hover:light-card-hover mt-3 inline-flex border px-4 py-2 font-mono text-[10px] tracking-[0.22em] transition"
                >
                  OPEN ↗
                </a>
              </div>

              <div>
                <p className="light-text-tertiary font-mono text-[10px] tracking-[0.24em]">
                  COMMERCIAL PROFILE
                </p>
                <Link
                  href="/artist"
                  className="light-text-primary light-border hover:light-card-hover mt-3 inline-flex border px-4 py-2 font-mono text-[10px] tracking-[0.22em] transition"
                >
                  VIEW →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Selected Tracks Section */}
        <section className="mb-20">
          <p className="light-text-tertiary font-mono text-[10px] tracking-[0.35em]">
            / ENTRY POINTS
          </p>

          <h2 className="light-text-primary mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
            Into the catalogue
          </h2>

          <p className="light-text-secondary mt-4 max-w-2xl text-sm leading-7 md:text-base">
            A few anchors to understand the sonic direction before exploring the wider timeline.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {featuredTracks.map((track) => (
              <Link
                key={track.slug}
                href={`/tracks/${track.slug}`}
                className="light-text-primary light-border hover:light-card-hover border px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] transition"
              >
                {track.title}
              </Link>
            ))}
          </div>

          <div className="mt-8">
            <Link
              href="/tracks"
              className="light-text-primary light-border hover:light-card-hover inline-flex border px-5 py-3 font-mono text-[11px] tracking-[0.24em] transition"
            >
              FULL TIMELINE
            </Link>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="grid gap-8 md:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <div className="light-card-bg light-border border p-6">
              <p className="light-text-tertiary font-mono text-[10px] tracking-[0.24em]">
                CONTACT / INQUIRY
              </p>
              <p className="light-text-secondary mt-4 text-sm leading-7">
                For music, collaboration, sync or direct project inquiry around MISWΛY.
              </p>
            </div>

            <div className="light-card-bg light-border border p-6">
              <p className="light-text-tertiary font-mono text-[10px] tracking-[0.24em]">
                GOOD REASONS TO REACH OUT
              </p>
              <ul className="light-text-secondary mt-4 space-y-3 text-sm leading-6">
                <li>— musical collaboration</li>
                <li>— film/TV sync and licensing</li>
                <li>— remix or reinterpretation</li>
                <li>— artist inquiry or press</li>
                <li>— project or partnership</li>
              </ul>
            </div>
          </div>

          {/* Contact Form */}
          <section className="light-card-bg light-border border p-6 md:p-8">
            <p className="light-text-tertiary font-mono text-[10px] tracking-[0.24em]">
              MESSAGE FORM
            </p>

            <form
              action="https://formspree.io/f/xqeywvda"
              method="POST"
              className="mt-6 space-y-6"
            >
              <div>
                <label
                  htmlFor="name"
                  className="light-text-tertiary mb-2 block font-mono text-[10px] tracking-[0.22em]"
                >
                  NAME
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="light-text-primary light-border w-full border px-4 py-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-400"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="light-text-tertiary mb-2 block font-mono text-[10px] tracking-[0.22em]"
                >
                  EMAIL
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="light-text-primary light-border w-full border px-4 py-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-400"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="light-text-tertiary mb-2 block font-mono text-[10px] tracking-[0.22em]"
                >
                  SUBJECT
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  className="light-text-primary light-border w-full border px-4 py-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-400"
                  placeholder="Collab, sync, press..."
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="light-text-tertiary mb-2 block font-mono text-[10px] tracking-[0.22em]"
                >
                  MESSAGE
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={7}
                  required
                  className="light-text-primary light-border w-full resize-none border px-4 py-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-400"
                  placeholder="Tell us about your inquiry..."
                />
              </div>

              <input
                type="text"
                name="_gotcha"
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  className="light-text-primary light-border hover:light-card-hover border px-6 py-3 font-mono text-[11px] tracking-[0.28em] transition"
                >
                  SEND
                </button>

                <Link
                  href="/tracks"
                  className="light-text-secondary light-border hover:light-text-primary border px-6 py-3 font-mono text-[11px] tracking-[0.28em] transition"
                >
                  BACK TO TRACKS
                </Link>
              </div>
            </form>
          </section>
        </section>
      </div>
    </main>
  );
}
