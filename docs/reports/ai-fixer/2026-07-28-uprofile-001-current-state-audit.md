---
title: UProfile-001 Current-State Audit
owner: Chief Archivist / Technical Lead
status: Partial
source_of_truth: false
baseline_commit: ed5a2c4967b80f6443d4128c3f3864f5d803523d
branch: feat/uprofile-001-current-state-audit
created: 2026-07-28
---

# UProfile-001 — Current-State Audit

## Scope

Read-only audit of the current user panel/profile implementation on GitHub `main`.

This task does not apply production migrations, RLS, SQL, Supabase configuration, deployment, auth changes, secrets, destructive actions, or merge operations.

## Verified baseline

- Repository: `vitvolny26-art/GO-IRL-1.0`
- Baseline branch: `main`
- Baseline commit: `ed5a2c4967b80f6443d4128c3f3864f5d803523d`
- Audit branch: `feat/uprofile-001-current-state-audit`

## Current implementation inventory

### Present on main

- `src/components/ProfileHubPortal.tsx`
- `src/components/ProfilePreferencesPortal.tsx`
- `src/profile/profileMappers.ts`
- `src/profile/localProfileRepository.ts`
- `src/profile/supabaseProfileRepository.ts`
- `src/profile/organizerIdentityResolver.ts`
- `src/profile-hub.css`
- `src/profile-preferences.css`
- profile avatar CSS and storage migration
- user-profile Phase A migrations and verification SQL
- organizer/profile-first identity reports and implementation history

### Current Profile Hub shell

The current shell exposes four sections:

1. Identity
2. Preferences
3. My GO IRL
4. Diagnostics

The shell is injected into `.profile-page` with `createPortal` and synchronizes against DOM classes with `MutationObserver`.

Classification: `implemented-transition-layer`.

This is usable as an incremental migration shell but is not the target architecture for the final user panel.

## Current-state classification

| Area | Classification | Notes |
|---|---|---|
| Basic profile edit | implemented/needs runtime verification | Existing profile form and save path must be traced end to end. |
| Profile Hub navigation | implemented-transition-layer | Portal-based shell; four sections only. |
| Provider preferences | implemented/partial | UI and contracts exist; all runtime call sites still require audit. |
| Public profile projection | implemented/needs privacy verification | Existing resolver and organizer identity use require field-level review. |
| Participant/chat identity | implemented on main per PR closure note | Browser and Telegram smoke evidence still required. |
| My GO IRL | partial | Hub entry exists; authoritative activity/request views require inventory. |
| Notifications | UI/domain partial | UI state is not proof of durable scheduling or delivery. |
| Connected services | blocked for non-Telegram providers | Meta providers must remain unavailable until verified. |
| Privacy center | not complete | Visibility, notice, terms, rights and account actions need dedicated implementation. |
| Account deletion/export | not verified | Must be request workflows, not direct destructive client actions. |
| Cross-device sync | not verified | Requires two-device and account-switch evidence. |
| Diagnostics | partial | Must exclude initData, tokens, secrets and protected data. |
| Production migration/RLS | blocked pending approval | Prepare only; do not apply. |

## Architectural gaps

1. Final panel routing is not established.
2. Current hub depends on DOM discovery and portal injection.
3. Public/private profile field boundaries need one canonical contract and tests.
4. Account-switch cache isolation requires explicit verification.
5. My GO IRL event/request data sources need one authoritative resolver.
6. Provider preferences must be wired through shared adapters at every call site.
7. Reminder UI must be capability-gated by real backend persistence and delivery evidence.
8. Privacy, terms, eligibility, rights requests and account lifecycle are not yet consolidated.
9. Production RLS and migration state cannot be claimed from repository files alone.
10. Telegram Android, iOS, Desktop and Browser Demo smoke evidence is incomplete.

## Canonical beta boundary

UProfile must support the closed-beta loop:

`create event -> share -> join/request -> event chat -> attend IRL`

In beta, UProfile may include:

- identity basics;
- city and avatar;
- six canonical beta interests;
- provider preferences;
- own activities and requests;
- privacy and support paths;
- beta diagnostics;
- Telegram-only reminder capability after verified backend delivery.

It must not introduce:

- social feed;
- people search;
- direct messages;
- public ratings;
- universal trust score;
- dating profile fields;
- AI recommendations;
- unverified Meta delivery;
- precise live location in the profile.

## First implementation slice

### UProfile-002 — Canonical Panel Shell

Proposed deliverables:

- replace portal-driven section switching with a canonical profile panel state boundary;
- preserve existing profile editing behavior;
- add explicit section model for:
  - profile;
  - my activities;
  - preferences;
  - notifications;
  - privacy and safety;
  - support;
  - diagnostics;
- hide unavailable future modules;
- preserve Telegram back behavior;
- add focused navigation tests;
- no schema, SQL, RLS, auth or production changes.

## UProfile-001 exit gate

UProfile-001 is complete only after:

- current component inventory is verified against the branch;
- all live profile entry points are identified;
- all store/repository call paths are mapped;
- public/private field exposure is documented;
- all provider call sites are listed;
- My GO IRL data sources are listed;
- a reviewable UProfile-002 file-level plan is produced;
- the audit branch diff is verified.

Current status: `Partial`.

Reason: the durable audit document and baseline branch now exist, but full call-site mapping and runtime verification remain open.

## Evidence ledger

| Claim | Evidence | Scope |
|---|---|---|
| Current main baseline is `ed5a2c4967b80f6443d4128c3f3864f5d803523d`. | GitHub latest commit read before branch creation. | Repository baseline only. |
| The Profile Hub currently exposes four sections and uses portal/DOM synchronization. | `src/components/ProfileHubPortal.tsx` on main. | Current source implementation only. |
| Production migration, RLS and delivery readiness are not proven by this audit. | No production write or runtime verification performed in UProfile-001. | Release and production state. |
