import { describe, expect, it } from "vitest";
import { analysisIdFor, buildCheckRunPayload, deliverCheckRun, reportUrlFor, upsertCheckRun } from "./checks";
import { createMemoryOutbox } from "./outbox";
import { coordsFromPayload, drainQueue, handleCheckRerequest, processOutboxEvent } from "./pipeline";
import { createMemoryReportStore } from "@/reports/store";
import { envVar } from "@/engine/fixtures";

const PR_PAYLOAD = {
  action: "opened",
  number: 7,
  repository: { name: "demo", owner: { login: "octo" } },
  pull_request: { head: { sha: "a".repeat(40) }, base: { sha: "b".repeat(40) } },
  installation: { id: 123 },
};

function deps() {
  return {
    outbox: createMemoryOutbox(),
    store: createMemoryReportStore(),
    snapshotProvider: () => Promise.resolve(envVar()),
    baseUrl: "http://localhost:3000",
    githubToken: null as string | null,
  };
}

describe("pipeline", () => {
  it("parses PR coordinates and rejects malformed payloads", () => {
    expect(coordsFromPayload(PR_PAYLOAD)?.owner).toBe("octo");
    expect(coordsFromPayload({})).toBeNull();
    expect(coordsFromPayload({ ...PR_PAYLOAD, number: "7" } as unknown as typeof PR_PAYLOAD)).toBeNull();
  });

  it("runs receipt to persisted report with a neutral check payload", async () => {
    const dependencies = deps();
    const event = {
      deliveryId: "d1",
      event: "pull_request",
      action: "opened",
      owner: "octo",
      repo: "demo",
      installationId: 123,
      payloadHash: "hash",
      receivedAt: 0,
      payload: PR_PAYLOAD,
    };
    expect(await dependencies.outbox.receive(event)).toEqual({ duplicate: false });
    expect(await dependencies.outbox.receive(event)).toEqual({ duplicate: true });

    const outcome = await processOutboxEvent(
      { ...event, status: "queued" as const, attempts: 0, lastError: null, analysisId: null },
      PR_PAYLOAD,
      dependencies,
    );
    expect(outcome.analysisId).toBe(`pr-octo-demo-7-${"a".repeat(12)}`);
    expect(outcome.reportUrl).toBe(`http://localhost:3000/reports/${outcome.analysisId}`);
    expect(outcome.report.missing.map((item) => item.ruleId)).toContain("ENV_EXAMPLE_001");
    expect(await dependencies.store.get(outcome.analysisId)).not.toBeNull();

    // Beta conclusion is neutral and summaries carry no code excerpts.
    expect(outcome.checkPayload.conclusion).toBe("neutral");
    expect(outcome.checkPayload.external_id).toBe(outcome.analysisId);
    expect(outcome.checkPayload.output.text).toContain(outcome.reportUrl);
    expect(outcome.checkPayload.output.summary).not.toContain(".ts");
    expect(outcome.checkPayload.output.summary).not.toContain("process.env");
    expect(outcome.delivered).toBe(false);
    expect(outcome.deliveryReason).toBe("missing-credentials");
  });

  it("drains queued events and dead-letters poison payloads after bounded attempts", async () => {
    const dependencies = deps();
    await dependencies.outbox.receive({
      deliveryId: "good",
      event: "pull_request",
      action: "opened",
      owner: "octo",
      repo: "demo",
      installationId: 1,
      payloadHash: "h",
      receivedAt: 0,
      payload: PR_PAYLOAD,
    });
    await dependencies.outbox.receive({
      deliveryId: "bad",
      event: "pull_request",
      action: "opened",
      owner: "octo",
      repo: "demo",
      installationId: 1,
      payloadHash: "h",
      receivedAt: 0,
      payload: { nonsense: true },
    });

    const result = await drainQueue(dependencies);
    expect(result.completed).toEqual(["good"]);
    expect(result.failed).toHaveLength(1);
    expect((await dependencies.outbox.get("good"))?.status).toBe("completed");
    expect((await dependencies.outbox.get("good"))?.analysisId).toContain("pr-octo-demo-7-");
    expect((await dependencies.outbox.get("bad"))?.status).toBe("failed");
    expect((await dependencies.outbox.get("bad"))?.attempts).toBe(3);
    expect(await dependencies.outbox.pendingCount()).toBe(0);
  });
});

