/**
 * PR analysis pipeline: validated webhook event → snapshot → deterministic
 * engine → persisted report → check-run payload. Retries create new job
 * attempts, never contradictory state rewrites; old-head work is superseded
 * by keying analyses on the captured head SHA (docs/11, docs/13).
 */
import { analyze } from "@/engine/index";
import type { ImpactReport } from "@/engine/types";
import {
  type CheckRunPayload,
  analysisIdFor,
  buildCheckRunPayload,
  reportUrlFor,
  upsertCheckRun,
} from "./checks";
import { type OutboxEvent, type OutboxStore } from "./outbox";
import type { ReportStore } from "@/reports/store";
import { type PullRequestCoords, type SnapshotProvider } from "./snapshots";
import { logEvent } from "@/lib/log";
import { supportedPullRequestAction } from "./verify";

export const MAX_JOB_ATTEMPTS = 3;

export interface PipelineDeps {
  outbox: OutboxStore;
  store: ReportStore;
  snapshotProvider: SnapshotProvider;
  baseUrl: string;
  /** Installation token when available; null records delivery intent only. */
  githubToken?: string | null;
  /** Preferred: resolves a token per installation (static token, else App minting). */
  resolveToken?: (installationId: number | null) => Promise<string | null>;
  post?: typeof fetch;
}

export interface StageDelivery {
  stage: "in_progress" | "completed";
  delivered: boolean;
  reason: string;
  mode?: "created" | "updated";
}

export interface PipelineOutcome {
  analysisId: string;
  report: ImpactReport;
  reportUrl: string;
  checkPayload: CheckRunPayload;
  delivered: boolean;
  deliveryReason: string;
  stages: StageDelivery[];
}

export function coordsFromPayload(payload: {
  repository?: { owner?: { login?: string }; name?: string };
  number?: number;
  installation?: { id?: unknown };
  pull_request?: {
    head?: { sha?: string; repo?: { owner?: { login?: string }; name?: string; fork?: boolean } };
    base?: { sha?: string };
  };
}): (PullRequestCoords & { action: string }) | null {
  const owner = payload.repository?.owner?.login;
  const repo = payload.repository?.name;
  const number = payload.number;
  const headSha = payload.pull_request?.head?.sha;
  const baseSha = payload.pull_request?.base?.sha;
  if (!owner || !repo || typeof number !== "number" || !headSha || !baseSha) return null;
  const headRepo = payload.pull_request?.head?.repo;
  const installationId = payload.installation?.id;
  return {
    owner,
    repo,
    number,
    baseSha,
    headSha,
    headOwner: headRepo?.owner?.login ?? owner,
    headRepo: headRepo?.name ?? repo,
    isFork: headRepo?.fork ?? false,
    installationId: typeof installationId === "number" ? installationId : null,
    action: "",
  };
}

export async function processOutboxEvent(event: OutboxEvent, payload: unknown, deps: PipelineDeps): Promise<PipelineOutcome> {
  const coords = payload as {
    repository?: { owner?: { login?: string }; name?: string };
    number?: number;
    pull_request?: { head?: { sha?: string }; base?: { sha?: string } };
  };
  const parsed = coordsFromPayload(coords);
  if (!parsed) throw new Error("unsupported-payload-shape");
  const token = deps.resolveToken
    ? await deps.resolveToken(parsed.installationId ?? null)
    : (deps.githubToken ?? null);
  const stages: StageDelivery[] = [];

  // Recheck the current head before writing: the payload SHA is captured,
  // and the stable external ID reconciles against any run already present.
  const analysisId = analysisIdFor(parsed.owner, parsed.repo, parsed.number, parsed.headSha);
  const reportUrl = reportUrlFor(deps.baseUrl, analysisId);
  const started = buildCheckRunPayload({
    owner: parsed.owner,
    repo: parsed.repo,
    number: parsed.number,
    headSha: parsed.headSha,
    status: "in_progress",
    reportUrl,
  });
  const startDelivery = await upsertCheckRun(started, parsed.owner, parsed.repo, token, deps.post);
  stages.push({ stage: "in_progress", delivered: startDelivery.delivered, reason: startDelivery.reason, mode: startDelivery.mode });

  const input = await deps.snapshotProvider(parsed);
  const report = await analyze(input);
  const persisted = await persistAnalysis(parsed, report, deps);
  const checkPayload = buildCheckRunPayload({
    owner: parsed.owner,
    repo: parsed.repo,
    number: parsed.number,
    headSha: parsed.headSha,
    status: "completed",
    reportUrl: persisted.reportUrl,
    report,
  });
  const delivery = await upsertCheckRun(checkPayload, parsed.owner, parsed.repo, token, deps.post);
  stages.push({ stage: "completed", delivered: delivery.delivered, reason: delivery.reason, mode: delivery.mode });
  return {
    analysisId: persisted.analysisId,
    report,
    reportUrl: persisted.reportUrl,
    checkPayload,
    delivered: delivery.delivered,
    deliveryReason: delivery.reason,
    stages,
  };
}

