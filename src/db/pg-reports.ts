/**
 * Postgres report store (docs/11 tables analyses + findings +
 * finding_evidence). The served artifact is the report JSONB; the finding
 * rows are the queryable index (by state/severity) for future dashboards.
 * Saves are idempotent upserts so a retried job never double-records.
 */
import type { SqlClient } from "./sql";
import type { Finding } from "@/engine/types";
import type { ReportStore, StoredAnalysis } from "@/reports/store";

function findingId(analysisId: string, fingerprint: string): string {
  return `${analysisId}:${fingerprint}`;
}

export function createPostgresReportStore(sql: SqlClient): ReportStore {
  return {
    async save(id, report, coords) {
      await sql.query`
        INSERT INTO analyses (id, owner, repo, pr_number, head_sha, base_sha, status, completeness, report)
        VALUES (${id}, ${coords.owner}, ${coords.repo}, ${coords.number}, ${coords.headSha}, ${coords.baseSha}, 'completed', ${report.coverage.completeness}, ${JSON.stringify(report)}::jsonb)
        ON CONFLICT (id) DO UPDATE SET report = EXCLUDED.report, completeness = EXCLUDED.completeness, status = 'completed'
      `;
      await sql.query`DELETE FROM findings WHERE analysis_id = ${id}`;
      const all: Finding[] = [...report.missing, ...report.conflicting, ...report.untested, ...report.actionRequired];
      for (const finding of all) {
        const fid = findingId(id, finding.fingerprint);
        await sql.query`
          INSERT INTO findings (id, analysis_id, fingerprint, rule_id, rule_version, state, facet, severity, confidence, confidence_explanation, origin, title, explanation, next_step)
          VALUES (${fid}, ${id}, ${finding.fingerprint}, ${finding.ruleId}, ${finding.ruleVersion}, ${finding.state}, ${finding.facet}, ${finding.severity}, ${finding.confidence.band}, ${finding.confidence.explanation}, ${finding.origin}, ${finding.title}, ${finding.explanation}, ${finding.nextStep})
        `;
        const evidence = finding.evidence.map((entry, index) => ({
          id: `${fid}:${index}`,
          path: entry.path,
          startLine: entry.startLine,
          endLine: entry.endLine,
          origin: entry.origin,
          baseSide: entry.baseSide === true,
          note: entry.note,
        }));
        for (const entry of evidence) {
          await sql.query`
            INSERT INTO finding_evidence (id, finding_id, path, start_line, end_line, origin, base_side, note)
            VALUES (${entry.id}, ${fid}, ${entry.path}, ${entry.startLine}, ${entry.endLine}, ${entry.origin}, ${entry.baseSide}, ${entry.note})
          `;
        }
      }
    },
    async get(id) {
      const rows = await sql.query<{
        id: string;
        owner: string;
        repo: string;
        pr_number: number;
        head_sha: string;
        base_sha: string;
        created_at: string;
        report: unknown;
      }>`
        SELECT id, owner, repo, pr_number, head_sha, base_sha, created_at, report FROM analyses WHERE id = ${id}
      `;
      const row = rows[0];
      if (!row) return null;
      const report = typeof row.report === "string" ? JSON.parse(row.report) : row.report;
      return {
        id: row.id,
        savedAt: new Date(row.created_at).toISOString(),
        owner: row.owner,
        repo: row.repo,
        number: row.pr_number,
        headSha: row.head_sha,
        baseSha: row.base_sha,
        report: report as StoredAnalysis["report"],
      };
    },
  };
}
