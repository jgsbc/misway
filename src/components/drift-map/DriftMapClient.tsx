import Link from "next/link";

export default function DriftMapClient() {
  return (
    <main className="light-theme light-page-bg min-h-screen px-6 pb-36 pt-24 md:px-10">
      <section className="mx-auto flex min-h-[calc(100vh-12rem)] max-w-4xl flex-col justify-center">
        <p className="light-text-tertiary font-mono text-[10px] uppercase tracking-[0.35em]">
          Experimental / Drift Map Lab
        </p>

        <h1 className="light-text-primary mt-6 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
          A map is not open yet.
        </h1>

        <div className="light-text-secondary mt-7 max-w-2xl space-y-3 text-sm leading-7 md:text-base">
          <p>This will become a playable MISWΛY territory.</p>
          <p>Tracks will become places: rooms, roads, signals, wrong turns.</p>
          <p>For now, the lab is only a quiet marker. No engine. No vehicle. No sound.</p>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/drift"
            className="light-text-primary light-border hover:light-card-hover inline-flex min-h-[46px] items-center justify-center border px-5 py-3 font-mono text-[11px] uppercase tracking-[0.24em] transition"
          >
            Back to Drift
          </Link>

          <Link
            href="/tracks"
            className="light-text-secondary light-border hover:light-text-primary inline-flex min-h-[46px] items-center justify-center border px-5 py-3 font-mono text-[11px] uppercase tracking-[0.24em] transition"
          >
            Open Tracks
          </Link>
        </div>
      </section>
    </main>
  );
}
