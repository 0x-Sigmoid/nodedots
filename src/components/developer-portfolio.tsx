"use client";

import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Code2,
  Coffee,
  ExternalLink,
  MessageCircle,
  Send,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";

declare global {
  interface Window {
    twttr?: {
      widgets?: {
        load: (element?: HTMLElement | null) => void;
      };
    };
    Calendly?: {
      initInlineWidget: (options: {
        url: string;
        parentElement: HTMLElement | null;
        prefill?: Record<string, unknown>;
        utm?: Record<string, string>;
      }) => void;
    };
  }
}

const CALENDLY_URL = "https://calendly.com/nodedots/intro-call";
const BUY_ME_A_COFFEE_URL = "https://www.buymeacoffee.com/nodedots";

const products = [
  {
    code: "ND-01",
    name: "VennURL",
    description: "Trusted link previews and safer sharing.",
    detail:
      "A product idea for helping people understand what they are opening before they click, forward, or trust a shared link.",
    status: "Concept in progress",
  },
  {
    code: "ND-02",
    name: "Tabmeet",
    description: "Clearer browsing decisions.",
    detail:
      "A decision-support layer for objective-based browsing, built around turning scattered tabs into a clearer next step.",
    status: "Early product thinking",
  },
  {
    code: "ND-03",
    name: "Accentta",
    description: "Speech clarity and accent coaching.",
    detail:
      "An AI-powered coaching concept for helping speakers practice clarity with patience, context, and confidence.",
    status: "Exploration",
  },
];

