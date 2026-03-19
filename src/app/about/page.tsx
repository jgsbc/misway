import Link from "next/link";
import Image from "next/image";
import { featuredTracks, tracks } from "@/lib/tracks";
import { withBasePath } from "@/lib/basePath";

const fragments = [
  {
    title: "MISWΛY IS NOT",
    text: "not exactly a brand, not exactly a diary, not exactly a machine. It is closer to a zone where tension, softness and residue keep changing masks.",
    rotate: "-rotate-1",
    shift: "md:ml-0",
  },
  {
    title: "WORKING THEORY",
    text: "If a frequency got tired, stayed awake too long, looked at the ceiling, then built itself a body out of light and dust, it might sound like this.",
    rotate: "rotate-1",
    shift: "md:ml-12",
  },
  {
    title: "KNOWN SIDE EFFECTS",
    text: "slow drift, clean insomnia, emotional static, mild architectural obsession, occasional tenderness, recurring lambda.",
    rotate: "-rotate-2",
    shift: "md:ml-4",
  },
];

const oddNotes = [
  "Some tracks arrive like blueprints. Others arrive like weather.",
  "The lambda is not a logo. It behaves more like a recurring fault in reality.",
  "No guarantee is made that the visitor will remain linear.",
  "This archive prefers atmosphere over explanation.",
];

const families = [
  {
    name: "ORIGINE",
    desc: "organic, intimate, ritual, fogged edges",
  },
  {
    name: "STRUCTURE",
    desc: "concrete, geometry, silence, pressure",
  },
  {
    name: "SIGNAL",
    desc: "digital, nervous light, systems, loops, charge",
  },
];

