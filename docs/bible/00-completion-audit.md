# GO IRL Bible Completion Audit

Generated: 2026-07-08
Updated: 2026-07-08

## Verdict

The GO IRL Bible is **partly completed for MVP 1.0 / closed beta boundaries**, but it is **not yet final**.

The current archive contains useful and important product material. It must be treated as a structured product draft with explicit current/future boundaries, not as an automatic implementation plan.

Do not rewrite from scratch. Preserve, classify, reconcile, and complete only missing parts.

The Bible must also stay reconciled with the current market layer:

- `docs/MARKET_POSITIONING.md`
- `docs/COMPETITOR_WATCH.md`

These files define the Olomouc beta market boundaries and must block future-platform scope from being treated as current MVP.

## Current confirmed files

```text
GO IRL Bible
├── docs/bible/01-foundation/
│   ├── 01-why-we-exist.md
│   ├── 02-core-principles.md
│   └── 03-mvp-scope-and-market-positioning.md
├── docs/bible/02-platform-architecture.md
├── docs/bible/03-database-design.md
├── docs/bible/04-modules-architecture.md
├── docs/bible/04-modules-mvp-audit.md
├── docs/bible/05-product-requirements.md
├── docs/bible/05-product-requirements-mvp-split.md
├── docs/bible/06-ux-interaction-guidelines.md
├── docs/bible/07-beta-readiness-and-operations.md
└── docs/bible/08-runtime-boundaries.md
```

## Completeness status

| Part | Current file | Status | Notes |
|---|---|---|---|
| Book I — Foundation / Chapter 1 | `01-foundation/01-why-we-exist.md` | Partial / usable | Strong manifesto chapter. Needs final editorial pass and alignment with market positioning. |
| Book I — Foundation / Chapter 2 | `01-foundation/02-core-principles.md` | Partial / usable | Has 22 principles and Engineering Oath. Needs alignment with current MVP architecture and beta guardrails. |
| Book I — Foundation / Chapter 3 | `01-foundation/03-mvp-scope-and-market-positioning.md` | Current MVP boundary | Added to define MVP 1.0 scope, market guardrails, Olomouc beta, six categories, and non-goals. |
| Book II — Platform Architecture | `02-platform-architecture.md` | Partial / usable | Good architecture draft. Uses broad future platform vision. Needs reconciliation with current React/Supabase/Telegram Mini App MVP and Olomouc-first market scope. |
| Book III — Database Design | `03-database-design.md` | Contained / future vision | Marked as historical/future DB vision. Current schema truth is `supabase/schema.sql`, migrations, `supabase/README.md`, and `docs/DATABASE_SCHEMA_AUDIT.md`. |
| Book IV — Modules Architecture | `04-modules-architecture.md` | Contained / future vision | Historical module vision preserved; MVP interpretation is defined in `04-modules-mvp-audit.md`. |
| Book IV Audit — Modules MVP Audit | `04-modules-mvp-audit.md` | Current MVP boundary | Added to contain full module registry/AI/multi-module vision and map six beta categories to current MVP. |
| Book V — Product Requirements Document | `05-product-requirements.md` | Historical PRD draft | Preserved as product vision. Current MVP interpretation is defined in `05-product-requirements-mvp-split.md`. |
| Book V Audit — PRD MVP Split | `05-product-requirements-mvp-split.md` | Current MVP boundary | Added to classify PRD items into MVP 1.0, MVP 1.1 stabilization, future, and blocked-before-beta. |
| Book VI — UX & Interaction Guidelines | `06-ux-interaction-guidelines.md` | Draft / not final | UX guide exists, but original numbering suggests it was chapter 07. Needs final consistency pass and Telegram Mini App UX reconciliation. |
| Book VII — Beta Readiness and Operations | `07-beta-readiness-and-operations.md` | Current MVP boundary | Added to define beta operations, QA gates, release gates, Browser Demo Mode, Telegram constraints, chat/share/weather/coach boundaries. |
| Book VIII — Runtime Boundaries | `08-runtime-boundaries.md` | Current MVP boundary | Added to define Trusted Telegram Auth, Supabase, Browser Demo Mode, Profile/Avatar, Chat, Share/Join, Weather, Admin/Moderation runtime boundaries. |

## Numbering issue

The old filenames suggest the historical sequence was inconsistent:

```text
Chapter 1 — Why We Exist
Chapter 2 — Core Principles
Chapter 3 — MVP Scope and Market Positioning     added during Bible completion
Book II — Platform Architecture
Book III — 04 Database Design
Book IV — 05 Modules Architecture
Book IV Audit — Modules MVP Audit                added during Bible completion
Book V — PRD
Book V Audit — PRD MVP Split                      added during Bible completion
Book VI — 07 UX & Interaction Guidelines
Book VII — Beta Readiness and Operations          added during Bible completion
Book VIII — Runtime Boundaries                    added during Bible completion
```

