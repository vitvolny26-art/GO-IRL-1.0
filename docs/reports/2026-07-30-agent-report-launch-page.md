---
title: Agent Report
owner: Chief Archivist / Technical Lead
status: Draft
source_of_truth: false
last_review: 2026-07-30
next_review: 2026-08-06
---

# Agent Report

## Task

Add a new root launch page to GO IRL 1.1 without moving or duplicating the existing Activities application.

## Files inspected

- `src/main.tsx`
- `src/store.ts`
- `src/components/AppHeader.tsx`
- `src/config/cities.ts`
- `package.json`

## Findings

- The complete Activities product is mounted from `src/main.tsx`.
- Hash navigation is compatible with the current static hosting and preserves the existing application routes.
- Telegram start parameters and non-root routes must bypass the launch page.

## Changes made

- Added a localized mobile-first launch page with Activities and Services choices.
- Restored the original entry-shell visual design, copy, city/language selectors, statistics, and illustrated domain cards after production review.
- `/activities` opens the complete existing application.
- `/services` opens the same existing application as the initial routing foundation.
- Existing routes and Telegram invitations bypass the launch page.
- Added routing unit tests.
- Simplified the shared application home so the category direction grid begins immediately below the top header.
- Kept all Activities categories unchanged while limiting `/services` to the renamed Beauty category.

## Checks

- `pnpm run lint`: passed with one pre-existing warning in `api/_shared/admin-authorization.ts`.
- `pnpm run typecheck`: passed.
- `pnpm run build`: passed.
- `pnpm run test`: passed, 122 files and 581 tests plus staff OS checks.
- Browser smoke check: root launch page rendered; Activities opened the complete existing UI.

## Next step

Review the launch-page copy and visual direction, then merge and deploy after approval.
