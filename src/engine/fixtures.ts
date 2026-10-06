/**
 * Analysis fixtures (docs/09: measure against fixtures).
 * Each scenario mirrors a documented example:
 * - auth migration → overview §6 / strategy §4 (deterministic boundary:
 *   the semantic billing conflict needs AI enrichment and must NOT appear)
 * - env var → docs/08 worked report (PAYMENT_WEBHOOK_SECRET)
 * - role enum → overview §8 / strategy §4 (schema/UI mismatch)
 * - export rename → docs/04 rule family 4
 * - method + ghost route → docs/04 rule family 2
 */

import type { AnalysisInput, FileChange, RepoFile } from "./types";

export interface ScenarioFile {
  path: string;
  base: string | null;
  head: string | null;
}

export function toInput(scenario: ScenarioFile[], unchanged: RepoFile[] = []): AnalysisInput {
  const changes: FileChange[] = scenario.map((file) => ({ path: file.path, base: file.base, head: file.head }));
  return { files: unchanged, changes };
}

const AUTH_LIB = `export function getUser() {
  return { id: "user_1" };
}
`;

const AUTH_BILLING = `import Stripe from "stripe";
import { getUser } from "../../lib/auth";
import { UserFields } from "../../db/schema/users";

export async function getCustomer() {
  const user = getUser();
  return Stripe.customers.retrieve(user.id, { firebase_uid: user.id, fields: UserFields });
}
`;

export function authMigration(): AnalysisInput {
  return toInput(
    [
      {
        path: "middleware.ts",
        base: `import { getUser } from "./lib/auth";

export function checkSession(request: unknown) {
  return getUser();
}
`,
        head: `import { clerk } from "./lib/clerk";

export function checkSession(request: unknown) {
  return clerk(request);
}
`,
      },
      {
        path: "app/login/page.tsx",
        base: `export default function Page() {
  return null;
}
`,
        head: `import { checkSession } from "../../middleware";

export default function Page() {
  checkSession(null);
  return null;
}
`,
      },
      {
        path: "db/schema/users.ts",
        base: `export const UserFields = ["firebase_uid", "email"];
`,
        head: `export const UserFields = ["clerk_id", "email"];
`,
      },
    ],
    [
      { path: "lib/auth.ts", content: AUTH_LIB },
      { path: "api/billing/customers.ts", content: AUTH_BILLING },
    ],
  );
}

export function envVar(): AnalysisInput {
  return toInput(
    [
      {
        path: "app/checkout/page.tsx",
        base: null,
        head: `import { query } from "../../lib/db";

export default function Page() {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET;
  return query(secret);
}
`,
      },
    ],
    [
      { path: ".env.example", content: "STRIPE_KEY=\nDATABASE_URL=\n" },
      { path: "lib/db.ts", content: "export function query(input: unknown) {\n  return input;\n}\n" },
    ],
  );
}

export function envVarWithoutExample(): AnalysisInput {
  const input = envVar();
  return { ...input, files: input.files.filter((file) => file.path !== ".env.example") };
}

export function roleEnum(): AnalysisInput {
  return toInput([
    {
      path: "db/schema.prisma",
      base: "enum Role {\n  owner\n  admin\n  viewer\n}\n",
      head: "enum Role {\n  owner\n  editor\n  viewer\n}\n",
    },
    {
      path: "components/team/role-select.tsx",
      base: `export const OPTIONS = ["owner", "admin", "viewer"];
`,
      head: `export const OPTIONS = ["owner", "admin", "viewer"];

export function RoleSelector() {
  return OPTIONS;
}
`,
    },
  ]);
}

export function exportRename(): AnalysisInput {
  return toInput(
    [
      {
        path: "lib/format.ts",
        base: "export function oldHelper(value: string) {\n  return value.trim();\n}\n",
        head: "export function newHelper(value: string) {\n  return value.trim();\n}\n",
      },
    ],
    [
      {
        path: "app/settings/page.tsx",
        content: `import { oldHelper } from "../../lib/format";

export default function Page() {
  return oldHelper("hi");
}
`,
      },
    ],
  );
}

export function exportRenameClean(): AnalysisInput {
  const input = exportRename();
  return {
    ...input,
    files: [
      {
        path: "app/settings/page.tsx",
        content: `import { newHelper } from "../../lib/format";

export default function Page() {
  return newHelper("hi");
}
`,
      },
    ],
  };
}

export function apiContracts(): AnalysisInput {
  return toInput(
    [
      {
        path: "app/team/settings.tsx",
        base: null,
        head: `export function saveTeam() {
  fetch("/api/team/123", { method: "DELETE" });
  fetch("/api/ghost");
}
`,
      },
    ],
    [
      {
        path: "app/api/team/[id]/route.ts",
        content: `export async function GET() {
  return Response.json({});
}
`,
      },
    ],
  );
}

export function dynamicImport(): AnalysisInput {
  return toInput([
    {
      path: "app/loader.ts",
      base: null,
      head: `export async function load(lang: string) {
  const messages = await import("./locale/" + lang);
  return messages;
}
`,
    },
  ]);
}

/** Import chain a → b → c → d → e; change e to test depth bounding. */
export function importChain(): AnalysisInput {
  const link = (next: string) => `import { value } from "./${next}";\nexport const value = ${next}_value;\n`;
  return toInput(
    [
      {
        path: "e.ts",
        base: "export const value = 1;\n",
        head: "export const value = 2;\n",
      },
    ],
    [
      { path: "a.ts", content: link("b").replace("b_value", "a") },
      { path: "b.ts", content: link("c").replace("c_value", "b") },
      { path: "c.ts", content: link("d").replace("c_value", "c") },
      { path: "d.ts", content: `import { value } from "./e";\nexport const d = value;\n` },
    ],
  );
}

/** N added source files with exports and no tests, for the 20-finding cap. */
export function manyUntested(count: number): AnalysisInput {
  return toInput(
    Array.from({ length: count }, (_, index) => ({
      path: `lib/module-${index}.ts`,
      base: null,
      head: `export function helper${index}() {\n  return ${index};\n}\n`,
    })),
  );
}
