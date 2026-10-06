/**
 * Check-run publication (docs/13): one advisory check per captured head SHA
 * with a stable analysis external ID, neutral beta conclusion, and a link to
 * the authenticated report. Summaries carry counts and states only — no
 * private code excerpts leave the report boundary by default.
 */
import type { ImpactReport } from "@/engine/types";

export interface CheckRunPayload {
  name: string;
  head_sha: string;
  external_id: string;
  status: "queued" | "in_progress" | "completed";
  conclusion: "neutral" | "success" | "failure" | null;
  output: {
    title: string;
    summary: string;
    text: string;
  };
}

export const CHECK_NAME = "NodeDots change review";

export function analysisIdFor(owner: string, repo: string, number: number, headSha: string): string {
  return `pr-${owner}-${repo}-${number}-${headSha.slice(0, 12)}`;
}

export function reportUrlFor(baseUrl: string, analysisId: string): string {
  return `${baseUrl.replace(/\/$/, "")}/reports/${analysisId}`;
}

export function buildCheckRunPayload(input: {
  owner: string;
  repo: string;
  number: number;
  headSha: string;
  status: "queued" | "in_progress" | "completed";
  reportUrl: string;
  report?: ImpactReport;
  error?: string;
}): CheckRunPayload {
  const externalId = analysisIdFor(input.owner, input.repo, input.number, input.headSha);
  if (input.status !== "completed") {
    return {
      name: CHECK_NAME,
      head_sha: input.headSha,
      external_id: externalId,
      status: input.status,
      conclusion: null,
      output: {
        title: `NodeDots is reviewing PR #${input.number}`,
        summary: "Change review in progress. The full report links here when complete.",
        text: `[Open the impact report](${input.reportUrl}) once analysis completes.`,
      },
    };
  }
  if (input.error || !input.report) {
    return {
      name: CHECK_NAME,
      head_sha: input.headSha,
      external_id: externalId,
      status: "completed",
      conclusion: "neutral",
      output: {
        title: `NodeDots could not complete PR #${input.number}`,
        summary: `Processing failure (not a code verdict): ${input.error ?? "unknown error"}.`,
        text: `Re-request the check or inspect delivery logs. Report reference: ${input.reportUrl}.`,
      },
    };
  }
  const report = input.report;
  const total =
    report.missing.length + report.conflicting.length + report.untested.length + report.actionRequired.length;
  return {
    name: CHECK_NAME,
    head_sha: input.headSha,
    external_id: externalId,
    status: "completed",
    // Advisory in beta regardless of findings: neutral is a status, not a verdict (docs/13).
    conclusion: "neutral",
    output: {
      title: `NodeDots reviewed PR #${input.number}: ${total} ${total === 1 ? "finding" : "findings"}`,
      summary: [
        `${report.missing.length} missing`,
        `${report.conflicting.length} conflicting`,
        `${report.untested.length} untested`,
        `${report.actionRequired.length} action required`,
        `${report.unknown.length} unknown`,
        `coverage ${report.coverage.completeness}`,
      ].join(" · "),
      text: [
        `## Before merging`,
        ...report.checklist.map((step, index) => `${index + 1}. ${step}`),
        ``,
        `[Open the full impact report](${input.reportUrl}) for evidence and coverage.`,
      ].join("\n"),
    },
  };
}

export interface DeliveryResult {
  delivered: boolean;
  reason: string;
}

/**
 * Deliver a check run to the GitHub API when an installation token is
 * available; otherwise record the intent for the future publication worker.
 * Tokens are never logged or persisted here.
 */
export async function deliverCheckRun(
  payload: CheckRunPayload,
  owner: string,
  repo: string,
  token: string | null,
  post: typeof fetch = fetch,
): Promise<DeliveryResult> {
  if (!token) return { delivered: false, reason: "missing-credentials" };
  const response = await post(`https://api.github.com/repos/${owner}/${repo}/check-runs`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) return { delivered: false, reason: `github-${response.status}` };
  return { delivered: true, reason: "created" };
}

/**
 * Reconcile before writing (docs/13): find our existing run for the head
 * SHA by stable external ID and PATCH it instead of creating a duplicate.
 */
export async function findExistingCheckRun(
  owner: string,
  repo: string,
  headSha: string,
  externalId: string,
  token: string,
  get: typeof fetch = fetch,
): Promise<number | null> {
  const response = await get(
    `https://api.github.com/repos/${owner}/${repo}/commits/${headSha}/check-runs?per_page=100`,
    { headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}` } },
  );
  if (!response.ok) return null;
  const body = (await response.json()) as { check_runs?: { id?: unknown; external_id?: unknown }[] };
  if (!Array.isArray(body.check_runs)) return null;
  for (const run of body.check_runs) {
    if (run.external_id === externalId && typeof run.id === "number") return run.id;
  }
  return null;
}

export async function upsertCheckRun(
  payload: CheckRunPayload,
  owner: string,
  repo: string,
  token: string | null,
  post: typeof fetch = fetch,
): Promise<DeliveryResult & { mode?: "created" | "updated" }> {
  if (!token) return { delivered: false, reason: "missing-credentials" };
  const existingId = await findExistingCheckRun(owner, repo, payload.head_sha, payload.external_id, token, post);
  if (existingId === null) {
    const created = await deliverCheckRun(payload, owner, repo, token, post);
    return created.delivered ? { ...created, mode: "created" } : created;
  }
  const response = await post(`https://api.github.com/repos/${owner}/${repo}/check-runs/${existingId}`, {
    method: "PATCH",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) return { delivered: false, reason: `github-${response.status}` };
  return { delivered: true, reason: "updated", mode: "updated" };
}
