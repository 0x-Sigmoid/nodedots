import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
const nextConfig: NextConfig = {
 turbopack: { root: process.cwd() },
 async headers() {
  return [
   { source: "/api/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }] },
   { source: "/reports/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }] },
   { source: "/workspace/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }, { key: "Cache-Control", value: "private, no-store" }] },
   { source: "/onboarding", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }, { key: "Cache-Control", value: "private, no-store" }] },
   { source: "/waitlist/unsubscribe", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }] },
  ];
 },
};
export default nextConfig;
