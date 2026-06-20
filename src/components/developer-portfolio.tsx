import Image from "next/image";
import { notes } from "@/lib/notes";

const products = [
  {
    name: "VennURL",
    description: "Shows what is behind a link before you click it.",
    why: "It helps people make safer decisions around link trust and sharing.",
    status: "Live",
    cta: "Try it",
    href: "#",
  },
  {
    name: "Tabmeet",
    description:
      "Turns scattered open tabs into clear tradeoffs, risks, and recommendations.",
    why: "It helps you stop searching and start deciding.",
    status: "Live",
    cta: "Learn more",
    href: "#",
  },
  {
    name: "Coming soon",
    description: "A third tool is being shaped quietly.",
    why: "It will follow the same rule: explain first, then invite action.",
    status: "Coming Soon",
    cta: "Coming soon",
    href: "#",
  },
];

const latestThinking = [
  {
    text: "Good tools do not rush the decision. They make the next step easier to understand.",
  },
  {
    text: "Trust is a product feature when the interface explains what is happening.",
  },
  {
    text: "AI should reduce uncertainty, not decorate it.",
  },
];

const navItems = [
  { label: "Work", href: "#work" },
  { label: "Notes", href: "#notes" },
  { label: "Contact", href: "#contact" },
  { label: "@nodedots", href: "https://x.com/nodedots", external: true },
];

