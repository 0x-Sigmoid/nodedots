# NodeDots

## Product Overview and Future Product Vision

### Connect the dots before you act.

**Initial Wedge:** NodeDots Code  
**Future Product Family:** NodeDots Apply · Contracts · Research · Business · Verify · Decisions

---

# 1. Executive Summary

NodeDots is an AI-powered **relationship-and-gap intelligence platform** designed to understand how fragmented pieces of information connect.

Rather than competing as another general-purpose chatbot, coding assistant, document summarizer, or content-generation tool, NodeDots focuses on a more fundamental question:

> **Given what I am trying to accomplish and the evidence available to me, what is confirmed, what is missing, what conflicts, what remains uncertain, and what should I do next?**

The product receives a user's **goal** together with relevant evidence—including code, repositories, documents, URLs, screenshots, requirements, messages, forms, system context, and connected services—and constructs relationships among those elements.

NodeDots then classifies its findings into five primary states:

- **Confirmed**
- **Missing**
- **Conflicting**
- **Uncertain**
- **Action Required**

The recommended initial market entry is **NodeDots Code**, a developer-focused intelligence and verification product.

Modern developers increasingly use AI coding agents to create and modify software. However, generating code does not guarantee that every consequence of a change has been considered. A seemingly small modification can affect authentication, APIs, databases, tests, environment variables, billing, documentation, security policies, infrastructure, and other components.

NodeDots Code would operate as an independent **system-intelligence and verification layer** that identifies these relationships before software is merged or deployed.

The same underlying NodeDots engine can subsequently support non-coding workflows such as applications, contracts, academic research, business compliance, evidence verification, and general decision readiness.

The long-term ambition is therefore broader than code intelligence.

> **NodeDots helps people and software teams understand what connects, discover what is missing, resolve what conflicts, and act with better evidence.**

---

# 2. Product Thesis

Information problems frequently arise not because information is unavailable, but because the relevant information is **distributed across multiple places**.

A software feature may depend on twenty different components.

A scholarship application may involve an opportunity webpage, CV, transcript, certificates, references, eligibility conditions, email instructions, and deadlines.

A contract may contain related obligations scattered across multiple clauses.

A research study may contain inconsistencies between its research questions, methodology, tables, findings, and conclusions.

Most AI products process these artifacts individually.

NodeDots is designed to reason **across them**.

Its fundamental unit is therefore not the prompt or document.

It is the **relationship**.

---

# 3. The NodeDots Intelligence Model

Every NodeDots product should operate around five core states.

| State | Meaning | Example |
|---|---|---|
| **Confirmed** | Supported by available evidence | Requirement satisfied; dependency verified |
| **Missing** | Expected evidence, dependency, or action is absent | Missing test, document, environment variable |
| **Conflicting** | Two or more sources disagree | API/schema mismatch; inconsistent dates |
| **Uncertain** | Available evidence cannot establish the answer confidently | Unknown migration effect |
| **Action Required** | A concrete next step follows from the analysis | Add test; resolve discrepancy; submit document |

This framework should remain consistent across NodeDots products.

For example, NodeDots Code might discover:

> **Missing:** Password-reset behaviour changed but no corresponding test was modified.

NodeDots Apply might discover:

> **Missing:** The scholarship requires two recommendation letters, but only one has been provided.

NodeDots Contracts might discover:

> **Conflicting:** Clause 7 states a 30-day notice period while Schedule B specifies 14 days.

The domain changes.

The underlying intelligence model does not.

---

# 4. Product Positioning

NodeDots should **not** primarily be positioned as:

- an AI assistant;
- another chatbot;
- another code generator;
- another document summarizer;
- another research-writing assistant; or
- another generic productivity platform.

Instead, NodeDots should own the concept of **connection intelligence**.

The core product promise is:

> **Give NodeDots the goal and the evidence. It connects the relationships, finds the missing dots, explains the consequences, and identifies what requires attention.**

Potential master tagline:

> **Connect the dots before you act.**

---

# 5. NodeDots Code

