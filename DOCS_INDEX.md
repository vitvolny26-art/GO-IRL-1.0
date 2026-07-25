---
title: GO IRL Documentation Status Registry
owner: Project Archivist
status: Active
source_of_truth: true
last_review: 2026-07-25
next_review: 2026-08-25
---

# GO IRL Documentation Status Registry

Single entry point for GO IRL documentation status, ownership, and conflict tracking.

Use this file before changing product logic, architecture, QA flow, beta scope, release wording, AI role behavior, or historical product philosophy.

## Absolute source-of-truth rules

- Verified runtime evidence and current GitHub `main` define implemented reality.
- `docs/PRODUCT_PHILOSOPHY.md` is the source of truth for why GO IRL exists and for the mission **Less scrolling. More life.**
- `docs/GO_IRL_CONSTITUTION.md` is the source of truth for GO IRL philosophy and architecture principles.
- `docs/GO_IRL_PRODUCT.md` is the central product narrative and the bridge between current production truth, the proven Closed-Beta baseline, the approved next phase, and long-term vision.
- `docs/MARKET_POSITIONING.md` is the source of truth for market positioning and product feature filtering.
- `docs/COMPETITOR_WATCH.md` is the source of truth for competitor signals, but competitor signals must not automatically become product scope.
- `README.md` is the source of truth for current repository scope: implemented features, stack, setup, and current runtime model.
- `docs/release/CURRENT_PHASE.md` is the source of truth for the current lifecycle phase.
- `RELEASE_NOTES.md` is the source of truth for release implementation status and must not contradict `README.md` or the current lifecycle phase.
- `DEPLOYMENT.md` is the source of truth for Vercel-first deployment flow.
- `docs/SPORT_COACH_MVP.md` is the source of truth for Sport Coach MVP 1.1 boundaries.
- `docs/MVP_DOC_AUDIT.md` is the source of truth for known documentation conflicts.
- `docs/MISSING_SECTIONS.md` is the source of truth for missing documentation boundaries.
- `docs/DATABASE_SCHEMA_AUDIT.md` is the source of truth for current schema-vs-future-schema documentation conflicts.
- `docs/audit/KNOWLEDGE_DEBT.md` is the source of truth for open documentation and knowledge debt.
- `docs/governance/KNOWLEDGE_PLATFORM.md` is the source of truth for knowledge status model, review cadence, knowledge debt, and Project Memory Bus.
- `docs/governance/ARCHIVIST_OPERATING_POLICY.md` is the source of truth for Archivist authority, human gates, report lifecycle, and automation boundaries.
- `docs/automation/DOCUMENTATION_GOVERNANCE_ARCHIVIST.md` is the source of truth for merged documentation-governance workflow IDs, schedule, destinations, deduplication, and error handling.
- `docs/onboarding/ARCHIVIST_CHARTER.md` is the source of truth for the Project Archivist role.
- `docs/onboarding/PROJECT_COORDINATOR_CHARTER.md` is the source of truth for the report-only Project Coordinator role and AI Staff OS mission boundaries.
- `docs/onboarding/AI_ROLES.md` is the working registry for reusable AI roles.
- `docs/onboarding/AI_FIXER_AGENT.md` is the source of truth for the AI Fixer / QA + UX Polish Agent.
- `docs/governance/AI_ORGANIZATION.md` is the working source for AI councils, escalation, and role interaction.
- `docs/reports/README.md` defines AI/task report naming and required report sections.
- `docs/THIRD_PARTY_NOTICES.md` records attribution and license notices for third-party visual assets used in generated product media.
- Historical snapshot files must not be used for code generation.
- Product Bible files preserve reconciled product knowledge for Books I-X. They must not override current code, verified runtime, Supabase schema, auth, or RLS.
- Do not change `.env`, secrets, Supabase RLS, auth, or destructive SQL without explicit approval.

## Knowledge Status Model

Strategic and operational documents should use this status model:

```text
Draft
Review
Approved
Active
Deprecated
Archived
```

Preferred metadata header:

```yaml
title:
owner:
status:
source_of_truth:
last_review:
next_review:
```

## Статусный реестр документации

