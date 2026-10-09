import { notFound } from "next/navigation";
import { comingSoonItems } from "@/config/nav";
import { ComingSoon } from "@/components/coming-soon";
import { pageMetadata } from "@/lib/site-metadata";
const items = comingSoonItems.filter(item => item.href.startsWith("/resources/"));
// Use the same request-time route resolution as the planned product pages.
export const dynamic = "force-dynamic";
async function resolve(params: Promise<{ slug: string }>) { const { slug } = await params; const item = items.find(item => item.href === `/resources/${slug}`); if (!item) notFound(); return item; }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const item = await resolve(params); return pageMetadata(item.href, `${item.label} | NodeDots — To Be Announced`, item.description); }
export default async function ResourcePage({ params }: { params: Promise<{ slug: string }> }) { return <ComingSoon item={await resolve(params)} />; }
