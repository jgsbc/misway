import type { Metadata } from "next";
import Link from "next/link";

const siteUrl = "https://jgsbc.github.io/misway";

export const metadata: Metadata = {
  title: "MISWΛY — About",
  description:
    "The former MISWΛY artist profile now points to one simpler About page about the person, music and reasons for sharing it.",
  alternates: {
    canonical: `${siteUrl}/about/`,
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function ArtistPage() {
  return (
    <main className="light-theme light-page-bg relative flex min-h-screen items-center overflow-hidden px-6 py-24 md:px-10">
      <section className="light-border light-card-bg mx-auto w-full max-w-3xl border p-8 md:p-12">
        <p className="light-text-tertiary font-mono text-[10px] tracking-[0.35em]">
          / THIS PAGE MOVED
        </p>

        <h1 className="light-text-primary mt-6 text-4xl font-semibold tracking-tight md:text-6xl">
          One person. One About page.
        </h1>

        <p className="light-text-secondary mt-6 max-w-2xl text-sm leading-7 md:text-base">
          The separate Artist profile is no longer used. Everything about the person behind MISWΛY, the music,
          the instruments, the silences and the reasons for sharing it now lives in one simpler place.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/about"
            className="light-text-primary light-border hover:light-card-hover inline-flex border px-5 py-3 font-mono text-[11px] tracking-[0.24em] transition"
          >
            GO TO ABOUT →
          </Link>

          <Link
            href="/tracks"
            className="light-text-secondary light-border hover:light-text-primary inline-flex border px-5 py-3 font-mono text-[11px] tracking-[0.24em] transition"
          >
            FOLLOW THE TRACKS
          </Link>
        </div>
      </section>
    </main>
  );
}
