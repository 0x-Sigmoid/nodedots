# NodeDots — Product Strategy

## 1. Strategic Thesis

**NodeDots is the verification layer for complex changes.**

AI is becoming increasingly capable of creating code, documents, applications, analyses, and workflows. The emerging problem is no longer simply:

> **Can AI create this?**

It is increasingly:

> **Did the change account for everything it affects?**

NodeDots addresses that problem by connecting fragmented evidence and identifying what is:

- **Confirmed**
- **Missing**
- **Conflicting**
- **Uncertain**
- **Action Required**

The long-term category is **relationship intelligence**.

The initial product is **NodeDots Code**.

---

# 2. Initial Market: Developers

NodeDots should launch as a developer tool with one clear promise:

> ## Know what your code change affects before you ship.

Modern coding agents can modify dozens of files from a single instruction. However, successful code generation does not guarantee complete system integration.

A change to authentication may affect:

**Auth → Middleware → API → Database → Billing → Sessions → Tests → Environment → Documentation**

The coding agent may implement the visible feature while overlooking indirect consequences.

NodeDots independently examines the change against the wider system.

It answers:

> **What changed?**

> **What else does this affect?**

> **What did the implementation miss?**

> **What now conflicts?**

> **What remains uncertain?**

> **What should the developer check before merging?**

---

# 3. Positioning

NodeDots should **not** compete directly with coding agents.

Coding agents are the **builders**.

NodeDots is the **verification layer**.

The ecosystem becomes:

```text id="c14jpe"
Developer Intent
       ↓
Coding Agent
       ↓
Code Changes
       ↓
    NodeDots
       ↓
Impact + Missing Dots
       ↓
Developer Review
       ↓
      Ship
```

This produces a strong positioning statement:

> **Your coding agent writes the code. NodeDots connects the dots.**

Alternative:

> **Ship the change. Not the side effects.**

---

# 4. The Core Product

The first NodeDots product should do one thing exceptionally well:

## Pull Request Impact Intelligence

Connect a GitHub repository.

When a pull request is created, NodeDots analyzes:

- the change;
- repository architecture;
- dependencies;
- APIs;
- database schemas;
- environment variables;
- tests;
- configuration; and
- relevant historical context.

It produces a **NodeDots Impact Report**.

### Example

```text id="os4eyg"
PR #184 — Add organization permissions

CHANGED
12 files

AFFECTED
17 related components

MISSING
3 integrations

CONFLICTING
1 API/schema assumption

UNTESTED
2 behaviour changes

UNKNOWN
1 possible migration consequence
```

The most important section is:

## Missing Dots

```text id="24a78x"
● organization_id added to the database,
  but no backfill exists for current users.

● Role enum changed in schema.prisma,
  but RoleSelector.tsx still uses the old values.

● DELETE /api/team/:id has no corresponding
  authorization check.

● New behaviour has no integration test.
```

NodeDots therefore evaluates **system completeness**, not merely code quality.

---

# 5. The Core Intelligence Model

Everything NodeDots discovers should resolve into five states:

```text id="27vl1e"
CONFIRMED
The pieces connect.

MISSING
Something expected is absent.

CONFLICTING
Two parts of the system disagree.

UNCERTAIN
Available evidence is insufficient.

ACTION REQUIRED
Something should be reviewed or resolved.
```

This becomes the universal NodeDots language.

---

# 6. Product Differentiation

NodeDots should sit above existing development tools.

```text id="p5q5kd"
ESLint
   → Is the code stylistically valid?

TypeScript
   → Do the types connect?

Tests
   → Does expected behaviour pass?

Security Scanner
   → Are known vulnerabilities present?

Coding Agent
   → Can the feature be implemented?

NodeDots
   → Did the change account for everything it affects?
```

That final question defines the product.

---

# 7. MVP

The first version should contain only what is necessary to prove this proposition.

### Inputs

```text id="syg72r"
GitHub Repository
        +
Pull Request
        +
Developer Intent
```

### NodeDots analyzes

```text id="n4gmoh"
Diff
Dependencies
APIs
Database
Configuration
Environment
Tests
Architecture
```

### Output

```text id="qnk59s"
Changed

Affected

Missing

Conflicting

Untested

Unknown

Things to Check Before Merging
```

Developers should be able to mark findings:

```text id="dgnp7n"
✓ Correct

✕ False Positive

✓ Resolved

○ Intentional

⚠ Accepted Risk
```

That feedback becomes important training data for improving the NodeDots relationship model.

---

# 8. Phase Two: Developer Workflow

Once PR intelligence proves useful, NodeDots moves closer to the developer.

### CLI

```bash id="tzewi2"
npx nodedots check
```

### CI/CD

NodeDots runs automatically before release.

### IDE

Developers can inspect the impact of a change while writing it.

The workflow becomes:

```text id="kmxb0a"
WRITE
  ↓
CHECK
  ↓
CONNECT
  ↓
VERIFY
  ↓
SHIP
```

---

# 9. Phase Three: Software Memory

The next strategic layer is a persistent **software relationship graph**.

NodeDots gradually learns relationships among:

```text id="u2ugkt"
Files
Functions
Components
APIs
Database Tables
Schemas
Environment Variables
Tests
Services
PRs
Issues
Architecture Decisions
Incidents
```

This enables higher-value questions:

> What depends on this?

> Why does this file exist?

