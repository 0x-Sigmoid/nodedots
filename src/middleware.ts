import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isPreviewEnabled, PREVIEW_REDIRECT_PATH } from "./reports/preview";

export function middleware(request: NextRequest) {
  if (isPreviewEnabled()) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = PREVIEW_REDIRECT_PATH;
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/reports/:path*"],
};
