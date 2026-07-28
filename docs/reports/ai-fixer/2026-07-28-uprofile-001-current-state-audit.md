---
title: UProfile-001 Current-State Audit
owner: Chief Archivist / Technical Lead
status: Completed
source_of_truth: false
baseline_commit: ed5a2c4967b80f6443d4128c3f3864f5d803523d
branch: feat/uprofile-001-current-state-audit
created: 2026-07-28
---

# UProfile-001 — Current-State Audit

## Scope

Read-only audit of the current user-panel/profile implementation on GitHub `main`.

No production migration, RLS, SQL, Supabase configuration, deployment, auth, secret, destructive, merge or release action is included.

## Verified baseline

- Repository: `vitvolny26-art/GO-IRL-1.0`
- Baseline branch: `main`
- Baseline commit: `ed5a2c4967b80f6443d4128c3f3864f5d803523d`
- Audit branch: `feat/uprofile-001-current-state-audit`

## Current entry points

### Application mount

`src/main.tsx` mounts these profile-related transition portals globally beside `App`:

- `ProfileHubPortal`
- `ProfilePreferencesPortal`
- `OrganizerProfilePortal`
- `OrganizerEventDetailsPortal`
- `ParticipantIdentityPortal`

The user panel is therefore not an owned routed subtree yet. It is an augmentation layer over DOM produced by `App.tsx`.

### Profile screen target

Both `ProfileHubPortal` and `ProfilePreferencesPortal` search for `.profile-page`, attach through `createPortal`, and observe the document tree with `MutationObserver`.

Classification: `implemented-transition-layer`.

Risk: navigation and preferences depend on DOM shape and class names outside their component ownership boundary.

## Component and repository inventory

### Panel and preferences

- `src/components/ProfileHubPortal.tsx`
- `src/components/ProfilePreferencesPortal.tsx`
- `src/components/ProfileHubPortal.test.ts`
- `src/profile-hub.css`
- `src/profile-preferences.css`

### Profile domain

- `src/profile/profileTypes.ts`
- `src/profile/profileMappers.ts`
- `src/profile/profileRepository.ts`
- `src/profile/localProfileRepository.ts`
- `src/profile/supabaseProfileRepository.ts`
- `src/profile/organizerIdentityResolver.ts`

### Identity consumers

- organizer profile portal
- organizer event-details portal
- participant identity portal
- participant/chat identity implementation already transferred to `main`
- historical Activity/member/chat snapshots retained as fallback

### Persistence artifacts

- user-profile Phase A migration
- interest-limit lock migration
- privilege-hardening migration
- avatar-storage migration
- profile verification SQL

Repository presence is not evidence that production migration or RLS state is applied.

## Profile repository selection

`createProfileRepository` selects persistence by authenticated identity:

```text
trusted-telegram identity -> SupabaseProfileRepository(userKey)
other/guest identity      -> LocalProfileRepository(account-scoped key)
```

The repository contract includes:

- load own profile;
- load one or multiple public profiles;
- save own profile;
- upload avatar;
- resolve avatar URL.

Positive boundary: public reads and owner reads have distinct repository methods.

Open verification requirement: account switching must invalidate all repository-derived caches and pending writes.

## Current Profile Hub shell

The shell exposes four sections:

1. Identity
2. Preferences
3. My GO IRL
4. Diagnostics

The active section is component-local state. It is mirrored to `data-profile-hub-section` on `.profile-page` and consumed through CSS/DOM behavior.

The current shell is usable for incremental migration but is not the canonical final architecture.

## Provider preference flow

### Current storage

`src/userPreferences.ts` stores these values in localStorage key `go-irl-user-preferences`:

- language;
- cityId;
- mapProvider;
- calendarProvider;
- shareProvider;
- reminderProvider.

Updates dispatch `go-irl-user-preferences-changed`.

Classification: `implemented-local-only`.

No cross-device persistence is proven by this path.

### Current UI

`ProfilePreferencesPortal` exposes:

- Google Maps, Apple Maps, Mapy.com;
- Google Calendar, Apple Calendar, Outlook;
- Telegram, Messenger, WhatsApp manual share; Instagram hidden/disabled;
- Telegram reminder; all Meta reminder providers disabled.

Positive boundary: unavailable reminder providers are filtered from the functional selector.

### Direct provider call sites still bypassing canonical adapters

`src/App.tsx` currently contains direct provider behavior:

- `openActivityMap` opens an Activity URL or directly constructs a Mapy URL;
- `openActivityCalendar` directly builds a Google Calendar URL.

Therefore stored map/calendar preferences are not yet authoritative across all event actions.

Classification: `partial`.

Required UProfile implementation rule:

```text
all map/calendar/share/reminder actions -> shared provider resolver/adapter
```

## Current-state matrix

| Area | Classification | Verified conclusion |
|---|---|---|
| Basic profile edit | implemented / runtime-unverified | Repository and App integration exist; full Telegram save smoke is not part of this audit. |
| Profile Hub navigation | implemented-transition-layer | Four-section portal shell attached to `.profile-page`. |
| Profile repository boundary | implemented | Trusted Telegram selects Supabase; guest/non-trusted selects local repository. |
| Provider preferences | implemented-local-only / partial runtime | Values persist locally; direct provider call sites remain. |
| Public profile projection | implemented / privacy verification pending | Dedicated public repository methods exist; field allowlist requires focused verification. |
| Organizer identity | implemented | Profile-first resolver and portals are present. |
| Participant/chat identity | implemented on `main` per transfer record | Device smoke and privacy regression evidence remain release work. |
| My GO IRL | partial | Hub label exists; canonical routed activity/request views are not established. |
| Notifications | partial | Preference state is not durable scheduling or delivery. |
| Connected services | blocked except current Telegram identity | No verified Meta connection/delivery path. |
| Privacy center | not implemented as one surface | Notice, Terms, rights and visibility actions require a dedicated screen. |
| Account deletion/export | not verified | Must be request workflows, not destructive client actions. |
| Cross-device preferences | not implemented | Current provider preferences are localStorage-backed. |
| Diagnostics | partial | Must exclude initData, tokens, secrets and protected data. |
| Production migrations/RLS | blocked pending approval | Repository files only; no production claim. |

