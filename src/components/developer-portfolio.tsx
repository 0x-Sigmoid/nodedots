import Image from "next/image";
import { notes } from "@/lib/notes";

const products = [
  { number: "01", name: "VennURL", label: "Link trust", description: "See what is behind a link before you click it.", detail: "A small layer of context for a high-trust moment.", className: "product-card-dark", cta: "Explore the thinking", href: "#notes" },
  { number: "02", name: "Tabmeet", label: "Decision support", description: "Turn a crowded set of open tabs into a clear next step.", detail: "Less searching. More seeing what the tradeoff actually is.", className: "product-card-lemon", cta: "Read the principle", href: "#principles" },
  { number: "03", name: "NodeDots Code", label: "In development", description: "Read a code change in the context of the whole system.", detail: "What did it touch, what did it miss, and what now conflicts?", className: "product-card-paper", cta: "Follow the build", href: "#contact" },
];

const principles = [
  ["01", "Explain before asking", "A useful interface gives people enough context to make the next decision with confidence."],
  ["02", "Keep the surface narrow", "The strongest tools do one important job clearly instead of turning every possibility into a feature."],
  ["03", "Make uncertainty visible", "Trust grows when a product shows what it knows, what it does not, and what deserves a closer look."],
];

const navItems = [
  { label: "Work", href: "#work" },
  { label: "Notes", href: "#notes" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

function Mark() {
  return <svg viewBox="0 0 50 16" aria-hidden="true" className="portfolio-mark"><path d="M5 8H45"/><circle cx="5" cy="8" r="3.5"/><circle cx="15" cy="8" r="3.5"/><circle cx="25" cy="8" r="3.5"/><circle cx="45" cy="8" r="3.5"/><circle className="portfolio-mark-hollow" cx="35" cy="8" r="3.5"/></svg>;
}

export function DeveloperPortfolio() {
  return <main className="portfolio-shell">
    <header className="portfolio-header">
      <a className="portfolio-brand" href="#top" aria-label="NodeDots home"><Mark/><span>NodeDots</span></a>
      <nav aria-label="Primary navigation" className="portfolio-nav">
        {navItems.map(item => <a key={item.label} href={item.href}>{item.label}</a>)}
        <a href="https://x.com/nodedots" target="_blank" rel="noopener noreferrer" className="portfolio-nav-external">@nodedots <span aria-hidden="true">↗</span></a>
      </nav>
    </header>

    <section id="top" className="portfolio-hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="portfolio-eyebrow"><span className="eyebrow-dot" aria-hidden="true"/> Independent product studio</p>
        <h1 id="hero-title">I build tools that make the next step easier to see.</h1>
        <p className="hero-lead">NodeDots makes small products around trust, clarity, and AI-assisted decisions. Explain first, then invite action.</p>
        <div className="hero-actions"><a className="portfolio-button portfolio-button-dark" href="#work">See the work <span aria-hidden="true">↘</span></a><a className="portfolio-button portfolio-button-quiet" href="#notes">Read the notes <span aria-hidden="true">↘</span></a></div>
      </div>
      <div className="hero-instrument" role="img" aria-label="NodeDots field instrument showing trust, clarity, and action connected"><div className="instrument-header"><span>NODEDOTS / FIELD 01</span><span className="instrument-live"><span aria-hidden="true"/> Live system</span></div><div className="instrument-stage"><div className="instrument-ring instrument-ring-one"/><div className="instrument-ring instrument-ring-two"/><div className="instrument-core"><Mark/><span>what should happen next?</span></div><span className="instrument-node instrument-node-a">trust</span><span className="instrument-node instrument-node-b">clarity</span><span className="instrument-node instrument-node-c">action</span></div><div className="instrument-footer"><span>connect the pieces</span><span>01 / 03</span></div></div>
    </section>

    <div className="portfolio-signal" aria-label="Portfolio overview"><span><strong>03</strong> products in the studio</span><span><strong>03</strong> notes from the workbench</span><span><strong>01</strong> operating principle</span></div>

    <section id="about" className="portfolio-section about-section" aria-labelledby="about-title"><div className="section-kicker">About the work</div><div className="about-grid"><div><h2 id="about-title">Useful should feel calm.</h2><Image src="/nodedots.png" alt="NodeDots abstract avatar" width={1254} height={1254} className="about-image" priority/></div><div className="about-copy"><p>NodeDots is an independent product studio interested in the moments where people have to decide whether to trust something, understand something, or act on it.</p><p>The work stays deliberately narrow: clear language, visible tradeoffs, and interfaces that do not ask for confidence they have not earned.</p><p>Every product starts with the same question: what does someone need to see before they can move forward?</p></div></div></section>

    <section id="work" className="portfolio-section work-section" aria-labelledby="work-title"><div className="section-intro"><div><div className="section-kicker">Selected work</div><h2 id="work-title">Small tools for high-trust moments.</h2></div><p>Three products, one shared instinct: make the decision easier to understand.</p></div><div className="product-grid">{products.map(product => <article key={product.name} className={`product-card ${product.className}`}><div className="product-card-top"><span className="product-number">{product.number}</span><span className="product-label">{product.label}</span></div><div><h3>{product.name}</h3><p className="product-description">{product.description}</p><p className="product-detail">{product.detail}</p></div><a href={product.href} className="product-link">{product.cta} <span aria-hidden="true">↗</span></a></article>)}</div></section>

    <section id="principles" className="portfolio-section principles-section" aria-labelledby="principles-title"><div className="section-intro"><div><div className="section-kicker">The operating system</div><h2 id="principles-title">A few things I keep returning to.</h2></div><p>These are less like rules and more like filters for deciding what deserves to exist.</p></div><div className="principles-list">{principles.map(([number, title, body]) => <article key={number} className="principle-row"><span className="principle-number">{number}</span><h3>{title}</h3><p>{body}</p></article>)}</div></section>

    <section id="notes" className="portfolio-section notes-section" aria-labelledby="notes-title"><div className="section-intro"><div><div className="section-kicker">From the workbench</div><h2 id="notes-title">Notes on making things clear.</h2></div><a className="text-link" href="https://x.com/nodedots" target="_blank" rel="noopener noreferrer">Follow the thread <span aria-hidden="true">↗</span></a></div><div className="notes-list">{notes.map(note => <article key={note.slug} className="note-row"><span className="note-date">{note.date}</span><div><h3>{note.title}</h3><p>{note.teaser}</p></div><a className="note-arrow" href={`/notes/${note.slug}`} aria-label={`Read ${note.title}`}>↗</a></article>)}</div></section>

    <section id="contact" className="contact-section" aria-labelledby="contact-title"><div className="contact-kicker">Have a product that needs another set of eyes?</div><h2 id="contact-title">Let’s make the next step clearer.</h2><p>Send a short note about the product, problem, or decision you are working through.</p><a className="contact-button" href="mailto:hello@nodedots.example?subject=Project%20inquiry%20for%20NodeDots">Start a conversation <span aria-hidden="true">↗</span></a><div className="contact-links"><a href="https://t.me/nodedots" target="_blank" rel="noopener noreferrer">Telegram</a><a href="https://calendly.com/nodedots/intro-call" target="_blank" rel="noopener noreferrer">Book a call</a></div></section>

    <footer className="portfolio-footer"><a className="portfolio-brand" href="#top" aria-label="NodeDots home"><Mark/><span>NodeDots</span></a><span>Tools for trust, clarity, and AI decisions.</span><span>© {new Date().getFullYear()} NodeDots</span></footer>
  </main>;
}