| Документ | Тип | Статус | Source of Truth | Известные конфликты |
|---|---|---|---|---|
| `README.md` | Core / Code Scope | Active | Да | Must stay aligned with `docs/GO_IRL_PRODUCT.md`, `RELEASE_NOTES.md`, and `docs/release/CURRENT_PHASE.md`. |
| `DOCS_INDEX.md` | Registry | Active | Да | Must be updated after every canonical doc move/status change. |
| `ROADMAP.md` | Product Planning | Active | Да | Release Preparation is current; broad platform work remains future. Sprint structure is mirrored under `docs/roadmap/`. |
| `BACKLOG.md` | Product Planning | Draft | Нет | Future items must remain tagged. |
| `CHANGELOG.md` | Release History | Draft | Нет | Needs quality-gate verification before release claims. |
| `docs/release/CURRENT_PHASE.md` | Release / Current Phase | Active | Да | Lifecycle-phase authority; must stay aligned with README, ROADMAP, and RELEASE_NOTES. |
| `RELEASE_NOTES.md` | Release Status | Active | Да | Trusted Auth is `[SHIPPED/PRODUCTION PATH]`; operational smoke checks remain. |
| `DEPLOYMENT.md` | Release / Deploy | Active | Да | Must remain Vercel-first; old Netlify references are historical only. |
| `BETA_CHECKLIST.md` | QA / Beta | Active | Да | Historical beta evidence; needs lifecycle-aware wording where reused. |
| `BETA_TESTING.md` | QA / Beta | Active | Да | Browser Demo Mode should remain documented and local-only. |
| `SPRINTS.md` | Roadmap / Sprint History | Draft | Нет | Root historical plan; canonical roadmap-folder copy exists in `docs/roadmap/SPRINTS.md`. |
| `SPRINT0_STATUS.md` | Historical Snapshot | Deprecated | Нет | Contains Sprint 0 / Netlify-era proof; not current Vercel release truth. |
| `CHECKLIST.md` | Historical Local Checklist | Deprecated | Нет | Old local branch/Docker/Prisma/Turbo assumptions; do not generate code from it. |
| `SETUP.md` | Legacy Setup | Deprecated | Нет | Old Windows paths and `.bat` / `.ps1` workflow. |
| `SETUP_RU.md` | Legacy Setup | Deprecated | Нет | Old Windows paths and `.bat` / `.ps1` workflow. |
| `PATCH_REPORT.md` | Historical Patch Report | Deprecated | Нет | Trusted Auth implementation history, not current release truth. |
| `GO_IRL_DOCUMENTATION.md` | Generated Snapshot | Deprecated | Нет | Old generated snapshot; may contain outdated README/Roadmap excerpts. |
| `docs/PRODUCT_PHILOSOPHY.md` | Product Philosophy | Active | Да | Long-term philosophy; examples of future capabilities do not expand current scope. |
| `docs/GO_IRL_CONSTITUTION.md` | Product / Architecture Constitution | Active | Да | Principles source of truth; implementation truth remains code/runtime/schema. |
| `docs/GO_IRL_PRODUCT.md` | Product / Central Scope Bridge | Active | Да | Separates current production truth, proven beta baseline, approved next phase, and long-term vision. |
| `docs/MARKET_POSITIONING.md` | Market / Feature Filter | Active | Да | Must gate new feature categories before scope expansion. |
| `docs/COMPETITOR_WATCH.md` | Market Watch | Active | Да | Competitor signals must not auto-create product scope. |
| `docs/MVP_DOC_AUDIT.md` | Audit / Conflict Registry | Active | Да | Registry for documentation conflicts and resolutions. |
| `docs/MISSING_SECTIONS.md` | Audit / Missing Boundaries | Active | Да | Registry for undocumented boundaries. |
| `docs/DATABASE_SCHEMA_AUDIT.md` | Audit / Supabase Schema | Active | Да | Separates current Supabase schema/migrations from future database architecture; contains one stale Bible filename reference. |
| `docs/audit/KNOWLEDGE_DEBT.md` | Audit / Knowledge Debt | Active | Да | Tracks missing, stale, conflicting, duplicated, or misleading project knowledge; no item is closed by the Bible pass alone. |
| `docs/SPORT_COACH_MVP.md` | Product Scope / Coach | Active | Да | `CoachRequestPanel.tsx` is current UI basis; Role Choice and Review Flow are future. |
| `docs/MVP_STABILIZATION_PLAN.md` | MVP Plan | Active | Да | Stabilization plan and weather/share/join/profile/demo boundaries. |
| `docs/GO_IRL_1_1_STABILIZATION.md` | Stabilization Ledger | Draft | Нет | Task statuses may become historical. |
| `docs/DEVELOPMENT_PROTOCOL.md` | Engineering Protocol | Active | Да | pnpm, small patches, no unsafe changes. |
| `docs/onboarding/ARCHIVIST_CHARTER.md` | Onboarding / Role Charter | Active | Да | Source of truth for Project Archivist duties, reading order, market intelligence duty, and memory rules. |
| `docs/onboarding/PROJECT_COORDINATOR_CHARTER.md` | Onboarding / Role Charter | Active | Да | Source of truth for report-only Daily Mission routing, role activation, budgets, validation, and human gates. |
| `docs/onboarding/AI_ROLES.md` | Onboarding / Role Registry | Draft | Да | Working registry for AI roles; individual charters still need expansion. |
| `docs/onboarding/AI_FIXER_AGENT.md` | Onboarding / AI Agent Prompt | Active | Да | Source of truth for small bug, QA, and UX polish agent behavior and safety limits. |
| `docs/reports/README.md` | Reports / AI Work Logs | Active | Нет | Defines report location and format. |
| `docs/reports/2026-07-16-agent-report-archivist-finalization.md` | Reports / Agent Work Log | Draft | Нет | Durable record of the Archivist governance rollout; not runtime or governance authority. |
| `docs/reports/2026-07-25-product-bible-completion-report.md` | Reports / Product Bible | Draft | Нет | Evidence and remaining decisions from the Bible completion pass. |
| `docs/governance/AI_ORGANIZATION.md` | Governance / AI Councils | Draft | Да | Working source for AI councils, role assignment commands, escalation, and Coordinator interaction. |
| `docs/governance/KNOWLEDGE_PLATFORM.md` | Governance / Knowledge Platform | Active | Да | Source of truth for Knowledge Status Model, metadata, Knowledge Debt, KPIs, reviews, and Project Memory Bus. |
| `docs/governance/ARCHIVIST_OPERATING_POLICY.md` | Governance / Archivist Policy | Active | Да | Canonical authority, lifecycle, human-gate, and automation-boundary rules. |
| `docs/governance/TOOL_OPERATING_MODEL.md` | Governance / Tool Operating Model | Review | Нет | Proposed responsibility boundaries and routing rules; must not be treated as Active before review and merge. |
| `docs/automation/DOCUMENTATION_GOVERNANCE_ARCHIVIST.md` | Automation / Governance Workflow | Active | Да | Merged n8n workflow record; GitHub remains authority. |
| `docs/roadmap/SPRINTS.md` | Roadmap / Sprint Overview | Draft | Нет | Roadmap-folder copy of sprint plan; not current product scope by itself. |
| `docs/roadmap/SPRINT_0.md` | Roadmap / Sprint Record | Archived | Нет | Historical Sprint 0 record; Netlify references are historical only. |
| `docs/roadmap/SPRINT_1.md` | Roadmap / Sprint Record | Archived | Нет | Historical MVP Core record; current scope controlled by ROADMAP/BACKLOG/README. |
| `docs/roadmap/SPRINT_2.md` | Roadmap / Sprint Record | Draft | Нет | Telegram/notification direction; current runtime boundaries override old assumptions. |
| `docs/roadmap/SPRINT_3.md` | Roadmap / Sprint Record | Draft | Нет | Trust/RLI future layer; not current product scope. |
| `docs/roadmap/SPRINT_4.md` | Roadmap / Sprint Record | Draft | Нет | Modules/discovery future layer; release baseline remains focused. |
| `docs/roadmap/SPRINT_5.md` | Roadmap / Sprint Record | Draft | Нет | Production growth future layer; blocked until release gates are verified. |
| `docs/Database.md` | Architecture | Draft | Нет | Future database architecture; not current schema. |
| `docs/RLS.md` | Supabase / RLS | Draft | Нет | Do not edit policies without explicit approval. |
| `docs/Security.md` | Security | Draft | Нет | Must stay aligned with Trusted Auth production path. |
| `docs/EventLifecycle.md` | Architecture | Draft | Нет | Activity Chat boundary added; final chat expiry needs code/schema decision. |
| `docs/Notifications.md` | Architecture / Future | Draft | Нет | Future concepts must be separated from verified reminder/lifecycle runtime. |
| `docs/AI.md` | AI / Future | Draft | Нет | AI discovery is not current product scope. |
| `docs/reputation.md` | Reputation / Future | Draft | Нет | RLI/Trust future model, not current complete runtime. |
| `docs/vertical-experiences.md` | Product / Future Architecture | Draft | Нет | Current release baseline is Olomouc-first; future verticals need approval. |
| `docs/bible/00-completion-audit.md` | Bible Audit | Active | Да | Completion map, conflicts, stale references, and owner decisions. |
| `docs/bible/00-bible-roadmap.md` | Bible Maintenance | Active | Да | Maintenance order and review triggers after Bible 1.0 reconciliation. |
| `docs/bible/01-foundation/00-foundation-overview.md` | Bible / Book I | Active | Да | Product identity, lifecycle layers, baseline, decision filter. |
| `docs/bible/01-foundation/01-product-philosophy.md` | Bible / Book I | Active | Да | Concise philosophy boundary. |
| `docs/bible/01-foundation/01-why-we-exist.md` | Bible / Book I | Active | Да | User problem and product answer. |
| `docs/bible/01-foundation/02-core-principles.md` | Bible / Book I | Active | Да | Core product and runtime principles. |
| `docs/bible/01-foundation/03-mvp-scope-and-market-positioning.md` | Bible / Book I | Active | Да | Proven Olomouc baseline, current lifecycle, non-goals, expansion rule. |
| `docs/bible/02-platform-architecture.md` | Bible / Book II | Active | Да | Current platform architecture and implementation boundaries. |
| `docs/bible/03-database-and-supabase-boundaries.md` | Bible / Book III | Active | Да | Current schema authority, RLS/auth boundary, chat decision, provider data boundary. |
| `docs/bible/04-modules-architecture.md` | Bible / Book IV | Active | Да | Current modules, proven category baseline, future containment. |
| `docs/bible/04-modules-mvp-audit.md` | Bible / Book IV Audit | Active | Да | Current/gated/future module classification. |
| `docs/bible/05-product-requirements.md` | Bible / Book V | Active | Да | Current release-preparation PRD. |
| `docs/bible/05-product-requirements-mvp-split.md` | Bible / Book V Scope | Active | Да | Current, proven beta, approved next, gated, and long-term requirement layers. |
| `docs/bible/06-ux-interaction-guidelines.md` | Bible / Book VI | Active | Да | UX principles and current interaction surfaces. |
| `docs/bible/07-beta-readiness-and-operations.md` | Bible / Book VII | Active | Да | Closed-Beta evidence and handoff into Release Preparation. |
| `docs/bible/08-runtime-boundaries.md` | Bible / Book VIII | Active | Да | Runtime/auth/Supabase/demo/provider boundaries. |
| `docs/bible/09-governance-and-ai-organization.md` | Bible / Book IX | Active | Да | Authority, system roles, AI and automation boundaries. |
| `docs/bible/10-operations-and-release.md` | Bible / Book X | Active | Да | Release Preparation gates, provider operations, incidents, readiness wording. |
| `supabase/README.md` | Supabase Setup | Active | Да | Must reflect Trusted Auth and migration reality. |
| `supabase/schema.sql` | Supabase Schema | Active | Да | Production-sensitive. Read-only during documentation cleanup. |
| `supabase/schema_next.sql` | Future Schema | Draft | Нет | Do not apply without review. |
| `supabase/migration_v*.sql` | Supabase Migration History | Active | Да | Read-only for docs cleanup. No destructive SQL. |

