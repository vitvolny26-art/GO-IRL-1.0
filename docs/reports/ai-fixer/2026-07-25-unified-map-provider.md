---
title: Agent Report
owner: AI Fixer
status: Draft
source_of_truth: false
last_review: 2026-07-25
next_review: 2026-08-01
---

# Agent Report

## Task
Unify map-provider handling across GO IRL 1.0 so map openings use one persisted preference and one shared provider-selection mechanism.

## Role
AI Fixer

## Sources inspected
- GitHub repository `vitvolny26-art/GO-IRL-1.0`
- Existing map runtime and map-opening call sites
- Pull request #352 and its CI results

## Files inspected
- `src/mapyRuntimeLinks.ts`
- `src/mapyRuntimeLinks.test.ts`
- map-related components and helpers changed by PR #352

## Findings
- The previous runtime path could rewrite or intercept map links independently from component-level map-opening logic.
- Direct map links and activity map helpers needed to converge on one provider-selection path.
- Already resolved provider URLs required an explicit marker to avoid repeated interception.
- Provider-specific visible labels conflicted with the shared picker behavior.
- A compatibility regression removed `normalizeMapyUrl`, causing three focused tests to fail before the export was restored.

## Changes made
- Added one persisted map-provider preference covering Mapy.com, Google Maps, and Apple Maps.
- Added a shared provider picker and portal.
- Routed map openings through `requestMapProvider(...)`.
- Prevented recursive interception for URLs marked with `go_irl_provider`.
- Excluded the provider-choice portal marked with `data-map-provider-choice` from interception.
- Replaced provider-specific labels with neutral `Open map` / `Открыть карту` text.
- Restored exported compatibility function `normalizeMapyUrl` after CI exposed the regression.
- Added focused URL-routing tests.

## Checks
CI on head commit `3c64016b3333d4140590f6bee13c134614b2b602` passed:
- `pnpm run lint`
- `pnpm run typecheck`
- `pnpm run build`
- `pnpm run test`

Workflow run: `30132487069`.

## GitHub
- Branch: `fix/unified-user-preferences-maps`
- Key runtime integration commit: `f168cb7ddd05bff5f98bd153b0198b0dae288fbc`
- Final fix commit: `3c64016b3333d4140590f6bee13c134614b2b602`
- Pull request: #352 — `fix: unify map provider preference and picker`
- PR status: merged
- Merge method: squash
- Merge commit: `1cdf7f4f999dc88c1d640243ce2185882a14a264`

## ClickUp
No ClickUp task update was recorded during this execution. This remains an operational documentation gap and should be linked to the relevant existing task if one exists.

## Google Drive
A mirror of this report is created in `AI Reports/AI Fixer/`.

## Blockers
None for the merged implementation.

## Next step
Merge the documentation-only PR containing this report, then link the GitHub report, merged PR #352, and Drive mirror from the relevant ClickUp task.