Do not renumber old files yet. Renumbering is a later editorial task after product review.

## Bible 1.0 coverage

Bible 1.0 must describe the beta-ready MVP, not the entire future platform.

| Section | Status | Notes |
|---|---|---|
| MVP 1.0 scope | Added | Covered by `01-foundation/03-mvp-scope-and-market-positioning.md`. |
| Market positioning | Added | Covered by `01-foundation/03-mvp-scope-and-market-positioning.md`, aligned with market guardrails. |
| Competitor boundaries | Added | Covered as competitor feature filter in Chapter 3. |
| Olomouc closed beta scope | Added | Covered in Chapter 3 and Book VII. |
| Six-category beta module boundary | Added | Covered in `04-modules-mvp-audit.md`. |
| PRD 1.0 / 1.1 split | Added | Covered in `05-product-requirements-mvp-split.md`. |
| Telegram Mini App constraints | Added / needs UX audit | Covered in Book VII and Book VIII; still needs reconciliation with UX guide. |
| Browser Demo Mode | Added | Covered in Book VII and Book VIII. |
| Event lifecycle | Partly covered | `docs/EventLifecycle.md` is updated; Bible still needs a dedicated final lifecycle chapter or UX/PRD sync. |
| Activity Chat shipped behavior | Added / needs code audit | Covered in Book VII, Book VIII, and PRD split; schema audit found current migration uses chat creation + 24h. |
| Share / Join flow | Added | Covered in Book VII, Book VIII, and PRD split. |
| Weather Widget shipped behavior | Added | Covered in Book VII, Book VIII, and PRD split. |
| Profile shipped behavior | Added / needs code audit | Profile/avatar runtime boundary covered in Book VIII and PRD split. |
| Supabase trusted auth reality | Added / needs smoke test | Covered in Book VIII and external auth docs. |
| QA and release gates | Added | Covered in Book VII, Book VIII, and PRD split. |
| Non-goals for 1.0 | Added | Covered in Chapter 3, Book VII, Modules MVP Audit, and PRD split. |

## What is missing for Bible 1.1+

Future material must be clearly marked as `1.1+` or `future vision`.

| Section | Status | Notes |
|---|---|---|
| Sport Coach MVP | Partly covered | Book VII contains boundary; `docs/SPORT_COACH_MVP.md` remains source of truth. |
| Coach request lifecycle | Partly missing | Must reconcile with current `CoachRequestPanel`. |
| Coach reviews / trust model | Future | Must avoid claiming as current unless implemented. |
| Event Roles after Sport Coach | Future | Host/Game Master/Guide/Language Buddy belong after Sport Coach validates value. |
| Moderation model | Future | Reporting/blocking/admin flows need implementation status. |
| Notifications model | Future | Mini App background limits must be explicit. |
| Recommendation engine | Future | PRD split marks this as future, not current MVP. |
| AI event discovery | Future | Keep as architecture/backlog, not MVP. |
| Multi-vertical platform | Future | Current beta is Olomouc-first and six-category focused. |
| Admin surface | Future | Keep separate from current app. |

## Required reconciliation before final Bible

1. Reconcile `06-ux-interaction-guidelines.md` with current mobile Telegram Mini App UX.
2. Add or sync a final event lifecycle chapter if needed after code/schema audit.
3. Decide if missing chapters should be created or if current files should be renumbered permanently.
4. Produce a final `GO IRL Bible 1.0` set only after product review and quality gates.

## Do not do yet

- Do not rewrite all books from scratch.
- Do not delete historical drafts.
- Do not let future code refactors overwrite product philosophy.
- Do not import competitor features into MVP without passing the market guardrail.
- Do not mark the Bible final until MVP/code/schema/market reconciliation is done.
- Do not run SQL, change RLS, change auth, or touch secrets from Bible cleanup.

## Recommended next structure

If the Bible is finalized later, use this working structure:

```text
docs/bible/
├── 00-completion-audit.md
├── 00-bible-roadmap.md
├── 01-foundation/
│   ├── 01-why-we-exist.md
│   ├── 02-core-principles.md
│   └── 03-mvp-scope-and-market-positioning.md
├── 02-platform-architecture.md
├── 03-database-design.md
├── 04-modules-architecture.md
├── 04-modules-mvp-audit.md
├── 05-product-requirements.md
├── 05-product-requirements-mvp-split.md
├── 06-ux-interaction-guidelines.md
├── 07-beta-readiness-and-operations.md
└── 08-runtime-boundaries.md
```

## Status

Current status: **expanded and structured, not final**.
