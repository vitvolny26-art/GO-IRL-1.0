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

Design the bounded server-backed foundation for Beauty007 without applying SQL, migrations, RLS, auth, secrets, production data changes, merge, or deployment.

Issue: `#592 — Beauty007 — Server-backed Beauty booking foundation`.

Design baseline: GitHub `main` at `652350f1437d492cfa64f18c219612dcf3198e39`.

## Files inspected

- `DOCS_INDEX.md`
- `ROADMAP.md`
- `docs/roadmap/ROADMAP_PART_05_GROWTH_DECISION_GATES.md`
- `docs/release/CURRENT_PHASE.md`
- `docs/onboarding/AI_SUCCESSOR_INSTRUCTIONS.md`
- `docs/onboarding/CHATGPT_PROJECT_SETUP.md`
- `docs/reports/2026-08-03-agent-report-services-booking-calendar-sync.md`
- `docs/reports/2026-08-04-beauty013-workspace-content.md`
- `docs/architecture/NOTIFICATION_DATA_MODEL_DESIGN.md`
- `src/services/servicesBookingRepository.ts`
- `src/beauty/BeautyPilotWorkspace.tsx`
- `src/beauty/beautyWorkspaceRepository.ts`
- `src/notifications/contracts.ts`
- `src/notifications/worker.ts`
- `supabase/migrations/20260801104500_beauty005_olomouc_pilot.sql`
- GitHub Issue `#592`

## Findings

### Current runtime boundary

The existing Services booking flow is local-only:

- bookings are stored under `go-irl-services-bookings-v3` in `localStorage`;
- `pending` and `confirmed` bookings are treated as occupied slots only on the current device;
- the professional workspace reads the same local repository;
- cross-account and cross-device synchronization does not exist;
- duplicate submission is not protected by a server idempotency key;
- overlap prevention is a client-side `Set`, not a database invariant;
- Telegram booking notifications are not implemented.

The server-backed Beauty model currently covers professional profiles, services and public directory data. The Beauty005 migration explicitly excluded availability and booking.

### Roadmap boundary

Beauty remains a gated Services track. This design does not authorize a production Services launch or Gate F. Every migration, RLS policy, RPC, notification worker change, production application, merge and deployment requires separate explicit approval.

## Proposed bounded domain model

### 1. `beauty_availability_rules`

Recurring professional availability.

Proposed fields:

- `id uuid primary key`
- `profile_id uuid not null`
- `weekday smallint not null`
- `start_time time not null`
- `end_time time not null`
- `timezone text not null default 'Europe/Prague'`
- `slot_interval_minutes integer not null`
- `active boolean not null default true`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`

Required invariants:

- weekday is `1..7`;
- start is before end;
- interval is bounded and positive;
- one profile cannot store duplicate active rules for the same weekday and time window;
- only the profile owner may manage rules.

### 2. `beauty_time_blocks`

One-off unavailable periods created by the professional.

Proposed fields:

- `id uuid primary key`
- `profile_id uuid not null`
- `starts_at timestamptz not null`
- `ends_at timestamptz not null`
- `private_label text null`
- `created_by_user_key text not null`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`

Required invariants:

- start is before end;
- `created_by_user_key` must own the profile and hold the `professional` role;
- public availability RPCs never expose `private_label`.

### 3. `beauty_bookings`

Canonical booking record.

Proposed fields:

