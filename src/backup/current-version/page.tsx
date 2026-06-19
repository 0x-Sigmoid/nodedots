import { Footer } from "@/components/footer";
import { Navigation } from "@/components/navigation";
import { ProductCard } from "@/components/product-card";
import { SectionHeader } from "@/components/section-header";

const products = [
  {
    code: "ND-01",
    name: "VennURL",
    description:
      "Trusted link previews and safer sharing for people who want to understand what they are opening before they commit.",
    status: "Concept in progress",
    signal: "For shared links, previews, and moments where trust has to be earned before the click.",
    href: "#",
  },
  {
    code: "ND-02",
    name: "Tabmeet",
    description:
      "Objective-based browsing and decision support for turning scattered tabs into a clearer path forward.",
    status: "Early product thinking",
    signal: "For research sessions where the browser needs a reason, not another pile of open tabs.",
    href: "#",
  },
  {
    code: "ND-03",
    name: "Accentta",
    description:
      "AI-powered accent and speech clarity coaching that helps speakers practice with patience, context, and confidence.",
    status: "Exploration",
    signal: "For speech practice that treats clarity as guidance, not correction.",
    href: "#",
  },
];

const notes = [
  {
    title: "Why a product should explain itself before asking for trust",
    type: "Essay draft",
  },
  {
    title: "Designing safer link previews without adding friction",
    type: "Build note",
  },
  {
    title: "Small interfaces for high-context decisions",
    type: "Product thinking",
  },
];

