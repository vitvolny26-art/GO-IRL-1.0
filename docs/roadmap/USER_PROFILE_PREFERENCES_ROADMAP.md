---
title: User Profile Hub Roadmap
owner: Chief Archivist / Technical Lead
status: Active
source_of_truth: true
last_review: 2026-07-25
next_review: 2026-08-01
---

# User Profile Hub Roadmap

## Product decision

The GO IRL profile is the user-domain hub for identity, preferences, trust and real-life participation.

It is not a social-network profile, dating profile, public rating system or content feed.

The profile exists to make the core flow safer and easier:

```text
create event -> share -> join/request -> event chat -> attend IRL
```

Every new profile feature must improve at least one of these outcomes:

1. identify organizers, participants and chat senders;
2. recommend relevant real-life events without expanding beta taxonomy;
3. open maps, calendars and sharing through the user's chosen provider;
4. deliver reminders only through verified backend channels;
5. communicate availability, accessibility and practical compatibility;
6. establish trust through verified facts and participation history;
7. keep account data synchronized across devices.

## Closed-beta guardrail

The canonical Olomouc beta categories remain:

1. Volleyball;
2. Running;
3. Walking;
4. Coffee meetup;
5. Board games;
6. Language exchange.

Profile interests, goals and preferences must use these categories during closed beta. Broader taxonomy remains hidden, experimental or future until separately approved.

## Non-goals

The profile must not become:

- a public feed;
- a follower graph;
- a people-search product;
- direct user-to-user messaging;
- a media gallery;
- a dating identity layer;
- a public shame score;
- a universal reputation number;
- a popularity leaderboard;
- an excuse to enable unsupported messenger delivery;
- an AI recommendation programme before beta readiness is proven.

## Current verified state

Completed on `main` before this roadmap:

- PROFILE-002: read-only public profile contract;
- PROFILE-003: batch public-profile repository and short cache;
- PROFILE-004A: profile-first organizer identity on cards and organizer sheet;
- PROFILE-004B: profile-first organizer identity in event details;
- editable owner profile storage in `user_profiles` and `user_profile_interests`;
- historical Activity/member/chat identity snapshots retained as fallbacks;
- Telegram-first identity remains the account anchor.

Open Draft PR #262 contains PROFILE-005 participant and chat identity resolution. Preserve its tests, privacy fallbacks and historical snapshot behavior.

Existing reminder UI is not proof of scheduled or delivered backend reminders.

# Canonical Profile Hub modules

## 1. Identity

Purpose: identify the user without turning the profile into social media.

Fields:

- avatar;
- display name;
- short bio;
- city;
- languages;
- profile visibility;
- optional beta-safe verification badges.

Public exposure must follow privacy rules. Private fields must never leak through public-profile resolvers.

## 2. Interests

Replace one flat activity list with explicit intent states:

```text
favorite
interested
want_to_try
hidden
```

Closed-beta UI may use:

- Favorites: activities the user actively prefers;
- Interested: activities the user likes or follows;
- Want to try: activities the user is open to joining as a beginner;
- Hidden: activities excluded from recommendations.

Rules:

- Favorites should be capped at five during beta;
- Hidden interests are private preference data;
- interest states must use canonical activity identifiers, not localized labels;
- interest data may rank events but must not introduce non-beta categories;
- empty interests must not block event discovery.

## 3. Goals

Purpose: record why the user uses GO IRL.

Initial controlled values:

- find people for sport;
- practise a language;
- meet new people;
- find a regular group;
- discover local activities;
- organize events.

Goals are preference signals, not public identity claims. They are private by default.

## 4. Provider preferences

Canonical preference model:

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

`shareProvider` and `reminderProvider` are independent:

- `shareProvider`: the user manually opens a channel and sends an invitation;
- `reminderProvider`: GO IRL sends through a verified backend delivery path.

`null` means show the relevant picker again.

## 5. Notification rules

Notification settings are event-type rules, not one global switch.

Initial notification types:

- join request received;
- request approved;
- request rejected;
- event time changed;
- event location changed;
- event cancelled;
- free place available;
- scheduled event reminder;
- essential GO IRL service notice.

Each rule must distinguish:

- enabled/disabled;
- selected delivery channel;
- unavailable channel;
- connection required;
- backend capability required.

Marketing and broad news notifications are outside closed-beta scope unless separately approved.

## 6. Connected services

Supported service groups:

### Messaging

- Telegram;
- Messenger;
- WhatsApp;
- Instagram.

### Calendar/account integrations

- Google;
- Apple;
- Outlook.

Connection states:

```text
connected
verification_required
temporarily_unavailable
revoked
unsupported
```

Provider recipient identifiers, access tokens and secrets remain server-controlled.

