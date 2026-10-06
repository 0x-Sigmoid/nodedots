/**
 * Snapshot providers: the pipeline needs commit-pinned file contents, but a
 * PR webhook carries none (docs/13: never assume the payload has context).
 * Production retrieval (installation token + tree/diff APIs) arrives with
 * the GitHub App credentials; until then the dev provider serves a named
 * fixture so the full loop runs end to end.
 */
import type { AnalysisInput } from "@/engine/types";
import { apiContracts, authMigration, envVar, exportRename, roleEnum } from "@/engine/fixtures";

export interface PullRequestCoords {
  owner: string;
  repo: string;
  number: number;
  baseSha: string;
  headSha: string;
  /** Head repository when it differs (forks). Defaults to owner/repo. */
  headOwner?: string;
  headRepo?: string;
  isFork?: boolean;
  installationId?: number | null;
}

export type SnapshotProvider = (coords: PullRequestCoords) => Promise<AnalysisInput>;

const FIXTURES: Record<string, () => AnalysisInput> = {
  "auth-migration": authMigration,
  "env-var": envVar,
  "role-enum": roleEnum,
  "export-rename": exportRename,
  "api-contracts": apiContracts,
};

export function fixtureSnapshotProvider(name: string): SnapshotProvider {
  const build = FIXTURES[name];
  if (!build) throw new Error(`Unknown dev snapshot fixture: ${name}`);
  return () => Promise.resolve(build());
}

/** Dev provider from DEV_SNAPSHOT_FIXTURE (defaults to the docs/08 worked example). */
export function devSnapshotProvider(env: NodeJS.ProcessEnv = process.env): SnapshotProvider {
  return fixtureSnapshotProvider(env.DEV_SNAPSHOT_FIXTURE ?? "env-var");
}

export function fixtureNames(): string[] {
  return Object.keys(FIXTURES);
}
