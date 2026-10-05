/**
 * Product preview gate: product surfaces (/reports/*) are visible only when
 * explicitly enabled. Local development and preview deployments set
 * PRODUCT_PREVIEW_ENABLED=1; production leaves it unset so public visitors
 * are redirected to the waitlist instead of seeing work in progress.
 */
export function isPreviewEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.PRODUCT_PREVIEW_ENABLED === "1";
}

export const PREVIEW_REDIRECT_PATH = "/waitlist";

export function isProductRoute(pathname: string): boolean {
  return pathname === "/reports" || pathname.startsWith("/reports/");
}