## Developer Intelligence and Change Verification

NodeDots Code should be the recommended first product vertical.

Its central proposition is:

> **Know what your code change affects before you ship.**

The developer ecosystem already contains sophisticated tools for generating code.

NodeDots should therefore avoid competing primarily on code generation.

Instead:

> **Your coding agent writes the code. NodeDots connects the dots.**

Another possible positioning statement is:

> **Ship the change. Not the side effects.**

NodeDots Code maps how a software system connects and identifies what a change may leave behind.

---

# 6. Change Impact Analysis

A developer might change:

```text
auth.ts
```

But the actual dependency chain could involve:

```text
auth.ts
   ↓
middleware.ts
   ↓
API routes
   ↓
UserContext
   ↓
Dashboard
   ↓
Billing
   ↓
Database policies
```

NodeDots should understand this broader system relationship.

Suppose a developer intends to migrate authentication from Firebase to Supabase.

NodeDots might report:

```text
27 dots affected

HIGH IMPACT

/auth/login.ts
middleware.ts
UserProvider.tsx
/api/profile
/api/billing

DATABASE

users table
profiles table
3 RLS policies

ENVIRONMENT

FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_*
SUPABASE_URL
SUPABASE_ANON_KEY

TESTS

4 authentication tests affected
2 integration tests affected

UNKNOWN

Stripe webhook references Firebase UID.
Migration strategy not detected.
Existing sessions may require invalidation.
```

The important NodeDots finding might therefore be:

> **Billing currently uses `firebase_uid` as the customer mapping key.**

That is significantly more valuable than merely generating replacement authentication code.

---

# 7. NodeDots Pull Request Intelligence

The strongest initial commercial entry point may be a GitHub application.

When a pull request is opened, NodeDots analyzes the change in the context of the repository.

Instead of conventional line-by-line AI review, NodeDots produces an **Impact Report**.

Example:

```text
PR #184
Add organization-level permissions

Changed
12 files

Directly affected
8 components

Indirectly affected
17 components

Potential issues
3

Missing tests
2

Documentation affected
1

Database migration
Required
```

The report would then contain several sections.

## Changed

What the pull request explicitly modified.

## Affected

What is likely to be influenced indirectly.

## Missing

Integrations, tests, migrations, configuration, documentation, or dependencies that appear absent.

## Conflicting

Contracts or assumptions that no longer align.

## Untested

Behaviour changes without corresponding test coverage.

## Unknown

Consequences NodeDots cannot establish confidently.

## Before Merging

A concise evidence-linked checklist for human review.

---

# 8. Missing Dots

This could become one of the defining NodeDots concepts.

For example:

```text
MISSING DOTS

● DELETE /api/team/:id has no corresponding
  authorization check.

● Role enum changed in schema.prisma,
  but RoleSelector.tsx still contains the
  previous values.

● Migration introduces organization_id,
  but existing records have no detected
  backfill strategy.

● API documentation still describes
  user-level permissions.

● No test covers an OWNER removing an ADMIN.
```

NodeDots is therefore not simply asking:

> Is this code correct?

It asks:

> **What did this change forget?**

---

# 9. NodeDots Pre-Flight Check

NodeDots can eventually become part of the developer's normal shipping workflow.

Before:

```bash
git push
```

A developer could run:

```bash
npx nodedots check
```

NodeDots could return:

```text
NodeDots checking 1,284 project dots...

✓ Types
✓ Dependencies
✓ Environment
✓ Database
✓ API contracts
✓ Routes

⚠ 3 missing dots
✕ 1 conflicting dot
```

For example:

```text
CONFLICT

/api/users expects:
User.avatarUrl

Database schema contains:
User.avatar_url

Affected:
3 files
```

Another finding:

```text
MISSING

STRIPE_WEBHOOK_SECRET referenced in:

/api/webhooks/stripe.ts

but not documented in:

.env.example
```

Another:

```text
MISSING TEST

Password reset behaviour changed.

No corresponding test modification detected.
```

NodeDots would complement existing developer tools rather than replace them.

