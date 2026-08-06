---
title: Agent Report
owner: GO IRL Technical Archivist
status: Draft
source_of_truth: false
last_review: 2026-08-06
next_review: 2026-08-13
---

# Agent Report

## Task

Continue Beauty007 after the production database rollout with bounded D2 client integration:

- read public server availability;
- submit trusted Telegram bookings through the transactional Beauty007 RPC;
- wire both contracts into `ServiceActivityCard.tsx`;
- preserve Browser Mock Mode and the explicit temporary local fallback;
- do not merge or deploy in this task.

## Files inspected

- `docs/onboarding/AI_SUCCESSOR_INSTRUCTIONS.md`
- `docs/onboarding/CHATGPT_PROJECT_SETUP.md`
- `docs/reports/2026-08-05-beauty007-client-bookings-read-integration.md`
- `src/authSession.ts`
- `src/supabase.ts`
- `src/services/ServiceActivityCard.tsx`
- `src/services/service-activity-card.css`
- `src/services/servicesBookingClientRepository.ts`
- `src/services/servicesBookingRepository.ts`
- `src/services/servicesProfessionalDirectory.ts`
- `supabase/migrations/20260804203000_beauty007_booking_rpc_rls.sql`
- GitHub issue #592 and its production rollout evidence

Base commit: `769149a74c7150543e9c1e47099d4326d87410ab`.

Production Beauty007 migrations were already applied and transactionally verified before this slice. This change does not alter Supabase.

## Findings

The service card derived availability and created bookings from localStorage even after the Beauty007 production RPCs became available. The merged backend exposes the required contracts:

- `go_irl_list_public_beauty_availability`;
- `go_irl_create_beauty_booking`.

The create RPC returns explicit business results, including atomic conflict outcomes. A server conflict must remain visible and must not be converted into a local success. Browser Mock Mode, non-server demo identifiers and environments with a missing RPC still require an explicit local path.

The backend accepts Prague-local slots as `timestamptz`. Device timezone conversion is unsafe, so the repository uses deterministic `Europe/Prague` conversion with round-trip validation.

The existing `contactBeforeConfirmation` flag is not part of the current server RPC contract. It remains local-only and the UI does not claim server persistence.

## Changes made

- Added `servicesBookingMutationRepository.ts`.
- Added public availability loading through `go_irl_list_public_beauty_availability`.
- Grouped server slots by Prague-local date and time.
- Added trusted Telegram transactional create through `go_irl_create_beauty_booking`.
- Added stable RPC-safe idempotency-key generation.
- Added DST-aware Prague-local to UTC conversion with round-trip validation.
- Preserved Browser Mock Mode local creation.
- Preserved local fallback only for untrusted sessions, non-server identifiers or a missing RPC.
- Kept server slot conflicts as explicit server results; no local write occurs for conflicts.
- Wired monthly server availability into the service-card calendar, slot picker and booking form.
- Added loading, retry, conflict, generic error and explicit local-mode states.
- Refreshed availability after successful or conflicting create attempts.
- Reused the same idempotency key for an unchanged retry and generated a new key after booking parameters change.
- Added repository tests and a source-level UI wiring contract test.

## Checks

Pending GitHub Actions against the exact branch head:

- repository check;
- diff check;
- tests;
- typecheck;
- lint;
- build;
- bundle budget.

## Safety

- No `.env` or secret change.
- No auth architecture change.
- No SQL, migration, RLS or production-data change.
- No merge.
- No Vercel or VPS deployment.

## Next step

Run exact-head CI. If green, review the combined D2 repository and UI wiring in Draft PR #703. Merge and deployment require separate approval.
