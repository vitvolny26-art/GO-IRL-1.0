---
title: Agent Report
owner: AI Fixer
status: Draft
source_of_truth: false
last_review: 2026-07-17
next_review: 2026-07-24
---

# Agent Report

## Task

Create all 40 taxonomy event variants in the test version for 2026-08-01.

## Files inspected

- `src/data.ts`
- `src/store.ts`
- `src/main.tsx`
- `src/types.ts`
- `src/config/cities.ts`
- `src/data.test.ts`
- `.github/workflows/ci.yml`
- `docs/onboarding/AI_DELIVERY_AND_PREVIEW_POLICY.md`

## Findings

- `activityOptions` contains exactly 40 variants across six categories.
- Visual demo mode reads events from `go-irl-visual-demo-activities-v2` localStorage.
- Preview-only seeding can populate test cards without changing Supabase, auth, RLS, migrations, or production data.

## Changes made

- Added `src/visualDemoTestSeed.ts`.
- Seeded all 40 taxonomy variants for `2026-08-01` in Olomouc.
- Added varied times, capacities, participant states, prices, urgency, ownership, and sport metadata for visual QA.
- Activated the seed before application initialization in `src/main.tsx`.
- Added `src/visualDemoTestSeed.test.ts`.
- Opened draft PR `#159` from `test/all-40-events-2026-08-01`.

## Checks

GitHub Actions run `607` on commit `e3880e9c5ca8fe93179600f75fa0f4a55564ce9f`:

- test: PASS
- typecheck: PASS
- lint: PASS
- build: PASS

Vercel Preview: READY.

## Next step

Run a visual smoke test in the Preview: verify all 40 cards, category artwork, card layout, join/request/open states, share action, participant counts, and August 1 filtering. Do not merge this test-data branch into production without explicit approval.
