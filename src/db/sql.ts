/**
 * Minimal SQL surface shared by the production driver (postgres-js) and the
 * test driver (PGlite). Stores depend only on this interface, so the same
 * statements run against real Postgres and the in-process test database.
 */
import postgres from "postgres";

function toParametrized(strings: TemplateStringsArray, values: unknown[]): { text: string; params: never[] } {
  let text = strings[0] ?? "";
  values.forEach((_, index) => {
    text += `$${index + 1}${strings[index + 1] ?? ""}`;
  });
  return { text, params: values as never[] };
}

export function createPostgresClient(url: string): SqlClient {
  const sql = postgres(url);
  return {
    query: async <T>(strings: TemplateStringsArray, ...values: unknown[]): Promise<T[]> => {
      const { text, params } = toParametrized(strings, values);
      const rows = await sql.unsafe(text, params);
      return rows as unknown as T[];
    },
    exec: async (script: string) => {
      await sql.unsafe(script);
    },
    close: () => sql.end(),
  };
}

export async function createPgliteClient(): Promise<SqlClient> {
  const { PGlite } = await import("@electric-sql/pglite");
  const db = new PGlite();
  return {
    query: async <T>(strings: TemplateStringsArray, ...values: unknown[]): Promise<T[]> => {
      const { text, params } = toParametrized(strings, values);
      const result = await db.query(text, params as unknown[]);
      return result.rows as T[];
    },
    exec: async (script: string) => {
      await db.exec(script);
    },
    close: async () => {
      await db.close();
    },
  };
}

export interface SqlClient {
  query<T = Record<string, unknown>>(strings: TemplateStringsArray, ...values: unknown[]): Promise<T[]>;
  exec(script: string): Promise<void>;
  close(): Promise<void>;
}
