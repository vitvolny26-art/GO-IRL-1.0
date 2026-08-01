---
title: Bundle Budget Gate
owner: Release Manager
status: Draft
source_of_truth: false
last_review: 2026-08-01
next_review: 2026-08-15
---

# Agent Report

## Task

Add a bounded production bundle-size gate for GO IRL 1.1.

## Files inspected

- `docs/performance.md`
- `package.json`
- `.github/workflows/ci.yml`
- VPS build output for merge SHA `32bed15f4a9690205d4ce6aef6eaeb8270ff1b63`

## Findings

- The documented preferred entry target is below 10 KiB gzip.
- The current production entry chunk is approximately 32.66 KiB gzip, so enforcing the historical preference as a hard failure would immediately make current `main` red.
- All current production JavaScript chunks remain below 100 KiB gzip and 500 KiB raw.
- CI previously built the production bundle but did not enforce its size.

## Changes made

- Added `scripts/check-bundle-budget.cjs`.
- Added `pnpm run bundle:check`.
- Added a CI `Bundle budget` step after `pnpm run build`.
- The gate fails when any JavaScript chunk exceeds 100 KiB gzip or 500 KiB raw.
- The gate warns when the entry chunk exceeds the preferred 10 KiB gzip target.

## Checks

Required on the exact PR head:

- `pnpm install --frozen-lockfile`
- `pnpm run repo:check`
- `pnpm run lint`
- `pnpm run typecheck`
- `pnpm run build`
- `pnpm run bundle:check`
- `pnpm run test`
- `git diff --check`

## Rollback

Revert the bundle-budget PR. No runtime data, schema, auth, RLS, secrets, or deployment configuration are affected.

## Next step

Use the measured warning to plan a separate, evidence-backed entry-chunk optimization. Do not combine that refactor with this governance gate.