export default function Home() {
  return (
    <div id="top" className="min-h-screen bg-[#fffdf8] text-zinc-950">
      <Navigation />
      <main>
        <section className="relative isolate overflow-hidden border-b border-zinc-950">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(24,24,27,0.06)_1px,transparent_1px),linear-gradient(180deg,rgba(24,24,27,0.06)_1px,transparent_1px)] bg-[length:44px_44px]"
          />
          <div
            aria-hidden="true"
            className="absolute right-0 top-0 -z-10 h-full w-1/2 bg-[radial-gradient(circle,_rgba(11,92,255,0.22)_1px,_transparent_1px)] bg-[length:22px_22px] opacity-60"
          />
          <div
            aria-hidden="true"
            className="absolute left-0 top-32 -z-10 h-6 w-1/2 border-y border-zinc-950 bg-[#ffb000]"
          />
          <div className="mx-auto grid min-h-[calc(100vh-73px)] max-w-6xl items-center gap-12 px-5 py-16 sm:px-6 lg:grid-cols-[1.03fr_0.97fr] lg:px-8">
            <div className="max-w-3xl">
              <p className="inline-flex border border-zinc-950 bg-white px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-zinc-700 shadow-[4px_4px_0_#18181b]">
                Personal product profile / NodeDots
              </p>
              <h1 className="mt-8 max-w-4xl text-5xl font-semibold tracking-tight text-zinc-950 sm:text-6xl lg:text-7xl">
                Thoughtful web products for learning, clarity, and trust.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-zinc-700 sm:text-xl sm:leading-9">
                NodeDots is the identity behind small, useful products like
                VennURL, Tabmeet, and Accentta. Each one starts from the same
                belief: explain first, then invite action.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#products"
                  className="inline-flex min-h-12 items-center justify-center border border-zinc-950 bg-zinc-950 px-6 text-sm font-semibold text-white shadow-[5px_5px_0_#0b5cff] outline-none transition hover:-translate-x-0.5 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[#0b5cff] focus-visible:ring-offset-4"
                >
                  View Products
                </a>
                <a
                  href="#about"
                  className="inline-flex min-h-12 items-center justify-center border border-zinc-950 bg-white px-6 text-sm font-semibold text-zinc-950 outline-none transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[#f0f7ff] focus-visible:ring-2 focus-visible:ring-[#0b5cff] focus-visible:ring-offset-4"
                >
                  About NodeDots
                </a>
              </div>
              <dl className="mt-12 grid max-w-xl grid-cols-3 border border-zinc-950 bg-white text-center shadow-[7px_7px_0_rgba(24,24,27,0.92)]">
                {[
                  ["03", "Products"],
                  ["01", "Principle"],
                  ["Human", "Profile"],
                ].map(([value, label]) => (
                  <div
                    key={label}
                    className="border-r border-zinc-950 px-3 py-4 last:border-r-0"
                  >
                    <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                      {label}
                    </dt>
                    <dd className="mt-1 text-xl font-semibold text-zinc-950">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="relative mx-auto w-full max-w-[470px]">
              <div className="border border-zinc-950 bg-white p-5 shadow-[12px_12px_0_#18181b]">
                <div className="flex items-center justify-between border-b border-zinc-950 pb-4">
                  <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    Node map
                  </p>
                  <p className="font-mono text-xs text-zinc-500">v0.1</p>
                </div>
                <div className="relative mt-5 aspect-square border border-zinc-950 bg-[#fffdf8]">
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-[radial-gradient(circle,_rgba(24,24,27,0.35)_1px,_transparent_1px)] bg-[length:24px_24px] opacity-35"
                  />
                  <div className="absolute left-[15%] top-[17%] h-px w-[58%] rotate-[18deg] bg-zinc-950" />
                  <div className="absolute left-[23%] top-[22%] h-[52%] w-px -rotate-[14deg] bg-zinc-950" />
                  <div className="absolute bottom-[28%] left-[30%] h-px w-[47%] -rotate-[20deg] bg-zinc-950" />
                  <div className="absolute left-[12%] top-[13%] border border-zinc-950 bg-[#0b5cff] px-3 py-2 text-xs font-semibold text-white">
                    VennURL
                  </div>
                  <div className="absolute right-[10%] top-[29%] border border-zinc-950 bg-[#ffb000] px-3 py-2 text-xs font-semibold text-zinc-950">
                    Tabmeet
                  </div>
                  <div className="absolute bottom-[18%] left-[23%] border border-zinc-950 bg-[#00a878] px-3 py-2 text-xs font-semibold text-white">
                    Accentta
                  </div>
                  <div className="absolute bottom-[15%] right-[11%] border border-zinc-950 bg-white px-3 py-2 text-xs font-semibold text-zinc-950">
                    Explain first
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-[1fr_auto] gap-4">
                  <p className="text-sm leading-6 text-zinc-700">
                    A working identity for products that slow the moment down
                    just enough to make the next action clearer.
                  </p>
                  <span className="h-12 w-12 border border-zinc-950 bg-[#f0f7ff] shadow-[4px_4px_0_#0b5cff]" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="philosophy" className="px-5 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <SectionHeader
              eyebrow="Product philosophy"
              title="Explain first, then invite action."
              description="NodeDots favors products that make the next step feel understandable. The interface should reduce uncertainty before it asks for attention, trust, or commitment."
            />
            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {[
                [
                  "Clarity over noise",
                  "Useful context comes before volume, urgency, or visual clutter.",
                ],
                [
                  "Trust over growth tricks",
                  "Good products earn movement by being legible, honest, and calm.",
                ],
                [
                  "Practical UX over complexity",
                  "The best interaction is often the one that removes a decision burden.",
                ],
              ].map(([title, body]) => (
                <article
                  key={title}
                  className="border border-zinc-950 bg-white p-6 shadow-[6px_6px_0_rgba(24,24,27,0.9)]"
                >
                  <h3 className="text-lg font-semibold text-zinc-950">
                    {title}
                  </h3>
                  <p className="mt-4 text-base leading-7 text-zinc-700">
                    {body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="products"
          className="border-y border-zinc-950 bg-[#f0f7ff] px-5 py-24 sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-6xl">
            <SectionHeader
              eyebrow="Featured products"
              title="A product ledger, not a portfolio grid."
              description="VennURL, Tabmeet, and Accentta approach different problems, but they share the same operating idea: help people understand before they act."
            />
            <div className="mt-14 grid gap-6 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.name} {...product} />
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="px-5 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
            <div>
              <p className="font-mono text-sm font-semibold uppercase tracking-[0.22em] text-[#0b5cff]">
                About
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
                NodeDots is a human profile, not a company mask.
              </h2>
            </div>
            <div className="space-y-6 border-l border-zinc-950 pl-6 text-lg leading-9 text-zinc-700">
              <p>
                NodeDots is a place to shape product ideas with patience. It is
                personal, reflective, and quietly ambitious: a working profile
                for building web products that respect how people learn, decide,
                and trust.
              </p>
              <p>
                The work is intentionally small and useful. A NodeDots product
                should help someone understand what is happening before asking
                them to click, share, speak, decide, or commit.
              </p>
            </div>
          </div>
        </section>

        <section
          id="notes"
          className="bg-zinc-950 px-5 py-24 text-white sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <p className="font-mono text-sm font-semibold uppercase tracking-[0.22em] text-[#8fb3ff]">
                  Writing / Notes
                </p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Essays, build notes, and product thinking will live here.
                </h2>
              </div>
              <p className="max-w-sm text-sm leading-6 text-zinc-300">
                A polished space for future writing, with draft entries ready to
                become full notes when the work is ready.
              </p>
            </div>
            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {notes.map((note) => (
                <article
                  key={note.title}
                  className="border border-white/25 bg-white/[0.06] p-5 transition hover:bg-white/[0.1]"
                >
                  <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#8fb3ff]">
                    {note.type}
                  </p>
                  <h3 className="mt-5 text-xl font-semibold leading-7">
                    {note.title}
                  </h3>
                  <p className="mt-6 text-sm text-zinc-400">Coming soon</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
