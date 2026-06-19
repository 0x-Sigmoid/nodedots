import { DeveloperCredit } from "@/components/developer-credit";

const footerLinks = [
  { label: "X", href: "https://x.com/nodedots" },
  { label: "LinkedIn", href: "#" },
  { label: "GitHub", href: "https://github.com/nodedots" },
  { label: "Email", href: "mailto:hello@nodedots.example" },
];

export function Footer() {
  return (
    <footer className="border-t border-zinc-950 bg-[#fffdf8]">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-8 text-sm text-zinc-600 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <DeveloperCredit />
        <nav aria-label="Footer links" className="flex flex-wrap gap-4">
          {footerLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-semibold outline-none transition hover:text-zinc-950 focus-visible:ring-2 focus-visible:ring-[#0b5cff] focus-visible:ring-offset-4"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