/**
 * Re-deliver a completed report when its check run is re-requested: the
 * stable external ID finds the stored analysis, which is re-published
 * instead of re-analyzed.
 */
export async function handleCheckRerequest(
  externalId: string | null,
  deps: Pick<PipelineDeps, "store" | "baseUrl" | "githubToken" | "resolveToken" | "post">,
): Promise<{ redelivered: boolean; reason: string }> {
  if (!externalId) return { redelivered: false, reason: "missing-external-id" };
  const stored = await deps.store.get(externalId);
  if (!stored) return { redelivered: false, reason: "unknown-analysis" };
  const token = deps.resolveToken
    ? await deps.resolveToken(null)
    : (deps.githubToken ?? null);
  const checkPayload = buildCheckRunPayload({
    owner: stored.owner,
    repo: stored.repo,
    number: stored.number,
    headSha: stored.headSha,
    status: "completed",
    reportUrl: reportUrlFor(deps.baseUrl, stored.id),
    report: stored.report,
  });
  const delivery = await upsertCheckRun(checkPayload, stored.owner, stored.repo, token, deps.post);
  return { redelivered: delivery.delivered, reason: delivery.reason };
}

async function persistAnalysis(
  coords: PullRequestCoords,
  report: ImpactReport,
  deps: PipelineDeps,
): Promise<{ analysisId: string; reportUrl: string }> {
  const analysisId = analysisIdFor(coords.owner, coords.repo, coords.number, coords.headSha);
  await deps.store.save(analysisId, report, {
    owner: coords.owner,
    repo: coords.repo,
    number: coords.number,
    headSha: coords.headSha,
    baseSha: coords.baseSha,
  });
  return { analysisId, reportUrl: reportUrlFor(deps.baseUrl, analysisId) };
}

/** Drain queued outbox events through the pipeline with bounded attempts. */
export async function drainQueue(
  deps: PipelineDeps,
  payloads?: Map<string, unknown>,
): Promise<{ completed: string[]; failed: { deliveryId: string; error: string }[] }> {
  const completed: string[] = [];
  const failed: { deliveryId: string; error: string }[] = [];
  let event = await deps.outbox.nextQueued();
  while (event) {
    await deps.outbox.markProcessing(event.deliveryId);
    try {
      const payload = payloads?.get(event.deliveryId) ?? (await deps.outbox.readPayload(event.deliveryId));
      if (payload === undefined) throw new Error("payload-missing");
      const outcome = await processOutboxEvent(event, payload, deps);
      await deps.outbox.markCompleted(event.deliveryId, outcome.analysisId);
      logEvent("info", "analysis_completed", { delivery: event.deliveryId, analysisId: outcome.analysisId });
      completed.push(event.deliveryId);
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown-error";
      if (event.attempts >= MAX_JOB_ATTEMPTS) {
        await deps.outbox.markFailed(event.deliveryId, message);
        logEvent("error", "analysis_failed", { delivery: event.deliveryId, error: message });
        failed.push({ deliveryId: event.deliveryId, error: message });
      } else {
        // Requeue for another attempt; attempts were already incremented.
        await deps.outbox.markQueued(event.deliveryId);
      }
    }
    event = await deps.outbox.nextQueued();
  }
  return { completed, failed };
}

export { supportedPullRequestAction };
