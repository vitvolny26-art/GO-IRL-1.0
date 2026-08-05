---
title: UProfile010 Account Lifecycle Boundary
owner: Chief Archivist / Technical Lead
status: Draft
source_of_truth: false
last_review: 2026-08-05
next_review: 2026-08-12
---

# Agent Report

## Task

Continue UProfile010 with one bounded, non-migration slice: define deterministic account-scoped state invalidation and support correlation identifiers without claiming that account export, deletion, or support-case backends exist.

## Files inspected

- `src/authSession.ts`
- `src/admin/adminSession.ts`
- `src/App.tsx`
- `src/components/ProfilePanel.tsx`
- `docs/reports/2026-07-29-agent-report-uprofile004-009-combined.md`
- active UProfile implementation roadmap in Google Drive
- stale branch `UProfile010/account-lifecycle-support`

## Findings

- UProfile004 through UProfile009 are already present on current `main`.
- The historical `UProfile010/account-lifecycle-support` branch is unsafe to continue directly: it is 209 commits behind current `main` and contains only the isolated account-lifecycle module and tests.
- Current authentication code can clear or refresh the trusted session, but there is no shared registry for clearing other account-scoped state.
- No verified backend currently supports account export, deletion requests, or support/safety/privacy case creation; the UI must not claim those requests were received.

## Changes made

- Created a fresh task branch from current `main`.
- Added an account-scoped invalidator registry.
- Added deterministic cleanup reasons for logout, account switch, and session expiry.
- Added truthful `completed` or `failed` results with explicit cleared and failed invalidator IDs.
- Added generated or caller-supplied correlation IDs.
- Added focused tests for successful cleanup, partial failure, replacement/unregistration behavior, and correlation ID creation.

## Checks

- Local checks: not available through the connected GitHub-only execution path.
- Exact-head GitHub Actions: required before review completion.
- Merge: not performed.
- Deployment: not performed.

## Not touched

- Auth architecture or trusted Telegram verification.
- Logout or account-switch UI wiring.
- Supabase schema, SQL, migrations, RLS, secrets, or production data.
- Account export/deletion or support-case backend implementation.
- Production configuration or deployment.

## Next step

Run exact-head CI on the Draft PR. After green checks, review where account-scoped caches are created and register only verified profile/provider/store invalidators in a separate bounded slice. Do not wire account export, deletion, or support submission until a protected backend contract is independently approved.
