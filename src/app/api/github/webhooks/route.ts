/**
 * GitHub App webhook receiver (docs/13): enforce size limits on the raw
 * body, validate the HMAC signature with constant-time comparison, persist
 * the delivery + outbox event before acknowledging, and return promptly.
 * Duplicate deliveries are acknowledged without duplicate work.
 */
import { drainQueue, handleCheckRerequest } from "@/github/pipeline";
import { snapshotProviderFromEnv } from "@/github/retrieval";
import { tokenResolverFromEnv } from "@/github/app-auth";
import { hashPayload, MAX_WEBHOOK_BYTES, supportedPullRequestAction, verifySignature } from "@/github/verify";
import { getOutbox, getReportStore } from "@/db";
import { logEvent } from "@/lib/log";
import { coordsFromPayload } from "@/github/pipeline";
import { analysisIdFor } from "@/github/checks";

const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };

function depsFromRequest(request: Request) {
  return {
    outbox: getOutbox(),
    store: getReportStore(),
    snapshotProvider: snapshotProviderFromEnv(),
    baseUrl: new URL(request.url).origin,
    githubToken: process.env.GITHUB_INSTALLATION_TOKEN ?? null,
    resolveToken: tokenResolverFromEnv(),
  };
}

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return Response.json({ message: "Invalid submission." }, { status: 415, headers });
  }
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) {
    return Response.json({ message: "Webhook receiver not configured." }, { status: 503, headers });
  }
  if (Number(request.headers.get("content-length") || 0) > MAX_WEBHOOK_BYTES) {
    return Response.json({ message: "Payload too large." }, { status: 413, headers });
  }
  let raw: Uint8Array;
  try {
    const buffer = await request.arrayBuffer();
    if (buffer.byteLength > MAX_WEBHOOK_BYTES) {
      return Response.json({ message: "Payload too large." }, { status: 413, headers });
    }
    raw = new Uint8Array(buffer);
  } catch {
    return Response.json({ message: "Could not read payload." }, { status: 400, headers });
  }
  if (!verifySignature(secret, raw, request.headers.get("x-hub-signature-256"))) {
    logEvent("warn", "webhook_signature_rejected", {});
    return Response.json({ message: "Invalid signature." }, { status: 401, headers });
  }

  const event = request.headers.get("x-github-event") ?? "";
  const delivery = request.headers.get("x-github-delivery") ?? "";
  if (!event || !delivery) {
    return Response.json({ message: "Missing event metadata." }, { status: 400, headers });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(new TextDecoder().decode(raw)) as Record<string, unknown>;
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new Error("shape");
  } catch {
    return Response.json({ message: "Invalid payload." }, { status: 400, headers });
  }

  if (event === "ping") {
    logEvent("info", "webhook_ping", { delivery });
    return Response.json({ message: "pong" }, { headers });
  }

  if (event === "check_run" && (payload as { action?: unknown }).action === "rerequested") {
    const checkRun = (payload as { check_run?: { external_id?: unknown } }).check_run;
    const externalId = typeof checkRun?.external_id === "string" ? checkRun.external_id : null;
    const store = getOutbox();
    const received = await store.receive({
      deliveryId: delivery,
      event,
      action: "rerequested",
      owner: null,
      repo: null,
      installationId: null,
      payloadHash: hashPayload(raw),
      receivedAt: Math.floor(Date.now() / 1000),
      payload,
    });
    if (received.duplicate) {
      return Response.json({ message: "Delivery already received." }, { headers });
    }
    const result = await handleCheckRerequest(externalId, depsFromRequest(request));
    await store.markCompleted(delivery, externalId ?? "");
    return Response.json(
      result.redelivered
        ? { message: "Check run re-delivered.", analysisId: externalId }
        : { message: `Rerequest ignored: ${result.reason}.` },
      { headers },
    );
  }

  if (event !== "pull_request") {
    logEvent("info", "webhook_ignored", { delivery, event });
    return Response.json({ message: `Ignored ${event} event.` }, { headers });
  }
  const action = (payload as { action?: unknown }).action;
  if (!supportedPullRequestAction(action)) {
    logEvent("info", "webhook_ignored", { delivery, event, action: String(action) });
    return Response.json({ message: `Ignored pull_request ${String(action)} action.` }, { headers });
  }
  const coords = coordsFromPayload(
    payload as Parameters<typeof coordsFromPayload>[0],
  );
  if (!coords) {
    return Response.json({ message: "Ignored pull_request event with unsupported shape." }, { headers });
  }

  const received = await getOutbox().receive({
    deliveryId: delivery,
    event,
    action: String(action),
    owner: coords.owner,
    repo: coords.repo,
    installationId:
      typeof (payload as { installation?: { id?: unknown } }).installation?.id === "number"
        ? ((payload as { installation?: { id?: number } }).installation?.id ?? null)
        : null,
    payloadHash: hashPayload(raw),
    receivedAt: Math.floor(Date.now() / 1000),
    payload,
  });
  if (received.duplicate) {
    logEvent("info", "webhook_duplicate", { delivery, event });
    return Response.json({ message: "Delivery already received." }, { headers });
  }

  const analysisId = analysisIdFor(coords.owner, coords.repo, coords.number, coords.headSha);
  logEvent("info", "webhook_queued", { delivery, event, analysisId });
  void drainQueue(depsFromRequest(request)).then(
    undefined,
    (error: unknown) => {
      logEvent("error", "webhook_drain_failed", { delivery, error: error instanceof Error ? error.message : "unknown" });
    },
  );
  return Response.json({ message: "Queued for analysis.", delivery, analysisId }, { status: 202, headers });
}

export async function GET() {
  return Response.json({ message: "GitHub webhook receiver. POST deliveries here." }, { status: 405, headers });
}
