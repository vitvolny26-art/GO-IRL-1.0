---
title: Agent Report
owner: Chief Archivist / Technical Lead
status: Final
source_of_truth: false
last_review: 2026-08-07
next_review: 2026-08-14
---

# BEAUTY007 Full Implementation and Production Handoff

## Task

Record the complete Beauty work delivered through 2026-08-07 and provide a durable handoff for the next GO IRL agent. GitHub remains the source of truth. This report is a navigation and status document, not a replacement for canonical issues, PRs, migrations, CI logs, or production evidence.

## Files and sources inspected

- GitHub issue #592: `Beauty007 — Server-backed Beauty booking foundation`
- Beauty007 PR chain: #642, #644, #645, #665, #667, #703, #706, #708, #711, #712, #713, #715
- Beauty share-card / sharing chain including #666 and the production remediation PRs around #687–#699
- current GitHub `main`
- production Supabase migration list for project `tygfsvjkznypilfyyvdc`
- governed n8n deployment evidence
- latest Vercel production deployment metadata
- physical mobile screenshots and Telegram delivery confirmation supplied by the owner

## Executive status

Beauty has moved from the Beauty006 same-device/localStorage booking pilot to a real server-backed booking flow with production database persistence, cross-session backend behavior, client and professional views, atomic availability, idempotent booking creation, professional status transitions, canonical Telegram notifications, professional schedule persistence, request badges, client service selection, and client cancellation with a 24-hour cutoff.

Current GitHub `main` and production application SHA:

`8593e4960d94ac0d55cf3b3b2246c8d6fdc20c9d`

Latest Vercel production deployment:

- deployment: `dpl_9PQkgChbLu4yuBg5AV4ynu3z9qp6`
- state: `READY`
- target: `production`
- Git SHA: `8593e4960d94ac0d55cf3b3b2246c8d6fdc20c9d`

Governed n8n deployment execution for the current release: `9587`.

VPS release evidence: exact SHA matched, production build passed, `goirl_http=200`, Vercel deploy hook accepted.

## What was completed

### 1. Backend booking foundation

PR #644 and PR #645 established the canonical Beauty booking backend.

Delivered:

- recurring professional availability rules;
- professional private time blocks;
- canonical booking records and lifecycle events;
- profile/service integrity constraints;
- half-open reservation ranges;
- exclusion protection for overlapping `pending` / `confirmed` bookings;
- per-client idempotency keys;
- fail-closed RLS and direct privilege restrictions;
- public availability RPC;
- trusted booking creation RPC;
- client booking projection;
- professional booking projection;
- professional status transitions;
- availability replacement RPC;
- time-block RPC boundary;
- stale-write checks;
- exact-address reveal only through the controlled confirmed-booking projection;
- advisor hardening and verification SQL.

PR #645 merged as `321acacd95aa03bfe5d3fe12e5099443b62be452`.

### 2. Production Supabase foundation

Production project: `tygfsvjkznypilfyyvdc`.

Canonical Beauty booking migrations applied in production:

- `20260805194230 beauty007_booking_foundation`
- `20260805194412 beauty007_booking_rpc_rls`
- `20260805194428 beauty007_advisor_hardening`
- `20260807074522 beauty007_canonical_notifications`
- `20260807130321 notification_claim_terminal_failed_guard`
- `20260807144431 beauty_client_cancel_24h_policy`

No secrets, auth architecture, or environment credentials were changed as part of these release slices.

### 3. Client navigation and My bookings

PR #665 (`9a2a9a158530273976942c6d1b4f67a090dd0331`) added the Services client Profile navigation and aligned professional workspace visibility with the existing role/route authorization boundary.

PR #667 (`0bd9441d48a4fc6a634e8cbd5bdc3c2aa9a8b8e0`) added server-backed client booking reads through `go_irl_list_my_beauty_bookings`.

Delivered client behavior:

- dedicated `Мои записи` view;
- server lifecycle status rendering;
- Prague-local date/time mapping;
- exact address shown only when returned by the server contract;
- Browser Mock Mode remains local;
- explicit local fallback only when the canonical RPC is missing;
- non-missing server errors remain visible errors.

