---
title: Communication & Notifications Roadmap
owner: Product Lead
status: Active
source_of_truth: true
last_review: 2026-07-26
next_review: 2026-08-09
---

# Communication & Notifications Roadmap

## Purpose

This roadmap governs the Communication & Notifications product track inside GO IRL 1.0. It extends the canonical product roadmap without replacing it.

The track exists to improve the validated product loop:

```text
create event -> share -> join -> coordinate -> meet in real life
```

The product must not become a general-purpose messenger, social feed, or engagement platform without a separate reviewed product decision.

## Product principles

1. Event coordination before social expansion.
2. Data contracts and lifecycle rules before services and UI.
3. Critical communication must be observable, deduplicated, and recoverable.
4. Chat is scoped to an activity or approved persistent team.
5. Telegram is a delivery channel, not the source of truth.
6. Privacy, moderation, retention, and abuse controls are product requirements.
7. Public reputation mechanics require a separate trust and moderation decision.
8. Every phase has an entry gate and an exit signal.

## Protected boundaries

The following remain prohibited without explicit owner approval:

- production SQL, migrations, RLS, auth, secrets, or production-data changes;
- direct messages between arbitrary users;
- public user ratings, public Trust Score, or leaderboards;
- broad social feed;
- autonomous engagement campaigns;
- production deployment;
- merge without explicit approval.

Existing notification and chat work must be reconciled rather than duplicated, including PR #370 and COMM-001 / PR #373.

## Roadmap at a glance

| Stage | Product outcome | Required exit signal |
|---|---|---|
| Stage 0 — Foundation | Stable contracts, lifecycle, permissions, retention, and moderation boundaries | Models reviewed and non-conflicting |
| Stage 1 — Minimal Working Release | Reliable critical notifications and bounded activity chat | Core coordination works end to end |
| Stage 2 — Beta Communication | Rich activity communication with preferences and moderation | Real-user delivery and privacy evidence |
| Stage 3 — Communication & Notifications 1.0 | Production-grade event communication platform | Reliability, safety, analytics, and operational readiness |
| Stage 4 — 1.1 to 1.5 | Teams, smart coordination, organizer tooling, and cross-platform parity | Each capability validated independently |
| Stage 5 — Future | AI-assisted coordination and city/community expansion | Evidence that the core loop remains improved |

# Stage 0 — Foundation

**Goal:** define the platform once before building dependent services and screens.

## Sequence

1. Notification Data Model.
2. Chat Data Model.
3. Review Data Model.
4. Favorites and Teams Data Model.
5. Weather Alert Model.
6. Shared moderation, retention, audit, privacy, and lifecycle rules.

## Required contracts

### Notifications

- canonical Notification Registry;
- versioned payloads;
- actor and subject references;
- deep links;
- read and opened state;
- service-critical boundary;
- channel capabilities;
- user preferences;
- retention metadata;
- idempotency and deduplication.

### Chat

- activity-scoped conversation;
- membership and role model;
- message lifecycle;
- replies and quotes;
- mentions;
- organizer announcements;
- unread state;
- moderation state;
- archive and retention policy;
- attachment capability boundaries;
- search and jump-to-message references.

### Reviews

- eligibility only after confirmed participation;
- event review and organizer feedback boundaries;
- moderation and appeal state;
- public versus private visibility;
- abuse and reciprocal-review protections.

### Favorites and Teams

- favorite event and organizer references;
- private saved lists;
- persistent team identity;
- membership, ownership, and roles;
- invite lifecycle;
- team chat and team-created event boundaries.

### Weather

- supported hazard types;
- severity and threshold metadata;
- affected activity reference;
- organizer suggestion versus automatic critical alert;
- deduplication and expiry.

## Exit criteria

- contracts do not conflict with current `activities`, identity, Telegram auth, or existing chat implementation;
- proposed storage and RLS behavior are documented but not applied;
- lifecycle and retention rules are explicit;
- moderation and abuse states exist before UI implementation;
- no duplicate platform entities are introduced;
- focused tests pass.

# Stage 1 — Minimal Working Release

**Goal:** make event coordination more reliable than an ordinary Telegram chat.

## Notification scope

Only events that directly affect attendance or safe coordination:

- participation request submitted;
- request approved or rejected;
- waitlist or place available;
- activity time changed;
- activity location changed;
- activity cancelled;
- organizer announcement;
- reminder one hour before start.

## Notification channels

- Notification Center inside GO IRL;
- Telegram for approved critical events;
- persisted read/unread state;
- deep link to the exact activity or chat;
- deduplication;
- delivery result and retry evidence.

## Chat scope

Activity chat only:

- organizer and confirmed participants;
- text messages;
- unread count;
- reply to message;
- organizer announcement;
- report message;
- basic moderation state;
- no new messages after archive;
- deterministic archive lifecycle around activity completion.

## Explicitly deferred

- voice messages;
- general file sharing;
- reactions;
- global search;
- direct messages;
- persistent group chats;
- teams;
- reviews UI;
- autonomous weather notifications.

## Exit criteria

- critical notification events are not lost or duplicated;
- deep links open the correct activity or chat;
- unauthorized users cannot access activity messages;
- organizer changes are visible to affected participants;
- archived chat is read-only;
- report flow exists;
- Telegram failure is observable and diagnosable;
- real two-account Telegram smoke test passes.

## Success metrics

- critical notification delivery success rate;
- duplicate-send rate;
- notification open rate;
- join-to-first-chat-message rate;
- percentage of changed or cancelled activities acknowledged by participants;
- unresolved report count;
- activity coordination-related support incidents.

