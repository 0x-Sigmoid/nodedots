/**
 * Migration runner: applies src/db/migrations/*.sql in order.
 * Usage: DATABASE_URL=... npm run db:migrate
 * Idempotent (IF NOT EXISTS, additive only); review SQL before applying.
 * Self-contained (no repo imports) so it runs on plain Node.
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

const here = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required");
  const dir = path.join(here, "..", "src", "db", "migrations");
  const files = (await readdir(dir)).filter((file) => file.endsWith(".sql")).sort();
  if (files.length === 0) throw new Error(`No migrations in ${dir}`);
  const sql = postgres(url);
  try {
    for (const file of files) {
      await sql.unsafe(await readFile(path.join(dir, file), "utf8"));
      console.log(`applied ${file}`);
    }
  } finally {
    await sql.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