### 4. Availability and transactional booking creation

PR #703 (`999eca9daeafc17ecf4a0282241dc130d3f02888`) connected the client UI to canonical server availability and booking creation.

Delivered:

- monthly public availability via `go_irl_list_public_beauty_availability`;
- trusted Telegram booking creation via `go_irl_create_beauty_booking`;
- stable idempotency keys;
- Europe/Prague local-to-UTC conversion with DST validation;
- server slots in calendar and slot picker;
- loading/retry/conflict states;
- atomic conflicts remain server conflicts and are never fabricated as local success.

### 5. Professional booking workspace

PR #706 (`9867c0cfccc5352b8bda5e6873cf0536ea797d01`) moved the professional booking workspace onto the server RPC boundary.

Delivered:

- trusted professional booking reads via `go_irl_list_my_beauty_professional_bookings`;
- status transitions through `go_irl_transition_beauty_booking`;
- expected-status and `updated_at` stale-write protection;
- server projection separated from Browser Mock/local pilot data;
- explicit local fallback only for missing RPC;
- visible errors for real server failures.

Supported professional transitions include the shipped canonical lifecycle from pending through confirmed/declined and later terminal states allowed by the backend contract.

### 6. Canonical Telegram notifications

PR #708 (`57c0e9e759e987af804b36eb9ff81be05260dc9b`) extended the existing canonical `event_notifications` outbox instead of creating a parallel Beauty notification system.

Beauty notification kinds:

- `services.booking_requested`
- `services.booking_confirmed`
- `services.booking_declined`
- `services.booking_cancelled`

Routing:

- booking request -> professional;
- confirm/decline -> client;
- cancellation -> counterparty.

The payload avoids exact private address data and uses the shared notification worker and Telegram delivery path.

Completed/no-show/reschedule notifications were intentionally not added in this slice.

### 7. Notification worker production recovery

During production testing, the canonical notification worker was blocked because an exhausted terminal `failed` row with `attempt_count=20` was being reclaimed and incremented again, violating the attempt-count constraint and aborting the claim transaction.

The approved migration `notification_claim_terminal_failed_guard` changed the claim boundary so terminal failed rows with `next_attempt_at IS NULL` are not reclaimed.

Verification:

- rollback-only verification SQL: PASS;
- explicit canonical worker run: HTTP 200;
- result: `claimed=4`, `sent=4`, `retried=0`, `failed=0`, `cancelled=0`;
- Beauty request and confirmation notifications were marked `sent`;
- the exhausted historical row remained terminal failed;
- the owner later confirmed that the Telegram notification arrived on the physical device.

### 8. Professional calendar and schedule persistence

PR #711 (`b615e9823bd5bee42a4b6366a20ad9188abfe5c7`) added a month calendar to the professional `Записи` tab and connected the existing workspace availability configuration to `go_irl_replace_my_beauty_availability`.

Delivered:

- professional monthly calendar;
- configured working-day visibility;
- selected-day appointments;
- direct `Настроить расписание` action;
- recurring availability persisted to canonical server rules;
- a valid regular break is represented as two availability segments.

This fixed the production symptom where the client calendar had no available dates because the professional schedule had not been persisted to the server.

### 9. Master settings kept inside the professional workspace

PR #712 (`02f373237b61d2166f683caea4ede7d6054b57b3`) removed the operational dependency on the old local/mock setup experience for normal professional editing.

Delivered inside the professional workspace:

- profile editing;
- primary service editing;
- recurring availability editing;
- explicit Save feedback.

The legacy mock setup page is no longer the normal route for professional schedule editing.

### 10. Request indicators and master-link cleanup

PR #713 (`b22129edde7cf2ad68cb37624c5d829f5dfbff28`) improved request discoverability.

Delivered:

- pending request badge on the Services header bell;
- pending request badge next to `Кабинет мастера` in bottom navigation;
- request details available from the Services bell;
- refresh on focus/visibility and lightweight interval refresh;
- the `Ссылка мастера` editor is shown only on the `Страница` tab rather than repeated across professional tabs.