**ESLint** checks style and syntax.

**TypeScript** checks types.

**Tests** check expected behaviour.

**Security tools** detect known vulnerabilities.

**Coding agents** implement features.

**NodeDots** checks whether the pieces of the system still connect.

---

# 10. Verification of AI-Generated Code

This may become one of the strongest long-term NodeDots opportunities.

Developers increasingly instruct coding agents:

> Add Google authentication.

Or:

> Implement account deletion.

Or:

> Add organization permissions.

The coding agent may modify numerous files successfully.

However, the central question remains:

> **Did the agent understand the entire system?**

NodeDots can become an independent verification layer.

The workflow becomes:

```text
Developer
    ↓
Coding Agent
    ↓
Generated Code
    ↓
NodeDots
    ↓
Connect the Dots
    ↓
Missing integration?
Broken assumption?
Unupdated dependency?
Missing migration?
Missing test?
Security consequence?
Documentation mismatch?
    ↓
Developer Review
```

This allows NodeDots to complement existing coding agents instead of competing directly with them.

---

# 11. Intent-to-Implementation Verification

NodeDots should eventually understand the developer's **intended outcome**, not merely the code diff.

Suppose the developer's intent is:

> Users should now be able to delete their account.

A coding agent implements:

```text
✓ Delete button

✓ DELETE API endpoint

✓ Database user deletion
```

NodeDots then investigates the broader system:

```text
✕ Stripe customer remains

✕ Uploaded files remain in storage

✕ Active sessions remain valid

✕ Analytics user remains identifiable

✕ No confirmation flow detected

✕ No account-deletion test detected
```

NodeDots can therefore compare three important layers:

> **Intent ↔ Implementation ↔ System Architecture**

This creates a substantially stronger verification model than conventional code review.

---

# 12. Codebase Relationship Explorer

NodeDots can eventually provide an interactive architectural map.

Suppose the developer selects:

```text
Checkout
```

NodeDots might show:

```text
CheckoutButton
      ↓
useCheckout()
      ↓
POST /api/checkout
      ↓
Stripe.checkout.sessions.create()
      ↓
Stripe Checkout
      ↓
Webhook
      ↓
/api/webhooks/stripe
      ↓
subscriptions table
      ↓
UserProvider
      ↓
Premium Features
```

Every node should be clickable and traceable to its underlying source.

Instead of asking:

> What does this file do?

Developers can ask:

> **How does Checkout actually work across this system?**

---

# 13. “Why Does This Exist?”

Repositories preserve implementation better than they preserve rationale.

NodeDots can become institutional memory for software.

A developer could select:

```text
middleware.ts
```

and ask:

> Why does this exist?

NodeDots might respond:

```text
middleware.ts

PURPOSE

Protect authenticated routes.

USED BY

14 protected routes.

DEPENDS ON

Supabase Auth.

INTRODUCED

PR #81.

ORIGINAL REASON

Prevent unauthenticated access to
/dashboard following authentication migration.

RELATED

/auth/callback
/lib/supabase/server.ts
UserProvider.tsx

REMOVING IT MAY AFFECT

14 routes.
```

This becomes particularly valuable when developers join unfamiliar codebases or when the original developers leave an organization.

---

# 14. Architecture Drift Detection

Software architectures often begin with clear patterns.

For example:

```text
UI
 ↓
Service
 ↓
Repository
 ↓
Database
```

Over time, shortcuts appear:

```text
UI ─────────────→ Database
 ↓
Service
 ↓
Repository
```

NodeDots could detect this architecture drift.

Example:

```text
ARCHITECTURE DRIFT

Expected

Component
   ↓
Service
   ↓
Repository
   ↓
Database

Detected

BillingPage.tsx
   ↓
Supabase

Introduced

PR #271

Similar violations

4
```

Organizations could define architectural expectations and allow NodeDots to continuously detect deviations.

---

# 15. Future NodeDots Code Capabilities

Future developer capabilities could include:

