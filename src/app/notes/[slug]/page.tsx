import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getNoteBySlug, notes } from "@/lib/notes";

type NotePageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() { return notes.map((note) => ({ slug: note.slug })); }

export async function generateMetadata({ params }: NotePageProps): Promise<Metadata> {
  const { slug } = await params;
  const note = getNoteBySlug(slug);
  if (!note) return {};
  return { title: note.title, description: note.teaser, alternates: { canonical: `/notes/${note.slug}` }, openGraph: { title: note.title, description: note.teaser, url: `/notes/${note.slug}`, type: "article", publishedTime: note.date } };
}

export default async function NotePage({ params }: NotePageProps) {
  const { slug } = await params;
  const note = getNoteBySlug(slug);
  if (!note) notFound();
  return <main className="note-page"><article className="note-article"><Link className="note-back" href="/#notes">← Back to notes</Link><header className="note-header"><p className="section-kicker">Workbench note / {note.date}</p><h1>{note.title}</h1><p>{note.teaser}</p></header><div className="note-body">{note.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></article></main>;
}
