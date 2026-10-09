import { VisionContent } from "@/components/vision-content";
import { pageMetadata } from "@/lib/site-metadata";
export const metadata = pageMetadata("/vision", "NodeDots Vision | Beyond Code", "Explore future NodeDots directions in applications, contracts, research, business, verification, and decisions. These concepts are in exploration.", "/brand/vision-card.png");
export default function VisionPage() { return <VisionContent backLabel="Back home" />; }