> What usually changes with this component?

> Which PR introduced this dependency?

> What broke the last time this subsystem changed?

> Which tests protect this behaviour?

NodeDots evolves from PR analysis into **institutional memory for software**.

---

# 10. Phase Four: AI Code Verification

This is the larger strategic opportunity.

As coding agents become more capable, more software will be generated from natural-language intent.

The problem shifts from:

> **How do we generate the code?**

toward:

> **How do we verify what the agent generated?**

NodeDots can compare:

```text id="e6u59e"
INTENT
   ↕
IMPLEMENTATION
   ↕
ARCHITECTURE
   ↕
DEPENDENCIES
   ↕
TESTS
```

Example:

**Intent**

> Allow users to delete their accounts.

**Agent implementation**

```text id="wp1e1p"
✓ Delete button
✓ API endpoint
✓ Database deletion
```

**NodeDots**

```text id="y45j2w"
✕ Stripe customer remains

✕ Uploaded files remain

✕ Active sessions remain valid

✕ Analytics identity remains

✕ No confirmation flow

✕ No deletion integration test
```

The product therefore becomes:

> ## The second pair of eyes for AI-written software.

---

# 11. The Moat

NodeDots should not attempt to build its moat around access to OpenAI models.

The defensible asset is the **relationship graph**.

Over time NodeDots learns:

```text id="kln28d"
What connects
+
Why it connects
+
When the relationship appeared
+
What changes with it
+
What previously broke
+
What the organization expects
+
Which findings developers accept or reject
```

That knowledge becomes increasingly specific to each repository and organization.

The longer NodeDots operates within a system, the better it understands that system.

---

# 12. Expansion Beyond Code

The underlying NodeDots engine should remain domain-independent.

However, these products should **not be launched simultaneously**.

After NodeDots Code establishes the relationship engine, the same architecture can support other high-value workflows.

## NodeDots Apply

> **Am I ready to submit?**

Checks applications against requirements.

```text id="d7fznl"
Requirements
↕
Documents
↕
Eligibility
↕
Evidence
↕
Deadlines
```

Finds missing documents, inconsistencies and unmet requirements.

---

## NodeDots Contracts

> **What am I obligated to do?**

Transforms contracts into structured:

```text id="06wzd8"
WHO
owes
WHAT
to
WHOM
by
WHEN
under
WHAT CONDITION
```

Tracks deadlines, renewals, payments and conflicting obligations.

---

## NodeDots Research

> **Does the study actually connect?**

Maps:

```text id="dgib96"
Research Questions
       ↓
Objectives
       ↓
Hypotheses
       ↓
Methodology
       ↓
Results
       ↓
Conclusions
```

Identifies inconsistencies and unsupported claims.

---

## NodeDots Business

> **What do I need to do?**

Turns institutional and regulatory processes into structured process graphs.

Potential initial focus:

**Nigerian small businesses.**

---

## NodeDots Verify

> **What is actually supported?**

Connects claims to evidence and identifies:

```text id="5y4gzd"
Supported
Missing Evidence
Conflicting Evidence
Uncertain
Missing Context
```

---

# 13. One Engine, Multiple Modes

The long-term architecture is:

```text id="vgm1mk"
                 NODEDOTS ENGINE

                      GOAL
                       ↓
                    EVIDENCE
                       ↓
               RELATIONSHIP GRAPH
                       ↓
          ┌────────────┼────────────┐
          ↓            ↓            ↓
       Missing     Conflicting   Confirmed
          ↓            ↓            ↓
          └────────────┼────────────┘
                       ↓
                    ACTIONS
```

Specialized products sit above it:

```text id="fmf4f4"
                NodeDots

                   │
        ┌──────────┼──────────┐
        │          │          │
       Code       Apply    Contracts
        │          │          │
     Research   Business    Verify
```

The domain changes.

The engine remains the same.

---

# 14. Strategic Roadmap

### NOW

## NodeDots Code

**PR Impact Intelligence**

Prove developers will use NodeDots to catch missing consequences before merging.

---

### NEXT

## Developer Workflow

CLI + CI/CD + IDE.

Make NodeDots part of how software ships.

---

### THEN

## Software Relationship Graph

Architecture + history + institutional memory.

Build the defensible data layer.

---

### THEN

## AI Agent Verification

Verify whether coding agents completely implemented developer intent.

Own the emerging verification layer around AI-generated software.

---

### LATER

## NodeDots Platform

Apply + Contracts + Research + Business + Verify.

Extend the proven relationship engine into other domains.

---

# 15. Strategic Focus

NodeDots should therefore be thought about at three levels.

### What we sell now

> **Code change intelligence.**

### What we are building underneath

> **A software relationship graph.**

### What NodeDots can eventually become

> **A relationship intelligence platform.**

Keeping those three levels separate prevents the long-term vision from distracting from the immediate product.

---

# 16. The NodeDots Strategy in One Sentence

> **Start by helping developers catch what code changes miss, build a proprietary graph of how software systems connect, become the verification layer for AI-generated code, and eventually apply the same relationship intelligence engine to any high-stakes workflow where missing connections matter.**

---

# 17. North Star

The fundamental NodeDots question should always remain:

> # What are we missing?

Whether the input is a pull request, application, contract, research project, business process, or decision, NodeDots exists to find the answer **before the user acts**.

## NodeDots

**Connect the dots before you act.**