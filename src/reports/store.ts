/**
 * Persisted analyses (docs/11: analyses + findings tables eventually).
 * Interface-first: the file store below carries development; the Postgres
 * implementation replaces it without touching the pipeline or viewer.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ImpactReport } from "@/engine/types";

export interface StoredAnalysis {
  id: string;
  savedAt: string;
  owner: string;
  repo: string;
  number: number;
  headSha: string;
  baseSha: string;
  report: ImpactReport;
}

export interface ReportStore {
  save(
    id: string,
    report: ImpactReport,
    coords: { owner: string; repo: string; number: number; headSha: string; baseSha: string },
  ): Promise<void>;
  get(id: string): Promise<StoredAnalysis | null>;
}

function sanitizeId(id: string): string | null {
  return /^[A-Za-z0-9][A-Za-z0-9_.-]*$/.test(id) ? id : null;
}

export function createMemoryReportStore(): ReportStore & { size(): number } {
  const analyses = new Map<string, StoredAnalysis>();
  return {
    save: (id, report, coords) => {
      analyses.set(id, { id, savedAt: new Date().toISOString(), ...coords, report });
      return Promise.resolve();
    },
    get: (id) => Promise.resolve(analyses.get(id) ?? null),
    size: () => analyses.size,
  };
}

export function createFileReportStore(dir: string): ReportStore {
  return {
    async save(id, report, coords) {
      const safe = sanitizeId(id);
      if (!safe) throw new Error("invalid-analysis-id");
      await mkdir(dir, { recursive: true });
      const stored: StoredAnalysis = { id: safe, savedAt: new Date().toISOString(), ...coords, report };
      await writeFile(path.join(dir, `${safe}.json`), JSON.stringify(stored));
    },
    async get(id) {
      const safe = sanitizeId(id);
      if (!safe) return null;
      try {
        const raw = await readFile(path.join(dir, `${safe}.json`), "utf8");
        return JSON.parse(raw) as StoredAnalysis;
      } catch {
        return null;
      }
    },
  };
}

export function defaultStoreDir(): string {
  return process.env.REPORT_STORE_DIR ?? path.join(process.cwd(), ".data", "reports");
}

/** Module-level file store shared by the webhook route and report pages in-process. */
let shared: ReportStore | null = null;

export function sharedReportStore(): ReportStore {
  if (!shared) shared = createFileReportStore(defaultStoreDir());
  return shared;
}