const notes = [
  {
    code: "NOTE-01",
    title: "Why products should explain before they ask",
    type: "Product thinking",
    excerpt:
      "A short note on earning trust through context, clarity, and less pressure.",
    body: [
      "A useful interface should not rush people toward action before they understand what is happening.",
      "NodeDots products start with context: what this does, why it matters, and what the person can safely do next.",
      "That does not mean making every product slow. It means making the decision feel clean enough that action becomes natural.",
    ],
  },
  {
    code: "NOTE-02",
    title: "Small tools, high-trust moments",
    type: "Build note",
    excerpt:
      "How VennURL, Tabmeet, and Accentta each begin from a moment of uncertainty.",
    body: [
      "The products in the NodeDots orbit are intentionally small, but each sits near a trust moment.",
      "A link preview, a browser decision, or a speech-practice session all benefit from patient guidance.",
      "The goal is not to overwhelm the person with intelligence. The goal is to make the next step easier to understand.",
    ],
  },
  {
    code: "NOTE-03",
    title: "Designing for practical clarity",
    type: "Interface note",
    excerpt:
      "A working principle for copy, layout, and product decisions.",
    body: [
      "Practical clarity is the difference between a polished interface and one that actually helps.",
      "It shows up in plain copy, fewer competing actions, honest status labels, and layouts that make comparison easy.",
      "For NodeDots, clarity is not decoration. It is the product behavior.",
    ],
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

export function DeveloperPortfolio() {
  const [portfolioOpen, setPortfolioOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [projectFitOpen, setProjectFitOpen] = useState(false);
  const titleId = useId();
  const notesTitleId = useId();
  const bookingTitleId = useId();
  const projectFitTitleId = useId();

  useEffect(() => {
    if (!portfolioOpen && !notesOpen && !bookingOpen && !projectFitOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPortfolioOpen(false);
        setNotesOpen(false);
        setBookingOpen(false);
        setProjectFitOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [bookingOpen, portfolioOpen, notesOpen, projectFitOpen]);

  return (
    <main className="relative min-h-svh overflow-x-hidden bg-[#fffdf8] text-zinc-950">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(24,24,27,0.06)_1px,transparent_1px),linear-gradient(180deg,rgba(24,24,27,0.06)_1px,transparent_1px)] bg-[length:44px_44px]"
      />
      <div
        aria-hidden="true"
        className="absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle,_rgba(11,92,255,0.22)_1px,_transparent_1px)] bg-[length:22px_22px] opacity-60"
      />
      <div
        aria-hidden="true"
        className="absolute left-0 top-28 h-6 w-1/2 border-y border-zinc-950 bg-[#ffb000]"
      />

      <section
        aria-labelledby="portfolio-title"
        className="relative z-10 mx-auto grid min-h-svh w-full max-w-6xl gap-8 px-4 py-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8"
      >
        <div className="flex flex-col justify-between gap-8 lg:min-h-[calc(100vh-40px)]">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <a
              href="#portfolio-title"
              className="flex items-center gap-3 outline-none focus-visible:ring-2 focus-visible:ring-[#0b5cff] focus-visible:ring-offset-4"
              aria-label="NodeDots home"
            >
              <span className="relative flex h-9 w-9 items-center justify-center border border-zinc-950 bg-white shadow-[4px_4px_0_#18181b]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#0b5cff]" />
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#ffb000]" />
                <span className="absolute bottom-2 left-2 h-1.5 w-1.5 rounded-full bg-[#00a878]" />
              </span>
              <span className="text-base font-semibold tracking-tight">
                NodeDots
              </span>
            </a>
            <nav aria-label="Social links" className="flex items-center gap-1.5 sm:gap-2">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid size-9 place-items-center border border-zinc-950 bg-white text-zinc-950 shadow-[3px_3px_0_#18181b] outline-none transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[#f0f7ff] focus-visible:ring-2 focus-visible:ring-[#0b5cff] focus-visible:ring-offset-4 sm:size-10"
                  aria-label={`Open NodeDots on ${link.label}`}
                >
                  <link.icon className="size-4" aria-hidden="true" />
                </a>
              ))}
            </nav>
          </header>

          <div className="max-w-3xl pt-4 sm:pt-6 lg:pt-0">
            <p className="inline-flex max-w-full border border-zinc-950 bg-white px-3 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-700 shadow-[4px_4px_0_#18181b] sm:px-4 sm:text-xs sm:tracking-[0.2em]">
              Developer portfolio / Product builder
            </p>
            <h1
              id="portfolio-title"
              className="mt-7 max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl lg:text-7xl"
            >
              NodeDots builds products that explain first.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-700 sm:text-xl sm:leading-9">
              Thoughtful web products for learning, clarity, and trust. I build
              small, useful interfaces that help people understand before they
              act.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setPortfolioOpen(true)}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 border border-zinc-950 bg-zinc-950 px-6 text-sm font-semibold text-white shadow-[5px_5px_0_#0b5cff] outline-none transition hover:-translate-x-0.5 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[#0b5cff] focus-visible:ring-offset-4 sm:w-auto"
              >
                Portfolio
                <ExternalLink className="size-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setNotesOpen(true)}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 border border-zinc-950 bg-white px-6 text-sm font-semibold text-zinc-950 shadow-[5px_5px_0_#ffb000] outline-none transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[#fff8df] focus-visible:ring-2 focus-visible:ring-[#0b5cff] focus-visible:ring-offset-4 sm:w-auto"
              >
                Notes
                <BookOpen className="size-4" aria-hidden="true" />
              </button>
              <a
                href="mailto:hello@nodedots.example"
                className="inline-flex min-h-12 w-full items-center justify-center border border-zinc-950 bg-white px-6 text-sm font-semibold text-zinc-950 outline-none transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[#f0f7ff] focus-visible:ring-2 focus-visible:ring-[#0b5cff] focus-visible:ring-offset-4 sm:w-auto"
              >
                Email NodeDots
              </a>
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setBookingOpen(true)}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 border border-zinc-950 bg-[#f0f7ff] px-5 text-sm font-semibold text-zinc-950 shadow-[4px_4px_0_#0b5cff] outline-none transition hover:-translate-x-0.5 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[#0b5cff] focus-visible:ring-offset-4 sm:w-auto"
              >
                Book Call
                <CalendarDays className="size-4" aria-hidden="true" />
              </button>
              <a
                href={BUY_ME_A_COFFEE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 border border-zinc-950 bg-[#fff8df] px-5 text-sm font-semibold text-zinc-950 shadow-[4px_4px_0_#ffb000] outline-none transition hover:-translate-x-0.5 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[#0b5cff] focus-visible:ring-offset-4 sm:w-auto"
              >
                Buy Coffee
                <Coffee className="size-4" aria-hidden="true" />
              </a>
              <button
                type="button"
                onClick={() => setProjectFitOpen(true)}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 border border-zinc-950 bg-white px-5 text-sm font-semibold text-zinc-950 outline-none transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[#f7fbf7] focus-visible:ring-2 focus-visible:ring-[#0b5cff] focus-visible:ring-offset-4 sm:w-auto"
              >
                Project Fit
                <CheckCircle2 className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <dl className="grid max-w-xl grid-cols-3 border border-zinc-950 bg-white text-center shadow-[7px_7px_0_rgba(24,24,27,0.92)]">
            {[
              ["03", "Products"],
              ["03", "Notes"],
              ["Human", "Profile"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="border-r border-zinc-950 px-2 py-3 last:border-r-0 sm:px-3 sm:py-4"
              >
                <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500 sm:text-xs sm:tracking-[0.16em]">
                  {label}
                </dt>
                <dd className="mt-1 text-base font-semibold text-zinc-950 sm:text-xl">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <aside className="relative mx-auto w-full max-w-[500px] pb-5 lg:pb-0">
          <div className="border border-zinc-950 bg-white p-4 shadow-[8px_8px_0_#18181b] sm:p-5 sm:shadow-[12px_12px_0_#18181b]">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-950 pb-4">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Developer file
              </p>
              <p className="font-mono text-xs text-zinc-500">NodeDots / 01</p>
            </div>
            <div className="mt-5 grid gap-5 sm:grid-cols-[150px_1fr]">
              <Image
                src="/images/avatars/nodedots.png"
                alt="NodeDots developer portrait"
                width={150}
                height={150}
                priority
                className="aspect-square w-[128px] border border-zinc-950 object-cover sm:w-[150px]"
              />
              <div>
                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  Developer. Product thinker. Interface builder.
                </h2>
                <p className="mt-4 text-base leading-7 text-zinc-700">
                  NodeDots is a personal profile for building web products with
                  careful copy, practical UX, and trust-first interactions.
                </p>
              </div>
            </div>
            <div className="mt-6 border border-zinc-950 bg-[#f0f7ff] p-4">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Operating principle
              </p>
              <p className="mt-3 text-lg font-semibold leading-7 sm:text-xl sm:leading-8">
                Explain first, then invite action.
              </p>
            </div>
          </div>
        </aside>

        <div className="lg:col-span-2">
          <LiveXPanel />
        </div>
      </section>

      {portfolioOpen && (
        <PortfolioModal
          titleId={titleId}
          onClose={() => setPortfolioOpen(false)}
        />
      )}
      {notesOpen && (
        <NotesModal
          titleId={notesTitleId}
          onClose={() => setNotesOpen(false)}
        />
      )}
      {bookingOpen && (
        <BookingModal
          titleId={bookingTitleId}
          onClose={() => setBookingOpen(false)}
        />
      )}
      {projectFitOpen && (
        <ProjectFitModal
          titleId={projectFitTitleId}
          onClose={() => setProjectFitOpen(false)}
        />
      )}
    </main>
  );
}

function LiveXPanel() {
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadTimeline = () => {
      window.twttr?.widgets?.load(timelineRef.current);
    };

    if (window.twttr?.widgets) {
      loadTimeline();
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://platform.twitter.com/widgets.js"]',
    );

    if (existingScript) {
      existingScript.addEventListener("load", loadTimeline, { once: true });
      return () => existingScript.removeEventListener("load", loadTimeline);
    }

    const script = document.createElement("script");
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;
    script.charset = "utf-8";
    script.addEventListener("load", loadTimeline, { once: true });
    document.body.appendChild(script);

    return () => script.removeEventListener("load", loadTimeline);
  }, []);

  return (
    <section aria-labelledby="x-feed-title">
      <div className="border border-zinc-950 bg-white p-3 shadow-[8px_8px_0_#18181b] sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-950 pb-3">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Live signal
            </p>
            <h2
              id="x-feed-title"
              className="mt-1 text-xl font-semibold tracking-tight"
            >
              Latest from X
            </h2>
          </div>
          <a
            href="https://x.com/nodedots"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-9 items-center border border-zinc-950 bg-[#fffdf8] px-3 text-sm font-semibold text-[#0b5cff] outline-none transition hover:bg-[#f0f7ff] hover:text-zinc-950 focus-visible:ring-2 focus-visible:ring-[#0b5cff] focus-visible:ring-offset-4"
          >
            View profile
          </a>
        </div>

        <div
          ref={timelineRef}
          className="mt-3 h-[190px] overflow-y-auto border border-zinc-950 bg-[#fffdf8] p-2 sm:h-[220px]"
        >
          <a
            className="twitter-timeline"
            data-height="210"
            data-chrome="noheader nofooter transparent"
            data-dnt="true"
            href="https://twitter.com/nodedots"
          >
            Posts by NodeDots on X
          </a>
          <p className="mt-2 text-xs leading-5 text-zinc-600">
            If the live X timeline is blocked by your browser, open the profile
            directly from the button above.
          </p>
        </div>
      </div>
    </section>
  );
}

function BookingModal({
  titleId,
  onClose,
}: {
  titleId: string;
  onClose: () => void;
}) {
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadCalendly = () => {
      if (!window.Calendly || !widgetRef.current) return;

      widgetRef.current.innerHTML = "";
      window.Calendly.initInlineWidget({
        url: CALENDLY_URL,
        parentElement: widgetRef.current,
      });
    };

    if (window.Calendly) {
      loadCalendly();
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://assets.calendly.com/assets/external/widget.js"]',
    );

    if (existingScript) {
      existingScript.addEventListener("load", loadCalendly, { once: true });
      return () => existingScript.removeEventListener("load", loadCalendly);
    }

    const link = document.createElement("link");
    link.href = "https://assets.calendly.com/assets/external/widget.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    script.addEventListener("load", loadCalendly, { once: true });
    document.body.appendChild(script);

    return () => script.removeEventListener("load", loadCalendly);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/35 px-3 py-3 backdrop-blur-sm sm:items-center sm:px-4 sm:py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="max-h-[92svh] w-full max-w-4xl overflow-y-auto border border-zinc-950 bg-[#fffdf8] p-4 shadow-[7px_7px_0_#18181b] sm:max-h-[92vh] sm:p-6 sm:shadow-[10px_10px_0_#18181b]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
              Booking
            </p>
            <h2
              id={titleId}
              className="mt-2 text-2xl font-semibold tracking-tight sm:text-4xl"
            >
              Book a NodeDots intro call
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-700">
              Schedule a short conversation about product ideas, practical UX,
              trusted interfaces, or collaboration fit.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-11 shrink-0 items-center justify-center border border-zinc-950 bg-white text-zinc-950 transition hover:bg-[#f0f7ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b5cff] focus-visible:ring-offset-4 sm:size-12"
            aria-label="Close booking"
          >
            <X className="size-6" strokeWidth={2.25} />
          </button>
        </div>

        <div className="mt-6 border border-zinc-950 bg-white p-2">
          <div ref={widgetRef} className="h-[620px] min-w-full" />
        </div>
        <p className="mt-4 text-sm leading-6 text-zinc-600">
          If the scheduler does not load, open{" "}
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#0b5cff] underline underline-offset-4"
          >
            Calendly directly
          </a>
          .
        </p>
      </div>
    </div>
  );
}

function ProjectFitModal({
  titleId,
  onClose,
}: {
  titleId: string;
  onClose: () => void;
}) {
  const fitItems = [
    "You need a product landing/profile interface with stronger trust and clearer copy.",
    "You are shaping a small web product and want the first experience to explain itself.",
    "You care about practical UX, readable flows, and avoiding noisy growth tricks.",
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/35 px-3 py-3 backdrop-blur-sm sm:items-center sm:px-4 sm:py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-3xl border border-zinc-950 bg-[#fffdf8] p-4 shadow-[7px_7px_0_#18181b] sm:p-8 sm:shadow-[10px_10px_0_#18181b]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
              Project fit
            </p>
            <h2
              id={titleId}
              className="mt-2 text-2xl font-semibold tracking-tight sm:text-4xl"
            >
              Is NodeDots the right fit?
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-11 shrink-0 items-center justify-center border border-zinc-950 bg-white text-zinc-950 transition hover:bg-[#f0f7ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b5cff] focus-visible:ring-offset-4 sm:size-12"
            aria-label="Close project fit"
          >
            <X className="size-6" strokeWidth={2.25} />
          </button>
        </div>

        <div className="mt-6 grid gap-3">
          {fitItems.map((item) => (
            <div
              key={item}
              className="flex gap-3 border border-zinc-950 bg-white p-4"
            >
              <CheckCircle2
                className="mt-0.5 size-5 shrink-0 text-[#00a878]"
                aria-hidden="true"
              />
              <p className="text-base leading-7 text-zinc-700">{item}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a
            href="mailto:hello@nodedots.example?subject=Project%20fit%20for%20NodeDots"
            className="inline-flex min-h-12 items-center justify-center border border-zinc-950 bg-zinc-950 px-5 text-sm font-semibold text-white shadow-[5px_5px_0_#0b5cff]"
          >
            Send a project note
          </a>
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center justify-center border border-zinc-950 bg-white px-5 text-sm font-semibold text-zinc-950 hover:bg-[#f0f7ff]"
          >
            Book instead
          </a>
        </div>
      </div>
    </div>
  );
}

function PortfolioModal({
  titleId,
  onClose,
}: {
  titleId: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/35 px-3 py-3 backdrop-blur-sm sm:items-center sm:px-4 sm:py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="max-h-[92svh] w-full max-w-5xl overflow-y-auto border border-zinc-950 bg-[#fffdf8] p-4 shadow-[7px_7px_0_#18181b] sm:max-h-[92vh] sm:p-8 sm:shadow-[10px_10px_0_#18181b]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
              Portfolio
            </p>
            <h2
              id={titleId}
              className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 sm:text-4xl"
            >
              NodeDots product work
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-700">
              A compact product portfolio shaped around clarity, trust, and
              practical user experience.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-11 shrink-0 items-center justify-center border border-zinc-950 bg-white text-zinc-950 transition hover:bg-[#f0f7ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b5cff] focus-visible:ring-offset-4 sm:size-12"
            aria-label="Close portfolio"
          >
            <X className="size-6" strokeWidth={2.25} />
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3 sm:mt-8">
          {products.map((product) => (
            <article
              key={product.name}
              className="border border-zinc-950 bg-white p-4 shadow-[5px_5px_0_rgba(24,24,27,0.9)] sm:p-5 sm:shadow-[6px_6px_0_rgba(24,24,27,0.9)]"
            >
              <div className="flex items-start justify-between gap-3 border-b border-zinc-950 pb-4">
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  {product.code}
                </p>
                <span className="border border-zinc-950 bg-[#fffdf8] px-2.5 py-1 text-xs font-semibold">
                  {product.status}
                </span>
              </div>
              <h3 className="mt-5 text-2xl font-semibold tracking-tight sm:mt-6 sm:text-3xl">
                {product.name}
              </h3>
              <p className="mt-3 text-base font-semibold text-zinc-800">
                {product.description}
              </p>
              <p className="mt-5 border-l-2 border-[#0b5cff] pl-4 text-sm leading-6 text-zinc-700">
                {product.detail}
              </p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function NotesModal({
  titleId,
  onClose,
}: {
  titleId: string;
  onClose: () => void;
}) {
  const [activeNote, setActiveNote] = useState<(typeof notes)[number] | null>(
    null,
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/35 px-3 py-3 backdrop-blur-sm sm:items-center sm:px-4 sm:py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="max-h-[92svh] w-full max-w-4xl overflow-y-auto border border-zinc-950 bg-[#fffdf8] p-4 shadow-[7px_7px_0_#18181b] sm:max-h-[92vh] sm:p-8 sm:shadow-[10px_10px_0_#18181b]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
              Notes
            </p>
            <h2
              id={titleId}
              className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 sm:text-4xl"
            >
              {activeNote ? activeNote.title : "NodeDots writing flow"}
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-700">
              {activeNote
                ? activeNote.excerpt
                : "Short essays, build notes, and product thinking from the NodeDots workspace."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-11 shrink-0 items-center justify-center border border-zinc-950 bg-white text-zinc-950 transition hover:bg-[#f0f7ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b5cff] focus-visible:ring-offset-4 sm:size-12"
            aria-label="Close notes"
          >
            <X className="size-6" strokeWidth={2.25} />
          </button>
        </div>

        {activeNote ? (
          <article className="mt-6 border border-zinc-950 bg-white p-4 shadow-[5px_5px_0_rgba(24,24,27,0.9)] sm:mt-8 sm:p-6">
            <button
              type="button"
              onClick={() => setActiveNote(null)}
              className="inline-flex min-h-10 items-center gap-2 border border-zinc-950 bg-[#fffdf8] px-3 text-sm font-semibold transition hover:bg-[#f0f7ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b5cff] focus-visible:ring-offset-4"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to notes
            </button>
            <div className="mt-6 border-b border-zinc-950 pb-5">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                {activeNote.code} / {activeNote.type}
              </p>
              <h3 className="mt-3 text-3xl font-semibold tracking-tight">
                {activeNote.title}
              </h3>
            </div>
            <div className="mt-6 space-y-5 text-base leading-8 text-zinc-700">
              {activeNote.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </article>
        ) : (
          <div className="mt-6 grid gap-4 sm:mt-8">
            {notes.map((note) => (
              <button
                key={note.code}
                type="button"
                onClick={() => setActiveNote(note)}
                className="group border border-zinc-950 bg-white p-4 text-left shadow-[5px_5px_0_rgba(24,24,27,0.9)] outline-none transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[#fff8df] focus-visible:ring-2 focus-visible:ring-[#0b5cff] focus-visible:ring-offset-4 sm:p-5"
              >
                <span className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-950 pb-4">
                  <span className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                    {note.code}
                  </span>
                  <span className="border border-zinc-950 bg-[#fffdf8] px-2.5 py-1 text-xs font-semibold">
                    {note.type}
                  </span>
                </span>
                <span className="mt-5 block text-2xl font-semibold tracking-tight text-zinc-950">
                  {note.title}
                </span>
                <span className="mt-3 block text-base leading-7 text-zinc-700">
                  {note.excerpt}
                </span>
                <span className="mt-5 inline-flex text-sm font-semibold text-[#0b5cff] transition group-hover:text-zinc-950">
                  Open note -&gt;
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
