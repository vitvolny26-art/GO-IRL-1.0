---
title: SHARE004 Staff Status UI Agent Report
owner: Chief Archivist / Technical Lead
status: Draft
source_of_truth: false
last_review: 2026-08-05
next_review: 2026-08-12
---

# Agent Report

## Task

Expose the released Beauty share-card lifecycle status to authorized organizer and admin users through the existing `go_irl_get_beauty_share_card_status(...)` RPC.

## Files inspected

- `src/beauty/beautyShareCardRepository.ts`
- `src/beauty/BeautyShareCardEditor.tsx`
- `src/beauty/BeautyProfessionalProfilePortal.tsx`
- `src/services/servicesProfessionalDirectory.ts`
- `src/admin/AdminLoginPage.tsx`
- `src/authSession.ts`
- `supabase/migrations/20260805193000_share004_beauty_share_card_persistence.sql`
- `docs/reports/release-manager/2026-08-05-share004-production-handoff.md`

## Findings

- The production RPC already authorizes the Beauty profile owner plus organizer/admin roles.
- The professional workspace already renders persistent ready, updating, error and deleted language.
- The existing Services professional-profile overlay is the smallest shared selected-professional surface for organizer/admin read-only status.
- Browser Mock Mode must not call the private status RPC.

## Changes made

- Added a role-gated read-only RPC adapter.
- Added RU/UK/CS/EN lifecycle formatting.
- Added a small portal that mounts the staff status below the existing professional-profile actions.
- Kept retry behavior out of the staff surface; retry remains an owner action.
- Added focused role, RPC mapping and localization tests.

## Checks

Exact-head GitHub Actions CI is pending.

No SQL, migration, RLS, authentication, Storage policy, secret, environment, production-data or deployment change was made.

## Next step

Keep the pull request Draft until exact-head repository check, diff check, tests, typecheck, lint, build and bundle budget are green. Merge and deployment require separate approval.
