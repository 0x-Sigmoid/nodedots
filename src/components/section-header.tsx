type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
}: SectionHeaderProps) {
  return (
    <div className="mx-auto max-w-3xl">
      <p className="font-mono text-sm font-semibold uppercase tracking-[0.22em] text-[#0b5cff]">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
        {title}
      </h2>
      <p className="mt-5 text-base leading-8 text-zinc-600 sm:text-lg">
        {description}
      </p>
    </div>
  );
}
