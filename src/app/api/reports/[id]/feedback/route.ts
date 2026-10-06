/**
 * Finding feedback API (docs/08 dispositions, docs/04 accepted / dismissed /
 * fixed / intentional). Latest-wins per fingerprint; clearing records a
 * "cleared" event rather than deleting history.
 */
import { getFeedbackStore } from "@/db";
import { clientIp, checkRateLimit, hashLimitKey, type LimitBucket } from "@/lib/rate-limit";
import { isValidAnalysisId, isValidDisposition, isValidFingerprint } from "@/reports/feedback";

const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };

/** 30 reviews per 10 minutes per requester: generous for humans, costly for scripts. */
const FEEDBACK_LIMIT = 30;
const FEEDBACK_WINDOW_SEC = 600;
const feedbackLimits = new Map<string, LimitBucket>();

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  if (!isValidAnalysisId(id)) return Response.json({ message: "Unknown report." }, { status: 404, headers });
  const feedback = await getFeedbackStore().forAnalysis(id);
  return Response.json({ feedback }, { headers });
}

export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await params;
  if (!isValidAnalysisId(id)) return Response.json({ message: "Unknown report." }, { status: 404, headers });
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return Response.json({ message: "Invalid submission." }, { status: 415, headers });
  }
  const limitKey = await hashLimitKey(["feedback", clientIp(request)]);
  const limit = checkRateLimit(feedbackLimits, limitKey, FEEDBACK_LIMIT, FEEDBACK_WINDOW_SEC);
  if (!limit.allowed) {
    return Response.json(
      { message: "Too many reviews. Please try again in a few minutes." },
      { status: 429, headers: { ...headers, "Retry-After": String(limit.retryAfterSec) } },
    );
  }
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ message: "Invalid submission." }, { status: 400, headers });
  }
  const { fingerprint, disposition, reason } = body as {
    fingerprint?: unknown;
    disposition?: unknown;
    reason?: unknown;
  };
  if (!isValidFingerprint(fingerprint)) {
    return Response.json({ message: "A finding reference is required." }, { status: 400, headers });
  }
  // Null clears the review (recorded, not deleted).
  const value = disposition === null ? "cleared" : disposition;
  if (!isValidDisposition(value)) {
    return Response.json({ message: "Unknown disposition." }, { status: 400, headers });
  }
  if (reason !== undefined && reason !== null && (typeof reason !== "string" || reason.length > 500)) {
    return Response.json({ message: "Reason is too long." }, { status: 400, headers });
  }
  await getFeedbackStore().record({
    analysisId: id,
    fingerprint,
    disposition: value,
    reason: typeof reason === "string" ? reason : null,
  });
  const feedback = await getFeedbackStore().forAnalysis(id);
  return Response.json({ feedback }, { headers });
}