- IDE extension showing impact while code is edited;
- CI/CD release verification;
- deploy-time change reports;
- architecture decision records linked automatically to code;
- repository onboarding and feature explanations;
- dependency lineage;
- environment-variable lineage;
- database migration completeness checks;
- database backfill detection;
- API contract drift;
- frontend/backend mismatch detection;
- behaviour-based test-gap intelligence;
- cross-repository dependency mapping;
- production incident correlation;
- engineering knowledge graphs;
- organization-specific architecture policies;
- historical blast-radius analysis; and
- agent-to-agent verification APIs.

The eventual architecture could resemble:

```text
Developer
     ↓
Coding Agent
     ↓
Code Changes
     ↓
┌──────────────────────┐
│       NodeDots       │
│                      │
│ Intent               │
│    ↕                 │
│ Code ↔ Architecture  │
│    ↕                 │
│ Tests ↔ Dependencies │
└──────────┬───────────┘
           ↓
       ✓ SHIP
          or
    ⚠ MISSING DOTS
```

---

# 16. The Underlying NodeDots Engine

NodeDots should not be architected as several unrelated products.

It should contain one reusable **relationship-and-gap intelligence engine**.

The engine receives:

```text
Goal
+
Evidence
```

and produces:

```text
Relationships
+
Findings
+
Actions
```

The general processing model is:

### 1. Goal

What is the user attempting to accomplish?

### 2. Evidence

Collect relevant:

- code;
- documents;
- URLs;
- screenshots;
- forms;
- requirements;
- messages;
- metadata; and
- connected systems.

### 3. Extraction

Identify:

- requirements;
- entities;
- claims;
- dates;
- obligations;
- dependencies;
- people;
- resources; and
- actions.

### 4. Relationship Graph

Connect evidence to requirements and connect entities to one another.

### 5. Evaluation

Classify findings as:

```text
Confirmed
Missing
Conflicting
Uncertain
Action Required
```

### 6. Explanation

Show why NodeDots produced each finding and what evidence supports it.

### 7. Action

Generate an appropriate next-step checklist or, with user approval, trigger an integrated workflow.

---

# 17. The Long-Term Data Asset

NodeDots' defensibility should not depend primarily on access to an AI model.

Its valuable asset should become its **relationship graph**.

For software, the graph could contain:

```text
Files
Functions
Components
APIs
Schemas
Tables
Environment Variables
Tests
PRs
Issues
Requirements
Architectural Decisions
Services
Incidents
Developers
```

NodeDots learns how these entities relate.

Over time, it can also understand **historical relationships**.

That means NodeDots eventually knows not merely:

> What does this code say?

but also:

> Why does this component exist?

> What usually changes with it?

> What previously broke when this area changed?

> Which architectural decision created this dependency?

> Which tests normally protect this behaviour?

That becomes institutional software memory.

---

# 18. Non-Coding NodeDots Products

The same intelligence architecture can serve workflows outside software development.

These should be treated as specialized **NodeDots modes**, not unrelated products.

---

# 19. NodeDots Apply

## Before You Submit

NodeDots Apply would help users prepare:

- job applications;
- scholarships;
- fellowships;
- grants;
- university applications;
- tenders;
- procurement submissions; and
- similar opportunities.

The user provides:

```text
Opportunity URL
+
Application documents
```

NodeDots extracts:

- eligibility criteria;
- required documents;
- deadlines;
- formatting requirements;
- experience requirements;
- submission instructions; and
- other conditions.

It then compares those requirements against the user's documents.

Example:

```text
APPLICATION REVIEW

✓ CV provided

✓ Degree certificate provided

✓ Minimum experience appears satisfied

✓ Proposal within required page limit

⚠ Recommendation letter missing

⚠ CV says employment began March 2022;
  application says January 2022

⚠ Requirement asks for two references;
  only one detected

⚠ Certificate name differs from
  application name

⚠ Deadline approaching
```

The primary question becomes:

> **Am I ready to submit?**

---

# 20. NodeDots Contracts

## Obligation Intelligence

Instead of merely summarizing contracts, NodeDots converts contractual language into structured obligations.