## 7. Privacy

Profile privacy controls must cover independently:

- profile visibility;
- city visibility;
- languages visibility;
- interests visibility;
- participation statistics visibility;
- organized-event history visibility;
- messaging/contact permissions where supported.

Default rule: expose only what is required for safe event participation.

Account owner views may show more data than public-profile views.

## 8. Lifestyle compatibility

Purpose: help users find events they can realistically attend.

Initial fields:

- preferred days;
- preferred time windows;
- maximum travel radius;
- transport modes;
- preferred group size;
- activity experience level;
- child-friendly requirement;
- dog-friendly requirement;
- free-only or maximum-price preference;
- indoor/outdoor preference.

These fields are private recommendation filters by default.

Lifestyle compatibility is future recommendation input. It must not block manual search or participation during beta.

## 9. Availability

Availability records recurring time windows, not access to a private calendar.

Example:

```text
Monday    18:00-22:00
Wednesday 17:00-22:00
Saturday  all day
Sunday    until 20:00
```

Rules:

- optional;
- timezone-aware;
- private by default;
- coarse recurring windows only in the first implementation;
- no automatic external-calendar reading in beta;
- no guarantee that a user is free merely because a window matches.

## 10. Trust Center

Trust is represented by verified facts, not peer scoring.

Possible facts:

- Telegram verified;
- email verified;
- phone verified;
- organizer verified;
- first event attended;
- ten events attended;
- no recent user-initiated cancellation within a defined period.

Rules:

- every badge needs an auditable source;
- no subjective user reviews in this programme;
- no single public trust score;
- absence of a badge must not imply wrongdoing;
- sensitive verification details remain private.

## 11. GO IRL Passport

The Passport is participation history, not reputation ranking.

Potential fields:

- member since;
- events attended;
- events organized;
- favorite beta categories;
- favorite local areas;
- latest participation date;
- attendance streaks or milestones.

Public visibility is independently controlled. Raw cancellation and moderation data is private.

## 12. Organizer Studio

Organizer functions appear only when relevant.

Initial scope:

- active events;
- drafts;
- archived events;
- join requests;
- waiting list;
- repeat event;
- reusable event templates;
- basic organizer statistics.

Organizer Studio must reuse existing event lifecycle and access controls. It is not a separate organizer identity system.

## 13. Achievements

Achievements are private or opt-in motivational milestones.

Examples:

- first event attended;
- first event organized;
- ten volleyball events;
- ten language exchanges;
- consistent attendance milestone.

Rules:

- no competitive leaderboard;
- no engagement pressure;
- no fabricated social claims such as number of friendships created;
- not required for closed beta.

## 14. Community and memberships

Future-only modules:

- clubs;
- teams;
- recurring groups;
- favorite organizers;
- paid membership management.

These modules are explicitly outside beta and must not enter implementation PRs without a separate roadmap decision.

## 15. Beta and diagnostics

Owner-only beta tools:

- application version;
- userKey;
- Telegram identifier where safe and necessary;
- Browser Demo state;
- local-cache reset;
- diagnostics export without secrets;
- profile synchronization status.

Debug data must never appear in a public profile.

# Persistence authority

Authenticated user:

```text
Supabase account-scoped data keyed by userKey
-> repository/service boundary
-> runtime resolver
-> Profile Hub and all action call sites
```

Guest or Browser Demo:

```text
isolated localStorage fallback
-> no production writes
```

Rules:

- after trusted authentication, Supabase overrides browser-local account values;
- account switching clears or re-resolves all cached profile-domain state;
- one user's data must never appear in another account session;
- public-profile reads use a deliberately restricted contract;
- private preference tables are not exposed through public resolvers;
- migrations and RLS changes require separate explicit approval before production application.

# Messaging connection model

Use a separate connection model:

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

- recipient identifiers remain server-controlled;
- frontend-readable data exposes connection status/capability only;
- revoked or invalid connections cannot deliver;
- no silent fallback to another messenger;
- secrets never enter client-visible rows, URLs or logs.

# Capability registry

Reminder choices come from backend capability truth.

Initial expected state:

```text
telegram: enabled only after trusted delivery verification
messenger: disabled until real outbound delivery is verified
whatsapp: disabled until delivery, policy and template requirements are verified
instagram: disabled until Direct delivery is verified within Meta policy
```

A reminder provider is selectable only when:

1. backend capability is enabled;
2. the user has a verified active connection;
3. a real provider adapter exists;
4. the path passed a physical-channel smoke test.

# Reminder delivery semantics

A successful UI action is not successful delivery.

```text
draft/selecting
-> backend confirmed scheduled
-> sending
-> provider acknowledged sent
-> retryable failure | permanent failure | cancelled
```

