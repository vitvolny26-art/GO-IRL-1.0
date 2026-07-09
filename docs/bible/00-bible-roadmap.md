# GO IRL Bible Completion Roadmap

Generated: 2026-07-08
Updated: 2026-07-08

## Purpose

This file defines how to finish the GO IRL Bible without rewriting it from scratch.

Current rule: preserve existing material, classify it, compare it with the actual MVP and market positioning, then complete only the missing parts.

Market scope is controlled by:

- `docs/MARKET_POSITIONING.md`
- `docs/COMPETITOR_WATCH.md`

These files must prevent competitor-inspired or future-platform ideas from entering MVP scope without passing the beta guardrail.

## Search result

Repository contains these confirmed Bible files:

```text
docs/bible/01-foundation/01-why-we-exist.md
docs/bible/01-foundation/02-core-principles.md
docs/bible/01-foundation/03-mvp-scope-and-market-positioning.md
docs/bible/02-platform-architecture.md
docs/bible/03-database-design.md
docs/bible/04-modules-architecture.md
docs/bible/04-modules-mvp-audit.md
docs/bible/05-product-requirements.md
docs/bible/05-product-requirements-mvp-split.md
docs/bible/06-ux-interaction-guidelines.md
docs/bible/07-beta-readiness-and-operations.md
docs/bible/08-runtime-boundaries.md
```

Additional related snapshot:

```text
GO_IRL_DOCUMENTATION.md
```

## Current verdict

The Bible is expanded and structured, but not final.

Current MVP boundary chapters/audits added:

- `01-foundation/03-mvp-scope-and-market-positioning.md`
- `04-modules-mvp-audit.md`
- `05-product-requirements-mvp-split.md`
- `07-beta-readiness-and-operations.md`
- `08-runtime-boundaries.md`

Existing historical books remain valuable drafts. They are not automatic implementation mandates.

## Completion plan

### Step 1 — Preserve

Status: done.

- Old root filenames were moved into `docs/bible/`.
- Original content was preserved.
- Historical files must not be deleted during cleanup.

### Step 2 — Classify

Status: in progress.

Each book must be marked as one of:

```text
Current
Partly current
Outdated
Future vision
Needs rewrite
Needs code/schema audit
Needs market-scope audit
```

Current classification:

| Book | File | Classification |
|---|---|---|
| Foundation | `01-foundation/01-why-we-exist.md` | partly current / philosophy source |
| Core principles | `01-foundation/02-core-principles.md` | partly current / needs beta guardrail alignment |
| MVP scope and market positioning | `01-foundation/03-mvp-scope-and-market-positioning.md` | current MVP boundary |
| Platform architecture | `02-platform-architecture.md` | partly current / future vision |
| Database design | `03-database-design.md` | contained future vision / schema-audited externally |
| Modules architecture | `04-modules-architecture.md` | contained future vision / audited by `04-modules-mvp-audit.md` |
| Modules MVP audit | `04-modules-mvp-audit.md` | current MVP boundary |
| Product requirements | `05-product-requirements.md` | historical PRD draft / audited by PRD split |
| PRD MVP split | `05-product-requirements-mvp-split.md` | current MVP boundary |
| UX guidelines | `06-ux-interaction-guidelines.md` | draft / needs Telegram Mini App audit |
| Beta readiness and operations | `07-beta-readiness-and-operations.md` | current MVP boundary |
| Runtime boundaries | `08-runtime-boundaries.md` | current MVP boundary |

### Step 3 — Compare with current MVP

Compare Bible content with:

```text
README.md
DOCS_INDEX.md
ROADMAP.md
BACKLOG.md
docs/DOCUMENTATION_AUDIT.md
docs/MARKET_POSITIONING.md
docs/COMPETITOR_WATCH.md
docs/GO_IRL_1_1_STABILIZATION.md
docs/MVP_STABILIZATION_PLAN.md
docs/SPORT_COACH_MVP.md
docs/DATABASE_SCHEMA_AUDIT.md
supabase/schema.sql
supabase/migration_v*.sql
src/types.ts
src/store.ts
src/verticals/SportVertical.tsx
```

