# 24 · Privacy Policy, Terms & AI Disclosure

Version: 0.1 · Status: publication draft requiring factual completion and legal review

This file contains three proposed publication texts. It does not establish implemented controls, a legal entity, or compliance. Replace bracketed fields, confirm actual processing/vendor terms, and obtain review appropriate to the operator and customer jurisdictions before public launch. Engineering must match the approved text; wording alone does not implement privacy.

## A. Privacy policy draft

**Operator:** [Legal entity and address]. **Effective date:** [Date]. **Privacy contact:** [Monitored contact].

NodeDots Code analyzes selected GitHub repositories and pull requests to provide relationship and change-impact intelligence. This policy explains the intended collection, use, disclosure, retention, and handling of personal information associated with that service.

### Information we process

We process account identifiers and contact details; organization membership; GitHub installation/repository/PR metadata; selected source content and extracted relationships; findings, feedback, and configuration; usage and security metadata; and support information you provide. Repository content may contain personal information belonging to contributors or third parties. Select only repositories you are authorized to submit.

We do not need production secret values to perform normal analysis. Exclusions and redaction reduce unnecessary collection, but users should avoid committing credentials or unrelated personal information. We do not execute repository code as part of the proposed service.

### Purposes and roles

We use information to authenticate users, verify repository access, analyze changes, publish reports, record feedback, prevent abuse, troubleshoot failures, and maintain the service. Future billing information will be described before paid processing begins.

For customer-controlled repository content, the operator's controller/processor role and customer responsibilities will be specified in [Data Processing Agreement]. For account, security, and service administration data, [identify role and applicable lawful bases after review]. Do not substitute blanket consent for every processing purpose.

### Service providers and transfers

Relevant minimized source excerpts may be sent to OpenAI for AI-assisted analysis. Hosting, database, storage, authentication, and operational providers also process information necessary for service delivery. Publish [subprocessor list, purposes, locations, and applicable safeguards] before launch.

Provider retention and transfer controls depend on the contracted services and account configuration. Disclose verified settings rather than promising zero retention. The current [OpenAI data controls](https://developers.openai.com/api/docs/guides/your-data) must be checked against the deployed endpoints and agreements. NodeDots will not use customer source to train its own models without a separate explicit agreement.

### Proposed retention

Raw source caches and restricted excerpts: seven days. Graph snapshots, reports, and feedback: 90 days. Content-free operational logs: 30 days. Security audit metadata: 180 days. Backups expire within 35 days. These defaults require implementation confirmation before publication.

Disconnect stops new retrieval and pending work. Requested live repository-content deletion targets seven days, with backup expiry within 35 days. Document any narrowly applicable legal retention exception and billing retention schedule. Restored backups must replay deletion restrictions before serving content.

### Rights and requests

Contact [privacy channel] to request access, correction, deletion, objection, restriction, or other applicable rights. Available rights and lawful exceptions depend on jurisdiction and processing role. We verify identity proportionately; repository-data requests may need coordination with the customer organization. State [request handling timeline and escalation process] after legal review.

For Nigeria-related processing, assess the Nigeria Data Protection Act framework and applicable Commission requirements using official guidance from the [Nigeria Data Protection Commission](https://ndpc.gov.ng/faqs/). The operator's registration, transfer, notice, and breach obligations require a fact-specific assessment.

### Security, children, and changes

We intend to apply access controls, encryption, scoped credentials, and audit controls described in the service documentation; publish only controls verified in operation. The service is intended for [eligible business users/minimum age, subject to review]. Notify users of material policy changes through [method], and state when changes take effect.

## B. Terms of service draft

**Contracting entity:** [Legal entity]. **Effective date:** [Date]. **Terms contact:** [Contact].

### Service and account responsibility

NodeDots supplies advisory code relationship and change-impact reports for supported repositories. You must have authority to connect the organization and repositories, maintain accurate account information, and protect credentials. Organization owners control membership, repository access, and relevant settings. The service may decline unsupported or oversized inputs and disclose partial coverage.

### Permitted use and ownership

You retain ownership of submitted repository content. You grant the operator a limited right to process it to deliver and secure the service according to the approved privacy policy and applicable agreement. Define [report ownership/use rights and feedback license] without transferring customer source ownership.

Do not submit unlawfully obtained content, bypass access controls, probe other tenants, abuse quotas, or attempt to extract credentials or private information. Authorized security research follows [published reporting policy]. Enforcement must distinguish abuse from legitimate analysis of untrusted code.

### AI outputs and human review

Reports may be incomplete, incorrect, or uncertain. They are not a guarantee of correctness, security, compliance, test coverage, or safe deployment. You remain responsible for review, testing, merge, and deployment decisions. V1 does not autonomously modify repositories or merge changes.

### Availability, beta, and commercial terms

Beta features and limits may change with clear notice. State [actual service commitments, support, and maintenance policy]. Paid plans require approved price, currency, tax, renewal, cancellation, refund, downgrade, and usage terms; no paid obligation is created by the proposal in this package.

### Suspension and termination

The operator may suspend access for verified abuse, legal necessity, security risk, or loss of repository authorization, using proportionate notice where feasible. You may disconnect or terminate through [process]. Content handling after termination follows the approved retention policy and contractual exceptions.

### Legal clauses requiring completion

Qualified counsel must draft and confirm enforceable warranty exclusions, liability allocation/caps, indemnity if applicable, governing law, dispute forum, mandatory rights, export/sanctions provisions where relevant, assignment, and notice mechanics. These fields cannot be safely finalized without operator identity and target markets. Do not publish this draft with unresolved clauses.

## C. AI disclosure draft

NodeDots combines code parsers, deterministic rules, and AI-assisted reasoning. Parsers extract supported facts; rules check specific relationships; AI proposes bounded interpretations and explanations. Findings identify their origin, evidence, confidence band, and limitations. Confidence bands are evidence assessments, not guaranteed probabilities.

Only relevant minimized evidence should be submitted to the approved provider. Repository content and PR text are treated as untrusted inputs, and AI has no authority to execute code, expand repository access, publish directly, or merge changes. Server-side validation checks sources and policy before publication.

“No actionable findings detected” means none were detected in the analyzed scope. It does not mean the change is safe. Users should inspect evidence, verify unknown consequences, continue existing checks, and use feedback controls to report disagreement.

## Publication checklist

Complete entity/contact/date fields; verify retention and deletion behavior; publish subprocessors and transfer information; establish DPA and rights process; approve legal clauses; align signup consent/notice and GitHub installation disclosure; confirm support channels; version and archive approved policies. See [security](14-security-and-privacy-specification.md) and [launch](20-launch-and-beta-plan.md).
