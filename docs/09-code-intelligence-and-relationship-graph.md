# 09 · Code Intelligence & Relationship Graph Specification

Version: 0.1 · Status: proposed · Owner: Intelligence Engineering

## Graph purpose

Represent inspectable software relationships at immutable repository snapshots. Optimize for change relevance and provenance rather than maximizing edges. Every fact or inferred relationship identifies its source and extraction method.

## Node types

| Type | V1 extraction |
|---|---|
| Repository, PullRequest, Snapshot | GitHub metadata and captured SHAs |
| File | Eligible tree/blob manifest |
| Function, Component, Symbol | Supported TS/JS syntax |
| API | Supported Next.js route/method patterns |
| DatabaseTable, DatabaseField | Prisma model and field extraction |
| EnvironmentVariable | Literal supported environment references and example names |
| Test | Supported test declarations/files |
| Service | Explicit configured provider identifier or grounded inference |
| Issue, Requirement, ArchitecturalDecision | Later structured extraction; PR intent remains evidence in V1 |

Stable logical IDs use repository ID, normalized path, node kind, and qualified symbol identity. Snapshot node IDs are distinct from logical IDs. Renames are linked only through Git metadata or supported structural matching; ambiguous renames remain unresolved.

## Edge types and traversal

| Edge | Direction | Provenance |
|---|---|---|
| `CONTAINS` | File → symbol | Parser range |
| `IMPORTS` | Importer → imported file/symbol | Resolved import span |
| `CALLS` | Caller → callee | Resolved static call |
| `DEPENDS_ON` | Consumer → dependency | Specific derived path or labeled inference |
| `READS_FROM`, `WRITES_TO` | API/function → table/field | Supported access expression |
| `TESTED_BY` | Symbol/feature → test | Explicit import/use; heuristics labeled weaker |
| `CONFIGURED_BY` | Consumer → environment variable | Reference span |
| `IMPLEMENTS` | Symbol/API → requirement | Later verified requirement linkage |
| `AFFECTS` | Changed entity → affected entity | Derived path with analysis ID; not a parser fact |

Impact often follows reverse IMPORTS/CALLS/DEPENDS_ON to consumers and forward CONFIGURED_BY/READS_FROM/WRITES_TO to contracts. TESTED_BY discovers related tests; CONTAINS maps diff locations. Do not traverse every edge indiscriminately.

## Extraction rules

Parse source without execution. Resolve relative paths and configured TS aliases within repository bounds. Record unresolved imports rather than pretending they are absent. Extract static calls only when resolution is defensible; reflection, dynamic imports, computed environment names, and dependency injection may be unknown.

Test naming proximity is a candidate relationship, not proof of behavior coverage. A test import can establish association without proving assertions exercise the changed behavior. API/schema checks require a resolved model and mapping context.

## Evidence envelope

Each node/edge includes organization, repository, snapshot, source path, commit SHA, line range where applicable, blob hash, parser/rule version, origin (`parser`, `rule`, `ai`), confidence band, and creation timestamp. An inferred edge also stores supporting and opposing evidence IDs.

## Incremental update algorithm

Create the new snapshot manifest. Reuse eligible blob extraction within the same tenant/repository/version scope. Re-extract changed files, remove facts belonging to deleted files in the new snapshot, and recompute import resolution for dependents of changed exports or config. Never mutate the base snapshot. Persist snapshot completion atomically only after coverage and graph references validate.

## Impact budget and unknowns

Default depth is three with 1,000 visited entities. Cycle detection uses snapshot node IDs. Return shortest useful explanation paths and additional-path counts. Record skipped languages, missing submodules, large files, unresolved symbols, traversal truncation, and excluded paths as coverage limitations. No path means “no detected relationship,” not “no impact.”

## Quality and evolution

Measure import resolution accuracy, supported node/edge extraction precision, stale-edge rate, and citation correctness against fixtures. PostgreSQL indexes target `(org_id, snapshot_id, source_node_id, relation)` and corresponding reverse lookups. Dedicated graph storage and cross-repository lineage require measured need and a separate access model.
