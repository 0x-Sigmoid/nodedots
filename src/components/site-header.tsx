"use client";

export function Mark() {
  return (
    <svg viewBox="14 14 36 36" aria-hidden="true" className="brand-mark">
      <g fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 44V20L24.2 24.2" />
        <path d="M39.8 39.8L44 44V20" />
      </g>
      <circle cx="32" cy="32" r="4.5" fill="none" stroke="currentColor" strokeWidth="3" />
    </svg>
  );
}

export function toggleTheme() {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  document.documentElement.classList.toggle("dark", next === "dark");
  try {
    localStorage.setItem("nodedots-theme", next);
  } catch {
    // storage unavailable; theme still applies for this visit
  }
}

export function ThemeToggle() {
  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label="Switch between light and dark theme"
      title="Switch between light and dark theme"
      type="button"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <g className="theme-sun" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2V5M12 19V22M2 12H5M19 12H22M5 5L7 7M17 17L19 19M5 19L7 17M17 7L19 5" />
        </g>
        <path
          className="theme-moon"
          d="M20 15A8 8 0 0 1 9 4A8 8 0 1 0 20 15Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    </button>
  );
}

export function SiteHeader({
  links,
  brandHref = "/",
}: {
  links: { href: string; label: string }[];
  /** Waitlist scope passes "/waitlist" so visitors never reach marketing. */
  brandHref?: string;
}) {
  return (
    <header className="site-header">
      <a className="brand" href={brandHref} aria-label="NodeDots home">
        <Mark />
        <span>NodeDots</span>
      </a>
      <nav aria-label="Site navigation">
        {links.map((link) => (
          <a key={link.href} className="nav-link" href={link.href}>
            {link.label}
          </a>
        ))}
        <ThemeToggle />
        <a className="nav-join" href="/waitlist">
          Join the waitlist
        </a>
      </nav>
    </header>
  );
}
