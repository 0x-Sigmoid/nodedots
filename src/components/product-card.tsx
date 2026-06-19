type ProductCardProps = {
  code: string;
  name: string;
  description: string;
  status: string;
  href: string;
  signal: string;
};

export function ProductCard({
  code,
  name,
  description,
  status,
  href,
  signal,
}: ProductCardProps) {
  return (
    <article className="group relative flex min-h-[330px] flex-col justify-between border border-zinc-950 bg-[#fffdf8] p-5 shadow-[8px_8px_0_rgba(24,24,27,0.92)] transition duration-300 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0_#0b5cff]">
      <div className="relative">
        <div className="flex items-start justify-between gap-4 border-b border-zinc-950 pb-5">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            {code}
          </span>
          <span className="border border-zinc-950 bg-white px-2.5 py-1 text-xs font-semibold text-zinc-800">
            {status}
          </span>
        </div>
        <h3 className="mt-8 text-3xl font-semibold tracking-tight text-zinc-950">
          {name}
        </h3>
        <p className="mt-4 text-base leading-7 text-zinc-700">{description}</p>
        <p className="mt-6 border-l-2 border-[#0b5cff] pl-4 text-sm font-medium leading-6 text-zinc-600">
          {signal}
        </p>
      </div>
      <a
        href={href}
        className="relative mt-8 inline-flex w-fit items-center gap-2 border border-zinc-950 bg-white px-4 py-2 text-sm font-semibold text-zinc-950 outline-none transition hover:bg-[#f0f7ff] focus-visible:ring-2 focus-visible:ring-[#0b5cff] focus-visible:ring-offset-4"
      >
        Product notes
        <span aria-hidden="true" className="transition group-hover:translate-x-1">
          -&gt;
        </span>
      </a>
    </article>
  );
}