### 11. Client cancellation and service selection

PR #715 is the current release head and merged as:

`8593e4960d94ac0d55cf3b3b2246c8d6fdc20c9d`.

Delivered:

- booking sheet now exposes service selection;
- selected service changes duration, price, availability and the booking payload;
- client can cancel `pending` or `confirmed` bookings;
- server enforces the cancellation cutoff at 24 hours before `starts_at`;
- stale-write and ownership checks remain intact;
- cancellation continues through the existing `booking_cancelled` event / Telegram notification path.

Policy now implemented in production: client cancellation is allowed only when the appointment is at least 24 hours away.

### 12. Beauty share-card and sharing stream

Beauty sharing work was also stabilized during this period.

Key delivered areas include:

- PR #666: persistent Beauty share-card state in Supabase, including profile-scoped card metadata, Storage integration, optimistic concurrency, owner controls and advisor hardening;
- canonical saved Beauty JPEG sharing rather than rebuilding a different image;
- Telegram prepared-image path and Android share bridge fixes;
- production fixes for `save_my_beauty_profile_v3` digest/search-path and PL/pgSQL ambiguity failures;
- production fix for `save_my_beauty_share_card` conflict-target ambiguity;
- Vercel deployment remediations for Beauty share tests / function limits;
- Beauty WhatsApp bridge included in the production build;
- rollback from the Meta-link-only experiment to the working JPEG bridge flow where required.

The sharing stream is separate from the Beauty007 booking acceptance issue but is part of the completed Beauty production work and should not be accidentally reimplemented.

## Production backend smoke evidence

Beauty007-D5 production smoke used isolated test identities/data and cleaned all fixtures after verification.

Verified in production backend / separate authenticated-session emulation:

- client creates a booking;
- same idempotency key returns the existing booking instead of a duplicate;
- same slot with a new key is rejected as taken;
- booked slot disappears from availability;
- client and professional projections see the same server booking;
- professional can transition pending -> confirmed;
- client sees confirmed state and exact address only after confirmation;
- unrelated authenticated user cannot cancel/read another client booking through the trusted boundary;
- direct authenticated table SELECT/UPDATE remains closed;
- canonical notification outbox creates unique lifecycle messages;
- retry/failure evidence is recorded by the canonical worker;
- test users/profiles/bookings/notifications were removed after verification.

## CI and release gates

Every code release slice was merged only after green exact-head validation. The current client cancellation/service-picker patch passed:

- repository checks;
- `pnpm run lint`;
- `pnpm run typecheck`;
- `pnpm run build`;
- `pnpm run test`;
- Staff OS checks;
- `git diff --check`.

PR #715 exact-head CI run: `31188994177` — SUCCESS.

Production deployment after merge:

- n8n execution `9587` — SUCCESS;
- VPS exact SHA `8593e496...`;
- VPS HTTP 200;
- Vercel deployment `dpl_9PQkgChbLu4yuBg5AV4ynu3z9qp6` — READY;
- Vercel Git SHA `8593e496...`.

## Current user-visible production behavior

Client:

- can browse a Beauty professional and available dates;
- can choose a service inside the booking flow;
- sees duration and price for the selected service;
- can submit a server-backed booking request;
- sees booking status in `Мои записи`;
- sees confirmed exact address only when the server exposes it;
- can cancel a pending or confirmed booking when at least 24 hours remain.

Professional:

- receives server-backed requests;
- sees request count in `Кабинет мастера` and the Services bell;
- receives Telegram booking lifecycle notifications;
- can confirm/decline requests through the server transition RPC;
- has a calendar in `Записи`;
- can configure and save recurring working hours in the professional workspace;
- has the master public-link editor only on `Страница`.

## Acceptance status against issue #592

Substantially complete and production-backed:

- canonical server booking model: done;
- professional availability persistence: done;
- client/professional ownership boundary: done;
- conflict-safe booking creation: done;
- idempotency: done;
- trusted RPC boundary: done;
- RLS/security verification: done;
- My bookings: done;
- professional workspace: done;
- Telegram outbox and real worker: done;
- real Telegram notification observed by owner: done;
- migration and production deployment evidence: done.