- `id uuid primary key`
- `profile_id uuid not null`
- `service_id uuid not null`
- `client_user_key text not null`
- `status text not null`
- `starts_at timestamptz not null`
- `service_ends_at timestamptz not null`
- `reserved_until timestamptz not null`
- `hold_expires_at timestamptz null`
- `client_name_snapshot text not null`
- `client_contact_snapshot text not null`
- `service_name_snapshot jsonb not null`
- `duration_minutes_snapshot integer not null`
- `buffer_minutes_snapshot integer not null`
- `price_czk_snapshot integer not null`
- `currency text not null default 'CZK'`
- `public_location_snapshot text not null`
- `exact_address_snapshot text not null`
- `idempotency_key text not null`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`
- `confirmed_at timestamptz null`
- `cancelled_at timestamptz null`
- `completed_at timestamptz null`

Initial status set:

- `pending`
- `confirmed`
- `declined`
- `cancelled`
- `completed`
- `no_show`
- `expired` only if a pending-hold expiration policy is explicitly approved

Required invariants:

- the service belongs to the profile and is active when the booking is created;
- snapshot duration, buffer, price and currency are copied server-side, never trusted from client input;
- `service_ends_at` and `reserved_until` are derived server-side;
- one client idempotency key creates at most one booking;
- only `pending` and `confirmed` reserve time;
- exact address is never returned by public availability or public profile APIs;
- exact address may be returned to the authenticated client only after confirmation;
- direct client insert/update access is not granted.

### 4. `beauty_booking_events`

Append-only lifecycle and support audit.

Proposed fields:

- `id uuid primary key`
- `booking_id uuid not null`
- `event_type text not null`
- `actor_user_key text null`
- `from_status text null`
- `to_status text null`
- `payload jsonb not null default '{}'`
- `deduplication_key text not null unique`
- `created_at timestamptz not null`

Events should include booking creation, status transition, cancellation, expiry and notification enqueue. Private contact and exact-address values must not be copied into event payloads.

## Atomic reservation contract

The database, not React state, must own overlap prevention.

Preferred invariant:

- an exclusion constraint on `profile_id` and the reserved time range for rows in `pending` or `confirmed`;
- range semantics use `[starts_at, reserved_until)`;
- `reserved_until` includes service duration and configured buffer;
- a one-off time block is checked in the same transaction before insert;
- booking creation and event insertion occur in one transaction.

The implementation may require the reviewed `btree_gist` extension. A lock-plus-query implementation is not sufficient as the only protection unless concurrency tests prove equivalent safety and the Technical Lead explicitly accepts it.

## Idempotency contract

The client generates one opaque idempotency key per intentional submission and reuses it on retry.

Required uniqueness:

- unique `(client_user_key, idempotency_key)`.

RPC behavior:

- same key and same normalized request returns the original booking;
- same key with different booking parameters fails closed;
- provider or network retries never create a second booking or second notification event.

## Proposed RPC boundary

Direct table mutations from the client are not part of the contract.

### Public/authenticated availability

`go_irl_list_public_beauty_availability(...)`

Inputs:

- profile ID or public slug;
- service ID;
- bounded date range.

Returns only available start times, timezone and service duration metadata. It must not expose other clients, private time-block labels, client contacts or exact address.

### Create booking

`go_irl_create_beauty_booking(...)`

Inputs accepted from client:

- profile ID;
- service ID;
- selected start time;
- client display name/contact if the reviewed onboarding model permits snapshots;
- idempotency key.

Server responsibilities:

- require a trusted authenticated user key;
- load profile, owner and active service;
- derive duration, buffer, end time, price and location snapshots;
- validate recurring availability and one-off blocks;
- reserve the slot atomically;
- create the booking event;
- enqueue one professional notification event;
- return a normalized result such as `created`, `existing`, `slot_taken`, `service_unavailable` or `profile_unavailable`.

### Client queries and mutation

- `go_irl_list_my_beauty_bookings(...)`
- `go_irl_cancel_my_beauty_booking(...)`

The client sees only its own bookings. Cancellation must validate the current status and the approved cancellation policy.

### Professional queries and mutation

- `go_irl_list_my_beauty_professional_bookings(...)`
- `go_irl_transition_beauty_booking(...)`
- `go_irl_save_my_beauty_availability(...)`
- `go_irl_create_beauty_time_block(...)`
- `go_irl_delete_beauty_time_block(...)`

Every professional operation must re-check both profile ownership and the current `professional` role on the server.

Status transition must use expected current status and expected `updated_at` to reject stale UI writes.

## Initial lifecycle matrix

Allowed transitions for the first production slice:

- `pending -> confirmed`
- `pending -> declined`
- `pending -> cancelled` by the client
- `pending -> expired` only if an expiration policy is approved
- `confirmed -> cancelled` by client or professional under the approved cancellation policy
- `confirmed -> completed` by professional
- `confirmed -> no_show` by professional

Terminal states do not transition in the first slice.

Rescheduling is explicitly deferred. It should later create a new atomic reservation transaction or a replacement booking, not mutate time before the target slot is safely reserved.

## RLS design contract

No RLS is applied by this report.

Future reviewed policies must enforce:

- anon has no access to booking, event, availability-rule or time-block tables;
- authenticated clients can read only their own booking projection;
- authenticated clients cannot directly update status, price, service, profile, time range, owner or snapshots;
- professionals can read bookings only for profiles they own while their role is current;
- professionals cannot access bookings belonging to another profile;
- public availability is exposed only through a narrow RPC;
- notification creation and delivery changes are server/service-role only;
- admin support access is separate, audited and not implied by the professional role;
- no client receives another client name, contact, booking or time-block reason.

Recommended defense in depth:

- revoke direct table privileges from anon;
- avoid broad authenticated mutation grants;
- use narrow RPCs with explicit `search_path` and server-side authorization checks;
- add positive and negative RLS verification SQL before approval.

## Notification integration contract

Beauty007 must not invent a parallel unmanaged notification system.

Preferred integration:

- extend the canonical notification registry with a `services` category;
- add subject type `beauty_booking`;
- add reviewed kinds:
  - `services.booking_requested`
  - `services.booking_confirmed`
  - `services.booking_declined`
  - `services.booking_cancelled`
  - `services.booking_completed` only if a client message is required;
- reuse canonical deduplication keys and the shared delivery worker;
- deliver to Telegram only when the recipient has a connected verified Telegram identity;
- store provider message ID, retries and normalized failure evidence;
- one booking lifecycle event creates at most one notification per recipient and occurrence.

The shared notification data model is still a design contract. Beauty booking persistence can be implemented in separate reviewed slices, but the Issue #592 acceptance criterion for Telegram delivery is not complete until the shared notification path is applied and verified.

## Client migration boundary

### Browser Mock Mode

Keep the existing local repository for demo and isolated browser testing. Demo writes must remain local-only.

### Trusted production mode

Production booking screens must use a new server repository. They must not silently fall back to local booking writes when the server contract is missing or fails.

Recommended repository split:

- `servicesBookingLocalRepository.ts` — current local behavior;
- `beautyBookingServerRepository.ts` — RPC mapping and normalization;
- `beautyBookingRepository.ts` — explicit runtime selector that fails closed in trusted mode.

No automatic upload of historical local bookings is proposed. Local records lack a trustworthy cross-account identity and must not become production data implicitly.

## Implementation sequence

### Beauty007-A — Contract and design

- this report;
- owner decisions recorded;
- no runtime change.

### Beauty007-B — Schema and database invariants

- additive migration;
- tables, constraints, indexes and audit events;
- verification SQL and rollback notes;
- no UI wiring;
- separate approval required.

### Beauty007-C — RPC and RLS boundary

- narrow RPCs;
- owner/client authorization;
- negative security tests;
- separate approval required.

### Beauty007-D — Client My bookings integration

- trusted server repository;
- loading, conflict, slot-taken and error states;
- Browser Mock Mode remains local-only.

### Beauty007-E — Professional workspace integration

- availability rules and time blocks;
- server-backed requests;
- safe status transitions;
- stale-write handling.

### Beauty007-F — Telegram notification integration

- extend canonical notification contracts;
- event-to-notification producer;
- idempotent delivery worker;
- retry/failure evidence.

### Beauty007-G — Release verification

- two real authenticated accounts;
- two devices or isolated sessions;
- concurrent slot request test;
- repeated submission test;
- unauthorized read/write tests;
- Telegram exactly-once evidence;
- VPS/Vercel reviewed `main` parity after explicit release approval.

## Required tests

### Database and concurrency

- two concurrent clients cannot reserve an overlapping slot;
- retry with the same idempotency key returns one booking;
- same key with changed parameters is rejected;
- overlapping time block prevents booking;
- terminal booking releases the slot according to the approved policy;
- snapshot values come from server records, not client payloads.

### Security

- anon cannot read bookings or private availability data;
- client A cannot read or mutate client B booking;
- professional A cannot read or mutate professional B booking;
- removed professional role immediately blocks professional RPCs;
- client cannot confirm, decline, complete or mark no-show;
- direct table mutation is denied;
- exact address is hidden before confirmation.

### Application

- booking created in one session appears in another;
- professional status change reaches client after refresh/subscription;
- trusted production mode never writes local fallback data;
- Browser Mock Mode remains local-only;
- slot-taken errors preserve form data and offer a new slot;
- stale status transition fails without overwriting current state.

### Notifications

- each occurrence produces one notification;
- retries reuse the same delivery record;
- missing Telegram identity produces a recorded non-delivery outcome, not a duplicate;
- provider failure is normalized and retryable;
- successful delivery records provider message ID.

## Owner decisions required before Beauty007-B

1. Pending slot policy: indefinite until professional action, or an explicit expiration duration.
2. Client cancellation cutoff and whether confirmed bookings can be cancelled immediately.
3. Whether a professional may create manual bookings in the first server slice.
4. Whether exact address is revealed immediately on confirmation or at another approved time.
5. Telegram notification copy and languages for each lifecycle event.
6. Whether completed/no-show events notify the client.
7. Pilot participant limit, provider count and support owner for the bounded Olomouc pilot.
8. Retention and deletion periods for booking contacts, exact-address snapshots, events and delivery evidence.

## Changes made

- Added this design-only report.
- No application code changed.
- No SQL, migration, RLS, auth, secret, environment, production data or deployment change was made.

## Checks

Docs-only change. Build, lint, typecheck and test were not required or run.

Manual design checks:

- current local booking behavior inventoried: PASS;
- existing Beauty profile/service boundary reconciled: PASS;
- atomic reservation and idempotency requirements specified: PASS;
- client/professional/admin security boundaries specified: PASS;
- notification integration avoids a parallel unmanaged worker: PASS;
- protected-change approval gates preserved: PASS.

## Next step

Review and approve the eight owner decisions. Only after that, authorize a separate Beauty007-B repository-only migration patch with verification SQL and rollback notes. Do not apply it to production, merge it or deploy it without separate explicit approval.
