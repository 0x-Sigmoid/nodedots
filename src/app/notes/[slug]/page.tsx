import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getNoteBySlug, notes } from "@/lib/notes";

type NotePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return notes.map((note) => ({
    slug: note.slug,
  }));
}

export async function generateMetadata({
  params,
}: NotePageProps): Promise<Metadata> {
  const { slug } = await params;
  const note = getNoteBySlug(slug);

  if (!note) {
    return {};
  }

  return {
    title: note.title,
    description: note.teaser,
    alternates: {
      canonical: `/notes/${note.slug}`,
    },
    openGraph: {
      title: note.title,
      description: note.teaser,
      url: `/notes/${note.slug}`,
      type: "article",
      publishedTime: note.date,
    },
  };
}

export default async function NotePage({ params }: NotePageProps) {
  const { slug } = await params;
  const note = getNoteBySlug(slug);

  if (!note) {
    notFound();
  }

  return (
    <main className="min-h-svh bg-[#f8f8f8] text-[#1a1a1a]">
      <article className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8 sm:py-16">
        <Link
          href="/#notes"
          className="font-mono text-sm font-medium text-[#3b5bdb] outline-none hover:text-[#2f49af] focus-visible:ring-2 focus-visible:ring-[#3b5bdb] focus-visible:ring-offset-4"
        >
          Back to notes
        </Link>

        <header className="mt-12 border-b border-[#e5e5e5] pb-8">
          <p className="font-mono text-sm text-neutral-500">{note.date}</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            {note.title}
          </h1>
          <p className="mt-5 text-lg leading-8 text-neutral-600">
            {note.teaser}
          </p>
        </header>

        <div className="mt-10 space-y-6 text-lg leading-9 text-neutral-700">
          {note.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </article>
    </main>
  );
}
