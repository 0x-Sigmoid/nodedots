"use client";

import Image from "next/image";
import { Code2, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { useMemo, useState } from "react";

type Product = {
  name: string;
  short: string;
  description: string;
  position: string;
  glow: string;
};

const products: Product[] = [
  {
    name: "VennURL",
    short: "trusted link previews and safer sharing.",
    description:
      "VennURL slows down the moment before a click, giving links enough context to feel understood and safer to share.",
    position: "left-[6%] top-[24%] sm:left-[10%] sm:top-[22%]",
    glow: "from-cyan-300 to-blue-500",
  },
  {
    name: "Tabmeet",
    short: "clearer browsing decisions.",
    description:
      "Tabmeet turns scattered browsing into objective-led decisions, helping each open tab earn its place.",
    position: "right-[5%] top-[30%] sm:right-[8%] sm:top-[25%]",
    glow: "from-amber-200 to-orange-400",
  },
  {
    name: "Accentta",
    short: "speech clarity and accent coaching.",
    description:
      "Accentta uses AI coaching to support speech clarity with patience, context, and practical progress.",
    position: "bottom-[9%] left-1/2 -translate-x-1/2 sm:bottom-[11%]",
    glow: "from-emerald-200 to-teal-500",
  },
];

const socialLinks = [
  { label: "X", href: "https://x.com/nodedots", icon: X },
  {
    label: "Discord",
    href: "https://discord.com/users/nodedots",
    icon: MessageCircle,
  },
  { label: "GitHub", href: "https://github.com/nodedots", icon: Code2 },
  { label: "Telegram", href: "https://t.me/nodedots", icon: Send },
];

export function NodeDotsRealm() {
  const [activeProduct, setActiveProduct] = useState(products[0]);

  const activeIndex = useMemo(
    () => products.findIndex((product) => product.name === activeProduct.name),
    [activeProduct],
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030712] text-white">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_36%,rgba(59,130,246,0.28),transparent_28%),radial-gradient(circle_at_20%_20%,rgba(45,212,191,0.18),transparent_26%),radial-gradient(circle_at_80%_72%,rgba(251,191,36,0.14),transparent_24%),linear-gradient(180deg,#050816_0%,#070b1d_48%,#030712_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-35 [background-image:radial-gradient(circle,rgba(255,255,255,0.42)_1px,transparent_1px)] [background-size:34px_34px]"
      />
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 h-[72vmin] w-[72vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
      />
      <div
        aria-hidden="true"
        className="realm-orbit absolute left-1/2 top-1/2 h-[88vmin] w-[88vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-cyan-200/15"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-8 top-8 h-px bg-gradient-to-r from-transparent via-cyan-200/40 to-transparent"
      />

      <section
        aria-labelledby="realm-title"
        className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-10"
      >
        <header className="flex items-center justify-between gap-4">
          <a
            href="#realm-title"
            className="group inline-flex items-center gap-3 rounded-full border border-white/12 bg-white/[0.06] px-3 py-2 text-sm font-semibold text-white/88 shadow-[0_0_40px_rgba(125,211,252,0.08)] backdrop-blur-xl outline-none transition hover:border-white/25 hover:bg-white/[0.09] focus-visible:ring-2 focus-visible:ring-cyan-200"
            aria-label="NodeDots home"
          >
            <span className="relative grid size-8 place-items-center rounded-full bg-cyan-200 text-slate-950">
              <span className="size-2 rounded-full bg-slate-950" />
              <span className="absolute -right-0.5 top-1 size-1.5 rounded-full bg-amber-300" />
              <span className="absolute bottom-0 left-1 size-1.5 rounded-full bg-emerald-300" />
            </span>
            NodeDots
          </a>
          <nav aria-label="Social links" className="flex items-center gap-2">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="grid size-10 place-items-center rounded-full border border-white/12 bg-white/[0.06] text-white/78 backdrop-blur-xl outline-none transition hover:border-cyan-200/60 hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-200"
                aria-label={`Open NodeDots on ${link.label}`}
              >
                <link.icon className="size-4" aria-hidden="true" />
              </a>
            ))}
          </nav>
        </header>

        <div className="relative grid flex-1 place-items-center py-8">
          <div className="relative h-[680px] w-full max-w-5xl sm:h-[720px]">
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full text-cyan-100/16"
              viewBox="0 0 1000 720"
              aria-hidden="true"
            >
              <path
                d="M190 210 C330 280 405 320 500 360 C612 300 705 260 815 235"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
              <path
                d="M500 360 C492 450 490 530 500 620"
                fill="none"
                stroke="currentColor"
                strokeDasharray="6 12"
                strokeWidth="1"
              />
            </svg>

            <article className="absolute left-1/2 top-1/2 w-[min(92vw,520px)] -translate-x-1/2 -translate-y-1/2 rounded-[2rem] border border-white/14 bg-white/[0.075] p-5 shadow-[0_30px_120px_rgba(6,182,212,0.16)] backdrop-blur-2xl sm:p-7">
              <div className="absolute inset-0 -z-10 rounded-[2rem] bg-[radial-gradient(circle_at_50%_0%,rgba(165,243,252,0.16),transparent_48%)]" />
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-cyan-300/30 blur-2xl" />
                  <Image
                    src="/images/avatars/nodedots.png"
                    alt="NodeDots profile avatar"
                    width={132}
                    height={132}
                    priority
                    className="relative size-28 rounded-full border border-cyan-100/30 object-cover shadow-[0_0_60px_rgba(125,211,252,0.22)] sm:size-32"
                  />
                </div>
                <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-cyan-100/15 bg-cyan-100/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100/78">
                  <Sparkles className="size-3.5" aria-hidden="true" />
                  Human/product persona
                </p>
                <h1
                  id="realm-title"
                  className="mt-4 text-5xl font-semibold tracking-tight text-white sm:text-7xl"
                >
                  NodeDots
                </h1>
                <p className="mt-4 max-w-xl text-xl font-medium leading-8 text-white/88 sm:text-2xl sm:leading-9">
                  Thoughtful web products for learning, clarity, and trust.
                </p>
                <p className="mt-5 max-w-lg text-base leading-7 text-white/62 sm:text-lg sm:leading-8">
                  I build small, useful web products that explain first, then
                  invite action.
                </p>
              </div>
            </article>

            {products.map((product, index) => {
              const selected = activeProduct.name === product.name;

              return (
                <button
                  key={product.name}
                  type="button"
                  onClick={() => setActiveProduct(product)}
                  onMouseEnter={() => setActiveProduct(product)}
                  className={`realm-float absolute ${product.position} w-[168px] rounded-3xl border p-3 text-left outline-none backdrop-blur-xl transition duration-300 sm:w-[190px] ${
                    selected
                      ? "scale-105 border-cyan-100/50 bg-white/[0.15] shadow-[0_0_60px_rgba(125,211,252,0.18)]"
                      : "border-white/12 bg-white/[0.07] hover:border-white/30 hover:bg-white/[0.11]"
                  }`}
                  style={{ animationDelay: `${index * 0.8}s` }}
                  aria-pressed={selected}
                  aria-label={`Show ${product.name}: ${product.short}`}
                >
                  <span
                    aria-hidden="true"
                    className={`mb-3 block size-8 rounded-full bg-gradient-to-br ${product.glow} shadow-[0_0_30px_rgba(125,211,252,0.25)]`}
                  />
                  <span className="block text-base font-semibold text-white">
                    {product.name}
                  </span>
                  <span className="mt-1 block text-sm leading-5 text-white/60">
                    {product.short}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <aside
          className="mx-auto mb-4 grid w-full max-w-4xl gap-4 rounded-[1.5rem] border border-white/12 bg-white/[0.07] p-4 shadow-[0_20px_90px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:grid-cols-[auto_1fr] sm:items-center sm:p-5"
          aria-live="polite"
        >
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full border border-cyan-100/20 bg-cyan-100/10 font-mono text-sm text-cyan-100">
              0{activeIndex + 1}
            </span>
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-white/42">
                Active realm
              </p>
              <h2 className="text-2xl font-semibold text-white">
                {activeProduct.name}
              </h2>
            </div>
          </div>
          <p className="text-base leading-7 text-white/66">
            {activeProduct.description}
          </p>
        </aside>
      </section>
    </main>
  );
}