The fundamental model is:

> **WHO owes WHAT to WHOM by WHEN under WHAT CONDITION?**

NodeDots could extract:

```text
Payment

₦850,000

Due

30 days after invoice

Deliverable

Final implementation report

Due

15 December

Notice period

30 days

Automatic renewal

Yes

Cancellation window

Before 14 November

Penalty

5% after payment deadline
```

Capabilities could include:

- payment obligations;
- deliverables;
- notice periods;
- renewal dates;
- cancellation windows;
- penalties;
- conditional obligations;
- conflicting clauses;
- missing schedules;
- obligation tracking;
- calendar integration; and
- deadline reminders.

NodeDots would therefore transform static documents into **persistent obligations**.

---

# 21. NodeDots Research

## Evidence and Research Consistency

Researchers could provide:

```text
Research question
+
Proposal
+
Literature
+
Dataset
+
Draft chapters
```

NodeDots would map claims to supporting evidence.

Potential capabilities include:

- claim-to-source mapping;
- unsupported assertion detection;
- weak-evidence detection;
- contradictory literature identification;
- research-question alignment;
- objective alignment;
- hypothesis alignment;
- methodology consistency;
- table-to-discussion consistency;
- conclusion-to-finding consistency;
- citation/reference matching;
- missing literature identification;
- methodological gap detection; and
- evidence-gap analysis.

Instead of becoming another research-writing assistant, NodeDots Research answers:

> **Does everything in this study actually connect?**

---

# 22. NodeDots Business

## Bureaucracy and Compliance Navigator

NodeDots Business can help users navigate complex institutional processes.

A user could ask:

> I want to register a company.

> I need to change company directors.

> I need to register a trademark.

> I want to export a regulated product.

NodeDots converts the objective into a process graph:

```text
GOAL
  ↓
Eligibility
  ↓
Prerequisites
  ↓
Documents
  ↓
Application
  ↓
Payment
  ↓
Verification
  ↓
Approval
  ↓
Post-approval obligations
```

The output could include:

- eligibility;
- documents required;
- official procedures;
- prerequisites;
- official fees;
- deadlines;
- forms;
- government portals;
- renewal obligations;
- common missing requirements; and
- source-linked evidence.

The initial market could focus narrowly on **Nigerian small businesses** before expanding geographically.

Potential areas include:

- company administration;
- tax processes;
- trademarks;
- regulated product registrations;
- procurement;
- permits;
- export processes; and
- business compliance.

Over time, NodeDots could build a proprietary **process graph** describing how institutional procedures actually connect.

---

# 23. NodeDots Verify

## Claims and Evidence

NodeDots Verify could examine:

- claims;
- screenshots;
- URLs;
- messages;
- documents;
- reports; and
- other evidence.

Instead of reducing complex questions to a simple:

```text
TRUE / FALSE
```

NodeDots would distinguish:

```text
SUPPORTED
UNSUPPORTED
CONFLICTING
UNCERTAIN
MISSING CONTEXT
```

Capabilities could include:

- claim decomposition;
- source verification;
- provenance checks;
- cross-source comparison;
- contradiction detection;
- missing-context identification;
- uncertainty explanation; and
- recommended verification steps.

The primary question becomes:

> **What is actually supported by the available evidence?**

---

# 24. NodeDots Decisions

## What Am I Missing?

This represents the broadest expression of the NodeDots concept.

The interface begins with:

> **What are you about to do?**

Examples:

> I'm about to sign this contract.

> I'm submitting this research proposal.

> I'm hiring this developer.

> I'm launching this SaaS.

> I'm renting this apartment.

> I'm applying for this scholarship.

The user then adds what they already know.

NodeDots responds with five sections:

```text
WHAT YOU KNOW

WHAT YOU DON'T KNOW

WHAT DOESN'T MATCH

WHAT YOU SHOULD VERIFY

WHAT REQUIRES ACTION
```

This could eventually become the universal NodeDots experience.

---

# 25. Universal NodeDots Experience

Every NodeDots product could use approximately the same interaction.