## Public/private boundary to preserve

### Public/participant-safe projection

Only approved fields such as safe display name, avatar projection, bounded city/language/interests visibility and organizer context may be exposed.

### Owner-only data

- editable profile draft;
- hidden/private interests;
- provider preferences;
- notification rules;
- eligibility state;
- consent and Terms records;
- account requests;
- sync diagnostics.

### Operator-only data

- credible-minor review evidence and decision;
- moderation references;
- restriction reasons;
- internal audit events;
- processor reconciliation state.

Stop condition: any owner/operator field entering the public resolver.

## My GO IRL source contract

The target panel must not create a parallel event lifecycle. It must derive:

- upcoming participation;
- created activities;
- pending join requests;
- past activities;
- organizer actions;

from the existing Activity/member/request lifecycle and authorization rules.

Pending/requested users must not receive participant-only chat or protected exact location through the profile panel.

## Architectural gaps

1. Final panel routing is absent.
2. Hub and preferences depend on DOM discovery and portal injection.
3. Section state is local and not deep-linkable.
4. Provider preferences are local-only and do not synchronize across devices.
5. Direct map and calendar call sites bypass provider preference authority.
6. Public/private field boundaries need one canonical contract and focused tests.
7. Account-switch cache isolation needs direct tests.
8. My GO IRL needs one authoritative query/resolver boundary.
9. Reminder UI must remain capability-gated by backend persistence and delivery evidence.
10. Privacy, Terms, eligibility, rights requests and account lifecycle are not consolidated.
11. Production RLS/migration state cannot be inferred from source files.
12. Telegram Android/iOS/Desktop and Browser Demo smoke evidence remains release work.

## Canonical beta boundary

UProfile supports:

`create event -> share -> join/request -> event chat -> attend IRL`

Allowed:

- identity basics;
- city and avatar;
- six canonical beta interests;
- provider preferences;
- own activities and requests;
- privacy/support entry points;
- beta-safe diagnostics;
- Telegram reminders only after verified backend delivery.

Excluded:

- social feed;
- people search;
- direct messages;
- public ratings or universal trust score;
- dating fields;
- AI recommendations;
- unverified Meta delivery;
- precise live location as profile data.

## Exact next implementation slice

### UProfile-002 — Canonical panel domain and navigation boundary

Goal: remove panel information architecture from DOM/CSS coupling without changing schema or production state.

### File-level plan

Create:

- `src/profile/profilePanelTypes.ts`
- `src/profile/profilePanelNavigation.ts`
- `src/profile/profilePanelNavigation.test.ts`
- `src/components/ProfilePanel.tsx`
- `src/components/ProfilePanel.test.tsx`

Modify:

- `src/App.tsx` — mount the owned panel in the profile view and pass existing edit-state callbacks/data;
- `src/main.tsx` — remove `ProfileHubPortal` mount only after owned panel parity exists;
- `src/components/ProfileHubPortal.tsx` — retain temporarily or delete in a later cleanup slice after parity verification;
- `src/profile-hub.css` — move selectors from `.profile-page[data-profile-hub-section]` coupling to owned component classes;
- localization source used by `App.tsx` — add canonical panel labels without hardcoded duplicate copy.

Do not modify in UProfile-002:

- Supabase migrations;
- RLS;
- auth;
- notification backend;
- provider persistence;
- production configuration;
- event lifecycle.

### UProfile-002 acceptance criteria

- one canonical `ProfilePanelSection` union;
- explicit ordered beta section registry;
- current editing behavior preserved;
- future sections hidden rather than disabled clutter;
- owned component renders without `querySelector`, `MutationObserver` or `createPortal`;
- deterministic active-section behavior;
- Telegram/browser back behavior documented and tested at the state boundary;
- existing profile form remains functional;
- focused tests pass;
- no schema or production changes.

## UProfile-001 result

Status: `Completed` for repository audit and implementation planning.

UProfile-001 does not claim runtime, production, RLS, migration or delivery readiness.

## Evidence ledger

| Claim | Evidence | Scope |
|---|---|---|
| Current main baseline is `ed5a2c4967b80f6443d4128c3f3864f5d803523d`. | GitHub commit read before branch creation and compare against audit branch. | Repository baseline only. |
| Profile Hub and preferences are global transition portals attached to `.profile-page`. | `src/main.tsx`, `ProfileHubPortal.tsx`, `ProfilePreferencesPortal.tsx`. | Current source architecture. |
| Trusted Telegram identity selects Supabase profile persistence; other identities select local persistence. | `src/profile/profileRepository.ts`. | Repository selection logic only. |
| Provider preferences are localStorage-backed. | `src/userPreferences.ts`. | Current client persistence only. |
| Direct Mapy and Google Calendar call sites bypass a shared preference adapter. | `openActivityMap` and `openActivityCalendar` in `src/App.tsx`. | Audited source call sites; not a complete runtime claim. |
| Meta reminder providers are not presented as functional in the current preferences UI. | `ProfilePreferencesPortal.tsx` option definitions and visible-option filtering. | Current selector UI only. |
| Production migration, RLS and delivery readiness are not proven. | No production/runtime write or verification performed. | Release and production state. |
