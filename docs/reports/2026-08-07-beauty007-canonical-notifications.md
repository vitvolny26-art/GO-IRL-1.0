---
title: Agent Report
owner: Chief Archivist / Technical Lead
status: Draft
source_of_truth: false
last_review: 2026-08-07
next_review: 2026-08-14
---

# Agent Report

## Task

Implement Beauty007-D4 through the existing canonical notification outbox after explicit approval for an additive migration, producer and verification SQL. No production apply, merge or deploy.

## Files inspected

- `docs/reports/2026-08-04-beauty007-booking-foundation-design.md`
- `supabase/migrations/20260723103725_event_notification_outbox.sql`
- `supabase/migrations/20260804175500_beauty007_booking_foundation.sql`
- `supabase/migrations/20260804203000_beauty007_booking_rpc_rls.sql`
- `supabase/verify_beauty007_booking_rpc_rls.sql`
- `src/notifications/contracts.ts`
- `src/notifications/types.ts`
- `src/notifications/repository.ts`
- `src/notifications/dispatcher.ts`
- `src/notifications/message-builder.ts`

## Findings

- Beauty007-A requires Beauty notifications to reuse the canonical notification registry and shared delivery worker.
- The existing `event_notifications` outbox already provides lease, retry, provider-message evidence and delivery-state persistence.
- Its existing kind constraint did not accept Beauty booking kinds.
- The existing claim RPC could choose any enabled provider; Beauty007-D4 requires Telegram-only delivery for this slice.
- `beauty_booking_events` already provides immutable lifecycle source events suitable for an idempotent producer.

## Changes made

- Added `20260807062000_beauty007_canonical_notifications.sql`.
- Extended the existing `event_notifications.kind` constraint with:
  - `services.booking_requested`
  - `services.booking_confirmed`
  - `services.booking_declined`
  - `services.booking_cancelled`
- Added `go_irl_queue_beauty_booking_notification()` and an `AFTER INSERT` trigger on `beauty_booking_events`.
- Producer routing:
  - booking created -> professional;
  - pending -> confirmed -> client;
  - pending -> declined -> client;
  - client cancellation -> professional;
  - professional cancellation -> client.
- Completed/no-show and reschedule notifications remain excluded because product policy is unresolved.
- Beauty outbox rows preselect `provider = 'telegram'`.
- Updated `go_irl_claim_event_notifications(...)` so a preselected provider must be respected while legacy rows with `provider is null` retain existing provider selection.
- Delivery keys are deterministic from the immutable Beauty lifecycle event, recipient and notification kind.
- Payload contains public location only; exact Beauty address is not queued.
- Extended canonical TypeScript notification registry, shared worker types, message rendering and deep-link handling.
- Added verification SQL with transactional fixtures and rollback.
- Added focused TypeScript tests for registry entries, Beauty message rendering, services deep links and repository open-path mapping.

## Checks

Pending exact-head repository checks and GitHub Actions evidence.

## Safety

No `.env`, secrets, auth architecture, destructive SQL, production data, production migration application, merge or deploy was performed.

## Next step

Run repository checks on the exact branch head. If green, open a Draft PR only. Applying the migration to any Supabase environment requires separate authorization.