## Step 1 — State the Goal

> **What are you trying to do?**

## Step 2 — Add the Evidence

Depending on the mode:

```text
Repository
URL
Document
Screenshot
Requirements
Message
Form
Connected Service
```

## Step 3 — Connect the Dots

The primary action:

> **Connect the Dots**

NodeDots processes the evidence.

## Step 4 — Review the Dots

Example:

```text
24 dots found

16 Confirmed

4 Missing

2 Conflicting

1 Uncertain

1 Action Required
```

Each dot can be opened.

A finding should contain:

```text
Finding

Why it matters

Evidence

Relationship

Confidence

Recommended next step
```

---

# 26. Visual Product Language

The NodeDots name should influence the actual interface.

A repository, application, contract, or research project can be represented as interconnected nodes.

For example:

```text
                   Authentication
                         ●
                       /   \
                      /     \
                     ●       ●
                  Users    Sessions
                   /          \
                  ●            ●
               Billing      Middleware
                  \            /
                   ●──────────●
                       API
```

Possible states:

```text
● Confirmed

● Affected

● Conflict

● Unknown

● Changed

● Missing
```

The graph should not exist merely as decoration.

Its purpose is to help users understand:

> **What connects to what?**

---

# 27. AI and Technical Architecture

NodeDots can use OpenAI models for:

- reasoning;
- structured extraction;
- code understanding;
- document understanding;
- relationship inference;
- contradiction analysis;
- intent comparison;
- explanation; and
- tool orchestration.

However, the entire platform should not depend on one large prompt.

A stronger architecture would contain several layers.

## Ingestion Layer

Receives:

- repositories;
- diffs;
- documents;
- URLs;
- screenshots;
- structured metadata; and
- future integrations.

## Parser and Indexing Layer

Handles:

- AST/code parsing;
- dependency extraction;
- document parsing;
- schema parsing;
- semantic indexing; and
- metadata extraction.

## Graph Layer

Stores:

```text
Nodes
Edges
Provenance
Confidence
Timestamps
Historical versions
```

## AI Reasoning Layer

Handles:

- relationship inference;
- intent comparison;
- contradiction detection;
- gap analysis;
- prioritization; and
- explanation.

## Rules Layer

Performs deterministic checks for:

- architectural policies;
- known requirements;
- schema contracts;
- workflow policies; and
- organization-specific rules.

## Action Layer

Supports:

- GitHub comments;
- CLI results;
- CI/CD;
- tasks;
- reminders;
- notifications; and
- approved integrations.

## Audit Layer

Tracks:

- source evidence;
- model/version metadata;
- human resolutions;
- false positives; and
- accepted exceptions.

---

# 28. Reliability Principles

NodeDots should be built around several reliability principles.

### Evidence First

Every consequential finding should link to evidence whenever possible.

### Facts vs Inference

NodeDots should distinguish:

- parser-derived facts;
- deterministic rule results; and
- AI inference.

### Explicit Uncertainty

NodeDots should never present inferred relationships as certain when the evidence is incomplete.

### Incremental Analysis

Large repositories should not require complete re-analysis after every small change.

### Human Control

Users should remain responsible for consequential actions.

NodeDots provides intelligence.

Humans decide.

---

# 29. Recommended MVP

The first release should remain deliberately narrow.

## NodeDots Code — GitHub Pull Request Intelligence

### V1 Features

1. GitHub repository connection.
2. Repository indexing.
3. Basic dependency graph.
4. Pull-request diff ingestion.
5. Change-impact analysis.
6. API/schema/configuration relationship detection.
7. Test relationship analysis.
8. Missing-dot detection.
9. Conflict detection.
10. Evidence links to repository locations.
11. Developer feedback on findings.
12. Before-merging checklist.

The report should concentrate on:

```text
Changed

Affected

Missing

Conflicting

Untested

Unknown
```

---

# 30. What NodeDots Should Not Build Initially

The first version should not attempt to become:

