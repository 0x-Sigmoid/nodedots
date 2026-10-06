/**
 * Retention runner: purges file report rows older than the retention window.
 * Usage: REPORT_STORE_DIR=.data/reports npm run retention
 * (REPORT_RETENTION_DAYS overrides the 90-day default).
 * Self-contained (no repo imports) so it runs on plain Node.
 */
import { readdir, stat, unlink } from "node:fs/promises";
import path from "node:path";

const DAY_MS = 24 * 60 * 60 * 1000;

async function main() {
  const dir = process.env.REPORT_STORE_DIR ?? path.join(process.cwd(), ".data", "reports");
  const days = Number(process.env.REPORT_RETENTION_DAYS ?? 90);
  if (!Number.isFinite(days) || days <= 0) throw new Error("REPORT_RETENTION_DAYS must be a positive number");
  const cutoff = Date.now() - days * DAY_MS;
  let entries = [];
  try {
    entries = await readdir(dir);
  } catch {
    console.log(`retention: ${dir} absent, nothing to purge`);
    return;
  }
  let removed = 0;
  let kept = 0;
  for (const name of entries) {
    if (!name.endsWith(".json")) continue;
    const full = path.join(dir, name);
    const mtime = (await stat(full)).mtimeMs;
    if (mtime < cutoff) {
      await unlink(full);
      removed += 1;
    } else {
      kept += 1;
    }
  }
  console.log(`retention: removed=${removed} kept=${kept} dir=${dir}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
