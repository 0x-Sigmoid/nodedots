import type { D1Database, Queue } from "@cloudflare/workers-types";
declare global {
 interface CloudflareEnv {
  WAITLIST_DB: D1Database;
  WORKSPACE_QUEUE: Queue<{id:string}>;
  WORKSPACE_RUNNER_SECRET?:string;
  GITHUB_APP_ID?:string;
  GITHUB_PRIVATE_KEY_PEM?:string;
  GITHUB_WEBHOOK_SECRET?:string;
  PRODUCT_PREVIEW_ENABLED: "0";
  RESEND_API_KEY?: string;
  WAITLIST_EMAIL_FROM: string;
 }
}
export {};
