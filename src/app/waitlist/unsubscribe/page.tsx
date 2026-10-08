import type { Metadata } from "next";
import { WaitlistUnsubscribe } from "@/components/waitlist-unsubscribe";

export const metadata: Metadata = {
 title: "Email preferences", robots: { index: false, follow: false }, other: { referrer: "no-referrer" },
 alternates: { canonical: "/waitlist/unsubscribe" },
};
export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{token?: string}> }) {
 const { token } = await searchParams;
 const valid = typeof token === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(token);
 return <WaitlistUnsubscribe token={valid ? token : null} />;
}