Rules:

- reminder creation succeeds only after backend persistence;
- delivery succeeds only after provider acknowledgment or verified status;
- the Mini App is never the background worker;
- retries are bounded and idempotent;
- event access is rechecked before delivery;
- cancelled/deleted events cancel unsent reminders;
- changed events recalculate unsent reminder time.

# Implementation programme

## PROFILE-005 — Participant and chat identity

Status: Draft PR #262.

Deliver:

- public-profile-first participant identity;
- public-profile-first chat sender identity;
- historical snapshot fallback;
- initials and safe generic fallback;
- deduplicated profile reads;
- regression coverage.

Exit gate:

- current CI passes;
- browser and Telegram smoke evidence exists;
- privacy and private-profile fallback are preserved.

## PROFILE-006 — Profile domain contracts

Deliver:

- canonical Profile Hub module types;
- provider unions and `UserPreferences`;
- controlled interest, goal, visibility and connection-state values;
- validation and normalization helpers;
- explicit public/private profile contracts;
- focused unit tests.

No migration in this phase.

## PROFILE-007 — Guest repository and account isolation

Deliver:

- isolated localStorage repository for Guest/Browser Demo;
- versioned serialization;
- invalid-value recovery;
- account-change cache reset contract;
- no production writes from demo mode;
- tests for account-switch isolation.

## PROFILE-008 — Profile Hub navigation shell

Replace the current single long form with a modular hub.

Closed-beta sections:

- Identity;
- Interests;
- Preferences;
- Notifications;
- Connected services;
- Privacy;
- My GO IRL;
- Organizer;
- Beta and diagnostics.

Rules:

- sections may be cards or routed subviews;
- the first load must stay compact;
- unavailable future modules remain hidden, not disabled clutter;
- current profile editing remains functional throughout migration.

## PROFILE-009 — Identity and privacy

Deliver:

- avatar, display name, bio, city and languages editing;
- visibility controls;
- public-profile projection;
- private-field exclusion tests;
- safe owner/public loading and error states.

No age, online status or precise live location in beta.

## PROFILE-010 — Interests and goals

Deliver:

- `favorite`, `interested`, `want_to_try`, `hidden` states;
- Favorites cap of five;
- canonical beta-category identifiers;
- optional private goals;
- migration path from existing flat interests;
- recommendation-ready repository contract without implementing AI recommendations.

## PROFILE-011 — Core preference persistence

Prepare one reviewed account-scoped migration for:

- map provider;
- calendar provider;
- share provider;
- reminder provider;
- locale/time-format settings only when already required by runtime.

Required behavior:

- owner-only reads/writes;
- nullable reset behavior;
- validated values;
- no recipient IDs or secrets;
- Local/Demo compatibility;
- verification SQL and RLS tests.

Do not apply production migration/RLS without separate explicit approval.

## PROFILE-012 — Preferences UI and shared resolver

Deliver:

- `MapProviderPicker`;
- `CalendarProviderPicker`;
- `ShareProviderPicker`;
- `ReminderMessengerPicker`;
- select, change and reset behavior;
- current/unavailable/connection-required states;
- one shared repository/resolver used by all call sites.

## PROFILE-013 — Maps runtime integration

Supported values:

- Google Maps;
- Apple Maps;
- Mapy.cz.

Deliver:

- shared map adapter;
- saved default action;
- `...` alternatives;
- reset returns to picker;
- replacement of direct map call sites.

## PROFILE-014 — Calendar runtime integration

Supported values:

- Google Calendar;
- Apple Calendar;
- Outlook Calendar.

Deliver:

- shared calendar adapter;
- correct title, timezone, location, description and event URL;
- saved default action;
- `...` alternatives;
- replacement of direct Google-only call sites.

## PROFILE-015 — Manual share preference

Supported values:

- Telegram;
- Messenger;
- WhatsApp;
- Instagram.

Deliver:

- saved primary manual-share provider;
- primary action plus `...` alternatives;
- only honest manual-open paths;
- explicit fallback/unavailable states;
- no implication that GO IRL delivered the invitation.

## PROFILE-016 — Notification rule domain

Deliver:

- canonical notification event types;
- enable/disable state;
- channel selection contract;
- service-critical notification boundary;
- capability and connection gating;
- tests proving unsupported channels cannot appear functional.

No broad marketing automation in this phase.

## PROFILE-017 — Messaging connections and capability registry

Deliver:

- `user_messaging_connections` model;
- server-side capability registry;
- verified connection states;
- connect/reconnect/revoke contracts;
- Telegram first;
- Meta providers disabled until independently verified.

## PROFILE-018 — Durable reminder backend