## Current documentation conflicts

| Conflict | Files | Resolution |
|---|---|---|
| Current lifecycle phase wording was split across active beta and release documents. | `docs/release/CURRENT_PHASE.md`, `README.md`, `ROADMAP.md`, `RELEASE_NOTES.md`, Product Bible | `CURRENT_PHASE` owns lifecycle phase; Closed Beta is historical evidence and Release Preparation is current. |
| Mission wording used both “More living” and “More life.” | `README.md`, Product Philosophy, Constitution, Market Positioning, Product Bible | Canonical wording is **Less scrolling. More life.** |
| Trusted Auth was both current production model and public blocker. | `README.md`, `RELEASE_NOTES.md`, `PATCH_REPORT.md` | `RELEASE_NOTES.md` marks Trusted Auth as `[SHIPPED/PRODUCTION PATH]`; operational checks remain. |
| Coach UI promise exceeded current implementation. | `docs/SPORT_COACH_MVP.md`, `src/components/CoachRequestPanel.tsx` | Role Choice and Review Flow remain future scope. |
| Sprint 0 Netlify proof conflicted with current Vercel flow. | `SPRINT0_STATUS.md`, `DEPLOYMENT.md`, `BETA_CHECKLIST.md` | Sprint 0 docs are historical/deprecated. |
| Legacy setup docs could mislead AI/code generation. | `SETUP.md`, `SETUP_RU.md`, `CHECKLIST.md` | Historical/deprecated warning banners required. |
| Activity Chat, Browser Demo Mode, Weather, Telegram Mini App limits were scattered. | `docs/MISSING_SECTIONS.md`, `BETA_TESTING.md`, `docs/EventLifecycle.md`, Product Bible | Boundaries are centralized; chat expiry still needs product/schema decision. |
| Bible files could be mistaken for current schema or implementation instructions. | `docs/bible/*`, code, migrations | Books I-X are reconciled boundary documents; runtime/code/schema remain implementation authority. |
| Future DB architecture conflicted with current Supabase migrations. | `docs/Database.md`, `docs/DATABASE_SCHEMA_AUDIT.md`, current migrations | `docs/DATABASE_SCHEMA_AUDIT.md` controls the distinction; its stale `03-database-design.md` filename remains recorded for later reconciliation. |
| AI roles and Archivist rules existed only in chat. | Chat history, onboarding docs | Added durable role, governance, and reporting documents. |
| Project Coordinator authority existed only as draft governance language. | Coordinator charter, role registry, AI organization | Added a report-only Coordinator charter and synchronized role/governance boundaries. |
| Knowledge architecture existed only in discussion. | Chat history, governance docs | Added `KNOWLEDGE_PLATFORM.md` with status model, KPIs, review cadence, and Project Memory Bus. |
| Sprint structure existed as loose root-level docs. | `SPRINTS.md`, `SPRINT0_STATUS.md` | Added `docs/roadmap/SPRINTS.md` and `docs/roadmap/SPRINT_0.md` through `SPRINT_5.md`. |
| Knowledge debt was known only from audit discussion. | Audit and chat history | Added `docs/audit/KNOWLEDGE_DEBT.md` as active tracking source. |
| Production repository identity still pointed agents and Vercel setup to legacy `GO-IRL`. | Deployment/onboarding/stabilization docs | Canonical production repository is `vitvolny26-art/GO-IRL-1.0`. |

