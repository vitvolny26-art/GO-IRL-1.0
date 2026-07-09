# GO IRL Knowledge Platform 2.0

Status: Current planning document
Owner: Project Archivist
Last updated: 2026-07-09

## Purpose

This document turns the current knowledge-system discussion into an executable six-step roadmap.

It is the operating plan for the Archivist after the documentation migration into `GO-IRL-1.0`.

## Core principle

```text
Chat is temporary memory. Documentation is permanent memory.
```

If important knowledge exists only in chat, it is considered at risk of being lost.

## The six-step plan

| Step | Objective | Output | Status |
|---|---|---|---|
| 1 | Finish documentation migration into `GO-IRL-1.0` | Source docs synced, index updated | In progress |
| 2 | Fill the approved structure with real content | `docs/market`, `docs/roadmap`, `docs/governance`, `docs/onboarding`, `docs/audit` populated | In progress |
| 3 | Complete Bible and create ADR for key decisions | Bible completion audit reduced; ADR registry created | Not started |
| 4 | Move competitor analysis into `docs/market` | Competitor analysis, watchlist, benchmarks, market rules | Not started |
| 5 | Create Playbooks and Governance documents | Repeatable task/release/market/doc processes | In progress |
| 6 | Establish regular reviews | Weekly/monthly/quarterly knowledge review cadence | Not started |

---

## Step 1 — Finish documentation migration

Goal:

- Make `GO-IRL-1.0` the working repository with the current documentation set.

Required actions:

- Sync core docs: `README.md`, `ROADMAP.md`, `BACKLOG.md`, `RELEASE_NOTES.md`, `CHANGELOG.md`.
- Sync audit docs: `docs/MVP_DOC_AUDIT.md`, `docs/MISSING_SECTIONS.md`, `docs/DATABASE_SCHEMA_AUDIT.md`, `docs/DOCUMENTATION_AUDIT.md`.
- Sync Bible boundary docs.
- Sync market docs.
- Sync operations / beta docs.
- Update `DOCS_INDEX.md` after every meaningful structure/status change.

Done when:

- `DOCS_INDEX.md` in `GO-IRL-1.0` reflects the actual documentation state.
- No critical current documentation exists only in the old repo.
- Deprecated/historical docs are clearly marked.

---

## Step 2 — Fill the approved structure with real content

Target structure:

```text
docs/
├── onboarding/
├── governance/
├── market/
├── roadmap/
├── audit/
├── bible/
├── product/
├── architecture/
├── operations/
├── qa/
├── adr/
├── playbooks/
├── history/
└── brain/
```

Rules:

- Do not create empty decorative folders.
- Every new document must have purpose, owner, status, and last updated date.
- Every promoted source-of-truth document must be registered in `DOCS_INDEX.md`.
- Future vision must be tagged as future.

---

## Step 3 — Complete Bible and ADR

Bible work:

- Finish weak MVP 1.0 sections.
- Keep future vision clearly marked.
- Do not rewrite historical books unnecessarily.
- Reconcile Bible with current code, Supabase schema, roadmap, and market positioning.

ADR work:

Create ADR entries for key decisions:

```text
ADR-001 Telegram Mini App First
ADR-002 Olomouc First
ADR-003 Browser Demo Mode
ADR-004 Trusted Telegram Auth
ADR-005 Temporary Activity Chat
ADR-006 Six Beta Categories
ADR-007 Sport Coach MVP
ADR-008 Weather Widget
ADR-009 Share / Join Flow
ADR-010 Documentation Architecture
```

Done when:

- Strategic decisions are no longer stored only in chat.
- Future agents can understand why major product and architecture decisions were made.

---

## Step 4 — Move competitor analysis into `docs/market`

Required documents:

```text
docs/market/COMPETITOR_ANALYSIS.md
docs/market/COMPETITOR_WATCH.md
docs/market/FEATURE_BENCHMARK.md
docs/market/UX_PATTERNS.md
docs/market/MARKET_RULES.md
docs/market/WATCHLIST.md
```

Market rule:

```text
Competitors are inputs, not requirements.
```

Before recommending a new feature, agents must check:

- Does this feature exist in competitor products?
- How is it organized?
- What works?
- What does not work?
- Does it support the GO IRL core loop?
- Does it match "Меньше скроллинга. Больше жизни"?

Done when:

- Competitor research is discoverable from `DOCS_INDEX.md`.
- New product work has a repeatable market-check path.

---

## Step 5 — Create Playbooks and Governance documents

Governance documents:

```text
docs/governance/AI_ORGANIZATION.md
docs/governance/KNOWLEDGE_PLATFORM_2_0.md
docs/governance/DOCUMENTATION_GOVERNANCE.md
docs/governance/MARKET_GOVERNANCE.md
docs/governance/RELEASE_GOVERNANCE.md
```

Playbooks:

```text
docs/playbooks/START_NEW_FEATURE.md
docs/playbooks/FIX_CRITICAL_BUG.md
docs/playbooks/PREPARE_RELEASE.md
docs/playbooks/MARKET_REVIEW.md
docs/playbooks/DOCUMENTATION_REVIEW.md
```

Done when:

- Common tasks can be started from a playbook.
- AI roles know what to read, what to check, and what not to touch.

---

## Step 6 — Establish regular reviews

Recommended cadence:

### Weekly

- `DOCS_INDEX.md` health.
- New document status.
- Knowledge debt.
- Open documentation conflicts.

### Monthly

- Competitor watch.
- Market trends.
- Telegram Mini Apps changes.
- Supabase / React / Vite / Vercel relevant changes.
- Roadmap and Backlog drift.

### Quarterly

- Bible review.
- ADR review.
- AI roles review.
- Governance review.
- Documentation structure review.

### Yearly

- Constitution / Manifesto / Project DNA review.
- Long-term strategy review.

Done when:

- Review cadence is documented.
- Reviews have owners.
- Findings produce updates to docs, ADR, roadmap, backlog, or audit files.

---

## Knowledge debt

Knowledge debt means project knowledge is missing, stale, duplicated, or only stored in chat.

Examples:

- Important decision has no ADR.
- Competitor analysis is older than 30 days for high-priority products.
- Bible says future behavior as if it is current MVP.
- Roadmap contradicts README.
- Sprint history is scattered.
- Deprecated document has no replacement.

Knowledge debt must be tracked and reduced like technical debt.

---

## Final Definition of Done

Knowledge Platform 2.0 is done when:

1. Current documentation is migrated to `GO-IRL-1.0`.
2. `DOCS_INDEX.md` is accurate.
3. Source-of-truth hierarchy is explicit.
4. Bible has MVP/current/future boundaries.
5. ADR exists for strategic decisions.
6. Market Intelligence exists and has a watch process.
7. Playbooks exist for repeated work.
8. AI roles and councils are documented.
9. Sprint docs are moved or clearly classified.
10. Regular knowledge reviews are defined.

## Current next action

Continue Step 1 until core docs, market docs, audit docs, and roadmap/sprint docs are synchronized.