export default function AboutPage() {
  return (
    <main className="relative min-h-screen overflow-hidden px-6 pb-28 pt-24 md:px-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0">
          <Image
            src={withBasePath("/images/about/about-bg.jpg")}
            alt="MISWΛY background"
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-black/70" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.3)_45%,rgba(0,0,0,0.82)_100%)]" />
        </div>

        <div className="absolute left-1/2 top-28 h-[440px] w-[440px] -translate-x-1/2 rounded-full bg-white/5 blur-[130px]" />
        <div className="absolute left-[10%] top-[18%] h-24 w-24 rounded-full border border-white/6" />
        <div className="absolute bottom-[16%] right-[12%] h-36 w-36 rounded-full border border-white/6" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <section className="mb-16">
          <p className="font-mono text-[10px] tracking-[0.35em] text-neutral-600">
            / INFO / PROBABLY
          </p>

          <div className="mt-6 grid gap-8 md:grid-cols-[1.05fr_0.95fr] md:items-start">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-white md:text-6xl">
                MISWΛY
              </h1>

              <p className="mt-6 max-w-2xl text-sm leading-7 text-neutral-300 md:text-base">
                MISWΛY is an audio-visual territory built out of signal, drift,
                nocturnal work, memory fragments, elegant pressure and the occasional
                beautiful malfunction.
              </p>

              <p className="mt-5 max-w-xl text-sm leading-7 text-neutral-400">
                It is not here to explain itself too quickly. It is here to create a
                climate.
              </p>
            </div>

            <div className="grid gap-5">
              <div className="relative overflow-hidden border border-white/10 bg-white/[0.03]">
                <div className="relative aspect-[4/3]">
                  <Image
                    src={withBasePath("/images/about/misway-portrait.jpg")}
                    alt="Portrait of JG"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                </div>

                <div className="p-5">
                  <p className="font-mono text-[10px] tracking-[0.24em] text-neutral-500">
                    SOURCE BODY
                  </p>
                  <p className="mt-3 text-sm leading-6 text-neutral-400">
                    Not a brand mascot. Not a neutral operator. A living source with
                    memory, fracture, humour and work residue.
                  </p>
                </div>

                <div className="absolute -right-3 -top-3 border border-white/10 bg-black px-3 py-2 font-mono text-[10px] tracking-[0.18em] text-neutral-500 rotate-2">
                  PROBABLY HUMAN
                </div>
              </div>

              <div className="relative border border-white/10 bg-white/[0.03] p-6">
                <p className="font-mono text-[10px] tracking-[0.24em] text-neutral-500">
                  FIELD MARK
                </p>

                <div className="mt-6 flex items-center justify-center border border-white/10 bg-black/20 p-8">
                  <svg viewBox="0 0 200 200" className="h-32 w-32">
                    <path
                      d="M55 150 L100 48 L145 150 M38 150 H72 M128 150 H162"
                      fill="none"
                      stroke="rgba(255,255,255,0.92)"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <p className="mt-4 text-sm leading-6 text-neutral-400">
                  Λ as threshold, frequency, fault line, directional impulse, recurring
                  apparition.
                </p>

                <div className="absolute -bottom-3 right-4 border border-white/10 bg-black px-3 py-2 font-mono text-[10px] tracking-[0.18em] text-neutral-500 -rotate-2">
                  NOT A SAFE SYMBOL
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16 space-y-5">
          {fragments.map((fragment) => (
            <div
              key={fragment.title}
              className={`max-w-3xl border border-white/10 bg-white/[0.03] p-5 ${fragment.rotate} ${fragment.shift}`}
            >
              <p className="font-mono text-[10px] tracking-[0.24em] text-neutral-500">
                {fragment.title}
              </p>
              <p className="mt-4 text-sm leading-7 text-neutral-300">
                {fragment.text}
              </p>
            </div>
          ))}
        </section>

        <section className="mb-16 grid gap-8 md:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-4">
            <div className="border border-white/10 bg-white/[0.03] p-6">
              <p className="font-mono text-[10px] tracking-[0.24em] text-neutral-500">
                VISUAL FAMILIES
              </p>

              <div className="mt-5 space-y-3">
                {families.map((family, index) => (
                  <div
                    key={family.name}
                    className={`border border-white/10 p-4 ${
                      index === 1 ? "md:ml-8" : index === 2 ? "md:ml-3" : ""
                    }`}
                  >
                    <p className="font-mono text-[10px] tracking-[0.22em] text-neutral-500">
                      {family.name}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-neutral-400">
                      {family.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-white/10 bg-white/[0.03] p-6">
              <p className="font-mono text-[10px] tracking-[0.24em] text-neutral-500">
                TIMELINE CONDITION
              </p>
              <p className="mt-4 text-sm leading-7 text-neutral-300">
                {tracks.length} visible nodes. Some ancient, some recent, some better
                behaved than others.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {featuredTracks.map((track) => (
                  <Link
                    key={track.slug}
                    href={`/tracks/${track.slug}`}
                    className="border border-white/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-400 transition hover:border-white/30 hover:text-white"
                  >
                    {track.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="border border-white/10 bg-white/[0.03] p-6">
              <p className="font-mono text-[10px] tracking-[0.24em] text-neutral-500">
                UNRELIABLE NOTES
              </p>

              <div className="mt-5 space-y-3">
                {oddNotes.map((note, index) => (
                  <div
                    key={note}
                    className={`border border-white/10 p-4 text-sm leading-6 text-neutral-300 ${
                      index % 2 === 1 ? "md:ml-8" : ""
                    }`}
                  >
                    {note}
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-white/10 bg-white/[0.03] p-6">
              <p className="font-mono text-[10px] tracking-[0.24em] text-neutral-500">
                NAVIGATION
              </p>

              <div className="mt-5 flex flex-col gap-3">
                <Link
                  href="/explore"
                  className="border border-white/10 px-4 py-3 font-mono text-[10px] tracking-[0.22em] text-neutral-300 transition hover:border-white/30 hover:text-white"
                >
                  ENTER EXPLORE
                </Link>
                <Link
                  href="/tracks"
                  className="border border-white/10 px-4 py-3 font-mono text-[10px] tracking-[0.22em] text-neutral-300 transition hover:border-white/30 hover:text-white"
                >
                  OPEN TIMELINE
                </Link>
                <Link
                  href="/contact"
                  className="border border-white/10 px-4 py-3 font-mono text-[10px] tracking-[0.22em] text-neutral-300 transition hover:border-white/30 hover:text-white"
                >
                  REACH THE SOURCE
                </Link>
              </div>
            </div>

            <div className="relative border border-white/10 bg-white/[0.03] p-6">
              <p className="font-mono text-[10px] tracking-[0.24em] text-neutral-500">
                OFFICIAL DISCLAIMER
              </p>
              <p className="mt-4 text-sm leading-7 text-neutral-400">
                No promise is made that this project will stay still, symmetrical, or
                emotionally reasonable.
              </p>

              <div className="absolute -bottom-3 right-4 border border-white/10 bg-black px-3 py-2 font-mono text-[10px] tracking-[0.18em] text-neutral-500 -rotate-2">
                STILL UNDER DRIFT
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}