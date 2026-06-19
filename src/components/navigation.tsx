const navItems = [
  { label: "Products", href: "#products" },
  { label: "Philosophy", href: "#philosophy" },
  { label: "About", href: "#about" },
  { label: "Notes", href: "#notes" },
];

export function Navigation() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-950 bg-[#fffdf8]/88 backdrop-blur-xl">
      <nav
        aria-label="Primary navigation"
        className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-6 lg:px-8"
      >
        <a
          href="#top"
          className="flex items-center gap-3 outline-none focus-visible:ring-2 focus-visible:ring-[#0b5cff] focus-visible:ring-offset-4"
          aria-label="NodeDots home"
        >
          <span
            aria-hidden="true"
            className="relative flex h-9 w-9 items-center justify-center border border-zinc-950 bg-white text-white shadow-[4px_4px_0_#18181b]"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-[#0b5cff]" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#ffb000]" />
            <span className="absolute bottom-2 left-2 h-1.5 w-1.5 rounded-full bg-[#00a878]" />
          </span>
          <span className="text-base font-semibold tracking-tight text-zinc-950">
            NodeDots
          </span>
        </a>
        <div className="hidden items-center gap-6 text-sm font-semibold text-zinc-600 md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="outline-none transition hover:text-zinc-950 focus-visible:ring-2 focus-visible:ring-[#0b5cff] focus-visible:ring-offset-4"
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}
