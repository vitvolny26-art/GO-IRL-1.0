---
title: UProfile-002 Canonical Panel Boundary
owner: AI Fixer
status: Draft
source_of_truth: false
last_review: 2026-07-28
next_review: 2026-08-04
---

# Agent Report

## Task

Implement the next bounded User Profile roadmap slice: replace the DOM-injected
Profile Hub navigation with an owned, compact Profile Panel while preserving
identity editing, provider preferences, My GO IRL event lists and diagnostics.

Active ClickUp task: `CLICKUP:869e9fhwu`.

Baseline: `GH:main@357887192fdfec2b76b6216a4718cb9fbbd09208`.

## Files inspected

- `src/App.tsx`
- `src/main.tsx`
- `src/components/ProfileHubPortal.tsx`
- `src/components/ProfilePreferencesPortal.tsx`
- `src/profile-hub.css`
- `src/profile-preferences.css`
- `src/userPreferences.ts`
- all `ProfileHubPortal`, `ProfilePreferencesPortal` and `.profile-page` usages
- `docs/roadmap/USER_PROFILE_PREFERENCES_ROADMAP.md`
- UProfile-001 current-state audit

## Findings

- Profile navigation and preferences were mounted globally through two portals.
- Both portals discovered `.profile-page` through `querySelector` and
  `MutationObserver`.
- Section visibility depended on `data-profile-hub-section` and direct-child CSS
  selectors rather than component ownership.
- Four implemented beta sections existed: Identity, Preferences, My GO IRL and
  Diagnostics.

## Changes made

- Added one canonical `ProfilePanelSection` contract and ordered beta registry.
- Added deterministic section transition and back-target helpers.
- Added an owned `ProfilePanel` component with localized compact navigation.
- Moved provider preferences into a normal owned child component.
- Mounted all profile sections directly from `ProfileView`.
- Removed both global profile portal mounts and their DOM observers.
- Replaced DOM-coupled CSS with owned `.profile-panel*` selectors.
- Added focused navigation and server-rendered component tests.
- Kept unavailable future modules out of the beta navigation.

## Checks

- `pnpm run lint` — PASS; one pre-existing `no-console` warning remains in
  `api/_shared/admin-authorization.ts`.
- `pnpm run typecheck` — PASS.
- `pnpm run build` — PASS; existing ineffective dynamic-import warnings remain.
- `pnpm run test` — PASS: 111 files, 541 tests, Staff OS checks PASS.
- `git diff --check` — PASS.
- Browser Demo desktop smoke — PASS.
- Browser Demo 390×844 smoke — PASS.
- Identity edit-state navigation lock — PASS: three non-identity cards disabled.
- Browser console errors during the profile smoke — none.

## Risks

- Telegram physical-device smoke is not part of this implementation branch.
- Profile section state remains in-memory and is intentionally not deep-linkable
  in this slice.
- Diagnostics remains the existing bounded surface; no new runtime or secret data
  is exposed.

## Not touched

- Supabase schema, SQL, migrations and RLS.
- Auth, secrets and environment configuration.
- Production data and production deployment.
- Event lifecycle and authorization rules.
- Provider backend capability or delivery behavior.
- Admin panel implementation.

## Next step

Push one logical commit, open a Draft PR to current `main`, verify GitHub Actions
and Preview on the exact head, then request separate owner approval before merge
or production deployment.

## Evidence ledger

| Claim | Evidence | Scope |
|---|---|---|
| The implementation starts from current `main`. | `GH:main@357887192fdfec2b76b6216a4718cb9fbbd09208` | Repository baseline for this branch. |
| PROFILE-009 is the active bounded user-panel task. | `CLICKUP:869e9fhwu` | ClickUp task state read on 2026-07-28. |
| The owned panel removes the two global profile portal mounts. | This report's GitHub commit and `src/main.tsx` | Profile Hub and provider-preference mount boundary only. |
| Required local gates are green. | Commands recorded in this report | Current worktree content before commit. |
