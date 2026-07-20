---
title: Agent Report
owner: Chief Archivist / Technical Lead
status: Draft
source_of_truth: false
last_review: 2026-07-20
next_review: 2026-07-21
---

# Agent Report

## Task

Reconcile the previous-agent report and Production Status/Roadmap mirror with current GitHub `main`, inspect open pull requests, identify one unfinished production blocker, and define a minimal safe patch.

## Files inspected

- `ROADMAP.md`
- `docs/onboarding/AI_SUCCESSOR_INSTRUCTIONS.md`
- `docs/onboarding/CHATGPT_PROJECT_SETUP.md`
- `src/main.tsx`
- `src/fullCreateTaxonomy.ts`
- `src/data.ts`
- `src/data.test.ts`
- `scripts/fix-red-after-beta-taxonomy.cjs`
- Google Drive mirror: `2026-07-19 — GO IRL Production Work Report & Roadmap`
- Google Drive mirror: `DOC1010 — GO IRL 1.0 Production Status and Roadmap`
- Current open pull requests, especially PR #146 and PR #249

## Findings

- Current GitHub `main` is commit `8502d501ce0ff6e23784e9fcf2ea5046ccabd4f3`.
- `main` is three commits ahead of the DOC1010 mirror source commit `b222fad23ae52f2f2638ebf46775a965a074e339`.
- No GitHub combined statuses or workflow runs were returned for current `main`; exact-current-main quality gates remain unverified.
- `ROADMAP.md` defines exactly six closed-beta create options: Volleyball, Running, Walking, Coffee meetup, Board games, and Language exchange.
- `src/main.tsx` still imports and calls `enableFullCreateTaxonomy()` during startup.
- `src/fullCreateTaxonomy.ts` mutates the closed-beta category and activity collections to expose the full taxonomy.
- `src/data.ts` also includes `Chess` in `closedBetaActivityOptions.activities`, producing seven closed-beta options even after the startup expansion is removed.
- `src/data.test.ts` currently asserts that `Chess` is part of the closed-beta create taxonomy, which conflicts with the canonical roadmap.
- Open PR #146 removes only the startup import and call. Its branch is 104 commits behind current `main`; its successful CI and Vercel preview belong to the old head commit, not current `main`. It also does not remove `Chess`, so it is insufficient as the final beta-scope fix.

## Production blocker selected

Closed-beta create taxonomy scope drift.

The current runtime can expose the full taxonomy at startup, and the fallback closed-beta dataset still contains an unapproved seventh option. This directly violates the canonical six-category beta guardrail and must be fixed before release verification.

## Minimal safe patch

Create a fresh branch from current `main` and change only:

1. `src/main.tsx`
   - remove the `enableFullCreateTaxonomy` import;
   - remove the startup call.
2. `src/data.ts`
   - remove `Chess` from `closedBetaActivityOptions.activities`;
   - keep `Chess` in the broader experimental `activityOptions.activities` dataset for edit/backward compatibility.
3. `src/data.test.ts`
   - assert the canonical six-option closed-beta set;
   - retain the separate test proving Chess remains available in the broader taxonomy.

Do not touch auth, Supabase RLS, migrations, SQL, secrets, production data, or architecture.

## Changes made

- Added this docs-only report on branch `docs/2026-07-20-agent-report-taxonomy-blocker`.
- No application code changed.
- No existing pull request was merged or modified.

## Checks

Docs-only report: code checks were not required and were not run.

The future code patch must run on the same exact commit:

- `pnpm run lint`
- `pnpm run typecheck`
- `pnpm run build`
- `pnpm run test`

Commit only if all checks pass.

## Next step

Apply the three-file patch on a fresh branch from current `main`, run all quality gates, then manually verify that a new event offers exactly the six canonical beta activities while editing historical events still supports broader stored taxonomy values.
