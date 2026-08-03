---
title: Agent Report
owner: AI Fixer
status: Draft
source_of_truth: false
last_review: 2026-08-03
next_review: 2026-08-10
---

# Agent Report

## Task

Fix the participant avatar shape on the main event card and make the reminder panel open as a stable bottom sheet instead of being clipped or positioned above the card.

## Files inspected

- `src/components/CardReminderAction.tsx`
- `src/card-participants-dropdown.css`
- `src/cardParticipantsDropdown.ts`
- `src/styles.css`
- production screenshots supplied by the user

## Findings

- The reminder panel used `position: fixed` while remaining inside a transformed/clipped event-card subtree. In the Telegram WebView this made the panel anchor to the card instead of the viewport.
- The participant avatar had square dimensions in its local stylesheet, but global image and layout rules could still override its effective shape.

## Changes made

- Rendered the reminder panel through a React portal into `document.body`.
- Updated outside-click handling so both the bell trigger and the portaled panel are treated as one control.
- Anchored the mobile reminder panel above bottom navigation with a viewport-level z-index and bounded scrolling.
- Forced participant avatar wrappers and images to a square aspect ratio with explicit dimensions, clipping, and border radius.

## Checks

Exact-head GitHub Actions CI is required before merge and deployment.

## Next step

Open a pull request, run lint, typecheck, build, and tests, then merge and deploy only if all checks are green.
