"use client";

import { Code2, MessageCircle, Send, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useId, useState } from "react";

const developerLinks = [
  { label: "X", href: "https://x.com/nodedots", icon: X },
  {
    label: "Discord",
    href: "https://discord.com/users/nodedots",
    icon: MessageCircle,
  },
  { label: "GitHub", href: "https://github.com/nodedots", icon: Code2 },
  { label: "Telegram", href: "https://t.me/nodedots", icon: Send },
];

export function DeveloperCredit() {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <p className="text-[13px] leading-relaxed text-zinc-600">
        Developed by{" "}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="font-semibold text-[#0b5cff] underline decoration-[#0b5cff]/40 underline-offset-4 outline-none transition hover:text-zinc-950 hover:decoration-zinc-950 focus-visible:ring-2 focus-visible:ring-[#0b5cff] focus-visible:ring-offset-4"
        >
          NodeDots
        </button>
      </p>

      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-zinc-950/35 px-4 py-4 backdrop-blur-sm sm:items-center sm:py-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div className="w-full max-w-[560px] border border-zinc-950 bg-[#fffdf8] p-5 shadow-[10px_10px_0_#18181b] sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                  Developer
                </p>
                <h2
                  id={titleId}
                  className="mt-2 text-[28px] font-semibold tracking-tight text-zinc-950"
                >
                  NodeDots
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex size-12 shrink-0 items-center justify-center border border-zinc-950 bg-white text-zinc-950 transition hover:bg-[#f0f7ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b5cff] focus-visible:ring-offset-4"
                aria-label="Close developer profile"
              >
                <X className="size-6" strokeWidth={2.25} />
              </button>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-[140px_1fr]">
              <Image
                src="/nodedots.png"
                alt="NodeDots developer portrait"
                width={140}
                height={140}
                className="aspect-square w-[140px] border border-zinc-950 object-cover"
              />
              <div>
                <p className="text-[16px] leading-relaxed text-zinc-700">
                  NodeDots builds thoughtful web products with a focus on
                  clarity, trust, and practical user experience. The work
                  reflects a steady principle: explain first, then invite
                  action.
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {developerLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 border border-zinc-700 bg-white px-4 py-3 text-[14px] font-medium text-zinc-950 transition hover:border-zinc-950 hover:bg-[#f0f7ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b5cff] focus-visible:ring-offset-4"
                      aria-label={`Open NodeDots on ${link.label}`}
                    >
                      <link.icon className="size-5 shrink-0" aria-hidden="true" />
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
