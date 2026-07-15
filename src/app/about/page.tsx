import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { featuredTracks } from "@/lib/tracks";
import { withBasePath } from "@/lib/basePath";

const siteUrl = "https://jgsbc.github.io/misway";

export const metadata: Metadata = {
  title: "About MISWΛY (MISWAY) — music made over time",
  description:
    "MISWΛY is a personal space for music, images, memories and strange detours made over time and shared without a career plan.",
  alternates: {
    canonical: `${siteUrl}/about/`,
  },
  openGraph: {
    title: "About MISWΛY (MISWAY)",
    description:
      "The person, instruments, silences, returns and crooked paths behind MISWΛY.",
    url: `${siteUrl}/about/`,
    type: "profile",
    images: [
      {
        url: `${siteUrl}/images/about/misway-portrait.jpg`,
        width: 1200,
        height: 1600,
        alt: "Portrait behind MISWΛY",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About MISWΛY (MISWAY)",
    description:
      "The person, instruments, silences, returns and crooked paths behind MISWΛY.",
    images: [`${siteUrl}/images/about/misway-portrait.jpg`],
  },
};

export default function AboutPage() {
  return (
    <main className="light-theme light-page-bg relative min-h-screen overflow-hidden px-6 pb-28 pt-24 md:px-10">
      <div className="relative mx-auto max-w-6xl">
        <section className="mb-20 grid gap-12 md:grid-cols-[1fr_380px] md:items-start">
          <div>
            <p className="light-text-tertiary font-mono text-[10px] tracking-[0.35em]">
              / ABOUT / BEHIND MISWAY
            </p>

            <h1 className="light-text-primary mt-6 text-4xl font-semibold tracking-tight md:text-6xl">
              MISWΛY
            </h1>

            <p className="light-text-secondary mt-3 font-mono text-[10px] uppercase tracking-[0.32em]">
              Music made over time
            </p>

            <p className="light-text-primary mt-6 max-w-3xl text-sm leading-7 md:text-base">
              I have been making music for a long time, with a few remarkably efficient periods of silence.
              Piano came first, then guitar, saxophone, bands, machines and the slightly dangerous idea that a
              computer could hold an orchestra.
            </p>

            <p className="light-text-secondary mt-5 max-w-3xl text-sm leading-7 md:text-base">
              Reason entered the picture in the early 2000s. Ableton came later. The tools changed, the music
              stopped and returned, and none of it became a career plan. It kept asking to exist anyway.
            </p>

            <p className="light-text-secondary mt-5 max-w-3xl text-sm leading-7 md:text-base">
              I am an amateur in the literal sense: I do this because I love doing it. That does not make the
              music casual. It simply leaves it free from release calendars, professional poses and the need to
              become useful to an industry.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="light-border light-card-bg border p-5">
                <p className="light-text-tertiary font-mono text-[10px] tracking-[0.24em]">
                  WHAT MOVES THROUGH IT
                </p>
                <p className="light-text-secondary mt-4 text-sm leading-7">
                  Trip-hop weight, acid-jazz movement, ambient space, electronic accidents and melodies that
                  still remember French songs.
                </p>
              </div>

              <div className="light-border light-card-bg border p-5">
                <p className="light-text-tertiary font-mono text-[10px] tracking-[0.24em]">
                  WHY IT IS HERE
                </p>
                <p className="light-text-secondary mt-4 text-sm leading-7">
                  To share what feels worth taking out of the hard drive, keep a trace of the path and let the
                  pieces meet people without asking them to become customers.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 md:sticky md:top-24">
            <div className="portrait-fade-to-light light-border relative overflow-hidden border">
              <div className="relative aspect-[3/4]">
                <Image
                  src={withBasePath("/images/about/misway-portrait.jpg")}
                  alt="Portrait behind MISWΛY"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            <div className="light-card-bg light-border border p-5">
              <p className="light-text-tertiary font-mono text-[10px] tracking-[0.24em]">
                SOUNDCLOUD
              </p>
              <p className="light-text-secondary mt-3 text-sm leading-6">
                Another place where some of the music lives.
              </p>
              <a
                href="https://soundcloud.com/misway"
                target="_blank"
                rel="noreferrer"
                className="light-text-primary light-border hover:light-card-hover mt-4 inline-flex border px-4 py-2 font-mono text-[10px] tracking-[0.22em] transition"
              >
                LISTEN THERE ↗
              </a>
            </div>
          </div>
        </section>

        <section className="light-border light-card-bg mb-20 border p-6 md:p-8">
          <p className="light-text-tertiary font-mono text-[10px] tracking-[0.35em]">
            / A NAME FOR THE DETOURS
          </p>

          <h2 className="light-text-primary mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
            Not always the straight road
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <p className="light-text-secondary text-sm leading-7 md:text-base">
              MISWAY fits the way the music arrived: rarely in a straight line, often late, sometimes through
              the wrong door. A missed direction can still lead somewhere worth remembering.
            </p>
            <p className="light-text-secondary text-sm leading-7 md:text-base">
              The pieces hold different versions of the same person. Some are rough, some tender, some restless,
              some slightly ridiculous. They do not need to agree with one another to belong here.
            </p>
          </div>
        </section>

        <section className="mb-20">
          <p className="light-text-tertiary font-mono text-[10px] tracking-[0.35em]">
            / A FEW PLACES TO START
          </p>

          <h2 className="light-text-primary mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
            Enter anywhere
          </h2>

          <p className="light-text-secondary mt-4 max-w-2xl text-sm leading-7 md:text-base">
            These tracks are not a professional selection or a definitive summary. They are simply a few open
            doors into different corners of the path.
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
              FOLLOW THE TRACKS
            </Link>
          </div>
        </section>

        <section id="contact" className="grid gap-8 md:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <div className="light-card-bg light-border border p-6">
              <p className="light-text-tertiary font-mono text-[10px] tracking-[0.24em]">
                SAY HELLO
              </p>
              <p className="light-text-secondary mt-4 text-sm leading-7">
                A track, a thought, a memory it stirred, a reference, a strange association or a technical
                problem: all are valid reasons to write.
              </p>
            </div>

            <div className="light-card-bg light-border border p-6">
              <p className="light-text-tertiary font-mono text-[10px] tracking-[0.24em]">
                GOOD REASONS TO REACH OUT
              </p>
              <ul className="light-text-secondary mt-4 space-y-3 text-sm leading-6">
                <li>— a piece stayed with you</li>
                <li>— it reminded you of something unexpected</li>
                <li>— you want to share a musical reference</li>
                <li>— you have an idea and feel like talking about it</li>
                <li>— something on the site appears to be broken</li>
              </ul>
            </div>
          </div>

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
                  placeholder="A track, a thought, a strange association..."
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
                  placeholder="What brought you here?"
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
