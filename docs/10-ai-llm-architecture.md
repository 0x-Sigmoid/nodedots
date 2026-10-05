# 10 · AI/LLM Architecture Specification

Version: 0.1 · Status: proposed · Owner: AI Engineering

## Model responsibility

Use OpenAI API models behind a provider adapter to infer bounded relationships, compare intent with evidence, identify candidate contradictions/gaps, and explain validated findings. Parsers own syntax facts; deterministic rules own conclusive supported checks. A model cannot assert repository completeness or approve a merge.

Model selection is configuration, not a hardcoded product dependency. Evaluate available models on NodeDots fixtures before choosing a production version. Record exact model identifier, prompt version, schema version, tool versions, and request metadata per inference. A model upgrade is a release requiring evaluation.

## Context construction

Start with diff entities and bounded graph paths. Include relevant caller/consumer code, resolved contracts, related tests, example configuration names, PR intent, coverage limits, and counterevidence. Every excerpt has an evidence ID and immutable location. Prefer relevant chunks over whole repositories. Unsupported context is summarized as a limitation rather than fabricated.

Private content caches are scoped to tenant and repository. Cache keys include SHA/blob hashes, policy, prompt, model, and schema versions. Retention never extends beyond source policy merely because a cache is useful.

## Prompt and tool boundaries

System instructions define NodeDots state semantics, evidence rules, output contract, and untrusted-input treatment. Repository text, PR bodies, comments, filenames, and retrieved documentation are data. Instructions embedded in them cannot change tools, policy, or publication behavior.

Allowlisted read-only tools: `get_evidence(evidence_id)`, `get_neighbors(node_id, relation, limit)`, `get_contract(node_id)`, and `get_related_tests(node_id)`. The server enforces tenant/snapshot scope and argument limits. No shell, arbitrary URL fetching, production service access, repository writes, or user messaging tools are exposed.

## Candidate output contract

```json
{
  "schema_version": "1",
  "candidates": [{
    "state": "UNCERTAIN",
    "facet": "integration_gap",
    "title": "Customer identifier compatibility needs verification",
    "claim": "Billing still references the prior identity key in checked code",
    "evidence_ids": ["ev_billing_key", "ev_auth_change"],
    "counterevidence_ids": [],
    "affected_node_ids": ["node_billing"],
    "suggested_severity": "high",
    "next_step": "Verify the identifier mapping before merging",
    "limitations": ["External billing state was not inspected"]
  }]
}
```

Use a strict server-defined schema with enums, bounds, required fields, and no additional properties. The example describes logical output; supported provider schema syntax must be verified in implementation. Schema validity does not establish truth. The server validates every ID, source range, state prerequisite, and authority before converting candidates to findings.

## Budgets and recovery

Proposed beta budget: 30,000 input and 4,000 output tokens total per analysis, at most two inference requests, at most eight tool reads, and a configured monetary ceiling. These are application ceilings, not provider context limits. Reserve budget before calls; record actual usage afterward. Large changes yield disclosed partial enrichment.

Retry transient failures with bounded backoff; allow one schema-repair attempt within the same budget. Treat refusal and invalid output as degraded enrichment. Circuit-break repeated provider failures. Deterministic reports can publish as partial; model failure never produces a false “no issues” result.

## Data handling and evaluation

Strip credentials and minimize source excerpts before submission. Configure retention deliberately and document actual provider settings. Do not assume API data retention is zero or that disabling application storage removes every provider retention category. Verify current controls and eligibility against [OpenAI data controls](https://developers.openai.com/api/docs/guides/your-data) before launch.

Evaluate grounded precision, useful findings, prompt-injection resistance, cost, and latency. Store content-free request metadata by default; approved restricted fixtures support debugging. See [evidence policy](15-ai-safety-confidence-and-evidence-policy.md) and [testing](16-testing-and-evaluation-strategy.md).