- a complete IDE;
- a Cursor competitor;
- a general coding agent;
- a replacement for GitHub;
- a full architecture-management platform;
- a complete DevOps platform;
- every NodeDots non-code product simultaneously; or
- an autonomous system that changes production code without developer control.

The initial objective is narrower:

> **Can NodeDots consistently identify important consequences of a software change that developers or coding agents missed?**

If the answer becomes yes, the platform can expand.

---

# 31. Product Roadmap

## Phase 1 — Validate

### NodeDots Code: PR Intelligence

Build:

- GitHub application;
- repository graph;
- impact reports;
- missing-dot detection;
- conflict detection; and
- developer feedback.

**Objective:** prove that developers find relationship-level findings useful.

---

## Phase 2 — Enter the Development Workflow

Add:

- CLI;
- CI/CD integration;
- architecture rules;
- test-gap intelligence;
- database migration analysis; and
- API-contract checking.

NodeDots becomes part of the shipping workflow.

---

# 32. Phase 3 — System Intelligence

Develop:

- interactive architecture graph;
- pull-request history;
- architectural decision records;
- “Why does this exist?”;
- cross-repository mapping;
- dependency history; and
- institutional memory.

At this stage, NodeDots becomes increasingly difficult to replace because it understands the historical structure of the system.

---

# 33. Phase 4 — AI Agent Verification

Integrate with coding agents.

NodeDots receives:

```text
Developer Intent
+
Agent Changes
+
Repository Context
```

and evaluates:

```text
Did the implementation actually satisfy the intent?
```

Potential integrations could eventually support multiple AI coding environments.

NodeDots becomes the **verification layer around AI-generated software**.

---

# 34. Phase 5 — Expand Beyond Code

Introduce selected non-code products:

### NodeDots Apply

Application readiness.

### NodeDots Contracts

Obligation intelligence.

### NodeDots Research

Evidence consistency.

These use the same relationship engine.

---

# 35. Phase 6 — Process Intelligence

Introduce:

### NodeDots Business

Institutional process navigation.

### NodeDots Verify

Evidence and provenance intelligence.

### NodeDots Decisions

General decision readiness.

At this stage, NodeDots evolves from a developer product into a broader **relationship intelligence platform**.

---

# 36. Business Model Possibilities

NodeDots Code could use repository- and organization-based pricing.

## Free

Potentially:

- limited repositories;
- limited monthly PR analyses;
- public repositories;
- basic impact reports.

## Pro

Potentially:

- private repositories;
- higher analysis limits;
- CLI;
- CI/CD;
- custom rules;
- history;
- architecture intelligence.

## Team

Potentially:

- organization-wide graphs;
- shared policies;
- role controls;
- institutional memory;
- cross-repository analysis;
- architecture rules.

## Enterprise

Potentially:

- SSO;
- audit controls;
- private deployment options;
- advanced retention controls;
- policy enforcement;
- custom integrations;
- enterprise API.

Non-code products could instead price around:

- active projects;
- analyses;
- monitored obligations;
- team seats; or
- organizational workspaces.

---

# 37. Competitive Strategy

NodeDots should not attempt to build its competitive advantage around:

> “We use OpenAI.”

Model access will increasingly become commoditized.

Instead, NodeDots' defensibility should come from several assets.

## Relationship Graph

Accumulated understanding of how entities connect.

## Historical Graph

Understanding how those relationships change.

## Workflow Integration

NodeDots becomes embedded within:

```text
Pull Request
→ CI
→ Release
→ Production
```

## Organization-Specific Rules

Each engineering organization teaches NodeDots its architecture and expectations.

## Resolution Feedback

NodeDots learns which findings humans:

```text
Accepted
Rejected
Fixed
Ignored
Marked as intentional
```

## Process Graphs

For non-code products, NodeDots gradually accumulates structured knowledge about institutional processes and requirements.

## Evidence Provenance

Findings remain connected to the evidence that produced them.

---

# 38. Key Risks

## False Positives

If NodeDots produces too many speculative findings, developers will stop paying attention.

Precision should therefore matter more than producing large numbers of findings.