describe("check delivery", () => {
  const payload = buildCheckRunPayload({
    owner: "octo",
    repo: "demo",
    number: 7,
    headSha: "a".repeat(40),
    status: "completed",
    reportUrl: "http://localhost:3000/reports/pr-octo-demo-7-aaaaaaaaaaaa",
    report: undefined,
    error: "boom",
  });

  it("builds stable ids and report links", () => {
    expect(analysisIdFor("octo", "demo", 7, "a".repeat(40))).toBe("pr-octo-demo-7-aaaaaaaaaaaa");
    expect(reportUrlFor("http://localhost:3000/", "x")).toBe("http://localhost:3000/reports/x");
    expect(payload.external_id).toBe("pr-octo-demo-7-aaaaaaaaaaaa");
    expect(payload.output.text).toContain("http://localhost:3000/reports/pr-octo-demo-7-aaaaaaaaaaaa");
  });

  it("records intent without credentials and posts with a token", async () => {
    expect((await deliverCheckRun(payload, "octo", "demo", null)).delivered).toBe(false);
    const calls: string[] = [];
    const stub = ((url: string) => {
      calls.push(url);
      return Promise.resolve({ ok: true, status: 201 });
    }) as unknown as typeof fetch;
    const result = await deliverCheckRun(payload, "octo", "demo", "token", stub);
    expect(result).toEqual({ delivered: true, reason: "created" });
    expect(calls).toEqual(["https://api.github.com/repos/octo/demo/check-runs"]);
  });

  it("reconciles by external ID instead of duplicating runs", async () => {
    const calls: { method: string; url: string }[] = [];
    const stub = ((url: string, init?: { method?: string }) => {
      calls.push({ method: init?.method ?? "GET", url });
      if (url.includes("/check-runs?")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers(),
          json: () => Promise.resolve({ check_runs: [{ id: 99, external_id: payload.external_id }] }),
        });
      }
      return Promise.resolve({ ok: true, status: 200, headers: new Headers(), json: () => Promise.resolve({}) });
    }) as unknown as typeof fetch;
    const result = await upsertCheckRun(payload, "octo", "demo", "token", stub);
    expect(result).toEqual({ delivered: true, reason: "updated", mode: "updated" });
    expect(calls.some((call) => call.method === "PATCH" && call.url.endsWith("/check-runs/99"))).toBe(true);
    expect(calls.some((call) => call.method === "POST")).toBe(false);
  });
});

describe("staged delivery and rerequests", () => {
  function apiStub() {
    const calls: { method: string; url: string; body?: unknown }[] = [];
    const post = (async (url: string, init?: { method?: string; body?: string }) => {
      calls.push({ method: init?.method ?? "GET", url, body: init?.body ? JSON.parse(init.body) : undefined });
      if (url.includes("/check-runs?")) {
        return { ok: true, status: 200, headers: new Headers(), json: () => Promise.resolve({ check_runs: [] }) };
      }
      return { ok: true, status: 201, headers: new Headers(), json: () => Promise.resolve({}) };
    }) as unknown as typeof fetch;
    return { post, calls };
  }

  it("publishes in_progress then completed through upsert", async () => {
    const dependencies = deps();
    const { post, calls } = apiStub();
    const event = {
      deliveryId: "staged",
      event: "pull_request",
      action: "opened",
      owner: "octo",
      repo: "demo",
      installationId: 1,
      payloadHash: "h",
      receivedAt: 0,
    };
    const outcome = await processOutboxEvent(
      { ...event, status: "queued" as const, attempts: 0, lastError: null, analysisId: null },
      PR_PAYLOAD,
      { ...dependencies, post, resolveToken: () => Promise.resolve("tok") },
    );
    expect(outcome.stages.map((stage) => stage.stage)).toEqual(["in_progress", "completed"]);
    expect(outcome.stages.every((stage) => stage.delivered && stage.mode === "created")).toBe(true);
    const posted = calls.filter((call) => call.method === "POST");
    expect(posted).toHaveLength(2);
    expect((posted[0]?.body as { status: string }).status).toBe("in_progress");
    expect((posted[1]?.body as { status: string }).status).toBe("completed");
  });

  it("re-delivers stored reports on rerequest and ignores unknown ids", async () => {
    const dependencies = deps();
    const { post } = apiStub();
    const withPost = { ...dependencies, post, resolveToken: () => Promise.resolve("tok") };
    const outcome = await processOutboxEvent(
      {
        deliveryId: "orig",
        event: "pull_request",
        action: "opened",
        owner: "octo",
        repo: "demo",
        installationId: 1,
        payloadHash: "h",
        receivedAt: 0,
        status: "queued" as const,
        attempts: 0,
        lastError: null,
        analysisId: null,
      },
      PR_PAYLOAD,
      withPost,
    );
    const redelivered = await handleCheckRerequest(outcome.analysisId, withPost);
    expect(redelivered).toEqual({ redelivered: true, reason: "created" });
    const missing = await handleCheckRerequest("pr-nope-0-000000000000", withPost);
    expect(missing).toEqual({ redelivered: false, reason: "unknown-analysis" });
    const noId = await handleCheckRerequest(null, withPost);
    expect(noId).toEqual({ redelivered: false, reason: "missing-external-id" });
  });
});
