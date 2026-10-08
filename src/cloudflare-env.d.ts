import type { D1Database } from "@cloudflare/workers-types";
declare global {
 interface CloudflareEnv {
  WAITLIST_DB: D1Database;
  PRODUCT_PREVIEW_ENABLED: "0";
  RESEND_API_KEY?: string;
  WAITLIST_EMAIL_FROM: string;
 }
}
export {};
