/**
 * Store selection: Postgres when DATABASE_URL is set, local stores
 * otherwise. Development keeps working with zero setup; production gets
 * durable, multi-instance-safe persistence without code changes.
 */
import { outbox as memoryOutbox, type OutboxStore } from "@/github/outbox";
import { createMemoryFeedbackStore, type FeedbackStore } from "@/reports/feedback";
import { createPostgresFeedbackStore } from "./pg-feedback";
import { sharedReportStore, type ReportStore } from "@/reports/store";
import { createPostgresOutbox } from "./pg-outbox";
import { createPostgresReportStore } from "./pg-reports";
import { createPostgresClient, type SqlClient } from "./sql";

let sql: SqlClient | null = null;
let pgOutbox: OutboxStore | null = null;
let pgReports: ReportStore | null = null;
let pgFeedback: FeedbackStore | null = null;
let memoryFeedback: FeedbackStore | null = null;

export function databaseUrl(env: NodeJS.ProcessEnv = process.env): string | null {
  return env.DATABASE_URL ?? null;
}

function pgSql(): SqlClient | null {
  const url = databaseUrl();
  if (!url) return null;
  if (!sql) sql = createPostgresClient(url);
  return sql;
}

export function getOutbox(): OutboxStore {
  const client = pgSql();
  if (!client) return memoryOutbox;
  if (!pgOutbox) pgOutbox = createPostgresOutbox(client);
  return pgOutbox;
}

export function getReportStore(): ReportStore {
  const client = pgSql();
  if (!client) return sharedReportStore();
  if (!pgReports) pgReports = createPostgresReportStore(client);
  return pgReports;
}

export function getFeedbackStore(): FeedbackStore {
  const client = pgSql();
  if (!client) {
    if (!memoryFeedback) memoryFeedback = createMemoryFeedbackStore();
    return memoryFeedback;
  }
  if (!pgFeedback) pgFeedback = createPostgresFeedbackStore(client);
  return pgFeedback;
}
