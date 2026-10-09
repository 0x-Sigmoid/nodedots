import { notFound } from "next/navigation";
import { comingSoonItems } from "@/config/nav";
import { ComingSoon } from "@/components/coming-soon";
import { pageMetadata } from "@/lib/site-metadata";
const items = comingSoonItems.filter(item => item.href.startsWith("/product/"));
// Resolve the configured pages at request time: the current Cloudflare adapter
// does not serve these generateStaticParams routes correctly with dynamicParams=false.
export const dynamic = "force-dynamic";
async function resolve(params: Promise<{ slug: string }>) { const { slug } = await params; const item = items.find(item => item.href === `/product/${slug}`); if (!item) notFound(); return item; }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const item = await resolve(params); return pageMetadata(item.href, `${item.label} | NodeDots — Planned`, item.description); }
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) { return <ComingSoon item={await resolve(params)} />; }
