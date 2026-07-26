---
title: Agent Report
owner: Tech Lead
status: Draft
source_of_truth: false
last_review: 2026-07-26
next_review: 2026-07-27
---

# Agent Report

## Task
COMM-001 — External Telegram chats for events and teams.

## Role
Tech Lead.

## Sources inspected
- GitHub main at `cf9dcea4d9c4a370cf05c392ea1bd37c8e158483`.
- ClickUp task `869e9dyhk`.
- Current open chat PR overlap, including PR #362.

## Files inspected
- `src/activityChatFeature.ts`.
- `src/types.ts`.
- `src/telegram.ts`.
- `src/components/ActivityChatPanel.tsx` through current repository/PR evidence.

## Findings
The current in-app event chat depends on Supabase RPCs, tables and message persistence. Replacing it directly would cross migration and RLS boundaries. Telegram WebApp already exposes `openTelegramLink`, so the first safe slice can establish a validated external-link and policy contract without changing persistence.

## Changes made
- Added Telegram group/invite URL validation and canonical normalization.
- Added organizer/joined-participant access policy.
- Added event chat lifecycle resolution: active, locked after 24 hours, deletion due after 7 days, optional archive.
- Added permanent team chat lifecycle behavior.
- Added a Telegram WebApp-first opening helper with browser fallback.
- Added focused unit tests.

## Checks
Not run in this execution environment.

Required:
- `pnpm run lint`
- `pnpm run typecheck`
- `pnpm run build`
- `pnpm run test`

## GitHub
Branch: `feat/comm-001-external-telegram-chat-links`.
Draft PR: pending creation.

## ClickUp
Task: `869e9dyhk`.
Status: in progress.

## Google Drive
Report mirror not created in this execution.

## Blockers
No same-commit local or CI quality-gate evidence yet. Organizer attach/update/remove UI requires an approved persistence path; no schema or production changes were made.

## Next step
Run required checks, then add organizer-only controls and participant access UI using a reviewed persistence contract while keeping the in-app chat fallback.
