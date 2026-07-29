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
- `src/components/ProfilePanel.tsx`
- `src/profile/profilePanelNavigation.ts`
- `src/profile/profilePanelTypes.ts`
- `src/profile/profilePanelNavigation.test.ts`
- active UProfile implementation roadmap

## Findings

- `UProfile002` already moved profile sections into an owned `ProfilePanel`.
- Section state was still memory-only and direct `/profile/*` entry did not select the profile view.
- The application and nested profile surface could both need Telegram BackButton ownership.
- Editing blocked section buttons but did not protect browser unload or the outer Telegram back handler.

## Changes made

- Added stable paths for Identity, Preferences, My GO IRL and Diagnostics.
- Added direct-route bootstrap for `/profile/*`.
- Added owned `ProfileLayout` history and `popstate` handling.
- Added dirty-state `beforeunload` protection and a nested Telegram back guard while editing.
- Added focus restoration when the active profile section changes.
- Changed Telegram BackButton registration to a stack so the most specific mounted surface owns the action.
- Added focused route-contract tests.

## Checks

- Local clone/checks: BLOCKED because the execution container could not resolve `github.com`.
- GitHub Actions exact-head checks: pending after PR creation.
- Telegram physical-device smoke: pending.

## Next step

Open a PR from the single clean implementation commit, run GitHub Actions, review any red block, and request separate approval before merge or deployment.