# Stage 2 — Beta Communication

**Goal:** provide a complete activity communication experience without creating a general messenger.

## Notification Center Beta

- category grouping;
- mark one or all as read;
- per-kind preferences;
- mute activity;
- quiet hours;
- fallback between approved channels;
- retry and delivery history;
- user-facing explanation when Telegram is unavailable.

## Chat Beta

- mentions;
- quotes;
- reactions;
- pinned organizer messages;
- images;
- limited safe attachments;
- search inside one activity chat;
- jump to message;
- organizer, co-organizer, and participant roles;
- mute;
- delete own message within a bounded window;
- moderation hold;
- rate limiting;
- tested archive and retention behavior.

## Weather Beta

Weather remains an activity coordination feature:

- rain;
- thunderstorm;
- strong wind;
- heat;
- frost;
- organizer suggestion to send an announcement;
- automatic critical alert only for reviewed thresholds and policies.

## Entry gate

- Stage 1 is stable;
- production schema and RLS changes have separate explicit approval;
- report and moderation workflows are available;
- retention policy is approved;
- real Telegram delivery evidence exists.

## Exit criteria

- no cross-activity message leakage;
- role and membership permissions pass multi-account tests;
- notification preferences are consistently enforced;
- attachment and moderation limits are tested;
- weather alerts are deduplicated and expire correctly;
- operational dashboards can distinguish provider failure from application failure.

# Stage 3 — Communication & Notifications 1.0

**Goal:** deliver a production-grade event communication platform.

## Notifications 1.0

- complete reviewed Notification Registry;
- participant, organizer, communication, weather, and post-event events;
- in-app and Telegram delivery;
- preferences and quiet hours;
- optional digest;
- retries and fallback;
- idempotency;
- delivery audit;
- analytics;
- retention;
- localization;
- operational monitoring.

## Chat 1.0

- reliable realtime and reconnect behavior;
- replies, mentions, reactions, and quotes;
- images, bounded files, and voice messages;
- pinned announcements;
- search and jump to message;
- report, block, moderation, and audit;
- participant roles;
- accessibility;
- weak-device performance;
- offline and reconnect states;
- deterministic archive lifecycle.

## Favorites 1.0

- favorite event;
- favorite organizer;
- saved activities;
- private favorite lists;
- notification about a new activity from a favorite organizer, subject to preferences.

## Reviews decision gate

Review contracts may be prepared in Stage 0, but public review functionality requires a separate approved trust decision.

Recommended first implementation:

- eligibility only after confirmed attendance;
- review of an activity, not a public rating of a person;
- structured private organizer feedback;
- moderation and appeal;
- abuse protection;
- optional public text only after explicit moderation approval.

Not included in 1.0 by default:

- public user rating;
- public Trust Score;
- leaderboard;
- unrestricted review publication.

## Teams boundary

Persistent Teams are not required for Communication & Notifications 1.0. They are planned for 1.1 because they introduce persistent ownership, roles, invites, moderation, and team chat.

## Release gate

- all repository quality checks pass on the reviewed commit;
- real Telegram smoke tests pass;
- production schema and RLS are separately verified;
- privacy and retention behavior is evidenced;
- moderation and incident handling are operational;
- monitoring distinguishes application, provider, and configuration failures;
- no critical create-share-join-chat-meet blocker remains.

# Stage 4 — Versions 1.1 to 1.5

## 1.1 — Teams

- persistent teams;
- ownership and roles;
- invites;
- team chat;
- team-created activities;
- team announcements;
- favorite teams;
- ownership transfer and deletion lifecycle.

## 1.2 — Smart coordination

- RSVP reminders;
- late-arrival status;
- participant-count changes;
- meeting-point confirmation;
- shared preparation checklist;
- organizer prompts;
- weather-aware suggestions.

## 1.3 — Cross-platform communication

- web parity;
- Android and iOS clients;
- push notifications;
- synchronized preferences;
- email only if product evidence supports it.

## 1.4 — Organizer tools

- scheduled announcements;
- templates;
- attendance follow-up;
- organizer inbox;
- delivery statistics;
- moderation queue.

## 1.5 — Trust layer

Only after attendance verification is stable:

- verified attendance;
- private reliability indicators;
- structured organizer feedback;
- appeals;
- abuse analysis.

Public leaderboards and universal Trust Score remain excluded without a separate product and safety decision.

# Stage 5 — Future development

Potential future capabilities, each requiring evidence and a separate gate:

- smart notification digests;
- priority ranking of notifications;
- AI summaries of long activity chats;
- automatic extraction of important organizer messages;
- message translation;
- safety classification and moderation assistance;
- time and meeting-place suggestions;
- community and team discovery;
- city-level organizer networks;
- calendar integrations;
- severe-weather and emergency coordination;
- consistent communication across Telegram, web, Android, and iOS.

AI must support real-world coordination. It must not optimize for addictive engagement or replace explicit organizer decisions in critical communication.

# Implementation order

The approved implementation order is:

```text
Notification Data Model
-> Chat Data Model
-> Review Data Model
-> Favorites & Teams Data Model
-> Weather Alert Model
-> Notification Service
-> Notification Center
-> Activity Chat Minimal Working Release
-> Beta Communication
-> Weather Beta
-> Favorites
-> Reviews decision
-> Communication & Notifications 1.0
-> Teams 1.1
-> Smart coordination
```

Only one implementation task is active at a time.

# Current state

- Notification Data Model contracts were merged through PR #374.
- The next implementation task is Chat Data Model contracts.
- No production SQL, migration, RLS, auth, secret, or production-data change is authorized by this roadmap.