Do not modify code, SQL, RLS, auth, or migrations during this comparison.

### Step 4 — Define Bible 1.0 scope

Status: mostly covered by new MVP boundary chapters, but not final.

Bible 1.0 should describe the beta-ready product, not the entire far-future platform.

Required Bible 1.0 sections:

```text
Book I — Foundation
Book I / Chapter 3 — MVP Scope and Market Positioning
Book II — Platform Architecture for current MVP
Book III — Current Data Model and Supabase boundaries
Book IV — Current Modules and Sport-first / six-category beta logic
Book V — Product Requirements for MVP 1.0 / 1.1
Book VI — Telegram Mini App UX and Interaction
Book VII — Beta Readiness and Operations
Book VIII — Runtime Boundaries
```

Bible 1.0 must explicitly cover:

- GO IRL as Telegram-first local meetup layer.
- Not an event calendar, ticketing platform, sport-only app, dating app, or social feed.
- Olomouc closed beta.
- Six beta categories: Volleyball, Running, Walking, Coffee meetup, Board games, Language exchange.
- Event creation, share, join, event chat, real-life attendance loop.
- Browser Demo Mode.
- Telegram Mini App constraints.
- Supabase trusted auth current reality.
- Current QA and release gates.
- What is not included in App 1.0.

### Step 5 — Define Bible 1.1+ scope

Bible 1.1+ should describe the next layer without pretending it is already shipped.

Future / 1.1+ sections:

```text
Sport Coach MVP
Coach request lifecycle
Coach reviews and trust model
Event Roles after Sport Coach validation
Expanded moderation
Notifications
Recommendation engine
AI event discovery
Multi-vertical platform
Admin surface
```

Every future section must be tagged as:

```text
Status: Future / 1.1+ / Not current MVP
```

### Step 6 — Write missing parts only

Do not rewrite the existing chapters unless they contradict the current project.

Covered or mostly covered for 1.0:

```text
Market positioning
Competitor boundaries
MVP 1.0 scope
Browser Demo Mode
Olomouc beta scope
Six beta categories
Modules architecture alignment with six categories
PRD split for MVP 1.0 vs 1.1
Supabase trusted auth reality inside Bible
Profile/avatar/demo boundary
Activity Chat boundaries
Weather Widget boundaries
Share/join flow
QA and release gates
Explicit non-goals before beta
```

Still weak for 1.0:

```text
Telegram Mini App UX detail
Event lifecycle inside Bible
```

Missing or weak areas for 1.1+:

```text
Sport Coach MVP boundaries
Coach request lifecycle
Coach reviews
Event Roles after Sport Coach validation
Moderation
Notifications
AI event discovery
Multi-vertical platform
Admin surface
```

Recommendation engine is now explicitly classified as future in the PRD split.

### Step 7 — Finalize

Only after audit and product review:

- remove draft wording;
- fix numbering;
- remove leftover mixed-language fragments;
- add explicit status blocks to future material;
- ensure `MARKET_POSITIONING.md` and `COMPETITOR_WATCH.md` are reflected;
- mark the set as `GO IRL Bible 1.0`.

## Immediate next audit tasks

1. Audit `06-ux-interaction-guidelines.md` against Telegram Mini App UX.
2. Add or sync a final event lifecycle Bible chapter if needed.
3. Extract useful current content from `GO_IRL_DOCUMENTATION.md` into current docs if needed.

## Do not do

- Do not make Bible the source of truth over current code without audit.
- Do not delete preserved drafts.
- Do not merge future vision into MVP scope without labeling it.
- Do not import competitor features into MVP without passing `MARKET_POSITIONING.md`.
- Do not change Supabase SQL, RLS, auth, or secrets from Bible cleanup.
