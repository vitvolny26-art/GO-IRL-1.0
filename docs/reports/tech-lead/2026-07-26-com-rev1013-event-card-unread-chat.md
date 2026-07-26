---
title: Agent Report
owner: Tech Lead
status: Draft
source_of_truth: false
last_review: 2026-07-26
next_review: 2026-08-02
---

# Agent Report

## Task
P1 — Event-card unread chat indicator.

## Role
Tech Lead.

## Sources inspected
- GitHub `main` after PR #392 merge.
- Canonical `ROADMAP.md` active Release Preparation workstream.
- ClickUp task `869e97qbx`.

## Files inspected
- `src/components/ActivityChatPanel.tsx`
- `src/activityChatUnread.ts`
- `src/activityChatFeature.ts`
- `src/components/CardShareAction.tsx`
- generic and Sport event-card implementations.

## Findings
The per-event/per-user read state and own-message exclusion already existed. Both generic and Sport cards share `CardShareAction`, which provides a bounded integration point without duplicating unread logic across verticals.

## Changes made
- Added invite URL to activity ID resolution.
- Added joined-participant-only unread visibility.
- Loaded current messages and counted only visible messages from other users after the stored read timestamp.
- Refreshed unread state on read-state events, focus, and visibility restoration.
- Added a dedicated badge that activates the existing card chat action.
- Added focused tests and styling.

## Checks
Pending GitHub Actions on the final PR head.

## GitHub
Branch: `feat/com-rev1013-event-card-unread-chat`.
PR: pending.
Commit: pending final head.

## ClickUp
Task: https://app.clickup.com/t/869e97qbx
Status: in progress.

## Google Drive
Mirror not created in this change set.

## Blockers
No SQL, migrations, RLS, auth, secrets, production data/configuration or deployment changes. Unread refresh remains foreground/event-driven and does not add Mini App background polling.

## Next step
Run Test, Typecheck, Lint and Build. Merge only after explicit approval.
