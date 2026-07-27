---
title: Agent Report — Chief Archivist thin-context runtime
owner: Automation Engineer
status: Draft
source_of_truth: false
last_review: 2026-07-27
next_review: 2026-08-27
---

# Agent Report

## Task

Complete the repository-side part of GitHub issue #301: make Chief Archivist evidence selection and report validation deterministic and testable without moving the runtime state machine into n8n.

## Files inspected

- `AGENTS.md`
- `DOCS_INDEX.md`
- `README.md`
- `docs/onboarding/AI_SUCCESSOR_INSTRUCTIONS.md`
- `docs/reports/README.md`
- `scripts/ai-orchestrator/runtime/core.cjs`
- `scripts/ai-orchestrator/runtime/context-builder.cjs`
- `scripts/ai-orchestrator/orchestrator.test.mjs`
- `scripts/ai-orchestrator/prompts/chief-archivist.md`
- `scripts/ai-orchestrator/prompts/evidence-contract.md`
- `scripts/ai-orchestrator/prompts/report-schema.md`

## Findings

- The three versioned Chief Archivist prompt contracts existed on `main`.
- No reusable repository module selected a bounded evidence set or enforced that final ledger references were limited to the selected evidence IDs.
- Prompt availability, minimum completed-report ledger size, global scope, and strong-claim coverage were enforced only by prompt language, not repository tests.

## Changes made

- Added `runtime/chief-archivist-evidence.cjs`.
- Added deterministic authority-rank and evidence-ID ordering.
- Added bounded source-count and character budgets with deterministic final-source truncation.
- Added fail-closed loading for the three versioned prompts.
- Added report validation for transport status, evidence-ledger shape, selected evidence IDs, bounded scope, minimum three rows for `COMPLETED`, and strong-claim coverage.
- Added focused Vitest coverage and documented the boundary in the orchestrator README.

## Checks

- Targeted Chief Archivist tests — PASS, 18 tests.
- `pnpm run lint` — PASS; one pre-existing warning remains in `api/_shared/admin-authorization.ts`.
- `pnpm run typecheck` — PASS.
- `pnpm run build` — PASS; Vite reported the existing ineffective dynamic-import warnings.
- `pnpm run test` — PASS, 105 test files and 515 tests, followed by all Staff OS scenarios PASS.
- `git diff --check` — PASS.

## Risks

- Strong-claim detection is intentionally conservative and pattern-based. New language patterns must be added with tests rather than inferred by a model.
- Evidence content is supplied by external orchestration. This module bounds and validates the supplied content but does not independently fetch GitHub, Drive, ClickUp, or runtime evidence.

## Not touched

- Application code.
- n8n workflow state, publication, activation, credentials, or executions.
- Auth, Supabase RLS, SQL, migrations, secrets, production data, deployment, merge, or production configuration.
- Existing versioned prompt text.

## Next step

Run the five quality gates, independently inspect the diff, and keep publication behind a separate human decision.
