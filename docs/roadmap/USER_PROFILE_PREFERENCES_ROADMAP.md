---
title: User Profile and Preferences Roadmap
owner: Chief Archivist / Technical Lead
status: Active
source_of_truth: true
last_review: 2026-07-25
next_review: 2026-08-01
---

# User Profile and Preferences Roadmap

## Product rule

The GO IRL profile is a trust and preference utility for real-life meetings. It is not a social network profile.

The profile must help users:

1. identify organizers, participants and chat senders;
2. control how maps and calendars open;
3. choose a default manual sharing channel;
4. choose an independently connected channel for automated GO IRL reminders;
5. keep those choices synchronized by account instead of by browser.

The profile must not become a feed, follower graph, people-search product, media gallery, dating identity layer, public shame score, universal reputation number or leaderboard.

## Current verified state

Completed on `main` before this roadmap:

- PROFILE-002: read-only public profile contract;
- PROFILE-003: batch public-profile repository and short cache;
- PROFILE-004A: profile-first organizer identity on cards and organizer sheet;
- PROFILE-004B: profile-first organizer identity in event details;
- editable owner profile storage in `user_profiles` and `user_profile_interests`;
- historical Activity/member/chat identity snapshots retained as fallbacks;
- Telegram-first identity remains the account anchor.

Open Draft PR #262 currently contains PROFILE-005 participant and chat identity resolution. That work must be preserved and integrated into this programme.

Existing reminder UI work is not proof of server delivery. Local selection must not be presented as a scheduled or delivered bot reminder.

## Canonical preference model

```ts
export type MapProvider = "google" | "apple" | "mapy";
export type CalendarProvider = "google" | "apple" | "outlook";
export type ShareProvider = "telegram" | "messenger" | "whatsapp" | "instagram";
export type ReminderProvider = "telegram" | "messenger" | "whatsapp" | "instagram";

export type UserPreferences = {
  mapProvider: MapProvider | null;
  calendarProvider: CalendarProvider | null;
  shareProvider: ShareProvider | null;
  reminderProvider: ReminderProvider | null;
};
```

`shareProvider` and `reminderProvider` are independent by design.

- `shareProvider`: the user manually opens a channel and sends an invitation.
- `reminderProvider`: GO IRL automatically sends a reminder through a verified backend delivery path.

`null` means show the primary picker again.

## Persistence authority

Authenticated user:

```text
Supabase preference row keyed by userKey
-> runtime preference resolver
-> profile UI and all action call sites
```

Guest or browser demo:

```text
localStorage fallback
-> isolated from production writes
```

After trusted authentication, Supabase is the source of truth. Browser-local values must not override an existing account preference.

Account switching must clear or re-resolve cached preferences so one user never sees another user's settings.

## Messaging connection model

Use a separate connection model rather than storing provider recipient identifiers directly in the preference row.

```text
user_messaging_connections
- user_key
- provider
- external_recipient_id
- status
- verified_at
- revoked_at
- created_at
- updated_at
```

Rules:

- provider recipient identifiers remain server-controlled;
- frontend-readable data exposes connection capability/status only;
- revoked or invalid connections cannot be used for delivery;
- no silent fallback to another messenger;
- provider secrets and tokens never enter client-visible rows, URLs or logs.

## Capability registry

Reminder choices come from backend capability truth, not hard-coded frontend strings.

Initial expected state:

```text
telegram: enabled when trusted Telegram delivery is verified
messenger: disabled until real outbound delivery is verified
whatsapp: disabled until real outbound delivery and policy/template requirements are verified
instagram: disabled until real Direct delivery is verified within Meta policy
```

A provider is selectable for reminders only when:

1. backend capability is enabled;
2. the user has a valid verified connection;
3. a real provider adapter exists;
4. the delivery path has passed a physical-channel smoke test.

A connected but temporarily unavailable provider is shown as unavailable, not working.

## Runtime components

Required shared components and services:

- `MapProviderPicker`;
- `CalendarProviderPicker`;
- `ShareProviderPicker`;
- `ReminderMessengerPicker`;
- shared preference repository;
- shared preference resolver;
- reminder capability registry;
- reminder creation service;
- due-reminder worker;
- provider adapters;
- delivery status and bounded retry policy.

Direct hard-coded provider URLs and isolated local provider state are incomplete integration unless they are inside the shared provider adapter/resolver boundary.

## Delivery semantics

A successful UI click is not a successful reminder.

Reminder states must distinguish:

```text
draft/selecting
-> backend confirmed scheduled
-> sending
-> provider acknowledged sent
-> retryable failure | permanent failure | cancelled
```

A reminder is created only after backend persistence succeeds.

A reminder is delivered only after provider acknowledgment or another verified delivery status.

The Mini App is never the background worker.

## Implementation programme

### PROFILE-005 — Participant and chat identity

Status: in Draft PR #262.

Deliver:

- public-profile-first participant identity;
- public-profile-first chat sender identity;
- historical snapshot fallback;
- initials and safe generic fallback;
- deduplicated public-profile reads;
- regression coverage.

Exit gate:

- no DOM identity patch may be reported complete without current CI and Telegram/browser smoke evidence;
- preserve privacy and private-profile fallbacks.

