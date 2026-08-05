---
title: Agent Report
owner: GO IRL Technical Archivist
status: Draft
source_of_truth: false
last_review: 2026-08-04
next_review: 2026-08-11
---

# Agent Report

## Task

Prepare Beauty007-C as a repository-only stacked patch that adds narrow booking RPCs, defense-in-depth RLS policies and negative security verification.

Issue: `#592 — Beauty007 — Server-backed Beauty booking foundation`.

Dependency: Beauty007-B PR #644, head `753f575a729cb03c5f2bb20bef581b9088fe2d7f`.

## Files inspected

- `supabase/migrations/20260804175500_beauty007_booking_foundation.sql`
- `supabase/verify_beauty007_booking_foundation.sql`
- `supabase/migration_v2_backend_foundation.sql`
- `supabase/migration_v4_trusted_telegram_auth.sql`
- `supabase/migrations/20260801104500_beauty005_olomouc_pilot.sql`
- `supabase/migrations/20260803230500_beauty012_multilingual_content.sql`
- `supabase/migrations/20260804013000_beauty013_workspace_content_01.sql`
- `src/services/servicesBookingRepository.ts`
- `src/beauty/BeautyPilotWorkspace.tsx`
- `docs/reports/2026-08-04-beauty007-booking-foundation-design.md`
- GitHub Issue #592

## Findings

Beauty007-B intentionally leaves all new tables inaccessible. Beauty007-C must expose only a narrow RPC surface and must not grant direct booking-table access to the client.

The product-owner decisions remain partially unresolved. This patch therefore uses fail-closed boundaries:

- clients may cancel only `pending` requests;
- confirmed-booking cancellation remains blocked as `policy_required`;
- no automatic pending expiration is implemented;
- no rescheduling or manual professional booking is implemented;
- the exact address is returned to the client only for `confirmed` or `completed` bookings;
- no Telegram notification producer or copy is implemented;
- no retention or deletion job is implemented.

## Changes made

### Narrow public/authenticated RPCs

Added `20260804203000_beauty007_booking_rpc_rls.sql` with:

- public bounded slot listing for a published profile/service;
- transactional authenticated booking creation;
- server-derived service duration, buffer, price and location snapshots;
- recurring-availability and private-time-block validation;
- overlap protection delegated to the Beauty007-B exclusion constraint;
- per-client idempotent retry behavior;
- client-only booking list;
- pending-only client cancellation with stale-write protection;
- professional-only booking list;
- professional status transitions with expected status and `updated_at` checks;
- professional availability replacement;
- professional time-block create/delete;
- overlapping time-block exclusion;
- append-only booking lifecycle events.

### Status boundary

Allowed professional transitions:

- `pending -> confirmed`;
- `pending -> declined`;
- `confirmed -> cancelled`;
- `confirmed -> completed`;
- `confirmed -> no_show`.

Terminal-state transitions and rescheduling remain blocked.

### RLS and privilege boundary

Added defense-in-depth policies for:

- professional-owned availability;
- professional-owned time blocks;
- booking reads by the client or owning professional;
- booking-event reads by the client or owning professional.

Direct `anon` and `authenticated` table privileges remain revoked. All approved mutations use security-definer RPCs with explicit user, role and profile-ownership checks.

### Verification SQL

Added `verify_beauty007_booking_rpc_rls.sql` with a rollback-only fixture that verifies:

- all required RPCs exist;
- the six policies exist;
- `anon` can list availability but cannot create bookings;
- `authenticated` has RPC execute access but no direct booking-table access;
- a professional can save availability;
- a client can create one pending booking;
- a repeated idempotency key returns the existing booking;
- another client cannot reserve the same slot;
- another client cannot see the first client booking;
- an ordinary client cannot use the professional transition RPC;
- the owning professional can list and confirm the booking;
- pending projections hide the exact address;
- confirmed projections reveal the exact address to the booking client;
- removing the professional role immediately blocks professional booking access.

## Safety

- Repository-only migration and verification files.
- No Supabase application or production data change.
- No auth architecture change.
- No secrets or environment change.
- No frontend wiring.
- No notification runtime change.
- No merge or deployment authorization is implied.
- This is a stacked patch and depends on Beauty007-B.

## Checks

GitHub Actions is required on the exact stacked PR head.

Manual review:

- direct table access remains closed: PASS;
- public availability excludes private block labels and client data: PASS;
- booking snapshots are server-derived: PASS;
- idempotent retry path specified: PASS;
- active-slot overlap remains database enforced: PASS;
- client/professional ownership checks are server-side: PASS;
- stale writes fail closed: PASS;
- unresolved product decisions are not silently implemented: PASS.

The SQL verification script has not been executed against a database. Repository CI does not prove PostgreSQL runtime behavior.

## Next step

Wait for exact-head CI and database review. Do not merge either stacked PR or apply either migration. After separate approval and disposable-environment SQL verification, the next slice is Beauty007-D: trusted client repository and My bookings integration, while Browser Mock Mode remains local-only.