Deliver protected reminder persistence keyed by user and Activity:

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
- event access rechecked before delivery;
- event changes recalculate unsent reminders;
- cancellation/deletion cancels unsent reminders;
- unique key prevents duplicate messages.

## PROFILE-019 — Reminder adapters

Rollout order:

1. Telegram;
2. WhatsApp after approved policy/template verification;
3. Messenger after identity and messaging-relationship verification;
4. Instagram Direct only within verified Meta policy.

Every provider requires:

- real outbound message;
- provider acknowledgment/status handling;
- idempotency;
- bounded retry for transient `429` and `5xx` failures;
- opt-out and revocation behavior;
- one physical-channel smoke test.

## PROFILE-020 — My GO IRL Passport

Deliver private-first participation summaries:

- member since;
- attended count;
- organized count;
- favorite beta categories;
- recent participation;
- visibility controls.

Do not expose subjective ratings, moderation history or raw cancellation history.

## PROFILE-021 — Organizer Studio consolidation

Deliver:

- organizer-only hub entry;
- active/draft/archive views;
- request and waiting-list access;
- repeat-event flow;
- templates only when current event schema supports them safely;
- basic statistics based on verified event data.

## PROFILE-022 — Lifestyle and availability foundation

Post-core-beta phase.

Deliver:

- optional recurring availability windows;
- radius, transport, group-size and experience preferences;
- child/dog/price/indoor-outdoor constraints;
- private-by-default persistence;
- timezone and validation tests.

This phase does not include automatic external-calendar ingestion or AI recommendations.

## PROFILE-023 — Trust Center

Post-core-beta phase.

Deliver:

- auditable verification facts;
- private/public projection rules;
- badge provenance;
- organizer verification status;
- no universal trust score.

## PROFILE-024 — Cross-device and release verification

Required evidence:

- same account synchronizes on two devices;
- account switching never leaks data;
- public/private profile projections are correct;
- reset reopens provider picker;
- all provider call sites use shared runtime paths;
- Telegram reminder is persisted, dispatched once and acknowledged;
- disabled Meta providers are not shown as functional;
- Local/Demo mode performs no production writes;
- migration and RLS verification pass;
- lint, typecheck, tests and build pass;
- Telegram Android smoke passes.

# Deferred roadmap

Explicitly deferred until core beta and Profile Hub verification are green:

- achievements;
- clubs and teams;
- recurring communities;
- favorite organizers;
- Strava, Garmin and Polar integrations;
- membership/subscription management;
- calendar availability ingestion;
- AI recommendations;
- public social graph;
- public reviews or ratings.

# Immediate execution order

1. Preserve and finish PROFILE-005 in Draft PR #262.
2. Add PROFILE-006 domain contracts and public/private boundaries.
3. Add PROFILE-007 guest persistence and account-isolation tests.
4. Build PROFILE-008 Profile Hub navigation shell without breaking current editing.
5. Implement Identity, Privacy, Interests and Goals before advanced lifestyle fields.
6. Audit all map, calendar, share, reminder and notification call sites.
7. Prepare migration/RLS patches without production application.
8. Implement shared provider preferences and runtime adapters.
9. Build Telegram-only verified reminder delivery.
10. Add Passport and Organizer consolidation from verified existing data.
11. Defer Lifestyle, Availability and Trust expansion until core beta gates are green.

# Acceptance criteria

The Profile Hub programme is acceptable only when:

- existing identity behavior is preserved;
- profile data remains account-scoped;
- public resolvers expose only approved fields;
- interests use canonical closed-beta categories;
- provider preferences synchronize across devices;
- reset behavior is deterministic;
- direct provider-specific call sites are removed or isolated behind adapters;
- unsupported messenger reminders never appear functional;
- UI scheduling claims require backend persistence;
- delivery claims require provider acknowledgment;
- no social-feed, dating, leaderboard or public-rating scope enters the beta;
- every code phase passes required quality gates.

# Stop conditions

Stop and keep the PR Draft when:

- any quality gate is red;
- current PROFILE-005 behavior or tests regress;
- migration or RLS work lacks separate review;
- private profile data enters a public resolver;
- account switching leaks profile-domain state;
- UI claims reminder scheduling before persistence;
- UI claims delivery before acknowledgment;
- recipient IDs or secrets become client-visible;
- WhatsApp, Messenger or Instagram reminders appear enabled without a verified delivery path;
- non-beta activity taxonomy becomes user-visible;
- unrelated architecture refactoring enters the patch.

# Documentation merge gate

Before this roadmap merges:

- register this document in `DOCS_INDEX.md`;
- align PR #262 body with the expanded phase numbering;
- keep the PR Draft until code and documentation scope are separated into reviewable implementation slices;
- add a durable agent report describing the roadmap change.