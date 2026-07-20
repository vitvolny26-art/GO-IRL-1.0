---
title: Agent Report
owner: AI Fixer
status: Draft
source_of_truth: false
last_review: 2026-07-20
next_review: 2026-08-20
---

# Agent Report

## Task

Temporarily keep only Telegram, Messenger, and system sharing in the event-card share menu.

## Files inspected

- `src/components/CardShareAction.tsx`
- `src/cardShare.ts`
- `src/cardShare.test.ts`
- existing Telegram and Meta share-card implementation

## Findings

- Instagram and WhatsApp were hard-coded in the menu.
- Messenger copied text and opened an empty Messenger inbox.
- `buildCardShareTarget("messenger", ...)` already routes the event URL through Facebook sharing so Meta can build a link preview.

## Changes made

- Removed Instagram and WhatsApp from the visible share menu.
- Ordered the remaining actions as Telegram, Messenger, system share.
- Routed Messenger through the existing event-link share target instead of opening an empty inbox.
- No auth, RLS, migration, secret, or database changes.

## Checks

- GitHub CI required: test, typecheck, lint, build.
- Manual smoke required on a physical device for Telegram, Messenger, and native share sheet.

## Next step

Merge only after CI is green, then verify Messenger link-preview rendering in a real chat.
