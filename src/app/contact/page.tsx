import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="relative min-h-screen overflow-hidden px-6 pb-28 pt-24 md:px-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-24 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-white/5 blur-[120px]" />
        <div className="absolute left-[14%] top-[20%] h-24 w-24 rounded-full border border-white/6" />
        <div className="absolute bottom-[18%] right-[14%] h-32 w-32 rounded-full border border-white/6" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-12 border-b border-white/10 pb-8">
          <p className="font-mono text-[10px] tracking-[0.35em] text-neutral-600">
            / CONTACT / REACH THE SOURCE
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-6xl">
            Contact
          </h1>

          <p className="mt-6 max-w-2xl text-sm leading-7 text-neutral-300 md:text-base">
            For music, visuals, collaborations, strange signals or lucid messages.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr]">
          <section className="space-y-4">
            <div className="border border-white/10 bg-white/[0.03] p-6">
              <p className="font-mono text-[10px] tracking-[0.24em] text-neutral-500">
                CHANNEL
              </p>
              <p className="mt-4 text-sm leading-7 text-neutral-300">
                Use the form to send a message. Keep it simple, direct, alive.
              </p>
            </div>

            <div className="border border-white/10 bg-white/[0.03] p-6">
              <p className="font-mono text-[10px] tracking-[0.24em] text-neutral-500">
                GOOD REASONS TO WRITE
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-neutral-400">
                <li>— musical collaboration</li>
                <li>— synchro / visuals / creations</li>
                <li>— project proposal</li>
                <li>— sincere message, even a bit strange</li>
              </ul>
            </div>

            <div className="relative border border-white/10 bg-white/[0.03] p-6">
              <p className="font-mono text-[10px] tracking-[0.24em] text-neutral-500">
                DISCLAIMER
              </p>
              <p className="mt-4 text-sm leading-7 text-neutral-400">
                Empty messages, vague requests, and lukewarm energy can be slowed down by ambient gravity.
              </p>

              <div className="absolute -bottom-3 right-4 border border-white/10 bg-black px-3 py-2 font-mono text-[10px] tracking-[0.18em] text-neutral-500 -rotate-2">
                PROBABLY READ
              </div>
            </div>
          </section>

          <section className="border border-white/10 bg-white/[0.03] p-6 md:p-8">
            <form
              action="https://formspree.io/f/xqeywvda"
              method="POST"
              className="space-y-6"
            >
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block font-mono text-[10px] tracking-[0.22em] text-neutral-500"
                >
                  NAME
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="w-full border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-white/30"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block font-mono text-[10px] tracking-[0.22em] text-neutral-500"
                >
                  EMAIL
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-white/30"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="mb-2 block font-mono text-[10px] tracking-[0.22em] text-neutral-500"
                >
                  SUBJECT
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  className="w-full border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-white/30"
                  placeholder="Collab, licensing, message..."
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block font-mono text-[10px] tracking-[0.22em] text-neutral-500"
                >
                  MESSAGE
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={7}
                  required
                  className="w-full resize-none border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-white/30"
                  placeholder="Write your message..."
                />
              </div>

              <input type="text" name="_gotcha" className="hidden" tabIndex={-1} autoComplete="off" />

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  className="border border-white/20 px-6 py-3 font-mono text-[11px] tracking-[0.28em] text-white transition hover:bg-white hover:text-black"
                >
                  SEND
                </button>

                <Link
                  href="/explore"
                  className="border border-white/10 px-6 py-3 font-mono text-[11px] tracking-[0.28em] text-white/70 transition hover:border-white/30 hover:text-white"
                >
                  BACK
                </Link>
              </div>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}