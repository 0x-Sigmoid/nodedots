import { pricingItem } from "@/config/nav";
import { ComingSoon } from "@/components/coming-soon";
import { pageMetadata } from "@/lib/site-metadata";
export const metadata = pageMetadata("/pricing", "NodeDots Pricing | To Be Announced", pricingItem.description);
export default function PricingPage() { return <ComingSoon item={pricingItem} />; }
