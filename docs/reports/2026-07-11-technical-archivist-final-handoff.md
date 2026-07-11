---
title: Technical Archivist Final Handoff
owner: GO IRL Technical Archivist
status: Draft
source_of_truth: false
last_review: 2026-07-11
next_review: 2026-07-18
---

# Technical Archivist Final Handoff

## Task

Transfer duties, current project knowledge, completed work, and research preservation notes to the next AI agent.

GitHub remains the only source of truth. Chat history is disposable after this report is reviewed.

## Files inspected

- `DOCS_INDEX.md`
- `docs/audit/KNOWLEDGE_DEBT.md`
- `docs/onboarding/AI_SUCCESSOR_INSTRUCTIONS.md`
- `docs/reports/README.md`

## Current role handoff

Next AI role: **GO IRL Technical Archivist**.

Core duties:

1. Keep GitHub as the only source of truth.
2. Work one task at a time.
3. Prefer small patches over rewrites.
4. Inspect usage before editing files.
5. Do not touch `.env`, secrets, Supabase RLS, auth, destructive SQL, or migrations without explicit approval.
6. Use pnpm only.
7. For code changes, run:
   - `pnpm run typecheck`
   - `pnpm run lint`
   - `pnpm run build`
   - `pnpm run test`
8. Commit only when checks are green.
9. Keep answers short and in English.
10. Save durable knowledge to the repo, not to chat.

## Source-of-truth reading order

Use current repo docs, not chat memory:

1. `DOCS_INDEX.md`
2. `README.md`
3. `ROADMAP.md`
4. `BACKLOG.md`
5. `docs/audit/KNOWLEDGE_DEBT.md`
6. `docs/GO_IRL_CONSTITUTION.md`
7. `docs/MARKET_POSITIONING.md`
8. `docs/onboarding/AI_SUCCESSOR_INSTRUCTIONS.md`
9. `docs/reports/README.md`

## Product boundaries

Product: Telegram Mini App for real-life local events.

Slogan: **Less scrolling. More life.**

Closed beta focus:

- Olomouc, Czechia.
- Core flow: create event -> share -> join/request -> event chat -> attend IRL.

Canonical beta categories:

1. Volleyball
2. Running
3. Walking
4. Coffee meetup
5. Board games
6. Language exchange

Everything else is future, experimental, or out of MVP scope unless approved in source-of-truth docs.

## Deep research preservation

Deep research and AI audit findings are not source of truth by themselves.

Preserved rule:

- Every NotebookLM/Gemini/Deep Research claim must be verified against GitHub before source-of-truth docs or code are changed.

This rule is now recorded in `docs/audit/KNOWLEDGE_DEBT.md` under closed `KD-016`.

Important preserved research themes:

- Documentation source-of-truth hierarchy.
- Knowledge debt tracking.
- Closed beta category guardrail.
- AI role governance and report discipline.
- Market and competitor research must inform, not expand, MVP scope.
- Google Drive/NotebookLM are mirrors, not authority.
- Gemini/NotebookLM reports are inputs for review only.

Known research-related docs to inspect:

- `docs/MARKET_POSITIONING.md`
- `docs/COMPETITOR_WATCH.md`
- `docs/market/README.md`
- `docs/market/CONTINUOUS_COMPETITOR_INTELLIGENCE.md`
- `docs/market/COMPETITOR_ANALYSIS_TEMPLATE.md`
- `docs/audit/KNOWLEDGE_DEBT.md`
- `docs/governance/KNOWLEDGE_PLATFORM.md`
- `docs/governance/AI_ORGANIZATION.md`
- `docs/onboarding/AI_ROLES.md`
- `docs/onboarding/ARCHIVIST_CHARTER.md`

## Work completed in this session line

Code and CI:

- Typed Vite environment variables in `src/vite-env.d.ts`.
- Aligned `.env.example` with current frontend/Supabase variables.
- Typed closed beta activity filter in `src/data.ts`.
- Added `pnpm run typecheck` to CI before lint/build.
- Centralized auth/demo identity helpers in `src/authSession.ts`.
- Reused auth helpers in chat and coach features.
- Guarded trusted auth env before fetch.
- Removed duplicate `.env` entry from `.gitignore`.
- Made default share template deterministic.

Docs and governance:

- Added technical archivist report.
- Verified `pnpm-lock.yaml` exists; audit item was false positive.
- Verified old `APP_VERSION` issue is already resolved; only report reference remains.
- Closed `KD-016` by adding AI audit verification discipline.
- Re-synced current priorities with `DOCS_INDEX.md` and `docs/audit/KNOWLEDGE_DEBT.md` instead of chat memory.

## Commits made or referenced

- `19f8d07` chore: type vite environment variables
- `59e7149` docs: align env example with current variables
- `a3bac94` fix: type closed beta activity filter
- `297bba1` ci: run typecheck before build
- `9fb28a3` refactor: centralize auth identity helpers
- `6ae5648` refactor: reuse auth helpers in chat feature
- `8acb6e4` refactor: reuse auth helpers in coach feature
- `827df9c` fix: guard trusted auth env before fetch
- `384aef7` chore: remove duplicate env ignore entry
- `c929704` fix: make default share template deterministic
- `157be3d` docs: add technical archivist report
- `1c6598b` docs: add AI audit verification discipline

## Current validation status

User reported checks are green after latest code/doc patch sequence.

Do not claim new future changes are green unless they are checked again.

## Current open Knowledge Debt priorities

Read `docs/audit/KNOWLEDGE_DEBT.md` for exact current list.

At handoff, the next likely docs-safe target is:

- `KD-005`: Add YAML frontmatter to P0/P1 source-of-truth docs.

Other active items include:

- `KD-006`: Register or archive `docs/GO_IRL_PRODUCT.md`.
- `KD-007`: Align security/release wording.
- `KD-008`: Add metadata to `supabase/README.md`.
- `KD-009`: Create ADR registry.
- `KD-010`: Fix AI onboarding broken refs.
- `KD-011`: Resolve root legacy docs registry conflict.
- `KD-012`: Define or merge overlapping Knowledge Platform docs.
- `KD-014`: Verify chat lifecycle docs against migrations without SQL changes.
- `KD-015`: Align legacy/demo auth docs.

## Risks

- Some prior audit findings were false positives from incomplete exports.
- Vercel status showed build-rate-limit; that is not proof of code failure.
- Auth and Supabase areas are sensitive; do not continue refactors without explicit approval and checks.
- Do not treat this report as source-of-truth over canonical docs.

## Not touched

- `.env`
- secrets
- Supabase RLS
- destructive SQL
- migrations
- production credentials
- package manager
- architecture rewrite

## Next step

For the next AI:

1. Read `DOCS_INDEX.md`.
2. Read `docs/audit/KNOWLEDGE_DEBT.md`.
3. Pick one open KD item.
4. Inspect files before editing.
5. Make one small docs-only or code-safe patch.
6. Run required checks if code changed.
7. Save durable output to `docs/reports/`.