### PROFILE-006 — Preference domain and guest fallback

Deliver:

- canonical provider unions and `UserPreferences` type;
- validation/normalization helpers;
- isolated localStorage repository for guests/demo;
- account-change cache reset contract;
- focused tests.

No Supabase migration in this phase.

### PROFILE-007 — Supabase preference persistence

Deliver one reviewed migration for account-scoped preference persistence keyed by `userKey`.

Required behavior:

- owner-only reads/writes;
- validated provider values;
- nullable values for reset behavior;
- no provider recipient IDs or secrets in the preference row;
- repository implementation compatible with Local/Demo mode;
- verification SQL and RLS tests.

Migration and RLS changes require separate explicit production-application approval.

### PROFILE-008 — Profile Preferences UI

Add `Profile -> Preferences` with four sections:

- Maps;
- Calendar;
- Share;
- Reminders.

Each section supports:

- select;
- change;
- reset to `null`;
- current state;
- unavailable/connection-required state where applicable.

### PROFILE-009 — Maps runtime integration

Supported values:

- Google Maps;
- Apple Maps;
- Mapy.cz.

Deliver:

- shared map provider adapter;
- default action uses saved provider;
- `...` shows other available providers;
- reset returns to picker;
- replace every direct map call site.

### PROFILE-010 — Calendar runtime integration

Supported values:

- Google Calendar;
- Apple Calendar;
- Outlook Calendar.

Deliver:

- shared calendar provider adapter;
- correct event title, time zone, location, description and event URL;
- default action uses saved provider;
- `...` shows alternatives;
- replace direct Google-only call sites.

### PROFILE-011 — Manual share preference

Supported values:

- Telegram;
- Messenger;
- WhatsApp;
- Instagram.

Deliver:

- saved primary share provider;
- primary icon plus `...` alternatives;
- only channels with an honest manual-open path are selectable;
- unsupported direct-send behavior must use an explicit fallback or unavailable state;
- no implication that GO IRL delivered the invitation.

### PROFILE-012 — Messaging connections and capability registry

Deliver:

- `user_messaging_connections` model;
- server-side capability registry;
- verified connection states;
- connect/reconnect/revoke UX contracts;
- Telegram first;
- Meta providers disabled until independently verified.

### PROFILE-013 — Durable reminder backend

Deliver protected reminder persistence keyed by user and Activity with:

- provider;
- lead time;
- calculated `scheduled_for`;
- status;
- attempt count;
- next retry;
- idempotency/delivery key;
- created/updated/sent timestamps.

Required rules:

- authenticated owner-only create/update/cancel;
- service-role-only dispatch reads/updates;
- event access rechecked immediately before delivery;
- event changes recalculate unsent reminders;
- cancellation/deletion cancels unsent reminders;
- unique delivery key prevents duplicate bot messages.

### PROFILE-014 — Reminder delivery adapters

Rollout order:

1. Telegram;
2. WhatsApp after approved template/policy verification;
3. Messenger after Page-scoped identity and messaging relationship verification;
4. Instagram Direct only within verified Meta policy.

Every provider requires:

- real outbound message;
- provider acknowledgment/status handling;
- idempotency;
- bounded retry for transient `429` and `5xx` failures;
- opt-out and connection revocation behavior;
- one physical-channel smoke test.

### PROFILE-015 — Cross-device and release verification

Required evidence:

- same account synchronizes preferences across two devices;
- account switching does not leak preferences;
- reset reopens picker;
- all map/calendar/share/reminder call sites use shared runtime paths;
- Telegram production reminder is persisted, dispatched once and acknowledged;
- disabled Meta providers are not shown as functional;
- local/demo mode performs no production preference writes;
- production RLS and migration verification pass;
- lint, typecheck, tests and build pass;
- Telegram Android smoke passes.

## Scope guardrails

In scope:

- trust-focused identity;
- provider preferences;
- verified messaging connections;
- event reminders;
- cross-device synchronization.

Out of scope:

- social feed;
- direct user-to-user messaging;
- follower graph;
- public ratings or universal trust score;
- AI recommendations;
- broad notification marketing;
- silent provider fallback;
- pretending unsupported Meta delivery works.

## Immediate execution order

1. Preserve and finish PROFILE-005 in Draft PR #262.
2. Add PROFILE-006 canonical types, guest repository and tests.
3. Audit every map, calendar, share and reminder call site.
4. Prepare PROFILE-007 migration/RLS patch without applying it to production.
5. Add profile preferences UI.
6. Replace map and calendar call sites.
7. Replace manual share preference paths.
8. Build Telegram-only verified reminder delivery.
9. Enable each additional provider only after independent backend and physical-channel verification.

## Stop conditions

Stop and keep the PR Draft when:

- any quality gate is red;
- a migration or RLS change has not been separately reviewed;
- UI claims a reminder is scheduled before backend persistence;
- UI claims delivery before provider acknowledgment;
- provider recipient identifiers or secrets become client-visible;
- account switching leaks preferences;
- WhatsApp, Messenger or Instagram reminders appear enabled without a real verified delivery path;
- unrelated architecture refactoring enters the patch.