export function DeveloperPortfolio() {
  return (
    <main className="min-h-svh bg-[#f8f8f8] text-[#1a1a1a]">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
        <a
          href="#top"
          className="flex items-center gap-3 font-mono text-sm font-semibold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-[#3b5bdb] focus-visible:ring-offset-4"
          aria-label="@nodedots home"
        >
          <span
            aria-hidden="true"
            className="relative grid size-8 place-items-center rounded-full border border-[#d4d4d4] bg-white"
          >
            <span className="size-2 rounded-full bg-[#3b5bdb]" />
            <span className="absolute right-2 top-2 size-1 rounded-full bg-[#1a1a1a]" />
            <span className="absolute bottom-2 left-2 size-1 rounded-full bg-[#1a1a1a]" />
          </span>
          @nodedots
        </a>
        <nav
          aria-label="Primary navigation"
          className="flex flex-wrap justify-end gap-x-4 gap-y-2 text-sm text-neutral-600"
        >
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              className="outline-none transition hover:text-[#1a1a1a] focus-visible:ring-2 focus-visible:ring-[#3b5bdb] focus-visible:ring-offset-4"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      <section
        id="top"
        aria-labelledby="hero-title"
        className="mx-auto grid min-h-[78svh] w-full max-w-6xl place-items-center px-5 py-20 sm:px-8"
      >
        <div className="relative w-full max-w-3xl">
          <div
            aria-hidden="true"
            className="absolute -right-4 -top-8 hidden h-40 w-40 rounded-full border border-[#e5e5e5] bg-[radial-gradient(circle,_#d4d4d4_1px,_transparent_1px)] bg-[length:18px_18px] sm:block"
          />
          <p className="font-mono text-sm font-medium text-[#3b5bdb]">
            @nodedots
          </p>
          <h1
            id="hero-title"
            className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl"
          >
            I build simple tools for trust, clarity, and AI decisions.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-neutral-600">
            Explain first, then invite action.
          </p>
        </div>
      </section>

      <section
        aria-labelledby="about-title"
        className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8"
      >
        <div className="grid gap-8 border-t border-[#e5e5e5] pt-12 md:grid-cols-[0.42fr_0.58fr]">
          <div>
            <h2 id="about-title" className="text-2xl font-semibold">
              About
            </h2>
            <Image
              src="/nodedots.png"
              alt="NodeDots abstract avatar"
              width={120}
              height={120}
              className="mt-6 size-24 rounded-2xl border border-[#e5e5e5] bg-white object-cover sm:size-28"
            />
          </div>
          <div className="space-y-5 text-lg leading-8 text-neutral-700">
            <p>
              @nodedots builds small tools around trust, clarity, and AI.
            </p>
            <p>
              The work starts with a simple question: what does someone need to
              understand before they act?
            </p>
            <p>
              Products are kept narrow on purpose, with clear copy, visible
              tradeoffs, and fewer distractions.
            </p>
            <p>The handle stays separate so the work stays in front.</p>
          </div>
        </div>
      </section>

      <section
        id="work"
        aria-labelledby="work-title"
        className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8"
      >
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="work-title" className="text-2xl font-semibold">
              Work
            </h2>
            <p className="mt-2 text-neutral-600">
              Three tools, each built around a clearer decision.
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {products.map((product) => (
            <article
              key={product.name}
              className="flex min-h-[280px] flex-col rounded-2xl border border-[#e5e5e5] bg-white p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-2xl font-semibold tracking-tight">
                  {product.name}
                </h3>
                <span className="rounded-full border border-[#e5e5e5] px-2.5 py-1 text-xs font-medium text-neutral-600">
                  {product.status}
                </span>
              </div>
              <p className="mt-5 text-base leading-7 text-neutral-700">
                {product.description}
              </p>
              <p className="mt-4 text-base leading-7 text-neutral-600">
                {product.why}
              </p>
              <a
                href={product.href}
                className={`mt-auto inline-flex min-h-11 items-center justify-center rounded-full px-4 text-sm font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-[#3b5bdb] focus-visible:ring-offset-4 ${
                  product.status === "Coming Soon"
                    ? "pointer-events-none border border-[#e5e5e5] text-neutral-500"
                    : "bg-[#3b5bdb] text-white hover:bg-[#2f49af]"
                }`}
                aria-disabled={product.status === "Coming Soon"}
              >
                {product.cta}
              </a>
            </article>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="thinking-title"
        className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8"
      >
        <div className="rounded-3xl border border-[#e5e5e5] bg-white p-5 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="thinking-title" className="text-2xl font-semibold">
                Latest thinking
              </h2>
              <p className="mt-2 text-neutral-600">
                Short notes from @nodedots, kept plain.
              </p>
            </div>
            <a
              href="https://x.com/nodedots"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#e5e5e5] px-4 text-sm font-semibold outline-none transition hover:border-[#3b5bdb] hover:text-[#3b5bdb] focus-visible:ring-2 focus-visible:ring-[#3b5bdb] focus-visible:ring-offset-4"
            >
              Follow @nodedots
            </a>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {latestThinking.map((post) => (
              <p
                key={post.text}
                className="rounded-2xl border border-[#e5e5e5] bg-[#f8f8f8] p-4 text-sm leading-6 text-neutral-700"
              >
                {post.text}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section
        id="notes"
        aria-labelledby="notes-title"
        className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8"
      >
        <div className="mb-8">
          <h2 id="notes-title" className="text-2xl font-semibold">
            Notes from the workbench.
          </h2>
          <p className="mt-2 max-w-2xl text-neutral-600">
            Thinking out loud about trust, clarity, and decisions.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {notes.map((note) => (
            <article
              key={note.title}
              className="rounded-2xl border border-[#e5e5e5] bg-white p-5"
            >
              <p className="font-mono text-xs text-neutral-500">{note.date}</p>
              <h3 className="mt-4 text-xl font-semibold tracking-tight">
                {note.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-neutral-600">
                {note.teaser}
              </p>
              <a
                href={`/notes/${note.slug}`}
                className="mt-5 inline-flex text-sm font-semibold text-[#3b5bdb] outline-none hover:text-[#2f49af] focus-visible:ring-2 focus-visible:ring-[#3b5bdb] focus-visible:ring-offset-4"
              >
                Read more
              </a>
            </article>
          ))}
        </div>
      </section>

      <section
        id="contact"
        aria-labelledby="contact-title"
        className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8"
      >
        <div className="rounded-3xl border border-[#e5e5e5] bg-white p-6 text-center sm:p-10">
          <h2 id="contact-title" className="text-3xl font-semibold">
            Work with me
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-neutral-600">
            Send a short note if you need a clear product interface, a trust
            layer, or a careful second pass on an idea.
          </p>
          <a
            href="mailto:hello@nodedots.example?subject=Project%20inquiry%20for%20%40nodedots"
            className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-[#3b5bdb] px-6 text-sm font-semibold text-white outline-none transition hover:bg-[#2f49af] focus-visible:ring-2 focus-visible:ring-[#3b5bdb] focus-visible:ring-offset-4"
          >
            Email @nodedots
          </a>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
            <a
              href="https://calendly.com/nodedots/intro-call"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-600 outline-none hover:text-[#3b5bdb] focus-visible:ring-2 focus-visible:ring-[#3b5bdb] focus-visible:ring-offset-4"
            >
              Book Call
            </a>
            <a
              href="https://t.me/nodedots"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-600 outline-none hover:text-[#3b5bdb] focus-visible:ring-2 focus-visible:ring-[#3b5bdb] focus-visible:ring-offset-4"
            >
              Telegram
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
