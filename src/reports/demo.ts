/**
 * Demo report registry: runs the deterministic engine over the built-in
 * fixtures so the report viewer works with zero backend. Each entry maps a
 * stable id to a documented scenario; unknown ids resolve to undefined and
 * the route renders not-found.
 */
import {
  apiContracts,
  authMigration,
  envVar,
  exportRename,
  roleEnum,
} from "@/engine/fixtures";
import { analyze } from "@/engine/index";
import type { DotState } from "@/components/state-dot";
import type { Evidence, Finding, ImpactReport } from "@/engine/types";

export interface DemoScenario {
  id: string;
  title: string;
  change: string;
  description: string;
  build: () => Parameters<typeof analyze>[0];
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: "auth-migration",
    title: "Change authentication",
    change: "Replace Firebase Auth with Clerk",
    description: "Auth boundary review with affected billing consumers and untested behavior.",
    build: authMigration,
  },
  {
    id: "env-var",
    title: "Add a webhook secret",
    change: "Introduce PAYMENT_WEBHOOK_SECRET",
    description: "The docs/08 worked example: a new secret missing from the example inventory.",
    build: envVar,
  },
  {
    id: "role-enum",
    title: "Add team roles",
    change: "Introduce an editor role for teams",
    description: "Schema enum and UI option list disagree on valid roles.",
    build: roleEnum,
  },
  {
    id: "export-rename",
    title: "Rename a helper",
    change: "Rename oldHelper to newHelper",
    description: "A removed export with a conclusive base-side citation in its importer.",
    build: exportRename,
  },
  {
    id: "api-contracts",
    title: "Call team APIs",
    change: "Delete a team and fetch team data",
    description: "Method mismatch against a parsed route plus a fetch with no matching route.",
    build: apiContracts,
  },
];

const reportCache = new Map<string, ImpactReport>();

export function getDemoIds(): string[] {
  return DEMO_SCENARIOS.map((scenario) => scenario.id);
}

export function getDemoScenario(id: string): DemoScenario | undefined {
  return DEMO_SCENARIOS.find((scenario) => scenario.id === id);
}

export function getDemoReport(id: string): ImpactReport | undefined {
  const scenario = getDemoScenario(id);
  if (!scenario) return undefined;
  const cached = reportCache.get(id);
  if (cached) return cached;
  const report = analyze(scenario.build());
  reportCache.set(id, report);
  return report;
}

export type Disposition = "accepted" | "dismissed" | "fixed" | "intentional";

export const DISPOSITIONS: { value: Disposition; label: string }[] = [
  { value: "accepted", label: "Accepted" },
  { value: "dismissed", label: "Dismissed" },
  { value: "fixed", label: "Fixed" },
  { value: "intentional", label: "Intentional" },
];

/** `api/billing/customers.ts:42` or `api/x.ts:42–48`, with a base-side tag for removals. */
export function formatEvidence(evidence: Evidence): string {
  const range =
    evidence.startLine === evidence.endLine
      ? `${evidence.startLine}`
      : `${evidence.startLine}–${evidence.endLine}`;
  return `${evidence.path}:${range}${evidence.baseSide === true ? " (base)" : ""}`;
}

export const STATE_LABEL: Record<Finding["state"], string> = {
  CONFIRMED: "Confirmed",
  MISSING: "Missing",
  CONFLICTING: "Conflicting",
  UNCERTAIN: "Uncertain",
  ACTION_REQUIRED: "Action required",
};

/** Lowercase state key for the `state-*` CSS classes shared with the landing. */
export function stateClass(state: Finding["state"]): DotState {
  if (state === "ACTION_REQUIRED") return "action";
  return state.toLowerCase() as DotState;
}

export const COMPLETENESS_LABEL = {
  full: "Full analysis",
  partial: "Partial analysis",
  unsupported: "Unsupported scope",
} as const;

export function countBy<T>(items: T[], predicate: (item: T) => boolean): number {
  return items.filter(predicate).length;
}