## False Confidence

The absence of detected problems must not imply that a change is completely safe.

## Repository Privacy

Private repositories require strong security, authorization, encryption, retention controls, and transparent data handling.

## Context Scale

Large repositories require incremental indexing rather than repeatedly sending entire repositories to an AI model.

## Graph Noise

Not every technical relationship is useful.

NodeDots must prioritize relationships relevant to the user's current goal.

## Product Dilution

The non-code opportunities are attractive, but launching them too early could weaken the NodeDots Code proposition.

---

# 39. Success Metrics

Important early metrics could include:

- percentage of PR analyses producing a developer-confirmed meaningful finding;
- false-positive rate;
- dismissed-finding rate;
- percentage of findings resolved before merge;
- repeat repository usage;
- weekly active developer teams;
- report-generation time;
- percentage of analyzed PRs receiving developer interaction; and
- percentage of teams installing NodeDots across additional repositories.

For future non-code products, another important metric would be:

> **Percentage of missing or conflicting dots resolved before the user submits or acts.**

---

# 40. Product Focus

NodeDots answers:

> **How does this system connect, and what will this change affect?**

NodeDots operates primarily around:

```text
Intent
Relationships
Dependencies
Changes
Evidence
Missing pieces
Verification
```

Its product scope centers on connecting evidence, understanding change consequences, and identifying what requires attention before action.

---

# 41. Brand Architecture

The eventual NodeDots family could be structured as follows:

| Product | Primary Job | Core Question |
|---|---|---|
| **NodeDots Code** | Software relationship intelligence | What does this change affect? |
| **NodeDots Apply** | Application readiness | Am I ready to submit? |
| **NodeDots Contracts** | Obligation intelligence | What do I owe, and when? |
| **NodeDots Research** | Research consistency | Does the evidence support the study? |
| **NodeDots Business** | Process navigation | What is required to accomplish this? |
| **NodeDots Verify** | Claim/evidence analysis | What is actually supported? |
| **NodeDots Decisions** | Decision readiness | What am I missing before I act? |

These should not initially appear as seven independent products.

NodeDots should begin with a focused product and gradually expose additional modes as the underlying platform matures.

---

# 42. Future Vision

The long-term vision is for NodeDots to become a **verification and decision-readiness layer between intention and action**.

In software:

```text
Intent
→ Implementation
→ NodeDots
→ Deployment
```

In applications:

```text
Opportunity
→ Preparation
→ NodeDots
→ Submission
```

In contracts:

```text
Agreement
→ NodeDots
→ Obligations
```

In research:

```text
Evidence
→ NodeDots
→ Conclusion
```

In business processes:

```text
Goal
→ NodeDots
→ Requirements
→ Action
```

The domains differ, but the underlying problem remains consistent:

> **Do all the relevant pieces actually connect?**

---

# 43. North-Star Product Concept

NodeDots should ultimately become a system that understands the relationship between:

```text
WHAT YOU INTEND
       ↕
WHAT YOU KNOW
       ↕
WHAT EXISTS
       ↕
WHAT CONNECTS
       ↕
WHAT IS MISSING
       ↕
WHAT CONFLICTS
       ↕
WHAT SHOULD HAPPEN NEXT
```

This is broader than code intelligence.

It is broader than document intelligence.

It is broader than search.

It is **relationship intelligence**.

---

# 44. Core Product Statement

## NodeDots

### Connect the dots before you act.

Give NodeDots your goal, code, documents, links, requirements, or other evidence.

NodeDots identifies what connects, what is confirmed, what is missing, what conflicts, what remains uncertain, and what requires your attention.

For developers, it means understanding what a code change affects before shipping.

For applicants, it means knowing what is missing before submitting.

For organizations, it means understanding obligations before deadlines are missed.

For researchers, it means connecting claims to evidence.

For businesses, it means understanding requirements before beginning complex processes.

And as AI increasingly performs the implementation work itself, NodeDots can occupy an increasingly important position:

> **AI can create the change. NodeDots verifies that the dots still connect.**