Remaining formal acceptance gap:

- issue #592 is still OPEN;
- the repository evidence proves cross-session production behavior, but a formal two-physical-device authenticated smoke has not been recorded as completed in GitHub evidence;
- real Telegram delivery has now been observed on a physical device, but the complete two-device client/professional acceptance sequence should still be recorded before closing #592.

## Product-policy items still worth resolving before expanding scope

The original design intentionally left policy gates. Several are now resolved by implementation, including exact-address-after-confirmation and the client cancellation cutoff. Remaining product-policy areas to confirm before adding new behavior include:

- pending-request expiration / hold policy;
- manual professional booking creation and rescheduling policy;
- completed/no-show notification policy;
- retention/deletion policy for booking history;
- pilot support/escalation process;
- whether additional notification copy/language requirements are needed beyond the current canonical messages.

Do not invent these rules in code without owner approval.

## Known open / housekeeping items

- Issue #592 remains open and is the canonical Beauty007 acceptance tracker.
- PR #642 remains open as the original design-only foundation. Treat it as historical design context; do not blindly merge it after implementation has moved ahead.
- PR #707 (`Beauty title typography model`) is a separate open Beauty UI stream, not part of the booking release.
- stale/duplicate asset PRs should be handled separately; do not mix cleanup with booking acceptance.

## Important code locations

Client booking and availability:

- `src/services/ServiceActivityCard.tsx`
- `src/services/servicesBookingMutationRepository.ts`
- `src/services/ServicesBookingsView.tsx`
- `src/services/servicesBookingClientRepository.ts`

Professional booking workspace:

- `src/beauty/BeautyPilotWorkspace.tsx`
- `src/beauty/beautyWorkspaceRepository.ts`
- `src/services/servicesBookingProfessionalRepository.ts`

Canonical notifications:

- `src/notifications/types.ts`
- `src/notifications/repository.ts`
- `src/notifications/dispatcher.ts`
- `src/notifications/worker.ts`
- `src/notifications/message-builder.ts`
- `api/reminders/run.ts`

Important Beauty migrations / verification:

- booking foundation / RPC / RLS migrations under `supabase/migrations/` dated 2026-08-05;
- `20260807074522` Beauty canonical notifications;
- notification terminal-failed claim guard;
- Beauty client 24-hour cancellation policy;
- corresponding `supabase/verify_*` SQL.

Share-card stream:

- `src/beauty/BeautyShareCardEditor.tsx`
- `src/beauty/beautyShareCardRepository.ts`
- `src/beauty/beautyWorkspaceStorage.ts`
- Telegram / share bridge files and related production migrations.

## Handoff instructions for the next agent

1. Start from GitHub `main`; current release SHA is `8593e4960d94ac0d55cf3b3b2246c8d6fdc20c9d`.
2. Read issue #592 before changing Beauty booking behavior.
3. Do not rebuild booking storage, availability, RLS, Telegram outbox, or worker infrastructure; canonical versions already exist in production.
4. Preserve Browser Mock Mode as an explicit separate local path.
5. Preserve fail-closed behavior: real server errors must not silently become local success.
6. Preserve exact-address privacy boundary.
7. Preserve idempotency and atomic slot-conflict behavior.
8. Preserve the 24-hour client cancellation rule unless the owner explicitly changes policy.
9. Do not modify auth, RLS, migrations, secrets, or production data without explicit approval.
10. The best next acceptance task is a documented physical two-device smoke: client device creates, professional device receives/acts, client device observes transition, Telegram delivery is checked, and evidence is added to #592.
11. After that, decide whether #592 can close or whether remaining policy gates require a follow-up issue.

## Checks

Repository and production evidence reviewed on 2026-08-07. Current application production SHA and Vercel deployment are aligned. No code or production behavior was changed by this report.

## Next step

Run and record the final two-physical-device Beauty007 acceptance smoke, then close or explicitly carry forward issue #592 based on evidence. Keep any new product-policy work in a separate bounded task.
