/**
 * Postgres stores verified against real SQL via PGlite (in-process
 * Postgres). The same statements run unmodified against managed Postgres.
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { analyze } from "@/engine/index";
import { envVar } from "@/engine/fixtures";
import { createPostgresOutbox } from "./pg-outbox";
import { createPostgresReportStore } from "./pg-reports";
import { createPgliteClient, type SqlClient } from "./sql";

let sql: SqlClient | null = null;

async function testDb(): Promise<SqlClient> {
  if (!sql) {
    sql = await createPgliteClient();
    const dir = path.join(import.meta.dirname, "migrations");
    const files = (await readdir(dir)).filter((file) => file.endsWith(".sql")).sort();
    for (const file of files) {
      await sql.exec(await readFile(path.join(dir, file), "utf8"));
    }
  }
  return sql;
}

afterAll(async () => {
  await sql?.close();
  sql = null;
}, 30000);

beforeAll(async () => {
  await testDb();
}, 60000);

describe("postgres outbox", () => {
  it("dedupes deliveries and drains through completion", async () => {
    const db = await testDb();
    const outbox = createPostgresOutbox(db);
    const event = {
      deliveryId: "pg-1",
      event: "pull_request",
      action: "opened",
      owner: "octo",
      repo: "demo",
      installationId: 1,
      payloadHash: "h",
      receivedAt: 0,
      payload: { hello: true },
    };
    expect(await outbox.receive(event)).toEqual({ duplicate: false });
    expect(await outbox.receive(event)).toEqual({ duplicate: true });
    expect(await outbox.readPayload("pg-1")).toEqual({ hello: true });
    expect((await outbox.nextQueued())?.deliveryId).toBe("pg-1");
    await outbox.markProcessing("pg-1");
    expect((await outbox.get("pg-1"))?.attempts).toBe(1);
    await outbox.markQueued("pg-1");
    expect((await outbox.nextQueued())?.deliveryId).toBe("pg-1");
    await outbox.markProcessing("pg-1");
    await outbox.markCompleted("pg-1", "pr-x");
    expect((await outbox.get("pg-1"))?.status).toBe("completed");
    expect(await outbox.pendingCount()).toBe(0);
  });

  it("records failures with the error", async () => {
    const db = await testDb();
    const outbox = createPostgresOutbox(db);
    await outbox.receive({
      deliveryId: "pg-2",
      event: "pull_request",
      action: "opened",
      owner: null,
      repo: null,
      installationId: null,
      payloadHash: "h",
      receivedAt: 0,
      payload: {},
    });
    await outbox.markProcessing("pg-2");
    await outbox.markFailed("pg-2", "boom");
    expect((await outbox.get("pg-2"))?.lastError).toBe("boom");
  });
});

describe("postgres report store", () => {
  it("persists reports with queryable finding rows", async () => {
    const db = await testDb();
    const store = createPostgresReportStore(db);
    const report = await analyze(envVar());
    await store.save("pr-octo-demo-7-abc", report, {
      owner: "octo",
      repo: "demo",
      number: 7,
      headSha: "abc",
      baseSha: "def",
    });
    const stored = await store.get("pr-octo-demo-7-abc");
    expect(stored?.owner).toBe("octo");
    expect(stored?.report.missing.map((item) => item.ruleId)).toContain("ENV_EXAMPLE_001");
    const rows = await db.query<{ rule_id: string; state: string }>`
      SELECT rule_id, state FROM findings WHERE analysis_id = 'pr-octo-demo-7-abc'
    `;
    expect(rows.some((row) => row.rule_id === "ENV_EXAMPLE_001" && row.state === "MISSING")).toBe(true);
    const evidence = await db.query<{ path: string }>`
      SELECT path FROM finding_evidence WHERE finding_id LIKE 'pr-octo-demo-7-abc:%'
    `;
    expect(evidence.length).toBeGreaterThan(0);
    // Idempotent re-save (retried jobs never double-record).
    const before = await db.query<{ count: string }>`
      SELECT COUNT(*)::text AS count FROM findings WHERE analysis_id = 'pr-octo-demo-7-abc'
    `;
    await store.save("pr-octo-demo-7-abc", report, {
      owner: "octo",
      repo: "demo",
      number: 7,
      headSha: "abc",
      baseSha: "def",
    });
    const after = await db.query<{ count: string }>`
      SELECT COUNT(*)::text AS count FROM findings WHERE analysis_id = 'pr-octo-demo-7-abc'
    `;
    expect(after[0]?.count).toBe(before[0]?.count);
    expect(await store.get("unknown-id")).toBeNull();
  });
});

describe("postgres feedback store", () => {
  it("resolves latest-wins and honors cleared reviews", async () => {
    const db = await testDb();
    const { createPostgresFeedbackStore } = await import("./pg-feedback");
    const store = createPostgresFeedbackStore(db);
    await store.record({ analysisId: "pg-fb", fingerprint: "f1", disposition: "accepted" });
    await new Promise((resolve) => setTimeout(resolve, 5));
    await store.record({ analysisId: "pg-fb", fingerprint: "f1", disposition: "dismissed" });
    await store.record({ analysisId: "pg-fb", fingerprint: "f2", disposition: "fixed", reason: "patched" });
    expect(await store.forAnalysis("pg-fb")).toEqual({ f1: "dismissed", f2: "fixed" });
    await store.record({ analysisId: "pg-fb", fingerprint: "f2", disposition: "cleared" });
    expect(await store.forAnalysis("pg-fb")).toEqual({ f1: "dismissed" });
    const history = await store.history("pg-fb", "f2");
    expect(history.map((event) => event.disposition)).toEqual(["fixed", "cleared"]);
  });
});

describe("store selection", () => {
  it("uses local stores without DATABASE_URL", async () => {
    const { databaseUrl } = await import("./index");
    expect(databaseUrl({} as NodeJS.ProcessEnv)).toBeNull();
  });
});