## Sprint documentation decision

Sprint docs should not stay as loose root-level artifacts long term.

Preferred Documentation 2.0 structure:

```text
docs/roadmap/
├── ROADMAP.md
├── BACKLOG.md
├── SPRINTS.md
├── SPRINT_0.md
├── SPRINT_1.md
├── SPRINT_2.md
├── SPRINT_3.md
├── SPRINT_4.md
└── SPRINT_5.md
```

Rules:

- `ROADMAP.md` remains the living roadmap.
- `BACKLOG.md` remains the controlled work queue.
- Sprint 0-5 files become historical execution records and decision logs.
- Root `SPRINT0_STATUS.md` stays deprecated until links are checked and migration is complete.
- Root `SPRINTS.md` stays as legacy/transition until links are checked.
- Do not move or delete root files blindly; update links and `DOCS_INDEX.md` in the same documentation-only phase.

## Current tree target

```text
GO IRL Documentation
├── Core
│   ├── README.md
│   ├── DOCS_INDEX.md
│   ├── ROADMAP.md
│   ├── BACKLOG.md
│   ├── CHANGELOG.md
│   └── RELEASE_NOTES.md
├── Product / Market
│   └── docs/
│       ├── PRODUCT_PHILOSOPHY.md
│       ├── GO_IRL_CONSTITUTION.md
│       ├── GO_IRL_PRODUCT.md
│       ├── MARKET_POSITIONING.md
│       ├── COMPETITOR_WATCH.md
│       ├── SPORT_COACH_MVP.md
│       └── MVP_STABILIZATION_PLAN.md
├── Architecture
│   └── docs/
│       ├── Database.md
│       ├── DATABASE_SCHEMA_AUDIT.md
│       ├── RLS.md
│       ├── Security.md
│       ├── EventLifecycle.md
│       └── vertical-experiences.md
├── Audit
│   ├── docs/MVP_DOC_AUDIT.md
│   ├── docs/MISSING_SECTIONS.md
│   ├── docs/DATABASE_SCHEMA_AUDIT.md
│   ├── docs/audit/KNOWLEDGE_DEBT.md
│   ├── docs/DOCUMENTATION_AUDIT.md
│   └── project-audit/
├── Bible
│   └── docs/bible/
│       ├── 00-completion-audit.md
│       ├── 00-bible-roadmap.md
│       ├── 01-foundation/
│       ├── 02-platform-architecture.md
│       ├── 03-database-and-supabase-boundaries.md
│       ├── 04-modules-architecture.md
│       ├── 04-modules-mvp-audit.md
│       ├── 05-product-requirements.md
│       ├── 05-product-requirements-mvp-split.md
│       ├── 06-ux-interaction-guidelines.md
│       ├── 07-beta-readiness-and-operations.md
│       ├── 08-runtime-boundaries.md
│       ├── 09-governance-and-ai-organization.md
│       └── 10-operations-and-release.md
├── Governance
│   └── docs/governance/
│       ├── AI_ORGANIZATION.md
│       ├── KNOWLEDGE_PLATFORM.md
│       ├── ARCHIVIST_OPERATING_POLICY.md
│       └── TOOL_OPERATING_MODEL.md
├── Automation
│   └── docs/automation/
│       └── DOCUMENTATION_GOVERNANCE_ARCHIVIST.md
├── Onboarding
│   └── docs/onboarding/
│       ├── ARCHIVIST_CHARTER.md
│       ├── PROJECT_COORDINATOR_CHARTER.md
│       ├── AI_ROLES.md
│       └── AI_FIXER_AGENT.md
├── Reports
│   └── docs/reports/
│       ├── README.md
│       └── 2026-07-25-product-bible-completion-report.md
├── Roadmap / Sprints
│   ├── ROADMAP.md
│   ├── BACKLOG.md
│   ├── SPRINTS.md
│   └── docs/roadmap/
│       ├── SPRINTS.md
│       ├── SPRINT_0.md
│       ├── SPRINT_1.md
│       ├── SPRINT_2.md
│       ├── SPRINT_3.md
│       ├── SPRINT_4.md
│       └── SPRINT_5.md
└── Deprecated / Snapshot Candidates
    ├── SETUP.md
    ├── SETUP_RU.md
    ├── PATCH_REPORT.md
    ├── SPRINT0_STATUS.md
    └── GO_IRL_DOCUMENTATION.md
```

## Maintenance rule

Update this registry when:

- a document is added, moved, deprecated, or promoted to source of truth;
- release blockers change;
- future vision becomes current scope;
- code implementation contradicts docs;
- Product Bible files are audited or reclassified;
- Supabase migration/auth/RLS docs are audited;
- Sprint docs are moved into `docs/roadmap/`;
- AI roles, AI agents, councils, or reporting rules are added/changed;
- Knowledge Platform status model or governance rules change;
- Knowledge Debt items are opened or closed.
