---
title: UProfile003 Profile Layout and Routing
owner: Chief Archivist / Technical Lead
status: Draft
source_of_truth: false
last_review: 2026-07-29
next_review: 2026-08-05
---

# Agent Report

## Task

Implement `UProfile003` as a bounded profile navigation slice: stable profile paths, owned layout state, browser history, dirty-state protection, Telegram BackButton behavior, focus restoration and direct-route bootstrap.

## Files inspected

- `src/App.tsx`
- `src/main.tsx`
- `src/telegram.ts`
- `src/components/ProfileLayout.tsx`
- `src/components/ProfilePanel.tsx`
- `src/profile/profilePanelNavigation.ts`
- `src/profile/profilePanelTypes.ts`
- `src/profile/profilePanelNavigation.test.ts`
- `vercel.json`
- active UProfile implementation roadmap

## Findings

- `UProfile002` already moved profile sections into an owned `ProfilePanel`.
- Section state was still memory-only and direct `/profile/*` entry did not select the profile view.
- Application and nested profile surfaces both require Telegram BackButton ownership.
- Registration order alone cannot preserve nested ownership when the outer application effect re-registers.
- Editing must retain a nested BackButton guard even on the identity route.

## Changes made

- Added stable paths for Identity, Preferences, My GO IRL and Diagnostics.
- Added direct-route bootstrap for `/profile/*`.
- Added owned `ProfileLayout` history and `popstate` handling.
- Added dirty-state `beforeunload` protection and a nested Telegram BackButton guard while editing.
- Added explicit BackButton priorities so nested profile ownership survives outer handler re-registration.
- Added focus restoration when the active profile section changes.
- Moved the identity profile card directly below the profile heading.
- Added focused route-contract tests.
- Disabled Vercel Preview deployment only for the implementation branch.

## Checks

- Diff check: PASS — GitHub Actions run `1305`.
- Tests: PASS — GitHub Actions run `1305`.
- Typecheck: PASS — GitHub Actions run `1305`.
- Lint: PASS — GitHub Actions run `1305`.
- Build: PASS — GitHub Actions run `1305`.
- Telegram physical-device smoke: pending after production deployment.

## Risks

- Telegram BackButton behavior still requires a physical-device smoke test because CI cannot emulate Telegram client lifecycle ordering.
- Browser history behavior depends on the host preserving SPA routes through the existing rewrite.

## Not touched

- Authentication, secrets, Supabase RLS, SQL, schema and migrations.
- Production data or production environment variables.
- Route-level lazy loading and broader loading/error/empty-state harmonization.
- Product scope outside the profile navigation slice.

## Next step

Resolve review threads and merge the exact green head into `main` after explicit production approval.
